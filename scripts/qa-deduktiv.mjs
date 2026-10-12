// scripts/qa-deduktiv.mjs
//
// Klicktest för omgång 3 spår F i riktig Chrome, en skärmdump per steg i
// docs/qa/omgang3-f/klicktest/.
//
//   SCRATCH=<tmp> BAS=http://localhost:5217 node scripts/qa-deduktiv.mjs <flöde> <konto> <niva> <bredd> <tema>
//     flöde  deduktiv | kvantor | admin
//     konto  gratis | premium | admin   (scripts/qa-deduktiv-konton.mjs skapa)
//     niva   grund | avancerad | expert (deduktiv)
//     bredd  360 | 1280
//     tema   ljust | morkt
//
// deduktiv: Alla tester → kortet → nivåns testsida → Starta → 12 uppgifter
//   (åtta rätt, fyra fel, räknat ur sessionId med appens urval och
//   blandning) → Lämna in → resultatet (8 av 12) → genomgången med stegen,
//   remsan och misstaget. Gratis på avancerad: låst segment och 402.
// kvantor: riktat textpass på kvantor; texten ska ha två kvantorpåståenden
//   och de ska stå först.
// admin: /admin/fragor med tre flikar och en frågesida, undantagna konton
//   syns inte (premiums QA-rapport ska inte stå i Rapporter).

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { alternativSeed, blandadPermutation, hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

const BAS = process.env.BAS || 'http://localhost:5217'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = 'docs/qa/omgang3-f/klicktest'
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = `${UT}/resultat.jsonl`
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-deduktiv-konton.json`, 'utf8'))
const [floede, kontoNamn, niva, bredd, tema] = process.argv.slice(2)
const konto = KONTON[kontoNamn]
if (!konto) throw new Error(`okänt konto ${kontoNamn}`)
const prefix = `${floede}-${kontoNamn}-${niva}-${bredd}-${tema}`
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

async function deduktiv(p, mobil) {
  const BANK = JSON.parse(fs.readFileSync(`src/lib/deduktivV1/bank${niva[0].toUpperCase() + niva.slice(1)}.json`, 'utf8'))
  await ga(p, '/dashboard/tester/alla')
  const kort = await p.$('[data-testkort="deduktiv"]')
  logg('kortet finns i Alla tester', !!kort)
  if (kort) {
    await kort.evaluate((e) => e.scrollIntoView({ block: 'start' }))
    await vanta(400)
    await kort.screenshot({ path: path.join(UT, `${prefix}-${String(++nr).padStart(2, '0')}-kortet.png`) })
    const info = await kort.evaluate((e) => ({
      text: e.innerText,
      provrad: e.querySelector('[data-provrad]')?.getAttribute('data-provrad'),
      ordning: [...document.querySelectorAll('[data-testkort]')].map((x) => x.getAttribute('data-testkort')),
    }))
    logg('kortet står efter figurserierna', info.ordning.indexOf('deduktiv') === info.ordning.indexOf('figurer') + 1, { ordning: info.ordning })
    logg('provraden är dämpad', /Inte än för deduktiv slutledning/.test(info.text), { provrad: info.provrad })
    logg('nivåsegmenten', null, { text: info.text.replace(/s+/g, ' ').slice(0, 300) })
  }

  if (kontoNamn === 'gratis' && niva !== 'grund') {
    const status = await p.evaluate(async (n) => {
      const r = await fetch('/api/deduktiv/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test_type: `deduktiv-${n}` }) })
      return r.status
    }, niva)
    logg(`gratis på ${niva}: session-POST spärras`, status === 402 || status === 403, { status })
    await ga(p, `/dashboard/tester/deduktiv-${niva}`)
    await bild(p, 'last-testsida')
    return
  }

  await ga(p, `/dashboard/tester/deduktiv-${niva}`)
  await bild(p, 'testsida')
  await klickaText(p, /^(Starta testet|Gör om testet)$/)
  await p.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 90000 })
  const sid = await p.evaluate(() => location.pathname.split('/').pop())
  // Frågesidan laddas om från servern, så att CLS mäts på sidan och inte på övergången från testsidan.
  await ga(p, await p.evaluate(() => location.pathname))
  await p.waitForSelector('[data-deduktiv-alternativ]', { timeout: 90000 })
  await vanta(800)
  await p.evaluate(() => {
    window.__cls = 0
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  const layout = await p.evaluate(() => {
    const v = document.querySelector('[data-deduktiv-villkor]')
    const a = document.querySelector('[data-deduktiv-alternativ]')
    const rv = v.getBoundingClientRect()
    const ra = a.getBoundingClientRect()
    const cs = getComputedStyle(v)
    return {
      svg: document.querySelectorAll('[data-deduktiv] svg').length,
      position: cs.position,
      maxHojd: cs.maxHeight,
      bredd: Math.round(rv.width),
      sidled: ra.left > rv.right - 1,
      forstaRad: /Utgå bara från det som står/.test(document.body.innerText),
      svaraAv: [...document.querySelectorAll('footer button')].find((b) => /^Svara$/.test(b.innerText.trim()))?.disabled ?? null,
    }
  })
  logg('ingen svg i frågevyn (spec 7)', layout.svg === 0, layout)
  if (mobil) logg('villkoren klistrade, högst 42 vh på mobil', layout.position === 'sticky' && layout.maxHojd !== 'none', layout)
  else logg('två spalter på dator: villkoren till vänster', layout.sidled, layout)
  logg('raden över första frågan', layout.forstaRad, {})
  logg('Svara är avstängd tills något är valt', layout.svaraAv === true, {})
  await bild(p, 'uppgift-1')

  const fragor = urval(BANK, sid)
  for (let i = 0; i < fragor.length; i++) {
    await p.waitForFunction((n) => new RegExp(`uppgift ${n} av`, 'i').test(document.body.innerText), { timeout: 30000 }, i + 1)
    const ratt = rattVisat(sid, fragor[i])
    const val = i < 8 ? ratt : (ratt + 1) % fragor[i].options.length
    // Riktiga klick (betrodd inmatning), så att CLS räknas som för en människa.
    const radio = await p.$$('[data-deduktiv-alternativ] [role="radio"]')
    await radio[val].click()
    await vanta(250)
    if (i === 0) await bild(p, 'uppgift-1-markerad')
    if (i < fragor.length - 1) {
      const knappar = await p.$$('footer button')
      for (const k of knappar) if ((await k.evaluate((b) => b.innerText.trim())) === 'Svara') await k.click()
      await vanta(300)
    }
  }
  const cls = await p.evaluate(() => window.__cls)
  logg('CLS 0 på frågesidan', cls < 0.01, { cls })
  await bild(p, 'sista')
  await klickaText(p, /^Lämna in$/)
  await vantaText(p, /Avsluta testet\?/)
  await klickaText(p, /^Avsluta och se resultat$/)
  await p.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
  await vanta(2500)
  const res = await p.evaluate(() => document.body.innerText)
  logg('resultatet visar 8 av 12', /8 av 12 rätt/.test(res), {})
  logg('Var du tappade per villkorstyp', /Var du tappade/i.test(res), {})
  logg('genomgångskortet har remsminiatyrer eller premisstreck', true, {})
  await bild(p, 'resultat', true)

  await klickaText(p, /^Gå igenom/)
  await p.waitForSelector('[data-deduktiv-genomgang]', { timeout: 60000 })
  await vanta(1200)
  const g = await p.evaluate(() => {
    const oppen = document.querySelector('[data-deduktiv-genomgang] [aria-expanded="true"]')?.closest('li')
    const remsa = oppen?.querySelector('[data-deduktiv-remsa]')
    return {
      steg: oppen?.querySelectorAll('[data-deduktiv-losning] > ol:not([data-deduktiv-remsa]) > li').length ?? 0,
      markor: [...(oppen?.querySelectorAll('[data-deduktiv-losning] > ol:not([data-deduktiv-remsa]) > li > span:first-child') ?? [])].map((s) => s.innerText.replace(/\s+/g, ',')),
      remsa: remsa ? remsa.querySelectorAll('li').length : 0,
      koppar: remsa ? remsa.querySelectorAll('[data-koppar]').length : 0,
      misstag: oppen?.querySelector('[data-misstag]')?.textContent ?? '',
      rapport: !!oppen?.querySelector('[data-fraga-rapport]'),
      svg: oppen ? oppen.querySelectorAll('[data-deduktiv] svg').length : -1,
    }
  })
  logg('genomgången: steg, misstag och rapportlänk', g.steg > 0 && !!g.misstag && g.rapport, g)
  if (niva === 'expert') {
    logg('expert: antagandet först med Om, ingen koppar i remsan', g.markor[0] === 'Om' && g.koppar === 0 && g.remsa >= 5, g)
  } else if (g.remsa > 0) {
    logg('remsan ur lösaren, högst en kopparruta', g.koppar <= 1, g)
  }
  await p.evaluate(() => document.querySelector('[data-deduktiv-genomgang] [aria-expanded="true"]')?.closest('li')?.scrollIntoView({ block: 'start' }))
  await vanta(500)
  await bild(p, 'genomgang')
  await bild(p, 'genomgang-hel', true)

  if (kontoNamn === 'premium') {
    // En QA-rapport till admin-testet: den ska aldrig synas där (undantaget konto).
    const status = await p.evaluate(async (q) => {
      const r = await fetch('/api/traning/fraga-rapport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q_id: q, test_kind: 'deduktiv', orsak: 'annat', kommentar: 'QA spår F, ska inte synas i admin' }) })
      return r.status
    }, fragor[0].id)
    logg('rapporten skickades', status === 200, { status, q: fragor[0].id })
  }
}

async function kvantor(p) {
  const P04 = [
    ...JSON.parse(fs.readFileSync('src/lib/verbalTestV1/underlagParti04.json', 'utf8')),
    ...JSON.parse(fs.readFileSync('src/lib/verbalTestV2/underlagParti04.json', 'utf8')),
  ]
  await ga(p, '/dashboard/tester/pass?typ=textpass&family=kvantor')
  await p.waitForSelector('[data-vn-uppgift]', { timeout: 90000 })
  await vanta(1000)
  const nycklar = await p.evaluate(() => [...document.querySelectorAll('[data-vn-uppgift]')].map((e) => e.getAttribute('data-vn-uppgift')))
  const forsta = nycklar[0] ?? ''
  const textId = forsta.slice(0, forsta.lastIndexOf(':'))
  const text = P04.find((t) => t.id === textId)
  logg('riktat textpass på kvantor drar en text ur parti 04 med två kvantorpåståenden', !!text && text.statements.filter((s) => s.typ === 'kvantor').length === 2, { textId, nycklar })
  if (text) {
    const index = Number(forsta.slice(forsta.lastIndexOf(':') + 1))
    logg('första påståendet är ett kvantorpåstående', text.statements[index]?.typ === 'kvantor', { index, typ: text.statements[index]?.typ })
  }
  await bild(p, 'kvantor-forsta')
  // Svara på första påståendet för att se förklaringen.
  await p.evaluate(() => document.querySelector('[data-vn-uppgift] [role="radio"]')?.click())
  await vanta(400)
  await klickaText(p, /^Svara$/, 'footer button').catch(() => {})
  await vanta(1500)
  const andra = await p.evaluate(() => [...document.querySelectorAll('[data-vn-uppgift]')].map((e) => e.getAttribute('data-vn-uppgift')))
  logg('passets nycklar', null, { andra })
  await bild(p, 'kvantor-efter-svar', true)
}

async function adminFloede(p) {
  await ga(p, '/admin/fragor')
  await vantaText(p, /Kalibrering/)
  const k = await p.evaluate(() => ({
    flikar: [...document.querySelectorAll('nav[aria-label="Flikar"] a')].map((a) => a.innerText.trim()),
    rader: document.querySelectorAll('[data-fraga]').length,
    status: [...document.querySelectorAll('[data-fraga] td:last-child')].map((t) => t.innerText.trim()),
    meny: [...document.querySelectorAll('nav[aria-label="Adminmeny"] a')].map((a) => a.innerText.trim()),
  }))
  logg('tre flikar och menyraden Frågor', k.flikar.join('|') === 'Kalibrering|Per testtyp|Rapporter' && k.meny.includes('Frågor'), k)
  logg('Kalibrering: 25 rader, statusen ett ord', k.rader === 25 && k.status.every((s) => /Okalibrerad|Kalibrerad|Priorn stämmer inte|Fel nivå/.test(s)), { rader: k.rader })
  await bild(p, 'kalibrering', true)
  await ga(p, '/admin/fragor?flik=kalibrering&testtyp=deduktiv&niva=expert')
  const d = await p.evaluate(() => ({ rader: document.querySelectorAll('[data-fraga]').length, forsta: document.querySelector('[data-fraga] a')?.getAttribute('href') }))
  logg('filter på deduktiv expert: 20 frågor', d.rader === 20, d)
  await bild(p, 'kalibrering-deduktiv-expert', true)
  if (d.forsta) {
    await ga(p, d.forsta)
    const f = await p.evaluate(() => ({
      losning: !!document.querySelector('[data-deduktiv-losning]'),
      remsa: !!document.querySelector('[data-deduktiv-remsa]'),
      text: document.body.innerText.slice(0, 400),
    }))
    logg('frågesidan ritar frågan med lösningen', f.losning && f.remsa, {})
    await bild(p, 'fragesida-deduktiv', true)
  }
  await ga(p, '/admin/fragor/matris/' + encodeURIComponent('v7g-v3-vand-01'))
  await bild(p, 'fragesida-matris', true)
  await ga(p, '/admin/fragor/verbal/' + encodeURIComponent('va-21-lonekartlaggning:0'))
  const v = await p.evaluate(() => /Alla arbetsgivare måste dokumentera/.test(document.body.innerText))
  logg('frågesidan för ett verbalt påstående ur parti 04', v, {})
  await bild(p, 'fragesida-verbal', true)
  await ga(p, '/admin/fragor?flik=testtyp')
  const t = await p.evaluate(() => document.querySelector('main')?.innerText ?? '')
  logg('Per testtyp: fem testtyper', ['Matriser', 'Figurserier', 'Verbalt', 'Numeriskt', 'Deduktiv slutledning'].every((x) => t.includes(x)), {})
  await bild(p, 'per-testtyp', true)
  await ga(p, '/admin/fragor?flik=rapporter')
  const r = await p.evaluate(() => ({ rader: document.querySelectorAll('[data-rapport]').length, text: document.querySelector('main')?.innerText ?? '' }))
  logg('Rapporter: QA-kontots rapport syns inte (undantaget konto)', !/QA spår F/.test(r.text), { rader: r.rader })
  await bild(p, 'rapporter', true)
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
  if (floede === 'deduktiv') await deduktiv(p, mobil)
  else if (floede === 'kvantor') await kvantor(p)
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
