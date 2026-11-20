'use client'

/**
 * Nivåtestets resultat i talserier, spatial förmåga och ordförråd i ramens
 * resultatskärm (plan-testflode-2026-11-20 avsnitt 4.2, etapp 4).
 * TestResultsPage räknar som förut (analysen från servern, test_completed,
 * statusraden med köpet) och lämnar ritningen hit. "Gå igenom" öppnar
 * genomgången i ramen, samma vy som testet (Steg2Review raderades i etapp 5).
 */

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import Resultatskarm, { type ResultatTal } from '../Resultatskarm'
import Genomgang, { type GenomgangPost } from '../lagen/Genomgang'
import { steg2Facit, steg2Ritare, Steg2Miniatyrer, tillSteg2U, type Steg2U } from '../typer/Steg2'
import { SESSION, type NivaNamn } from '../copy'

interface Svar {
  q_id?: string
  selected?: number
  visat?: number
  correct?: boolean
  time_spent?: number
}

export interface Steg2NivatestResultatProps {
  kind: Steg2Kind
  niva: NivaNamn
  hubHref: string
  datum: string | null
  eyebrow: string
  ratt: number
  totalt: number
  tal: ResultatTal[]
  mening: string | null
  /** Serverns genomgång i visad ordning (motor.innehall(row).genomgang). */
  genomgang: unknown[]
  answers: unknown
  sessionId: string
  genomgangText: string | null
  tappadeKort: ReactNode
  tempoKort: ReactNode
  status: ReactNode
  nasta: { titel: string; text?: string | null; knapp: string; href: string }
  motion: boolean
}

export function steg2NivatestPoster(kind: Steg2Kind, genomgang: unknown[], answers: unknown): GenomgangPost<Steg2U>[] {
  const lista = (Array.isArray(answers) ? answers : []) as Svar[]
  return (genomgang as { id: string }[]).map((g) => {
    const a = lista.find((x) => x && x.q_id === g.id)
    const valt = visatForSvar(a ?? null)
    return {
      u: tillSteg2U(kind, g, g.id),
      valt,
      facit: steg2Facit(kind, g, valt, typeof a?.correct === 'boolean' ? a.correct : undefined),
      tid_s: typeof a?.time_spent === 'number' ? a.time_spent : null,
    }
  })
}

export default function Steg2NivatestResultat(p: Steg2NivatestResultatProps) {
  const router = useRouter()
  const [genomgang, setGenomgang] = useState<number | null>(null)
  const ritare = steg2Ritare(p.kind)
  const poster = steg2NivatestPoster(p.kind, p.genomgang, p.answers)
  const missar = poster.map((x, i) => ({ ...x, i })).filter((x) => !x.facit.correct)
  const undertitel = SESSION.undertitel('nivatest', p.niva)

  if (genomgang !== null && poster.length) {
    return (
      <Genomgang
        ritare={ritare}
        lage="nivatest"
        titel={ritare.namn}
        poster={poster}
        start={genomgang}
        budgetPerUppgift={null}
        sessionId={p.sessionId}
        onStang={() => setGenomgang(null)}
      />
    )
  }

  return (
    <Resultatskarm
      lage="nivatest"
      titel={ritare.namn}
      undertitel={undertitel}
      datum={p.datum}
      eyebrow={p.eyebrow}
      onStang={() => router.push(p.hubHref)}
      ring={{ andel: p.totalt ? p.ratt / p.totalt : 0, aria: SESSION.resultat.ringAria(p.ratt, p.totalt) }}
      huvudtal={SESSION.resultat.rattAv(p.ratt, p.totalt)}
      tal={p.tal}
      mening={p.mening}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: p.genomgangText,
        miniatyrer: <Steg2Miniatyrer poster={missar.map((m) => m.u)} />,
        onGaIgenom: () => setGenomgang(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < poster.length ? () => setGenomgang(0) : null,
      }}
      tappadeKort={p.tappadeKort}
      tempoKort={p.tempoKort}
      nastaSteg={{ titel: p.nasta.titel, text: p.nasta.text, knapp: { text: p.nasta.knapp, href: p.nasta.href, data: 'nasta-niva' } }}
      status={p.status}
      tillbakaHref={TRANING_RUTT.alla}
      motion={p.motion}
    />
  )
}
