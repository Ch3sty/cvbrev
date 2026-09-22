import 'server-only';

/**
 * Datalagret for Intakter (docs/plan-admin.md avsnitt 4.2 och 8).
 *
 * Tva lager, och skillnaden mellan dem ar hela prestandapoangen:
 *
 * 1. **Kritiska vagen** laser bara admin_daily_metrics via
 *    hamtaDagligaMetrik() fran vag 1, plus tva sma Supabase-fragor
 *    (cancel_intents och profiles). Inget externt API. Det ar det som ger
 *    LCP under 1,5 sekunder.
 * 2. **Uppskjutet** ar planmixen och kupongerna, som bara finns i Stripe och
 *    inte i nagon tabell vag 1 byggde. De hamtas i en Suspense-grans under
 *    vecket med reserverad hojd, alltsa efter att sidan redan malats, och
 *    cachas 15 minuter med samma revalidate som resten av adminen.
 *
 * Stripe-anropen i lager 2 pagineras med for await, som sidbryter med
 * starting_after tills has_more ar false (planens avsnitt 8). I dag ryms 29
 * prenumerationer i en sida, vilket ar precis det som doljer buggen tills
 * volymen vaxer.
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  hamtaDagligaMetrik,
  hamtaUndantagCachad,
  ADMIN_METRICS_TAG,
  ADMIN_CACHE_SEKUNDER,
} from '@/lib/admin/metrics';
import { manadsbeloppOre, paketFranPrisId, type DagligaMetrik } from '@/lib/admin/collect';
import { senasteMedVarde, STRIPE_LEDARE } from '@/lib/admin/senasteMedData';
import { uteslut } from '@/lib/admin/undantag';
import { paketNamn } from '@/lib/admin/kop';
import { datumKort } from '@/lib/admin/tomt';
import { mandagen, planstegFranPris, type PlanNyckel } from './format';

// MRR_SANN_FRAN och byggVattenfall bor i format.ts: de ar rena funktioner utan
// server-beroenden och gar darfor att testa utan att mocka Supabase. Sidan och
// API-rutten laser dem harifran, sa importvagen ar densamma som forut.
export { MRR_SANN_FRAN, byggVattenfall, type Vattenfall } from './format';

/** Kupongen prisstegen anvander vid uppsagning. Planens avsnitt 4.2. */
export const RETENTIONSKUPONG = 'retention_49_2m';


// ---------------------------------------------------------------------------
// Lager 1: kritiska vagen
// ---------------------------------------------------------------------------

export interface ChurnVecka {
  vecka: string;
  churnade: number;
  orsaker: Array<{ orsak: string; antal: number }>;
  /** Uppsagningsflodet startat men inte fullfoljt, alltsa raddade. */
  raddade: number;
}

/**
 * Trial till betalt, raknat pa Stripes prenumerationer.
 *
 * `paborjade` ar prenumerationer som nagon gang haft en trialperiod, alltsa
 * de dar trial_end ar satt. `betalande` ar de av dem som i dag ar active,
 * alltsa som slapptes igenom till betalning. Bada talen kraver ett
 * Stripe-anrop och ligger darfor i StripeSnapshot, inte i kritiska vagen.
 */
export interface TrialSiffror {
  paborjade: number;
  betalande: number;
  andel: number | null;
}

export interface IntaktData {
  dagar: DagligaMetrik[];
  /**
   * Senaste dagen med Stripe-siffror, alltså senaste raden där mrr_ore inte
   * är null. Inte senaste raden i tabellen: en rad kan finnas utan att bära
   * något, till exempel när "Hämta nu" skrev i dag innan Stripe-delsteget
   * hann klart, och då visade korten streck på MRR och ARR fast gårdagens
   * siffror låg kvar.
   */
  senaste: DagligaMetrik | null;
  igar: DagligaMetrik | null;
  forraVeckan: DagligaMetrik | null;
  /** Sant när i dag har en rad som ännu inte bär Stripe-siffror. */
  idagOfullstandig: boolean;
  churnVeckor: ChurnVecka[];
  /**
   * Appens provperioder som fortfarande lever: trialkalla och premium_until
   * efter nu, undantagna konton bort. Tidigare raknades alla med trialkalla,
   * aven de vars provperiod gatt ut (21 i stallet for 9, 22 sep).
   */
  provperioder: { antal: number; sista: string | null };
  /** Senaste giltighetstiden bland engangskop som fortfarande galler. */
  engangsGiltigTill: string | null;
  /** Ganger uppsagningsflodet i appen startats totalt (cancel_intents). */
  uppsagningsflodetStartat: number;
}

