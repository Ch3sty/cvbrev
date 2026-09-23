/**
 * Kopliggaren: en rad per betalning (spec-admin-tydlighet punkt 1 och 2).
 *
 * Agaren 2026-09-22: "Det framgar ingenstans att nagon kopt ett dagspass."
 * Svaret ar en liggare med datum, paket, konto, ny eller fornyelse, engangs
 * eller lopande och belopp, dar varje dagspass syns samma dag.
 *
 * Kallan ar Stripe (debiteringar och aterbetalningar). Det ar ett externt
 * anrop, sa det gors aldrig i kritiska vagen: sidorna laser liggaren i en
 * Suspense-grans och den cachas 15 minuter med adminens tagg, sa att "Hamta
 * nu" rensar den ocksa.
 *
 * Undantagna konton (agarens och testkontonas) star kvar i listan men marks
 * "internt" och raknas aldrig i summorna. Syns de inte alls gar det inte att
 * forsta varfor Stripe och adminen skiljer sig.
 */

import { unstable_cache } from 'next/cache';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_METRICS_TAG, ADMIN_CACHE_SEKUNDER, hamtaUndantagCachad } from './metrics';
import { PAKET_ORDNING, paketFranPrisId, kundId, type PaketNyckel } from './collect';
import { byggUndantag, type Undantag } from './undantag';

export type KopTyp = 'engangs' | 'lopande';

export interface KopRad {
  /** Stripe-id for debiteringen eller aterbetalningen. */
  id: string;
  /** ISO-tid. */
  tid: string;
  paket: PaketNyckel | null;
  /** Paketnamnet i bestamd form, eller "Okant paket". */
  paketNamn: string;
  /** Belopp i ore. Negativt for en aterbetalning. */
  beloppOre: number;
  typ: KopTyp;
  /** Kundens forsta lyckade betalning. Fornyelser och upprepade kop ar false. */
  ny: boolean;
  aterbetalning: boolean;
  userId: string | null;
  email: string | null;
  /** Betalsatt, till exempel "Kort" eller "Klarna". */
  betalsatt: string | null;
  /** Undantaget konto: syns men raknas inte. */
  internt: boolean;
}

export interface KopLiggare {
  /** Nyast forst. */
  rader: KopRad[];
  fonsterDagar: number;
  /** Summor utan interna rader. */
  summa: {
    totaltOre: number;
    lopandeOre: number;
    engangsOre: number;
    antalLopande: number;
    antalEngangs: number;
    nyaBetalande: number;
    aterbetaltOre: number;
  };
  /** Interna rader i fonstret, for texten "N interna kop undantagna". */
  interna: number;
  /** Startade men inte betalda kassor senaste dygnet, utan interna. */
  oppnaKassorIdag: number;
  hamtad: string;
  /** Null nar allt gick bra, annars varfor liggaren ar tom. */
  fel: string | null;
}

const BETALSATT: Record<string, string> = {
  card: 'Kort',
  klarna: 'Klarna',
  swish: 'Swish',
  link: 'Link',
  paypal: 'PayPal',
};

export function paketNamn(paket: PaketNyckel | null): string {
  if (!paket) return 'Okänt paket';
  // Namnen i PAKET_ORDNING kommer ur PLANS (paketMedLangd).
  return PAKET_ORDNING.find((p) => p.nyckel === paket)?.namn ?? paket;
}

/** Paket ur checkout-metadata (planKey eller plan). */
function paketFranMetadata(meta: Record<string, string> | null | undefined): PaketNyckel | null {
  const v = meta?.planKey || meta?.plan;
  if (!v) return null;
  return PAKET_ORDNING.some((p) => p.nyckel === v) ? (v as PaketNyckel) : null;
}

/**
 * En debitering som liggarrad. Ren funktion, exporterad for testet.
 *
 * tidigareBetalning: sant nar kunden har en lyckad debitering fore den har.
 */
