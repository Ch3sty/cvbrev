// Version 3: "Gotta Go Fast" (bombinsound, Pixabay Content License), 92,25 BPM.
// Klipp: takt 0 till 8 (introt filtreras i mixen, dropen öppnar filtret på takt 2),
// sedan spårets avslutning takt 19 till 21. Delas av bilden och scripts/ljud3.ts.

export const BPM = 92.25;
export const SLAG = 60 / BPM; // 0,6504 s
export const TAKT = 4 * SLAG; // 2,6016 s
export const takt = (k: number, s = 0) => k * TAKT + s * SLAG;

export const SPAR3 = {
  fil: 'musik/gotta-go-fast.mp3',
  forstaSlag: 0.472,
  klipp: [
    { franTakt: 0, takter: 8 },
    { franTakt: 19, takter: 3, svans: 1.38 },
  ],
};

export const DROP = takt(2); // 5,203 s
export const MORF = takt(3, 2); // 9,106 s: rätt svar fyller bilden och blir nästa scen

// Logiktestet: pilen hoppar på åttondelar under takt 2, alternativen på takt 3,
// svaret på slag 1 i takt 3, sedan växer rutan till hela bilden.
export const LOGIK_ANKARE: [number, number][] = [
  [takt(2), 3.0],
  [takt(2, 0.5), 3.5],
  [takt(3), 5.25],
  [takt(3, 1), 6.0],
  [takt(3, 2), 6.6],
];

// ---------------------------------------------------------------------------
// Hela videon. Ankarna är [videons tid, scenens interna tid] (se src/scener).

export const T = {
  verbalt: MORF, // 9,106
  numeriskt: takt(4, 2), // 11,708
  resultat: takt(5, 2), // 14,309
  nivasteg: takt(6), // 15,610
  genomgang: takt(6, 2), // 16,911
  hemvy: takt(7, 1), // 18,862
  provet: takt(8), // 20,813
  personlighet: takt(9), // 23,415
  avslut: takt(10), // 26,016
  slut: takt(11), // 28,618
};

export const ANKARE = {
  verbalt: [[T.verbalt, 7.0], [takt(3, 2.5), 7.75], [takt(3, 3), 8.0], [takt(4), 8.75], [T.numeriskt, 9.9]] as [number, number][],
  numeriskt: [[T.numeriskt, 10.0], [takt(4, 2.5), 10.5], [takt(4, 3), 10.75], [takt(4, 3.5), 11.5], [takt(5), 12.25], [T.resultat, 13.0]] as [number, number][],
  resultat: [[T.resultat, 13.0], [takt(5, 3), 13.4], [T.nivasteg, 13.5], [T.genomgang, 15.4]] as [number, number][],
  genomgang: [[T.genomgang, 15.95], [takt(6, 2.5), 16.25], [takt(6, 3), 16.6], [takt(7), 17.0], [T.hemvy, 18.0]] as [number, number][],
  hemvy: [[T.hemvy, 18.0], [takt(7, 2.5), 19.0], [takt(7, 3), 20.0], [T.provet, 20.6]] as [number, number][],
  provet: [[T.provet, 22.0], [T.personlighet, 24.0]] as [number, number][],
  personlighet: [[T.personlighet, 24.0], [takt(9, 1), 25.0], [takt(9, 1.5), 25.25], [takt(9, 2.5), 26.0], [T.avslut, 27.0]] as [number, number][],
};

export const RUBRIKER3: { fran: number; till: number; rader: string[] }[] = [
  { fran: DROP, till: T.verbalt, rader: ['Logiktest'] },
  { fran: T.verbalt + 0.15, till: T.numeriskt, rader: ['Verbalt', 'resonemang'] },
  { fran: T.numeriskt + 0.1, till: T.resultat, rader: ['Numeriskt', 'test'] },
  { fran: T.resultat + 0.1, till: T.genomgang, rader: ['Rätt, fel och', 'nivå direkt'] },
  { fran: T.genomgang + 0.1, till: T.hemvy, rader: ['Och regeln bakom', 'varje fråga'] },
  { fran: T.hemvy + 0.1, till: T.provet, rader: ['Din nivå fram', 'till provdagen'] },
  { fran: T.provet, till: T.personlighet, rader: ['Och övningsprov', 'mot klockan'] },
  { fran: T.personlighet + 0.1, till: T.avslut - 0.25, rader: ['Personlighetsprofil.', 'Inga rätta svar.'] },
];
