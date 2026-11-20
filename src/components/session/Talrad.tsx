/**
 * Talraden (omgång 2 steg A, ägarens anmärkning på skissen: serien gick
 * utanför rutan på Pixel 7 och i artikelrutan). En gemensam talrad för
 * talserierna i ramen, i Uppgiftslistan, i artiklarna och i det publika
 * provet (steg C).
 *
 * Måtten är skissens (talserier.js): rutor 56 × 54 med 10 px mellan, radie
 * 12, talet 26 px i display (22 vid åtta rutor eller fler, mindre när talet
 * har många tecken). Raden är aldrig bredare än sin behållare: hela raden
 * skalas likformigt med container query-enheter (cqw) när behållaren är
 * smalare än raden, så att hela serien alltid ryms på en rad, i ramen på
 * 412 px och i en artikelruta på 300 px. Inget skript, ingen mätning: rätt
 * storlek redan i serverns HTML (CLS 0).
 *
 * Bågarna och det röda steget i facit (steg B) ritas i `overlay`, en SVG i
 * radens egna designmått (viewBox: radens bredd W och höjden ovan + 54 +
 * under) som skalas med raden. `ovan` och `under` reserverar platsen från
 * start, så att inget flyttar när facit kommer. `geometri(n)` ger rutornas
 * mitt för den som ritar.
 *
 * Ingen 'use client': ritas på servern i artiklarna.
 */

import type { CSSProperties, ReactNode } from 'react'

export const TALRAD = { BW: 56, BH: 54, GAP: 10 } as const

export interface TalradGeometri {
  n: number
  /** Radens bredd i designmått. */
  W: number
  /** Rutans mitt (x) i designmått. */
  cx: (i: number) => number
  /** Rutornas överkant (y) i overlay-SVG:n, det vill säga `ovan`. */
  topp: number
  BW: number
  BH: number
  GAP: number
}

export function geometri(n: number, ovan = 0): TalradGeometri {
  const { BW, BH, GAP } = TALRAD
  return { n, W: n * BW + Math.max(0, n - 1) * GAP, cx: (i) => i * (BW + GAP) + BW / 2, topp: ovan, BW, BH, GAP }
}

export interface TalradRuta {
  /** Talet som text ("76", "−7"), eller null för en tom lucka ("?"). */
  text: string | null
  /** Luckan: ton-yta med streckad kant, eller fylld med facit. */
  lucka?: boolean
  /** Luckan fylld med rätt tal efter facit: positiv-mjuk med 2 px positiv. */
  facit?: boolean
  /** Varvade serier: rutan hör till serien som ritas i ton-ink. */
  ton?: boolean
  /** Skärmläsarens text för rutan. Utelämnad: talet eller "lucka". */
  aria?: string
  /** Fördröjning i ms innan den fyllda luckan glider in (steg B: efter bågarna). */
  fordrojning?: number
}

export interface TalradProps {
  rutor: TalradRuta[]
  /** Plats ovanför rutorna i designmått (bågarna), reserverad från start. */
  ovan?: number
  /** Plats under rutorna i designmått (varvade serier, det röda steget). */
  under?: number
  /** Bågarna och felsteget i designmått (steg B). */
  overlay?: (g: TalradGeometri) => ReactNode
  /** Rad under rutorna i radens bredd (etiketter i procent av raden). */
  efter?: ReactNode
  /** Mindre rutor (Uppgiftslistan, artikelns lösning): skalan 0,8. */
  liten?: boolean
  /** Egen skala när raden ryms (brädet i talserierna, omgång 3: 1,5). Går före `liten`. */
  skala?: number
  className?: string
  ariaLabel?: string
}

/** Designmått till CSS: px när raden ryms, annars andel av behållarens bredd. */
function matt(d: number, W: number, skala: number): string {
  const px = d * skala
  return `min(${+px.toFixed(2)}px, ${+((d / W) * 100).toFixed(4)}cqw)`
}

/** Talets storlek i designmått efter antal rutor och tecken. */
export function talStorlek(tecken: number, n: number): number {
  const bas = n >= 8 ? 22 : 26
  // Siffrorna är tabulära och cirka 0,6 em breda; 6 px luft i rutan.
  return Math.min(bas, (TALRAD.BW - 6) / (Math.max(1, tecken) * 0.6))
}

