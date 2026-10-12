// scripts/lib/matris/svg-matt.tsx
// Renderar alla banker med appens renderare och skriver V5, V6, V10, V11 och
// V12 som JSON på stdout. Anropas av scripts/v7-geometri-check.mjs:
//   node node_modules/tsx/dist/cli.mjs scripts/lib/matris/svg-matt.tsx <bank.json> ...
//   node node_modules/tsx/dist/cli.mjs scripts/lib/matris/svg-matt.tsx --serie <bank.json> ...
// Med --serie mäts figurseriernas frågor (fem figurer, luckan och sex
// alternativ) mot seriens gränser (figurserier-spec.md avsnitt 10).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { LayeredQuestion } from '../../../src/lib/logicTestV7/layered.v7';
import {
  allaPrimitiver,
  luckaFel,
  matBank,
  matSerieBank,
  ramFel,
  samaYtaFel,
  MAX_BYTES_PER_FRAGA,
  MAX_NODER_PER_FRAGA,
  MAX_BYTES_SERIE,
  MAX_NODER_SERIE,
} from '../../../src/lib/logicTestV7/svgMatt';

const serie = process.argv.includes('--serie');
const filer = process.argv.slice(2).filter((a) => a !== '--serie');
const banker = Object.fromEntries(
  filer.map((f) => {
    const bank = JSON.parse(readFileSync(f, 'utf8'));
    return [path.basename(f), serie ? matSerieBank(bank) : matBank(bank as LayeredQuestion[])];
  })
);
const ut = {
  gransNoder: serie ? MAX_NODER_SERIE : MAX_NODER_PER_FRAGA,
  gransBytes: serie ? MAX_BYTES_SERIE : MAX_BYTES_PER_FRAGA,
  banker,
  v5: allaPrimitiver().flatMap(ramFel),
  v6: samaYtaFel(),
  v10: luckaFel(),
};
process.stdout.write(JSON.stringify(ut));
