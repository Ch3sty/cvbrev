// src/components/session/typ.ts
// =============================================================================
// Kontraktet mellan ramen och en testtyp (plan-testflode-2026-11-20 avsnitt
// 1 och 12). Lägesflödena i src/components/session/lagen äger tid, sparande,
// navigering, dialoger och resultat; en typ äger bara sin uppgift: hur den
// ritas, hur många alternativ den har och vilken innehållsform den står i.
// Etapperna 2 till 4 kopplar in en typ genom att skriva en TypRitare och
// mappa sin motors vy till RamUppgift; ramen och lägena rörs inte.
// =============================================================================

import type { ComponentType } from 'react'
import type { Innehallsform } from './lagesregler'

/** En uppgift i ramen: nyckeln är motorns (frågans id eller punktens nyckel). */
export interface RamUppgift {
  nyckel: string
}

export interface UppgiftProps<U extends RamUppgift> {
  u: U
  /** Ettbaserat nummer och antal, för skärmläsaren. */
  nr: number
  antal: number
  /** Markerat eller sparat svar, visat index. */
  vald: number | null
  /** Rätt svar (visat index) efter facit: Träna och genomgången. Annars null. */
  facit: number | null
  /** Sant när hon valde fel: rätt kort kommer 120 ms efter felet. */
  efterFel?: boolean
  /** Ett tryck markerar (ramen bekräftar med knappen). Saknas när låst. */
  onValj?: (i: number) => void
  /** Låst: under sparning, efter facit och i genomgången. */
  last: boolean
}

export interface TypRitare<U extends RamUppgift> {
  /** Testtypens id i mätningen och rapporten (test_kind). */
  kind: string
  /** Typens namn som i Tester: huvudets titel. */
  namn: string
  form: Innehallsform
  antalAlternativ: (u: U) => number
  Uppgift: ComponentType<UppgiftProps<U>>
}

/** Facit och förklaring per uppgift, efter svaret (Träna) eller efteråt (genomgången). */
export interface RamFacit {
  ratt: number
  correct: boolean
  regel: string | null
  misstag: string | null
}
