// src/lib/tests/oppet-facit.server.ts
// =============================================================================
// Bygger det öppna facit (omgång 3, beslut A) för rättningens svar. Ingen egen
// facitväg: typerna utöver matrisen går genom genomgaProv, samma funktion som
// sidan efter kontot använder (ProvTypSida), och matrisen genom genomgaFraga
// och misstagFor, samma som de inloggade matristesterna. Bara den valda
// uppgiften byggs; övriga uppgifters facit lämnar aldrig servern före kontot.
// =============================================================================

import 'server-only'
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7'
import { permutationForSession, tillVisat } from '@/lib/logicTestV7/blanda'
import { genomgaFraga } from '@/lib/logicTestV7/visning'
import { misstagFor } from '@/lib/traning/bank.server'
import { felIndex } from './anon-session'
import { felPositioner, genomgaProv, type ProvRef, type ProvSvar } from './prov-typer.server'
import { valjOppetFacit, type OppetFacit, type OppetFacitSvar } from './oppet-facit'

/** Typerna utöver matrisen: refs och de rättade svaren som de ligger i raden. */
export function oppetFacitTyp(refs: readonly ProvRef[], svar: readonly ProvSvar[]): OppetFacitSvar {
  const { index, variant, antal_fel } = valjOppetFacit(felPositioner(svar, refs.length), refs.length)
  const ref = refs[index]
  const s = svar[index] ?? { svar: null, selected: -1, correct: false }
  // En uppgift i taget: genomgaProv hoppar över uppgifter banken inte längre har.
  const uppgift = ref ? genomgaProv([ref], [s])[0] : undefined
  const oppet_facit: OppetFacit | null = uppgift ? { index, correct: s.correct, uppgift } : null
  return { variant, antal_fel, oppet_facit }
}

/**
 * Matrisen: frågorna ur provets frö, svaren som originalindex (så lagrar
 * rutten dem) och om alternativen visades blandade.
 */
export function oppetFacitMatris(
  questions: readonly LayeredQuestion[],
  answers: readonly unknown[],
  seed: string,
  blandade: boolean
): OppetFacitSvar {
  const { index, variant, antal_fel } = valjOppetFacit(felIndex(questions, answers), questions.length)
  const q = questions[index]
  if (!q) return { variant, antal_fel, oppet_facit: null }
  const valt = answers[index]
  const giltigt = typeof valt === 'number' && Number.isInteger(valt) && valt >= 0 && valt < q.options.length
  const correct = giltigt && valt === q.correctAnswer
  return {
    variant,
    antal_fel,
    oppet_facit: {
      index,
      correct,
      uppgift: {
        kind: 'matris',
        nyckel: q.id,
        data: genomgaFraga(q, seed, blandade),
        valt: giltigt ? tillVisat(permutationForSession(seed, q, blandade), valt) : null,
        correct,
        misstag: giltigt && !correct ? misstagFor(q, valt) : null,
      },
    },
  }
}
