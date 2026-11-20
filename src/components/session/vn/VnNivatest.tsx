'use client'

/**
 * Nivåtestet i Ord och text och Siffror och tabeller i ramen
 * (plan-testflode-2026-11-20 etapp 2), alla nivåer inklusive expert.
 * Ersatte VerbalTestSession, VerbalExpertSession och NumericalTestSession i
 * TestRunner (raderade i etapp 5).
 *
 * Uppgifterna kommer från servern utan facit (getRunData, eller session-
 * routens reservväg), så att frågebankerna lämnar klientpaketet. Urvalet
 * är detsamma som förut. Ett påstående eller en fråga i taget, underlaget
 * fäst, fri navigering, mjuk gräns på provets tid ur config. Svaren postas
 * på samma rutter med samma kroppar (api.ts).
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RunData } from '@/app/dashboard/tester/[slug]/getRunData'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { sparadeVnSvar, vnIndex, type VnNivatestInnehall } from '@/lib/tester/vn-nivatest'
import Nivatest from '../lagen/Nivatest'
import SessionsRam from '../SessionsRam'
import { ForsokIgen, Meddelande } from '../lagen/gemensamt'
import { tillVnU, vnRitare, type VnU } from '../typer/Vn'
import { SESSION } from '../copy'
import { vnNivatestApi, vnSvarsform } from './api'

export type VnNiva = 'grund' | 'avancerad' | 'expert'

export interface VnNivatestProps {
  kind: 'verbal' | 'numerisk'
  sessionId: string
  slug: string
  level: VnNiva
  minuter: number
  answerEndpoint: string
  completeEndpoint: string
  sessionEndpoint: string
  resultsPath: (sessionId: string) => string
  initialRun?: RunData
}

interface Laddat {
  innehall: VnNivatestInnehall
  sparade: unknown
  startad: string | null
}

export function vnUppgifter(kind: 'verbal' | 'numerisk', innehall: VnNivatestInnehall): VnU[] {
  return innehall.uppgifter.flatMap((u) => {
    const ul = innehall.underlag[u.del]
    return ul ? [tillVnU(kind, u, ul)] : []
  })
}

export default function VnNivatest(props: VnNivatestProps) {
  const router = useRouter()
  const ritare = vnRitare(props.kind)
  const server = props.initialRun?.resolved ? props.initialRun.session : null
  const [data, setData] = useState<Laddat | null>(() => {
    if (!server || server.completedAt || !server.vn?.uppgifter.length) return null
    return { innehall: server.vn, sparade: server.answers, startad: server.startedAt ?? null }
  })
  const [fel, setFel] = useState(false)
  const api = vnNivatestApi({ ...props, form: vnSvarsform(props.slug) })

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
      if (r.avslutad || !r.innehall) return router.replace(props.resultsPath(props.sessionId))
      setData({ innehall: r.innehall, sparade: r.sparade, startad: r.startad })
    })()
    return () => {
      avbruten = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const uppgifter = useMemo(() => (data ? vnUppgifter(props.kind, data.innehall) : []), [data, props.kind])
  const sparade = useMemo(() => {
    if (!data) return []
    const s = sparadeVnSvar(data.sparade, data.innehall.uppgifter)
    return uppgifter.map((u) => vnIndex(u, s.get(u.nyckel)?.varde))
  }, [data, uppgifter])

  const undertitel = SESSION.undertitel('nivatest', props.level)
  if (!data || !uppgifter.length) {
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
    <Nivatest<VnU>
      ritare={ritare}
      bas={{ test_kind: props.kind, lage: 'nivatest', niva: props.level, format: null }}
      undertitel={undertitel}
      sessionId={props.sessionId}
      uppgifter={uppgifter}
      sparade={sparade}
      startad={data.startad}
      budgetS={props.minuter * 60}
      skicka={(u, index, sekunder) => {
        const varde = u.alternativ[index]?.id
        return varde ? api.svara(u, varde, sekunder) : Promise.resolve(true)
      }}
      lamnaIn={api.lamnaIn}
      efterInlamning={() => router.push(props.resultsPath(props.sessionId))}
      avbrytHref={testPaths.hub(props.slug)}
    />
  )
}
