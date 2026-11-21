/**
 * Väggens banor (SVG, data som props): jobbsökets väg med stationer och
 * brickor (Main, Mobil-oversikt), den numrerade vägen för den som saknar CV
 * (Oversikt-ny), tjänstens väg (Sokta-tjanst, Sokta-folj-upp, Mobil-tjanst)
 * och de sju frågorna (Intervju, Mobil-intervju).
 *
 * Varje bana ritas två gånger, en för dator och en för telefon, med
 * skissens koordinater ordagrant; CSS visar den som gäller. Färgerna är
 * väggens och desamma i mörkt läge. Pulsen och spåret står still under
 * prefers-reduced-motion.
 *
 * Serverkomponenter.
 */

import Link from 'next/link'
import { Prickar } from './delar'

const VAGG = 'var(--vagg)'
const INK = 'var(--vagg-ink)'
const MJUK = 'var(--vagg-mjuk)'
const SVAG = 'var(--vagg-svag)'
const KOPPAR = 'var(--koppar)'
const KANT = 'var(--j3-vb-kant)'
const DISP = "var(--font-display), 'Schibsted Grotesk', Inter, sans-serif"
const SANS = 'Inter, system-ui, sans-serif'

/** Ungefärlig bredd på en tagg i väggen (12,5 px fet Inter). */
function taggBredd(text: string): number {
  return Math.round(text.length * 6.3 + 20)
}

/* ============================================================== jobbsökets väg */

export interface BanBricka {
  /** Företagets två första bokstäver. */
  kod: string
  /** Tyst i minst tolv dagar: kopparkant. */
  tyst?: boolean
  /** Tagg ovanför brickan ("tyst 15 dagar", "tis 10.00"). Bara på dator. */
  tagg?: string
  /** Taggen i koppar (tyst) eller ljus (en tid). Koppar om brickan är tyst. */
  taggTon?: 'koppar' | 'ljus'
}

export interface BanStation {
  /** Upp till kapaciteten visas, sedan en bricka med "+N". */
  brickor: BanBricka[]
  /** Raden under stationens namn ("4 väntar svar"). */
  under?: string
  /** Kortare rad på telefon ("4, en tyst"). */
  underMobil?: string
}

export interface JobbsokBanaProps {
  skaSokas: BanStation
  sokt: BanStation
  intervju: BanStation
  erbjudande: BanStation
  /** Skärmläsarens mening om hela banan. */
  etikett: string
}

type Pt = [number, number]
type Plats = { x: number; y: number }

const D = {
  st: [[60, 372], [226, 318], [420, 236], [590, 120]] as Pt[],
  hel: 'M60 372C124 372 156 334 226 318S356 272 420 236S530 160 590 120',
  delar: ['M60 372C124 372 156 334 226 318', 'M60 372C124 372 156 334 226 318S356 272 420 236', 'M60 372C124 372 156 334 226 318S356 272 420 236S530 160 590 120'],
  b: 54,
  rx: 15,
  fs: 17,
  platser: [
    [{ x: 4, y: 296 }, { x: 64, y: 296 }],
    [{ x: 170, y: 176 }, { x: 230, y: 176 }, { x: 170, y: 238 }, { x: 230, y: 238 }],
    [{ x: 363, y: 152 }, { x: 423, y: 152 }],
    [{ x: 530, y: 150 }],
  ] as Plats[][],
  namn: [[60, 402], [226, 350], [424, 272], [590, 152]] as Pt[],
}
const M = {
  st: [[36, 128], [140, 112], [252, 86], [354, 48]] as Pt[],
  hel: 'M36 128C80 128 96 116 140 112S212 98 252 86S320 62 354 48',
  delar: ['M36 128C80 128 96 116 140 112', 'M36 128C80 128 96 116 140 112S212 98 252 86', 'M36 128C80 128 96 116 140 112S212 98 252 86S320 62 354 48'],
  b: 32,
  rx: 9,
  fs: 12,
  platser: [
    [{ x: 2, y: 78 }, { x: 38, y: 78 }],
    [{ x: 105, y: 22 }, { x: 143, y: 22 }, { x: 105, y: 60 }, { x: 143, y: 60 }],
    [{ x: 217, y: 34 }, { x: 255, y: 34 }],
    [{ x: 314, y: 52 }],
  ] as Plats[][],
  namn: [[36, 150], [140, 134], [252, 110], [344, 72]] as Pt[],
}

