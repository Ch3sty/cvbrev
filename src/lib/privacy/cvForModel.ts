// src/lib/privacy/cvForModel.ts
//
// En väg för CV-text till AI:n (ägarens beslut 2026-11-21): inga
// personuppgifter lämnar servern till modellen. Namn, e-post, telefon,
// gatuadress och postnummer, personnummer, födelsedatum och webbadresser
// (LinkedIn, GitHub, portfolio) maskas med samma maskering som breven
// (pii.ts, maskForModel), och webbadresserna maskas alltid. Kontaktuppgifterna
// hämtas ur profilen eller läses lokalt ur texten och sätts in i koden efter
// AI-svaret. Platshållarna som maskeringen satt in tas bort ur allt modellen
// svarar, så att de aldrig hamnar i sparad struktur eller i förslag hon ser.
//
// Ren TypeScript utan serverberoenden: används av API-rutterna och av
// poängmodellens efterkontroll av förslagen.

import { maskForModel } from './pii';

export interface CvMaskning {
  /** Profilens namn (profiles.full_name). */
  fullName?: string | null;
  /** Fler kända namn, till exempel namnet som står i CV:t. */
  extraNames?: Array<string | null | undefined>;
  /** Kända telefonnummer (profilens). */
  knownPhones?: Array<string | null | undefined>;
}

/** CV-texten maskad för modellen. Webbadresser maskas alltid. */
export function maskaCvForModel(text: string, opts: CvMaskning = {}): string {
  return maskForModel(text ?? '', {
    fullName: opts.fullName ?? null,
    extraNames: opts.extraNames,
    knownPhones: opts.knownPhones,
    maskUrls: true,
  }).text;
}

/** Maskeringens platshållare. [antal] i förslagen är inte en av dem. */
const PII_PLATSHALLARE =
  /\[(?:NAMN|E-POST|EMAIL|TELEFON|TEL|ADRESS|POSTNUMMER|POSTNR|PERSONNUMMER|PERSNR|FÖDELSEDATUM|LÄNK|URL)\]/gi;

/** Har texten kvar en platshållare från maskeringen? */
export function harPiiPlatshallare(text: unknown): boolean {
  return typeof text === 'string' && new RegExp(PII_PLATSHALLARE.source, 'i').test(text);
}

/** Texten utan maskeringens platshållare och utan tomma rester. */
export function utanPiiPlatshallare(text: string): string {
  if (!text || !harPiiPlatshallare(text)) return text;
  return text
    .replace(PII_PLATSHALLARE, '')
    .replace(/\(\s*[,;]?\s*\)/g, '')
    .split('\n')
    .map((rad) => rad.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').replace(/^[\s,;:]+|[\s,;:]+$/g, ''))
    .join('\n')
    .trim();
}

/** Alla strängar i ett svar utan maskeringens platshållare. */
export function rensaDjupt<T>(v: T): T {
  if (typeof v === 'string') return utanPiiPlatshallare(v) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => rensaDjupt(x)) as unknown as T;
  if (v && typeof v === 'object') {
    const ut: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) ut[k] = rensaDjupt(x);
    return ut as T;
  }
  return v;
}

/** Webbadresserna i CV:t, lästa lokalt (modellen ser dem aldrig). */
export function lankarLokalt(text: string): { linkedIn: string; github: string; website: string } {
  const t = text ?? '';
  const linkedIn = t.match(/\b(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/[^\s<>",;)]+/i)?.[0] ?? '';
  const github = t.match(/\b(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s<>",;)]+/i)?.[0] ?? '';
  const ovriga = (t.match(/\bhttps?:\/\/[^\s<>",;)]+|\bwww\.[^\s<>",;)]+/gi) ?? []).filter(
    (u) => !/linkedin\.com|github\.com/i.test(u)
  );
  return { linkedIn, github, website: ovriga[0] ?? '' };
}

/** Flera textfält maskade för modellen (LinkedIn-profilens avsnitt). */
export function maskeraSektioner<T extends Record<string, string | undefined>>(sektioner: T, opts: CvMaskning = {}): T {
  const ut: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sektioner)) ut[k] = typeof v === 'string' ? maskaCvForModel(v, opts) : v;
  return ut as T;
}
