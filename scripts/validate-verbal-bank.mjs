// scripts/validate-verbal-bank.mjs
// =============================================================================
// Validering av verbala texter (beställningen "svarare frågor", 4.1).
// Schema: scripts/schema/verbal-text.schema.json.
//
// Kör: node scripts/validate-verbal-bank.mjs                       (de tre bankerna, upplysning)
//      node scripts/validate-verbal-bank.mjs <fil.json>            (upplysning, exit 0)
//      node scripts/validate-verbal-bank.mjs <fil.json> --niva=avancerad
//                                                                  (krav, exit 1 vid fel)
//
// Regler (numren står i varje rad):
//   1  fälten, exakt fyra påståenden, facit true/false/cannot_say, förklaring
//      minst 15 ord, typ ur direkt/slutledning/kvantor/utanfor
//   2  id unikt i filen och mot verbalTestV1, verbalTestV2, verbalTestExpert;
//      mönstret va-NN-namn för avancerad
//   3  180 till 220 ord för avancerad
//   4  minst ett av varje facit per text, 30 till 40 procent cannot_say i filen
//   5  ett kvantorpåstående med kvantorord och facit false eller cannot_say
//      (varning om ordet står i texten)
//   6  två ståndpunkter (varning)
//   7  inget påstående återger åtta ord i följd ur texten
//   8  påståendet högst 25 ord; siffror som inte står i texten (varning)
//   9  inga tankstreck, inga engelska gränssnittsord
//   10 förklaringen säger vad i texten som avgör (varning)
//   11 ämne ur den fasta listan
// =============================================================================

import { TANKSTRECK, ENGELSKA, ord, nyRapport, idIBank, lasBank, skrivRapport } from './lib/bank-text.mjs';

export const FACIT = ['true', 'false', 'cannot_say'];
export const TYPER = ['direkt', 'slutledning', 'kvantor', 'utanfor'];
export const AMNEN = ['Arbetsliv', 'Samhälle', 'Hälsa', 'Miljö', 'Ekonomi', 'Teknik', 'Utbildning', 'Kultur'];
const KVANTORER = ['alla', 'ingen', 'inga', 'aldrig', 'alltid', 'varje', 'samtliga', 'enbart', 'bara'];
const STANDPUNKT = ['men', 'däremot', 'samtidigt', 'å andra sidan', 'kritiker', 'invänder', 'menar i stället', 'dock', 'trots'];
export const BANKER = ['src/lib/verbalTestV1/questionBank.json', 'src/lib/verbalTestV2/questionBank.json', 'src/lib/verbalTestExpert/questionBank.json'];

