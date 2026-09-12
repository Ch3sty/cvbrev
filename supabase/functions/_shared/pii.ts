// supabase/functions/_shared/pii.ts
// Deno-port av src/lib/privacy/pii.ts.
//
// Varför en kopia och inte en import: Edge Functions kör i Deno och kan inte
// importera ur src/. Den fördjupade CV-analysen var därför det sista flödet
// som skickade rå CV-text till modellen, trots att allt i Next.js-koden
// maskades. Med den här filen gäller löftet på profilsidan hela tjänsten.
//
// KRITISKT: reglerna nedan MÅSTE vara identiska med src/lib/privacy/pii.ts.
// Filen är ren TypeScript utan imports, just för att samma fil ska kunna
// importeras av vitest. Paritetstestet i
// src/lib/privacy/__tests__/shared-pii-parity.test.ts kör båda modulerna mot
// samma texter och failar om de börjar glida isär. Ändrar du en regel här,
// ändra den där också, annars går testet rött.


/** Platshållarna. Stabila strängar: de läses av modellen och av oss själva. */
export const PLACEHOLDERS = {
  name: '[NAMN]',
  email: '[E-POST]',
  phone: '[TELEFON]',
  address: '[ADRESS]',
  postalCode: '[POSTNUMMER]',
  personalId: '[PERSONNUMMER]',
  url: '[LÄNK]',
} as const;

export type PiiKind = keyof typeof PLACEHOLDERS;

/**
 * Mönstren. Ordningen i maskPii spelar roll: personnummer före postnummer
 * och telefon, annars äter de kortare mönstren delar av det längre.
 */
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  personalId: /\b(?:19|20)?\d{6}[-+\s]?\d{4}\b/g,
  phoneIntl: /\+\d{1,3}[\s-]?\d[\d\s-]{6,14}\d/g,
  phoneSe: /\b0[\s-]?\d{1,3}[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}\b/g,
  streetAddress:
    /\b[A-ZÅÄÖ][a-zåäöé]+(?:gatan|vägen|väg|stigen|gränden|torget|platsen|allén|backen)[ ]+\d+(?:[ ]?[A-Za-z])?\b/g,
  postalCode: /\b\d{3}\s?\d{2}\b(?!\s*\d)/g,
  url: /\bhttps?:\/\/[^\s<>"]+|\bwww\.[^\s<>"]+/gi,
} as const;

export interface MaskOptions {
  /**
   * Känt namn ur profiles.full_name. Maskas ordagrant och per namndel, så
   * "Anna Lindqvist", "Anna" och "Lindqvist" alla fångas.
   */
  fullName?: string | null;
  /** Maska URL:er. Av för CV-analys, där LinkedIn-raden är ett ATS-plus. */
  maskUrls?: boolean;
  /** Använd namnheuristiken på de första raderna. */
  detectNameHeuristically?: boolean;
}

export interface MaskResult {
  text: string;
  /** Vad som faktiskt hittades, för mätpunkter och för återställning. */
  found: Partial<Record<PiiKind, string[]>>;
  /** Namnet vi identifierade, oavsett källa. Null om inget hittades. */
  detectedName: string | null;
}

/** Regex-escape för att kunna bygga mönster av användardata. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const NAME_STOPWORDS = new Set([
  'cv', 'curriculum', 'vitae', 'meritförteckning', 'personligt', 'brev',
  'ansökan', 'kontakt', 'kontaktuppgifter', 'profil', 'sammanfattning',
  'om', 'mig', 'resume', 'erfarenhet', 'utbildning', 'kompetenser',
]);

/**
 * Ser raden ut som ett namn? Två till fyra ord, varje ord med versal initial,
 * inga siffror, inga typiska rubrikord. Medvetet strikt: hellre missa ett
 * ovanligt formaterat namn än maska bort "Systemutvecklare Stockholm".
 */
