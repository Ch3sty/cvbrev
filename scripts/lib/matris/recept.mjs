// scripts/lib/matris/recept.mjs
// =============================================================================
// Recepten för våg 3c: vilka frågor varje nivå får, per familj, med regel-
// parametrar och svårighetsprior. Regeln varieras (steg, riktning, format,
// operation, speglingslinje), inte bara startläget (kvalitetsregel 8).
//
// Svårighetsprior 1-4 (spec-rummen 6, våg 3a: p = 0,85 / 0,7 / 0,55 / 0,4
// tills frågan har 30 svar). Grund 1-3, avancerad 2-4, expert 3-4.
//
// Id: v7g-3c-, v7a-3c-, v7e-3c- + familjens förkortning + löpnummer. Ett id
// får aldrig byta innehåll när det väl är incheckat (generatorn vägrar).
// =============================================================================

const KORT = {
  vridning: 'vrid', monsterrotation: 'rot', vandring: 'vand', 'rotation-med-byte': 'byte', 'tva-rorelser': 'tva',
  'latin-antal': 'lant', 'latin-form': 'lform', 'latin-flera': 'lfler', overlagring: 'over', spegling: 'speg', 'antal-andras': 'antal',
};

function lista(prefix, rader) {
  const raknare = {};
  return rader.map(([familj, byggare, p, difficulty]) => {
    raknare[familj] = (raknare[familj] ?? 0) + 1;
    return { id: `${prefix}-${KORT[familj]}-${String(raknare[familj]).padStart(2, '0')}`, familj, byggare, p, difficulty };
  });
}

const BAL = {
  enKvadrat: { square: { d: 1, sida: 'vaxlar' } },
  motsattFast: { square: { d: 1, sida: 'fast' }, circle: { d: 2, sida: 'fast' } },
  hogerVaxlarVansterFast: { square: { d: 1, sida: 'vaxlar' }, circle: { d: 2, sida: 'fast' } },
  vansterFastHogerVaxlar: { square: { d: 2, sida: 'fast' }, circle: { d: 1, sida: 'vaxlar' } },
  bådaHogerVaxlar: { square: { d: 1, sida: 'vaxlar' }, circle: { d: 1, sida: 'vaxlar' } },
  motsattVaxlar: { square: { d: 2, sida: 'vaxlar' }, circle: { d: 1, sida: 'vaxlar' } },
  bådaVansterKvadratVaxlar: { square: { d: 2, sida: 'vaxlar' }, circle: { d: 2, sida: 'fast' } },
  enCirkel: { circle: { d: 2, sida: 'vaxlar' } },
};

