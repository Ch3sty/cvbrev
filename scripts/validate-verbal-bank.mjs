// scripts/validate-verbal-bank.mjs
// =============================================================================
// Validering av verbala texter (beställningen "svarare frågor", 4.1).
// Schema: scripts/schema/verbal-text.schema.json.
//
// Kör: node scripts/validate-verbal-bank.mjs                       (de tre bankerna, upplysning)
//      node scripts/validate-verbal-bank.mjs <fil.json>            (upplysning, exit 0)
//      node scripts/validate-verbal-bank.mjs <fil.json> --niva=avancerad
//                                                                  (krav, exit 1 vid fel)
//      node scripts/validate-verbal-bank.mjs <fil.json> --niva=grund
//                                                                  (grundformatet, exit 1 vid fel)
//      node scripts/validate-verbal-bank.mjs <fil.json> --niva=expert
//                                                                  (argumentationsanalys, exit 1 vid fel)
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
//
// Grund (--niva=grund, tillägg-variation 4): mönstret vg-NN-namn, 120 till
// 160 ord, minst ett true och ett false per text, 20 till 30 procent
// cannot_say i filen, inget kvantorkrav och ingen varning om en ståndpunkt.
// Övriga regler som avancerad.
//
// Expert (--niva=expert, argumentationsanalys): eget format, se
// scripts/schema/verbal-expert.schema.json och valideraExpert nedan. Fel på
// underlag vars id redan finns i verbalTestExpert/questionBank.json blir
// upplysning (varning), så att banken själv går att köra utan exit 1.
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

export const NIVAER = {
  avancerad: { idMonster: /^va-\d{2}-[a-z0-9-]+$/, idNamn: 'va-NN-namn', ord: [180, 220], cs: [0.3, 0.4], facitPerText: FACIT, kvantorKrav: true, standpunkter: true },
  grund: { idMonster: /^vg-\d{2}-[a-z0-9-]+$/, idNamn: 'vg-NN-namn', ord: [120, 160], cs: [0.2, 0.3], facitPerText: ['true', 'false'], kvantorKrav: false, standpunkter: false },
};
// Utan niva: upplysning med avancerads mått för facit, kvantor och ståndpunkter, som förut.
const UTAN_NIVA = { idMonster: null, ord: null, cs: [0.3, 0.4], facitPerText: FACIT, kvantorKrav: true, standpunkter: true };

/**
 * texter: array enligt schemat. niva: 'avancerad', 'grund' eller null. andraIds: id
 * i de andra bankerna. Returnerar { fel, varningar } med { regel, id, text }.
 */
export function validera(texter, { niva = null, andraIds = new Set(), befintliga = new Set() } = {}) {
  if (niva === 'expert') return valideraExpert(texter, { andraIds, befintliga });
  const r = nyRapport();
  const krav = niva ? NIVAER[niva] : UTAN_NIVA;
  if (!krav) throw new Error(`okänd nivå ${niva}, välj avancerad, grund eller expert`);
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
    if (krav.idMonster && !krav.idMonster.test(id)) r.f(2, id, `id följer inte mönstret ${krav.idNamn}`);
    // 3
    const n = ord(t.text).length;
    if (krav.ord && (n < krav.ord[0] || n > krav.ord[1])) r.f(3, id, `texten har ${n} ord, ${krav.ord[0]} till ${krav.ord[1]} krävs`);
    // 4
    for (const f of krav.facitPerText) if (!st.some((s) => s.correctAnswer === f)) r.f(4, id, `inget påstående med facit ${f}`);
    antalCs += st.filter((s) => s.correctAnswer === 'cannot_say').length; antalP += st.length;
    // 5
    const kv = st.filter((s) => s.typ === 'kvantor');
    if (krav.kvantorKrav && !kv.length) r.f(5, id, 'inget påstående med typ kvantor');
    kv.forEach((s) => {
      const w = KVANTORER.filter((x) => harOrd(s.text, x));
      if (!w.length) r.f(5, id, `kvantorpåståendet saknar kvantorord: "${s.text}"`);
      else if (s.correctAnswer === 'true') {
        if (w.some((x) => harOrd(t.text, x))) r.v(5, id, `kvantorpåståendet har facit true, och ordet ${w.join(', ')} står i texten`);
        else r.f(5, id, 'kvantorpåståendet har facit true, det ska vara false eller cannot_say');
      }
    });
    // 6
    if (krav.standpunkter && !STANDPUNKT.some((x) => harOrd(t.text, x))) r.v(6, id, 'texten har inget tecken på en andra ståndpunkt (men, däremot, kritiker ...)');
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
    if (andel < krav.cs[0] || andel > krav.cs[1]) r.f(4, 'filen', `${antalCs} av ${antalP} påståenden (${Math.round(andel * 100)} procent) är cannot_say, ${Math.round(krav.cs[0] * 100)} till ${Math.round(krav.cs[1] * 100)} procent krävs`);
  }
  return r;
}

