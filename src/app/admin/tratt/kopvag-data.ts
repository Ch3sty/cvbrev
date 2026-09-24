import 'server-only';

/**
 * Datalagret för Tratt, vyn Köpvägen (spec-admin-tydlighet punkt 8).
 *
 * En källa per steg:
 *
 *   Nya konton           profiles.created_at i fönstret, undantagna bort
 *   Såg förslaget        admin_flode_daily, pricing_viewed med surface signup_forslag
 *   Valde spår           admin_flode_daily, track_selected per spår
 *   Såg köpsteget        admin_flode_daily, purchase_step_viewed (från MATSTART.kopvag)
 *   Gick till kassan     admin_flode_daily, checkout_started (från MATSTART.kopvag)
 *   Köp                  Stripe via kop.ts, i sidans Suspense-gräns
 *
 * Allt här är Supabase och läses i kritiska vägen, cachat 15 minuter.
 * Stripe (köp och förnyelser) hämtas i Suspense efter första målningen.
 * admin_flode_daily fylls ur PostHog med undantagna personer bortfiltrerade
 * i insamlingen; profiles läses direkt och filtreras här med uteslut().
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_CACHE_SEKUNDER, ADMIN_METRICS_TAG } from '@/lib/admin/metrics';
import { dagStr, FLODE_SAMLAD, kundId, paketFranPrisId } from '@/lib/admin/collect';
import { byggUndantag, uteslut, type Undantag } from '@/lib/admin/undantag';
import { MATSTART } from '@/lib/admin/tomt';
import {
  byggBlockeringar,
  byggFornyelser,
  byggKomIgang,
  paketFranDimension,
  senaste,
  stoppDagar,
  VECKOPAKET,
  type BlockeringRad,
  type FlodeRad,
  type FonsterVal,
  type FornyelseData,
  type KomIgangPaket,
  type KopareRad,
  type Paket,
  type SubRad,
} from './berakning';

export interface KopvagData {
  /** Nya konton i fönstret ur profiles. Null när databasen inte svarade. */
  nyaKonton: number | null;
  /** Personer som såg registreringens förslag (steg 3), unika per dag och summerade. */
  forslag: number;
  /** Personer som valde spår, unika per dag och summerade. */
  spar: { totalt: number; perPaket: Record<Paket, number> };
  /** Personer som sett köpsteget, från mätstarten eller fönstrets början. */
  kopsteget: number;
  kassan: number;
  /** Där köpstegets räkning börjar: den senare av fönstret och mätstarten. */
  kopvagFran: string;
  blockerade: BlockeringRad[];
  graVal: BlockeringRad[];
  /** Dagar med minst en spärr eller ett grått val. */
  stoppDagar: string[];
  komIgang: KomIgangPaket[];
  /** Köpare med paket_started_at efter MATSTART.kopvag. */
  kopareEfterKopvag: number;
  /** Dagar i fönstret som cronen samlat in. */
  samladeDagar: number;
}

async function hamtaFlodeRader(admin: any, franDag: string): Promise<FlodeRad[]> {
  const { data, error } = await admin
    .from('admin_flode_daily')
    .select('dag, handelse, dimension, antal, personer')
    .gte('dag', franDag)
    .limit(20000);
  if (error) {
    console.error('[admin/tratt] admin_flode_daily:', error.message);
    return [];
  }
  return (data ?? []) as FlodeRad[];
}

async function raknaNyaKonton(admin: any, franIso: string, u: Undantag): Promise<number | null> {
  const q = admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', franIso);
  const { count, error } = await uteslut(q, 'id', u);
  if (error) {
    console.error('[admin/tratt] profiles, nya konton:', error.message);
    return null;
  }
  return count ?? 0;
}

/** Köparna sedan köpvägen mäts, alltså de som har paket_started_at efter mätstart. */
async function hamtaKopare(admin: any, u: Undantag): Promise<KopareRad[]> {
  const q = admin
    .from('profiles')
    .select('premium_scope, paket_started_at, onboarding_steps')
    .gte('paket_started_at', MATSTART.kopvag)
    .limit(5000);
  const { data, error } = await uteslut(q, 'id', u);
  if (error) {
    console.error('[admin/tratt] profiles, köpare:', error.message);
    return [];
  }
  return (data ?? []) as KopareRad[];
}

