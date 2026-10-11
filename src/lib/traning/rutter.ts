// src/lib/traning/rutter.ts
// Sidorna i Rekryteringstester, på ett ställe. Hemvyn (våg 2), passflödet,
// resultaten och kvittot (våg 3b) länkar hit; klient.ts exporterar samma
// funktioner vidare. Flyttar en sida ändras den här och ingen annanstans.
//
// Passets startsida läser typ, family och format (pass/page.tsx).

type PassTyp = 'matning' | 'pass' | 'riktat' | 'general';

/** Länken som startar ett pass, en mätning, ett riktat pass eller en generalrepetition. */
export function passHref(typ: PassTyp, opt?: { family?: string | null; format?: string | null }): string {
  const q = new URLSearchParams({ typ });
  if (opt?.family) q.set('family', opt.family);
  if (opt?.format) q.set('format', opt.format);
  return `/dashboard/tester/pass?${q.toString()}`;
}

/** Sessionens egen adress: återupptagning, omladdning och genomgången (P4). */
export function sessionHref(sessionId: string): string {
  return `/dashboard/tester/pass/${encodeURIComponent(sessionId)}`;
}

/** Uppvärmningen på provdagen, tre frågor som inte sparas. */
export const UPPVARMNING_HREF = '/dashboard/tester/uppvarmning';

/** Kvittot K1 för ett märke. */
export function kvittoHref(nyckel: string): string {
  return `/dashboard/tester/kvitto/${encodeURIComponent(nyckel)}`;
}

export const TRANING_HREF = '/dashboard/tester';

/**
 * Hemvyn efter ett pass eller en mätning. Sessionens id gör adressen unik, så
 * routern aldrig visar en hemvy som förhämtats före passet (dörrarnas
 * förhämtning står kvar i fem minuter), och resultatvyn kan förhämta den
 * färska hemvyn medan resultatet läses. Hemvyn läser inte parametern.
 */
export function hemEfterHref(sessionId: string): string {
  return `${TRANING_HREF}?efter=${encodeURIComponent(sessionId)}`;
}
export const KURVAN_HREF = '/dashboard/tester/kurvan';

export const TRANING_RUTT = {
  hem: TRANING_HREF,
  /** Ingången E1 till E3 och "Test och datum". steg=2 öppnar leverantören, steg=3 datumet. */
  installningar: '/dashboard/tester/installningar',
  installningarSteg: (steg: 1 | 2 | 3) => `/dashboard/tester/installningar?steg=${steg}`,
  kurvan: KURVAN_HREF,
  alla: '/dashboard/tester/alla',
  /** Sidomenyns "Provläget": generalrepetitionen i planens format (spec 19.6). */
  provlaget: passHref('general'),
  /** Passflödet (våg 3b): mätning, dagens pass, riktat pass och generalrepetition. */
  matning: passHref('matning'),
  pass: passHref('pass'),
  riktat: (family: string) => passHref('riktat', { family }),
  general: passHref('general'),
  uppvarmning: UPPVARMNING_HREF,
  /** Genomgången av ett slutfört pass (P4). */
  genomgang: sessionHref,
  kvitto: kvittoHref,
  personlighet: '/dashboard/tester/personlighet-grund',
  /** De klassiska testerna som inte har pass än (1t, Fler tester). */
  siffror: '/dashboard/tester/numeriskt-test',
  text: '/dashboard/tester/verbal-resonemang',
  intervju: '/dashboard/intervju',
  brev: '/dashboard/mina-brev',
  jobbsok: '/dashboard',
} as const;
