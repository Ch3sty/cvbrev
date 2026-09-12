/**
 * Veckorapport för saas-lead: signups, aktivering, trial, betalande, uppsägningar
 * (Supabase), intäkt (Stripe), organiska klick och positioner (Search Console)
 * och tratten artikel till registrering (PostHog). Jämför mot målen i
 * docs/plan-konvertering.md och docs/plan-inloggat-omdesign.md.
 *
 * Kör: npx tsx scripts/veckorapport.ts [--dagar 7]
 * Skriver till stdout. saas-lead sparar sedan sin analys i docs/rapporter/.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { google } from 'googleapis';
import { hogql } from './posthog-query';

config({ path: '.env.local' });

const DAYS = Number(process.argv[process.argv.indexOf('--dagar') + 1]) || 7;

const MAL = {
  registreringTillSession: 90,
  cvForstaBesoket: 65,
  aterkommerDag2: 45,
  nyaBetalandePerManad: 3,
};

function pct(n: number, d: number): string {
  return d === 0 ? '0 %' : `${Math.round((n / d) * 100)} %`;
}

function rad(label: string, value: string, mal?: string) {
  console.log(`${label.padEnd(44)} ${value.padStart(10)}${mal ? `   mål ${mal}` : ''}`);
}

async function supabaseDel() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase-nycklar saknas');
  const sb = createClient(url, key);
  const since = new Date(Date.now() - DAYS * 86400000).toISOString();

  const { data: nya } = await sb
    .from('profiles')
    .select('id, created_at, last_active, email_verified_at, first_cv_uploaded_at, first_letter_created_at, premium_source, subscription_status, subscription_tier')
    .gte('created_at', since);
  const konton = nya ?? [];
  const n = konton.length;

  const medCv = konton.filter((k) => k.first_cv_uploaded_at).length;
  const medBrev = konton.filter((k) => k.first_letter_created_at).length;
  const aterkom = konton.filter(
    (k) => k.last_active && new Date(k.last_active).getTime() > new Date(k.created_at).getTime() + 86400000
  ).length;
  const trial = konton.filter((k) => ['signup_trial', 'oauth_signup_trial'].includes(k.premium_source ?? '')).length;

  const { count: betalande } = await sb
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_status', 'active');
  const { count: trialing } = await sb
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_status', 'trialing');
  const { data: grants } = await sb.from('premium_grants').select('days, granted_at').gte('granted_at', since);
  const { data: cancels } = await sb.from('cancel_intents').select('reason, offer_accepted, completed_cancel').gte('created_at', since);
  const { data: mail } = await sb.from('email_log').select('email_type').gte('sent_at', since);

  const mailPerTyp: Record<string, number> = {};
  for (const m of mail ?? []) mailPerTyp[m.email_type] = (mailPerTyp[m.email_type] ?? 0) + 1;

  console.log(`\n== Produkt (Supabase), senaste ${DAYS} dagar ==`);
  rad('Nya konton', String(n));
  rad('Fick reverse trial', pct(trial, n));
  rad('CV uppladdat eller byggt', pct(medCv, n), `${MAL.cvForstaBesoket} %`);
  rad('Skapade brev', pct(medBrev, n));
  rad('Återkom dag 2 eller senare', pct(aterkom, n), `${MAL.aterkommerDag2} %`);
  rad('Engångsköp (dagspass/vecka)', String(grants?.length ?? 0));
  rad('Betalande prenumerationer just nu', String(betalande ?? 0));
  rad('Kortkrävande trial pågår', String(trialing ?? 0));
  rad('Uppsägningsflöden startade', String(cancels?.length ?? 0));
  if (cancels?.length) {
    const orsaker: Record<string, number> = {};
    for (const c of cancels) orsaker[c.reason] = (orsaker[c.reason] ?? 0) + 1;
    rad('  varav orsaker', Object.entries(orsaker).map(([k, v]) => `${k} ${v}`).join(', '));
    rad('  accepterade erbjudande', String(cancels.filter((c) => c.offer_accepted).length));
  }
  rad('Mail skickade', String(mail?.length ?? 0));
  for (const [typ, antal] of Object.entries(mailPerTyp).sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    rad(`  ${typ}`, String(antal));
  }
}

async function stripeDel() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.log('\n== Stripe: STRIPE_SECRET_KEY saknas ==');
    return;
  }
  const stripe = new Stripe(key);
  const since = Math.floor((Date.now() - DAYS * 86400000) / 1000);
  const charges = await stripe.charges.list({ created: { gte: since }, limit: 100 });
  const ok = charges.data.filter((c) => c.paid && !c.refunded);
  const summa = ok.reduce((s, c) => s + c.amount, 0) / 100;
  const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
  const mrr = subs.data.reduce((s, sub) => {
    const item = sub.items.data[0];
    const amount = (item?.price?.unit_amount ?? 0) / 100;
    const months = item?.price?.recurring?.interval === 'month' ? item.price.recurring.interval_count ?? 1 : 12;
    return s + amount / months;
  }, 0);

  console.log(`\n== Intäkt (Stripe), senaste ${DAYS} dagar ==`);
  rad('Betalningar', String(ok.length));
  rad('Summa', `${summa.toFixed(0)} kr`);
  rad('Aktiva prenumerationer', String(subs.data.length));
  rad('MRR (normaliserat per månad)', `${mrr.toFixed(0)} kr`);
}

async function gscDel() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!raw || !siteUrl) {
    console.log('\n== Search Console: nycklar saknas ==');
    return;
  }
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth });
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (DAYS - 1));
  const prevEnd = new Date(start);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (DAYS - 1));

  const q = async (s: Date, e: Date, dims: string[], limit: number) =>
    (
      await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate: fmt(s), endDate: fmt(e), dimensions: dims, rowLimit: limit },
      })
    ).data.rows ?? [];

  const [tot, prevTot, pages] = await Promise.all([
    q(start, end, [], 1),
    q(prevStart, prevEnd, [], 1),
    q(start, end, ['page'], 20),
  ]);
  const klick = tot[0]?.clicks ?? 0;
  const prevKlick = prevTot[0]?.clicks ?? 0;

  console.log(`\n== Organiskt (Search Console), ${fmt(start)} till ${fmt(end)} ==`);
  rad('Klick', String(klick), `föregående period ${prevKlick}`);
  rad('Visningar', String(tot[0]?.impressions ?? 0));
  rad('Snittposition', (tot[0]?.position ?? 0).toFixed(1));
  console.log('Topp 20 sidor (klick, position):');
  for (const r of pages) {
    const page = String(r.keys?.[0] ?? '').replace('https://www.jobbcoach.ai', '');
    console.log(`  ${String(r.clicks ?? 0).padStart(4)}  ${(r.position ?? 0).toFixed(1).padStart(5)}  ${page}`);
  }
}

async function posthogDel() {
  if (!process.env.POSTHOG_PERSONAL_API_KEY) {
    console.log('\n== PostHog: nyckel saknas ==');
    return;
  }
  const events = [
    'article_viewed',
    'article_cta_shown',
    'article_cta_clicked',
    'example_viewed',
    'example_cta_clicked',
    'sample_started',
    'sample_completed',
    'signup_gate_shown',
    'signup_started',
    'signup_completed',
    'pricing_viewed',
    'trial_started',
    'subscription_paid',
  ];
  const { results } = await hogql(
    `select event, count() as n, count(distinct person_id) as p from events where timestamp > now() - interval ${DAYS} day and event in (${events
      .map((e) => `'${e}'`)
      .join(',')}) group by event order by n desc`
  );
  const map: Record<string, [number, number]> = {};
  for (const r of results as [string, number, number][]) map[r[0]] = [r[1], r[2]];

  console.log(`\n== Tratt (PostHog), senaste ${DAYS} dagar (händelser / personer) ==`);
  for (const e of events) {
    const [n, p] = map[e] ?? [0, 0];
    rad(e, `${n} / ${p}`);
  }
  const shown = map['signup_gate_shown']?.[1] ?? 0;
  const done = map['signup_completed']?.[1] ?? 0;
  rad('Blur-gate till registrering', pct(done, shown), 'över 15 %');
}

async function main() {
  console.log(`VECKORAPPORT jobbcoach.ai, genererad ${new Date().toISOString().slice(0, 16).replace('T', ' ')} (${DAYS} dagar)`);
  for (const del of [supabaseDel, stripeDel, gscDel, posthogDel]) {
    try {
      await del();
    } catch (err) {
      console.log(`\n(${del.name} misslyckades: ${err instanceof Error ? err.message : String(err)})`);
    }
  }
  console.log('\nMål: registrering till session 90 %, CV första besöket 65 %, dag 2-retention 45 %, 3 till 5 nya betalande per månad.');
}

main();
