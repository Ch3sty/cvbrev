'use client'

/**
 * Arbetsläget (byggspecen avsnitt 7, skisserna Redigera-1440, Bygg-1440 och
 * Mobil-redigera): EN vy för att ändra ett CV eller skriva ett nytt. Tre
 * vägar in, samma ram: från Mallar ("Ändra texten" eller ett avsnitt på
 * arket), från Ditt CV och Analys ("Lägg till språken"), och från början.
 *
 * - Huvudet: tillbaka eller kryss, rubriken (från början med stapeln i fem
 *   bitar), sparstatus, mallbrickan med Byt mall och Klar.
 * - Vänster: avsnittsraden och bladet, papper med mörkt huvud. Höger: arket
 *   i vald mall, med avsnittet hon ändrar markerat. Telefon: arket överst,
 *   bladet som bottenblad.
 * - Arket ritas om medan hon skriver (levande.ts), inte först vid Spara.
 *
 * Datan är byggarens som förut: CV:t i CVMetadata-form i structured_data.
 * Ett byggt CV bär byggarens fält (bygge: utkast, mall, val); ett uppladdat
 * CV får inga nya fält och sparas som på mallsidan (/api/cv/strukturerad),
 * så ändringen gäller i alla mallar. Raden i cv_texts skapas vid första
 * sparade bladet (/api/cv/save-improved, samma kvot som förut).
 * localStorage är bara reserv när nätet saknas.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useNedladdning, minnsForhandsvisning } from '@/components/cv/Dokument/hooks'
import { KNAPP } from '@/components/cv/Dokument/texter'
import { FormatVal } from '@/components/cv/Dokument/FastRad'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import GraValSheet from '@/components/paywall/GraValSheet'
import PaywallCard from '@/components/paywall/PaywallCard'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import { IkonBugg } from '@/components/illustrations/Ikoner'
import { IkonBock, IkonStang, IkonTillbaka } from '@/components/illustrations/MallIkoner'
import { IkonPil } from '@/components/illustrations/RumSymboler'
import { useNotification } from '@/context/notificationcontext'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import type { Feature, Scope } from '@/lib/access/features'
import { SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { avslutaFlodet, lamnaFlodet } from '@/lib/flow/flodeshistorik'
import { useFlodeshistorik } from '@/lib/flow/useFlodeshistorik'
import type { Format, MallKort, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import { filnamn as gorFilnamn } from '@/lib/cv/mallval/val'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'
import { GUIDAD, antalKlara, filnamnFor, guidadPlats, harInnehall, miniminiva, type ByggCv } from '@/lib/cv/bygg/modell'
import { spokAvsnitt } from '@/lib/cv/bygg/spok'
import { utanBygge, type Entry } from '@/lib/cv/bygg/kalla'
import type { ArkVal } from '@/lib/cv/bygg/ark'
import { platshallareKvar } from '@/lib/cv/poang'
import { useSiffrorKvar } from '@/components/cv/rum3/SiffrorKvar'
import StartBlad from './StartBlad'
import ArbetsArk, { type ArkMal } from './ArbetsArk'
import { ArbetsKontext, type Arbete } from './blad/Ram'
import { CoachKvotProvider, type CoachKvot } from './blad/Jobbcoach'
import { useLevandeArk } from './levande'
import {
  AVSNITT_PARAM,
  arkFor,
  arkForParam,
  arkKalla,
  nastaFor,
  paramForArk,
  startArk,
  tillbakaHref,
  type AvsnittParam,
  type Fran,
  type Lage,
} from './arbetslage'
import { ANGRA_SEK, ARBETE, BLAD, BYGG, FORSLAG, HOPPA_OVER } from './texter'
import type { Metod } from './blad/Blad'
import s from './arbetslage.module.css'

const Blad = dynamic(() => import('./blad/Blad'), { ssr: false })
const Final = dynamic(() => import('@/components/cv/Dokument/Final'), { ssr: false })
const Merforsaljning = dynamic(() => import('@/components/cv/Dokument/Merforsaljning'), { ssr: false })

const SURFACE = 'byggare'
const RESERV = 'jobbcoach_cv_bygg_reserv'
const RESERV_DAGAR = 7

type Sparr = 'mall' | 'cv-export-word' | 'cv-export'
const SPARR: Record<Sparr, { feature: Feature; plats: BetalvaggPlats }> = {
  mall: { feature: 'cv_templates_all', plats: 'mall' },
  'cv-export-word': { feature: 'cv_export_word', plats: 'cv_export_word' },
  'cv-export': { feature: 'cv_export', plats: 'cv_export' },
}
const SPARR_FOR_FEATURE: Partial<Record<string, Sparr>> = {
  cv_templates_all: 'mall',
  cv_export_word: 'cv-export-word',
  cv_export: 'cv-export',
}

const TESTDATA: Pick<ByggCv, 'summary' | 'experience' | 'education' | 'skills' | 'languages'> & { titel: string } = {
  titel: 'Projektledare',
  summary:
    'Projektledare med åtta års erfarenhet av IT-projekt och digital förändring. Van att leda team över avdelningsgränser och leverera i tid och inom budget.',
  experience: [
    {
      position: 'Projektledare',
      company: 'Nordvik Service AB',
      location: 'Stockholm',
      startDate: '2021-01',
      description: [
        'Leder ett team på tolv personer i bygget av en ny e-handelsplattform',
        'Införde Scrum, vilket kortade leveranstiden med en tredjedel',
        'Ansvarar för en budget på 15 miljoner kronor',
      ],
    },
  ],
  education: [{ degree: 'Civilingenjör, industriell ekonomi', institution: 'Kungliga Tekniska högskolan', startDate: '2010', endDate: '2015' }],
  skills: [{ category: '', skills: ['Scrum', 'Jira', 'Budgetuppföljning', 'Kravställning'] }],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
}

function useDator(): boolean {
  const [dator, setDator] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const satt = () => setDator(mq.matches)
    satt()
    mq.addEventListener('change', satt)
    return () => mq.removeEventListener('change', satt)
  }, [])
  return dator
}

function minsRorelse(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

interface Reserv {
  cvId: string | null
  cv: ByggCv
  tid: number
}

function lasReserv(): Reserv | null {
  try {
    const r = JSON.parse(window.localStorage.getItem(RESERV) ?? 'null') as Reserv | null
    if (!r || Date.now() - r.tid > RESERV_DAGAR * 864e5) return null
    return r
  } catch {
    return null
  }
}
function skrivReserv(r: Reserv | null) {
  try {
    if (r) window.localStorage.setItem(RESERV, JSON.stringify(r))
    else window.localStorage.removeItem(RESERV)
  } catch {
    // Lagringen är avstängd: reserven uteblir, servern är ändå sanningen.
  }
}

const forstaGemen = (t: string) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t)

export interface ByggareProps {
  initialCv: ByggCv
  initialCvId: string | null
  initialMall: string
  /** Valen (typsnitt, färg, ordning): från Mallar i adressen, annars de sparade på ett byggt CV. */
  initialVal: MallVal
  initialRubriker: Partial<Record<Sektion, string>>
  initialHtml: string | null
  uppladdad: boolean
  /** Titeln från startbladet när hon laddade upp (?titel=). */
  uppTitel: string
  sparr: boolean
  /** Från Ditt CV med titeln ifylld (?borja=1): startbladet hoppas över. */
  borja?: boolean
  entry: Entry
  isAdmin: boolean
  katalog: readonly MallKort[]
  isPremium: boolean
  harWord: boolean
  gratisAnvand: boolean
  scope: Scope | null
  track: Scope | null
  planKey: PlanKey | null
  fotoUrl: string | null
  pris: string
  prisLang: string
  kampanj: { pris: string; ordinarie: string } | null
  /** Bygg (nytt eller utkast) eller redigera (uppladdat eller klart). */
  lage: Lage
  /** Sidan Klar och tillbaka går till (?fran=). */
  fran: Fran | null
  /** Avsnittet i adressen (?avsnitt=). */
  startAvsnitt: AvsnittParam | null
  /** Jobbcoachens kvot när sidan öppnades. */
  coachKvot: CoachKvot
}

