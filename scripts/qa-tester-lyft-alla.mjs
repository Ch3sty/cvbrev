// scripts/qa-tester-lyft-alla.mjs
// Klicktest av Alla tester efter tester-lyftet (skiss Provbladet, version 3)
// i riktig Chrome mot /dashboard/tester/alla.
//
//   node scripts/qa-tester-lyft-alla.mjs --skapa            # tre konton med data
//   node scripts/qa-tester-lyft-alla.mjs --port 5241        # klicktestet
//   node scripts/qa-tester-lyft-alla.mjs --radera           # radera kontona
//
// Tre konton (feedback_riktig_webblasartest):
//   ny       inget test gjort, traning_sedd_at saknas: Så går det till och
//            hjälpen öppen första gången
//   nagra    några gjorda test på gratisnivån, traning_sedd_at satt
//   premium  Hela paketet via premium_grants, flera nivåer och en
//            personlighetsprofil gjorda
// Var och en på 360, 412 (Pixel 7) och 1280, ljust och mörkt. Per vy:
// helsidesbild, mått (horisontell scroll, primärknappen i bild, segmentens
// lägen, tal i löptext), i-knappens popover, ett låst segment (betalväggen),
// fliken Din utveckling och en hård omladdning. Skärmdumpar och
// resultat.json i docs/qa/tester-lyft/alla/.
//
// Kontona qa-lyft-alla-<roll>-<tid>@jobbcoach-qa.test skapas och raderas
// med id (feedback_testdata_stadning). Raderna räknas före varje delete.

