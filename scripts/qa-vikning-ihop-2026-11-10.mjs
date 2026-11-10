// scripts/qa-vikning-ihop-2026-11-10.mjs
// Klicktest i riktig Chrome av pappersvikningen i I-provets riktning (form D,
// 2026-11-10): provet utan konto för typ=iprov, I-provets övningsprov med
// ett Premium-testkonto (deltest 2 pappersvikning och deltest 6 med klipp)
// och ett spatialpass.
//
//   QA_BAS=http://localhost:5300 QA_KONTON_FIL=<scratchpad>/qa-konton-vikning.json \
//   QA_BILDER=<scratchpad>/verifiering-2026-11-10/vikning node scripts/qa-vikning-ihop-2026-11-10.mjs
//
// Fyra genomgångar: Pixel 7 ljust och mörkt, 1280 ljust och mörkt. Kontona
// och premiumgrantens id skrivs till QA_KONTON_FIL med id, anonyma prov med
// token; städningen sker per id med scripts/qa-registrering-stada.mjs (räknar
// först). Bilder och resultat utanför git.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:5300'
const KONTON_FIL = process.env.QA_KONTON_FIL
const BILDER = process.env.QA_BILDER
if (!KONTON_FIL || !BILDER) throw new Error('QA_KONTON_FIL och QA_BILDER krävs')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaVikning!2026x'
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
    return { konton: [], anonTest: [], grants: [] }
  }
}
function spara(nyckel, v) {
  const d = lasKonton()
  d[nyckel] = [...new Set([...(d[nyckel] ?? []).map((x) => JSON.stringify(x)), JSON.stringify(v)])].map((x) => JSON.parse(x))
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
  const fil = path.join(BILDER, `${namn}.png`)
  await p.screenshot({ path: fil, fullPage: helsida })
  bilder.push({ fil: path.basename(fil), beskrivning })
}
async function elementBild(p, sel, namn, beskrivning) {
  const el = await p.$(sel)
  if (!el) return bild(p, namn, beskrivning)
  await el.evaluate((e) => e.scrollIntoView({ block: 'start' }))
  await vanta(200)
  const fil = path.join(BILDER, `${namn}.png`)
  await el.screenshot({ path: fil })
  bilder.push({ fil: path.basename(fil), beskrivning })
}
const sidled = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
async function knappMedText(p, text) {
  const h = await p.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim() === t && b.offsetParent) ?? null, text)
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
  p.on('pageerror', (e) => fel.push(`pageerror: ${e.message.slice(0, 100)}`))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|posthog|Failed to load resource: net::ERR|status of 40[23]|turnstile|cloudflare|vercel/i.test(m.text())) fel.push(`console: ${m.text().slice(0, 160)}`)
  })
  p.on('response', async (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !u.includes('_next/static') && r.status() !== 402 && r.status() !== 403) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
    if (u.endsWith('/api/public/test-session') && r.request().method() === 'POST') {
      try {
        const j = await r.json()
        if (j.token) spara('anonTest', j.token)
      } catch {}
    }
  })
  if (BAS.includes('localhost')) await p.setExtraHTTPHeaders({ 'x-forwarded-for': `10.97.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` })
  return { ctx, p, fel }
}

/** Formen D i rätt riktning: sekvensen med "Vik 1", hjälpraden och fyra vikta ark. */
async function kollaFormD(p, rot, enhet, var_) {
  const info = await p.evaluate((r) => {
    const u = document.querySelector(`${r} [data-steg2-uppgift="spatial"][data-form="D"]`)
    if (!u) return null
    const t = u.innerText
    return {
      etikett: /Vik 1/.test(t),
      hjalp: /Hål och klipp syns bara där de går genom alla lager/.test(t),
      fraga: /Hur ser det ut ihopvikt\?/.test(t),
      alternativ: u.querySelectorAll('[data-steg2-alternativ] [role="radio"]').length,
      sekvensBredd: Math.round(u.querySelector('[data-spatial-sekvens]')?.getBoundingClientRect().width ?? 0),
      text: t,
    }
  }, rot)
  if (!info) return false
  logg(`${enhet}: ${var_} visar pappersvikning ihopvikt (Vik 1, hjälpraden, fyra alternativ)`, info.etikett && info.hjalp && info.fraga && info.alternativ === 4, `bredd ${info.sekvensBredd}`)
  logg(`${enhet}: ${var_} utan talstreck`, !/—/.test(info.text))
  logg(`${enhet}: ${var_} utan sidledsscroll`, await sidled(p))
  return true
}

