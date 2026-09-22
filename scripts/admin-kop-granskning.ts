/**
 * Läser (aldrig skriver) Stripe: debiteringar senaste 30 dagarna och
 * prenumerationer per pris. Underlag för docs/design/spec-admin-tydlighet.
 *   npx tsx scripts/admin-kop-granskning.ts
 */
import Stripe from 'stripe';
import { laddaEnv } from './_env';
laddaEnv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
async function main() {
  const since = Math.floor(Date.now() / 1000) - 30 * 86400;
  const charges: Stripe.Charge[] = [];
  for await (const c of stripe.charges.list({ created: { gte: since }, limit: 100, expand: ['data.customer'] })) charges.push(c);
  console.log('LIVEMODE', charges[0]?.livemode);
  console.log('--- CHARGES 30d', charges.length);
  for (const c of charges) {
    const cust = c.customer as Stripe.Customer | null;
    console.log(JSON.stringify({
      tid: new Date(c.created * 1000).toISOString(), belopp: c.amount / 100, aterbetalt: (c.amount_refunded ?? 0) / 100,
      status: c.status, paid: c.paid, invoice: c.invoice ? 'ja' : null, kund: cust && typeof cust === 'object' ? (cust as Stripe.Customer).email : c.billing_details?.email,
      beskr: c.description, meta: c.metadata, pi: c.payment_intent,
    }));
  }
  console.log('--- SUBSCRIPTIONS (alla status)');
  const perPris: Record<string, Record<string, number>> = {};
  for await (const s of stripe.subscriptions.list({ status: 'all', limit: 100, expand: ['data.customer'] })) {
    const item = s.items.data[0];
    const pid = item?.price?.id ?? '?';
    const key = `${pid} ${item?.price?.unit_amount! / 100} kr/${item?.price?.recurring?.interval}x${item?.price?.recurring?.interval_count} ${item?.price?.nickname ?? ''}`;
    perPris[key] ??= {};
    perPris[key][s.status] = (perPris[key][s.status] ?? 0) + 1;
    if (['active', 'trialing', 'past_due'].includes(s.status) || s.created > since) {
      const cust = s.customer as Stripe.Customer;
      console.log(JSON.stringify({ status: s.status, skapad: new Date(s.created * 1000).toISOString(), kund: cust?.email, pris: key, cancel_at_period_end: s.cancel_at_period_end, canceled_at: s.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null }));
    }
  }
  console.log('--- PER PRIS');
  for (const [k, v] of Object.entries(perPris)) console.log(k, JSON.stringify(v));
  console.log('--- CHECKOUT SESSIONS 30d (payment mode)');
  for await (const cs of stripe.checkout.sessions.list({ created: { gte: since }, limit: 100 })) {
    if (cs.mode === 'payment' || cs.payment_status === 'paid')
      console.log(JSON.stringify({ tid: new Date(cs.created * 1000).toISOString(), mode: cs.mode, status: cs.status, pay: cs.payment_status, belopp: (cs.amount_total ?? 0) / 100, email: cs.customer_details?.email, meta: cs.metadata }));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
