// scripts/qa-paketnamn.mjs
// Klicktest i riktig webbläsare av paketnamnsbytet
// (docs/rapporter/beslut-paketnamn-2026-09-24.md), Pixel 7 och desktop:
// artikeln logiska-tester med reklamkorten, prissidan, testsidan, betalväggen
// inloggad, sidomenyn och spårvalet.
//
//   node scripts/qa-paketnamn.mjs skapa     QA-kontot qa-namn-2026-09-24@jobbcoach.ai
//   node scripts/qa-paketnamn.mjs kor       kräver en server på QA_BAS (5302)
//   node scripts/qa-paketnamn.mjs radera    raderar bara kontot i scripts/.qa-namn-konto.json
//
// Skärmdumpar till docs/qa/paketnamn/, resultat i resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const FIL = path.resolve('scripts/.qa-namn-konto.json')
const EPOST = 'qa-namn-2026-09-24@jobbcoach.ai'
const LOSEN = 'QaNamn!2026-09-24'
const BAS = process.env.QA_BAS || 'http://localhost:5302'
const UT = 'docs/qa/paketnamn'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const admin = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

async function skapa() {
  const db = admin()
  const { data, error } = await db.auth.admin.createUser({
    email: EPOST,
    password: LOSEN,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Namnbyte' },
  })
  if (error) throw new Error(error.message)
  const userId = data.user.id
  await new Promise((r) => setTimeout(r, 800))
  const { error: pErr } = await db
    .from('profiles')
    .upsert({ id: userId, email: EPOST, full_name: 'Anna Namnbyte', goal_role: 'Projektledare', location: 'Göteborg' })
  if (pErr) throw new Error(pErr.message)
  fs.writeFileSync(FIL, JSON.stringify({ email: EPOST, userId }, null, 2))
  console.log('skapad', EPOST, userId)
}

/** Sätter kontot till ett betalt paket eller tillbaka till gratis, bara på det egna id:t. */
async function sattPaket(userId, scope) {
  const db = admin()
  const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const falt = scope
    ? {
        subscription_tier: 'premium',
        premium_scope: scope,
        premium_until: om7,
        current_period_end: om7,
        premium_source: 'stripe',
        subscription_status: 'active',
        subscription_id: 'sub_qa_namn',
        onboarding_track: scope,
      }
    : {
        subscription_tier: 'free',
        premium_scope: null,
        premium_until: null,
        current_period_end: null,
        premium_source: null,
        subscription_status: null,
        subscription_id: null,
        onboarding_track: null,
      }
  const { error } = await db.from('profiles').update(falt).eq('id', userId)
  if (error) throw new Error(error.message)
}

async function radera() {
  if (!fs.existsSync(FIL)) return console.log('inget att radera')
  const { userId, email } = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  const db = admin()
  const TABELLER = ['cv_texts', 'premium_grants', 'cv_analysis_jobs', 'email_schedule', 'email_log', 'user_activities', 'quota_usage']
  for (const t of TABELLER) {
    const { count, error } = await db.from(t).select('*', { count: 'exact', head: true }).eq('user_id', userId)
    if (error) continue
    console.log(`${t}: ${count ?? 0} rader för ${userId}`)
    if (count) await db.from(t).delete().eq('user_id', userId)
  }
  const { count: pc } = await db.from('profiles').select('*', { count: 'exact', head: true }).eq('id', userId)
  console.log(`profiles: ${pc ?? 0} rad för ${userId} (${email})`)
  if (pc) await db.from('profiles').delete().eq('id', userId)
  const { error } = await db.auth.admin.deleteUser(userId)
  console.log('auth-användare raderad', userId, error ? error.message : 'ok')
  fs.unlinkSync(FIL)
}

/* ------------------------------------------------------------ klicktestet */

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1 }
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const resultat = []
let nr = 0

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

async function skott(page, namn, fullPage = false) {
  nr += 1
  const vyNamn = page.viewport()?.isMobile ? 'mobil' : 'desktop'
  const fil = path.join(UT, `${String(nr).padStart(2, '0')}-${namn.startsWith(vyNamn) ? namn : `${vyNamn}-${namn}`}.png`)
  // captureBeyondViewport: false, annars ritas vyn om från toppen och
  // skärmdumpen av ett kort längre ned visar sidhuvudet.
  await page.screenshot({ path: fil, fullPage, captureBeyondViewport: fullPage })
  return fil
}

/** Skärmdump av ett element som innehåller texten, inklusive förälder med kant. */
async function skottAv(page, namn, innehall, vy) {
  const ok = await page.evaluate((s) => {
    const el = Array.from(document.querySelectorAll('section, aside, div'))
      .filter((e) => (e.innerText || '').includes(s) && e.getBoundingClientRect().height > 80)
      .sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0]
    if (!el) return false
    // Omedelbar rullning: sidan har scroll-behavior: smooth.
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo({ top: y, behavior: 'instant' })
    return true
  }, innehall)
  await vanta(500)
  if (ok) await skott(page, `${vy}-${namn}`)
  return ok
}

