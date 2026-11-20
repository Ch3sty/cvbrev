// src/lib/tester/v4/uppgiftsniva.ts
// =============================================================================
// Uppgiftens nivå i Träna (omgång 3 steg 1): nivåkapseln i huvudet och raden
// "Nästa blir lite svårare" i domen. Nivån är samma avbildning som resten av
// motorn använder, b = 1 + 9 × (1 − p) på skalan 1 till 10 (svarighet.ts),
// med uppgiftens p ur banken (samma p-funktion som nivån efter träningen).
// Träningens uppgiftslista är fast när sessionen skapas, så nästa uppgift är
// känd när ett svar kommer in: nästa i listans ordning.
//
// Fälten läggs till i svarets JSON (uppgift_niva, nasta_niva); inga
// befintliga fält ändras. Null när nivån inte går att säga.
// =============================================================================

import { nivaForP } from '@/lib/traning/svarighet';

export interface UppgiftsNivaFalt {
  /** Den besvarade uppgiftens nivå, 1 till 10 med en decimal. */
  uppgift_niva: number | null;
  /** Nästa uppgifts nivå i listans ordning; null efter sista uppgiften. */
  nasta_niva: number | null;
}

const avrunda = (v: number) => Math.round(v * 10) / 10;

/** Nivån för en uppgift ur dess p, null när p saknas eller inte är ett tal. */
export function nivaUrP(p: number | null | undefined): number | null {
  return typeof p === 'number' && Number.isFinite(p) && p > 0 && p < 1 ? avrunda(nivaForP(p)) : null;
}

/** Fälten för ett svar: uppgiftens nivå och nästa uppgifts, ur listans ordning. */
export function uppgiftsNivaFalt(ordning: readonly string[], nyckel: string, p: (id: string) => number | null | undefined): UppgiftsNivaFalt {
  const las = (id: string): number | null => {
    try {
      return nivaUrP(p(id));
    } catch {
      return null;
    }
  };
  const i = ordning.indexOf(nyckel);
  const nasta = i >= 0 && i + 1 < ordning.length ? ordning[i + 1] : null;
  return { uppgift_niva: las(nyckel), nasta_niva: nasta ? las(nasta) : null };
}
