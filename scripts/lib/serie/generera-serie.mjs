// scripts/lib/serie/generera-serie.mjs
// =============================================================================
// bygg(): en figurseriefråga ur en variant (recept-serie.mjs), eller null när
// slumpen gav en rad som inte klarar spärrarna. Facit räknas ur reglerna och
// kontrolleras mot tolkningen av de fem visade (FS4), så att facit alltid är
// det en kandidat kommer fram till och inget annat.
//
// Ordning: reglerna ger sex positioner; FS6 (antal inom gränserna), FS1
// (inga kopior i raden), FS2 (period), FS3 (takt), FS4 (entydig, och den
// enklaste läsningen per dimension är den avsedda regeln); geometrin per cell
// (G1, G2, G4, G11, G12 och zonerna S1 till S4 i v7-geometri-check --serie);
// sedan distraktorerna: kandidaterna (distraktorer.mjs), ett urval av fem som
// klarar kraven i A5 och S5, S6, S11, S12 och S13; sist hela frågan genom
// sparrFelSerie en gång till.
// =============================================================================

import { PRIM, byggCell, dimNyckel, giltigt, stable } from './celler-serie.mjs';
import { tolkaRad, radVarden, period, iTakt, enklaste, VISADE } from './tolka-serie.mjs';
import { kandidater, analysera, kravFel, utanRen } from './distraktorer.mjs';
import { sparrFelSerie, MIN_PERIOD, nabarMangd } from './sparrar.mjs';
import { regelText, misstagText, titel } from './misstag-serie.mjs';
import { geometriSerie } from '../../v7-geometri-check.mjs';

/** Hypotesen som regel, i frågans form. */
function somRegel(h, s) {
  switch (h.regel) {
    case 'konstant': return { regel: 'konstant', v: s[0] };
    case 'steg': return { regel: 'steg', s0: s[0], k: h.info.k };
    case 'vaxande': return { regel: 'vaxande', s0: s[0], d0: h.info.k, dd: h.info.dd };
    case 'cykel': return { regel: 'cykel', varden: s.slice(0, h.info.p) };
    case 'vaxelvis': return { regel: 'vaxelvis', s0: s[0], ke: h.info.ke, s1: s[1], ko: h.info.ko };
    default: return { regel: h.regel };
  }
}

/** Samma regel (för rot jämförs stegen mod 8). */
function sammaRegel(dim, a, b) {
  if (a.regel !== b.regel) return false;
  const m = (x) => (dim.typ === 'rot' ? ((x % 8) + 8) % 8 : x);
  switch (a.regel) {
    case 'konstant': return stable(a.v) === stable(b.v);
    case 'steg': return m(a.k) === m(b.k) && stable(m(a.s0)) === stable(m(b.s0));
    case 'vaxande': return m(a.d0) === m(b.d0) && m(a.dd) === m(b.dd);
    case 'cykel': return a.varden.length === b.varden.length;
    case 'vaxelvis': return m(a.ke) === m(b.ke) && m(a.ko) === m(b.ko);
    default: return false;
  }
}

/**
 * Raden ur reglerna, med kontrollerna som inte beror på alternativen.
 * Returnerar { rad, facitCell, vals, t } eller { fel }.
 */
export function byggRad(regler) {
  const dims = PRIM[regler.prim].dims;
  const vals = radVarden(regler.prim, regler.dims, 6);
  for (const v of vals) for (const d of dims) if (!giltigt(d, v[d.id])) return { fel: `FS6 ${d.id} = ${v[d.id]}` };
  const celler = vals.map((v) => byggCell(regler.prim, v));
  const rad = celler.slice(0, VISADE);
  const nycklar = celler.map(dimNyckel);
  if (new Set(nycklar).size < 6) return { fel: 'FS1 en figur återkommer' };
  const P = period(regler.prim, regler.dims);
  if (P < MIN_PERIOD) return { fel: `FS2 period ${P}` };
  if (iTakt(rad).length) return { fel: 'FS3 takt' };
  const t = tolkaRad(rad);
  if (!t.ok || !t.entydig) return { fel: 'FS4 tvetydig' };
  for (const d of dims) {
    if (stable(t.pred[d.id]) !== stable(vals[5][d.id])) return { fel: `FS4 tolkningen ger ${d.id} = ${t.pred[d.id]}` };
    const e = enklaste(t.per[d.id].hyp);
    const kanon = somRegel(e, t.per[d.id].s);
    if (!sammaRegel(d, kanon, regler.dims[d.id]) && !(regler.dims[d.id].regel === 'cykel' && kanon.regel === 'cykel')) return { fel: `enklaste läsningen av ${d.id} är ${e.regel}, inte ${regler.dims[d.id].regel}` };
  }
  const g = geometriSerie({ rad, options: [celler[5]] });
  if (g.length) return { fel: `geometri: ${g[0]}` };
  return { rad, facitCell: celler[5], vals, t };
}

