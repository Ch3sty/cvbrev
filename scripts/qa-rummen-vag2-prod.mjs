// scripts/qa-rummen-vag2-prod.mjs
// E2E av Rummen våg 2 mot riktig data: ingången, provdatumet och hemvyn i
// Rekryteringstester. Körs EFTER att ägaren kört migreringarna
// 20261011100000_test_planer.sql och 20261011101000_testmotorn.sql i prod;
// före dem svarar /api/traning 500 och hemvyn står i felet (X1).
//
//   node scripts/qa-rummen-vag2-prod.mjs --bas https://jobbcoach.ai
//   node scripts/qa-rummen-vag2-prod.mjs --bas http://localhost:3492 --behall
//
// Flödet, Pixel 7 och 1280:
//   1. Nytt konto som valde tester: /dashboard/tester skickar till ingången (forsta=1).
//   2. E1 Figurer och mönster, E2 Matrigma, E3 Om två veckor, Visa min plan.
//      Hemvyn står i 1a: "14 dagar till Matrigma", planen som bild. Raden i
//      test_planer kontrolleras med admin.
//   3. Tre tryck: kontextlänken, Om en vecka, Visa min plan: "7 dagar till Matrigma".
//   4. Ta bort datumet: hemvyn står i T1 ("Rekryteringstester").
//   5. Efter provet: provdatumet sätts till i går på kontots egen rad, hemvyn
//      frågar "Hur gick Matrigma?", "Vet inte än" sparas (utfall vet_inte).
//   6. Nätverksfel på PUT /api/traning/plan: felet visas, aldrig "sparat".
// Konton qa-rummen-vag2-prod-*@jobbcoach-qa.test skapas och raderas med id;
// raderna räknas före varje delete (feedback_testdata_stadning).
// Skärmdumpar: docs/qa/rummen/vag-2/prod/.

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
function arg(namn, fallback) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const BAS = arg('bas', 'http://localhost:3492')
const BEHALL = process.argv.includes('--behall')
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-2/prod'))
fs.mkdirSync(UT, { recursive: true })
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const dagSthlm = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d)
const igar = () => dagSthlm(new Date(Date.now() - 86_400_000))
const resultat = { bas: BAS, tid: new Date().toISOString(), steg: [] }
let fel = 0
function logg(form, steg, ok, data = {}) {
  if (ok === false) fel++
  resultat.steg.push({ form, steg, ok, ...data })
  console.log(`${ok === false ? 'FEL ' : 'OK  '} ${form} ${steg} ${JSON.stringify(data).slice(0, 300)}`)
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
}

async function skapaKonto(form) {
  const email = `qa-rummen-vag2-prod-${form}-${Date.now()}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({ email, password: `QaVag2!${Date.now()}x`, email_confirm: true, user_metadata: { full_name: `QA Vag2 prod ${form}` } })
  if (error) throw new Error(error.message)
  const id = data.user.id
  await vanta(800)
  const { error: pErr } = await sb.from('profiles').upsert({
    id,
    email,
    full_name: `QA Vag2 prod ${form}`,
    email_verified_at: new Date().toISOString(),
    onboarding_track: 'tester',
    onboarding_track_asked_at: new Date().toISOString(),
    onboarding_intent: 'tester',
  })
  if (pErr) throw new Error(pErr.message)
  return { id, email }
}

async function raderaKonto(k) {
  if (!/^qa-rummen-vag2-prod-.*@jobbcoach-qa\.test$/.test(k.email)) throw new Error('fel konto')
  for (const t of ['test_planer', 'test_nivapunkter', 'test_milstolpar', 'logic_test_v4_sessions', 'user_activity_log']) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error) continue
    if (count) {
      if (count > 200) throw new Error(`${t}: ${count} rader, avbryter`)
      const { error: d } = await sb.from(t).delete().eq('user_id', k.id)
      console.log(`  ${t}: ${count} rader ${d ? d.message : 'raderade'}`)
    }
  }
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderat ${k.email} ${error ? error.message : 'ok'}`)
}

