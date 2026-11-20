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
 *   Uppgiften   eyebrow "PÅSTÅENDE 2 AV 4 OM TEXTEN", påståendet eller
 *               frågan 17/600, sedan svaren: tre lika breda knappar (Sant,
 *               Falskt, Går inte att avgöra) eller rader A till D.
 *
 * Svaren syns utan att rulla i utgångsläget på dator 1400 × 900 och på
 * Pixel 7. Tabellen rullar i sidled i sin ram; diagrammet är högst 240 px.
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

function Tabell({ t }: { t: NonNullable<VnVisatUnderlag['tabell']> }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1" data-vn-tabell>
      <table className="w-full border-collapse text-[13px] leading-5 lg:text-sm">
        {t.caption ? <caption className="caption-top pb-1.5 text-left text-[13px] font-semibold leading-[18px] text-ink-1">{t.caption}</caption> : null}
        <thead>
          <tr>
            {t.headers.map((h, i) => (
              <th key={i} scope="col" className={`border-b border-kant-stark px-2 py-1.5 align-bottom text-[12px] font-medium leading-4 text-ink-3 first:pl-0 last:pr-0 ${i === 0 ? 'text-left' : 'text-right'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, ri) => {
            const summa = t.highlightLastRow && ri === t.rows.length - 1
            return (
              <tr key={ri} className={summa ? 'border-t border-kant-stark' : 'border-t border-kant first:border-t-0'}>
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-2 py-1.5 first:pl-0 last:pr-0 ${ci === 0 ? 'text-left text-ink-1' : 'whitespace-nowrap text-right tabular-nums text-ink-1'} ${summa ? 'font-semibold' : ''}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Underlaget: textens eller tabellens ruta med egen rullning. */
export function VnUnderlag({ u, genomgang = false }: { u: VnU; genomgang?: boolean }) {
  const ul = u.underlag
  const ref = useRef<HTMLElement | null>(null)
  const mer = useMerUnder(ref)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h3.
  const rubrik = useRubrikTagg()
  const text = ul.typ !== 'siffror'
  // Mobil: 42 vh för text, 44 vh för siffror; dator: spaltens höjd.
  const hojd = text ? 'max-h-[42vh]' : 'max-h-[44vh]'
  return (
    <div className="relative" data-vn-underlag={ul.typ}>
      <section
        ref={ref}
        aria-label={visningstitel(ul.titel)}
        tabIndex={0}
        className={`${s.ruta} ${hojd} overflow-y-auto overscroll-contain rounded-xl border border-[color:var(--lyft-kant,var(--kant))] bg-papper px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--fokus,var(--ink-1))] lg:max-h-[calc(100dvh-226px)] lg:px-6 lg:py-5`}
        data-genomgang={genomgang ? '' : undefined}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-ey uppercase text-ink-3">{amneText(ul.amne) ?? (text ? 'Texten' : 'Underlaget')}</p>
          {text ? null : <span className="flex-shrink-0 text-[12px] leading-4 text-ink-3">{VN_ORD.raknare}</span>}
        </div>
        {rubrik === 'p' ? (
          <p className="mt-1 font-sess-display text-[17px] font-bold leading-6 tracking-[-.01em] text-ink-1">{visningstitel(ul.titel)}</p>
        ) : (
          <h3 className="mt-1 font-sess-display text-[17px] font-bold leading-6 tracking-[-.01em] text-ink-1">{visningstitel(ul.titel)}</h3>
        )}
        {text ? (
          <div className="mt-2 max-w-[640px] space-y-3 text-base leading-[26px] text-ink-1 lg:text-[17px] lg:leading-7">
            {splitIntoParagraphs(ul.text ?? '').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-3.5">
            {ul.kontext ? (
              <div className="space-y-2 text-sm leading-[21px] text-ink-2">
                {ul.kontext.split('\n\n').map((p, i) => (
                  <p key={i}>{p.trim()}</p>
                ))}
              </div>
            ) : null}
            {ul.tabell ? <Tabell t={ul.tabell} /> : null}
            {ul.diagram ? <VnDiagram config={ul.diagram} /> : null}
          </div>
        )}
      </section>
      {mer ? (
        <div className={`${s.skugga} pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-xl`} aria-hidden="true" />
      ) : null}
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
    <div className="flex flex-col gap-3 lg:pt-1" data-vn-uppgift={u.nyckel}>
      <div>
        <p className="text-ey uppercase text-ink-3">{eyebrow(u)}</p>
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="mt-1 font-sess-display text-[17px] font-semibold leading-6 text-ink-1 outline-none [text-wrap:pretty]">
          {u.text}
        </Rubrik>
      </div>
      {u.form === 'tre' ? (
        <TreFasta
          etiketter={[u.alternativ[0]?.text ?? 'Sant', u.alternativ[1]?.text ?? 'Falskt', u.alternativ[2]?.text ?? 'Går inte att avgöra']}
          vald={vald}
          facit={facit}
          onValj={onValj}
          disabled={last}
        />
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

export const VERBAL: TypRitare<VnU> = {
  kind: 'verbal',
  namn: 'Ord och text',
  form: 'bred',
  antalAlternativ: (u) => u.alternativ.length,
  svarEtikett: vnSvarEtikett,
  Uppgift: VnUppgift,
  underlag: UNDERLAG,
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
  arkGrupper: grupper,
}

export function vnRitare(kind: 'verbal' | 'numerisk'): TypRitare<VnU> {
  return kind === 'verbal' ? VERBAL : NUMERISK
}
