/**
 * Formatering for Mejl. Egen fil sa att bade serverkomponenten och
 * diagrammens klientkomponenter kan importera den utan att dra in
 * supabase-klienten.
 */

const MANADER = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

export function antal(varde: number | null | undefined): string {
  if (varde === null || varde === undefined || !Number.isFinite(varde)) return '–';
  return Math.round(varde).toLocaleString('sv-SE');
}

/** 0.23 blir "23 %". Alla grader lagras som andel, aldrig som procenttal. */
export function procent(andel: number | null | undefined, decimaler = 1): string {
  if (andel === null || andel === undefined || !Number.isFinite(andel)) return '–';
  return `${(andel * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  })} %`;
}

/** Andel av en bas, eller null nar basen ar noll. */
export function grad(taljare: number, namnare: number): number | null {
  if (!namnare) return null;
  return taljare / namnare;
}

/** 2026-09-12 blir "12 sep". */
export function kortDatum(varde: string | number): string {
  const s = String(varde).slice(0, 10);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(varde);
  return `${d.getUTCDate()} ${MANADER[d.getUTCMonth()]}`;
}

/** Full tidpunkt, till exempel "15 sep 07:00". Kon behover klockslaget. */
export function tidpunkt(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  }).format(d);
}

/**
 * Malltypen till lasbar svenska.
 *
 * Nycklarna ar de som faktiskt finns i email_log och email_schedule. En typ
 * som saknas i kartan visas rakt av: det ar battre an en gissning, och nya
 * mallar ska synas som sig sjalva tills nagon namnger dem har.
 */
const NAMN: Record<string, string> = {
  quota_back: 'Kvoten tillbaka',
  weekly_digest: 'Veckodigest',
  trial_day5: 'Trial, dag 5',
  winback_14: 'Winback, 14 dagar',
  winback_30: 'Winback, 30 dagar',
  rt_day0: 'Reverse trial, dag 0',
  rt_day1: 'Reverse trial, dag 1',
  rt_day3: 'Reverse trial, dag 3',
  rt_day4: 'Reverse trial, dag 4',
  rt_day6: 'Reverse trial, dag 6',
  rt_day10: 'Reverse trial, dag 10',
  interest_message: 'Intresseanmälan',
  recruiter_interest: 'Rekryterarintresse',
  campaign_test: 'Kampanjtest',
  // Kopmejlen (egen grupp pa sidan, spec-admin-tydlighet 2026-09-22).
  receipt: 'Kvitto',
  komigang: 'Kom igång',
  paket_fornyas: 'Paketet förnyas',
  canceled_until_sunday: 'Uppsägning, gäller perioden ut',
  payment_failed: 'Betalningen misslyckades',
  cancel_immediate: 'Uppsägning, direkt',
  cancel_followup: 'Uppsägning, uppföljning',
  onetime_expired: 'Dagspasset slut',
};

export function mallNamn(nyckel: string): string {
  if (NAMN[nyckel]) return NAMN[nyckel];
  if (nyckel.startsWith('campaign:')) {
    return `Kampanj: ${nyckel.slice('campaign:'.length)}`;
  }
  if (nyckel.startsWith('weekly_digest')) return 'Veckodigest';
  // Hjalpredans mejl har datumsuffix: komigang_2026-09-25.
  const dag = nyckel.match(/^(komigang|paket_fornyas)_(\d{4}-\d{2}-\d{2})$/);
  if (dag) return `${NAMN[dag[1]]}, ${kortDatum(dag[2])}`;
  return nyckel;
}

/** Kortar en e-postadress sa att tabellen inte spricker pa langa domaner. */
export function kortAdress(adress: string): string {
  if (adress.length <= 32) return adress;
  const [lokal, doman] = adress.split('@');
  if (!doman) return `${adress.slice(0, 29)}…`;
  const kortLokal = lokal.length > 14 ? `${lokal.slice(0, 13)}…` : lokal;
  return `${kortLokal}@${doman}`;
}
