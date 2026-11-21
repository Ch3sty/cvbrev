'use client'

/**
 * Bladen i arbetsläget (byggspecen avsnitt 7): ett blad per avsnitt, med
 * dagens fält, validering och texter. Fälten bor i bladets eget tillstånd;
 * medan hon skriver går ett utkast till arket (useUtkast), och Spara lägger
 * det i CV:t. Avbryt och avsnittsbyten sköts av arbetsläget (Ram).
 *
 * Erfarenhet och utbildning: posten hon ändrar är utfälld, de andra står som
 * rader under, med "Lägg till ett jobb" och "Ta bort jobbet på ...".
 * Laddas lat: inget av det här behövs för första målningen.
 */
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { CVEducation, CVExperience, CVLanguage } from '@/lib/cv/cv-metadata'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import type { ArkVal, PostSektion } from '@/lib/cv/bygg/ark'
import { guidadPlats, harInnehall, kompetenslista, medKompetenser, type ByggCv } from '@/lib/cv/bygg/modell'
import { MANADSNAMN, arPagaende, skrivDatum, tolkaDatum, type ManadAr } from '@/lib/cv/bygg/datum'
import { PROFILRAD, spokFor } from '@/lib/cv/bygg/spok'
import { capture } from '@/lib/analytics/events'
import { IkonPenna, IkonStang } from '@/components/illustrations/MallIkoner'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import { HUVUD } from '@/components/cv/Dokument/texter'
import Ram, { useArbete, useRegistrera, useUtkast } from './Ram'
import { CoachKort, CoachRad, Skrivrader, useJobbcoach } from './Jobbcoach'
import { ordning, periodText } from '../arbetslage'
import { ARBETE, BLAD, COACH, ERF, FLER_BLAD, HUVUD_BLAD, KOMP, PROFIL_BLAD, SPRAK, UTB, sektionsnamn } from '../texter'
import s from '../arbetslage.module.css'

export type Metod = 'manuell' | 'jobbcoach'

/** Rubrikerna som arket visar (mallen och rubrikuppsättningen), så att bladet heter som avsnittet. */
const Rubriker = createContext<Partial<Record<Sektion, string>>>({})
function useNamn() {
  const r = useContext(Rubriker)
  return (sek: Sektion) => r[sek]?.trim() || sektionsnamn(sek)
}

export interface BladProps {
  ark: ArkVal
  cv: ByggCv
  onSpara: (ny: ByggCv, sektion: Sektion | 'huvud', metod: Metod) => void
  onTaBort: (ny: ByggCv, sektion: Sektion, text: string) => void
  /** Ett annat blad (en rad, Nästa jobb, Fler avsnitt). Arbetsläget sparar det hon skrivit först. */
  onOppna: (a: ArkVal) => void
  /** Rubrikerna på arket, ur mätningen av dokumentet. */
  rubriker?: Partial<Record<Sektion, string>>
}

function Falt({ etikett, hint, fel, id, children }: { etikett: string; hint?: string; fel?: string | null; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={s.etikett}>
        {etikett}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className={s.hint}>
          {hint}
        </p>
      ) : null}
      {fel ? (
        <p id={`${id}-fel`} className={s.felRad}>
          {fel}
        </p>
      ) : null}
    </div>
  )
}

function under(sek: Sektion, lage: 'bygg' | 'redigera'): string | undefined {
  if (lage === 'redigera') return undefined
  const plats = guidadPlats(sek)
  return plats ? BLAD.avsnittAv(plats, 5) : BLAD.valfritt
}

const rader = (t: string) =>
  t
    .split('\n')
    .map((r) => r.replace(/^[-•*·]\s*/, '').trim())
    .filter(Boolean)

function SparaKnapp({ onClick, text = BLAD.spara, disabled }: { onClick: () => void; text?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={s.spara} data-spara>
      {text}
    </button>
  )
}

/* ------------------------------------------------------------ månad och år */

