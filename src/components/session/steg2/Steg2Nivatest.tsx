'use client'

/**
 * Nivåtestet i talserier, spatial förmåga och ordförråd i ramen
 * (plan-testflode-2026-11-20 etapp 4). Ersätter Steg2TestSession i
 * TestRunner; den gamla står kvar oanvänd till etapp 5. Samma data och
 * samma rutter som förut: uppgifterna och de sparade svaren läses på servern
 * (getRunData), svaret postas till /api/steg2/<typ>/answer med {sessionId,
 * questionId, selectedIndex, timeSpent} och inlämningen till /complete med
 * {sessionId}. Kropparna byggs av figurseriernas api (samma form), låsta i
 * kontrakt-steg2.test.ts.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData'
import { testPaths, type Steg2Kind } from '@/app/dashboard/tester/testConfig'
import Nivatest from '../lagen/Nivatest'
import SessionsRam from '../SessionsRam'
import { Meddelande, ForsokIgen } from '../lagen/gemensamt'
import { steg2Ritare, tillSteg2U, type Steg2U } from '../typer/Steg2'
import { SESSION } from '../copy'
import { figurserieNivatestApi } from '../figurserie/api'

export interface Steg2NivatestProps {
  kind: Steg2Kind
  sessionId: string
  slug: string
  level: 'grund' | 'avancerad' | 'expert'
  minuter: number
  answerEndpoint: string
  completeEndpoint: string
  sessionEndpoint: string
  resultsPath: (sessionId: string) => string
  initialRun?: RunData
}

type Visad = { id: string }

function sparadeSvar(fragor: Visad[], sparade: SavedAnswer[]): (number | null)[] {
  return fragor.map((q) => visatForSvar(sparade.find((a) => a && a.q_id === q.id)))
}

interface Laddat {
  fragor: Visad[]
  sparade: (number | null)[]
  startad: string | null
}

export default function Steg2Nivatest(props: Steg2NivatestProps) {
  const router = useRouter()
  const ritare = steg2Ritare(props.kind)
  const server = props.initialRun?.resolved ? props.initialRun.session : null
  const [data, setData] = useState<Laddat | null>(() => {
    if (!server || server.completedAt || !server.steg2?.length) return null
    const fragor = server.steg2 as Visad[]
    return { fragor, sparade: sparadeSvar(fragor, server.answers), startad: server.startedAt ?? null }
  })
  const [fel, setFel] = useState(false)
  // Samma rutter och kroppar som nivåtestet i figurserier (KROPP i figurserie/api).
  const api = figurserieNivatestApi(props)

  useEffect(() => {
    if (server?.completedAt) {
      router.replace(props.resultsPath(props.sessionId))
      return
    }
    if (data) return
    let avbruten = false
    void (async () => {
      const r = await api.hamta()
      if (avbruten) return
      if (!r) return setFel(true)
      if (r.avslutad) return router.replace(props.resultsPath(props.sessionId))
      const fragor = r.fragor as unknown as Visad[]
      setData({ fragor, sparade: sparadeSvar(fragor, r.sparade), startad: r.startad })
    })()
    return () => {
      avbruten = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const undertitel = SESSION.undertitel('nivatest', props.level)
  if (!data) {
    return (
      <SessionsRam
        lage="nivatest"
        titel={ritare.namn}
        undertitel={undertitel}
        form={ritare.form}
        raknare={null}
        framsteg={0}
        bekraftaAvbryt={false}
        onAvbryt={() => router.push(testPaths.hub(props.slug))}
        fot={null}
      >
        {fel ? (
          <Meddelande titel={SESSION.fel.hamta} text={SESSION.fel.hamtaRad}>
            <ForsokIgen onClick={() => window.location.reload()} />
          </Meddelande>
        ) : (
          <p aria-busy="true" className="loading-thread rounded-xl border border-kant bg-papper p-4 text-sm text-ink-3">
            {SESSION.laddar.session}
          </p>
        )}
      </SessionsRam>
    )
  }

  return (
    <Nivatest<Steg2U>
      ritare={ritare}
      bas={{ test_kind: props.kind, lage: 'nivatest', niva: props.level, format: null }}
      undertitel={undertitel}
      sessionId={props.sessionId}
      uppgifter={data.fragor.map((q) => tillSteg2U(props.kind, q, q.id))}
      sparade={data.sparade}
      startad={data.startad}
      budgetS={props.minuter * 60}
      skicka={(u, index, sekunder) => api.svara(u.nyckel, index, sekunder)}
      lamnaIn={api.lamnaIn}
      efterInlamning={() => router.push(props.resultsPath(props.sessionId))}
      avbrytHref={testPaths.hub(props.slug)}
    />
  )
}
