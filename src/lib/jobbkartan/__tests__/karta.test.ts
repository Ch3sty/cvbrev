import { describe, expect, it } from 'vitest'
import geoJson from '../sverige-lan.json'
import { projektor, sidPath, toppPath, type Lan } from '../karta'

const GEO = (geoJson as { lan: Lan[] }).lan

/** Läser path-data till absoluta polygoner (M/m, L/l, Z/z och implicita par). */
function polygoner(d: string): number[][][] {
  const tok = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? []
  const ut: number[][][] = []
  let x = 0, y = 0, sx = 0, sy = 0, cmd = ''
  let poly: number[][] = []
  for (let i = 0; i < tok.length; ) {
    const t = tok[i]
    if (/[MmLlZz]/.test(t)) {
      cmd = t
      i++
      if (cmd === 'Z' || cmd === 'z') {
        ut.push(poly)
        poly = []
        x = sx
        y = sy
      }
      continue
    }
    const a = +tok[i], b = +tok[i + 1]
    i += 2
    const rel = cmd === cmd.toLowerCase()
    x = rel ? x + a : a
    y = rel ? y + b : b
    x = Math.round(x * 10) / 10
    y = Math.round(y * 10) / 10
    if (cmd === 'M' || cmd === 'm') {
      sx = x
      sy = y
      poly = [[x, y]]
      cmd = rel ? 'l' : 'L'
    } else poly.push([x, y])
  }
  return ut
}

/** Omloppstalet för punkten (x, y) summerat över alla delpolygoner, som fyllregeln nonzero räknar. */
function omlopp(polys: number[][][], x: number, y: number) {
  let w = 0
  for (const poly of polys)
    for (let i = 0; i < poly.length; i++) {
      const [ax, ay] = poly[i]
      const [bx, by] = poly[(i + 1) % poly.length]
      const kors = (bx - ax) * (y - ay) - (x - ax) * (by - ay)
      if (ay <= y) {
        if (by > y && kors > 0) w++
      } else if (by <= y && kors < 0) w--
    }
  return w
}

/** Den tidigare kodningen med absoluta koordinater, som facit. */
function toppFacit(ytor: number[][], p: ReturnType<typeof projektor>['p'], h: number) {
  let s = ''
  for (const r of ytor) {
    for (let i = 0; i < r.length; i += 2) {
      const q = p(r[i], r[i + 1], h)
      s += (i ? 'L' : 'M') + q[0] + ' ' + q[1]
    }
    s += 'Z'
  }
  return s
}
function sidFacit(ytor: number[][], p: ReturnType<typeof projektor>['p'], h: number) {
  let s = ''
  for (const r of ytor) {
    const n = r.length
    for (let i = 0; i < n; i += 2) {
      const j = (i + 2) % n
      const a = p(r[i], r[i + 1], h), b = p(r[j], r[j + 1], h)
      const c = p(r[j], r[j + 1], 0), d = p(r[i], r[i + 1], 0)
      s += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${d[0]} ${d[1]}Z`
    }
  }
  return s
}

describe('kompakt path-data', () => {
  const { p } = projektor(GEO)
  it('ger exakt samma polygoner som absoluta koordinater, alla län och flera höjder', () => {
    for (const l of GEO)
      for (const h of [0.012, 0.035, 0.1, 0.2]) {
        expect(polygoner(toppPath(l.ytor, p, h))).toEqual(polygoner(toppFacit(l.ytor, p, h)))
      }
  })
  it('sidoytorna fyller exakt samma punkter som fyrhörningarna (nonzero), alla län', () => {
    let provade = 0
    for (const l of GEO)
      for (const h of [0.035, 0.2]) {
        const facit = polygoner(sidFacit(l.ytor, p, h))
        const ny = polygoner(sidPath(l.ytor, p, h))
        const xs = facit.flat().map((q) => q[0]), ys = facit.flat().map((q) => q[1])
        const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
        // Rutnät med udda hundradelar, så att ingen provpunkt hamnar på en kant (koordinaterna är tiondelar).
        const steg = Math.max(0.37, (x1 - x0) / 60)
        for (let x = x0 + 0.013; x < x1; x += steg)
          for (let y = y0 + 0.017; y < y1; y += steg) {
            expect(omlopp(ny, x, y) !== 0).toBe(omlopp(facit, x, y) !== 0)
            provade++
          }
      }
    expect(provade).toBeGreaterThan(10000)
  })
  it('är betydligt kortare', () => {
    let ny = 0, gammal = 0
    for (const l of GEO) {
      ny += toppPath(l.ytor, p, 0.1).length + sidPath(l.ytor, p, 0.1).length
      gammal += toppFacit(l.ytor, p, 0.1).length + sidFacit(l.ytor, p, 0.1).length
    }
    expect(ny / gammal).toBeLessThan(0.7)
  })
})
