import 'server-only';

/**
 * Datalagret för Flöde (D3, docs/plan-paket-och-onboarding.md avsnitt 6).
 *
 * Sidan svarar på ägarens fråga "kan vi spåra och maximera konverteringen"
 * med fem diagram: köpflödet per paket, var det tar stopp, Kom igång,
 * förnyelser och intäkt per paket. Allt utom förnyelserna läses ur
 * Supabase-tabeller som cronen fyller (admin_flode_daily,
 * admin_daily_metrics, profiles), cachat 15 minuter som resten av adminen.
 * Förnyelserna kräver Stripe och hämtas i en Suspense-gräns efter första
 * målningen, med samma cache.
 *
 * Tre regler:
 *
 * 1. Ingen fråga går mot PostHog i kritiska vägen. Händelserna ligger i
 *    admin_flode_daily, en rad per dag, händelse och dimension.
 * 2. Personer i tratten är unika per dag och summeras över fönstret. Samma
 *    besökare två dagar räknas två gånger i besöken, aldrig i betalt (som
 *    är en händelse per köp). Noten på sidan säger det.
 * 3. En källa som inte svarar ger null eller tom lista, aldrig noll.
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_CACHE_SEKUNDER, ADMIN_METRICS_TAG, hamtaDagligaMetrik } from '@/lib/admin/metrics';
import { dagBakat, dagStr, FLODE_SAMLAD, FUNNEL_STEG, paketFranPrisId } from '@/lib/admin/collect';
import {
  byggBlockeringar,
  byggFornyelser,
  byggIntakt,
  byggKomIgang,
  byggTratt,
  HANDELSER_LIVE,
  PAKETEN,
  paketFranDimension,
  VECKOPAKET,
  type BlockeringRad,
  type FlodeRad,
  type Fonster,
  type FornyelseData,
  type IntaktPunkt,
  type KomIgangPaket,
  type KopareRad,
  type Paket,
  type SubRad,
  type Tratt,
} from './berakning';

// Sidan och diagrammen läser typer och konstanter härifrån.
export * from './berakning';

// ---------------------------------------------------------------------------
// Kritiska vägen: allt sidan behöver för första målningen
// ---------------------------------------------------------------------------

export interface FlodeData {
  fonster: Fonster;
  /** Första och sista dagen i fönstret. */
  franDag: string;
  tillDag: string;
  /** Dagar i fönstret som cronen faktiskt samlat in. */
  samladeDagar: number;
  /** Dagar i fönstret som ligger efter att händelserna gick live. */
  dagarMedHandelser: number;
  trattar: Tratt[];
  blockerade: BlockeringRad[];
  graVal: BlockeringRad[];
  komIgang: KomIgangPaket[];
  intakt: IntaktPunkt[];
  /** Summan av renewal_succeeded i fönstret, per paket. */
  fornyelserIFonstret: Record<Paket, number>;
}

async function hamtaFlodeRader(admin: any, franDag: string): Promise<FlodeRad[]> {
  const { data, error } = await admin
    .from('admin_flode_daily')
    .select('dag, handelse, dimension, antal, personer')
    .gte('dag', franDag)
    .limit(20000);
  if (error) {
    console.error('[admin/flode] admin_flode_daily:', error.message);
    return [];
  }
  return (data ?? []) as FlodeRad[];
}

/** Köparna sedan händelserna gick live, alltså de som har paket_started_at. */
async function hamtaKopare(admin: any, franDag: string): Promise<KopareRad[]> {
  const { data, error } = await admin
    .from('profiles')
    .select('premium_scope, paket_started_at, onboarding_steps')
    .gte('paket_started_at', `${franDag}T00:00:00Z`)
    .limit(5000);
  if (error) {
    console.error('[admin/flode] profiles:', error.message);
    return [];
  }
  return (data ?? []) as KopareRad[];
}

