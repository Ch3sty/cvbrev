// src/lib/tester/v4/monsterNamn.ts
// =============================================================================
// Mönstrens namn i v4 (Hem, Tester, Din utveckling, hintarna och vägen), för
// alla åtta typer på ett ställe. Ingen användartext får vara ett internt id.
//
//   namn   samma namn som resultaten och genomgången redan använder
//          (familjer.json, DEDUKTIV_FAMILJ_NAMN, VN_FAMILJ_NAMN,
//          steg2/namn.ts), så att "Var du tappade" och v4 säger samma sak
//   ova    rubriken för ett förslag att öva, skriven för att läsas som en
//          mening: "Öva på växande steg", "Läs av rätt rad i tabellen".
//          Felslag (numeriskt, "kan inte") formuleras som det de är.
//
// Sessionerna sparar ibland id:t (passen för figurserier, deduktiv, ord och
// siffror) och ibland namnet (Nivåkollen, talserie-, spatial- och
// ordförrådspassen). monsterId() tar båda till id:t, så att samma mönster
// summeras ihop och den riktade träningens adress får nyckeln. Ren fil.
// =============================================================================

import matrisJson from '@/lib/logicTestV7/familjer.json';
import { SERIE_FAMILJER } from '@/lib/figurserierV1/familjer';
import { DEDUKTIV_FAMILJ_NAMN } from '@/lib/deduktivV1/familjer';
import { VN_FAMILJ_NAMN } from '@/lib/tester/pass-copy';
import { FAMILJ_NAMN as TALSERIE_NAMN, FORM_NAMN } from '@/lib/tester/steg2/namn';
import type { TestTypId } from './typer';

type Rad = { namn: string; ova: string };

const MATRIS_NAMN = new Map(
  (matrisJson as { id: string; namn: string }[]).map((f) => [f.id, f.namn] as const),
);

const MATRIS_OVA: Readonly<Record<string, string>> = {
  vridning: 'Öva på figurer som vrider sig',
  monsterrotation: 'Öva på mönster som vrider sig',
  vandring: 'Öva på figurer som flyttar sig',
  'rotation-med-byte': 'Öva på vridning med byte',
  'tva-rorelser': 'Öva på två rörelser samtidigt',
  'latin-antal': 'Öva på varje antal en gång per rad',
  'latin-form': 'Öva på varje form en gång per rad',
  'latin-flera': 'Öva på form och antal per rad',
  overlagring: 'Öva på rutor som läggs ihop',
  spegling: 'Öva på speglingar',
  'antal-andras': 'Öva på antal som ökar eller minskar',
};

const FIGURSERIE_OVA: Readonly<Record<string, string>> = {
  vridning: 'Öva på figurer som vrider sig',
  vandring: 'Öva på pricken som flyttar sig',
  antal: 'Öva på antal som ändras',
  fyllning: 'Öva på form och fyllning',
  vaxande: 'Öva på växande steg',
  vaxelvis: 'Öva på två serier varannan gång',
  flera: 'Öva på två saker som rör sig',
};

const DEDUKTIV_OVA: Readonly<Record<string, string>> = {
  premiss: 'Öva på alla, inga och några',
  plats: 'Öva på fasta platser',
  inte_plats: 'Öva på uteslutna platser',
  granne: 'Öva på bredvid varandra',
  inte_granne: 'Öva på villkoret inte bredvid varandra',
  vanster_om: 'Öva på till vänster om',
  direkt_vanster_om: 'Öva på villkoret direkt till vänster om',
  ordning: 'Öva på före och efter',
  samma_grupp: 'Öva på samma grupp',
  rorelse: 'Öva på villkor i rörelse',
  om_sa: 'Öva på villkor med om och så',
  kvantor: 'Öva på alla, några och ingen',
  sanning: 'Öva på sanning och lögn',
  tabell: 'Öva på tabellpussel',
  kan_inte: 'Öva på frågor om vad som inte kan stämma',
};

