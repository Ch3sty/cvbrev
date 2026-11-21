// scripts/skarm-mallar.mjs
// Skärmdumpar av Mallar i CV-rummet (omgång 1, steg 2) i riktig Chrome mot
// en lokal server: varje läge, spärrarna, merförsäljningen och målgången, i
// 1440×900 och 412×915. Konton ur scripts/qa-cv-rummet-konton.mjs.
//
//   SCRATCH=<mapp> node scripts/skarm-mallar.mjs --ut <mapp> [--bas URL] [--bara namn,namn] [--morkt] [--mellan] [--vy]
//   --vy: bara första vyn i stället för hela sidan.
//
// Inga riktiga nedladdningar: /api/cv/generate-formatted och
// /api/cv/forsta-traff besvaras i webbläsaren (en påhittad PDF, en påhittad
// träff eller ingen), så att målgången kan fotograferas utan att något
// skrivs i databasen. En vy åt gången, en webbläsare.

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
const UT = path.resolve(arg('ut', 'skarm-mallar'))
const BAS = arg('bas', 'http://localhost:8332')
const BARA = arg('bara')?.split(',') ?? null
fs.mkdirSync(UT, { recursive: true })
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const konton = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-cv-rummet-konton.json`, 'utf8'))
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

const k = (n) => konton[n]
const klicka = (sel) => async (page) => {
  await page.waitForFunction((s) => [...document.querySelectorAll(s)].some((e) => e.offsetParent !== null), { timeout: 20000 }, sel)
  await page.evaluate((s) => [...document.querySelectorAll(s)].find((e) => e.offsetParent !== null)?.click(), sel)
}
const TRAFF = {
  traff: {
    id: null,
    rubrik: 'IT-projektledare',
    arbetsgivare: 'Exempelbolaget AB',
    ort: 'Stockholm',
    url: null,
    beskrivning: 'Vi söker en projektledare som leder digitala införanden i nära samarbete med verksamheten.',
  },
}

/** Vyerna: namn, konto, adress, handling före bilden, och om bilden är hela sidan. */
const VYER = [
  { namn: 'gratismall', konto: 'gratis', vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=linne`, hel: true },
  { namn: 'premiummall-utan-premium', konto: 'gratis', vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=koppar`, hel: true },
  { namn: 'med-premium', konto: 'premium', vag: () => `/dashboard/cv-mallar?cv=${k('premium').cv.analyserat}&mall=koppar`, hel: true },
  { namn: 'utan-cv', konto: 'ny', vag: () => '/dashboard/cv-mallar?mall=linne', hel: true },
  { namn: 'mall-utan-word', konto: 'oanalyserat', vag: () => '/dashboard/cv-mallar?mall=affisch', hel: true },
  { namn: 'gratis-anvand', konto: 'nedladdat', vag: () => '/dashboard/cv-mallar?mall=linne', hel: true },
  { namn: 'sparr-mall', konto: 'gratis', vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=koppar`, gor: klicka('[data-ladda-knapp]') },
  { namn: 'sparr-word', konto: 'gratis', vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=kalksten`, gor: klicka('[role="radiogroup"][aria-label="Format"] button[aria-label="Word, ingår i Premium"]') },
  { namn: 'merforsaljning', konto: 'nedladdat', vag: () => '/dashboard/cv-mallar?mall=linne', gor: klicka('[data-ladda-knapp]') },
  { namn: 'final-jobb', konto: 'premium', vag: () => `/dashboard/cv-mallar?cv=${k('premium').cv.analyserat}&mall=koppar`, gor: klicka('[data-ladda-knapp]'), traff: TRAFF },
  { namn: 'final-reserv', konto: 'premium', vag: () => `/dashboard/cv-mallar?cv=${k('premium').cv.analyserat}&mall=koppar`, gor: klicka('[data-ladda-knapp]'), traff: { traff: null } },
  {
    namn: 'rullad',
    konto: 'gratis',
    vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=koppar`,
    gor: async (page) => {
      // Rulla där sidan rullar (skalet har en egen behållare), som en människa som bläddrar.
      await page.evaluate(() => {
        const el = [...document.querySelectorAll('*')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 200).sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
        ;(el ?? document.scrollingElement).scrollTo(0, 1500)
        window.scrollTo(0, 1500)
      })
    },
  },
  { namn: 'byt-cv', konto: 'gratis', vag: () => `/dashboard/cv-mallar?cv=${k('gratis').cv.analyserat}&mall=linne`, gor: klicka('[data-cv-rad] button[aria-haspopup], button[data-cv-rad-mobil]') },
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
    const cookies = await sessionsCookie(konton[v.konto].email)
    for (const s of STORLEKAR) {
      for (const morkt of flagga('morkt') ? [false, true] : [false]) {
        const ctx = await browser.createBrowserContext()
        const page = await ctx.newPage()
        page.on('pageerror', (e) => fel.push(`${v.namn} ${s.namn}: sidfel ${String(e).slice(0, 200)}`))
        page.on('console', (m) => {
          if (m.type() === 'error' && !/favicon|posthog|Failed to load resource|jc-samtycke|ERR_BLOCKED/i.test(m.text())) fel.push(`${v.namn} ${s.namn}: konsol ${m.text().slice(0, 200)}`)
        })
        await page.setRequestInterception(true)
        page.on('request', (r) => {
          const u = r.url()
          if (u.includes('/api/cv/generate-formatted')) {
            return r.respond({ status: 200, contentType: 'application/pdf', headers: { 'content-length': '18' }, body: '%PDF-1.4\n%skarm\n' })
          }
          if (u.includes('/api/cv/forsta-traff')) return r.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(v.traff ?? { traff: null }) })
          return r.continue()
        })
        await page.setViewport(s.vy)
        if (morkt) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
        for (const c of cookies) await page.setCookie({ ...c, url: BAS, path: '/' })
        await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
        await page.goto(BAS + v.vag(), { waitUntil: 'networkidle2', timeout: 180000 })
        await new Promise((r) => setTimeout(r, 3500))
        if (v.gor) {
          try {
            await v.gor(page)
          } catch (e) {
            fel.push(`${v.namn} ${s.namn}: handling ${String(e).slice(0, 160)}`)
          }
          await new Promise((r) => setTimeout(r, 3000))
        }
        let extra = 0
        if (v.hel && !flagga('vy')) {
          extra = await page.evaluate(() => {
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
            await new Promise((r) => setTimeout(r, 2500))
          }
        }
        const fil = path.join(UT, `${v.namn}-${s.namn}${morkt ? '-morkt' : ''}.png`)
        await page.screenshot({ path: fil, fullPage: Boolean(v.hel) && !flagga('vy') })
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
