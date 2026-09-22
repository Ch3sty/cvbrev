import 'server-only';

/**
 * Stripe-speglingen bakom Installningar: aktiva priser och kuponger.
 *
 * Bara lasning. Adminen skriver aldrig till Stripe, och ingenting har far
 * nagonsin fa en skrivvag.
 *
 * Tva vagar in:
 *
 * - hamtaStripeSpeglingCachad, som sidan laser i en Suspense-grans vid
 *   serverrenderingen. Cachad 15 minuter med adminens tagg, som ovriga
 *   adminsidor, sa "Hamta nu" rensar den. Tidigare hamtade klienten
 *   speglingen efter hydreringen, och da blev jamforelsens text sidans LCP
 *   forst nar tva rundturer och ett Stripe-anrop var klara (1,5 till 1,6 s).
 * - lasStripeSpegling, ocachad, for rutten /api/admin/installningar/stripe
 *   som knappen "Las om" anvander. Den som ber om en farsk lasning ska fa en.
 *
 * Paginera fran forsta raden: fyra priser och tva kuponger ryms i en sida i
 * dag, vilket ar precis den sortens siffra som goemmer buggen tills volymen
 * vaxer (planens avsnitt 8).
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { ADMIN_CACHE_SEKUNDER, ADMIN_METRICS_TAG } from '@/lib/admin/metrics';

export interface StripePrisrad {
  id: string;
  produkt: string | null;
  beloppOre: number | null;
  valuta: string;
  typ: 'one_time' | 'recurring';
  intervall: string | null;
  intervallAntal: number | null;
  aktiv: boolean;
}

export interface StripeKupongrad {
  id: string;
  namn: string | null;
  avdragOre: number | null;
  avdragProcent: number | null;
  varaktighet: string;
  manader: number | null;
  inlosta: number;
  giltig: boolean;
}

export interface StripeSpegling {
  priser: StripePrisrad[];
  kuponger: StripeKupongrad[];
  hamtad: string;
}

/** Kastas nar nyckeln saknas, sa att rutten kan svara 503 i stallet for 502. */
export class StripeNyckelSaknas extends Error {
  constructor() {
    super('STRIPE_SECRET_KEY saknas i miljön. Speglingen kan inte läsas.');
  }
}

function stripeKlient(): Stripe {
  const nyckel = process.env.STRIPE_SECRET_KEY;
  if (!nyckel) throw new StripeNyckelSaknas();
  // Samma API-version som resten av kodbasen.
  return new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
}

async function hamtaPriser(stripe: Stripe): Promise<StripePrisrad[]> {
  const rader: StripePrisrad[] = [];
  let startingAfter: string | undefined;

  // has_more tills det ar false. Utan slingan ser fyra priser ut som alla
  // priser, och gor det anda den dagen de blir hundra.
  for (;;) {
    const sida = await stripe.prices.list({
      limit: 100,
      expand: ['data.product'],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const p of sida.data) {
      const produkt =
        typeof p.product === 'object' && p.product && 'name' in p.product
          ? ((p.product as Stripe.Product).name ?? null)
          : null;

      rader.push({
        id: p.id,
        produkt,
        beloppOre: p.unit_amount,
        valuta: (p.currency ?? 'sek').toUpperCase(),
        typ: p.type === 'recurring' ? 'recurring' : 'one_time',
        intervall: p.recurring?.interval ?? null,
        intervallAntal: p.recurring?.interval_count ?? null,
        aktiv: p.active === true,
      });
    }

    if (!sida.has_more || !sida.data.length) break;
    startingAfter = sida.data[sida.data.length - 1].id;
  }

  return rader;
}

async function hamtaKuponger(stripe: Stripe): Promise<StripeKupongrad[]> {
  const rader: StripeKupongrad[] = [];
  let startingAfter: string | undefined;

  for (;;) {
    const sida = await stripe.coupons.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const k of sida.data) {
      rader.push({
        id: k.id,
        namn: k.name ?? null,
        avdragOre: k.amount_off ?? null,
        avdragProcent: k.percent_off ?? null,
        varaktighet: k.duration,
        manader: k.duration_in_months ?? null,
        inlosta: k.times_redeemed ?? 0,
        giltig: k.valid === true,
      });
    }

    if (!sida.has_more || !sida.data.length) break;
    startingAfter = sida.data[sida.data.length - 1].id;
  }

  return rader;
}

/** Ocachad lasning. Kastar vid fel, sa att ett fel aldrig cachas. */
export async function lasStripeSpegling(): Promise<StripeSpegling> {
  const stripe = stripeKlient();
  const [priser, kuponger] = await Promise.all([hamtaPriser(stripe), hamtaKuponger(stripe)]);
  return { priser, kuponger, hamtad: new Date().toISOString() };
}

/** Samma lasning, cachad 15 minuter med adminens tagg. */
export const hamtaStripeSpeglingCachad = unstable_cache(
  lasStripeSpegling,
  ['admin-installningar-stripe-spegling'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
