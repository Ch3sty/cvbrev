/**
 * Brevets väg i väggen (skissens Main, Hem-ny och Mobil-hem): fyra platser,
 * annonsen, brevet, läs igenom och skickat. Klara platser är kopparpunkter
 * med bock och kopparlinje fram till den aktuella, den aktuella är den stora
 * punkten med ikon och puls, kommande är ringar på en prickad linje, och
 * skickat bär flaggan.
 *
 * Dator: kurvan över kullarna, 580 x 290 i hjältens högra del (ritas i
 * väggens nederkant; kullarna går ut över kanten och klipps av väggen).
 * Telefon: rak rad i full bredd under rubriken.
 *
 * Ren SVG i fasta mått, serverritad (CLS 0). Pulsen stängs av under
 * prefers-reduced-motion (.b3-halo i brev3.css). Vilka platser som är klara
 * räknar motorn (src/lib/letters/lage.ts); här ritas bara.
 */

import type { BrevSteg } from '@/lib/letters/brevmall/typer'

export const BANANS_STEG: readonly BrevSteg[] = ['annonsen', 'brevet', 'las-igenom', 'skickat']

export interface BrevBanaProps {
  /** Den aktuella platsen (pulsen), eller null när inget återstår. */
  steg: BrevSteg | null
  /** Platserna som är klara. */
  klara: readonly BrevSteg[]
  /** dator: kurvan med kullar (Main). mobil: raka raden (Mobil-hem). */
  form: 'dator' | 'mobil'
  /** Brevet skrevs utan annons: första platsen heter "tjänsten". */
  utanAnnons?: boolean
  className?: string
}

const DATOR: readonly [number, number][] = [
  [42, 236],
  [116, 229],
  [192, 208],
  [266, 184],
]
/** Kontrollpunkterna mellan plats i och i + 1 (skissens kurva utskriven). */
const SEG: readonly [number, number, number, number][] = [
  [70, 236, 92, 233],
  [140, 225, 166, 218],
  [214, 202, 238, 194],
]
const MOBIL_X: readonly number[] = [28, 136, 246, 352]
const MOBIL_Y = 26

const ETIKETT: Record<BrevSteg, string> = { annonsen: 'annonsen', brevet: 'brevet', 'las-igenom': 'läs igenom', skickat: 'skickat' }
const ETIKETT_KLAR: Record<BrevSteg, string> = { annonsen: 'annonsen', brevet: 'brevet', 'las-igenom': 'läst igenom', skickat: 'skickat' }

const KLAR_ORD: Record<BrevSteg, string> = {
  annonsen: 'annonsen är inläst',
  brevet: 'brevet är skrivet',
  'las-igenom': 'brevet är genomläst',
  skickat: 'ansökan är skickad',
}
const NASTA_ORD: Record<BrevSteg, string> = {
  annonsen: 'Du börjar med annonsen',
  brevet: 'Nästa steg är brevet',
  'las-igenom': 'Nästa steg är att läsa igenom',
  skickat: 'Nästa steg är att skicka',
}

/**
 * Brev utan annons (startflödet utan inklistrad annons): första platsen
 * heter "tjänsten", det hon fyllde i, i stället för "annonsen".
 */
const UTAN_ANNONS = { etikett: 'tjänsten', klarOrd: 'tjänsten är ifylld' }

function etiketter(utanAnnons: boolean) {
  if (!utanAnnons) return { E: ETIKETT, EK: ETIKETT_KLAR }
  return { E: { ...ETIKETT, annonsen: UTAN_ANNONS.etikett }, EK: { ...ETIKETT_KLAR, annonsen: UTAN_ANNONS.etikett } }
}

/** Skärmläsarens mening om vägen. */
export function banaEtikett(steg: BrevSteg | null, klara: readonly BrevSteg[], utanAnnons = false): string {
  const klar = BANANS_STEG.filter((s) => klara.includes(s) && s !== steg).map((s) =>
    s === 'annonsen' && utanAnnons ? UTAN_ANNONS.klarOrd : KLAR_ORD[s]
  )
  const delar: string[] = []
  if (klar.length) delar.push(`${klar.join(' och ')}.`)
  if (steg) {
    const i = BANANS_STEG.indexOf(steg)
    delar.push(`${NASTA_ORD[steg]}${i < 2 ? ', sedan läsa igenom och skicka' : i === 2 ? ', sedan skicka' : ''}.`)
  }
  if (!delar.length) delar.push('annonsen, brevet, läs igenom, skickat.')
  return `Brevets väg: ${delar.join(' ')}`
}

function index(steg: BrevSteg | null, klara: readonly BrevSteg[]) {
  const aktuell = steg ? BANANS_STEG.indexOf(steg) : -1
  const klarSet = new Set(klara)
  let nadd = aktuell
  if (nadd < 0) BANANS_STEG.forEach((s, i) => (klarSet.has(s) ? (nadd = Math.max(nadd, i)) : null))
  return { aktuell, klarSet, nadd }
}

