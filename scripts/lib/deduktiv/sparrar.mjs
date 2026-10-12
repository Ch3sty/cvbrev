// scripts/lib/deduktiv/sparrar.mjs
// =============================================================================
// Spärrarna DD1 till DD5 (beställningen omgång 3, B1). Samma funktioner körs
// i generatorn (en kandidat som fälls slängs) och i validate-deduktiv.mjs.
//
// En uppgift har `formell` (visas aldrig):
//   D1: { termer, individer, premisser: Sats[], alternativ: Sats[], roller: string[] }
//   D2, D3: { tema, namn, villkor: Villkor[], antagande?: Villkor (D3),
//             fraga: { form: 'vem', k } | { form: 'maste' } | { form: 'omojlig' },
//             alternativ: number[] (vem: elementens index) | Villkor[] (påståenden) }
//
// DD1 Exakt en lösning (D2, D3; i D3 med antagandet). Facit stämmer mot
//     lösningen, varje distraktor gör det inte. D1: facit nödvändigt i alla
//     modeller, varje distraktor obestämd eller omöjlig, samma status med och
//     utan existens.
//     Tillägg i samma spärr, så att lösningen inte står i texten: vem-frågan
//     har inget plats-villkor på den frågade platsen; ett påstående i maste
//     följer inte ur ett enda villkor; i D3 har grundpusslet utan antagandet
//     minst två lösningar och facit går ihop med villkoren utan antagandet.
// DD2 Inget villkor är överflödigt: tas ett bort (eller antagandet i D3) finns
//     fler lösningar.
// DD3 Minst tre av fyra distraktorer är nära missar: det finns en tilldelning
//     som bryter exakt ett villkor och där distraktorn hade varit svaret.
//     Varje villkor bryts av någon distraktors nära miss. (En distraktor kan
//     ha flera nära missar; täckningen räknas över alla.)
// DD4 Namnen ur listorna, aldrig samma begynnelsebokstav två gånger.
// DD5 Förklaringen är lösarens gång (forklaring.mjs), ordagrant, och slutar
//     i lösningen; schemat är lösningen.
// =============================================================================

import { losningar, allaTilldelningar, brutna, uppfyllt, schemaRad, villkorNyckel } from './losare.mjs';
import { forklara } from './forklaring.mjs';
import { TEMAN, namnFel, villkorText, etikett } from './tema.mjs';
import { stabilStatus } from './mangdmodell.mjs';

const grupperFor = (f) => TEMAN[f.tema]?.grupper ?? null;
const allaVillkor = (f) => (f.antagande ? [...f.villkor, f.antagande] : f.villkor);

/** Hade alternativ x varit svaret i tilldelningen pos? */
export function vore(f, x, pos) {
  const g = grupperFor(f);
  if (f.fraga.form === 'vem') return pos[x] === f.fraga.k;
  if (f.fraga.form === 'maste') return uppfyllt(x, pos, g);
  if (f.fraga.form === 'omojlig') return !uppfyllt(x, pos, g);
  throw new Error(`okänd frågeform ${f.fraga.form}`);
}

/** Följer påståendet s ur villkoret c ensamt (i alla tilldelningar där c gäller)? */
function foljerAv(n, c, s, g) {
  return allaTilldelningar(n)
    .filter((p) => uppfyllt(c, p, g))
    .every((p) => uppfyllt(s, p, g));
}