// ---------------------------------------------------------------- snabbkontroll av ett urval
const rakna = (v) => { const m = new Map(); v.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return m; };

/**
 * S5, S6, S11, S12, S13 och S14 på värdena, utan att bygga cellerna. `nabar`:
 * regeldimensionernas nåbara mängder när de är mindre än primitivens (S12).
 */
function snabbFel(ids, regelIds, nabar, V, f, expert) {
  const tak = expert ? 0 : 1;
  const elim = new Set();
  const maj = [];
  for (const id of ids) {
    const v = V.map((x) => stable(x[id]));
    const n = rakna(v);
    const fc = n.get(v[f]);
    if (fc === 1 && [...rakna(v.filter((_, i) => i !== f)).values()].some((x) => x >= 2)) return 'S5';
    if (fc >= 2) v.forEach((x, i) => { if (i !== f && n.get(x) === 1) elim.add(i); });
    if (n.size > 1 && [...n.entries()].every(([k, c]) => k === v[f] || c < fc)) maj.push(id);
    if (regelIds.includes(id) && n.size < 2) return 'S13';
  }
  if (elim.size > tak) return 'S6';
  if (expert && maj.length) return 'S11';
  if (regelIds.length && regelIds.every((id) => maj.includes(id))) return 'S11r';
  for (const [id, m] of Object.entries(nabar)) if (V.some((x, i) => i !== f && !m.has(stable(x[id])))) return 'S12';
  if (regelIds.length >= 2) {
    for (const id of regelIds) if (V.every((x, i) => i === f || stable(x[id]) !== stable(V[f][id]))) return 'S14';
  }
  return null;
}

/**
 * Alternativen för en färdig rad (regler): kandidater, urval av fem och
 * hela frågan genom spärrarna. Används av bygg() och av omgång 2:s
 * ombyggnad av alternativ där raden och id:t står kvar.
 *
 * Urvalet (granskning 01, avsnitt 4 punkt 6): med en regeldimension tas alla
 * rena distraktorer (bryter bara regeln, ingen kopia) före någon som bryter en
 * konstant, och konstantbrotten sprids över olika konstanter. Vid avtagande
 * antal räknas "rätt antal, fel plats" som nära miss.
 */
