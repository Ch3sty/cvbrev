'use client'

/**
 * Ord och text och Siffror och tabeller i ramen (plan-testflode-2026-11-20
 * avsnitt 3.5 och 3.6, etapp 2). Samma uppgift i alla lägen och nivåer.
 *
 *   Underlaget  texten, argumentet eller tabellen och diagrammet. Ramen
 *               ritar det i egen spalt till vänster på dator (Bred, 560)
 *               och fäst överst på mobil, med egen rullning: 42 vh för
 *               text, 44 vh för siffror. Det står kvar medan uppgifterna
 *               i samma underlag byts.
 *   Uppgiften   eyebrow "PÅSTÅENDE 2 AV 4 OM TEXTEN", påståendet i display
 *               20/28 (frågan om siffror 24/30 från lg, 28/34 från xl), sedan svaren: tre
 *               lika breda knappar (Sant, Falskt, Går inte att avgöra) med
 *               hjälpraden om den tredje under, eller rader A till D.
 *
 * Omgång 2 B1 (skisserna Ord-uppgift, Ord-412, Siffror-tabell och
 * Siffror-diagram-facit): texten som dokument, datatabellen och diagrammen
 * med y-axel i VnDiagram, miniatyrerna i Uppgiftslistan. Svaren syns utan
 * att rulla i utgångsläget på dator 1440 × 900 och på Pixel 7.
 */

import { useEffect, useRef, useState } from 'react'
import { splitIntoParagraphs } from '@/components/tests/verbal-shared/splitParagraphs'
import { visningstitel } from '@/lib/tester/titel'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import type { VnVisadUppgift, VnVisatUnderlag } from '@/lib/tester/vn-nivatest'
import { BOKSTAV, SvarRad, TreFasta, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'
import VnDiagram from './VnDiagram'
import s from './vn.module.css'

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
  uppgiftText: (n: number, av: number) => `Uppgift ${n} av ${av} om texten`,
  uppgiftUnderlag: (n: number, av: number) => `Uppgift ${n} av ${av} om underlaget`,
  raknare: 'Räknare tillåten',
  svarAria: 'Ditt svar',
  rullaText: 'Texten fortsätter, rulla i rutan.',
  fortsatter: 'Texten fortsätter',
  gatInte: 'Går inte att avgöra: texten säger varken det ena eller det andra.',
}

/** Bankernas äldre ämnen står på engelska; eyebrowen säger dem på svenska. */
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
  if (u.kind === 'numerisk') return VN_ORD.uppgiftUnderlag(u.iDel, u.delAntal)
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

/** "Yta (kvm)" blir rubriken "Yta" med enheten "kvm" på egen rad. */
export function delaRubrik(h: string): { namn: string; enhet: string | null } {
  const m = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(h.trim())
  return m ? { namn: m[1], enhet: m[2] } : { namn: h.trim(), enhet: null }
}

/**
 * Kontexten delad i inledning och sifferfakta (skissen Siffror-tabell): den
 * första meningen och meningarna utan siffror står över tabellen, meningarna
 * med siffror i raden under den. Ordagrant ur banken, ingenting skrivs om.
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

/** Facits markering i tabellen (form, omgång 2 B1): raden uppgiften gäller och cellerna facit räknar på. */
export interface TabellMarkering {
  rad?: number | null
  celler?: [number, number][]
}

/**
 * Datatabellen (skissen Siffror-tabell): rubrikraden på papper-2 med enheten
 * på egen rad, första kolumnen vänster i semibold, talen högerställda i
 * tabular-nums 15/22, rader 40 px, varannan rad svagt tonad och rad-hover
 * från 1024 px, summaraden med 2 px kant-stark. Mobil: tabellen rullar i
 * sidled och första kolumnen står kvar.
 */
