'use client'

/**
 * Nivåtestet i ramen för typerna i etapp 3 (plan-testflode-2026-11-20):
 * Figurer och mönster och Deduktiv slutledning, grundnivå, avancerad nivå och
 * expertnivå. Samma mönster som figurseriernas FigurserieNivatest, med typen
 * som parameter: uppgifterna och de sparade svaren läses på servern
 * (getRunData), svaret postas till <api>/answer med {sessionId, questionId,
 * selectedIndex, timeSpent} och inlämningen till <api>/complete med
 * {sessionId}. Rutterna och kropparna är desamma som i de gamla vyerna.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import Nivatest from '../lagen/Nivatest'
import SessionsRam from '../SessionsRam'
import { Meddelande, ForsokIgen } from '../lagen/gemensamt'
import type { RamUppgift, TypRitare } from '../typ'
import { SESSION } from '../copy'
import { figurserieNivatestApi } from '../figurserie/api'

export type KlassiskNiva = 'grund' | 'avancerad' | 'expert'

export interface KlassiskNivatestProps<Q extends { id: string }, U extends RamUppgift> {
  ritare: TypRitare<U>
  /** Uppgifterna i serverns svar (getRunData): matrisens fragor, deduktivens deduktiv. */
  lasFragor: (run: NonNullable<RunData['session']>) => Q[] | undefined
  tillU: (q: Q) => U
  sessionId: string
  slug: string
  level: KlassiskNiva
  minuter: number
  answerEndpoint: string
  completeEndpoint: string
  sessionEndpoint: string
  resultsPath: (sessionId: string) => string
  initialRun?: RunData
}

function sparadeSvar(fragor: { id: string }[], sparade: SavedAnswer[]): (number | null)[] {
  return fragor.map((q) => visatForSvar(sparade.find((a) => a && a.q_id === q.id)))
}

interface Laddat<Q> {
  fragor: Q[]
  sparade: (number | null)[]
  startad: string | null
}

export default function KlassiskNivatest<Q extends { id: string }, U extends RamUppgift>(props: KlassiskNivatestProps<Q, U>) {
  const router = useRouter()
  const server = props.initialRun?.resolved ? props.initialRun.session : null
  const [data, setData] = useState<Laddat<Q> | null>(() => {
    const fragor = server ? props.lasFragor(server) : undefined
    if (!server || server.completedAt || !fragor?.length) return null
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
      const fragor = r.fragor as unknown as Q[]
      setData({ fragor, sparade: sparadeSvar(fragor, r.sparade), startad: r.startad })
    })()
    return () => {
      avbruten = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { ritare } = props
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
    <Nivatest<U>
      ritare={ritare}
      bas={{ test_kind: ritare.kind, lage: 'nivatest', niva: props.level, format: null }}
      undertitel={undertitel}
      sessionId={props.sessionId}
      uppgifter={data.fragor.map(props.tillU)}
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
