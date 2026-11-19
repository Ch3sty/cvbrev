// src/lib/tester/steg2/namn.ts
// =============================================================================
// Namnen på grupperna i "Var du tappar" för testplanens steg 2: talseriernas
// regelfamiljer och spatial förmågas uppgiftsformer (skissen, resultaten).
// Ren fil, får importeras från klienten.
// =============================================================================

export const FAMILJ_NAMN: Record<string, string> = {
  aritmetisk: 'Samma steg varje gång',
  geometrisk: 'Gånger och delat',
  andra_ordningen: 'Växande differens',
  vaxelvis: 'Växelvis plus och minus',
  varvad: 'Två varvade serier',
  geodiff: 'Differensen fördubblas',
  affin: 'Gånger och plus',
  summa: 'Summan av de två före',
};

export const FORM_NAMN = {
  A: 'Vriden och speglad figur',
  /** Form B utan klipp: vikt och stansat ark, välj hur det ser ut uppvikt. */
  B: 'Uppvikning',
  Bklipp: 'Pappersvikning med klipp',
  C: 'Tärningar och kroppar',
  /** Form D: utvikt ark, välj hur det ser ut ihopvikt (I-provets deltest 2). */
  D: 'Pappersvikning',
} as const;

/**
 * Rubriken över uppgiften för de nya uppgiftstyperna i spatial förmåga
 * (bankversion 5, docs/fragebank/spatial-2026-11-19-omg3.md). De ligger inom
 * formerna A och C, så "Var du tappar" räknar dem som förut per form.
 */
export const SPATIAL_TYP_NAMN = {
  /** Form A med spegellinjer: spegling i två linjer. */
  spegling: 'Speglad figur',
  /** Form C med en kropp av kuber: vy eller snitt. */
  kropp: 'Kroppar',
  /** Rubriken för de äldre typerna, som inte har spegling eller kroppar. */
  vriden: 'Vriden figur',
  tarning: 'Tärningar',
} as const;

/** Passets namn per typ (hemvyn, toppraden). */
export const STEG2_PASS_NAMN = {
  talserie: 'Träna talserier',
  spatial: 'Träna spatial förmåga',
  ordforrad: 'Träna ordförråd',
} as const;
