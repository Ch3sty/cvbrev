// src/lib/traning/familjer.ts
// =============================================================================
// "Var du tappar": andel rätt per mönsterfamilj, ackumulerat över mätningen
// och passen, de två lägsta, plus familjer där svaren var rätt men långsamma
// (spec-rummen 6 våg 3a, briefen 3.3 och modul 4).
//
// Familjen kommer ur bankens fält `family` (våg 3c). Fältet läses defensivt:
// saknas det räknas svaret inte in här, och "Var du tappar" blir tomt i
// stället för att gissa. Ingen familj härleds ur frågans id.
// =============================================================================

export interface FamiljSvar {
  family: string | null | undefined;
  correct: boolean;
  /** Rätt men över provets tid (tempo.ts, arLangsam). */
  langsam?: boolean;
}

export interface Familjestatistik {
  family: string;
  ratt: number;
  antal: number;
  /** ratt / antal, 0 till 1. */
  andel: number;
  /** Antal svar som var rätt men långsamma. */
  ratt_men_langsamma: number;
}

/** Läser bankens family-fält. Tom sträng och annat än text ger null. */
export function lasFamilj(varde: unknown): string | null {
  if (typeof varde !== 'string') return null;
  const t = varde.trim();
  return t.length > 0 ? t : null;
}

export function familjestatistik(svar: readonly FamiljSvar[]): Familjestatistik[] {
  const per = new Map<string, Familjestatistik>();
  for (const s of svar) {
    const family = lasFamilj(s.family);
    if (!family) continue;
    const f = per.get(family) ?? { family, ratt: 0, antal: 0, andel: 0, ratt_men_langsamma: 0 };
    f.antal += 1;
    if (s.correct) f.ratt += 1;
    if (s.correct && s.langsam) f.ratt_men_langsamma += 1;
    per.set(family, f);
  }
  return [...per.values()]
    .map((f) => ({ ...f, andel: f.antal ? f.ratt / f.antal : 0 }))
    .sort((a, b) => a.family.localeCompare(b.family, 'sv'));
}

/**
 * De n familjerna med lägst andel rätt. Lika andel: fler svar först (säkrare
 * underlag), sedan namnet. Familjer med alla rätt tas inte med: där tappar
 * hon inte.
 */
export function svagasteFamiljer(stat: readonly Familjestatistik[], n = 2): Familjestatistik[] {
  return stat
    .filter((f) => f.antal > 0 && f.ratt < f.antal)
    .sort(
      (a, b) =>
        a.andel - b.andel || b.antal - a.antal || a.family.localeCompare(b.family, 'sv')
    )
    .slice(0, n);
}

/** Familjer där svaren var rätt men långsamma, flest först. */
export function rattMenLangsamma(stat: readonly Familjestatistik[]): Familjestatistik[] {
  return stat
    .filter((f) => f.ratt_men_langsamma > 0)
    .sort(
      (a, b) =>
        b.ratt_men_langsamma - a.ratt_men_langsamma || a.family.localeCompare(b.family, 'sv')
    );
}

export interface VarDuTappar {
  svagaste: Familjestatistik[];
  langsamma: Familjestatistik[];
  /** Alla familjer, för "Alla familjer"-länken. */
  alla: Familjestatistik[];
}

export function varDuTappar(svar: readonly FamiljSvar[]): VarDuTappar {
  const alla = familjestatistik(svar);
  return { svagaste: svagasteFamiljer(alla), langsamma: rattMenLangsamma(alla).slice(0, 1), alla };
}
