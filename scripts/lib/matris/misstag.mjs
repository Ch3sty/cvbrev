// scripts/lib/matris/misstag.mjs
// =============================================================================
// `misstag` per alternativ: en kort svensk mening om vilken dimension ett fel
// alternativ har fel i. Tom sträng för det rätta svaret. null när det inte går
// att avgöra maskinellt (då ska frågan granskas för hand).
//
// Texten byggs ur tolkningen (tolka.mjs): regeln som bär dimensionen avgör
// hur felet beskrivs. Generatorerna kör samma funktion på sina frågor och
// slänger alternativ som inte går att förklara, så nya frågor behöver aldrig
// granskas för hand.
//
// Stil: hela meningar, punkt, inget tankstreck. Säger vad alternativet gör,
// inte vad hon tänkte.
// =============================================================================

import { rotera, spegelbilder, element, vKey, mod, vardeNamn, konstantText, saknasText, LAT_NAMN, lattice as LAT } from './celler.mjs';
import { tolka, tolkaVy, OPS, POS } from './tolka.mjs';

const lika = (a, b) => vKey(a) === vKey(b);
const stor = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const liten = (s) => (/^[A-ZÅÄÖ](?![A-ZÅÄÖ])/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const ETT_ORD = new Set(['streck', 'kryss']);
const artikel = (sing) => (ETT_ORD.has(sing.split(' ').pop()) ? 'Ett' : 'En');

// Hur en dimension säger "alla har/är".
const PRED = { fyllning: 'är', basfyll: 'är', sidor: 'är', bas: 'är', riktning: 'är', symbol: 'har-en', antal: 'har', ringantal: 'har', stralar: 'har', sektorer: 'har', inre: 'inre', satellit: 'har-pl', polyrot: 'är' };

function allaText(scope, cellMedV, dimId) {
  const n = vardeNamn(cellMedV, dimId);
  if (!n) return null;
  const p = PRED[dimId] ?? (dimId.startsWith('lat-') ? 'har-pl' : null);
  if (p === 'är') return `I ${scope} är alla ${n.pl}.`;
  if (p === 'har') return `I ${scope} har alla ${n.pl}.`;
  if (p === 'har-en') return `I ${scope} har alla ${n.en}.`;
  if (p === 'har-pl') return `I ${scope} är alla ${n.pl}.`;
  if (p === 'inre') return `I ${scope} är den innersta ringen alltid ${n.adj}.`;
  return null;
}

/** En cell där dimensionen har värdet v (för att kunna namnge värdet). */
function cellMed(q, t, dimId, v) {
  const alla = [...POS.map(([r, c]) => q.grid[r][c]), ...q.options];
  return alla.find((c) => lika(t.dimsVy(c).find((d) => d.id === dimId)?.varde, v)) ?? null;
}

function seqFor(q, t, dimId) {
  return POS.map(([r, c]) => t.dimsVy(q.grid[r][c]).find((d) => d.id === dimId).varde);
}
function gridV(q, t, dimId) {
  return [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 2 ? undefined : t.dimsVy(q.grid[r][c]).find((d) => d.id === dimId).varde)));
}

// ---------------------------------------------------------------- per regel
function textRotation(q, t, R, F, regel) {
  const dim = regel.dim;
  const seq = seqFor(q, t, dim.id);
  const subj = dim.subj;
  const verb = dim.verb ?? 'flyttat';
  if (F === null || F === undefined) return saknasText(dim, F, R);
  if (lika(F, seq[7])) return `${subj} har inte ${verb} sista steget.`;
  if (regel.regel === 'rot-steg' && lika(F, rotera(dim, R, regel.info.k))) return `${subj} har ${verb} ett steg för långt.`;
  if (regel.regel === 'rot-kumulativ' && lika(F, rotera(dim, seq[7], regel.info.a + regel.info.b * 6))) return `${subj} har ${verb} lika långt som förra steget. Steget ska bli längre varje gång.`;
  if (lika(F, seq[6]) && regel.regel === 'rot-steg') return `${subj} har ${verb} åt fel håll.`;
  // vriden j steg från rätt läge
  for (let j = 1; j < dim.n; j++) {
    if (!lika(rotera(dim, R, j), F)) continue;
    if (j * 2 === dim.n) return dim.id === 'vinkel' ? 'Pilen pekar åt motsatt håll.' : `${subj} hamnar ett halvt varv fel.`;
    const k = regel.info.k ?? 1;
    const medurs = k * 2 < dim.n;
    const jj = j * 2 < dim.n ? j : j - dim.n; // positivt = medurs
    const grader = Math.abs(jj) * dim.grad;
    const forLangt = (jj > 0) === medurs;
    return `${subj} hamnar ${grader} grader för ${forLangt ? 'långt' : 'kort'}.`;
  }
  if (spegelbilder(dim, R).some((s) => lika(s, F))) return `Det är en spegelbild, men ${dim.namn} ska vridas.`;
  return textMangd(dim, R, F, seq);
}

