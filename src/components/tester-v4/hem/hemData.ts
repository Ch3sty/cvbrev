/**
 * Hems härledda tal (skissen Hem A, 2026-11-19): navigeringens undertexter,
 * vilken typ minigrafen visar, minikatalogens statusrad och vilka typer som
 * står i Så ligger du till. Allt räknas ur TesterV4Data, inget hittas på.
 * Ren, testas.
 */

import { dagarMellan, laggTill } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { talText } from '@/components/tester-v4/Nivaband'
import { KURVA_DAGAR } from '@/lib/tester/v4/modell'
import type { Dag, PlanV4, TestTypId, TesterV4Data, TesttypKort, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { hintEtikett } from './hintLank'

export type NavVal = 'hem' | 'tester' | 'utveckling'

export interface NavTexter {
  /** Datorns undertext per kort. */
  rad: Record<NavVal, string>
  /** Mobilens korta undertext per kort. */
  kort: Record<NavVal, string>
}

const N = HEM_V4.nav

/** Synliga kognitiva testtyper: åtta. Personlighetstestet räknas för sig, som i gratis-copy. */
export function antalTesttyper(data: Pick<TesterV4Data, 'typer'>): number {
  return data.typer.filter((t) => t.synlig).length
}

/**
 * Typen som minigrafen och Din utveckling-kortet visar: planens första typ,
 * annars den synliga typ som har flest punkter de senaste fyra veckorna,
 * annars den som senast mättes. Null utan någon data och utan plan.
 */
export function fokusTyp(data: Pick<TesterV4Data, 'plan' | 'typer' | 'kurva'>): TestTypId | null {
  const synliga = data.typer.filter((t) => t.synlig)
  const forsta = data.plan?.typer.find((t) => synliga.some((s) => s.id === t))
  if (forsta) return forsta
  let bast: TestTypId | null = null
  let flest = 0
  for (const t of synliga) {
    const n = data.kurva.filter((p) => p.typ === t.id).length
    if (n > flest) {
      flest = n
      bast = t.id
    }
  }
  if (bast) return bast
  const matt = synliga
    .filter((t) => t.niva.status === 'matt' && t.senasteNivakoll)
    .sort((a, b) => ((a.senasteNivakoll as Dag) < (b.senasteNivakoll as Dag) ? 1 : -1))[0]
  return matt?.id ?? null
}

export interface Forandring {
  niva: number
  /** Aktuell nivå minus första punkten med nivå inom fyra veckor. Null utan jämförelse. */
  skillnad: number | null
  riktning: 'upp' | 'ned' | 'oforandrad' | null
}

/**
 * Nivån och förändringen på fyra veckor. Nivån är typens aktuella nivå
 * (typer[typ].niva.niva, samma tal som bandet). Jämförelsen är den första
 * punkten med nivå i kurvan för typen inom 28 dagar (Nivåkoll eller
 * träning). Upp eller ned bara när skillnaden är större än osäkerheten.
 */
export function forandring(data: Pick<TesterV4Data, 'idag' | 'typer' | 'kurva'>, typ: TestTypId): Forandring | null {
  const kort = data.typer.find((t) => t.id === typ)
  if (!kort || kort.niva.status !== 'matt' || kort.niva.niva == null) return null
  const niva = kort.niva.niva
  const fran = laggTill(data.idag, -(KURVA_DAGAR - 1))
  const punkter = data.kurva.filter((p) => p.typ === typ && p.niva != null && p.raknas && p.slag !== 'ovningsprov' && p.dag >= fran)
  const forsta = punkter[0]
  // En enda punkt är den aktuella nivån själv: inget att jämföra med.
  if (!forsta || punkter.length < 2) return { niva, skillnad: null, riktning: null }
  const skillnad = Math.round((niva - (forsta.niva as number)) * 10) / 10
  const riktning = Math.abs(skillnad) > kort.niva.osakerhet + 1e-9 ? (skillnad > 0 ? 'upp' : 'ned') : 'oforandrad'
  return { niva, skillnad, riktning }
}

/** Navigeringens undertexter. Samma på Hem, Tester och Din utveckling. */
export function navTexter(data: TesterV4Data): NavTexter {
  const hint = data.hintar[0] ?? null
  const antal = antalTesttyper(data)
  const matta = data.typer.filter((t) => t.synlig && t.niva.status === 'matt').length
  const tester = data.gratis.premium ? N.testerRad(antal, matta) : N.testerRadGratis(antal, data.gratis.grundKvarIdag > 0)

  const typ = fokusTyp(data)
  const f = typ ? forandring(data, typ) : null
  let utv: string = N.utanMatning
  let utvKort: string = N.utanMatningKort
  if (f) {
    const v = talText(f.niva)
    const d = f.skillnad != null ? talText(Math.abs(f.skillnad)) : ''
    const lang = f.riktning === 'upp' ? N.upp(d) : f.riktning === 'ned' ? N.ned(d) : f.riktning === 'oforandrad' ? N.oforandrad : null
    const kortA = f.riktning === 'upp' ? N.uppKort(d) : f.riktning === 'ned' ? N.nedKort(d) : null
    utv = N.utvecklingRad(v, lang)
    utvKort = N.utvecklingRad(v, kortA)
  }

  return {
    rad: { hem: hint ? N.hemRad(hintEtikett(hint)) : N.hemRadUtan, tester, utveckling: utv },
    kort: { hem: N.hemKort, tester: N.testerKort(antal), utveckling: utvKort },
  }
}

/** Minikatalogens statusrad under namnet. Tom sträng: chipet "Ingår i" står i stället. */
export function katalogStatus(t: TesttypKort, idag: Dag): { text: string; ton: 'positiv' | 'neutral' } | null {
  if (t.ingarIPlan) return null
  if (t.senasteTraning) {
    const n = dagarMellan(t.senasteTraning, idag)
    if (n <= 0) return { text: HEM_V4.ingangTester.tranatIdag, ton: 'positiv' }
    if (n === 1) return { text: HEM_V4.ingangTester.tranatIgar, ton: 'positiv' }
  }
  if (t.niva.status === 'matt' && t.senasteNivakoll) return { text: HEM_V4.ingangTester.nivakoll(kortDatum(t.senasteNivakoll)), ton: 'neutral' }
  return { text: t.kallas, ton: 'neutral' }
}

/** Typerna i Så ligger du till: planens delar först, sedan övriga mätta, högst fyra. */
export function saLiggerTyper(typer: TesttypKort[], plan: PlanV4 | null): TesttypKort[] {
  const synliga = typer.filter((t) => t.synlig)
  const matta = synliga.filter((t) => t.niva.status !== 'omatt')
  if (!plan) return matta.slice(0, 4)
  const iPlan = synliga.filter((t) => t.ingarIPlan)
  return [...iPlan, ...matta.filter((t) => !t.ingarIPlan)].slice(0, Math.max(4, iPlan.length))
}

/** Planens delar i löptext: "Figurer och mönster", "Talserier, spatial förmåga och ordförråd". */
export function delarText(namn: string[]): string {
  if (namn.length <= 1) return namn[0] ?? ''
  const sma = namn.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1)))
  return `${sma.slice(0, -1).join(', ')} och ${sma.at(-1)}`
}

/**
 * Var typens nivå kommer ifrån: den senaste punkten med nivå som räknas
 * (Nivåkoll eller träning), samma regel som nivaLage. Null utan sådan punkt
 * de senaste fyra veckorna.
 */
export type NivaKalla = { dag: Dag; slag: 'nivakoll' | 'trana' | 'nivatest' }

export function nivaKalla(kurva: readonly UtvecklingsPunkt[], typ: TestTypId): NivaKalla | null {
  const alla = kurva.filter((p) => p.typ === typ && p.niva != null && p.raknas && p.slag !== 'ovningsprov')
  const egna = alla.filter((p) => p.kalla !== 'nivatest')
  let bast: UtvecklingsPunkt | null = null
  for (const p of egna.length ? egna : alla) {
    if (!bast || p.dag > bast.dag || (p.dag === bast.dag && p.slag === 'trana' && bast.slag !== 'trana')) bast = p
  }
  if (!bast) return null
  return { dag: bast.dag, slag: bast.kalla === 'nivatest' ? 'nivatest' : bast.slag === 'trana' ? 'trana' : 'nivakoll' }
}
