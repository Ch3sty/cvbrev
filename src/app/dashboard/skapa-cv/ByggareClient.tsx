'use client'

/**
 * CV-byggaren "Direkt på arket" (docs/design/skiss-cv-byggare-2026-11-16.html,
 * godkänd av ägaren 2026-11-16). Arket i vald mall är byggaren: samma
 * Mallyta och Dokument som /dashboard/cv-mallar, tomma avsnitt som grå
 * spöktext med "+ Lägg till", fälten i ett blad per avsnitt (bottenblad på
 * mobil, dockat till höger på dator). Den fasta raden bär Nästa-luckan tills
 * miniminivån är nådd, sedan formatet och filen.
 *
 * Datan: CV:t i CVMetadata-form med byggarens fält (bygge) i structured_data.
 * Raden i cv_texts skapas vid första sparade bladet (/api/cv/save-improved,
 * samma kvot som förut) och skrivs om vid varje blad (/api/cv/strukturerad).
 * localStorage är bara reserv när nätet saknas.
 *
 * Bladet står i adressen (?ark=erfarenhet:0) som en egen historikpost, så att
 * bakåtgesten stänger bladet och inte byggaren. Posterna bär flödets djup
 * (flodeshistorik.ts), så att ett klart flöde lämnar en enda post efter sig.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import FlowShell from '@/components/shell/FlowShell'
import Mallyta from '@/components/cv/Dokument/Mallyta'
import { useForhandsvisning, useNedladdning, minnsForhandsvisning, type Kalla } from '@/components/cv/Dokument/hooks'
import type { Matning, HuvudFalt } from '@/components/cv/Dokument/matning'
import { KNAPP, SKAL } from '@/components/cv/Dokument/texter'
import { FotoArkInloggad, useFotoInloggad } from '@/components/cv/Dokument/FotoArk'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import GraValSheet from '@/components/paywall/GraValSheet'
import PaywallCard from '@/components/paywall/PaywallCard'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import { IkonBugg } from '@/components/illustrations/Ikoner'
import { useNotification } from '@/context/notificationcontext'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import type { Feature, Scope } from '@/lib/access/features'
import { SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { avslutaFlodet, lasDjup, lasFran } from '@/lib/flow/flodeshistorik'
import { useFlodeshistorik } from '@/lib/flow/useFlodeshistorik'
import type { Format, MallKort, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import { foreslagna as raknaForslag } from '@/lib/cv/mallval/forslag'
import { filnamn as gorFilnamn } from '@/lib/cv/mallval/val'
import { forvalFor } from '@/lib/cv/rubriker'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'
import { antalKlara, filnamnFor, harInnehall, miniminiva, nastaLucka, type ByggCv } from '@/lib/cv/bygg/modell'
import { spokAvsnitt } from '@/lib/cv/bygg/spok'
import { byggKalla, utanBygge, type Entry } from '@/lib/cv/bygg/kalla'
import { arkForAvsnitt, arkNyckel, arkSektion, tolkaArk, type ArkVal } from '@/lib/cv/bygg/ark'
import StartBlad from './StartBlad'
import { ANGRA_SEK, BLAD, BYGG, FORSLAG, HOPPA_OVER, LUCKA } from './texter'
import type { Metod } from './blad/Blad'

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

export interface ByggareProps {
  initialCv: ByggCv
  initialCvId: string | null
  initialMall: string
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
}

export default function ByggareClient(p: ByggareProps) {
  const router = useRouter()
  const pathname = usePathname()
  const sok = useSearchParams()
  const { logActivity } = useNotification()
  const dator = useDator()

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
  const [val, setVal] = useState<MallVal>(() => {
    const v = { ...(p.initialCv.bygge?.val ?? {}) }
    delete v.rubriker
    return v
  })
  const [rubriker, setRubriker] = useState(p.initialRubriker)
  const [format, setFormat] = useState<Format>('pdf')
  const [spar, setSpar] = useState<'vila' | 'sparar' | 'sparat' | 'fel'>('vila')
  const [nyss, setNyss] = useState<Sektion | null>(null)
  const [hoppade, setHoppade] = useState<Sektion[]>([])
  const [angra, setAngra] = useState<{ text: string; cv: ByggCv } | null>(null)
  const [antalSparr, setAntalSparr] = useState(false)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [fil, setFil] = useState<{ blob: Blob; url: string; filnamn: string } | null>(null)
  const [sparr, setSparr] = useState<Sparr | null>(null)
  const [merforsaljning, setMerforsaljning] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(p.fotoUrl)
  const [fotoArk, setFotoArk] = useState(false)
  const { framsteg, ladda } = useNedladdning()
  const foto = useFotoInloggad((url) => {
    setFotoUrl(url)
    setVal((v) => ({ ...v, foto: Boolean(url) }))
    setFotoArk(false)
  })

  // Flödets historik: djupet stämplas på varje post (flodeshistorik.ts).
  useFlodeshistorik(sok?.toString() ?? '', () => true)

  const ark: ArkVal | null = start ? null : tolkaArk(sok?.get('ark'))
  const mall = p.katalog.find((m) => m.id === mallId) ?? p.katalog[0]
  const premiumMall = mall.niva === 'premium'

  /* ----------------------------------------------------------- adressen */

  const adress = (andra: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(window.location.search)
    andra(q)
    const s = q.toString()
    return `${pathname}${s ? `?${s}` : ''}`
  }
  const tillstand = (extra: Record<string, unknown> = {}) => {
    const s = (window.history.state ?? {}) as Record<string, unknown>
    return { flodesdjup: lasDjup() ?? 0, flodeFran: lasFran(), byggArk: typeof s.byggArk === 'number' ? s.byggArk : 0, ...extra }
  }

  // Gamla ?steg= och engångsparametrar bort; cv och mall står kvar.
  useEffect(() => {
    window.history.replaceState(
      tillstand(),
      '',
      adress((q) => {
        q.delete('steg')
        q.delete('upp')
        q.delete('titel')
        q.delete('fran')
        q.delete('borja')
        if (cvIdRef.current) q.set('cv', cvIdRef.current)
        if (!cvIdRef.current) q.delete('ark')
      })
    )
    capture('cv_bygg_start', { entry: p.entry, sparr: p.sparr })
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const oppnaArk = useCallback(
    (a: ArkVal) => {
      const s = (window.history.state ?? {}) as Record<string, unknown>
      const djup = (lasDjup() ?? 0) + 1
      const arkDjup = (typeof s.byggArk === 'number' ? s.byggArk : 0) + 1
      // Avsnittet till bandet ovanför bladet på mobil, så att bladet aldrig täcker det.
      const sek = arkSektion(a)
      if (sek && !dator) {
        const el = document.querySelector<HTMLElement>(`[data-avsnitt-knapp="${sek}"]`)
        if (el) {
          el.style.scrollMarginTop = '72px'
          el.scrollIntoView({ block: 'start', behavior: minsRorelse() ? 'auto' : 'smooth' })
        }
      }
      window.history.pushState(
        { flodesdjup: djup, flodeFran: lasFran(), byggArk: arkDjup },
        '',
        adress((q) => q.set('ark', arkNyckel(a)))
      )
    },
    // adress och dator räcker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dator, pathname]
  )

  /** Stänger bladet: ett steg (Esc, kryss) eller alla blad (Spara). */
  const stangArk = useCallback(
    (alla = false) => {
      const s = (window.history.state ?? {}) as Record<string, unknown>
      const d = typeof s.byggArk === 'number' ? s.byggArk : 0
      if (d > 0) window.history.go(alla ? -d : -1)
      else window.history.replaceState(tillstand({ byggArk: 0 }), '', adress((q) => q.delete('ark')))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  )

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
        sparatTimer.current = window.setTimeout(() => setSpar((s) => (s === 'sparat' ? 'vila' : s)), 2000)
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

  // Ett uppladdat CV: sparas genast i CVMetadata-form, märkt som utkast.
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
    for (const s of ['erfarenhet', 'utbildning', 'kompetenser', 'profil', 'sprak'] as const) {
      if (harInnehall(ny, s)) capture('cv_bygg_avsnitt_sparat', { sektion: s, method: 'uppladdat', forsta: !forstaSparat.current })
      forstaSparat.current = true
    }
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const medBygge = (c: ByggCv, m = mallId, v = val): ByggCv => ({ ...c, bygge: { utkast: c.bygge?.utkast ?? true, mall: m, val: v } })

  const scrollaTill = useRef<Sektion | null>(null)

  const sparaBlad = (ny: ByggCv, sektion: Sektion | 'huvud', metod: Metod) => {
    const med = medBygge(ny)
    setCv(med)
    void sparaServer(med)
    capture('cv_bygg_avsnitt_sparat', { sektion, method: metod, forsta: !forstaSparat.current })
    forstaSparat.current = true
    if (sektion === 'huvud' && med.personalInfo.title !== undefined) setTitel(med.personalInfo.title ?? '')
    stangArk(true)
    if (sektion !== 'huvud') {
      scrollaTill.current = sektion
      setNyss(sektion)
      window.setTimeout(() => setNyss((n) => (n === sektion ? null : n)), 1000)
    }
  }

  const angraTimer = useRef<number | null>(null)
  const taBort = (ny: ByggCv, sektion: Sektion, text: string) => {
    const fore = cvRef.current
    const med = medBygge(ny)
    setCv(med)
    void sparaServer(med)
    stangArk(true)
    setAngra({ text, cv: fore })
    if (angraTimer.current) window.clearTimeout(angraTimer.current)
    angraTimer.current = window.setTimeout(() => setAngra(null), ANGRA_SEK * 1000)
    capture('cv_bygg_avsnitt_sparat', { sektion, method: 'manuell', forsta: false })
  }

  /* ------------------------------------------------------------- arket */

  const kalla = useMemo(() => byggKalla({ cv, cvId, mall: mall.id, val, rubriker }), [cv, cvId, mall.id, val, rubriker])
  // Serverns första HTML i flikens cache, så att arket står klart direkt.
  useState(() => {
    if (p.initialHtml) minnsForhandsvisning(byggKalla({ cv: p.initialCv, cvId: p.initialCvId, mall: p.initialMall, val, rubriker: p.initialRubriker }), p.initialHtml)
    return null
  })
  const fv = useForhandsvisning(kalla as Kalla)

  const onMatt = (m: Matning) => {
    setMatning(m)
    const s = scrollaTill.current
    if (!s) return
    scrollaTill.current = null
    const el = document.querySelector<HTMLElement>(`[data-avsnitt-knapp="${s}"]`)
    el?.scrollIntoView({ block: 'center', behavior: minsRorelse() ? 'auto' : 'smooth' })
  }

  const ren = useMemo(() => utanBygge(cv), [cv])
  const forslag = useMemo(() => raknaForslag(p.katalog, ren, matning?.sidor ?? 1, 3, Boolean(fotoUrl)), [p.katalog, ren, matning?.sidor, fotoUrl])
  const gratis = p.katalog.find((m) => m.niva === 'gratis' && m.id === forslag.ids[0]) ?? p.katalog.find((m) => m.niva === 'gratis')!
  const forvald = useMemo(() => forvalFor(ren), [ren])
  const spok = useMemo(() => spokAvsnitt(ren), [ren])
  const mini = miniminiva(ren)
  const nasta = nastaLucka(ren, hoppade)

  const bytMall = (id: string) => {
    setMallId(id)
    window.history.replaceState(window.history.state, '', adress((q) => q.set('mall', id)))
    if (cvIdRef.current) {
      const med = medBygge(cvRef.current, id)
      setCv(med)
      void sparaServer(med)
    }
  }
  const bytVal = (v: MallVal) => {
    const utan = { ...v }
    delete utan.rubriker
    setVal(utan)
    if (cvIdRef.current) {
      const med = medBygge(cvRef.current, mallId, utan)
      setCv(med)
      void sparaServer(med)
    }
  }

  const sparaRubrik = async (s: Sektion, r: string | null) => {
    setRubriker((x) => {
      const ny = { ...x }
      if (r === null) delete ny[s]
      else ny[s] = r
      return ny
    })
    await ko.current
    if (!cvIdRef.current) return
    await fetch('/api/cv/section-titles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvId: cvIdRef.current, rubriker: { [s]: r } }),
    }).catch(() => null)
  }

  /* --------------------------------------------------------- nedladdning */

  const behoverKop = (premiumMall && !p.isPremium) || (format === 'docx' && premiumMall && !p.harWord)
  const knappText = behoverKop ? KNAPP.laddaNerIMall(format, mall.namn) : KNAPP.sparaOchLaddaNer.replace('PDF', format === 'docx' ? 'Word' : 'PDF')
  const knappUnder = behoverKop ? KNAPP.premiumPris(p.pris) : undefined

  const returFor = (m: string, f: Format = format) =>
    `/dashboard/cv-mallar?${new URLSearchParams({ ...(cvIdRef.current ? { cv: cvIdRef.current } : {}), mall: m, format: f }).toString()}`
  const tillKopet = (m: string, f: Format = format) => window.location.assign(kopstegHref(SALD_PLAN, 'mall', { mall: m, retur: returFor(m, f) }))
  const saljEllerVagg = async () => {
    const { merforsaljningsUrval } = await import('@/components/cv/Dokument/Merforsaljning')
    if (merforsaljningsUrval(p.katalog, mall.id, matning?.sidor ?? 1, Boolean(fotoUrl)).length) setMerforsaljning(true)
    else setSparr('cv-export')
  }

  const laddaNer = async (m: MallKort = mall, f: Format = format) => {
    const tier = m.niva === 'gratis' ? 'free' : 'premium'
    capture('nedladdning_klickad', { template: m.id, format: f, inloggad: true, surface: SURFACE, tier })
    setFel(null)
    if (f === 'docx' && m.niva === 'premium' && !p.harWord) return setSparr('cv-export-word')
    if (m.niva === 'premium' && !p.isPremium) return setSparr('mall')
    if (p.gratisAnvand) return void saljEllerVagg()
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
      if (c.bygge?.utkast !== false) {
        const klart: ByggCv = { ...medBygge(c), bygge: { utkast: false, mall: m.id, val } }
        setCv(klart)
        void sparaServer(klart)
        capture('cv_bygg_sparat', { cv_nytt: false, avsnitt_klara: antalKlara(klart), miniminiva: true })
      }
    } else if (ut.typ === 'sparr') {
      const s = ut.feature ? SPARR_FOR_FEATURE[ut.feature] : null
      if (s === 'cv-export' || !s) void saljEllerVagg()
      else tillKopet(m.id, f)
    } else if (ut.typ === 'namn') {
      setNamnKravs(true)
    } else {
      setFel(ut.text)
    }
  }

  /* ---------------------------------------------------------- luckan */

  const oppnaFor = (s: Sektion) => {
    const a = arkForAvsnitt(ren, s)
    if (a) oppnaArk(a)
  }

  const lucka = mini.klar ? undefined : (
    <div className="flex items-center gap-3">
      <p className="min-w-0 flex-1" aria-live="polite">
        <span className="block text-ey uppercase text-ink-3">{LUCKA.nasta}</span>
        <span className="block truncate text-sm font-semibold text-ink-1">{mini.saknas === 'innehall' ? LUCKA.rad.innehall : LUCKA.rad.namn}</span>
      </p>
      <button
        type="button"
        data-lucka-knapp
        onClick={() => (mini.saknas === 'innehall' ? oppnaArk({ typ: 'post', sektion: 'erfarenhet', index: 'ny' }) : oppnaArk({ typ: 'huvud' }))}
        className="knapp-primar inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-4 text-[15px] font-semibold"
      >
        {mini.saknas === 'innehall' ? LUCKA.knapp.erfarenhet : LUCKA.knapp.namn}
      </button>
    </div>
  )

  const ovanRad = angra ? (
    <p role="status" className="flex items-center justify-between gap-3 rounded-xl bg-ink-1 px-3 py-2 text-sm text-papper">
      <span>{angra.text}</span>
      <button
        type="button"
        onClick={() => {
          const c = medBygge(angra.cv)
          setCv(c)
          void sparaServer(c)
          setAngra(null)
        }}
        className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
      >
        {BLAD.angra}
      </button>
    </p>
  ) : mini.klar && nasta && !ark ? (
    <div className="flex items-center gap-3 rounded-xl bg-ton px-3 py-1.5 text-[13px] text-ton-ink" data-forslag={nasta}>
      <button type="button" onClick={() => oppnaFor(nasta)} className="min-h-11 min-w-0 flex-1 text-left font-medium">
        {FORSLAG[nasta]}
      </button>
      <button
        type="button"
        onClick={() => setHoppade((h) => [...h, nasta])}
        className="inline-flex min-h-11 shrink-0 items-center font-semibold underline underline-offset-4"
      >
        {HOPPA_OVER}
      </button>
    </div>
  ) : null

  /* ---------------------------------------------------------- testdata */

  const fyllTestdata = () => {
    const { titel: t, ...resten } = TESTDATA
    const ny = medBygge({ ...cvRef.current, ...resten, personalInfo: { ...cvRef.current.personalInfo, title: t } })
    setStart(false)
    setTitel(t)
    setCv(ny)
    void sparaServer(ny)
  }

  /* ------------------------------------------------------------ status */

  const status =
    spar === 'sparar' ? (
      <span className="text-sm text-ink-3" aria-live="polite">
        {BYGG.sparar}
      </span>
    ) : spar === 'sparat' ? (
      <span className="text-sm font-medium text-positiv" aria-live="polite" data-sparat>
        {BYGG.sparat}
      </span>
    ) : spar === 'fel' ? (
      <span className="inline-flex items-center gap-2 text-sm" role="alert">
        <span className="text-fel">{BYGG.sparFel}</span>
        <button type="button" onClick={() => void sparaServer(cvRef.current)} className="inline-flex min-h-11 items-center font-semibold text-ink-1 underline underline-offset-4">
          {BYGG.forsokIgen}
        </button>
      </span>
    ) : null

  // Bladet heter som avsnittet på arket (Färdigheter, Om mig).
  const arkRubriker = useMemo(() => Object.fromEntries((matning?.rubriker ?? []).map((x) => [x.sektion, x.text])) as Partial<Record<Sektion, string>>, [matning])

  const blad = ark ? (
    <Blad
      ark={ark}
      cv={cv}
      dator={dator}
      rubriker={arkRubriker}
      onSpara={sparaBlad}
      onTaBort={taBort}
      onOppna={oppnaArk}
      onStang={() => stangArk(false)}
    />
  ) : null

  return (
    <FlowShell
      title={BYGG.titel}
      step={Math.max(1, antalKlara(ren))}
      totalSteps={5}
      utanTillbaka
      utanRaknare
      bred
      status={status}
      exitLabel="Tillbaka till översikten"
    >
      <div className="mx-auto w-full max-w-[1180px] px-3.5 pt-3 lg:px-6">
        {antalSparr ? <PaywallCard variant="cv-antal" className="mb-3" onSecondary={() => router.push('/dashboard/profil/cv')} /> : null}
        <Mallyta
          surface={SURFACE}
          katalog={p.katalog}
          mall={mall}
          onMall={(id) => bytMall(id)}
          val={{ ...val, rubriker }}
          onVal={(v) => bytVal(v)}
          format={format}
          onFormat={(f) => {
            if (f === 'docx' && premiumMall && !p.harWord) setSparr('cv-export-word')
            setFormat(f)
          }}
          forhandsvisning={fv}
          titel={`Ditt CV i mallen ${mall.namn}`}
          foreslagna={forslag.ids}
          skal={SKAL[forslag.skal]}
          kanWord={p.harWord || !premiumMall}
          pris={p.prisLang}
          knapp={{ text: knappText, under: knappUnder, onClick: () => void laddaNer(), framsteg }}
          gratisVag={premiumMall && !p.isPremium ? { mall: gratis, onClick: () => bytMall(gratis.id) } : null}
          fel={
            fel ? (
              <p role="alert" className="text-sm text-fel">
                {fel}
              </p>
            ) : namnKravs ? (
              <NameRequiredNotice
                onSaved={() => {
                  setNamnKravs(false)
                  void laddaNer()
                }}
              />
            ) : null
          }
          rubriker={mini.klar && cvId ? { egen: (s) => Boolean(rubriker[s]), onVal: (s, r) => void sparaRubrik(s, r) } : undefined}
          bygg={{
            onAvsnitt: (s) => oppnaFor(s),
            onHuvud: (_f: HuvudFalt) => oppnaArk({ typ: 'huvud' }),
            valt: arkSektion(ark),
            nyss,
            spok,
            fler: { text: BYGG.fler, onClick: () => oppnaArk({ typ: 'fler' }) },
            tips: { text: BYGG.tips, nyckel: 'jc_bygg_tips_sett' },
          }}
          lucka={lucka}
          utanKnapp={Boolean(ark)}
          ovanRad={ovanRad}
          kolumn={dator && blad ? blad : undefined}
          utanSvep={Boolean(ark)}
          onFoto={() => (fotoUrl ? setFotoArk(true) : foto.valj())}
          fotoPa={Boolean(fotoUrl && val.foto !== false)}
          forvaldUppsattning={forvald}
          last={framsteg !== null}
          lyft={framsteg !== null}
          onMatt={onMatt}
        >
          {foto.filInput}
          <FotoArkInloggad open={fotoArk} onClose={() => setFotoArk(false)} fotoUrl={fotoUrl} onByt={foto.valj} onTaBort={() => void foto.taBort()} fel={foto.fel} />
          {!dator && blad ? blad : null}

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
              sidor={matning?.sidor ?? 1}
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
              sidor={matning?.sidor ?? 1}
              harFoto={Boolean(fotoUrl)}
              kalla={(m) => ({ ...kalla, mall: m, spok: undefined })}
              pris={p.pris}
              kampanj={p.kampanj}
              onKop={(m) => {
                setMerforsaljning(false)
                bytMall(m.id)
                tillKopet(m.id)
              }}
              surface={SURFACE}
            />
          ) : null}
        </Mallyta>

        {p.isAdmin ? (
          <div className="mx-auto mt-2 max-w-[600px] pb-4">
            <button
              type="button"
              onClick={fyllTestdata}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              <IkonBugg size={20} />
              {BYGG.testdata}
            </button>
          </div>
        ) : null}
      </div>

      {start ? (
        <StartBlad
          titel={titel}
          onTitel={(t) => {
            // Spöktexten och rubrikerna följer titeln medan hon skriver (arket väntar 250 ms).
            setTitel(t)
            setCv({ ...cvRef.current, personalInfo: { ...cvRef.current.personalInfo, title: t.trim() || undefined } })
          }}
          sparr={p.sparr}
          mall={mallId}
          onSkriv={() => {
            const t = titel.trim()
            setCv({ ...cvRef.current, personalInfo: { ...cvRef.current.personalInfo, title: t || undefined } })
            setStart(false)
          }}
        />
      ) : null}
    </FlowShell>
  )
}
