// src/lib/onboarding/program.ts
//
// Onboardingens och köpvägens texter, en enda sanningskälla
// (docs/plan-paket-och-onboarding.md, Fas 2B och Fas 2C, ägarens beslut
// 2026-10-11 i spec-rummen 17.3: bara Jobbcoach Premium säljs).
//
// Strängarna har sina T-id i kommentar, så att en ändring i planen går att
// hitta i koden och tvärtom. Inga talstreck, inga engelska gränssnittsord.

import { PLAN_BY_KEY, paketKort, type PlanKey } from '@/lib/plans/plans'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'

const ALLA_TRAFFAR = `Alla ${JOB_MATCHES_PER_RUN} jobbträffar med skälen`

/** Kortformen ur PLANS (copy-premium avsnitt 1), aldrig som fast sträng. */
const PREMIUM = paketKort()

/** Det som tidigare hette "allt i de andra paketen" (copy-premium avsnitt 3). */
const ALLT_I_PREMIUM = 'Alla CV-mallar, CV-analysen, personliga brev och alla rekryteringstester'

/**
 * Paketnycklarna ägs av plans.ts. Aliaset finns för att onboardingens
 * anropsplatser ska slippa importera två namn för samma sak.
 */
export type PlanKeyPaket = PlanKey

export type Track = 'cv' | 'tester' | 'allt'

export const TRACKS: readonly Track[] = ['cv', 'tester', 'allt']

export function isTrack(value: unknown): value is Track {
  return typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
}

/* ------------------------------------------------------------------ paket */

export interface PaketInfo {
  key: PlanKeyPaket
  /** Bestämd form, ur PLANS. */
  namn: string
  /** Ur PLANS. */
  belopp: number
  /** T16: förnyelseraden, eller sluttidsraden för engångsköpet. */
  intervall: string
  /** T17 till T20 */
  ingar: readonly string[]
  /** T21. Bara spårpaketen har raden. */
  ingarInte?: string
  /** T25 */
  knapp: string
  engangs?: boolean
}

/** Namn och belopp ur PLANS; det här är bara onboardingens egna rader. */
function paket(key: PlanKeyPaket, rest: Omit<PaketInfo, 'key' | 'namn' | 'belopp' | 'knapp'>): PaketInfo {
  const p = PLAN_BY_KEY[key]
  return { key, namn: p.name, belopp: p.amount, knapp: `Betala ${p.amount} kr`, ...rest }
}

/**
 * Alla nycklar, sålda och osålda. Bara all_month säljs; de andra står kvar
 * så att kvitton och kontosidan beskriver en befintlig prenumeration rätt
 * tills den löpt ut.
 */
export const PAKET: Record<PlanKeyPaket, PaketInfo> = {
  cv_week: paket('cv_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      `Alla ${TEMPLATE_COUNT} CV-mallar`,
      'Full CV-analys, alla fynd och poängen',
      'Personliga brev, skrivna och nedladdade',
      'CV-export utan tak, PDF och Word',
    ],
    ingarInte: `Ingår i ${PREMIUM}: testnivåer över grundnivån, Jobbcoachen, Bli upptäckt.`,
  }),
  test_week: paket('test_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Alla 19 tester, grundnivå till expert',
      'Övningsprov mot klockan, automatisk inlämning',
      'Fördjupade personlighetstestet, 120 påståenden',
      'Hela din historik, inte bara senaste',
    ],
    ingarInte: `Ingår i ${PREMIUM}: CV-mallar utöver de tre fria, full analys, personliga brev.`,
  }),
  all_day: paket('all_day', {
    // Avsnitt 8: engångsköpet har ingen förnyelse, så raden blir en sluttidsrad.
    intervall: 'Gäller 24 timmar. Inget dras igen.',
    ingar: [
      ALLA_TRAFFAR,
      'Jobbcoachen, så mycket du vill',
      ALLT_I_PREMIUM,
      'Ett dygn, ingen prenumeration',
    ],
    engangs: true,
  }),
  all_week: paket('all_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      ALLA_TRAFFAR,
      'Jobbcoachen, så mycket du vill',
      'Bli upptäckt och LinkedIn-optimering',
      ALLT_I_PREMIUM,
    ],
  }),
  all_month: paket('all_month', {
    intervall: 'Dras varje månad på samma datum tills du säger upp',
    ingar: [
      'Alla CV-mallar, CV-analysen, personliga brev och LinkedIn',
      'Alla rekryteringstester, övningsprov och personlighetstestet',
      'Jobbmatchning, Jobbcoachen och Bli upptäckt',
      'Säg upp när som helst, ett klick',
    ],
  }),
  all_quarter: paket('all_quarter', {
    intervall: 'Dras var tredje månad på samma datum tills du säger upp',
    ingar: [
      'Jobbmatchning, Jobbcoachen och Bli upptäckt, i tre månader',
      ALLA_TRAFFAR,
      ALLT_I_PREMIUM,
      'Säg upp när som helst, ett klick',
    ],
  }),
}

/* ------------------------------ gratisanvändarens spårfråga, Fas 2D skärm 1.1b */

export const SPARVAL_GRATIS = {
  steg: 'Sista steget',
  fraga: 'Vad vill du börja med?', // D3
  ingress: 'Vi lägger det du väljer överst på hemskärmen. Inget kostar något.', // D4
  primar: 'Till hemskärmen', // D11
  kort: {
    cv: { titel: 'CV och personliga brev', text: 'Vi läser ditt CV och visar vad en rekryterare ser.' }, // D5, D6
    tester: { titel: 'Urvalstester', text: 'Grundnivån i varje testtyp ligger öppen.' }, // D7, D8
    ingen: { titel: 'Jag vet inte än', text: 'Då visar vi hemskärmen som den är.' }, // D9, D10
  },
} as const

/* --------------------------------------------- paketskärmen, T14 till T26 */

export const PAKETSKARM = {
  kvitto: 'Kvittot skickas till din e-post direkt efter betalningen.', // T26
  // T23, kortad mot K1. Lagkravsstyrd, ändras bara mot avsnitt 8.
  samtycke:
    'Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.',
  samtyckeHjalp: 'Kryssar du inte i får du tillgång först efter fjorton dagar.', // K2
  samtyckeSpärr: 'Kryssa i rutan ovanför för att fortsätta.',
} as const

/** T22, förnyelseraden. Engångsköpet får sluttidsraden i stället. */
export function fornyelserad(paket: PaketInfo, datum: string): string {
  if (paket.engangs) {
    return `Dygnet tar slut ${datum}. Inget dras igen och det finns inget att säga upp.`
  }
  return `Nästa dragning ${datum}. Säg upp när som helst i ditt konto, utan skäl.`
}
