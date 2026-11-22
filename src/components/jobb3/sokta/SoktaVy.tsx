'use client'

/**
 * Sökta tjänster (etapp 2B; skisserna Sokta, Mobil-sokta, Sokta-statistik,
 * Sokta-rapport, Mobil-logga). Datan kommer färdig från page.tsx
 * (hamtaSoktaTjanster). Vy och filter läses ur adressen (F8) och byts med
 * history.pushState, så att bakåtknappen fungerar utan en ny serverrunda.
 * Efter en ändring hämtas sidans data om med router.refresh().
 */

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { rensaSoktUtkast, soktUtkastSomForifyllt } from '@/lib/jobbsok/provaSokt'
import { lasForifyllning, rensaForifyllning } from '@/lib/jobbsok/forifyllning'
import LoggaArk, { type LoggaForifyllt, type LoggaResultat } from './LoggaArk'
import { MalArk } from './SmaArk'
import { ListaVagg, ListaGolv } from './Lista'
import { StatistikVagg, StatistikGolv } from './Statistik'
import { RapportVagg, RapportGolv } from './Rapport'

export default function SoktaVy({ data }: { data: SoktaTjansterData }) {
  const router = useRouter()
  const sok = useSearchParams()
  const adress = tolkaSoktaAdress(new URLSearchParams(sok.toString()))
  const { successWithActivity, success, logActivity } = useNotification()
  const { refresh: refreshSummering } = useDashboardData()

  // Varifrån sidan öppnades (?fran=), läst en gång vid montering: arket rensar adressen när det stängs (9.16).
  const [fran] = useState<string | null>(() => sok.get('fran')?.trim().slice(0, 40) || null)
  // Kvittensen efter testvägen (9.16), bara i samma besök. Sidan monteras om
  // när adressen rensas (sökparametrarna ingår i sidans nyckel), så kvittensen
  // följer med över bytet i KVITTENS_EFTER_BYTET.
  const [kvittens, setKvittens] = useState<TestKvittens | null>(() => KVITTENS_EFTER_BYTET.k)
  useEffect(() => {
    KVITTENS_EFTER_BYTET.k = null
  }, [])
  // Adressen är redan på väg att rensas: arket anropar onKlar och sedan onClose.
  const rensad = useRef(false)

  const [loggaOppen, setLoggaOppen] = useState(false)
  const [loggaForifyllt, setLoggaForifyllt] = useState<LoggaForifyllt | null>(null)
  const [malOppen, setMalOppen] = useState(false)

  // ?logga=1 (och ?logga=ska-soka) öppnar arket. Förifyllningen läses ur
  // webbläsaren, aldrig ur adressen (beslut-agarpunkter D-13): först den som en
  // annan vy i kontot lade dit (testernas Hem, forifyllning.ts), annars utkastet
  // från /verktyg/sokta-tjanster, om besökaren loggade in i stället för att
  // skapa konto (publikt omgång 3). Utkastet tas bort när det är använt,
  // förifyllningen när arket stängs.
  useEffect(() => {
    if (!adress.logga) return
    // Bara den förifyllning som hör till länken: samma ?fran= som när den lades dit.
    const lagrad = lasForifyllning()
    const forifyllt = lagrad && (lagrad.fran ?? null) === fran ? lagrad : null
    const utkast = forifyllt ? null : soktUtkastSomForifyllt()
    if (utkast) {
      rensaSoktUtkast()
      setLoggaForifyllt({ ...utkast, fran: 'publikt-sokta' })
      setLoggaOppen(true)
      return
    }
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
   * Tar bort ?logga=1 och förifyllningen ur adressen med router.replace, som
   * byter adress och hämtar sidan om från servern i samma steg. Aldrig
   * window.history.replaceState här: Next behåller då sidans gamla träd (med
   * ?logga=… i nyckeln) under den nya adressen, och en router.refresh() efteråt
   * hämtades men lades aldrig in, så listan stod kvar med gamla data (felet
   * efter klicktestet 2026-11-21, uppmätt i webbläsaren 2026-11-22).
   * Svarar true när adressen byts; då behövs ingen router.refresh().
   */
  const rensaAdress = (): boolean => {
    if (rensad.current || !new URLSearchParams(window.location.search).has('logga')) return false
    rensad.current = true
    router.replace(soktaHref({ vy: adress.vy, filter: adress.filter }), { scroll: false })
    return true
  }

  const stangLogga = () => {
    setLoggaOppen(false)
    rensaForifyllning()
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
      const k = { id: r.data.id, company: r.data.company, kallad: r.data.current_status === 'test_invited' }
      setKvittens(k)
      KVITTENS_EFTER_BYTET.k = k
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
    // Med ?logga=1 i adressen hämtar bytet av adress sidan om; annars en vanlig uppdatering.
    if (!rensaAdress()) router.refresh()
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

/** Kvittensen över ombytet av sida efter sparandet. Bara i klientens minne, så den försvinner vid omladdning. */
export const KVITTENS_EFTER_BYTET: { k: TestKvittens | null } = { k: null }

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

