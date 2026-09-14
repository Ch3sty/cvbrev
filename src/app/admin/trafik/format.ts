/**
 * Formatering for Trafik.
 *
 * Ligger i en egen fil for att bade serverkomponenten och de tva
 * klientkomponenterna (diagrammen) behover samma funktioner. En
 * klientkomponent kan inte importera fran en modul som drar in
 * supabase-klienten, sa data.ts duger inte som hem at dem.
 */

const MANADER = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

/** 2026-09-12 blir "12 sep". */
export function kortDatum(varde: string | number): string {
  const s = String(varde);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return s;
  return `${d.getUTCDate()} ${MANADER[d.getUTCMonth()]}`;
}

/** 2026-09-12 blir "12 september". */
export function langtDatum(varde: string): string {
  const d = new Date(`${varde}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return varde;
  const namn = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december',
  ];
  return `${d.getUTCDate()} ${namn[d.getUTCMonth()]}`;
}

export function antal(varde: number | null | undefined): string {
  if (varde === null || varde === undefined || !Number.isFinite(varde)) return '–';
  return Math.round(varde).toLocaleString('sv-SE');
}

/** 0.0086 blir "0,86 %". CTR lagras som andel, aldrig som procenttal. */
export function procent(andel: number | null | undefined, decimaler = 2): string {
  if (andel === null || andel === undefined || !Number.isFinite(andel)) return '–';
  return `${(andel * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  })} %`;
}

/** 18.6 blir "18,6". Position skrivs med en decimal, aldrig fler. */
export function position(varde: number | null | undefined): string {
  if (varde === null || varde === undefined || !Number.isFinite(varde)) return '–';
  return varde.toLocaleString('sv-SE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Andelsforandring till "+12 %" eller "−30 %". Minus ar ett riktigt minus. */
export function deltaProcent(andel: number | null | undefined): string {
  if (andel === null || andel === undefined || !Number.isFinite(andel)) return '–';
  const p = Math.round(andel * 100);
  if (p === 0) return '0 %';
  return `${p > 0 ? '+' : '−'}${Math.abs(p)} %`;
}

/** Positionsforandring i steg, med tecknet vand sa uppat betyder battre. */
export function deltaPosition(steg: number | null | undefined): string {
  if (steg === null || steg === undefined || !Number.isFinite(steg)) return '–';
  const v = Math.round(steg * 10) / 10;
  if (v === 0) return '0';
  const tecken = v > 0 ? '−' : '+';
  return `${tecken}${Math.abs(v).toLocaleString('sv-SE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
}

/** Procentuell forandring mellan tva tal, eller null nar basen ar noll. */
export function forandring(nu: number, fore: number): number | null {
  if (!Number.isFinite(nu) || !Number.isFinite(fore) || fore === 0) return null;
  return (nu - fore) / fore;
}

/**
 * En GSC-sidnyckel ar en full URL. Tabellen visar bara sokvagen, eftersom
 * domanen ar samma pa varenda rad och bara stjal bredd.
 */
export function sokvag(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}
