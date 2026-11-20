'use client'

/**
 * Ord och text och Siffror och tabeller i ramen (plan-testflode-2026-11-20
 * avsnitt 3.5 och 3.6; omgång 3 steg 2b, skissens Test-ord,
 * Test-ord-argument, Mobil-ord, Mobil-ord-facit och Test-siffror*).
 *
 *   Underlaget  papperet: artikeln (ämnet och lästiden som brickor, rubriken
 *               med kopparstreck, brödtexten 18/30) eller argumentet, och
 *               siffrornas papper med mörkt huvud (Siffror.tsx). Ramen
 *               ritar det i egen spalt på dator och fäst överst på mobil,
 *               med egen rullning: 42 vh för text, 44 vh för siffror.
 *   Uppgiften   ord och text: påståendet i ett mörkt kort, de tre svaren
 *               som klossar med ikon och förklaring ("Texten säger det"),
 *               argumentets fyra svar som rader. Siffror: frågan i display,
 *               svaren som sifferklossar två och två.
 *   Facit       stödmeningarna (stod) markeras i texten med "Här står det";
 *               vid "Går inte att avgöra" får den närmaste meningen
 *               (narmast) en streckad linje och "Räcker inte". Siffrornas
 *               underlag tänder det räkningen bygger på (anvander), och
 *               räknevägen står i domen (TypRitare.Forklaring). Saknas
 *               fälten står förklaringen ensam, som förut.
 */

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { splitIntoParagraphs } from '@/components/tests/verbal-shared/splitParagraphs'
import { visningstitel } from '@/lib/tester/titel'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import type { VnVisadUppgift, VnVisatUnderlag } from '@/lib/tester/vn-nivatest'
import { BOKSTAV, SvarRad, SvarTal, Pill, tillstandFor, type Tillstand } from '../Svarskort'
import type { ForklaringInnehallProps, RamUppgift, TypRitare, UppgiftProps } from '../typ'
import { delaRubrik, lasVnData, Raknevag, SifferInnehall, sifferOm, type VnData } from './Siffror'
import s from './vn.module.css'

export { delaRubrik }

export interface VnU extends RamUppgift {
  kind: 'verbal' | 'numerisk'
  /** Underlagets id (passageId) och punkten (påståendets index eller frågans id). */
  del: string
  punkt: string
  underlag: VnVisatUnderlag
  text: string
  alternativ: { id: string; text: string }[]
  form: 'tre' | 'rader'
  iDel: number
  delAntal: number
}

export function tillVnU(kind: 'verbal' | 'numerisk', u: VnVisadUppgift, underlag: VnVisatUnderlag): VnU {
  return { ...u, kind, underlag }
}

const VN_ORD = {
  pastaende: (n: number, av: number) => `Påstående ${n} av ${av} om texten`,
  argument: (n: number, av: number) => `Fråga ${n} av ${av} om argumentet`,
  uppgiftText: (n: number, av: number) => `Fråga ${n} av ${av} om texten`,
  fraga: (n: number, av: number, om: string) => `Fråga ${n} av ${av} om ${om}`,
  svarAria: 'Ditt svar',
  fortsatter: 'Texten fortsätter',
  harStarDet: 'Här står det',
  rackerInte: 'Räcker inte',
  argumentChip: 'Argument',
}

/** De tre svaren med skissens förklaring under ordet. */
const TRE_UNDER: Record<string, string> = {
  true: 'Texten säger det',
  false: 'Texten säger emot',
  cannot_say: 'Texten säger varken eller',
}

/** Bankernas äldre ämnen står på engelska; brickan säger dem på svenska. */
const AMNE_SV: Record<string, string> = {
  'hr policy': 'Personalpolicy',
  'hr strategy': 'Personalstrategi',
  hr: 'Personal',
  sustainability: 'Hållbarhet',
  finance: 'Ekonomi',
  technology: 'Teknik',
  'market analysis': 'Marknadsanalys',
  'business strategy': 'Affärsstrategi',
  operations: 'Verksamhet',
  'legal & compliance': 'Juridik och regler',
  management: 'Ledarskap',
}

