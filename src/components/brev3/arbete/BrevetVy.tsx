'use client'

/**
 * Brevet (/dashboard/mina-brev/[id]): läs, ändra och skicka (skissen
 * Brevet-1440 och Mobil-brevet).
 *
 * Texten är källan: styckena, hälsningen, företaget, tjänsten, mottagaren
 * och typsnittet hålls här och sparas av sig själva (useBrevAutospar, cirka
 * en sekund efter senaste ändringen). Arket ritas om direkt i klienten med
 * samma renderare som servern (ritare.ts), så att det följer texten medan
 * man skriver utan att något blinkar och utan AI. Servern räknar om content
 * vid varje sparning; arket behåller sin klientritning, som är densamma
 * plus kravens markeringar och det aktiva stycket.
 *
 * Gamla brev utan mall_id visar sin sparade HTML tills första ändringen;
 * då flyttar servern dem till brevmallen och arket ritas härifrån.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ArbetsYta,
  ArbetsHuvud,
  MallKapsel,
  Blad,
  LitenKnapp,
  StorKnapp,
  BrevSparrLaddare,
  IkonBock,
  IkonFlagga,
  IkonKopiera,
  IkonLaddaNer,
  IkonPenna,
  type Sparstatus,
} from '@/components/brev3/kit'
import { BrevMiniatyr } from '@/components/brev3/ark'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import { useBrevAutospar } from '@/hooks/use-letters'
import { useLetterStore, BrevFel, type Letter } from '@/store/letter-store'
import { useNotification } from '@/context/notificationcontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { capture } from '@/lib/analytics/events'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import type { BrevData, BrevKrav } from '@/lib/letters/brevmall/typer'
import { brevMallKort } from '@/lib/letters/brevmall/katalog'
import { forvaltStycke, kravMatt, kravMedTraffar, lasSparadeKrav, laggTillMening } from '@/lib/letters/krav'
import { brevSomText, lasSparadeStycken, raknaOrd } from '@/lib/letters/stycken'
import { formatGratisbrevDag } from '@/lib/letters/brevKvot'
import ArbetsRam from './ArbetsRam'
import ArbetsArk from './ArbetsArk'
import { KravFlik, TextFlik, TonFlik, TypsnittFlik, InfoFlik } from './BrevetFlikar'
import { BREVET, type FlikId, type TonId } from './texter'
import { forladdaRitare, ritaBrev } from './ritare'
import { laddaNerBrev } from './ladda'
import { stadaKopreturAdress, useKopretur } from '../kit/kopretur'

const ConfirmDialog = dynamic(() => import('@/components/shell/ConfirmDialog'), { ssr: false })

export type { FlikId }

export interface BrevetBrev {
  id: string
  title: string | null
  company: string | null
  job_title: string | null
  mottagare_person: string | null
  halsning: string | null
  stycken: string[]
  krav: BrevKrav[] | null
  mall_id: string | null
  font_id: string | null
  language: 'sv' | 'en'
  tonality: string | null
  cv_id: string | null
  forberett_at: string | null
}

export interface BrevetVyProps {
  brev: BrevetBrev
  /** Brevets data (avsändaren ur profilen), samma som servern ritade med. */
  data: BrevData
  /** Arket från servern: brevmallen med kravens markeringar, eller ett gammalt brevs HTML. */
  html: string
  /** Gamla mallens namn för brev utan mall_id. */
  gammalMallNamn: string | null
  isLocked: boolean
  harBetalt: boolean
  kanLaddaNer: boolean
  sokt: { id: string; datum: string | null } | null
  kvot: { kvar: number | null; nastaNu: string | null }
  klart: boolean
  /** Tillbaka från kassan (?ladda=1&format=): filen laddas ner en gång, av sig själv. */
  ladda?: 'pdf' | 'docx' | null
  /** ?premium_activated=true: direkt från ett köp, så tillgången väntas in om webhooken ligger efter. */
  kopRetur?: boolean
  flik: FlikId | null
}

type SparrLage = 'nedladdning' | 'vecka' | null

function formatDag(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' }).format(d).replace('.', '')
}