export const GRUND = lista('v7g-3c', [
  ['vridning', 'pilVridning', { k: 1, dir: 'cw' }, 1],
  ['vridning', 'pilVridning', { k: 1, dir: 'ccw' }, 1],
  ['vridning', 'pilVridning', { k: 2, dir: 'cw' }, 1],
  ['vridning', 'pilVridning', { k: 3, dir: 'cw' }, 2],
  ['vridning', 'pilVridning', { k: 2, dir: 'ccw', langd: 'short' }, 1],
  ['vridning', 'stralVridning', { k: 1, dir: 'cw', monster: [0, 2] }, 2],
  ['vridning', 'stralVridning', { k: 2, dir: 'ccw', monster: [0, 1] }, 2],

  ['monsterrotation', 'latticeMonster', { dir: 'cw', typer: ['fill_black', 'fill_gray'] }, 2],
  ['monsterrotation', 'latticeMonster', { dir: 'ccw', typer: ['fill_black', 'dot'] }, 2],
  ['monsterrotation', 'sektorRotation', { k: 2, dir: 'cw', antal: 2 }, 2],
  ['monsterrotation', 'sektorRotation', { k: 1, dir: 'ccw', antal: 2 }, 2],
  ['monsterrotation', 'tileRotation', { dir: 'cw', antal: 3 }, 3],
  ['monsterrotation', 'tileRotation', { dir: 'ccw', antal: 3 }, 3],

  ['vandring', 'latticeVandring', { dir: 'cw', typ: 'fill_black' }, 1],
  ['vandring', 'latticeVandring', { dir: 'ccw', typ: 'fill_gray' }, 1],
  ['vandring', 'latticeVandring', { dir: 'cw', typ: 'dot' }, 1],
  ['vandring', 'orbitalVandring', { k: 1, dir: 'cw', center: 'filled' }, 1],
  ['vandring', 'orbitalVandring', { k: 2, dir: 'ccw', center: 'open' }, 1],
  ['vandring', 'orbitalVandring', { k: 3, dir: 'cw', center: 'filled' }, 2],

  ['rotation-med-byte', 'pilMedByte', { k: 2, dir: 'cw', byt: 'spets' }, 2],
  ['rotation-med-byte', 'pilMedByte', { k: 1, dir: 'ccw', byt: 'langd' }, 2],
  ['rotation-med-byte', 'orbitalMedByte', { k: 2, dir: 'cw' }, 2],
  ['rotation-med-byte', 'orbitalMedByte', { k: 1, dir: 'ccw' }, 2],
  ['rotation-med-byte', 'pilMedByte', { k: 1, dir: 'cw', byt: 'spets' }, 2],

  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'cw', typer: ['fill_black', 'dot'] }, 3],
  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'ccw', typer: ['fill_gray', 'dot'] }, 3],
  ['tva-rorelser', 'balansRegel', { regel: BAL.enKvadrat }, 2],
  ['tva-rorelser', 'balansRegel', { regel: BAL.motsattFast }, 3],

  ['latin-antal', 'latinAntal', { format: 'tally', antal: [1, 2, 3], riktning: 'vertical' }, 1],
  ['latin-antal', 'latinAntal', { format: 'tally', antal: [2, 3, 4], riktning: 'horizontal' }, 1],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [1, 2, 3] }, 1],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [2, 3, 4] }, 1],
  ['latin-antal', 'latinAntal', { format: 'ring', inre: 'black' }, 1],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [1, 2, 3] }, 1],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [2, 3, 4] }, 2],

  ['latin-form', 'latinForm', { format: 'poly-sidor', fyll: 'black' }, 1],
  ['latin-form', 'latinForm', { format: 'poly-fyll', sidor: 5 }, 1],
  ['latin-form', 'latinForm', { format: 'stack-bas', symbol: 'dot' }, 1],
  ['latin-form', 'latinForm', { format: 'stack-bas', symbol: 'plus', baser: ['circle', 'square', 'diamond'] }, 1],
  ['latin-form', 'latinForm', { format: 'stack-symbol', bas: 'circle' }, 1],
  ['latin-form', 'latinForm', { format: 'ring-inre', ringar: 2 }, 1],
  ['latin-form', 'latinForm', { format: 'orbital-lage', lagen: [0, 3, 5] }, 2],
  ['latin-form', 'latinForm', { format: 'lattice-lage', lagen: [0, 1, 3], typ: 'fill_black' }, 1],

  ['latin-flera', 'latinFlera', { format: 'poly' }, 2],
  ['latin-flera', 'latinFlera', { format: 'stack' }, 2],
  ['latin-flera', 'latinFlera', { format: 'stack-fyll' }, 2],
  ['latin-flera', 'latinFlera', { format: 'ring' }, 3],
  ['latin-flera', 'latinFlera', { format: 'stack', symboler: ['plus', 'ring', 'dot'] }, 2],

  ['overlagring', 'overlagring', { format: 'lattice', op: 'union', axel: 'kolumn' }, 1],
  ['overlagring', 'overlagring', { format: 'ray', op: 'union', axel: 'kolumn' }, 2],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'union', axel: 'rad' }, 2],
  ['overlagring', 'overlagring', { format: 'lattice', op: 'xor', axel: 'kolumn' }, 2],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'xor', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'lattice', op: 'snitt', axel: 'kolumn' }, 2],

  ['spegling', 'spegling', { format: 'lattice', m1: 'H', m2: 'V', axel: 'kolumn' }, 2],
  ['spegling', 'spegling', { format: 'sektor', m1: 'H', m2: 'V', axel: 'kolumn' }, 2],
  ['spegling', 'spegling', { format: 'lattice', m1: 'V', m2: 'H', axel: 'rad' }, 2],
  ['spegling', 'spegling', { format: 'sektor', m1: 'V', m2: 'H', axel: 'rad' }, 3],

  ['antal-andras', 'antalSekvens', { format: 'tally', riktning: 'upp' }, 1],
  ['antal-andras', 'antalSekvens', { format: 'tally', riktning: 'ner', o: 'horizontal' }, 1],
  ['antal-andras', 'antalSekvens', { format: 'ray', riktning: 'upp' }, 2],
  ['antal-andras', 'antalSekvens', { format: 'sektor', riktning: 'upp' }, 1],
]);