export function amneText(amne: string | null | undefined): string | null {
  if (!amne) return null
  return AMNE_SV[amne.trim().toLowerCase()] ?? amne.replace(/\s*&\s*/g, ' och ')
}

function eyebrow(u: VnU): string {
  if (u.kind === 'numerisk') return VN_ORD.fraga(u.iDel, u.delAntal, sifferOm(u.underlag))
  if (u.underlag.typ === 'argument') return VN_ORD.argument(u.iDel, u.delAntal)
  return u.form === 'tre' ? VN_ORD.pastaende(u.iDel, u.delAntal) : VN_ORD.uppgiftText(u.iDel, u.delAntal)
}

/** Skuggan nedtill i rutan när mer innehåll finns under kanten. */
function useMerUnder(ref: React.RefObject<HTMLElement | null>) {
  const [mer, setMer] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mat = () => setMer(el.scrollHeight - el.clientHeight - el.scrollTop > 6)
    mat()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mat) : null
    ro?.observe(el)
    el.addEventListener('scroll', mat, { passive: true })
    return () => {
      ro?.disconnect()
      el.removeEventListener('scroll', mat)
    }
  }, [ref])
  return mer
}

/**
 * Kontexten delad i inledning och sifferfakta (skissen Siffror-tabell): den
 * första meningen och meningarna utan siffror står över tabellen, meningarna
 * med siffror under den som Bra att veta. Ordagrant ur banken.
 */
export function delaKontext(kontext: string): { inledning: string[]; fakta: string | null } {
  const stycken = kontext
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const inledning: string[] = []
  const fakta: string[] = []
  let forsta = true
  for (const st of stycken) {
    const kvar: string[] = []
    for (const mening of st.split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ"0-9])/)) {
      if (!forsta && /\d/.test(mening)) fakta.push(mening.trim())
      else kvar.push(mening.trim())
      forsta = false
    }
    if (kvar.length) inledning.push(kvar.join(' '))
  }
  return { inledning, fakta: fakta.length ? fakta.join(' ') : null }
}

/** "3 stycken, cirka 1 minut": ordantalet vid 200 ord per minut. */
export function lasMeta(stycken: string[]): string {
  const ord = stycken.join(' ').split(/\s+/).filter(Boolean).length
  const min = Math.max(1, Math.round(ord / 200))
  return `${stycken.length === 1 ? '1 stycke' : `${stycken.length} stycken`}, cirka ${min === 1 ? '1 minut' : `${min} minuter`}`
}

/** Lästiden i brickan: "under 1 minut" för korta texter, annars "cirka N minuter". */
export function lastid(stycken: string[]): string {
  const ord = stycken.join(' ').split(/\s+/).filter(Boolean).length
  if (ord < 120) return 'under 1 minut'
  const min = Math.max(1, Math.round(ord / 200))
  return `cirka ${min === 1 ? '1 minut' : `${min} minuter`}`
}

/* -------------------------------------------------------- Stödmeningarna */

const norm = (t: string) => t.replace(/\s+/g, ' ').trim()

type Bit = { text: string; slag: null | 'stod' | 'narmast'; tagg?: boolean }

/**
 * Styckena delade i bitar med stödmeningarna och den närmaste markerade.
 * Matchningen tål radbrytningar och dubbla blanksteg, och prövar utan
 * skiftläge när den exakta inte finns. Hittas en mening inte markeras den
 * inte; ingenting kastas. Taggen står efter den sista markerade meningen.
 */
