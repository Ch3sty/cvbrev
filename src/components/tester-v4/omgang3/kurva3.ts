// Omgång 3: kurvans geometri i Din utveckling (skissens Utveckling,
// Utveckling-fa och Utveckling-ny). En testtyp i taget. Ren: inga hooks,
// ingen DOM. KurvGraf3 ritar det som räknas här.
//
//   Fylld     nivån över tid med osäkerhetsbandet, provets nivå (avancerad,
//             från 4,0) som tonat band, övningsproven på tidslinjen, i dag,
//             framtiden streckad till provdagen och "kvar" till provets nivå
//   En punkt  punkten, en prickad linje till förslaget om nästa Nivåkoll
//             ("punkt två ger en riktning") och rutan "En punkt är ett läge"
//   Ingen     axeln 1 till 10 med zonerna, i dag, brädets lucka och
//             Nivåkollerna en gång i veckan framåt som streckade ringar

import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum'
import type { NivaLage, PlanV4, TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { periodGranser, type Period } from '@/components/tester-v4/utveckling/geometri'
import { NIVAKOLL_INTERVALL_DAGAR } from '@/lib/tester/v4/bana'
import { PROVETS_NIVA } from './matt'

export interface Matt3 {
  W: number
  H: number
  L: number
  R: number
  T: number
  B: number
  /** Datumradens baslinje. */
  yDatum: number
}

export const MATT3: Readonly<Record<'dator' | 'mobil', Matt3>> = {
  dator: { W: 1064, H: 346, L: 56, R: 1024, T: 30, B: 300, yDatum: 326 },
  mobil: { W: 340, H: 236, L: 30, R: 318, T: 16, B: 192, yDatum: 214 },
}

export type Lage3 = 'fylld' | 'en' | 'ingen'

export interface KurvIn {
  idag: Dag
  plan: PlanV4 | null
  provdag: Dag | null
  punkter: readonly UtvecklingsPunkt[]
  typ: TestTypId
  niva: NivaLage
  period: Period
  bredd: 'dator' | 'mobil'
  /** Banans förslag om övningsprov, om det finns. */
  ovningsprovForslag: Dag | null
}

export interface Pt3 {
  p: UtvecklingsPunkt
  x: number
  y: number
}

export interface Kurva3 {
  lage: Lage3
  matt: Matt3
  fran: Dag
  till: Dag
  hi: number
  X: (d: Dag) => number
  Y: (v: number) => number
  linje: Pt3[]
  prov: Pt3[]
  idagX: number
  provX: number | null
  forslagX: number | null
  /** Nästa Nivåkoll som förslag (en punkt). */
  nastaX: number | null
  nastaDag: Dag | null
  iPlan: boolean
  datum: { x: number; text: string; anchor: 'start' | 'middle' | 'end' }[]
  ticks: number[]
}

const r1 = (v: number) => Math.round(v * 10) / 10
const MANAD = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const kd = (d: Dag) => {
  const [, m, dd] = d.split('-').map(Number)
  return `${dd} ${MANAD[m - 1]}`
}

export function byggKurva3(inp: KurvIn): Kurva3 {
  const matt = MATT3[inp.bredd]
  const egna = inp.punkter.filter((p) => p.typ === inp.typ)
  const paLinje = egna.filter((p) => p.slag !== 'ovningsprov' && p.niva != null && p.raknas)
  const lage: Lage3 = paLinje.length === 0 ? 'ingen' : paLinje.length === 1 ? 'en' : 'fylld'
  const iPlan = !!inp.plan && inp.plan.typer.includes(inp.typ)

  let fran: Dag
  let till: Dag
  if (lage === 'ingen') {
    fran = inp.idag
    till = laggTill(inp.idag, 28)
  } else if (lage === 'en') {
    fran = paLinje[0].dag < inp.idag ? paLinje[0].dag : inp.idag
    till = inp.provdag && inp.provdag > inp.idag ? inp.provdag : laggTill(fran, 28)
  } else {
    const g = periodGranser(inp.period, { idag: inp.idag, plan: inp.plan, provdag: inp.provdag, punkter: egna })
    fran = g.fran
    till = g.till
    if (till === inp.idag) till = laggTill(inp.idag, 3)
  }
  const span = Math.max(1, dagarMellan(fran, till))
  const padL = lage === 'ingen' ? 0.07 : 0
  const X = (d: Dag) => r1(matt.L + (padL + (1 - padL) * (dagarMellan(fran, d) / span)) * (matt.R - matt.L))

  const max = Math.max(...paLinje.map((p) => (p.niva as number) + inp.niva.osakerhet), PROVETS_NIVA + 0.6)
  const hi = lage === 'ingen' ? 10 : Math.min(10, Math.max(5, Math.ceil(max)))
  const Y = (v: number) => r1(matt.T + (1 - (Math.min(hi, Math.max(1, v)) - 1) / (hi - 1)) * (matt.B - matt.T))

  const synlig = (d: Dag) => d >= fran && d <= till
  const linje = paLinje.filter((p) => synlig(p.dag)).map((p) => ({ p, x: X(p.dag), y: Y(p.niva as number) }))
  const prov = egna.filter((p) => p.slag === 'ovningsprov' && synlig(p.dag)).map((p) => ({ p, x: X(p.dag), y: matt.B }))
  const provX = inp.provdag && synlig(inp.provdag) && inp.provdag > inp.idag ? X(inp.provdag) : null
  const forslagX = inp.ovningsprovForslag && synlig(inp.ovningsprovForslag) && inp.ovningsprovForslag > inp.idag ? X(inp.ovningsprovForslag) : null

  let nastaDag: Dag | null = null
  if (lage === 'en') {
    const d = laggTill(paLinje[0].dag, NIVAKOLL_INTERVALL_DAGAR)
    nastaDag = d > inp.idag ? d : laggTill(inp.idag, 1)
  }

  // Datumraden: en gång i veckan från början, utan krock med i dag och provet.
  const datum: Kurva3['datum'] = []
  if (lage === 'ingen') {
    const ord = ['i dag', 'om en vecka', 'om två veckor', 'om tre veckor', inp.bredd === 'mobil' ? 'om fyra' : 'om fyra veckor']
    ord.forEach((t, i) => {
      if (inp.bredd === 'mobil' && i % 2 === 1) return
      datum.push({ x: X(laggTill(inp.idag, i * 7)), text: t, anchor: i === 4 ? 'end' : 'middle' })
    })
  } else {
    const steg = span > 70 ? 21 : span > 40 ? 14 : 7
    for (let d = fran, i = 0; d <= till; d = laggTill(d, steg), i++) {
      const x = X(d)
      if (provX != null && Math.abs(x - provX) < 70) continue
      if (forslagX != null && Math.abs(x - forslagX) < 80) continue
      datum.push({ x, text: kd(d), anchor: i === 0 ? 'start' : 'middle' })
    }
  }

  const ticks = hi === 10 ? [1, 4, 7, 10] : Array.from({ length: hi }, (_, i) => i + 1)
  return {
    lage,
    matt,
    fran,
    till,
    hi,
    X,
    Y,
    linje,
    prov,
    idagX: X(inp.idag),
    provX,
    forslagX,
    nastaX: nastaDag && synlig(nastaDag) ? X(nastaDag) : null,
    nastaDag,
    iPlan,
    datum,
    ticks,
  }
}

/** Osäkerhetsbandet runt linjen. */
export function bandD(k: Pick<Kurva3, 'linje' | 'Y'>, osakerhet: number): string {
  if (k.linje.length < 2) return ''
  const upp = k.linje.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${k.Y((q.p.niva as number) + osakerhet)}`).join('')
  const ned = [...k.linje].reverse().map((q) => `L${q.x} ${k.Y((q.p.niva as number) - osakerhet)}`).join('')
  return `${upp}${ned}Z`
}

export function linjeD(k: Pick<Kurva3, 'linje'>): string {
  return k.linje.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join('')
}
