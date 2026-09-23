/**
 * Rena funktioner bakom Översikt (spec-admin-tydlighet 2026-09-22, punkt 2
 * och 10): listan "Sedan i går", MRR-texten per paket och klicken från sök
 * räknade på dagar med data.
 *
 * Inga serverberoenden. Köpraderna tas in som typ, inte som modul, så att
 * testerna slipper Stripe, next/cache och server-only.
 */

import type { KopRad } from '@/lib/admin/kop';
import type { DagligaMetrik, PaketNyckel } from '@/lib/admin/collect';
import { PLANS, paketMedLangd } from '@/lib/plans/plans';
import { klockslag, datumKort } from '@/lib/admin/tomt';

export const DYGN_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Svensk dag
// ---------------------------------------------------------------------------

/** YYYY-MM-DD för ett ögonblick, i svensk tid. */
export function svenskDag(t: Date | string | number): string {
  const d = t instanceof Date ? t : new Date(t);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Midnatt svensk tid för dagen då `nu` inträffar, som Date (UTC). */
export function svenskMidnatt(nu: Date): Date {
  const dag = svenskDag(nu);
  const mitt = new Date(`${dag}T12:00:00Z`);
  const timme = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Stockholm',
      hour: '2-digit',
      hour12: false,
    }).format(mitt)
  );
  // Klockan tolv UTC är 13 eller 14 i Sverige, alltså en eller två timmar.
  return new Date(Date.parse(`${dag}T00:00:00Z`) - (timme - 12) * 3600000);
}