async function loggaIn(page, email) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error) throw new Error(error.message)
  const ref = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
  const p =
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
  const COOKIE = `sb-${ref}-auth-token`
  for (let i = 0, n = 0; i < p.length; i += 3200, n++) await page.setCookie({ name: p.length <= 3200 ? COOKIE : `${COOKIE}.${n}`, value: p.slice(i, i + 3200), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
}

async function ga(page, u) {
  await page.goto(BAS + u, { waitUntil: 'networkidle0', timeout: 120000 })
  await vanta(1200)
}
async function klicka(page, re) {
  const ok = await page.evaluate(
    (src, flags) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll('button, a, [role="checkbox"], [role="radio"]')].find(
        (e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.getClientRects().length > 0 && !e.disabled
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    re.flags
  )
  if (!ok) throw new Error(`hittade inte ${re}`)
  await vanta(800)
}
const h1 = (page) => page.evaluate(() => [...document.querySelectorAll('h1')].filter((h) => h.getClientRects().length).map((h) => h.textContent.trim()))
const ram = (page) => page.evaluate(() => document.querySelector('[data-ram]')?.getAttribute('data-ram') ?? null)
const vantaHem = (page) => page.waitForFunction(() => location.pathname === '/dashboard/tester' && !!document.querySelector('[data-ram]'), { timeout: 60000 })

async function kor(browser, form) {
  const k = await skapaKonto(form)
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else await page.setViewport({ width: 1280, height: 900 })
  const konsol = []
  page.on('pageerror', (e) => konsol.push(e.message))
  const bild = (n) => page.screenshot({ path: path.join(UT, `${form}-${n}.png`) })
  try {
    await loggaIn(page, k.email)
    await ga(page, '/dashboard/tester')
    const u = new URL(page.url())
    logg(form, 'forsta vyn är ingången', u.pathname === '/dashboard/tester/installningar' && u.search.includes('forsta=1'), { url: u.pathname + u.search })
    await bild('01-E1')
    await klicka(page, /^Figurer och mönster/)
    await klicka(page, /^Fortsätt$/)
    await bild('02-E2')
    await klicka(page, /^Matrigma/)
    await klicka(page, /^Fortsätt$/)
    await klicka(page, /^Om två veckor$/)
    await bild('03-E3')
    await klicka(page, /^Visa min plan$/)
    await vantaHem(page)
    await vanta(1200)
    await bild('04-1a')
    logg(form, '1a efter ingången', (await ram(page)) === '1a' && (await h1(page))[0] === '14 dagar till Matrigma', { ram: await ram(page), h1: await h1(page) })
    const { data: rad } = await sb.from('test_planer').select('testtyper, leverantor, provdatum').eq('user_id', k.id).single()
    logg(form, 'raden i test_planer', rad?.leverantor === 'matrigma' && rad?.testtyper?.[0] === 'matris' && !!rad?.provdatum, rad ?? {})

    // Tre tryck: kontextlänken, Om en vecka, Visa min plan.
    await klicka(page, /^Matrigma, \d+ /)
    await klicka(page, /^Om en vecka$/)
    await klicka(page, /^Visa min plan$/)
    await vantaHem(page)
    await vanta(1000)
    await bild('05-ny-datum')
    logg(form, 'ändra datum på tre tryck', (await h1(page))[0] === '7 dagar till Matrigma', { h1: await h1(page) })

    // Ta bort datumet.
    await ga(page, '/dashboard/tester/installningar?steg=3')
    await klicka(page, /^Ta bort datumet$/)
    await vantaHem(page)
    await vanta(1000)
    await bild('06-utan-datum')
    logg(form, 'ta bort datumet', (await ram(page)) === 'T1', { ram: await ram(page), h1: await h1(page) })

    // Efter provet: i går på kontots egen rad.
    await sb.from('test_planer').update({ provdatum: igar(), utfall: null, utfall_fraga_igen_at: null }).eq('user_id', k.id)
    await ga(page, '/dashboard/tester')
    await bild('07-1e')
    logg(form, '1e Hur gick det', (await h1(page))[0] === 'Hur gick Matrigma?', { h1: await h1(page) })
    await klicka(page, /^Vet inte än$/)
    await vanta(2500)
    const { data: utfall } = await sb.from('test_planer').select('utfall, utfall_fraga_igen_at').eq('user_id', k.id).single()
    logg(form, 'svaret sparat', utfall?.utfall === 'vet_inte' && !!utfall?.utfall_fraga_igen_at, utfall ?? {})
    await bild('08-efter-svar')

    // Nätverksfel på PUT.
    await page.setRequestInterception(true)
    page.on('request', (r) => (r.url().includes('/api/traning/plan') && r.method() === 'PUT' ? r.abort('failed') : r.continue()))
    await ga(page, '/dashboard/tester/installningar?steg=3')
    await klicka(page, /^Om en vecka$/)
    await klicka(page, /^Visa min plan$/)
    await vanta(1500)
    await bild('09-natfel')
    const natfel = await page.evaluate(() => ({ fel: /gick inte att spara/i.test(document.body.innerText), sparat: /\bsparat\b/i.test(document.body.innerText) }))
    logg(form, 'nätverksfel visar fel, aldrig sparat', natfel.fel && !natfel.sparat, natfel)
    logg(form, 'inga sidfel', konsol.length === 0, { konsol })
  } catch (e) {
    logg(form, 'avbrott', false, { fel: String(e.message) })
    await bild('fel').catch(() => {})
  } finally {
    await page.close()
    if (!BEHALL) await raderaKonto(k)
  }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  for (const form of ['pixel7', 'desktop']) await kor(browser, form)
} finally {
  await browser.close()
}
console.log(fel ? `${fel} fel` : 'allt grönt')
process.exit(fel ? 1 : 0)
