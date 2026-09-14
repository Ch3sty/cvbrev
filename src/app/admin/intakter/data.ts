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
  ADMIN_METRICS_TAG,
  ADMIN_CACHE_SEKUNDER,
} from '@/lib/admin/metrics';
import { manadsbeloppOre, type DagligaMetrik } from '@/lib/admin/collect';
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
  senaste: DagligaMetrik | null;
  igar: DagligaMetrik | null;
  forraVeckan: DagligaMetrik | null;
  churnVeckor: ChurnVecka[];
  /** Antal profiler som just nu bar en trialkalla i premium_source. */
  trialPagaende: number;
  premiumGrantsRader: number;
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

    const [metrik, intents] = await Promise.all([
      admin
        .from('admin_daily_metrics')
        .select('dag, churned')
        .gte('dag', franDag)
        .order('dag', { ascending: true }),
      admin
        .from('cancel_intents')
        .select('reason, completed_cancel, created_at')
        .gte('created_at', `${franDag}T00:00:00Z`)
        .limit(5000),
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
  ['admin-intakter-churn'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/**
 * Pagaende trials i appen.
 *
 * Bara namnaren, aldrig taljaren. Att lasa trial till betalt ur profiles gar
 * namligen inte, och det ar viktigt att veta varfor: nar en trialanvandare
 * borjar betala satter Stripe-webhooken
 * (src/app/api/stripe/webhooks/route.ts) premium_source till null, med
 * motiveringen att en betald prenumeration ersatter all gratispremie. Kohorten
 * raderar alltsa sig sjalv i samma ogonblick som den konverterar, och en
 * fraga pa premium_source in (signup_trial, oauth_signup_trial) kan darfor
 * bara nagonsin ge noll procent. Det ar inte ett lagt tal, det ar ett tal som
 * inte finns.
 *
 * Konverteringen laser vi i stallet ur Stripes egna prenumerationer, dar
 * trial_end ligger kvar aven efter att statusen gatt fran trialing till
 * active. Den berakningen bor i hamtaStripeSnapshot.
 */
const hamtaTrialPagaende = unstable_cache(
  async (): Promise<number> => {
    const admin = getSupabaseAdmin() as any;
    const { count } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('premium_source', ['signup_trial', 'oauth_signup_trial']);
    return count ?? 0;
  },
  ['admin-intakter-trial-pagaende'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/**
 * Kontrollrakning av premium_grants.
 *
 * Tabellen ar tom historiskt (planens avsnitt 8): antingen har ingen kopt ett
 * engangspaket sedan 2026-09-11, eller sa skriver inte webhooken. Stripe ar
 * primarkalla for nya betalande sa lange, och det har talet ar bara till for
 * att sidan ska kunna saga nar tabellen borjar fyllas.
 */
const hamtaPremiumGrants = unstable_cache(
  async (): Promise<number> => {
    const admin = getSupabaseAdmin() as any;
    const { count } = await admin
      .from('premium_grants')
      .select('*', { count: 'exact', head: true });
    return count ?? 0;
  },
  ['admin-intakter-grants'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/**
 * Allt sidan behover for forsta malningen. Inget externt API rors.
 */
export async function hamtaIntaktData(antalDagar = 90): Promise<IntaktData> {
  const [dagar, churnVeckor, trialPagaende, premiumGrantsRader] = await Promise.all([
    hamtaDagligaMetrik(antalDagar),
    hamtaChurnVeckor(12),
    hamtaTrialPagaende(),
    hamtaPremiumGrants(),
  ]);

  // hamtaDagligaMetrik ger fallande ordning, senaste forst.
  //
  // Jamforelsedagarna slas upp pa datum och inte pa index. Index hade
  // fungerat sa lange varje dag har en rad, men en enda saknad dag hade
  // forskjutit hela jamforelsen ett steg utan att nagot sag fel ut: kortet
  // hade sagt "mot i gar" och visat forrgar.
  const senaste = dagar[0] ?? null;
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
    churnVeckor,
    trialPagaende,
    premiumGrantsRader,
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

export interface StripeSnapshot {
  planMix: PlanRad[];
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

      for await (const sub of stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.items.data.price'],
      })) {
        if (sub.trial_end) {
          trialPaborjade += 1;
          if (sub.status === 'active') trialBetalande += 1;
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

      return {
        planMix,
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
  ['admin-intakter-stripe'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
