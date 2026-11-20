'use client'

/**
 * Nivåtestet i Figurer och mönster i ramen (plan-testflode-2026-11-20 etapp
 * 3), grundnivå, avancerad nivå och expertnivå. Ersatte MatrixTestSession i
 * TestRunner (raderad i etapp 5). Reglaget
 * "Förklarande text" och svårighetsprickarna är borta: uppgiften ser ut som
 * i det riktiga testet. Samma rutter och kroppar som förut.
 */

import type { VisadFraga, GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import KlassiskNivatest, { type KlassiskNivatestProps } from '../delat/KlassiskNivatest'
import type { GenomgangPost } from '../lagen/Genomgang'
import { MATRIS, type MatrisU } from '../typer/Matris'

export function tillMatrisU(q: Pick<VisadFraga, 'id' | 'grid' | 'options'>): MatrisU {
  return { nyckel: q.id, grid: q.grid, options: q.options }
}

interface Svar {
  q_id?: string
  selected?: number
  visat?: number
  time_spent?: number
}

/** Genomgången ur serverns genomgång och de sparade svaren (visat index). */
export function matrisPoster(genomgang: GenomgangsFraga[], answers: unknown): GenomgangPost<MatrisU>[] {
  const lista = (Array.isArray(answers) ? answers : []) as Svar[]
  return genomgang.map((q) => {
    const a = lista.find((x) => x && x.q_id === q.id)
    const valt = visatForSvar(a ?? null)
    return {
      u: tillMatrisU(q),
      valt,
      facit: { ratt: q.rattVisat, correct: valt === q.rattVisat, regel: q.rule || null, misstag: null },
      tid_s: typeof a?.time_spent === 'number' ? a.time_spent : null,
    }
  })
}

type Props = Omit<KlassiskNivatestProps<VisadFraga, MatrisU>, 'ritare' | 'lasFragor' | 'tillU'>

export default function MatrisNivatest(props: Props) {
  return <KlassiskNivatest<VisadFraga, MatrisU> {...props} ritare={MATRIS} lasFragor={(r) => r.fragor} tillU={tillMatrisU} />
}