// =============================================================================
// Expert: argumentationsanalys. Ett underlag (contextText) med fyra flervals-
// frågor om fyra alternativ var.
//
//   1  fälten id, title, type word_problem, topic Argumentationsanalys,
//      difficulty 1 till 3, contextText, questions; exakt fyra frågor med fyra
//      alternativ, exakt ett isCorrect och det matchar correctAnswerId
//   2  id verbexp-pNN och fråge-id verbexp-pNN-q01 till q04, unika i filen
//      och mot de andra verbala bankerna
//   3  contextText 90 till 170 ord
//   4  förklaringen minst 15 ord; varning om den inte nämner något fel alternativ
//   5  typ ur listan; minst tre olika frågetyper per underlag (metod och
//      struktur räknas som en). Utan typ gissas den ur frågetexten.
//   6  alternativen olika inom frågan; inget alternativ mer än dubbelt så långt
//      som det kortaste
//   7  längsta alternativet är facit i högst hälften av frågorna i filen
//   8  inga tankstreck, inga engelska ord
//   9  rätt bokstav jämnt fördelad över filen (varning)
// =============================================================================

export const EXPERT_TYPER = ['felslut', 'antagande', 'försvaga', 'stärka', 'slutsats', 'metod', 'struktur'];
export const EXPERT_ID = /^verbexp-p\d{2}$/;
export const EXPERT_FRAGA_ID = /^verbexp-p\d{2}-q0[1-4]$/;
export const EXPERT_BANK = 'src/lib/verbalTestExpert/questionBank.json';
const EXPERT_ORD = [90, 170];
const BOKSTAVER = ['a', 'b', 'c', 'd'];

/** Frågetypen: fältet typ, annars en gissning ur frågetexten. Metod och struktur är samma kategori. */
export function fragetyp(q) {
  const t = q.typ ?? (() => {
    const s = String(q.questionText ?? '').toLowerCase();
    if (/felslut/.test(s)) return 'felslut';
    if (/antagande/.test(s)) return 'antagande';
    if (/försvaga/.test(s)) return 'försvaga';
    if (/stärka/.test(s)) return 'stärka';
    if (/slutsats/.test(s)) return 'slutsats';
    return 'metod';
  })();
  return t === 'struktur' ? 'metod' : t;
}

