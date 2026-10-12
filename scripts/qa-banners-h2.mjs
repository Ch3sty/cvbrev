// scripts/qa-banners-h2.mjs
// Klicktest av cookie-raden och e-postraden (beslut-banners-2026-10-12) i
// riktig Chrome, 360 och 1280, ljust och mörkt.
//
//   SCRATCH=<tmp> node scripts/qa-banners-h2.mjs konton     # skapar två QA-konton
//   SCRATCH=<tmp> BAS=http://localhost:5263 node scripts/qa-banners-h2.mjs klick
//   SCRATCH=<tmp> node scripts/qa-banners-h2.mjs radera     # raderar bara egna rader via id
//
// Konton: qa-h2-<ts>-overifierad och qa-h2-<ts>-bekraftad @jobbcoach-qa.test.
// Id:n sparas i $SCRATCH/qa-banners-h2-konton.json. Raderingen räknar före
// varje delete och tar bara rader med de egna kontonas user_id
// (feedback_testdata_stadning).
//
// Varje fall körs i en egen inkognitokontext, så cookies aldrig läcker
// mellan fallen. CLS och LCP-elementet läses med PerformanceObserver.

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
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const FIL = `${SCRATCH}/qa-banners-h2-konton.json`
const LOSEN = 'QaH2Banners!2026-10-12x'
const admin = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

