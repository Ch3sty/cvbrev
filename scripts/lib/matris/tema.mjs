// scripts/lib/matris/tema.mjs
// Tokenvärdena per rum och läge ur globals.css, upplösta (var(--x) följs).
// Samma tolkning som scripts/kontrast-rummen.mjs, men utan sidoeffekter, så
// att v7-geometri-check kan räkna V8 och G10 per tema.
import { readFileSync } from 'node:fs'

const RUM = ['tran', 'cv', 'brev', 'jobb', 'neutral']
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function teman(cssUrl) {
  const CSS = readFileSync(cssUrl, 'utf8').replace(/\r\n/g, '\n')
  const block = (re) => {
    const m = CSS.match(re)
    if (!m) throw new Error('Hittade inte blocket ' + re)
    return m[1]
  }
  const tokens = (text) => {
    const ut = {}
    for (const m of text.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) ut[m[1]] = m[2].trim()
    return ut
  }
  const basLjus = tokens(block(/\n:root:has\(\[data-rum\]\) \{([^}]*)\}/))
  const basMorkt = tokens(block(/:root\[data-theme="dark"\]:has\(\[data-rum\]\) \{([^}]*)\}/))
  const ut = []
  for (const r of RUM) {
    const ljus = tokens(block(new RegExp(esc(`[data-rum="${r}"], :root:has([data-rum="${r}"]) {`) + '([^}]*)\\}')))
    const morkt = tokens(block(new RegExp(esc(`:root[data-theme="dark"] [data-rum="${r}"], :root[data-theme="dark"]:has([data-rum="${r}"]) {`) + '([^}]*)\\}')))
    for (const [lage, t] of [['ljust', { ...basLjus, ...ljus }], ['mörkt', { ...basLjus, ...ljus, ...basMorkt, ...morkt }]]) {
      const varde = (namn, djup = 0) => {
        const v = t[namn] ?? ''
        const m = v.match(/^var\(--([a-z0-9-]+)\)$/i)
        return m && djup < 5 ? varde(m[1], djup + 1) : v
      }
      ut.push({ rum: r, lage, varde })
    }
  }
  return ut
}
