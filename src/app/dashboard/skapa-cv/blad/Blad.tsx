'use client'

/**
 * Bladen i CV-byggaren (skissen yta 3, UX-briefen "Fält per ark"). Ett blad
 * per avsnitt eller post; fälten bor i lokalt tillstånd och når CV:t först
 * vid Spara, så dokumentet ritas om en gång per sparning, aldrig per tangent.
 * Laddas lat: inget av det här behövs för första målningen.
 */
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { CVEducation, CVExperience, CVLanguage } from '@/lib/cv/cv-metadata'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import type { ArkVal, PostSektion } from '@/lib/cv/bygg/ark'
import { guidadPlats, harInnehall, kompetenslista, medKompetenser, type ByggCv } from '@/lib/cv/bygg/modell'
import { MANADSNAMN, arPagaende, skrivDatum, tolkaDatum, type ManadAr } from '@/lib/cv/bygg/datum'
import { PROFILRAD, spokFor } from '@/lib/cv/bygg/spok'
import { periodErfarenhet, periodUtbildning } from '@/lib/cv/mallar/innehall'
import { capture } from '@/lib/analytics/events'
import { LANK_FEL } from '@/components/shell/knappar'
import { IkonPenna, IkonStang } from '@/components/illustrations/MallIkoner'
import { AVSNITT, HUVUD } from '@/components/cv/Dokument/texter'
import Ram from './Ram'
import { CoachKnapp, CoachRad, Skrivrader, useJobbcoach } from './Jobbcoach'
import { BLAD, COACH, ERF, FLER_BLAD, HUVUD_BLAD, KOMP, PROFIL_BLAD, SPRAK, UTB, sektionsnamn } from '../texter'

export type Metod = 'manuell' | 'jobbcoach'

/** Rubrikerna som arket visar (mallen och rubrikuppsättningen), så att bladet heter som avsnittet. */
const Rubriker = createContext<Partial<Record<Sektion, string>>>({})
function useNamn() {
  const r = useContext(Rubriker)
  return (s: Sektion) => r[s]?.trim() || sektionsnamn(s)
}

export interface BladProps {
  ark: ArkVal
  cv: ByggCv
  dator: boolean
  onSpara: (ny: ByggCv, sektion: Sektion | 'huvud', metod: Metod) => void
  onTaBort: (ny: ByggCv, sektion: Sektion, text: string) => void
  onOppna: (a: ArkVal) => void
  onStang: () => void
  /** Rubrikerna på arket, ur mätningen av dokumentet. */
  rubriker?: Partial<Record<Sektion, string>>
}

const FALT =
  'h-11 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none focus:border-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--fokus)] aria-[invalid=true]:border-fel'
const YTA =
  'block min-h-28 w-full rounded-[10px] border border-kant-stark bg-papper px-3 py-2 text-[15px] leading-6 text-ink-1 outline-none focus:border-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--fokus)]'
const SPARA =
  'knapp-primar inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-[15px] font-semibold disabled:opacity-50'
const STRECKAD =
  'inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-kant-stark text-sm font-semibold text-ink-2 hover:border-ink-1'

function Falt({ etikett, hint, fel, id, children }: { etikett: string; hint?: string; fel?: string | null; id: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
        {etikett}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-meta text-ink-3">
          {hint}
        </p>
      ) : null}
      {fel ? (
        <p id={`${id}-fel`} className="text-sm text-fel">
          {fel}
        </p>
      ) : null}
    </div>
  )
}

function under(s: Sektion): string | undefined {
  const plats = guidadPlats(s)
  return plats ? BLAD.avsnittAv(plats, 5) : BLAD.valfritt
}

const rader = (t: string) =>
  t
    .split('\n')
    .map((r) => r.replace(/^[-•*·]\s*/, '').trim())
    .filter(Boolean)

/* ------------------------------------------------------------ månad och år */

