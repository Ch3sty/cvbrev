// scripts/render-numerisk-granskning.mjs
// =============================================================================
// Granskningssida för numeriskt parti 02 (avancerad och grund). Läser
// partifilerna och skriver en läsbar HTML-sida för testansvarig: per
// underlag inledning, tabell eller diagramdata, oanvänt och enhetsbyte, och
// per fråga alternativen med rätt svar markerat, stegen och varje
// distraktors misstagstyp och uttryck.
//
// Kör: node scripts/render-numerisk-granskning.mjs
//      node scripts/render-numerisk-granskning.mjs <fil.json> [<fil.json> ...] --ut=<fil.html>
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const ut = args.find((a) => a.startsWith('--ut='))?.slice(5) ?? 'docs/qa/bank-v3/numeriskt-parti-02.html';
const filer = args.filter((a) => !a.startsWith('--'));
const KALLOR = filer.length ? filer : [
  'src/lib/numericalTestV2/kandidater/parti-02.json',
  'src/lib/numericalTestV2/kandidater/parti-02-grund.json',
];

const MISSTAG = {
  fel_rad: 'fel rad', fel_kolumn: 'fel kolumn', steg_saknas: 'steg saknas', fel_enhet: 'fel enhet',
  fel_operation: 'fel räknesätt', avrundning: 'avrundning', fel_bas: 'fel bas',
};
const DIAGRAM = { bar: 'Stapeldiagram', line: 'Linjediagram', pie: 'Cirkeldiagram' };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function svTal(v) {
  const [hel, dec] = String(v).split('.');
  const g = hel.replace(/^-/, '').length >= 4 ? hel.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : hel;
  return dec ? `${g},${dec}` : g;
}
const uttryck = (u) => esc(String(u).replace(/\d+(?:\.\d+)?/g, (m) => svTal(m)).replace(/\*/g, '·').replace(/\s+/g, ' '));
const varde = (v) => svTal(Math.round(v * 1000) / 1000);

function tabell(t) {
  return `<div class="rulla"><table>
${t.caption ? `<caption>${esc(t.caption)}</caption>` : ''}
<thead><tr>${t.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
<tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('\n')}</tbody>
</table></div>`;
}

function diagram(c) {
  const enhet = (c.unit ?? '').trim();
  const rad = `${DIAGRAM[c.chartType] ?? c.chartType}${c.title ? `, "${esc(c.title)}"` : ''}${enhet ? `, enhet ${esc(enhet)}` : ''}${c.yAxisLabel ? `, y-axel "${esc(c.yAxisLabel)}"` : ''}${c.xAxisLabel ? `, x-axel "${esc(c.xAxisLabel)}"` : ''}`;
  const punkter = c.data.map((d) => [d.label ?? d.x, d.value ?? d.y]);
  return `<p class="diagramtyp">${rad}</p>
<div class="rulla"><table>
<thead><tr><th>${c.chartType === 'line' ? 'Punkt' : 'Stapel'}</th><th>Värde${enhet ? ` (${esc(enhet)})` : ''}</th></tr></thead>
<tbody>${punkter.map(([n, v]) => `<tr><th scope="row">${esc(n)}</th><td>${svTal(v)}</td></tr>`).join('\n')}</tbody>
</table></div>`;
}

function fraga(q) {
  const steg = q.berakning?.steg ?? [];
  const alternativ = q.options.map((o) => {
    const m = o.misstag;
    const typ = o.isCorrect ? '<span class="ratt-etikett">Rätt svar</span>' : m ? `<span class="typ">${esc(MISSTAG[m.typ] ?? m.typ)}</span>` : '';
    const detalj = !o.isCorrect && m ? `<div class="uttryck">${uttryck(m.uttryck)} = ${varde(m.varde)}</div>` : '';
    return `<li class="${o.isCorrect ? 'ratt' : ''}"><span class="bokstav">${esc(o.id)}</span><span class="svar">${esc(o.text)}</span>${typ}${detalj}</li>`;
  }).join('\n');
  return `<section class="fraga">
<h4><span class="qid">${esc(q.id)}</span> Fråga ${q.questionNumber} <span class="antal">${steg.length} steg</span></h4>
<p class="fragetext">${esc(q.questionText)}</p>
<ol class="alternativ">${alternativ}</ol>
<details open><summary>Stegen</summary>
<ol class="steg">${steg.map((s) => `<li><span>${esc(s.text)}</span><div class="uttryck">${uttryck(s.uttryck)} = ${varde(s.varde)}</div></li>`).join('\n')}</ol>
<p class="visning">Visning ${esc(q.berakning?.visning)}, ${q.berakning?.precision} decimaler</p>
</details>
</section>`;
}

function underlag(p) {
  const typ = p.type === 'graph' ? `diagram (${DIAGRAM[p.chartData?.chartType]?.toLowerCase() ?? ''})` : 'tabell';
  const meta = [
    ['Typ', typ],
    ['Ämne', p.topic],
    ['Oanvänt', (p.ovanvant ?? []).join(', ') || 'inget'],
    ['Enhetsbyte', p.enhetsbyte ?? 'inget'],
    ['Förhandsvärde', p.p_prior !== undefined ? svTal(p.p_prior) : 'saknas'],
  ];
  return `<article class="underlag" id="${esc(p.id)}">
<h3>${esc(p.title)} <span class="pid">${esc(p.id)}</span></h3>
<dl class="meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<p class="inledning">${esc(p.contextText)}</p>
${p.dataTable ? tabell(p.dataTable) : ''}${p.chartData ? diagram(p.chartData) : ''}
${p.questions.map(fraga).join('\n')}
</article>`;
}

