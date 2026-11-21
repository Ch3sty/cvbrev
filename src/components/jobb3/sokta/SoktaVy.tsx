'use client'

/**
 * Sökta tjänster (etapp 2B; skisserna Sokta, Mobil-sokta, Sokta-statistik,
 * Sokta-rapport, Mobil-logga). Datan kommer färdig från page.tsx
 * (hamtaSoktaTjanster). Vy och filter läses ur adressen (F8) och byts med
 * history.pushState, så att bakåtknappen fungerar utan en ny serverrunda.
 * Efter en ändring hämtas sidans data om med router.refresh().
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Topprad from '@/components/rum/Topprad'
import { useNotification } from '@/context/notificationcontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import {
  JobbVagg,
  GlasKnapp,
  LitenKnapp,
  Vaxel,
  IkonPlus,
} from '@/components/jobb3/kit'
import { soktaHref, tolkaSoktaAdress, type SoktaFilter, type SoktaVy as Vy } from '@/lib/jobbsok'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'
import LoggaArk, { type LoggaForifyllt, type LoggaResultat } from './LoggaArk'
import { MalArk } from './SmaArk'
import { ListaVagg, ListaGolv } from './Lista'
import { StatistikVagg, StatistikGolv } from './Statistik'
import { RapportVagg, RapportGolv } from './Rapport'

export default function SoktaVy({ data, forifyllt }: { data: SoktaTjansterData; forifyllt: LoggaForifyllt | null }) {
  const router = useRouter()
  const sok = useSearchParams()
  const adress = tolkaSoktaAdress(new URLSearchParams(sok.toString()))
  const { successWithActivity, success } = useNotification()
  const { refresh: refreshSummering } = useDashboardData()

  const [loggaOppen, setLoggaOppen] = useState(false)
  const [loggaForifyllt, setLoggaForifyllt] = useState<LoggaForifyllt | null>(null)
  const [malOppen, setMalOppen] = useState(false)

  // ?logga=1 (och ?logga=ska-soka) öppnar arket, förifyllt om adressen bär en träff.
  useEffect(() => {
    if (!adress.logga) return
    setLoggaForifyllt({ ...(forifyllt ?? {}), lage: adress.logga })
    setLoggaOppen(true)
    // Bara när adressen ändras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adress.logga])

  const ga = useCallback((a: { vy?: Vy; filter?: SoktaFilter }) => {
    const href = soktaHref({ vy: a.vy ?? adress.vy, filter: (a.vy ?? adress.vy) === 'lista' ? a.filter ?? adress.filter : undefined })
    window.history.pushState(null, '', href)
  }, [adress.vy, adress.filter])

  const stangLogga = () => {
    setLoggaOppen(false)
    if (adress.logga) {
      window.history.replaceState(null, '', soktaHref({ vy: adress.vy, filter: adress.filter }))
    }
  }

  const oppnaLogga = (f: LoggaForifyllt | null = null) => {
    setLoggaForifyllt(f)
    setLoggaOppen(true)
  }

  const loggad = (r: LoggaResultat) => {
    if (r.typ === 'sokt') {
      successWithActivity(
        'Sparad i Sökta tjänster.',
        'application_logged',
        `Loggade en sökt tjänst: ${r.data.job_title} hos ${r.data.company}`,
        { applicationId: r.data.id, channel: r.data.application_channel },
        3000
      )
    } else if (r.typ === 'sparad') {
      success('Sparad under Ska sökas.', 3000)
    }
    router.refresh()
    // Kom igång-brickan "Logga en tjänst du har sökt": summeringen ligger i
    // klientens DashboardDataContext och läses inte om av router.refresh().
    void refreshSummering()
  }

  const vy = adress.vy
  const vaxel = (
    <Vaxel
      etikett="Vy"
      valt={vy}
      onVal={(v) => ga({ vy: v as Vy })}
      val={[
        { id: 'lista', text: 'Lista' },
        { id: 'statistik', text: 'Statistik' },
        { id: 'rapport', text: 'Rapport' },
      ]}
    />
  )

  const logga = (
    <GlasKnapp onClick={() => oppnaLogga()} ikon={<IkonPlus />}>
      Logga sökt tjänst
    </GlasKnapp>
  )

  const hojd = vy === 'lista' ? 486 : 432
  const hojdMobil = vy === 'lista' ? 336 : 300

  return (
    <>
      <JobbVagg hojd={hojd} hojdMobil={hojdMobil} flik="sokta" handling={logga} atgarder={<Topprad bara="atgarder" />} etikett="Sökta tjänster">
        {vy === 'lista' ? <ListaVagg data={data} onAndraMal={() => setMalOppen(true)} /> : null}
        {vy === 'statistik' ? <StatistikVagg data={data} /> : null}
        {vy === 'rapport' ? <RapportVagg data={data} /> : null}
      </JobbVagg>

      {vy === 'lista' ? (
        <ListaGolv data={data} filter={adress.filter} vaxel={vaxel} onFilter={(f) => ga({ filter: f })} onLogga={oppnaLogga} onRefresh={() => router.refresh()} />
      ) : vy === 'statistik' ? (
        <StatistikGolv data={data} vaxel={vaxel} onAndraMal={() => setMalOppen(true)} onLogga={() => oppnaLogga()} />
      ) : (
        <RapportGolv data={data} vaxel={vaxel} onLogga={() => oppnaLogga()} />
      )}

      {/* Telefon: Logga sökt tjänst står sist på sidan, inte i en fast fot (beslut efter etapp 1). */}
      <div className="mx-auto mt-8 w-full max-w-[1120px] px-4 pb-10 sm:px-6 xl:hidden">
        <LitenKnapp storlek={52} bred onClick={() => oppnaLogga()} ikon={<IkonPlus size={20} />}>
          Logga sökt tjänst
        </LitenKnapp>
      </div>

      <LoggaArk open={loggaOppen} onClose={stangLogga} onKlar={loggad} forifyllt={loggaForifyllt} />
      <MalArk open={malOppen} onClose={() => setMalOppen(false)} mal={data.veckansMal.mal} onSparat={() => router.refresh()} />
    </>
  )
}

