// scripts/lib/spatial/markup-ogonblick.tsx
// Ögonblicksbild av ritarens markup för varje figur i bankerna och artiklarnas
// uppgifter (referens, sekvens, alternativ, uppvikning, hopvikning), en rad per
// figur: plats och markupen. Används för att visa att en ändring i ritaren inte
// ändrar hur någon befintlig figur ritas (omgång 3, 2026-11-19):
//   node node_modules/tsx/dist/cli.mjs scripts/lib/spatial/markup-ogonblick.tsx > fore.txt
//   (ändra ritaren)
//   node node_modules/tsx/dist/cli.mjs scripts/lib/spatial/markup-ogonblick.tsx > efter.txt
//   diff fore.txt efter.txt
// Med --version N tas bara uppgifter med fran_version < N med (de som fanns före omgången).
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SpatialSvg } from '../../../src/lib/spatialV1/ritare';
import type { SpatialFigur, SpatialFraga } from '../../../src/lib/spatialV1/types';

const arg = process.argv.slice(2);
const fore = arg.includes('--version') ? Number(arg[arg.indexOf('--version') + 1]) : Infinity;
const filer = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/spatialV1/${b}.json`).concat('src/lib/artikelfigurer/spatial.json');
const rader: string[] = [];
for (const fil of filer) {
  const bank = JSON.parse(readFileSync(fil, 'utf8')) as SpatialFraga[];
  for (const q of bank) {
    if (!(q.fran_version < fore) && fil.includes('spatialV1')) continue;
    const fig: [string, SpatialFigur][] = [];
    if (q.referens) fig.push(['referens', q.referens]);
    q.sekvens?.forEach((f, i) => fig.push([`sekvens${i}`, f]));
    q.options.forEach((f, i) => fig.push([`alt${i}`, f]));
    q.uppvikning?.forEach((f, i) => fig.push([`upp${i}`, f]));
    q.hopvikning?.forEach((f, i) => fig.push([`hop${i}`, f]));
    for (const [plats, f] of fig) rader.push(`${q.id} ${plats} ${renderToStaticMarkup(<SpatialSvg fig={f} />)}`);
  }
}
process.stdout.write(rader.join('\n') + '\n');
