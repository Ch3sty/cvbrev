import { MALLAR } from './recept-serie.mjs';
import { bygg, byggRad } from './generera-serie.mjs';
import { mulberry32 } from './slump.mjs';
const only = process.argv[2];
for (const m of MALLAR) for (const v of m.varianter) {
  if (only && !m.id.includes(only) && !v.namn.includes(only)) continue;
  const orsak = {}; let ok = 0, radOk = 0;
  for (let i = 0; i < 8; i++) {
    const rr = byggRad(v.regler(mulberry32(i * 31 + 5)));
    if (rr.fel) { const k = rr.fel.slice(0, 30); orsak[k] = (orsak[k] ?? 0) + 1; continue; }
    radOk++;
    if (bygg(mulberry32(i * 31 + 5), m, v, { id: 'x', pos: i % 6 })) ok++;
  }
  console.log(m.id, v.namn, 'rad', radOk, 'ok', ok, JSON.stringify(orsak));
}
