// scripts/lib/matris/svg-matt.tsx
// Renderar alla banker med appens renderare och skriver V5, V6, V10, V11 och
// V12 som JSON på stdout. Anropas av scripts/v7-geometri-check.mjs:
//   node node_modules/tsx/dist/cli.mjs scripts/lib/matris/svg-matt.tsx <bank.json> ...
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { LayeredQuestion } from '../../../src/lib/logicTestV7/layered.v7';
import { allaPrimitiver, luckaFel, matBank, ramFel, samaYtaFel, MAX_BYTES_PER_FRAGA, MAX_NODER_PER_FRAGA } from '../../../src/lib/logicTestV7/svgMatt';

const filer = process.argv.slice(2);
const banker = Object.fromEntries(
  filer.map((f) => [path.basename(f), matBank(JSON.parse(readFileSync(f, 'utf8')) as LayeredQuestion[])])
);
const ut = {
  gransNoder: MAX_NODER_PER_FRAGA,
  gransBytes: MAX_BYTES_PER_FRAGA,
  banker,
  v5: allaPrimitiver().flatMap(ramFel),
  v6: samaYtaFel(),
  v10: luckaFel(),
};
process.stdout.write(JSON.stringify(ut));