export default function ByggareClient(p: ByggareProps) {
  const router = useRouter()
  const sok = useSearchParams()
  const { logActivity } = useNotification()
  const dator = useDator()
  const rotRef = useRef<HTMLDivElement>(null)

  const [cv, setCvState] = useState<ByggCv>(p.initialCv)
  const cvRef = useRef(cv)
  const setCv = (c: ByggCv) => {
    cvRef.current = c
    setCvState(c)
  }
  const [cvId, setCvIdState] = useState<string | null>(p.initialCvId)
  const cvIdRef = useRef(cvId)
  const [start, setStart] = useState(!p.initialCvId && !p.borja)
  const [titel, setTitel] = useState(p.initialCv.personalInfo.title ?? '')
  const [mallId, setMallId] = useState(p.initialMall)
  const val = useMemo<MallVal>(() => {
    const v = { ...p.initialVal }
    delete v.rubriker
    return v
    // Valen görs på Mallar; här står de stilla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const rubriker = p.initialRubriker
  const [format, setFormat] = useState<Format>('pdf')
  const [spar, setSpar] = useState<'vila' | 'sparar' | 'sparat' | 'fel'>('vila')
  const [hoppade, setHoppade] = useState<Sektion[]>([])
  const [angra, setAngra] = useState<{ text: string; cv: ByggCv } | null>(null)
  const [antalSparr, setAntalSparr] = useState(false)
  const [matt, setMatt] = useState<{ rubriker: Partial<Record<Sektion, string>>; sidor: number }>({ rubriker: {}, sidor: 1 })
  const [fel, setFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [fil, setFil] = useState<{ blob: Blob; url: string; filnamn: string } | null>(null)
  const [sparr, setSparr] = useState<Sparr | null>(null)
  const [merforsaljning, setMerforsaljning] = useState(false)
  const { framsteg, ladda } = useNedladdning()

  // Från en annan flik utan avsnitt (brickan "Ändra texten"): första avsnittet, Kontakt.
  const forstaAvsnitt = p.startAvsnitt ?? (p.fran && p.lage === 'redigera' ? 'kontakt' : null)
  const [ark, setArk] = useState<ArkVal>(() => (forstaAvsnitt ? arkForParam(p.initialCv, forstaAvsnitt) : startArk(p.initialCv, p.lage)))
  const [bladNyckel, setBladNyckel] = useState(0)
  const [utkast, setUtkastState] = useState<ByggCv | null>(null)
  const utkastRef = useRef<ByggCv | null>(null)
  const setUtkast = useCallback((c: ByggCv | null) => {
    utkastRef.current = c
    setUtkastState(c)
  }, [])
  const [fallt, setFallt] = useState(false)
  const sparaRef = useRef<(() => boolean) | null>(null)

  // Flödets historik: djupet stämplas på varje post (flodeshistorik.ts).
  useFlodeshistorik(sok?.toString() ?? '', () => true)

  const mall = p.katalog.find((m) => m.id === mallId) ?? p.katalog[0]
  const premiumMall = mall.niva === 'premium'

  /* ----------------------------------------------------------- adressen */

  const adress = (andra: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(window.location.search)
    andra(q)
    const st = q.toString()
    return `${window.location.pathname}${st ? `?${st}` : ''}`
  }

  // Engångsparametrar bort; cv, mall, fran och avsnitt står kvar (kontraktet med Mallar).
  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      '',
      adress((q) => {
        q.delete('steg')
        q.delete('upp')
        q.delete('titel')
        q.delete('borja')
        q.delete('ark')
        if (q.get('fran') === 'mina_cv') q.set('fran', 'ditt-cv')
        if (cvIdRef.current) q.set('cv', cvIdRef.current)
        if (!start) q.set('avsnitt', paramForArk(ark))
      })
    )
    capture('cv_bygg_start', { entry: p.entry, sparr: p.sparr })
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------------------------------------ sparandet */

  const ko = useRef<Promise<unknown>>(Promise.resolve())
  const sparatTimer = useRef<number | null>(null)
  const forstaSparat = useRef(false)

  const sparaServer = useCallback((ny: ByggCv) => {
    setSpar('sparar')
    const jobb = ko.current.then(async () => {
      const id = cvIdRef.current
      if (!id) {
        const text = formatCVMetadataAsText(utanBygge(ny)) || filnamnFor(ny)
        const res = await fetch('/api/cv/save-improved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: filnamnFor(ny), improvedText: text, structuredData: ny, originalCvId: null }),
        })
        if (res.status === 403) {
          setAntalSparr(true)
          throw new Error('cv_antal')
        }
        if (!res.ok) throw new Error(String(res.status))
        const j = (await res.json()) as { cvId?: string }
        if (!j.cvId) throw new Error('utan_id')
        cvIdRef.current = j.cvId
        setCvIdState(j.cvId)
        window.history.replaceState(window.history.state, '', adress((q) => q.set('cv', j.cvId!)))
        capture('cv_bygg_sparat', { cv_nytt: true, avsnitt_klara: antalKlara(ny), miniminiva: miniminiva(ny).klar })
      } else {
        const res = await fetch('/api/cv/strukturerad', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvId: id, cv: ny }),
        })
        if (!res.ok) throw new Error(String(res.status))
      }
    })
    ko.current = jobb.then(
      () => {
        skrivReserv(null)
        setSpar('sparat')
        if (sparatTimer.current) window.clearTimeout(sparatTimer.current)
        sparatTimer.current = window.setTimeout(() => setSpar((x) => (x === 'sparat' ? 'vila' : x)), 2000)
      },
      (e) => {
        if ((e as Error)?.message !== 'cv_antal') skrivReserv({ cvId: cvIdRef.current, cv: ny, tid: Date.now() })
        setSpar('fel')
      }
    )
    return ko.current
    // adress läser bara fönstret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reserven från förra gången nätet svek: tillbaka i arket, med Försök igen.
  useEffect(() => {
    const r = lasReserv()
    if (!r || r.cvId !== p.initialCvId) return
    setCv(r.cv)
    setStart(false)
    setSpar('fel')
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ett CV uppladdat från startbladet: sparas genast i CVMetadata-form, märkt som utkast.
  useEffect(() => {
    if (!p.uppladdad || !p.initialCvId) return
    const t = p.uppTitel.trim()
    const bas = cvRef.current
    const ny: ByggCv = {
      ...bas,
      personalInfo: { ...bas.personalInfo, title: bas.personalInfo.title?.trim() || t || undefined },
      languages: bas.languages?.length ? bas.languages : [{ language: 'Svenska', proficiency: 'Modersmål' }],
      bygge: { utkast: true, mall: mallId, val },
    }
    setCv(ny)
    setTitel(ny.personalInfo.title ?? '')
    void sparaServer(ny)
    for (const sek of ['erfarenhet', 'utbildning', 'kompetenser', 'profil', 'sprak'] as const) {
      if (harInnehall(ny, sek)) capture('cv_bygg_avsnitt_sparat', { sektion: sek, method: 'uppladdat', forsta: !forstaSparat.current })
      forstaSparat.current = true
    }
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Byggarens fält följer med ett byggt CV (mallen och valen, så att
   * återkomsten ser likadan ut). Ett uppladdat CV får inga nya fält: det
   * sparas som på mallsidan och blir aldrig ett utkast av att ändras här.
   */
  const medBygge = (c: ByggCv, m = mallId): ByggCv => (c.bygge ? { ...c, bygge: { utkast: c.bygge.utkast ?? true, mall: m, val } } : c)

  const sparaBlad = (ny: ByggCv, sektion: Sektion | 'huvud', metod: Metod) => {
    const med = medBygge(ny)
    setCv(med)
    setUtkast(null)
    void sparaServer(med)
    capture('cv_bygg_avsnitt_sparat', { sektion, method: metod, forsta: !forstaSparat.current })
    forstaSparat.current = true
    if (sektion === 'huvud' && med.personalInfo.title !== undefined) setTitel(med.personalInfo.title ?? '')
    // Ett nytt jobb är nu ett jobb bland de andra; bladet står kvar på det.
    setArk((a) =>
      a.typ === 'post' && a.index === 'ny' && a.sektion === sektion
        ? { ...a, index: Math.max(0, (sektion === 'erfarenhet' ? med.experience.length : med.education.length) - 1) }
        : a
    )
    setBladNyckel((n) => n + 1)
    if (!dator) setFallt(true)
  }

  const angraTimer = useRef<number | null>(null)
  const taBort = (ny: ByggCv, sektion: Sektion, text: string) => {
    const fore = cvRef.current
    const med = medBygge(ny)
    setCv(med)
    setUtkast(null)
    void sparaServer(med)
    setAngra({ text, cv: fore })
    if (angraTimer.current) window.clearTimeout(angraTimer.current)
    angraTimer.current = window.setTimeout(() => setAngra(null), ANGRA_SEK * 1000)
    capture('cv_bygg_avsnitt_sparat', { sektion, method: 'manuell', forsta: false })
    setArk(arkFor(med, sektion))
    setBladNyckel((n) => n + 1)
  }

  /** Ett annat blad: det hon skrivit sparas först (stoppas av valideringen i kontaktbladet). */
  const gaTill = useCallback(
    (a: ArkVal) => {
      if (utkastRef.current && sparaRef.current && !sparaRef.current()) return
      const ny = a.typ === 'lista' ? arkFor(cvRef.current, a.sektion) : a
      setUtkast(null)
      setArk(ny)
      setBladNyckel((n) => n + 1)
      setFallt(false)
      window.history.replaceState(window.history.state, '', adress((q) => q.set('avsnitt', paramForArk(ny))))
    },
    // adress läser bara fönstret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setUtkast]
  )

  /** Klar, tillbaka och Byt mall: det hon skrivit sparas, sedan vidare när servern svarat. */
  const lamna = async (dit?: string) => {
    if (utkastRef.current && sparaRef.current && !sparaRef.current()) return
    await ko.current.catch(() => undefined)
    if (dit) return lamnaFlodet(router, dit)
    if (!p.fran && !cvIdRef.current) return lamnaFlodet(router)
    lamnaFlodet(router, tillbakaHref(p.fran, cvIdRef.current, mallId, val))
  }

  /* ------------------------------------------------------------- arket */

  const visad = utkast ?? cv
  const kalla = useMemo(() => arkKalla({ cv: visad, cvId, mall: mall.id, val, rubriker, lage: p.lage }), [visad, cvId, mall.id, val, rubriker, p.lage])
  // Serverns första HTML i flikens minne, så att arket står klart direkt.
  useState(() => {
    if (p.initialHtml)
      minnsForhandsvisning(arkKalla({ cv: p.initialCv, cvId: p.initialCvId, mall: p.initialMall, val, rubriker: p.initialRubriker, lage: p.lage }), p.initialHtml)
    return null
  })
  const levande = useLevandeArk(kalla)

  const ren = useMemo(() => utanBygge(cv), [cv])
  const visadRen = useMemo(() => utanBygge(visad), [visad])
  const spok = useMemo(() => (p.lage === 'bygg' ? spokAvsnitt(visadRen) : []), [p.lage, visadRen])
  const mini = miniminiva(ren)
  const nu = paramForArk(ark)

  const mal: ArkMal | null = useMemo(() => {
    if (ark.typ === 'huvud') return { sektion: 'huvud' }
    if (ark.typ === 'fler' || ark.typ === 'lista') return ark.typ === 'lista' ? { sektion: ark.sektion } : null
    if (ark.typ === 'avsnitt') return { sektion: ark.sektion }
    const lista = ark.sektion === 'erfarenhet' ? visad.experience ?? [] : visad.education ?? []
    const sparad = ark.sektion === 'erfarenhet' ? cv.experience ?? [] : cv.education ?? []
    const i = ark.index === 'ny' ? (lista.length > sparad.length ? lista.length - 1 : -1) : ark.index
    const post = i >= 0 ? lista[i] : undefined
    if (!post) return { sektion: ark.sektion }
    const t =
      ark.sektion === 'erfarenhet'
        ? { titel: (post as ByggCv['experience'][number]).position ?? '', under: (post as ByggCv['experience'][number]).company ?? '' }
        : { titel: (post as ByggCv['education'][number]).degree ?? '', under: (post as ByggCv['education'][number]).institution ?? '' }
    return { sektion: ark.sektion, post: t.titel.trim() || t.under.trim() ? t : null }
  }, [ark, visad, cv])

  const onMarkering = useCallback(
    (el: HTMLElement | null) => {
      const rot = rotRef.current
      if (!el || !rot) return
      const r = el.getBoundingClientRect()
      const beteende: ScrollBehavior = minsRorelse() ? 'auto' : 'smooth'
      if (!dator) {
        // Telefonen: markeringen strax under huvudet, ovanför bladet.
        if (!fallt) rot.scrollBy({ top: r.top - 84, behavior: beteende })
        return
      }
      if (r.top < 96 || r.bottom > window.innerHeight - 24) rot.scrollBy({ top: r.top - Math.max(96, (window.innerHeight - r.height) / 2), behavior: beteende })
    },
    [dator, fallt]
  )

  /* --------------------------------------------------------- nedladdning */

  const behoverKop = (premiumMall && !p.isPremium) || (format === 'docx' && premiumMall && !p.harWord)
  const knappText = behoverKop ? KNAPP.laddaNerIMall(format, mall.namn) : KNAPP.sparaOchLaddaNer.replace('PDF', format === 'docx' ? 'Word' : 'PDF')
  const knappUnder = behoverKop ? KNAPP.premiumPris(p.pris) : undefined

  const returFor = (m: string, f: Format = format) =>
    `/dashboard/cv-mallar?${new URLSearchParams({ ...(cvIdRef.current ? { cv: cvIdRef.current } : {}), mall: m, format: f }).toString()}`
  const tillKopet = (m: string, f: Format = format) => window.location.assign(kopstegHref(SALD_PLAN, 'mall', { mall: m, retur: returFor(m, f) }))
  const saljEllerVagg = async () => {
    const { merforsaljningsUrval } = await import('@/components/cv/Dokument/Merforsaljning')
    if (merforsaljningsUrval(p.katalog, mall.id, matt.sidor, Boolean(p.fotoUrl)).length) setMerforsaljning(true)
    else setSparr('cv-export')
  }

  // [antal] kvar i det sparade CV:t: raden under knappen och arket före filen.
  const platshallare = useMemo(() => platshallareKvar(ren), [ren])
  const siffror = useSiffrorKvar(
    platshallare,
    platshallare[0] ? { onClick: () => gaTill(arkForParam(cvRef.current, platshallare[0].avsnitt)) } : null
  )

  const laddaNer = async (m: MallKort = mall, f: Format = format) => {
    const tier = m.niva === 'gratis' ? 'free' : 'premium'
    capture('nedladdning_klickad', { template: m.id, format: f, inloggad: true, surface: SURFACE, tier })
    setFel(null)
    if (f === 'docx' && m.niva === 'premium' && !p.harWord) return setSparr('cv-export-word')
    if (m.niva === 'premium' && !p.isPremium) return setSparr('mall')
    if (p.gratisAnvand) return void saljEllerVagg()
    if (utkastRef.current && sparaRef.current && !sparaRef.current()) return
    // [antal] kvar: arket frågar först, Ladda ner ändå fortsätter (efterrättning A).
    if (siffror.stoppa(() => void skapaFil(m, f), platshallareKvar(utanBygge(cvRef.current)))) return
    await skapaFil(m, f)
  }

  const skapaFil = async (m: MallKort, f: Format) => {
    await ko.current
    const id = cvIdRef.current
    const c = cvRef.current
    const ut = await ladda({
      mall: m.id,
      format: f,
      val: { ...val, rubriker },
      cvId: id ?? undefined,
      structuredData: utanBygge(c),
      filnamn: gorFilnamn(m.namn, c.personalInfo.fullName || 'mitt-cv', f),
      entry: SURFACE,
    })
    if (ut.typ === 'klar') {
      setFil(ut)
      void logActivity('cv_generated', 'skapade ett professionellt CV', { template: m.id, format: f, cv_id: id, file_name: ut.filnamn })
      if (c.bygge?.utkast === true) {
        const klart: ByggCv = { ...medBygge(c), bygge: { utkast: false, mall: m.id, val } }
        setCv(klart)
        void sparaServer(klart)
        capture('cv_bygg_sparat', { cv_nytt: false, avsnitt_klara: antalKlara(klart), miniminiva: true })
      }
    } else if (ut.typ === 'sparr') {
      const sp = ut.feature ? SPARR_FOR_FEATURE[ut.feature] : null
      if (sp === 'cv-export' || !sp) void saljEllerVagg()
      else tillKopet(m.id, f)
    } else if (ut.typ === 'namn') {
      setNamnKravs(true)
    } else {
      setFel(ut.text)
    }
  }

  /* ---------------------------------------------------------- testdata */

  const fyllTestdata = () => {
    const { titel: t, ...resten } = TESTDATA
    const ny = medBygge({ ...cvRef.current, ...resten, personalInfo: { ...cvRef.current.personalInfo, title: t } })
    setStart(false)
    setTitel(t)
    setCv(ny)
    setUtkast(null)
    setArk(arkFor(ny, 'erfarenhet'))
    setBladNyckel((n) => n + 1)
    void sparaServer(ny)
  }

  /* ------------------------------------------------------------ huvudet */

  const bygg = p.lage === 'bygg'
  const klara = GUIDAD.filter((g) => harInnehall(visadRen, g))
  const nuGuidad = (GUIDAD as readonly string[]).includes(nu) ? (nu as (typeof GUIDAD)[number]) : null
  const plats = nuGuidad ? guidadPlats(nuGuidad) ?? 1 : Math.min(5, klara.length + 1)

  const status =
    spar === 'sparar' ? (
      <span className={s.sparat} aria-live="polite">
        {BYGG.sparar}
      </span>
    ) : spar === 'fel' ? (
      <span className={s.sparat} role="alert">
        {BYGG.sparFel}
        <button type="button" onClick={() => void sparaServer(cvRef.current)}>
          {BYGG.forsokIgen}
        </button>
      </span>
    ) : cvId || spar === 'sparat' ? (
      <span className={s.sparat} aria-live="polite" data-sparat={spar === 'sparat' ? '' : undefined}>
        <IkonBock size={15} strokeWidth={3} style={{ color: '#7FCFCA' }} />
        {BYGG.sparat}
      </span>
    ) : null

  const tillbakaEtikett = p.fran ? ARBETE.tillbaka[p.fran] : ARBETE.stang
  const underRubrik = [cv.personalInfo.fullName?.trim(), forstaGemen(cv.personalInfo.title?.trim() ?? '')].filter(Boolean).join(', ')

  const huvud = (
    <header className={s.huvud}>
      <button type="button" className={s.kryss} onClick={() => void lamna()} aria-label={tillbakaEtikett} data-tillbaka>
        {bygg && !p.fran ? <IkonStang size={22} strokeWidth={2.2} /> : <IkonTillbaka size={22} strokeWidth={2.4} />}
      </button>
      <div className={s.titel}>
        <h1>{bygg ? ARBETE.bygg : ARBETE.redigera}</h1>
        {!bygg && underRubrik ? <span>{underRubrik}</span> : null}
      </div>
      {bygg ? (
        <div className={s.stapelRad} role="img" aria-label={ARBETE.stapel(klara.length, nuGuidad ? ARBETE.flikar[nuGuidad].toLowerCase() : null)}>
          <span className={s.stapel}>
            {GUIDAD.map((g) => (
              <i key={g} data-bit={g === nuGuidad ? 'nu' : klara.includes(g) ? 'klar' : undefined} />
            ))}
          </span>
          <span className={s.stapelText}>{ARBETE.avsnittAv(plats)}</span>
        </div>
      ) : null}
      <div className={s.hogerHuvud}>
        {status}
        <div className={s.barDator}>
          {cvId ? (
            <button
              type="button"
              className={s.kapsel}
              onClick={() => void lamna(tillbakaHref('mallar', cvIdRef.current, mall.id, val))}
              aria-label={ARBETE.mallBricka(mall.namn)}
              data-byt-mall
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mall.bild.liten} alt="" aria-hidden />
              {mall.namn}
              <u>{ARBETE.bytMall}</u>
            </button>
          ) : (
            <span className={s.kapsel} aria-label={mall.namn}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mall.bild.liten} alt="" aria-hidden />
              {mall.namn}
            </span>
          )}
          {!bygg || mini.klar ? (
            <button type="button" className={s.kapsel} onClick={() => void lamna()} data-klar>
              {ARBETE.klar}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )

  /* ------------------------------------------------------- bladets delar */

  const avsnittsrad = (
    <nav className={s.avsn} aria-label={ARBETE.avsnittsrad}>
      {AVSNITT_PARAM.map((a) => (
        <button
          key={a}
          type="button"
          aria-current={nu === a ? 'true' : undefined}
          aria-label={a === 'fler' ? ARBETE.flerEtikett : undefined}
          onClick={() => (nu === a ? undefined : gaTill(arkForParam(cvRef.current, a)))}
          data-avsnitt-flik={a}
        >
          {ARBETE.flikar[a]}
        </button>
      ))}
    </nav>
  )

  const ovan = (
    <>
      {antalSparr ? <PaywallCard variant="cv-antal" onSecondary={() => router.push('/dashboard/profil/cv')} /> : null}
      {angra ? (
        <p role="status" className={s.angraRad}>
          <span>{angra.text}</span>
          <button
            type="button"
            onClick={() => {
              const c = medBygge(angra.cv)
              setCv(c)
              setUtkast(null)
              void sparaServer(c)
              setAngra(null)
              setBladNyckel((n) => n + 1)
            }}
          >
            {BLAD.angra}
          </button>
        </p>
      ) : null}
    </>
  )

  const nasta = bygg ? nastaFor(ren, nu, hoppade) : null
  const nastaRad = nasta ? (
    <div className={s.nasta} data-forslag={nasta.typ === 'kontakt' ? 'kontakt' : nasta.sektion}>
      <button type="button" onClick={() => gaTill(nasta.typ === 'kontakt' ? { typ: 'huvud' } : arkFor(cvRef.current, nasta.sektion))}>
        <span className={s.nastaIk} aria-hidden>
          <IkonPil size={22} strokeWidth={2.2} />
        </span>
        <span className={s.nastaText}>
          <b>{ARBETE.nasta}</b>
          {nasta.typ === 'kontakt' ? ARBETE.nastaKontakt : FORSLAG[nasta.sektion]}
        </span>
      </button>
      {nasta.typ === 'avsnitt' && mini.klar ? (
        <button type="button" className={s.hoppa} onClick={() => setHoppade((h) => [...h, nasta.sektion])}>
          {HOPPA_OVER}
        </button>
      ) : null}
    </div>
  ) : null

  const arbete: Arbete = {
    dator,
    lage: p.lage,
    fallt,
    setFallt,
    avsnittsrad: <div className={s.mobilAvsn}>{avsnittsrad}</div>,
    ovan,
    nasta: nastaRad,
    fotText: bygg ? (mini.klar ? ARBETE.fotByggKlar : ARBETE.fotBygg) : ARBETE.fotRedigera,
    onAvbryt: bygg
      ? null
      : () => {
          setUtkast(null)
          setBladNyckel((n) => n + 1)
        },
    registrera: useCallback((fn: (() => boolean) | null) => {
      sparaRef.current = fn
    }, []),
    onUtkast: setUtkast,
  }

  /* ------------------------------------------------------- under arket */

  const indexIKatalog = p.katalog.findIndex((m) => m.id === mall.id) + 1
  const underArk =
    bygg && spok.length ? (
      <p className={s.underArk}>
        <b>{ARBETE.gratText}</b> {ARBETE.gratTextRad}
      </p>
    ) : (
      <p className={s.underArk}>
        <b>{ARBETE.underArk(mall.namn, indexIKatalog, p.katalog.length)}</b> {ARBETE.underArkRad}
      </p>
    )

  const laddaRad =
    bygg && mini.klar ? (
      <div className="grid gap-2">
        <div className={s.ladda} data-ladda-rad>
          <FormatVal
            format={format}
            onFormat={(f) => {
              if (f === 'docx' && premiumMall && !p.harWord) setSparr('cv-export-word')
              setFormat(f)
            }}
            mallHarWord={mall.word}
            kanWord={p.harWord || !premiumMall}
            last={framsteg !== null}
            kompakt
          />
          <button type="button" className={s.laddaKnapp} onClick={() => void laddaNer()} disabled={framsteg !== null} aria-busy={framsteg !== null} data-ladda-ner>
            {framsteg !== null ? <span aria-hidden className={s.laddaFyll} style={{ width: `${Math.round(framsteg * 100)}%` }} /> : null}
            <span className={s.laddaText}>
              {framsteg !== null ? (format === 'docx' ? KNAPP.skaparWord : KNAPP.skaparPdf) : knappText}
              {knappUnder && framsteg === null ? <small>{knappUnder}</small> : null}
            </span>
          </button>
        </div>
        {siffror.rad}
        {siffror.ark}
        {fel ? (
          <p role="alert" className="rounded-xl bg-papper px-3 py-2 text-sm text-fel">
            {fel}
          </p>
        ) : namnKravs ? (
          <NameRequiredNotice
            onSaved={() => {
              setNamnKravs(false)
              void laddaNer()
            }}
          />
        ) : null}
      </div>
    ) : null

  return (
    <CoachKvotProvider start={p.coachKvot}>
      <ArbetsKontext.Provider value={arbete}>
        <div
          ref={rotRef}
          className={s.rot}
          data-rum="cv"
          data-flode-sida
          data-arbetslage={p.lage}
          style={{ ['--cv3a-blad-h' as string]: fallt ? '160px' : '760px' }}
        >
          <FlodesLage />
          <div className={s.bakgrund} aria-hidden>
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
              <circle cx="1290" cy="-60" r="330" fill="#164144" />
              <path d="M0 900V720C260 680 520 760 800 690S1240 590 1440 620V900Z" fill="#153E41" />
              <path d="M0 900V820C300 790 620 850 900 800S1300 730 1440 750V900Z" fill="#1B494C" />
            </svg>
          </div>
          {huvud}
          <div className={s.yta}>
            <div className={s.vanster}>
              <div className={s.avsnDator}>{avsnittsrad}</div>
              {start ? null : (
                <Blad
                  key={`${bladNyckel}-${ark.typ}-${'sektion' in ark ? ark.sektion : ''}`}
                  ark={ark}
                  cv={cv}
                  rubriker={matt.rubriker}
                  onSpara={sparaBlad}
                  onTaBort={taBort}
                  onOppna={gaTill}
                />
              )}
            </div>
            <div className={s.hoger}>
              <ArbetsArk
                html={levande.html}
                titel={ARBETE.arkTitel(mall.namn)}
                mal={start ? null : mal}
                spok={spok}
                etikett={bygg ? ARBETE.synsDirekt : ARBETE.duAndrar}
                visaEtikett={dator}
                onAvsnitt={(sek) => gaTill(arkFor(cvRef.current, sek))}
                onHuvud={() => gaTill({ typ: 'huvud' })}
                onMarkering={onMarkering}
                onMatning={setMatt}
              />
              {underArk}
              {laddaRad}
              {p.isAdmin ? (
                <div className={s.adminRad}>
                  <button type="button" onClick={fyllTestdata}>
                    <IkonBugg size={18} />
                    {BYGG.testdata}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {sparr ? (
          <GraValSheet
            open
            onClose={() => setSparr(null)}
            feature={SPARR[sparr].feature}
            variant={sparr as PaywallVariant}
            scope={p.scope}
            track={p.track}
            planKey={p.planKey}
            surface="/dashboard/skapa-cv"
            plats={SPARR[sparr].plats}
            mall={{ id: mall.id, tier: premiumMall ? 'premium' : 'free', retur: returFor(mall.id) }}
          />
        ) : null}

        {fil ? (
          <Final
            open
            onClose={() => {
              setFil(null)
              // Klart: stegen ur historiken, nästa bakåtgest går till rummet.
              avslutaFlodet(router)
            }}
            fil={fil}
            mall={mall}
            format={format}
            sidor={matt.sidor}
            cvId={cvId}
            titel={ren.personalInfo.title || ren.experience[0]?.position}
            ort={ren.personalInfo.address || ren.personalInfo.location}
            surface={SURFACE}
            nasta="analys"
          />
        ) : null}

        {merforsaljning ? (
          <Merforsaljning
            open
            onClose={() => setMerforsaljning(false)}
            katalog={p.katalog}
            nuvarande={mall}
            filnamn={gorFilnamn(mall.namn, ren.personalInfo.fullName || 'mitt-cv', format)}
            sidor={matt.sidor}
            harFoto={Boolean(p.fotoUrl)}
            kalla={(m) => ({ ...kalla, mall: m, spok: undefined })}
            pris={p.pris}
            kampanj={p.kampanj}
            onKop={(m) => {
              setMerforsaljning(false)
              setMallId(m.id)
              tillKopet(m.id)
            }}
            surface={SURFACE}
          />
        ) : null}

        {start ? (
          <StartBlad
            titel={titel}
            onTitel={(t) => {
              // Spöktexten och rubrikerna följer titeln medan hon skriver.
              setTitel(t)
              setCv({ ...cvRef.current, personalInfo: { ...cvRef.current.personalInfo, title: t.trim() || undefined } })
            }}
            sparr={p.sparr}
            mall={mallId}
            onSkriv={() => {
              const t = titel.trim()
              const ny = { ...cvRef.current, personalInfo: { ...cvRef.current.personalInfo, title: t || undefined } }
              setCv(ny)
              setStart(false)
              const a = startArk(ny, 'bygg')
              setArk(a)
              window.history.replaceState(window.history.state, '', adress((q) => q.set('avsnitt', paramForArk(a))))
            }}
          />
        ) : null}
      </ArbetsKontext.Provider>
    </CoachKvotProvider>
  )
}

/**
 * Läget äger hela skärmen som flödena (FlowShell): bottennavet och
 * dashboardhuvudet göms medan det lever, före första målningen.
 */
function FlodesLage() {
  useEffect(() => {
    const root = document.documentElement
    const forra = root.style.getPropertyValue('--bottom-nav-h')
    root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    return () => {
      if (forra) root.style.setProperty('--bottom-nav-h', forra)
      else root.style.removeProperty('--bottom-nav-h')
      root.removeAttribute('data-flow-active')
    }
  }, [])
  return null
}
