// scripts/qa-prov-typer-2026-11-10.mjs
// Klicktest i riktig Chrome av del 2 (saas-leads slutliga beslut 2026-11-10):
// provet utan konto i alla typer hela vägen till kontot och genomgången, och
// uppgift 1 inbäddad i artiklarna (våg 1 och 2). Pixel 7 och 1280, ljust och
// mörkt.
//
//   QA_UT=<mapp utanför git> node scripts/qa-prov-typer-2026-11-10.mjs
//   QA_UT=... QA_BARA=prov|artikel node scripts/qa-prov-typer-2026-11-10.mjs
//   QA_UT=... node scripts/qa-prov-typer-2026-11-10.mjs --stada
//
// Kräver ett produktionsbygge på QA_BAS (standard http://localhost:3119).
// Varje flöde har en egen x-forwarded-for, så att provets IP-gräns räknas
// per flöde och raderna går att städa per ip_hash.
//
// STÄDREGEL: konton och IP-hashar skrivs till QA_UT/qa-konton.json. Städningen
// sker per id och per ip_hash med --stada, aldrig per mönster eller tid.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:3119'
const UT = process.env.QA_UT
if (!UT) throw new Error('QA_UT saknas')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaProvTyper!2026'
const STAMPEL = new Date().toISOString().replace(/\D/g, '').slice(0, 12)
const KONTON_FIL = path.join(UT, 'qa-konton.json')

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
fs.mkdirSync(UT, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 }
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

const resultat = []
const bilder = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

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
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + (env.RATE_LIMIT_PEPPER ?? 'jobbcoach')).digest('hex')
}
async function registreraId(email, tagg) {
  for (let i = 0; i < 15; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (data?.id) {
      const k = lasKonton()
      if (!k.konton.find((x) => x.id === data.id)) k.konton.push({ id: data.id, email, tagg })
      sparaKonton(k)
      return data.id
    }
    await vanta(800)
  }
  return null
}

let bildNr = 0
async function skott(p, namn, beskrivning, fullPage = false) {
  bildNr += 1
  const fil = `${String(bildNr).padStart(3, '0')}-${namn}.png`
  await p.screenshot({ path: path.join(UT, fil), fullPage })
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
  const ip = `10.212.${Number(STAMPEL.slice(-4)) % 250}.${ipNr}`
  const k = lasKonton()
  k.ipHashar = [...new Set([...(k.ipHashar ?? []), hashIp(ip)])]
  sparaKonton(k)
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
  await p.evaluate(() => [...document.querySelectorAll('button')].find((e) => /^(Acceptera|Godkänn)/.test(e.innerText.trim()))?.click())
  await vanta(300)
}

/** Klickar ett svarsalternativ i uppgiften (första giltiga knappen, eller den med index i). */
async function svaraUppgift(p, scope, i = 0) {
  return p.evaluate(
    (scope, i) => {
      const rot = document.querySelector(scope)
      if (!rot) return 'ingen-uppgift'
      const knappar = [...rot.querySelectorAll('button:not([disabled])')].filter((b) => !/rapport|visa tabell|dölj/i.test(b.innerText))
      const b = knappar[i % Math.max(1, knappar.length)]
      if (!b) return 'ingen-knapp'
      b.scrollIntoView({ block: 'center' })
      b.click()
      return 'ok'
    },
    scope,
    i
  )
}

async function skapaKonto(p, email, namn) {
  await p.waitForSelector('input[type="email"]', { timeout: 30000 })
  await skott(p, `${namn}-kontosteg`, 'Kontosteget med provets panel')
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), p.click('form button[type="submit"]')])
  for (let i = 0; i < 30 && p.url().includes('/register'); i++) await vanta(500)
  for (let i = 0; i < 30 && p.url().includes('/dashboard/valkommen'); i++) await vanta(500)
  await vanta(1500)
  return registreraId(email, namn)
}

/* ------------------------------------------------------------ provet per typ */

const NIVAKOLL = new Set(['figurserie', 'deduktiv', 'verbal', 'numerisk'])