export const AVANCERAD = lista('v7a-3c', [
  ['vridning', 'pilVridning', { k: 3, dir: 'ccw' }, 3],
  ['vridning', 'pilVridning', { k: 2, dir: 'cw', spets: 'open' }, 2],
  ['vridning', 'stralVridning', { k: 1, dir: 'ccw', monster: [0, 1, 3] }, 3],
  ['vridning', 'stralVridning', { k: 3, dir: 'cw', monster: [0, 2, 3] }, 3],
  ['vridning', 'stralVridning', { k: 2, dir: 'cw', monster: [0, 1, 4] }, 3],

  ['monsterrotation', 'tileRotation', { dir: 'cw', antal: 3 }, 3],
  ['monsterrotation', 'tileRotation', { dir: 'ccw', antal: 4 }, 3],
  ['monsterrotation', 'tileRotation', { dir: 'cw', antal: 4 }, 3],
  ['monsterrotation', 'sektorRotation', { k: 1, dir: 'cw', antal: 3 }, 3],
  ['monsterrotation', 'sektorRotation', { k: 2, dir: 'ccw', antal: 3 }, 3],
  ['monsterrotation', 'sektorRotation', { k: 3, dir: 'cw', antal: 3 }, 3],
  ['monsterrotation', 'latticeMonster', { dir: 'cw', typer: ['fill_black', 'fill_gray', 'dot'] }, 3],

  ['vandring', 'orbitalVandring', { k: 3, dir: 'ccw', center: 'filled' }, 2],
  ['vandring', 'orbitalVandring', { k: 2, dir: 'cw', center: 'open' }, 2],
  ['vandring', 'latticeVandring', { dir: 'ccw', typ: 'dot' }, 2],
  ['vandring', 'latticeVandring', { dir: 'cw', typ: 'fill_gray' }, 2],
  ['vandring', 'orbitalVandring', { k: 1, dir: 'cw', center: 'open' }, 2],

  ['rotation-med-byte', 'pilMedByte', { k: 3, dir: 'ccw', byt: 'spets' }, 3],
  ['rotation-med-byte', 'pilMedByte', { k: 2, dir: 'cw', byt: 'langd' }, 3],
  ['rotation-med-byte', 'pilMedByte', { k: 3, dir: 'cw', byt: 'langd' }, 3],
  ['rotation-med-byte', 'pilMedByte', { k: 1, dir: 'ccw', byt: 'spets' }, 3],
  ['rotation-med-byte', 'orbitalMedByte', { k: 3, dir: 'cw' }, 3],
  ['rotation-med-byte', 'orbitalMedByte', { k: 2, dir: 'ccw' }, 3],
  ['rotation-med-byte', 'pilMedByte', { k: 1, dir: 'cw', byt: 'langd', spets: 'open' }, 3],

  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'cw', typer: ['fill_black', 'fill_gray'] }, 3],
  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'ccw', typer: ['dot', 'fill_black'] }, 3],
  ['tva-rorelser', 'balansRegel', { regel: BAL.hogerVaxlarVansterFast }, 3],
  ['tva-rorelser', 'balansRegel', { regel: BAL.vansterFastHogerVaxlar }, 3],
  ['tva-rorelser', 'balansRegel', { regel: BAL.bådaHogerVaxlar }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.enCirkel }, 3],

  ['latin-antal', 'latinAntal', { format: 'tally', antal: [2, 3, 4], riktning: 'vertical' }, 2],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [1, 2, 3] }, 2],
  ['latin-antal', 'latinAntal', { format: 'ring', inre: 'gray' }, 2],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [1, 2, 3] }, 2],

  ['latin-form', 'latinForm', { format: 'poly-sidor', fyll: 'gray' }, 2],
  ['latin-form', 'latinForm', { format: 'stack-symbol', bas: 'square', symboler: ['plus', 'minus', 'cross'] }, 2],
  ['latin-form', 'latinForm', { format: 'orbital-lage', lagen: [1, 4, 6], center: 'open' }, 2],
  ['latin-form', 'latinForm', { format: 'lattice-lage', lagen: [1, 2, 3], typ: 'fill_gray' }, 2],

  ['latin-flera', 'latinFlera', { format: 'poly' }, 3],
  ['latin-flera', 'latinFlera', { format: 'stack' }, 3],
  ['latin-flera', 'latinFlera', { format: 'stack-fyll' }, 3],
  ['latin-flera', 'latinFlera', { format: 'ring' }, 3],
  ['latin-flera', 'latinFlera', { format: 'stack', symboler: ['plus', 'ring', 'dot'] }, 3],
  ['latin-flera', 'latinFlera', { format: 'poly' }, 3],

  ['overlagring', 'overlagring', { format: 'tile', op: 'xor', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'tile', op: 'union', axel: 'rad' }, 3],
  ['overlagring', 'overlagring', { format: 'tile', op: 'snitt', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'lattice', op: 'diff-ab', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'ray', op: 'xor', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'snitt', axel: 'rad' }, 3],
  ['overlagring', 'overlagring', { format: 'ring', op: 'xor', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'diff-ab', axel: 'kolumn' }, 3],

  ['spegling', 'spegling', { format: 'tile', m1: 'H', m2: 'V', axel: 'kolumn' }, 3],
  ['spegling', 'spegling', { format: 'tile', m1: 'V', m2: 'H', axel: 'rad' }, 3],
  ['spegling', 'spegling', { format: 'tile', m1: 'D', m2: 'H', axel: 'kolumn' }, 4],
  ['spegling', 'spegling', { format: 'lattice', m1: 'H', m2: 'V', axel: 'rad' }, 3],
  ['spegling', 'spegling', { format: 'sektor', m1: 'H', m2: 'V', axel: 'kolumn' }, 3],
  ['spegling', 'spegling', { format: 'tile', m1: 'A', m2: 'V', axel: 'kolumn' }, 4],

  ['antal-andras', 'antalSekvens', { format: 'tally', riktning: 'upp', vaxlar: true }, 3],
  ['antal-andras', 'antalSumma', { o: 'vertical' }, 2],
  ['antal-andras', 'antalSekvens', { format: 'ray', riktning: 'ner' }, 3],
  ['antal-andras', 'antalSekvens', { format: 'sektor', riktning: 'ner' }, 2],
]);

