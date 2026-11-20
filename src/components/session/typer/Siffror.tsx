'use client'

/**
 * Siffror och tabeller: underlaget som papper med mörkt huvud (omgång 3 steg
 * 2b, skissens Test-siffror, Test-siffror-bred, Test-siffror-diagram,
 * -cirkel, -linje, -text, Mobil-siffror-tabell och Mobil-siffror-diagram).
 *
 *   Huvudet     ikonen efter slaget, ögonbrynet (Tabell, Stapeldiagram,
 *               Cirkeldiagram, Linjediagram, Textuppgift), rubriken och
 *               enheten till höger ("MSEK"), annars "Räknare tillåten".
 *   Tabellen    den generella regeln: färgprick per rad, stapel i
 *               totalkolumnen eller den sista kolumnen när den bara har tal,
 *               summaraden som fot. På mobil står första kolumnen kvar och
 *               tabellen dras i sidled.
 *   Diagrammen  VnDiagram.
 *   Texten      textuppgiften med talen som brickor i löptexten.
 *   Bra att veta  kontextens sifferfakta som brickor under tabellen.
 *
 * Efter facit tänder `losning.anvander` raderna, kolumnerna, staplarna,
 * sektorerna eller punkterna som räkningen bygger på. Räknevägen står i domen
 * (Raknevag), ett steg per bricka med uttrycket i displaysnittet och
 * etiketten under, slutsatsen sist.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { NumeriskAnvander, NumeriskLosning } from '@/lib/numericalTest/types'
import type { VnFacitData } from '@/lib/tester/pass-typer'
import type { VnVisatUnderlag } from '@/lib/tester/vn-nivatest'
import VnDiagram, { lika, SERIE, type DiagramMarkering, type VnDiagramConfig } from './VnDiagram'

/** RamFacit.data för Ord och text och Siffror och tabeller: facit och rätt svars text. */
/** helForklaring (steg 3b): bankens förklaringstext när räknevägen ersätter den i domen. */
export type VnData = VnFacitData & { rattText?: string | null; helForklaring?: string | null }

/** facitData som VnData, null när den saknas eller har fel form. */
export function lasVnData(d: unknown): VnData | null {
  if (!d || typeof d !== 'object') return null
  const v = d as VnData
  if (v.losning && !Array.isArray(v.losning.steg)) return null
  return v
}

/** "Yta (kvm)" blir rubriken "Yta" med enheten "kvm". */
export function delaRubrik(h: string): { namn: string; enhet: string | null } {
  const m = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(h.trim())
  return m ? { namn: m[1], enhet: m[2] } : { namn: h.trim(), enhet: null }
}

/** Ett tal ur en cell ("12.5", "4 250", "6,2"), null när cellen inte är ett tal. */
export function cellTal(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const t = v.replace(/[\s ]/g, '')
  if (!/^-?\d+([.,]\d+)?$/.test(t)) return null
  return Number(t.replace(',', '.'))
}

/** Cellen som den visas: decimalpunkt blir decimalkomma. */
export function cellText(v: string | number): string {
  const s = String(v)
  return /^-?\d+\.\d+$/.test(s.trim()) ? s.trim().replace('.', ',') : s
}

const SUMMA = /^(totalt|total|summa)\b/i

export type Slag = 'tabell' | 'stapel' | 'cirkel' | 'linje' | 'text' | 'blandat'

export function slagFor(ul: VnVisatUnderlag): Slag {
  if (ul.tabell && ul.diagram) return 'blandat'
  if (ul.tabell) return 'tabell'
  const d = ul.diagram as { chartType?: string } | null | undefined
  if (d?.chartType === 'bar') return 'stapel'
  if (d?.chartType === 'pie') return 'cirkel'
  if (d?.chartType === 'line') return 'linje'
  return 'text'
}

const SLAG_NAMN: Record<Slag, string> = {
  tabell: 'Tabell',
  stapel: 'Stapeldiagram',
  cirkel: 'Cirkeldiagram',
  linje: 'Linjediagram',
  text: 'Textuppgift',
  blandat: 'Tabell och diagram',
}

/** Vad frågorna gäller, i ögonbrynet: "Fråga 2 av 4 om tabellen". */
export function sifferOm(ul: VnVisatUnderlag): string {
  const s = slagFor(ul)
  return s === 'tabell' ? 'tabellen' : s === 'text' ? 'texten' : s === 'blandat' ? 'underlaget' : 'diagrammet'
}

