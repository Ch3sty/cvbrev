/**
 * GET /api/admin/installningar/stripe
 *
 * Stripe-speglingen bakom Installningar-sidans prisjamforelse: aktiva priser,
 * kuponger och prisernas koppling till produktstegen i PLANS.
 *
 * Tre regler:
 *
 * 1. **Bara lasning.** Adminen skriver aldrig till Stripe. Rutten har ingen
 *    POST och far aldrig fa en. Ett felkonfigurerat pris rattas i Stripes egen
 *    instrumentpanel av agaren, inte harifran.
 * 2. **Egen rutt, inte kritiska vagen.** Sidan renderar fardigt ur PLANS och
 *    env-variablerna och hamtar det har efterat. Ett Stripe-anrop i
 *    serverrenderingen gor LCP under 1,5 sekunder omojligt (planens avsnitt
 *    4.1 och lasvagen i "Vag 1 levererat").
 * 3. **Paginera fran forsta raden.** Fyra priser och tva kuponger ryms i en
 *    sida i dag, vilket ar precis den sortens siffra som goemmer buggen tills
 *    volymen vaxer (planens avsnitt 8).
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';

export const dynamic = 'force-dynamic';

/** Samma API-version som resten av kodbasen. */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-02-24.acacia',
});

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

async function hamtaPriser(): Promise<StripePrisrad[]> {
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

async function hamtaKuponger(): Promise<StripeKupongrad[]> {
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

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY saknas i miljön. Speglingen kan inte läsas.' },
      { status: 503 }
    );
  }

  try {
    const [priser, kuponger] = await Promise.all([hamtaPriser(), hamtaKuponger()]);
    return NextResponse.json({
      priser,
      kuponger,
      hamtad: new Date().toISOString(),
    } satisfies StripeSpegling);
  } catch (error) {
    const meddelande = error instanceof Error ? error.message : 'Okänt fel mot Stripe';
    console.error('[admin/installningar/stripe]', meddelande);
    return NextResponse.json({ error: meddelande }, { status: 502 });
  }
}
