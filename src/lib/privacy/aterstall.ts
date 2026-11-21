// src/lib/privacy/aterstall.ts
//
// Maskering med återställning, för flöden där modellens svar är hennes eget
// CV i ny form (omskrivningen i /api/cv/generate-improved, citaten i
// /api/cv/extract-text och /api/cv/group-improvements). Modellen ser bara
// platshållare; i svaret sätts hennes riktiga uppgifter tillbaka här på
// servern, så att flödet beter sig som förut för henne.
//
// Återställningen:
//  - [NAMN] blir alltid hennes namn: bara kända namn maskas (profilens och
//    det som läses lokalt ur CV:ts början), så ett [NAMN] är alltid hennes.
//  - Övriga platshållare fylls i i den ordning värdena stod i originalet. Det
//    första [TELEFON] i svaret får alltså det första numret i CV:t (hennes,
//    i kontaktraden), nästa [TELEFON] nästa nummer (en referens). Platshållare
//    som blir över tas bort med utanPiiPlatshallare.

import { maskPii, maskForModel, PLACEHOLDERS, type MaskOptions, type PiiKind } from './pii';
import { extractContactLocally } from './extractContact';
import { utanPiiPlatshallare } from './cvForModel';

export interface Agaruppgifter {
  /** profiles.full_name */
  fullName?: string | null;
  /** profiles.phone */
  phone?: string | null;
}

export interface MaskningMedAterstallning {
  /** Texten som får skickas till modellen. */
  text: string;
  /** Sätter tillbaka uppgifterna i en sträng ur modellens svar. */
  aterstall: (svar: string) => string;
  /** Samma maskering för andra fält i samma anrop (förslag, roller). */
  maska: (annan: string) => string;
}

function escapeRegExp(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ORDNADE: Array<Exclude<PiiKind, 'name'>> = [
  'email',
  'phone',
  'address',
  'postalCode',
  'personalId',
  'birthDate',
  'url',
];

/** Maskar en CV-text för modellen och ger en funktion som återställer svaret. */
export function maskaMedAterstallning(text: string, agare: Agaruppgifter = {}): MaskningMedAterstallning {
  const original = text ?? '';
  const lokal = extractContactLocally(original);
  const opts: MaskOptions = {
    fullName: agare.fullName ?? null,
    extraNames: [lokal.fullName],
    knownPhones: [agare.phone, lokal.phone],
    maskUrls: true,
    // Namnet i CV:t är redan läst ovan (lokal.fullName, ur hela texten).
    // Heuristiken på varje kort fält för sig skulle annars ta "Senior
    // Projektledare" för ett namn.
    detectNameHeuristically: false,
  };
  const forsta = maskPii(original, opts);
  const maskad = maskForModel(original, opts).text;
  const namn = (lokal.fullName || agare.fullName || '').trim();

  const aterstall = (svar: string): string => {
    if (typeof svar !== 'string' || !svar) return svar;
    let ut = svar;
    if (namn) ut = ut.split(PLACEHOLDERS.name).join(namn);
    for (const typ of ORDNADE) {
      const varden = forsta.found[typ] ?? [];
      if (varden.length === 0) continue;
      let i = 0;
      ut = ut.replace(new RegExp(escapeRegExp(PLACEHOLDERS[typ]), 'g'), (p) => (i < varden.length ? varden[i++] : p));
    }
    return utanPiiPlatshallare(ut);
  };

  const maska = (annan: string) => (typeof annan === 'string' ? maskForModel(annan, opts).text : annan);
  return { text: maskad, aterstall, maska };
}

/** Kör återställningen på alla strängar i ett svar (objekt och listor). */
export function aterstallDjupt<T>(v: T, aterstall: (s: string) => string): T {
  if (typeof v === 'string') return aterstall(v) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => aterstallDjupt(x, aterstall)) as unknown as T;
  if (v && typeof v === 'object') {
    const ut: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) ut[k] = aterstallDjupt(x, aterstall);
    return ut as T;
  }
  return v;
}

/** Maskar alla strängar i ett objekt (till exempel tolkade roller ur CV:t). */
export function maskaDjupt<T>(v: T, mask: (s: string) => string): T {
  if (typeof v === 'string') return mask(v) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => maskaDjupt(x, mask)) as unknown as T;
  if (v && typeof v === 'object') {
    const ut: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) ut[k] = maskaDjupt(x, mask);
    return ut as T;
  }
  return v;
}
