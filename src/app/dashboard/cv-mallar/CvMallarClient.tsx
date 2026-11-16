'use client'

/**
 * CV-mallar inloggat (skissen yta 4, plan-mallar 3.2): samma dokument som
 * mallsidan. CV:t är en chip i toppraden (Byt CV-arket), mallen ett svep,
 * formatet och knappen alltid synliga i den fasta raden ovanför bottennavet.
 * Premiummallar går att välja utan lås; köpet kommer vid filen, med
 * gratisvägen som bild. Rubriker och avsnitt byts på dokumentet och sparas
 * på CV:t (cv_texts.section_titles och structured_data). Valet står i
 * adressen (?cv=&mall=).
 *
 * Spärrarna i samma ordning som servern: Word, mallen, gratisnedladdningen.
 * Gratisnedladdningen använd: merförsäljningen med hennes CV i tre andra
 * mallar i stället för en tom vägg (trions beslut om punkt 14).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNotification } from '@/context/notificationcontext'
import GraValSheet from '@/components/paywall/GraValSheet'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import type { Feature, Scope } from '@/lib/access/features'
import type { PaywallVariant } from '@/components/paywall/paywall-copy'
import type { BetalvaggPlats } from '@/lib/analytics/events'
import { capture } from '@/lib/analytics/events'
import type { PlanKey } from '@/lib/plans/plans'
import type { Format, MallKort, MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { foreslagna as raknaForslag } from '@/lib/cv/mallval/forslag'
import { filnamn as gorFilnamn } from '@/lib/cv/mallval/val'
import { forvalFor } from '@/lib/cv/rubriker'
import Mallyta from '@/components/cv/Dokument/Mallyta'
import Ark from '@/components/cv/Dokument/Ark'
import Final from '@/components/cv/Dokument/Final'
import Merforsaljning, { merforsaljningsUrval } from '@/components/cv/Dokument/Merforsaljning'
import { FotoArkInloggad, useFotoInloggad } from '@/components/cv/Dokument/FotoArk'
import { useForhandsvisning, useNedladdning, type Kalla } from '@/components/cv/Dokument/hooks'
import type { Matning } from '@/components/cv/Dokument/matning'
import { BYT_CV, KNAPP, SKAL } from '@/components/cv/Dokument/texter'
import { IkonLas, IkonSida } from '@/components/illustrations/MallIkoner'

export interface InitialCv {
  id: string
  user_id: string
  file_name: string
  original_file_path: string
  cv_text: string
  created_at: string
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

export default function CvMallarClient(p: {
  initialCvs: InitialCv[]
  aktivaCvIds: string[]
  initialIsPremium: boolean
  initialSelectedCvId: string | null
  initialMall: string
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
  kampanj: { pris: string; ordinarie: string } | null
}) {
  const { logActivity } = useNotification()
  const [cvs, setCvs] = useState(p.initialCvs)
  const [cvId, setCvId] = useState<string | null>(p.initialSelectedCvId)
  const [mallId, setMallId] = useState(p.initialMall)
  const [format, setFormat] = useState<Format>(p.initialFormat)
  const [val, setVal] = useState<MallVal>({})
  const [sparr, setSparr] = useState<Sparr | null>(null)
  const [bytCv, setBytCv] = useState(false)
  const [matning, setMatning] = useState<Matning | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [fil, setFil] = useState<{ blob: Blob; url: string; filnamn: string } | null>(null)
  const [merforsaljning, setMerforsaljning] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(p.fotoUrl)
  const [fotoArk, setFotoArk] = useState(false)
  const { framsteg, ladda } = useNedladdning()
  const foto = useFotoInloggad((url) => {
    setFotoUrl(url)
    setVal((v) => ({ ...v, foto: Boolean(url) }))
    setFotoArk(false)
  })

  const cv = cvs.find((c) => c.id === cvId) ?? null
  const cvData = useMemo<CVMetadata | null>(() => (cv ? normalizeStructuredData(cv.structured_data) : null), [cv])
  const mall = p.katalog.find((m) => m.id === mallId) ?? p.katalog[0]
  const premiumMall = mall.niva === 'premium'
  const aktiva = useMemo(() => new Set(p.aktivaCvIds), [p.aktivaCvIds])
  const valMedRubriker: MallVal = { ...val, rubriker: { ...(cv?.section_titles ?? {}), ...(val.rubriker ?? {}) } }

  // Valet i adressen, utan ny navigering.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (cvId) q.set('cv', cvId)
    q.set('mall', mallId)
    q.delete('kop')
    if (format === 'docx') q.set('format', 'docx')
    else q.delete('format')
    window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}`)
  }, [cvId, mallId, format])

  // Köpet som väntar från provsidan eller merförsäljningen (?kop=1).
  useEffect(() => {
    if (!p.kop) return
    if (premiumMall && !p.initialIsPremium) setSparr('mall')
    else if (p.initialFormat === 'docx' && premiumMall && !p.harWord) setSparr('cv-export-word')
    // Bara vid första målningen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kalla: Kalla | null = cv
    ? { typ: 'inloggad', cvId: cv.id, structuredData: cv.structured_data, cvText: cv.cv_text, mall: mall.id, val: valMedRubriker }
    : { typ: 'exempel', mall: mall.id, val }
  const fv = useForhandsvisning(kalla)

  const forslag = useMemo(() => raknaForslag(p.katalog, cvData, matning?.sidor ?? 1), [p.katalog, cvData, matning?.sidor])
  const gratis = p.katalog.find((m) => m.niva === 'gratis' && m.id === forslag.ids[0]) ?? p.katalog.find((m) => m.niva === 'gratis')!
  const forvald = useMemo(() => (cvData ? forvalFor(cvData) : undefined), [cvData])

  // Word i en gratismall är en vanlig gratisexport (ägarens besked 2026-11-16);
  // Word i en premiummall kräver cv_export_word.
  const behoverKop = (premiumMall && !p.initialIsPremium) || (format === 'docx' && premiumMall && !p.harWord)
  const knappText = behoverKop ? KNAPP.laddaNerIPremiumInloggad(format, mall.namn, p.pris) : KNAPP.laddaNer(format)

  /** Merförsäljningen när det finns andra mallar att visa, annars betalväggen. */
  const saljEllerVagg = () => {
    if (merforsaljningsUrval(p.katalog, mall.id, matning?.sidor ?? 1, Boolean(fotoUrl)).length) setMerforsaljning(true)
    else setSparr('cv-export')
  }

  const laddaNer = useCallback(
    async (m: MallKort = mall, f: Format = format) => {
      if (!cv) return
      const tier = m.niva === 'gratis' ? 'free' : 'premium'
      capture('nedladdning_klickad', { mall: m.id, format: f, inloggad: true, surface: SURFACE, tier })
      setFel(null)
      if (f === 'docx' && m.niva === 'premium' && !p.harWord) return setSparr('cv-export-word')
      if (m.niva === 'premium' && !p.initialIsPremium) return setSparr('mall')
      if (p.gratisAnvand) return saljEllerVagg()
      const namn = cvData?.personalInfo.fullName || cv.file_name.replace(/\.[^/.]+$/, '')
      const ut = await ladda({
        mall: m.id,
        format: f,
        val: valMedRubriker,
        cvId: cv.id,
        structuredData: cv.structured_data,
        cvText: cv.cv_text,
        filnamn: gorFilnamn(m.namn, namn, f),
      })
      if (ut.typ === 'klar') {
        setFil(ut)
        void logActivity('cv_generated', 'skapade ett professionellt CV', { template: m.id, format: f, cv_id: cv.id, file_name: ut.filnamn })
      } else if (ut.typ === 'sparr') {
        const s = ut.feature ? SPARR_FOR_FEATURE[ut.feature] : null
        if (s === 'cv-export' || !s) saljEllerVagg()
        else setSparr(s)
      } else if (ut.typ === 'namn') {
        setNamnKravs(true)
      } else {
        setFel(ut.text)
      }
    },
    // valMedRubriker räknas om varje render; beroendena nedan räcker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cv, cvData, mall, format, val, p.harWord, p.initialIsPremium, p.gratisAnvand, ladda, logActivity]
  )

  const sparaRubrik = async (s: Sektion, r: string | null) => {
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

  const sparaCv = async (ny: CVMetadata) => {
    if (!cv) return
    setCvs((l) => l.map((c) => (c.id === cv.id ? { ...c, structured_data: ny } : c)))
    await fetch('/api/cv/strukturerad', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvId: cv.id, cv: ny }),
    }).catch(() => null)
  }

  const namnPaCv = (c: InitialCv) => c.file_name.replace(/\.[^/.]+$/, '')

  const topp = (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => setBytCv(true)}
        aria-haspopup="dialog"
        className="inline-flex h-9 min-w-0 max-w-[75%] items-center gap-1.5 rounded-full border border-kant-stark bg-papper px-3 text-[13px] font-semibold text-ink-1 hover:border-ink-1"
      >
        <IkonSida size={14} className="shrink-0" />
        <span className="truncate">{cv ? BYT_CV.chip(namnPaCv(cv)) : BYT_CV.rubrik}</span>
      </button>
      <span className="hidden text-meta text-ink-3 min-[900px]:inline">{mall.namn}</span>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3.5 pb-6 pt-3 lg:px-6">
      <Mallyta
        surface={SURFACE}
        katalog={p.katalog}
        mall={mall}
        onMall={(id) => setMallId(id)}
        val={val}
        onVal={(v) => setVal(v)}
        format={format}
        onFormat={(f) => {
          if (f === 'docx' && premiumMall && !p.harWord) setSparr('cv-export-word')
          setFormat(f)
        }}
        forhandsvisning={fv}
        titel={cv ? `${namnPaCv(cv)} i mallen ${mall.namn}` : `Exempel-CV i mallen ${mall.namn}`}
        foreslagna={forslag.ids}
        skal={SKAL[forslag.skal]}
        topp={topp}
        kanWord={Boolean(p.harWord) || !premiumMall}
        pris={p.pris}
        knapp={{ text: knappText, onClick: () => void laddaNer(), framsteg, disabled: !cv }}
        gratisVag={premiumMall && !p.initialIsPremium ? { mall: gratis, onClick: () => setMallId(gratis.id) } : null}
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
        rubriker={cv ? { egen: (s) => Boolean(cv.section_titles?.[s] || val.rubriker?.[s]), onVal: (s, r) => void sparaRubrik(s, r) } : undefined}
        avsnitt={cvData ? { cv: cvData, onSpara: (n) => void sparaCv(n) } : undefined}
        onFoto={() => (fotoUrl ? setFotoArk(true) : foto.valj())}
        fotoPa={Boolean(fotoUrl && val.foto !== false)}
        forvaldUppsattning={forvald}
        ovanNav
        last={framsteg !== null}
        lyft={framsteg !== null}
        onMatt={setMatning}
      >
        {foto.filInput}
        <FotoArkInloggad open={fotoArk} onClose={() => setFotoArk(false)} fotoUrl={fotoUrl} onByt={foto.valj} onTaBort={() => void foto.taBort()} fel={foto.fel} />

        <Ark open={bytCv} onClose={() => setBytCv(false)} rubrik={BYT_CV.rubrik} under={BYT_CV.under}>
          {cvs.length === 0 ? (
            <div className="grid gap-2 pb-2">
              <p className="text-sm text-ink-2">{BYT_CV.tomt}</p>
              <a href="/dashboard/profil/cv" className="inline-flex h-11 items-center justify-center rounded-xl bg-ink-1 text-sm font-semibold text-papper">
                {BYT_CV.ladda}
              </a>
              <a href="/dashboard/skapa-cv" className="inline-flex h-11 items-center justify-center rounded-xl border border-kant-stark text-sm font-semibold text-ink-1">
                {BYT_CV.skapa}
              </a>
            </div>
          ) : (
            <ul className="grid gap-2 pb-2">
              {cvs.map((c) => {
                const last = !aktiva.has(c.id)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={last}
                      onClick={() => {
                        setCvId(c.id)
                        setVal({})
                        setBytCv(false)
                      }}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-2.5 text-left ${
                        c.id === cvId ? 'border-2 border-koppar' : 'border-kant hover:border-ink-1'
                      } disabled:opacity-60`}
                    >
                      <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-[3px] border border-kant bg-white text-ink-3">
                        {last ? <IkonLas size={16} /> : <IkonSida size={16} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-1">{namnPaCv(c)}</span>
                        <span className="block text-meta text-ink-3">
                          {last ? BYT_CV.last : new Date(c.created_at).toLocaleDateString('sv-SE')}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Ark>

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
              setSparr('cv-export')
            }}
            surface={SURFACE}
          />
        ) : null}
      </Mallyta>
    </div>
  )
}