const text = (page) => page.evaluate(() => document.body.innerText)

async function nySida(browser, viewport) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  page.setDefaultNavigationTimeout(90000)
  await page.setViewport(viewport)
  return { ctx, page }
}

async function ga(page, url) {
  await page.goto(`${BAS}${url}`, { waitUntil: 'networkidle2' })
  await vanta(1200)
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((e) => e.innerText.trim() === 'Acceptera')
    b?.click()
  })
  await vanta(300)
}

async function loggaIn(page) {
  await page.goto(`${BAS}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type="email"]', { timeout: 30000 })
  await page.type('input[type="email"]', EPOST)
  await page.type('input[type="password"]', LOSEN)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await vanta(2000)
}

const GAMLA = /CV-veckan|Testveckan|Allt-veckan|Allt-dagen|Allt-månaden|Allt-kvartalet|coachen utan tak|Båda spåren|byta spår/

async function publikt(browser, viewport, vy) {
  const { ctx, page } = await nySida(browser, viewport)

  // Artikel med reklamkort.
  await ga(page, '/artiklar/logiska-tester')
  let t = await text(page)
  logg(`${vy} artikel: inga gamla namn`, !GAMLA.test(t))
  logg(`${vy} artikel: inline-raden med period`, t.includes('ingår i Träningspaketet, 79 kr i veckan'))
  logg(`${vy} artikel: slutkortets knapp`, /Börja med (Träningspaketet|CV-paketet|Hela paketet), \d+ kr i veckan/.test(t))
  await skottAv(page, 'artikel-inline', 'ingår i Träningspaketet, 79 kr i veckan', vy)
  await skottAv(page, 'artikel-slutkort', 'Sju dagar. Alla nivåer. Klockan på.', vy)
  if (vy === 'desktop') await skottAv(page, 'artikel-sidokort', 'i veckan, ingen bindningstid', vy)

  // Prissidan.
  await ga(page, '/priser')
  t = await text(page)
  logg(`${vy} priser: inga gamla namn`, !GAMLA.test(t))
  logg(`${vy} priser: nya H2`, vy === 'mobil' || t.includes('Tre paket. Ett för CV:t, ett för träningen, ett för hela jobbsöket.'))
  logg(`${vy} priser: tre kort`, ['CV-paketet', 'Träningspaketet', 'Hela paketet'].every((n) => t.includes(n)))
  logg(`${vy} priser: förklaringsrader`, t.includes('CV-mallar, CV-analys, personliga brev som PDF, LinkedIn') && t.includes('Alla rekryteringstester, personlighetstestet, intervjuprovet'))
  logg(`${vy} priser: knapp med pris`, t.includes('Börja med CV-paketet, 79 kr i veckan'))
  logg(`${vy} priser: FAQ utan spår`, t.includes('Kan jag byta paket mitt i veckan?'))
  await skott(page, 'priser-topp')
  await skottAv(page, 'priser-hela-paketet', 'Det här har bara Hela paketet', vy)
  // Dagen i längdvalet: Dagspasset som första rad.
  const dag = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('[role="radio"]')).find((e) => /en dag|dag/.test(e.innerText) && /49/.test(e.innerText))
    if (!b) return false
    b.scrollIntoView({ block: 'center' })
    b.click()
    return true
  })
  await vanta(600)
  t = await text(page)
  logg(`${vy} priser: dagen visar Dagspasset`, dag && t.includes('En dag, Dagspasset. 49 kr, förnyas inte.'))
  logg(`${vy} priser: knappen följer längden`, t.includes('Börja med Dagspasset, 49 kr, ett dygn'))
  await skott(page, 'priser-dagspasset')
  await skott(page, 'priser-hel', true)

  // Testsidan.
  await ga(page, '/verktyg/rekryteringstester')
  t = await text(page)
  logg(`${vy} rekryteringstester: inga gamla namn`, !GAMLA.test(t))
  logg(`${vy} rekryteringstester: Träningspaketet tar bort taket`, t.includes('Träningspaketet tar bort taket'))
  logg(`${vy} rekryteringstester: fördjupade personlighetstestet`, t.includes('det fördjupade testet, 120 påståenden'))
  await skott(page, 'rekryteringstester-topp')
  await skottAv(page, 'rekryteringstester-paket', 'Träningspaketet tar bort taket', vy)
  await ctx.close()
}

async function inloggat(browser, viewport, vy, userId) {
  const { ctx, page } = await nySida(browser, viewport)
  await sattPaket(userId, null)
  await loggaIn(page)
  logg(`${vy}: inloggad`, !page.url().includes('/login'), page.url())

  // Betalväggen: LinkedIn ingår inte i gratisnivån.
  await ga(page, '/dashboard/linkedin-optimizer')
  let t = await text(page)
  logg(`${vy} betalvägg: rubrik med pris`, t.includes('LinkedIn-profilen ingår i CV-paketet, 79 kr i veckan'))
  logg(`${vy} betalvägg: prisrad`, t.includes('79 kr i veckan, säg upp när du vill.'))
  logg(`${vy} betalvägg: knapp Skaffa`, t.includes('Skaffa CV-paketet, 79 kr i veckan'))
  logg(`${vy} betalvägg: inga gamla namn`, !GAMLA.test(t))
  await skott(page, 'betalvagg-linkedin')

  // Sidomenyn, gratis.
  await ga(page, '/dashboard')
  if (vy === 'mobil') {
    await page.click('button[aria-label="Öppna meny"]').catch(() => {})
    await vanta(700)
  }
  t = await text(page)
  // Den gråa radens text läses upp för skärmläsare, inte synlig: hela DOM:en.
  const dom = await page.evaluate(() => document.body.textContent + ' ' + Array.from(document.querySelectorAll('[aria-label]')).map((e) => e.getAttribute('aria-label')).join(' '))
  logg(`${vy} meny gratis: Tre paket, från 49 kr`, t.includes('Tre paket, från 49 kr'))
  logg(`${vy} meny gratis: grå rad`, dom.includes('Ingår inte. Finns i CV-paketet och Hela paketet.') && dom.includes('Ingår inte. Finns i Hela paketet.'))
  logg(`${vy} meny gratis: inga gamla namn`, !GAMLA.test(t))
  await skott(page, 'meny-gratis')

  // Spårvalet och köpsteget.
  await ga(page, '/dashboard/valj-spar?paket=test_week')
  t = await text(page)
  logg(`${vy} spårval: korten`, ['CV-paketet', 'Träningspaketet', 'Hela paketet'].every((n) => t.includes(n)))
  logg(`${vy} spårval: Hela paketets prisrad`, t.includes('99 kr i veckan, eller Dagspasset 49 kr, månad 149, kvartal 299'))
  logg(`${vy} spårval: inga gamla namn`, !GAMLA.test(t))
  await skott(page, 'sparval-steg1')
  await skott(page, 'sparval-steg1-hel', true)
  const vidare = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((e) => /^Fortsätt med /.test(e.innerText.trim()))
    b?.click()
    return b?.innerText.trim() ?? null
  })
  await vanta(1200)
  t = await text(page)
  logg(`${vy} spårval: primär med pris`, vidare === 'Fortsätt med Träningspaketet, 79 kr i veckan', String(vidare))
  logg(`${vy} köpsteg: kvittot`, t.includes('Träningspaketet, från i kväll') && /Vill du ha Hela paketet i stället?/i.test(t))
  await skott(page, 'kopsteg')

  // Betalt paket: sidomenyn och testsidan.
  await sattPaket(userId, 'tester')
  await ga(page, '/dashboard/tester')
  t = await text(page)
  logg(`${vy} tester betalt: Du har Träningspaketet`, !/Testveckan/.test(t))
  if (vy === 'mobil') {
    await page.click('button[aria-label="Öppna meny"]').catch(() => {})
    await vanta(700)
  }
  t = await text(page)
  logg(`${vy} meny betalt: Du har Träningspaketet`, t.includes('Du har Träningspaketet'))
  logg(`${vy} meny betalt: förnyas med belopp`, /Förnyas \d+ \w+, 79 kr/.test(t))
  logg(`${vy} meny betalt: fotrad`, t.includes('Hela paketet kostar 20 kr till i veckan'))
  await skott(page, 'meny-traningspaketet')
  await sattPaket(userId, null)
  await ctx.close()
}

async function kor() {
  const { userId } = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  fs.mkdirSync(UT, { recursive: true })
  for (const f of fs.readdirSync(UT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(UT, f))
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=sv-SE'],
  })
  try {
    await publikt(browser, PIXEL7, 'mobil')
    await publikt(browser, DESKTOP, 'desktop')
    await inloggat(browser, PIXEL7, 'mobil', userId)
    await inloggat(browser, DESKTOP, 'desktop', userId)
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
    const fel = resultat.filter((r) => !r.ok).length
    console.log(`\n${resultat.length - fel} OK, ${fel} FEL`)
  }
}

const lage = process.argv[2]
if (lage === 'skapa') await skapa()
else if (lage === 'radera') await radera()
else if (lage === 'kor') await kor()
else console.log('skapa | kor | radera')
