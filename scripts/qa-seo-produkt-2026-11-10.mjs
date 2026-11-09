// scripts/qa-seo-produkt-2026-11-10.mjs
// Klicktest i riktig Chrome av produktdelen i SEO-planen, del 1 (saas-leads
// slutliga beslut 2026-11-10): valet från artikeln till kontot, källan i
// acquisition_source, provdatumskärmen efter kontot och en registrering utan
// källa. Pixel 7 och 1280, ljust och mörkt.
//
//   QA_UT=<mapp utanför git> node scripts/qa-seo-produkt-2026-11-10.mjs
//
// Kräver ett produktionsbygge på QA_BAS (standard http://localhost:3119).
// Varje flöde är en ny inkognitokontext med en egen x-forwarded-for, så att
// provets IP-gräns räknas per flöde och raderna går att städa per ip_hash.
//
// STÄDREGEL: varje konto och prov skrivs till QA_UT/qa-konton.json med id
// och token. Städningen sker per id med --stada, aldrig per mönster eller tid.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:3119'
const UT = process.env.QA_UT
if (!UT) throw new Error('QA_UT saknas')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaSeoProdukt!2026'
const STAMPEL = new Date().toISOString().replace(/\D/g, '').slice(0, 12)
const KONTON_FIL = path.join(UT, 'qa-konton.json')

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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

fs.mkdirSync(UT, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 }
const MOBIL_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

const resultat = []
const bilder = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

/* ------------------------------------------------------------ konton, per id */

function lasKonton() {
  try {
    return JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8'))
  } catch {
    return { konton: [], ipHashar: [] }
  }
}
function sparaKonton(k) {
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
async function registreraId(email, tagg) {
  for (let i = 0; i < 15; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (data?.id) {
      const k = lasKonton()
      if (!k.konton.find((x) => x.id === data.id)) k.konton.push({ id: data.id, email, tagg, skapad: new Date().toISOString() })
      sparaKonton(k)
      return data.id
    }
    await vanta(800)
  }
  return null
}
/** Samma hash som src/lib/rate-limit/ip.ts, så att flödets rader går att städa per ip_hash. */
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + (env.RATE_LIMIT_PEPPER ?? 'jobbcoach')).digest('hex')
}
function sparaIp(ip) {
  const k = lasKonton()
  k.ipHashar = [...new Set([...(k.ipHashar ?? []), hashIp(ip)])]
  sparaKonton(k)
}

/* ------------------------------------------------------------ webbläsaren */

let bildNr = 0
async function skott(p, namn, beskrivning) {
  bildNr += 1
  const fil = `${String(bildNr).padStart(2, '0')}-${namn}.png`
  await p.screenshot({ path: path.join(UT, fil) })
  bilder.push({ fil, beskrivning })
}
const text = (p) => p.evaluate(() => document.body.innerText)

let ipNr = 0
async function nySida(browser, vy, morkt) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(90000)
  await p.setViewport(vy)
  if (vy.isMobile) await p.setUserAgent(MOBIL_UA)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: morkt ? 'dark' : 'light' }])
  ipNr += 1
  const ip = `10.211.${Number(STAMPEL.slice(-4)) % 250}.${ipNr}`
  sparaIp(ip)
  await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
  const fel = []
  p.on('pageerror', (e) => fel.push(String(e.message).slice(0, 200)))
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 500) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  return { p, ctx, fel }
}

async function ga(p, url) {
  await p.goto(BAS + url, { waitUntil: 'networkidle2' })
  await vanta(600)
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^(Acceptera|Godkänn)/.test(e.innerText.trim()))
    b?.click()
  })
  await vanta(300)
}

async function kakor(p) {
  const c = await p.cookies()
  return Object.fromEntries(c.map((x) => [x.name, x.value]))
}

/** Provet: start, fem svar, resultatet, Se vad jag missade. */
async function gorProvet(p, namn) {
  await p.waitForSelector('[data-cta="prova-start"]', { timeout: 30000 })
  await skott(p, `${namn}-prova-intro`, 'Provets intro')
  await p.click('[data-cta="prova-start"]')
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 30000 })
    if (i === 0) await skott(p, `${namn}-prova-fraga1`, 'Fråga 1')
    await p.evaluate((i) => {
      const b = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')]
      b[i % b.length].click()
    }, i)
    await vanta(500)
  }
  await p.waitForSelector('[data-cta="prova-gate"]', { timeout: 30000 })
  await vanta(500)
  await skott(p, `${namn}-prova-resultat`, 'Resultatet och spärren')
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('[data-cta="prova-gate"]')])
  await vanta(800)
}

async function skapaKonto(p, email, namn) {
  await p.waitForSelector('input[type="email"]', { timeout: 30000 })
  await skott(p, `${namn}-kontosteg`, 'Kontosteget: e-post och lösenord, inget val')
  const t = await text(p)
  logg(`${namn}: kontosteget har ingen fråga om test eller datum`, !/När är provet|Vad ska du göra för test|Provdagen/.test(t))
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('footer button[type="submit"]'),
  ])
  for (let i = 0; i < 30 && p.url().includes('/register'); i++) await vanta(500)
  for (let i = 0; i < 30 && p.url().includes('/dashboard/valkommen'); i++) await vanta(500)
  await vanta(1500)
  return registreraId(email, namn)
}

