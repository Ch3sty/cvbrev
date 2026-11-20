// src/lib/tester/v4/sparrData.ts
// =============================================================================
// Spärrens siffror ur sidornas data (omgång 3, steg 4): nivån i typen, provet
// hon övar mot med dagen, övningsprovets format och dagar kvar. Allt finns
// redan i TesterV4Data, så spärren kostar ingen hämtning. Saknas ett värde
// lämnas det null och raden faller bort i spärren, aldrig ett påhittat värde.
//
// Ren fil, går att importera från klienten.
// =============================================================================

import type { SparrData } from '@/components/paywall/TestSparr';
import type { PlanV4, TestTypId, TesttypKort } from './typer';
import { kortDatumV } from './vagen';

export interface SparrUnderlag {
  plan: PlanV4 | null;
  typer: Pick<TesttypKort, 'id' | 'niva'>[];
}

export interface SparrSiffror {
  data: SparrData;
  dagarKvar: number | null;
}

/** Provets namn i spärren: planens namn, eller "Provet" för eget urval. */
export function provNamn(mittTest: string, namn: string): string {
  return mittTest === 'annat' || mittTest === 'personlighet' ? 'Provet' : namn;
}

/**
 * Siffrorna för en spärr som öppnas i typen `typ` (null: ingen typ, till
 * exempel kurvans lås). Provet och formatet tas bara med när typen ingår i
 * planen, så att spärren aldrig säger att provet prövar en typ det saknar.
 */
export function sparrDataFor(u: SparrUnderlag, typ: TestTypId | null): SparrSiffror {
  const kort = typ ? u.typer.find((k) => k.id === typ) ?? null : null;
  const niva = kort && kort.niva.status === 'matt' && typeof kort.niva.niva === 'number' ? kort.niva.niva : null;
  const plan = u.plan;
  const iPlan = !!plan && (typ == null || plan.typer.includes(typ));
  const dagarKvar = iPlan && plan!.dagarKvar != null && plan!.dagarKvar >= 0 ? plan!.dagarKvar : null;
  const data: SparrData = {};
  if (niva != null) data.niva = niva;
  if (iPlan && plan) {
    // "Eget urval" är inget provnamn: spärren säger då bara "Provet".
    data.prov = { namn: provNamn(plan.mittTest, plan.namn), dag: plan.provdatum && dagarKvar != null ? kortDatumV(plan.provdatum) : null };
    if (plan.ovningsprov && plan.format && data.prov.namn !== 'Provet') {
      data.format = { namn: plan.namn, antal: 0, minuter: 0, text: plan.ovningsprov.meta };
    }
  }
  return { data, dagarKvar };
}
