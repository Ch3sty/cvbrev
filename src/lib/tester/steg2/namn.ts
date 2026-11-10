// src/lib/tester/steg2/namn.ts
// =============================================================================
// Namnen på grupperna i "Var du tappar" för testplanens steg 2: talseriernas
// regelfamiljer och spatial förmågas uppgiftsformer (skissen, resultaten).
// Ren fil, får importeras från klienten.
// =============================================================================

export const FAMILJ_NAMN: Record<string, string> = {
  aritmetisk: 'Samma steg varje gång',
  geometrisk: 'Gånger samma tal',
  andra_ordningen: 'Växande differens',
  vaxelvis: 'Växelvis plus och minus',
  varvad: 'Två varvade serier',
  geodiff: 'Differensen fördubblas',
  affin: 'Gånger och plus',
  summa: 'Summan av de två före',
};

export const FORM_NAMN = {
  A: 'Vriden figur',
  /** Form B utan klipp: vikt och stansat ark, välj hur det ser ut uppvikt. */
  B: 'Uppvikning',
  Bklipp: 'Pappersvikning med klipp',
  C: 'Tärningar',
  /** Form D: utvikt ark, välj hur det ser ut ihopvikt (I-provets deltest 2). */
  D: 'Pappersvikning',
} as const;

/** Passets namn per typ (hemvyn, toppraden). */
export const STEG2_PASS_NAMN = {
  talserie: 'Talseriepass',
  spatial: 'Spatialpass',
  ordforrad: 'Ordpass',
} as const;
