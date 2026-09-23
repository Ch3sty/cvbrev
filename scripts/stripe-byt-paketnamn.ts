/**
 * Byter paketnamnen i Stripe (docs/rapporter/beslut-paketnamn-2026-09-24.md,
 * ägarens beslut samma dag: agenten gör bytet, prisid:na behålls).
 *
 * För varje paket hämtas priset ur env-variabeln i src/lib/stripe/planPrices.ts,
 * sedan priset och dess produkt. Produkten får namnet ur PLANS
 * ("CV-paketet", "Träningspaketet", "Dagspasset", "Hela paketet") och priset
 * får längden som nickname ("vecka", "månad", "kvartal", "dag"). Delar flera
 * priser produkt byts produkten en gång.
 *
 * Skriptet rör bara product.name och price.nickname. unit_amount, currency,
 * recurring, active och metadata skickas aldrig.
 *
 *   npx tsx scripts/stripe-byt-paketnamn.ts --dry-run   visa före och efter
 *   npx tsx scripts/stripe-byt-paketnamn.ts             byt, och hämta om för att verifiera
 */

import Stripe from 'stripe';
import { laddaEnv } from './_env';
import { PLANS, type PlanKey, type PlanLength } from '../src/lib/plans/plans';
import { getPlanEnvName } from '../src/lib/stripe/planPrices';

laddaEnv();

const torrt = process.argv.includes('--dry-run');
const hemlighet = process.env.STRIPE_SECRET_KEY;
if (!hemlighet) {
  console.error('Saknar STRIPE_SECRET_KEY i .env.local.');
  process.exit(1);
}
const lage = hemlighet.startsWith('sk_live_') ? 'LIVE' : hemlighet.startsWith('sk_test_') ? 'TEST' : 'OKÄNT';

const stripe = new Stripe(hemlighet, { apiVersion: '2025-02-24.acacia' });

const NICKNAME: Record<PlanLength, string> = {
  dag: 'dag',
  vecka: 'vecka',
  månad: 'månad',
  kvartal: 'kvartal',
};

interface Rad {
  plan: PlanKey;
  env: string;
  prisId: string;
  produktId: string;
  produktFore: string;
  produktEfter: string;
  nicknameFore: string | null;
  nicknameEfter: string;
  belopp: string;
}

function produktId(p: Stripe.Price): string {
  return typeof p.product === 'string' ? p.product : p.product.id;
}

async function samla(): Promise<Rad[]> {
  const rader: Rad[] = [];
  for (const plan of PLANS) {
    const env = getPlanEnvName(plan.key);
    const prisId = process.env[env];
    if (!prisId) throw new Error(`Saknar ${env} i .env.local`);
    const pris = await stripe.prices.retrieve(prisId, { expand: ['product'] });
    const produkt = pris.product as Stripe.Product;
    rader.push({
      plan: plan.key,
      env,
      prisId,
      produktId: produktId(pris),
      produktFore: produkt.name,
      produktEfter: plan.name,
      nicknameFore: pris.nickname,
      nicknameEfter: NICKNAME[plan.length],
      belopp: `${(pris.unit_amount ?? 0) / 100} ${pris.currency}${pris.recurring ? ` / ${pris.recurring.interval_count} ${pris.recurring.interval}` : ' engångs'}${pris.active ? '' : ' (inaktivt)'}`,
    });
  }
  return rader;
}

function skrivTabell(rubrik: string, rader: Rad[]) {
  console.log(`\n${rubrik}`);
  for (const r of rader) {
    console.log(
      `  ${r.plan.padEnd(12)} ${r.prisId}  ${r.belopp.padEnd(22)} produkt ${r.produktId}: "${r.produktFore}" -> "${r.produktEfter}"   nickname: ${JSON.stringify(r.nicknameFore)} -> "${r.nicknameEfter}"`
    );
  }
}

async function main() {
  console.log(`Stripe-nyckel: ${lage}${torrt ? ', torrkörning' : ''}`);
  const rader = await samla();
  skrivTabell('Före och efter:', rader);

  // En produkt får bara ett målnamn. Pekar två priser på samma produkt med
  // olika målnamn stoppar vi hellre än gissar.
  const perProdukt = new Map<string, Set<string>>();
  for (const r of rader) {
    const s = perProdukt.get(r.produktId) ?? new Set<string>();
    s.add(r.produktEfter);
    perProdukt.set(r.produktId, s);
  }
  for (const [id, namn] of perProdukt) {
    if (namn.size > 1) throw new Error(`Produkten ${id} delas av paket med olika namn: ${[...namn].join(', ')}`);
  }

  if (torrt) {
    console.log(`\n${perProdukt.size} produkter och ${rader.length} priser skulle uppdateras. Inget ändrat.`);
    return;
  }

  const bytta = new Set<string>();
  for (const r of rader) {
    if (!bytta.has(r.produktId)) {
      if (r.produktFore !== r.produktEfter) {
        await stripe.products.update(r.produktId, { name: r.produktEfter });
        console.log(`produkt ${r.produktId}: "${r.produktFore}" -> "${r.produktEfter}"`);
      } else {
        console.log(`produkt ${r.produktId}: heter redan "${r.produktEfter}"`);
      }
      bytta.add(r.produktId);
    }
    if (r.nicknameFore !== r.nicknameEfter) {
      await stripe.prices.update(r.prisId, { nickname: r.nicknameEfter });
      console.log(`pris ${r.prisId}: nickname ${JSON.stringify(r.nicknameFore)} -> "${r.nicknameEfter}"`);
    }
  }

  // Verifiering med en ny hämtning.
  const efter = await samla();
  let fel = 0;
  for (let i = 0; i < efter.length; i++) {
    const e = efter[i];
    const f = rader[i];
    const ok = e.produktFore === e.produktEfter && e.nicknameFore === e.nicknameEfter && e.belopp === f.belopp;
    if (!ok) fel++;
    console.log(
      `${ok ? 'OK ' : 'FEL'} ${e.plan.padEnd(12)} ${e.prisId}  produkt "${e.produktFore}", nickname "${e.nicknameFore}", ${e.belopp}`
    );
  }
  if (fel) {
    console.error(`\n${fel} paket stämmer inte efter bytet.`);
    process.exit(1);
  }
  console.log('\nVerifierat: alla namn och nicknames stämmer, beloppen oförändrade.');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
