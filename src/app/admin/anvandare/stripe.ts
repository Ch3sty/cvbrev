import 'server-only';

/**
 * Stripe-lasningarna for Anvandare: nar en prenumeration startade, och ett
 * kontos kop.
 *
 * Bada ar externa anrop och ligger darfor aldrig i kritiska vagen. Sidorna
 * laser dem i Suspense-granser med reserverad plats, och svaren cachas 15
 * minuter med adminens tagg, sa att "Hamta nu" rensar dem ocksa.
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { ADMIN_METRICS_TAG, ADMIN_CACHE_SEKUNDER } from '@/lib/admin/metrics';
import { byggKopRad, type KopRad } from '@/lib/admin/kop';
import { kundId } from '@/lib/admin/collect';
import { byggUndantag } from '@/lib/admin/undantag';

function stripeKlient(): Stripe | null {
  const nyckel = process.env.STRIPE_SECRET_KEY;
  if (!nyckel) return null;
  return new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
}

/**
 * Startdag per Stripe-kund for alla levande prenumerationer. Ett anrop per
 * status, oftast en handfull rader. Tom karta om Stripe inte svarar: cellen
 * skriver da bara "lopande".
 */
export const hamtaPrenumerationStart = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const stripe = stripeKlient();
    if (!stripe) return {};
    const start: Record<string, string> = {};
    try {
      for (const status of ['active', 'past_due', 'trialing'] as const) {
        for await (const s of stripe.subscriptions.list({ status, limit: 100 })) {
          const kund = kundId(s.customer as string | { id: string } | null);
          if (!kund) continue;
          const iso = new Date((s.start_date ?? s.created) * 1000).toISOString();
          // Flera prenumerationer pa samma kund: den aldsta levande galler.
          if (!start[kund] || iso < start[kund]) start[kund] = iso;
        }
      }
    } catch (fel) {
      console.error('[admin/anvandare] prenumerationsstarter:', fel instanceof Error ? fel.message : fel);
      return {};
    }
    return start;
  },
  ['admin-anvandare-prenumerationsstart'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

export interface KontotsKop {
  /** Nyast forst. Aterbetalningar som egna minusrader. */
  rader: KopRad[];
  /** Null nar allt gick bra. */
  fel: string | null;
}

/**
 * Alla betalningar for en Stripe-kund, som liggarrader.
 *
 * Samma radbyggare som kopliggaren (byggKopRad i kop.ts), sa ett kop ser
 * likadant ut har som pa Intakter. Ny eller fornyelse raknas har mot kundens
 * hela historik, inte mot ett fonster: forsta lyckade debiteringen ar ny,
 * resten ar fornyelser eller upprepade kop.
 */
export const hamtaKontotsKop = unstable_cache(
  async (kund: string, userId: string, email: string | null): Promise<KontotsKop> => {
    const stripe = stripeKlient();
    if (!stripe) return { rader: [], fel: 'Stripe-nyckeln saknas på servern.' };

    try {
      const lyckade: Stripe.Charge[] = [];
      for await (const c of stripe.charges.list({
        customer: kund,
        limit: 100,
        expand: ['data.invoice'],
      })) {
        if (c.paid && c.status === 'succeeded') lyckade.push(c);
      }
      lyckade.sort((a, b) => a.created - b.created);

      const profil = new Map([[kund, { id: userId, email }]]);
      const u = byggUndantag([]);
      const rader: KopRad[] = lyckade.map((c, i) => byggKopRad(c, i > 0, profil, u));

      const perCharge = new Map(rader.map((r) => [r.id, r]));
      for (const c of lyckade) {
        if (!c.amount_refunded) continue;
        const kop = perCharge.get(c.id);
        for await (const r of stripe.refunds.list({ charge: c.id, limit: 100 })) {
          if (r.status !== 'succeeded') continue;
          rader.push({
            id: r.id,
            tid: new Date(r.created * 1000).toISOString(),
            paket: kop?.paket ?? null,
            paketNamn: kop?.paketNamn ?? 'Återbetalning',
            beloppOre: -r.amount,
            typ: kop?.typ ?? 'engangs',
            ny: false,
            aterbetalning: true,
            userId,
            email,
            betalsatt: kop?.betalsatt ?? null,
            internt: false,
          });
        }
      }

      rader.sort((a, b) => b.tid.localeCompare(a.tid));
      return { rader, fel: null };
    } catch (fel) {
      const m = fel instanceof Error ? fel.message : String(fel);
      console.error('[admin/anvandare] kontots kop:', m);
      return { rader: [], fel: `Stripe svarade inte: ${m.slice(0, 160)}` };
    }
  },
  ['admin-anvandare-kontots-kop'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
