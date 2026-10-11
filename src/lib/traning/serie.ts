// src/lib/traning/serie.ts
// =============================================================================
// Serien: dagar i följd med ett slutfört pass (spec-rummen 6 våg 3a, briefen
// avsnitt 5). Räknas, lagras inte.
//
// Regler:
// - En dag räknas när något slutförts den dagen i svensk tid: mätning,
//   ommätning, pass, riktat pass eller generalrepetition. (Exemplet: mätning
//   tisdag, pass onsdag till fredag ger "fyra dagar i rad" på lördagen.)
// - Dagens pass som inte är gjort än bryter inget; serien räknas till i går.
// - Söndag är veckans frizon: en söndag utan pass bryter inte serien och
//   räknas inte. En söndag med pass räknas.
// - Två dagar före provet och provdagen är serien pausad: de dagarna varken
//   räknas eller bryter.
// - Bryts serien är talet 0 och raden säger "Serien börjar om i dag", inget
//   mer.
// =============================================================================

import { arSondag, dagarMellan, laggTill, type Dag } from './datum';

export type Seriestatus =
  /** Serien pågår (dagar > 0). */
  | 'pagar'
  /** I dag är en pausdag runt provet; talet står still. */
  | 'pausad'
  /** Serien bröts; den börjar om i dag. */
  | 'bruten'
  /** Inga pass alls ännu. */
  | 'ingen';

export interface Serie {
  dagar: number;
  status: Seriestatus;
  /** Något är slutfört i dag. */
  gjordIdag: boolean;
}

export interface SerieIn {
  /** Dagar (svensk tid) med minst en slutförd mätning, ommätning, pass eller generalrepetition. */
  aktivaDagar: readonly Dag[];
  idag: Dag;
  provdatum?: Dag | null;
}

/** Pausdagarna runt provet: två dagar före och provdagen. */
export function arPausdag(dag: Dag, provdatum?: Dag | null): boolean {
  if (!provdatum) return false;
  const n = dagarMellan(dag, provdatum);
  return n >= 0 && n <= 2;
}

export function raknaSerie({ aktivaDagar, idag, provdatum }: SerieIn): Serie {
  const aktiva = new Set(aktivaDagar);
  const gjordIdag = aktiva.has(idag);
  if (aktiva.size === 0) return { dagar: 0, status: 'ingen', gjordIdag: false };

  const forsta = [...aktiva].sort()[0];
  let dagar = 0;
  let d = idag;
  // I dag bryter aldrig: ej gjort ännu = räkna från i går.
  if (!gjordIdag) d = laggTill(idag, -1);

  while (d >= forsta) {
    if (arPausdag(d, provdatum)) {
      // Varken räknas eller bryter.
    } else if (aktiva.has(d)) {
      dagar += 1;
    } else if (!arSondag(d)) {
      break;
    }
    d = laggTill(d, -1);
  }

  let status: Seriestatus;
  if (arPausdag(idag, provdatum)) status = 'pausad';
  else if (dagar > 0) status = 'pagar';
  else status = 'bruten';

  return { dagar, status, gjordIdag };
}