// Rutornas namn (spec-rummen 15.7). 3×3: bit i = rad floor(i/3), kolumn i%3.
const RUTA_3X3 = ['uppe till vänster', 'uppe i mitten', 'uppe till höger', 'till vänster i mitten', 'i mitten', 'till höger i mitten', 'nere till vänster', 'nere i mitten', 'nere till höger'];
// 2×2: läget i medurs ordning (TL, TR, BR, BL), listat i läsordning.
const RUTA_2X2 = ['uppe till vänster', 'uppe till höger', 'nere till höger', 'nere till vänster'];
const LASORDNING_2X2 = { 0: 0, 1: 1, 3: 2, 2: 3 };
const TAL_STOR = { 2: 'Två', 3: 'Tre', 4: 'Fyra', 5: 'Fem', 6: 'Sex', 7: 'Sju', 8: 'Åtta', 9: 'Nio' };

/** Namnen på rutorna i en svart-ruta-dimension (tile eller 2×2 svart), i läsordning. Null för andra. */
function rutnamn(dim, el) {
  if (dim.tile) return [...el].map(Number).sort((a, b) => a - b).map((i) => RUTA_3X3[i]);
  if (dim.lat === 'fill_black') return [...el].map(Number).sort((a, b) => LASORDNING_2X2[a] - LASORDNING_2X2[b]).map((p) => RUTA_2X2[p]);
  return null;
}
/**
 * Texten som generatorerna jämför när de väljer distraktorer med olika
 * texter. Rutans namn (15.7) räknas inte: före 15.7 var "En svart ruta för
 * mycket." samma text oavsett ruta, och urvalet ska bli detsamma så att
 * incheckade 3c-frågor kan genereras om oförändrade. Flerrutstexterna fanns
 * inte före 15.7 (alternativet var oförklarat) och ger null.
 */
export function urvalsText(x) {
  if (!x) return x;
  if (/(^|, men )([Tt]vå|[Tt]re|[Ff]yra|[Ff]em|[Ss]ex|[Ss]ju|[Åå]tta|[Nn]io) rutor (för mycket|saknas): /.test(x)) return null;
  return x.replace(/[Rr]utan (?:uppe|nere|till|i)[^.]*? (är fylld fast den inte ska vara det|saknas)\./, (_m, s) => `rutan ? ${s}.`);
}

const lista = (namn) => (namn.length === 1 ? namn[0] : `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`);

function textMangd(dim, R, F, seq) {
  const eR = element(dim, R);
  const eF = element(dim, F);
  if (!eR || !eF || !dim.element) return null;
  const [sing, plur] = dim.element;
  const sR = new Set(eR);
  const sF = new Set(eF);
  const ext = eF.filter((x) => !sR.has(x));
  const sak = eR.filter((x) => !sF.has(x));
  // 3×3 och 2×2 med svarta rutor: säg vilken ruta (15.7).
  const nExt = rutnamn(dim, ext);
  const nSak = rutnamn(dim, sak);
  if (ext.length === 1 && sak.length === 0) return nExt ? `Rutan ${nExt[0]} är fylld fast den inte ska vara det.` : `${artikel(sing)} ${sing} för mycket.`;
  if (sak.length === 1 && ext.length === 0) return nSak ? `Rutan ${nSak[0]} saknas.` : `${artikel(sing)} ${sing} saknas.`;
  if (seq && eF.length !== eR.length) {
    const storlekar = new Set(seq.map((v) => element(dim, v).length));
    if (storlekar.size === 1) return `Antalet ${plur} ändras aldrig.`;
  }
  // Två eller fler rutor åt samma håll: "Två rutor för mycket: uppe till vänster och i mitten."
  if (nExt && ext.length >= 2 && sak.length === 0 && TAL_STOR[ext.length]) return `${TAL_STOR[ext.length]} rutor för mycket: ${lista(nExt)}.`;
  if (nSak && sak.length >= 2 && ext.length === 0 && TAL_STOR[sak.length]) return `${TAL_STOR[sak.length]} rutor saknas: ${lista(nSak)}.`;
  return null;
}

