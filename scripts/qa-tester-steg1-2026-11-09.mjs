// scripts/qa-tester-steg1-2026-11-09.mjs
// Klicktest i riktig Chrome av testplanen steg 1 (2026-11-09): Nivåkollen i
// figurserier, deduktivt, verbalt och numeriskt som ny användare, deduktivpasset
// och deduktivens övningsprov med Premium (premium_grants), kurvan och
// historiken (Din utveckling).
//
//   QA_BAS=http://localhost:5200 QA_KONTON_FIL=<scratchpad>/qa-konton-steg1.json \
//   QA_BILDER=<scratchpad>/verifiering-2026-11-09/tester-steg1 node scripts/qa-tester-steg1-2026-11-09.mjs
//
// Fyra genomgångar: gratis Pixel 7 ljust, gratis 1280 mörkt, Premium Pixel 7
// mörkt, Premium 1280 ljust. Varje konto skapas på /register och skrivs
// direkt till QA_KONTON_FIL med id; städningen sker per id med
// scripts/qa-registrering-stada.mjs (räknar först). Premiumgrantens id sparas
// i filen. Bilder utanför git, resultat till docs/qa/tester-steg1-2026-11-09/.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:5200'
const KONTON_FIL = process.env.QA_KONTON_FIL
const BILDER = process.env.QA_BILDER
if (!KONTON_FIL || !BILDER) throw new Error('QA_KONTON_FIL och QA_BILDER krävs')
const UT = 'docs/qa/tester-steg1-2026-11-09'
const ETIKETT = process.env.QA_ETIKETT || 'lokal'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaSteg1!2026x'
const BARA = (process.env.QA_BARA || '').split(',').filter(Boolean)

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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

fs.mkdirSync(UT, { recursive: true })
fs.mkdirSync(BILDER, { recursive: true })

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

function lasKonton() {
  try {
    return JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8'))
  } catch {
    return { konton: [], anonTest: [], qaIp: [], grants: [] }
  }
}
function spara(nyckel, v) {
  const d = lasKonton()
  d[nyckel] = [...(d[nyckel] ?? []), v]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
}

async function idFor(epost) {
  for (let i = 0; i < 30; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', epost).maybeSingle()
    if (data?.id) return data.id
    await vanta(500)
  }
  return null
}

async function bild(p, namn, beskrivning, helsida = false) {
  const fil = path.join(BILDER, `${ETIKETT}-${namn}.png`)
  await p.screenshot({ path: fil, fullPage: helsida })
  bilder.push({ fil: path.basename(fil), beskrivning })
}

async function sidled(p) {
  return p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}

async function knappMedText(p, text, exakt = true) {
  const h = await p.evaluateHandle(
    (t, e) => [...document.querySelectorAll('button, a')].find((b) => (e ? b.textContent.trim() === t : b.textContent.includes(t)) && b.offsetParent) ?? null,
    text,
    exakt
  )
  return h.asElement()
}

async function avvisaSamtycke(p) {
  const a = await knappMedText(p, 'Avvisa')
  if (a) await a.click().catch(() => {})
  await vanta(300)
}

