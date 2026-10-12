// scripts/lib/serie/misstag-serie.mjs
// =============================================================================
// Texterna i figurserier: regeln per fråga och misstaget per distraktor
// (beställningen omgång 2, A5). Svenska, korta meningar, inga tankstreck och
// aldrig "lätt". Genomgången visar dem ordagrant (figurserier-spec.md 8).
// =============================================================================

import { mod } from './celler-serie.mjs';

const ORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];
const ORD_EN = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];
const RIKTNING = ['uppåt', 'snett uppåt höger', 'åt höger', 'snett nedåt höger', 'nedåt', 'snett nedåt vänster', 'åt vänster', 'snett uppåt vänster'];
const FYLL = { none: 'ofylld', gray: 'grå', black: 'svart' };
const FORM = { circle: 'cirkel', square: 'kvadrat', triangle: 'triangel', diamond: 'romb' };
const SYMBOL = { plus: 'plus', minus: 'minus', dot: 'prick', ring: 'ring', cross: 'kryss' };

/**
 * Hur en dimension beskrivs. slag: vrid (vridning), ga (vandring längs en
 * bana), antal, kat. elem: [en, flera] för antal.
 */
function info(prim, id) {
  const duoKant = prim.startsWith('duo-kant');
  switch (`${prim.startsWith('duo-') ? 'duo' : prim}.${id}`) {
    case 'pil.vinkel': return { slag: 'vrid', subj: 'Pilen', pekar: true };
    case 'pil.langd': return { slag: 'kat', subj: 'Pilen', namn: (v) => (v === 'long' ? 'lång' : 'kort') };
    case 'pil.spets': return { slag: 'kat', subj: 'Spetsen', namn: (v) => (v === 'open' ? 'öppen' : 'fylld') };
    case 'orbital.satellit': return { slag: 'ga', subj: 'Pricken', var: 'runt cirkeln' };
    case 'orbital.mitt': return { slag: 'kat', subj: 'Mittpunkten', namn: (v) => (v === 'filled' ? 'fylld' : 'ofylld') };
    case 'stralar.start': return { slag: 'vrid', subj: 'Strecken' };
    case 'stralar.antal': return { slag: 'antal', elem: ['streck', 'streck'], ett: true, lagg: 'Ett streck till läggs till medurs', ta: 'Det sista strecket medurs försvinner' };
    case 'sektor.start': return { slag: 'vrid', subj: 'De svarta sektorerna' };
    case 'sektor.antal': return { slag: 'antal', elem: ['svart sektor', 'svarta sektorer'], lagg: 'En sektor till blir svart medurs', ta: 'Den sista svarta sektorn medurs blir vit' };
    case 'block.start': return { slag: 'ga', subj: 'De svarta rutorna', subjEn: 'Den svarta rutan', var: 'längs kanten' };
    case 'block.antal': return { slag: 'antal', elem: ['svart ruta', 'svarta rutor'], lagg: 'En ruta till blir svart medurs längs kanten', ta: 'Den sista svarta rutan medurs blir vit' };
    case 'poly.horn': return { slag: 'antal', elem: ['hörn', 'hörn'], ett: true, lagg: 'Figuren får ett hörn till', ta: 'Figuren förlorar ett hörn' };
    case 'poly.fyllning': return { slag: 'kat', subj: 'Figuren', namn: (v) => FYLL[v] };
    case 'grundform.bas': return { slag: 'kat', subj: 'Grundformen', namn: (v) => FORM[v], substantiv: true };
    case 'grundform.symbol': return { slag: 'kat', subj: 'Symbolen', namn: (v) => SYMBOL[v], substantiv: true };
    // "Fyllningen följer ordningen" (granskning 01, avsnitt 4 punkt 8).
    case 'grundform.fyllning': return { slag: 'kat', subj: 'Fyllningen', namn: (v) => FYLL[v] };
    case 'duo.ylage': return duoKant
      ? { slag: 'ga', subj: 'Pricken', subjFler: 'Prickarna', var: 'längs kanten' }
      : { slag: 'ga', subj: 'Pricken', var: 'runt banan' };
    case 'duo.yantal': return { slag: 'antal', elem: ['prick', 'prickar'], lagg: 'En prick till läggs till medurs längs kanten', ta: 'Den sista pricken medurs försvinner' };
    case 'duo.kvinkel': return { slag: 'vrid', subj: 'Pilen i mitten', pekar: true };
    case 'duo.kform': return { slag: 'kat', subj: 'Formen i mitten', namn: (v) => FORM[v], substantiv: true };
    case 'duo.kfyll': return { slag: 'kat', subj: 'Formen i mitten', namn: (v) => FYLL[v] };
    case 'duo.ksymbol': return { slag: 'kat', subj: 'Symbolen i mitten', namn: (v) => SYMBOL[v], substantiv: true };
    default: throw new Error(`ingen text för ${prim}.${id}`);
  }
}

