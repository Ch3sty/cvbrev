// src/components/session/lagesregler.ts
// =============================================================================
// Lägesreglerna (plan-testflode-2026-11-20 avsnitt 2): lägena skiljer sig i
// fem flaggor som ramen läser. Ingen annan komponent fattar egna beslut om
// återkoppling, navigering, tid, hopp eller gest; typerna ritar bara sin
// uppgift. Ren, går att importera från klienten och från testerna.
// =============================================================================

export type Lage = 'nivakoll' | 'nivatest' | 'trana' | 'ovningsprov' | 'iprov' | 'personlighet';

export interface Lagesregler {
  /** direkt: facit och Förklaringen efter varje svar (Träna). efter: tyst till resultatet. */
  aterkoppling: 'direkt' | 'efter';
  /** fri: ‹, räknaren och uppgiftsarket. linjar: bara framåt. */
  navigering: 'fri' | 'linjar';
  /** ingen: inget i hörnet. referens: ringen fylls per uppgift mot provets tid. mjuk: nedräkning som inte stoppar. hard: inlämning vid noll. */
  tid: 'ingen' | 'referens' | 'mjuk' | 'hard';
  /** nej: Nästa inaktiv tills ett svar är valt. ja: Nästa utan val lämnar obesvarad. vet_inte: "Vet inte" i foten. */
  hopp: 'nej' | 'ja' | 'vet_inte';
  /** bekrafta: tryck markerar, knappen bekräftar. ett_tryck: trycket är svaret (bara personlighet). */
  gest: 'bekrafta' | 'ett_tryck';
}

export interface LagesVal {
  /** Träna: kryssrutan "Förklaring efter varje svar". Standard på. */
  forklaringEfterSvar?: boolean;
  /** Adaptiva format (matrisens Nivåkoll och Träna, logikens adaptiva prov): ingen väg tillbaka. */
  adaptiv?: boolean;
}

export function lagesregler(lage: Lage, val: LagesVal = {}): Lagesregler {
  switch (lage) {
    case 'nivakoll':
      return { aterkoppling: 'efter', navigering: 'linjar', tid: 'ingen', hopp: 'nej', gest: 'bekrafta' };
    case 'nivatest':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'mjuk', hopp: 'ja', gest: 'bekrafta' };
    case 'trana':
      return {
        aterkoppling: val.forklaringEfterSvar === false ? 'efter' : 'direkt',
        navigering: 'linjar',
        tid: 'referens',
        hopp: 'vet_inte',
        gest: 'bekrafta',
      };
    case 'ovningsprov':
      return { aterkoppling: 'efter', navigering: val.adaptiv ? 'linjar' : 'fri', tid: 'hard', hopp: 'ja', gest: 'bekrafta' };
    case 'iprov':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'hard', hopp: 'ja', gest: 'bekrafta' };
    case 'personlighet':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'ingen', hopp: 'nej', gest: 'ett_tryck' };
  }
}

/** Uppgiftsarket och ‹ finns bara där man får gå tillbaka. */
export function harTillbaka(r: Lagesregler): boolean {
  return r.navigering === 'fri';
}

/** Sista knappen i läget (avsnitt 2, "Sista knappen"). */
export function sistaKnapp(lage: Lage): 'lamna_in' | 'visa_resultatet' {
  return lage === 'nivakoll' || lage === 'trana' ? 'visa_resultatet' : 'lamna_in';
}

/** Innehållsformerna (avsnitt 3): kolumnens bredd på dator. */
export type Innehallsform = 'smal' | 'mellan' | 'remsa' | 'bred';

export const FORM_BREDD: Record<Innehallsform, number> = {
  smal: 432,
  mellan: 560,
  remsa: 672,
  bred: 1000,
};
