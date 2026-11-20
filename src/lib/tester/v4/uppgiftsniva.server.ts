// src/lib/tester/v4/uppgiftsniva.server.ts
// Uppgiftens nivå för typerna utanför matrisen (uppgiftsniva.ts): samma
// p-funktion som nivån efter träningen (nivapunkt.server.ts).

import 'server-only';
import { pFor } from '@/lib/nivakoll/las.server';
import type { NivakollKind } from '@/lib/nivakoll/niva';
import { pForTyp } from './steg2-niva.server';
import type { TestTypId } from './typer';
import { uppgiftsNivaFalt, type UppgiftsNivaFalt } from './uppgiftsniva';

export function uppgiftsNivaForTyp(kind: NivakollKind | Exclude<TestTypId, 'matris'>, ordning: readonly string[], nyckel: string): UppgiftsNivaFalt {
  const p = pForTyp(kind) ?? ((id: string) => pFor(kind as NivakollKind, id));
  return uppgiftsNivaFalt(ordning, nyckel, p);
}