export default function Talrad({ rutor, ovan = 0, under = 0, overlay, efter, liten = false, skala, className = '', ariaLabel = 'Talraden' }: TalradProps) {
  const n = rutor.length
  const g = geometri(n, ovan)
  const { BW, BH, GAP } = TALRAD
  const W = g.W
  const s = skala ?? (liten ? 0.8 : 1)
  const m = (d: number) => matt(d, W, s)
  const H = ovan + BH + under
  return (
    <div className={`talrad w-full ${className}`} style={{ containerType: 'inline-size' }} data-talrad-yta>
      <div className="relative mx-auto" style={{ width: m(W), paddingTop: m(ovan), paddingBottom: m(under) }}>
        <div role="list" aria-label={ariaLabel} className="flex" style={{ gap: m(GAP) }} data-talrad>
          {rutor.map((r, i) => {
            const text = r.text ?? '?'
            const tom = r.lucka && r.text == null
            const stil: CSSProperties = {
              width: m(BW),
              height: m(BH),
              borderRadius: m(12),
              fontSize: m(talStorlek(text.length, n)),
            }
            const yta = tom
              ? 'border-[1.5px] border-dashed border-kant-stark bg-ton text-ink-3'
              : r.facit
                ? 'border-2 border-positiv bg-positiv-mjuk text-ink-1 talrad-in'
                : r.ton
                  ? 'border border-ton-ink bg-papper text-ink-1'
                  : 'border border-kant bg-papper text-ink-1 shadow-[inset_0_0_0_1px_var(--papper-2)]'
            return (
              <span
                key={i}
                role="listitem"
                aria-label={r.aria ?? (tom ? 'lucka' : r.lucka ? `lucka, ${text}` : text)}
                className={`flex flex-shrink-0 items-center justify-center font-sess-display font-bold leading-none tabular-nums tracking-[-.02em] ${yta}`}
                style={r.facit && r.fordrojning ? { ...stil, animationDelay: `${r.fordrojning}ms` } : stil}
                data-lucka={r.lucka ? (tom ? 'tom' : 'fylld') : undefined}
                data-ton={r.ton ? '' : undefined}
              >
                {text}
              </span>
            )
          })}
        </div>
        {overlay ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-x-0 top-0 h-full w-full overflow-visible"
            aria-hidden="true"
            focusable="false"
            data-talrad-overlay
          >
            {overlay(g)}
          </svg>
        ) : null}
      </div>
      {efter ? (
        <div className="relative mx-auto" style={{ width: m(W) }}>
          {efter}
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ Bågarna */

/**
 * Bågarna i facit (omgång 2 steg B, skissens Talserier-facit och
 * Talserier-former). Ritas i Talrads `overlay` med radens geometri, så att
 * de skalas med raden och aldrig flyttar något (platsen är reserverad med
 * `ovan` och `under`).
 *
 *   steg       en kubisk båge från källrutan till målrutan, välvd 34 px (50
 *              för varannan när bågarna är fler än fem), i ink-2 1,75 px med
 *              en liten pilspets i målrutan och steget i en papperspill på
 *              bågens topp
 *   summa      ett klammer över de två källrutorna och en kort båge ned i
 *              målrutan, växelvis över och under raden; "summa" bara på det
 *              första klammret
 *   varvad     serie 0 ovanför raden i ton-ink, serie 1 under raden i ink-2
 *   hennes fel ett streckat steg i fel från källrutan ned till hennes tal i
 *              en ruta med fel-ram, och "ditt svar: −8" räknat ur talen
 *
 * Ordningen: bågarna ritas in vänster till höger (stroke-dashoffset 200 ms,
 * 100 ms förskjutning), luckan fylls 160 ms efter sista bågen och det röda
 * steget 200 ms därefter. prefers-reduced-motion: allt står direkt
 * (globals.css). Färgerna är rummets tokens, så mörkt läge följer med.
 */

export interface TalradBage {
  fran: number[]
  till: number
  text: string
  serie?: 0 | 1
}

/** Platsen talraden reserverar från start i talserierna (skissen: 52 över, 80 under). */
export const TALRAD_BAGAR = { ovan: 52, under: 80 } as const

export interface BagarTiming {
  /** När luckan fylls, ms efter att facit kom. */
  lucka: number
  /** När hennes steg ritas, ms efter att facit kom. */
  fel: number
}

const START_MS = 120
const BAGE_MS = 200
const FORSKJUTNING_MS = 100

/** Tidpunkterna för luckan och felsteget efter `antal` bågar. */
export function bagarTiming(antal: number): BagarTiming {
  const sista = START_MS + Math.max(0, antal - 1) * FORSKJUTNING_MS + BAGE_MS
  return { lucka: sista + 160, fel: sista + 160 + 200 }
}

const r1 = (x: number) => Math.round(x * 10) / 10

/** Pilspetsen i (x, y) med riktningen (dx, dy). */
function spets(x: number, y: number, dx: number, dy: number, langd = 6.5, vinkel = 0.5): string {
  const l = Math.hypot(dx, dy) || 1
  const ux = dx / l
  const uy = dy / l
  const v = (a: number) => [x - langd * (ux * Math.cos(a) - uy * Math.sin(a)), y - langd * (uy * Math.cos(a) + ux * Math.sin(a))]
  const [ax, ay] = v(vinkel)
  const [bx, by] = v(-vinkel)
  return `M${r1(ax)} ${r1(ay)} L${r1(x)} ${r1(y)} L${r1(bx)} ${r1(by)}`
}

function pillBredd(text: string): number {
  return Math.max(36, Math.round(text.length * 7.2 + 16))
}

function Pill({ x, y, text, farg, fordrojning }: { x: number; y: number; text: string; farg: string; fordrojning: number }) {
  const w = pillBredd(text)
  return (
    <g className="talrad-etik" style={{ animationDelay: `${fordrojning}ms` }}>
      <rect x={r1(x - w / 2)} y={r1(y - 9)} width={w} height={18} rx={6} fill="var(--papper)" stroke="var(--kant)" />
      <text x={r1(x)} y={r1(y + 4)} textAnchor="middle" fontSize={12} fontWeight={600} fill={farg} className="tabular-nums">
        {text}
      </text>
    </g>
  )
}

/** En båge mellan två rutor, ovanför (`upp`) eller under raden. */
function StegBage({ g, b, hojd, upp, farg, fordrojning }: { g: TalradGeometri; b: TalradBage; hojd: number; upp: boolean; farg: string; fordrojning: number }) {
  const fran = b.fran[b.fran.length - 1]
  const x0 = g.cx(fran) + 2
  const x1 = g.cx(b.till) - 2
  const y0 = upp ? g.topp - 5 : g.topp + g.BH + 5
  const yk = upp ? y0 - hojd : y0 + hojd
  const c = 0.45 * (x1 - x0)
  const topp = upp ? y0 - 0.75 * hojd : y0 + 0.75 * hojd
  return (
    <g data-bage={b.till} data-serie={b.serie}>
      <path
        className="talrad-bage"
        pathLength={1}
        style={{ animationDelay: `${fordrojning}ms` }}
        d={`M${r1(x0)} ${r1(y0)} C${r1(x0 + c)} ${r1(yk)}, ${r1(x1 - c)} ${r1(yk)}, ${r1(x1)} ${r1(y0)}`}
        fill="none"
        stroke={farg}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <path
        className="talrad-etik"
        style={{ animationDelay: `${fordrojning + 140}ms` }}
        d={spets(x1, y0, c, y0 - yk)}
        fill="none"
        stroke={farg}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Pill x={(x0 + x1) / 2} y={topp} text={b.text} farg={farg} fordrojning={fordrojning + 120} />
    </g>
  )
}

/** Summaseriens klammer över (eller under) de två källrutorna med en kort båge ned i målrutan. */
function Klammer({ g, b, upp, etikett, fordrojning }: { g: TalradGeometri; b: TalradBage; upp: boolean; etikett: boolean; fordrojning: number }) {
  const a = Math.min(...b.fran)
  const z = Math.max(...b.fran)
  const xa = g.cx(a) - 18
  const xz = g.cx(z) + 18
  const mitt = (xa + xz) / 2
  const tx = g.cx(b.till)
  const farg = 'var(--ink-2)'
  // Klammrets ben står 24 px från rutorna, ryggen 30 px.
  const ben = upp ? g.topp - 24 : g.topp + g.BH + 24
  const s = upp ? -1 : 1
  const sv = upp ? 1 : 0
  const klammer = `M${r1(xa)} ${r1(ben)} v${4 * s} a2 2 0 0 ${sv} 2 ${2 * s} h${r1(xz - xa - 4)} a2 2 0 0 ${sv} 2 ${-2 * s} v${-4 * s}`
  const y0 = ben - 2 * s
  const y1 = upp ? g.topp - 2 : g.topp + g.BH + 2
  const bage = `M${r1(mitt)} ${r1(y0)} C${r1(mitt)} ${r1(y0 - 6 * s)}, ${r1(tx)} ${r1(y0 - 2 * s)}, ${r1(tx)} ${r1(y1)}`
  return (
    <g data-bage={b.till} data-klammer>
      <path className="talrad-bage" pathLength={1} style={{ animationDelay: `${fordrojning}ms` }} d={klammer} fill="none" stroke={farg} strokeWidth={1.5} strokeLinecap="round" />
      <path className="talrad-bage" pathLength={1} style={{ animationDelay: `${fordrojning + 80}ms` }} d={bage} fill="none" stroke={farg} strokeWidth={1.5} strokeLinecap="round" />
      <path className="talrad-etik" style={{ animationDelay: `${fordrojning + 200}ms` }} d={spets(tx, y1, 0, -s)} fill="none" stroke={farg} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {etikett ? (
        <text className="talrad-etik" style={{ animationDelay: `${fordrojning + 120}ms` }} x={r1(mitt)} y={r1(upp ? ben - 12 : ben + 20)} textAnchor="middle" fontSize={12} fontWeight={600} fill={farg}>
          {b.text}
        </text>
      ) : null}
    </g>
  )
}

/** Steget mellan två tal som text: "+4", "−8", "×3", "÷2". Multiplikativt när regelns steg är det. */
export function stegText(fran: number, till: number, multiplikativ: boolean): string {
  if (multiplikativ && fran !== 0 && till !== 0) {
    const q = till / fran
    if (Number.isInteger(q)) return q < 0 ? `×(−${-q})` : `×${q}`
    const d = fran / till
    if (Number.isInteger(d)) return d < 0 ? `÷(−${-d})` : `÷${d}`
  }
  const d = till - fran
  return d < 0 ? `−${-d}` : `+${d}`
}

const arMultiplikativ = (text: string) => /^[×÷]\S*$/.test(text.trim())

export interface HennesSvar {
  /** Hennes tal per lucka, i ordning. */
  tal: number[]
  /** Rätt tal per lucka. */
  ratt: number[]
}

/** Hennes steg per felaktig lucka: källrutan och stegets text. Exporteras för testet. */
export function hennesSteg(bagar: TalradBage[], visade: number[], svar: HennesSvar): { j: number; src: number; text: string }[] {
  const hennes = [...visade, ...svar.tal]
  const ut: { j: number; src: number; text: string }[] = []
  svar.tal.forEach((tal, k) => {
    if (tal === svar.ratt[k]) return
    const j = visade.length + k
    const b = bagar.find((x) => x.till === j)
    const src = b ? b.fran[b.fran.length - 1] : j - 1
    let text: string
    if (b && b.fran.length > 1) {
      const d = tal - b.fran.reduce((s, i) => s + hennes[i], 0)
      text = `summa ${d < 0 ? `−${-d}` : `+${d}`}`
    } else {
      text = stegText(hennes[src], tal, b ? arMultiplikativ(b.text) : false)
    }
    ut.push({ j, src, text })
  })
  return ut
}

/**
 * Hennes fel: för varje lucka där hennes tal skiljer sig ett streckat steg i
 * fel från källrutan (regelns källa för luckan, annars rutan före) ned till
 * hennes tal i en ruta under luckan. Etiketten "ditt svar: −8" står till
 * vänster om första felrutan och räknas ur talen: hennes tal mot källans
 * (de visade talen och hennes egna tidigare svar).
 */
function HennesSteg({
  g,
  bagar,
  visade,
  svar,
  fordrojning,
  under,
  etikett,
}: {
  g: TalradGeometri
  bagar: TalradBage[]
  visade: number[]
  svar: HennesSvar
  fordrojning: number
  under: number
  etikett?: (steg: { j: number; text: string }[], luckor: number) => string
}) {
  const steg = hennesSteg(bagar, visade, svar)
  if (!steg.length) return null
  const hennes = [...visade, ...svar.tal]
  const boxTopp = g.topp + g.BH + under - 36
  const forsta = steg[0]
  return (
    <g className="talrad-fel" style={{ animationDelay: `${fordrojning}ms` }} data-hennes-steg>
      {steg.map(({ j, src }) => {
        const sx = g.cx(src)
        const sy = g.topp + g.BH + 8
        const ex = g.cx(j) - 2
        const ey = boxTopp - 4
        const tal = hennes[j]
        const t = tal < 0 ? `−${-tal}` : String(tal)
        const fs = Math.min(20, 46 / (Math.max(1, t.length) * 0.6))
        return (
          <g key={j}>
            <path d={`M${r1(sx)} ${r1(sy)} C${r1(sx)} ${r1(sy + 30)}, ${r1(ex - 8)} ${r1(ey - 18)}, ${r1(ex)} ${r1(ey)}`} fill="none" stroke="var(--fel)" strokeWidth={1.75} strokeDasharray="4 4" strokeLinecap="round" />
            <path d={spets(ex, ey, 8, 18)} fill="none" stroke="var(--fel)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={r1(g.cx(j) - 26)} y={r1(boxTopp)} width={52} height={34} rx={10} fill="var(--papper)" stroke="var(--fel)" strokeWidth={1.5} />
            <text x={r1(g.cx(j))} y={r1(boxTopp + 17 + fs * 0.35)} textAnchor="middle" fontSize={r1(fs)} fontWeight={700} fill="var(--ink-1)" style={{ fontFamily: 'var(--font-sess-display)' }} className="tabular-nums">
              {t}
            </text>
          </g>
        )
      })}
      <text x={r1(g.cx(forsta.j) - 34)} y={r1(boxTopp + 22)} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--fel)" className="tabular-nums">
        {etikett
          ? etikett(
              steg.map((s) => ({ j: s.j - visade.length, text: s.text })),
              svar.tal.length
            )
          : `ditt svar: ${steg.map((s) => s.text).join(', ')}`}
      </text>
    </g>
  )
}

export interface BagarProps {
  g: TalradGeometri
  bagar: TalradBage[]
  /** De visade talen (källorna till hennes steg). */
  visade: number[]
  /** Hennes svar när det var fel; utelämnat: inget rött steg. */
  svar?: HennesSvar | null
  /** Platsen under raden (samma som Talrads `under`). */
  under?: number
  /** Etiketten vid hennes steg (brädet, omgång 3). Utelämnad: "ditt svar: −8". */
  etikett?: (steg: { j: number; text: string }[], luckor: number) => string
}

/** Bågarna och hennes steg, för Talrads `overlay`. */
export function TalradBagar({ g, bagar, visade, svar = null, under = TALRAD_BAGAR.under, etikett }: BagarProps) {
  const varvad = bagar.some((b) => b.serie !== undefined)
  // Breda etiketter ("×(−2) −7") krockar med grannen: två höjder med större skillnad, oavsett antal.
  const bred = bagar.some((b) => pillBredd(b.text) > 60)
  const tva = (bagar.length > 5 || bred) && !varvad
  const [lag, hog] = bred ? [30, 58] : [34, 50]
  const tid = bagarTiming(bagar.length)
  return (
    <>
      {bagar.map((bage, k) => {
        const fordrojning = START_MS + k * FORSKJUTNING_MS
        if (bage.fran.length > 1) return <Klammer key={k} g={g} b={bage} upp={k % 2 === 0} etikett={k === 0} fordrojning={fordrojning} />
        if (varvad) {
          const upp = bage.serie !== 1
          return <StegBage key={k} g={g} b={bage} hojd={34} upp={upp} farg={upp ? 'var(--ton-ink)' : 'var(--ink-2)'} fordrojning={fordrojning} />
        }
        return <StegBage key={k} g={g} b={bage} hojd={tva && k % 2 === 1 ? hog : lag} upp farg="var(--ink-2)" fordrojning={fordrojning} />
      })}
      {svar ? <HennesSteg g={g} bagar={bagar} visade={visade} svar={svar} fordrojning={tid.fel} under={under} etikett={etikett} /> : null}
    </>
  )
}
