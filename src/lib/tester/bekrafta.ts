// src/lib/tester/bekrafta.ts
// =============================================================================
// Bekräftelserna i testflödet (plan-testflode-2026-11-20, avsnitt 6 Ordlista):
// X frågar innan sessionen lämnas, och Lämna in frågar innan svaren rättas.
// Samma ord i alla lägen; bara objektet byts ("Avbryta träningen?").
// Ren, går att importera från klienten.
// =============================================================================

export type AvbrytLage = 'nivatest' | 'traning' | 'nivakoll' | 'ovningsprov' | 'test';

const OBJEKT: Record<AvbrytLage, string> = {
  nivatest: 'nivåtestet',
  traning: 'träningen',
  nivakoll: 'Nivåkollen',
  ovningsprov: 'övningsprovet',
  test: 'testet',
};

/** Raden under rubriken där läget sparar svaren; övriga får tillbaka-raden. */
const AVBRYT_TEXT: Partial<Record<AvbrytLage, string>> = {
  traning: 'Svaren du har gett är sparade.',
  nivakoll: 'Svaren du har gett är sparade.',
};

export const AVBRYT = {
  /** X:ets namn för skärmläsaren. */
  aria: 'Avbryt',
  titel: (lage: AvbrytLage) => `Avbryta ${OBJEKT[lage]}?`,
  text: (lage: AvbrytLage): string => AVBRYT_TEXT[lage] ?? 'Du går tillbaka till Rekryteringstester.',
  bekrafta: 'Avbryt',
  fortsatt: 'Fortsätt',
} as const;

/** Enheten i Lämna in-raden, med rätt böjning (en uppgift, ett påstående). */
export const ENHET = {
  uppgift: { en: 'uppgift är obesvarad', flera: 'uppgifter är obesvarade' },
  pastaende: { en: 'påstående är obesvarat', flera: 'påståenden är obesvarade' },
} as const;

export const LAMNA_IN = {
  titel: 'Lämna in?',
  /** "3 uppgifter är obesvarade." Enheten kan bytas, till exempel påståenden. */
  text: (obesvarade: number, enhet: { en: string; flera: string } = ENHET.uppgift) =>
    obesvarade > 0
      ? `${obesvarade} ${obesvarade === 1 ? enhet.en : enhet.flera}. Efter inlämningen går svaren inte att ändra.`
      : 'Efter inlämningen går svaren inte att ändra.',
  bekrafta: 'Lämna in',
  fortsatt: 'Fortsätt',
} as const;
