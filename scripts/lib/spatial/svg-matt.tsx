// scripts/lib/spatial/svg-matt.tsx
// Renderar bankerna för Spatial förmåga med appens ritare och skriver måtten
// som JSON på stdout. Anropas av scripts/spatial-geometri-check.mjs:
//   node node_modules/tsx/dist/cli.mjs scripts/lib/spatial/svg-matt.tsx <bank.json> ...
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { matSpatialBank } from '../../../src/lib/spatialV1/svgMatt';
import type { SpatialFraga } from '../../../src/lib/spatialV1/types';

const filer = process.argv.slice(2);
const ut = Object.fromEntries(filer.map((f) => [path.basename(f), matSpatialBank(JSON.parse(readFileSync(f, 'utf8')) as SpatialFraga[])]));
process.stdout.write(JSON.stringify(ut));
