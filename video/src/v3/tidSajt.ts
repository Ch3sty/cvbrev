// Sajtversionen: kortare (19,5 s), produkten i bild från första bildrutan, ingen
// personlighetsscen, fungerar utan ljud. Samma takt som spåret (92,25 BPM) så att
// ljudet som går att slå på sitter. Spåret: takt 0 till 5, sedan avslutningstakten 21.

import { takt } from './tid3';

export const SAJT_LANGD = 19.5;

export const SPAR_SAJT = {
  fil: 'musik/gotta-go-fast.mp3',
  forstaSlag: 0.472,
  klipp: [
    { franTakt: 0, takter: 6 },
    { franTakt: 21, takter: 1, svans: 1.29 },
  ],
};

export const S = {
  logik: 0,
  verbalt: takt(1, 1), // 3,25
  numeriskt: takt(2, 1), // 5,85
  resultat: takt(3, 1), // 8,46
  nivasteg: takt(3, 2), // 9,11
  genomgang: takt(4), // 10,41
  hemvy: takt(4, 3), // 12,36
  provet: takt(5, 2), // 14,31
  avslut: takt(6), // 15,61
  tryck: takt(7), // 18,21
};

export const ANKARE_SAJT = {
  logik: [[0, 4.25], [takt(0, 3), 5.25], [takt(1), 6.0], [S.verbalt, 6.6]] as [number, number][],
  verbalt: [[S.verbalt, 7.2], [takt(1, 1.5), 7.75], [takt(1, 2), 8.0], [takt(1, 3), 8.75], [S.numeriskt, 9.9]] as [number, number][],
  numeriskt: [[S.numeriskt, 10.1], [takt(2, 1.5), 10.5], [takt(2, 2), 10.75], [takt(2, 2.5), 11.5], [takt(2, 3), 12.25], [S.resultat, 13.0]] as [number, number][],
  resultat: [[S.resultat, 13.0], [takt(3, 1.5), 13.4], [S.nivasteg, 13.5], [S.genomgang, 15.4]] as [number, number][],
  genomgang: [[S.genomgang, 16.0], [takt(4, 0.5), 16.25], [takt(4, 1), 16.6], [takt(4, 1.5), 17.0], [S.hemvy, 18.0]] as [number, number][],
  hemvy: [[S.hemvy, 18.0], [takt(5, 0.5), 19.0], [takt(5, 1), 20.0], [S.provet, 20.6]] as [number, number][],
};

export const RUBRIKER_SAJT: { fran: number; till: number; rader: string[] }[] = [
  { fran: 0, till: takt(0, 2), rader: ['Kallad till ett', 'rekryteringstest?'] },
  { fran: takt(0, 2), till: S.verbalt, rader: ['Logiktest'] },
  { fran: S.verbalt, till: S.numeriskt, rader: ['Verbalt', 'resonemang'] },
  { fran: S.numeriskt, till: S.resultat, rader: ['Numeriskt test'] },
  { fran: S.resultat, till: S.genomgang, rader: ['Rätt, fel och', 'nivå direkt'] },
  { fran: S.genomgang, till: S.hemvy, rader: ['Och regeln bakom', 'varje fråga'] },
  { fran: S.hemvy, till: S.provet, rader: ['Din nivå fram', 'till provdagen'] },
  { fran: S.provet, till: S.avslut, rader: ['Och övningsprov', 'mot klockan'] },
];