export function SlagIkon({ slag }: { slag: Slag }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: 'lg:h-[26px] lg:w-[26px]',
  }
  if (slag === 'stapel') return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  if (slag === 'cirkel') return <svg {...p}><path d="M11 4a8.5 8.5 0 1 0 9 9h-9z" /><path d="M15 3.5a7 7 0 0 1 5.5 5.5H15z" /></svg>
  if (slag === 'linje') return <svg {...p}><path d="M3 17l5-5 4 3 8-9M22 20H2" /></svg>
  if (slag === 'text') return <svg {...p}><path d="M5 6h14M5 11h14M5 16h9" /></svg>
  return <svg {...p} strokeWidth={2}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 10h18M3 15h18M9 4v16" /></svg>
}

function Raknare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M9 8h6M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01" />
    </svg>
  )
}

/** Rubriken och enheten i huvudet: tabellens rubrik eller diagrammets titel, enheten ur parentesen eller y-axeln. */
export function huvudFor(ul: VnVisatUnderlag, reserv: string): { titel: string; enhet: string | null } {
  const d = ul.diagram as { title?: string; yAxisLabel?: string } | null | undefined
  const kalla = ul.tabell?.caption?.trim() || d?.title?.trim() || ''
  const delad = kalla ? delaRubrik(kalla) : null
  const titel = delad?.namn || reserv
  let enhet = delad?.enhet ?? null
  if (!enhet && !ul.tabell && d?.yAxisLabel) {
    const y = delaRubrik(d.yAxisLabel)
    enhet = y.enhet ?? y.namn
  }
  return { titel, enhet: enhet && enhet.length <= 24 ? enhet : null }
}

/* ---------------------------------------------------------------- Tabellen */

interface TabellMarkering {
  rader: string[]
  kolumner: string[]
}

function tabellMarkering(a: NumeriskAnvander | null | undefined): TabellMarkering | null {
  if (!a || (!a.rader?.length && !a.kolumner?.length)) return null
  return { rader: a.rader ?? [], kolumner: a.kolumner ?? [] }
}