function textPeriodisk(q, t, R, F, regel) {
  const dim = regel.dim;
  const seq = seqFor(q, t, dim.id);
  const storlekar = (dim.mangd || dim.tile) ? new Set(seq.map((v) => element(dim, v).length)) : null;
  if (storlekar && storlekar.size > 1) {
    // en mängd som växer eller krymper: räkna, inte vrid
    const [sing, plur] = dim.element;
    if (lika(F, seq[7])) return `Antalet ${plur} har inte ändrats sista steget.`;
    const m = textMangd(dim, R, F, null);
    if (m) return m;
    if (lika(F, seq[6])) return `Antalet ${plur} har ändrats åt fel håll.`;
    if (element(dim, F).length === element(dim, R).length) return `Rätt antal, men ${dim.bestPl ?? 'de ' + plur} sitter på fel platser.`;
    return null;
  }
  if (dim.typ === 'rot' || dim.tile || dim.mangd) {
    const r = textRotation(q, t, R, F, { ...regel, regel: 'periodisk' });
    if (r) return r;
  }
  if (dim.antal && typeof F === 'number' && typeof R === 'number') {
    const el = dim.id === 'ringantal' ? ['ring', 'ringar'] : ['streck', 'streck'];
    if (lika(F, seq[7])) return `${stor(dim.namn)} har inte ändrats sista steget.`;
    if (F === R + 1) return `${artikel(el[0])} ${el[0]} för mycket.`;
    if (F === R - 1) return `${artikel(el[0])} ${el[0]} för lite.`;
    if (lika(F, seq[6])) return `${stor(dim.namn)} har ändrats åt fel håll.`;
    return null;
  }
  const VAXLAR = { spets: 'Spetsen har inte växlat mellan fylld och öppen.', langd: 'Längden har inte växlat mellan lång och kort.', mitt: 'Mittpunkten har inte växlat fyllning.', riktning: 'Strecken har inte växlat riktning.' };
  if (lika(F, seq[7])) return regel.info.p === 2 ? (VAXLAR[dim.id] ?? `${stor(dim.namn)} har inte bytt.`) : `${stor(dim.namn)} har inte ändrats sista steget.`;
  if (!seq.some((v) => lika(v, F))) {
    const n = vardeNamn(cellMed(q, t, dim.id, F), dim.id);
    return n ? `Matrisen har ${n.en.replace(/^en /, 'ingen ').replace(/^ett /, 'inget ')}.` : null;
  }
  if (regel.info.p === 3 && lika(F, seq[6])) return `${stor(dim.namn)} har bytt åt fel håll.`;
  return null;
}