/* ------------------------------------------------------- provet utan konto */

async function publikt(browser, enhet, vp, morkt) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  await p.goto(`${BAS}/verktyg/rekryteringstester/prova?typ=iprov`, { waitUntil: 'networkidle2' })
  await avvisaSamtycke(p)
  await vanta(600)
  await bild(p, `${enhet}-publikt-01-start`, 'Provet utan konto, typ=iprov: startsidan')
  await p.click('[data-cta="prova-start"]')
  let sagD = false
  for (let i = 0; i < 6; i++) {
    await p.waitForSelector('[data-typ-uppgift] [data-steg2-alternativ] [role="radio"]', { timeout: 20000 }).catch(() => {})
    await vanta(700)
    const form = await p.$eval('[data-typ-uppgift] [data-steg2-uppgift]', (e) => `${e.getAttribute('data-steg2-uppgift')}:${e.getAttribute('data-form') ?? ''}`).catch(() => '')
    if (form === 'spatial:D') {
      sagD = await kollaFormD(p, '[data-typ-uppgift]', enhet, 'provet utan konto, uppgift ' + (i + 1))
      await bild(p, `${enhet}-publikt-02-pappersvikning`, `Provet utan konto, uppgift ${i + 1}: pappersvikning ihopvikt`, true)
      if (vp.isMobile) await elementBild(p, '[data-typ-uppgift]', `${enhet}-publikt-03-pappersvikning-nara`, 'Uppgiften i närbild')
    }
    if (form === 'spatial:B') await bild(p, `${enhet}-publikt-04-med-klipp`, `Provet utan konto, uppgift ${i + 1}: pappersvikning med klipp, uppvikt`, true)
    const alt = await p.$$('[data-typ-uppgift] [data-steg2-alternativ] [role="radio"]')
    if (!alt.length) break
    await alt[i % alt.length].click()
    await vanta(1200)
  }
  logg(`${enhet}: provet utan konto har pappersvikningen ihopvikt`, sagD)
  await vanta(1500)
  await bild(p, `${enhet}-publikt-05-resultat`, 'Provet utan konto: resultatet')
  logg(`${enhet}: provet utan konto utan konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 4).join(' ; '))
  await ctx.close()
}

/* ------------------------------------------------------- konto och Premium */

async function skapaKonto(p, etikett) {
  const epost = `qa-vikning-${etikett}-${Date.now()}@jobbcoach-qa.example.com`
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
  return { epost, uid }
}
async function gePremium(uid) {
  const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
  const { data: grant, error } = await admin
    .from('premium_grants')
    .insert({ user_id: uid, days: 7, source: 'qa-vikning-2026-11-10', scope: 'allt', premium_until_after: om7 })
    .select('id')
    .single()
  if (error) throw error
  spara('grants', { id: grant.id, uid })
}

async function iprov(p, enhet) {
  await p.goto(`${BAS}/dashboard/tester/iprov`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-iprov-starta]', { timeout: 30000 }).catch(() => {})
  await avvisaSamtycke(p)
  await vanta(800)
  await bild(p, `${enhet}-iprov-01-startark`, 'I-provets övningsprov: startarket')
  await p.click('[data-iprov-starta]')
  await p.waitForSelector('[data-iprov-mellanblad]', { timeout: 30000 }).catch(() => {})
  await vanta(800)
  let delnr = 0
  for (let varv = 0; varv < 8; varv++) {
    if (await p.$('[data-iprov-resultat]')) break
    if (!(await p.$('[data-iprov-mellanblad]'))) break
    delnr++
    if (delnr === 2 || delnr === 6) {
      const t = await p.evaluate(() => document.body.innerText)
      if (delnr === 2) logg(`${enhet}: mellanbladet för deltest 2 beskriver ihopvikningen`, /utvikt ark/.test(t) && /ihopvikt/.test(t))
      if (delnr === 6) logg(`${enhet}: mellanbladet för deltest 6 beskriver uppvikningen med klipp`, /uppvikt/.test(t))
      await bild(p, `${enhet}-iprov-0${delnr === 2 ? 2 : 5}-mellanblad-${delnr}`, `Mellanbladet före deltest ${delnr}`)
    }
    await p.click('[data-iprov-starta-del]')
    await p.waitForSelector('[data-iprov-fraga] [data-steg2-alternativ] [role="radio"]', { timeout: 20000 }).catch(() => {})
    await vanta(800)
    if (delnr === 2) {
      const ok = await kollaFormD(p, '[data-iprov-fraga]', enhet, 'deltest 2')
      logg(`${enhet}: deltest 2 är pappersvikning ihopvikt`, ok)
      await bild(p, `${enhet}-iprov-03-deltest2-fraga`, 'Deltest 2 pappersvikning: utvikt ark, välj hur det ser ut ihopvikt', true)
    }
    if (delnr === 6) {
      const b = await p.$('[data-iprov-fraga] [data-steg2-uppgift="spatial"][data-form="B"]')
      logg(`${enhet}: deltest 6 är pappersvikning med klipp, uppvikt`, !!b)
      await bild(p, `${enhet}-iprov-06-deltest6-fraga`, 'Deltest 6 pappersvikning med klipp: vikt ark, välj hur det ser ut uppvikt', true)
    }
    const antal = await p.$$eval('[data-segmentstapel] button', (b) => b.length)
    for (let i = 0; i < antal; i++) {
      const alt = await p.$$('[data-iprov-fraga] [data-steg2-alternativ] [role="radio"]')
      if (alt.length) await alt[i % alt.length].click()
      await vanta(400)
      if (delnr === 2 && i === 0) await bild(p, `${enhet}-iprov-04-deltest2-valt`, 'Deltest 2: ett alternativ valt')
    }
    if (!(await p.$('[data-iprov-avsluta-del]'))) {
      const seg = await p.$$('[data-segmentstapel] button')
      if (seg.length) await seg[seg.length - 1].click()
      await vanta(300)
    }
    await p.click('[data-iprov-avsluta-del]').catch(() => {})
    await vanta(500)
    const knappar = await p.$$('button')
    const dialogKnapp = (await Promise.all(knappar.map(async (b) => [b, await b.evaluate((e) => e.textContent?.trim() === 'Avsluta deltestet' && !e.hasAttribute('data-iprov-avsluta-del'))])))
      .filter(([, ok]) => ok)
      .map(([b]) => b)
      .pop()
    if (dialogKnapp) await dialogKnapp.click()
    await p.waitForSelector('[data-iprov-mellanblad], [data-iprov-resultat]', { timeout: 20000 }).catch(() => {})
    await vanta(900)
  }
  logg(`${enhet}: I-provets sex deltest genomförda`, delnr === 6, `${delnr} deltest`)
  await p.waitForSelector('[data-iprov-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(800)
  await bild(p, `${enhet}-iprov-07-resultat`, 'Resultatet: staplar per deltest')
  const res = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: resultatet har stapeln Pappersvikning`, /Pappersvikning/.test(res))
  await p.click('[data-iprov-ga-igenom]').catch(() => {})
  await vanta(800)
  await p.click('[data-iprov-genomga="2"]').catch(() => {})
  await vanta(1200)
  // Genomgången deltest för deltest: leta upp deltest 2 och dess första uppgift
  const harHop = await p.evaluate(() => {
    const g = [...document.querySelectorAll('[data-steg2-genomgang="spatial"]')]
    return g.some((x) => /Ihopvikt/.test(x.innerText) && /Arket/.test(x.innerText))
  })
  if (harHop) {
    await p.evaluate(() => {
      const g = [...document.querySelectorAll('[data-steg2-genomgang="spatial"]')].find((x) => /Ihopvikt/.test(x.innerText))
      g?.scrollIntoView({ block: 'start' })
    })
    await vanta(500)
    await bild(p, `${enhet}-iprov-08-genomgang-deltest2`, 'Genomgången av deltest 2: arket, vikningarna och det ihopvikta arket')
  } else await bild(p, `${enhet}-iprov-08-genomgang`, 'Genomgången')
  logg(`${enhet}: genomgången visar hopvikningen steg för steg`, harHop)
  const id = new URL(p.url()).pathname.split('/').pop()
  return id
}

