// scripts/lib/spatial/kub.mjs
// =============================================================================
// Form C i Spatial förmåga: tärningar, kubrotation i 3D
// (brief-tester-steg2-2026-11-09.md avsnitt 2.3, skissens beslut 5 och 12).
//
// Koordinater (a, b, h): a åt höger bakåt, b åt vänster bakåt, h uppåt. De
// synliga sidorna i ritningen har utåtnormalerna T = (0,0,1) (ovansidan),
// L = (−1,0,0) (vänster) och R = (0,−1,0) (höger). Varje synlig sida har två
// skärmaxlar i 3D, höger och ner, som stämmer med ritarens affina matriser
// (geometri.json, kub.matris); höger × ner pekar in i sidan, så projektionen
// är inte spegelvänd.
//
// En kub är sex sidor (normal i kroppens koordinater), var och en med symbol
// och "upp"-vektor. En orientering är en av de 24 vridningsmatriserna (alla
// tecken-permutationer med determinant +1). Facit är kuben i en annan
// orientering, så facit är exakt.
//
// Spegelvänd kub: hela kuben speglas med S = diag(−1, 1, 1). Symbolerna är alla
// symmetriska kring sin egen upp-axel, så en speglad symbol är samma symbol
// med speglad upp-vektor. Kiraliteten bevaras därför i facit (bara vridningar)
// och bryts bara i spegeldistraktorn.
//
// Lösaren (konsistent) arbetar i öppen värld: den vet bara det referensen
// visar. En kandidat är möjlig om någon av de 24 vridningarna ger dess tre
// sidor utan att motsäga referensens sidor (symbol, riktning för riktade
// symboler) och utan att en dold sida visar en symbol som redan syns i
// referensen (en kub har sex olika sidor). Det är SP-C1 och SP-C3.
// =============================================================================

import { readFileSync } from 'node:fs';
import { mulberry32, hashString } from '../serie/slump.mjs';

// ------------------------------------------------------------- vektorer
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const neg = (u) => u.map((x) => -x);
const eqv = (u, v) => u[0] === v[0] && u[1] === v[1] && u[2] === v[2];
const mulMV = (M, v) => M.map((rad) => dot(rad, v));
const transp = (M) => [0, 1, 2].map((j) => M.map((rad) => rad[j]));
const k = (v) => v.join(',');

export const POS = {
  t: { n: [0, 0, 1], hoger: [0, -1, 0], ner: [-1, 0, 0] },
  l: { n: [-1, 0, 0], hoger: [0, -1, 0], ner: [0, 0, -1] },
  r: { n: [0, -1, 0], hoger: [1, 0, 0], ner: [0, 0, -1] },
};
export const SIDOR = ['t', 'l', 'r'];

/** Upp-vektorn i 3D för en synlig sida med riktning 0 till 3 (kvarts varv medurs). */
const uppFor = (p, riktning) => [neg(POS[p].ner), POS[p].hoger, POS[p].ner, neg(POS[p].hoger)][riktning];
const riktningFor = (p, upp) => [neg(POS[p].ner), POS[p].hoger, POS[p].ner, neg(POS[p].hoger)].findIndex((v) => eqv(v, upp));

/** De 24 vridningarna. */
export const VRIDNINGAR = (() => {
  const ut = [];
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const p of perms)
    for (let s = 0; s < 8; s++) {
      const tecken = [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1];
      const M = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (j === p[i] ? tecken[i] : 0)));
      const det = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
      if (det === 1) ut.push(M);
    }
  return ut;
})();
const I = VRIDNINGAR.find((M) => M[0][0] === 1 && M[1][1] === 1 && M[2][2] === 1);

export const RIKTADE = new Set(['triangel', 'pil']);
const AXLAR = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/** Kuben sedd i orientering Q: de tre synliga sidorna. Riktningslösa symboler får riktning 0. */
export function vy(kub, Q) {
  const ut = {};
  const Qt = transp(Q);
  for (const p of SIDOR) {
    const nb = mulMV(Qt, POS[p].n);
    const sida = kub.find((s) => eqv(s.n, nb));
    const r = riktningFor(p, mulMV(Q, sida.upp));
    ut[p] = { symbol: sida.symbol, riktning: RIKTADE.has(sida.symbol) ? r : 0 };
  }
  return ut;
}

