#!/usr/bin/env node
// scripts/render-deduktiv-granskning.mjs
// =============================================================================
// Granskningssidor för testansvarig (beställningen omgång 3, B1 och B2):
//   docs/qa/omgang3-f/deduktiv/<id>.html   en sida per deduktiv kandidat
//   docs/qa/omgang3-f/deduktiv/index.html  alla, per nivå, med facit och familj
//   docs/qa/omgang3-f/verbalt-parti-04.html de 16 texterna med påståenden
// Ren HTML utan skript, ljust och mörkt efter systemet. Läser bara filer.
//
// Kör: node scripts/render-deduktiv-granskning.mjs
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const UT = 'docs/qa/omgang3-f';
const K = 'src/lib/deduktivV1/kandidater';
mkdirSync(`${UT}/deduktiv`, { recursive: true });

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const BOKSTAV = 'ABCDE';
const CSS = `
:root{color-scheme:light dark;--bg:#f4f3f0;--p:#fff;--i1:#1a1a1f;--i2:#4a4a55;--i3:#65656e;--k:#e3e1dc;--kp:#a8491a;--kpm:#fbe3d0;--ton:#dfe3f6;--tonink:#3b4790}
@media (prefers-color-scheme:dark){:root{--bg:#121318;--p:#1b1c23;--i1:#f3f2f7;--i2:#c4c3cc;--i3:#9290a0;--k:#33343f;--kp:#f2a368;--kpm:rgba(224,122,47,.18);--ton:#232b55;--tonink:#b9c2f2}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--i1);font:15px/22px Inter,system-ui,sans-serif;padding:24px 16px 64px}
.w{max-width:980px;margin:0 auto}h1{font-size:24px;line-height:30px;margin:0 0 6px}h2{font-size:19px;margin:28px 0 8px}
.meta{color:var(--i3);font-size:13px}a{color:var(--i1)}
.u{background:var(--p);border:1px solid var(--k);border-radius:12px;padding:16px;margin:14px 0}
.grid{display:grid;grid-template-columns:1fr;gap:16px}@media(min-width:900px){.grid{grid-template-columns:400px 1fr}}
ol.v{margin:8px 0 0;padding:0;list-style:none}ol.v li{display:grid;grid-template-columns:18px 1fr;gap:10px}ol.v .n{color:var(--i3);font-weight:600;font-size:12px;text-align:right}
.f{font-weight:700;font-size:17px;margin:4px 0 10px}
.alt{border:1px solid var(--k);border-radius:10px;padding:8px 12px;margin:6px 0}.alt.r{border-color:var(--kp);box-shadow:inset 0 0 0 1px var(--kp)}
.alt b{color:var(--i3);margin-right:8px}.alt.r b{color:var(--kp)}.alt .m{display:block;color:var(--i2);font-size:13px;line-height:19px;margin-top:4px}
.l{background:var(--ton);border-radius:12px;padding:12px 14px;margin-top:12px}.l .e{color:var(--tonink);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.st{display:grid;grid-template-columns:auto 1fr;gap:10px;margin:8px 0}.mk{display:inline-flex;gap:3px}.mk span{min-width:22px;height:22px;border-radius:7px;background:var(--p);color:var(--tonink);font-weight:600;font-size:12px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px}
.st .vt{font-weight:600}.remsa{display:grid;border:1px solid var(--k);border-radius:10px;background:var(--p);margin-top:10px;overflow:hidden}
.remsa div{min-height:56px;padding:7px 3px 8px;text-align:center;border-left:1px solid var(--k)}.remsa div:first-child{border-left:0}
.remsa .pn{display:block;color:var(--i3);font-size:12px;font-weight:600}.remsa .nm{font-weight:600;font-size:14px}
.remsa .kop{box-shadow:inset 0 0 0 2px var(--kp)}.remsa .kop .nm{color:var(--kp)}.remsa .ant{box-shadow:inset 0 0 0 2px var(--i1)}
table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid var(--k);padding:6px 8px;text-align:left;vertical-align:top}
.tag{display:inline-block;border:1px solid var(--k);border-radius:6px;padding:0 6px;font-size:12px;color:var(--i2)}
.txt{white-space:normal;color:var(--i1)}`;

const sida = (titel, kropp) => `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titel)}</title><style>${CSS}</style></head><body><div class="w">${kropp}</div></body></html>\n`;

