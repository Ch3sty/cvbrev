// scripts/validate-spatial.mjs
// =============================================================================
// Kontrollerar bankerna för Spatial förmåga: formens spärrar (SP-A i
// scripts/lib/spatial/brick.mjs, SP-B i vikning.mjs, SP-C i kub.mjs), unika
// id, fyra alternativ med misstagstext, och att varje nivå har uppgifter nog
// för ett nivåtest (fem per form). Geometrin i riktig SVG mäts av
// scripts/spatial-geometri-check.mjs. Båda körs av vitest
// (src/lib/spatialV1/__tests__/sparrar.test.ts).
//
// Kör: node scripts/validate-spatial.mjs
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';
import { SPATIAL_BANKER } from './spatial-geometri-check.mjs';

export async function valideraSpatial(filer = SPATIAL_BANKER) {
  await laddaFormer();
  const fel = [];
  const ids = new Set();
  for (const fil of filer) {
    const bank = JSON.parse(readFileSync(fil, 'utf8'));
    const perForm = {};
    for (const q of bank) {
      if (ids.has(q.id)) fel.push(`${q.id}: id finns två gånger`);
      ids.add(q.id);
      perForm[q.form] = (perForm[q.form] ?? 0) + 1;
      const F = FORMER[q.form];
      if (!F) {
        fel.push(`${q.id}: okänd form ${q.form}`);
        continue;
      }
      fel.push(...F.sparrar(q));
      if (q.options.length !== 4) fel.push(`${q.id}: ${q.options.length} alternativ`);
      if (q.misstag.filter((m) => m).length !== 3) fel.push(`${q.id}: ska ha tre misstagstexter`);
      if (q.misstag.some((m) => /[—–]/.test(m)) || /[—–]/.test(q.forklaring)) fel.push(`${q.id}: tankstreck i texten`);
      if (!(q.correctAnswer >= 0 && q.correctAnswer < 4)) fel.push(`${q.id}: facit utanför alternativen`);
    }
    for (const form of Object.keys(FORMER)) {
      if ((perForm[form] ?? 0) < 5) fel.push(`${fil}: form ${form} har ${perForm[form] ?? 0} uppgifter, minst 5`);
    }
    // facit ska inte stå på samma plats i mer än 40 procent (vyn blandar ändå per session)
    const plats = [0, 0, 0, 0];
    bank.forEach((q) => plats[q.correctAnswer]++);
    if (Math.max(...plats) > 0.4 * bank.length) fel.push(`${fil}: facit står på samma plats i ${Math.max(...plats)} av ${bank.length}`);
  }
  return fel;
}

if (process.argv[1]?.endsWith('validate-spatial.mjs')) {
  const fel = await valideraSpatial();
  for (const f of fel) console.log(f);
  console.log(fel.length ? `${fel.length} fel` : 'Spatial förmåga klarar spärrarna.');
  process.exit(fel.length ? 1 : 0);
}
