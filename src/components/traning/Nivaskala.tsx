/**
 * Nivåskalan 1 till 10 (spec-rummen 4.4, konceptets .skala i P4, S1, M1,
 * O1 och 1d).
 *
 * Två viewBoxar, 380×56 på mobil och 840×56 på dator, så att formen aldrig
 * skalas mer än marginellt: x = 16 + (nivå − 1) × 38,667 respektive × 89,78.
 * Spåret i väggens kant, den fyllda delen i kopparens toning, tio streck (1,
 * 5 och 10 större), din punkt som kopparcirkel med väggens kant, startpunkten
 * som ihålig ring och siktet som triangel i rummets ljus.
 *
 * Texten står i HTML ovanpå SVG:n, placerad i procent av bredden, så att den
 * renderar 13 och 11 px på alla bredder (axeltexten skalas aldrig, W1-kravet).
 * SVG:n bär aria-label med alla tal; texterna är aria-hidden.
 *
 * Kopparfärgad text på väggen är koppar-ljus, aldrig ren koppar (beslut 1).
 * Ingen hook utom useId: fungerar i server- och klientkomponenter.
 */

import { useId } from 'react'
import Link from 'next/link'

export interface NivaskalaProps {
  /** Nivån nu, din punkt. */
  nu: number
  /** Mätningens eller passets startnivå, ihålig ring. */
  fran?: number | null
  /** Siktet, triangel ovanför. */
  sikte?: number | null
  /** "Du 6,4" | "Nu 5,6" | "Du" */
  etikettNu: string
  /** Axeltext under ringen: "5 · mätningen" | "från 5,4". Ersätter "5". */
  etikettFran?: string | null
  /** Sikteetiketten blir en länk: "Sikte 6,5, ändra". */
  siktLank?: { href: string; text: string } | null
  /**
   * standard: din etikett ovanför, startpunkten på axeln (P4, S1, M1, 1d).
   * fore-efter: startpunktens etikett ovanför, din under (O1).
   */
  layout?: 'standard' | 'fore-efter'
  /** O1: etiketten ovanför startpunkten, "6 okt 5,0". */
  etikettFranOvan?: string | null
  /** Väggen (standard) eller golvet. */
  pa?: 'vagg' | 'golv'
  /** Tillgängligt namn med alla tal. */
  aria: string
  className?: string
}

type Ankare = 'start' | 'mitt' | 'slut'

const MATT = {
  mobil: { w: 380, steg: 38.667 },
  dator: { w: 840, steg: 89.78 },
} as const

function xFor(niva: number, bredd: keyof typeof MATT): number {
  const n = Math.min(10, Math.max(1, niva))
  return 16 + (n - 1) * MATT[bredd].steg
}

function sikteText(sikte: number): string {
  return `Sikte ${sikte.toFixed(1).replace('.', ',')}`
}

