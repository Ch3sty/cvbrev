/**
 * Tomma tillstånd i adminen (spec-admin-tydlighet 2026-09-22, princip 1 till 6).
 *
 * Ett streck betyder för läsaren "trasigt" och en nolla utan förklaring
 * betyder "mockup". Varje ruta som saknar dagens tal säger i stället tre
 * saker: vad talet är nu, sedan när det har gällt, och vilket det senaste
 * riktiga värdet var.
 *
 *   1. Noll är ett tal, inte ett streck: "0 sedan 22 sep".
 *   2. Senaste kända värde följer med: "Senaste köp: 22 sep kl. 14.14".
 *   3. Källa som ligger efter säger det: "Google ligger 2 till 3 dagar efter".
 *   4. Mäts inte än är ett eget tillstånd: "Mäts från 22 sep kl. 19.02".
 *   5. Ett tal, en källa.
 *   6. Testkonton räknas aldrig, och sidan säger hur många som är undantagna.
 *
 * Rena funktioner utan serverberoenden, så att både server- och
 * klientkomponenter kan använda dem och testerna slipper mocka något.
 */

/**
 * När saker började mätas. En sanning för alla sidor: tidigare sa Översikt
 * 14 sep och Intäkter 15 sep om samma MRR-serie.
 */
export const MATSTART = {
  /** Stripe har ingen historisk MRR. Serien är sann från den här dagen. */
  mrr: '2026-09-15',
  /** Paketen (CV-veckan, Testveckan, Allt) såldes från 22 sep 10.51. */
  paket: '2026-09-22T08:51:00Z',
  /** Köpvägens händelser (purchase_step_viewed m.fl.) från 22 sep 19.02. */
  kopvag: '2026-09-22T17:02:00Z',
  /** Kolumnerna per paket i admin_daily_metrics finns från 21 sep. */
  paketKolumner: '2026-09-21',
  /** Attributionen (acquisition_source) sattes korrekt från 21 sep 22.00. */
  attribution: '2026-09-21T20:00:00Z',
  /** Aktiveringsmilstolparna går att lita på från 15 sep. */
  aktivering: '2026-09-15',
  /** Adminkonto och testkonton undantagna ur all data från 22 sep. */
  undantag: '2026-09-22',
  /** Konverteringsomgången med signup_completed, 11 sep 22.08. */
  signupHandelse: '2026-09-11T20:08:00Z',
} as const;

const MANAD = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function delar(iso: string): { ar: number; man: number; dag: number; tim: number; min: number } | null {
  // Ett rent datum (YYYY-MM-DD) tolkas som den svenska dagen, utan tid.
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [ar, man, dag] = iso.split('-').map(Number);
    return { ar, man, dag, tim: -1, min: -1 };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const f = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const v = (t: string) => Number(f.find((p) => p.type === t)?.value ?? 0);
  return { ar: v('year'), man: v('month'), dag: v('day'), tim: v('hour') % 24, min: v('minute') };
}

/** "22 sep". Tar både YYYY-MM-DD och en ISO-tid (svensk tid). */
export function datumKort(iso: string | null | undefined): string {
  if (!iso) return 'okänt datum';
  const d = delar(iso);
  if (!d) return iso;
  return `${d.dag} ${MANAD[d.man - 1]}`;
}

/** "22 sep kl. 14.14", eller bara datumet när tiden saknas. */
export function tidKort(iso: string | null | undefined): string {
  if (!iso) return 'okänd tid';
  const d = delar(iso);
  if (!d) return iso;
  if (d.tim < 0) return datumKort(iso);
  const hh = String(d.tim).padStart(2, '0');
  const mm = String(d.min).padStart(2, '0');
  return `${d.dag} ${MANAD[d.man - 1]} kl. ${hh}.${mm}`;
}

/** "kl. 14.14" för händelser samma dag. */
export function klockslag(iso: string): string {
  const d = delar(iso);
  if (!d || d.tim < 0) return '';
  return `${String(d.tim).padStart(2, '0')}.${String(d.min).padStart(2, '0')}`;
}

/** Heltal med svenska tusentalsavgränsare. Noll är "0", aldrig streck. */
export function tal(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString('sv-SE');
}

/** Kronor ur öre, avrundat: "447 kr". Noll är "0 kr". */
export function kronor(ore: number | null | undefined): string {
  return `${Math.round((ore ?? 0) / 100).toLocaleString('sv-SE')} kr`;
}

/**
 * Princip 1: noll med sedan när. "0 köp sedan 22 sep kl. 19.02".
 * enhet är ordet efter talet, till exempel "köp" eller "fel".
 */
export function nollSedan(enhet: string, sedan: string): string {
  return `0 ${enhet} sedan ${tidKort(sedan)}`;
}

/** Princip 4: "Mäts från 22 sep kl. 19.02." plus valfri fortsättning. */
export function matsFran(sedan: string, fortsattning?: string): string {
  return `Mäts från ${tidKort(sedan)}.${fortsattning ? ` ${fortsattning}` : ''}`;
}

/** Princip 3: GSC ligger efter. "Google ligger 3 dagar efter. 15 klick 19 sep, senaste dag med data." */
export function gscEfter(senasteDag: string | null, klick: number | null, idag: string): string {
  if (!senasteDag) return 'Google har inte levererat någon dag i fönstret än.';
  const dagar = Math.max(
    0,
    Math.round((Date.parse(`${idag}T12:00:00Z`) - Date.parse(`${senasteDag}T12:00:00Z`)) / 86400000)
  );
  const efter = dagar <= 0 ? '' : `Google ligger ${dagar} ${dagar === 1 ? 'dag' : 'dagar'} efter. `;
  return `${efter}${tal(klick)} klick ${datumKort(senasteDag)}, senaste dag med data.`;
}

/** Sant när ett ISO-datum ligger före mätstart. */
export function foreMatstart(iso: string, matstart: string): boolean {
  return Date.parse(iso.length === 10 ? `${iso}T00:00:00Z` : iso) < Date.parse(matstart.length === 10 ? `${matstart}T00:00:00Z` : matstart);
}