function textLatin(q, t, R, F, regel) {
  const dim = regel.dim;
  const V = gridV(q, t, dim.id);
  if (dim.balans) return textBalansPos(q, t, R, F, regel, V);
  const iRad = [V[2][0], V[2][1]].some((v) => lika(v, F));
  const iKol = [V[0][2], V[1][2]].some((v) => lika(v, F));
  const n = vardeNamn(cellMed(q, t, dim.id, F), dim.id);
  if (!n) return null;
  if (iRad && iKol) return `Tredje raden och tredje kolumnen har redan ${n.en}.`;
  if (iRad) return `Tredje raden har redan ${n.en}.`;
  if (iKol) return `Tredje kolumnen har redan ${n.en}.`;
  const iMatris = V.flat().some((v) => v !== undefined && lika(v, F));
  if (!iMatris && (dim.id === 'stralar' || dim.id === 'sektorer')) {
    // samma antal finns, men på andra platser: säg det, inte "finns inte"
    const nF = element(dim, F).length;
    const sammaN = (v) => v !== undefined && element(dim, v).length === nF;
    const rad = [V[2][0], V[2][1]].some(sammaN); const kol = [V[0][2], V[1][2]].some(sammaN);
    const platser = `${stor(dim.bestPl ?? dim.namn)} sitter dessutom på andra platser än i matrisen.`;
    if (rad && kol) return `Tredje raden och tredje kolumnen har redan ${n.en}. ${platser}`;
    if (rad) return `Tredje raden har redan ${n.en}. ${platser}`;
    if (kol) return `Tredje kolumnen har redan ${n.en}. ${platser}`;
    if (V.flat().some(sammaN)) return `${stor(dim.bestPl ?? dim.namn)} sitter på andra platser än i matrisen.`;
  }
  if (!iMatris) return `Matrisen har ${n.en.replace(/^en /, 'ingen ').replace(/^ett /, 'inget ')}.`;
  return null;
}

function textBalansPos(q, t, R, F, regel, V) {
  const dim = regel.dim;
  if (F === null || R === null) return saknasText(dim, F, R);
  if (regel.regel === 'rad') return `${dim.subj} står still i varje rad.`;
  if (lika(F, V[2][1])) return `${dim.subj} har inte flyttat.`;
  return `${dim.subj} har flyttat åt fel håll.`;
}

function textBalansSida(q, t, R, F, regel) {
  const dim = regel.dim;
  if (F === null || R === null) return saknasText(dim, F, R);
  const V = gridV(q, t, dim.id);
  const vanster = V[2][1];
  if (regel.regel === 'konstant') return `${dim.subj} ska vara kvar på samma sida om linjen.`;
  if (lika(R, vanster)) return `${dim.subj} ska inte byta sida här.`;
  return `${dim.subj} har inte bytt sida om linjen.`;
}

function textRadKolumn(q, t, R, F, regel) {
  const dim = regel.dim;
  if (dim.balans && !dim.sida) return textBalansPos(q, t, R, F, regel, gridV(q, t, dim.id));
  const cell = cellMed(q, t, dim.id, R);
  if (regel.regel === 'rad') return allaText('tredje raden', cell, dim.id);
  if (regel.regel === 'kolumn') return allaText('tredje kolumnen', cell, dim.id);
  if (regel.regel === 'diagonal') {
    const n = vardeNamn(cell, dim.id);
    return n ? `Rutorna på diagonalen från övre vänstra hörnet har ${n.en}.` : null;
  }
  return null;
}

function textOverlagring(q, t, R, F, regel) {
  const dim = regel.dim;
  const V = gridV(q, t, dim.id);
  const { op, axel } = regel.info;
  const [A, B] = axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
  const [forsta, andra] = axel === 'kolumn' ? ['den första rutan i raden', 'den andra rutan i raden'] : ['den översta rutan i kolumnen', 'den mittersta rutan i kolumnen'];
  const S = (v) => new Set(element(dim, v) ?? (Array.isArray(v) ? v.map(String) : []));
  const sF = S(F);
  const eq = (s) => s.size === sF.size && [...s].every((x) => sF.has(x));
  const a = S(A); const b = S(B);
  if (eq(a) && !eq(b)) return `Kopierar ${forsta}.`;
  if (eq(b) && !eq(a)) return `Kopierar ${andra}.`;
  const U = OPS.union(a, b); const X = OPS.xor(a, b); const I = OPS.snitt(a, b);
  const AB = OPS['diff-ab'](a, b); const BA = OPS['diff-ba'](a, b);
  if (op === 'xor') {
    if (eq(U)) return 'Tar med det som finns i båda. Det gemensamma ska bort.';
    if (eq(I)) return 'Visar bara det gemensamma. Det ska bort, resten ska med.';
  }
  if (op === 'union') {
    if (eq(X)) return 'Tar bort det som finns i båda. Allt ska med.';
    if (eq(I)) return 'Visar bara det gemensamma. Allt ska med.';
  }
  if (op === 'snitt') {
    if (eq(U)) return 'Tar med allt. Bara det som finns i båda ska med.';
    if (eq(X)) return 'Visar det som skiljer. Bara det som finns i båda ska med.';
  }
  if (op === 'diff-ab' || op === 'diff-ba') {
    if (eq(U)) return `Tar med allt. Det som finns i ${op === 'diff-ab' ? andra : forsta} ska bort.`;
    if (eq(X)) return `Tar med det som bara finns i ${op === 'diff-ab' ? andra : forsta}. Det ska bort.`;
    if (eq(op === 'diff-ab' ? BA : AB)) return 'Drar bort åt fel håll.';
    if (eq(I)) return 'Visar det gemensamma. Det är just det som ska bort.';
  }
  const dimEl = dim.element ? dim : { ...dim, element: dim.element };
  return textMangd(dimEl.typ === 'mangd' ? { ...dimEl, mangd: true } : dimEl, R, F, null);
}