async function profilOchPlan(id) {
  const [{ data: prof }, { data: plan }] = await Promise.all([
    admin.from('profiles').select('acquisition_source').eq('id', id).maybeSingle(),
    admin.from('test_planer').select('mitt_test, mitt_test_variant, provdatum, testtyper, extra_typer').eq('user_id', id).maybeSingle(),
  ])
  return { acq: prof?.acquisition_source ?? null, plan: plan ?? null }
}

/** Artikelns provkort pekar om till ?mitt_test= som en artikellänk gör, och klickas. */
async function klickaProvkort(p, mittTest) {
  const ok = await p.evaluate((mt) => {
    const a = document.querySelector('a[data-cta-klick="/verktyg/rekryteringstester/prova"]')
    if (!a) return false
    if (mt) a.setAttribute('href', `/verktyg/rekryteringstester/prova?mitt_test=${mt}`)
    a.scrollIntoView({ block: 'center' })
    return true
  }, mittTest)
  if (!ok) return false
  await vanta(400)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    p.click('a[data-cta-klick="/verktyg/rekryteringstester/prova"]'),
  ])
  await vanta(800)
  return true
}

/* ============================================================ flödena */

async function flodeIprov(browser, vy, vyNamn, morkt, hoppaOver) {
  const namn = `${vyNamn}-${morkt ? 'morkt' : 'ljust'}-iprov`
  const email = `qa-seoprod-${STAMPEL}-${vyNamn}-iprov@jobbcoach-qa.test`
  const { p, ctx, fel } = await nySida(browser, vy, morkt)
  await ga(p, '/artiklar/rotation-test-guide')
  await skott(p, `${namn}-artikel`, 'Artikeln rotation-test-guide')
  logg(`${namn}: provkortet finns och klickas med ?mitt_test=iprov`, await klickaProvkort(p, 'iprov'))
  const k1 = await kakor(p)
  const kalla = decodeURIComponent(decodeURIComponent(k1.jc_provkalla ?? ''))
  logg(`${namn}: jc_provkalla har artikeln och iprov`, kalla.includes('rotation-test-guide') && kalla.includes('iprov'), kalla)
  await gorProvet(p, namn)
  const id = await skapaKonto(p, email, namn)
  logg(`${namn}: kontot skapat`, !!id)
  for (let i = 0; i < 20 && !p.url().includes('/dashboard/tester/provdatum'); i++) await vanta(500)
  logg(`${namn}: provdatumskärmen efter kontot`, p.url().includes('/dashboard/tester/provdatum'), p.url().replace(BAS, ''))
  await vanta(800)
  const t = await text(p)
  logg(`${namn}: skärmen har variant och datum`, t.includes('När är provet?') && t.includes('Polisen') && t.includes('Jag har inget datum än'))
  const knapp = await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === 'Fortsätt')
    if (!b) return null
    const r = b.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: window.innerHeight }
  })
  logg(`${namn}: Fortsätt syns utan rullning`, knapp && knapp.bottom <= knapp.h, JSON.stringify(knapp))
  await skott(p, `${namn}-provdatum`, 'Provdatumskärmen efter kontot')

  if (hoppaOver) {
    await Promise.all([
      p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
      p.click('[data-hoppa-over]'),
    ])
  } else {
    await p.evaluate(() => [...document.querySelectorAll('button[role="radio"]')].find((b) => b.innerText.trim() === 'Polisen')?.click())
    await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Om två veckor')?.click())
    await vanta(400)
    await skott(p, `${namn}-provdatum-ifylld`, 'Polisen och om två veckor valt')
    await Promise.all([
      p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
      p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Fortsätt')?.click()),
    ])
  }
  for (let i = 0; i < 20 && p.url().includes('/dashboard/tester/provdatum'); i++) await vanta(500)
  await vanta(1500)
  logg(`${namn}: vidare till provets genomgång`, p.url().includes('/dashboard/tester/prov/') || p.url().includes('/dashboard/tester'), p.url().replace(BAS, ''))
  await skott(p, `${namn}-landning`, hoppaOver ? 'Landningen efter Jag har inget datum än' : 'Landningen efter sparat datum')

  const { acq, plan } = await profilOchPlan(id)
  logg(`${namn}: acquisition_source kalla smakprov:rotation-test-guide`, acq?.kalla === 'smakprov:rotation-test-guide', JSON.stringify(acq))
  logg(`${namn}: acquisition_source mitt_test iprov`, acq?.mitt_test === 'iprov')
  logg(`${namn}: planen har valet iprov`, plan?.mitt_test === 'iprov', JSON.stringify(plan))
  if (hoppaOver) logg(`${namn}: inget datum sparat`, plan?.provdatum === null)
  else logg(`${namn}: datum och Polisen sparat`, !!plan?.provdatum && plan?.mitt_test_variant === 'polis')
  const k2 = await kakor(p)
  logg(`${namn}: jc_provkalla borta, jc_kontokalla satt`, !k2.jc_provkalla && !!k2.jc_kontokalla, k2.jc_kontokalla ?? '')
  logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
  await ctx.close()
}