export function byggKopRad(
  c: Pick<
    Stripe.Charge,
    'id' | 'created' | 'amount' | 'metadata' | 'customer' | 'payment_method_details'
  > & { invoice?: string | Stripe.Invoice | null },
  tidigareBetalning: boolean,
  profilPerKund: Map<string, { id: string; email: string | null }>,
  u: Undantag
): KopRad {
  const inv = c.invoice && typeof c.invoice === 'object' ? (c.invoice as Stripe.Invoice) : null;
  const lopande = Boolean(c.invoice);
  const prisId = inv?.lines?.data?.[0]?.price?.id ?? null;
  const paket = paketFranMetadata(c.metadata) ?? paketFranPrisId(prisId);
  const kund = kundId(c.customer as string | { id: string } | null);
  const profil = kund ? profilPerKund.get(kund) : undefined;
  const userId = profil?.id ?? c.metadata?.userId ?? c.metadata?.supabaseUUID ?? null;

  // Ny = kundens forsta betalning. En faktura med billing_reason
  // subscription_cycle ar alltid en fornyelse, aven om historiken skulle
  // saknas i Stripe.
  const cykel = inv?.billing_reason === 'subscription_cycle';
  const ny = !cykel && !tidigareBetalning;

  const typ = c.payment_method_details?.type ?? null;

  return {
    id: c.id,
    tid: new Date(c.created * 1000).toISOString(),
    paket,
    paketNamn: paketNamn(paket),
    beloppOre: c.amount,
    typ: lopande ? 'lopande' : 'engangs',
    ny,
    aterbetalning: false,
    userId,
    email: profil?.email ?? null,
    betalsatt: typ ? (BETALSATT[typ] ?? typ) : null,
    internt: Boolean((kund && u.stripeKunder.has(kund)) || u.har(userId)),
  };
}

/** Summorna ur raderna, utan interna. Ren funktion, exporterad for testet. */
export function summera(rader: KopRad[]): KopLiggare['summa'] {
  const s: KopLiggare['summa'] = {
    totaltOre: 0,
    lopandeOre: 0,
    engangsOre: 0,
    antalLopande: 0,
    antalEngangs: 0,
    nyaBetalande: 0,
    aterbetaltOre: 0,
  };
  for (const r of rader) {
    if (r.internt) continue;
    s.totaltOre += r.beloppOre;
    if (r.aterbetalning) {
      s.aterbetaltOre += -r.beloppOre;
      continue;
    }
    if (r.typ === 'lopande') {
      s.lopandeOre += r.beloppOre;
      s.antalLopande += 1;
    } else {
      s.engangsOre += r.beloppOre;
      s.antalEngangs += 1;
    }
    if (r.ny) s.nyaBetalande += 1;
  }
  return s;
}

