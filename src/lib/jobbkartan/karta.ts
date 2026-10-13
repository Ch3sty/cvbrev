/**
 * Jobbkartans kartkod, delad av servern (ritar hjältekartan i HTML-svaret) och webbläsaren
 * (animerar och färgar om). Inga beroenden. Koordinaterna är km ur länsgeometrin: x österut,
 * y norrut, sinusprojektion kring 16,5° O och 60° N.
 *
 * Kameran är samma matematik som Begones lanskarta-vy.ts (perspektiv, lookAt, upp = +y) med
 * egna vinklar så att hela landet ryms: lutad från söder, lätt vriden.
 */

export interface Lan {
  kod: string
  namn: string
  ytor: number[][]
}
export type Projektor = (x: number, y: number, hojd?: number) => [number, number]

const S = 1 / 100 // km till scenenheter
const VY = { fov: 30, theta: -0.12, phi: 1.05, r: 22, aspekt: 0.8 }

type V3 = [number, number, number]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const kryss = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}

function utbredning(geo: Lan[]) {
  const r = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  for (const l of geo)
    for (const ring of l.ytor)
      for (let i = 0; i < ring.length; i += 2) {
        r.x0 = Math.min(r.x0, ring[i])
        r.x1 = Math.max(r.x1, ring[i])
        r.y0 = Math.min(r.y0, ring[i + 1])
        r.y1 = Math.max(r.y1, ring[i + 1])
      }
  return r
}

/** Projektorn p(x_km, y_km, h) -> [sx, sy] i SVG-enheter, och kartans ram på skärmen. */
export function projektor(geo: Lan[]) {
  const u0 = utbredning(geo)
  const mal: V3 = [((u0.x0 + u0.x1) / 2) * S, 0.05, (-(u0.y0 + u0.y1) / 2) * S]
  const k: V3 = [
    mal[0] + VY.r * Math.sin(VY.phi) * Math.sin(VY.theta),
    mal[1] + VY.r * Math.cos(VY.phi),
    mal[2] + VY.r * Math.sin(VY.phi) * Math.cos(VY.theta),
  ]
  const f = norm([mal[0] - k[0], mal[1] - k[1], mal[2] - k[2]])
  const h = norm(kryss(f, [0, 1, 0]))
  const u = kryss(h, f)
  const t = Math.tan(((VY.fov / 2) * Math.PI) / 180)
  const H = 1000 / VY.aspekt
  const p: Projektor = (x, y, hojd = 0) => {
    const d: V3 = [x * S - k[0], hojd - k[1], -y * S - k[2]]
    const zc = dot(d, f)
    return [
      Math.round((dot(d, h) / (zc * t * VY.aspekt) + 1) * 500 * 10) / 10,
      Math.round((((1 - dot(d, u) / (zc * t)) * H) / 2) * 10) / 10,
    ]
  }
  const ram = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  for (const l of geo)
    for (const ring of l.ytor)
      for (let i = 0; i < ring.length; i += 2)
        for (const hh of [0, 0.2]) {
          const q = p(ring[i], ring[i + 1], hh)
          ram.x0 = Math.min(ram.x0, q[0])
          ram.x1 = Math.max(ram.x1, q[0])
          ram.y0 = Math.min(ram.y0, q[1])
          ram.y1 = Math.max(ram.y1, q[1])
        }
  return { p, ram }
}

/** Areaviktad tyngdpunkt för den största ringen, i km. */
export function tyngdpunkt(ytor: number[][]): [number, number] {
  let bast: [number, number] = [0, 0]
  let max = 0
  for (const r of ytor) {
    let a = 0, x = 0, y = 0
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const f = r[j] * r[i + 1] - r[i] * r[j + 1]
      a += f
      x += (r[j] + r[i]) * f
      y += (r[j + 1] + r[i + 1]) * f
    }
    if (Math.abs(a) > max) {
      max = Math.abs(a)
      bast = [x / (3 * a), y / (3 * a)]
    }
  }
  return bast
}

