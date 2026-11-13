// src/lib/mobilapp/kopRevenuecat.ts
// Köp i appen via Google Play (docs/plan-app.md, avsnitt 2.6). RevenueCat
// skickar händelserna till /api/app/revenuecat; här bestäms vad varje händelse
// gör med premium_grants och profilen.
//
// Samma mönster som engångsköpen (lib/stripe/grantPremiumDays.ts):
// 1. Idempotent. Varje händelse som ger Premium skriver en rad i
//    premium_grants med RevenueCats event-id i stripe_event_id (unik
//    kolumn, prefixet revenuecat:), så en omsänd händelse ger aldrig en
//    andra rad.
// 2. Raden bär scope 'allt' (samma som all_month, det enda som säljs) och
//    sin egen sluttid i premium_until_after. premiumAccess.ts läser den som
//    vilken giltig grants-rad som helst; den koden ändras inte.
// 3. Profilen får subscription_tier 'premium' och premium_until som för
//    engångsköpen, så att webbens vyer som läser profilen visar Premium.
//    premium_source skrivs bara om kontot saknar levande Stripe-prenumeration
//    och inte har admin-premium, och premium_until förkortas aldrig av ett köp.
// 4. Händelser som avslutar (EXPIRATION, en återbetald CANCELLATION,
//    BILLING_ISSUE utan respitperiod) kortar butikens egna rader till
//    händelsens sluttid. Rader som skrevs efter händelsen rörs inte, så en
//    sent levererad EXPIRATION kapar aldrig en nyare förnyelse.

import { PLAN_BY_KEY, SALD_PLAN, type PlanScope } from '@/lib/plans/plans';

export const REVENUECAT_PREFIX = 'revenuecat:';

/** Händelsetyperna vi hanterar. Övriga (TEST, TRANSFER, ...) kvitteras utan åtgärd. */
export type RcTyp =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'PRODUCT_CHANGE'
  | 'UNCANCELLATION'
  | 'SUBSCRIPTION_EXTENDED'
  | 'CANCELLATION'
  | 'EXPIRATION'
  | 'BILLING_ISSUE';

export interface RcHandelse {
  id: string;
  type: string;
  app_user_id?: string | null;
  original_app_user_id?: string | null;
  aliases?: string[] | null;
  product_id?: string | null;
  store?: string | null;
  environment?: string | null;
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number | null;
  cancel_reason?: string | null;
}

/** Källan på raden: Google Play, App Store; sandlådan särskiljs för statistiken. */
export function kallaForHandelse(e: Pick<RcHandelse, 'store' | 'environment'>): string {
  const bas = e.store === 'APP_STORE' || e.store === 'MAC_APP_STORE' ? 'app_store' : e.store === 'PROMOTIONAL' ? 'revenuecat_promo' : 'play';
  return e.environment === 'SANDBOX' ? `${bas}_sandbox` : bas;
}

