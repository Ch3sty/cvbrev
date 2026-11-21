// src/lib/privacy/extractContact.ts
// Lokal extraktion av kontaktuppgifter ur CV-text.
//
// Tidigare bad vi Gemini om personalInfo.fullName, email, phone och address,
// alltså skickade vi hela CV:t och fick tillbaka personuppgifterna som
// modellen läst. Allt det går att göra med regex på vår egen server: ett
// e-postfält är ett e-postfält, och namnheuristiken i pii.ts klarar de två
// vanliga uppställningarna. Modellen behöver aldrig se uppgifterna.

import { detectNameInCv } from './pii';
// Bara namnen (kommunnamn.ts), inte hela skattetabellen: filen dras in i
// klientbuntar via poängmodellen (src/lib/cv/poang/kanon.ts).
import { KOMMUNNAMN } from './kommunnamn';

export interface ExtractedContact {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  linkedIn: string;
}

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_INTL_RE = /\+\d{1,3}[\s-]?\d[\d\s-]{6,14}\d/;
const PHONE_SE_RE = /\b0[\s-]?\d{1,3}[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}\b/;
const STREET_RE =
  /\b[A-ZÅÄÖ][a-zåäöé]+(?:gatan|vägen|väg|stigen|gränden|torget|platsen|allén|backen)[ ]+\d+(?:[ ]?[A-Za-z])?\b/;
/** Postnummer plus ort: "114 35 Stockholm". Orten är det vi vill åt. */
const POSTAL_CITY_RE = /\b(\d{3}\s?\d{2})\s+([A-ZÅÄÖ][a-zåäöé-]+(?:\s+[A-ZÅÄÖ][a-zåäöé-]+)?)\b/;
const LINKEDIN_RE = /\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i;

/**
 * Ort utan postnummer ("Örebro" på en egen rad, "e-post • telefon •
 * Stockholm"). Godtas bara när ett helt led i kontaktblocket är exakt en av
 * Sveriges 290 kommuner (Skatteverkets lista, namnen i kommunnamn.ts), så
 * att en yrkestitel eller ett företag aldrig blir ort. Kommunnamn som också
 * är vanliga ord eller förnamn står utanför: hellre ingen ort än fel ort.
 */
const TVETYDIGA_KOMMUNER = new Set(['ale', 'berg', 'eda', 'kil', 'mark', 'nora', 'salem', 'vara']);
const KOMMUNER = new Map<string, string>(
  KOMMUNNAMN
    .filter((namn) => !TVETYDIGA_KOMMUNER.has(namn.toLowerCase()))
    .map((namn) => [namn.toLowerCase(), namn])
);
/** Kontaktblocket: så här många rader överst, och aldrig förbi första rubriken. */
const KONTAKTBLOCK_RADER = 10;
const RUBRIK_RE =
  /^(?:profil|sammanfattning|om mig|arbetslivserfarenhet|erfarenhet|anställningar|utbildning|kompetenser|färdigheter|språk|referenser|kurser|certifikat|profile|summary|experience|education|skills)\b/i;
/** Avskiljare mellan leden på en rad, också de som OCR läser in (», «, +). */
const LED_RE = /\s*[|•·,;»«+]\s*|\s+[-–]\s+/;
const ORT_ETIKETT_RE = /^(?:bostadsort|hemort|ort|bor i)\s*:?\s*/i;

function ortUtanPostnummer(text: string): string {
  const rader = text
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean)
    .slice(0, KONTAKTBLOCK_RADER);
  for (const rad of rader) {
    if (RUBRIK_RE.test(rad)) break;
    for (const del of rad.split(LED_RE)) {
      // E-post, telefon och länkar i samma led tas bort först, så att
      // "Stockholm linkedin.com/in/namn" (OCR utan avskiljare) ger Stockholm.
      const led = del
        .replace(new RegExp(EMAIL_RE.source, 'g'), ' ')
        .replace(new RegExp(PHONE_INTL_RE.source, 'g'), ' ')
        .replace(new RegExp(PHONE_SE_RE.source, 'g'), ' ')
        .replace(/\b(?:https?:\/\/|www\.)\S+|\b(?:[a-z]{2,3}\.)?(?:linkedin|github)\.com\S*/gi, ' ')
        .replace(ORT_ETIKETT_RE, '')
        .replace(/^[\s.:()-]+|[\s.:()-]+$/g, '')
        .replace(/\s+/g, ' ');
      const traff = KOMMUNER.get(led.toLowerCase());
      if (traff) return traff;
    }
  }
  return '';
}

/**
 * Plockar ut kontaktuppgifterna lokalt. Allt som inte hittas blir tom sträng,
 * samma kontrakt som parsern hade mot resten av appen.
 */
export function extractContactLocally(cvText: string): ExtractedContact {
  const text = cvText ?? '';

  const email = text.match(EMAIL_RE)?.[0] ?? '';
  const phone = text.match(PHONE_INTL_RE)?.[0] ?? text.match(PHONE_SE_RE)?.[0] ?? '';
  const address = text.match(STREET_RE)?.[0] ?? '';

  const postalMatch = text.match(POSTAL_CITY_RE);
  const postalCode = postalMatch?.[1] ?? '';
  const city = postalMatch?.[2] ?? ortUtanPostnummer(text);

  const linkedIn = text.match(LINKEDIN_RE)?.[0] ?? '';
  const fullName = detectNameInCv(text) ?? '';

  return {
    fullName,
    email,
    phone: phone.trim(),
    address,
    postalCode,
    city,
    linkedIn,
  };
}