export function inuti(x: number, y: number, ytor: number[][]) {
  let inne = false
  for (const r of ytor)
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inne = !inne
    }
  return inne
}

/**
 * Path-data kompakt: första punkten absolut, resten relativt i tiondelar, utan nollan före
 * decimaltecknet och utan mellanslag före minus. Projektorn avrundar redan till tiondelar och
 * skillnaderna räknas i heltal, så formen blir exakt densamma som med absoluta koordinater men
 * ungefär hälften så lång. Hjältekartan står två gånger i HTML-svaret (markupen och Reacts
 * serialisering), så varje byte här räknas dubbelt.
 */
function tal(t: number) {
  // t är tiondelar som heltal.
  const s = String(Math.abs(t) / 10).replace(/^0\./, '.')
  return t < 0 ? '-' + s : s
}
function koordinater(par: number[]) {
  let s = ''
  for (const t of par) {
    const v = tal(t)
    s += s && v[0] !== '-' ? ' ' + v : v
  }
  return s
}
const tiondel = (v: number) => Math.round(v * 10)

/** En ring som path: första punkten absolut, resten relativt, i tiondelar. */
function ringPath(tiondelar: number[]) {
  const n = tiondelar.length
  if (!n) return ''
  const d: number[] = []
  for (let i = 2; i < n; i += 2) d.push(tiondelar[i] - tiondelar[i - 2], tiondelar[i + 1] - tiondelar[i - 1])
  return 'M' + koordinater([tiondelar[0], tiondelar[1]]) + (d.length ? 'l' + koordinater(d) : '') + 'z'
}
function ringPa(r: number[], p: Projektor, h: number) {
  const ut: number[] = []
  for (let i = 0; i < r.length; i += 2) {
    const q = p(r[i], r[i + 1], h)
    ut.push(tiondel(q[0]), tiondel(q[1]))
  }
  return ut
}

/** Ovansidan som en path på höjden h. */
export function toppPath(ytor: number[][], p: Projektor, h: number) {
  let s = ''
  for (const r of ytor) s += ringPath(ringPa(r, p, h))
  return s
}

/**
 * Sidoytorna mellan höjden h och marken. Tidigare en fyrhörning per kant (topp i, topp j,
 * mark j, mark i), alla i samma path med fyllregeln nonzero. Fyrhörningarnas lodräta kanter tar
 * ut varandra parvis, så summan av dem är exakt ovanringen framlänges plus markringen baklänges.
 * Det är vad vi ritar nu: samma omloppstal i varje punkt och alltså samma fyllda yta, med två
 * punkter per hörn i stället för fyra per kant. Ovansidan täcker det som ligger under den.
 */
export function sidPath(ytor: number[][], p: Projektor, h: number) {
  let s = ''
  for (const r of ytor) {
    s += ringPath(ringPa(r, p, h))
    const mark = ringPa(r, p, 0)
    const bak: number[] = []
    for (let i = mark.length - 2; i >= 0; i -= 2) bak.push(mark[i], mark[i + 1])
    s += ringPath(bak)
  }
  return s
}

/** Ritordning: norr först (längst från kameran), söder sist. */
function ritordning(geo: Lan[]) {
  return geo
    .map((l, i) => ({ i, y: tyngdpunkt(l.ytor)[1] }))
    .sort((a, b) => b.y - a.y)
    .map((o) => o.i)
}

/** Värde 0..1 till höjd i scenenheter. */
export function hojdFor(t: number | null) {
  return t == null ? 0.02 : 0.035 + t * 0.165
}

export interface RitaOpts {
  id?: string
  platt?: boolean
  fjall?: number[][] | null
  marg?: number
  /** Klassens steg 0..5 per län. */
  steg?: Record<string, number>
}

