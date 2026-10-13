/**
 * Figuren "Var jobben finns för [yrket]" på yrkessidorna, räknad på servern ur Jobbkartans
 * data. Samma mått som yrkesvyn på /jobbkartan (yrkeFakta i src/components/jobbkartan/app.ts):
 * yrkets andel av länets anställda delat med andelen i hela landet, senaste året i
 * yrkesregistret, och bara län med minst 20 anställda i yrket.
 *
 * Kartan är samma vy som Jobbkartans platta kartor (projektor i karta.ts), men förenklad för
 * en miniatyr: Douglas-Peucker med en tolerans kring en pixel i visad storlek, heltal och
 * relativa koordinater, och öar under en tröskelyta tas bort. Cirka 4,5 kB för hela landet.
 */
import { GEO, OVERSIKT } from './data'
import { fmt, projektor } from './karta'
import { YRKES_KOPPLING, YRKESFILER } from './yrkesKoppling'

/** Jobbkartans förvalda kommun (KOMMUN_STANDARD i app.ts), behövs i vy-fragmentet. */
const KOMMUN_STANDARD = '1480'
const TOLERANS = 3
const MINSTA_YTA = 150
const MARG = 6

export interface YrkesFigur {
  plural: string
  koder: string[]
  /** Länet där yrket är vanligast jämfört med riket, med fullt namn. */
  toppLan: string
  /** Kvoten för toppLan med decimalkomma, t.ex. "1,8". */
  toppKvot: string
  /** Steg 1..5 per länkod (0 = för få anställda), samma trappa som Jobbkartan. */
  steg: Record<string, number>
  /** Medellön per månad i hela landet, bara för ett yrke med en kod. */
  lon: { kr: string; ar: string } | null
  /** Året i yrkesregistret. */
  ar: string
  href: string
}

const lqSteg = (v: number | null) => (v == null ? 0 : v < 0.5 ? 1 : v < 0.85 ? 2 : v < 1.2 ? 3 : v < 1.7 ? 4 : 5)

export function yrkesFigur(slug: string): YrkesFigur | null {
  const k = YRKES_KOPPLING[slug]
  if (!k) return null
  const filer = k.koder.map((kod) => YRKESFILER[kod])
  if (filer.some((f) => !f)) return null
  const LAN = OVERSIKT.lanKoder
  const AR = OVERSIKT.ar.length
  const A = AR - 1
  const antal = LAN.map((_, i) => filer.reduce((s, f) => s + (f.lan[i * AR + A] || 0), 0))
  const tot = antal.reduce((s, n) => s + n, 0)
  const totL = LAN.reduce((s, _, i) => s + OVERSIKT.totLan[i][A], 0)
  if (!tot || !totL) return null
  const rAndel = tot / totL
  const lq: Record<string, number | null> = {}
  const steg: Record<string, number> = {}
  LAN.forEach((kod, i) => {
    lq[kod] = antal[i] >= 20 ? antal[i] / OVERSIKT.totLan[i][A] / rAndel : null
    steg[kod] = lqSteg(lq[kod])
  })
  const topp = LAN.filter((kod) => lq[kod] != null).sort((a, b) => lq[b]! - lq[a]!)[0]
  // Raden säger "vanligast i", så den visas bara när något län sticker ut tydligt.
  if (!topp || lq[topp]! < 1.1) return null

  let lon: YrkesFigur['lon'] = null
  const f0 = filer[0]
  if (filer.length === 1 && f0.lon) {
    const se = OVERSIKT.lonRegioner.indexOf('SE')
    for (let ai = OVERSIKT.lonAr.length - 1; ai >= 0 && !lon; ai--) {
      const v = f0.lon[se]?.[ai]
      if (v > 0) lon = { kr: fmt(v), ar: OVERSIKT.lonAr[ai] }
    }
  }

  const q = OVERSIKT.kvartal.length - 1
  // Jobbkartan läser kvartalet som en siffra (#vy-LL-YYYY-KKKK-Q); utan fragment öppnas standardvyn.
  // Summerade koder (butikssäljare) får ingen förvald vy, kartan kan bara visa en kod.
  const href = q <= 9 && k.koder.length === 1 ? `/jobbkartan#vy-${topp}-${k.koder[0]}-${KOMMUN_STANDARD}-${q}` : '/jobbkartan'

  return {
    plural: k.plural,
    koder: k.koder,
    toppLan: OVERSIKT.lanNamn[topp],
    toppKvot: fmt(lq[topp], 1),
    steg,
    lon,
    ar: OVERSIKT.ar[A],
    href,
  }
}