import fs from 'node:fs'
import os from 'node:os'
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
const PORT = arg('port', '5241')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-lyft/alla')
const SCRATCH = process.env.QA_SCRATCH ?? os.tmpdir()
const KONTOFIL = path.join(SCRATCH, 'qa-lyft-alla-konton.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const FORMER = {
  m360: { viewport: { width: 360, height: 740 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  pixel7: { viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  desktop: { viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } },
}
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

const TABELLER = [
  'logic_test_v4_sessions',
  'personality_test_sessions',
  'user_activities',
  'onboarding_progress',
  'scheduled_emails',
  'email_schedule',
  'email_log',
  'user_ui_flags',
  'notifications',
  'premium_grants',
  'daily_usage',
]

function lasKonton() {
  return fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {}
}
function sparaKonton(k) {
  fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
}

async function session(userId, testType, score, dagarSedan) {
  const t = new Date(Date.now() - dagarSedan * 86400000)
  const { error } = await sb.from('logic_test_v4_sessions').insert({
    user_id: userId,
    test_type: testType,
    answers: [],
    score,
    time_spent: 600,
    started_at: new Date(t.getTime() - 600000).toISOString(),
    created_at: new Date(t.getTime() - 600000).toISOString(),
    completed_at: t.toISOString(),
  })
  if (error) throw new Error(`session ${testType}: ${error.message}`)
}

async function skapa() {
  const ut = lasKonton()
  const ts = Date.now()
  for (const roll of ['ny', 'nagra', 'premium']) {
    if (ut[roll]) continue
    const email = `qa-lyft-alla-${roll}-${ts}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: `QaLyftAlla!${ts}`,
      email_confirm: true,
      user_metadata: { full_name: 'Anna Andersson', password_set: true },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[roll] = { email, userId }
    sparaKonton(ut)
    await vanta(600)
    const profil = {
      id: userId,
      email,
      full_name: 'Anna Andersson',
      email_verified_at: new Date().toISOString(),
      onboarding_track: 'tester',
    }
    if (roll !== 'ny') profil.traning_sedd_at = new Date(Date.now() - 3 * 86400000).toISOString()
    const { error: pErr } = await sb.from('profiles').upsert(profil)
    if (pErr) throw new Error('profil: ' + pErr.message)

    if (roll === 'nagra') {
      await session(userId, 'matrislogik', 11, 3)
      await session(userId, 'matrislogik', 14, 2)
      await session(userId, 'verbal-resonemang', 30, 1)
    }
    if (roll === 'premium') {
      const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
      const { data: grant, error: gErr } = await sb
        .from('premium_grants')
        .insert({ user_id: userId, days: 7, source: 'qa-lyft-alla', scope: 'allt', premium_until_after: om7 })
        .select('id')
        .single()
      if (gErr) throw new Error('grant: ' + gErr.message)
      ut[roll].grantId = grant.id
      await session(userId, 'matrislogik', 13, 5)
      await session(userId, 'matrislogik', 14, 4)
      await session(userId, 'matrislogik-avancerad', 12, 3)
      await session(userId, 'verbal-resonemang', 36, 2)
      await session(userId, 'numerical-reasoning', 20, 1)
      const { error: perr } = await sb.from('personality_test_sessions').insert({
        user_id: userId,
        test_type: 'personlighet-grund',
        answers: [],
        scores: { openness: 60, conscientiousness: 70, extraversion: 50, agreeableness: 65, neuroticism: 40 },
        time_spent: 400,
        completed_at: new Date(Date.now() - 86400000).toISOString(),
      })
      if (perr) console.log('  personlighet ej skapad:', perr.message)
    }
    sparaKonton(ut)
    console.log('skapade', roll, email, userId)
  }
}

async function radera() {
  const ut = lasKonton()
  for (const [roll, k] of Object.entries(ut)) {
    for (const t of TABELLER) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.userId)
      console.log(`  ${roll} ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    if (pc) await sb.from('profiles').delete().eq('id', k.userId)
    const { error } = await sb.auth.admin.deleteUser(k.userId)
    console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  }
  if (fs.existsSync(KONTOFIL)) fs.unlinkSync(KONTOFIL)
}

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const payloads = {}
async function payloadFor(email) {
  if (payloads[email]) return payloads[email]
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  payloads[email] = 'base64-' + Buffer.from(JSON.stringify({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at, expires_in: s.session.expires_in, token_type: 'bearer', user: s.session.user })).toString('base64')
  return payloads[email]
}

async function nySida(browser, form, system, email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  if (FORMER[form].userAgent) await page.emulate(FORMER[form])
  else await page.setViewport(FORMER[form].viewport)
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
      localStorage.removeItem('hjalp_dold')
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
  return { page, ctx, logg }
}

async function oppna(page) {
  await page.goto(`${BAS}/dashboard/tester/alla`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[data-testkort="logik"]', { timeout: 30000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(600)
}

async function matt(page) {
  return page.evaluate(() => {
    const synlig = (el) => !!el && el.getBoundingClientRect().width > 0
    const lyft = document.querySelector('[data-lyft="nasta-test"]')
    const knapp = lyft?.querySelector('a.knapp-primar')
    const kr = knapp?.getBoundingClientRect()
    const bnav = [...document.querySelectorAll('nav')].find((n) => getComputedStyle(n).position === 'fixed' && n.getBoundingClientRect().bottom >= innerHeight - 2)
    const golvTopp = bnav ? bnav.getBoundingClientRect().top : innerHeight
    const kort = [...document.querySelectorAll('[data-testkort]')]
    const korttext = kort.map((k) => k.innerText).join('\n')
    const seg = [...document.querySelectorAll('[data-niva]')]
    const gjorda = seg.filter((s) => s.dataset.niva === 'gjord')
    const panel = document.querySelector('aside[aria-label="Hjälp"]')
    const rader = [...document.querySelectorAll('details')].filter(synlig)
    const bild = document.querySelector('[data-testkort="logik"] svg')
    const dialog = document.querySelector('[role="dialog"]')
    const topprad = document.querySelector('[data-topprad]')
    return {
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      toppradSynlig: synlig(topprad) && topprad.getBoundingClientRect().top >= -1,
      saGarDetTill: synlig(document.querySelector('[data-sa-gar-det-till]')),
      scen: synlig(document.querySelector('.illu-vagg svg')),
      lyft: synlig(lyft),
      lyftKnappIBild: kr ? kr.bottom <= golvTopp && kr.top >= 0 : null,
      lyftKnappBotten: kr ? Math.round(kr.bottom) : null,
      synligHojd: Math.round(golvTopp),
      testkort: kort.length,
      segment: { gjord: gjorda.length, ny: seg.filter((s) => s.dataset.niva === 'ny').length, last: seg.filter((s) => s.dataset.niva === 'last').length },
      segmentHojd: seg.length ? Math.round(seg[0].getBoundingClientRect().height) : 0,
      gjordTitle: gjorda.map((g) => g.getAttribute('title')),
      talILoptext: /·/.test(korttext) || / av \d+/.test(seg.map((s) => s.innerText).join(' ')),
      fakta: document.querySelectorAll('[data-fakta]').length,
      iKnappar: document.querySelectorAll('[data-testkort] button[aria-haspopup="dialog"]').length,
      hjalprader: rader.length,
      oppnaRader: rader.filter((d) => d.open).length,
      panel: synlig(panel) ? Math.round(panel.getBoundingClientRect().width) : 0,
      bild: bild ? [Math.round(bild.getBoundingClientRect().width), Math.round(bild.getBoundingClientRect().height)] : null,
      popover: dialog ? Math.round(dialog.getBoundingClientRect().width) : 0,
      tema: getComputedStyle(document.body).backgroundColor,
    }
  })
}

async function helsida(page, fil) {
  const vp = page.viewport()
  const hojd = await page.evaluate(() => {
    const m = document.querySelector('.dashboard-main-content')
    return m ? m.scrollHeight + (innerHeight - m.clientHeight) : document.documentElement.scrollHeight
  })
  await page.setViewport({ ...vp, height: Math.min(hojd, 7000) })
  await vanta(400)
  await page.screenshot({ path: path.join(UT, fil) })
  await page.setViewport(vp)
  await vanta(200)
}

async function klicktest() {
  const konton = lasKonton()
  if (!konton.ny) throw new Error('kör --skapa först')
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  const resultat = []
  try {
    for (const roll of ['ny', 'nagra', 'premium']) {
      for (const form of ['m360', 'pixel7', 'desktop']) {
        for (const system of ['light', 'dark']) {
          const { page, ctx, logg } = await nySida(browser, form, system, konton[roll].email)
          const namn = `${roll}-${form}-${system === 'light' ? 'ljust' : 'morkt'}`
          const steg = []
          try {
            await oppna(page)
            // Första vyn, som användaren ser den.
            await page.screenshot({ path: path.join(UT, `${namn}-01-forsta-vyn.png`) })
            steg.push({ steg: '01-forsta-vyn', ...(await matt(page)) })
            await helsida(page, `${namn}-02-helsida.png`)

            // i-knappen på logikkortet.
            const ib = await page.$('[data-testkort="logik"] button[aria-haspopup="dialog"]')
            if (ib) {
              await ib.evaluate((b) => b.scrollIntoView({ block: 'center' }))
              await vanta(200)
              await ib.click()
              await vanta(300)
              if (system === 'light') await page.screenshot({ path: path.join(UT, `${namn}-03-popover.png`) })
              steg.push({ steg: '03-popover', ...(await matt(page)) })
              await page.keyboard.press('Escape')
              await vanta(200)
              steg.push({ steg: '03b-esc', popoverStangd: !(await page.$('[role="dialog"]')), fokus: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) })
            }

            // Ett låst segment öppnar betalväggen.
            const las = await page.$('[data-niva="last"]')
            if (las) {
              await las.evaluate((b) => b.scrollIntoView({ block: 'center' }))
              await vanta(200)
              await las.click()
              await vanta(900)
              const ark = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"], [data-sheet], [role="dialog"]'))
              if (system === 'light') await page.screenshot({ path: path.join(UT, `${namn}-04-last-segment.png`) })
              steg.push({ steg: '04-last-segment', betalvagg: ark })
              await page.keyboard.press('Escape')
              await vanta(500)
            }

            // Ett gjort segment: title och aria, ingen text "av".
            // Fliken Din utveckling och tillbaka.
            const flik = await page.evaluateHandle(() => [...document.querySelectorAll('[role="radio"]')].find((b) => b.textContent.startsWith('Din utveckling')))
            if (flik && (await flik.evaluate((x) => !!x))) {
              await flik.evaluate((b) => b.scrollIntoView({ block: 'center' }))
              await flik.click()
              await vanta(1500)
              if (system === 'light') await page.screenshot({ path: path.join(UT, `${namn}-05-din-utveckling.png`) })
              steg.push({ steg: '05-din-utveckling', testkortKvar: await page.$$eval('[data-testkort]', (x) => x.length), horisontellScroll: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) })
              const tillbaka = await page.evaluateHandle(() => [...document.querySelectorAll('[role="radio"]')].find((b) => b.textContent === 'Tester'))
              await tillbaka.click()
              await vanta(800)
              steg.push({ steg: '05b-tillbaka', testkort: await page.$$eval('[data-testkort]', (x) => x.length) })
            }

            // Hård omladdning.
            await page.reload({ waitUntil: 'networkidle0' })
            await page.waitForSelector('[data-testkort="logik"]', { timeout: 30000 })
            await vanta(500)
            steg.push({ steg: '06-omladdning', ...(await matt(page)) })
          } catch (e) {
            steg.push({ steg: 'FEL', fel: String(e.message ?? e) })
          }
          resultat.push({ vy: namn, steg, konsol: logg.konsol, http: logg.http })
          const f = steg[0] ?? {}
          console.log(namn, JSON.stringify({ scroll: f.horisontellScroll, steg: f.saGarDetTill, scen: f.scen, lyft: f.lyft, knapp: f.lyftKnappIBild, seg: f.segment, tal: f.talILoptext, i: f.iKnappar, rader: [f.hjalprader, f.oppnaRader], panel: f.panel, bild: f.bild }), 'konsol', logg.konsol.length, 'http', logg.http.length, steg.some((s) => s.steg === 'FEL') ? 'FEL' : '')
          await ctx.close()
        }
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  }
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  if (process.argv.includes('--skapa')) return skapa()
  return klicktest()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