function useDatorSparr(): boolean {
  const [dator, setDator] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1060px)')
    const byt = () => setDator(mq.matches)
    byt()
    mq.addEventListener('change', byt)
    return () => mq.removeEventListener('change', byt)
  }, [])
  return dator
}

export default function BrevetVy(props: BrevetVyProps) {
  const { brev: start, isLocked: last, harBetalt, kanLaddaNer, klart } = props
  const id = start.id
  const router = useRouter()
  const { logActivity } = useNotification()
  const { summary } = useDashboardData()
  const skrivOmBrev = useLetterStore((s) => s.skrivOmBrev)
  const markeraForberett = useLetterStore((s) => s.markeraForberett)
  const laggTillKravMening = useLetterStore((s) => s.laggTillKravMening)
  const deleteLetter = useLetterStore((s) => s.deleteLetter)
  const storeKvot = useLetterStore((s) => s.kvot)

  /* ------------------------------------------------------------ brevets tillstånd */

  const [stycken, setStycken] = useState<string[]>(start.stycken)
  const [halsning, setHalsning] = useState(start.halsning ?? '')
  const [titel, setTitel] = useState(start.title ?? '')
  const [foretag, setForetag] = useState(start.company ?? '')
  const [tjanst, setTjanst] = useState(start.job_title ?? '')
  const [mottagare, setMottagare] = useState(start.mottagare_person ?? '')
  const [fontId, setFontId] = useState<string | null>(start.font_id)
  const [mallId, setMallId] = useState<string | null>(start.mall_id)
  const [krav, setKrav] = useState<BrevKrav[] | null>(start.krav)
  const [sprak, setSprak] = useState<'sv' | 'en'>(start.language)
  const [ton, setTon] = useState<TonId>(() => {
    const t = (start.tonality ?? 'balanced') as TonId
    return t === 'auto' && !harBetalt ? 'balanced' : t
  })
  const [html, setHtml] = useState(props.html)
  const [rort, setRort] = useState(false)

  const kravTraffar = useMemo(() => kravMedTraffar(krav, stycken), [krav, stycken])
  const matt = kravMatt(kravTraffar)

  const [flik, setFlikState] = useState<FlikId>(props.flik ?? (matt ? 'kraven' : 'texten'))
  const [aktivt, setAktivt] = useState<number | null>(null)
  const [fokus, setFokus] = useState<{ i: number; n: number } | null>(null)

  const setFlik = useCallback((f: FlikId) => {
    setFlikState(f)
    // Fliken står i adressen (?flik=) utan att sidan hämtas om från servern.
    const url = new URL(window.location.href)
    url.searchParams.set('flik', f)
    url.searchParams.delete('klart')
    window.history.replaceState(window.history.state, '', url.toString())
  }, [])

  /* ------------------------------------------------------------ "Brevet klart" i tre sekunder */

  const [visaKlart, setVisaKlart] = useState(klart)
  useEffect(() => {
    if (!klart) return
    const t = setTimeout(() => {
      setVisaKlart(false)
      const url = new URL(window.location.href)
      if (url.searchParams.has('klart')) {
        url.searchParams.delete('klart')
        window.history.replaceState(window.history.state, '', url.toString())
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [klart])

  /* ------------------------------------------------------------ autospar */

  const onSparat = useCallback(
    (sparat: Letter) => {
      // Ett gammalt brev har flyttats till brevmallen: arket ritas härifrån nu.
      if (!mallId && sparat.mall_id) {
        setMallId(sparat.mall_id)
        if (sparat.content) setHtml(sparat.content)
      }
    },
    [mallId]
  )
  const { spara, sparaNu, status, fel: sparFel } = useBrevAutospar(last ? null : id, { onSparat })

  const sparstatus: Sparstatus = status === 'fel' ? 'fel' : status === 'sparat' ? 'sparat' : 'sparar'

  /* ------------------------------------------------------------ arket följer texten */

  useEffect(() => {
    if (!last) forladdaRitare()
  }, [last])

  // Avsändaren ur profilen; byts när kontaktuppgifterna sparas i fliken
  // Titel och företag (filen läser profilen på servern, så den följer med).
  const [avsandare, setAvsandare] = useState(props.data.avsandare)
  const data = useMemo<BrevData>(
    () => ({
      ...props.data,
      avsandare,
      mottagare: { foretag: foretag.trim() || null, person: mottagare.trim() || null },
      tjanst: tjanst.trim() || null,
      halsning: halsning.trim() || null,
      stycken,
      sprak,
    }),
    [props.data, avsandare, foretag, mottagare, tjanst, halsning, stycken, sprak]
  )
  const andraKontakt = useCallback((k: { namn: string; epost: string; telefon: string; ort: string }) => {
    setAvsandare((a) => ({ ...a, namn: k.namn || a.namn, epost: k.epost, telefon: k.telefon || null, ort: k.ort || null }))
    setRort(true)
  }, [])

  const visaAktivt = flik === 'texten' ? aktivt : null
  useEffect(() => {
    if (!mallId || (!rort && visaAktivt === null)) return
    let levande = true
    ritaBrev(mallId, data, { typsnitt: fontId, markeringar: kravTraffar ?? undefined, aktivtStycke: visaAktivt })
      .then((h) => levande && setHtml(h))
      .catch(() => {})
    return () => {
      levande = false
    }
  }, [mallId, data, fontId, kravTraffar, visaAktivt, rort])

  /* ------------------------------------------------------------ ändringar */

  const andra = useCallback(() => setRort(true), [])

  const andraStycke = (i: number, v: string) => {
    const nya = stycken.map((s, j) => (j === i ? v : s))
    setStycken(nya)
    andra()
    spara({ stycken: nya })
  }
  const laggTillStycke = () => {
    const nya = [...stycken, '']
    setStycken(nya)
    setAktivt(nya.length - 1)
    setFokus({ i: nya.length - 1, n: Date.now() })
    andra()
  }
  const taBortStycke = (i: number) => {
    const nya = stycken.filter((_, j) => j !== i)
    setStycken(nya)
    setAktivt(null)
    andra()
    spara({ stycken: nya })
  }
  const andraHalsning = (v: string) => {
    setHalsning(v)
    andra()
    spara({ halsning: v.trim() ? v : null })
  }
  const andraInfo = (falt: 'title' | 'company' | 'job_title' | 'mottagare_person', v: string) => {
    if (falt === 'title') setTitel(v)
    if (falt === 'company') setForetag(v)
    if (falt === 'job_title') setTjanst(v)
    if (falt === 'mottagare_person') setMottagare(v)
    if (falt !== 'title') andra()
    spara({ [falt]: v.trim() ? v : null })
  }
  const valjTypsnitt = (f: string | null) => {
    setFontId(f)
    andra()
    spara({ font_id: f })
  }

  const tryckPaArket = (i: number) => {
    setFlik('texten')
    setAktivt(i)
    setFokus({ i, n: Date.now() })
  }

  /* ------------------------------------------------------------ kraven */

  const laggTill = async (kravIndex: number, mening: string): Promise<boolean> => {
    if (!krav) return false
    const lokalt = laggTillMening(stycken, krav, kravIndex, mening)
    if (!lokalt) return false
    await sparaNu()
    const fore = { stycken, krav }
    setStycken(lokalt.stycken)
    setKrav(lokalt.krav)
    andra()
    try {
      const svar = await laggTillKravMening(id, { kravIndex, mening, stycke: lokalt.stycke })
      const st = lasSparadeStycken(svar.body_stycken)
      const kr = lasSparadeKrav(svar.krav)
      if (st) setStycken(st)
      if (kr) setKrav(kr)
      if (!mallId && svar.mall_id) {
        setMallId(svar.mall_id)
        if (svar.content) setHtml(svar.content)
      }
      return true
    } catch {
      setStycken(fore.stycken)
      setKrav(fore.krav)
      return false
    }
  }

  /* ------------------------------------------------------------ omskrivning (ton och språk) */

  const [skriverOm, setSkriverOm] = useState(false)
  const [omFel, setOmFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [sparr, setSparr] = useState<SparrLage>(null)
  const kvar = storeKvot && !storeKvot.harBetalt ? storeKvot.kvar : props.kvot.kvar
  const nastaNu = storeKvot && !storeKvot.harBetalt ? storeKvot.nastaGratisbrev : props.kvot.nastaNu

  const skrivOm = async () => {
    if (last || skriverOm) return
    if (!harBetalt && kvar === 0) {
      setSparr('vecka')
      return
    }
    setOmFel(null)
    setNamnKravs(false)
    setSkriverOm(true)
    try {
      await sparaNu()
      const svar = await skrivOmBrev(id, { tonality: ton, language: sprak })
      const st = lasSparadeStycken(svar.body_stycken)
      if (st) setStycken(st)
      setKrav(lasSparadeKrav(svar.krav))
      setHalsning(svar.halsning ?? '')
      if (svar.mall_id) setMallId(svar.mall_id)
      setSprak(svar.language === 'en' ? 'en' : 'sv')
      setAktivt(null)
      andra()
      void logActivity('letter_created', 'skrev om ett personligt brev', { tonality: ton, language: sprak, omskrivning: true })
    } catch (e) {
      const f = e instanceof BrevFel ? e : null
      if (f?.status === 429 || f?.code === 'quota_exceeded') setSparr('vecka')
      else if (f?.status === 422 || f?.code === 'name_required') setNamnKravs(true)
      else if (f?.code === 'annons_saknas') setOmFel(BREVET.annonsSaknas)
      else if (f?.code === 'cv_saknas') setOmFel(BREVET.cvSaknas)
      else setOmFel(BREVET.skrivOmFel)
    } finally {
      setSkriverOm(false)
    }
  }

  /* ------------------------------------------------------------ foten */

  const [kopierat, setKopierat] = useState<'ja' | 'fel' | null>(null)
  const [laddar, setLaddar] = useState<'pdf' | 'docx' | null>(null)
  const [filFel, setFilFel] = useState(false)
  // Formatet som öppnade nedladdningsspärren följer med köpet tillbaka hit.
  const [sparrFormat, setSparrFormat] = useState<'pdf' | 'docx'>('pdf')

  const kopiera = async () => {
    const text = brevSomText({ halsning: halsning.trim() || null, stycken: stycken.filter((s) => s.trim()), sprak, avsandare: { namn: avsandare.namn } })
    try {
      await navigator.clipboard.writeText(text)
      setKopierat('ja')
      setTimeout(() => setKopierat(null), 2500)
      void markeraForberett(id, 'kopierat').catch(() => {})
    } catch {
      setKopierat('fel')
    }
  }

  const laddaNer = async (format: 'pdf' | 'docx') => {
    if (!kanLaddaNer) {
      setSparrFormat(format)
      setSparr('nedladdning')
      return
    }
    if (laddar) return
    setLaddar(format)
    setFilFel(false)
    try {
      await sparaNu()
      const utfall = await laddaNerBrev(id, format)
      if (utfall === 'sparr') {
        setSparrFormat(format)
        setSparr('nedladdning')
      } else if (utfall === 'namn') setNamnKravs(true)
      else if (utfall === 'fel') setFilFel(true)
    } finally {
      setLaddar(null)
    }
  }

  // Tillbaka från kassan (?ladda=1&format=&premium_activated=true): filen
  // laddas ner en gång. Hinner webhooken inte före returen väntar vi in
  // tillgången med router.refresh (kit/kopretur), som Mallar gör.
  const kop = useKopretur(
    {
      begart: props.ladda ?? null,
      kopRetur: !!props.kopRetur,
      kanLaddaNer,
      formatFinns: props.ladda === 'pdf' || !mallId || !!brevMallKort(mallId)?.word,
    },
    { refresh: () => router.refresh(), laddaNer: (f) => void laddaNer(f), stadaAdress: stadaKopreturAdress },
  )
  // Under väntan visar knappen samma upptagna läge som en vanlig nedladdning.
  const upptagen = laddar ?? (kop.vantar && props.ladda ? props.ladda : null)
  const filFelText = filFel ? BREVET.filFel : kop.ejRegistrerat ? BREVET.kopEjRegistrerat : null

  /* ------------------------------------------------------------ sökt */

  const [sokt, setSokt] = useState(props.sokt)
  const [markerar, setMarkerar] = useState(false)
  const [soktFel, setSoktFel] = useState(false)
  const markeraSokt = async () => {
    if (sokt || markerar) return
    setMarkerar(true)
    setSoktFel(false)
    try {
      await sparaNu()
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: tjanst.trim() || titel.trim() || 'Okänd tjänst',
          company: foretag.trim() || 'Okänd arbetsgivare',
          application_channel: 'ad',
          letter_id: id,
          cv_id: start.cv_id,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !json?.data?.id) throw new Error('fel')
      capture('korsreferens_klick', { fran: 'brev', till: 'jobb', variant: 'spara_sokt' })
      void logActivity('application_logged', `Markerade brevet som sökt: ${json.data.job_title} hos ${json.data.company}`, {
        applicationId: json.data.id,
        letterId: id,
        source: 'letter_view',
      })
      setSokt({ id: json.data.id, datum: json.data.applied_at ?? new Date().toISOString() })
      router.push(`/dashboard/mina-brev/${id}/skickat`)
    } catch {
      setSoktFel(true)
      setMarkerar(false)
    }
  }

  /* ------------------------------------------------------------ ta bort */

  const [taBort, setTaBort] = useState(false)
  const [taBortFel, setTaBortFel] = useState(false)
  const bekraftaTaBort = async () => {
    setTaBortFel(false)
    const ok = await deleteLetter(id)
    if (ok) router.push('/dashboard/mina-brev')
    else {
      setTaBortFel(true)
      setTaBort(false)
    }
  }

  /* ------------------------------------------------------------ längden på arket */

  const [andel, setAndel] = useState(0.6)
  useEffect(() => {
    const t = setTimeout(() => {
      const ark = [...document.querySelectorAll<HTMLElement>('[data-arbetsram] .cv.brev')].find((e) => e.getBoundingClientRect().width > 0)
      const slut = ark?.querySelector<HTMLElement>('.brev-slut')
      if (!ark || !slut) return
      const r = ark.getBoundingClientRect()
      const skala = r.width / (ark.offsetWidth || 1)
      const gransPx = (Number(ark.getAttribute('data-grans')) || 279) * (96 / 25.4) * skala
      setAndel((slut.getBoundingClientRect().top - r.top) / gransPx)
    }, 120)
    return () => clearTimeout(t)
  }, [html])

  /* ------------------------------------------------------------ texterna */

  const mallKort = mallId ? brevMallKort(mallId) : null
  const mallNamn = mallKort?.namn ?? props.gammalMallNamn ?? 'Linne'
  const harWord = mallId ? !!mallKort?.word : true
  const ord = raknaOrd(stycken)
  const kravRad = matt ? BREVET.kravSidoradMobil(matt.medSvar, matt.antal) : null
  const sparText = sparstatus === 'fel' ? 'Kunde inte spara' : sparstatus === 'sparar' ? 'Sparar' : 'Sparat'
  const underradMobil = last ? 'Låst' : [sparText, kravRad ? `${kravRad} krav` : null].filter(Boolean).join(' · ')
  const forstaSaknade = kravTraffar ? kravTraffar.findIndex((k) => !k.citat) : -1
  const saknatKrav = flik === 'kraven' && matt && forstaSaknade >= 0 ? { nr: forstaSaknade + 1, stycke: forvaltStycke(stycken.filter((s) => s.trim()).length) } : null
  const datorSparr = useDatorSparr()

  const sparFelText = sparFel
    ? sparFel.code === 'letter_locked'
      ? BREVET.sparFelLast
      : sparFel.code === 'premium_required'
        ? BREVET.sparFelPremium(PAKETRADER.bricka)
        : BREVET.sparFel
    : null

  /* ------------------------------------------------------------ bladet */

  const bladRubrik: Record<FlikId, string> = {
    kraven: BREVET.kravRubrik,
    texten: BREVET.textRubrik,
    ton: BREVET.tonRubrik,
    typsnitt: BREVET.typsnittRubrik,
    info: BREVET.infoRubrik,
  }
  const sidorad: Record<FlikId, string | undefined> = {
    kraven: matt ? BREVET.kravSidorad(matt.medSvar, matt.antal) : undefined,
    texten: BREVET.textFot,
    ton: BREVET.tonSidorad,
    typsnitt: BREVET.typsnittSidorad,
    info: undefined,
  }

  const flikInnehall = (() => {
    switch (flik) {
      case 'kraven':
        return <KravFlik krav={kravTraffar} antalStycken={stycken.filter((s) => s.trim()).length} last={last} onLaggTill={laggTill} />
      case 'texten':
        return (
          <TextFlik
            halsning={halsning}
            sprak={sprak}
            stycken={stycken}
            aktivt={aktivt}
            last={last}
            ord={ord}
            andel={andel}
            fokusStycke={fokus}
            onHalsning={andraHalsning}
            onStycke={andraStycke}
            onAktivt={setAktivt}
            onLaggTillStycke={laggTillStycke}
            onTaBortStycke={taBortStycke}
          />
        )
      case 'ton':
        return (
          <TonFlik
            ton={ton}
            sprak={sprak}
            harBetalt={harBetalt}
            last={last}
            kvot={{ kvar, nastaDag: nastaNu ? formatGratisbrevDag(nastaNu) : null }}
            skriverOm={skriverOm}
            fel={omFel}
            onTon={setTon}
            onSprak={setSprak}
            onSkrivOm={skrivOm}
          />
        )
      case 'typsnitt':
        return <TypsnittFlik fontId={fontId} mallNamn={mallNamn} harBetalt={harBetalt} last={last} onVal={valjTypsnitt} />
      case 'info':
        return <InfoFlik titel={titel} foretag={foretag} tjanst={tjanst} mottagare={mottagare} last={last} onAndra={andraInfo} onKontakt={andraKontakt} onTaBort={() => setTaBort(true)} />
    }
  })()

  const fotRad = !kanLaddaNer ? (
    <>
      <span className="hidden xl:inline">
        {BREVET.gratisRad} <span className="b3-premium-rad">{PAKETRADER.bricka}</span> {BREVET.gratisRadSlut}
      </span>
      <span className="xl:hidden">{BREVET.gratisRadMobil(PAKETRADER.bricka)}</span>
    </>
  ) : undefined

  const fot = (
    <div className="flex w-full flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-3">
      <span className="contents">
        <StorKnapp lag platt className="xl:order-last xl:ml-auto" onClick={() => laddaNer('pdf')} disabled={upptagen !== null}>
          <IkonLaddaNer />
          {upptagen === 'pdf' ? BREVET.skaparFil : BREVET.pdf}
        </StorKnapp>
      </span>
      <div className="grid grid-cols-2 gap-2.5 xl:contents">
        <LitenKnapp onClick={kopiera}>
          {kopierat === 'ja' ? <IkonBock size={15} strokeWidth={3} /> : <IkonKopiera />}
          {kopierat === 'ja' ? BREVET.kopierad : BREVET.kopiera}
        </LitenKnapp>
        <span className="hidden xl:contents">
          {harWord ? (
            <LitenKnapp onClick={() => laddaNer('docx')} disabled={upptagen !== null}>
              {upptagen === 'docx' ? BREVET.skaparFil : BREVET.word}
            </LitenKnapp>
          ) : (
            <span className="text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">{BREVET.barePdf}</span>
          )}
        </span>
        <span className="contents xl:hidden">
          {sokt ? (
            <LitenKnapp href={`/dashboard/sokta-tjanster/${sokt.id}`}>{BREVET.oppna}</LitenKnapp>
          ) : (
            <LitenKnapp onClick={markeraSokt} disabled={markerar}>
              <IkonFlagga size={16} />
              {markerar ? BREVET.markerar : BREVET.markeraSokt}
            </LitenKnapp>
          )}
        </span>
      </div>
      {harWord && kanLaddaNer ? (
        <span className="xl:hidden">
          <LitenKnapp bred onClick={() => laddaNer('docx')} disabled={upptagen !== null}>
            {upptagen === 'docx' ? BREVET.skaparFil : `${BREVET.word}, .docx`}
          </LitenKnapp>
        </span>
      ) : null}
      {kopierat === 'fel' || filFelText || soktFel ? (
        <p className="m-0 text-[13px] leading-[18px] text-[color:var(--fel)] xl:hidden" role="alert">
          {kopierat === 'fel' ? BREVET.kopieraFel : (filFelText ?? BREVET.soktFel)}
        </p>
      ) : null}
    </div>
  )

  const botten = sokt ? (
    <>
      <span className="b3-sokt-ik" aria-hidden="true">
        <IkonFlagga />
      </span>
      <span className="flex-1 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">{BREVET.soktSedan(formatDag(sokt.datum))}</span>
      <LitenKnapp href={`/dashboard/sokta-tjanster/${sokt.id}`}>{BREVET.oppna}</LitenKnapp>
    </>
  ) : (
    <>
      <span className="b3-sokt-ik" aria-hidden="true">
        <IkonFlagga />
      </span>
      <span className="flex-1 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">
        <b className="block text-[14px] leading-[18px] text-[color:var(--b3-ink)]">{BREVET.harDuSkickat}</b>
        {soktFel ? <span className="text-[color:var(--fel)]">{BREVET.soktFel}</span> : BREVET.harDuSkickatRad}
      </span>
      <LitenKnapp onClick={markeraSokt} disabled={markerar}>
        {markerar ? BREVET.markerar : BREVET.markeraSokt}
      </LitenKnapp>
    </>
  )

  const blad = (
    <Blad
      id="brev-blad"
      rubrik={bladRubrik[flik]}
      sidorad={sidorad[flik]}
      sidoradMobil={flik === 'kraven' && matt ? BREVET.kravSidoradMobil(matt.medSvar, matt.antal) : undefined}
      hojd={752}
      fotRad={fotRad}
      fot={fot}
      botten={<div className="hidden w-full items-center gap-3 xl:flex">{botten}</div>}
    >
      <div className="flex min-h-0 flex-1 flex-col xl:-mx-5 xl:overflow-y-auto xl:px-5">
        {last ? (
          <div className="my-2 flex flex-col gap-2.5 rounded-[16px] border-2 border-[color:var(--b3-prem-kant)] bg-[color:var(--b3-prem)] p-3.5 xl:flex-row xl:items-center">
            <p className="m-0 flex-1 text-[14px] leading-[20px] text-[color:var(--b3-prem-text)]">{BREVET.lastRad}</p>
            <LitenKnapp kop href={kopstegHref(SALD_PLAN, 'kvot', { retur: `/dashboard/mina-brev/${id}?flik=texten` })}>
              {PAKETRADER.kopCv}
            </LitenKnapp>
          </div>
        ) : null}
        {!mallId && !last ? <p className="m-0 my-2 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">{BREVET.gammaltBrev}</p> : null}
        {sparFelText ? (
          <div role="alert" className="my-2 flex items-center gap-3 rounded-[14px] border-2 border-[color:var(--fel)] px-3 py-2 text-[13px] leading-[18px]">
            <span className="flex-1">{sparFelText}</span>
            {sparFel?.code !== 'letter_locked' && sparFel?.code !== 'premium_required' ? <LitenKnapp onClick={() => void sparaNu()}>Försök igen</LitenKnapp> : null}
          </div>
        ) : null}
        {namnKravs ? (
          <NameRequiredNotice
            className="my-2"
            rubrik="Vilket namn ska stå under brevet?"
            text="Det står i brevhuvudet och under hälsningen."
            knapp="Spara namnet"
            onSaved={() => {
              setNamnKravs(false)
              router.refresh()
            }}
          />
        ) : null}
        {kopierat === 'fel' || filFelText ? (
          <p className="m-0 my-2 hidden text-[13px] leading-[18px] text-[color:var(--fel)] xl:block" role="alert">
            {kopierat === 'fel' ? BREVET.kopieraFel : filFelText}
          </p>
        ) : null}
        {taBortFel ? (
          <p className="m-0 my-2 text-[13px] leading-[18px] text-[color:var(--fel)]" role="alert">
            {BREVET.taBortFel}
          </p>
        ) : null}
        {flikInnehall}
      </div>
    </Blad>
  )

  /* ------------------------------------------------------------ flikraden */

  const avsnitt = (
    <nav className="b3-avsn" aria-label="Arbeta med brevet">
      {BREVET.avsnitt.map((a) => (
        <button key={a.id} type="button" aria-current={a.id === flik ? 'true' : undefined} onClick={() => setFlik(a.id)}>
          {a.namn}
        </button>
      ))}
    </nav>
  )

  const arkEtikett = matt
    ? `Ditt brev i mallen ${mallNamn}. ${matt.medSvar} av ${matt.antal} krav har ett svar, markerat och numrerat på arket.`
    : `Ditt brev i mallen ${mallNamn}.`

  const skriverOmOverlay = skriverOm ? (
    <div className="absolute inset-x-[50px] top-[40%] flex flex-col gap-[14px]" aria-live="polite">
      <span className="b3-skrivbricka self-start">
        <IkonPenna size={16} />
        {BREVET.skriverOm}
      </span>
      <span className="b3-lop">
        <i />
      </span>
    </div>
  ) : null

  return (
    <ArbetsRam>
      <ArbetsYta
        telefonArk="stort"
        huvud={
          <ArbetsHuvud
            tillbakaHref="/dashboard/mina-brev"
            rubrik={BREVET.rubrik(foretag.trim() || null)}
            rubrikMobil={BREVET.rubrikMobil(foretag.trim() || null)}
            underrad={tjanst.trim() || titel.trim() || undefined}
            underradMobil={underradMobil}
            sparstatus={last ? null : sparstatus}
            bricka={
              visaKlart ? (
                <span className="b3-chip" role="status">
                  <IkonBock size={14} strokeWidth={3} />
                  {BREVET.klart}
                </span>
              ) : undefined
            }
            mallKapsel={
              <MallKapsel
                namn={mallNamn}
                miniatyr={mallId ? <img src={`/mallar/v2/${mallId}-liten.webp`} alt="" width={18} height={25} /> : undefined}
                href={`/dashboard/mina-brev/mallar?brev=${id}`}
                mobil="byt"
              />
            }
            klarHref="/dashboard/mina-brev"
          />
        }
        avsnitt={avsnitt}
        blad={<div className="flex flex-1 flex-col max-xl:[&>section]:flex-1 max-xl:[&_.b3-blad-botten]:hidden">{blad}</div>}
        ark={<ArbetsArk html={html} ariaLabel={arkEtikett} saknatKrav={saknatKrav} onStycke={last ? undefined : tryckPaArket} overlay={skriverOmOverlay} />}
        arkRad={
          flik === 'texten' ? (
            <>
              <b>{BREVET.arkRadText}</b> {BREVET.arkRadTextSlut}
            </>
          ) : matt ? (
            <>
              <b>{BREVET.arkRadKrav}</b> {BREVET.arkRadKravSlut}
            </>
          ) : (
            <>{BREVET.arkRadTextSlut}</>
          )
        }
      />
      <BrevSparrLaddare
        open={sparr === 'nedladdning'}
        variant="nedladdning"
        onClose={() => setSparr(null)}
        brevRubrik={BREVET.rubrik(foretag.trim() || null)}
        onKopiera={kopiera}
        scope={summary?.paket?.scope ?? null}
        track={summary?.paket?.track ?? null}
        isPremium={kanLaddaNer}
        returTill={`/dashboard/mina-brev/${id}?format=${sparrFormat}`}
        mall={mallId ? { id: mallId, tier: mallKort?.niva === 'premium' ? 'premium' : 'free' } : null}
      >
        <BrevMiniatyr html={html} bredd={datorSparr ? 292 : 150} />
      </BrevSparrLaddare>
      <BrevSparrLaddare
        open={sparr === 'vecka'}
        variant="vecka"
        onClose={() => setSparr(null)}
        nastaGratis={nastaNu}
        jobb={tjanst.trim() ? { titel: tjanst.trim(), foretag: foretag.trim() } : null}
        scope={summary?.paket?.scope ?? null}
        track={summary?.paket?.track ?? null}
        isPremium={harBetalt}
        returTill={`/dashboard/mina-brev/${id}?flik=ton`}
      />
      {taBort ? (
        <ConfirmDialog
          open={taBort}
          onCancel={() => setTaBort(false)}
          onConfirm={bekraftaTaBort}
          title={BREVET.taBortTitel}
          description={BREVET.taBortText(titel.trim() || 'Namnlöst')}
          confirmLabel={BREVET.taBortKnapp}
          destructive
        />
      ) : null}
    </ArbetsRam>
  )
}