async function ny(browser, vp, morkt) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(vp)
  if (vp.isMobile) await p.setUserAgent(MOBIL_UA)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: morkt ? 'dark' : 'light' }])
  p.setDefaultTimeout(30000)
  const fel = []
  p.on('pageerror', (e) => fel.push(`pageerror: ${e.message}`))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|posthog|Failed to load resource: net::ERR|status of 40[23]|turnstile|cloudflare|i\.posthog|vercel/i.test(m.text())) fel.push(`console: ${m.text().slice(0, 160)}`)
  })
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !u.includes('_next/static') && r.status() !== 402 && r.status() !== 403) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (BAS.includes('localhost')) {
    const ip = `10.97.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
    spara('qaIp', ip)
  }
  return { ctx, p, fel }
}

async function skapaKonto(p, etikett) {
  const epost = `qa-steg1-${etikett}-${Date.now()}@jobbcoach-qa.example.com`
  await p.goto(`${BAS}/register`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('form input[type="email"]')
  await avvisaSamtycke(p)
  await p.type('form input[type="email"]', epost)
  await p.type('form input[type="password"]', LOSEN)
  const skapa = (await p.$('button[type="submit"]')) ?? (await p.$('button[form]'))
  await skapa.click()
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 45000 }).catch(() => {})
  const uid = await idFor(epost)
  spara('konton', { epost, id: uid, etikett, skapad: new Date().toISOString() })
  return { epost, uid, landat: new URL(p.url()).pathname }
}

async function primarSynlig(p, sel) {
  return p.evaluate((s) => {
    const b = document.querySelector(s)
    if (!b) return false
    const r = b.getBoundingClientRect()
    return r.bottom <= window.innerHeight && r.top >= 0
  }, sel)
}

/** Gör en Nivåkoll: välj första alternativet och Svara tills resultatet syns. */
async function nivakoll(p, enhet, kind, rakna) {
  await p.goto(`${BAS}/dashboard/tester/pass?typ=nivakoll&kind=${kind}`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-nivakoll-svara], [data-nivakoll-resultat], [data-nivakoll-betalvagg]', { timeout: 30000 }).catch(() => {})
  await avvisaSamtycke(p)
  if (await p.$('[data-nivakoll-betalvagg]')) {
    logg(`${enhet}: Nivåkollen ${kind} startar`, false, 'betalväggen visades')
    return null
  }
  await vanta(500)
  await bild(p, `${enhet}-nivakoll-${kind}-1`, `Nivåkollen ${kind}, första uppgiften`)
  logg(`${enhet}: Nivåkollen ${kind}, Svara syns utan att rulla`, await primarSynlig(p, '[data-nivakoll-svara]'))
  logg(`${enhet}: Nivåkollen ${kind} utan sidledsscroll`, await sidled(p))
  let n = 0
  for (; n < 20; n++) {
    if (await p.$('[data-nivakoll-resultat]')) break
    const alt = await p.$$('[role="radiogroup"] [role="radio"]:not([disabled])')
    if (!alt.length) {
      await vanta(400)
      continue
    }
    // Varannan rätt-gissning varieras: första eller andra alternativet.
    await alt[rakna ? (n % 2) : 0].click()
    await vanta(150)
    await p.click('[data-nivakoll-svara]')
    await p.waitForFunction(
      (k) => !!document.querySelector('[data-nivakoll-resultat]') || !document.querySelector('[data-nivakoll-svara]')?.hasAttribute('disabled'),
      { timeout: 15000 }
    ).catch(() => {})
    await vanta(350)
  }
  await p.waitForSelector('[data-nivakoll-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(1400)
  const ok = !!(await p.$('[data-nivakoll-resultat]'))
  logg(`${enhet}: Nivåkollen ${kind} ger en nivå`, ok, `${n} svar`)
  if (!ok) return null
  await bild(p, `${enhet}-nivakoll-${kind}-resultat`, `Nivåkollen ${kind}, resultatet med nivån och skalan`)
  const text = await p.evaluate(() => document.querySelector('[data-resultat]')?.innerText ?? '')
  logg(`${enhet}: ${kind} resultatet utan talstreck, mittpunkt och procent`, !/—|·|%/.test(text))
  logg(`${enhet}: ${kind} resultatet nämner dagens pass`, /Dagens pass/i.test(text))
  const pass = await p.$eval('[data-nivakoll-pass]', (e) => e.getAttribute('data-nivakoll-pass')).catch(() => null)
  const startaPass = !!(await p.$('[data-nivakoll-starta-pass]'))
  // Genomgången: första uppgiften.
  const g = await p.$('[data-nivakoll-genomga]')
  if (g) {
    await g.click()
    await vanta(900)
    await bild(p, `${enhet}-nivakoll-${kind}-genomgang`, `Nivåkollen ${kind}, genomgången av uppgift 1`)
    const harForklaring = await p.evaluate(() => !!document.querySelector('.regelpanel, [data-deduktiv-losning], [data-vn-forklaring]'))
    logg(`${enhet}: ${kind} genomgången visar förklaringen`, harForklaring)
  }
  return { pass, startaPass }
}

async function las(p, url, namn, beskrivning) {
  await p.goto(`${BAS}${url}`, { waitUntil: 'networkidle2' })
  await vanta(1200)
  await bild(p, namn, beskrivning)
  return p.evaluate(() => document.body.innerText)
}

/* ------------------------------------------------------------ gratis */

async function gratis(browser, enhet, vp, morkt) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, `gratis-${enhet}`)
  logg(`${enhet}: kontot skapat och inloggat`, k.uid && k.landat.startsWith('/dashboard'), k.landat)
  await vanta(800)
  const alla = await las(p, '/dashboard/tester/alla', `${enhet}-alla`, 'Alla tester med raden Nivåkollen på varje testkort')
  const rader = await p.$$eval('[data-nivakollrad]', (r) => r.length)
  logg(`${enhet}: raden Nivåkollen på testkorten`, rader >= 5, `${rader} rader`)
  logg(`${enhet}: deduktivt har en levande provrad`, (await p.$$eval('[data-testkort="deduktiv"] [data-provrad]', (r) => r.map((x) => x.getAttribute('data-provrad')))).some((x) => x !== 'tyst'))
  logg(`${enhet}: Alla tester utan talstreck`, !/—/.test(alla))
  for (const kind of ['figurserie', 'deduktiv', 'verbal', 'numerisk']) await nivakoll(p, enhet, kind, true)
  const { data: punkter } = await admin.from('test_nivapunkter').select('test_kind, typ, niva').eq('user_id', k.uid)
  logg(`${enhet}: fyra nivåpunkter, en per typ`, (punkter ?? []).length === 4, JSON.stringify(punkter))
  // Ny nivåkoll samma dag visar dagens, en ny dag hade krävt Premium. Gratis deduktivpass: betalvägg.
  await p.goto(`${BAS}/dashboard/tester/pass?typ=deduktivpass`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-deduktivpass-betalvagg], [data-deduktivpass-svara]', { timeout: 20000 }).catch(() => {})
  await bild(p, `${enhet}-deduktivpass-gratis`, 'Deduktivpasset för gratis: betalväggen med Premium')
  logg(`${enhet}: deduktivpasset spärrat för gratis`, !!(await p.$('[data-deduktivpass-betalvagg]')))
  const hem = await las(p, '/dashboard/tester', `${enhet}-hem`, 'Hemvyn efter Nivåkollerna')
  logg(`${enhet}: hemvyn visar deduktivpasset`, /Deduktivpass/.test(hem))
  const kurva = await las(p, '/dashboard/tester/kurvan', `${enhet}-kurvan`, 'Hela kurvan med Fler kurvor per testtyp')
  logg(`${enhet}: Fler kurvor visar nivån per typ`, (kurva.match(/i Nivåkollen/g) ?? []).length >= 4, kurva.match(/Nivå [\d,]+ i Nivåkollen/g)?.join(' | '))
  logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 5).join(' ; '))
  await ctx.close()
}

/* ------------------------------------------------------------ premium */

async function premium(browser, enhet, vp, morkt) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, `premium-${enhet}`)
  logg(`${enhet}: kontot skapat`, !!k.uid)
  const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
  const { data: grant, error } = await admin
    .from('premium_grants')
    .insert({ user_id: k.uid, days: 7, source: 'qa-tester-steg1', scope: 'allt', premium_until_after: om7 })
    .select('id')
    .single()
  if (error) throw error
  spara('grants', { id: grant.id, uid: k.uid })
  await vanta(800)

  const r = await nivakoll(p, enhet, 'deduktiv', false)
  logg(`${enhet}: Premium ser Starta deduktivpasset i foten`, !!r?.startaPass)

  // Deduktivpasset: fyra uppgifter, lösningen efter varje svar.
  await p.goto(`${BAS}/dashboard/tester/pass?typ=deduktivpass`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-deduktivpass-svara]', { timeout: 30000 }).catch(() => {})
  await avvisaSamtycke(p)
  await vanta(500)
  await bild(p, `${enhet}-deduktivpass-1`, 'Deduktivpasset, uppgift 1 med villkoren')
  logg(`${enhet}: deduktivpasset startar`, !!(await p.$('[data-deduktivpass-svara]')))
  logg(`${enhet}: Svara syns utan att rulla`, await primarSynlig(p, '[data-deduktivpass-svara]'))
  logg(`${enhet}: deduktivpasset utan sidledsscroll`, await sidled(p))
  for (let i = 0; i < 4; i++) {
    const alt = await p.$$('[data-deduktiv-alternativ] [role="radio"]:not([disabled])')
    if (!alt.length) break
    await alt[i % alt.length].click()
    await vanta(150)
    await p.click('[data-deduktivpass-svara]')
    await p.waitForSelector('[data-deduktiv-losning]', { timeout: 15000 }).catch(() => {})
    await vanta(500)
    if (i === 0) await bild(p, `${enhet}-deduktivpass-losning`, 'Deduktivpasset, lösningen efter svaret')
    if (i === 0) logg(`${enhet}: lösningen visas efter svaret`, !!(await p.$('[data-deduktiv-losning]')))
    await p.click('[data-deduktivpass-nasta]').catch(() => {})
    await vanta(800)
  }
  await p.waitForSelector('[data-deduktiv-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(600)
  await bild(p, `${enhet}-deduktivpass-resultat`, 'Deduktivpasset klart: ringen, tempot, var du tappade')
  logg(`${enhet}: deduktivpassets resultat`, !!(await p.$('[data-deduktiv-resultat]')))

  // Övningsprovet i deduktivt.
  await p.goto(`${BAS}/dashboard/tester/ovningsprov/deduktiv`, { waitUntil: 'networkidle2' })
  await vanta(800)
  await bild(p, `${enhet}-ovningsprov-startark`, 'Övningsprovet i deduktivt, startarket med formatet')
  const start = await knappMedText(p, 'Starta övningsprovet')
  logg(`${enhet}: startarket har Starta övningsprovet`, !!start)
  if (start) {
    await start.click()
    await p.waitForSelector('[data-ovningsprov="deduktiv"]', { timeout: 30000 }).catch(() => {})
    await vanta(800)
    await bild(p, `${enhet}-ovningsprov-uppgift`, 'Övningsprovet, första uppgiften med klockan')
    logg(`${enhet}: övningsprovet visar en deduktiv uppgift`, !!(await p.$('[data-ovningsprov="deduktiv"] [data-deduktiv]')))
    logg(`${enhet}: övningsprovet utan sidledsscroll`, await sidled(p))
    for (let i = 0; i < 3; i++) {
      const alt = await p.$$('[data-deduktiv-alternativ] [role="radio"]')
      if (alt.length) await alt[0].click()
      await vanta(200)
      const nasta = await p.$('[data-nasta]')
      if (nasta) await nasta.click()
      await vanta(300)
    }
    // Hoppa till sista och lämna in.
    for (let i = 0; i < 20 && !(await p.$('[data-lamna-in]')); i++) {
      const nasta = await p.$('[data-nasta]')
      if (!nasta) break
      await nasta.click()
      await vanta(120)
    }
    await p.click('[data-lamna-in]').catch(() => {})
    await p.waitForSelector('[data-genomgang-punkt], [data-resultat]', { timeout: 30000 }).catch(() => {})
    await vanta(1500)
    await bild(p, `${enhet}-ovningsprov-resultat`, 'Övningsprovet inlämnat: resultatet')
    const res = await p.evaluate(() => document.body.innerText)
    logg(`${enhet}: övningsprovets resultat visas`, /rätt|Genomgång|att titta på/i.test(res))
    const gaIgenom = await knappMedText(p, 'Gå igenom', false)
    if (gaIgenom) {
      await gaIgenom.click()
      await vanta(900)
      await bild(p, `${enhet}-ovningsprov-genomgang`, 'Övningsprovets genomgång med lösningen', true)
      logg(`${enhet}: genomgången visar lösningen`, !!(await p.$('[data-deduktiv-losning]')))
    }
  }

  const hem = await las(p, '/dashboard/tester', `${enhet}-hem`, 'Hemvyn med deduktivpasset gjort i dag')
  logg(`${enhet}: hemvyn bockar deduktivpasset`, /Deduktivpass[\s\S]{0,80}Gjort/.test(hem))
  const kurva = await las(p, '/dashboard/tester/kurvan', `${enhet}-kurvan`, 'Hela kurvan, Fler kurvor med deduktivt')
  logg(`${enhet}: kurvan visar deduktivts nivå`, /Nivå [\d,]+ i Nivåkollen/.test(kurva))
  await p.goto(`${BAS}/dashboard/tester/alla?flik=utveckling`, { waitUntil: 'networkidle2' })
  const flik = await knappMedText(p, 'Din utveckling', false)
  if (flik) await flik.click().catch(() => {})
  await vanta(2500)
  await bild(p, `${enhet}-utveckling`, 'Din utveckling: pass per testtyp med deduktivt', true)
  const utv = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: historiken räknar deduktivpasset`, /Deduktivt\s*\n?\s*1 pass/.test(utv), (utv.match(/Pass per testtyp[\s\S]{0,200}/) ?? [''])[0].replace(/\n/g, ' | '))
  const { data: rader } = await admin.from('logic_test_v4_sessions').select('test_type, completed_at').eq('user_id', k.uid)
  logg(`${enhet}: sessionerna sparade`, ['deduktiv-nivakoll', 'deduktiv-pass', 'deduktiv-prov'].every((t) => rader?.some((r) => r.test_type === t && r.completed_at)), JSON.stringify(rader?.map((r) => r.test_type)))
  logg(`${enhet}: inga konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 5).join(' ; '))
  await ctx.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  const korningar = [
    ['p7-ljust-gratis', () => gratis(browser, 'p7-ljust-gratis', PIXEL7, false)],
    ['d1280-morkt-gratis', () => gratis(browser, 'd1280-morkt-gratis', DESKTOP, true)],
    ['p7-morkt-premium', () => premium(browser, 'p7-morkt-premium', PIXEL7, true)],
    ['d1280-ljust-premium', () => premium(browser, 'd1280-ljust-premium', DESKTOP, false)],
  ]
  for (const [namn, f] of korningar) {
    if (BARA.length && !BARA.includes(namn)) continue
    try {
      await f()
    } catch (e) {
      logg(`${namn}: genomgången avbröts`, false, String(e?.message ?? e).slice(0, 200))
    }
  }
} finally {
  await browser.close()
}

const ok = resultat.filter((r) => r.ok).length
fs.writeFileSync(path.join(UT, `klicktest-${ETIKETT}.json`), JSON.stringify({ bas: BAS, tid: new Date().toISOString(), ok, totalt: resultat.length, resultat, bilder }, null, 2))
fs.writeFileSync(path.join(BILDER, `bilder-${ETIKETT}.json`), JSON.stringify(bilder, null, 2))
console.log(`\n${ok} av ${resultat.length} kontroller gröna`)