export function looksLikeName(line: string): boolean {
  const trimmed = line.trim().replace(/[|,;]+$/, '').trim();
  if (!trimmed || trimmed.length > 60) return false;
  if (/\d/.test(trimmed)) return false;
  if (trimmed.includes('@')) return false;

  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;

  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-zåäöé-]/gi, '');
    if (NAME_STOPWORDS.has(lower)) return false;
    // Versal initial, resten gemener. Efter bindestreck eller apostrof får
    // en ny versal följa, så Anna-Lena och O’Brien godkänns.
    if (!/^[A-ZÅÄÖ][a-zåäöé]*(?:[-’'][A-ZÅÄÖa-zåäöé][a-zåäöé]*)*$/.test(word)) return false;
  }
  return true;
}

/**
 * Hittar namnet i CV-texten utan att fråga någon modell.
 *
 * Två fall som båda förekommer i verkliga CV:n:
 *   1. Namnet står först i dokumentet.
 *   2. Dokumentet inleds med en rubrik ("CV", "Meritförteckning") och namnet
 *      står strax under, eller i närheten av e-post och telefon.
 */
export function detectNameInCv(cvText: string): string | null {
  const lines = cvText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Fall 1 och 2: gå igenom de första raderna, ta första som ser ut som namn.
  for (const line of lines.slice(0, 8)) {
    if (looksLikeName(line)) return line.replace(/[|,;]+$/, '').trim();
  }

  // Fall 3: raden precis före eller efter en kontaktrad.
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const emailRe = new RegExp(PATTERNS.email.source, 'g');
    const hasContact = emailRe.test(lines[i]) || /\b0\d[\d\s-]{7,}\b/.test(lines[i]);
    if (!hasContact) continue;

    for (const candidate of [lines[i - 1], lines[i + 1]]) {
      if (candidate && looksLikeName(candidate)) {
        return candidate.replace(/[|,;]+$/, '').trim();
      }
    }
  }

  return null;
}

/** Samlar träffar utan att tappa bort dem när vi ersätter. */
function collect(text: string, pattern: RegExp): string[] {
  const re = new RegExp(pattern.source, pattern.flags);
  return Array.from(text.matchAll(re)).map((m) => m[0]);
}

/**
 * Maskerar personuppgifter i en text. Idempotent: körs den två gånger blir
 * resultatet detsamma, eftersom platshållarna inte matchar mönstren.
 */
export function maskPii(text: string, options: MaskOptions = {}): MaskResult {
  const { fullName, maskUrls = true, detectNameHeuristically = true } = options;
  const found: Partial<Record<PiiKind, string[]>> = {};

  if (!text) return { text: '', found, detectedName: null };

  let out = text;

  const apply = (kind: Exclude<PiiKind, 'name'>, pattern: RegExp) => {
    const hits = collect(out, pattern);
    if (hits.length === 0) return;
    found[kind] = [...(found[kind] ?? []), ...hits];
    out = out.replace(new RegExp(pattern.source, pattern.flags), PLACEHOLDERS[kind]);
  };

  // Ordningen är medveten, se kommentaren vid PATTERNS.
  apply('email', PATTERNS.email);
  apply('personalId', PATTERNS.personalId);
  apply('phone', PATTERNS.phoneIntl);
  apply('phone', PATTERNS.phoneSe);
  apply('address', PATTERNS.streetAddress);
  apply('postalCode', PATTERNS.postalCode);
  if (maskUrls) apply('url', PATTERNS.url);

  // Namnet sist: profilens namn väger tyngst, heuristiken fyller i.
  const detectedName =
    (fullName && fullName.trim().length > 1 ? fullName.trim() : null) ??
    (detectNameHeuristically ? detectNameInCv(text) : null);

  if (detectedName) {
    const parts = detectedName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 2);

    // Hela namnet först, sedan varje del. Annars blir "Anna Lindqvist" till
    // "[NAMN] [NAMN]" i stället för ett [NAMN].
    const candidates = [detectedName, ...parts];
    const names: string[] = [];

    for (const candidate of candidates) {
      const pattern = new RegExp(`\\b${escapeRegExp(candidate)}\\b`, 'gi');
      if (pattern.test(out)) {
        names.push(candidate);
        out = out.replace(new RegExp(`\\b${escapeRegExp(candidate)}\\b`, 'gi'), PLACEHOLDERS.name);
      }
    }

    // Sammanhängande dubbletter efter delmaskning.
    out = out.replace(/\[NAMN\](?:\s+\[NAMN\])+/g, PLACEHOLDERS.name);
    if (names.length > 0) found.name = names;
  }

  return { text: out, found, detectedName };
}

/**
 * Kvarvarande personuppgifter efter maskering. Returnerar en lista med
 * beskrivningar, tom lista betyder rent.
 */
export function findRemainingPii(text: string): string[] {
  const warnings: string[] = [];
  if (!text) return warnings;

  if (collect(text, PATTERNS.email).length > 0) warnings.push('email');
  if (collect(text, PATTERNS.personalId).length > 0) warnings.push('personalId');
  if (
    collect(text, PATTERNS.phoneIntl).length > 0 ||
    collect(text, PATTERNS.phoneSe).length > 0
  ) {
    warnings.push('phone');
  }
  return warnings;
}

/**
 * Andra passet. Körs bara när findRemainingPii hittat något, och tar i med
 * hårdhandskarna: alla siffergrupper som kan vara telefon eller id maskas,
 * oavsett format.
 */