function Tabell({ t, visaRubrik, markering = null }: { t: NonNullable<VnVisatUnderlag['tabell']>; visaRubrik: boolean; markering?: TabellMarkering | null }) {
  const cell = (ri: number, ci: number) => Boolean(markering?.celler?.some(([r, c]) => r === ri && c === ci))
  const rubriker = t.headers.map(delaRubrik)
  const enheter = rubriker.some((r) => r.enhet)
  return (
    <div className="overflow-x-auto" data-vn-tabell>
      <table className={`${s.tabell} w-full border-collapse`}>
        {t.caption ? (
          <caption className={visaRubrik ? 'caption-top px-4 pb-2 text-left text-[13px] font-semibold leading-[18px] text-ink-1 lg:px-6' : 'sr-only'}>{t.caption}</caption>
        ) : null}
        <thead>
          <tr>
            {rubriker.map(({ namn, enhet }, i) => {
              return (
                <th
                  key={i}
                  scope="col"
                  className={`px-2.5 py-2.5 align-bottom text-[12px] font-semibold leading-4 text-ink-1 first:pl-4 last:pr-4 lg:px-3.5 lg:text-[13px] lg:leading-[18px] lg:first:pl-6 lg:last:pr-6 ${
                    i === 0 ? 'sticky left-0 z-[1] text-left' : 'text-right'
                  }`}
                >
                  {namn}
                  {enheter ? <span className="block text-[11px] font-medium leading-4 text-ink-3 lg:text-[12px]">{enhet ?? ' '}</span> : null}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, ri) => {
            const summa = Boolean(t.highlightLastRow) && ri === t.rows.length - 1
            return (
              <tr
                key={ri}
                className={`h-10 ${summa ? 'border-t-2 border-kant-stark font-semibold' : ''}`}
                data-summa={summa ? '' : undefined}
                data-markerad={markering?.rad === ri ? '' : undefined}
              >
                {r.map((c, ci) =>
                  ci === 0 ? (
                    <th
                      key={ci}
                      scope="row"
                      className="sticky left-0 z-[1] whitespace-nowrap px-2.5 pl-4 text-left text-sm font-semibold leading-5 text-ink-1 lg:px-3.5 lg:pl-6 lg:text-[15px] lg:leading-[22px]"
                    >
                      {c}
                    </th>
                  ) : (
                    <td
                      key={ci}
                      className={`whitespace-nowrap px-2.5 text-right text-sm leading-5 tabular-nums text-ink-1 last:pr-4 lg:px-3.5 lg:text-[15px] lg:leading-[22px] lg:last:pr-6 ${summa ? 'font-semibold' : 'font-medium'} ${
                        cell(ri, ci) ? 'rounded-md shadow-[inset_0_0_0_2px_var(--positiv)]' : ''
                      }`}
                    >
                      {c}
                    </td>
                  )
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** "3 stycken, cirka 1 minut": ordantalet vid 200 ord per minut. */
export function lasMeta(stycken: string[]): string {
  const ord = stycken.join(' ').split(/\s+/).filter(Boolean).length
  const min = Math.max(1, Math.round(ord / 200))
  return `${stycken.length === 1 ? '1 stycke' : `${stycken.length} stycken`}, cirka ${min === 1 ? '1 minut' : `${min} minuter`}`
}

/**
 * Underlaget. Texten som dokument (skissen Ord-uppgift): ämnet som eyebrow,
 * rubriken i display 22/28, metaraden, en hårlinje och brödtexten 18/30 med
 * högst 62 tecken per rad. Siffrorna (Siffror-tabell): eyebrow Tabell eller
 * Diagram, rubriken, inledningen, tabellen kant i kant och sifferfaktaraden.
 * Mobil: egen rullning i rutan med raden "Texten fortsätter" i skuggan.
 */
export function VnUnderlag({ u, genomgang = false }: { u: VnU; genomgang?: boolean }) {
  const ul = u.underlag
  const ref = useRef<HTMLElement | null>(null)
  const mer = useMerUnder(ref)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h3.
  const Titel = useRubrikTagg() === 'p' ? 'p' : 'h3'
  const text = ul.typ !== 'siffror'
  // Mobil: 42 vh för text, 44 vh för siffror; dator: se .ruta i vn.module.css.
  const hojd = text ? 'max-h-[42vh]' : 'max-h-[44vh]'
  const titel = visningstitel(ul.titel)
  const yta = `${s.ruta} ${hojd} overflow-y-auto overscroll-contain rounded-2xl border border-[color:var(--lyft-kant,var(--kant))] bg-papper shadow-[0_1px_2px_rgba(27,34,70,.05)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--fokus,var(--ink-1))]`
  if (text) {
    const stycken = splitIntoParagraphs(ul.text ?? '')
    return (
      <div className="relative" data-vn-underlag={ul.typ}>
        <article ref={ref} aria-label={titel} tabIndex={0} className={yta} data-genomgang={genomgang ? '' : undefined}>
          <div className="px-[18px] pt-3.5 lg:px-9 lg:pt-7">
            <p className="text-ey uppercase text-ink-3">{amneText(ul.amne) ?? 'Texten'}</p>
            <Titel className="mt-1.5 font-sess-display text-[20px] font-bold leading-[26px] tracking-[-.01em] text-ink-1 lg:text-[22px] lg:leading-7">{titel}</Titel>
            <p className="mt-1 text-[13px] leading-[18px] text-ink-3" data-vn-meta>
              {lasMeta(stycken)}
            </p>
            <hr className="mt-3 border-0 border-t border-kant lg:mt-[18px]" />
          </div>
          <div className="space-y-3 px-[18px] pb-4 pt-3 text-base leading-[26px] text-ink-1 lg:space-y-3.5 lg:px-9 lg:pb-7 lg:pt-5 lg:text-[18px] lg:leading-[30px]">
            {stycken.map((p, i) => (
              <p key={i} className="max-w-[62ch]">
                {p}
              </p>
            ))}
          </div>
        </article>
        {mer ? (
          <div
            className={`${s.skugga} pointer-events-none absolute inset-x-px bottom-px flex h-14 items-end justify-center rounded-b-2xl pb-2 text-[12px] leading-4 text-ink-3`}
            aria-hidden="true"
            data-vn-fortsatter
          >
            <span className="lg:hidden">{VN_ORD.fortsatter}</span>
          </div>
        ) : null}
      </div>
    )
  }
  const { inledning, fakta } = ul.kontext && (ul.tabell || ul.diagram) ? delaKontext(ul.kontext) : { inledning: ul.kontext ? [ul.kontext] : [], fakta: null }
  const slag = ul.tabell && ul.diagram ? 'Tabell och diagram' : ul.tabell ? 'Tabell' : ul.diagram ? 'Diagram' : 'Underlaget'
  return (
    <div className="relative" data-vn-underlag={ul.typ}>
      <section ref={ref} aria-label={titel} tabIndex={0} className={yta} data-genomgang={genomgang ? '' : undefined}>
        <div className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-3.5 lg:px-6 lg:pb-3 lg:pt-5">
          <div className="min-w-0">
            <p className="text-ey uppercase text-ink-3">{slag}</p>
            <Titel className="mt-1 font-sess-display text-[18px] font-bold leading-6 tracking-[-.01em] text-ink-1 lg:text-[20px] lg:leading-[26px]">{titel}</Titel>
          </div>
          <span className="flex-shrink-0 text-[12px] leading-4 text-ink-3">{VN_ORD.raknare}</span>
        </div>
        {inledning.length ? (
          <div className="space-y-2 px-4 pb-3 text-sm leading-[21px] text-ink-2 lg:px-6 lg:pb-3.5 lg:text-[15px] lg:leading-[22px]">
            {inledning.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
        {ul.tabell ? <Tabell t={ul.tabell} visaRubrik={Boolean(ul.tabell.caption && ul.tabell.caption.trim() !== titel.trim())} /> : null}
        {ul.diagram ? (
          <div className={`px-4 pb-2 lg:px-6 ${ul.tabell ? 'pt-4' : ''}`}>
            <VnDiagram config={ul.diagram} />
          </div>
        ) : null}
        {fakta ? (
          <p className="m-0 border-t border-kant px-4 pb-4 pt-3 text-[13px] leading-[18px] text-ink-3 lg:px-6" data-vn-fakta>
            {fakta}
          </p>
        ) : (
          <div className="h-2 lg:h-3" aria-hidden="true" />
        )}
      </section>
      {mer ? <div className={`${s.skugga} pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-2xl`} aria-hidden="true" /> : null}
    </div>
  )
}

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

export function VnUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<VnU>) {
  useSfg(u.form === 'tre' && !last && Boolean(onValj), onValj)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  return (
    <div className="flex flex-col gap-4" data-vn-uppgift={u.nyckel}>
      <div>
        <p className="text-ey uppercase text-ink-3">{eyebrow(u)}</p>
        <Rubrik
          tabIndex={-1}
          data-uppgift-rubrik
          className={`mt-2 font-sess-display font-bold text-ink-1 outline-none [text-wrap:pretty] ${u.kind === 'numerisk' ? 'text-[20px] leading-[26px] lg:text-[24px] lg:leading-[30px] xl:text-[28px] xl:leading-[34px]' : 'text-[20px] leading-7'}`}
        >
          {u.text}
        </Rubrik>
      </div>
      {u.form === 'tre' ? (
        <div>
          <TreFasta
            etiketter={[u.alternativ[0]?.text ?? 'Sant', u.alternativ[1]?.text ?? 'Falskt', u.alternativ[2]?.text ?? 'Går inte att avgöra']}
            vald={vald}
            facit={facit}
            onValj={onValj}
            disabled={last}
          />
          <p className="mt-2.5 text-[13px] leading-[18px] text-ink-3" data-vn-hjalp>
            {VN_ORD.gatInte}
          </p>
        </div>
      ) : (
        <div role="radiogroup" aria-label={VN_ORD.svarAria} className="flex flex-col gap-2">
          {u.alternativ.map((a, i) => (
            <SvarRad key={a.id} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
              <span className="tabular-nums">{a.text}</span>
            </SvarRad>
          ))}
        </div>
      )}
    </div>
  )
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
}

export function vnRitare(kind: 'verbal' | 'numerisk'): TypRitare<VnU> {
  return kind === 'verbal' ? VERBAL : NUMERISK
}
