// scripts/lib/spatial/granskning-html.tsx
// Granskningssida för Spatial förmåga: valda uppgifter ritade med appens
// ritare i 360-layouten (alternativ två gånger två, 159 px), med facit och
// misstagstexterna under. Skriver HTML på stdout; bilderna tas med puppeteer
// och sparas utanför git (feedback_arbetskopior_och_qa_bilder).
//   node node_modules/tsx/dist/cli.mjs scripts/lib/spatial/granskning-html.tsx <bank.json> [id ...]
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SpatialSvg } from '../../../src/lib/spatialV1/ritare';
import type { SpatialFraga } from '../../../src/lib/spatialV1/types';

const [fil, ...ids] = process.argv.slice(2);
const bank = JSON.parse(readFileSync(fil, 'utf8')) as SpatialFraga[];
const urval = ids.length ? bank.filter((q) => ids.includes(q.id)) : bank;
const ruta = (fig: SpatialFraga['options'][number], px: number, ram = '#CBD5E1') =>
  `<div style="width:${px}px;height:${px}px;border:1.5px solid ${ram};border-radius:10px;background:#fff">${renderToStaticMarkup(<SpatialSvg fig={fig} />).replace('<svg ', '<svg width="100%" height="100%" ')}</div>`;
const html = urval
  .map((q) => {
    const topp = q.referens ? ruta(q.referens, 159) : `<div style="display:flex;gap:6px">${q.sekvens!.map((f) => ruta(f, q.sekvens!.length > 3 ? 76 : 104)).join('')}</div>`;
    const alt = q.options
      .map((o, i) => `<div>${ruta(o, 159, i === q.correctAnswer ? '#E07A2F' : '#CBD5E1')}<div class="m">${'ABCD'[i]}${i === q.correctAnswer ? ' FACIT' : ''} ${q.typer[i] ?? ''}<br>${q.misstag[i] ?? ''}</div></div>`)
      .join('');
    const hop = q.hopvikning ? `<div class="m">Hopvikning framåt:</div><div style="display:flex;gap:6px">${q.hopvikning.map((f) => ruta(f, q.hopvikning!.length > 3 ? 76 : 104)).join('')}</div>` : '';
    const upp = q.uppvikning ? `<div class="m">Uppvikning baklänges:</div><div style="display:flex;gap:6px">${q.uppvikning.map((f) => ruta(f, 104)).join('')}</div>` : '';
    return `<section><h3>${q.id} (${q.niva}, form ${q.form}${q.klipp ? ', klipp' : ''})</h3><p>${q.fraga}</p>${topp}<div class="g">${alt}</div><p class="m">${q.forklaring}</p>${upp}${hop}</section>`;
  })
  .join('');
process.stdout.write(`<!doctype html><meta charset="utf-8"><style>body{font:12px system-ui;margin:16px;width:328px;background:#F7F5F0}section{margin-bottom:28px}h3{margin:0 0 4px;font-size:13px}.g{display:grid;grid-template-columns:159px 159px;gap:10px;margin-top:10px}.m{color:#334;font-size:10.5px;margin-top:3px}</style>${html}`);