export const hamtaFlodeData = unstable_cache(
  async (fonster: Fonster): Promise<FlodeData> => {
    const admin = getSupabaseAdmin() as any;
    const idag = dagStr();
    const franDag = dagBakat(idag, fonster - 1);

    const [rader, kopare, dagar] = await Promise.all([
      hamtaFlodeRader(admin, franDag),
      hamtaKopare(admin, dagBakat(idag, 90)),
      hamtaDagligaMetrik(fonster),
    ]);

    // Tratten: summor per paket och steg.
    const summor = new Map<string, Map<string, number>>();
    const lagg = (paket: string, steg: string, n: number) => {
      let m = summor.get(paket);
      if (!m) {
        m = new Map();
        summor.set(paket, m);
      }
      m.set(steg, (m.get(steg) ?? 0) + n);
    };
    const stegForHandelse: Record<string, (typeof FUNNEL_STEG)[number]> = {
      $pageview: 'pageview',
      signup_completed: 'signup_completed',
      track_selected: 'track_selected',
      purchase_step_viewed: 'purchase_step_viewed',
      checkout_started: 'checkout_started',
      subscription_paid: 'subscription_paid',
    };
    const fornyelserIFonstret: Record<Paket, number> = { cv: 0, tester: 0, allt: 0 };
    let samlade = 0;

    for (const r of rader) {
      if (r.handelse === FLODE_SAMLAD) {
        samlade += 1;
        continue;
      }
      if (r.handelse === 'renewal_succeeded' && r.dimension) {
        const p = paketFranDimension(r.dimension);
        if (p) fornyelserIFonstret[p] += r.antal;
        continue;
      }
      const steg = stegForHandelse[r.handelse];
      if (!steg) continue;
      if (r.dimension === '') {
        lagg('alla', steg, r.personer);
      } else {
        const p = paketFranDimension(r.dimension);
        if (p) lagg(p, steg, r.personer);
      }
    }

    const trattar: Tratt[] = [
      byggTratt('alla', summor.get('alla') ?? new Map()),
      ...PAKETEN.map((p) => byggTratt(p, summor.get(p) ?? new Map())),
    ];

    const dagarMedHandelser = Math.max(
      0,
      Math.min(fonster, Math.floor((new Date(`${idag}T12:00:00Z`).getTime() - new Date(`${HANDELSER_LIVE}T12:00:00Z`).getTime()) / 86_400_000) + 1)
    );

    return {
      fonster,
      franDag,
      tillDag: idag,
      samladeDagar: samlade,
      dagarMedHandelser,
      trattar,
      blockerade: byggBlockeringar(rader, 'feature_blocked'),
      graVal: byggBlockeringar(rader, 'gray_option_tapped'),
      komIgang: byggKomIgang(kopare),
      intakt: byggIntakt(dagar),
      fornyelserIFonstret,
    };
  },
  ['admin-flode'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG, 'admin-flode'] }
);

// ---------------------------------------------------------------------------
// Uppskjutet: förnyelser ur Stripe
// ---------------------------------------------------------------------------

export const hamtaFornyelser = unstable_cache(
  async (): Promise<FornyelseData> => {
    const nyckel = process.env.STRIPE_SECRET_KEY;
    const tom = {
      veckor: [],
      kohort: { cv: 0, tester: 0, allt: 0 },
      veckaTva: { cv: null, tester: null, allt: null },
    };
    if (!nyckel) return { ...tom, tillganglig: false };

    const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
    const nuSek = Math.floor(Date.now() / 1000);
    const fran = nuSek - 100 * 86_400;

    try {
      // Betalda fakturor per prenumeration, ett paginerat anrop.
      const fakturor = new Map<string, number>();
      for await (const f of stripe.invoices.list({ status: 'paid', created: { gte: fran }, limit: 100 })) {
        const subId = typeof f.subscription === 'string' ? f.subscription : f.subscription?.id;
        if (!subId) continue;
        if ((f.amount_paid ?? 0) <= 0) continue;
        fakturor.set(subId, (fakturor.get(subId) ?? 0) + 1);
      }

      const subs: SubRad[] = [];
      for await (const sub of stripe.subscriptions.list({
        status: 'all',
        created: { gte: fran },
        limit: 100,
        expand: ['data.items.data.price'],
      })) {
        const prisId = sub.items.data[0]?.price?.id ?? null;
        const nyckelPaket = paketFranPrisId(prisId);
        const paket = (Object.keys(VECKOPAKET) as Paket[]).find((p) => VECKOPAKET[p] === nyckelPaket);
        if (!paket) continue;
        subs.push({ paket, created: sub.created, betaldaFakturor: fakturor.get(sub.id) ?? 0 });
      }

      return { ...byggFornyelser(subs, nuSek), tillganglig: true };
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      console.error('[admin/flode] Stripe svarade inte:', m);
      return { ...tom, tillganglig: false, fel: m };
    }
  },
  ['admin-flode-fornyelser'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG, 'admin-flode'] }
);
