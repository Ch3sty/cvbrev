'use client'

/**
 * Nivåtestet i deduktiv slutledning i ramen (plan-testflode-2026-11-20 etapp
 * 3), grundnivå, avancerad nivå och expertnivå. Ersatte DeduktivTestSession
 * i TestRunner (raderad i etapp 5). Samma rutter och kroppar som förut.
 */

import type { GenomgangDeduktiv, VisadDeduktiv } from '@/lib/deduktivV1/types'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import KlassiskNivatest, { type KlassiskNivatestProps } from '../delat/KlassiskNivatest'
import type { GenomgangPost } from '../lagen/Genomgang'
import { DEDUKTIV, type DeduktivU } from '../typer/Deduktiv'
import Losningsgang from './Losningsgang'

export function tillDeduktivU(q: VisadDeduktiv): DeduktivU {
  return { nyckel: q.id, intro: q.intro, villkor: q.villkor, fraga: q.fraga, options: q.options }
}

interface Svar {
  q_id?: string
  selected?: number
  visat?: number
  time_spent?: number
}

export function deduktivPoster(genomgang: GenomgangDeduktiv[], answers: unknown): GenomgangPost<DeduktivU>[] {
  const lista = (Array.isArray(answers) ? answers : []) as Svar[]
  return genomgang.map((q) => {
    const a = lista.find((x) => x && x.q_id === q.id)
    const valt = visatForSvar(a ?? null)
    return {
      u: tillDeduktivU(q),
      valt,
      facit: {
        ratt: q.rattVisat,
        correct: valt === q.rattVisat,
        regel: null,
        misstag: valt != null && valt !== q.rattVisat ? q.misstag[valt] || null : null,
        detalj: <Losningsgang losning={q.losning} />,
      },
      tid_s: typeof a?.time_spent === 'number' ? a.time_spent : null,
    }
  })
}

type Props = Omit<KlassiskNivatestProps<VisadDeduktiv, DeduktivU>, 'ritare' | 'lasFragor' | 'tillU'>

export default function DeduktivNivatest(props: Props) {
  return (
    <KlassiskNivatest<VisadDeduktiv, DeduktivU>
      {...props}
      ritare={DEDUKTIV}
      lasFragor={(r) => r.deduktiv as VisadDeduktiv[] | undefined}
      tillU={tillDeduktivU}
    />
  )
}