/**
 * Churn per vecka med orsaker ur cancel_intents.
 *
 * Tva kallor moter varandra har. Antalet churnade kommer ur
 * admin_daily_metrics.churned, som raknar Stripes canceled_at, alltsa
 * sanningen om vad som faktiskt sagts upp. Orsakerna kommer ur
 * cancel_intents, som bara fylls av dem som gar via uppsagningsflodet i
 * appen. En uppsagning gjord direkt i Stripes kundportal har darfor ingen
 * orsak, och summan av orsaker ar mindre an antalet churnade. Det ar
 * avsiktligt och skrivs ut i gransnittet i stallet for att doljas med en
 * "okand"-post som hade sett ut som data.
 */
const hamtaChurnVeckor = unstable_cache(
  async (antalVeckor: number): Promise<ChurnVecka[]> => {
    const admin = getSupabaseAdmin() as any;

    const forsta = new Date();
    forsta.setUTCDate(forsta.getUTCDate() - antalVeckor * 7);
    const franDag = mandagen(forsta.toISOString().slice(0, 10));

    const u = await hamtaUndantagCachad();
    const [metrik, intents] = await Promise.all([
      admin
        .from('admin_daily_metrics')
        .select('dag, churned')
        .gte('dag', franDag)
        .order('dag', { ascending: true }),
      uteslut(
        admin
          .from('cancel_intents')
          .select('reason, completed_cancel, created_at')
          .gte('created_at', `${franDag}T00:00:00Z`),
        'user_id',
        u
      ).limit(5000),
    ]);

    const perVecka = new Map<string, ChurnVecka>();
    const vecka = (dag: string) => {
      const m = mandagen(dag);
      let v = perVecka.get(m);
      if (!v) {
        v = { vecka: m, churnade: 0, orsaker: [], raddade: 0 };
        perVecka.set(m, v);
      }
      return v;
    };

    for (const rad of (metrik.data ?? []) as Array<{ dag: string; churned: number | null }>) {
      vecka(rad.dag).churnade += rad.churned ?? 0;
    }

    const orsakPerVecka = new Map<string, Map<string, number>>();
    for (const rad of (intents.data ?? []) as Array<{
      reason: string | null;
      completed_cancel: boolean | null;
      created_at: string;
    }>) {
      const m = mandagen(rad.created_at.slice(0, 10));
      const v = vecka(m);
      if (rad.completed_cancel === false) {
        v.raddade += 1;
      }
      let karta = orsakPerVecka.get(m);
      if (!karta) {
        karta = new Map();
        orsakPerVecka.set(m, karta);
      }
      const nyckel = rad.reason ?? '';
      karta.set(nyckel, (karta.get(nyckel) ?? 0) + 1);
    }

    for (const [m, karta] of orsakPerVecka) {
      const v = perVecka.get(m);
      if (!v) continue;
      v.orsaker = [...karta.entries()]
        .map(([orsak, n]) => ({ orsak, antal: n }))
        .sort((a, b) => b.antal - a.antal);
    }

    return [...perVecka.values()].sort((a, b) => b.vecka.localeCompare(a.vecka));
  },
  ['admin-intakter-churn-v2'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

const TRIALKALLOR = ['signup_trial', 'oauth_signup_trial'];

/**
 * Appens provperioder som fortfarande lever.
 *
 * premium_until > now() ar hela rattelsen (spec punkt 3): en profil behaller
 * sin trialkalla efter att provperioden gatt ut, och utan filtret raknades
 * de utgangna med. Undantagna konton raknas inte.
 *
 * Trial till betalt gar fortfarande inte att lasa ur profiles: webhooken
 * nollstaller premium_source vid betalning, sa kohorten raderar sig sjalv i
 * samma ogonblick som den konverterar. Stripes kortkravande provperiod, som
 * kortet "Trial till betalt" matte, saljs inte langre och visas inte.
 */
const hamtaProvperioder = unstable_cache(
  async (): Promise<{ antal: number; sista: string | null }> => {
    const admin = getSupabaseAdmin() as any;
    const u = await hamtaUndantagCachad();
    const { data } = await uteslut(
      admin
        .from('profiles')
        .select('premium_until')
        .in('premium_source', TRIALKALLOR)
        .gt('premium_until', new Date().toISOString()),
      'id',
      u
    ).limit(5000);
    const tider = ((data ?? []) as Array<{ premium_until: string }>).map((r) => r.premium_until);
    return {
      antal: tider.length,
      sista: tider.length ? tider.reduce((a, b) => (a > b ? a : b)) : null,
    };
  },
  ['admin-intakter-provperioder'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/**
 * Engangskop som fortfarande galler, och hur manga ganger
 * uppsagningsflodet startats. Tva sma fragor, undantagna konton bort.
 */
const hamtaSmatal = unstable_cache(
  async (): Promise<{ engangsGiltigTill: string | null; uppsagningsflodetStartat: number }> => {
    const admin = getSupabaseAdmin() as any;
    const u = await hamtaUndantagCachad();
    const [grants, intents] = await Promise.all([
      uteslut(
        admin
          .from('premium_grants')
          .select('premium_until_after')
          .gt('premium_until_after', new Date().toISOString()),
        'user_id',
        u
      ).limit(1000),
      uteslut(
        admin.from('cancel_intents').select('id', { count: 'exact', head: true }),
        'user_id',
        u
      ),
    ]);
    const tider = ((grants.data ?? []) as Array<{ premium_until_after: string }>).map(
      (r) => r.premium_until_after
    );
    return {
      engangsGiltigTill: tider.length ? tider.reduce((a, b) => (a > b ? a : b)) : null,
      uppsagningsflodetStartat: intents.count ?? 0,
    };
  },
  ['admin-intakter-smatal'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/**
 * Allt sidan behover for forsta malningen. Inget externt API rors.
 */
export async function hamtaIntaktData(antalDagar = 90): Promise<IntaktData> {
  const [dagar, churnVeckor, provperioder, smatal] = await Promise.all([
    hamtaDagligaMetrik(antalDagar),
    hamtaChurnVeckor(12),
    hamtaProvperioder(),
    hamtaSmatal(),
  ]);

  // hamtaDagligaMetrik ger fallande ordning, senaste forst.
  //
  // Jamforelsedagarna slas upp pa datum och inte pa index. Index hade
  // fungerat sa lange varje dag har en rad, men en enda saknad dag hade
  // forskjutit hela jamforelsen ett steg utan att nagot sag fel ut: kortet
  // hade sagt "mot i gar" och visat forrgar.
  // Senaste dagen med Stripe-siffror, inte senaste raden. Se IntaktData.
  const senaste = senasteMedVarde(dagar, STRIPE_LEDARE);
  const idagOfullstandig =
    dagar.length > 0 && senaste !== null && dagar[0].dag !== senaste.dag;
  const pos = new Map(dagar.map((d) => [d.dag, d]));
  const forskjut = (fran: string, dygn: number): string => {
    const d = new Date(`${fran}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - dygn);
    return d.toISOString().slice(0, 10);
  };
  const igar = senaste ? (pos.get(forskjut(senaste.dag, 1)) ?? null) : null;
  const forraVeckan = senaste ? (pos.get(forskjut(senaste.dag, 7)) ?? null) : null;

  return {
    dagar,
    senaste,
    igar,
    forraVeckan,
    idagOfullstandig,
    churnVeckor,
    provperioder,
    engangsGiltigTill: smatal.engangsGiltigTill,
    uppsagningsflodetStartat: smatal.uppsagningsflodetStartat,
  };
}

// ---------------------------------------------------------------------------
// Lager 2: uppskjutet, Stripe
// ---------------------------------------------------------------------------

export interface PlanRad {
  nyckel: PlanNyckel;
  aktiva: number;
  mrrOre: number;
}

export interface KupongRad {
  id: string;
  namn: string | null;
  procentAv: number | null;
  beloppOre: number | null;
  inlosta: number;
  maxInlosta: number | null;
  giltig: boolean;
}

export interface MisslyckadRad {
  id: string;
  belopp: number;
  status: string;
  kund: string | null;
  orsak: string | null;
  skapad: string;
}

/** En uppsagd prenumeration, for raden Uppsagningar 30 dagar. */
export interface UppsagdRad {
  tid: string;
  /** Till exempel "provperiod på Allt-månaden startad 9 sep, aldrig debiterad". */
  vad: string;
}

export interface StripeSnapshot {
  planMix: PlanRad[];
  /** Prenumerationer med canceled_at de senaste 30 dagarna, nyast forst. */
  uppsagda: UppsagdRad[];
  kuponger: KupongRad[];
  misslyckade: MisslyckadRad[];
  obetaldaFakturorOre: number;
  obetaldaFakturor: number;
  trial: TrialSiffror;
  /** Null nar STRIPE_SECRET_KEY saknas, till exempel i en testmiljo. */
  tillganglig: boolean;
  fel?: string;
}

const TOM_SNAPSHOT: StripeSnapshot = {
  planMix: [],
  uppsagda: [],
  kuponger: [],
  misslyckade: [],
  obetaldaFakturorOre: 0,
  obetaldaFakturor: 0,
  trial: { paborjade: 0, betalande: 0, andel: null },
  tillganglig: false,
};

/**
 * Planmix, kuponger och misslyckade betalningar direkt ur Stripe.
 *
 * Ligger utanfor kritiska vagen med flit: sidan har redan malats nar den har
 * kallas, och den ar cachad 15 minuter sa upprepade sidladdningar inte blir
 * upprepade Stripe-rundor. Vag 1:s collect.ts skriver varken planmix eller
 * kuponger till admin_daily_metrics, och vag 1:s filer ar ett kontrakt som
 * inte far andras, sa den har vagen ar den enda som finns. Se rapporten.
 *
 * All paginering gar via for await, som sidbryter med starting_after tills
 * has_more ar false.
 */
export const hamtaStripeSnapshot = unstable_cache(
  async (): Promise<StripeSnapshot> => {
    const nyckel = process.env.STRIPE_SECRET_KEY;
    if (!nyckel) return TOM_SNAPSHOT;

    const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });

    try {
      const perPlan = new Map<PlanNyckel, PlanRad>();
      const lagg = (n: PlanNyckel) => {
        let rad = perPlan.get(n);
        if (!rad) {
          rad = { nyckel: n, aktiva: 0, mrrOre: 0 };
          perPlan.set(n, rad);
        }
        return rad;
      };

      // Trial till betalt raknas i samma svep som planmixen, sa den kostar
      // inget extra anrop. trial_end ligger kvar pa prenumerationen aven
      // efter att statusen gatt fran trialing till active, vilket ar precis
      // det som gor Stripe till enda hallbara kallan for det har talet: i
      // profiles nollstaller webhooken premium_source vid konvertering, sa
      // kohorten raderar sig sjalv i samma ogonblick som den lyckas.
      let trialPaborjade = 0;
      let trialBetalande = 0;

      const u = await hamtaUndantagCachad();
      const fran30 = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
      const uppsagda: UppsagdRad[] = [];

      for await (const sub of stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.items.data.price'],
      })) {
        if (sub.trial_end) {
          trialPaborjade += 1;
          if (sub.status === 'active') trialBetalande += 1;
        }

        if (sub.canceled_at && sub.canceled_at >= fran30) {
          const kund = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
          if (!(kund && u.stripeKunder.has(kund)) && !u.har(sub.metadata?.userId ?? null)) {
            const namn = paketNamn(paketFranPrisId(sub.items?.data?.[0]?.price?.id ?? null));
            const startad = datumKort(new Date(sub.start_date * 1000).toISOString());
            const iProvperiod = Boolean(sub.trial_end && sub.canceled_at <= sub.trial_end);
            uppsagda.push({
              tid: new Date(sub.canceled_at * 1000).toISOString(),
              vad: iProvperiod
                ? `provperiod på ${namn} startad ${startad}, aldrig debiterad`
                : `${namn}, startad ${startad}`,
            });
          }
        }

        if (sub.status !== 'active' && sub.status !== 'trialing') continue;
        for (const item of sub.items?.data ?? []) {
          const pris = item.price;
          if (!pris) continue;
          const steg = planstegFranPris(
            pris.id,
            pris.recurring?.interval ?? null,
            pris.recurring?.interval_count ?? null,
            !pris.recurring
          );
          const rad = lagg(steg);
          rad.aktiva += 1;
          rad.mrrOre += manadsbeloppOre(
            pris.unit_amount,
            pris.recurring?.interval ?? null,
            pris.recurring?.interval_count ?? null,
            item.quantity ?? 1
          );
        }
      }

      const kuponger: KupongRad[] = [];
      for await (const kupong of stripe.coupons.list({ limit: 100 })) {
        kuponger.push({
          id: kupong.id,
          namn: kupong.name ?? null,
          procentAv: kupong.percent_off ?? null,
          beloppOre: kupong.amount_off ?? null,
          inlosta: kupong.times_redeemed ?? 0,
          maxInlosta: kupong.max_redemptions ?? null,
          giltig: kupong.valid,
        });
      }
      // Retentionskupongen forst: den ar den enda vi faktiskt styr med.
      kuponger.sort((a, b) => {
        if (a.id === RETENTIONSKUPONG) return -1;
        if (b.id === RETENTIONSKUPONG) return 1;
        return b.inlosta - a.inlosta;
      });

      // Misslyckade betalningar, senaste 30 dagarna.
      const fran = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
      const misslyckade: MisslyckadRad[] = [];
      for await (const charge of stripe.charges.list({
        created: { gte: fran },
        limit: 100,
      })) {
        const c = charge as Stripe.Charge;
        if (c.status !== 'failed' && !c.failure_code) continue;
        misslyckade.push({
          id: c.id,
          belopp: c.amount,
          status: c.status,
          kund: c.billing_details?.email ?? c.receipt_email ?? null,
          orsak: c.failure_message ?? c.failure_code ?? null,
          skapad: new Date(c.created * 1000).toISOString(),
        });
        if (misslyckade.length >= 50) break;
      }

      let obetaldaFakturorOre = 0;
      let obetaldaFakturor = 0;
      for (const status of ['open', 'uncollectible'] as const) {
        for await (const faktura of stripe.invoices.list({ status, limit: 100 })) {
          obetaldaFakturor += 1;
          obetaldaFakturorOre += faktura.amount_due ?? 0;
        }
      }

      const ordning: PlanNyckel[] = ['daypass', 'week', 'month', 'quarter', 'ovrigt'];
      const planMix = ordning
        .map((n) => perPlan.get(n))
        .filter((r): r is PlanRad => Boolean(r));

      uppsagda.sort((a, b) => b.tid.localeCompare(a.tid));

      return {
        planMix,
        uppsagda,
        kuponger,
        misslyckade,
        obetaldaFakturorOre,
        obetaldaFakturor,
        trial: {
          paborjade: trialPaborjade,
          betalande: trialBetalande,
          andel: trialPaborjade > 0 ? trialBetalande / trialPaborjade : null,
        },
        tillganglig: true,
      };
    } catch (err) {
      const meddelande = err instanceof Error ? err.message : String(err);
      console.error('[admin/intakter] Stripe svarade inte:', meddelande);
      return { ...TOM_SNAPSHOT, fel: meddelande };
    }
  },
  ['admin-intakter-stripe-v2'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
