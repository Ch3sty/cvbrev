// scripts/qa-avrund.mjs
//
// Klicktest för avrundningen av testerna (H1, 2026-10-12) i riktig Chrome,
// en skärmdump per steg i docs/qa/avrund-tester/.
//
//   SCRATCH=<tmp> BAS=http://localhost:5341 node scripts/qa-avrund.mjs <flöde> <konto> <bredd> <tema>
//     flöde  hem | deduktiv | verbal | admin
//     konto  gratis | premium | admin   (scripts/qa-avrund-konton.mjs skapa)
//     bredd  360 | 1280
//     tema   ljust | morkt
//
// hem: den riktiga hemvyn, sedan förhandsvisningen av 1c och 1g (kräver
//   TRANING_FORHANDSVISNING=1 på servern). På 360 ska länken Ändra datum
//   finnas under det lyfta kortet och kopparknappen sluta ovanför 620 px; på
//   1280 bär toppraden kontexten och statusradens länk är dold.
// deduktiv: grund, tolv uppgifter (åtta rätt), mätraden "Uppgift n / 12" med
//   aria-etikett, inget dubblerat nummer, Lämna in testet?, resultat och
//   genomgång med komma i utfallet.
// verbal: det klassiska verbala testet på grundnivå till slut; avslutet
//   (/api/verbalTestV1/complete) ska svara 200. Statistiken skickas i samma
//   anrop; för QA-konton returnerar databasfunktionen 0 med flit (kodvägen
//   är testad i underlagStatistik.pglite.test.ts).
// admin: /admin/fragor, en deduktiv och en verbal frågesida: lösningspanelen
//   och förklaringen har en bakgrund (inte transparent); Kalibrering filtrerat
//   på verbalt grund.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { alternativSeed, blandadPermutation, hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

