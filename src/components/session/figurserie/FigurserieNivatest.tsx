'use client'

/**
 * Figurseriernas nivåtest i ramen (plan-testflode-2026-11-20 etapp 1).
 * Ersätter FigurserieTestSession i TestRunner; den gamla står kvar oanvänd
 * till etapp 5. Samma data och samma rutter som förut: uppgifterna och de
 * sparade svaren läses på servern (getRunData), svaret postas till
 * /api/figurserier/answer med {sessionId, questionId, selectedIndex,
 * timeSpent} och inlämningen till /complete med {sessionId}.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import type { VisadSerie } from '@/lib/figurserierV1/types'
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import Nivatest from '../lagen/Nivatest'
import SessionsRam from '../SessionsRam'
import { Meddelande, ForsokIgen } from '../lagen/gemensamt'
import { FIGURSERIE, type FigurserieU } from '../typer/Figurserie'
import { SESSION } from '../copy'
import { figurserieNivatestApi } from './api'

export type FigurserieNiva = 'grund' | 'avancerad' | 'expert'

export interface FigurserieNivatestProps {
  sessionId: string
  slug: string
  level: FigurserieNiva
  minuter: number
  answerEndpoint: string
  completeEndpoint: string
  sessionEndpoint: string
  resultsPath: (sessionId: string) => string
  initialRun?: RunData
}

export function tillFigurserieU(q: VisadSerie): FigurserieU {
  return { nyckel: q.id, form: q.form ?? 'harnast', rad: q.rad, options: q.options }
}

function sparadeSvar(fragor: VisadSerie[], sparade: SavedAnswer[]): (number | null)[] {
  return fragor.map((q) => visatForSvar(sparade.find((a) => a && a.q_id === q.id)))
}

interface Laddat {
  fragor: VisadSerie[]
  sparade: (number | null)[]
  startad: string | null
}

export default function FigurserieNivatest(props: FigurserieNivatestProps) {
  const router = useRouter()
  const server = props.initialRun?.resolved ? props.initialRun.session : null
  const [data, setData] = useState<Laddat | null>(() => {
    if (!server || server.completedAt || !server.serie?.length) return null
    const fragor = server.serie as VisadSerie[]
    return { fragor, sparade: sparadeSvar(fragor, server.answers), startad: server.startedAt ?? null }
  })
  const [fel, setFel] = useState(false)
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
      setData({ fragor: r.fragor, sparade: sparadeSvar(r.fragor, r.sparade), startad: r.startad })
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
        titel={FIGURSERIE.namn}
        undertitel={undertitel}
        form={FIGURSERIE.form}
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
    <Nivatest<FigurserieU>
      ritare={FIGURSERIE}
      bas={{ test_kind: 'figurserie', lage: 'nivatest', niva: props.level, format: null }}
      undertitel={undertitel}
      sessionId={props.sessionId}
      uppgifter={data.fragor.map(tillFigurserieU)}
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