const NAMN = ['Ska sökas', 'Sökt', 'Intervju', 'Erbjudande']

/** Brickorna som får plats, med "+N" på den sista om det är fler. */
function synliga(b: BanBricka[], plats: number): (BanBricka & { fler?: number })[] {
  if (b.length <= plats) return b
  const vis: (BanBricka & { fler?: number })[] = b.slice(0, plats - 1)
  vis.push({ kod: `+${b.length - plats + 1}`, fler: b.length - plats + 1 })
  return vis
}

function BanaSvg({ g, mobil, stationer, etikett }: { g: typeof D; mobil: boolean; stationer: BanStation[]; etikett: string }) {
  // Det längsta steget med brickor (Ska sökas räknas inte som framsteg).
  let nadd = 0
  for (let i = 1; i < 4; i++) if (stationer[i].brickor.length > 0) nadd = i
  const pkt = { forsta: mobil ? 7 : 9, passerad: mobil ? 8 : 10, nu: mobil ? 10 : 14, ram: mobil ? 2.5 : 3 }
  return (
    <svg
      className={mobil ? 'j3-bana mobil' : 'j3-bana dator'}
      viewBox={mobil ? '0 0 380 176' : '0 0 650 432'}
      width={mobil ? 380 : 612}
      height={mobil ? 176 : 407}
      role="img"
      aria-label={etikett}
      style={mobil ? undefined : { marginTop: -14 }}
    >
      <path d={g.hel} fill="none" stroke={SVAG} strokeWidth={mobil ? 3 : 3.5} strokeLinecap="round" strokeDasharray={mobil ? '1 8' : '1 10'} />
      {nadd > 0 ? <path className="j3-sparet" d={g.delar[nadd - 1]} fill="none" stroke={KOPPAR} strokeWidth={mobil ? 4.5 : 5} strokeLinecap="round" /> : null}

      <g fontFamily={DISP} fontWeight={800} fontSize={g.fs} textAnchor="middle">
        {stationer.map((st, i) => {
          const pl = g.platser[i]
          return synliga(st.brickor, pl.length).map((b, j) => {
            const { x, y } = pl[j]
            const tom = i === 0
            if (tom) {
              return (
                <g key={`${i}-${j}`}>
                  <rect x={x} y={y} width={g.b} height={g.b} rx={g.rx} fill={VAGG} stroke={MJUK} strokeWidth={mobil ? 2 : 2.5} strokeDasharray={mobil ? '4 4' : '6 5'} />
                  <text x={x + g.b / 2} y={y + g.b / 2 + g.fs * 0.35} fill={INK}>
                    {b.kod}
                  </text>
                </g>
              )
            }
            return (
              <g key={`${i}-${j}`}>
                <rect x={x} y={y + (mobil ? 3 : 5)} width={g.b} height={g.b} rx={g.rx} fill={b.tyst ? 'var(--j3-koppar-kant)' : KANT} />
                <rect x={x} y={y} width={g.b} height={g.b} rx={g.rx} fill={INK} {...(b.tyst ? { stroke: KOPPAR, strokeWidth: mobil ? 3 : 3.5 } : {})} />
                <text x={x + g.b / 2} y={y + g.b / 2 + g.fs * 0.35} fill={VAGG}>
                  {b.kod}
                </text>
              </g>
            )
          })
        })}
      </g>

      {!mobil ? (
        <g fontFamily={SANS} fontWeight={700} fontSize={12.5} textAnchor="middle">
          {stationer.map((st, i) => {
            const pl = g.platser[i]
            return synliga(st.brickor, pl.length).map((b, j) => {
              if (!b.tagg) return null
              const cx = pl[j].x + g.b / 2
              const w = taggBredd(b.tagg)
              const ljus = b.taggTon ? b.taggTon === 'ljus' : !b.tyst
              return (
                <g key={`t${i}-${j}`}>
                  <rect x={cx - w / 2} y={pl[j].y - 34} width={w} height={26} rx={13} fill={ljus ? INK : KOPPAR} />
                  <text x={cx} y={pl[j].y - 16.5} fill={ljus ? VAGG : 'var(--koppar-text)'}>
                    {b.tagg}
                  </text>
                </g>
              )
            })
          })}
        </g>
      ) : null}

      {/* Stationerna: Ska sökas ihålig, passerade i koppar, den senaste med puls, flaggan sist. */}
      {g.st.slice(0, 3).map(([x, y], i) => {
        if (i === 0 && nadd === 0) {
          return (
            <g key={i}>
              <circle className="j3-halo" cx={x} cy={y} r={pkt.nu} fill={KOPPAR} />
              <circle cx={x} cy={y} r={pkt.nu} fill={KOPPAR} stroke={INK} strokeWidth={pkt.ram} />
            </g>
          )
        }
        if (i === 0) return <circle key={i} cx={x} cy={y} r={pkt.forsta} fill={VAGG} stroke={MJUK} strokeWidth={mobil ? 2.2 : 2.5} />
        if (i < nadd) return <circle key={i} cx={x} cy={y} r={pkt.passerad} fill={KOPPAR} stroke={INK} strokeWidth={pkt.ram * 0.85} />
        if (i === nadd) {
          return (
            <g key={i}>
              <circle className="j3-halo" cx={x} cy={y} r={pkt.nu} fill={KOPPAR} />
              <circle cx={x} cy={y} r={pkt.nu} fill={KOPPAR} stroke={INK} strokeWidth={pkt.ram} />
            </g>
          )
        }
        return <circle key={i} cx={x} cy={y} r={pkt.forsta} fill={VAGG} stroke={MJUK} strokeWidth={mobil ? 2.2 : 2.5} />
      })}
      {mobil ? (
        <>
          <path d="M354 50V14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M355.5 15h20l-5.5 7.5 5.5 7.5h-20z" fill={KOPPAR} />
          <circle cx="354" cy="50" r={nadd === 3 ? 10 : 5.5} fill={nadd === 3 ? KOPPAR : INK} stroke={nadd === 3 ? INK : undefined} strokeWidth={nadd === 3 ? 2.5 : undefined} />
        </>
      ) : (
        <>
          <path d="M590 122V62" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M592 63h30l-8 11 8 11h-30z" fill={KOPPAR} />
          <circle cx="590" cy="122" r={nadd === 3 ? 14 : 7.5} fill={nadd === 3 ? KOPPAR : INK} stroke={nadd === 3 ? INK : undefined} strokeWidth={nadd === 3 ? 3 : undefined} />
        </>
      )}

      <g fontFamily={SANS} textAnchor="middle">
        {g.namn.map(([x, y], i) => {
          const st = stationer[i]
          const rad = mobil ? (st.underMobil ?? st.under) : st.under
          return (
            <g key={i}>
              <text x={x} y={y} fontSize={mobil ? 12 : 15} fontWeight={700} fill={INK}>
                {NAMN[i]}
              </text>
              {rad && i < 3 ? (
                <text x={x} y={y + (mobil ? 15 : 19)} fontSize={mobil ? 11 : 13} fontWeight={500} fill={MJUK}>
                  {rad}
                </text>
              ) : null}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/**
 * Jobbsökets väg i väggen (Översikt): Ska sökas, Sökt, Intervju,
 * Erbjudande, med en bricka per tjänst. Kapacitet: två under Ska sökas,
 * fyra under Sökt, två under Intervju, en vid flaggan; fler visas som "+N".
 * Spåret i koppar går till det längsta steget som har brickor.
 */
export function JobbsokBana(p: JobbsokBanaProps) {
  const st = [p.skaSokas, p.sokt, p.intervju, p.erbjudande]
  return (
    <>
      <BanaSvg g={D} mobil={false} stationer={st} etikett={p.etikett} />
      <BanaSvg g={M} mobil stationer={st} etikett={p.etikett} />
    </>
  )
}

/* ============================================================== den numrerade vägen */

export interface NyBanaSteg {
  rubrik: string
  under?: string
}

/**
 * Vägen för den som inte har laddat upp CV (Oversikt-ny): tre numrerade
 * steg och flaggan. `aktuellt` (1 till 3) pulserar i koppar; steg 2 och 3
 * har streckade tomma brickor som visar vart tjänsterna kommer.
 */
export function JobbsokBanaNy({ steg, aktuellt = 1, etikett }: { steg: [NyBanaSteg, NyBanaSteg, NyBanaSteg]; aktuellt?: 1 | 2 | 3; etikett: string }) {
  const dator = { st: [[60, 372], [226, 318], [420, 236]] as Pt[], r: [26, 22], fs: 20 }
  const mobil = { st: [[36, 128], [140, 112], [252, 86]] as Pt[], r: [16, 13], fs: 13 }
  const rita = (m: boolean) => {
    const g = m ? mobil : dator
    return (
      <svg className={m ? 'j3-bana mobil' : 'j3-bana dator'} viewBox={m ? '0 0 380 176' : '0 0 650 432'} width={m ? 380 : 612} height={m ? 176 : 407} role="img" aria-label={etikett} style={m ? undefined : { marginTop: -56 }}>
        <path d={m ? M.hel : D.hel} fill="none" stroke={SVAG} strokeWidth={m ? 3 : 3.5} strokeLinecap="round" strokeDasharray={m ? '1 8' : '1 10'} />
        <g opacity=".9">
          {m ? (
            <>
              <rect x="124" y="60" width="32" height="32" rx="9" fill={VAGG} stroke={SVAG} strokeWidth="2" strokeDasharray="4 4" />
              <rect x="217" y="34" width="32" height="32" rx="9" fill={VAGG} stroke={SVAG} strokeWidth="2" strokeDasharray="4 4" />
              <rect x="255" y="34" width="32" height="32" rx="9" fill={VAGG} stroke={SVAG} strokeWidth="2" strokeDasharray="4 4" />
            </>
          ) : (
            <>
              <rect x="199" y="232" width="54" height="54" rx="15" fill={VAGG} stroke={SVAG} strokeWidth="2.5" strokeDasharray="6 5" />
              <rect x="363" y="150" width="54" height="54" rx="15" fill={VAGG} stroke={SVAG} strokeWidth="2.5" strokeDasharray="6 5" />
              <rect x="423" y="150" width="54" height="54" rx="15" fill={VAGG} stroke={SVAG} strokeWidth="2.5" strokeDasharray="6 5" />
            </>
          )}
        </g>
        <g fontFamily={DISP} fontWeight={800} fontSize={g.fs} textAnchor="middle">
          {g.st.map(([x, y], i) => {
            const nu = i + 1 === aktuellt
            const r = nu ? g.r[0] : g.r[1]
            return (
              <g key={i}>
                {nu ? <circle className="j3-halo" cx={x} cy={y} r={r} fill={KOPPAR} /> : null}
                <circle cx={x} cy={y} r={r} fill={nu ? KOPPAR : VAGG} stroke={nu ? INK : MJUK} strokeWidth={nu ? (m ? 3 : 3.5) : m ? 2 : 2.5} />
                <text x={x} y={y + g.fs * 0.35} fill={nu ? 'var(--koppar-text)' : INK}>
                  {i + 1}
                </text>
              </g>
            )
          })}
        </g>
        {m ? (
          <>
            <path d="M354 50V14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <path d="M355.5 15h20l-5.5 7.5 5.5 7.5h-20z" fill={KOPPAR} />
            <circle cx="354" cy="50" r="5.5" fill={INK} />
          </>
        ) : (
          <>
            <path d="M590 122V62" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M592 63h30l-8 11 8 11h-30z" fill={KOPPAR} />
            <circle cx="590" cy="122" r="7.5" fill={INK} />
          </>
        )}
        <g fontFamily={SANS} textAnchor="middle">
          {(m
            ? ([[36, 158], [140, 140], [252, 114]] as Pt[])
            : ([[72, 424], [226, 364], [424, 282]] as Pt[])
          ).map(([x, y], i) => (
            <g key={i}>
              <text x={x} y={y} fontSize={m ? 12 : 15} fontWeight={700} fill={INK}>
                {steg[i].rubrik}
              </text>
              {steg[i].under && !(m && i === 0) ? (
                <text x={x} y={y + (m ? 15 : 19)} fontSize={m ? 11 : 13} fontWeight={500} fill={MJUK}>
                  {steg[i].under}
                </text>
              ) : null}
            </g>
          ))}
          <text x={m ? 344 : 590} y={m ? 72 : 152} fontSize={m ? 12 : 15} fontWeight={700} fill={INK}>
            Erbjudande
          </text>
        </g>
      </svg>
    )
  }
  return (
    <>
      {rita(false)}
      {rita(true)}
    </>
  )
}

/* ============================================================== tjänstens väg */

export type TjanstSteg = 'sokt' | 'svar' | 'intervju' | 'erbjudande'

export interface TjanstBanaProps {
  /** Det steg tjänsten står på. */
  steg: TjanstSteg
  /** Datum per steg som har hänt eller är bokat ("2 nov", "tis 24 nov 10.00"). */
  datum?: Partial<Record<TjanstSteg, string>>
  /** Kortare datum på telefon ("tis 24 nov"). */
  datumMobil?: Partial<Record<TjanstSteg, string>>
  /** Brickans kod, som står ovanför det aktuella steget. */
  kod: string
  /** Tyst i minst tolv dagar: ihålig kopparring och taggen ovanför brickan. */
  tyst?: string
  etikett: string
}

const TJ_ORDNING: TjanstSteg[] = ['sokt', 'svar', 'intervju', 'erbjudande']
const TJ_NAMN: Record<TjanstSteg, string> = { sokt: 'Sökt', svar: 'Svar', intervju: 'Intervju', erbjudande: 'Erbjudande' }

/**
 * Tjänstens väg i väggen: Sökt, Svar, Intervju, Erbjudande. Passerade steg
 * har en bock, det aktuella pulserar med brickan ovanför (på telefon står
 * koden i cirkeln). Tyst: ingen puls, en ihålig ring och taggen.
 */
export function TjanstBana({ steg, datum = {}, datumMobil = {}, kod, tyst, etikett }: TjanstBanaProps) {
  const n = TJ_ORDNING.indexOf(steg)
  const dSt: Pt[] = [[40, 252], [200, 206], [372, 142], [522, 62]]
  const dDelar = ['M40 252C110 252 130 216 200 206', 'M40 252C110 252 130 216 200 206S320 172 372 142', 'M40 252C110 252 130 216 200 206S320 172 372 142S470 84 522 62']
  const mSt: Pt[] = [[22, 66], [136, 52], [252, 34], [358, 16]]
  const mDelar = ['M22 66C80 66 100 56 136 52', 'M22 66C80 66 100 56 136 52S220 40 252 34', 'M22 66C80 66 100 56 136 52S220 40 252 34S320 22 358 16']
  const bock = (x: number, y: number, m: boolean) => (m ? `M${x - 5} ${y + 0.5}l3.3 3.3 6.7-7.2` : `M${x - 6.5} ${y + 0.5}l4.3 4.3 8.7-9.3`)

  const dator = (
    <svg className="j3-bana dator" viewBox="0 0 560 312" width={560} height={312} role="img" aria-label={etikett} style={{ marginTop: -8 }}>
      <path d="M40 252C110 252 130 216 200 206S320 172 372 142S470 84 522 62" fill="none" stroke={SVAG} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 10" />
      {n > 0 && !tyst ? <path className="j3-sparet" d={dDelar[n - 1]} fill="none" stroke={KOPPAR} strokeWidth="5" strokeLinecap="round" /> : null}
      {dSt.slice(0, 3).map(([x, y], i) => {
        if (i < n) {
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill={KOPPAR} stroke={INK} strokeWidth="3" />
              <path d={bock(x, y, false)} fill="none" stroke="var(--koppar-text)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        }
        if (i === n) {
          return tyst ? (
            <circle key={i} cx={x} cy={y} r="14" fill={VAGG} stroke={KOPPAR} strokeWidth="4" />
          ) : (
            <g key={i}>
              <circle className="j3-halo" cx={x} cy={y} r="14" fill={KOPPAR} />
              <circle cx={x} cy={y} r="14" fill={KOPPAR} stroke={INK} strokeWidth="3" />
            </g>
          )
        }
        return <circle key={i} cx={x} cy={y} r="9" fill={VAGG} stroke={MJUK} strokeWidth="2.5" />
      })}
      {n < 3 ? (
        (() => {
          const [x, y] = dSt[n]
          const bx = x - 30
          const by = y - 93
          return (
            <g>
              <rect x={bx} y={by + 6} width="60" height="60" rx="17" fill={tyst ? 'var(--j3-koppar-kant)' : KANT} />
              <rect x={bx} y={by} width="60" height="60" rx="17" fill={INK} {...(tyst ? { stroke: KOPPAR, strokeWidth: 4 } : {})} />
              <text x={x} y={by + 37} textAnchor="middle" fontFamily={DISP} fontWeight={800} fontSize="20" fill={VAGG}>
                {kod}
              </text>
              {tyst ? (
                <g>
                  <rect x={x - taggBredd(tyst) / 2} y={by - 37} width={taggBredd(tyst)} height="26" rx="13" fill={KOPPAR} />
                  <text x={x} y={by - 19.5} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize="12.5" fill="var(--koppar-text)">
                    {tyst}
                  </text>
                </g>
              ) : null}
            </g>
          )
        })()
      ) : null}
      <path d="M522 64V8" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M524 9h30l-8 11 8 11h-30z" fill={KOPPAR} />
      <circle cx="522" cy="64" r={n === 3 ? 14 : 7.5} fill={n === 3 ? KOPPAR : INK} stroke={n === 3 ? INK : undefined} strokeWidth={n === 3 ? 3 : undefined} />
      <g fontFamily={SANS} textAnchor="middle">
        {TJ_ORDNING.map((s, i) => {
          const [x, y] = dSt[i]
          const hant = i <= n
          const ty = i === 3 ? 96 : y + (tyst && i > 0 ? 32 : 36)
          return (
            <g key={s}>
              <text x={i === 3 ? 514 : x} y={ty} fontSize="15" fontWeight={700} fill={hant && !(tyst && i > 0) ? INK : MJUK}>
                {TJ_NAMN[s]}
              </text>
              {datum[s] && i < 3 ? (
                <text x={x} y={ty + 19} fontSize="13" fontWeight={500} fill={MJUK}>
                  {datum[s]}
                </text>
              ) : null}
            </g>
          )
        })}
      </g>
    </svg>
  )

  const mobil = (
    <svg className="j3-bana mobil" viewBox="0 0 380 112" width={380} height={112} role="img" aria-label={etikett} style={{ marginTop: 16 }}>
      <path d="M22 66C80 66 100 56 136 52S220 40 252 34S320 22 358 16" fill="none" stroke={SVAG} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
      {n > 0 && !tyst ? <path className="j3-sparet" d={mDelar[n - 1]} fill="none" stroke={KOPPAR} strokeWidth="5" strokeLinecap="round" /> : null}
      {mSt.slice(0, 3).map(([x, y], i) => {
        if (i < n) {
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="11" fill={KOPPAR} stroke={INK} strokeWidth="2.5" />
              <path d={bock(x, y, true)} fill="none" stroke="var(--koppar-text)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        }
        if (i === n) {
          return (
            <g key={i}>
              {tyst ? null : <circle className="j3-halo" cx={x} cy={y} r="13" fill={KOPPAR} />}
              <circle cx={x} cy={y} r="13" fill={INK} stroke={KOPPAR} strokeWidth="3.5" />
              <text x={x} y={y + 4.5} textAnchor="middle" fontFamily={DISP} fontWeight={800} fontSize="11" fill={VAGG}>
                {kod}
              </text>
            </g>
          )
        }
        return <circle key={i} cx={x} cy={y} r="7" fill={VAGG} stroke={MJUK} strokeWidth="2.2" />
      })}
      <path d="M358 18V-14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M359.5 -13h20l-5.5 7.5 5.5 7.5h-20z" fill={KOPPAR} />
      <circle cx="358" cy="18" r={n === 3 ? 11 : 6} fill={n === 3 ? KOPPAR : INK} />
      <g fontFamily={SANS} textAnchor="middle">
        {TJ_ORDNING.map((s, i) => {
          const [x, y] = mSt[i]
          const hant = i <= n && !(tyst && i > 0)
          const ty = i === 3 ? 44 : y + 28
          const d = datumMobil[s] ?? datum[s]
          return (
            <g key={s}>
              <text x={i === 3 ? 346 : i === 0 ? 24 : x} y={ty} fontSize="13" fontWeight={700} fill={hant ? INK : MJUK}>
                {TJ_NAMN[s]}
              </text>
              {d && i < 3 ? (
                <text x={i === 0 ? 24 : x} y={ty + 16} fontSize="11" fontWeight={500} fill={MJUK}>
                  {d}
                </text>
              ) : null}
            </g>
          )
        })}
      </g>
    </svg>
  )
  return (
    <>
      {dator}
      {mobil}
    </>
  )
}

/* ============================================================== de sju frågorna */

export interface Fraga {
  nr: number
  rubrik: string
  href: string
  /** 'ny' (inte gjord, streckad), 'klar' (övad), 'nasta' (den att öva på nu). */
  lage: 'ny' | 'klar' | 'nasta'
  /** Senaste betyg 1 till 5, om frågan är övad. */
  betyg?: number
  /** Betygets ord för skärmläsare ("Starkt"). */
  betygOrd?: string
  /** Raden under ("Inte gjord än", "resultatet saknades"). */
  under?: string
  /** Raden i koppar (det som saknades). */
  underKoppar?: boolean
}

/** Platserna i ormen på dator: fyra på översta raden, tre tillbaka på den undre. */
const FB_PLATS: [number, number][] = [[4, 24], [160, 24], [316, 24], [472, 24], [472, 214], [316, 214], [160, 214]]

/**
 * De sju vanligaste intervjufrågorna som en bana i väggen. Dator: ormen med
 * intervjun och flaggan sist (612 x 372). Telefon: en rad med sju rutor.
 * Varje fråga är en länk till provet.
 */
export function FrageBana({ fragor, intervju, etikett = 'De sju vanligaste intervjufrågorna och ditt läge i var och en' }: { fragor: Fraga[]; intervju?: { rubrik: string; under?: string }; etikett?: string }) {
  const nasta = fragor.find((f) => f.lage === 'nasta')
  const nastaIdx = nasta ? fragor.indexOf(nasta) : -1
  const sr = (f: Fraga) => `Fråga ${f.nr}, ${f.rubrik}, ${f.betyg ? `${f.betyg} av 5${f.betygOrd ? `, ${f.betygOrd}` : ''}` : 'inte gjord än'}${f.lage === 'nasta' ? ', nästa' : ''}`
  return (
    <>
      <div className="j3-fragebana" role="group" aria-label={etikett}>
        <svg width="612" height="372" viewBox="0 0 612 372" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <path d="M70 54H538C664 54 664 244 538 244H70" fill="none" stroke={SVAG} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 10" />
          {intervju ? (
            <>
              <path d="M70 246V190" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M72 191h30l-8 11 8 11H72z" fill={KOPPAR} />
              <circle cx="70" cy="246" r="7.5" fill={INK} />
            </>
          ) : null}
        </svg>
        {fragor.slice(0, 7).map((f, i) => (
          <Link key={f.nr} className="j3-fb" href={f.href} style={{ left: FB_PLATS[i][0], top: FB_PLATS[i][1] }} aria-label={sr(f)}>
            <span className={f.lage === 'ny' ? 'j3-ft' : `j3-ft ${f.lage}`} aria-hidden="true">
              {f.nr}
            </span>
            <b aria-hidden="true">{f.rubrik}</b>
            {f.betyg ? <Prickar antal={f.betyg} variant="vagg" /> : null}
            {f.under ? (
              <small className={f.underKoppar ? 'koppar' : undefined} aria-hidden="true">
                {f.under}
              </small>
            ) : null}
          </Link>
        ))}
        {nastaIdx >= 0 ? (
          <span className="j3-fb-nasta" aria-hidden="true" style={{ left: FB_PLATS[nastaIdx][0] + 25, top: FB_PLATS[nastaIdx][1] - 38 }}>
            Nästa
          </span>
        ) : null}
        {intervju ? (
          <div className="j3-fb" style={{ left: 4, top: 262 }}>
            <b style={{ marginTop: 0, fontSize: 14, lineHeight: '18px' }}>{intervju.rubrik}</b>
            {intervju.under ? <small>{intervju.under}</small> : null}
          </div>
        ) : null}
      </div>

      <div className="j3-sju" role="group" aria-label={etikett}>
        <svg height="4" viewBox="0 0 380 4" preserveAspectRatio="none" aria-hidden="true">
          <path d="M22 2h336" stroke={SVAG} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
        </svg>
        {fragor.slice(0, 7).map((f) => (
          <Link key={f.nr} href={f.href} aria-label={sr(f)}>
            <span className={f.lage === 'ny' ? 'j3-ft' : `j3-ft ${f.lage}`}>{f.nr}</span>
            {f.betyg ? <Prickar antal={f.betyg} variant="mini" /> : null}
          </Link>
        ))}
      </div>
    </>
  )
}
