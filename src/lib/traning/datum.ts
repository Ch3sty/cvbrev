// src/lib/traning/datum.ts
// Dagar i svensk tid som 'YYYY-MM-DD'. Serien, planen och kurvan räknar i
// hela dagar med midnatt i Europe/Stockholm, samma som dagskvoterna
// (src/lib/quota/quotaService.ts). Ren, utan beroenden.

/** En dag i svensk tid, 'YYYY-MM-DD'. */
export type Dag = string;

const DAG_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Dagen ett ögonblick infaller på i svensk tid. */
export function dagSthlm(tid: Date | string | number = new Date()): Dag {
  const d = tid instanceof Date ? tid : new Date(tid);
  // sv-SE ger ISO-formen YYYY-MM-DD.
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d);
}

export function arGiltigDag(s: unknown): s is Dag {
  if (typeof s !== 'string' || !DAG_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

function delar(dag: Dag): [number, number, number] {
  const [y, m, d] = dag.split('-').map(Number);
  return [y, m, d];
}

function utc(dag: Dag): number {
  const [y, m, d] = delar(dag);
  return Date.UTC(y, m - 1, d);
}

/** dag + n dagar (n kan vara negativt). */
export function laggTill(dag: Dag, n: number): Dag {
  const [y, m, d] = delar(dag);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Antal dagar från a till b (b - a). */
export function dagarMellan(a: Dag, b: Dag): number {
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

/** Veckodag, 0 = söndag ... 6 = lördag. */
export function veckodag(dag: Dag): number {
  return new Date(utc(dag)).getUTCDay();
}

export function arSondag(dag: Dag): boolean {
  return veckodag(dag) === 0;
}

const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'] as const;

/** Veckodagens namn, gemener ("lördag"). */
export function veckodagNamn(dag: Dag): string {
  return VECKODAGAR[veckodag(dag)];
}

/** Dagarna från och med a till och med b. Tom om b < a. */
export function dagarIntervall(a: Dag, b: Dag): Dag[] {
  const n = dagarMellan(a, b);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => laggTill(a, i));
}

export function storreAn(a: Dag, b: Dag): boolean {
  return a > b;
}