export const EXPERT = lista('v7e-3c', [
  ['vridning', 'stralVridning', { k: 3, dir: 'ccw', monster: [0, 1, 3] }, 4],
  ['vridning', 'stralVridning', { k: 1, dir: 'cw', monster: [0, 1, 2, 4] }, 3],
  ['vridning', 'pilVridning', { k: 3, dir: 'cw' }, 3],
  ['vridning', 'stralVridning', { k: 2, dir: 'ccw', monster: [0, 2, 5] }, 4],

  ['monsterrotation', 'tileRotation', { dir: 'cw', antal: 5 }, 4],
  ['monsterrotation', 'tileRotation', { dir: 'ccw', antal: 4 }, 4],
  ['monsterrotation', 'sektorRotation', { k: 3, dir: 'cw', antal: 4 }, 4],
  ['monsterrotation', 'sektorRotation', { k: 1, dir: 'ccw', antal: 4 }, 4],
  ['monsterrotation', 'latticeMonster', { dir: 'ccw', typer: ['fill_black', 'fill_gray', 'dot'] }, 3],
  ['monsterrotation', 'tileRotation', { dir: 'ccw', antal: 5 }, 4],

  ['vandring', 'orbitalVandring', { k: 3, dir: 'ccw', center: 'open' }, 3],
  ['vandring', 'orbitalVandring', { k: 3, dir: 'cw', center: 'open' }, 3],
  ['vandring', 'latticeVandring', { dir: 'ccw', typ: 'fill_black' }, 3],
  ['vandring', 'orbitalVandring', { k: 2, dir: 'cw', center: 'filled' }, 3],

  ['rotation-med-byte', 'pilMedByte', { k: 3, dir: 'cw', byt: 'spets' }, 4],
  ['rotation-med-byte', 'pilMedByte', { k: 3, dir: 'ccw', byt: 'langd' }, 4],
  ['rotation-med-byte', 'orbitalMedByte', { k: 3, dir: 'ccw' }, 4],
  ['rotation-med-byte', 'orbitalMedByte', { k: 3, dir: 'cw' }, 4],
  ['rotation-med-byte', 'pilMedByte', { k: 2, dir: 'ccw', byt: 'spets' }, 3],
  ['rotation-med-byte', 'pilMedByte', { k: 2, dir: 'ccw', byt: 'langd' }, 4],
  ['rotation-med-byte', 'orbitalMedByte', { k: 1, dir: 'cw' }, 3],

  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'ccw', typer: ['fill_black', 'dot'] }, 3],
  ['tva-rorelser', 'latticeTvaVandrare', { dirA: 'cw', typer: ['fill_gray', 'dot'] }, 3],
  ['tva-rorelser', 'balansRegel', { regel: BAL.motsattVaxlar }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.bådaHogerVaxlar }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.bådaVansterKvadratVaxlar }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.hogerVaxlarVansterFast }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.vansterFastHogerVaxlar }, 4],
  ['tva-rorelser', 'balansRegel', { regel: BAL.motsattFast }, 4],

  ['latin-antal', 'latinAntal', { format: 'tally', antal: [2, 3, 4], riktning: 'horizontal' }, 3],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [2, 3, 4] }, 3],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [2, 3, 4] }, 3],

  ['latin-form', 'latinForm', { format: 'stack-bas', symbol: 'minus', baser: ['square', 'triangle', 'diamond'] }, 3],
  ['latin-form', 'latinForm', { format: 'ring-inre', ringar: 3 }, 3],

  ['latin-flera', 'latinFlera', { format: 'stack', tre: true }, 4],
  ['latin-flera', 'latinFlera', { format: 'stack', tre: true, symboler: ['plus', 'ring', 'dot'] }, 4],
  ['latin-flera', 'latinFlera', { format: 'stack', tre: true }, 4],
  ['latin-flera', 'latinFlera', { format: 'stack', tre: true, symboler: ['minus', 'ring', 'plus'] }, 4],
  ['latin-flera', 'latinFlera', { format: 'poly' }, 4],
  ['latin-flera', 'latinFlera', { format: 'ring' }, 4],
  ['latin-flera', 'latinFlera', { format: 'stack-fyll' }, 4],
  ['latin-flera', 'latinFlera', { format: 'stack' }, 4],

  ['overlagring', 'overlagring', { format: 'tile', op: 'xor', axel: 'rad' }, 4],
  ['overlagring', 'overlagring', { format: 'tile', op: 'diff-ab', axel: 'kolumn' }, 4],
  ['overlagring', 'overlagring', { format: 'tile', op: 'snitt', axel: 'rad' }, 4],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'xor', axel: 'rad' }, 4],
  ['overlagring', 'overlagring', { format: 'ray', op: 'diff-ab', axel: 'rad' }, 4],
  ['overlagring', 'overlagring', { format: 'tile', op: 'union', axel: 'kolumn' }, 3],
  ['overlagring', 'overlagring', { format: 'lattice', op: 'xor', axel: 'rad' }, 3],
  ['overlagring', 'overlagring', { format: 'ray', op: 'snitt', axel: 'kolumn' }, 4],

  ['spegling', 'spegling', { format: 'tile', m1: 'D', m2: 'A', axel: 'kolumn' }, 4],
  ['spegling', 'spegling', { format: 'tile', m1: 'H', m2: 'D', axel: 'rad' }, 4],
  ['spegling', 'spegling', { format: 'tile', m1: 'V', m2: 'A', axel: 'kolumn' }, 4],
  ['spegling', 'spegling', { format: 'tile', m1: 'A', m2: 'H', axel: 'rad' }, 4],
  ['spegling', 'spegling', { format: 'sektor', m1: 'V', m2: 'H', axel: 'rad' }, 4],
  ['spegling', 'spegling', { format: 'lattice', m1: 'V', m2: 'H', axel: 'kolumn' }, 3],
  ['spegling', 'spegling', { format: 'tile', m1: 'D', m2: 'V', axel: 'kolumn' }, 4],

  ['antal-andras', 'antalSekvens', { format: 'tally', riktning: 'ner', vaxlar: true }, 4],
  ['antal-andras', 'antalSumma', { o: 'horizontal' }, 3],
  ['antal-andras', 'antalSumma', { o: 'vertical' }, 3],
  ['antal-andras', 'antalSekvens', { format: 'ray', riktning: 'upp' }, 3],
  ['antal-andras', 'antalSekvens', { format: 'tally', riktning: 'upp', vaxlar: true }, 4],
]);

export const NIVAER = {
  grund: { recept: GRUND, ut: 'src/lib/logicTestV7/questionBankGrund3c.v7.json', original: 'src/lib/logicTestV7/questionBankGrund.v7.json' },
  avancerad: { recept: AVANCERAD, ut: 'src/lib/logicTestV7/questionBankAvancerad3c.v7.json', original: 'src/lib/logicTestV7/questionBank.v7.json' },
  expert: { recept: EXPERT, ut: 'src/lib/logicTestV7/questionBankExpert3c.v7.json', original: 'src/lib/logicTestV7/questionBankExpert.v7.json' },
};
