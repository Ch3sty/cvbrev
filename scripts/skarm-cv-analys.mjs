// scripts/skarm-cv-rummet.mjs
// Skärmdumpar av CV-rummet i riktig Chrome mot en lokal server, ett konto
// per läge (scripts/qa-cv-rummet-konton.mjs). Hela sidan i 1440×900 och
// 412×915 (Pixel 7), ljust och mörkt. Bilderna hamnar i --ut, aldrig i git.
//
//   SCRATCH=<mapp> node scripts/skarm-cv-rummet.mjs --ut <mapp> [--bas URL] [--bara namn,namn] [--morkt] [--mellan]
//
// En vy åt gången, en webbläsare, inga loopar mot servern
// (feedback_ingen_testlast_mot_prod).

import fs from 'node:fs'
import path from 'node:path'
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
const flagga = (n) => process.argv.includes('--' + n)
const UT = path.resolve(arg('ut', 'skarm-cv-analys'))
const BAS = arg('bas', 'http://localhost:5320')
const BARA = arg('bara')?.split(',') ?? null
fs.mkdirSync(UT, { recursive: true })

const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const konton = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-cv-analys-konton.json`, 'utf8'))

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function sessionsCookie(epost) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
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

const k = (n) => konton[n]
/** Vyerna: namn, konto och adress. */
const VYER = [
  { namn: 'resultat-gratis', konto: 'gratis', vag: '/dashboard/cv-analys' },
  { namn: 'resultat-premium', konto: 'premium', vag: () => `/dashboard/cv-analys?cv=${k('premium').cv.analyserat}` },
  { namn: 'intro-gratis', konto: 'intro', vag: '/dashboard/cv-analys' },
  { namn: 'intro-premium', konto: 'premium', vag: () => `/dashboard/cv-analys?cv=${k('premium').cv.oanalyserat}` },
  { namn: 'sparr', konto: 'sparr', vag: '/dashboard/cv-analys' },
  { namn: 'utan-struktur', konto: 'struktur', vag: '/dashboard/cv-analys' },
  { namn: 'ditt-cv-gratis', konto: 'gratis', vag: '/dashboard/profil/cv' },
  { namn: 'ditt-cv-premium', konto: 'premium', vag: () => `/dashboard/profil/cv?cv=${k('premium').cv.analyserat}` },
  { namn: 'valj', konto: 'premium', vag: () => `/dashboard/cv-analys?job=${k('premium').jobb.analyserat}&cv=${k('premium').cv.analyserat}&steg=4&valj=forvalda` },
  { namn: 'granska', konto: 'premium', vag: () => `/dashboard/cv-analys?job=${k('premium').jobb.analyserat}&cv=${k('premium').cv.analyserat}&steg=5&valj=profil` },
]
const STORLEKAR = [
  { namn: '1440', vy: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false } },
  { namn: '412', vy: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
]
if (flagga('mellan')) STORLEKAR.push({ namn: '1024', vy: { width: 1024, height: 800, deviceScaleFactor: 1, isMobile: false, hasTouch: false } })

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
const fel = []
try {
  for (const v of VYER) {
    if (BARA && !BARA.includes(v.namn)) continue
    const konto = konton[v.konto]
    const cookies = await sessionsCookie(konto.email)
    for (const s of STORLEKAR) {
      for (const morkt of flagga('morkt') ? [false, true] : [false]) {
        const ctx = await browser.createBrowserContext()
        const page = await ctx.newPage()
        page.on('pageerror', (e) => fel.push(`${v.namn} ${s.namn}: sidfel ${String(e).slice(0, 200)}`))
        page.on('console', (m) => {
          if (m.type() === 'error' && !/favicon|posthog|Failed to load resource|jc-samtycke|ERR_BLOCKED/i.test(m.text())) fel.push(`${v.namn} ${s.namn}: konsol ${m.text().slice(0, 200)}`)
        })
        await page.setViewport(s.vy)
        if (morkt) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
        for (const c of cookies) await page.setCookie({ ...c, url: BAS, path: '/' })
        await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
        const vag = typeof v.vag === 'function' ? v.vag() : v.vag
        await page.goto(BAS + vag, { waitUntil: 'networkidle2', timeout: 120000 })
        await new Promise((r) => setTimeout(r, 3500))
        // Skalet rullar i en egen behållare: väx vyn till hela innehållets höjd.
        const extra = await page.evaluate(() => {
          let bast = 0
          for (const el of document.querySelectorAll('*')) {
            const st = getComputedStyle(el)
            if (!/(auto|scroll)/.test(st.overflowY)) continue
            const d = el.scrollHeight - el.clientHeight
            if (d > bast && el.clientHeight > window.innerHeight * 0.5) bast = d
          }
          return Math.max(bast, document.documentElement.scrollHeight - window.innerHeight)
        })
        if (extra > 0) {
          await page.setViewport({ ...s.vy, height: s.vy.height + extra })
          await new Promise((r) => setTimeout(r, 1200))
        }
        const fil = path.join(UT, `${v.namn}-${s.namn}${morkt ? '-morkt' : ''}.png`)
        await page.screenshot({ path: fil, fullPage: true })
        console.log('bild', fil)
        await ctx.close()
      }
    }
  }
} finally {
  await browser.close()
}
if (fel.length) {
  console.log('--- fel ---')
  for (const f of fel) console.log(f)
}
