// Tidslinjen för versionen med riktigt spår: "What About Action?" av Diego Nava
// (Mixkit, Stock Music Free License), 123 BPM. Klippet: takt 29 till 31 (breaken) som
// intro, drop på takt 32 till 39, sedan spårets egen avslutning takt 53 till 56.
// Delas av animationen och scripts/ljud.ts så att bild, musik och effekter sitter ihop.

export const BPM = 123;
export const SLAG = 60 / BPM; // 0,4878 s
export const TAKT = 4 * SLAG; // 1,9512 s
export const takt = (k: number) => k * TAKT;
export const slag = (k: number) => k * SLAG;

// Spåret: första downbeat 0,264 s, takt k börjar vid 0,264 + k * TAKT.
export const SPAR = {
  fil: 'musik/474.mp3',
  forstaSlag: 0.264,
  klipp: [
    { franTakt: 29, takter: 3 }, // break, intro
    { franTakt: 32, takter: 8 }, // drop
    { franTakt: 53, takter: 4, svans: 0.73 }, // avslutningen med slutslaget
  ],
};

export const DROP = takt(3); // 5,854 s
export const SLUTSLAG = takt(15); // 29,268 s

// Scenerna i videons tid. `ankare` är par [ny tid, scenens interna tid] så att
// scenernas egna händelser (svaret, nivåsteget) landar på slag.
export type Scen = {
  id: 'kallelsen' | 'logik' | 'verbalt' | 'numeriskt' | 'resultat' | 'genomgang' | 'hemvy' | 'provet' | 'personlighet' | 'avslut';
  fran: number;
  till: number;
  ankare: [number, number][];
};

const b = (taktNr: number, slagNr = 0) => takt(taktNr) + slag(slagNr);

export const SCENER: Scen[] = [
  { id: 'kallelsen', fran: 0, till: DROP, ankare: [] },
  { id: 'logik', fran: b(3), till: b(5), ankare: [[b(3), 3.0], [b(3, 1), 3.5], [b(4, 2), 6.0], [b(5), 7.0]] },
  { id: 'verbalt', fran: b(5), till: b(6), ankare: [[b(5), 7.0], [b(5, 1), 7.75], [b(5, 1.5), 8.0], [b(5, 2), 8.75], [b(6), 10.0]] },
  { id: 'numeriskt', fran: b(6), till: b(7), ankare: [[b(6), 10.0], [b(6, 1), 10.75], [b(6, 2), 12.25], [b(7), 13.0]] },
  { id: 'resultat', fran: b(7), till: b(8), ankare: [[b(7), 13.0], [b(7, 1), 13.5], [b(8), 15.4]] },
  { id: 'genomgang', fran: b(8), till: b(9), ankare: [[b(8), 15.72], [b(8, 1), 16.25], [b(8, 2), 17.0], [b(9), 18.0]] },
  { id: 'hemvy', fran: b(9), till: b(11), ankare: [[b(9), 18.0], [b(10), 20.0], [b(11), 22.0]] },
  { id: 'provet', fran: b(11), till: b(12), ankare: [[b(11), 22.0], [b(11, 2), 23.0], [b(12), 24.0]] },
  { id: 'personlighet', fran: b(12), till: b(13), ankare: [[b(12), 24.0], [b(12, 1), 25.0], [b(12, 2), 25.6], [b(13), 27.0]] },
  { id: 'avslut', fran: b(13), till: 30, ankare: [] },
];

/** Scenens interna tid för videons tid t, styckvis linjär mellan ankarna. */
export const internTid = (s: Scen, t: number) => {
  const a = s.ankare;
  if (!a.length) return t;
  if (t <= a[0][0]) return a[0][1] + (t - a[0][0]);
  for (let i = 1; i < a.length; i++) {
    if (t <= a[i][0]) {
      const p = (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0]);
      return a[i - 1][1] + p * (a[i][1] - a[i - 1][1]);
    }
  }
  const sista = a[a.length - 1];
  return sista[1] + (t - sista[0]);
};

/** Videons tid för en intern händelse i scenen (inversen, för ljudeffekterna). */
export const videoTid = (id: Scen['id'], intern: number) => {
  const s = SCENER.find((x) => x.id === id)!;
  const a = s.ankare;
  for (let i = 1; i < a.length; i++) {
    if (intern <= a[i][1]) {
      const p = (intern - a[i - 1][1]) / (a[i][1] - a[i - 1][1]);
      return a[i - 1][0] + p * (a[i][0] - a[i - 1][0]);
    }
  }
  return a[a.length - 1][0];
};

export const scenVid = (t: number) => SCENER.find((s) => t >= s.fran && t < s.till) ?? SCENER[SCENER.length - 1];

// Rubrikerna i videons tid, varje slår in på ett downbeat.
export const RUBRIKER: { fran: number; till: number; rader: string[] }[] = [
  { fran: b(3), till: b(5), rader: ['Logiktest'] },
  { fran: b(5), till: b(6), rader: ['Verbalt', 'resonemang'] },
  { fran: b(6), till: b(7), rader: ['Numeriskt test'] },
  { fran: b(7), till: b(8), rader: ['Rätt, fel och', 'nivå direkt'] },
  { fran: b(8), till: b(9), rader: ['Och regeln bakom', 'varje fråga'] },
  { fran: b(9), till: b(11), rader: ['Din nivå fram', 'till provdagen'] },
  { fran: b(11), till: b(12), rader: ['Och övningsprov', 'mot klockan'] },
  { fran: b(12), till: b(13), rader: ['Personlighetsprofil.', 'Inga rätta svar.'] },
];
export const UNDERRAD = { fran: b(3, 1), till: b(7) };
