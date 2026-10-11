// src/lib/traning/form.ts
// =============================================================================
// Formordet (spec-rummen 6 våg 3a, Formord.tsx):
// - "stigande": nivån har stigit 0,3 eller mer de senaste sju dagarna;
// - "vilar": inget slutfört i dag, i går eller i förrgår;
// - "stabil": allt annat. "Sjunkande" visas aldrig som ord: det blir
//   "stabil", och orsaken följer med så att resultatet kan säga varför.
// =============================================================================

import { laggTill, type Dag } from './datum';
import type { Nivapunkt } from './milstolpar';

export type Formord = 'stigande' | 'stabil' | 'vilar';

export interface Form {
  form: Formord;
  /** Satt när nivån sjunkit 0,3 eller mer på sju dagar. Visas aldrig som ord. */
  orsak: 'sjunkande' | null;
  /** Förändringen på sju dagar, en decimal. Null utan punkter. */
  andring7: number | null;
}

export const FORM_GRANS = 0.3;
export const VILAR_EFTER_DAGAR = 3;

export function beraknaForm(inp: {
  punkter: readonly Nivapunkt[];
  aktivaDagar: readonly Dag[];
  idag: Dag;
}): Form {
  const aktiva = new Set(inp.aktivaDagar);
  const senaste = [...inp.punkter].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));

  let andring7: number | null = null;
  if (senaste.length > 0) {
    const nu = senaste[senaste.length - 1];
    const grans = laggTill(inp.idag, -7);
    const fore = [...senaste].reverse().find((p) => p.dag <= grans) ?? senaste[0];
    andring7 = Math.round((nu.niva - fore.niva) * 10) / 10;
  }

  let vilar = true;
  for (let i = 0; i < VILAR_EFTER_DAGAR; i++) {
    if (aktiva.has(laggTill(inp.idag, -i))) {
      vilar = false;
      break;
    }
  }
  if (vilar && aktiva.size > 0) return { form: 'vilar', orsak: null, andring7 };

  if (andring7 != null && andring7 >= FORM_GRANS - 1e-9) return { form: 'stigande', orsak: null, andring7 };
  if (andring7 != null && andring7 <= -FORM_GRANS + 1e-9) return { form: 'stabil', orsak: 'sjunkande', andring7 };
  return { form: 'stabil', orsak: null, andring7 };
}
