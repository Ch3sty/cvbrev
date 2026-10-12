// scripts/lib/deduktiv/mangdmodell.mjs
// =============================================================================
// D1 (premisskedjor) valideras mot en finit mängdmodell (beställningen B1).
//
// Termerna är mängder (till exempel "arbetar natt", "får tillägg"). En modell
// säger vilka av termernas 2^m kombinationer (typer) som har någon medlem, och
// vilken typ varje namngiven person (individ) har. Med högst fyra termer är
// det högst 65 536 modeller; alla prövas.
//
// Satser:
//   { typ: 'alla', x, y }        alla x är y
//   { typ: 'inga', x, y }        inga x är y
//   { typ: 'nagra', x, y }       några x är y
//   { typ: 'nagra_inte', x, y }  några x är inte y
//   { typ: 'ar', i, x }          individen i är x
//   { typ: 'ar_inte', i, x }     individen i är inte x
//
// "Alla x är y" kan läsas med eller utan att det finns några x. Ett påstående
// får bara stå i en uppgift om det får samma status (nödvändigt, omöjligt,
// obestämt) med båda läsningarna; annars beror facit på något texten inte säger.
// =============================================================================

/** Status för påståendet givet premisserna: 'nodvandig' | 'omojlig' | 'obestamd'. */
export function status(termer, individer, premisser, pastaende, { existens = false } = {}) {
  const m = termer.length;
  const typer = 1 << m;
  const tidx = Object.fromEntries(termer.map((t, i) => [t, i]));
  const iidx = Object.fromEntries(individer.map((t, i) => [t, i]));
  const har = (typ, term) => ((typ >> tidx[term]) & 1) === 1;
  for (const s of [...premisser, pastaende]) {
    for (const t of [s.x, s.y].filter((v) => v != null)) if (!(t in tidx)) throw new Error(`okänd term ${t}`);
    if (s.i != null && !(s.i in iidx)) throw new Error(`okänd individ ${s.i}`);
  }

  let sannNagon = false;
  let falskNagon = false;
  let modeller = 0;
  const kollaSats = (s, finns, indTyp) => {
    switch (s.typ) {
      case 'alla':
        for (let t = 0; t < typer; t++) if (finns[t] && har(t, s.x) && !har(t, s.y)) return false;
        return true;
      case 'inga':
        for (let t = 0; t < typer; t++) if (finns[t] && har(t, s.x) && har(t, s.y)) return false;
        return true;
      case 'nagra':
        for (let t = 0; t < typer; t++) if (finns[t] && har(t, s.x) && har(t, s.y)) return true;
        return false;
      case 'nagra_inte':
        for (let t = 0; t < typer; t++) if (finns[t] && har(t, s.x) && !har(t, s.y)) return true;
        return false;
      case 'ar':
        return har(indTyp[iidx[s.i]], s.x);
      case 'ar_inte':
        return !har(indTyp[iidx[s.i]], s.x);
      default:
        throw new Error(`okänd sats ${s.typ}`);
    }
  };
  const existensKrav = existens
    ? premisser.filter((s) => s.typ === 'alla' || s.typ === 'inga').map((s) => s.x)
    : [];

  const k = individer.length;
  for (let mask = 1; mask < 1 << typer; mask++) {
    const finns = Array.from({ length: typer }, (_, t) => ((mask >> t) & 1) === 1);
    if (existensKrav.some((x) => !finns.some((f, t) => f && har(t, x)))) continue;
    const mojliga = finns.map((f, t) => (f ? t : -1)).filter((t) => t >= 0);
    // Individernas typer: alla kombinationer av befintliga typer.
    const indTyp = new Array(k).fill(0);
    const rek = (j) => {
      if (j === k) {
        if (!premisser.every((s) => kollaSats(s, finns, indTyp))) return;
        modeller++;
        if (kollaSats(pastaende, finns, indTyp)) sannNagon = true;
        else falskNagon = true;
        return;
      }
      for (const t of mojliga) {
        indTyp[j] = t;
        rek(j + 1);
      }
    };
    rek(0);
    if (sannNagon && falskNagon) break;
  }
  if (modeller === 0) return 'motsagelse';
  if (sannNagon && !falskNagon) return 'nodvandig';
  if (!sannNagon && falskNagon) return 'omojlig';
  return 'obestamd';
}

/** Status med båda läsningarna; null när de skiljer sig. */
export function stabilStatus(termer, individer, premisser, pastaende) {
  const a = status(termer, individer, premisser, pastaende, { existens: false });
  const b = status(termer, individer, premisser, pastaende, { existens: true });
  return a === b ? a : null;
}