export function dd1(q) {
  const f = q.formell;
  const fel = [];
  if (q.typ === 'D1') {
    const prem = f.premisser.flatMap((p) => p);
    f.alternativ.forEach((a, i) => {
      const s = stabilStatus(f.termer, f.individer, prem, a);
      if (s == null) fel.push(`DD1: alternativ ${i + 1} beror på om det finns några alls (olika status med och utan existens)`);
      else if (s === 'motsagelse') fel.push('DD1: premisserna motsäger varandra');
      else if (i === q.correctAnswer && s !== 'nodvandig') fel.push(`DD1: facit är ${s}, inte nödvändigt`);
      else if (i !== q.correctAnswer && s === 'nodvandig') fel.push(`DD1: alternativ ${i + 1} är också nödvändigt`);
      if (f.roller && s && f.roller[i] !== s) fel.push(`DD1: alternativ ${i + 1} är ${s}, rollen säger ${f.roller[i]}`);
    });
    return fel;
  }
  const n = f.namn.length;
  const g = grupperFor(f);
  const S = losningar(n, allaVillkor(f), g);
  if (S.length !== 1) return [`DD1: ${S.length} lösningar, ska vara exakt en`];
  const [pos] = S;
  f.alternativ.forEach((x, i) => {
    const sant = vore(f, x, pos);
    if (i === q.correctAnswer && !sant) fel.push('DD1: facit stämmer inte mot lösningen');
    if (i !== q.correctAnswer && sant) fel.push(`DD1: alternativ ${i + 1} stämmer också`);
  });
  const nycklar = f.alternativ.map((x) => (typeof x === 'number' ? `e${x}` : villkorNyckel(x)));
  if (new Set(nycklar).size !== nycklar.length) fel.push('DD1: två alternativ är samma');
  if (f.fraga.form === 'vem' && f.villkor.some((c) => c.typ === 'plats' && c.k === f.fraga.k))
    fel.push(`DD1: villkoren säger rakt ut vem som står på plats ${f.fraga.k}`);
  if (f.fraga.form === 'vem' && f.antagande && f.antagande.k === f.fraga.k) fel.push('DD1: antagandet svarar på frågan');
  if (f.fraga.form === 'maste') {
    const facit = f.alternativ[q.correctAnswer];
    if (f.villkor.some((c) => foljerAv(n, c, facit, g))) fel.push('DD1: facit följer ur ett enda villkor');
    const fk = villkorNyckel(facit);
    if (f.villkor.some((c) => villkorNyckel(c) === fk)) fel.push('DD1: facit står ordagrant bland villkoren');
  }
  if (q.typ === 'D3') {
    if (!f.antagande || f.antagande.typ !== 'plats') fel.push('DD1: D3 saknar antagande');
    else {
      const bas = losningar(n, f.villkor, g);
      if (bas.length < 2) fel.push(`DD1: utan antagandet har pusslet ${bas.length} lösning, ska vara minst två`);
      if (f.fraga.form === 'omojlig') {
        const facit = f.alternativ[q.correctAnswer];
        if (!bas.some((p) => uppfyllt(facit, p, g))) fel.push('DD1: facit är omöjligt redan utan antagandet');
      }
    }
  }
  return fel;
}

export function dd2(q) {
  if (q.typ === 'D1') return [];
  const f = q.formell;
  const n = f.namn.length;
  const g = grupperFor(f);
  const fel = [];
  const alla = allaVillkor(f);
  alla.forEach((_, i) => {
    const utan = alla.filter((__, j) => j !== i);
    if (losningar(n, utan, g).length <= 1)
      fel.push(i === f.villkor.length ? 'DD2: antagandet är överflödigt' : `DD2: villkor ${i + 1} är överflödigt`);
  });
  return fel;
}

/** Nära missar per alternativ: index för villkor som bryts ensamma i en tilldelning där alternativet vore svaret. */
export function naraMissar(q) {
  const f = q.formell;
  const n = f.namn.length;
  const g = grupperFor(f);
  const ut = f.alternativ.map(() => new Set());
  for (const pos of allaTilldelningar(n)) {
    if (f.antagande && !uppfyllt(f.antagande, pos, g)) continue;
    const b = brutna(pos, f.villkor, g);
    if (b.length !== 1) continue;
    f.alternativ.forEach((x, i) => {
      if (vore(f, x, pos)) ut[i].add(b[0]);
    });
  }
  return ut.map((s) => [...s].sort((a, b) => a - b));
}

export function dd3(q) {
  if (q.typ === 'D1') return [];
  const f = q.formell;
  const nm = naraMissar(q);
  const fel = [];
  const distr = f.alternativ.map((_, i) => i).filter((i) => i !== q.correctAnswer);
  const nara = distr.filter((i) => nm[i].length > 0);
  if (nara.length < Math.min(3, distr.length)) fel.push(`DD3: ${nara.length} av ${distr.length} distraktorer är nära missar, minst tre krävs`);
  const tackta = new Set(distr.flatMap((i) => nm[i]));
  f.villkor.forEach((_, k) => {
    if (!tackta.has(k)) fel.push(`DD3: villkor ${k + 1} bryts inte av någon distraktor`);
  });
  return fel;
}

