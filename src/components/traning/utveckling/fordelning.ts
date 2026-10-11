/**
 * "Var du står": fördelningen per nivå och 25-regeln (skiss Provbladet,
 * avsnitt 2, och hjälpruta C4).
 *
 * Fördelningen är antalet slutförda sessioner per poäng (0 till maxPoang) på
 * en nivå, räknad som percentile-routen: bara meta.alternativ_blandade, samma
 * bankversion, utan undantagna konton (fordelning.server.ts). Bara aggregat
 * lämnar servern.
 *
 * 25-regeln: jämförelsen ("bättre än") och kurvan visas bara när minst 25
 * slutförda sessioner finns. Under det visas räknaren "14 av 25", aldrig ett
 * påhittat tal.
 *
 * Ren fil, testad i __tests__/fordelning.test.ts.
 */

export const MIN_UNDERLAG = 25

export interface Fordelning {
  /** Antal slutförda sessioner. */
  antal: number
  /** Index = poäng, värde = antal sessioner med den poängen. */
  perPoang: number[]
  maxPoang: number
}

/** Bygger fördelningen ur råa poäng. Poäng utanför 0..maxPoang och icke-tal räknas inte. */
export function byggFordelning(poang: readonly unknown[], maxPoang: number): Fordelning {
  const tak = Math.max(0, Math.floor(maxPoang))
  const perPoang = new Array<number>(tak + 1).fill(0)
  let antal = 0
  for (const p of poang) {
    const n = typeof p === 'string' ? Number(p) : p
    if (typeof n !== 'number' || !Number.isFinite(n)) continue
    const i = Math.round(n)
    if (i < 0 || i > tak) continue
    perPoang[i] += 1
    antal += 1
  }
  return { antal, perPoang, maxPoang: tak }
}

/** Andel (0 till 100, avrundad) av sessionerna med lägre poäng, som percentile-routen. */
export function andelUnder(f: Fordelning, poang: number): number {
  if (f.antal === 0) return 0
  const grans = Math.min(f.perPoang.length, Math.max(0, Math.ceil(poang)))
  let under = 0
  for (let i = 0; i < grans; i++) under += f.perPoang[i]
  return Math.round((100 * under) / f.antal)
}

export type Jamforelse =
  | { lage: 'visas'; percentil: number; antal: number }
  /** Underlag finns men hon har ingen jämförbar (blandad) session på nivån. */
  | { lage: 'utanEget'; antal: number }
  | { lage: 'raknare'; antal: number; mal: number }

/**
 * 25-regeln. Under MIN_UNDERLAG: räknaren. Annars percentilen för hennes
 * bästa jämförbara poäng, eller bara fördelningen när hon saknar en sådan.
 */
export function tjugofemRegeln(f: Fordelning | null, egenPoang: number | null): Jamforelse {
  const antal = f?.antal ?? 0
  if (!f || antal < MIN_UNDERLAG) return { lage: 'raknare', antal, mal: MIN_UNDERLAG }
  if (egenPoang == null || !Number.isFinite(egenPoang)) return { lage: 'utanEget', antal }
  return { lage: 'visas', percentil: andelUnder(f, egenPoang), antal }
}

/** Räknarens fyllnad, 0 till 1. */
export function raknarAndel(antal: number, mal = MIN_UNDERLAG): number {
  if (mal <= 0) return 1
  return Math.max(0, Math.min(1, antal / mal))
}

export interface Stapel {
  /** Procent rätt, stapelns början och slut (0 till 100). */
  fran: number
  till: number
  antal: number
  /** Höjd relativ till högsta stapeln, 0 till 1. */
  hojd: number
}

/**
 * Fördelningen i staplar längs procentskalan. Med få poängsteg (logikens 15)
 * blir varje poäng en stapel; med många slås de ihop till högst `max` lika
 * breda staplar, så att formen syns på mobilen.
 */
export function staplar(f: Fordelning, max = 16): Stapel[] {
  const steg = f.maxPoang + 1
  if (steg <= 0 || f.maxPoang === 0) return []
  const grupper = Math.min(max, steg)
  const ut: { fran: number; till: number; antal: number }[] = []
  for (let g = 0; g < grupper; g++) {
    const a = Math.floor((g * steg) / grupper)
    const b = Math.floor(((g + 1) * steg) / grupper)
    let antal = 0
    for (let i = a; i < b; i++) antal += f.perPoang[i] ?? 0
    ut.push({ fran: (a / steg) * 100, till: (b / steg) * 100, antal })
  }
  const hogst = Math.max(1, ...ut.map((s) => s.antal))
  return ut.map((s) => ({ ...s, hojd: s.antal / hogst }))
}

/** Var på procentskalan (0 till 100) en poäng står, i mitten av sitt poängsteg. */
export function poangTillProcent(f: Pick<Fordelning, 'maxPoang'>, poang: number): number {
  const steg = f.maxPoang + 1
  if (steg <= 1) return 0
  const i = Math.max(0, Math.min(f.maxPoang, poang))
  return ((i + 0.5) / steg) * 100
}