async function flodeAlva(browser, vy, vyNamn, morkt) {
  const namn = `${vyNamn}-${morkt ? 'morkt' : 'ljust'}-alva`
  const email = `qa-seoprod-${STAMPEL}-${vyNamn}-alva@jobbcoach-qa.test`
  const { p, ctx, fel } = await nySida(browser, vy, morkt)
  await ga(p, '/artiklar/alva-labs-logiktest')
  logg(`${namn}: provkortet klickas utan parameter`, await klickaProvkort(p, null))
  await gorProvet(p, namn)
  const id = await skapaKonto(p, email, namn)
  await vanta(1500)
  logg(`${namn}: ingen provdatumskärm för Alva`, !p.url().includes('/provdatum'), p.url().replace(BAS, ''))
  await skott(p, `${namn}-landning`, 'Landningen för Alva, utan provdatumskärm')
  const { acq, plan } = await profilOchPlan(id)
  logg(`${namn}: kalla smakprov:alva-labs-logiktest`, acq?.kalla === 'smakprov:alva-labs-logiktest', JSON.stringify(acq))
  logg(`${namn}: planen har valet alva`, plan?.mitt_test === 'alva', JSON.stringify(plan))
  logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
  await ctx.close()
}

async function flodeUtanKalla(browser, vy, vyNamn, morkt) {
  const namn = `${vyNamn}-${morkt ? 'morkt' : 'ljust'}-utan-kalla`
  const email = `qa-seoprod-${STAMPEL}-${vyNamn}-utan@jobbcoach-qa.test`
  const { p, ctx, fel } = await nySida(browser, vy, morkt)
  await ga(p, '/register')
  const id = await skapaKonto(p, email, namn)
  logg(`${namn}: kontot skapat`, !!id)
  await vanta(1500)
  logg(`${namn}: ingen provdatumskärm`, !p.url().includes('/provdatum'), p.url().replace(BAS, ''))
  await skott(p, `${namn}-landning`, 'Landningen utan källa')
  const { acq, plan } = await profilOchPlan(id)
  logg(`${namn}: acquisition_source satt utan artikel`, !!acq && !acq.artikel && !String(acq.kalla ?? '').includes(':'), JSON.stringify(acq))
  logg(`${namn}: ingen plan med valet`, !plan?.mitt_test, JSON.stringify(plan))
  logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
  await ctx.close()
}

/* ============================================================ städning */

async function stada() {
  const k = lasKonton()
  const ids = k.konton.map((x) => x.id)
  const hashar = k.ipHashar ?? []
  if (hashar.length) {
    const { count: rl } = await admin.from('public_rate_limits').select('*', { count: 'exact', head: true }).in('ip_hash', hashar)
    const { count: anon } = await admin.from('anon_test_sessions').select('*', { count: 'exact', head: true }).in('ip_hash', hashar)
    console.log('räknat per ip_hash: public_rate_limits', rl, 'anon_test_sessions', anon)
    await admin.from('public_rate_limits').delete().in('ip_hash', hashar)
    await admin.from('anon_test_sessions').delete().in('ip_hash', hashar)
  }
  if (ids.length === 0) return console.log('inga konton att städa')
  const raknat = {}
  for (const [tabell, kol] of [
    ['anon_test_sessions', 'claimed_by'],
    ['test_planer', 'user_id'],
    ['logic_test_v4_sessions', 'user_id'],
    ['profiles', 'id'],
  ]) {
    const { count } = await admin.from(tabell).select('*', { count: 'exact', head: true }).in(kol, ids)
    raknat[tabell] = count
  }
  console.log('räknat före radering, per id:', raknat)
  for (const [tabell, kol] of [
    ['anon_test_sessions', 'claimed_by'],
    ['test_planer', 'user_id'],
    ['logic_test_v4_sessions', 'user_id'],
  ]) {
    const { error } = await admin.from(tabell).delete().in(kol, ids)
    if (error) console.error(tabell, error.message)
  }
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id)
    console.log(error ? `FEL ${id} ${error.message}` : `raderad ${id}`)
  }
}

/* ============================================================ körningen */

async function main() {
  if (process.argv.includes('--stada')) return stada()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  try {
    const bara = process.env.QA_BARA
    if (!bara || bara === 'iprov') {
      await flodeIprov(browser, PIXEL7, 'pixel7', false, false)
      await flodeIprov(browser, DESKTOP, 'desktop', true, true)
    }
    if (!bara || bara === 'utan') {
      await flodeUtanKalla(browser, PIXEL7, 'pixel7', true)
      await flodeUtanKalla(browser, DESKTOP, 'desktop', false)
    }
    if (!bara || bara === 'alva') await flodeAlva(browser, DESKTOP, 'desktop', false)
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat-del1.json'), JSON.stringify({ resultat, bilder }, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} OK`)
  if (fel.length) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
