// First-touch-attribution i cookien jc_attr (docs/plan-konvertering.md, C1).
// Klientsäker: ingen IP, ingen e-post, inget som pekar ut en person.
// Cookien sätts i proxy.ts vid första request och skrivs aldrig över.

import { getCtaVariantForTags } from '@/lib/cta/clusters'

export interface Attribution {
  landing_path?: string;
  landing_cluster?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_seen?: string;
}

export const ATTRIBUTION_COOKIE = 'jc_attr';

/** 90 dagar i sekunder. */
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90;

/** Cookien får inte spränga 4 kB-taket. Vi kapar varje fält hårt. */
const MAX_FIELD_LENGTH = 200;

function clip(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_FIELD_LENGTH);
}

/** Läser jc_attr i webbläsaren. Returnerar null om den saknas eller är trasig. */
export function readAttribution(): Attribution | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${ATTRIBUTION_COOKIE}=([^;]*)`));
  if (!m) return null;
  return parseAttribution(m[1]);
}

/** Parsar ett rått cookie-värde. Används både på klient och server. */
export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Attribution;
  } catch {
    return null;
  }
}

/**
 * Slår upp landningsklustret för en artikel-URL. Vi har inte frontmatter i
 * proxyn, så vi härleder klustret ur slug-orden. Det räcker för attribution:
 * exakt klustring per artikel görs i CTA-komponenten som har taggarna.
 */
export function clusterForLandingPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/artiklar\/([^/?#]+)/);
  if (!match) return undefined;
  const slugWords = decodeURIComponent(match[1]).split('-').join(' ');
  const cluster = getCtaVariantForTags([slugWords]);
  return cluster === 'generic' ? undefined : cluster;
}

/**
 * Bygger attributionsobjektet ur en inkommande request. Ingen IP, ingen
 * användaridentitet: bara var besökaren landade och varifrån.
 */
export function buildAttribution(input: {
  pathname: string;
  searchParams: URLSearchParams;
  referrer?: string | null;
  now?: Date;
}): Attribution {
  const { pathname, searchParams, referrer, now } = input;

  // Referrer bara som ursprung (host), aldrig full URL med querysträng.
  let referrerHost: string | undefined;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname || undefined;
    } catch {
      referrerHost = clip(referrer);
    }
  }

  const attribution: Attribution = {
    landing_path: clip(pathname),
    landing_cluster: clusterForLandingPath(pathname),
    referrer: clip(referrerHost),
    utm_source: clip(searchParams.get('utm_source')),
    utm_medium: clip(searchParams.get('utm_medium')),
    utm_campaign: clip(searchParams.get('utm_campaign')),
    utm_content: clip(searchParams.get('utm_content')),
    utm_term: clip(searchParams.get('utm_term')),
    first_seen: (now ?? new Date()).toISOString(),
  };

  // Släng tomma nycklar så cookien håller sig liten.
  (Object.keys(attribution) as (keyof Attribution)[]).forEach((key) => {
    if (attribution[key] === undefined) delete attribution[key];
  });

  return attribution;
}

/** Serialiserar till cookie-värde (URI-kodad JSON). */
export function serializeAttribution(attribution: Attribution): string {
  return encodeURIComponent(JSON.stringify(attribution));
}

/**
 * Kontexten spår B skickar med signup_started och signup_completed.
 * Läser cookien på klienten. Returnerar tomt objekt när den saknas.
 */
export function getSignupAnalyticsContext(): {
  source_page?: string;
  source_cluster?: string;
} {
  const attribution = readAttribution();
  if (!attribution) return {};
  return {
    source_page: attribution.landing_path,
    source_cluster: attribution.landing_cluster,
  };
}

/**
 * Hela attributionen som den ska skrivas till profiles.acquisition_source
 * vid registrering. Spår B anropar den i register-form och Google-callbacken.
 */
export function getAcquisitionSource(): Attribution | null {
  return readAttribution();
}