async function flodeTyp(browser, typ, vy, vyNamn, morkt) {
  const namn = `${vyNamn}-${morkt ? 'morkt' : 'ljust'}-${typ}`
  const email = `qa-provtyp-${STAMPEL}-${vyNamn}-${typ}@jobbcoach-qa.test`
  const { p, ctx, fel } = await nySida(browser, vy, morkt)
  await ga(p, `/verktyg/rekryteringstester/prova${typ === 'matris' ? '' : `?typ=${typ}`}`)
  await skott(p, `${namn}-intro`, `Provets intro, ${typ}`)
  await p.waitForSelector('[data-cta="prova-start"]', { timeout: 30000 })
  await p.click('[data-cta="prova-start"]')
  const antal = typ === 'iprov' ? 6 : 5
  const scope = typ === 'matris' ? '.pub-prov-fraga-kropp .pub-prov-alt' : '.pub-prov-fraga-kropp [data-typ-uppgift]'
  for (let i = 0; i < antal; i++) {
    await p.waitForSelector(scope, { timeout: 30000 })
    await vanta(400)
    if (i === 0 || (typ === 'iprov' && i < 6 && vyNamn === 'pixel7')) await skott(p, `${namn}-uppgift${i + 1}`, `Uppgift ${i + 1}`)
    if (i === 0 && vy.isMobile) {
      const syns = await p.evaluate((scope) => {
        const knappar = [...document.querySelectorAll(`${scope} button`)]
        const sista = knappar[knappar.length - 1]
        return sista ? Math.round(sista.getBoundingClientRect().bottom) : 9999
      }, scope)
      logg(`${namn}: uppgift 1, sista alternativet inom ${vy.height} px`, syns <= vy.height, String(syns))
    }
    const r = await svaraUppgift(p, scope, i)
    if (r !== 'ok') logg(`${namn}: svar ${i + 1}`, false, r)
    await vanta(500)
  }
  await p.waitForSelector('[data-cta="prova-gate"]', { timeout: 30000 })
  await vanta(500)
  const t = await text(p)
  logg(`${namn}: resultatet visas`, /rätt av/.test(t) || /Rätt av/.test(t) || /rätt/i.test(t))
  await skott(p, `${namn}-resultat`, 'Resultatet och spärren')
  const { data: rad } = await admin.from('anon_test_sessions').select('token, test_kind, score, questions').eq('ip_hash', hashIp(`10.212.${Number(STAMPEL.slice(-4)) % 250}.${ipNr}`)).order('created_at', { ascending: false }).limit(1).maybeSingle()
  logg(`${namn}: raden har test_kind ${typ}`, rad?.test_kind === typ, `${rad?.test_kind} score ${rad?.score}`)
  logg(`${namn}: ${antal} uppgifter i raden`, Array.isArray(rad?.questions) && rad.questions.length === antal)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('[data-cta="prova-gate"]')])
  await vanta(800)
  const id = await skapaKonto(p, email, namn)
  logg(`${namn}: kontot skapat`, !!id)
  if (p.url().includes('/dashboard/tester/provdatum')) {
    await skott(p, `${namn}-provdatum`, 'Provdatumskärmen efter kontot (I-provet)')
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('[data-hoppa-over]')])
    await vanta(1500)
  }
  logg(`${namn}: landar på genomgången`, p.url().includes('/dashboard/tester/prov/'), p.url().replace(BAS, ''))
  await vanta(800)
  const g = await text(p)
  logg(`${namn}: genomgången har alla uppgifter`, typ === 'matris' ? /alla svar/.test(g) : (await p.$$('[data-prov-genomgang] > li')).length === antal)
  await skott(p, `${namn}-genomgang`, 'Genomgången efter kontot')
  await skott(p, `${namn}-genomgang-hel`, 'Hela genomgången', true)
  const { data: hamtad } = await admin.from('anon_test_sessions').select('claimed_by').eq('token', rad?.token ?? '').maybeSingle()
  logg(`${namn}: provet hämtat till kontot`, hamtad?.claimed_by === id)

  if (NIVAKOLL.has(typ)) {
    const lank = await p.$(`[data-cta="prov-${typ}-nivakollen"]`)
    logg(`${namn}: Nivåkollen är nästa steg`, !!lank)
    if (lank) {
      await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), lank.click()])
      await vanta(3000)
      await skott(p, `${namn}-nivakoll`, 'Nivåkollen med provets svar inräknade')
      const { data: nk } = await admin.from('logic_test_v4_sessions').select('id, meta, answers').eq('user_id', id).eq('test_type', `${typ}-nivakoll`).maybeSingle()
      const smak = nk?.meta?.smakprov
      logg(`${namn}: Nivåkollen räknar in provet`, !!smak && Array.isArray(nk?.answers) && nk.answers.length >= 3, JSON.stringify(smak ?? null) + ` svar ${nk?.answers?.length}`)
    }
  }
  logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------ uppgift 1 i artikeln */

