/**
 * Datan bakom Din utveckling. Allt här är serialiserbart, så att sidan kan
 * hämta det i en server component och skicka det vidare som props.
 * Ren fil.
 */

import type { TestSlug } from '@/hooks/use-all-test-stats'
import type { PerTestStats } from '@/app/dashboard/tester/getHubData'
import type { Nivapunkt } from '@/lib/traning/milstolpar'
import type { PlanDag } from '@/lib/traning/plan'
import type { Dag } from '@/lib/traning/datum'
import type { Familjestatistik } from '@/lib/traning/familjer'
import type { Fordelning } from './fordelning'

/** Nivåkurvan på väggen (motorn, bara matris). */
export interface UtvecklingKurva {
  /** Kurvans punkter. Utan historik (gratis): bara den senaste. */
  punkter: Nivapunkt[]
  /** Planens dagar från mätningen till provet (Traningsstatus.plandagar). */
  plan: PlanDag[]
  /** Första mätningen: kurvans start och siktebandets början. */
  start: { dag: Dag; niva: number }
  /** Provdatum när det ligger i dag eller framåt, annars null. */
  prov: Dag | null
  sikte: number | null
  /** Dagen märket "Nivån upp" nåddes (test_milstolpar.nadd_at), annars null. */
  nivanUpp: Dag | null
  /** Gratisnivån: bara senaste punkten syns (Traningsstatus.historikLast). */
  historikLast: boolean
  /** Dagens pass är inte gjort: dagens ihåliga punkt ritas. */
  passKvar: boolean
}

/** En nivå i "Var du står". */
export interface VarDuStarNiva {
  slug: TestSlug
  /** Fördelningen på nivån (bara aggregat), null om den inte kunde läsas. */
  fordelning: Fordelning | null
  /** Hennes bästa poäng bland jämförbara sessioner (blandade, samma bankversion). */
  egenPoang: number | null
  /** Antal egna slutförda försök på nivån, alla versioner (bara för ordningen). */
  egnaForsok: number
}

/** Tempot i senaste passet och snittet över passen. */
export interface UtvecklingTempo {
  /** Senaste slutförda pass, riktat pass eller generalrepetition. */
  senaste: {
    dag: Dag
    /** Provets tid per uppgift i sekunder. */
    budget_s: number
    /** Frågorna i svarsordning. */
    fragor: { tid_s: number; ratt: boolean }[]
  } | null
  /**
   * Upp till fem senaste passens snittid (meta.snitt_s, frågorna nära nivån),
   * äldst först. Pass utan sparat snitt står med null.
   */
  snittPerPass: { dag: Dag; snitt_s: number | null; budget_s: number }[]
}

export interface DinUtvecklingData {
  /** I dag, svensk tid. */
  idag: Dag
  /** Nivåkurvan, null när ingen mätning finns. */
  kurva: UtvecklingKurva | null
  /** Hubbens statistik per klassiskt test (getTesterHubData().perTest). */
  perTest: Record<TestSlug, PerTestStats>
  /** Sant med featuren test_history; annars är serierna trimmade till senaste försöket. */
  hasHistory: boolean
  /** "Var du står": de nivåer hon gjort, ur hamtaVarDuStar(). */
  varDuStar: VarDuStarNiva[]
  /** Logikens familjer ackumulerat (alla med minst ett svar), null utan motordata. */
  familjer: Familjestatistik[] | null
  tempo: UtvecklingTempo | null
}
