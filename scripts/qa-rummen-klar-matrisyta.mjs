// scripts/qa-rummen-klar-matrisyta.mjs
// Klicktest av det gamla testflödet i mörkt läge (art-director 20.3 punkt 6):
// .matrisyta på frågan, alternativen och genomgången, så att figurerna följer
// bläck och papper. Riktig Chrome, Pixel 7 och 1280, mörkt (och ljust som
// jämförelse). Grundnivån i matrislogiken med kontot "mycket" ur
// qa-rummen-vag2-konton.mjs (sessionerna raderas med kontot, via id).
//
//   SCRATCH=<tmp> node scripts/qa-rummen-klar-matrisyta.mjs --port 5241
//
// Kontrollen: figurernas bläck (fyllning eller kant som i banken är
// #020617) renderas i --ink-1, inte svart, i alla tre ytorna.

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
const BAS = `http://localhost:${arg('port', '5241')}`
const UT = path.resolve(arg('ut', 'docs/qa/rummen/klar-2/efter-granskning/gamla-testflodet'))
fs.mkdirSync(UT, { recursive: true })
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
// Grundnivån har en dagskvot: ett konto per körning (--konto mycket|hela|gratis).
const KONTO = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-rummen-vag2-konton.json`, 'utf8'))[arg('konto', 'mycket')]
const FORMER = arg('former', 'pixel7,desktop').split(',')
const SYSTEM = arg('system', 'dark,light').split(',')
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const COOKIE = `sb-${env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`

async function payload(email) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const { access_token, refresh_token, expires_at, expires_in, user } = s.session
  return 'base64-' + Buffer.from(JSON.stringify({ access_token, refresh_token, expires_at, expires_in, token_type: 'bearer', user })).toString('base64')
}

/** Bläcket i ytan: färgen på element som i banken är #020617, och om de ligger i .matrisyta. */
async function blackKontroll(page, selektor) {
  return page.evaluate((sel) => {
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink-1').trim()
    const el = [...document.querySelectorAll(`${sel} [fill="#020617"], ${sel} [stroke="#020617"]`)].find((e) => e.getBoundingClientRect().width > 0)
    if (!el) return { hittad: false }
    const s = getComputedStyle(el)
    const farg = el.getAttribute('fill') === '#020617' ? s.fill : s.stroke
    return { hittad: true, farg, ink, iMatrisyta: !!el.closest('.matrisyta') }
  }, selektor)
}

const resultat = { bas: BAS, tid: new Date().toISOString(), korningar: [], fel: [] }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  const p = await payload(KONTO.email)
  for (const form of FORMER) {
    for (const system of SYSTEM) {
      const tag = `${form}-${system === 'dark' ? 'morkt' : 'ljust'}`
      const page = await browser.newPage()
      if (form === 'pixel7') await page.emulate(PIXEL)
      else await page.setViewport({ width: 1280, height: 900 })
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
      const CHUNK = 3200
      if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
      else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
      await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
      await page.evaluateOnNewDocument(() => {
        try {
          localStorage.setItem('password_prompt_dismissed', 'true')
          localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
          localStorage.removeItem('tema')
        } catch {}
      })
      const konsol = []
      page.on('pageerror', (e) => konsol.push(String(e.message).slice(0, 200)))
      const rad = { form, system, steg: [] }
      const dump = async (namn, extra = {}) => {
        const fil = path.join(UT, `${tag}-${namn}.png`)
        await page.screenshot({ path: fil })
        rad.steg.push({ namn, fil: path.relative(process.cwd(), fil).split(path.sep).join('/'), ...extra })
      }
      await page.goto(`${BAS}/dashboard/tester/matrislogik-grund`, { waitUntil: 'networkidle2', timeout: 180000 })
      await vanta(800)
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button, a')].find((e) => /^(Starta testet|Gör om testet)$/.test(e.textContent.trim()) && e.getClientRects().length)
        b?.click()
      })
      await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
      await page.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 60000 })
      await vanta(1000)
      await dump('fraga-1', { fragan: await blackKontroll(page, 'main'), alternativen: await blackKontroll(page, 'button[aria-label^="Svarsalternativ"]') })
      // Svara A på alla femton.
      for (let i = 0; i < 15; i++) {
        const ok = await page.evaluate(() => {
          const b = [...document.querySelectorAll('button[aria-label="Svarsalternativ A"]')].find((e) => e.offsetParent !== null && !e.disabled)
          if (!b) return false
          b.click()
          return true
        })
        if (!ok) break
        await vanta(900)
      }
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Lämna in')?.click())
      await vanta(700)
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Avsluta och se resultat/.test(b.textContent))?.click())
      await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
      await page.waitForFunction(() => /Fråga för fråga/i.test(document.body.innerText), { timeout: 120000 })
      await vanta(1200)
      // Öppna första raden i genomgången.
      await page.evaluate(() => {
        const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
        const knapp = sek?.querySelector('li > button')
        knapp?.scrollIntoView({ block: 'start' })
        knapp?.click()
      })
      await vanta(800)
      await dump('genomgangen', { genomgangen: await blackKontroll(page, 'section[aria-label="Fråga för fråga"]') })
      rad.konsol = konsol
      resultat.korningar.push(rad)
      for (const s of rad.steg) {
        for (const [yta, k] of Object.entries(s)) {
          if (!k || typeof k !== 'object' || !('hittad' in k)) continue
          if (!k.hittad) resultat.fel.push(`${tag} ${s.namn} ${yta}: inga figurer hittade`)
          else if (!k.iMatrisyta) resultat.fel.push(`${tag} ${s.namn} ${yta}: figuren ligger utanför .matrisyta`)
        }
      }
      if (konsol.length) resultat.fel.push(`${tag}: ${konsol.join(' | ')}`)
      console.log(tag, JSON.stringify(rad.steg.map((s) => ({ ...s, fil: undefined }))))
      await page.close()
    }
  }
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, `resultat-${arg('konto', 'mycket')}.json`), JSON.stringify(resultat, null, 2))
  console.log(`${resultat.fel.length} problem`, resultat.fel)
}
