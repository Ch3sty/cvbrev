// scripts/qa-tester-lyft-utveckling.mjs
// Klicktest av Din utveckling (tester-lyftet, skiss Provbladet v3 avsnitt 2)
// i riktig Chrome mot förhandsvisningen
// /dashboard/tester/forhandsvisning/utveckling, alla fem lägen.
//
//   node scripts/qa-tester-lyft-utveckling.mjs --port 5250
//   node scripts/qa-tester-lyft-utveckling.mjs --radera
//
// 360, 412 (Pixel 7) och 1280, ljust och mörkt. Per läge: helsidesbild,
// horisontell scroll, siffror i löptext ([data-lopt]), text som sticker ut
// ur sitt kort, konsolfel och 4xx/5xx. På läget full även i-knappen i Var du
// står: popover och Esc. Bilder i docs/qa/tester-lyft/utveckling/.
//
// Kontot qa-lyft-utv-<tid>@jobbcoach-qa.test skapas och raderas med id
// (feedback_testdata_stadning). Raderna räknas före varje delete.

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
const PORT = arg('port', '5250')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-lyft/utveckling')
const KONTOFIL = path.resolve('scripts/.qa-lyft-utv-konto.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const PIXEL = {
  viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

async function skapaKonto() {
  if (fs.existsSync(KONTOFIL)) return JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const ts = Date.now()
  const email = `qa-lyft-utv-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaLyftUtv!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k = { email, id: data.user.id }
  fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
  await vanta(600)
  const { error: pErr } = await sb.from('profiles').upsert({ id: k.id, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString() })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', email, k.id)
  return k
}

async function raderaKonto() {
  if (!fs.existsSync(KONTOFIL)) return console.log('inget konto att radera')
  const k = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  for (const t of ['user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'user_ui_flags', 'notifications', 'premium_grants']) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error || !count) continue
    const { error: dErr } = await sb.from(t).delete().eq('user_id', k.id)
    console.log(`  ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
  await sb.from('profiles').delete().eq('id', k.id)
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  fs.unlinkSync(KONTOFIL)
}

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
let payload = null
async function payloadFor(email) {
  if (payload) return payload
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  payload = 'base64-' + Buffer.from(JSON.stringify({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at, expires_in: s.session.expires_in, token_type: 'bearer', user: s.session.user })).toString('base64')
  return payload
}

async function nySida(browser, form, system, email) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else if (form === 'm360') await page.emulate({ ...PIXEL, viewport: { ...PIXEL.viewport, width: 360, height: 780 } })
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
      if (!sessionStorage.getItem('qa_rensad')) {
        localStorage.removeItem('hjalp_dold')
        sessionStorage.setItem('qa_rensad', '1')
      }
    } catch {}
  })
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(m.text().slice(0, 300))
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  return { page, logg }
}

const LAGEN = ['full', 'under25', 'klassiska', 'gratis', 'tomt']

async function oppna(page, lage) {
  await page.goto(`${BAS}/dashboard/tester/forhandsvisning/utveckling?lage=${lage}`, { waitUntil: 'networkidle0', timeout: 120000 })
  await page.waitForSelector('[data-utv-lage]', { timeout: 30000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(700)
}

async function matt(page) {
  return page.evaluate(() => {
    const synlig = (el) => el && el.getBoundingClientRect().width > 0
    const lopt = [...document.querySelectorAll('[data-lopt]')].filter(synlig)
    const siffror = lopt.map((e) => e.textContent.trim()).filter((t) => /\d/.test(t))
    const utanfor = []
    for (const kort of document.querySelectorAll('[data-utv-kort]')) {
      const k = kort.getBoundingClientRect()
      for (const el of kort.querySelectorAll('span,b,em,p,h2,h3,a,svg')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        if (r.right > k.right + 1 || r.left < k.left - 1) utanfor.push(`${kort.dataset.utvKort}: ${(el.textContent || el.tagName).trim().slice(0, 40)}`)
      }
    }
    const dialog = document.querySelector('[role="dialog"]')
    return {
      lage: document.querySelector('[data-utv-lage]')?.getAttribute('data-utv-lage'),
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      kort: [...document.querySelectorAll('[data-utv-kort]')].filter(synlig).map((e) => e.dataset.utvKort),
      iKnappar: [...document.querySelectorAll('[data-utv-kort] button[aria-haspopup], [data-lopt] button[aria-haspopup]')].filter(synlig).length,
      marke: [...document.querySelectorAll('[data-marke="nivan_upp"] svg')].some(synlig),
      raknare: document.querySelectorAll('[data-raknare]').length,
      battreAn: /Bättre än/.test(document.querySelector('[data-utv-kort="star"]')?.textContent ?? ''),
      tempoStaplar: document.querySelectorAll('[data-tempo-staplar] i').length,
      overStaplar: document.querySelectorAll('[data-tempo-staplar] i[data-over]').length,
      siffrorILopt: siffror,
      utanforKort: utanfor.slice(0, 10),
      popover: dialog ? Math.round(dialog.getBoundingClientRect().width) : 0,
    }
  })
}

async function main() {
  if (process.argv.includes('--radera')) return raderaKonto()
  const k = await skapaKonto()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  const resultat = []
  try {
    for (const form of ['m360', 'pixel7', 'desktop']) {
      for (const system of ['light', 'dark']) {
        const { page, logg } = await nySida(browser, form, system, k.email)
        const namn = `${form === 'm360' ? '360' : form === 'pixel7' ? '412' : '1280'}-${system === 'light' ? 'ljust' : 'morkt'}`
        const steg = []
        const bild = async (s) => {
          steg.push({ steg: s, ...(await matt(page)) })
          const vp = page.viewport()
          const hojd = await page.evaluate(() => {
            const m = document.querySelector('.dashboard-main-content')
            return m ? m.scrollHeight + (innerHeight - m.clientHeight) : document.documentElement.scrollHeight
          })
          await page.setViewport({ ...vp, height: Math.min(hojd, 7000) })
          await vanta(400)
          await page.screenshot({ path: path.join(UT, `${namn}-${s}.png`) })
          await page.setViewport(vp)
          await vanta(200)
        }
        for (const [i, lage] of LAGEN.entries()) {
          await oppna(page, lage)
          await bild(`0${i + 1}-${lage}`)
        }
        // i-knappen i Var du står på läget full
        await oppna(page, 'full')
        const knapp = await page.$('[data-utv-kort="star"] button[aria-haspopup]')
        await knapp.evaluate((b) => b.scrollIntoView({ block: 'center' }))
        await vanta(200)
        await knapp.click()
        await vanta(300)
        steg.push({ steg: '06-popover', ...(await matt(page)) })
        await page.screenshot({ path: path.join(UT, `${namn}-06-popover.png`) })
        await page.keyboard.press('Escape')
        await vanta(200)
        const fokus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
        steg.push({ steg: '07-esc', popoverStangd: !(await page.$('[role="dialog"]')), fokusTillbaka: fokus })
        resultat.push({ vy: namn, steg, konsol: logg.konsol, http: logg.http })
        console.log(
          namn,
          JSON.stringify(steg.map((s) => [s.steg, s.horisontellScroll, (s.siffrorILopt || []).length, (s.utanforKort || []).length, s.marke, s.raknare, s.battreAn, s.popover])),
          'konsol',
          logg.konsol.length,
          'http',
          logg.http.length
        )
        await page.close()
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
    await raderaKonto()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
