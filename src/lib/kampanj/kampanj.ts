/**
 * Tidsstyrda priskampanjer på Jobbcoach Premium (ägarens beslut 2026-11-13,
 * skissen https://claude.ai/artifact/BPXxWJfg5p1T3jGpGZ7JCQ).
 *
 *   Black Week    mån 23 nov 00.00 – sön 29 nov 23.59, 99 kr första månaden
 *   Cyber Monday  mån 30 nov 00.00–23.59, 49 kr första månaden
 *
 * Filen är den enda klockan. Fyra ställen läser den, vart och ett på sitt
 * sätt:
 *
 *   kassan        create-plan-session frågar aktivKampanj(kampanjNu()) och
 *                 lägger på kupongen. Den är facit; allt annat är visning.
 *   inloggat      dashboard-layouten och köpsteget renderas per besök och
 *                 frågar samma funktion på servern.
 *   publika sidor CDN-cachas ett dygn. Båda kampanjernas varianter ligger
 *                 därför dolda i HTML:en och KAMPANJ_SKRIPT väljer variant
 *                 i <head>, före första målningen (data-kampanj på <html>).
 *   mejlen        morgonkörningen skickar på kampanjens första dag.
 *
 * Gränserna står med svensk tidszon. November har ingen sommartid, så
 * +01:00 är rätt för alla fyra tidpunkter. slut är exklusivt.
 *
 * Kupongerna i Stripe har samma id som nyckeln (scripts/stripe-kampanj-
 * kuponger.ts) och redeem_by en timme efter slut, som skyddsnät om koden
 * skulle fela. Kampanjkassan stänger efter 30 minuter, så den som öppnade
 * 23.58 hinner betala det pris hen såg.
 */

import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'

export type KampanjNyckel = 'black-week-2026' | 'cyber-monday-2026'

export interface Kampanj {
  nyckel: KampanjNyckel
  /** Egennamnet, "Black Week". */
  namn: string
  /** Etiketten i versaler på raden och kortet. */
  etikett: string
  /** ISO med tidszon. */
  start: string
  /** ISO med tidszon, exklusivt. */
  slut: string
  /** Första månadens pris i kronor. */
  pris: number
  /** Rabatten i kronor, alltså kupongens amount_off / 100. */
  rabattKr: number
  /** "till söndag 29 november 23.59" */
  giltigTill: string
  /** Färgtemat på raden: svart och koppar, eller Träningens indigo. */
  tema: 'svart' | 'indigo'
  /** Texterna, ur docs/kampanj/copy-black-week-2026.md. */
  copy: {
    bannerText: string
    bannerLank: string
    kortRubrik: string
    kortText: string
    kortKnapp: string
    kortStang: string
    prisKnapp: string
    prisFotnot: string
  }
}

const ORDINARIE = PLAN_BY_KEY[SALD_PLAN].amount

export const KAMPANJER: readonly Kampanj[] = [
  {
    nyckel: 'black-week-2026',
    namn: 'Black Week',
    etikett: 'BLACK WEEK',
    start: '2026-11-23T00:00:00+01:00',
    slut: '2026-11-30T00:00:00+01:00',
    pris: 99,
    rabattKr: ORDINARIE - 99,
    giltigTill: 'till och med söndag 29 november 23.59',
    tema: 'svart',
    copy: {
      bannerText: 'Första månaden Premium för 99 kr, till och med söndag.',
      bannerLank: 'Se erbjudandet',
      kortRubrik: 'Black Week: första månaden Premium för 99 kr',
      kortText: 'Övningsprov med tid och ett pass om dagen fram till provet. Sedan 149 kr i månaden. Till och med söndag.',
      kortKnapp: 'Köp Premium, 99 kr',
      kortStang: 'Nej tack',
      prisKnapp: 'Köp Premium, 99 kr första månaden',
      prisFotnot: 'Gäller till och med söndag 29 november 23.59 för konton som inte haft Premium tidigare.',
    },
  },
  {
    nyckel: 'cyber-monday-2026',
    namn: 'Cyber Monday',
    etikett: 'CYBER MONDAY',
    start: '2026-11-30T00:00:00+01:00',
    slut: '2026-12-01T00:00:00+01:00',
    pris: 49,
    rabattKr: ORDINARIE - 49,
    giltigTill: 'bara måndag 30 november till 23.59',
    tema: 'indigo',
    copy: {
      bannerText: 'Första månaden Premium för 49 kr. Bara i dag till 23.59.',
      bannerLank: 'Se erbjudandet',
      kortRubrik: 'Cyber Monday: första månaden för 49 kr',
      kortText: 'Övningsprov med tid, CV och personliga brev, allt i Premium. Sedan 149 kr i månaden. Bara i dag, till 23.59.',
      kortKnapp: 'Köp Premium, 49 kr',
      kortStang: 'Nej tack',
      prisKnapp: 'Köp Premium, 49 kr första månaden',
      prisFotnot: 'Gäller bara måndag 30 november till 23.59, för konton som inte haft Premium tidigare.',
    },
  },
] as const

export const KAMPANJ_BY_NYCKEL: Record<KampanjNyckel, Kampanj> = Object.fromEntries(
  KAMPANJER.map((k) => [k.nyckel, k])
) as Record<KampanjNyckel, Kampanj>

