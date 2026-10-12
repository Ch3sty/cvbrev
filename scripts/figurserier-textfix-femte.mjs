#!/usr/bin/env node
// scripts/figurserier-textfix-femte.mjs
// =============================================================================
// Granskning 03, villkoret på fs-e-antal-04: misstaget "står som i den fjärde
// figuren" skrevs också när distraktorn står som den FEMTE (växelvis regel,
// distraktorn har den femte figurens värde). Generatorn är rättad
// (distraktorer.mjs, typen som_femte); det här skriptet rättar texten i de
// redan granskade kandidaterna utan att röra alternativen. Bara meningen byts,
// och bara där värdet faktiskt är den femte figurens och inte den fjärdes.
//
// Kör: node scripts/figurserier-textfix-femte.mjs
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { lasCell, stable } from './lib/serie/celler-serie.mjs';

const K = 'src/lib/figurserierV1/kandidater';
let andrade = 0;
for (const niva of ['grund', 'avancerad', 'expert']) {
  const fil = `${K}/${niva}.json`;
  const bank = JSON.parse(readFileSync(fil, 'utf8'));
  for (const q of bank) {
    const vaxelvis = Object.entries(q.regler.dims).filter(([, r]) => r.regel === 'vaxelvis').map(([id]) => id);
    if (!vaxelvis.length) continue;
    const rad = q.rad.map((c) => lasCell(c).v);
    q.misstag = q.misstag.map((m, i) => {
      const re = /^(.+?) står som i den fjärde figuren, men den andra serien tar ett steg till\./;
      const tr = re.exec(m);
      if (!tr) return m;
      const v = lasCell(q.options[i]).v;
      const femte = vaxelvis.some((id) => stable(v[id]) === stable(rad[4][id]) && stable(v[id]) !== stable(rad[3][id]));
      if (!femte) return m;
      andrade++;
      console.log(`${q.id} ${'ABCDEF'[i]}`);
      return m.replace(re, `${tr[1]} står kvar som i den femte figuren.`);
    });
  }
  writeFileSync(fil, JSON.stringify(bank, null, 1) + '\n');
}
console.log(`${andrade} misstag rättade`);