function SifferTabell({ t, markering }: { t: NonNullable<VnVisatUnderlag['tabell']>; markering: TabellMarkering | null }) {
  const rull = useRef<HTMLDivElement | null>(null)
  const [mer, setMer] = useState(false)
  const rubriker = t.headers.map(delaRubrik)
  const rader = t.rows
  const sista = rader[rader.length - 1]
  const harSumma = rader.length > 1 && (Boolean(t.highlightLastRow) || SUMMA.test(String(sista?.[0] ?? '')))
  const kropp = harSumma ? rader.slice(0, -1) : rader
  // Stapeln: i totalkolumnen, annars i den sista, när kolumnen bara har tal som inte är negativa.
  const total = t.headers.findIndex((h, i) => i > 0 && SUMMA.test(h.trim()))
  const kandidat = total > 0 ? total : t.headers.length - 1
  const kolTal = kropp.map((r) => cellTal(r[kandidat] ?? ''))
  const stapelKol = t.headers.length >= 2 && kandidat > 0 && kolTal.every((v) => v != null && v >= 0) ? kandidat : -1
  const maxV = Math.max(1e-9, ...kolTal.map((v) => v ?? 0))
  const skilje = total > 0 && total === t.headers.length - 1 && t.headers.length > 2

  const radAnv = (r: (string | number)[]) => (markering?.rader.length ? markering.rader.some((x) => lika(x, String(r[0]))) : null)
  const kolAnv = (ci: number) =>
    markering?.kolumner.length ? markering.kolumner.some((x) => lika(x, t.headers[ci]) || lika(x, rubriker[ci].namn)) : null
  const cellAnv = (r: (string | number)[], ci: number) => {
    if (!markering || ci === 0) return false
    const ra = radAnv(r)
    const ka = kolAnv(ci)
    if (ra == null && ka == null) return false
    return ra !== false && ka !== false
  }

  useEffect(() => {
    const el = rull.current
    if (!el) return
    const mat = () => setMer(el.scrollWidth - el.clientWidth - el.scrollLeft > 4)
    mat()
    el.addEventListener('scroll', mat, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mat) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', mat)
      ro?.disconnect()
    }
  }, [])

  const sistaNamn = rubriker[rubriker.length - 1]?.namn
  return (
    <div data-vn-tabell>
      <div className="relative">
        <div ref={rull} className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="sess-tabell" data-markerad={markering ? '' : undefined}>
            {t.caption ? <caption className="sr-only">{t.caption}</caption> : null}
            <thead>
              <tr>
                {rubriker.map(({ namn, enhet }, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={i === 0 ? 'sess-fast' : undefined}
                    data-anvand={i > 0 && kolAnv(i) ? '' : undefined}
                    data-skiljelinje={skilje && i === total ? '' : undefined}
                    style={i === stapelKol && stapelKol > 0 ? { textAlign: skilje ? 'left' : 'right' } : undefined}
                  >
                    <b>{namn}</b>
                    {enhet ?? ' '}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kropp.map((r, ri) => {
                const ra = radAnv(r)
                return (
                  <tr key={ri} data-anvand-rad={ra ? '' : undefined}>
                    {r.map((c, ci) =>
                      ci === 0 ? (
                        <th key={ci} scope="row" className="sess-fast">
                          <span className="inline-flex items-center">
                            <span className="sess-prick" aria-hidden="true" style={{ background: SERIE[ri % SERIE.length] }} />
                            {c}
                          </span>
                        </th>
                      ) : (
                        <td key={ci} data-anvand={cellAnv(r, ci) ? '' : undefined} data-skiljelinje={skilje && ci === total ? '' : undefined}>
                          {ci === stapelKol ? (
                            <span className="sess-spar" aria-hidden="true">
                              <i style={{ width: `${Math.max(2, ((cellTal(c) ?? 0) / maxV) * 100)}%`, background: SERIE[ri % SERIE.length], animationDelay: `${ri * 60}ms` }} />
                            </span>
                          ) : null}
                          <span className={ci === stapelKol ? 'inline-block min-w-[30px] lg:min-w-[38px]' : undefined}>{cellText(c)}</span>
                        </td>
                      )
                    )}
                  </tr>
                )
              })}
            </tbody>
            {harSumma ? (
              <tfoot>
                <tr data-summa>
                  {sista.map((c, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row" className="sess-fast">
                        {c}
                      </th>
                    ) : (
                      <td key={ci} data-anvand={cellAnv(sista, ci) ? '' : undefined} data-skiljelinje={skilje && ci === total ? '' : undefined}>
                        {cellText(c)}
                      </td>
                    )
                  )}
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
        {mer ? (
          <span className="sess-mer-sidled lg:!hidden">
            <button type="button" aria-label="Visa fler kolumner" onClick={() => rull.current?.scrollBy({ left: 160, behavior: 'smooth' })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </span>
        ) : null}
      </div>
      {mer && sistaNamn ? (
        <p className="m-0 px-3.5 pt-2.5 text-[12px] leading-4 text-[color:var(--sess-ink-2)] lg:hidden" data-dra-sidled>
          Dra tabellen i sidled för att se kolumnen <b className="font-bold text-ink-1">{sistaNamn}</b>.
        </p>
      ) : null}
    </div>
  )
}

/* ----------------------------------------------------------- Textuppgiften */

const TAL = /(\d{1,3}(?:[  ]\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?)(\s?(?:kr|%)(?![\p{L}]))?/gu

/**
 * Steg 3b, putsning: mellanrummen i ett tal ("1 000", "42 000 kr", "60 %")
 * som hårda blanksteg, så att talet aldrig bryts mitt i. Annars ordagrant.
 */
export function hardaMellanrum(s: string): string {
  return s.replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ').replace(/(\d) (?=(?:kr|%)(?![\p{L}]))/gu, '$1 ')
}

/** Löptexten med talen som brickor ("80", "42 000 kr", "60 %"). Ordagrant ur banken. */
export function medTalbrickor(text: string): ReactNode[] {
  const ut: ReactNode[] = []
  let fran = 0
  for (const m of text.matchAll(TAL)) {
    const i = m.index ?? 0
    // Årtal och ordningstal mitt i ord lämnas som de står.
    if (/[\p{L}]/u.test(text[i - 1] ?? '')) continue
    if (i > fran) ut.push(text.slice(fran, i))
    ut.push(
      <b key={i} className="sess-tal">
        {m[0]}
      </b>
    )
    fran = i + m[0].length
  }
  if (fran < text.length) ut.push(text.slice(fran))
  return ut
}

/* ------------------------------------------------------------- Underlaget */

export interface SifferUnderlagProps {
  ul: VnVisatUnderlag
  /** Passagens rubrik, reserv när tabellen eller diagrammet saknar egen. */
  reservTitel: string
  inledning: string[]
  fakta: string | null
  /** Facit (efter svaret): räknevägens anvander och rätt svars text. */
  data: VnData | null
  Titel: 'h3' | 'p'
}

export function SifferInnehall({ ul, reservTitel, inledning, fakta, data, Titel }: SifferUnderlagProps) {
  const slag = slagFor(ul)
  const { titel, enhet } = huvudFor(ul, reservTitel)
  const anv = data?.losning?.anvander ?? null
  const dia = ul.diagram as VnDiagramConfig | null | undefined
  const diaEtiketter = dia
    ? dia.chartType === 'bar'
      ? anv?.staplar
      : dia.chartType === 'pie'
        ? anv?.sektorer
        : anv?.punkter
    : undefined
  const diaMark: DiagramMarkering | null = diaEtiketter?.length ? { etiketter: diaEtiketter } : null
  const faktaLista = fakta ? fakta.split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter(Boolean) : []
  return (
    <>
      <div className="sess-ul-huvud" data-ul-huvud>
        <span className="sess-ul-ikon" aria-hidden="true">
          <SlagIkon slag={slag} />
        </span>
        <div className="min-w-0">
          <p className="sess-ul-ogon">{SLAG_NAMN[slag]}</p>
          <Titel className="mt-0.5 font-sess-display text-[17px] font-bold leading-[22px] lg:text-[22px] lg:leading-[26px]">{titel}</Titel>
        </div>
        <span className="sess-ul-chip">
          {enhet ? (
            enhet
          ) : (
            <>
              <Raknare />
              Räknare tillåten
            </>
          )}
        </span>
      </div>
      {slag === 'text' ? (
        <div className="px-4 pb-5 pt-4 lg:px-9 lg:pb-9 lg:pt-7">
          {(ul.kontext ?? '')
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i} className="m-0 text-[17px] leading-[34px] text-ink-1 [&+p]:mt-3 lg:text-[20px] lg:leading-[38px]">
                {medTalbrickor(p.trim())}
              </p>
            ))}
        </div>
      ) : (
        <>
          {inledning.length ? (
            <div className="space-y-2 px-3.5 pb-1 pt-3 text-[13px] leading-[19px] text-[color:var(--sess-ink-2)] lg:px-6 lg:pb-1.5 lg:pt-4 lg:text-[15px] lg:leading-[23px]">
              {inledning.map((p, i) => (
                <p key={i} className="m-0">
                  {hardaMellanrum(p)}
                </p>
              ))}
            </div>
          ) : null}
          {ul.tabell ? <SifferTabell t={ul.tabell} markering={tabellMarkering(anv)} /> : null}
          {ul.diagram ? (
            <div className={`px-2 pb-4 lg:px-6 lg:pb-6 ${ul.tabell ? 'pt-5' : 'pt-3 lg:pt-4'}`}>
              {ul.tabell && dia?.title ? <p className="mb-2 px-1.5 text-[13px] font-semibold leading-[18px] text-ink-1">{dia.title}</p> : null}
              <VnDiagram config={ul.diagram} markering={diaMark} svar={data?.rattText ?? null} />
            </div>
          ) : null}
          {faktaLista.length ? (
            <div className="flex flex-wrap items-center gap-2 px-3.5 pb-4 pt-3 lg:gap-2.5 lg:px-6 lg:pb-5 lg:pt-4" data-vn-fakta>
              <span className="mr-1 text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)] lg:text-[12px]">Bra att veta</span>
              {faktaLista.map((f, i) => (
                <span key={i} className="sess-chip sess-fakta">
                  {hardaMellanrum(f)}
                </span>
              ))}
            </div>
          ) : ul.tabell && !ul.diagram ? null : (
            <div className="h-1" aria-hidden="true" />
          )}
        </>
      )}
    </>
  )
}

/* ------------------------------------------------------------ Räknevägen */

function Pil() {
  return (
    <svg className="sess-steg-pil" width="18" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10h14M11 4l6 6-6 6" />
    </svg>
  )
}

/** Uttrycket som det visas: division med ÷ (skissen), annars ordagrant. */
export function visaUttryck(u: string): string {
  return u.replace(/\s\/\s/g, ' ÷ ')
}

/**
 * Räknevägen i domen: stegen i ordning med pil emellan, rätt svar grönt sist
 * och slutsatsen under. Inga steg: ingenting (domen visar förklaringen).
 */
export function Raknevag({ losning, rattText }: { losning: NumeriskLosning; rattText: string | null }) {
  const steg = losning.steg.filter((s) => s && typeof s.uttryck === 'string' && s.uttryck.trim())
  if (!steg.length) return null
  return (
    <div data-raknevag>
      <ol className="m-0 flex list-none flex-wrap items-start gap-x-2 gap-y-2.5 p-0" aria-label="Räknevägen">
        {/* Pilen hör till steget efter, så att den aldrig blir ensam i radslutet. */}
        {steg.map((s, i) => (
          <li key={i} className="flex min-w-0 max-w-full items-start gap-2">
            {i > 0 ? <Pil /> : null}
            <span className="sess-steg">
              <b>{visaUttryck(s.uttryck)}</b>
              {s.etikett ? <small>{s.etikett}</small> : null}
            </span>
          </li>
        ))}
        {rattText ? (
          <li className="flex min-w-0 max-w-full items-start gap-2">
            <Pil />
            <span className="sess-steg" data-svar>
              <b>{rattText}</b>
              <small>svaret</small>
            </span>
          </li>
        ) : null}
      </ol>
      {losning.slutsats ? (
        <p className="m-0 mt-3 text-[15px] font-semibold leading-[22px] text-ink-1" data-slutsats>
          {losning.slutsats}
        </p>
      ) : null}
    </div>
  )
}
