// src/lib/nivakoll/omfang.ts
// =============================================================================
// Nivåkollens omfång per testtyp: antal uppgifter och cirka-tiden. En källa
// för alla rader som säger "Nio uppgifter, cirka sju minuter" eller
// "Nivåkoll, 7 min", så att ingen typ lovar matrisens tolv uppgifter och
// åtta minuter (plan-testflode-2026-11-20, etapp 0 punkt 2 och 3).
//
// Antalen följer motorerna: matrisen MATNING_ANTAL (traning/niva.ts), övriga
// NIVAKOLL_URVAL (nivakoll/motor.server.ts), där verbalt och numeriskt tar
// två underlag med fyra påståenden eller frågor var. Testet
// __tests__/omfang.test.ts faller om de glider isär.
//
// Ren, inga beroenden, går att importera från klienten.
// =============================================================================

export type NivakollTypId = 'matris' | 'figurserie' | 'deduktiv' | 'verbal' | 'numerisk' | 'talserie' | 'spatial' | 'ordforrad';

export interface NivakollOmfang {
  uppgifter: number;
  /** Cirka-tiden i hela minuter. */
  minuter: number;
}

export const NIVAKOLL_OMFANG: Readonly<Record<NivakollTypId, NivakollOmfang>> = {
  matris: { uppgifter: 12, minuter: 8 },
  figurserie: { uppgifter: 9, minuter: 7 },
  deduktiv: { uppgifter: 6, minuter: 8 },
  verbal: { uppgifter: 8, minuter: 5 },
  numerisk: { uppgifter: 8, minuter: 10 },
  // Etapp 6: talserier 9 à 60 s, spatial 9 (tre former per nivå, 30 + 45 + 45 s), ordförråd 12 à 20 s.
  talserie: { uppgifter: 9, minuter: 9 },
  spatial: { uppgifter: 9, minuter: 6 },
  ordforrad: { uppgifter: 12, minuter: 4 },
};

/** Omfånget för typen, null där Nivåkollen inte finns. */
export function nivakollOmfang(typ: string): NivakollOmfang | null {
  return (NIVAKOLL_OMFANG as Record<string, NivakollOmfang>)[typ] ?? null;
}

const TAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
const ord = (n: number) => (n >= 0 && n < TAL.length ? TAL[n] : String(n));
const versal = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "Nio uppgifter, cirka sju minuter" (utan punkt). */
export function nivakollAntalTid(o: NivakollOmfang): string {
  return `${versal(ord(o.uppgifter))} uppgifter, cirka ${ord(o.minuter)} minuter`;
}

/** Kortets korta rad: "Nivåkoll, 7 min". */
export function nivakollKortRad(o: NivakollOmfang): string {
  return `Nivåkoll, ${o.minuter} min`;
}