const ARTIKLAR = [
  ['alva-labs-logiktest', 'matris'],
  ['matrigma-test', 'matris'],
  ['logiska-tester', 'matris'],
  ['logiktest-exempel-med-losningar', 'matris'],
  ['rotation-test-guide', 'spatial'],
  ['deduktivt-induktivt-test', 'deduktiv'],
  ['verbalt-test-guide', 'verbal'],
  ['numeriskt-test-guide', 'numerisk'],
  ['aon-cut-e-test', 'figurserie'],
  ['talserier', 'talserie'],
  ['ordforstaelse-test', 'ordforrad'],
  ['i-prov', 'iprov'],
]

async function flodeArtikel(browser, slug, typ, vy, vyNamn, morkt, medKonto) {
  const namn = `${vyNamn}-${morkt ? 'morkt' : 'ljust'}-artikel-${slug}`
  const html = await (await fetch(`${BAS}/artiklar/${slug}`)).text().catch(() => '')
  if (!html.includes('data-artikel-prov')) {
    logg(`${namn}: artikeln har ingen inbäddad uppgift (inte publicerad än?)`, false)
    return
  }
  logg(`${namn}: uppgift 1 i serverns HTML med alternativ`, html.includes(`data-artikel-prov="${typ}"`) && (html.match(/<button/g) ?? []).length > 3)
  const { p, ctx, fel } = await nySida(browser, vy, morkt)
  await ga(p, `/artiklar/${slug}`)
  const lage = await p.evaluate(() => {
    const h2 = [...document.querySelectorAll('article h2, main h2')].filter((h) => !h.closest('.not-prose') || h.textContent.startsWith('Snabbsvar'))
    const snabb = h2.find((h) => h.textContent.startsWith('Snabbsvar'))
    const forsta = h2.find((h) => !h.textContent.startsWith('Snabbsvar'))
    const prov = document.querySelector('[data-artikel-prov]')
    const y = (el) => (el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null)
    return { snabb: y(snabb), forsta: y(forsta), prov: y(prov) }
  })
  logg(`${namn}: snabbsvaret och första H2 före provet`, lage.prov !== null && (lage.forsta ?? 0) < lage.prov && (lage.snabb ?? 0) < lage.prov, JSON.stringify(lage))
  await p.evaluate(() => document.querySelector('[data-artikel-prov]')?.scrollIntoView({ block: 'start' }))
  await vanta(500)
  await skott(p, `${namn}-uppgift1`, `Uppgift 1 i artikeln ${slug}`)
  const antal = typ === 'iprov' ? 6 : 5
  const scope = typ === 'matris' ? '[data-artikel-prov] .pub-prov-alt' : '[data-artikel-prov] [data-typ-uppgift]'
  for (let i = 0; i < antal; i++) {
    await p.waitForSelector(scope, { timeout: 30000 })
    const r = await svaraUppgift(p, scope, i)
    if (r !== 'ok') logg(`${namn}: svar ${i + 1}`, false, r)
    await vanta(600)
    if (i === 0) await p.waitForFunction(() => /Uppgift 2/.test(document.querySelector('[data-artikel-prov] .art-prov-rad')?.textContent ?? ''), { timeout: 30000 }).catch(() => {})
    if (i === 0) await skott(p, `${namn}-uppgift2`, 'Uppgift 2 efter svaret i artikeln')
  }
  await p.waitForSelector('[data-artikel-prov] [data-prov-resultat]', { timeout: 30000 }).catch(() => {})
  const harRes = !!(await p.$('[data-artikel-prov] [data-prov-resultat]'))
  logg(`${namn}: resultatet i artikeln`, harRes)
  await p.evaluate(() => document.querySelector('[data-prov-resultat]')?.scrollIntoView({ block: 'center' }))
  await vanta(300)
  await skott(p, `${namn}-resultat`, 'Resultatet i artikeln med spärren')
  if (medKonto && harRes) {
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('[data-cta="artikel-prov-gate"]')])
    await vanta(800)
    const email = `qa-provtyp-${STAMPEL}-${vyNamn}-art-${typ}@jobbcoach-qa.test`
    const id = await skapaKonto(p, email, namn)
    if (p.url().includes('/dashboard/tester/provdatum')) {
      await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('[data-hoppa-over]')])
      await vanta(1500)
    }
    logg(`${namn}: konto och genomgång`, !!id && p.url().includes('/dashboard/tester/prov/'), p.url().replace(BAS, ''))
    await skott(p, `${namn}-genomgang`, 'Genomgången efter provet i artikeln')
    const { data: prof } = await admin.from('profiles').select('acquisition_source').eq('id', id).maybeSingle()
    logg(`${namn}: källan smakprov:${slug}`, prof?.acquisition_source?.kalla === `smakprov:${slug}`, JSON.stringify(prof?.acquisition_source ?? null))
  }
  logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------ städning */

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
  if (!ids.length) return
  const raknat = {}
  for (const [tabell, kol] of [['anon_test_sessions', 'claimed_by'], ['test_planer', 'user_id'], ['logic_test_v4_sessions', 'user_id'], ['test_nivapunkter', 'user_id'], ['profiles', 'id']]) {
    const { count } = await admin.from(tabell).select('*', { count: 'exact', head: true }).in(kol, ids)
    raknat[tabell] = count
  }
  console.log('räknat före radering, per id:', raknat)
  for (const [tabell, kol] of [['anon_test_sessions', 'claimed_by'], ['test_planer', 'user_id'], ['logic_test_v4_sessions', 'user_id'], ['test_nivapunkter', 'user_id']]) {
    const { error } = await admin.from(tabell).delete().in(kol, ids)
    if (error) console.error(tabell, error.message)
  }
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id)
    console.log(error ? `FEL ${id} ${error.message}` : `raderad ${id}`)
  }
}