// Överlagring följd av vridning (bandet "svår plus"). Första träff vinner:
// ovriden, fel håll, ett halvt varv för långt, fel operation med rätt
// vridning, bara en av rutorna vriden, annars ett element för mycket eller
// för lite.
const VRID_TEXT = (k) => `${(k <= 4 ? k : 8 - k) * 45} grader ${k <= 4 ? 'medurs' : 'moturs'}`;
export { VRID_TEXT };
function textOverlagringVriden(q, t, R, F, regel) {
  const dim = regel.dim;
  const V = gridV(q, t, dim.id);
  const { op, axel, k } = regel.info;
  const [A, B] = axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
  const S = (v) => new Set(v.map(String));
  const opv = (o) => [...OPS[o](S(A), S(B))].map(Number).sort((x, y) => x - y);
  const rot = (v, j) => rotera(dim, v, j);
  const C = opv(op);
  if (lika(F, C)) return `Lägger ihop rätt, men mönstret ska också vridas ${VRID_TEXT(k)}.`;
  if (lika(F, rot(C, -k))) return 'Vrider åt fel håll.';
  if (mod(k + 4, 8) !== k && lika(F, rot(C, k + 4))) return 'Vrider rätt håll men ett halvt varv för långt.';
  for (const o of Object.keys(OPS)) {
    if (o === op) continue;
    const D = opv(o);
    if (lika(D, C) || !lika(F, rot(D, k))) continue;
    const x = textOverlagring(q, t, C, D, { ...regel, regel: 'overlagring', info: { op, axel } });
    if (x) return `Vridningen stämmer, men ${liten(x)}`;
  }
  if (lika(F, rot(A, k))) return `Vrider bara ${axel === 'kolumn' ? 'den första' : 'den översta'} rutan. De två ska först läggas ihop.`;
  if (lika(F, rot(B, k))) return `Vrider bara ${axel === 'kolumn' ? 'den andra' : 'den mittersta'} rutan. De två ska först läggas ihop.`;
  return textMangd(dim, R, F, null);
}

function textSpegling(q, t, R, F, regel) {
  const dim = regel.dim;
  const V = gridV(q, t, dim.id);
  const { axel } = regel.info;
  const [A, B] = axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
  if (lika(F, B)) return axel === 'kolumn' ? 'Samma som rutan till vänster. Den andra speglingen saknas.' : 'Samma som rutan ovanför. Den andra speglingen saknas.';
  if (lika(F, A)) return axel === 'kolumn' ? 'Kopierar den första rutan i raden.' : 'Kopierar den översta rutan i kolumnen.';
  if (spegelbilder(dim, B).some((s) => lika(s, F))) return 'Speglar i fel linje.';
  for (let k = 1; k < dim.n; k++) if (lika(rotera(dim, B, k), F) || lika(rotera(dim, R, k), F)) return 'Vrider i stället för att spegla.';
  return textMangd(dim, R, F, null);
}