export function byggAlternativ(r, mall, regler, meta, { pos, forsok = mall.niva === 'expert' ? 30000 : 6000, rad: fardigRad = null } = {}) {
  const rad = fardigRad ?? byggRad(regler);
  if (rad.fel) return null;
  const expert = mall.niva === 'expert';
  const dims = PRIM[regler.prim].dims;
  const ids = dims.map((d) => d.id);
  const radV = rad.vals.slice(0, VISADE);
  const facitV = rad.vals[5];
  const visade = new Set(rad.rad.map(dimNyckel));
  const facitKey = dimNyckel(rad.facitCell);
  const sett = new Set();
  const pool = [];
  for (const k of kandidater(regler, radV, facitV, { expert })) {
    if (!dims.every((d) => giltigt(d, k.v[d.id]))) continue;
    const cell = byggCell(regler.prim, k.v);
    const key = dimNyckel(cell);
    if (key === facitKey || visade.has(key) || sett.has(key)) continue;
    if (geometriSerie({ rad: [], options: [cell] }).length) continue;
    sett.add(key);
    pool.push({ ...k, cell });
  }
  const regelIds = ids.filter((i) => regler.dims[i].regel !== 'konstant');
  // S12: värden utanför regelns nåbara mängd tas aldrig in i poolen.
  const nabar = {};
  for (const d of dims) {
    if (!regelIds.includes(d.id)) continue;
    const m = nabarMangd(d, regler.dims[d.id]);
    const stor = d.typ === 'rot' ? d.n : d.typ === 'kat' ? d.L.length : d.max - d.min + 1;
    if (m.size < stor) nabar[d.id] = m;
  }
  const filtrerad = pool.filter((k) => Object.entries(nabar).every(([id, m]) => m.has(stable(k.v[id]))));
  if (filtrerad.length < 5) return null;
  for (const k of filtrerad) {
    k.bryter = regelIds.filter((i) => stable(k.v[i]) !== stable(facitV[i]));
    k.konst = ids.filter((i) => !regelIds.includes(i) && stable(k.v[i]) !== stable(facitV[i]));
  }
  const ren = regelIds.length === 1 ? filtrerad.filter((k) => k.bryter.length === 1 && k.konst.length === 0) : [];
  const ovriga = filtrerad.filter((k) => !ren.includes(k));
  const minskande = regelIds.filter((i) => utanRen(dims.find((d) => d.id === i), regler.dims[i], facitV[i]));
  const kravOk = (val, strikt) => {
    for (const i of regelIds) if (val.filter((k) => k.bryter.includes(i)).length < 2) return false;
    if (!expert) {
      for (const i of regelIds) {
        const bara = val.some((k) => k.bryter.length === 1 && k.bryter[0] === i && k.konst.length === 0);
        const nara = minskande.includes(i) && val.some((k) => k.bryter.length === 0 && k.konst.length === 1);
        if (!bara && !nara) return false;
      }
    } else {
      if (regelIds.length >= 2 && !val.some((k) => k.bryter.length === 1 && k.konst.length === 0)) return false;
      const alla = val.filter((k) => k.bryter.length === regelIds.length);
      if (new Set(alla.map((k) => regelIds.map((i) => stable(k.v[i])).join('|'))).size < 2) return false;
    }
    // Granskning 02, F6: högst två av fem bryter en konstant, och varje regel har
    // en nära miss bland dem som håller konstanterna. Bara expert: på avancerad
    // F5 (en regeldimension med S12:s nåbara mängd) finns för få rena
    // distraktorer för att fem ska klara S5 och S6 med högst två konstantbrott.
    // Högst två i den strikta halvan; annars tre, som i fs-e-vaxl-09 som
    // testansvarig släppte (granskning 02, F6), när raden inte ger fler rena.
    if (expert) {
      // Granskning 03: noll konstantbrott i första hand, tre när raden inte ger
      // fem rena, aldrig ett eller två (S6 och S11 fäller dem på expert).
      const kb = val.filter((k) => k.konst.length > 0).length;
      if (strikt ? kb !== 0 : kb !== 0 && kb !== 3) return false;
    }
    // Med en konstant: krav. Utan (F6 med tre regler): rekommendation, prövas i den strikta halvan.
    const harKonstant = ids.length > regelIds.length;
    // Granskning 03, 5.2: en ren nära miss per regel är krav på expert, också på F6 utan konstant.
    void harKonstant;
    if (expert) for (const i of regelIds) if (!val.some((k) => k.konst.length === 0 && k.bryter.length === 1 && k.bryter[0] === i)) return false;
    if (strikt) {
      // Konstantbrotten sprids över olika konstanter när primitiven har flera.
      const konstanter = ids.filter((i) => !regelIds.includes(i));
      const brott = val.filter((k) => k.konst.length > 0).map((k) => k.konst.join('+'));
      if (konstanter.length >= 2 && brott.length >= 2 && new Set(brott).size < 2) return false;
    }
    return true;
  };
  const antalRena = Math.min(ren.length, 5);
  for (let n = 0; n < forsok; n++) {
    // Strikt först: alla rena (upp till fem) och spridda konstantbrott; efter
    // halva försöken lättar kravet på spridningen.
    const strikt = n < forsok / 2;
    const val = [];
    const rena = [...ren];
    for (let i = rena.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [rena[i], rena[j]] = [rena[j], rena[i]]; }
    val.push(...rena.slice(0, antalRena));
    const tagna = new Set();
    let varv = 0;
    while (val.length < 5 && varv++ < 200) {
      const j = Math.floor(r() * ovriga.length);
      if (tagna.has(j)) continue;
      tagna.add(j);
      val.push(ovriga[j]);
    }
    if (val.length < 5) return null;
    if (!kravOk(val, strikt)) continue;
    const V = [...val.map((k) => k.v)];
    V.splice(pos, 0, facitV);
    if (snabbFel(ids, regelIds, nabar, V, pos, expert)) continue;
    const options = val.map((k) => k.cell);
    options.splice(pos, 0, rad.facitCell);
    const felLista = val.map((k) => k.fel);
    felLista.splice(pos, 0, null);
    const varierar = new Set(ids.filter((i) => new Set(V.map((x) => stable(x[i]))).size > 1));
    const q = {
      id: meta.id,
      niva: mall.niva,
      family: meta.family,
      recept: mall.id,
      variant: meta.variant,
      difficulty: mall.difficulty,
      p_prior: mall.p_prior,
      title: titel(regler),
      rule: regelText(regler, varierar),
      rad: rad.rad,
      options,
      correctAnswer: pos,
      misstag: felLista.map((fel) => (fel ? misstagText(regler, facitV, fel) : '')),
      regler,
      fran_version: 1,
    };
    const { fel } = sparrFelSerie(q);
    if (fel.length) continue;
    const a = analysera(q, V);
    if (kravFel(a, mall.niva).length) continue;
    if (geometriSerie(q).length) continue;
    return q;
  }
  return null;
}

/**
 * Bygger en fråga ur en variant. `pos` är facits plats bland alternativen
 * (0 till 5). Returnerar frågan eller null.
 */
export function bygg(r, mall, variant, { id, pos, forsok } = {}) {
  const regler = variant.regler(r);
  const rad = byggRad(regler);
  if (rad.fel) return null;
  return byggAlternativ(r, mall, regler, { id, family: variant.family, variant: variant.namn }, { pos, forsok, rad });
}
