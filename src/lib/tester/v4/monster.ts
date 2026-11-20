// src/lib/tester/v4/monster.ts
// Svagaste mönstret och tempot per testtyp (planen 2.2 punkt 3 och 4). Ren.
//
// Matrisen läser varDuTappar.svagaste ur Traningsstatus. Övriga typer:
// de 30 senaste dagarnas tappade familjer ur sessionernas meta summeras.
// Krav: minst sex svar och under 60 procent rätt.

export const MONSTER_MIN_SVAR = 6;
export const MONSTER_GRANS = 0.6;
export const TEMPO_GRANS = 0.3;
export const MONSTER_DAGAR = 30;

export interface MonsterSumma {
  family: string;
  namn: string;
  ratt: number;
  antal: number;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null);
const tal = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Tappade familjer ur en sessions meta. Motorerna skriver olika former:
 * en lista { family|familj|grupp, ratt, antal } eller en karta
 * family → { ratt, antal }. Okända former ger tom lista.
 */
export function tappadeUrMeta(meta: unknown): { family: string; ratt: number; antal: number }[] {
  const m = obj(meta);
  const r = obj(m?.resultat);
  const kalla = r?.tappade ?? m?.tappade ?? r?.familjer ?? m?.familjer;
  const ut: { family: string; ratt: number; antal: number }[] = [];
  if (Array.isArray(kalla)) {
    for (const x of kalla) {
      const o = obj(x);
      const family = (o?.family ?? o?.familj ?? o?.grupp ?? o?.id) as unknown;
      const antal = tal(o?.antal) ?? tal(o?.total);
      const ratt = tal(o?.ratt) ?? (antal != null && tal(o?.fel) != null ? antal - (tal(o?.fel) as number) : null);
      if (typeof family === 'string' && antal != null && ratt != null) ut.push({ family, ratt, antal });
    }
  } else if (obj(kalla)) {
    for (const [family, v] of Object.entries(kalla as Obj)) {
      const o = obj(v);
      const antal = tal(o?.antal) ?? tal(o?.total);
      const ratt = tal(o?.ratt);
      if (antal != null && ratt != null) ut.push({ family, ratt, antal });
    }
  }
  return ut;
}

/** Summerar familjerna och väljer den svagaste som klarar kraven, eller null. */
export function svagasteMonster(
  sessioner: readonly { meta?: unknown }[],
  namnFor: (family: string) => string = (f) => f
): MonsterSumma | null {
  const summa = new Map<string, { ratt: number; antal: number }>();
  for (const s of sessioner) {
    for (const t of tappadeUrMeta(s.meta)) {
      const v = summa.get(t.family) ?? { ratt: 0, antal: 0 };
      v.ratt += t.ratt;
      v.antal += t.antal;
      summa.set(t.family, v);
    }
  }
  let bast: MonsterSumma | null = null;
  for (const [family, v] of summa) {
    if (v.antal < MONSTER_MIN_SVAR || v.ratt / v.antal >= MONSTER_GRANS) continue;
    const andel = v.ratt / v.antal;
    if (!bast || andel < bast.ratt / bast.antal || (andel === bast.ratt / bast.antal && v.antal > bast.antal)) {
      bast = { family, namn: namnFor(family), ratt: v.ratt, antal: v.antal };
    }
  }
  return bast;
}

/** Är mönstret svagt nog för en hint? */
export function arSvagt(m: { ratt: number; antal: number } | null | undefined): boolean {
  return !!m && m.antal >= MONSTER_MIN_SVAR && m.ratt / m.antal < MONSTER_GRANS;
}

/**
 * Andel svar över provets tid per uppgift, ur answers[].time_spent mot
 * budgeten i sekunder. Null utan svar.
 */
export function tempoAndel(answers: readonly unknown[], budgetS: number): number | null {
  let antal = 0;
  let over = 0;
  for (const a of answers) {
    const t = tal(obj(a)?.time_spent);
    if (t == null) continue;
    antal++;
    if (t > budgetS) over++;
  }
  return antal ? over / antal : null;
}

/** Samma räkning som tempoAndel, med antalen (omgång 3: "6 av 20 svar"). Null utan svar. */
export function tempoRakning(sessioner: readonly { answers?: unknown }[], budgetS: number): { over: number; antal: number; budgetS: number } | null {
  let antal = 0;
  let over = 0;
  for (const s of sessioner) {
    if (!Array.isArray(s.answers)) continue;
    for (const a of s.answers) {
      const t = tal(obj(a)?.time_spent);
      if (t == null) continue;
      antal++;
      if (t > budgetS) over++;
    }
  }
  return antal ? { over, antal, budgetS } : null;
}

/** Tempot över flera sessioners svar. */
export function tempoForSessioner(sessioner: readonly { answers?: unknown }[], budgetS: number): number | null {
  const alla: unknown[] = [];
  for (const s of sessioner) if (Array.isArray(s.answers)) alla.push(...s.answers);
  return tempoAndel(alla, budgetS);
}