const smaOrd = (s) => ord(String(s).toLowerCase().replace(/[.,;:!?"()]/g, ' '));
const harOrd = (s, w) => new RegExp(`(^|[^a-zåäö])${w}([^a-zåäö]|$)`, 'i').test(s);

/**
 * texter: array enligt schemat. niva: 'avancerad' eller null. andraIds: id
 * i de andra bankerna. Returnerar { fel, varningar } med { regel, id, text }.
 */
export function validera(texter, { niva = null, andraIds = new Set() } = {}) {
  const r = nyRapport();
  const sett = new Set();
  let antalCs = 0; let antalP = 0;
  for (const t of texter) {
    const id = t.id ?? '(utan id)';
    // 1
    for (const f of ['id', 'title', 'difficulty', 'topic', 'text', 'statements']) if (t[f] === undefined || t[f] === '') r.f(1, id, `fältet ${f} saknas`);
    const st = Array.isArray(t.statements) ? t.statements : [];
    if (st.length !== 4) r.f(1, id, `${st.length} påståenden, exakt fyra krävs`);
    st.forEach((s, i) => {
      if (!FACIT.includes(s.correctAnswer)) r.f(1, id, `påstående ${i + 1}: facit ${s.correctAnswer} är inte true, false eller cannot_say`);
      if (ord(s.explanation).length < 15) r.f(1, id, `påstående ${i + 1}: förklaringen har ${ord(s.explanation).length} ord, minst 15 krävs`);
      if (s.typ !== undefined && !TYPER.includes(s.typ)) r.f(1, id, `påstående ${i + 1}: typ ${s.typ} finns inte`);
    });
    // 2
    if (sett.has(id)) r.f(2, id, 'id finns två gånger i filen');
    sett.add(id);
    if (andraIds.has(id)) r.f(2, id, 'id finns redan i en annan verbal bank');
    if (niva === 'avancerad' && !/^va-\d{2}-[a-z0-9-]+$/.test(id)) r.f(2, id, 'id följer inte mönstret va-NN-namn');
    // 3
    const n = ord(t.text).length;
    if (niva === 'avancerad' && (n < 180 || n > 220)) r.f(3, id, `texten har ${n} ord, 180 till 220 krävs`);
    // 4
    for (const f of FACIT) if (!st.some((s) => s.correctAnswer === f)) r.f(4, id, `inget påstående med facit ${f}`);
    antalCs += st.filter((s) => s.correctAnswer === 'cannot_say').length; antalP += st.length;
    // 5
    const kv = st.filter((s) => s.typ === 'kvantor');
    if (!kv.length) r.f(5, id, 'inget påstående med typ kvantor');
    kv.forEach((s) => {
      const w = KVANTORER.filter((x) => harOrd(s.text, x));
      if (!w.length) r.f(5, id, `kvantorpåståendet saknar kvantorord: "${s.text}"`);
      else if (s.correctAnswer === 'true') {
        if (w.some((x) => harOrd(t.text, x))) r.v(5, id, `kvantorpåståendet har facit true, och ordet ${w.join(', ')} står i texten`);
        else r.f(5, id, 'kvantorpåståendet har facit true, det ska vara false eller cannot_say');
      }
    });
    // 6
    if (!STANDPUNKT.some((x) => harOrd(t.text, x))) r.v(6, id, 'texten har inget tecken på en andra ståndpunkt (men, däremot, kritiker ...)');
    // 7
    const tOrd = smaOrd(t.text).join(' ');
    st.forEach((s, i) => {
      const w = smaOrd(s.text);
      for (let k = 0; k + 8 <= w.length; k++) {
        const bit = w.slice(k, k + 8).join(' ');
        if (` ${tOrd} `.includes(` ${bit} `)) { r.f(7, id, `påstående ${i + 1} återger texten ordagrant: "${bit}"`); break; }
      }
    });
    // 8
    st.forEach((s, i) => {
      if (ord(s.text).length > 25) r.f(8, id, `påstående ${i + 1} har ${ord(s.text).length} ord, högst 25`);
      for (const d of String(s.text).match(/\d+(?:[.,]\d+)?/g) ?? []) if (!String(t.text).includes(d)) r.v(8, id, `påstående ${i + 1} har talet ${d} som inte står i texten`);
    });
    // 9
    const allText = [t.title, t.text, t.topic, ...st.flatMap((s) => [s.text, s.explanation])].join(' ');
    if (TANKSTRECK.test(allText)) r.f(9, id, 'tankstreck');
    for (const [falt, v] of [['title', t.title], ['text', t.text], ...st.map((s, i) => [`påstående ${i + 1}`, s.text])]) {
      const m = String(v ?? '').match(ENGELSKA);
      if (m) r.f(9, id, `engelskt ord "${m[0]}" i ${falt}`);
    }
    // 10
    st.forEach((s, i) => {
      const e = String(s.explanation ?? '');
      const citat = (() => { const w = smaOrd(e); for (let k = 0; k + 4 <= w.length; k++) if (` ${tOrd} `.includes(` ${w.slice(k, k + 4).join(' ')} `)) return true; return false; })();
      if (!/\btexten\b|\bstår\b/i.test(e) && !citat) r.v(10, id, `förklaringen till påstående ${i + 1} säger inte vad i texten som avgör`);
    });
    // 11
    if (!AMNEN.includes(t.topic)) r.f(11, id, `ämnet ${t.topic} finns inte i listan`);
  }
  // 4 över filen
  if (antalP) {
    const andel = antalCs / antalP;
    if (andel < 0.3 || andel > 0.4) r.f(4, 'filen', `${antalCs} av ${antalP} påståenden (${Math.round(andel * 100)} procent) är cannot_say, 30 till 40 procent krävs`);
  }
  return r;
}

export function andraIdn(fil) {
  const ids = new Set();
  for (const b of BANKER) if (!fil || !fil.replace(/\\/g, '/').endsWith(b)) for (const x of idIBank(b)) ids.add(x);
  return ids;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/validate-verbal-bank.mjs')) {
  const args = process.argv.slice(2);
  const niva = args.find((a) => a.startsWith('--niva='))?.slice(7) ?? null;
  const filer = args.filter((a) => !a.startsWith('--'));
  let exit = 0;
  for (const fil of filer.length ? filer : BANKER) {
    const texter = lasBank(fil);
    // Expertbanken har ett annat format (frågor med fyra alternativ): bara id och tankstreck.
    const r = texter[0]?.statements ? validera(texter, { niva, andraIds: andraIdn(fil) }) : (() => { const x = nyRapport(); texter.forEach((p) => { if (TANKSTRECK.test(JSON.stringify(p))) x.f(9, p.id, 'tankstreck'); }); return x; })();
    skrivRapport('Verbal validering', fil, r, Boolean(niva));
    if (niva && r.fel.length) exit = 1;
  }
  process.exit(exit);
}