function uppgift(q, n) {
  const eyebrow = q.typ === 'D1' ? 'Premisser' : 'Villkor';
  const villkor = `<ol class="v">${q.villkor.map((v, i) => `<li><span class="n">${i + 1}</span><span>${esc(v)}</span></li>`).join('')}</ol>`;
  const alt = q.options
    .map((o, i) => `<div class="alt${i === q.correctAnswer ? ' r' : ''}"><b>${BOKSTAV[i]}</b>${esc(o)}${i === q.correctAnswer ? ' <span class="tag">facit</span>' : ''}<span class="m">${esc(q.etiketter[i])}${q.misstag[i] ? ` · ${esc(q.misstag[i])}` : ''}</span></div>`)
    .join('');
  const steg = q.losning.steg
    .map((s) => `<div class="st"><span class="mk">${(s.markor.length ? s.markor : ['·']).map((m) => `<span>${esc(m)}</span>`).join('')}</span><span>${s.villkor.map((v) => `<span class="vt">${esc(v)}</span> `).join('')}${esc(s.foljd)}</span></div>`)
    .join('');
  const sc = q.losning.schema;
  const remsa = sc
    ? `<div class="remsa" style="grid-template-columns:repeat(${sc.namn.length},1fr)">${sc.namn
        .map((nm, i) => `<div class="${sc.koppar === i + 1 ? 'kop' : sc.antagande === i + 1 ? 'ant' : ''}"><span class="pn">${i + 1}</span><span class="nm">${nm.map(esc).join('<br>')}</span></div>`)
        .join('')}</div>`
    : '';
  return `<section class="u" id="${q.id}"><p class="meta">${n != null ? `${n}. ` : ''}<b>${q.id}</b> · ${q.typ} · ${q.niva} · familj <span class="tag">${q.family}</span> · p_prior ${String(q.p_prior).replace('.', ',')}</p>
<div class="grid"><div><p class="meta">${eyebrow}</p>${q.intro ? `<p class="meta txt">${esc(q.intro)}</p>` : ''}${villkor}</div>
<div><p class="f">${esc(q.fraga)}</p>${alt}<div class="l"><span class="e">Lösningen</span>${steg}${remsa}</div></div></div></section>`;
}

const nivaer = ['grund', 'avancerad', 'expert'];
let index = `<h1>Deduktiv slutledning, kandidater 01</h1><p class="meta">Genererat ${new Date().toISOString().slice(0, 10)} ur src/lib/deduktivV1/kandidater/. Facit i koppar, etikett och misstag under varje alternativ, lösningsgången med villkorens nummer i märket, remsan ur lösaren.</p>`;
for (const niva of nivaer) {
  const lista = JSON.parse(readFileSync(`${K}/${niva}.json`, 'utf8'));
  index += `<h2>${niva[0].toUpperCase() + niva.slice(1)} (${lista.length})</h2><table><tr><th>id</th><th>typ</th><th>familj</th><th>fråga</th><th>facit</th></tr>${lista
    .map((q) => `<tr><td><a href="${q.id}.html">${q.id}</a></td><td>${q.typ}</td><td>${q.family}</td><td>${esc(q.fraga)}</td><td>${BOKSTAV[q.correctAnswer]}. ${esc(q.options[q.correctAnswer])}</td></tr>`)
    .join('')}</table>`;
  lista.forEach((q, i) => writeFileSync(`${UT}/deduktiv/${q.id}.html`, sida(q.id, `<p class="meta"><a href="index.html">Alla kandidater</a></p>${uppgift(q, i + 1)}`)));
}
writeFileSync(`${UT}/deduktiv/index.html`, sida('Deduktiv, kandidater 01', index));

// Verbalt parti 04.
const FACIT = { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' };
let v = `<h1>Verbalt parti 04</h1><p class="meta">src/lib/verbalTestV1/underlagParti04.json (grund) och src/lib/verbalTestV2/underlagParti04.json (avancerad). Två påståenden av måltypen per text.</p>`;
for (const [niva, fil] of [['Grund', 'src/lib/verbalTestV1/underlagParti04.json'], ['Avancerad', 'src/lib/verbalTestV2/underlagParti04.json']]) {
  const texter = JSON.parse(readFileSync(fil, 'utf8'));
  v += `<h2>${niva}</h2>`;
  for (const t of texter) {
    const antal = {};
    for (const s of t.statements) antal[s.typ] = (antal[s.typ] ?? 0) + 1;
    const mal = Object.keys(antal).find((k) => antal[k] === 2);
    v += `<section class="u" id="${t.id}"><p class="meta"><b>${t.id}</b> · ${esc(t.topic)} · måltyp <span class="tag">${mal}</span> · ${t.text.split(/\s+/).length} ord · p_prior ${String(t.p_prior).replace('.', ',')}</p><h2 style="margin-top:4px">${esc(t.title)}</h2><p class="txt">${esc(t.text)}</p>${t.statements
      .map((s, i) => `<div class="alt${s.typ === mal ? ' r' : ''}"><b>${i + 1}</b>${esc(s.text)} <span class="tag">${s.typ}</span> <span class="tag">${FACIT[s.correctAnswer]}</span><span class="m">${esc(s.explanation)}</span></div>`)
      .join('')}</section>`;
  }
}
writeFileSync(`${UT}/verbalt-parti-04.html`, sida('Verbalt parti 04', v));
console.log(`Skrev ${UT}/deduktiv/ (index och en sida per uppgift) och ${UT}/verbalt-parti-04.html`);