async function main() {
  if (process.argv.includes('--stada')) return stada()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  const bara = process.env.QA_BARA
  const typer = (process.env.QA_TYPER ?? 'matris,figurserie,verbal,numerisk,deduktiv,spatial,talserie,ordforrad,iprov').split(',')
  try {
    if (!bara || bara === 'prov') {
      typer.forEach((t, i) => i)
      for (const [i, typ] of typer.entries()) {
        const morkt = i % 2 === 1
        await flodeTyp(browser, typ, PIXEL7, 'pixel7', morkt)
        await flodeTyp(browser, typ, DESKTOP, 'desktop', !morkt)
      }
    }
    if (!bara || bara === 'artikel') {
      for (const [i, [slug, typ]] of ARTIKLAR.entries()) {
        const morkt = i % 2 === 1
        await flodeArtikel(browser, slug, typ, PIXEL7, 'pixel7', morkt, slug === 'alva-labs-logiktest' || slug === 'i-prov')
        await flodeArtikel(browser, slug, typ, DESKTOP, 'desktop', !morkt, slug === 'rotation-test-guide')
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, `resultat-del2-${bara ?? 'alla'}.json`), JSON.stringify({ resultat, bilder }, null, 2))
  const felen = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - felen.length} av ${resultat.length} OK`)
  if (felen.length) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
