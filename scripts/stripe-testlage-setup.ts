/**
 * Speglar de sex paketen i Stripes TESTLÄGE, så att köpflödet kan provas
 * mot ett lokalt produktionsbygge utan att röra live-kontot.
 *
 *   npx tsx scripts/stripe-testlage-setup.ts
 *
 * Läser STRIPE_SECRET_KEY_TEST och NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ur
 * .env.local och vägrar köra med något annat än en sk_test_-nyckel.
 * Live-nycklarna (STRIPE_SECRET_KEY m.fl.) läses aldrig.
 *
 * Idempotent: varje paket letas upp på product.metadata.planKey först, och
 * priset på produkten med samma belopp, valuta och intervall. Bara det som
 * saknas skapas. Namn och nickname rättas om de glidit.
 *
 * Resultatet skrivs till .env.test.local (gitignorerad via .env*.local) under
 * samma variabelnamn som live använder, så att ett bygge kan startas i
 * testläget utan kodändringar:
 *
 *   STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
 *   STRIPE_PRICE_CV_WEEK, STRIPE_PRICE_TEST_WEEK, STRIPE_PRICE_DAYPASS,
 *   STRIPE_PRICE_ALL_WEEK, NEXT_PUBLIC_STRIPE_PRICE_ID, STRIPE_PRICE_QUARTER
 *
 * Next läser inte .env.test.local vid `next build`/`next start` (bara när
 * NODE_ENV=test), och NEXT_PUBLIC_-variabler bakas in vid bygget. Filen ska
 * därför läsas in i processens miljö före både build och start, se
 * docs/qa/qa-kop-testlage-2026-09-24.md. En satt processvariabel vinner över
 * .env.local.
 *
 * STRIPE_WEBHOOK_SECRET är en lokalt genererad hemlighet (whsec_...). Den
 * finns inte i Stripe: utan Stripe CLI och tunnel hämtas eventen med
 * events.list och postas signerade till den lokala webhookrutten.
 *
 * Skriptet ser också till att testläget har en kundportal-konfiguration,
 * eftersom create-portal-session inte skickar någon och Stripe då kräver en
 * standardkonfiguration.
 *
 * Nycklarna skrivs aldrig ut. Bara produkt- och prisid loggas.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Stripe from 'stripe';
import { laddaEnv } from './_env';
import { PLANS, type Plan, type PlanLength } from '../src/lib/plans/plans';
import { getPlanEnvName } from '../src/lib/stripe/planPrices';

laddaEnv();

const hemlighet = process.env.STRIPE_SECRET_KEY_TEST;
const publik = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
if (!hemlighet || !hemlighet.startsWith('sk_test_')) {
  console.error('STRIPE_SECRET_KEY_TEST saknas eller är ingen testnyckel. Avbryter.');
  process.exit(1);
}
if (!publik || !publik.startsWith('pk_test_')) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST saknas eller är ingen testnyckel. Avbryter.');
  process.exit(1);
}

const stripe = new Stripe(hemlighet, { apiVersion: '2025-02-24.acacia' });
const ENV_FIL = path.resolve(process.cwd(), '.env.test.local');

const NICKNAME: Record<PlanLength, string> = {
  dag: 'dag',
  vecka: 'vecka',
  månad: 'månad',
  kvartal: 'kvartal',
};

function recurringFor(plan: Plan): Stripe.PriceCreateParams.Recurring | undefined {
  switch (plan.length) {
    case 'dag':
      return undefined;
    case 'vecka':
      return { interval: 'week', interval_count: 1 };
    case 'månad':
      return { interval: 'month', interval_count: 1 };
    case 'kvartal':
      return { interval: 'month', interval_count: 3 };
  }
}

function prisetStammer(p: Stripe.Price, plan: Plan): boolean {
  if (!p.active) return false;
  if (p.currency !== 'sek' || p.unit_amount !== plan.amount * 100) return false;
  const r = recurringFor(plan);
  if (!r) return p.type === 'one_time';
  return (
    p.type === 'recurring' &&
    p.recurring?.interval === r.interval &&
    (p.recurring?.interval_count ?? 1) === (r.interval_count ?? 1)
  );
}

async function allaProdukter(): Promise<Stripe.Product[]> {
  const ut: Stripe.Product[] = [];
  for await (const p of stripe.products.list({ limit: 100, active: true })) ut.push(p);
  return ut;
}

async function sakerstallPortal(): Promise<string> {
  const lista = await stripe.billingPortal.configurations.list({ limit: 20 });
  const standard = lista.data.find((c) => c.is_default && c.active);
  if (standard) return `${standard.id} (fanns)`;
  const ny = await stripe.billingPortal.configurations.create({
    business_profile: { headline: 'Jobbcoach.ai testläge' },
    default_return_url: 'http://localhost:3461/dashboard/profil/prenumeration',
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'name'] },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: ['too_expensive', 'unused', 'missing_features', 'other'],
        },
      },
    },
  });
  return `${ny.id} (skapad, is_default=${ny.is_default})`;
}

function lasBefintligEnv(): Record<string, string> {
  if (!fs.existsSync(ENV_FIL)) return {};
  const ut: Record<string, string> = {};
  for (const rad of fs.readFileSync(ENV_FIL, 'utf8').split(/\r?\n/)) {
    const t = rad.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) ut[t.slice(0, i)] = t.slice(i + 1);
  }
  return ut;
}

async function main() {
  console.log('Stripe-nyckel: TEST');
  const produkter = await allaProdukter();
  const rader: Record<string, string> = {};

  for (const plan of PLANS) {
    let produkt = produkter.find((p) => p.metadata?.planKey === plan.key);
    if (!produkt) {
      produkt = await stripe.products.create({
        name: plan.name,
        metadata: { planKey: plan.key, scope: plan.scope },
      });
      console.log(`${plan.key.padEnd(12)} produkt ${produkt.id} skapad "${plan.name}"`);
    } else if (produkt.name !== plan.name) {
      produkt = await stripe.products.update(produkt.id, { name: plan.name });
      console.log(`${plan.key.padEnd(12)} produkt ${produkt.id} omdöpt till "${plan.name}"`);
    } else {
      console.log(`${plan.key.padEnd(12)} produkt ${produkt.id} fanns "${plan.name}"`);
    }

    const priser = await stripe.prices.list({ product: produkt.id, active: true, limit: 100 });
    let pris = priser.data.find((p) => p.metadata?.planKey === plan.key && prisetStammer(p, plan));
    const nickname = NICKNAME[plan.length];
    if (!pris) {
      const recurring = recurringFor(plan);
      pris = await stripe.prices.create({
        product: produkt.id,
        currency: 'sek',
        unit_amount: plan.amount * 100,
        tax_behavior: 'inclusive',
        nickname,
        metadata: { planKey: plan.key, scope: plan.scope },
        ...(recurring ? { recurring } : {}),
      });
      console.log(`${' '.repeat(12)} pris ${pris.id} skapat ${plan.amount} kr ${nickname}`);
    } else {
      if (pris.nickname !== nickname) {
        pris = await stripe.prices.update(pris.id, { nickname });
      }
      console.log(`${' '.repeat(12)} pris ${pris.id} fanns ${plan.amount} kr ${nickname}`);
    }
    rader[getPlanEnvName(plan.key)] = pris.id;
  }

  console.log(`kundportal: ${await sakerstallPortal()}`);

  // Webhookhemligheten behålls mellan körningar, så ett bygge som redan
  // startats fortsätter att godta signaturerna.
  const befintlig = lasBefintligEnv();
  const whsec =
    befintlig.STRIPE_WEBHOOK_SECRET && befintlig.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')
      ? befintlig.STRIPE_WEBHOOK_SECRET
      : `whsec_${crypto.randomBytes(24).toString('base64url')}`;

  const innehall = [
    '# Stripe TESTLÄGE för lokalt produktionsbygge. Skapad av scripts/stripe-testlage-setup.ts.',
    '# Gitignorerad (.env*.local). Committas aldrig. Läses in i processen före next build och next start.',
    `STRIPE_SECRET_KEY=${hemlighet}`,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publik}`,
    `STRIPE_WEBHOOK_SECRET=${whsec}`,
    ...Object.entries(rader).map(([k, v]) => `${k}=${v}`),
    '',
  ].join('\n');
  fs.writeFileSync(ENV_FIL, innehall, { encoding: 'utf8', mode: 0o600 });
  console.log(`\nSkrev ${Object.keys(rader).length} prisid, nycklarna och webhookhemligheten till .env.test.local`);
  for (const [k, v] of Object.entries(rader)) console.log(`  ${k}=${v}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
