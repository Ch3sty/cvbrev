'use client'

/**
 * Nivåtestets resultat i ramens resultatskärm för typerna i etapp 3
 * (plan-testflode-2026-11-20 avsnitt 4.2): Figurer och mönster och Deduktiv
 * slutledning. TestResultsPage räknar som förut (analysen från servern,
 * test_completed, statusraden med köpet) och lämnar ritningen hit. "Gå
 * igenom" öppnar genomgången i samma ram som testet.
 */

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import Resultatskarm, { type ResultatTal } from '../Resultatskarm'
import Genomgang, { type GenomgangKalla, type GenomgangPost } from '../lagen/Genomgang'
import type { RamUppgift, TypRitare } from '../typ'
import { SESSION, type NivaNamn } from '../copy'

export interface KlassiskNivatestResultatProps<U extends RamUppgift> {
  ritare: TypRitare<U>
  niva: NivaNamn
  hubHref: string
  datum: string | null
  eyebrow: string
  ratt: number
  totalt: number
  tal: ResultatTal[]
  mening: string | null
  poster: GenomgangPost<U>[]
  /** Missarna som små bilder (matrisen); utelämnas för texttyper. */
  miniatyrer?: (missar: GenomgangPost<U>[]) => ReactNode
  genomgangText: string | null
  tappadeKort: ReactNode
  tempoKort: ReactNode
  status: ReactNode
  nasta: { titel: string; text?: string | null; knapp: string; href: string }
  motion: boolean
}

export default function KlassiskNivatestResultat<U extends RamUppgift>(p: KlassiskNivatestResultatProps<U>) {
  const router = useRouter()
  const [genomgang, setGenomgang] = useState<number | null>(null)
  const [kalla, setKalla] = useState<GenomgangKalla>('ga_igenom')
  const { poster, ritare } = p
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
        sessionId={null}
        kalla={kalla}
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
        titel: SESSION.resultat.genomgangTitel(poster.length ? missar.length : 0),
        text: p.genomgangText,
        miniatyrer: p.miniatyrer ? p.miniatyrer(missar) : null,
        lista: poster.length ? { ritare: ritare, lage: 'nivatest', poster, sessionId: null, onOppna: (i: number) => (setKalla('rad'), setGenomgang(i)) } : null,
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
