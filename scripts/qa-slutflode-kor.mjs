// scripts/qa-slutflode-kor.mjs
// Kör en väg ur slutflödestestet (scripts/qa-slutflode-vagar.mjs).
//   SCRATCH=<tmp> node scripts/qa-slutflode-kor.mjs <väg> [vy]

import { starta, logg, SCRATCH } from './qa-slutflode.mjs'

const [vag, ...rest] = process.argv.slice(2)
const vagar = await import('./qa-slutflode-vagar.mjs')
const fn = vagar[`vag${vag}`]
if (!fn) throw new Error('okänd väg ' + vag)
const browser = await starta()
try {
  await fn(browser, ...rest)
} catch (e) {
  console.error('FEL', e?.stack ?? e)
  logg(vag, 'oväntat fel', false, { fel: String(e?.message ?? e).slice(0, 300) })
  for (const s of await browser.pages()) await s.screenshot({ path: `${SCRATCH}/fel-${vag}-${Date.now()}.png` }).catch(() => {})
  process.exitCode = 1
} finally {
  await browser.close()
}