async function lasLiggare(fonsterDagar: number, undantagKonton: Undantag['konton']): Promise<KopLiggare> {
  const hamtad = new Date().toISOString();
  const tom: KopLiggare = {
    rader: [],
    fonsterDagar,
    summa: summera([]),
    interna: 0,
    oppnaKassorIdag: 0,
    hamtad,
    fel: null,
  };

  const nyckel = process.env.STRIPE_SECRET_KEY;
  if (!nyckel) return { ...tom, fel: 'Stripe-nyckeln saknas på servern.' };

  const u = byggUndantag(undantagKonton);

  try {
    const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
    const fran = Math.floor(Date.now() / 1000) - fonsterDagar * 86400;

    const lyckade: Stripe.Charge[] = [];
    for await (const c of stripe.charges.list({
      created: { gte: fran },
      limit: 100,
      expand: ['data.invoice'],
    })) {
      if (c.paid && c.status === 'succeeded') lyckade.push(c);
    }

    // Kontot per Stripe-kund, i en fraga.
    const kunder = [
      ...new Set(
        lyckade
          .map((c) => kundId(c.customer as string | { id: string } | null))
          .filter((k): k is string => Boolean(k))
      ),
    ];
    const profilPerKund = new Map<string, { id: string; email: string | null }>();
    if (kunder.length) {
      const admin = getSupabaseAdmin() as any;
      const { data } = await admin
        .from('profiles')
        .select('id, email, stripe_customer_id')
        .in('stripe_customer_id', kunder);
      for (const p of (data ?? []) as Array<{ id: string; email: string | null; stripe_customer_id: string }>) {
        profilPerKund.set(p.stripe_customer_id, { id: p.id, email: p.email });
      }
    }

    // Tidigare betalning per debitering: sortera aldst forst och fraga
    // Stripe en gang per kund om historiken fore fonstret.
    const sorterade = [...lyckade].sort((a, b) => a.created - b.created);
    const sedd = new Set<string>();
    const rader: KopRad[] = [];
    for (const c of sorterade) {
      const kund = kundId(c.customer as string | { id: string } | null);
      let tidigare = false;
      if (kund) {
        if (sedd.has(kund)) {
          tidigare = true;
        } else {
          const fore = await stripe.charges.list({
            customer: kund,
            created: { lt: c.created },
            limit: 20,
          });
          tidigare = fore.data.some((x) => x.paid && x.status === 'succeeded');
          sedd.add(kund);
        }
      }
      rader.push(byggKopRad(c, tidigare, profilPerKund, u));
    }

    // Aterbetalningar som egna minusrader.
    const perCharge = new Map(rader.map((r) => [r.id, r]));
    for await (const r of stripe.refunds.list({ created: { gte: fran }, limit: 100 })) {
      if (r.status !== 'succeeded') continue;
      const chargeId = typeof r.charge === 'string' ? r.charge : r.charge?.id;
      const kop = chargeId ? perCharge.get(chargeId) : undefined;
      rader.push({
        id: r.id,
        tid: new Date(r.created * 1000).toISOString(),
        paket: kop?.paket ?? null,
        paketNamn: kop?.paketNamn ?? 'Återbetalning',
        beloppOre: -r.amount,
        typ: kop?.typ ?? 'engangs',
        ny: false,
        aterbetalning: true,
        userId: kop?.userId ?? null,
        email: kop?.email ?? null,
        betalsatt: kop?.betalsatt ?? null,
        internt: kop?.internt ?? false,
      });
    }

    rader.sort((a, b) => b.tid.localeCompare(a.tid));

    // Startade men inte betalda kassor senaste dygnet.
    let oppnaKassorIdag = 0;
    const dygn = Math.floor(Date.now() / 1000) - 86400;
    for await (const s of stripe.checkout.sessions.list({ created: { gte: dygn }, limit: 100 })) {
      if (s.status !== 'open') continue;
      const kund = kundId(s.customer as string | { id: string } | null);
      if ((kund && u.stripeKunder.has(kund)) || u.har(s.metadata?.userId ?? null)) continue;
      oppnaKassorIdag += 1;
    }

    return {
      rader,
      fonsterDagar,
      summa: summera(rader),
      interna: rader.filter((r) => r.internt).length,
      oppnaKassorIdag,
      hamtad,
      fel: null,
    };
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    console.error('[admin/kop] Stripe svarade inte:', m);
    return { ...tom, fel: `Stripe svarade inte: ${m.slice(0, 160)}` };
  }
}

const lasLiggareCachad = unstable_cache(
  async (fonsterDagar: number, konton: Undantag['konton']) => lasLiggare(fonsterDagar, konton),
  ['admin-kop-liggare'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/** Liggaren for de senaste dagarna, cachad 15 minuter. */
export async function hamtaKopLiggare(fonsterDagar = 30): Promise<KopLiggare> {
  const u = await hamtaUndantagCachad();
  return lasLiggareCachad(fonsterDagar, u.konton);
}