const VERBAL_OVA: Readonly<Record<string, string>> = {
  direkt: 'Öva på det som står i texten',
  slutledning: 'Öva på slutsatser ur texten',
  kvantor: 'Öva på alla, inga och ibland',
  utanfor: 'Öva på det texten inte säger',
};

/** Numeriskt: misstagstyper, formulerade som det man gör rätt. */
const NUMERISK_OVA: Readonly<Record<string, string>> = {
  fel_rad: 'Läs av rätt rad i tabellen',
  fel_kolumn: 'Läs av rätt kolumn',
  steg_saknas: 'Ta med alla räknesteg',
  fel_enhet: 'Öva på enhetsbyten',
  fel_bas: 'Räkna procent av rätt tal',
};

const TALSERIE_OVA: Readonly<Record<string, string>> = {
  aritmetisk: 'Öva på samma steg varje gång',
  geometrisk: 'Öva på gånger och delat',
  andra_ordningen: 'Öva på växande differens',
  vaxelvis: 'Öva på växelvis plus och minus',
  varvad: 'Öva på två varvade serier',
  geodiff: 'Öva på differensen som fördubblas',
  affin: 'Öva på gånger och plus',
  summa: 'Öva på summan av de två före',
};

const SPATIAL_OVA: Readonly<Record<string, string>> = {
  A: 'Öva på vridna och speglade figurer',
  B: 'Öva på uppvikning',
  Bklipp: 'Öva på pappersvikning med klipp',
  C: 'Öva på tärningar och kroppar',
  D: 'Öva på pappersvikning',
};

const ORDFORRAD: Readonly<Record<string, Rad>> = {
  synonym: { namn: 'Synonymer', ova: 'Öva på synonymer' },
  antonym: { namn: 'Motsatsord', ova: 'Öva på motsatsord' },
};

function tabell(namn: Readonly<Record<string, string>> | ReadonlyMap<string, string>, ova: Readonly<Record<string, string>>): Record<string, Rad> {
  const ut: Record<string, Rad> = {};
  for (const id of Object.keys(ova)) {
    const n = namn instanceof Map ? namn.get(id) : (namn as Record<string, string>)[id];
    if (n) ut[id] = { namn: n, ova: ova[id] };
  }
  return ut;
}

/** Hela tabellen: typ, id, namn och rubriken att öva. */
export const MONSTER_NAMN: Readonly<Record<TestTypId, Readonly<Record<string, Rad>>>> = {
  matris: tabell(MATRIS_NAMN, MATRIS_OVA),
  figurserie: tabell(new Map(SERIE_FAMILJER.map((f) => [f.id as string, f.namn])), FIGURSERIE_OVA),
  deduktiv: tabell(DEDUKTIV_FAMILJ_NAMN as Record<string, string>, DEDUKTIV_OVA),
  verbal: tabell(VN_FAMILJ_NAMN, VERBAL_OVA),
  numerisk: tabell(VN_FAMILJ_NAMN, NUMERISK_OVA),
  talserie: tabell(TALSERIE_NAMN, TALSERIE_OVA),
  spatial: tabell(FORM_NAMN as Record<string, string>, SPATIAL_OVA),
  ordforrad: ORDFORRAD,
};

/** Id:t ur ett id eller ett namn (sessionerna sparar båda). Null när det inte går att känna igen. */
export function monsterId(typ: TestTypId, f: string | null | undefined): string | null {
  if (!f) return null;
  const t = MONSTER_NAMN[typ];
  if (t[f]) return f;
  const lag = f.trim().toLowerCase();
  for (const [id, r] of Object.entries(t)) if (r.namn.toLowerCase() === lag) return id;
  return null;
}

/** Mönstrets namn, aldrig ett id. Null för det som inte går att känna igen. */
export function monsterNamn(typ: TestTypId, f: string | null | undefined): string | null {
  const id = monsterId(typ, f);
  return id ? MONSTER_NAMN[typ][id].namn : null;
}

/** Rubriken för förslaget att öva: "Öva på växande steg". */
export function ovaPa(typ: TestTypId, f: string | null | undefined): string | null {
  const id = monsterId(typ, f);
  return id ? MONSTER_NAMN[typ][id].ova : null;
}