const langd = (s) => String(s ?? '').trim().length;
const rena = (s) => String(s ?? '').toLowerCase().replace(/[.,;:!?"()]/g, ' ');

/** Nämner förklaringen ett fel alternativ, med bokstav eller med ett ord som bara står i det alternativet? */
function namnerFelAlternativ(q) {
  const e = String(q.explanation ?? '');
  if (/\b(?:alternativ(?:et|en)?|svar(?:et)?|väljer)\s+[a-d]\b/i.test(e) || /\b[a-d]\s+(?:och|eller)\s+[a-d]\b/.test(e) || /\(\s*[a-d]\s*\)/.test(e)) return true;
  const ratt = (q.options ?? []).find((o) => o.isCorrect);
  const skydd = new Set([...ord(rena(ratt?.text)), ...ord(rena(q.questionText))].map((w) => w.slice(0, 5)));
  const eOrd = new Set(ord(rena(e)).filter((w) => w.length >= 6).map((w) => w.slice(0, 5)));
  return (q.options ?? []).some((o) => !o.isCorrect && ord(rena(o.text)).some((w) => w.length >= 6 && !skydd.has(w.slice(0, 5)) && eOrd.has(w.slice(0, 5))));
}

/**
 * underlag: array i expertformatet. andraIds: id i de andra verbala bankerna.
 * befintliga: id som redan ligger i expertbanken; deras fel blir varningar.
 */
export function valideraExpert(underlag, { andraIds = new Set(), befintliga = new Set() } = {}) {
  const r = nyRapport();
  const sett = new Set();
  let antalQ = 0; let langstArFacit = 0;
  const bokstav = Object.fromEntries(BOKSTAVER.map((b) => [b, 0]));
  for (const p of underlag) {
    const id = p.id ?? '(utan id)';
    // 1
    for (const f of ['id', 'title', 'type', 'topic', 'difficulty', 'contextText', 'questions']) if (p[f] === undefined || p[f] === '') r.f(1, id, `fältet ${f} saknas`);
    if (p.type !== undefined && p.type !== 'word_problem') r.f(1, id, `type är ${p.type}, ska vara word_problem`);
    if (p.topic !== undefined && p.topic !== 'Argumentationsanalys') r.f(1, id, `topic är ${p.topic}, ska vara Argumentationsanalys`);
    if (p.difficulty !== undefined && !(Number.isInteger(p.difficulty) && p.difficulty >= 1 && p.difficulty <= 3)) r.f(1, id, `difficulty ${p.difficulty} ska vara ett heltal 1 till 3`);
    const qs = Array.isArray(p.questions) ? p.questions : [];
    if (qs.length !== 4) r.f(1, id, `${qs.length} frågor, exakt fyra krävs`);
    // 2
    if (sett.has(id)) r.f(2, id, 'id finns två gånger i filen');
    sett.add(id);
    if (andraIds.has(id)) r.f(2, id, 'id finns redan i en annan verbal bank');
    if (!EXPERT_ID.test(id)) r.f(2, id, 'id följer inte mönstret verbexp-pNN');
    // 3
    const n = ord(p.contextText).length;
    if (n < EXPERT_ORD[0] || n > EXPERT_ORD[1]) r.f(3, id, `underlaget har ${n} ord, ${EXPERT_ORD[0]} till ${EXPERT_ORD[1]} krävs`);
    const typer = new Set();
    qs.forEach((q, i) => {
      const nr = `fråga ${i + 1}`;
      // 1
      for (const f of ['id', 'questionText', 'options', 'correctAnswerId', 'explanation']) if (q[f] === undefined || q[f] === '') r.f(1, id, `${nr}: fältet ${f} saknas`);
      if (q.passageId !== undefined && q.passageId !== p.id) r.f(1, id, `${nr}: passageId ${q.passageId} matchar inte underlaget`);
      if (q.questionNumber !== undefined && q.questionNumber !== i + 1) r.f(1, id, `${nr}: questionNumber ${q.questionNumber} ska vara ${i + 1}`);
      const opts = Array.isArray(q.options) ? q.options : [];
      if (opts.length !== 4) r.f(1, id, `${nr}: ${opts.length} alternativ, exakt fyra krävs`);
      const ratta = opts.filter((o) => o.isCorrect === true);
      if (ratta.length !== 1) r.f(1, id, `${nr}: ${ratta.length} alternativ med isCorrect, exakt ett krävs`);
      else if (ratta[0].id !== q.correctAnswerId) r.f(1, id, `${nr}: correctAnswerId ${q.correctAnswerId} matchar inte alternativet med isCorrect (${ratta[0].id})`);
      if (new Set(opts.map((o) => o.id)).size !== opts.length) r.f(1, id, `${nr}: alternativens id är inte unika`);
      // 2
      const qid = q.id ?? '';
      if (sett.has(qid)) r.f(2, id, `${nr}: id ${qid} finns två gånger i filen`);
      sett.add(qid);
      if (andraIds.has(qid)) r.f(2, id, `${nr}: id ${qid} finns redan i en annan verbal bank`);
      if (!EXPERT_FRAGA_ID.test(qid)) r.f(2, id, `${nr}: id ${qid} följer inte mönstret verbexp-pNN-q0N`);
      else if (qid !== `${p.id}-q0${i + 1}`) r.f(2, id, `${nr}: id ${qid} ska vara ${p.id}-q0${i + 1}`);
      // 4
      const eOrd = ord(q.explanation).length;
      if (eOrd < 15) r.f(4, id, `${nr}: förklaringen har ${eOrd} ord, minst 15 krävs`);
      else if (!namnerFelAlternativ(q)) r.v(4, id, `${nr}: förklaringen nämner inget fel alternativ`);
      // 5
      if (q.typ !== undefined && !EXPERT_TYPER.includes(q.typ)) r.f(5, id, `${nr}: typ ${q.typ} finns inte (${EXPERT_TYPER.join(', ')})`);
      typer.add(fragetyp(q));
      // 6
      const texter = opts.map((o) => rena(o.text).replace(/\s+/g, ' ').trim());
      if (new Set(texter).size !== texter.length) r.f(6, id, `${nr}: två alternativ har samma text`);
      if (opts.length) {
        const l = opts.map((o) => langd(o.text));
        const kort = Math.min(...l); const lang = Math.max(...l);
        if (lang > 2 * kort) r.f(6, id, `${nr}: längsta alternativet har ${lang} tecken, mer än dubbelt det kortaste (${kort})`);
        // 7 och 9 räknas över filen
        if (ratta.length === 1) {
          antalQ++;
          if (langd(ratta[0].text) === lang) langstArFacit++;
          if (bokstav[ratta[0].id] !== undefined) bokstav[ratta[0].id]++;
        }
      }
    });
    // 5
    if (qs.length && typer.size < 3) r.f(5, id, `${typer.size} frågetyper (${[...typer].join(', ')}), minst tre olika krävs`);
    // 8
    const allText = [p.title, p.contextText, ...qs.flatMap((q) => [q.questionText, q.explanation, ...(q.options ?? []).map((o) => o.text)])].join(' ');
    if (TANKSTRECK.test(allText)) r.f(8, id, 'tankstreck');
    const falt = [['title', p.title], ['contextText', p.contextText], ...qs.flatMap((q, i) => [[`fråga ${i + 1}`, q.questionText], [`förklaring ${i + 1}`, q.explanation], ...(q.options ?? []).map((o) => [`fråga ${i + 1} alternativ ${o.id}`, o.text])])];
    for (const [namn, v] of falt) {
      const m = String(v ?? '').match(ENGELSKA);
      if (m) r.f(8, id, `engelskt ord "${m[0]}" i ${namn}`);
    }
  }
  // 7 över filen
  if (antalQ && langstArFacit > antalQ / 2) r.f(7, 'filen', `längsta alternativet är facit i ${langstArFacit} av ${antalQ} frågor, högst hälften`);
  // 9 över filen
  if (antalQ >= 8) {
    const skev = BOKSTAVER.some((b) => bokstav[b] > antalQ * 0.4 || bokstav[b] < antalQ * 0.1);
    if (skev) r.v(9, 'filen', `rätt bokstav ojämnt fördelad: ${BOKSTAVER.map((b) => `${b} ${bokstav[b]}`).join(', ')}`);
  }
  // Befintliga underlag: fel blir upplysning. Filregler bara om alla underlag redan finns i banken.
  if (befintliga.size) {
    const allaBefintliga = underlag.length > 0 && underlag.every((p) => befintliga.has(p.id));
    const flytta = r.fel.filter((x) => befintliga.has(x.id) || (x.id === 'filen' && allaBefintliga));
    for (const x of flytta) { r.fel.splice(r.fel.indexOf(x), 1); r.varningar.push({ ...x, text: `${x.text} (finns redan i banken, upplysning)` }); }
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
    if (niva === 'expert') {
      const r = valideraExpert(texter, { andraIds: andraIdn(fil), befintliga: idIBank(EXPERT_BANK) });
      skrivRapport('Verbal validering, expert', fil, r, true);
      if (r.fel.length) exit = 1;
      continue;
    }
    // Expertbanken har ett annat format (frågor med fyra alternativ): bara id och tankstreck.
    const r = texter[0]?.statements ? validera(texter, { niva, andraIds: andraIdn(fil) }) : (() => { const x = nyRapport(); texter.forEach((p) => { if (TANKSTRECK.test(JSON.stringify(p))) x.f(9, p.id, 'tankstreck'); }); return x; })();
    skrivRapport('Verbal validering', fil, r, Boolean(niva));
    if (niva && r.fel.length) exit = 1;
  }
  process.exit(exit);
}