function textSumma(q, t, R, F, regel) {
  const dim = regel.dim;
  const V = gridV(q, t, dim.id);
  const [A, B] = regel.info.axel === 'kolumn' ? [V[2][0], V[2][1]] : [V[0][2], V[1][2]];
  const el = dim.id === 'ringantal' ? 'ring' : 'streck';
  if (F === A || F === B) return 'Tar bara med en av rutorna. Antalen ska läggas ihop.';
  if (F === Math.abs(A - B)) return 'Drar ifrån i stället för att lägga ihop.';
  const ovanfor = regel.info.axel === 'kolumn' ? V[1][2] : V[2][1];
  if (F === ovanfor && F !== R + 1 && F !== R - 1) return regel.info.axel === 'kolumn' ? 'Samma antal som rutan ovanför. Räkna ihop raden i stället.' : 'Samma antal som rutan till vänster. Räkna ihop kolumnen i stället.';
  if (F === R + 1) return `${artikel(el)} ${el} för mycket.`;
  if (F === R - 1) return `${artikel(el)} ${el} för lite.`;
  return null;
}

function textKonstant(q, t, R, F, regel) {
  const dim = regel.dim;
  const s = saknasText(dim, F, R);
  if (s) return s;
  if (dim.balans && dim.sida) return textBalansSida(q, t, R, F, regel);
  if (dim.balans) return `${dim.subj} står på samma plats hela tiden.`;
  if (dim.id === 'ringsvart' || dim.id === 'ringgra') return null;
  return konstantText(q.grid[0][0], dim.id, t.kind);
}

function textFor(q, t, dimId, F) {
  const regel = t.regel[dimId];
  const R = t.pred[dimId];
  const dim = regel.dim;
  if (dimId === 'yttre') {
    const allaOfyllda = POS.every(([r, c]) => q.grid[r][c].rings.slice(0, -1).every((f) => f === 'none'));
    if (allaOfyllda && F !== 'ofyllda' && String(F).split('+').some((f) => f && f !== 'none')) return 'De yttre ringarna är alltid ofyllda.';
  }
  switch (regel.regel) {
    case 'konstant': return textKonstant(q, t, R, F, regel);
    case 'rot-steg': case 'rot-kumulativ': return textRotation(q, t, R, F, regel);
    case 'periodisk':
      if (dim.balans && dim.sida) return textBalansSida(q, t, R, F, regel);
      return textPeriodisk(q, t, R, F, regel);
    case 'antal-steg': {
      const el = dim.id === 'ringantal' ? 'ring' : 'streck';
      if (F === R + 1) return `${artikel(el)} ${el} för mycket.`;
      if (F === R - 1) return `${artikel(el)} ${el} för lite.`;
      return null;
    }
    case 'latin': return dim.balans && dim.sida ? textBalansSida(q, t, R, F, regel) : textLatin(q, t, R, F, regel);
    case 'rad': case 'kolumn': case 'diagonal':
      if (dim.balans && dim.sida) return textBalansSida(q, t, R, F, regel);
      return textRadKolumn(q, t, R, F, regel);
    case 'overlagring': return textOverlagring(q, t, R, F, regel);
    case 'overlagring-vriden': return textOverlagringVriden(q, t, R, F, regel);
    case 'spegling': return textSpegling(q, t, R, F, regel);
    case 'summa': return textSumma(q, t, R, F, regel);
    default: return null;
  }
}

/** Två meningar till en, när de delar början eller bara skiljer i subjektet. */
function slaIhop(a, b) {
  const latin = /^(Tredje raden och tredje kolumnen har redan|Tredje raden har redan|Tredje kolumnen har redan) (.+)\.$/;
  const ma = a.match(latin); const mb = b.match(latin);
  if (ma && mb && ma[1] === mb[1]) return `${ma[1]} ${ma[2]} och ${mb[2]}.`;
  const SUBJ = /^(Den svarta rutan|Den grå rutan|De svarta rutorna|De grå rutorna|Pricken|Krysset|Kvadraten|Cirkeln|Pilen|Mönstret|Strecken|Längden|Spetsen|Mittpunkten) (.+)$/;
  const sa = a.match(SUBJ); const sb = b.match(SUBJ);
  if (sa && sb && sa[2] === sb[2] && sa[1] !== sb[1]) return `${sa[1]} och ${liten(sb[1])} ${sa[2]}`;
  if (sa && sb && sa[1] === sb[1]) return `${a.slice(0, -1)} och ${sb[2]}`;
  return `${a} ${b}`;
}

