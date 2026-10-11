// scripts/qa-tester-lyft-grund.mjs
// Klicktest av grunden för tester-lyftet (Provbladet) i riktig Chrome mot
// förhandsvisningen /dashboard/tester/forhandsvisning/grund.
//
//   node scripts/qa-tester-lyft-grund.mjs --port 5240
//   node scripts/qa-tester-lyft-grund.mjs --radera
//
// Kräver next dev eller ett produktionsbygge startat med
// TRANING_FORHANDSVISNING=1. Pixel 7 (412) och 1280, ljust och mörkt:
// första gången (?forsta=1) och vana, i-knappens popover, Esc, Dölj hjälpen
// och Visa hjälpen igen. Skärmdump per steg i docs/qa/tester-lyft/grund/.
//
// Kontot qa-lyft-grund-*@jobbcoach-qa.test skapas och raderas med id
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
const PORT = arg('port', '5240')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-lyft/grund')
const KONTOFIL = path.resolve('scripts/.qa-lyft-grund-konto.json')
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
  const email = `qa-lyft-grund-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaLyftGrund!${ts}`,
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

async function oppna(page, forsta) {
  await page.goto(`${BAS}/dashboard/tester/forhandsvisning/grund${forsta ? '?forsta=1' : ''}`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[data-grund="vagg"]', { timeout: 30000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(800)
}

async function matt(page) {
  return page.evaluate(() => {
    const synlig = (el) => el && el.getBoundingClientRect().width > 0
    const rader = [...document.querySelectorAll('details')].filter(synlig)
    const sum = rader.map((d) => Math.round(d.querySelector('summary').getBoundingClientRect().height))
    const dialog = document.querySelector('[role="dialog"]')
    const ib = document.querySelector('[data-grund-kort="B1"] button[aria-haspopup]')
    return {
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      rader: rader.length,
      oppna: rader.filter((d) => d.open).length,
      summaryHojd: sum,
      panel: synlig(document.querySelector('aside[aria-label="Hjälp"]')) ? Math.round(document.querySelector('aside[aria-label="Hjälp"]').getBoundingClientRect().width) : 0,
      iKnapp: ib ? Math.round(ib.getBoundingClientRect().width) : 0,
      popover: dialog ? Math.round(dialog.getBoundingClientRect().width) : 0,
      illuDim: getComputedStyle(document.querySelector('[data-grund-kort="B1"]')).getPropertyValue('--illu-dim').trim(),
      illuMjuk: getComputedStyle(document.querySelector('[data-grund-kort="B1"]')).getPropertyValue('--illu-mjuk').trim(),
    }
  })
}

async function main() {
  if (process.argv.includes('--radera')) return raderaKonto()
  const k = await skapaKonto()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  const resultat = []
  try {
    for (const form of ['pixel7', 'desktop']) {
      for (const system of ['light', 'dark']) {
        const { page, logg } = await nySida(browser, form, system, k.email)
        const namn = `${form}-${system === 'light' ? 'ljust' : 'morkt'}`
        const steg = []
        const bild = async (s) => {
          steg.push({ steg: s, ...(await matt(page)) })
          // Skalet rullar i main: gör fönstret lika högt som innehållet för en helsidesbild.
          const vp = page.viewport()
          const hojd = await page.evaluate(() => {
            const m = document.querySelector('.dashboard-main-content')
            return m ? m.scrollHeight + (innerHeight - m.clientHeight) : document.documentElement.scrollHeight
          })
          await page.setViewport({ ...vp, height: Math.min(hojd, 6000) })
          await vanta(400)
          await page.screenshot({ path: path.join(UT, `${namn}-${s}.png`) })
          await page.setViewport(vp)
          await vanta(200)
        }
        await oppna(page, true)
        await bild('01-forsta-gangen')
        await page.click('[data-grund-kort="B1"] button[aria-haspopup]')
        await vanta(300)
        await page.screenshot({ path: path.join(UT, `${namn}-02-popover.png`) })
        steg.push({ steg: '02-popover', ...(await matt(page)) })
        await page.keyboard.press('Escape')
        await vanta(200)
        const fokus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
        steg.push({ steg: '03-esc', popoverStangd: !(await page.$('[role="dialog"]')), fokusTillbaka: fokus })
        await oppna(page, false)
        await bild('04-vana')
        // Dölj hjälpen: öppna första synliga raden och tryck på länken i dess fot.
        const doljId = await page.evaluate(() => {
          const synlig = (el) => el.getBoundingClientRect().width > 0
          const d = [...document.querySelectorAll('details')].find(synlig)
          if (!d) return null
          if (!d.open) d.querySelector('summary').click()
          d.setAttribute('data-qa-dolj', '1')
          return true
        })
        if (!doljId) throw new Error('ingen hjälprad')
        await vanta(300)
        const dolj = await page.$('details[data-qa-dolj] button')
        await dolj.evaluate((b) => b.scrollIntoView({ block: 'center' }))
        await vanta(200)
        await dolj.click()
        await vanta(600)
        await bild('05-dold')
        await page.reload({ waitUntil: 'networkidle0' })
        await vanta(800)
        steg.push({ steg: '06-dold-efter-omladdning', ...(await matt(page)) })
        await page.click('[data-visa-igen]')
        await vanta(600)
        await bild('07-visa-igen')
        resultat.push({ vy: namn, steg, konsol: logg.konsol, http: logg.http })
        console.log(namn, JSON.stringify(steg.map((s) => [s.steg, s.rader, s.oppna, s.popover, s.panel, s.horisontellScroll])), 'konsol', logg.konsol.length, 'http', logg.http.length)
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