/** Hela kartan som SVG-markup. hojder: höjd per länkod (scenenheter). */
export function rita(geo: Lan[], hojder: Record<string, number> | null, opts: RitaOpts = {}) {
  const { p, ram } = projektor(geo)
  const marg = opts.marg ?? 24
  const vb = [
    Math.floor(ram.x0 - marg),
    Math.floor(ram.y0 - marg),
    Math.ceil(ram.x1 - ram.x0 + 2 * marg),
    Math.ceil(ram.y1 - ram.y0 + 2 * marg),
  ]
  const id = opts.id || 'k'
  let lager = ''
  for (const i of ritordning(geo)) {
    const l = geo[i]
    const h = opts.platt ? 0.012 : (hojder?.[l.kod] ?? 0.02)
    const k = opts.steg?.[l.kod] ?? 0
    const tab = opts.platt ? '' : ' tabindex="0" role="button"'
    lager +=
      `<g class="lan k${k}" data-kod="${l.kod}"${tab} aria-label="${l.namn}">` +
      `<path class="sid" d="${opts.platt ? '' : sidPath(l.ytor, p, h)}"/>` +
      `<path class="topp" d="${toppPath(l.ytor, p, h)}"/></g>`
  }
  // Skuggan är en kopia av lagret, omfärgad och oskarp i ett filter: inga extra byte.
  const skugga = opts.platt ? '' : `<use class="skugga" href="#${id}-lager"/>`
  lager = `${skugga}<g id="${id}-lager">${lager}</g>`
  let fjall = ''
  for (const f of opts.fjall ?? []) {
    const lan = geo.find((g) => inuti(f[0], f[1], g.ytor))
    const h = opts.platt ? 0.012 : lan ? (hojder?.[lan.kod] ?? 0.02) : 0.02
    const q = p(f[0], f[1], h)
    const hk = 4.5 + f[2] / 9
    const w = hk * 0.7
    fjall +=
      `<g class="fjall" data-kod="${lan?.kod ?? ''}" data-x="${f[0]}" data-y="${f[1]}" transform="translate(${q[0]} ${q[1]})">` +
      `<path d="M${-w} 0L0 ${-hk}L${w} 0Z"/><path class="sno" d="M${-w * 0.38} ${-hk * 0.62}L0 ${-hk}L${w * 0.38} ${-hk * 0.62}Z"/></g>`
  }
  return { viewBox: vb.join(' '), svg: lager + fjall, p }
}

/** Uppdaterar höjder och färger på en ritad karta. */
export function uppdatera(
  svgEl: Element,
  geo: Lan[],
  p: Projektor,
  fn: (kod: string) => { h: number; k: number; vald?: boolean },
) {
  for (const l of geo) {
    const g = svgEl.querySelector(`.lan[data-kod="${l.kod}"]`)
    if (!g) continue
    const v = fn(l.kod)
    g.setAttribute('class', `lan k${v.k}${v.vald ? ' vald' : ''}`)
    g.children[0].setAttribute('d', v.h <= 0.012 ? '' : sidPath(l.ytor, p, v.h))
    g.children[1].setAttribute('d', toppPath(l.ytor, p, v.h))
  }
}

/** Svensk talformatering: tusentalsavgränsare och decimalkomma. */
export function fmt(n: number | null | undefined, dec = 0) {
  if (n == null || isNaN(n)) return '–'
  const [hel, del] = Math.abs(n).toFixed(dec).split('.')
  return (n < 0 ? '−' : '') + hel.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (del ? ',' + del : '')
}
export function kvartalNamn(k: string) {
  return ['första', 'andra', 'tredje', 'fjärde'][+k.slice(5) - 1] + ' kvartalet ' + k.slice(0, 4)
}
export function kvartalKort(k: string) {
  return 'K' + k.slice(5) + ' ' + k.slice(0, 4)
}
const MAN = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const MAN_LANG = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']
export function manadNamn(m: string, lang = false) {
  return (lang ? MAN_LANG : MAN)[+m.slice(5) - 1] + ' ' + m.slice(0, 4)
}
export function kortLan(namn: string) {
  return namn.replace(/s län$/, '').replace(/ län$/, '')
}