const BAS = process.env.BAS || 'http://localhost:5341'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = 'docs/qa/avrund-tester'
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = `${UT}/resultat.jsonl`
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-avrund-konton.json`, 'utf8'))
const [floede, kontoNamn, bredd, tema] = process.argv.slice(2)
const konto = KONTON[kontoNamn]
if (!konto) throw new Error(`okänt konto ${kontoNamn}`)
const prefix = `${floede}-${kontoNamn}-${bredd}-${tema}`
let nr = 0
const fel = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(steg, ok, data = {}) {
  fs.appendFileSync(RESULTAT, JSON.stringify({ tid: new Date().toISOString(), floede: prefix, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 400)}`)
  if (ok === false) fel.push(steg)
}
async function bild(p, namn, hel = false) {
  nr += 1
  await p.screenshot({ path: path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`), fullPage: hel }).catch(() => {})
}
async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 180000 })
  await vanta(600)
}
async function klickaText(p, re, sel = 'button, a, [role="button"]') {
  const ok = await p.evaluate(
    (src, flags, sel) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll(sel)].find((e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.offsetParent !== null && !e.disabled)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    re.flags,
    sel
  )
  if (!ok) throw new Error(`hittade inte ${re}`)
  await vanta(500)
}
async function vantaText(p, re, timeout = 90000) {
  await p.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body.innerText), { timeout }, re.source, re.flags)
}
function urval(pool, sessionId, n = 12) {
  const s = [...pool]
  const rng = mulberry32(hashString(sessionId))
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n)
}
const rattVisat = (sessionId, q) => blandadPermutation(alternativSeed(sessionId, q.id), q.options.length).indexOf(q.correctAnswer)

async function loggaIn(p) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 90000 })
  await vanta(1200)
  await klickaText(p, /^Avvisa$/).catch(() => {})
}

/* --------------------------------- hemvyn --------------------------------- */

async function hem(p, mobil) {
  await ga(p, '/dashboard/tester')
  await vanta(1000)
  logg('riktiga hemvyn', null, { url: p.url().replace(BAS, ''), ram: await p.evaluate(() => document.querySelector('[data-ram]')?.getAttribute('data-ram') ?? null) })
  await bild(p, 'hemvyn')
  for (const ram of ['1c', '1g']) {
    await ga(p, `/dashboard/tester/forhandsvisning?tillstand=${ram}`)
    await p.waitForSelector('[data-ram]', { timeout: 60000 })
    await vanta(800)
    const m = await p.evaluate(() => {
      const syns = (e) => !!e && e.offsetParent !== null && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'
      const lankar = [...document.querySelectorAll('a[href*="/dashboard/tester/installningar"]')]
      const synliga = lankar.filter(syns).map((a) => ({ text: a.innerText.trim(), y: Math.round(a.getBoundingClientRect().top + scrollY) }))
      const knapp = [...document.querySelectorAll('a, button')].find((e) => syns(e) && /knapp-primar/.test(e.className) && !e.closest('[data-topprad]'))
      const r = knapp?.getBoundingClientRect()
      return {
        ram: document.querySelector('[data-ram]')?.getAttribute('data-ram'),
        synliga,
        knapp: knapp ? { text: knapp.innerText.trim(), botten: Math.round(r.bottom + scrollY) } : null,
      }
    })
    if (mobil) {
      const andra = m.synliga.find((l) => l.text === 'Ändra datum')
      logg(`${ram}: Ändra datum nås på mobil`, !!andra, m)
      // Länken står under kortet och kan inte flytta knappen. 1c-fixturens tre rader långa
      // titel lägger knappen under 620 px redan före ändringen; det loggas som mått.
      logg(`${ram}: kopparknappens nederkant (mål högst 620 px)`, ram === '1c' ? null : !!m.knapp && m.knapp.botten <= 620, m.knapp ?? {})
      if (andra && m.knapp) logg(`${ram}: länken står under kopparknappen`, andra.y > m.knapp.botten, {})
    } else {
      logg(`${ram}: på dator bär toppraden kontexten, statusradens länk är dold`, !m.synliga.some((l) => l.text === 'Ändra datum') && m.synliga.length >= 1, m)
    }
    await bild(p, `forhandsvisning-${ram}`)
    if (mobil) await bild(p, `forhandsvisning-${ram}-hel`, true)
  }
}

/* -------------------------------- deduktiv -------------------------------- */

async function deduktiv(p) {
  const BANK = JSON.parse(fs.readFileSync('src/lib/deduktivV1/bankGrund.json', 'utf8'))
  logg('grund har 30 uppgifter i banken', BANK.length === 30, { antal: BANK.length })
  await ga(p, '/dashboard/tester/deduktiv-grund')
  await bild(p, 'testsida')
  await klickaText(p, /^(Starta testet|Gör om testet)$/)
  await p.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 90000 })
  const sid = await p.evaluate(() => location.pathname.split('/').pop())
  await p.waitForSelector('[data-deduktiv-alternativ]', { timeout: 90000 })
  await vanta(800)
  const fragor = urval(BANK, sid)
  for (let i = 0; i < fragor.length; i++) {
    const matrad = await p.waitForFunction(
      (n) => {
        const el = [...document.querySelectorAll('p[aria-label]')].find((e) => /^Uppgift \d+ av \d+$/.test(e.getAttribute('aria-label')))
        return el && el.getAttribute('aria-label') === `Uppgift ${n} av 12` ? { aria: el.getAttribute('aria-label'), text: el.innerText.replace(/\s+/g, ' ').trim() } : null
      },
      { timeout: 30000 },
      i + 1
    ).then((h) => h.jsonValue())
    if (i === 0) {
      const dubbel = await p.evaluate(() => /Uppgift 1 av 12/.test(document.querySelector('main')?.innerText ?? document.body.innerText))
      logg('mätraden: Uppgift 1 / 12 med aria-etikett', matrad.text === 'Uppgift 1 / 12' && matrad.aria === 'Uppgift 1 av 12', matrad)
      logg('numret står inte dubbelt i uppgiftsytan', !dubbel, {})
      await bild(p, 'uppgift-1')
    }
    const ratt = rattVisat(sid, fragor[i])
    const val = i < 8 ? ratt : (ratt + 1) % fragor[i].options.length
    const radio = await p.$$('[data-deduktiv-alternativ] [role="radio"]')
    await radio[val].click()
    await vanta(250)
    if (i < fragor.length - 1) {
      const knappar = await p.$$('footer button')
      for (const k of knappar) if ((await k.evaluate((b) => b.innerText.trim())) === 'Svara') await k.click()
      await vanta(300)
    }
  }
  await klickaText(p, /^Lämna in$/)
  await vantaText(p, /Lämna in testet\?/)
  const dialog = await p.evaluate(() => document.querySelector('[role="dialog"], [role="alertdialog"]')?.innerText ?? '')
  logg('bekräftelsen: Lämna in testet? med talord', /Du har svarat på tolv av tolv uppgifter\. När du lämnar in rättas testet/.test(dialog) && /Lämna in och se resultatet/.test(dialog), { dialog: dialog.replace(/\s+/g, ' ') })
  await bild(p, 'bekraftelse')
  await klickaText(p, /^Lämna in och se resultatet$/)
  await p.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
  await vanta(2500)
  const res = await p.evaluate(() => document.body.innerText)
  logg('resultatet visar 8 av 12', /8 av 12 rätt/.test(res), {})
  await bild(p, 'resultat', true)
  await klickaText(p, /^Gå igenom/)
  await p.waitForSelector('[data-deduktiv-genomgang]', { timeout: 60000 })
  await vanta(1200)
  const g = await p.evaluate(() => {
    const t = document.querySelector('[data-deduktiv-genomgang]')?.innerText ?? ''
    const utfall = document.querySelector('[data-deduktiv-losning] p span:last-child')?.textContent ?? ''
    return { utfall, mittpunkt: /·/.test(t), hoppad: /Hoppad/.test(t) }
  })
  logg('genomgången: utfallet med komma, ingen mittpunkt', /^(Rätt|Inte den här), \d+:\d\d$/.test(g.utfall) && !g.mittpunkt && !g.hoppad, g)
  await bild(p, 'genomgang')
}

/* --------------------------------- verbalt -------------------------------- */

async function verbal(p) {
  const avslut = []
  p.on('response', (r) => {
    if (/\/api\/verbalTest[^/]*\/complete$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST') avslut.push(r.status())
  })
  await ga(p, '/dashboard/tester/verbal-resonemang')
  await bild(p, 'testsida')
  await klickaText(p, /^(Starta testet|Gör om testet)$/)
  await p.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 90000 })
  await p.waitForSelector('[role="radiogroup"]', { timeout: 90000 })
  await vanta(800)
  await bild(p, 'passage-1')
  for (let varv = 0; varv < 20; varv++) {
    const grupper = await p.$$('[role="radiogroup"]')
    for (const gr of grupper) {
      const r = await gr.$$('[role="radio"]')
      if (r.length) await r[0].click()
      await vanta(200)
    }
    await vanta(400)
    const sista = await p.evaluate(() => [...document.querySelectorAll('footer button, button')].some((b) => b.innerText.trim() === 'Lämna in' && b.offsetParent !== null && !b.disabled))
    const nasta = await p.evaluate(() => [...document.querySelectorAll('footer button')].some((b) => b.innerText.trim() === 'Nästa' && b.offsetParent !== null && !b.disabled))
    if (nasta) {
      await klickaText(p, /^Nästa$/, 'footer button')
      await vanta(600)
      continue
    }
    if (sista) break
  }
  await klickaText(p, /^Lämna in$/)
  await vanta(600)
  await bild(p, 'bekraftelse')
  await klickaText(p, /^(Avsluta och se resultat|Lämna in och se resultatet)$/)
  await p.waitForFunction(() => /\/results/.test(location.pathname), { timeout: 120000 })
  await vanta(2500)
  logg('avslutet svarade 200 (statistiken skickas i samma anrop)', avslut.includes(200), { avslut })
  await bild(p, 'resultat', true)
}

/* ---------------------------------- admin --------------------------------- */

async function adminFloede(p) {
  const bakgrund = (sel) =>
    p.evaluate((s) => {
      const el = document.querySelector(s)
      return el ? getComputedStyle(el).backgroundColor : null
    }, sel)
  const transparent = (c) => !c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)'
  await ga(p, '/admin/fragor?flik=kalibrering&testtyp=deduktiv&niva=grund')
  const d = await p.evaluate(() => ({ rader: document.querySelectorAll('[data-fraga]').length, forsta: document.querySelector('[data-fraga] a')?.getAttribute('href') }))
  logg('deduktiv grund i Kalibrering: 25 per sida', d.rader === 25, d)
  await bild(p, 'kalibrering-deduktiv-grund')
  await ga(p, '/admin/fragor/deduktiv/' + encodeURIComponent('dd-g-d2-07'))
  const c1 = await bakgrund('[data-deduktiv-losning]')
  logg('deduktiv frågesida: lösningspanelen har tonbakgrund', !transparent(c1), { bakgrund: c1 })
  await p.evaluate(() => document.querySelector('[data-deduktiv-losning]')?.scrollIntoView({ block: 'center' }))
  await vanta(400)
  await bild(p, 'fragesida-deduktiv-losning')
  await ga(p, '/admin/fragor/verbal/' + encodeURIComponent('va-21-lonekartlaggning:0'))
  const c2 = await bakgrund('[data-admin-fraga] .regelpanel')
  logg('verbal frågesida: förklaringen har tonbakgrund', !transparent(c2), { bakgrund: c2 })
  await bild(p, 'fragesida-verbal', true)
  await ga(p, '/admin/fragor?flik=kalibrering&testtyp=verbal&niva=grund')
  const v = await p.evaluate(() => document.querySelectorAll('[data-fraga]').length)
  logg('verbalt grund i Kalibrering', v > 0, { rader: v })
  await bild(p, 'kalibrering-verbal-grund')
  await ga(p, '/admin/fragor?flik=testtyp')
  await bild(p, 'per-testtyp', true)
}

let SIDA = null
async function main() {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const p = await browser.newPage()
  SIDA = p
  const mobil = bredd === '360'
  await p.setViewport(mobil ? { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 860, deviceScaleFactor: 1 })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'morkt' ? 'dark' : 'light' }])
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))
  await loggaIn(p)
  if (floede === 'hem') await hem(p, mobil)
  else if (floede === 'deduktiv') await deduktiv(p)
  else if (floede === 'verbal') await verbal(p)
  else if (floede === 'admin') await adminFloede(p)
  await browser.close()
}

main()
  .then(() => {
    logg('klart', fel.length === 0, { fel })
    process.exit(fel.length ? 1 : 0)
  })
  .catch(async (e) => {
    if (SIDA) await bild(SIDA, 'avbrutet', true)
    logg('avbrutet', false, { fel: String(e).slice(0, 500) })
    process.exit(1)
  })