async function spatialpass(p, enhet) {
  await p.goto(`${BAS}/dashboard/tester/pass?typ=steg2pass&kind=spatial`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-steg2-uppgift], [data-steg2pass-betalvagg]', { timeout: 30000 }).catch(() => {})
  await avvisaSamtycke(p)
  await vanta(600)
  const former = []
  let dBild = false
  for (let i = 0; i < 6; i++) {
    await p.waitForSelector('[data-steg2-alternativ] [role="radio"]:not([disabled])', { timeout: 15000 }).catch(() => {})
    const form = await p.$eval('[data-steg2-uppgift="spatial"]', (e) => e.getAttribute('data-form')).catch(() => '?')
    former.push(form)
    if (form === 'D' && !dBild) {
      await kollaFormD(p, 'body', enhet, `spatialpasset uppgift ${i + 1}`)
      await bild(p, `${enhet}-pass-01-pappersvikning`, `Spatialpasset, uppgift ${i + 1}: pappersvikning ihopvikt`, true)
    }
    const alt = await p.$$('[data-steg2-alternativ] [role="radio"]:not([disabled])')
    if (!alt.length) break
    await alt[(i + 1) % alt.length].click()
    await p.waitForSelector('[data-steg2-facit]', { timeout: 15000 }).catch(() => {})
    await vanta(500)
    if (form === 'D' && !dBild) {
      dBild = true
      const hop = await p.evaluate(() => /Ihopvikt/.test(document.querySelector('[data-steg2-genomgang="spatial"]')?.textContent ?? ''))
      logg(`${enhet}: spatialpassets genomgång visar hopvikningen`, hop)
      await bild(p, `${enhet}-pass-02-genomgang`, 'Spatialpasset: genomgången efter svaret, arket vikt steg för steg', true)
    }
    await p.click('[data-steg2pass-nasta]').catch(() => {})
    await vanta(800)
  }
  logg(`${enhet}: spatialpasset blandar in formen D (ordningen A, D, C, A, D, B)`, former.join('') === 'ADCADB', former.join(''))
  await p.waitForSelector('[data-steg2-resultat]', { timeout: 30000 }).catch(() => {})
  await vanta(700)
  await bild(p, `${enhet}-pass-03-resultat`, 'Spatialpasset klart: var du tappar')
  const t = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: spatialpassets resultat visar var du tappar`, /Var du tappar/i.test(t) || /6 av 6/.test(t))
}

async function inloggat(browser, enhet, vp, morkt) {
  const { ctx, p, fel } = await ny(browser, vp, morkt)
  const k = await skapaKonto(p, enhet)
  logg(`${enhet}: kontot skapat`, !!k.uid, k.epost)
  await gePremium(k.uid)
  await iprov(p, enhet)
  await spatialpass(p, enhet)
  logg(`${enhet}: inloggat utan konsolfel eller 4xx/5xx`, fel.length === 0, fel.slice(0, 4).join(' ; '))
  await ctx.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  const korningar = [
    ['p7-ljust', PIXEL7, false],
    ['p7-morkt', PIXEL7, true],
    ['d1280-ljust', DESKTOP, false],
    ['d1280-morkt', DESKTOP, true],
  ]
  for (const [enhet, vp, morkt] of korningar) {
    if (BARA.length && !BARA.includes(enhet)) continue
    for (const [namn, f] of [
      ['publikt', publikt],
      ['inloggat', inloggat],
    ]) {
      try {
        await f(browser, enhet, vp, morkt)
      } catch (e) {
        logg(`${enhet} ${namn}: avbröts`, false, String(e?.message ?? e).slice(0, 200))
      }
    }
  }
} finally {
  await browser.close()
}

const ok = resultat.filter((r) => r.ok).length
fs.writeFileSync(path.join(BILDER, 'klicktest.json'), JSON.stringify({ bas: BAS, tid: new Date().toISOString(), ok, totalt: resultat.length, resultat, bilder }, null, 2))
console.log(`\n${ok} av ${resultat.length} kontroller gröna`)
