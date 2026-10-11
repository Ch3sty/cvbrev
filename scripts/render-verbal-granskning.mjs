// scripts/render-verbal-granskning.mjs
// =============================================================================
// Granskningssida för verbalt parti 02: läser kandidatfilerna och skriver en
// fristående HTML-sida som testansvarig läser i webbläsaren eller mobilen.
//
// Kör: node scripts/render-verbal-granskning.mjs
// Ut:  docs/qa/bank-v3/verbalt-parti-02.html
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const PARTIER = [
  { fil: 'src/lib/verbalTestV2/kandidater/parti-02.json', namn: 'Avancerad', niva: 'avancerad' },
  { fil: 'src/lib/verbalTestV2/kandidater/parti-02-grund.json', namn: 'Grund', niva: 'grund' },
];
const UT = 'docs/qa/bank-v3/verbalt-parti-02.html';

const FACIT = { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' };
const TYP = { direkt: 'Direkt', slutledning: 'Slutledning', kvantor: 'Kvantor', utanfor: 'Utanför texten' };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const antalOrd = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
const procent = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function sammanfattning(texter) {
  const st = texter.flatMap((t) => t.statements);
  const cs = st.filter((s) => s.correctAnswer === 'cannot_say').length;
  const ord = texter.map((t) => antalOrd(t.text));
  return `${texter.length} texter, ${st.length} påståenden, ${cs} går inte att avgöra (${procent(cs, st.length)} procent), ${Math.min(...ord)} till ${Math.max(...ord)} ord`;
}

function renderaText(t) {
  const pst = t.statements.map((s, i) => `
        <li class="pst">
          <p class="pst-text"><span class="nr">${i + 1}</span>${esc(s.text)}</p>
          <p class="etiketter"><span class="typ">${esc(TYP[s.typ] ?? s.typ ?? 'Ingen typ')}</span><span class="facit facit-${esc(s.correctAnswer)}">${esc(FACIT[s.correctAnswer] ?? s.correctAnswer)}</span></p>
          <p class="forklaring">${esc(s.explanation)}</p>
        </li>`).join('');
  return `
    <article class="text" id="${esc(t.id)}">
      <header>
        <p class="id">${esc(t.id)}</p>
        <h3>${esc(t.title)}</h3>
        <p class="meta">${esc(t.topic)} · ${antalOrd(t.text)} ord · svårighet ${esc(t.difficulty)}</p>
      </header>
      <div class="brodtext">${esc(t.text)}</div>
      <ol class="pstlista">${pst}
      </ol>
    </article>`;
}

const sektioner = PARTIER.map(({ fil, namn }) => {
  const texter = JSON.parse(readFileSync(fil, 'utf8'));
  return `
  <section>
    <h2>${esc(namn)}</h2>
    <p class="sammanfattning">${esc(sammanfattning(texter))}. Källa: <code>${esc(fil)}</code></p>
    <nav class="innehall">${texter.map((t) => `<a href="#${esc(t.id)}">${esc(t.id)}</a>`).join('')}</nav>
    ${texter.map(renderaText).join('')}
  </section>`;
}).join('');

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Verbalt parti 02</title>
<style>
  :root { --bg: #fafaf9; --kort: #ffffff; --text: #1c1917; --dampad: #57534e; --linje: #e7e5e4; --accent: #ea580c;
    --sant: #15803d; --sant-bg: #dcfce7; --falskt: #b91c1c; --falskt-bg: #fee2e2; --oppen: #92400e; --oppen-bg: #fef3c7; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0c0a09; --kort: #1c1917; --text: #f5f5f4; --dampad: #a8a29e; --linje: #292524; --accent: #fb923c;
      --sant: #86efac; --sant-bg: #14532d; --falskt: #fca5a5; --falskt-bg: #7f1d1d; --oppen: #fde68a; --oppen-bg: #78350f; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; }
  h2 { font-size: 1.3rem; margin: 40px 0 4px; border-bottom: 2px solid var(--accent); padding-bottom: 4px; }
  h3 { font-size: 1.15rem; margin: 2px 0; }
  .ingress, .sammanfattning, .meta { color: var(--dampad); }
  .sammanfattning { font-size: .92rem; }
  code { font-size: .85em; overflow-wrap: anywhere; }
  .innehall { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 8px; }
  .innehall a { font-size: .8rem; color: var(--dampad); text-decoration: none; border: 1px solid var(--linje); border-radius: 999px; padding: 2px 10px; }
  .text { background: var(--kort); border: 1px solid var(--linje); border-radius: 12px; padding: 18px 16px; margin: 20px 0; }
  .id { font: 600 .78rem/1.2 ui-monospace, Consolas, monospace; color: var(--accent); margin: 0; overflow-wrap: anywhere; }
  .meta { margin: 0; font-size: .88rem; }
  .brodtext { margin: 14px 0 6px; padding: 14px; border-left: 3px solid var(--linje); background: var(--bg); border-radius: 6px; }
  .pstlista { list-style: none; padding: 0; margin: 12px 0 0; }
  .pst { border-top: 1px solid var(--linje); padding: 12px 0 4px; }
  .pst-text { margin: 0; font-weight: 600; }
  .nr { display: inline-block; min-width: 1.6em; color: var(--dampad); }
  .etiketter { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
  .typ, .facit { font-size: .78rem; border-radius: 999px; padding: 1px 10px; }
  .typ { border: 1px solid var(--linje); color: var(--dampad); }
  .facit-true { background: var(--sant-bg); color: var(--sant); }
  .facit-false { background: var(--falskt-bg); color: var(--falskt); }
  .facit-cannot_say { background: var(--oppen-bg); color: var(--oppen); }
  .forklaring { margin: 0 0 8px; font-size: .94rem; color: var(--dampad); }
</style>
</head>
<body>
<main>
  <h1>Verbalt parti 02</h1>
  <p class="ingress">Kandidattexter för granskning, skrivna 2026-10-12. Inget här ligger i de skarpa bankerna. Per text: id, ämne, antal ord, texten och påståendena med typ, facit och förklaring.</p>
  ${sektioner}
</main>
</body>
</html>
`;

mkdirSync(dirname(UT), { recursive: true });
writeFileSync(UT, html);
console.log(`Skrev ${UT}`);
