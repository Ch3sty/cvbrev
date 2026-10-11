'use client'

// Klientdelen av förhandsvisningen (se page.tsx): kopplar fixturerna till
// samma komponenter som passet, med fixtur-API:t i stället för /api/traning.

import { useMemo } from 'react'
import Kvitto from '@/components/traning/Kvitto'
import PassFlode from '@/components/traning/PassFlode'
import Uppvarmning, { type UppvarmningApi } from '@/components/traning/Uppvarmning'
import { fixturApi } from '@/lib/traning/fixturApi'
import type { Forhandsdata } from './fixturer.server'

export default function Forhandsvisning({ data }: { data: Forhandsdata }) {
  const api = useMemo(() => ('fixtur' in data ? fixturApi(data.fixtur) : null), [data])
  const uppApi = useMemo<UppvarmningApi | null>(() => {
    if (data.ram !== 'uppvarmning') return null
    return {
      async hamta() {
        return data.fragor
      },
      async svara(id, i) {
        await new Promise((r) => setTimeout(r, 120))
        const f = data.facit[id]
        return f ? { correct: i === f.rattVisat, rattVisat: f.rattVisat, regel: f.regel } : null
      },
    }
  }, [data])

  if (data.ram === 'K1') return <Kvitto data={data.kvitto} markera={false} />
  if (data.ram === 'uppvarmning') return <Uppvarmning api={uppApi!} fragor={data.fragor} />
  if (!api) return null
  if ('resultat' in data) {
    return (
      <PassFlode
        api={api}
        vy={data.fixtur.vy}
        betalande={data.betalande}
        initial={{ fas: 'resultat', resultat: data.resultat }}
        forhandsvisning
      />
    )
  }
  return (
    <PassFlode
      api={api}
      vy={data.fixtur.vy}
      betalande={data.betalande}
      initial={{ idx: data.initial.idx, fas: data.initial.fas, vald: data.initial.vald, klar: data.initial.klar, aterkoppling: data.initial.fas === 'aterkoppling' ? data.fixtur.vy.aterkoppling?.[data.fixtur.vy.fragor[data.initial.idx].id] : undefined }}
      fastTid={data.fastTid}
      forhandsvisning
    />
  )
}