export const hamtaKopvagData = unstable_cache(
  async (fonster: FonsterVal, konton: Undantag['konton']): Promise<KopvagData> => {
    const admin = getSupabaseAdmin() as any;
    const u = byggUndantag(konton);

    const [rader, nyaKonton, kopare] = await Promise.all([
      hamtaFlodeRader(admin, fonster.franDag),
      raknaNyaKonton(admin, fonster.franIso, u),
      hamtaKopare(admin, u),
    ]);

    const kopvagFran = senaste(fonster.franIso, MATSTART.kopvag);
    const kopvagDag = dagStr(new Date(kopvagFran));

    const spar = { totalt: 0, perPaket: { cv: 0, tester: 0, allt: 0 } as Record<Paket, number> };
    let kopsteget = 0;
    let kassan = 0;
    let forslag = 0;
    let samladeDagar = 0;

    for (const r of rader) {
      if (r.handelse === FLODE_SAMLAD) {
        samladeDagar += 1;
        continue;
      }
      if (r.handelse === 'pricing_viewed') {
        if (r.dimension === 'signup_forslag') forslag += r.personer;
        continue;
      }
      if (r.handelse === 'track_selected') {
        if (r.dimension === '') spar.totalt += r.personer;
        else {
          const p = paketFranDimension(r.dimension);
          if (p) spar.perPaket[p] += r.personer;
        }
        continue;
      }
      if (r.dimension !== '' || r.dag < kopvagDag) continue;
      if (r.handelse === 'purchase_step_viewed') kopsteget += r.personer;
      if (r.handelse === 'checkout_started') kassan += r.personer;
    }

    // Gråa val räknas från köpvägens mätstart, som resten av köpvägen.
    const graRader = rader.filter((r) => r.handelse !== 'gray_option_tapped' || r.dag >= kopvagDag);

    return {
      nyaKonton,
      forslag,
      spar,
      kopsteget,
      kassan,
      kopvagFran,
      blockerade: byggBlockeringar(rader, 'feature_blocked'),
      graVal: byggBlockeringar(graRader, 'gray_option_tapped'),
      stoppDagar: stoppDagar(graRader),
      komIgang: byggKomIgang(kopare),
      kopareEfterKopvag: kopare.length,
      samladeDagar,
    };
  },
  ['admin-tratt-kopvag'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG, 'admin-flode'] }
);

// ---------------------------------------------------------------------------
// Uppskjutet: förnyelser ur Stripe
// ---------------------------------------------------------------------------

export const hamtaFornyelser = unstable_cache(
  async (konton: Undantag['konton']): Promise<FornyelseData> => {
    const nyckel = process.env.STRIPE_SECRET_KEY;
    const tom: FornyelseData = {
      veckor: [],
      kohort: { cv: 0, tester: 0, allt: 0 },
      veckaTva: { cv: null, tester: null, allt: null },
      veckokopare: 0,
      forstaVeckokop: null,
      tillganglig: false,
    };
    if (!nyckel) return { ...tom, fel: 'Stripe-nyckeln saknas på servern.' };

    const u = byggUndantag(konton);
    const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
    const nuSek = Math.floor(Date.now() / 1000);
    const fran = nuSek - 100 * 86_400;

    try {
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
        // Undantagna konton räknas aldrig, inte heller i kohorten.
        const kund = kundId(sub.customer as string | { id: string } | null);
        if ((kund && u.stripeKunder.has(kund)) || u.har(sub.metadata?.userId ?? null)) continue;
        const prisId = sub.items.data[0]?.price?.id ?? null;
        const nyckelPaket = paketFranPrisId(prisId);
        const paket = (Object.keys(VECKOPAKET) as Paket[]).find((p) => VECKOPAKET[p] === nyckelPaket);
        if (!paket) continue;
        subs.push({ paket, created: sub.created, betaldaFakturor: fakturor.get(sub.id) ?? 0 });
      }

      return { ...byggFornyelser(subs, nuSek), tillganglig: true };
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      console.error('[admin/tratt] Stripe svarade inte:', m);
      return { ...tom, fel: m };
    }
  },
  ['admin-tratt-fornyelser'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG, 'admin-flode'] }
);

/** Kontots skapandetid per köpare, för raden "från ett konto skapat 27 jan". */
export const hamtaKontonSkapade = unstable_cache(
  async (ids: string[]): Promise<Record<string, string>> => {
    if (!ids.length) return {};
    const admin = getSupabaseAdmin() as any;
    const { data, error } = await admin.from('profiles').select('id, created_at').in('id', ids);
    if (error) return {};
    const ut: Record<string, string> = {};
    for (const p of (data ?? []) as Array<{ id: string; created_at: string }>) ut[p.id] = p.created_at;
    return ut;
  },
  ['admin-tratt-konton-skapade'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
