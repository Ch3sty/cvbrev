/**
 * Köpliggaren som tal och rader (spec-admin-tydlighet punkt 1 och 2).
 *
 * Rena funktioner. Liggaren hämtas för 90 dagar (en cachepost för både
 * Översikt och Intäkter) och fönstren på 30 dagar och ett dygn skärs ut här.
 * Summorna räknas på samma sätt som summera() i src/lib/admin/kop.ts, men
 * den filen drar in Stripe och server-only, så testerna når den inte.
 */

import type { KopRad } from '@/lib/admin/kop';

export const DYGN_MS = 24 * 60 * 60 * 1000;

export interface KopSumma {
  totaltOre: number;
  lopandeOre: number;
  engangsOre: number;
  antalLopande: number;
  antalEngangs: number;
  nyaBetalande: number;
  aterbetaltOre: number;
}

/** Summorna utan interna rader. Samma regel som kop.ts summera(). */
export function summeraKop(rader: KopRad[]): KopSumma {
  const s: KopSumma = {
    totaltOre: 0,
    lopandeOre: 0,
    engangsOre: 0,
    antalLopande: 0,
    antalEngangs: 0,
    nyaBetalande: 0,
    aterbetaltOre: 0,
  };
  for (const r of rader) {
    if (r.internt) continue;
    s.totaltOre += r.beloppOre;
    if (r.aterbetalning) {
      s.aterbetaltOre += -r.beloppOre;
      continue;
    }
    if (r.typ === 'lopande') {
      s.lopandeOre += r.beloppOre;
      s.antalLopande += 1;
    } else {
      s.engangsOre += r.beloppOre;
      s.antalEngangs += 1;
    }
    if (r.ny) s.nyaBetalande += 1;
  }
  return s;
}

export interface KopFonster {
  /** Nyast först, interna med. */
  rader: KopRad[];
  summa: KopSumma;
  interna: number;
  franMs: number;
}

/** Raderna de senaste `dagar` dygnen räknat från `nu`. */
export function kopIFonster(rader: KopRad[], dagar: number, nu: number): KopFonster {
  const franMs = nu - dagar * DYGN_MS;
  const i = rader
    .filter((r) => Date.parse(r.tid) >= franMs)
    .sort((a, b) => b.tid.localeCompare(a.tid));
  return { rader: i, summa: summeraKop(i), interna: i.filter((r) => r.internt).length, franMs };
}

/** "Ny · engångs", "Förnyelse · löpande", "Återbetalning". */
export function kopTypText(r: KopRad): string {
  if (r.aterbetalning) return 'Återbetalning';
  const typ = r.typ === 'lopande' ? 'löpande' : 'engångs';
  const vem = r.ny ? 'Ny' : r.typ === 'lopande' ? 'Förnyelse' : 'Återkommande';
  return `${vem} · ${typ}`;
}

/**
 * Senaste nya betalande före fönstret, för "före det: 25 jun, Allt-månaden".
 * Null när liggaren inte har någon.
 */
export function senasteNyFore(rader: KopRad[], franMs: number): KopRad | null {
  let b: KopRad | null = null;
  for (const r of rader) {
    if (r.internt || r.aterbetalning || !r.ny) continue;
    if (Date.parse(r.tid) >= franMs) continue;
    if (!b || r.tid > b.tid) b = r;
  }
  return b;
}

/** Senaste raden av en typ som räknas, till exempel senaste engångsköpet. */
export function senasteAv(rader: KopRad[], typ: KopRad['typ']): KopRad | null {
  let b: KopRad | null = null;
  for (const r of rader) {
    if (r.internt || r.aterbetalning || r.typ !== typ) continue;
    if (!b || r.tid > b.tid) b = r;
  }
  return b;
}

function svenskDag(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export interface IntaktDag {
  dag: string;
  /** Öre. Null en dag utan löpande intäkt, så att dagen inte räknas som data. */
  lopande: number | null;
  engangs: number | null;
  [nyckel: string]: string | number | null;
}

/**
 * Intäkt per svensk dag, staplad på löpande och engångs, en rad per dag i
 * fönstret äldst först. Interna rader räknas inte. Återbetalningar dras från
 * sin typ samma dag.
 *
 * Dagar utan intäkt får null, inte noll: diagramregeln räknar dagar med data,
 * och med nollor hade en enda försäljning ritats som ett helt diagram.
 */
export function intaktPerDag(rader: KopRad[], dagar: number, nu: number): IntaktDag[] {
  const perDag = new Map<string, { lopande: number; engangs: number; harL: boolean; harE: boolean }>();
  const sista = svenskDag(new Date(nu).toISOString());
  const d = new Date(`${sista}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (dagar - 1));
  const forsta = d.toISOString().slice(0, 10);
  for (const r of rader) {
    if (r.internt) continue;
    const dag = svenskDag(r.tid);
    if (dag < forsta || dag > sista) continue;
    const v = perDag.get(dag) ?? { lopande: 0, engangs: 0, harL: false, harE: false };
    if (r.typ === 'lopande') {
      v.lopande += r.beloppOre;
      v.harL = true;
    } else {
      v.engangs += r.beloppOre;
      v.harE = true;
    }
    perDag.set(dag, v);
  }

  const ut: IntaktDag[] = [];
  for (let i = 0; i < dagar; i++) {
    const dag = d.toISOString().slice(0, 10);
    const v = perDag.get(dag);
    ut.push({
      dag,
      lopande: v?.harL ? v.lopande : null,
      engangs: v?.harE ? v.engangs : null,
    });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return ut;
}

/** "A, B och C". */
export function uppraknat(delar: string[]): string {
  if (delar.length <= 1) return delar.join('');
  return `${delar.slice(0, -1).join(', ')} och ${delar[delar.length - 1]}`;
}