function ManadArFalt({ id, etikett, varde, onChange, avstangd }: { id: string; etikett: string; varde: ManadAr; onChange: (v: ManadAr) => void; avstangd?: boolean }) {
  const arFel = varde.ar && !/^\d{4}$/.test(varde.ar) ? ERF.arFel : null
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" disabled={avstangd}>
      <legend className={s.etikett}>{etikett}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_4.75rem] gap-1.5">
        <label className="sr-only" htmlFor={`${id}-m`}>
          {`${etikett}, ${ERF.manad.toLowerCase()}`}
        </label>
        <select id={`${id}-m`} className={s.faltVal} value={varde.manad ?? ''} onChange={(e) => onChange({ ...varde, manad: e.target.value ? Number(e.target.value) : null })}>
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
          className={s.falt}
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
        <p id={`${id}-a-fel`} className={s.felRad}>
          {arFel}
        </p>
      ) : null}
    </fieldset>
  )
}

/* ------------------------------------------------------------------- huvud */

function HuvudBlad({ cv, onSpara }: BladProps) {
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
  const bygg = (): ByggCv => ({
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
  })
  useUtkast(bygg, [f])
  const spara = () => {
    if (!f.namn.trim() || !/^\S+@\S+\.\S+$/.test(f.epost.trim())) {
      setVisaFel(true)
      return false
    }
    onSpara(bygg(), 'huvud', 'manuell')
    return true
  }
  useRegistrera(spara)
  const satt = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.value }))
  return (
    <Ram nyckel="huvud" rubrik={HUVUD.rubrik} fot={<SparaKnapp onClick={spara} />}>
      <Falt id="b-namn" etikett={HUVUD.namn} fel={namnFel}>
        <input id="b-namn" className={s.falt} autoComplete="name" value={f.namn} onChange={satt('namn')} aria-invalid={Boolean(namnFel)} aria-describedby={namnFel ? 'b-namn-fel' : undefined} />
      </Falt>
      <Falt id="b-titel" etikett={HUVUD.titel} hint={HUVUD.titelUnder}>
        <input id="b-titel" className={s.falt} autoComplete="organization-title" value={f.titel} onChange={satt('titel')} aria-describedby="b-titel-hint" />
      </Falt>
      <div className="grid gap-3 min-[480px]:grid-cols-2">
        <Falt id="b-epost" etikett={HUVUD.epost} fel={epostFel}>
          <input id="b-epost" type="email" className={s.falt} autoComplete="email" value={f.epost} onChange={satt('epost')} aria-invalid={Boolean(epostFel)} aria-describedby={epostFel ? 'b-epost-fel' : undefined} />
        </Falt>
        <Falt id="b-tel" etikett={HUVUD.telefon} hint={HUVUD_BLAD.telefonHint}>
          <input id="b-tel" type="tel" className={s.falt} autoComplete="tel" value={f.telefon} onChange={satt('telefon')} aria-describedby="b-tel-hint" />
        </Falt>
        <Falt id="b-ort" etikett={HUVUD.ort}>
          <input id="b-ort" className={s.falt} autoComplete="address-level2" value={f.ort} onChange={satt('ort')} />
        </Falt>
        <Falt id="b-li" etikett={HUVUD.linkedin}>
          <input id="b-li" className={s.falt} inputMode="url" value={f.linkedin} onChange={satt('linkedin')} />
        </Falt>
      </div>
    </Ram>
  )
}

/* ------------------------------------------------ jobben och utbildningarna */