/** Spegelbilden av kuben (S = diag(−1, 1, 1) på normaler och upp-vektorer). */
export const spegla = (kub) => kub.map((s) => ({ ...s, n: [-s.n[0], s.n[1], s.n[2]], upp: [-s.upp[0], s.upp[1], s.upp[2]] }));

export const vyNyckel = (v) => SIDOR.map((p) => `${v[p].symbol}${RIKTADE.has(v[p].symbol) ? v[p].riktning : ''}`).join('|');

/**
 * Öppen värld: kan kandidatvyn vara samma kub som referensvyn? `kanda` är de
 * referenssidor lösaren får använda (alla tre som standard; färre när
 * genomgången letar efter de sidor som avslöjar en distraktor).
 */
export function konsistent(ref, kand, kanda = SIDOR) {
  const refSymboler = new Set(SIDOR.map((p) => ref[p].symbol));
  for (const Q of VRIDNINGAR) {
    const Qt = transp(Q);
    let ok = true;
    for (const p of SIDOR) {
      const nb = mulMV(Qt, POS[p].n);
      const refPos = SIDOR.find((q) => eqv(POS[q].n, nb));
      const c = kand[p];
      if (refPos && kanda.includes(refPos)) {
        const r = ref[refPos];
        if (r.symbol !== c.symbol) {
          ok = false;
          break;
        }
        if (RIKTADE.has(c.symbol)) {
          const uppKropp = mulMV(Qt, uppFor(p, c.riktning));
          if (!eqv(uppKropp, uppFor(refPos, r.riktning))) {
            ok = false;
            break;
          }
        }
      } else if (refPos) {
        // en känd sida som lösaren inte får använda: symbolen får ändå inte vara en annan synlig referenssymbol
        if (refSymboler.has(c.symbol) && kanda.some((q) => ref[q].symbol === c.symbol)) {
          ok = false;
          break;
        }
      } else if (kanda.some((q) => ref[q].symbol === c.symbol)) {
        // dold sida i referensen kan inte visa en symbol som redan syns där
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/** Hur många av referensens synliga sidor som också syns i vyn efter vridningen Q. */
const delade = (Q) => {
  const Qt = transp(Q);
  return SIDOR.filter((p) => SIDOR.some((q) => eqv(POS[q].n, mulMV(Qt, POS[p].n)))).length;
};

// ----------------------------------------------------------- generering

export const NIVAER_C = {
  // Krysset byttes mot en åttaarmad stjärna (granskningen 2026-11-09): kryssets
  // armar följer sidans diagonaler, så det såg ut som ett plus på ovansidan.
  grund: { symboler: ['prick', 'ring', 'stjarna', 'kvadrat', 'dubbelring', 'fkvadrat'], framande: ['triangel'], delar: 2 },
  avancerad: { symboler: ['prick', 'ring', 'stjarna', 'kvadrat', 'triangel', 'pil'], framande: ['dubbelring', 'fkvadrat'], delar: 2 },
  expert: { symboler: ['prick', 'ring', 'kvadrat', 'fkvadrat', 'triangel', 'pil'], framande: ['stjarna', 'dubbelring'], delar: 1 },
};

const NAMN = { prick: 'en prick', ring: 'en ring', kryss: 'ett kryss', stjarna: 'en stjärna', kvadrat: 'en kvadrat', fkvadrat: 'en fylld kvadrat', dubbelring: 'en dubbelring', triangel: 'en triangel', pil: 'en pil' };
const BEST = { prick: 'pricken', ring: 'ringen', kryss: 'krysset', stjarna: 'stjärnan', kvadrat: 'kvadraten', fkvadrat: 'den fyllda kvadraten', dubbelring: 'dubbelringen', triangel: 'triangeln', pil: 'pilen' };
const PLATS = { t: 'ovansidan', l: 'vänster sida', r: 'höger sida' };

function slumpKub(rng, symboler) {
  const s = [...symboler];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return AXLAR.map((n, i) => {
    const vinkel = AXLAR.filter((a) => dot(a, n) === 0);
    return { n, symbol: s[i], upp: vinkel[Math.floor(rng() * vinkel.length)] };
  });
}

/** De minsta referenssidor som räcker för att avfärda kandidaten (genomgången markerar dem i koppar). */
export function avslojande(ref, kand) {
  const del = [['t'], ['l'], ['r'], ['t', 'l'], ['t', 'r'], ['l', 'r'], ['t', 'l', 'r']];
  for (const d of del) if (!konsistent(ref, kand, d)) return d;
  return null;
}

export function byggUppgiftC({ niva, id, fro }) {
  const L = NIVAER_C[niva];
  const rng = mulberry32(hashString(fro));
  const valj = (a) => a[Math.floor(rng() * a.length)];
  const kub = slumpKub(rng, L.symboler);
  const ref = vy(kub, I);
  const kandQ = VRIDNINGAR.filter((Q) => Q !== I && delade(Q) === L.delar);
  const Qf = valj(kandQ);
  const facit = vy(kub, Qf);
  // expert: den delade sidan ska vara riktad, annars finns inget att avfärda med
  if (niva === 'expert') {
    const delad = SIDOR.filter((p) => SIDOR.some((q) => ref[q].symbol === facit[p].symbol));
    if (delad.length !== 1 || !RIKTADE.has(facit[delad[0]].symbol)) return null;
  }
  if (!konsistent(ref, facit)) return null;

  // kandidater
  const kand = [];
  const lagg = (typ, v, extra = {}) => kand.push({ typ, v, ...extra });
  // spegelvänd kub, sedd så att minst två referenssymboler syns
  const sp = spegla(kub);
  for (const Q of VRIDNINGAR) {
    const v = vy(sp, Q);
    // Spegeldistraktorn är referensens eget hörn speglat: samma tre symboler i
    // omvänd ordning (granskningen 2026-11-09), så att misstagstexten stämmer.
    if (SIDOR.every((p) => SIDOR.some((q) => ref[q].symbol === v[p].symbol))) lagg('spegel', v);
  }
  // två sidor bytta i facit
  for (const [a, b] of [['t', 'l'], ['t', 'r'], ['l', 'r']]) {
    const refSym = SIDOR.map((p) => ref[p].symbol);
    if (refSym.includes(facit[a].symbol) && refSym.includes(facit[b].symbol)) lagg('bytta', { ...facit, [a]: facit[b], [b]: facit[a] }, { par: [a, b] });
  }
  // en riktad symbol vriden fel
  for (const p of SIDOR) {
    if (!RIKTADE.has(facit[p].symbol)) continue;
    for (const d of [1, 2, 3]) lagg('vriden', { ...facit, [p]: { ...facit[p], riktning: (facit[p].riktning + d) % 4 } }, { plats: p });
  }
  // fel symbol på en sida: en annan av kubens symboler eller en främmande. Utgår från
  // facit och från referensens hörn vridet (de vyer där alla tre platserna är bestämda
  // av referensen), så att den felaktiga sidan går att avfärda.
  const baser = [facit, ...VRIDNINGAR.filter((Q) => Q !== I && delade(Q) === 3).map((Q) => vy(kub, Q))];
  for (const bas of baser) {
    for (const p of SIDOR) {
      for (const s of [...L.symboler, ...L.framande]) {
        if (s === bas[p].symbol) continue;
        if (SIDOR.some((q) => q !== p && bas[q].symbol === s)) continue;
        const typ = L.symboler.includes(s) ? 'fel_symbol' : 'framande';
        lagg(typ, { ...bas, [p]: { symbol: s, riktning: RIKTADE.has(s) ? valj([0, 1, 2, 3]) : 0 } }, { plats: p, ratt: bas[p].symbol });
      }
    }
  }

  const ordning = {
    grund: ['fel_symbol', 'framande', 'spegel', 'bytta'],
    avancerad: ['spegel', 'vriden', 'fel_symbol', 'bytta', 'framande'],
    expert: ['vriden'],
  }[niva];
  const sedda = new Set([vyNyckel(facit), vyNyckel(ref)]);
  const valda = [];
  let speglar = 0;
  const refSp = vy(sp, I);
  for (const pass of [0, 1]) {
    for (const typ of ordning) {
      const lista = kand.filter((c) => c.typ === typ).sort(() => rng() - 0.5);
      let tagna = 0;
      for (const c of lista) {
        if (valda.length >= 3) break;
        if (pass === 0 && tagna >= 1 && niva !== 'expert') break;
        const n = vyNyckel(c.v);
        if (sedda.has(n)) continue;
        if (new Set(SIDOR.map((p) => c.v[p].symbol)).size !== 3) continue; // SP-C5
        if (konsistent(ref, c.v)) continue; // SP-C1: måste gå att avfärda med referensen
        const arSpegel = konsistent(refSp, c.v);
        if (arSpegel && speglar >= 1) continue; // SP-C7
        // grund: distraktorn ska visa minst två av referensens symboler (annars avfärdas den på ett ögonkast)
        if (niva !== 'expert' && SIDOR.filter((p) => SIDOR.some((q) => ref[q].symbol === c.v[p].symbol)).length < 2) continue;
        sedda.add(n);
        if (arSpegel) speglar++;
        valda.push(c);
        tagna++;
      }
    }
  }
  if (valda.length < 3) return null;

  const misstag = (c) => {
    // de två andra synliga sidorna i alternativet, de som bestämmer platsen
    const andra = c.plats ? SIDOR.filter((p) => p !== c.plats).map((p) => BEST[c.v[p].symbol]) : [];
    const stor = (t) => t[0].toUpperCase() + t.slice(1);
    const refSym = new Set(SIDOR.map((p) => ref[p].symbol));
    switch (c.typ) {
      case 'spegel':
        return 'Spegelvänd. Samma tre sidor, men i omvänd ordning runt hörnet jämfört med den första tärningen, och en tärning går aldrig att vrida till sin spegelbild.';
      case 'bytta':
        return `${stor(BEST[c.v[c.par[0]].symbol])} och ${BEST[c.v[c.par[1]].symbol]} har bytt plats. Då hamnar de i omvänd ordning jämfört med den första tärningen, och det är en spegelbild.`;
      case 'vriden':
        return `Rätt sidor, men ${BEST[c.v[c.plats].symbol]} på ${PLATS[c.plats]} pekar åt fel håll när tärningen vrids så.`;
      case 'fel_symbol':
        // platsen är bestämd av referensen när rätt symbol syns där; annars är det en sida som var dold
        if (refSym.has(c.ratt)) return `Med ${andra[0]} och ${andra[1]} placerade så här måste ${PLATS[c.plats]} visa ${NAMN[c.ratt]}, inte ${NAMN[c.v[c.plats].symbol]}.`;
        return `${stor(BEST[c.v[c.plats].symbol])} syns redan på den första tärningen och kan inte hamna på ${PLATS[c.plats]} när ${andra[0]} och ${andra[1]} står så här.`;
      case 'framande':
        return `${stor(NAMN[c.v[c.plats].symbol])} kan inte sitta där. Med ${andra[0]} och ${andra[1]} placerade så här måste ${PLATS[c.plats]} visa ${NAMN[c.ratt]}.`;
    }
    return '';
  };

  const alla = [{ typ: '', v: facit }, ...valda];
  for (let i = alla.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [alla[i], alla[j]] = [alla[j], alla[i]];
  }
  const fig = (v) => ({ kind: 'kub', t: v.t, l: v.l, r: v.r });
  const delad = SIDOR.filter((p) => SIDOR.some((q) => ref[q].symbol === facit[p].symbol)).map((p) => BEST[facit[p].symbol]);
  return {
    id,
    niva,
    form: 'C',
    fraga: 'Vilken tärning kan vara samma tärning som den första, sedd från ett annat håll?',
    referens: fig(ref),
    options: alla.map((a) => fig(a.v)),
    correctAnswer: alla.findIndex((a) => !a.typ),
    typer: alla.map((a) => a.typ),
    misstag: alla.map((a) => (a.typ ? misstag(a) : '')),
    avslojande: alla.map((a) => (a.typ ? avslojande(ref, a.v) ?? [] : [])),
    forklaring:
      delad.length === 1
        ? `Bara ${delad[0]} syns på båda. Grannarna runt den har vridits bort, och dess riktning stämmer bara i det här alternativet.`
        : `Rätt tärning är samma tärning vriden. ${delad[0][0].toUpperCase()}${delad[0].slice(1)} och ${delad[1]} sitter som förut i förhållande till varandra, och den tredje sidan är en som var dold.`,
    kub,
    orientering: Qf,
  };
}

export const nyckelC = (q) => `${vyNyckel(q.referens)}#${q.options.map(vyNyckel).sort().join('#')}`;

// ------------------------------------------------------------- spärrar

const G = JSON.parse(readFileSync('src/lib/spatialV1/geometri.json', 'utf8'));

export function sparrarC(q) {
  const fel = [];
  const id = q.id;
  const L = NIVAER_C[q.niva];
  const ref = q.referens;

  // SP-C2 facit är en av de 24 vridningarna av den sparade kuben, och referensen är kuben ovriden
  if (vyNyckel(vy(q.kub, I)) !== vyNyckel(ref)) fel.push(`${id}: referensen är inte kuben ovriden`);
  const facit = q.options[q.correctAnswer];
  if (!VRIDNINGAR.some((Q) => vyNyckel(vy(q.kub, Q)) === vyNyckel(facit))) fel.push(`${id}: SP-C2 facit är ingen vridning av kuben`);
  // kiraliteten: facit är aldrig en vy av den speglade kuben
  if (VRIDNINGAR.some((Q) => vyNyckel(vy(spegla(q.kub), Q)) === vyNyckel(facit)) && !VRIDNINGAR.some((Q) => vyNyckel(vy(q.kub, Q)) === vyNyckel(facit))) fel.push(`${id}: facit är spegelvänt`);

  // SP-C1 och SP-C3: exakt ett alternativ går ihop med referensen, i öppen värld
  const mojliga = q.options.map((o) => konsistent(ref, o));
  if (mojliga.filter(Boolean).length !== 1 || !mojliga[q.correctAnswer]) fel.push(`${id}: SP-C3 ${mojliga.filter(Boolean).length} alternativ går ihop med referensen, ska vara exakt ett (facit)`);
  // SP-C1 dessutom: ingen distraktor är en vy av den verkliga kuben
  q.options.forEach((o, i) => {
    if (i !== q.correctAnswer && VRIDNINGAR.some((Q) => vyNyckel(vy(q.kub, Q)) === vyNyckel(o))) fel.push(`${id}: SP-C1 alternativ ${i + 1} är en vy av kuben`);
  });

  // SP-C4 riktningslösa symboler aldrig där riktningen skiljer
  q.options.forEach((o, i) => {
    if (q.typer[i] !== 'vriden') return;
    const skiljer = SIDOR.filter((p) => o[p].symbol === facit[p].symbol && o[p].riktning !== facit[p].riktning);
    if (skiljer.some((p) => !RIKTADE.has(o[p].symbol))) fel.push(`${id}: SP-C4 riktningen skiljer på en riktningslös symbol`);
  });
  for (const v of [ref, ...q.options]) for (const p of SIDOR) if (!RIKTADE.has(v[p].symbol) && v[p].riktning !== 0) fel.push(`${id}: SP-C4 riktningslös symbol med riktning`);

  // SP-C5 tre olika symboler i varje vy
  for (const v of [ref, ...q.options]) if (new Set(SIDOR.map((p) => v[p].symbol)).size !== 3) fel.push(`${id}: SP-C5 en vy visar samma symbol två gånger`);

  // SP-C6 riktade symbolers spets: vinkeln mellan sidans två lokala axlar i projektionen minst 20 grader
  for (const p of SIDOR) {
    const [a, b, c, d] = G.kub.matris[p];
    const v = (Math.acos((a * c + b * d) / (Math.hypot(a, b) * Math.hypot(c, d))) * 180) / Math.PI;
    if (Math.min(v, 180 - v) < 20) fel.push(`${id}: SP-C6 sidan ${p} plattar till riktade symboler (${v.toFixed(0)} grader)`);
  }

  // SP-C7 högst en spegelvänd distraktor
  const refSp = vy(spegla(q.kub), I);
  const speglar = q.options.filter((o, i) => i !== q.correctAnswer && konsistent(refSp, o)).length;
  if (speglar > 1) fel.push(`${id}: SP-C7 ${speglar} spegelvända distraktorer`);

  // nivån: symbolerna och antalet delade sidor
  const tillatna = new Set([...L.symboler, ...L.framande]);
  for (const v of [ref, ...q.options]) for (const p of SIDOR) if (!tillatna.has(v[p].symbol)) fel.push(`${id}: symbolen ${v[p].symbol} hör inte till nivån`);
  const delade = SIDOR.filter((p) => SIDOR.some((s) => ref[s].symbol === facit[p].symbol)).length;
  if (delade !== L.delar) fel.push(`${id}: facit delar ${delade} sidor med referensen, nivån ${L.delar}`);
  if (q.misstag.some((m, i) => i !== q.correctAnswer && !m)) fel.push(`${id}: misstagstext saknas`);
  return fel;
}