export function maskAggressively(text: string): string {
  let out = text;
  out = out.replace(new RegExp(PATTERNS.email.source, 'g'), PLACEHOLDERS.email);
  out = out.replace(/\b[A-Za-z0-9._%+-]+\s?@\s?[A-Za-z0-9.-]+\b/g, PLACEHOLDERS.email);
  out = out.replace(new RegExp(PATTERNS.personalId.source, 'g'), PLACEHOLDERS.personalId);
  // Sju siffror eller fler, med valfria avdelare: telefonnummer i alla format.
  out = out.replace(/\+?\d[\d\s().-]{6,}\d/g, PLACEHOLDERS.phone);
  return out;
}

/**
 * Hela kedjan: maska, kontrollera, maska hårdare vid behov, kontrollera igen.
 * Returnerar alltid en maskerad text, aldrig originalet.
 */
export function maskForModel(
  text: string,
  options: MaskOptions = {}
): { text: string; detectedName: string | null; warnings: string[]; usedSecondPass: boolean } {
  const first = maskPii(text, options);
  let out = first.text;
  let usedSecondPass = false;

  let warnings = findRemainingPii(out);
  if (warnings.length > 0) {
    out = maskAggressively(out);
    usedSecondPass = true;
    warnings = findRemainingPii(out);
  }

  return { text: out, detectedName: first.detectedName, warnings, usedSecondPass };
}

// ---------------------------------------------------------------------------
// Lokal extraktion av kontaktuppgifter
// ---------------------------------------------------------------------------
// Port av src/lib/privacy/extractContact.ts. Ligger i samma fil för att
// Edge Functions ska ha en enda import, och för att paritetstestet ska täcka
// även den här delen.
//
// Poängen: ett e-postfält behöver ingen språkmodell. Vi plockar ut
// kontaktuppgifterna med regex på vår egen server, stryker dem ur texten som
// skickas vidare, och sätter tillbaka dem i resultatet efteråt.

export interface ExtractedContact {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  linkedIn: string;
}

const EMAIL_ONE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_INTL_ONE = /\+\d{1,3}[\s-]?\d[\d\s-]{6,14}\d/;
const PHONE_SE_ONE = /\b0[\s-]?\d{1,3}[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}\b/;
const STREET_ONE =
  /\b[A-ZÅÄÖ][a-zåäöé]+(?:gatan|vägen|väg|stigen|gränden|torget|platsen|allén|backen)[ ]+\d+(?:[ ]?[A-Za-z])?\b/;
/** Postnummer plus ort: "114 35 Stockholm". Orten är det vi vill åt. */
const POSTAL_CITY_ONE = /\b(\d{3}\s?\d{2})\s+([A-ZÅÄÖ][a-zåäöé-]+(?:\s+[A-ZÅÄÖ][a-zåäöé-]+)?)\b/;
const LINKEDIN_ONE = /\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i;

/**
 * Plockar ut kontaktuppgifterna lokalt. Allt som inte hittas blir tom sträng,
 * samma kontrakt som parsningen hade mot resten av appen.
 */
export function extractContactLocally(cvText: string): ExtractedContact {
  const text = cvText ?? '';

  const email = text.match(EMAIL_ONE)?.[0] ?? '';
  const phone = text.match(PHONE_INTL_ONE)?.[0] ?? text.match(PHONE_SE_ONE)?.[0] ?? '';
  const address = text.match(STREET_ONE)?.[0] ?? '';

  const postalMatch = text.match(POSTAL_CITY_ONE);
  const postalCode = postalMatch?.[1] ?? '';
  const city = postalMatch?.[2] ?? '';

  const linkedIn = text.match(LINKEDIN_ONE)?.[0] ?? '';
  const fullName = detectNameInCv(text) ?? '';

  return { fullName, email, phone: phone.trim(), address, postalCode, city, linkedIn };
}

/**
 * Byter tillbaka platshållare mot riktiga värden. Används på text som ska
 * visas för användaren (t.ex. den formaterade förhandsvisningen), aldrig på
 * text som ska skickas till en modell.
 */
export function restorePlaceholders(
  text: string,
  values: { name?: string | null; email?: string | null; phone?: string | null; address?: string | null }
): string {
  let out = text;
  if (values.name) out = out.split(PLACEHOLDERS.name).join(values.name);
  if (values.email) out = out.split(PLACEHOLDERS.email).join(values.email);
  if (values.phone) out = out.split(PLACEHOLDERS.phone).join(values.phone);
  if (values.address) out = out.split(PLACEHOLDERS.address).join(values.address);
  return out;
}