/** De andra posterna som rader, och "Lägg till" och "Ta bort" (skissen Redigera). */
function Poster({
  sektion,
  cv,
  index,
  onOppna,
  onTaBort,
}: {
  sektion: PostSektion
  cv: ByggCv
  index: number | 'ny'
  onOppna: (a: ArkVal) => void
  onTaBort: (() => void) | null
}) {
  const { dator } = useArbete()
  const o = ordning(cv, sektion)
  const rad = (i: number) => {
    if (sektion === 'erfarenhet') {
      const e = cv.experience[i]
      return { titel: e.position || e.company || BLAD.utanNamn.erfarenhet, under: [e.position ? e.company : '', periodText(e.startDate, e.endDate, !e.endDate)].filter(Boolean).join(', ') }
    }
    const e = cv.education[i]
    return { titel: e.degree || e.institution || BLAD.utanNamn.utbildning, under: [e.degree ? e.institution : '', periodText(e.startDate, e.endDate || e.graduationYear)].filter(Boolean).join(', ') }
  }
  const post = index === 'ny' ? null : sektion === 'erfarenhet' ? cv.experience[index] : cv.education[index]
  const vart = post ? (sektion === 'erfarenhet' ? (post as CVExperience).company : (post as CVEducation).institution) : ''
  const taBortText = sektion === 'erfarenhet' ? ARBETE.taBortJobbPa(dator ? vart?.trim() ?? '' : '') : ARBETE.taBortUtbPa(dator ? vart?.trim() ?? '' : '')
  const lagg = (
    <button type="button" className={`${s.jobb} ${s.jobbNy}`} onClick={() => onOppna({ typ: 'post', sektion, index: 'ny' })} data-lagg-post={sektion}>
      <span aria-hidden style={{ fontSize: 22, lineHeight: '20px', fontWeight: 700 }}>
        +
      </span>
      <b>{sektion === 'erfarenhet' ? ARBETE.laggJobb : ARBETE.laggUtb}</b>
    </button>
  )
  const taBort = onTaBort ? (
    <button type="button" className={s.lank} onClick={onTaBort} data-ta-bort>
      {taBortText}
    </button>
  ) : null

  if (!dator) {
    const plats = index === 'ny' ? -1 : o.indexOf(index)
    const nastaI = index === 'ny' ? null : o[plats + 1] ?? null
    return (
      <>
        <div className="flex items-center justify-between gap-2.5">
          {taBort ?? <span />}
          {nastaI !== null ? (
            <button type="button" className={s.jc} onClick={() => onOppna({ typ: 'post', sektion, index: nastaI })}>
              {(sektion === 'erfarenhet' ? ARBETE.nastaJobb : ARBETE.nastaUtb)(rad(nastaI).titel)}
              <IkonChev size={16} strokeWidth={2.6} />
            </button>
          ) : null}
        </div>
        {lagg}
      </>
    )
  }
  const andra = o.filter((i) => i !== index)
  return (
    <div className={s.rader}>
      {andra.map((i) => {
        const r = rad(i)
        return (
          <button key={i} type="button" className={s.jobb} onClick={() => onOppna({ typ: 'post', sektion, index: i })} data-post-rad={i}>
            <span>
              <b>{r.titel}</b>
              {r.under ? <small>{r.under}</small> : null}
            </span>
            <IkonChev size={20} strokeWidth={2.4} className="ml-auto shrink-0 rotate-90" />
          </button>
        )
      })}
      {lagg}
      {taBort ?? <span />}
    </div>
  )
}

function postUnder(sektion: PostSektion, cv: ByggCv, index: number | 'ny', lage: 'bygg' | 'redigera', mobil: boolean): string | undefined {
  const n = sektion === 'erfarenhet' ? cv.experience.length : cv.education.length
  if (mobil && n > 0) {
    const plats = index === 'ny' ? n + 1 : ordning(cv, sektion).indexOf(index) + 1
    const tot = index === 'ny' ? n + 1 : n
    return sektion === 'erfarenhet' ? ARBETE.jobbAv(plats, tot) : ARBETE.utbAv(plats, tot)
  }
  if (lage === 'bygg' || n === 0) return sektion === 'erfarenhet' ? ARBETE.extrajobb : ARBETE.gymnasiet
  return sektion === 'erfarenhet' ? ARBETE.jobbAntal(n) : ARBETE.utbAntal(n)
}

/* ------------------------------------------------------------- erfarenhet */

