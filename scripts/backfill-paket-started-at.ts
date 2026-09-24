/**
 * Fyller profiles.paket_started_at bakåt för kunder som betalade innan
 * webhooken läste basil-fakturorna rätt (docs/qa/qa-kop-testlage-2026-09-24.md,
 * bugg 1). Live-endpointen har stått på 2025-08-27.basil sedan den skapades,
 * så kolumnen skrevs aldrig för en prenumeration.
 *
 *   npx tsx scripts/backfill-paket-started-at.ts --dry-run
 *   npx tsx scripts/backfill-paket-started-at.ts
 *   npx tsx scripts/backfill-paket-started-at.ts --dagar 120   (avslutade, standard 90)
 *
 * Vad skriptet gör:
 *
 * 1. Listar prenumerationerna i Stripe med STRIPE_SECRET_KEY ur .env.local
 *    (live, bara läsning): de levande (active, trialing, past_due, unpaid)
 *    och de som avslutats de senaste --dagar dagarna.
 * 2. Tar den första betalda fakturan per prenumeration. Datumet är
 *    status_transitions.paid_at, annars fakturans created. Fakturan
 *    kontrolleras mot prenumerationen med invoiceSubscriptionId, som läser
 *    både det gamla fältet och basils parent.subscription_details.
 * 3. Matchar mot profiles på subscription_id först, sedan stripe_customer_id.
 *    Har en profil flera prenumerationer vinner den som står i
 *    profiles.subscription_id, annars den senast skapade.
 * 4. Skriver paket_started_at bara där kolumnen är null, med villkoret i
 *    själva UPDATE-satsen. Ingen annan kolumn rörs.
 *
 * Supabase nås via Management API med SUPABASE_TOKEN_JOBBCOACH, mot
 * Jobbcoach-projektet och inget annat. SUPABASE_TOKEN_BEGONE läses aldrig.
 * E-post skrivs ut maskerad, nycklar aldrig.
 */

import Stripe from 'stripe';
import { laddaEnv } from './_env';

laddaEnv();

const PROJEKT = 'dbvbnbkvadvlhjhomibg';
const LEVANDE = new Set(['active', 'trialing', 'past_due', 'unpaid']);

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const dagarIdx = args.indexOf('--dagar');
const DAGAR = dagarIdx >= 0 ? Number(args[dagarIdx + 1]) || 90 : 90;

function krav(namn: string): string {
  const v = process.env[namn];
  if (!v) throw new Error(`Saknar ${namn}`);
  return v;
}

async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJEKT}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${krav('SUPABASE_TOKEN_JOBBCOACH')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T[];
}

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function maskaEpost(epost: string | null | undefined): string {
  if (!epost) return '(saknas)';
  const [namn, doman] = epost.split('@');
  if (!doman) return '***';
  const d = doman.split('.');
  const tld = d.pop();
  return `${namn.slice(0, 2)}***@${(d.join('.') || '').slice(0, 1)}***.${tld}`;
}

interface Kandidat {
  sub: Stripe.Subscription;
  kund: string;
  forstaBetald: Date | null;
  fakturaId: string | null;
}