function kurva(fran: number, till: number): string {
  if (till <= fran) return ''
  let d = `M${DATOR[fran][0]} ${DATOR[fran][1]}`
  for (let i = fran; i < till; i++) {
    const [a, b, c, e] = SEG[i]
    d += `C${a} ${b} ${c} ${e} ${DATOR[i + 1][0]} ${DATOR[i + 1][1]}`
  }
  return d
}

const bock = (x: number, y: number, s = 1) => `M${x - 5.5 * s} ${y + 0.5 * s}l${3.6 * s} ${3.6 * s} ${7.4 * s} ${-8 * s}`

/** Ikonen i den aktuella punkten, i skissens 24-rutnät, centrerad på (x, y). */
function AktuellIkon({ steg, x, y, s }: { steg: BrevSteg; x: number; y: number; s: number }) {
  const ink = { stroke: 'var(--koppar-text)' }
  if (steg === 'las-igenom') {
    return (
      <g>
        <path d={`M${x - 11 * s} ${y}c${3 * s} ${-5 * s} ${7 * s} ${-7.5 * s} ${11 * s} ${-7.5 * s}s${8 * s} ${2.5 * s} ${11 * s} ${7.5 * s}c${-3 * s} ${5 * s} ${-7 * s} ${7.5 * s} ${-11 * s} ${7.5 * s}s${-8 * s} ${-2.5 * s} ${-11 * s} ${-7.5 * s}z`} fill="none" style={ink} strokeWidth={2.2} strokeLinejoin="round" />
        <circle cx={x} cy={y} r={3.2 * s} style={{ fill: 'var(--koppar-text)' }} />
      </g>
    )
  }
  if (steg === 'annonsen') {
    return (
      <g fill="none" style={ink} strokeLinecap="round">
        <rect x={x - 8 * s} y={y - 10 * s} width={16 * s} height={20 * s} rx={2.5 * s} strokeWidth={2.2} />
        <path d={`M${x - 4 * s} ${y - 4 * s}h${8 * s}M${x - 4 * s} ${y}h${8 * s}M${x - 4 * s} ${y + 4 * s}h${5 * s}`} strokeWidth={1.8} />
      </g>
    )
  }
  if (steg === 'brevet') {
    return (
      <g transform={`translate(${x - 11 * s} ${y - 11 * s}) scale(${0.92 * s})`}>
        <path d="M4 20l1.5-5.5L16.5 3.5l4 4L9.5 18.5z" fill="none" style={ink} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  }
  return (
    <g transform={`translate(${x - 10 * s} ${y - 10 * s}) scale(${0.84 * s})`} style={{ color: 'var(--koppar-text)' }}>
      <path d="M6 21V3" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M7.5 4h12l-3.5 4.5L19.5 13h-12z" fill="currentColor" />
    </g>
  )
}

function Dator({ steg, klara, utanAnnons }: { steg: BrevSteg | null; klara: readonly BrevSteg[]; utanAnnons: boolean }) {
  const { aktuell, klarSet, nadd } = index(steg, klara)
  const { E, EK } = etiketter(utanAnnons)
  const fran = Math.max(0, nadd)
  return (
    <>
      <path d="M-900 560V262C-560 262 -220 252 0 214C150 180 300 250 600 150C700 117 800 108 900 100V560Z" style={{ fill: 'var(--b3-kulle-1)' }} />
      <path
        d="M-900 560V300C-560 300 -200 264 0 258C60 258 92 254 122 250S176 238 204 228S258 212 286 204S336 192 362 186S412 170 438 160S488 142 510 134S560 118 600 92S760 36 900 16V560Z"
        style={{ fill: 'var(--b3-kulle-2)' }}
      />
      <g style={{ fill: 'var(--vagg-svag)' }}>
        <circle cx="250" cy="52" r="2" />
        <circle cx="292" cy="96" r="1.5" />
        <circle cx="196" cy="118" r="1.5" />
      </g>
      {fran < 3 ? <path d={kurva(fran, 3)} fill="none" style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 11" /> : null}
      {nadd > 0 ? <path d={kurva(0, nadd)} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth={6} strokeLinecap="round" /> : null}
      {BANANS_STEG.map((s, i) => {
        const [x, y] = DATOR[i]
        const ar = i === aktuell
        const klar = klarSet.has(s) && !ar
        const text = (ty: number, stark: boolean, t: string) => (
          <text className="b3-bana-text" x={x} y={ty} textAnchor="middle" fontSize={stark ? 13 : 12} fontWeight={stark ? 700 : 600} style={{ fill: stark ? 'var(--vagg-ink)' : 'var(--vagg-mjuk)' }}>
            {t}
          </text>
        )
        const flagga =
          s === 'skickat' ? (
            <g>
              <path d={`M${x} ${y}V${y - 52}`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
              <path d={`M${x + 1.5} ${y - 50}h29l-7.5 10.5 7.5 10.5h-29z`} style={{ fill: 'var(--koppar)' }} />
            </g>
          ) : null
        if (ar) {
          return (
            <g key={s}>
              {flagga}
              <circle className="b3-halo" cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={21} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              <AktuellIkon steg={s} x={x} y={y} s={1} />
              {text(y + 46, true, E[s])}
            </g>
          )
        }
        if (s === 'skickat') {
          return (
            <g key={s}>
              {flagga}
              {klar ? (
                <>
                  <circle cx={x} cy={y} r={11} style={{ fill: 'var(--vagg-ink)' }} />
                  <path d={bock(x, y, 0.78)} fill="none" style={{ stroke: 'var(--vagg)' }} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <circle cx={x} cy={y} r={8} style={{ fill: 'var(--vagg-ink)' }} />
              )}
              {text(klar ? y + 34 : y + 28, klar, EK[s])}
            </g>
          )
        }
        if (klar) {
          return (
            <g key={s}>
              <circle cx={x} cy={y} r={13} style={{ fill: 'var(--koppar)' }} />
              <path d={bock(x, y)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              {text(y + 36, false, EK[s])}
            </g>
          )
        }
        return (
          <g key={s}>
            <circle cx={x} cy={y} r={9} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={3} />
            {text(y + 31, false, E[s])}
          </g>
        )
      })}
    </>
  )
}

function Mobil({ steg, klara, utanAnnons }: { steg: BrevSteg | null; klara: readonly BrevSteg[]; utanAnnons: boolean }) {
  const { aktuell, klarSet, nadd } = index(steg, klara)
  const { E, EK } = etiketter(utanAnnons)
  const fran = Math.max(0, nadd)
  const y = MOBIL_Y
  return (
    <>
      {fran < 3 ? <path d={`M${MOBIL_X[fran]} ${y}H${MOBIL_X[3]}`} style={{ stroke: 'var(--vagg-svag)' }} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="1 9" /> : null}
      {nadd > 0 ? <path d={`M${MOBIL_X[0]} ${y}H${MOBIL_X[nadd]}`} style={{ stroke: 'var(--koppar)' }} strokeWidth={5} strokeLinecap="round" /> : null}
      {BANANS_STEG.map((s, i) => {
        const x = MOBIL_X[i]
        const ar = i === aktuell
        const klar = klarSet.has(s) && !ar
        const tx = s === 'skickat' ? x - 6 : x
        const text = (stark: boolean, t: string) => (
          <text className="b3-bana-text" x={tx} y={stark ? 60 : 58} textAnchor="middle" fontSize={stark ? 12 : 11} fontWeight={stark ? 700 : 600} style={{ fill: stark ? 'var(--vagg-ink)' : 'var(--vagg-mjuk)' }}>
            {t}
          </text>
        )
        const flagga =
          s === 'skickat' ? (
            <g>
              <path d={`M${x} ${y + 4}V4`} style={{ stroke: 'var(--vagg-ink)' }} strokeWidth={3} strokeLinecap="round" />
              <path d={`M${x + 1.5} 5h22l-6 8 6 8h-22z`} style={{ fill: 'var(--koppar)' }} />
            </g>
          ) : null
        if (ar) {
          return (
            <g key={s}>
              {flagga}
              <circle className="b3-halo" cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)' }} />
              <circle cx={x} cy={y} r={15} style={{ fill: 'var(--koppar)', stroke: 'var(--vagg-ink)' }} strokeWidth={3} />
              <AktuellIkon steg={s} x={x} y={y} s={0.73} />
              {text(true, E[s])}
            </g>
          )
        }
        if (s === 'skickat') {
          return (
            <g key={s}>
              {flagga}
              {klar ? (
                <>
                  <circle cx={x} cy={y + 4} r={9} style={{ fill: 'var(--vagg-ink)' }} />
                  <path d={bock(x, y + 4, 0.66)} fill="none" style={{ stroke: 'var(--vagg)' }} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <circle cx={x} cy={y + 4} r={6} style={{ fill: 'var(--vagg-ink)' }} />
              )}
              {text(klar, EK[s])}
            </g>
          )
        }
        if (klar) {
          return (
            <g key={s}>
              <circle cx={x} cy={y} r={10} style={{ fill: 'var(--koppar)' }} />
              <path d={bock(x, y, 0.78)} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              {text(false, EK[s])}
            </g>
          )
        }
        return (
          <g key={s}>
            <circle cx={x} cy={y} r={7} style={{ fill: 'var(--vagg)', stroke: 'var(--vagg-svag)' }} strokeWidth={2.5} />
            {text(false, E[s])}
          </g>
        )
      })}
    </>
  )
}

export function BrevBana({ steg, klara, form, utanAnnons = false, className }: BrevBanaProps) {
  const etikett = banaEtikett(steg, klara, utanAnnons)
  if (form === 'mobil') {
    return (
      <svg viewBox="0 0 380 70" width="380" height="70" className={className ? `b3-bana-mobil ${className}` : 'b3-bana-mobil'} role="img" aria-label={etikett}>
        <Mobil steg={steg} klara={klara} utanAnnons={utanAnnons} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 600 300" width="580" height="290" className={className ? `b3-bana-dator ${className}` : 'b3-bana-dator'} role="img" aria-label={etikett}>
      <Dator steg={steg} klara={klara} utanAnnons={utanAnnons} />
    </svg>
  )
}