function ErfarenhetBlad({ cv, onSpara, onTaBort, onOppna, index }: BladProps & { index: number | 'ny' }) {
  const { dator, lage } = useArbete()
  const namn = useNamn()
  const post: CVExperience | undefined = index === 'ny' ? undefined : cv.experience?.[index]
  const [titel, setTitel] = useState(post?.position ?? '')
  const [arbetsgivare, setArbetsgivare] = useState(post?.company ?? '')
  const [ort, setOrt] = useState(post?.location ?? '')
  // Orten är valfri: fältet står när jobbet har en, annars bakom en rad under punkterna.
  const [visaOrt, setVisaOrt] = useState(Boolean(post?.location?.trim()))
  const [fran, setFran] = useState<ManadAr>(tolkaDatum(post?.startDate))
  const [till, setTill] = useState<ManadAr>(tolkaDatum(post?.endDate))
  const [pagaende, setPagaende] = useState(Boolean(post && post.startDate && (!post.endDate || arPagaende(post.endDate))))
  const [punkter, setPunkter] = useState((Array.isArray(post?.description) ? post!.description : post?.description ? [String(post.description)] : []).join('\n'))
  const [hadePunkter] = useState(() => punkter.trim().length > 0)
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

  const tomt = !titel.trim() && !arbetsgivare.trim()
  const bygg = (): ByggCv => {
    if (tomt) return cv
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
    return { ...cv, experience: lista }
  }
  useUtkast(bygg, [titel, arbetsgivare, ort, fran, till, pagaende, punkter])

  const spara = () => {
    // Ett tomt jobb sparas inte; arbetsläget släpper utkastet.
    if (tomt) return true
    if (skrev !== null) capture('cv_bygg_ai_anvand', { typ: 'punkter', accepterad: true })
    onSpara(bygg(), 'erfarenhet', skrev !== null ? 'jobbcoach' : 'manuell')
    return true
  }
  useRegistrera(spara)

  return (
    <Ram
      nyckel={`erfarenhet-${index}`}
      rubrik={namn('erfarenhet')}
      under={postUnder('erfarenhet', cv, index, lage, false)}
      underMobil={postUnder('erfarenhet', cv, index, lage, true)}
      fot={<SparaKnapp onClick={spara} disabled={coach.skriver} text={lage === 'bygg' ? ARBETE.sparaJobbet : BLAD.spara} />}
    >
      <div className="grid gap-3 min-[480px]:grid-cols-2">
        <Falt id="e-titel" etikett={ERF.titel}>
          <input id="e-titel" className={s.falt} value={titel} onChange={(e) => setTitel(e.target.value)} autoComplete="organization-title" />
        </Falt>
        <Falt id="e-arb" etikett={ERF.arbetsgivare}>
          <input id="e-arb" className={s.falt} value={arbetsgivare} onChange={(e) => setArbetsgivare(e.target.value)} autoComplete="organization" />
        </Falt>
      </div>
      {dator ? (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-3">
          <ManadArFalt id="e-fran" etikett={ERF.fran} varde={fran} onChange={setFran} />
          <ManadArFalt id="e-till" etikett={ERF.till} varde={till} onChange={setTill} avstangd={pagaende} />
          <label className={s.kryssruta}>
            <input type="checkbox" checked={pagaende} onChange={(e) => setPagaende(e.target.checked)} />
            {ERF.pagaende}
          </label>
        </div>
      ) : (
        // Telefonen (skissen Mobil-redigera): Från och Pågående på en rad, Till bara när jobbet är slut.
        <>
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-end gap-2.5">
            <ManadArFalt id="e-fran" etikett={ERF.fran} varde={fran} onChange={setFran} />
            <label className={s.kryssruta}>
              <input type="checkbox" checked={pagaende} onChange={(e) => setPagaende(e.target.checked)} />
              {ERF.pagaende}
            </label>
          </div>
          {pagaende ? null : <ManadArFalt id="e-till" etikett={ERF.till} varde={till} onChange={setTill} />}
        </>
      )}
      {visaOrt ? (
        <Falt id="e-ort" etikett={ERF.ort}>
          <input id="e-ort" className={s.falt} value={ort} onChange={(e) => setOrt(e.target.value)} />
        </Falt>
      ) : null}
      <Falt id="e-punkter" etikett={ERF.punkter}>
        <div className="relative mt-[5px]">
          <textarea
            id="e-punkter"
            className={s.faltYta}
            style={{ marginTop: 0 }}
            rows={4}
            value={punkter}
            readOnly={coach.skriver}
            aria-busy={coach.skriver}
            onChange={(e) => setPunkter(e.target.value)}
          />
          {coach.skriver ? <Skrivrader /> : null}
        </div>
      </Falt>
      {visaOrt ? null : (
        <button type="button" className={`${s.hoppa} justify-self-start`} style={{ alignSelf: 'flex-start', marginTop: -6 }} onClick={() => setVisaOrt(true)} data-visa-ort>
          {`+ ${ERF.ort}`}
        </button>
      )}
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
      <CoachKort
        rubrik={hadePunkter ? COACH.kort.punkterOm : COACH.kort.punkter}
        under={hadePunkter ? COACH.kort.punkterOmUnder : COACH.kort.punkterUnder}
        text={hadePunkter || skrev !== null ? COACH.punkterOm : COACH.punkter}
        coach={coach}
        onClick={() => void skriv()}
        kraver={kraver}
        mobil={!dator}
      />
      <Poster
        sektion="erfarenhet"
        cv={cv}
        index={index}
        onOppna={onOppna}
        onTaBort={index === 'ny' ? null : () => onTaBort({ ...cv, experience: (cv.experience ?? []).filter((_, i) => i !== index) }, 'erfarenhet', BLAD.borttagen.erfarenhet)}
      />
    </Ram>
  )
}