export function markeraStycken(stycken: string[], stod: string[], narmast: string | null): Bit[][] {
  const traff: { p: number; fran: number; till: number; slag: 'stod' | 'narmast' }[] = []
  const sok = (mening: string, slag: 'stod' | 'narmast') => {
    const m = norm(mening)
    if (m.length < 3) return
    for (let p = 0; p < stycken.length; p++) {
      let i = stycken[p].indexOf(m)
      if (i < 0) i = stycken[p].toLowerCase().indexOf(m.toLowerCase())
      if (i >= 0) {
        if (!traff.some((t) => t.p === p && i < t.till && i + m.length > t.fran)) traff.push({ p, fran: i, till: i + m.length, slag })
        return
      }
    }
  }
  for (const m of stod) sok(m, 'stod')
  if (narmast && !stod.length) sok(narmast, 'narmast')
  traff.sort((a, b) => a.p - b.p || a.fran - b.fran)
  const sista = traff[traff.length - 1]
  return stycken.map((st, p) => {
    const har = traff.filter((t) => t.p === p)
    const bitar: Bit[] = []
    let fran = 0
    for (const t of har) {
      if (t.fran > fran) bitar.push({ text: st.slice(fran, t.fran), slag: null })
      bitar.push({ text: st.slice(t.fran, t.till), slag: t.slag, tagg: t === sista })
      fran = t.till
    }
    if (fran < st.length) bitar.push({ text: st.slice(fran), slag: null })
    return bitar
  })
}

function KlockIkon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </svg>
  )
}

function PratIkon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  )
}

/* ------------------------------------------------------------- Underlaget */

/**
 * Underlaget. Artikeln (skissen Test-ord): ämnet och lästiden som brickor,
 * rubriken i display med kopparstreck under, brödtexten. Argumentet med
 * brickan "Argument". Siffrorna: papperet med mörkt huvud (Siffror.tsx).
 * Mobil: egen rullning i rutan med "Texten fortsätter" nedtill.
 */
