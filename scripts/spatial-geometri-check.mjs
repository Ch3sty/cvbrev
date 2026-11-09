// scripts/spatial-geometri-check.mjs
// =============================================================================
// Geometrin för Spatial förmåga mätt i riktig SVG, samma kedja som
// v7-geometri-check.mjs: bankerna renderas med appens ritare
// (src/lib/spatialV1/ritare.tsx) via scripts/lib/spatial/svg-matt.tsx och
// måtten läses ur markupen (src/lib/spatialV1/svgMatt.tsx). Reglerna står i
// svgMatt.tsx: G2, G10, V2, V11, V12 och formernas egna mått (brickruta och
// luft, hål, klipp, viklinje, kubsymbolens minsta axel och kontrast).
//
// Kör: node scripts/spatial-geometri-check.mjs            (de tre bankerna)
//      node scripts/spatial-geometri-check.mjs <bank.json>
// Exit 1 vid fel.
// =============================================================================

import { execFileSync } from 'node:child_process';

export const SPATIAL_BANKER = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/spatialV1/${b}.json`);

export function matSpatial(filer = SPATIAL_BANKER) {
  const ut = execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/lib/spatial/svg-matt.tsx', ...filer], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(ut);
}

if (process.argv[1]?.endsWith('spatial-geometri-check.mjs')) {
  const filer = process.argv.slice(2).length ? process.argv.slice(2) : SPATIAL_BANKER;
  const res = matSpatial(filer);
  let fel = 0;
  for (const [bank, m] of Object.entries(res)) {
    console.log(`${bank}: ${m.uppgifter} uppgifter, högst ${m.maxNoder} noder och ${m.maxBytes} bytes per uppgift`);
    for (const f of m.fel) console.log('  ', f);
    fel += m.fel.length;
  }
  console.log(fel ? `${fel} fel` : 'Geometrin håller i riktig SVG.');
  process.exit(fel ? 1 : 0);
}