// Namn att säga "stämmer" om, för en dimension som är rätt.
function rattNamn(regel) {
  const d = regel.dim;
  if (d.balans) return null;
  if (regel.regel === 'overlagring-vriden') return null; // "Vridningen stämmer, men" sätts i textOverlagringVriden
  if (d.typ === 'rot' && (d.verb === 'vridit sig')) return 'vridningen';
  if (d.typ === 'rot') return 'läget';
  if (d.id.startsWith('lat-')) return null;
  return d.namn;
}

/**
 * misstag[] för en fråga. Varje fel alternativ får en mening, det rätta en
 * tom sträng. Saknas förklaring blir posten null.
 */
export function misstagFor(q, t = tolka(q)) {
  const manuella = MANUELLA[q.id];
  const maskinellt = misstagMaskinellt(q, t);
  return manuella ? maskinellt.map((x, i) => (i === q.correctAnswer ? '' : manuella[i] ?? x)) : maskinellt;
}

/**
 * Texter testansvarig skrivit för hand, på originalindex (spec-rummen 15.2
 * och 15.11). De går före den maskinella texten överallt: generatorerna,
 * berika-skriptet och facitkontrollen läser samma tabell.
 */
export const MANUELLA = {
  'v7g-q25-poly-rotate-walk': {
    2: 'Fel läge i vridningen. Efter 90 grader börjar den om på 0.',
    3: 'Samma som rutan till vänster. Vridningen har inte tagit sista steget.',
  },
  'v7-q5-lattice-xor': {
    3: 'Rutan uppe till höger finns i båda och ska bort. Rutan nere till höger finns bara i den första och ska vara kvar.',
  },
  'v7-q11-ring-xor': {
    2: 'Tar bort allt. Mellanringen och den innersta finns bara i en av rutorna och ska vara kvar.',
  },
  'v7-q13-tile-mirror': {
    4: 'Mittraden finns inte i någon spegling av rutan till vänster. Spegla den upp och ner.',
    5: 'Kopierar den översta rutan i kolumnen.',
  },
  'v7-q15-tile-xor': {
    1: 'Uppe till vänster och nere till höger saknas. Rutan till höger i mitten finns inte i någon av de två rutorna.',
    4: 'Alla rutor fyllda. Mitten finns i båda rutorna och ska bort.',
    5: 'Ingen ruta alls. De fyra hörnen finns i var sin ruta och ska vara med.',
  },
};