const versal = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const riktning = (k) => (mod(k, 8) < 4 ? 'medurs' : 'moturs');
const storlek = (k) => { const x = mod(k, 8); return x <= 4 ? x : 8 - x; };
const antalOrd = (I, n) => `${(I.ett ? ORD : ORD_EN)[n] ?? n} ${n === 1 ? I.elem[0] : I.elem[1]}`;
const lista = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} och ${a[a.length - 1]}`);

/** Subjektet, med plural för prickar och rutor när de är flera. */
function subjekt(I, v, fler) {
  if (fler && I.subjFler) return I.subjFler;
  if (!fler && I.subjEn) return I.subjEn;
  return I.subj;
}

/** "vrids 90 grader medurs" eller "går tre steg moturs längs kanten". */
function rorelse(I, k) {
  if (mod(k, 8) === 0) return I.slag === 'vrid' ? 'står still' : 'står kvar';
  if (I.slag === 'vrid') return `vrids ${storlek(k) * 45} grader ${riktning(k)}`;
  return `går ${ORD[storlek(k)]} steg ${riktning(k)} ${I.var}`;
}

function vardeNamn(prim, id, I, v) {
  if (I.slag === 'kat') return I.namn(v);
  if (I.slag === 'antal') return antalOrd(I, v);
  if (I.pekar) return RIKTNING[mod(v, 8)];
  return null;
}

/** Meningen för en regel i en dimension. `fler`: elementet består av flera delar. */
export function regelMening(prim, id, r, { fler = false } = {}) {
  const I = info(prim, id);
  const S = subjekt(I, null, fler);
  switch (r.regel) {
    case 'konstant': {
      if (I.slag === 'kat') return `${S} är ${I.namn(r.v)} i hela raden.`;
      if (I.slag === 'antal') return `Antalet ${I.elem[1]} är ${ORD[r.v]} i hela raden.`;
      if (I.pekar) return `${S} pekar ${RIKTNING[mod(r.v, 8)]} i hela raden.`;
      return `${S} står på samma plats i hela raden.`;
    }
    case 'steg':
      if (I.slag === 'antal') return `${r.k > 0 ? I.lagg : I.ta} i varje steg.`;
      return `${S} ${rorelse(I, r.k)} i varje steg.`;
    case 'vaxande': {
      const steg = [0, 1, 2].map((i) => r.d0 + r.dd * i);
      const rikt = riktning(steg[0]);
      if (I.slag === 'vrid') return `${S} vrids ${rikt}, och vridningen växer med ${Math.abs(r.dd) * 45} grader varje gång: ${steg.map((x) => storlek(x) * 45).join(', ')} grader och så vidare.`;
      return `${S} går ${rikt} ${I.var}, och steget växer med ${ORD[Math.abs(r.dd)]} varje gång: ${steg.map((x) => ORD[storlek(x)]).join(', ')} steg och så vidare.`;
    }
    case 'cykel': {
      const namn = r.varden.map((v) => vardeNamn(prim, id, I, v) ?? String(v));
      if (I.slag === 'antal') {
        return r.varden.length === 2 && new Set(r.varden).size === 2
          ? `Antalet ${I.elem[1]} växlar mellan ${ORD[r.varden[0]]} och ${ORD[r.varden[1]]}.`
          : `Antalet ${I.elem[1]} följer ordningen ${r.varden.map((v) => ORD[v]).join(', ')} och börjar om.`;
      }
      if (I.pekar) {
        return r.varden.length === 2
          ? `${S} pekar växelvis ${namn[0]} och ${namn[1]}.`
          : `${S} pekar i tur och ordning ${lista(namn)}, och börjar sedan om.`;
      }
      if (r.varden.length === 2) return `${S} växlar mellan ${namn[0]} och ${namn[1]}.`;
      return `${S} följer ordningen ${namn.join(', ')} och börjar om.`;
    }
    case 'vaxelvis': {
      // "I den första, tredje och femte vrids pilen 90 grader medurs": subjektet efter verbet.
      const s = S.charAt(0).toLowerCase() + S.slice(1);
      const fras = (k) => rorelse(I, k).replace(/^(vrids|går|står)/, `$1 ${s}`);
      return `Varannan figur hör till samma serie. I den första, tredje och femte ${fras(r.ke)}; i den andra och fjärde ${fras(r.ko)}. Luckan hör till den andra serien.`;
    }
    default:
      throw new Error(`okänd regel ${r.regel}`);
  }
}

/**
 * Regeltexten för en fråga: en mening per regelstyrd dimension, och en mening
 * per konstant egenskap som skiljer alternativen åt (så att genomgången
 * förklarar varför de är fel).
 */
export function regelText(regler, varierar) {
  const { prim, dims } = regler;
  const fler = (id) => (id === 'ylage' && dims.yantal && (dims.yantal.regel !== 'konstant' || dims.yantal.v > 1)) || (id === 'start' && prim === 'block' && (dims.antal?.regel !== 'konstant' || dims.antal?.v > 1));
  const delar = [];
  const ids = Object.keys(dims);
  for (const id of ids) if (dims[id].regel !== 'konstant') delar.push(regelMening(prim, id, dims[id], { fler: fler(id) }));
  // Bågen som växer från ett fast ställe: starten står still, det säger regeln redan.
  const bageVaxer = ['stralar', 'sektor', 'block'].includes(prim) && dims.antal?.regel === 'steg' && dims.start?.regel === 'konstant';
  for (const id of ids) {
    if (dims[id].regel !== 'konstant' || !varierar.has(id)) continue;
    if (bageVaxer && id === 'start') continue;
    delar.push(regelMening(prim, id, dims[id], { fler: fler(id) }));
  }
  return delar.join(' ');
}

// Copy omgång 3, 6.3 (M1 till M8).
const JAMN = 'Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde.';
const PLURAL = new Set(['Strecken', 'De svarta sektorerna', 'De svarta rutorna', 'Prickarna']);
const plural = (S) => PLURAL.has(S);
const ENHETER = ['streck', 'svarta sektorer', 'svarta rutor', 'prickar', 'hörn'];
/** "Antalet ska vara" utan enhet när en tidigare mening redan sagt vad det gäller (copy omgång 3, 6.2). */
export function utanUpprepadEnhet(meningar) {
  return meningar.map((m, i) => (i === 0 ? m : ENHETER.reduce((x, e) => x.replace(new RegExp(`Antalet ${e} ska vara ([a-zåäö]+), inte`), 'Antalet ska vara $1, inte'), m)));
}

/** Misstaget för en distraktor: en mening per fel, högst tre. */
export function misstagText(regler, facitV, fel) {
  const { prim, dims } = regler;
  const meningar = [];
  for (const f of fel) {
    const I = info(prim, f.dim);
    const r = dims[f.dim];
    const fler = f.dim === 'ylage' && (facitV.yantal ?? 1) > 1;
    const S = subjekt(I, null, fler || (f.dim === 'start' && prim === 'block' && (facitV.antal ?? 1) > 1));
    const fv = facitV[f.dim];
    if (r.regel === 'konstant') {
      if (I.slag === 'kat') meningar.push(`${S} ska vara ${I.namn(fv)}, som i hela raden.`);
      else if (I.slag === 'antal') meningar.push(`Antalet ${I.elem[1]} ska vara ${ORD[fv]}, som i hela raden.`);
      else if (I.pekar) meningar.push(`${S} ska peka ${RIKTNING[mod(fv, 8)]}, som i hela raden.`);
      else meningar.push(I.slag === 'vrid' ? `${S} är ${plural(S) ? 'vridna' : 'vriden'}, men i raden står ${plural(S) ? 'de' : 'den'} still.` : `${S} har flyttat sig, men i raden står ${plural(S) ? 'de' : 'den'} still.`);
      continue;
    }
    if (I.slag === 'kat') {
      meningar.push(`${S} ska vara ${I.namn(fv)}, inte ${I.namn(f.v)}.`);
      continue;
    }
    if (I.slag === 'antal') {
      const okar = r.regel === 'steg' ? r.k > 0 : f.v < fv;
      if (f.typ === 'stilla') meningar.push(`Antalet ${I.elem[1]} har inte ${r.k > 0 ? 'ökat' : 'minskat'}. Luckan ska ha ${I.ett ? 'ett' : 'en'} ${r.k > 0 ? 'mer' : 'färre'} än den femte figuren.`);
      else if (f.typ === 'for_langt') meningar.push(`${versal(antalOrd(I, Math.abs(f.v - fv)))} för ${f.v > fv ? 'många' : 'få'}.`);
      else if (f.typ === 'jamn') meningar.push(JAMN);
      else meningar.push(`Antalet ${I.elem[1]} ska vara ${(I.ett ? ORD : ORD_EN)[fv]}, inte ${(I.ett ? ORD : ORD_EN)[f.v]}.`);
      void okar;
      continue;
    }
    // vridning och vandring
    const vrid = I.slag === 'vrid';
    switch (f.typ) {
      case 'for_langt': meningar.push(vrid ? `${S} har vridits ett steg för långt.` : `${S} har gått ett steg för långt.`); break;
      case 'fel_hall': meningar.push(vrid ? `${S} vrids åt fel håll.` : `${S} går åt fel håll.`); break;
      case 'stilla':
        meningar.push(r.regel === 'vaxelvis' ? `${S} står som i den fjärde figuren. Den andra serien tar ett steg till innan luckan.` : `${S} står kvar som i den femte figuren.`);
        break;
      case 'som_femte': meningar.push(`${S} står kvar som i den femte figuren.`); break;
      case 'jamn': meningar.push(JAMN); break;
      case 'vaxer_inte': meningar.push(vrid ? 'Vridningen har inte vuxit sista gången.' : 'Steget har inte vuxit sista gången.'); break;
      default:
        if (I.pekar) meningar.push(`${S} pekar ${RIKTNING[mod(f.v, 8)]}, men ska peka ${RIKTNING[mod(fv, 8)]}.`);
        else meningar.push(vrid ? `${S} är ${plural(S) ? 'vridna' : 'vriden'} till fel läge.` : `${S} står på fel plats.`);
    }
  }
  return utanUpprepadEnhet(meningar.slice(0, 3)).join(' ');
}

/** Rubriken i genomgångslistan: vad som händer, utan att avslöja steget. */
export function titel(regler) {
  const { prim, dims } = regler;
  const rorliga = Object.keys(dims).filter((id) => dims[id].regel !== 'konstant');
  const namn = {
    pil: 'Pilen', orbital: 'Pricken runt cirkeln', stralar: 'Strecken', sektor: 'Sektorhjulet', block: 'Rutorna längs kanten', poly: 'Månghörningen', grundform: 'Grundformen',
  }[prim] ?? (prim.includes('kant') ? 'Pricken längs kanten' : 'Pricken på banan');
  const n = rorliga.length;
  return `${namn}, ${n === 1 ? 'en regel' : n === 2 ? 'två regler' : 'tre regler'}`;
}