async function main() {
  // Guard: bara Jobbcoach-projektet.
  const url = krav('NEXT_PUBLIC_SUPABASE_URL');
  if (!url.includes(PROJEKT)) throw new Error('NEXT_PUBLIC_SUPABASE_URL pekar inte på Jobbcoach-projektet');

  const nyckel = krav('STRIPE_SECRET_KEY');
  const lage = nyckel.startsWith('sk_live_') || nyckel.startsWith('rk_live_') ? 'live' : 'test';
  console.log(`Stripe: ${lage}. Supabase: ${PROJEKT}. ${DRY ? 'TORRKÖRNING, inget skrivs.' : 'SKARP KÖRNING.'}`);

  const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
  const { priceIdToPlanKey } = await import('../src/lib/stripe/planPrices');
  const { invoiceSubscriptionId } = await import('../src/lib/stripe/invoiceFields');

  const grans = Math.floor(Date.now() / 1000) - DAGAR * 86400;
  const kandidater: Kandidat[] = [];

  for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100 })) {
    const levande = LEVANDE.has(sub.status);
    const nyssAvslutad = sub.status === 'canceled' && (sub.ended_at ?? sub.canceled_at ?? 0) >= grans;
    if (!levande && !nyssAvslutad) continue;

    const kund = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const fakturor: Stripe.Invoice[] = [];
    for await (const f of stripe.invoices.list({ subscription: sub.id, status: 'paid', limit: 100 })) {
      if (invoiceSubscriptionId(f) === sub.id) fakturor.push(f);
    }
    const betaltVid = (f: Stripe.Invoice) => f.status_transitions?.paid_at ?? f.created;
    fakturor.sort((a, b) => betaltVid(a) - betaltVid(b));
    const forsta = fakturor[0] ?? null;
    kandidater.push({
      sub,
      kund,
      forstaBetald: forsta ? new Date(betaltVid(forsta) * 1000) : null,
      fakturaId: forsta?.id ?? null,
    });
  }

  console.log(`Prenumerationer: ${kandidater.length} (levande och avslutade de senaste ${DAGAR} dagarna).`);
  if (!kandidater.length) return;

  const subIds = kandidater.map((k) => lit(k.sub.id)).join(',');
  const kundIds = [...new Set(kandidater.map((k) => k.kund))].map(lit).join(',');
  const profiler = await sql<{
    id: string;
    email: string | null;
    stripe_customer_id: string | null;
    subscription_id: string | null;
    paket_started_at: string | null;
  }>(
    `select id, email, stripe_customer_id, subscription_id, paket_started_at from profiles
     where subscription_id in (${subIds}) or stripe_customer_id in (${kundIds})`
  );

  // En rad per profil: den prenumeration som står på profilen, annars den senaste.
  type Rad = { profil: (typeof profiler)[number]; k: Kandidat; atgard: string };
  const rader: Rad[] = [];
  const utanProfil: Kandidat[] = [];
  const perProfil = new Map<string, Kandidat[]>();
  for (const k of kandidater) {
    const p =
      profiler.find((x) => x.subscription_id === k.sub.id) ??
      profiler.find((x) => x.stripe_customer_id === k.kund);
    if (!p) {
      utanProfil.push(k);
      continue;
    }
    perProfil.set(p.id, [...(perProfil.get(p.id) ?? []), k]);
  }
  for (const [id, lista] of perProfil) {
    const profil = profiler.find((x) => x.id === id)!;
    const k =
      lista.find((x) => x.sub.id === profil.subscription_id) ??
      [...lista].sort((a, b) => b.sub.created - a.sub.created)[0];
    const atgard = profil.paket_started_at
      ? 'redan satt, rörs inte'
      : k.forstaBetald
        ? 'skrivs'
        : 'ingen betald faktura, hoppas över';
    rader.push({ profil, k, atgard });
  }

  const tabell = rader.map(({ profil, k, atgard }) => ({
    epost: maskaEpost(profil.email),
    kund: k.kund,
    prenumeration: k.sub.id,
    status: k.sub.status,
    planKey: priceIdToPlanKey(k.sub.items.data[0]?.price?.id ?? null) ?? '(okänt pris)',
    datum: k.forstaBetald ? k.forstaBetald.toISOString() : '-',
    atgard,
  }));
  console.table(tabell);
  if (utanProfil.length) {
    console.log(`Utan matchande profil (${utanProfil.length}):`);
    console.table(utanProfil.map((k) => ({ kund: k.kund, prenumeration: k.sub.id, status: k.sub.status })));
  }

  const attSkriva = rader.filter((r) => r.atgard === 'skrivs');
  console.log(`Att skriva: ${attSkriva.length} profiler.`);
  if (DRY || !attSkriva.length) return;

  let skrivna = 0;
  for (const r of attSkriva) {
    const ut = await sql<{ id: string }>(
      `update profiles set paket_started_at = ${lit(r.k.forstaBetald!.toISOString())}
       where id = ${lit(r.profil.id)} and paket_started_at is null returning id`
    );
    skrivna += ut.length;
  }
  console.log(`Skrivna: ${skrivna}.`);

  // Ny läsning som kontroll.
  const ids = attSkriva.map((r) => lit(r.profil.id)).join(',');
  const kontroll = await sql<{ id: string; paket_started_at: string | null }>(
    `select id, paket_started_at from profiles where id in (${ids})`
  );
  const fel = attSkriva.filter((r) => {
    const rad = kontroll.find((x) => x.id === r.profil.id);
    return !rad?.paket_started_at || new Date(rad.paket_started_at).getTime() !== r.k.forstaBetald!.getTime();
  });
  console.log(`Kontrolläsning: ${kontroll.length - fel.length} av ${attSkriva.length} stämmer.`);
  if (fel.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