function misstagMaskinellt(q, t) {
  if (!t.ok) return q.options.map((_, i) => (i === q.correctAnswer ? '' : null));
  // 2×2 där flera fyllningar vrids tillsammans: beskriv hela mönstret
  const latRot = Object.values(t.regel).filter((x) => x.regel !== 'konstant');
  const helaMonstret = t.kind === 'lattice' && latRot.length >= 2 && latRot.every((x) => x.regel === 'rot-steg' && x.info.k === latRot[0].info.k);
  const tHel = helaMonstret ? tolkaVy(q, 'lattice', 1) : null;
  const aktiva = Object.entries(t.regel).filter(([, r]) => r.regel !== 'konstant').map(([id]) => id);
  return q.options.map((opt, i) => {
    if (i === q.correctAnswer) return '';
    const dimsO = t.dimsVy(opt);
    let fel = dimsO.filter((d) => !lika(d.varde, t.pred[d.id])).map((d) => d.id);
    if (fel.length === 0) return null; // ska inte hända: två rätta
    if (tHel && tHel.ok && tHel.regel['lat-hel']) {
      const R = q.options[q.correctAnswer].cells;
      const ickeTom = R.map((x, j) => (x !== 'empty' ? j : -1)).filter((j) => j >= 0);
      const bytt = ickeTom.some((a) => ickeTom.some((b) => a < b && lika(R.map((x, j) => (j === a ? R[b] : j === b ? R[a] : x)), opt.cells)));
      if (bytt) return 'Rätt läge, men två av fyllningarna har bytt plats.';
      const x = textFor(q, tHel, 'lat-hel', opt.cells);
      if (x) return x;
    }
    const F = (id) => dimsO.find((d) => d.id === id).varde;
    // Spegling i 2×2: jämför hela rutan, inte fyllnadstyp för fyllnadstyp
    const spegelRegel = Object.values(t.regel).find((x) => x.regel === 'spegling');
    if (spegelRegel && t.kind === 'lattice') {
      const axel = spegelRegel.info.axel;
      const A = axel === 'kolumn' ? q.grid[2][0] : q.grid[0][2];
      const B = axel === 'kolumn' ? q.grid[2][1] : q.grid[1][2];
      const RC = q.options[q.correctAnswer];
      if (lika(opt, B)) return axel === 'kolumn' ? 'Samma som rutan till vänster. Den andra speglingen saknas.' : 'Samma som rutan ovanför. Den andra speglingen saknas.';
      if (lika(opt, A)) return axel === 'kolumn' ? 'Kopierar den första rutan i raden.' : 'Kopierar den översta rutan i kolumnen.';
      if ([LAT.spegelH, LAT.spegelV, LAT.diag].some((f) => lika(f(B.cells), opt.cells))) return 'Speglar i fel linje.';
      if ([1, 2, 3].some((k) => lika(LAT.rot(B.cells, k), opt.cells) || lika(LAT.rot(RC.cells, k), opt.cells))) return 'Vrider i stället för att spegla.';
    }
    // Ringar: fel antal ringar ger också fel "yttre"; säg det bara en gång.
    if (fel.includes('ringantal') && fel.includes('yttre') && (F('yttre') === 'ofyllda' || String(F('yttre')).split('+').every((f) => !f || f === 'none'))) fel = fel.filter((id) => id !== 'yttre');
    // 2×2: rätt ruta men fel fyllning (svart i stället för grå och så vidare).
    if (t.kind === 'lattice' && fel.length === 2 && fel.every((id) => id.startsWith('lat-'))) {
      const [a, b] = fel;
      const ra = t.pred[a]; const rb = t.pred[b]; const fa = F(a); const fb = F(b);
      const flytt = (r, f, r2, f2) => r.length === f.length + 1 && f2.length === r2.length + 1 && r.filter((x) => !f.includes(x)).join() === f2.filter((x) => !r2.includes(x)).join();
      const typ = flytt(ra, fa, rb, fb) ? t.regel[a].dim.lat : flytt(rb, fb, ra, fa) ? t.regel[b].dim.lat : null;
      const ORD = { fill_black: 'vara svart', fill_gray: 'vara grå', dot: 'ha en prick', cross: 'ha ett kryss' };
      if (typ) return `Rätt plats, men rutan ska ${ORD[typ]}.`;
    }
    const texter = fel.map((id) => textFor(q, t, id, F(id)));
    let unika = [...new Set(texter)];
    if (texter.some((x) => !x) || unika.length > 2) {
      // Hela rutan kopierad från en grannruta
      if (lika(opt, q.grid[2][1])) return t.kind === 'balanceline' ? 'Samma som rutan till vänster. Formerna har varken flyttat eller bytt sida.' : 'Samma som rutan till vänster.';
      if (lika(opt, q.grid[1][2])) return 'Samma som rutan ovanför.';
      return null;
    }
    if (unika.length === 2) return slaIhop(unika[0], unika[1]);
    if (unika.length === 1) {
      // Prefix om en annan aktiv dimension är rätt: "Vridningen stämmer, men ..."
      const ratt = aktiva.filter((id) => !fel.includes(id));
      if (t.kind === 'balanceline') {
        const former = new Set(fel.map((id) => id.split('-')[1]));
        const andra = ['square', 'circle'].find((s) => !former.has(s) && ratt.some((id) => id.endsWith(s)));
        if (former.size === 1 && andra) return `${andra === 'square' ? 'Kvadraten' : 'Cirkeln'} står rätt, men ${liten(unika[0])}`;
        return unika[0];
      }
      const namn = ratt.map((id) => rattNamn(t.regel[id])).find(Boolean);
      if (namn && !fel.some((id) => rattNamn(t.regel[id]) === namn)) return `${stor(namn)} stämmer, men ${/^(En|Ett) .* för (mycket|lite).$/.test(unika[0]) ? 'det är ' : ''}${liten(unika[0])}`;
      return unika[0];
    }
    return unika.join(' ');
  });
}

export { tolka };
