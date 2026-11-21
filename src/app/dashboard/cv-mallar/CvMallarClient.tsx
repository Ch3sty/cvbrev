'use client'

/**
 * Mallar i CV-rummet (omgång 1, steg 2, byggspecen avsnitt 5 och 6): samma
 * CV i alla mallar, i testernas formspråk. Ytan ritas av MallarVy; här bor
 * datan, valen och vad knapparna gör.
 *
 * - CV:t är det som är valt i rummet (?cv=, aldrig ett låst), byts i Byt
 *   CV-arket utan omladdning. Utan CV: exempel-CV:t, nedladdningen avstängd
 *   och de två vägarna in (ladda upp eller skriv från början).
 * - Premiummallar går att välja utan lås; köpet kommer vid filen.
 * - Texten ändras i arbetsläget (steg 3): "Ändra texten" och ett tryck på ett
 *   avsnitt på arket länkar dit (kontraktet i byggspecen 10b). Rubrikbytet
 *   (RubrikArk) stannar här.
 * - Mallbytet: ingen fördröjning vid klick, 250 ms vid svep och pil.
 *   Föreslagna och grannarna hämtas när sidan är ledig, mallen under pekaren
 *   direkt. Minnet delas med miniatyrerna och töms när CV:t byts eller ändras.
 * - Spärrarna i samma ordning som servern: Word, mallen, gratisnedladdningen.
 *   Gratisnedladdningen använd: merförsäljningen med hennes CV i tre andra
 *   mallar. Alla i CV-rummets utseende, med dagens texter och mätning.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/context/notificationcontext'
import GraValSheet from '@/components/paywall/GraValSheet'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import type { Feature, Scope } from '@/lib/access/features'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import type { BetalvaggPlats } from '@/lib/analytics/events'
import { capture } from '@/lib/analytics/events'
import { SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import type { Format, MallKort, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { foreslagna as raknaForslag } from '@/lib/cv/mallval/forslag'
import { filnamn as gorFilnamn } from '@/lib/cv/mallval/val'
import { forvalFor } from '@/lib/cv/rubriker'
import Final from '@/components/cv/Dokument/Final'
import Merforsaljning, { merforsaljningsUrval } from '@/components/cv/Dokument/Merforsaljning'
import RubrikArk from '@/components/cv/Dokument/RubrikArk'
import Remsa from '@/components/cv/Dokument/Remsa'
import AllaArk from '@/components/cv/Dokument/AllaArk'
import Verktygsrad, { type Valhandelse } from '@/components/cv/Dokument/Verktygsrad'
import { FotoArkInloggad, useFotoInloggad } from '@/components/cv/Dokument/FotoArk'
import { rensaForhandsvisningar, useForhandsvisning, useNedladdning, type Kalla } from '@/components/cv/Dokument/hooks'
import { begarEgnaMallar, type EgetCv } from '@/components/cv/Dokument/egnaMallar'
import type { HuvudFalt, Matning } from '@/components/cv/Dokument/matning'
import { FOTO_ARK, KNAPP, SKAL } from '@/components/cv/Dokument/texter'
import { IkonFoto } from '@/components/illustrations/MallIkoner'
import { scheduleIdle } from '@/lib/scheduleIdle'
import CvRad from '@/components/cv/rum3/CvRad'
import { cvListaUr } from '@/components/cv/rum3/cvLista'
import { arbetslageHref, type ArbetsAvsnitt } from '@/components/cv/rum3/flikar'
import { valTillQuery } from '@/lib/cv/mallar/val'
import MallarVy, { AndraBricka, type Byte } from '@/components/cv/rum3/mallar/MallarVy'
import { useSiffrorKvar } from '@/components/cv/rum3/SiffrorKvar'
import { platshallareIRad } from '@/lib/cv/poang'
import type { CvSparrData } from '@/components/cv/rum3/sparr/CvSparr'

export interface InitialCv {
  id: string
  user_id: string
  file_name: string
  original_file_path: string
  cv_text: string
  created_at: string
  updated_at?: string | null
  structured_data: unknown
  section_titles?: Partial<Record<Sektion, string>> | null
}

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

const SURFACE = 'galleri'

/** Avsnittet på arket i arbetslägets ord (kontraktet i byggspecen 10b). */
function avsnittFor(s: Sektion): ArbetsAvsnitt {
  return s === 'profil' || s === 'erfarenhet' || s === 'utbildning' || s === 'kompetenser' || s === 'sprak' ? s : 'fler'
}