/* ------------------------------------------------------------ Miniatyrkartan */

type P = [number, number]

function dp(pts: P[], tol: number): P[] {
  if (pts.length < 3) return pts
  const [ax, ay] = pts[0]
  const [bx, by] = pts[pts.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const L = Math.hypot(dx, dy)
  let max = 0
  let idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = L ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L : Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
    if (d > max) {
      max = d
      idx = i
    }
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]]
  return [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)]
}

function yta(r: P[]) {
  let a = 0
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1]
  return Math.abs(a / 2)
}

const tal = (v: number) => String(v)
function ringPath(q: P[]) {
  let s = 'M' + tal(q[0][0]) + ' ' + tal(q[0][1]) + 'l'
  for (let i = 1; i < q.length; i++) {
    const x = q[i][0] - q[i - 1][0]
    const y = q[i][1] - q[i - 1][1]
    s += (i > 1 && x >= 0 ? ' ' : '') + x + (y >= 0 ? ' ' : '') + y
  }
  return s + 'z'
}

export interface MiniKarta {
  viewBox: string
  /** Path-data per län, i Jobbkartans ritordning (norr först). */
  lan: { kod: string; namn: string; d: string }[]
}

let miniCache: MiniKarta | null = null

/** Länen som förenklade paths, räknade en gång per serverprocess. */
export function miniKarta(): MiniKarta {
  if (miniCache) return miniCache
  const { p } = projektor(GEO)
  const ram = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  const lan = GEO.map((l) => {
    let d = ''
    for (const ring of l.ytor) {
      const pts: P[] = []
      for (let i = 0; i < ring.length; i += 2) {
        const [x, y] = p(ring[i], ring[i + 1], 0.012)
        pts.push([Math.round(x), Math.round(y)])
      }
      if (pts.length < 3 || yta(pts) < MINSTA_YTA) continue
      const h = Math.floor(pts.length / 2)
      const ut = [...dp(pts.slice(0, h + 1), TOLERANS).slice(0, -1), ...dp([...pts.slice(h), pts[0]], TOLERANS).slice(0, -1)]
      const q = ut.filter((v, i) => i === 0 || v[0] !== ut[i - 1][0] || v[1] !== ut[i - 1][1])
      if (q.length < 3) continue
      for (const [x, y] of q) {
        ram.x0 = Math.min(ram.x0, x)
        ram.x1 = Math.max(ram.x1, x)
        ram.y0 = Math.min(ram.y0, y)
        ram.y1 = Math.max(ram.y1, y)
      }
      d += ringPath(q)
    }
    // Norr först, som Jobbkartan, så att sydligare län ligger överst i den lutade vyn.
    const yNorr = Math.max(...l.ytor.flatMap((r) => r.filter((_, i) => i % 2 === 1)))
    return { kod: l.kod, namn: l.namn, d, yNorr }
  })
    .filter((l) => l.d)
    .sort((a, b) => b.yNorr - a.yNorr)
    .map(({ kod, namn, d }) => ({ kod, namn, d }))
  miniCache = {
    viewBox: [ram.x0 - MARG, ram.y0 - MARG, ram.x1 - ram.x0 + 2 * MARG, ram.y1 - ram.y0 + 2 * MARG].join(' '),
    lan,
  }
  return miniCache
}
