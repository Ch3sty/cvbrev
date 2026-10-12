// scripts/render-verbal-expert-granskning.mjs
// =============================================================================
// Granskningssida för verbalt expert (argumentationsanalys): läser en
// kandidatfil i expertformatet och skriver en fristående HTML-sida med
// underlag, frågor, alternativ (rätt markerat), frågetyp och förklaring.
//
// Kör: node scripts/render-verbal-expert-granskning.mjs [in.json] [ut.html] [rubrik]
// Standard: src/lib/verbalTestExpert/kandidater/parti-03.json
//        -> docs/qa/omgang2/verbalt-expert-parti-03.html
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fragetyp } from './validate-verbal-bank.mjs';

const [IN = 'src/lib/verbalTestExpert/kandidater/parti-03.json', UT = 'docs/qa/omgang2/verbalt-expert-parti-03.html', RUBRIK = 'Verbalt expert, parti 03'] = process.argv.slice(2);

const TYP = { felslut: 'Felslut', antagande: 'Antagande', 'försvaga': 'Försvaga', 'stärka': 'Stärka', slutsats: 'Slutsats', metod: 'Metod eller struktur' };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const antalOrd = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

const underlag = JSON.parse(readFileSync(IN, 'utf8'));
const fragor = underlag.flatMap((p) => p.questions);
const rakna = (f) => fragor.reduce((m, q) => { const k = f(q); m[k] = (m[k] ?? 0) + 1; return m; }, {});
const bokstav = rakna((q) => q.correctAnswerId);
const typer = rakna((q) => fragetyp(q));
const langst = fragor.filter((q) => { const l = q.options.map((o) => o.text.length); return q.options.find((o) => o.isCorrect).text.length === Math.max(...l); }).length;
const ord = underlag.map((p) => antalOrd(p.contextText));

const sammanfattning = `${underlag.length} underlag, ${fragor.length} frågor, ${Math.min(...ord)} till ${Math.max(...ord)} ord. `
  + `Rätt bokstav: ${['a', 'b', 'c', 'd'].map((b) => `${b} ${bokstav[b] ?? 0}`).join(', ')}. `
  + `Frågetyper: ${Object.entries(typer).map(([k, v]) => `${(TYP[k] ?? k).toLowerCase()} ${v}`).join(', ')}. `
  + `Rätt alternativ är längst i ${langst} av ${fragor.length} frågor`;

function renderaUnderlag(p) {
  const qs = p.questions.map((q) => `
        <li class="fraga">
          <p class="fraga-text"><span class="nr">${q.questionNumber}</span>${esc(q.questionText)}</p>
          <p class="etiketter"><span class="typ">${esc(TYP[fragetyp(q)] ?? q.typ)}</span></p>
          <ol class="alt">${q.options.map((o) => `
            <li class="${o.isCorrect ? 'ratt' : ''}"><span class="bokstav">${esc(o.id)}</span>${esc(o.text)}${o.isCorrect ? '<span class="facit">Rätt</span>' : ''}</li>`).join('')}
          </ol>
          <p class="forklaring">${esc(q.explanation)}</p>
        </li>`).join('');
  return `
    <article class="text" id="${esc(p.id)}">
      <header>
        <p class="id">${esc(p.id)}</p>
        <h3>${esc(p.title)}</h3>
        <p class="meta">${esc(p.topic)} · ${antalOrd(p.contextText)} ord · svårighet ${esc(p.difficulty)}${p.kalla ? ` · ${esc(p.kalla)}` : ''}</p>
      </header>
      <div class="brodtext">${esc(p.contextText)}</div>
      <ol class="fragelista">${qs}
      </ol>
    </article>`;
}

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(RUBRIK)}</title>
<style>
  :root { --bg: #fafaf9; --kort: #ffffff; --text: #1c1917; --dampad: #57534e; --linje: #e7e5e4; --accent: #ea580c;
    --ratt: #15803d; --ratt-bg: #dcfce7; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0c0a09; --kort: #1c1917; --text: #f5f5f4; --dampad: #a8a29e; --linje: #292524; --accent: #fb923c;
      --ratt: #86efac; --ratt-bg: #14532d; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; }
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
  .fragelista { list-style: none; padding: 0; margin: 12px 0 0; }
  .fraga { border-top: 1px solid var(--linje); padding: 12px 0 4px; }
  .fraga-text { margin: 0; font-weight: 600; }
  .nr { display: inline-block; min-width: 1.6em; color: var(--dampad); }
  .etiketter { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
  .typ { font-size: .78rem; border-radius: 999px; padding: 1px 10px; border: 1px solid var(--linje); color: var(--dampad); }
  .alt { list-style: none; padding: 0; margin: 6px 0 8px; }
  .alt li { display: flex; gap: 8px; align-items: baseline; padding: 6px 10px; border-radius: 8px; margin: 2px 0; }
  .alt li.ratt { background: var(--ratt-bg); color: var(--ratt); font-weight: 600; }
  .bokstav { font: 600 .85rem ui-monospace, Consolas, monospace; min-width: 1.2em; color: var(--dampad); }
  .alt li.ratt .bokstav { color: var(--ratt); }
  .facit { margin-left: auto; font-size: .75rem; border: 1px solid currentColor; border-radius: 999px; padding: 0 8px; white-space: nowrap; }
  .forklaring { margin: 0 0 8px; font-size: .94rem; color: var(--dampad); }
</style>
</head>
<body>
<main>
  <h1>${esc(RUBRIK)}</h1>
  <p class="ingress">Kandidatunderlag för granskning. Inget här ligger i den skarpa banken. Per underlag: id, antal ord, texten och de fyra frågorna med frågetyp, alternativ (rätt markerat) och förklaringen som läses upp i genomgången.</p>
  <p class="sammanfattning">${esc(sammanfattning)}. Källa: <code>${esc(IN)}</code></p>
  <nav class="innehall">${underlag.map((p) => `<a href="#${esc(p.id)}">${esc(p.id)}</a>`).join('')}</nav>
  ${underlag.map(renderaUnderlag).join('')}
</main>
</body>
</html>
`;

mkdirSync(dirname(UT), { recursive: true });
writeFileSync(UT, html);
console.log(`Skrev ${UT}`);
