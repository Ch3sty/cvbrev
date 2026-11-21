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
  Notis,
  TextLank,
  Vaxel,
  IkonBock,
  IkonPlus,
} from '@/components/jobb3/kit'
import { soktaHref, tjanstHref, tolkaSoktaAdress, type SoktaFilter, type SoktaVy as Vy } from '@/lib/jobbsok'
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
  const { successWithActivity, success, logActivity } = useNotification()
  const { refresh: refreshSummering } = useDashboardData()

  // Varifrån sidan öppnades (?fran=), läst en gång vid montering: arket rensar adressen när det stängs (9.16).
  const [fran] = useState<string | null>(() => sok.get('fran')?.trim().slice(0, 40) || null)
  // Kvittensen efter testvägen (9.16), bara i samma besök.
  const [kvittens, setKvittens] = useState<TestKvittens | null>(null)

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

  /**
   * Tar bort ?logga=1 och förifyllningen ur adressen. Läser window.location och
   * inte adress, så att ett andra anrop i samma ritning inte rensar igen.
   * window.history.replaceState blir en ACTION_RESTORE i Next:s router, och en
   * sådan kastar en router.refresh() som redan är på väg. Därför rensas adressen
   * före uppdateringen, aldrig efter (felet efter klicktestet 2026-11-21).
   */
  const rensaAdress = () => {
    if (!new URLSearchParams(window.location.search).has('logga')) return
    window.history.replaceState(null, '', soktaHref({ vy: adress.vy, filter: adress.filter }))
  }

  const stangLogga = () => {
    setLoggaOppen(false)
    rensaAdress()
  }

  const oppnaLogga = (f: LoggaForifyllt | null = null) => {
    setLoggaForifyllt(f)
    setLoggaOppen(true)
  }

  const loggad = (r: LoggaResultat) => {
    if (r.typ === 'sokt' && fran?.startsWith('test-hem')) {
      // Testvägen: kvittensen överst i panelen i stället för toasten.
      void logActivity('application_logged', `Loggade en sökt tjänst: ${r.data.job_title} hos ${r.data.company}`, {
        applicationId: r.data.id,
        channel: r.data.application_channel,
        fran,
      })
      setKvittens({ id: r.data.id, company: r.data.company, kallad: r.data.current_status === 'test_invited' })
    } else if (r.typ === 'sokt') {
      successWithActivity(
        'Sparad i Sökta tjänster.',
        'application_logged',
        `Loggade en sökt tjänst: ${r.data.job_title} hos ${r.data.company}`,
        { applicationId: r.data.id, channel: r.data.application_channel, ...(fran ? { fran } : {}) },
        3000
      )
    } else if (r.typ === 'sparad') {
      success('Sparad under Ska sökas.', 3000)
    }
    // Adressen först: arket stänger sig efter onKlar, och rensningen då hade kastat uppdateringen.
    rensaAdress()
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
        <ListaGolv
          data={data}
          filter={adress.filter}
          vaxel={vaxel}
          kvittens={kvittens ? <TestvagKvittens k={kvittens} /> : null}
          onFilter={(f) => ga({ filter: f })}
          onLogga={oppnaLogga}
          onRefresh={() => router.refresh()}
        />
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

export interface TestKvittens {
  id: string
  company: string
  /** Servern skrev "Kallad till test" (svaret bar current_status test_invited). */
  kallad: boolean
}

/** Kvittensens texter (9.16). */
export function testvagKvittensText(k: Pick<TestKvittens, 'company' | 'kallad'>): { rubrik: string; text: string } {
  return k.kallad
    ? {
        rubrik: `${k.company} står nu som kallad till test`,
        text: 'Arbetsgivaren har hört av sig, så vi föreslår ingen uppföljning. Lägg till intervjun eller beskedet när det kommer. Datumet du sökte står i din månadsrapport.',
      }
    : {
        rubrik: `${k.company} ligger nu under Sökt`,
        text: 'Vi säger till om det är tyst efter tolv dagar. Datumet du sökte står i din månadsrapport.',
      }
}

/** Vägen tillbaka till testernas Hem; sidvisningen bär fran=sokta-loggad (9.17). */
export const TILLBAKA_TILL_TESTERNA = '/dashboard/tester?fran=sokta-loggad'

/** Kvittensen efter testvägen, överst i panelen. Försvinner när sidan laddas om. */
export function TestvagKvittens({ k }: { k: TestKvittens }) {
  const { rubrik, text } = testvagKvittensText(k)
  return (
    <Notis
      ton="ton"
      role="status"
      ikon={<IkonBock />}
      rubrik={rubrik}
      text={text}
      handling={
        <>
          <LitenKnapp href={TILLBAKA_TILL_TESTERNA}>Tillbaka till testerna</LitenKnapp>
          <TextLank href={tjanstHref(k.id)}>Öppna tjänsten</TextLank>
        </>
      }
    />
  )
}