function dagForeDag(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Händelserna
// ---------------------------------------------------------------------------

export type HandelseTyp = 'kop' | 'uppsagning' | 'provperiod' | 'konton' | 'spar' | 'fel';

export interface Handelse {
  id: string;
  typ: HandelseTyp;
  /** ISO-tid. Sorteringsnyckeln, och klockslaget när heldag är falskt. */
  tid: string;
  /**
   * Sant för en händelse som bara har en dag, till exempel "4 nya konton".
   * Då står "i dag" eller "i går" i stället för ett klockslag.
   */
  heldag: boolean;
  /** Dagen för en heldagshändelse, YYYY-MM-DD. */
  dag?: string;
  text: string;
  /** Belopp i öre, till höger. Utelämnas när händelsen inte har något. */
  beloppOre?: number;
}

/** Nyast först. Lika tider behåller sin inbördes ordning. */
export function sorteraHandelser(h: Handelse[]): Handelse[] {
  return h
    .map((x, i) => ({ x, i }))
    .sort((a, b) => {
      const d = Date.parse(b.x.tid) - Date.parse(a.x.tid);
      return d !== 0 ? d : a.i - b.i;
    })
    .map(({ x }) => x);
}

/**
 * Tiden till vänster på raden: "14.14", "i går 22.10", "i dag" eller
 * "i går".
 */
export function tidEtikett(h: Handelse, nu: Date): string {
  const idag = svenskDag(nu);
  const dag = h.heldag ? (h.dag ?? svenskDag(h.tid)) : svenskDag(h.tid);
  const relativ = dag === idag ? 'i dag' : dag === dagForeDag(idag) ? 'i går' : datumKort(dag);
  if (h.heldag) return relativ;
  const kl = klockslag(h.tid);
  return dag === idag ? kl : `${relativ} ${kl}`;
}

/** "580ee411": de första åtta tecknen i konto-id:t. */
export function kontoKort(userId: string | null | undefined): string {
  return userId ? userId.slice(0, 8) : 'okänt konto';
}

/**
 * Köpen som händelser. Interna köp syns inte här: Översikt räknar dem inte,
 * och en rad utan tal hade bara väckt frågor. Intäkter visar dem märkta.
 */
export function kopHandelser(rader: KopRad[], franMs: number): Handelse[] {
  return rader
    .filter((r) => !r.internt && Date.parse(r.tid) >= franMs)
    .map((r) => {
      const konto = `konto ${kontoKort(r.userId)}`;
      const text = r.aterbetalning
        ? `Återbetalning: ${r.paketNamn}, ${konto}`
        : `Köp: ${r.paketNamn}, ${konto}, ${
            r.ny ? 'ny kund' : r.typ === 'lopande' ? 'förnyelse' : 'återkommande kund'
          }`;
      return { id: r.id, typ: 'kop' as const, tid: r.tid, heldag: false, text, beloppOre: r.beloppOre };
    });
}

/** Senaste köpet som räknas, för tomma listan och korten. */
export function senasteKop(rader: KopRad[]): KopRad | null {
  let b: KopRad | null = null;
  for (const r of rader) {
    if (r.internt || r.aterbetalning) continue;
    if (!b || r.tid > b.tid) b = r;
  }
  return b;
}

/** "Inget hänt sedan i går kl. 07.12." */
export function tomListaText(nu: Date): string {
  return `Inget hänt sedan i går kl. ${klockslag(new Date(nu.getTime() - DYGN_MS).toISOString())}.`;
}

function plural(n: number, en: string, flera: string): string {
  return `${n.toLocaleString('sv-SE')} ${n === 1 ? en : flera}`;
}

/** Provperioder som gått ut senaste dygnet, som en händelse. */
export function provperiodHandelse(slut: string[]): Handelse | null {
  if (!slut.length) return null;
  const senaste = slut.reduce((a, b) => (a > b ? a : b));
  return {
    id: 'provperiod',
    typ: 'provperiod',
    tid: senaste,
    heldag: false,
    // Premiumkällan byts vid köp, så en provperiod som fortfarande bär
    // trialkällan när den går ut har per definition inte blivit ett köp.
    text: `${plural(slut.length, 'provperiod', 'provperioder')} gick ut utan köp`,
  };
}

/** Nya konton i dag, som en heldagshändelse sorterad på senaste kontot. */
export function kontoHandelse(skapade: string[], idag: string): Handelse | null {
  if (!skapade.length) return null;
  const senaste = skapade.reduce((a, b) => (a > b ? a : b));
  return {
    id: 'konton',
    typ: 'konton',
    tid: senaste,
    heldag: true,
    dag: idag,
    text: plural(skapade.length, 'nytt konto', 'nya konton'),
  };
}

const SPAR_NAMN: Record<string, string> = { cv: 'CV', tester: 'Tester', allt: 'Hela paketet' };

export interface SparRad {
  dag: string;
  dimension: string;
  personer: number;
  uppdaterad: string | null;
}

/**
 * "2 personer valde spår (1 CV, 1 Allt)", en händelse per dag.
 * Totalen är raden med tom dimension; uppdelningen är cv, tester och allt.
 */
export function sparHandelser(rader: SparRad[]): Handelse[] {
  const perDag = new Map<string, SparRad[]>();
  for (const r of rader) {
    const l = perDag.get(r.dag) ?? [];
    l.push(r);
    perDag.set(r.dag, l);
  }
  const ut: Handelse[] = [];
  for (const [dag, lista] of perDag) {
    const total = lista.find((r) => r.dimension === '');
    const delar = (['cv', 'tester', 'allt'] as const)
      .map((k) => ({ k, n: lista.find((r) => r.dimension === k)?.personer ?? 0 }))
      .filter((d) => d.n > 0);
    const summa = total?.personer ?? delar.reduce((s, d) => s + d.n, 0);
    if (summa <= 0) continue;
    const uppdelning = delar.length
      ? ` (${delar.map((d) => `${d.n} ${SPAR_NAMN[d.k]}`).join(', ')})`
      : '';
    ut.push({
      id: `spar-${dag}`,
      typ: 'spar',
      tid: lista.find((r) => r.uppdaterad)?.uppdaterad ?? `${dag}T12:00:00Z`,
      heldag: true,
      dag,
      text: `${summa === 1 ? '1 person' : `${summa} personer`} valde spår${uppdelning}`,
    });
  }
  return ut;
}

/**
 * Uppsägningar ur admin_daily_metrics.churned för i dag och i går.
 *
 * Källan är vald med flit: churned räknar Stripes canceled_at, alltså även
 * uppsägningar gjorda i Stripes kundportal. cancel_intents fångar bara den
 * som gick via flödet i appen. Priset är att raden saknar klockslag.
 */
export function uppsagningHandelser(
  rader: Array<Pick<DagligaMetrik, 'dag' | 'churned'> & { uppdaterad?: string | null }>,
  idag: string
): Handelse[] {
  const igar = dagForeDag(idag);
  const ut: Handelse[] = [];
  for (const r of rader) {
    const dag = String(r.dag);
    if (dag !== idag && dag !== igar) continue;
    const n = typeof r.churned === 'number' ? r.churned : Number(r.churned ?? 0);
    if (!n) continue;
    ut.push({
      id: `uppsagning-${dag}`,
      typ: 'uppsagning',
      tid: r.uppdaterad ?? `${dag}T12:00:00Z`,
      heldag: true,
      dag,
      text: `${plural(n, 'uppsägning', 'uppsägningar')} i Stripe`,
    });
  }
  return ut;
}

/** Felen i loggen senaste dygnet, som en händelse. */
export function felHandelse(fel: Array<{ kalla: string; created_at: string }>): Handelse | null {
  if (!fel.length) return null;
  const senaste = fel.reduce((a, b) => (a.created_at > b.created_at ? a : b));
  return {
    id: 'fel',
    typ: 'fel',
    tid: senaste.created_at,
    heldag: false,
    text: `${plural(fel.length, 'fel', 'fel')} i loggen, senast från ${senaste.kalla}`,
  };
}

// ---------------------------------------------------------------------------
// MRR per paket
// ---------------------------------------------------------------------------

const PAKET_KOLUMNER: Array<{ nyckel: PaketNyckel; kolumn: keyof DagligaMetrik }> = [
  { nyckel: 'cv_week', kolumn: 'active_cv_week' },
  { nyckel: 'test_week', kolumn: 'active_test_week' },
  { nyckel: 'all_week', kolumn: 'active_all_week' },
  { nyckel: 'all_month', kolumn: 'active_all_month' },
  { nyckel: 'all_quarter', kolumn: 'active_all_quarter' },
];

/**
 * "3 × Hela paketet, en månad 149 kr" ur active_*-kolumnerna. Dagspasset är ett
 * engångsköp och har ingen MRR, så den står inte med.
 */
export function mrrPaketText(rad: DagligaMetrik | null | undefined): string {
  if (!rad) return 'inga löpande kunder';
  const delar: string[] = [];
  for (const { nyckel, kolumn } of PAKET_KOLUMNER) {
    const n = Number(rad[kolumn] ?? 0);
    if (!n) continue;
    const plan = PLANS.find((p) => p.key === nyckel);
    if (!plan) continue;
    delar.push(`${n} × ${paketMedLangd(plan.key)} ${plan.amount} kr`);
  }
  return delar.length ? delar.join(', ') : 'inga löpande kunder';
}

// ---------------------------------------------------------------------------
// Klick från sök
// ---------------------------------------------------------------------------

export interface GscVecka {
  /** Klick de sju senaste dagarna med data. */
  klick: number;
  /** De sju dagarna med data innan. Null när de inte är sju. */
  fore: number | null;
  fran: string | null;
  till: string | null;
  senasteDag: string | null;
  senasteKlick: number | null;
}

/**
 * Sju dagar med data mot de sju dagarna med data innan (spec, Trafik). GSC
 * ligger två till tre dagar efter, och kalenderdagar utan data hade sett ut
 * som ett ras.
 */
export function gscVecka(rader: Array<Pick<DagligaMetrik, 'dag' | 'gsc_clicks'>>): GscVecka {
  const med = rader
    .filter((r) => r.gsc_clicks !== null && r.gsc_clicks !== undefined)
    .map((r) => ({ dag: String(r.dag), klick: Number(r.gsc_clicks) }))
    .sort((a, b) => b.dag.localeCompare(a.dag));
  const nu = med.slice(0, 7);
  const fore = med.slice(7, 14);
  return {
    klick: nu.reduce((s, r) => s + r.klick, 0),
    fore: fore.length === 7 ? fore.reduce((s, r) => s + r.klick, 0) : null,
    fran: nu.length ? nu[nu.length - 1].dag : null,
    till: nu.length ? nu[0].dag : null,
    senasteDag: med[0]?.dag ?? null,
    senasteKlick: med[0]?.klick ?? null,
  };
}