/** Alla källor appköpen skriver, för att hitta butikens egna rader. */
export const APP_KALLOR = ['play', 'play_sandbox', 'app_store', 'app_store_sandbox', 'revenuecat_promo', 'revenuecat_promo_sandbox'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Supabase-användarens id. Appen konfigurerar RevenueCat med det som
 * appUserID; ett anonymt RevenueCat-id ($RCAnonymousID:...) ger null, men
 * ett alias med användarens id räcker.
 */
export function anvandareForHandelse(e: RcHandelse): string | null {
  const kandidater = [e.app_user_id, e.original_app_user_id, ...(e.aliases ?? [])];
  for (const k of kandidater) if (typeof k === 'string' && UUID.test(k)) return k.toLowerCase();
  return null;
}

/** Behörigheten ett appköp ger: samma som paketet som säljs på webben. */
export const APP_SCOPE: PlanScope = PLAN_BY_KEY[SALD_PLAN].scope;

const DAG_MS = 24 * 60 * 60 * 1000;

/** Det webhooken behöver av databasen. Rutten ger Supabase, testerna en minnesvariant. */
export interface KopLager {
  /** false när raden redan fanns (samma event-id). */
  skrivGrant(rad: { user_id: string; stripe_event_id: string; days: number; source: string; scope: PlanScope; premium_until_after: string }): Promise<boolean>;
  /** Butikens rader som fortfarande gäller efter tidpunkten. */
  aktivaAppGrants(userId: string, efter: string): Promise<Array<{ id: string; premium_until_after: string | null; granted_at: string }>>;
  sattGrantSlut(id: string, slut: string): Promise<void>;
  hamtaProfil(userId: string): Promise<{ premium_until: string | null; premium_source: string | null; subscription_status: string | null; subscription_tier: string | null } | null>;
  uppdateraProfil(userId: string, andring: Record<string, unknown>): Promise<void>;
}

export type Utfall =
  | { atgard: 'beviljad'; userId: string; till: string }
  | { atgard: 'dubblett'; userId: string }
  | { atgard: 'avslutad'; userId: string; slut: string; rader: number }
  | { atgard: 'ingen'; orsak: string };

function levandeStripe(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}

async function bevilja(lager: KopLager, e: RcHandelse, userId: string, till: Date, nu: Date): Promise<Utfall> {
  const kalla = kallaForHandelse(e);
  const tillIso = till.toISOString();
  const ny = await lager.skrivGrant({
    user_id: userId,
    stripe_event_id: `${REVENUECAT_PREFIX}${e.id}`,
    days: Math.max(1, Math.ceil((till.getTime() - nu.getTime()) / DAG_MS)),
    source: kalla,
    scope: APP_SCOPE,
    premium_until_after: tillIso,
  });
  if (!ny) return { atgard: 'dubblett', userId };

  const profil = await lager.hamtaProfil(userId);
  if (profil) {
    const nuvarande = profil.premium_until ? new Date(profil.premium_until) : null;
    const andring: Record<string, unknown> = { subscription_tier: 'premium' };
    // Ett köp förkortar aldrig en längre premiumtid (provperiod, admin).
    if (!nuvarande || nuvarande < till) {
      andring.premium_until = tillIso;
      if (!levandeStripe(profil.subscription_status) && profil.premium_source !== 'admin') andring.premium_source = kalla;
    }
    await lager.uppdateraProfil(userId, andring);
  }
  return { atgard: 'beviljad', userId, till: tillIso };
}

async function avsluta(lager: KopLager, e: RcHandelse, userId: string, slut: Date, nu: Date): Promise<Utfall> {
  const slutIso = slut.toISOString();
  const handelseTid = e.event_timestamp_ms ? new Date(e.event_timestamp_ms) : nu;
  const rader = await lager.aktivaAppGrants(userId, slutIso);
  let kortade = 0;
  for (const r of rader) {
    // En rad som skrevs efter händelsen hör till en senare period.
    if (new Date(r.granted_at) > handelseTid) continue;
    await lager.sattGrantSlut(r.id, slutIso);
    kortade++;
  }

  const profil = await lager.hamtaProfil(userId);
  // Profilen rörs bara när appköpet är det som står där.
  if (profil && profil.premium_source && APP_KALLOR.includes(profil.premium_source) && !levandeStripe(profil.subscription_status)) {
    const nuvarande = profil.premium_until ? new Date(profil.premium_until) : null;
    const nyaRader = rader.length - kortade;
    if (nyaRader === 0) {
      const andring: Record<string, unknown> = {};
      if (!nuvarande || nuvarande > slut) andring.premium_until = slutIso;
      if (slut <= nu && profil.subscription_tier === 'premium') andring.subscription_tier = 'free';
      if (Object.keys(andring).length) await lager.uppdateraProfil(userId, andring);
    }
  }
  return { atgard: 'avslutad', userId, slut: slutIso, rader: kortade };
}

/** Vad en händelse från RevenueCat gör. nu skickas in för testernas skull. */
export async function hanteraRevenuecat(lager: KopLager, e: RcHandelse, nu: Date = new Date()): Promise<Utfall> {
  if (!e || typeof e.id !== 'string' || !e.id) return { atgard: 'ingen', orsak: 'saknar_id' };
  const userId = anvandareForHandelse(e);
  if (!userId) return { atgard: 'ingen', orsak: 'okand_anvandare' };
  const utgang = typeof e.expiration_at_ms === 'number' ? new Date(e.expiration_at_ms) : null;

  switch (e.type as RcTyp) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
    // Google Play skjuter fram nästa dragning (förlängning från Play Console
    // eller RevenueCat): Premium gäller till den nya sluttiden.
    case 'SUBSCRIPTION_EXTENDED':
      if (!utgang) return { atgard: 'ingen', orsak: 'saknar_utgang' };
      if (utgang <= nu) return { atgard: 'ingen', orsak: 'redan_utgangen' };
      return bevilja(lager, e, userId, utgang, nu);

    case 'CANCELLATION':
      // Uppsägning: Premium gäller periodens slut ut, alltså till
      // expiration_at som raden redan har. En återbetalning har en tidigare
      // sluttid och kortar raderna dit.
      if (!utgang) return { atgard: 'ingen', orsak: 'saknar_utgang' };
      return avsluta(lager, e, userId, utgang, nu);

    case 'EXPIRATION':
      return avsluta(lager, e, userId, utgang && utgang < nu ? utgang : nu, nu);

    case 'BILLING_ISSUE':
      // Med respitperiod ligger expiration_at i framtiden: Premium gäller
      // respiten ut. Utan respit slutar den nu.
      if (utgang && utgang > nu) return bevilja(lager, e, userId, utgang, nu);
      return avsluta(lager, e, userId, nu, nu);

    default:
      return { atgard: 'ingen', orsak: `typ_${e.type}` };
  }
}

/** Authorization-headern mot hemligheten, i konstant tid. Godtar värdet med och utan "Bearer ". */
export function rattNyckel(header: string | null | undefined, hemlighet: string | null | undefined): boolean {
  if (!hemlighet || !header) return false;
  const kandidater = [header, header.replace(/^Bearer\s+/i, '')];
  return kandidater.some((k) => {
    if (k.length !== hemlighet.length) return false;
    let diff = 0;
    for (let i = 0; i < k.length; i++) diff |= k.charCodeAt(i) ^ hemlighet.charCodeAt(i);
    return diff === 0;
  });
}