export function isKampanjNyckel(v: unknown): v is KampanjNyckel {
  return typeof v === 'string' && v in KAMPANJ_BY_NYCKEL
}

export const ORDINARIE_PRIS = ORDINARIE

const ms = (iso: string) => Date.parse(iso)

/** Kampanjen som pågår vid `nu`, annars null. */
export function aktivKampanj(nu: Date = new Date()): Kampanj | null {
  const t = nu.getTime()
  return KAMPANJER.find((k) => t >= ms(k.start) && t < ms(k.slut)) ?? null
}

/** Har någon kampanj kvar att visa? Efter sista slut gör koden ingenting. */
export function kampanjerKvar(nu: Date = new Date()): readonly Kampanj[] {
  const t = nu.getTime()
  return KAMPANJER.filter((k) => t < ms(k.slut))
}

/**
 * Klockan servern ska använda. KAMPANJ_NU (ISO) flyttar den i lokala körningar
 * och förhandsvisningar, så att klicktestet kan stå i varje skifte. I
 * produktion ignoreras variabeln alltid.
 */
export function kampanjNu(): Date {
  const override = process.env.KAMPANJ_NU
  if (override && process.env.VERCEL_ENV !== 'production') {
    const t = Date.parse(override)
    if (!Number.isNaN(t)) return new Date(t)
  }
  return new Date()
}

/** "2026-11-23", svensk kalenderdag. */
export function svenskDag(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Är `nu` kampanjens första kalenderdag i svensk tid? (Mejlens dag.) */
export function arStartdag(k: Kampanj, nu: Date): boolean {
  return svenskDag(nu) === svenskDag(new Date(ms(k.start))) && aktivKampanj(nu)?.nyckel === k.nyckel
}

/* ------------------------------------------------------------ behörighet */

/** Profilfälten som avgör om kontot någonsin betalat. */
export interface BetalProfil {
  subscription_id?: string | null
  subscription_status?: string | null
  paket_started_at?: string | null
  premium_source?: string | null
}

/**
 * Har kontot någonsin betalat? Ägarens beslut: kampanjpriset bara till konton
 * som aldrig haft Premium, så att ingen säger upp och köper igen för
 * rabatten. Gamla gratistrialer (signup_trial, onboarding_completion) var
 * aldrig köp och räknas inte. Dagspasset (onetime_*) är ett köp.
 * Kassan kontrollerar dessutom Stripe (kampanj.server.ts).
 */
export function harBetalat(p: BetalProfil | null | undefined): boolean {
  if (!p) return false
  return Boolean(
    p.subscription_id ||
      p.subscription_status ||
      p.paket_started_at ||
      (typeof p.premium_source === 'string' && p.premium_source.startsWith('onetime'))
  )
}

/* ------------------------------------------------------------ publika sidor */

/**
 * Cookien som säger att kontot inte kan få kampanjpriset (har eller har haft
 * Premium). Skrivs av inloggat läge, läses av KAMPANJ_SKRIPT så att en
 * betalande kund inte ser raden på de CDN-cachade sidorna heller.
 */
export const KAMPANJ_EJ_COOKIE = 'jc_kampanj_ej'

/** Cookien för en stängd kampanjrad i inloggat. Värdet är nyckeln. */
export const KAMPANJ_STANGD_COOKIE = 'jc_kampanj_stangd'

/**
 * Körs i <head> före första målningen. Sätter data-kampanj på <html> när en
 * kampanj pågår enligt besökarens klocka och kontot inte är undantaget.
 * localStorage 'kampanj_nu' flyttar klockan för klicktest; det påverkar
 * bara visningen, aldrig kassan.
 */
export function kampanjSkript(nu: Date = new Date()): string {
  const kvar = kampanjerKvar(nu)
  if (kvar.length === 0) return ''
  const lista = JSON.stringify(kvar.map((k) => [k.nyckel, ms(k.start), ms(k.slut)]))
  return (
    `try{var K=${lista},d=document.documentElement,n=Date.now();` +
    `try{var o=localStorage.getItem('kampanj_nu');if(o){var p=Date.parse(o);if(p)n=p}}catch(e){}` +
    `if(document.cookie.indexOf('${KAMPANJ_EJ_COOKIE}=1')<0){for(var i=0;i<K.length;i++){if(n>=K[i][1]&&n<K[i][2]){d.setAttribute('data-kampanj',K[i][0]);break}}}}catch(e){}`
  )
}

/* ------------------------------------------------------------ visning */

/** Det klienten behöver för att visa en kampanj. Serialiserbart. */
export interface KampanjVisning {
  nyckel: KampanjNyckel
  namn: string
  etikett: string
  pris: number
  rabattKr: number
  giltigTill: string
  tema: Kampanj['tema']
  slutMs: number
  copy: Kampanj['copy']
}

export function visning(k: Kampanj | null): KampanjVisning | null {
  if (!k) return null
  return {
    nyckel: k.nyckel,
    namn: k.namn,
    etikett: k.etikett,
    pris: k.pris,
    rabattKr: k.rabattKr,
    giltigTill: k.giltigTill,
    tema: k.tema,
    slutMs: ms(k.slut),
    copy: k.copy,
  }
}
