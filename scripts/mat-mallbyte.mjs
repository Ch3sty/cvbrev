// scripts/mat-mallbyte.mjs
// Mäter tiden från klick på en mall till att det nya arket står ritat på
// Mallar (CV-rummet, byggspecen avsnitt 6 punkt 7). Riktig Chrome mot en
// lokal server, ett konto ur scripts/qa-cv-rummet-konton.mjs, en körning,
// inga loopar mot servern (feedback_ingen_testlast_mot_prod).
//
//   SCRATCH=<mapp> node scripts/mat-mallbyte.mjs [--bas URL] [--konto gratis] [--ut fil.json]
//
// "Ritat" = arkets iframe har fått ny HTML och laddat den (load-händelsen).
// Kall = mallen har inte visats under besöket; varm = den har visats förut.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const arg = (n, f) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const BAS = arg('bas', 'http://localhost:8332')
const KONTO = arg('konto', 'gratis')
const UT = arg('ut')
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const konton = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-cv-rummet-konton.json`, 'utf8'))
const konto = konton[KONTO]

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
async function sessionsCookie(epost) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: s, error } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const ref = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
  const payload =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: s.session.access_token,
        refresh_token: s.session.refresh_token,
        expires_at: s.session.expires_at,
        expires_in: s.session.expires_in,
        token_type: 'bearer',
        user: s.session.user,
      })
    ).toString('base64')
  const namn = `sb-${ref}-auth-token`
  const C = 3200
  if (payload.length <= C) return [{ name: namn, value: payload }]
  const ut = []
  for (let i = 0, n = 0; i < payload.length; i += C, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + C) })
  return ut
}

// Stegen: mallens id och namn, och vad vi väntar oss (kall eller varm).
const STEG = [
  { id: 'kalksten', namn: 'Kalksten', typ: 'kall, miniatyren i bild' },
  { id: 'skylt', namn: 'Skylt', typ: 'kall, miniatyren i bild' },
  { id: 'linne', namn: 'Linne', typ: 'varm, visad förut' },
  { id: 'kalksten', namn: 'Kalksten', typ: 'varm, visad förut' },
  { id: 'affisch', namn: 'Affisch', typ: 'kall, längst ner i listan' },
  { id: 'fasad', namn: 'Fasad', typ: 'kall, pekaren 400 ms före', peka: 400 },
  { id: 'tusch', namn: 'Tusch', typ: 'kall, klick utan pekare' },
]

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
const resultat = []
try {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  for (const c of await sessionsCookie(konto.email)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  await page.goto(`${BAS}/dashboard/cv-mallar?cv=${konto.cv.analyserat}&mall=linne`, { waitUntil: 'networkidle2', timeout: 180000 })
  // Arket och första raden miniatyrer hinner ritas, som för en människa som tittar.
  await new Promise((r) => setTimeout(r, 4000))
  for (const s of STEG) {
    const ms = await page.evaluate(
      async ({ id, namn, peka }) => {
        const synlig = (el) => el && el.offsetParent !== null
        let el = [...document.querySelectorAll(`[data-mall-ruta="${id}"]`)].find(synlig)
        if (!el) {
          // Förut: miniatyren i mallkolumnen, resten bakom "Visa alla".
          const hitta = () => [...document.querySelectorAll('aside button[aria-label]')].find((b) => b.getAttribute('aria-label').startsWith(namn + ',') && synlig(b))
          el = hitta()
          if (!el) {
            const alla = [...document.querySelectorAll('aside button')].find((b) => /Visa alla/.test(b.textContent ?? ''))
            alla?.click()
            await new Promise((r) => setTimeout(r, 300))
            el = hitta()
          }
        }
        if (!el) return -1
        if (peka) {
          // Pekaren över rutan först, som en människa som siktar (Mallar hämtar då i förväg).
          el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
          el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
          el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
          await new Promise((r) => setTimeout(r, peka))
        }
        const iframe = () => document.querySelector('.dok-ark-yta iframe, [data-ark-stor] iframe')
        const fore = iframe()?.getAttribute('srcdoc') ?? iframe()?.getAttribute('src') ?? ''
        return await new Promise((klar) => {
          const t0 = performance.now()
          const tid = setTimeout(() => klar(-2), 20000)
          const koll = () => {
            const f = iframe()
            const nu = f?.getAttribute('srcdoc') ?? f?.getAttribute('src') ?? ''
            if (f && nu && nu !== fore) {
              const slut = () => {
                clearTimeout(tid)
                klar(Math.round(performance.now() - t0))
              }
              f.addEventListener('load', slut, { once: true })
              return true
            }
            return false
          }
          const mo = new MutationObserver(() => {
            if (koll()) mo.disconnect()
          })
          mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['srcdoc', 'src'], childList: true })
          el.click()
        })
      },
      { id: s.id, namn: s.namn, peka: s.peka ?? 0 }
    )
    resultat.push({ ...s, ms })
    console.log(`${s.namn.padEnd(10)} ${s.typ.padEnd(28)} ${ms} ms`)
    await new Promise((r) => setTimeout(r, 1500))
  }
  await ctx.close()
} finally {
  await browser.close()
}
if (UT) fs.writeFileSync(UT, JSON.stringify(resultat, null, 2))
