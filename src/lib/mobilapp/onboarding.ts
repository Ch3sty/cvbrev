// src/lib/mobilapp/onboarding.ts
// Appens första start (konceptet docs/design/app-koncept-2026-11-13.html,
// Onboarding, Nivåkollen, Nivåögonblicket och Spara din nivå). Stegen, valen
// som sparas i appen tills kontot finns, provdatumet ur snabbvalen och
// samtycket, som skrivs i samma cookie som webbens kakbanner.
//
// Ren fil, går att importera från klienten och från vitest.

import { byggPlan, raknaPlan } from '@/lib/traning/plan';
import { dagSthlm, laggTill, dagarMellan, arGiltigDag, type Dag } from '@/lib/traning/datum';
import { PROVDATUM_MAX_DAGAR } from '@/lib/traning/testplan';
import { arMittTest, planFranVal, type MittTest } from '@/lib/traning/mittTest';

/* ------------------------------------------------------------ stegen */

/**
 * Stegen i den ordning konceptet visar dem. "konto" är Spara din nivå, som
 * kommer efter nivåögonblicket; utan anonym session (se anonymSession i
 * inloggningen) kommer det före Nivåkollen i stället.
 */
export const STEG = ['start', 'test', 'datum', 'samtycke', 'nivakoll', 'matning', 'niva', 'konto'] as const;
export type Steg = (typeof STEG)[number];

export function arSteg(v: unknown): v is Steg {
  return (STEG as readonly unknown[]).includes(v);
}

/** Stegraden överst i onboardingen: fyra streck, gjorda, nu och kvar. */
export function stegRad(steg: Steg): ('gjord' | 'nu' | 'kvar')[] {
  const i = ['start', 'test', 'datum', 'samtycke'].indexOf(steg);
  return [0, 1, 2, 3].map((n) => (i < 0 ? 'gjord' : n < i ? 'gjord' : n === i ? 'nu' : 'kvar'));
}

/* ------------------------------------------------------------ provdatumet */

/** Snabbvalen i steget "När är provet?". */
export const DATUMVAL = ['1v', '2v', '3v', '1m', 'kal', 'ej'] as const;
export type Datumval = (typeof DATUMVAL)[number];

const DAGAR: Record<Exclude<Datumval, 'kal' | 'ej'>, number> = { '1v': 7, '2v': 14, '3v': 21, '1m': 30 };

export const DATUMVAL_TEXT: Record<Exclude<Datumval, 'kal' | 'ej'>, string> = {
  '1v': 'Inom en vecka',
  '2v': 'Om två veckor',
  '3v': 'Om tre veckor',
  '1m': 'Om en månad',
};

export function arDatumval(v: unknown): v is Datumval {
  return (DATUMVAL as readonly unknown[]).includes(v);
}

/**
 * Provdatumet för ett val. "Vet inte än" ger null (en rullande plan). Ett
 * datum ur kalendern måste ligga mellan i dag och planens gräns, annars null.
 */
export function provdatumFor(val: Datumval, kalender: string | null, idag: Dag = dagSthlm()): Dag | null {
  if (val === 'ej') return null;
  if (val === 'kal') {
    if (!kalender || !arGiltigDag(kalender)) return null;
    const n = dagarMellan(idag, kalender);
    return n >= 0 && n <= PROVDATUM_MAX_DAGAR ? kalender : null;
  }
  return laggTill(idag, DAGAR[val]);
}

const MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** "6 december" */
export function datumText(dag: Dag): string {
  const [, m, d] = dag.split('-').map(Number);
  return `${d} ${MANADER[m - 1]}`;
}

const TAL = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];
const tal = (n: number) => (n >= 0 && n < TAL.length ? TAL[n] : String(n));

/**
 * Planens rad under datumvalet, räknad med webbens byggPlan: dagar, pass,
 * nivåkoller och övningsprov. Utan datum en rullande vecka.
 */
export function planSammanfattning(prov: Dag | null, idag: Dag = dagSthlm()): { rubrik: string; text: string; dagar: number } {
  if (!prov) {
    return { rubrik: 'Planen, en vecka i taget', text: 'Ett pass om dagen, ny nivåkoll var sjunde dag', dagar: 7 };
  }
  const plan = byggPlan({ start: idag, prov, idag, betalande: true });
  const r = raknaPlan(plan);
  const dagar = dagarMellan(idag, prov);
  const delar = [
    `${dagar} ${dagar === 1 ? 'dag' : 'dagar'}`,
    `${r.pass} pass`,
    `${r.ommatning === 1 ? 'en nivåkoll' : `${tal(r.ommatning)} nivåkoller`}`,
  ];
  if (r.general > 0) delar.push(`${tal(r.general)} övningsprov`);
  const text = delar.length > 1 ? `${delar.slice(0, -1).join(', ')} och ${delar[delar.length - 1]}` : delar[0];
  return { rubrik: `Planen till ${datumText(prov)}`, text, dagar };
}