function ManadArFalt({ id, etikett, varde, onChange, avstangd }: { id: string; etikett: string; varde: ManadAr; onChange: (v: ManadAr) => void; avstangd?: boolean }) {
  const arFel = varde.ar && !/^\d{4}$/.test(varde.ar) ? ERF.arFel : null
  return (
    <fieldset className="grid gap-1" disabled={avstangd}>
      <legend className="mb-1 text-[13px] font-medium text-ink-2">{etikett}</legend>
      <div className="grid grid-cols-[1fr_5.5rem] gap-2">
        <label className="sr-only" htmlFor={`${id}-m`}>
          {`${etikett}, ${ERF.manad.toLowerCase()}`}
        </label>
        <select
          id={`${id}-m`}
          className={`${FALT} disabled:opacity-50`}
          value={varde.manad ?? ''}
          onChange={(e) => onChange({ ...varde, manad: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">{ERF.manad}</option>
          {MANADSNAMN.map((m, i) => (
            <option key={m} value={i + 1}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}-a`}>
          {`${etikett}, ${ERF.ar.toLowerCase()}`}
        </label>
        <input
          id={`${id}-a`}
          className={`${FALT} disabled:opacity-50`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder={ERF.ar}
          aria-invalid={Boolean(arFel)}
          aria-describedby={arFel ? `${id}-a-fel` : undefined}
          value={varde.ar}
          onChange={(e) => onChange({ ...varde, ar: e.target.value.replace(/\D/g, '').slice(0, 4) })}
        />
      </div>
      {arFel ? (
        <p id={`${id}-a-fel`} className="text-sm text-fel">
          {arFel}
        </p>
      ) : null}
    </fieldset>
  )
}

/* ------------------------------------------------------------------- huvud */

function HuvudBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const pi = cv.personalInfo
  const [f, setF] = useState({
    namn: pi.fullName ?? '',
    titel: pi.title ?? '',
    epost: pi.email ?? '',
    telefon: pi.phone ?? '',
    ort: pi.address || pi.location || '',
    linkedin: pi.linkedin || pi.linkedIn || '',
  })
  const [visaFel, setVisaFel] = useState(false)
  const namnFel = visaFel && !f.namn.trim() ? HUVUD_BLAD.namnFel : null
  const epostFel = visaFel && !/^\S+@\S+\.\S+$/.test(f.epost.trim()) ? HUVUD_BLAD.epostFel : null
  const spara = () => {
    if (!f.namn.trim() || !/^\S+@\S+\.\S+$/.test(f.epost.trim())) return setVisaFel(true)
    onSpara(
      {
        ...cv,
        personalInfo: {
          ...pi,
          fullName: f.namn.trim(),
          title: f.titel.trim() || undefined,
          email: f.epost.trim(),
          phone: f.telefon.trim() || undefined,
          address: f.ort.trim() || undefined,
          location: f.ort.trim() || undefined,
          linkedin: f.linkedin.trim() || undefined,
          linkedIn: f.linkedin.trim() || undefined,
        },
      },
      'huvud',
      'manuell'
    )
  }
  const satt = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.value }))
  return (
    <Ram dator={dator} nyckel="huvud" rubrik={HUVUD.rubrik} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-3">
        <Falt id="b-namn" etikett={HUVUD.namn} fel={namnFel}>
          <input id="b-namn" className={FALT} autoComplete="name" value={f.namn} onChange={satt('namn')} aria-invalid={Boolean(namnFel)} aria-describedby={namnFel ? 'b-namn-fel' : undefined} />
        </Falt>
        <Falt id="b-titel" etikett={HUVUD.titel} hint={HUVUD.titelUnder}>
          <input id="b-titel" className={FALT} autoComplete="organization-title" value={f.titel} onChange={satt('titel')} aria-describedby="b-titel-hint" />
        </Falt>
        <div className="grid gap-3 min-[480px]:grid-cols-2">
          <Falt id="b-epost" etikett={HUVUD.epost} fel={epostFel}>
            <input id="b-epost" type="email" className={FALT} autoComplete="email" value={f.epost} onChange={satt('epost')} aria-invalid={Boolean(epostFel)} aria-describedby={epostFel ? 'b-epost-fel' : undefined} />
          </Falt>
          <Falt id="b-tel" etikett={HUVUD.telefon} hint={HUVUD_BLAD.telefonHint}>
            <input id="b-tel" type="tel" className={FALT} autoComplete="tel" value={f.telefon} onChange={satt('telefon')} aria-describedby="b-tel-hint" />
          </Falt>
          <Falt id="b-ort" etikett={HUVUD.ort}>
            <input id="b-ort" className={FALT} autoComplete="address-level2" value={f.ort} onChange={satt('ort')} />
          </Falt>
          <Falt id="b-li" etikett={HUVUD.linkedin}>
            <input id="b-li" className={FALT} inputMode="url" value={f.linkedin} onChange={satt('linkedin')} />
          </Falt>
        </div>
      </div>
    </Ram>
  )
}

/* ------------------------------------------------------------------ listor */

function ListaBlad({ cv, dator, onOppna, onStang, sektion }: BladProps & { sektion: PostSektion }) {
  const namn = useNamn()
  const poster =
    sektion === 'erfarenhet'
      ? (cv.experience ?? []).map((e) => ({ titel: e.position || e.company, under: [e.position ? e.company : '', periodErfarenhet(e)].filter(Boolean).join(', ') }))
      : (cv.education ?? []).map((e) => ({ titel: e.degree || e.institution, under: [e.degree ? e.institution : '', periodUtbildning(e)].filter(Boolean).join(', ') }))
  return (
    <Ram dator={dator} nyckel={`lista-${sektion}`} rubrik={namn(sektion)} under={under(sektion)} onClose={onStang}>
      <p className="mb-2 text-sm text-ink-2">{BLAD.listaUnder}</p>
      <ul className="grid gap-2">
        {poster.map((p, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onOppna({ typ: 'post', sektion, index: i })}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-kant px-3 py-2 text-left hover:border-ink-1"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink-1">{p.titel || BLAD.utanNamn[sektion]}</span>
                {p.under ? <span className="block truncate text-meta text-ink-3">{p.under}</span> : null}
              </span>
              <IkonPenna size={18} className="shrink-0 text-ink-3" aria-label={BLAD.andra} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onOppna({ typ: 'post', sektion, index: 'ny' })} className={`${STRECKAD} mt-2`}>
        {AVSNITT.laggTillFor(sektion, namn(sektion))}
      </button>
    </Ram>
  )
}

/* ------------------------------------------------------------- erfarenhet */

function ErfarenhetBlad({ cv, dator, onSpara, onTaBort, onStang, index }: BladProps & { index: number | 'ny' }) {
  const namn = useNamn()
  const post: CVExperience | undefined = index === 'ny' ? undefined : cv.experience?.[index]
  const [titel, setTitel] = useState(post?.position ?? '')
  const [arbetsgivare, setArbetsgivare] = useState(post?.company ?? '')
  const [ort, setOrt] = useState(post?.location ?? '')
  const [fran, setFran] = useState<ManadAr>(tolkaDatum(post?.startDate))
  const [till, setTill] = useState<ManadAr>(tolkaDatum(post?.endDate))
  const [pagaende, setPagaende] = useState(Boolean(post && post.startDate && (!post.endDate || arPagaende(post.endDate))))
  const [punkter, setPunkter] = useState((Array.isArray(post?.description) ? post!.description : post?.description ? [String(post.description)] : []).join('\n'))
  const [fore, setFore] = useState<string | null>(null)
  const [skrev, setSkrev] = useState<number | null>(null)
  const coach = useJobbcoach(cv.personalInfo.fullName ?? '')
  const kraver = !titel.trim() || !arbetsgivare.trim() ? COACH.punkterKraver : null

  const skriv = async () => {
    const svar = await coach.kor<{ punkter: string[] }>('punkter', {
      titel,
      arbetsgivare,
      stickord: punkter,
      pagaende,
      yrkestitel: cv.personalInfo.title ?? '',
    })
    if (!svar?.punkter?.length) return
    setFore(punkter)
    setPunkter(svar.punkter.join('\n'))
    setSkrev(svar.punkter.length)
  }

  const spara = () => {
    const tomt = !titel.trim() && !arbetsgivare.trim()
    if (tomt) return onStang()
    const ny: CVExperience = {
      ...(post ?? {}),
      position: titel.trim(),
      company: arbetsgivare.trim(),
      location: ort.trim() || undefined,
      startDate: skrivDatum(fran),
      endDate: pagaende ? undefined : skrivDatum(till) || undefined,
      description: rader(punkter),
    }
    const lista = [...(cv.experience ?? [])]
    if (index === 'ny') lista.push(ny)
    else lista[index] = ny
    if (skrev !== null) capture('cv_bygg_ai_anvand', { typ: 'punkter', accepterad: true })
    onSpara({ ...cv, experience: lista }, 'erfarenhet', skrev !== null ? 'jobbcoach' : 'manuell')
  }

  return (
    <Ram
      dator={dator}
      nyckel={`erfarenhet-${index}`}
      rubrik={namn('erfarenhet')}
      under={under('erfarenhet')}
      onClose={onStang}
      fot={
        <button type="button" onClick={spara} disabled={coach.skriver} className={SPARA}>
          {BLAD.spara}
        </button>
      }
    >
      <div className="grid gap-3">
        <div className="grid gap-3 min-[480px]:grid-cols-2">
          <Falt id="e-titel" etikett={ERF.titel}>
            <input id="e-titel" className={FALT} value={titel} onChange={(e) => setTitel(e.target.value)} autoComplete="organization-title" />
          </Falt>
          <Falt id="e-arb" etikett={ERF.arbetsgivare}>
            <input id="e-arb" className={FALT} value={arbetsgivare} onChange={(e) => setArbetsgivare(e.target.value)} autoComplete="organization" />
          </Falt>
        </div>
        <Falt id="e-ort" etikett={ERF.ort}>
          <input id="e-ort" className={FALT} value={ort} onChange={(e) => setOrt(e.target.value)} />
        </Falt>
        <div className="grid gap-3 min-[480px]:grid-cols-2">
          <ManadArFalt id="e-fran" etikett={ERF.fran} varde={fran} onChange={setFran} />
          <ManadArFalt id="e-till" etikett={ERF.till} varde={till} onChange={setTill} avstangd={pagaende} />
        </div>
        <label className="-mt-1 inline-flex min-h-11 items-center gap-2.5 text-sm text-ink-1">
          <input type="checkbox" checked={pagaende} onChange={(e) => setPagaende(e.target.checked)} className="h-5 w-5 accent-[color:var(--ink-1)]" />
          {ERF.pagaende}
        </label>
        <Falt id="e-punkter" etikett={ERF.punkter}>
          <div className="relative">
            <textarea
              id="e-punkter"
              className={YTA}
              rows={5}
              value={punkter}
              readOnly={coach.skriver}
              aria-busy={coach.skriver}
              onChange={(e) => {
                setPunkter(e.target.value)
              }}
            />
            {coach.skriver ? <Skrivrader /> : null}
          </div>
        </Falt>
        {skrev !== null && fore !== null ? (
          <CoachRad
            typ="punkter"
            text={COACH.punkterKlar(skrev)}
            onAngra={() => {
              setPunkter(fore)
              setFore(null)
              setSkrev(null)
            }}
          />
        ) : null}
        <CoachKnapp text={skrev !== null ? COACH.punkterOm : COACH.punkter} coach={coach} onClick={() => void skriv()} kraver={kraver} />
        {index !== 'ny' ? (
          <button
            type="button"
            onClick={() => onTaBort({ ...cv, experience: (cv.experience ?? []).filter((_, i) => i !== index) }, 'erfarenhet', BLAD.borttagen.erfarenhet)}
            className={`${LANK_FEL} inline-flex min-h-11 items-center justify-self-start`}
          >
            {BLAD.taBort.erfarenhet}
          </button>
        ) : null}
      </div>
    </Ram>
  )
}

/* ------------------------------------------------------------- utbildning */

function UtbildningBlad({ cv, dator, onSpara, onTaBort, onStang, index }: BladProps & { index: number | 'ny' }) {
  const namn = useNamn()
  const post: CVEducation | undefined = index === 'ny' ? undefined : cv.education?.[index]
  const [utb, setUtb] = useState(post?.degree ?? '')
  const [skola, setSkola] = useState(post?.institution ?? '')
  const [fran, setFran] = useState(tolkaDatum(post?.startDate).ar)
  const [till, setTill] = useState(tolkaDatum(post?.endDate || post?.graduationYear).ar)
  const [beskr, setBeskr] = useState(typeof post?.description === 'string' ? post.description : '')
  const [visaBeskr, setVisaBeskr] = useState(Boolean(beskr))
  const spara = () => {
    if (!utb.trim() && !skola.trim()) return onStang()
    const ny: CVEducation = {
      ...(post ?? {}),
      degree: utb.trim(),
      institution: skola.trim(),
      startDate: /^\d{4}$/.test(fran) ? fran : undefined,
      endDate: /^\d{4}$/.test(till) ? till : undefined,
      graduationYear: /^\d{4}$/.test(till) ? till : undefined,
      description: beskr.trim() || undefined,
    }
    const lista = [...(cv.education ?? [])]
    if (index === 'ny') lista.push(ny)
    else lista[index] = ny
    onSpara({ ...cv, education: lista }, 'utbildning', 'manuell')
  }
  const ar = (v: string, s: (x: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => s(e.target.value.replace(/\D/g, '').slice(0, 4))
  return (
    <Ram dator={dator} nyckel={`utbildning-${index}`} rubrik={namn('utbildning')} under={under('utbildning')} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-3">
        <Falt id="u-utb" etikett={UTB.utbildning}>
          <input id="u-utb" className={FALT} value={utb} onChange={(e) => setUtb(e.target.value)} />
        </Falt>
        <Falt id="u-skola" etikett={UTB.skola}>
          <input id="u-skola" className={FALT} value={skola} onChange={(e) => setSkola(e.target.value)} autoComplete="organization" />
        </Falt>
        <div className="grid grid-cols-2 gap-3">
          <Falt id="u-fran" etikett={UTB.fran}>
            <input id="u-fran" className={FALT} inputMode="numeric" maxLength={4} placeholder={ERF.ar} value={fran} onChange={ar(fran, setFran)} />
          </Falt>
          <Falt id="u-till" etikett={UTB.till}>
            <input id="u-till" className={FALT} inputMode="numeric" maxLength={4} placeholder={ERF.ar} value={till} onChange={ar(till, setTill)} />
          </Falt>
        </div>
        {visaBeskr ? (
          <Falt id="u-beskr" etikett={UTB.beskrivningEtikett}>
            <textarea id="u-beskr" className={YTA} rows={3} value={beskr} onChange={(e) => setBeskr(e.target.value)} />
          </Falt>
        ) : (
          <button type="button" onClick={() => setVisaBeskr(true)} className={STRECKAD} aria-expanded={false}>
            {`+ ${UTB.beskrivning}`}
          </button>
        )}
        {index !== 'ny' ? (
          <button
            type="button"
            onClick={() => onTaBort({ ...cv, education: (cv.education ?? []).filter((_, i) => i !== index) }, 'utbildning', BLAD.borttagen.utbildning)}
            className={`${LANK_FEL} inline-flex min-h-11 items-center justify-self-start`}
          >
            {BLAD.taBort.utbildning}
          </button>
        ) : null}
      </div>
    </Ram>
  )
}

/* ------------------------------------------------------------ kompetenser */

function KompetenserBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const namn = useNamn()
  const [lista, setLista] = useState<string[]>(() => kompetenslista(cv))
  const [text, setText] = useState('')
  const [ai, setAi] = useState<string[]>([])
  const [anvantAi, setAnvantAi] = useState(false)
  const coach = useJobbcoach(cv.personalInfo.fullName ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const har = (k: string) => lista.some((x) => x.toLowerCase() === k.toLowerCase())
  const lagg = (k: string, franAi = false) => {
    const t = k.replace(/\s+/g, ' ').trim().slice(0, 60)
    if (!t || har(t)) return
    setLista((l) => [...l, t])
    if (franAi) setAnvantAi(true)
  }
  const forslag = useMemo(
    () => [...ai, ...spokFor(cv.personalInfo.title).kompetenser].filter((k, i, a) => !har(k) && a.findIndex((x) => x.toLowerCase() === k.toLowerCase()) === i).slice(0, 12),
    // har läser lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ai, lista, cv.personalInfo.title]
  )
  const fraga = async () => {
    const svar = await coach.kor<{ kompetenser: string[] }>('kompetenser', {
      yrkestitel: cv.personalInfo.title ?? '',
      jobb: (cv.experience ?? []).map((e) => ({ titel: e.position, arbetsgivare: e.company, punkter: e.description })),
      kompetenser: lista,
    })
    if (svar?.kompetenser?.length) setAi(svar.kompetenser)
  }
  const spara = () => {
    const sista = text.trim()
    const slut = sista && !har(sista) ? [...lista, sista] : lista
    if (anvantAi) capture('cv_bygg_ai_anvand', { typ: 'kompetenser', accepterad: true })
    onSpara({ ...cv, skills: medKompetenser(cv, slut) }, 'kompetenser', anvantAi ? 'jobbcoach' : 'manuell')
  }
  return (
    <Ram dator={dator} nyckel="kompetenser" rubrik={namn('kompetenser')} under={under('kompetenser')} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <label htmlFor="k-falt" className="text-[13px] font-medium text-ink-2">
            {KOMP.falt}
          </label>
          <div className="flex gap-2">
            <input
              id="k-falt"
              ref={inputRef}
              className={FALT}
              value={text}
              placeholder={KOMP.plats}
              enterKeyHint="enter"
              onChange={(e) => {
                const v = e.target.value
                if (v.includes(',')) {
                  v.split(',').slice(0, -1).forEach((k) => lagg(k))
                  setText(v.split(',').pop() ?? '')
                } else setText(v)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  lagg(text)
                  setText('')
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                lagg(text)
                setText('')
                inputRef.current?.focus()
              }}
              className="inline-flex h-11 shrink-0 items-center rounded-[10px] border border-kant-stark px-4 text-sm font-semibold text-ink-1"
            >
              {KOMP.laggTill}
            </button>
          </div>
        </div>
        {lista.length ? (
          <ul className="flex flex-wrap gap-2" aria-label={namn('kompetenser')}>
            {lista.map((k) => (
              <li key={k} className="inline-flex h-11 items-center gap-0.5 rounded-full border border-kant-stark bg-papper pl-3.5 pr-1 text-sm font-medium text-ink-1">
                {k}
                <button
                  type="button"
                  aria-label={KOMP.taBort(k)}
                  onClick={() => setLista((l) => l.filter((x) => x !== k))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-3 hover:bg-papper-2 hover:text-ink-1"
                >
                  <IkonStang size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-3">{KOMP.tomt}</p>
        )}
        {forslag.length ? (
          <div className="grid gap-1.5">
            <p className="text-ey uppercase text-ink-3">{KOMP.foreslagna}</p>
            <ul className="flex flex-wrap gap-2">
              {forslag.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => lagg(k, ai.includes(k))}
                    className="inline-flex h-11 items-center rounded-full border-[1.5px] border-dashed border-kant-stark px-3.5 text-sm font-medium text-ink-2 hover:border-ink-1 hover:text-ink-1"
                  >
                    + {k}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {ai.length ? <p className="text-meta text-ink-3">{COACH.kompKlar(ai.length)}</p> : null}
        <CoachKnapp text={COACH.komp} coach={coach} onClick={() => void fraga()} kraver={null} />
      </div>
    </Ram>
  )
}

/* ----------------------------------------------------------------- profil */

function ProfilBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const namn = useNamn()
  const [text, setText] = useState(cv.summary ?? '')
  const [fore, setFore] = useState<string | null>(null)
  const coach = useJobbcoach(cv.personalInfo.fullName ?? '')
  const harJobb = harInnehall(cv, 'erfarenhet')
  const kraver = harJobb || (cv.personalInfo.title ?? '').trim() ? null : COACH.profilKraver
  const skriv = async () => {
    const svar = await coach.kor<{ profil: string }>('profil', {
      yrkestitel: cv.personalInfo.title ?? '',
      jobb: (cv.experience ?? []).map((e) => ({ titel: e.position, arbetsgivare: e.company, punkter: e.description })),
      utbildning: (cv.education ?? []).map((e) => [e.degree, e.institution].filter(Boolean).join(', ')),
      kompetenser: kompetenslista(cv),
    })
    if (!svar?.profil) return
    setFore(text)
    setText(svar.profil)
  }
  const spara = () => {
    if (fore !== null) capture('cv_bygg_ai_anvand', { typ: 'profil', accepterad: true })
    onSpara({ ...cv, summary: text.trim() || undefined }, 'profil', fore !== null ? 'jobbcoach' : 'manuell')
  }
  return (
    <Ram dator={dator} nyckel="profil" rubrik={namn('profil')} under={under('profil')} onClose={onStang} fot={<button type="button" onClick={spara} disabled={coach.skriver} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-3">
        <p className="flex items-start gap-2 text-sm text-ink-2">
          <IkonPenna size={16} className="mt-0.5 shrink-0 text-ink-3" />
          {harJobb ? PROFILRAD.erbjud : PROFILRAD.forst}
        </p>
        <Falt id="p-text" etikett={PROFIL_BLAD.etikett}>
          <div className="relative">
            <textarea id="p-text" className={YTA} rows={6} value={text} readOnly={coach.skriver} onChange={(e) => setText(e.target.value)} />
            {coach.skriver ? <Skrivrader /> : null}
          </div>
        </Falt>
        {fore !== null ? (
          <CoachRad
            typ="profil"
            text={COACH.profilKlar}
            onAngra={() => {
              setText(fore)
              setFore(null)
            }}
          />
        ) : null}
        <CoachKnapp text={fore !== null ? COACH.profilOm : COACH.profil} coach={coach} onClick={() => void skriv()} kraver={kraver} />
      </div>
    </Ram>
  )
}

/* ------------------------------------------------------------------ språk */

const NIVAER: CVLanguage['proficiency'][] = ['Modersmål', 'Flytande', 'Konversation', 'Nybörjare', 'Tvåspråkig']

function SprakBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const namn = useNamn()
  const [lista, setLista] = useState<CVLanguage[]>(() => (cv.languages?.length ? cv.languages.map((l) => ({ ...l })) : [{ language: '', proficiency: 'Flytande' }]))
  const satt = (i: number, d: Partial<CVLanguage>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const spara = () => onSpara({ ...cv, languages: lista.filter((l) => l.language.trim()).map((l) => ({ ...l, language: l.language.trim() })) }, 'sprak', 'manuell')
  return (
    <Ram dator={dator} nyckel="sprak" rubrik={namn('sprak')} under={under('sprak')} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-3">
        {lista.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_9.5rem] items-end gap-2">
            <Falt id={`s-${i}`} etikett={SPRAK.sprak}>
              <input id={`s-${i}`} className={FALT} value={l.language} onChange={(e) => satt(i, { language: e.target.value })} />
            </Falt>
            <Falt id={`n-${i}`} etikett={SPRAK.niva}>
              <select id={`n-${i}`} className={FALT} value={l.proficiency} onChange={(e) => satt(i, { proficiency: e.target.value as CVLanguage['proficiency'] })}>
                {NIVAER.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Falt>
            <button type="button" onClick={() => setLista((x) => x.filter((_, j) => j !== i))} className={`${LANK_FEL} col-span-2 inline-flex min-h-11 items-center justify-self-start`}>
              {BLAD.taBort.sprak}
              <span className="sr-only">{` ${l.language}`}</span>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setLista((l) => [...l, { language: '', proficiency: 'Flytande' }])} className={STRECKAD}>
          {SPRAK.lagg}
        </button>
      </div>
    </Ram>
  )
}

/* ------------------------------------------------------------ fler avsnitt */

function FlerBlad({ cv, dator, onOppna, onStang }: BladProps) {
  return (
    <Ram dator={dator} nyckel="fler" rubrik={FLER_BLAD.rubrik} under={FLER_BLAD.under} onClose={onStang}>
      <ul className="grid gap-2">
        {(['intyg', 'projekt', 'intressen'] as const).map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onOppna({ typ: 'avsnitt', sektion: s })}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-kant px-3 py-2 text-left hover:border-ink-1"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink-1">{FLER_BLAD.val[s].namn}</span>
                <span className="block text-meta text-ink-3">{FLER_BLAD.val[s].text}</span>
              </span>
              {harInnehall(cv, s) ? <IkonPenna size={18} className="shrink-0 text-ink-3" /> : <span className="shrink-0 text-lg font-semibold text-ink-3">+</span>}
            </button>
          </li>
        ))}
      </ul>
    </Ram>
  )
}

function IntygBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const start = (cv.certifications ?? []).map((c) => (typeof c === 'string' ? { name: c, issuer: '' } : { ...c }))
  const [lista, setLista] = useState(start.length ? start : [{ name: '', issuer: '' }])
  const satt = (i: number, d: Record<string, string>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const spara = () => onSpara({ ...cv, certifications: lista.filter((c) => c.name.trim()) }, 'intyg', 'manuell')
  return (
    <Ram dator={dator} nyckel="intyg" rubrik={FLER_BLAD.val.intyg.namn} under={BLAD.valfritt} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-4">
        {lista.map((c, i) => (
          <fieldset key={i} className="grid gap-2 border-b border-kant pb-3">
            <Falt id={`i-n-${i}`} etikett={FLER_BLAD.intygNamn}>
              <input id={`i-n-${i}`} className={FALT} value={c.name} onChange={(e) => satt(i, { name: e.target.value })} />
            </Falt>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <Falt id={`i-u-${i}`} etikett={FLER_BLAD.intygUtfardare}>
                <input id={`i-u-${i}`} className={FALT} value={c.issuer ?? ''} onChange={(e) => satt(i, { issuer: e.target.value })} />
              </Falt>
              <Falt id={`i-a-${i}`} etikett={FLER_BLAD.intygAr}>
                <input id={`i-a-${i}`} className={FALT} inputMode="numeric" maxLength={4} value={c.date ?? c.issueDate ?? ''} onChange={(e) => satt(i, { date: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
              </Falt>
            </div>
            <button type="button" onClick={() => setLista((l) => l.filter((_, j) => j !== i))} className={`${LANK_FEL} inline-flex min-h-11 items-center justify-self-start`}>
              {BLAD.taBort.intyg}
            </button>
          </fieldset>
        ))}
        <button type="button" onClick={() => setLista((l) => [...l, { name: '', issuer: '' }])} className={STRECKAD}>
          {FLER_BLAD.laggIntyg}
        </button>
      </div>
    </Ram>
  )
}

function ProjektBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const start = (cv.projects ?? []).map((p) => ({ ...p, name: p.name || p.title || '', description: p.description ?? '' }))
  const [lista, setLista] = useState(start.length ? start : [{ name: '', description: '' }])
  const satt = (i: number, d: Record<string, string>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const spara = () => onSpara({ ...cv, projects: lista.filter((p) => p.name.trim()) }, 'projekt', 'manuell')
  return (
    <Ram dator={dator} nyckel="projekt" rubrik={FLER_BLAD.val.projekt.namn} under={BLAD.valfritt} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <div className="grid gap-4">
        {lista.map((p, i) => (
          <fieldset key={i} className="grid gap-2 border-b border-kant pb-3">
            <Falt id={`pr-n-${i}`} etikett={FLER_BLAD.projektNamn}>
              <input id={`pr-n-${i}`} className={FALT} value={p.name} onChange={(e) => satt(i, { name: e.target.value })} />
            </Falt>
            <Falt id={`pr-t-${i}`} etikett={FLER_BLAD.projektText}>
              <textarea id={`pr-t-${i}`} className={YTA} rows={3} value={p.description} onChange={(e) => satt(i, { description: e.target.value })} />
            </Falt>
            <button type="button" onClick={() => setLista((l) => l.filter((_, j) => j !== i))} className={`${LANK_FEL} inline-flex min-h-11 items-center justify-self-start`}>
              {BLAD.taBort.projekt}
            </button>
          </fieldset>
        ))}
        <button type="button" onClick={() => setLista((l) => [...l, { name: '', description: '' }])} className={STRECKAD}>
          {FLER_BLAD.laggProjekt}
        </button>
      </div>
    </Ram>
  )
}

function IntressenBlad({ cv, dator, onSpara, onStang }: BladProps) {
  const [text, setText] = useState((cv.interests ?? []).join(', '))
  const spara = () =>
    onSpara(
      {
        ...cv,
        interests: text
          .split(/[,\n]/)
          .map((t) => t.trim())
          .filter(Boolean),
      },
      'intressen',
      'manuell'
    )
  return (
    <Ram dator={dator} nyckel="intressen" rubrik={FLER_BLAD.val.intressen.namn} under={BLAD.valfritt} onClose={onStang} fot={<button type="button" onClick={spara} className={SPARA}>{BLAD.spara}</button>}>
      <Falt id="in-text" etikett={FLER_BLAD.intressen}>
        <textarea id="in-text" className={YTA} rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </Falt>
    </Ram>
  )
}

/* ------------------------------------------------------------------ bladet */

export default function Blad(p: BladProps) {
  return (
    <Rubriker.Provider value={p.rubriker ?? {}}>
      <BladInnehall {...p} />
    </Rubriker.Provider>
  )
}

function BladInnehall(p: BladProps) {
  const a = p.ark
  switch (a.typ) {
    case 'huvud':
      return <HuvudBlad {...p} />
    case 'fler':
      return <FlerBlad {...p} />
    case 'lista':
      return <ListaBlad {...p} sektion={a.sektion} />
    case 'post': {
      // Ett index utanför listan (gammal adress) blir ett nytt.
      const lista = a.sektion === 'erfarenhet' ? p.cv.experience ?? [] : p.cv.education ?? []
      const index = a.index !== 'ny' && a.index >= lista.length ? 'ny' : a.index
      return a.sektion === 'erfarenhet' ? (
        <ErfarenhetBlad key={`e${index}`} {...p} index={index} />
      ) : (
        <UtbildningBlad key={`u${index}`} {...p} index={index} />
      )
    }
    case 'avsnitt':
      switch (a.sektion) {
        case 'kompetenser':
          return <KompetenserBlad {...p} />
        case 'profil':
          return <ProfilBlad {...p} />
        case 'sprak':
          return <SprakBlad {...p} />
        case 'intyg':
          return <IntygBlad {...p} />
        case 'projekt':
          return <ProjektBlad {...p} />
        case 'intressen':
          return <IntressenBlad {...p} />
      }
  }
  return null
}