/** DV2: namnens längd efter antalet platser (deduktiv-spec 2.2). */
export const NAMN_MAX_LANGD = { 4: 6, 5: 6, 6: 5 };

export function dd4(q) {
  if (q.typ === 'D1') return [];
  const f = q.formell;
  const fel = namnFel(f.tema, f.namn);
  const max = NAMN_MAX_LANGD[f.namn.length];
  if (TEMAN[f.tema].element === 'namn') for (const x of f.namn) if (x.length > max) fel.push(`DV2: ${x} är längre än ${max} bokstäver`);
  return fel;
}

export function dd5(q) {
  if (q.typ === 'D1') {
    const steg = q.losning?.steg;
    if (!Array.isArray(steg) || !steg.length) return ['DD5: förklaringen saknas'];
    const antal = q.villkor.length;
    const fel = [];
    for (const x of steg) {
      if (typeof x.foljd !== 'string' || !x.foljd) fel.push('DD5: ett steg saknar text');
      for (const m of x.markor ?? []) if (!(Number.isInteger(m) && m >= 1 && m <= antal)) fel.push(`DV3: steget pekar på premiss ${m}, som inte finns`);
    }
    if (q.losning.schema != null) fel.push('DV1: D1 har ingen remsa');
    return fel;
  }
  const f = q.formell;
  const fk = forklara({ tema: f.tema, namn: f.namn, villkor: f.villkor, antagande: f.antagande ?? null });
  if (!fk) return ['DD5: lösaren kan inte förklara uppgiften med en rad per steg'];
  const fel = [];
  const S = losningar(f.namn.length, allaVillkor(f), grupperFor(f));
  if (S.length === 1 && fk.pos.join() !== S[0].join()) fel.push('DD5: förklaringen slutar inte i lösningen');
  if (JSON.stringify(fk.steg) !== JSON.stringify(q.losning?.steg)) fel.push('DD5: förklaringen är inte lösarens gång ordagrant');
  if (S.length === 1) {
    const rad = schemaRad(S[0]).map((i) => [etikett(f.tema, f.namn[i])]);
    if (JSON.stringify(rad) !== JSON.stringify(q.losning?.schema?.namn ?? null)) fel.push('DD5: schemat är inte lösningen');
  }
  // DV3: varje steg pekar på ett villkor som finns, eller på antagandet.
  for (const x of q.losning?.steg ?? [])
    for (const m of x.markor ?? [])
      if (!(m === 'Om' && f.antagande) && !(Number.isInteger(m) && m >= 1 && m <= f.villkor.length)) fel.push(`DV3: steget pekar på ${m}, som inte finns`);
  // DV5: koppar bara på en plats, bara i vem-frågor och i måste-frågor med ett platssvar.
  const k = q.losning?.schema?.koppar ?? null;
  const facit = f.alternativ[q.correctAnswer];
  const vantad = f.fraga.form === 'vem' ? f.fraga.k : f.fraga.form === 'maste' && facit?.typ === 'plats' ? facit.k : null;
  if (k !== vantad) fel.push(`DV5: kopparn står på ${k}, ska stå på ${vantad}`);
  if ((q.losning?.schema?.antagande ?? null) !== (f.antagande?.k ?? null)) fel.push('DV5: antagandets plats i remsan stämmer inte');
  return fel;
}

/** Texterna i uppgiften måste vara mallarnas (villkor och alternativ). */
export function textFel(q) {
  if (q.typ === 'D1') return [];
  const f = q.formell;
  const fel = [];
  f.villkor.forEach((c, i) => {
    if (villkorText(f.tema, f.namn, c) !== q.villkor[i]) fel.push(`text: villkor ${i + 1} är inte mallens`);
  });
  return fel;
}

export function sparrFel(q) {
  return [...dd1(q), ...dd2(q), ...dd3(q), ...dd4(q), ...dd5(q), ...textFel(q)];
}