async function konton() {
  if (fs.existsSync(FIL)) {
    console.log('konton finns redan', FIL)
    return
  }
  const sb = admin()
  const ts = Date.now()
  const ut = {}
  for (const typ of ['overifierad', 'bekraftad']) {
    const email = `qa-h2-${ts}-${typ}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: `QA H2 ${typ}` },
    })
    if (error) throw new Error(error.message)
    ut[typ] = { email, password: LOSEN, userId: data.user.id }
    fs.writeFileSync(FIL, JSON.stringify(ut, null, 2))
    await new Promise((r) => setTimeout(r, 800))
    const { error: pErr } = await sb.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: `QA H2 ${typ}`,
      email_verified_at: typ === 'bekraftad' ? new Date().toISOString() : null,
      onboarding_track: 'tester',
      onboarding_track_asked_at: new Date().toISOString(),
    })
    if (pErr) throw new Error(`profil ${typ}: ${pErr.message}`)
    console.log('skapad', typ, data.user.id)
  }
}

const TABELLER = [
  'letters', 'cv_texts', 'logic_test_v4_sessions', 'personality_test_sessions', 'user_activities',
  'job_applications', 'onboarding_progress', 'scheduled_emails', 'premium_grants', 'ai_usage_logs',
  'daily_usage', 'test_planer',
]

async function radera() {
  if (!fs.existsSync(FIL)) return console.log('inget att radera')
  const sb = admin()
  const k = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const [typ, konto] of Object.entries(k)) {
    if (!/^qa-h2-\d+-(overifierad|bekraftad)@jobbcoach-qa\.test$/.test(konto.email)) {
      console.log('hoppar över, inte ett eget konto', konto.email)
      continue
    }
    for (const t of TABELLER) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', konto.userId)
      if (error || !count) continue
      const { error: d } = await sb.from(t).delete().eq('user_id', konto.userId)
      console.log(`  ${typ} ${t}: ${count} rader`, d ? d.message : 'raderade')
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', konto.userId)
    console.log(`  ${typ} profiles: ${pc} rad`)
    if (pc === 1) {
      const { error: d } = await sb.from('profiles').delete().eq('id', konto.userId)
      console.log('   ', d ? d.message : 'raderad')
    }
    const { error: au } = await sb.auth.admin.deleteUser(konto.userId)
    console.log(`  ${typ} auth.users:`, au ? au.message : 'raderad')
  }
}

/* ---------------------------------------------------------------- */

const BAS = process.env.BAS ?? 'http://localhost:5263'
const UT = `${SCRATCH}/qa-banners-h2`
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const resultat = []
let nr = 0

function logg(fall, steg, ok, data = {}) {
  resultat.push({ fall, steg, ok, ...data })
  console.log(`${ok ? 'OK  ' : 'FEL '} ${fall} | ${steg} ${JSON.stringify(data).slice(0, 300)}`)
}

const LAGEN = [
  { namn: '360-ljust', vp: { width: 360, height: 780, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, morkt: false },
  { namn: '360-morkt', vp: { width: 360, height: 780, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, morkt: true },
  { namn: '1280-ljust', vp: { width: 1280, height: 800, deviceScaleFactor: 1 }, morkt: false },
  { namn: '1280-morkt', vp: { width: 1280, height: 800, deviceScaleFactor: 1 }, morkt: true },
]

async function nySida(browser, lage) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(lage.vp)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: lage.morkt ? 'dark' : 'light' }])
  await p.evaluateOnNewDocument((morkt) => {
    try { localStorage.setItem('tema', morkt ? 'morkt' : 'ljust') } catch {}
    window.__cls = 0
    window.__skift = []
    window.__lcpEl = ''
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue
        window.__cls += e.value
        window.__skift.push({ v: +e.value.toFixed(4), noder: (e.sources || []).map((s) => s.node && (s.node.id || s.node.className || s.node.nodeName)).join(',') })
      }
    }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const el = e.element
        window.__lcpEl = el ? el.tagName.toLowerCase() + (el.closest('#jc-samtycke') ? ' [samtycket]' : '') + ' "' + (el.textContent || '').trim().slice(0, 30) + '"' : ''
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }, lage.morkt)
  return { ctx, p }
}

async function bild(p, namn) {
  nr += 1
  const fil = path.join(UT, `${String(nr).padStart(2, '0')}-${namn}.png`)
  await p.screenshot({ path: fil })
  return path.basename(fil)
}

async function matt(p) {
  return p.evaluate(() => {
    const el = document.getElementById('jc-samtycke')
    const r = el?.getBoundingClientRect()
    const synlig = !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && r.height > 0
    const knappar = [...document.querySelectorAll('#jc-samtycke button')].map((b) => {
      const k = b.getBoundingClientRect()
      return { t: b.textContent, w: Math.round(k.width), h: Math.round(k.height), fg: getComputedStyle(b).color, bg: getComputedStyle(b).backgroundColor }
    })
    const rad = [...document.querySelectorAll('p')].find((x) => /Bekräfta din e-post/.test(x.textContent || ''))
    return {
      samtycke: synlig ? { h: Math.round(r.height), bottom: Math.round(window.innerHeight - r.bottom), knappar } : null,
      samtyckeIDom: !!el,
      epostrad: rad ? Math.round(rad.closest('div.h-11')?.getBoundingClientRect().height ?? -1) : null,
      cls: +window.__cls.toFixed(4),
      skift: window.__skift,
      lcpEl: window.__lcpEl,
      cookie: document.cookie.split('; ').filter((c) => /cvBrevCookieConsent|jc_email_banner/.test(c)),
      htmlAttr: document.documentElement.getAttribute('data-samtycke'),
    }
  })
}

async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 120000 })
  await vanta(1200)
}

async function loggaIn(p, konto) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {}),
    p.click('button[type="submit"]'),
  ])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 60000 })
  await vanta(1500)
}

async function samtyckesfall(browser, lage, svar) {
  const fall = `${lage.namn} ny besökare ${svar}`
  const { ctx, p } = await nySida(browser, lage)
  try {
    await ga(p, '/verktyg/rekryteringstester')
    const m1 = await matt(p)
    const vantadH = lage.vp.width >= 640 ? 56 : 94
    logg(fall, 'raden i första bilden', !!m1.samtycke && m1.samtycke.h === vantadH && m1.cls <= 0.002 && !m1.lcpEl.includes('[samtycket]'), { ...m1, bild: await bild(p, `${lage.namn}-ny-${svar}-1-rad`) })
    if (m1.samtycke) {
      const [a, b] = m1.samtycke.knappar
      logg(fall, 'knapparna lika stora', a.w === b.w && a.h === b.h && a.h === 44, { knappar: m1.samtycke.knappar })
    }
    await p.click(svar === 'godkann' ? '#rcc-confirm-button' : '#rcc-decline-button')
    await vanta(400)
    const m2 = await matt(p)
    const vantat = svar === 'godkann' ? 'cvBrevCookieConsent=true' : 'cvBrevCookieConsent=false'
    logg(fall, 'svaret sparat, raden borta', !m2.samtycke && m2.cookie.includes(vantat), { ...m2, bild: await bild(p, `${lage.namn}-ny-${svar}-2-svarat`) })
    await p.reload({ waitUntil: 'networkidle2' })
    await vanta(1200)
    const m3 = await matt(p)
    logg(fall, 'omladdning: ingen rad, inget skift', !m3.samtycke && m3.cls <= 0.002 && m3.htmlAttr === 'svarat', { ...m3, bild: await bild(p, `${lage.namn}-ny-${svar}-3-omladdad`) })
    // Inloggat lager: en sida till, startsidan, ska heller inte visa raden.
    await ga(p, '/')
    const m4 = await matt(p)
    logg(fall, 'startsidan efter svar: ingen rad', !m4.samtycke && m4.cls <= 0.002, { cls: m4.cls })
  } finally {
    await ctx.close()
  }
}

async function epostfall(browser, lage, konto, typ) {
  const fall = `${lage.namn} ${typ}`
  const { ctx, p } = await nySida(browser, lage)
  try {
    await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
    await loggaIn(p, konto)
    for (const sida of ['/dashboard', '/dashboard/tester']) {
      await ga(p, sida)
      const m = await matt(p)
      if (typ === 'overifierad' && sida === '/dashboard') {
        logg(fall, `${sida}: e-postraden i första bilden, 44 px`, m.epostrad === 44 && m.cls <= 0.002, { ...m, bild: await bild(p, `${lage.namn}-${typ}-1-rad`) })
        // Ett riktigt musklick, så att skiftet räknas som följd av input
        // (hadRecentInput), precis som för en användare.
        const knapp = await p.evaluateHandle(() => {
          const rad = [...document.querySelectorAll('p')].find((x) => /Bekräfta din e-post/.test(x.textContent || ''))
          return rad?.closest('div.h-11')?.querySelector('button[aria-label="Stäng"]') ?? null
        })
        const el = knapp.asElement()
        const ok = !!el
        if (el) await el.click()
        await vanta(500)
        const m2 = await matt(p)
        logg(fall, 'Stäng: raden borta, cookie satt', ok && m2.epostrad === null && m2.cookie.some((c) => c.startsWith('jc_email_banner_dismissed=')), { ...m2, bild: await bild(p, `${lage.namn}-${typ}-2-stangd`) })
        await p.reload({ waitUntil: 'networkidle2' })
        await vanta(1200)
        const m3 = await matt(p)
        logg(fall, 'omladdning: ingen rad, inget skift', m3.epostrad === null && m3.cls <= 0.002, { ...m3, bild: await bild(p, `${lage.namn}-${typ}-3-omladdad`) })
      } else if (typ === 'overifierad') {
        logg(fall, `${sida}: avfärdad, ingen rad`, m.epostrad === null && m.cls <= 0.002, { cls: m.cls, skift: m.skift })
      } else {
        logg(fall, `${sida}: ingen rad, inget skift`, m.epostrad === null && m.cls <= 0.002, { ...m, bild: await bild(p, `${lage.namn}-${typ}-${sida.split('/').pop()}`) })
      }
    }
  } finally {
    await ctx.close()
  }
}

/** Inloggad i en ny webbläsare: samtycket i appen, på en vanlig vy och i ett flöde. */
async function inloggatSamtycke(browser, lage, konto) {
  const fall = `${lage.namn} inloggad utan samtycke`
  const { ctx, p } = await nySida(browser, lage)
  try {
    await loggaIn(p, konto)
    for (const sida of ['/dashboard/tester', '/dashboard/tester/ovningsprov/logik']) {
      await ga(p, sida)
      const m = await matt(p)
      const knappar = m.samtycke?.knappar ?? []
      const lasbar = knappar.length === 2 && knappar.every((k) => k.fg !== k.bg)
      // I ett flöde ska raden stå ovanför flödets fot, inte på botten.
      const flode = sida.includes('ovningsprov')
      const fotH = await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flow-footer-h')) || 0)
      const plats = !flode || (m.samtycke && Math.abs(m.samtycke.bottom - fotH) <= 1)
      logg(fall, `${sida}: raden synlig, läsbar, rätt plats, inget skift`, !!m.samtycke && lasbar && plats && m.cls <= 0.002 && !m.lcpEl.includes('[samtycket]'), {
        ...m,
        fotH,
        bild: await bild(p, `${lage.namn}-inloggad-samtycke-${sida.split('/').pop()}`),
      })
    }
  } finally {
    await ctx.close()
  }
}

async function klick() {
  fs.mkdirSync(UT, { recursive: true })
  const k = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  try {
    for (const lage of LAGEN) {
      await samtyckesfall(browser, lage, 'godkann')
      await samtyckesfall(browser, lage, 'avbojer')
      await epostfall(browser, lage, k.overifierad, 'overifierad')
      await epostfall(browser, lage, k.bekraftad, 'bekraftad')
      await inloggatSamtycke(browser, lage, k.bekraftad)
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(`${UT}/resultat.json`, JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} OK`)
  if (fel.length) process.exitCode = 1
}

const kommando = process.argv[2]
if (kommando === 'konton') await konton()
else if (kommando === 'radera') await radera()
else if (kommando === 'klick') await klick()
else console.log('konton | klick | radera')
