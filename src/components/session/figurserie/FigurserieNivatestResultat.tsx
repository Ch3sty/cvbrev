'use client'

/**
 * Nivåtestets resultat för figurserier i ramens resultatskärm
 * (plan-testflode-2026-11-20 avsnitt 4.2, etapp 1). TestResultsPage räknar
 * som förut (analysen från servern, test_completed, statusraden med köpet)
 * och lämnar ritningen hit. "Gå igenom" öppnar genomgången i ramen.
 */

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import type { GenomgangSerie } from '@/lib/figurserierV1/types'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import Resultatskarm, { type ResultatTal } from '../Resultatskarm'
import Genomgang, { type GenomgangKalla, type GenomgangPost } from '../lagen/Genomgang'
import { FIGURSERIE, type FigurserieU } from '../typer/Figurserie'
import { SESSION, type NivaNamn } from '../copy'
import { tillFigurserieU } from './FigurserieNivatest'
import { Miniatyrer } from './delar'

interface Svar {
  q_id?: string
  selected?: number
  visat?: number
  time_spent?: number
}

export interface FigurserieNivatestResultatProps {
  niva: NivaNamn
  hubHref: string
  datum: string | null
  eyebrow: string
  ratt: number
  totalt: number
  tal: ResultatTal[]
  mening: string | null
  serie: GenomgangSerie[]
  answers: unknown
  /** Genomgångens text: regeln för typen och raden om samma familj. */
  genomgangText: string | null
  tappadeKort: ReactNode
  tempoKort: ReactNode
  status: ReactNode
  nasta: { titel: string; text?: string | null; knapp: string; href: string }
  motion: boolean
}

export function nivatestPoster(serie: GenomgangSerie[], answers: unknown): GenomgangPost<FigurserieU>[] {
  const lista = (Array.isArray(answers) ? answers : []) as Svar[]
  return serie.map((q) => {
    const a = lista.find((x) => x && x.q_id === q.id)
    const valt = visatForSvar(a ?? null)
    return {
      u: tillFigurserieU(q),
      valt,
      facit: { ratt: q.rattVisat, correct: valt === q.rattVisat, regel: q.rule, misstag: valt != null ? q.misstag[valt] || null : null },
      tid_s: typeof a?.time_spent === 'number' ? a.time_spent : null,
    }
  })
}

export default function FigurserieNivatestResultat(p: FigurserieNivatestResultatProps) {
  const router = useRouter()
  const [genomgang, setGenomgang] = useState<number | null>(null)
  const [kalla, setKalla] = useState<GenomgangKalla>('ga_igenom')
  const poster = nivatestPoster(p.serie, p.answers)
  const missar = poster.map((x, i) => ({ ...x, i })).filter((x) => !x.facit.correct)
  const undertitel = SESSION.undertitel('nivatest', p.niva)

  if (genomgang !== null && poster.length) {
    return (
      <Genomgang
        ritare={FIGURSERIE}
        lage="nivatest"
        titel={FIGURSERIE.namn}
        poster={poster}
        start={genomgang}
        budgetPerUppgift={null}
        sessionId={null}
        kalla={kalla}
        onStang={() => setGenomgang(null)}
      />
    )
  }

  return (
    <Resultatskarm
      lage="nivatest"
      titel={FIGURSERIE.namn}
      undertitel={undertitel}
      datum={p.datum}
      eyebrow={p.eyebrow}
      onStang={() => router.push(p.hubHref)}
      ring={{ andel: p.totalt ? p.ratt / p.totalt : 0, aria: SESSION.resultat.ringAria(p.ratt, p.totalt) }}
      huvudtal={SESSION.resultat.rattAv(p.ratt, p.totalt)}
      tal={p.tal}
      mening={p.mening}
      genomgang={{
        titel: poster.length ? SESSION.resultat.genomgangTitel(missar.length) : SESSION.resultat.genomgangTitel(0),
        text: p.genomgangText,
        miniatyrer: <Miniatyrer poster={missar.map((m) => ({ u: m.u, ratt: m.facit.ratt }))} />,
        lista: poster.length ? { ritare: FIGURSERIE, lage: 'nivatest', poster, sessionId: null, onOppna: (i: number) => (setKalla('rad'), setGenomgang(i)) } : null,
        onGaIgenom: () => (setKalla('ga_igenom'), setGenomgang(missar[0]?.i ?? 0)),
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