function Etikett({
  x,
  w,
  ankare,
  rad,
  className,
  children,
}: {
  x: number
  w: number
  ankare: Ankare
  rad: 'topp' | 'botten'
  className: string
  children: React.ReactNode
}) {
  const t = ankare === 'start' ? 'translateX(0)' : ankare === 'mitt' ? 'translateX(-50%)' : 'translateX(-100%)'
  return (
    <span
      className={`absolute whitespace-nowrap ${rad === 'topp' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{ left: `${(x / w) * 100}%`, transform: t }}
    >
      {children}
    </span>
  )
}

function Skala({
  bredd,
  p,
  id,
}: {
  bredd: keyof typeof MATT
  p: NivaskalaProps
  id: string
}) {
  const { w } = MATT[bredd]
  const vagg = (p.pa ?? 'vagg') === 'vagg'
  const slut = w - 16
  const xNu = xFor(p.nu, bredd)
  const xFran = p.fran != null ? xFor(p.fran, bredd) : null
  const xSikte = p.sikte != null ? xFor(p.sikte, bredd) : null
  const xFem = xFor(5, bredd)
  const layout = p.layout ?? 'standard'

  const farg = vagg
    ? {
        spar: 'var(--vagg-kant)',
        tick: 'var(--vagg-svag)',
        tickStor: 'var(--vagg-mjuk)',
        duKant: 'var(--vagg)',
        fran: 'var(--vagg-mjuk)',
        sik: 'var(--ljus)',
      }
    : {
        spar: 'var(--papper-2)',
        tick: 'var(--kant-stark)',
        tickStor: 'var(--ink-3)',
        duKant: 'var(--papper)',
        fran: 'var(--ink-3)',
        sik: 'var(--ton-ink)',
      }
  const txt = vagg
    ? { lbl: 'text-vagg-ink', k: 'text-koppar-ljus', ax: 'text-vagg-mjuk', sik: 'text-ljus' }
    : { lbl: 'text-ink-1', k: 'text-koppar-ink', ax: 'text-ink-3', sik: 'text-ton-ink' }

  // Etiketterna: din till vänster om punkten, siktets till höger om
  // triangeln, och tvärtom när punkten passerat siktet eller står nära kanten.
  const siktetForbi = xSikte != null && xSikte < xNu
  const nuAnkare: Ankare = xNu / w < 0.2 || siktetForbi ? 'start' : 'slut'
  const nuX = nuAnkare === 'slut' ? xNu - 4 : xNu + 10
  const sikAnkare: Ankare = xSikte != null && (siktetForbi || xSikte / w > 0.8) ? 'slut' : 'start'
  const sikX = xSikte != null ? (sikAnkare === 'start' ? xSikte + 7 : xSikte - 7) : 0

  const ticks = Array.from({ length: 10 }, (_, i) => i + 1)
  const etikettLbl = 'font-display text-[13px] font-bold leading-4'
  const etikettAx = 'text-[11px] font-medium leading-[14px] tabular-nums'

  return (
    <div className={`relative ${bredd === 'mobil' ? 'lg:hidden' : 'hidden lg:block'}`}>
      <svg viewBox={`0 0 ${w} 56`} className="block h-auto w-full overflow-visible" role="img" aria-label={p.aria}>
        <defs>
          <linearGradient id={`${id}-${bredd}-kh`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C4621F" />
            <stop offset="1" stopColor="#F4B98A" />
          </linearGradient>
        </defs>
        <rect x={13} y={25} width={slut - 16 + 6} height={6} rx={3} fill={farg.spar} />
        <rect x={13} y={25} width={Math.max(6, xNu - 16 + 6)} height={6} rx={3} fill={`url(#${id}-${bredd}-kh)`} />
        <g>
          {ticks.map((n) => {
            const x = xFor(n, bredd)
            const stor = n === 1 || n === 5 || n === 10
            return (
              <line
                key={n}
                x1={x}
                x2={x}
                y1={stor ? 22 : 24}
                y2={stor ? 34 : 32}
                stroke={stor ? farg.tickStor : farg.tick}
                strokeWidth={stor ? 1.5 : 1}
              />
            )
          })}
        </g>
        {xFran != null ? <circle cx={xFran} cy={28} r={5} fill="none" stroke={farg.fran} strokeWidth={1.5} /> : null}
        {xSikte != null ? <path d={`M${xSikte} 15l-5-8h10z`} fill={farg.sik} /> : null}
        <circle cx={xNu} cy={28} r={7} fill="var(--koppar)" stroke={farg.duKant} strokeWidth={3} />
      </svg>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {layout === 'standard' ? (
          <Etikett x={nuX} w={w} ankare={nuAnkare} rad="topp" className={`${etikettLbl} ${txt.k}`}>
            {p.etikettNu}
          </Etikett>
        ) : (
          <>
            {xFran != null && p.etikettFranOvan ? (
              <Etikett x={xFran} w={w} ankare="mitt" rad="topp" className={`text-[13px] font-medium leading-4 ${txt.ax}`}>
                {p.etikettFranOvan}
              </Etikett>
            ) : null}
            <Etikett x={xNu} w={w} ankare="mitt" rad="botten" className={`${etikettLbl} ${txt.k}`}>
              {p.etikettNu}
            </Etikett>
          </>
        )}
        {xSikte != null && p.sikte != null && !p.siktLank ? (
          <Etikett x={sikX} w={w} ankare={sikAnkare} rad="topp" className={`text-[11px] font-medium leading-4 ${txt.sik}`}>
            {sikteText(p.sikte)}
          </Etikett>
        ) : null}
        {/* Axeln: 1, startpunkten (eller 5), 10. I fore-efter står din etikett där. */}
        <Etikett x={16} w={w} ankare="mitt" rad="botten" className={`${etikettAx} ${txt.ax}`}>
          1
        </Etikett>
        {layout === 'standard' ? (
          <Etikett
            x={p.etikettFran && xFran != null ? xFran : xFem}
            w={w}
            ankare="mitt"
            rad="botten"
            className={`${etikettAx} ${txt.ax}`}
          >
            {p.etikettFran && xFran != null ? p.etikettFran : '5'}
          </Etikett>
        ) : null}
        <Etikett x={slut} w={w} ankare="mitt" rad="botten" className={`${etikettAx} ${txt.ax}`}>
          10
        </Etikett>
      </div>

      {/* Siktets länk är klickbar, så den står utanför den dolda etikettytan. */}
      {xSikte != null && p.sikte != null && p.siktLank ? (
        <Link
          href={p.siktLank.href}
          className={`absolute -top-3 whitespace-nowrap py-3 text-[11px] font-medium leading-4 underline decoration-vagg-svag underline-offset-2 ${txt.sik}`}
          style={{
            left: `${(sikX / w) * 100}%`,
            transform: sikAnkare === 'start' ? undefined : 'translateX(-100%)',
          }}
        >
          {p.siktLank.text}
        </Link>
      ) : null}
    </div>
  )
}

export default function Nivaskala(props: NivaskalaProps) {
  const id = useId().replace(/[:]/g, '')
  return (
    <div className={props.className}>
      <Skala bredd="mobil" p={props} id={id} />
      <Skala bredd="dator" p={props} id={id} />
    </div>
  )
}