/* ------------------------------------------------------------- utbildning */

function UtbildningBlad({ cv, onSpara, onTaBort, onOppna, index }: BladProps & { index: number | 'ny' }) {
  const { lage } = useArbete()
  const namn = useNamn()
  const post: CVEducation | undefined = index === 'ny' ? undefined : cv.education?.[index]
  const [utb, setUtb] = useState(post?.degree ?? '')
  const [skola, setSkola] = useState(post?.institution ?? '')
  const [fran, setFran] = useState(tolkaDatum(post?.startDate).ar)
  const [till, setTill] = useState(tolkaDatum(post?.endDate || post?.graduationYear).ar)
  const [beskr, setBeskr] = useState(typeof post?.description === 'string' ? post.description : '')
  const [visaBeskr, setVisaBeskr] = useState(Boolean(beskr))
  const tomt = !utb.trim() && !skola.trim()
  const bygg = (): ByggCv => {
    if (tomt) return cv
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
    return { ...cv, education: lista }
  }
  useUtkast(bygg, [utb, skola, fran, till, beskr])
  const spara = () => {
    if (tomt) return true
    onSpara(bygg(), 'utbildning', 'manuell')
    return true
  }
  useRegistrera(spara)
  const ar = (sat: (x: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => sat(e.target.value.replace(/\D/g, '').slice(0, 4))
  return (
    <Ram
      nyckel={`utbildning-${index}`}
      rubrik={namn('utbildning')}
      under={postUnder('utbildning', cv, index, lage, false)}
      underMobil={postUnder('utbildning', cv, index, lage, true)}
      fot={<SparaKnapp onClick={spara} />}
    >
      <Falt id="u-utb" etikett={UTB.utbildning}>
        <input id="u-utb" className={s.falt} value={utb} onChange={(e) => setUtb(e.target.value)} />
      </Falt>
      <Falt id="u-skola" etikett={UTB.skola}>
        <input id="u-skola" className={s.falt} value={skola} onChange={(e) => setSkola(e.target.value)} autoComplete="organization" />
      </Falt>
      <div className="grid grid-cols-2 gap-3">
        <Falt id="u-fran" etikett={UTB.fran}>
          <input id="u-fran" className={s.falt} inputMode="numeric" maxLength={4} placeholder={ERF.ar} value={fran} onChange={ar(setFran)} />
        </Falt>
        <Falt id="u-till" etikett={UTB.till}>
          <input id="u-till" className={s.falt} inputMode="numeric" maxLength={4} placeholder={ERF.ar} value={till} onChange={ar(setTill)} />
        </Falt>
      </div>
      {visaBeskr ? (
        <Falt id="u-beskr" etikett={UTB.beskrivningEtikett}>
          <textarea id="u-beskr" className={s.faltYta} rows={3} value={beskr} onChange={(e) => setBeskr(e.target.value)} />
        </Falt>
      ) : (
        <button type="button" onClick={() => setVisaBeskr(true)} className={s.streckad} aria-expanded={false}>
          {`+ ${UTB.beskrivning}`}
        </button>
      )}
      <Poster
        sektion="utbildning"
        cv={cv}
        index={index}
        onOppna={onOppna}
        onTaBort={index === 'ny' ? null : () => onTaBort({ ...cv, education: (cv.education ?? []).filter((_, i) => i !== index) }, 'utbildning', BLAD.borttagen.utbildning)}
      />
    </Ram>
  )
}

/* ------------------------------------------------------------ kompetenser */

function KompetenserBlad({ cv, onSpara }: BladProps) {
  const { dator, lage } = useArbete()
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
  useUtkast(() => ({ ...cv, skills: medKompetenser(cv, lista) }), [lista])
  const spara = () => {
    const sista = text.trim()
    const slut = sista && !har(sista) ? [...lista, sista] : lista
    if (anvantAi) capture('cv_bygg_ai_anvand', { typ: 'kompetenser', accepterad: true })
    onSpara({ ...cv, skills: medKompetenser(cv, slut) }, 'kompetenser', anvantAi ? 'jobbcoach' : 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="kompetenser" rubrik={namn('kompetenser')} under={under('kompetenser', lage)} fot={<SparaKnapp onClick={spara} />}>
      <div>
        <label htmlFor="k-falt" className={s.etikett}>
          {KOMP.falt}
        </label>
        <div className="flex gap-2">
          <input
            id="k-falt"
            ref={inputRef}
            className={s.falt}
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
            className={s.jc}
            style={{ marginTop: 5, height: dator ? 46 : 48 }}
          >
            {KOMP.laggTill}
          </button>
        </div>
      </div>
      {lista.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={namn('kompetenser')}>
          {lista.map((k) => (
            <li key={k} className={s.chip}>
              {k}
              <button type="button" aria-label={KOMP.taBort(k)} onClick={() => setLista((l) => l.filter((x) => x !== k))}>
                <IkonStang size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.hint}>{KOMP.tomt}</p>
      )}
      {forslag.length ? (
        <div className="grid gap-1.5">
          <p className={s.etikett} style={{ textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 11 }}>
            {KOMP.foreslagna}
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {forslag.map((k) => (
              <li key={k}>
                <button type="button" onClick={() => lagg(k, ai.includes(k))} className={s.forslagChip}>
                  + {k}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {ai.length ? <p className={s.hint}>{COACH.kompKlar(ai.length)}</p> : null}
      <CoachKort rubrik={COACH.kort.komp} under={COACH.kort.kompUnder} text={COACH.komp} coach={coach} onClick={() => void fraga()} kraver={null} mobil={!dator} />
    </Ram>
  )
}

/* ----------------------------------------------------------------- profil */

function ProfilBlad({ cv, onSpara }: BladProps) {
  const { dator, lage } = useArbete()
  const namn = useNamn()
  const [text, setText] = useState(cv.summary ?? '')
  const [hadeText] = useState(() => (cv.summary ?? '').trim().length > 0)
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
  useUtkast(() => ({ ...cv, summary: text.trim() || undefined }), [text])
  const spara = () => {
    if (fore !== null) capture('cv_bygg_ai_anvand', { typ: 'profil', accepterad: true })
    onSpara({ ...cv, summary: text.trim() || undefined }, 'profil', fore !== null ? 'jobbcoach' : 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="profil" rubrik={namn('profil')} under={under('profil', lage)} fot={<SparaKnapp onClick={spara} disabled={coach.skriver} />}>
      <Falt id="p-text" etikett={PROFIL_BLAD.etikett}>
        <div className="relative mt-[5px]">
          <textarea id="p-text" className={s.faltYta} style={{ marginTop: 0, minHeight: 150 }} rows={6} value={text} readOnly={coach.skriver} onChange={(e) => setText(e.target.value)} />
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
      <CoachKort
        rubrik={hadeText ? COACH.kort.profilOm : COACH.kort.profil}
        under={harJobb ? PROFILRAD.erbjud : PROFILRAD.forst}
        text={fore !== null || hadeText ? COACH.profilOm : COACH.profil}
        coach={coach}
        onClick={() => void skriv()}
        kraver={kraver}
        mobil={!dator}
      />
    </Ram>
  )
}

/* ------------------------------------------------------------------ språk */

const NIVAER: CVLanguage['proficiency'][] = ['Modersmål', 'Flytande', 'Goda kunskaper', 'Konversation', 'Nybörjare', 'Tvåspråkig']

function SprakBlad({ cv, onSpara }: BladProps) {
  const { lage } = useArbete()
  const namn = useNamn()
  const [lista, setLista] = useState<CVLanguage[]>(() => (cv.languages?.length ? cv.languages.map((l) => ({ ...l })) : [{ language: '', proficiency: 'Flytande' }]))
  const satt = (i: number, d: Partial<CVLanguage>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const bygg = (): ByggCv => ({ ...cv, languages: lista.filter((l) => l.language.trim()).map((l) => ({ ...l, language: l.language.trim() })) })
  useUtkast(bygg, [lista])
  const spara = () => {
    onSpara(bygg(), 'sprak', 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="sprak" rubrik={namn('sprak')} under={under('sprak', lage)} fot={<SparaKnapp onClick={spara} />}>
      {lista.map((l, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_10rem] items-end gap-2">
          <Falt id={`s-${i}`} etikett={SPRAK.sprak}>
            <input id={`s-${i}`} className={s.falt} value={l.language} onChange={(e) => satt(i, { language: e.target.value })} />
          </Falt>
          <Falt id={`n-${i}`} etikett={SPRAK.niva}>
            <select id={`n-${i}`} className={s.faltVal} value={l.proficiency ?? ''} onChange={(e) => satt(i, { proficiency: e.target.value as CVLanguage['proficiency'] })}>
              {/* Personens egen formulering ur CV:t står först, så att den inte byts bort. */}
              {l.proficiency && !NIVAER.includes(l.proficiency) ? <option value={l.proficiency}>{l.proficiency}</option> : null}
              {NIVAER.map((n) => (
                <option key={n}>{n}</option>
              ))}
              <option value="">{SPRAK.ingenNiva}</option>
            </select>
          </Falt>
          <button type="button" onClick={() => setLista((x) => x.filter((_, j) => j !== i))} className={`${s.lank} col-span-2 justify-self-start`} style={{ minHeight: 44 }}>
            {BLAD.taBort.sprak}
            <span className="sr-only">{` ${l.language}`}</span>
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setLista((l) => [...l, { language: '', proficiency: 'Flytande' }])} className={s.streckad}>
        {SPRAK.lagg}
      </button>
    </Ram>
  )
}

/* ------------------------------------------------------------ fler avsnitt */

function FlerBlad({ cv, onOppna }: BladProps) {
  useRegistrera(() => true)
  return (
    <Ram nyckel="fler" rubrik={FLER_BLAD.rubrik} under={FLER_BLAD.under}>
      <ul className="m-0 grid list-none gap-2 p-0">
        {(['intyg', 'projekt', 'intressen'] as const).map((sek) => (
          <li key={sek}>
            <button type="button" onClick={() => onOppna({ typ: 'avsnitt', sektion: sek })} className={s.listRad} data-fler-val={sek}>
              <span className="min-w-0 flex-1">
                <b className="block text-[15px] font-bold">{FLER_BLAD.val[sek].namn}</b>
                <span className={s.hint} style={{ display: 'block', margin: 0, fontSize: 13 }}>
                  {FLER_BLAD.val[sek].text}
                </span>
              </span>
              {harInnehall(cv, sek) ? <IkonPenna size={18} /> : <span aria-hidden className="text-lg font-semibold">+</span>}
            </button>
          </li>
        ))}
      </ul>
    </Ram>
  )
}

function IntygBlad({ cv, onSpara }: BladProps) {
  const startLista = (cv.certifications ?? []).map((c) => (typeof c === 'string' ? { name: c, issuer: '' } : { ...c }))
  const [lista, setLista] = useState(startLista.length ? startLista : [{ name: '', issuer: '' }])
  const satt = (i: number, d: Record<string, string>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const bygg = (): ByggCv => ({ ...cv, certifications: lista.filter((c) => c.name.trim()) })
  useUtkast(bygg, [lista])
  const spara = () => {
    onSpara(bygg(), 'intyg', 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="intyg" rubrik={FLER_BLAD.val.intyg.namn} under={BLAD.valfritt} fot={<SparaKnapp onClick={spara} />}>
      {lista.map((c, i) => (
        <fieldset key={i} className="m-0 grid gap-2 border-0 border-b-2 border-solid border-[color:var(--cv3a-linje)] p-0 pb-3">
          <Falt id={`i-n-${i}`} etikett={FLER_BLAD.intygNamn}>
            <input id={`i-n-${i}`} className={s.falt} value={c.name} onChange={(e) => satt(i, { name: e.target.value })} />
          </Falt>
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
            <Falt id={`i-u-${i}`} etikett={FLER_BLAD.intygUtfardare}>
              <input id={`i-u-${i}`} className={s.falt} value={c.issuer ?? ''} onChange={(e) => satt(i, { issuer: e.target.value })} />
            </Falt>
            <Falt id={`i-a-${i}`} etikett={FLER_BLAD.intygAr}>
              <input id={`i-a-${i}`} className={s.falt} inputMode="numeric" maxLength={4} value={c.date ?? c.issueDate ?? ''} onChange={(e) => satt(i, { date: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
            </Falt>
          </div>
          <button type="button" onClick={() => setLista((l) => l.filter((_, j) => j !== i))} className={`${s.lank} justify-self-start`} style={{ minHeight: 44 }}>
            {BLAD.taBort.intyg}
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={() => setLista((l) => [...l, { name: '', issuer: '' }])} className={s.streckad}>
        {FLER_BLAD.laggIntyg}
      </button>
    </Ram>
  )
}

function ProjektBlad({ cv, onSpara }: BladProps) {
  const startLista = (cv.projects ?? []).map((p) => ({ ...p, name: p.name || p.title || '', description: p.description ?? '' }))
  const [lista, setLista] = useState(startLista.length ? startLista : [{ name: '', description: '' }])
  const satt = (i: number, d: Record<string, string>) => setLista((l) => l.map((x, j) => (j === i ? { ...x, ...d } : x)))
  const bygg = (): ByggCv => ({ ...cv, projects: lista.filter((p) => p.name.trim()) })
  useUtkast(bygg, [lista])
  const spara = () => {
    onSpara(bygg(), 'projekt', 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="projekt" rubrik={FLER_BLAD.val.projekt.namn} under={BLAD.valfritt} fot={<SparaKnapp onClick={spara} />}>
      {lista.map((p, i) => (
        <fieldset key={i} className="m-0 grid gap-2 border-0 border-b-2 border-solid border-[color:var(--cv3a-linje)] p-0 pb-3">
          <Falt id={`pr-n-${i}`} etikett={FLER_BLAD.projektNamn}>
            <input id={`pr-n-${i}`} className={s.falt} value={p.name} onChange={(e) => satt(i, { name: e.target.value })} />
          </Falt>
          <Falt id={`pr-t-${i}`} etikett={FLER_BLAD.projektText}>
            <textarea id={`pr-t-${i}`} className={s.faltYta} rows={3} value={p.description} onChange={(e) => satt(i, { description: e.target.value })} />
          </Falt>
          <button type="button" onClick={() => setLista((l) => l.filter((_, j) => j !== i))} className={`${s.lank} justify-self-start`} style={{ minHeight: 44 }}>
            {BLAD.taBort.projekt}
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={() => setLista((l) => [...l, { name: '', description: '' }])} className={s.streckad}>
        {FLER_BLAD.laggProjekt}
      </button>
    </Ram>
  )
}

function IntressenBlad({ cv, onSpara }: BladProps) {
  const [text, setText] = useState((cv.interests ?? []).join(', '))
  const bygg = (): ByggCv => ({
    ...cv,
    interests: text
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean),
  })
  useUtkast(bygg, [text])
  const spara = () => {
    onSpara(bygg(), 'intressen', 'manuell')
    return true
  }
  useRegistrera(spara)
  return (
    <Ram nyckel="intressen" rubrik={FLER_BLAD.val.intressen.namn} under={BLAD.valfritt} fot={<SparaKnapp onClick={spara} />}>
      <Falt id="in-text" etikett={FLER_BLAD.intressen}>
        <textarea id="in-text" className={s.faltYta} rows={3} value={text} onChange={(e) => setText(e.target.value)} />
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
      return null
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