export default function CvMallarClient(p: {
  initialCvs: InitialCv[]
  /** CV utanför gratisnivåns aktiva (Byt CV visar dem låsta). */
  lastaIds: string[]
  initialIsPremium: boolean
  initialSelectedCvId: string | null
  initialMall: string
  /** Valen ur adressen (eller sparade på ett byggt CV); följer med till arbetsläget och tillbaka. */
  initialVal: MallVal
  initialFormat: Format
  kop: boolean
  katalog: readonly MallKort[]
  harWord?: boolean
  gratisAnvand?: boolean
  scope?: Scope | null
  track?: Scope | null
  planKey?: PlanKey | null
  fotoUrl: string | null
  pris: string
  /** Lång form ("..., sedan 149 kr i månaden" under kampanjen). */
  prisLang: string
  kampanj: { pris: string; ordinarie: string } | null
  /** ?ladda=1: tillbaka från kassan, nedladdningen startar (affärsgranskningen B2). */
  ladda: boolean
  /** ?foto=1: kontot skapades via fotoarket (B4). */
  foto: boolean
  /** Gratisnivåns CV-kvot är full (Ett CV till visar betalväggen). */
  fullt: boolean
  /** Plus i analysen per CV (potentialen minus poängen), för spärrens talruta. */
  plusPerCv: Record<string, number>
  /** Dokumentets väg per CV, för målgången. */
  vagPerCv: Record<string, { uppladdat: 'uppladdat' | 'utkast'; analyserat: boolean; atgardat: boolean }>
  /** Läsbarhetspoängen per CV, för Byt CV-arket. */
  poangPerCv: Record<string, number>
}) {
  const router = useRouter()
  const { logActivity } = useNotification()
  const kampanjPris = useKampanjPris()
  const [cvs, setCvs] = useState(p.initialCvs)
  const [cvId, setCvId] = useState<string | null>(p.initialSelectedCvId)
  const [mallId, setMallId] = useState(p.initialMall)
  const [fordrojning, setFordrojning] = useState(0)
  const [format, setFormat] = useState<Format>(p.initialFormat)
  const [val, setVal] = useState<MallVal>(p.initialVal)
  const [sparr, setSparr] = useState<Sparr | null>(null)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [fil, setFil] = useState<{ blob: Blob; url: string; filnamn: string } | null>(null)
  const [merforsaljning, setMerforsaljning] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(p.fotoUrl)
  const [fotoArk, setFotoArk] = useState(false)
  const [allaArk, setAllaArk] = useState(false)
  const [fotoRad, setFotoRad] = useState(p.foto)
  const [rubrik, setRubrik] = useState<{ sektion: Sektion; text: string } | null>(null)
  const { framsteg, ladda } = useNedladdning()
  const foto = useFotoInloggad((url) => {
    setFotoUrl(url)
    setFotoRad(false)
    setVal((v) => ({ ...v, foto: Boolean(url) }))
    setFotoArk(false)
  })

  const cv = cvs.find((c) => c.id === cvId) ?? null
  const cvData = useMemo<CVMetadata | null>(() => (cv ? normalizeStructuredData(cv.structured_data) : null), [cv])
  const mall = p.katalog.find((m) => m.id === mallId) ?? p.katalog[0]
  const mallIndex = p.katalog.indexOf(mall)
  const premiumMall = mall.niva === 'premium'
  const tier = premiumMall ? 'premium' : 'free'
  const lasta = useMemo(() => new Set(p.lastaIds), [p.lastaIds])
  const valMedRubriker: MallVal = useMemo(
    () => ({ ...val, rubriker: { ...(cv?.section_titles ?? {}), ...(val.rubriker ?? {}) } }),
    [val, cv?.section_titles]
  )

  // Hennes CV för miniatyrerna: samma val som arket, så att minnet delas.
  const egetCv: EgetCv | null = useMemo(
    () => (cv ? { cvId: cv.id, structuredData: cv.structured_data, cvText: cv.cv_text, val: valMedRubriker } : null),
    [cv, valMedRubriker]
  )

  // Valet i adressen, utan ny navigering.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (cvId) q.set('cv', cvId)
    else q.delete('cv')
    q.set('mall', mallId)
    q.delete('kop')
    q.delete('ladda')
    q.delete('foto')
    q.delete('premium_activated')
    if (format === 'docx') q.set('format', 'docx')
    else q.delete('format')
    q.delete('andra')
    valTillQuery(val, q)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${q.toString()}`)
  }, [cvId, mallId, format, val])

  /** Köpreturen: galleriet med CV, mall och format, dit kassan skickar tillbaka. */
  const returFor = (mallId: string, f: Format = format) =>
    `/dashboard/cv-mallar?${new URLSearchParams({ ...(cvId ? { cv: cvId } : {}), mall: mallId, format: f }).toString()}`
  /** Direkt till köpsteget med mallen, ingen extra vägg efter ett ja (affärsgranskningen B3). */
  const tillKopet = (mallId: string, f: Format = format) =>
    window.location.assign(kopstegHref(SALD_PLAN, 'mall', { mall: mallId, retur: returFor(mallId, f) }))

  // Köpet som väntar från en äldre länk (?kop=1): direkt till köpsteget.
  useEffect(() => {
    if (!p.kop) return
    if ((premiumMall && !p.initialIsPremium) || (p.initialFormat === 'docx' && premiumMall && !p.harWord)) tillKopet(mall.id, p.initialFormat)
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kalla: Kalla = cv
    ? { typ: 'inloggad', cvId: cv.id, structuredData: cv.structured_data, cvText: cv.cv_text, mall: mall.id, val: valMedRubriker }
    : { typ: 'exempel', mall: mall.id, val }
  const fv = useForhandsvisning(kalla, { fordrojning })

  // Minnet: bara det här CV:t i sin nuvarande version (byggspecen 6 punkt 6).
  const cvAvtryck = cv ? `${cv.id}|${cv.updated_at ?? ''}|${JSON.stringify(cv.structured_data ?? null).length}` : ''
  useEffect(() => {
    if (kalla.typ === 'inloggad') rensaForhandsvisningar(kalla)
    // Källan för CV:t i dess nuvarande version räcker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvAvtryck])

  const forslag = useMemo(() => raknaForslag(p.katalog, cvData, matning?.sidor ?? 1, 3, Boolean(fotoUrl)), [p.katalog, cvData, matning?.sidor, fotoUrl])
  const gratis = p.katalog.find((m) => m.niva === 'gratis' && m.id === forslag.ids[0]) ?? p.katalog.find((m) => m.niva === 'gratis')!
  const forvald = useMemo(() => (cvData ? forvalFor(cvData) : undefined), [cvData])

  // Hämta i förväg när sidan är ledig: de föreslagna och grannarna till vald mall.
  useEffect(() => {
    if (!egetCv) return
    const n = p.katalog.length
    const grannar = [p.katalog[(mallIndex + 1) % n].id, p.katalog[(mallIndex - 1 + n) % n].id]
    return scheduleIdle(() => begarEgnaMallar(egetCv, [...forslag.ids, ...grannar]), 1500)
  }, [egetCv, mallIndex, forslag.ids, p.katalog])

  // Mätningen som förut (Mallyta): förslagen en gång, mallen och sidantalet per mall.
  const forslagSett = useRef(false)
  useEffect(() => {
    if (forslagSett.current || forslag.ids.length === 0) return
    forslagSett.current = true
    capture('forslag_visad', { grupp: 'foreslagna', templates: forslag.ids.join(','), surface: SURFACE })
  }, [forslag.ids])
  const visad = useRef<string | null>(null)
  const onMatt = (m: Matning) => {
    setMatning(m)
    if (visad.current !== mall.id) {
      visad.current = mall.id
      capture('mall_visad', { template: mall.id, tier, har_word: mall.word, surface: SURFACE, index: mallIndex })
      capture('sidantal_visat', { template: mall.id, tier, sidor: m.sidor, surface: SURFACE })
    }
  }

  const valjMall = (id: string, byte: Byte) => {
    if (id === mall.id) return
    const m = p.katalog.find((k) => k.id === id)
    if (!m) return
    const fi = forslag.ids.indexOf(id)
    const t = m.niva === 'gratis' ? 'free' : 'premium'
    if (fi >= 0) capture('forslag_vald', { grupp: 'foreslagna', position: fi, template: id, tier: t, surface: SURFACE })
    capture('mall_bytt', { template: id, method: byte, tier: t, har_word: m.word, surface: SURFACE, index: p.katalog.indexOf(m) })
    // Ingen fördröjning vid klick; snabb bläddring (svep, pil) väntar 250 ms.
    setFordrojning(byte === 'svep' || byte === 'pil' ? 250 : 0)
    setMallId(id)
  }

  const onVal = (v: MallVal, h: Valhandelse) => {
    if (h.typ === 'typsnitt') capture('typsnitt_bytt', { font: h.font, surface: SURFACE, template: mall.id, tier })
    if (h.typ === 'farg') capture('farg_bytt', { template: mall.id, tier, farg: h.farg, surface: SURFACE })
    if (h.typ === 'ordning') capture('ordning_bytt', { template: mall.id, tier, ordning: h.ordning, surface: SURFACE })
    setFordrojning(0)
    setVal(v)
  }

  // Word i en gratismall är en vanlig gratisexport (ägarens besked 2026-11-16);
  // Word i en premiummall kräver cv_export_word.
  const behoverKop = (premiumMall && !p.initialIsPremium) || (format === 'docx' && premiumMall && !p.harWord)
  const knappText = behoverKop ? KNAPP.laddaNerIMall(format, mall.namn) : KNAPP.laddaNer(format)
  const knappUnder = behoverKop ? KNAPP.premiumPris(p.pris) : undefined

  // Tillbaka från kassan (?ladda=1): nedladdningen startar en gång, när
  // dokumentet är mätt och kontot har mallen (affärsgranskningen B2).
  const laddaStartad = useRef(false)
  useEffect(() => {
    if (!p.ladda || laddaStartad.current || !matning || !cv) return
    if (premiumMall && !p.initialIsPremium) return
    laddaStartad.current = true
    void laddaNer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matning, cv])

  /** Merförsäljningen när det finns andra mallar att visa, annars betalväggen. */
  const saljEllerVagg = () => {
    if (merforsaljningsUrval(p.katalog, mall.id, matning?.sidor ?? 1, Boolean(fotoUrl)).length) setMerforsaljning(true)
    else setSparr('cv-export')
  }

  // [antal] kvar i CV:t: raden vid knappen och arket före filen (efterrättning A).
  const platshallare = useMemo(() => (cv ? platshallareIRad(cv.structured_data, cv.cv_text) : []), [cv])
  const forstaMedSiffra = platshallare[0]?.avsnitt
  const siffror = useSiffrorKvar(
    platshallare,
    cv && forstaMedSiffra ? { href: arbetslageHref(cv.id, 'mallar', { avsnitt: forstaMedSiffra, mall: mallId, val }) } : null
  )

  const skapaFil = useCallback(
    async (m: MallKort, f: Format) => {
      if (!cv) return
      const namn = cvData?.personalInfo.fullName || cv.file_name.replace(/\.[^/.]+$/, '')
      const ut = await ladda({
        mall: m.id,
        format: f,
        val: valMedRubriker,
        cvId: cv.id,
        structuredData: cv.structured_data,
        cvText: cv.cv_text,
        filnamn: gorFilnamn(m.namn, namn, f),
        entry: SURFACE,
      })
      if (ut.typ === 'klar') {
        setFil(ut)
        void logActivity('cv_generated', 'skapade ett professionellt CV', { template: m.id, format: f, cv_id: cv.id, file_name: ut.filnamn })
      } else if (ut.typ === 'sparr') {
        const s = ut.feature ? SPARR_FOR_FEATURE[ut.feature] : null
        if (s === 'cv-export' || !s) saljEllerVagg()
        else tillKopet(m.id, f)
      } else if (ut.typ === 'namn') {
        setNamnKravs(true)
      } else {
        setFel(ut.text)
      }
    },
    // valMedRubriker räknas ur val och CV:t; beroendena nedan räcker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cv, cvData, valMedRubriker, ladda, logActivity]
  )

  const laddaNer = useCallback(
    async (m: MallKort = mall, f: Format = format) => {
      if (!cv) return
      const t = m.niva === 'gratis' ? 'free' : 'premium'
      capture('nedladdning_klickad', { template: m.id, format: f, inloggad: true, surface: SURFACE, tier: t })
      setFel(null)
      if (f === 'docx' && m.niva === 'premium' && !p.harWord) return setSparr('cv-export-word')
      if (m.niva === 'premium' && !p.initialIsPremium) return setSparr('mall')
      if (p.gratisAnvand) return saljEllerVagg()
      // Samma väg för PDF och Word: arket frågar först, Ladda ner ändå fortsätter här.
      if (siffror.stoppa(() => void skapaFil(m, f))) return
      await skapaFil(m, f)
    },
    // saljEllerVagg läser bara mallen och sidantalet; beroendena nedan räcker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cv, mall, format, p.harWord, p.initialIsPremium, p.gratisAnvand, siffror.stoppa, skapaFil]
  )

  const sparaRubrik = async (s: Sektion, r: string | null) => {
    setFordrojning(0)
    setVal((v) => {
      const rub = { ...(v.rubriker ?? {}) }
      if (r === null) delete rub[s]
      else rub[s] = r
      return { ...v, rubriker: rub }
    })
    if (!cv) return
    const res = await fetch('/api/cv/section-titles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvId: cv.id, rubriker: { [s]: r } }),
    }).catch(() => null)
    if (res?.ok) {
      const j = (await res.json().catch(() => ({}))) as { rubriker?: Partial<Record<Sektion, string>> }
      setCvs((l) => l.map((c) => (c.id === cv.id ? { ...c, section_titles: j.rubriker ?? null } : c)))
      setVal((v) => {
        const rub = { ...(v.rubriker ?? {}) }
        delete rub[s]
        return { ...v, rubriker: rub }
      })
    }
  }

  const namnPaCv = (c: InitialCv) => c.file_name.replace(/\.[^/.]+$/, '')

  /** Byt CV i arket: utan omladdning, valen nollställs. */
  const bytCv = (id: string) => {
    if (id === cvId || lasta.has(id)) return
    setCvId(id)
    setVal({})
    setMatning(null)
    setFordrojning(0)
    visad.current = null
  }
  const borttaget = (id: string) => {
    const kvar = cvs.filter((c) => c.id !== id)
    setCvs(kvar)
    if (id === cvId) {
      const nasta = kvar.find((c) => !lasta.has(c.id))?.id ?? null
      setCvId(nasta)
      setVal({})
      setMatning(null)
    }
    router.refresh()
  }

  const arbetslage = (avsnitt?: ArbetsAvsnitt) => (cv ? arbetslageHref(cv.id, 'mallar', { avsnitt, mall: mall.id, val }) : null)
  const tillArbetslaget = (avsnitt: ArbetsAvsnitt) => {
    const href = arbetslage(avsnitt)
    if (href) router.push(href)
  }

  const kop = () => {
    capture('paywall_cta_clicked', {
      variant: 'mall',
      surface: '/dashboard/cv-mallar',
      cta: 'primary',
      plan: SALD_PLAN,
      plats: 'mall',
      kampanj: kampanjPris?.nyckel ?? null,
      template: mall.id,
      tier,
    })
    tillKopet(mall.id)
  }

  const fotoTopp = fotoRad ? (
    <div className="cv3m-fotorad">
      <span>{FOTO_ARK.nu}</span>
      <button type="button" onClick={foto.valj} className="cv3-glas">
        <IkonFoto size={16} />
        {FOTO_ARK.valj}
      </button>
    </div>
  ) : null

  const verktyg = (forst: boolean) => (
    <Verktygsrad
      brickor
      forst={forst && cv ? <AndraBricka href={arbetslage('kontakt')!} /> : null}
      mall={mall}
      val={valMedRubriker}
      onVal={onVal}
      onFoto={() => (fotoUrl ? setFotoArk(true) : foto.valj())}
      fotoPa={Boolean(fotoUrl && val.foto !== false)}
      last={framsteg !== null}
      forvaldUppsattning={forvald}
    />
  )

  const cvSparr: CvSparrData = {
    mall,
    cv: egetCv,
    antalMallar: p.katalog.length,
    antalWord: p.katalog.filter((m) => m.word).length,
    plusPoang: cv && p.plusPerCv[cv.id] ? p.plusPerCv[cv.id] : null,
    fria: p.katalog.filter((m) => m.niva === 'gratis'),
  }

  const lista = useMemo(() => cvListaUr(cvs, lasta, p.poangPerCv), [cvs, lasta, p.poangPerCv])

  return (
    <MallarVy
      katalog={p.katalog}
      mall={mall}
      cv={egetCv}
      cvId={cvId}
      cvRad={
        <CvRad
          cvs={lista}
          aktivtId={cvId}
          sida="mallar"
          fullt={p.fullt}
          onValj={bytCv}
          onBorttaget={borttaget}
          utanRad={cvs.length === 0}
        />
      }
      foreslagna={forslag.ids}
      skal={SKAL[forslag.skal]}
      forhandsvisning={fv}
      titel={cv ? `${namnPaCv(cv)} i mallen ${mall.namn}` : `Exempel-CV i mallen ${mall.namn}`}
      onMall={valjMall}
      onPeka={(id) => {
        if (egetCv && id !== mall.id) begarEgnaMallar(egetCv, [id], true)
      }}
      verktyg={verktyg(true)}
      verktygMobil={verktyg(true)}
      onRubrik={cv ? (s, text) => setRubrik({ sektion: s, text }) : undefined}
      onAvsnitt={cv ? (s) => tillArbetslaget(avsnittFor(s)) : undefined}
      onHuvud={cv ? (_f: HuvudFalt) => tillArbetslaget('kontakt') : undefined}
      format={format}
      onFormat={(f) => {
        if (f === 'docx' && premiumMall && !p.harWord) setSparr('cv-export-word')
        setFormat(f)
      }}
      kanWord={Boolean(p.harWord) || !premiumMall}
      knapp={{ text: knappText, under: knappUnder, onClick: () => void laddaNer(), framsteg, disabled: !cv }}
      pamin={siffror.rad}
      gratisVag={cv && premiumMall && !p.initialIsPremium ? { mall: gratis, onClick: () => valjMall(gratis.id, 'tryck') } : null}
      premium={p.initialIsPremium}
      onKop={kop}
      onMatt={onMatt}
      sidor={matning?.sidor ?? 1}
      last={framsteg !== null}
      lyft={framsteg !== null}
      topp={fotoTopp}
      helskarmRemsa={
        <Remsa katalog={p.katalog} vald={mall.id} foreslagna={forslag.ids} onValj={(id) => valjMall(id, 'tryck')} onAlla={() => setAllaArk(true)} last={framsteg !== null} kompakt />
      }
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
    >
      {foto.filInput}
      {siffror.ark}
      <FotoArkInloggad open={fotoArk} onClose={() => setFotoArk(false)} fotoUrl={fotoUrl} onByt={foto.valj} onTaBort={() => void foto.taBort()} fel={foto.fel} />

      {/* "Alla 40" i helskärmens remsa: samma ark som den publika ytan, ovanpå helskärmen. */}
      <AllaArk
        open={allaArk}
        onClose={() => setAllaArk(false)}
        katalog={p.katalog}
        vald={mall.id}
        foreslagna={forslag.ids}
        onValj={(id) => valjMall(id, 'lista')}
      />

      {cv && rubrik ? (
        <RubrikArk
          sektion={rubrik.sektion}
          nuvarande={valMedRubriker.rubriker?.[rubrik.sektion] ?? rubrik.text}
          egenVald={Boolean(cv.section_titles?.[rubrik.sektion] || val.rubriker?.[rubrik.sektion])}
          onVal={(s, r, k) => {
            capture('rubrik_bytt', { template: mall.id, tier, sektion: s, val: r === null ? 'standard' : k, surface: SURFACE })
            void sparaRubrik(s, r)
          }}
          onClose={() => setRubrik(null)}
        />
      ) : null}

      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature={SPARR[sparr].feature}
          variant={sparr as PaywallVariant}
          scope={p.scope ?? null}
          track={p.track ?? null}
          planKey={p.planKey ?? null}
          surface="/dashboard/cv-mallar"
          plats={SPARR[sparr].plats}
          mall={{ id: mall.id, tier, retur: returFor(mall.id) }}
          cvSparr={cvSparr}
          onSecondary={() => {
            setSparr(null)
            valjMall(gratis.id, 'tryck')
          }}
        />
      ) : null}

      {fil && cv ? (
        <Final
          open
          onClose={() => setFil(null)}
          fil={fil}
          mall={mall}
          format={format}
          sidor={matning?.sidor ?? 1}
          cvId={cv.id}
          titel={cvData?.personalInfo.title || cvData?.experience[0]?.position}
          ort={cvData?.personalInfo.address || cvData?.personalInfo.location}
          surface={SURFACE}
          cv={egetCv}
          vag={p.vagPerCv[cv.id] ?? null}
        />
      ) : null}

      {merforsaljning && cv ? (
        <Merforsaljning
          open
          onClose={() => setMerforsaljning(false)}
          katalog={p.katalog}
          nuvarande={mall}
          filnamn={gorFilnamn(mall.namn, cvData?.personalInfo.fullName || namnPaCv(cv), format)}
          sidor={matning?.sidor ?? 1}
          harFoto={Boolean(fotoUrl)}
          kalla={(m) => ({ typ: 'inloggad', cvId: cv.id, structuredData: cv.structured_data, cvText: cv.cv_text, mall: m, val: valMedRubriker })}
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
    </MallarVy>
  )
}

