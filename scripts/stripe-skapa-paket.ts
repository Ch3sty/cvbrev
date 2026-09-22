/**
 * Skapar de tre nya veckopriserna i Stripe: CV-veckan, Testveckan och
 * Allt-veckan (docs/plan-paket-och-onboarding.md, ägarens beslut 1 och 6).
 *
 * De tre övriga paketen finns redan: Allt-dagen (STRIPE_PRICE_DAYPASS),
 * Allt-månaden (NEXT_PUBLIC_STRIPE_PRICE_ID) och Allt-kvartalet
 * (STRIPE_PRICE_QUARTER). De rörs inte här.
 *
 *   npx tsx scripts/stripe-skapa-paket.ts
 *
 * Skriptet skriver ut de tre env-raderna på slutet. Lägg in dem i .env.local
 * och i Vercel innan något av paketen går att sälja. Körs en gång: körs det
 * två gånger skapas dubbletter i Stripe, eftersom Stripe inte har någon
 * unikhet på produktnamn.
 */

import Stripe from 'stripe';
import { laddaEnv } from './_env';

laddaEnv();

const hemlighet = process.env.STRIPE_SECRET_KEY;
if (!hemlighet) {
  console.error('Saknar STRIPE_SECRET_KEY. Lagg den i .env.local och kor om.');
  process.exit(1);
}

const stripe = new Stripe(hemlighet, { apiVersion: '2025-02-24.acacia' });

interface Paket {
  namn: string;
  planKey: string;
  scope: string;
  oren: number;
  envNamn: string;
}

const PAKET: Paket[] = [
  { namn: 'CV-veckan', planKey: 'cv_week', scope: 'cv', oren: 7900, envNamn: 'STRIPE_PRICE_CV_WEEK' },
  { namn: 'Testveckan', planKey: 'test_week', scope: 'tester', oren: 7900, envNamn: 'STRIPE_PRICE_TEST_WEEK' },
  { namn: 'Allt-veckan', planKey: 'all_week', scope: 'allt', oren: 9900, envNamn: 'STRIPE_PRICE_ALL_WEEK' },
];

async function main() {
  const rader: string[] = [];

  for (const paket of PAKET) {
    const produkt = await stripe.products.create({
      name: paket.namn,
      metadata: { planKey: paket.planKey, scope: paket.scope },
    });

    const pris = await stripe.prices.create({
      product: produkt.id,
      currency: 'sek',
      unit_amount: paket.oren,
      recurring: { interval: 'week', interval_count: 1 },
      tax_behavior: 'inclusive',
      metadata: { planKey: paket.planKey, scope: paket.scope },
    });

    console.log(`${paket.namn}: produkt ${produkt.id}, pris ${pris.id} (${paket.oren / 100} kr i veckan)`);
    rader.push(`${paket.envNamn}=${pris.id}`);
  }

  console.log('\nLagg de har raderna i .env.local och i Vercel:\n');
  for (const rad of rader) console.log(rad);
}

main().catch((fel) => {
  console.error('Misslyckades:', fel instanceof Error ? fel.message : fel);
  process.exit(1);
});