export function VnUnderlag({ u, genomgang = false, facitData }: { u: VnU; genomgang?: boolean; facitData?: unknown }) {
  const ul = u.underlag
  const ref = useRef<HTMLElement | null>(null)
  const mer = useMerUnder(ref)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h3.
  const Titel = useRubrikTagg() === 'p' ? 'p' : 'h3'
  const text = ul.typ !== 'siffror'
  const data = lasVnData(facitData)
  const hojd = text ? 'max-h-[42vh]' : 'max-h-[44vh]'
  const titel = visningstitel(ul.titel)
  const yta = `sess-papper ${s.ruta} ${hojd} overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--fokus,var(--ink-1))]`

  const stycken = useMemo(() => (text ? splitIntoParagraphs(ul.text ?? '').map(norm) : []), [text, ul.text])
  const stod = data?.stod ?? []
  const narmast = data?.narmast ?? null
  const bitar = useMemo(() => markeraStycken(stycken, stod, narmast), [stycken, stod, narmast])
  const harMark = bitar.some((b) => b.some((x) => x.slag))

  // Efter facit: rutan rullar fram till den markerade meningen när den rullar själv (mobil).
  useEffect(() => {
    const el = ref.current
    if (!harMark || !el || el.scrollHeight <= el.clientHeight + 4) return
    const mark = el.querySelector<HTMLElement>('[data-stod-mening]')
    if (!mark) return
    // Bara när meningen inte redan syns helt i rutan.
    const topp = mark.offsetTop
    const botten = topp + mark.offsetHeight
    if (topp >= el.scrollTop && botten <= el.scrollTop + el.clientHeight - 40) return
    const lugn = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ top: Math.max(0, topp - 56), behavior: lugn ? 'auto' : 'smooth' })
  }, [harMark])

  if (text) {
    const argument = ul.typ === 'argument'
    const amne = argument ? null : amneText(ul.amne)
    return (
      <div className="relative" data-vn-underlag={ul.typ}>
        <article ref={ref} aria-label={titel} tabIndex={0} className={`${yta} relative`} data-genomgang={genomgang ? '' : undefined}>
          <div className="px-[18px] pb-5 pt-4 lg:px-10 lg:pb-[34px] lg:pt-[30px]">
            <div className="flex flex-wrap items-center gap-2">
              {argument ? (
                <span className="sess-chip">
                  <PratIkon />
                  {VN_ORD.argumentChip}
                </span>
              ) : amne ? (
                <span className="sess-chip">{amne}</span>
              ) : null}
              <span className="sess-chip" data-vn-meta>
                <KlockIkon />
                {lastid(stycken)}
              </span>
            </div>
            <Titel className="mt-3 font-sess-display text-[24px] font-extrabold leading-[30px] tracking-[-.02em] text-ink-1 lg:mt-3.5 lg:text-[34px] lg:leading-10">{titel}</Titel>
            <div className="sess-artikel-streck mt-2.5 lg:mt-3.5" aria-hidden="true" />
            <div className="mt-3 space-y-3 text-base leading-[28px] text-ink-1 lg:mt-3.5 lg:space-y-3.5 lg:text-[18px] lg:leading-[30px]">
              {bitar.map((st, i) => (
                <p key={i} className="m-0 max-w-[64ch]">
                  {st.map((b, j) =>
                    b.slag === 'stod' ? (
                      <Fragment key={j}>
                        <mark className="sess-stod" data-stod-mening="stod">
                          {b.text}
                        </mark>
                        {b.tagg ? <span className="sess-har">{VN_ORD.harStarDet}</span> : null}
                      </Fragment>
                    ) : b.slag === 'narmast' ? (
                      <Fragment key={j}>
                        <span className="sess-narmast" data-stod-mening="narmast">
                          {b.text}
                        </span>
                        {b.tagg ? (
                          <span className="sess-har" data-narmast>
                            {VN_ORD.rackerInte}
                          </span>
                        ) : null}
                      </Fragment>
                    ) : (
                      <Fragment key={j}>{b.text}</Fragment>
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        </article>
        {mer ? (
          <div className={`${s.skugga} pointer-events-none absolute inset-x-[2px] bottom-[7px] flex h-14 items-end justify-center rounded-b-[22px] pb-2.5`} aria-hidden="true" data-vn-fortsatter>
            <span className="sess-fortsatter lg:hidden">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
              {VN_ORD.fortsatter}
            </span>
          </div>
        ) : null}
      </div>
    )
  }
  // Bra att veta (skissen Test-siffror) bär korta sifferfakta; långa meningar står kvar i inledningen.
  const delad = ul.kontext && (ul.tabell || ul.diagram) ? delaKontext(ul.kontext) : null
  const korta = delad?.fakta ? delad.fakta.split(/(?<=[.!?])s+/).every((f) => f.trim().length <= 48) : false
  const { inledning, fakta } = delad && korta ? delad : { inledning: ul.kontext ? [ul.kontext] : [], fakta: null }
  return (
    <div className="relative" data-vn-underlag={ul.typ}>
      <section ref={ref} aria-label={titel} tabIndex={0} className={yta} data-genomgang={genomgang ? '' : undefined}>
        <SifferInnehall ul={ul} reservTitel={titel} inledning={inledning} fakta={fakta} data={data} Titel={Titel} />
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- Uppgiften */

/** S, F och G för Sant, Falskt och Går inte att avgöra (avsnitt 1, Tangentbord). */
function useSfg(aktiv: boolean, onValj?: (i: number) => void) {
  const ref = useRef(onValj)
  ref.current = onValj
  useEffect(() => {
    if (!aktiv) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const mal = e.target as HTMLElement | null
      if (mal?.tagName === 'INPUT' || mal?.tagName === 'TEXTAREA' || mal?.isContentEditable) return
      if (document.querySelector('[role="dialog"]')) return
      const i = ['s', 'f', 'g'].indexOf(e.key.toLowerCase())
      if (i < 0) return
      e.preventDefault()
      ref.current?.(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aktiv])
}

function TreIkon({ id }: { id: string }) {
  if (id === 'true')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    )
  if (id === 'false')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    )
  return <span className="font-sess-display text-[17px] font-extrabold leading-none lg:text-[20px]">?</span>
}

/**
 * De tre svaren (skissen Test-ord och Mobil-ord): klossar på var sin rad med
 * ikonbrickan, ordet och förklaringen under, etiketten till höger efter facit.
 */
function TreRader({ u, vald, facit, efterFel, onValj, disabled }: { u: VnU; vald: number | null; facit: number | null; efterFel?: boolean; onValj?: (i: number) => void; disabled: boolean }) {
  return (
    <div role="radiogroup" aria-label={VN_ORD.svarAria} className="flex flex-col gap-2 lg:gap-2.5" data-vn-tre>
      {u.alternativ.map((a, i) => {
        const t: Tillstand = tillstandFor(i, vald, facit)
        const ditt = facit != null && vald === i
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={t === 'vald' || t === 'fel' || (t === 'ratt' && ditt)}
            disabled={disabled}
            onClick={() => onValj?.(i)}
            data-tillstand={t}
            data-efter-fel={efterFel && t === 'ratt' ? '' : undefined}
            data-svar={BOKSTAV(i)}
            className="sess-kloss touch-manipulation isolate flex min-h-[52px] w-full items-center gap-3 px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default lg:min-h-[66px] lg:gap-3.5 lg:px-4 lg:py-2.5"
          >
            <span aria-hidden="true" className="sess-tangent" data-ikon="" data-tangent={t === 'dampad' ? 'neutral' : t}>
              <TreIkon id={a.id} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <b className="text-[15px] font-bold leading-5 lg:text-[17px] lg:leading-[22px]">{a.text}</b>
              {TRE_UNDER[a.id] ? <small className="text-[12px] font-medium leading-4 text-[color:var(--sess-ink-2)] lg:text-[13px] lg:leading-[18px]">{TRE_UNDER[a.id]}</small> : null}
            </span>
            <Pill tillstand={t} ditt={ditt} />
            {t === 'ratt' || t === 'fel' ? <span className="sr-only">{t === 'fel' ? ', ditt svar' : ditt ? ', rätt, ditt svar' : ', rätt svar'}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function VnUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<VnU>) {
  useSfg(u.form === 'tre' && !last && Boolean(onValj), onValj)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  if (u.kind === 'verbal') {
    return (
      <div className="flex flex-col gap-3 lg:gap-[18px]" data-vn-uppgift={u.nyckel}>
        <div className="sess-pastaende">
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ogon-mork)] lg:text-[12px]">{eyebrow(u)}</p>
          <Rubrik
            tabIndex={-1}
            data-uppgift-rubrik
            className="mt-1 font-sess-display text-[18px] font-bold leading-6 outline-none [text-wrap:pretty] lg:mt-2 lg:text-[23px] lg:leading-[30px]"
          >
            {u.text}
          </Rubrik>
        </div>
        {u.form === 'tre' ? (
          <TreRader u={u} vald={vald} facit={facit} efterFel={efterFel} onValj={onValj} disabled={last} />
        ) : (
          <div role="radiogroup" aria-label={VN_ORD.svarAria} className="flex flex-col gap-2 lg:gap-2.5">
            {u.alternativ.map((a, i) => (
              <SvarRad key={a.id} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
                {a.text}
              </SvarRad>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 lg:gap-5" data-vn-uppgift={u.nyckel}>
      <div>
        <p className="text-ey uppercase text-ink-3">{eyebrow(u)}</p>
        <Rubrik
          tabIndex={-1}
          data-uppgift-rubrik
          className="mt-1 font-sess-display text-[21px] font-extrabold leading-[26px] tracking-[-.01em] text-ink-1 outline-none [text-wrap:balance] lg:mt-2 lg:text-[24px] lg:leading-[30px] xl:text-[28px] xl:leading-[34px]"
        >
          {u.text}
        </Rubrik>
      </div>
      <div role="radiogroup" aria-label={VN_ORD.svarAria} className="grid grid-cols-2 gap-2.5 lg:gap-3">
        {u.alternativ.map((a, i) => (
          <SvarTal key={a.id} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
            {a.text}
          </SvarTal>
        ))}
      </div>
    </div>
  )
}

/** Domens innehåll: räknevägen när banken har den. Förklaringen står i domens löptext. */
function VnForklaring({ facit }: ForklaringInnehallProps<VnU>): ReactNode {
  const d = lasVnData(facit.data)
  if (!d?.losning) return null
  return <Raknevag losning={d.losning} rattText={d.rattText ?? null} />
}

/** Uppgiftslistans svar: de tre fasta med sina ord ("Sant", "Falskt"), raderna med bokstaven. */
function vnSvarEtikett(u: VnU, i: number): string {
  return u.form === 'tre' ? (u.alternativ[i]?.text ?? BOKSTAV(i)) : BOKSTAV(i)
}

/** Uppgiftsarkets mellanrubriker: textens eller underlagets rubrik där det börjar. */
function grupper(uppgifter: VnU[]): { fran: number; rubrik: string }[] {
  const ut: { fran: number; rubrik: string }[] = []
  uppgifter.forEach((u, i) => {
    if (i === 0 || uppgifter[i - 1].del !== u.del) ut.push({ fran: i, rubrik: visningstitel(u.underlag.titel) })
  })
  return ut
}

const UNDERLAG = { nyckel: (u: VnU) => u.del, Ritare: VnUnderlag }

/**
 * Uppgiftslistans miniatyr (omgång 2 B1): påståendets första ord för Ord
 * och text, underlagets rubrik med en liten tabell- eller stapelsymbol för
 * Siffror och tabeller. 22 px hög, högst 160 px bred.
 */
function VnMiniatyr({ u }: { u: VnU }) {
  if (u.kind === 'verbal') {
    const ord = u.text.split(/s+/).slice(0, 4).join(' ')
    return (
      <span className="inline-flex h-[22px] max-w-[160px] items-center rounded-[5px] bg-papper-2 px-2" data-mini="verbal">
        <span className="truncate text-[11px] font-semibold text-ink-1">{`${ord}${u.text.split(/s+/).length > 4 ? ' …' : ''}`}</span>
      </span>
    )
  }
  const diagram = !u.underlag.tabell && Boolean(u.underlag.diagram)
  return (
    <span className="inline-flex h-[22px] max-w-[160px] items-center gap-1.5 rounded-[5px] bg-papper-2 px-2 text-ink-2" data-mini="numerisk">
      <svg viewBox="0 0 12 12" width="12" height="12" className="flex-shrink-0" aria-hidden="true">
        {diagram ? (
          <path d="M1.5 10.5h9M3 10V7M6 10V3.5M9 10V5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M1.5 2h9v8h-9zM1.5 5h9M1.5 7.5h9M5 2v8" fill="none" stroke="currentColor" strokeWidth="1.1" />
        )}
      </svg>
      <span className="truncate text-[11px] font-semibold text-ink-1">{visningstitel(u.underlag.titel)}</span>
    </span>
  )
}

export const VERBAL: TypRitare<VnU> = {
  kind: 'verbal',
  namn: 'Ord och text',
  form: 'bred',
  antalAlternativ: (u) => u.alternativ.length,
  svarEtikett: vnSvarEtikett,
  Uppgift: VnUppgift,
  underlag: UNDERLAG,
  Miniatyr: VnMiniatyr,
  arkGrupper: grupper,
}

export const NUMERISK: TypRitare<VnU> = {
  kind: 'numerisk',
  namn: 'Siffror och tabeller',
  form: 'bred',
  antalAlternativ: (u) => u.alternativ.length,
  svarEtikett: vnSvarEtikett,
  Uppgift: VnUppgift,
  underlag: UNDERLAG,
  Miniatyr: VnMiniatyr,
  arkGrupper: grupper,
  Forklaring: VnForklaring,
}

export function vnRitare(kind: 'verbal' | 'numerisk'): TypRitare<VnU> {
  return kind === 'verbal' ? VERBAL : NUMERISK
}

export type { VnData }
