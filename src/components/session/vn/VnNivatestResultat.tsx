'use client'

/**
 * Nivåtestets resultat i Ord och text och Siffror och tabeller i ramens
 * resultatskärm (plan-testflode-2026-11-20 avsnitt 4.2, etapp 2).
 * TestResultsPage räknar som förut (analysen från servern, test_completed,
 * statusraden med köpet) och lämnar ritningen hit. "Gå igenom" öppnar
 * genomgången i ramen, med underlaget fäst som under testet.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { VnNivatestGenomgang } from '@/lib/tester/vn-nivatest'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import Resultatskarm, { type ResultatTal } from '../Resultatskarm'
import Genomgang from '../lagen/Genomgang'
import { vnRitare } from '../typer/Vn'
import { SESSION, type NivaNamn } from '../copy'
import { vnGenomgangPoster, VnMissar } from './delar'

export interface VnNivatestResultatProps {
  kind: 'verbal' | 'numerisk'
  niva: NivaNamn
  hubHref: string
  datum: string | null
  eyebrow: string
  ratt: number
  totalt: number
  tal: ResultatTal[]
  mening: string | null
  genomgang: VnNivatestGenomgang
  genomgangText: string | null
  tappadeKort: ReactNode
  tempoKort: ReactNode
  status: ReactNode
  nasta: { titel: string; text?: string | null; knapp: string; href: string }
  motion: boolean
}

export default function VnNivatestResultat(p: VnNivatestResultatProps) {
  const router = useRouter()
  const ritare = vnRitare(p.kind)
  const [fran, setFran] = useState<number | null>(null)
  const poster = useMemo(() => vnGenomgangPoster(p.kind, p.genomgang), [p.kind, p.genomgang])
  const missar = poster.map((x, i) => ({ ...x, i })).filter((x) => !x.facit.correct)
  const undertitel = SESSION.undertitel('nivatest', p.niva)

  if (fran !== null && poster.length) {
    return (
      <Genomgang
        ritare={ritare}
        lage="nivatest"
        titel={ritare.namn}
        poster={poster}
        start={fran}
        budgetPerUppgift={null}
        sessionId={null}
        onStang={() => setFran(null)}
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
        miniatyrer: <VnMissar poster={missar.map((m) => ({ nr: m.i + 1, u: m.u }))} />,
        onGaIgenom: () => setFran(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < poster.length ? () => setFran(0) : null,
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
