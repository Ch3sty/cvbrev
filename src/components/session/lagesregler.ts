// src/components/session/lagesregler.ts
// =============================================================================
// Lägesreglerna (plan-testflode-2026-11-20 avsnitt 2): lägena skiljer sig i
// fem flaggor som ramen läser. Ingen annan komponent fattar egna beslut om
// återkoppling, navigering, tid, hopp eller gest; typerna ritar bara sin
// uppgift. Ren, går att importera från klienten och från testerna.
// =============================================================================

/**
 * publikt: det publika provet utan konto (omgång 2, steg C bygger vyerna):
 * ingen klocka, ingen Förklaring, inget facit, ingen väg tillbaka, räknaren
 * utan chevron och avbryt-dialogen "Avbryta provet? Inget sparas.".
 */
export type Lage = 'nivakoll' | 'nivatest' | 'trana' | 'ovningsprov' | 'iprov' | 'personlighet' | 'publikt';

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
  /** Facit och Förklaringen finns, direkt eller efteråt. Falskt bara i det publika provet: utfallet syns, rätt svar och regeln aldrig. */
  facit: boolean;
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
      return { aterkoppling: 'efter', navigering: 'linjar', tid: 'ingen', hopp: 'nej', gest: 'bekrafta', facit: true };
    case 'nivatest':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'mjuk', hopp: 'ja', gest: 'bekrafta', facit: true };
    case 'trana':
      return {
        aterkoppling: val.forklaringEfterSvar === false ? 'efter' : 'direkt',
        navigering: 'linjar',
        tid: 'referens',
        hopp: 'vet_inte',
        gest: 'bekrafta',
        facit: true,
      };
    case 'ovningsprov':
      return { aterkoppling: 'efter', navigering: val.adaptiv ? 'linjar' : 'fri', tid: 'hard', hopp: 'ja', gest: 'bekrafta', facit: true };
    case 'iprov':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'hard', hopp: 'ja', gest: 'bekrafta', facit: true };
    case 'publikt':
      return { aterkoppling: 'efter', navigering: 'linjar', tid: 'ingen', hopp: 'nej', gest: 'bekrafta', facit: false };
    case 'personlighet':
      return { aterkoppling: 'efter', navigering: 'fri', tid: 'ingen', hopp: 'nej', gest: 'ett_tryck', facit: true };
  }
}

/** Uppgiftsarket och ‹ finns bara där man får gå tillbaka. */
export function harTillbaka(r: Lagesregler): boolean {
  return r.navigering === 'fri';
}

/** Sista knappen i läget (avsnitt 2, "Sista knappen"). */
export function sistaKnapp(lage: Lage): 'lamna_in' | 'visa_resultatet' {
  return lage === 'nivakoll' || lage === 'trana' || lage === 'publikt' ? 'visa_resultatet' : 'lamna_in';
}

/** Innehållsformerna (avsnitt 3): kolumnens bredd på dator. */
export type Innehallsform = 'smal' | 'mellan' | 'remsa' | 'bred';

export const FORM_BREDD: Record<Innehallsform, number> = {
  smal: 432,
  mellan: 560,
  remsa: 672,
  bred: 1000,
};

/** Kolumnens bredd från xl (1280 px), omgång 2 steg A: ett steg större på bred skärm. */
export const FORM_BREDD_XL: Record<Innehallsform, number> = {
  smal: 496,
  mellan: 600,
  remsa: 816,
  bred: 1120,
};

/** Toppluften i kolumnen från lg: rubriken står på samma pixel genom hela sessionen. */
export const TOPPLUFT = 'clamp(40px, calc((100dvh - 920px) / 2), 120px)';
