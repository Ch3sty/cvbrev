// src/lib/privacy/extractContact.ts
// Lokal extraktion av kontaktuppgifter ur CV-text.
//
// Tidigare bad vi Gemini om personalInfo.fullName, email, phone och address,
// alltså skickade vi hela CV:t och fick tillbaka personuppgifterna som
// modellen läst. Allt det går att göra med regex på vår egen server: ett
// e-postfält är ett e-postfält, och namnheuristiken i pii.ts klarar de två
// vanliga uppställningarna. Modellen behöver aldrig se uppgifterna.

import { detectNameInCv } from './pii';

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
  const city = postalMatch?.[2] ?? '';

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