function sammanfattning(namn, lista) {
  const tab = lista.filter((p) => p.type === 'table').length;
  const diag = lista.filter((p) => p.type === 'graph');
  const steg = lista.flatMap((p) => p.questions.map((q) => q.berakning?.steg?.length ?? 0));
  const per = [1, 2, 3].map((n) => `${steg.filter((s) => s === n).length} med ${n} steg`).join(', ');
  return `<p class="summa"><strong>${esc(namn)}</strong>: ${lista.length} underlag, ${tab} tabeller och ${diag.length} diagram (${diag.map((p) => DIAGRAM[p.chartData.chartType].toLowerCase()).join(', ')}), ${steg.length} frågor, ${per}.</p>`;
}

const delar = KALLOR.map((fil) => ({ fil, lista: JSON.parse(readFileSync(fil, 'utf8')) }));
const namn = (fil) => (/grund/.test(fil) ? 'Grund' : 'Avancerad');

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Numeriskt parti 02</title>
<style>
:root { --text: #1c1917; --dim: #57534e; --linje: #e7e5e4; --yta: #fafaf9; --kort: #ffffff; --accent: #c2410c; --ratt: #15803d; --ratt-yta: #f0fdf4; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--yta); color: var(--text); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; }
h1 { font-size: 1.6rem; margin: 0 0 4px; }
h2 { font-size: 1.25rem; margin: 40px 0 12px; padding-bottom: 6px; border-bottom: 2px solid var(--accent); }
h3 { font-size: 1.1rem; margin: 0 0 8px; }
h4 { font-size: 0.95rem; margin: 0 0 6px; display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; }
.ingress, .summa { color: var(--dim); margin: 4px 0; }
nav { margin: 16px 0; display: flex; flex-wrap: wrap; gap: 6px; }
nav a { font-size: 0.8rem; color: var(--accent); text-decoration: none; border: 1px solid var(--linje); background: var(--kort); padding: 2px 8px; border-radius: 999px; }
.underlag { background: var(--kort); border: 1px solid var(--linje); border-radius: 10px; padding: 16px; margin: 0 0 20px; }
.pid, .qid { font: 0.75rem ui-monospace, Consolas, monospace; color: var(--dim); font-weight: 400; }
.antal { font-size: 0.75rem; color: var(--dim); font-weight: 400; }
.meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px 12px; margin: 0 0 10px; }
.meta div { min-width: 0; }
.meta dt { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--dim); }
.meta dd { margin: 0; font-size: 0.9rem; overflow-wrap: anywhere; }
.inledning { margin: 0 0 12px; }
.diagramtyp { font-size: 0.85rem; color: var(--dim); margin: 0 0 6px; }
.rulla { overflow-x: auto; margin: 0 0 16px; }
table { border-collapse: collapse; font-size: 0.85rem; min-width: 100%; }
caption { text-align: left; font-size: 0.8rem; color: var(--dim); padding-bottom: 4px; }
th, td { border: 1px solid var(--linje); padding: 4px 8px; text-align: right; white-space: nowrap; }
thead th { background: var(--yta); text-align: left; white-space: normal; vertical-align: bottom; }
tbody th { text-align: left; font-weight: 500; }
.fraga { border-top: 1px solid var(--linje); padding: 12px 0 4px; }
.fragetext { margin: 0 0 8px; }
.alternativ { list-style: none; padding: 0; margin: 0 0 8px; display: grid; gap: 4px; }
.alternativ li { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; padding: 6px 8px; border: 1px solid var(--linje); border-radius: 6px; }
.alternativ li.ratt { border-color: var(--ratt); background: var(--ratt-yta); }
.bokstav { font-weight: 600; width: 1.2em; }
.svar { font-weight: 600; min-width: 6em; }
.typ { font-size: 0.75rem; color: var(--accent); }
.ratt-etikett { font-size: 0.75rem; color: var(--ratt); font-weight: 600; }
.uttryck { flex-basis: 100%; font: 0.8rem ui-monospace, Consolas, monospace; color: var(--dim); overflow-wrap: anywhere; padding-left: calc(1.2em + 10px); }
details summary { cursor: pointer; font-size: 0.85rem; color: var(--dim); }
.steg { margin: 6px 0; padding-left: 20px; font-size: 0.9rem; }
.steg .uttryck { padding-left: 0; }
.visning { font-size: 0.8rem; color: var(--dim); margin: 0 0 8px; }
@media (max-width: 480px) { .underlag { padding: 12px; } h1 { font-size: 1.35rem; } }
</style>
</head>
<body>
<main>
<h1>Numeriskt parti 02</h1>
<p class="ingress">Kandidater för testansvarigs granskning. Skapad ${new Date().toISOString().slice(0, 10)} ur ${KALLOR.map((k) => `<code>${esc(k)}</code>`).join(' och ')}. Rätt svar är grönmarkerat; varje fel alternativ visar misstagstypen och uttrycket som ger det.</p>
${delar.map(({ fil, lista }) => sammanfattning(namn(fil), lista)).join('\n')}
<nav>${delar.flatMap(({ lista }) => lista.map((p) => `<a href="#${esc(p.id)}">${esc(p.id.slice(0, 5))}</a>`)).join('')}</nav>
${delar.map(({ fil, lista }) => `<h2>${namn(fil)}</h2>\n${lista.map(underlag).join('\n')}`).join('\n')}
</main>
</body>
</html>
`;

mkdirSync(dirname(ut), { recursive: true });
writeFileSync(ut, html);
console.log(`Skrev ${ut}`);