/** Planremsans dagar: mätning i dag, pass, vila, nivåkoll, övningsprov, provet. */
export function planremsa(prov: Dag | null, idag: Dag = dagSthlm()): ('matning' | 'pass' | 'vila' | 'ommatning' | 'general' | 'prov')[] {
  return byggPlan({ start: idag, prov, idag, betalande: true, rullandeDagar: 7 }).map((d) => d.typ);
}

/* ------------------------------------------------------------ minnet i appen */

/** Valen sparas i appen tills kontot finns (konceptet, beslut 5). */
export interface OnboardingMinne {
  test: MittTest;
  datum: Datumval;
  kalender: string | null;
  samtycke: boolean | null;
  /** Nivån efter Nivåkollen, för texten i Spara din nivå. */
  niva: number | null;
  /** Onboardingen är klar: nästa start går till inloggningen, inte hit. */
  klar: boolean;
}

export const MINNE_NYCKEL = 'testklar.onboarding';

export const STANDARD: OnboardingMinne = { test: 'matrigma', datum: '3v', kalender: null, samtycke: null, niva: null, klar: false };

export function tolkaMinne(s: string | null): OnboardingMinne {
  if (!s) return { ...STANDARD };
  try {
    const o = JSON.parse(s) as Partial<OnboardingMinne>;
    return {
      test: arMittTest(o.test) ? o.test : STANDARD.test,
      datum: arDatumval(o.datum) ? o.datum : STANDARD.datum,
      kalender: typeof o.kalender === 'string' && arGiltigDag(o.kalender) ? o.kalender : null,
      samtycke: typeof o.samtycke === 'boolean' ? o.samtycke : null,
      niva: typeof o.niva === 'number' && o.niva >= 1 && o.niva <= 10 ? o.niva : null,
      klar: o.klar === true,
    };
  } catch {
    return { ...STANDARD };
  }
}

export function lasMinne(): OnboardingMinne {
  try {
    return tolkaMinne(window.localStorage.getItem(MINNE_NYCKEL));
  } catch {
    return { ...STANDARD };
  }
}

export function sparaMinne(m: Partial<OnboardingMinne>): OnboardingMinne {
  const ny = { ...lasMinne(), ...m };
  try {
    window.localStorage.setItem(MINNE_NYCKEL, JSON.stringify(ny));
  } catch {
    // Privat läge: valen gäller ändå under den här starten.
  }
  return ny;
}

/** Planen som skickas till webbens PUT /api/traning/plan (samma som Mitt test). */
export function planKropp(m: Pick<OnboardingMinne, 'test' | 'datum' | 'kalender'>, idag: Dag = dagSthlm()) {
  return { ...planFranVal(m.test, null, []), provdatum: provdatumFor(m.datum, m.kalender, idag) };
}

/* ------------------------------------------------------------ samtycket */

/** Samma cookie, samma värden och samma livslängd som webbens kakbanner (CookieBanner.tsx). */
export const SAMTYCKE_COOKIE = 'cvBrevCookieConsent';
const SAMTYCKE_DYGN = 180;

export function samtyckeCookie(ja: boolean, https: boolean): string {
  return `${SAMTYCKE_COOKIE}=${ja};max-age=${SAMTYCKE_DYGN * 86400};path=/;SameSite=Lax${https ? ';Secure' : ''}`;
}

/**
 * Skriver svaret som kakbannerns klick gör: cookien, Googles samtyckesläge
 * och markeringen på <html>. Knappen som anropar bär data-samtycke, så att
 * PostHogs lyssnare (PostHogProvider, lyssnaPaSamtycke) slår på eller stänger
 * av mätningen i samma tryck, precis som på webben.
 */
export function skrivSamtycke(ja: boolean): void {
  try {
    document.cookie = samtyckeCookie(ja, location.protocol === 'https:');
    const v = ja ? 'granted' : 'denied';
    const lage = { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v };
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
    if (w.gtag) w.gtag('consent', 'update', lage);
    else (w.dataLayer = w.dataLayer || []).push(['consent', 'update', lage]);
    document.documentElement.setAttribute('data-samtycke', 'svarat');
    document.getElementById('jc-samtycke')?.remove();
  } catch {
    // Samtycket får aldrig stoppa onboardingen.
  }
}

/** Har appen redan ett svar i cookien? */
export function lasSamtycke(cookie: string): boolean | null {
  const m = new RegExp(`(?:^|; )${SAMTYCKE_COOKIE}=(true|false)(?:;|$)`).exec(cookie);
  return m ? m[1] === 'true' : null;
}
