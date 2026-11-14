// scripts/qa-kampanj.mjs
//
// Klicktest för Black Week och Cyber Monday (lib/kampanj) i riktig Chrome,
// en skärmdump per steg i docs/qa/kampanj/ (gitignorerade QA-bilder läggs
// i SCRATCH, se feedback_arbetskopior_och_qa_bilder).
//
//   SCRATCH=<tmp> BAS=http://localhost:3471 node scripts/qa-kampanj.mjs <flöde> <bredd>
//     flöde  publikt | gratis | betalt | registrering | installningar
//     bredd  412 (Pixel 7) | 1280
//
// publikt: /priser och / utan inloggning, med besökarens klocka flyttad via
//   localStorage 'kampanj_nu' till före, Black Week, Cyber Monday och efter.
//   Sedan 2026-11-14 (H2) också /artiklar/talserier: provkortet och
//   sidokortet följer kampanjen, inga kampanjord i title, H1, FAQ eller schema.
// gratis/betalt: servern startas med KAMPANJ_NU. Raden i inloggat,
//   köpsteget, samtyckestexten och (gratis) hela vägen till Stripes testkassa.
//   Sist provsidan (ProvTypSida) efter ett talserieprov som hämtats till
//   kontot: kampanjpriset för gratis, ordinarie för en före detta kund.
//   Provets token och IP sparas i kontofilen och raderas med kontona.
// registrering: rutan för mejlvalet finns och är oikryssad.
// installningar: växeln för erbjudanden finns och sparar.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ENV = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => { const i = r.indexOf('='); return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
)
const admin = createClient(ENV.NEXT_PUBLIC_SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const BAS = process.env.BAS || 'http://localhost:3471'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = path.join(SCRATCH, 'qa-kampanj')
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = path.join(UT, 'resultat.jsonl')
const KONTON = fs.existsSync(`${SCRATCH}/qa-kampanj-konton.json`) ? JSON.parse(fs.readFileSync(`${SCRATCH}/qa-kampanj-konton.json`, 'utf8')) : {}
const [floede, bredd] = process.argv.slice(2)
const prefix = `${floede}-${bredd}${process.env.MORKT === '1' ? '-morkt' : ''}`
let nr = 0
const fel = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(steg, ok, data = {}) {
  fs.appendFileSync(RESULTAT, JSON.stringify({ tid: new Date().toISOString(), floede: prefix, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 300)}`)
  if (ok === false) fel.push(steg)
}
async function bild(p, namn, hel = false) {
  nr += 1
  await p.screenshot({ path: path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`), fullPage: hel }).catch(() => {})
}
async function ga(p, u, waitUntil = 'networkidle2') {
  await p.goto(BAS + u, { waitUntil, timeout: 180000 })
  await vanta(700)
}
async function avvisaKakor(p) {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^Avvisa$/.test(e.innerText.trim()) && e.offsetParent !== null)
    b?.click()
  })
  await vanta(300)
}
/** Synlig text i elementen som matchar selektorn. */
const synligText = (p, sel) =>
  p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || getComputedStyle(e).display !== 'none').map((e) => e.innerText.trim()).filter(Boolean), sel)

async function loggaIn(p, konto) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 90000 })
  await vanta(1200)
  await avvisaKakor(p)
}

const LAGEN = {
  fore: '2026-11-22T23:59:00+01:00',
  bw: '2026-11-23T10:00:00+01:00',
  cm: '2026-11-30T10:00:00+01:00',
  efter: '2026-12-01T00:01:00+01:00',
}

async function publikt(browser, mobil) {
  for (const [lage, nu] of Object.entries(LAGEN)) {
    const p = await nySida(browser, mobil)
    await p.evaluateOnNewDocument((nu) => {
      try { localStorage.setItem('kampanj_nu', nu) } catch {}
    }, nu)
    await ga(p, '/priser')
    await avvisaKakor(p)
    const attr = await p.evaluate(() => document.documentElement.getAttribute('data-kampanj'))
    const rad = await p.evaluate(() => [...document.querySelectorAll('.kampanj-rad')].filter((e) => e.offsetParent !== null).map((e) => e.innerText.replace(/\s+/g, ' ').trim()))
    const pris = await p.evaluate(() => document.querySelector('.pub-pris')?.innerText.replace(/\s+/g, ' ').trim())
    const knapp = await p.evaluate(() => document.querySelector('[data-primar]')?.innerText.replace(/\s+/g, ' ').trim())
    const vantat = { fore: [null, 0, '149 kr'], bw: ['black-week-2026', 1, '99 kr'], cm: ['cyber-monday-2026', 1, '49 kr'], efter: [null, 0, '149 kr'] }[lage]
    logg(`${lage}: data-kampanj`, attr === vantat[0], { attr })
    logg(`${lage}: raden`, rad.length === vantat[1], { rad })
    logg(`${lage}: priset`, !!pris && pris.startsWith(vantat[2]), { pris })
    logg(`${lage}: knappen`, !!knapp && (lage === 'bw' ? knapp.includes('99 kr') : lage === 'cm' ? knapp.includes('49 kr') : knapp.includes('149 kr')), { knapp })
    await bild(p, `priser-${lage}`)
    if (lage === 'bw' || lage === 'cm') {
      await ga(p, '/')
      await avvisaKakor(p)
      await bild(p, `start-${lage}`)
    }
    // CLS: raden ska finnas från första målningen, inget skift.
    const cls = await p.evaluate(
      () =>
        new Promise((res) => {
          let v = 0
          new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) v += e.value })).observe({ type: 'layout-shift', buffered: true })
          setTimeout(() => res(v), 800)
        })
    )
    logg(`${lage}: CLS`, cls < 0.01, { cls })
    await artikel(p, lage)
    await p.close()
  }
}

/** Väntade prisord per läge, för provkorten och sidokortet (H2, 2026-11-14). */
const PRISORD = { fore: null, bw: '99 kr första månaden', cm: '49 kr första månaden', efter: null }

/**
 * Artikeln med provkort (TypProvKort) och sidokort: prisraden följer
 * kampanjen, och kampanjen står aldrig i title, H1, snabbsvar, FAQ eller
 * schema. Samma CDN-cachade HTML i alla lägen, variant väljs i <head>.
 */
async function artikel(p, lage) {
  // Artikeln har filmen och prov på sidan; nätet blir aldrig helt stilla.
  await ga(p, '/artiklar/talserier', 'load')
  await vanta(1500)
  await avvisaKakor(p)
  const kort = await p.evaluate(() =>
    [...document.querySelectorAll('aside.ib-prova .pub-liten')].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)
  )
  const sido = await p.evaluate(() =>
    [...document.querySelectorAll('.ib-black .ib-pris-l')].filter((e) => e.offsetParent !== null).map((e) => e.innerText.replace(/\s+/g, ' ').trim())
  )
  const ord = PRISORD[lage]
  const kortOk = kort.length > 0 && kort.every((t) => (ord ? t.includes(ord) && t.includes('sedan 149 kr i månaden') : t.includes('149 kr i månaden') && !t.includes('första månaden')))
  logg(`${lage}: artikelns provkort följer kampanjen`, kortOk, { kort })
  // Sidokortet syns bara från 1024 px; på mobil räknas det inte.
  if (sido.length) {
    const sidoOk = sido.every((t) => (ord ? t.startsWith(ord.split(' ')[0] + ' kr') && t.includes('149 kr') : t.startsWith('149 kr') && !t.includes('första månaden')))
    logg(`${lage}: artikelns sidokort följer kampanjen`, sidoOk, { sido })
  } else logg(`${lage}: sidokortet syns inte i den här bredden`, null, {})
  const seo = await p.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.innerText ?? '',
    desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' '),
    faq: [...document.querySelectorAll('details, [data-faq], .faq')].map((e) => e.textContent).join(' '),
  }))
  const kampanjord = /Black Week|Cyber Monday|99 kr|49 kr|första månaden|rabatt/i
  const smutsigt = Object.entries(seo).filter(([, v]) => kampanjord.test(v)).map(([k]) => k)
  logg(`${lage}: inga kampanjord i title, H1, description, FAQ eller schema`, smutsigt.length === 0, { smutsigt })
  await p.evaluate(() => document.querySelector('aside.ib-prova')?.scrollIntoView({ block: 'center' }))
  await vanta(300)
  await bild(p, `artikel-${lage}`)

  // I-provsidan har priset i löptexten (<PremiumPris />) direkt under
  // provkortet (säljgranskningen 14 nov): under kampanjen får ingen synlig
  // text säga "149 kr i månaden" utan "sedan" före, alltså ett pris per sida.
  await ga(p, '/artiklar/i-prov', 'load')
  await vanta(1500)
  const tvaPriser = await p.evaluate(() => {
    // Artikelns innehåll, utan headerns paketmeny (ramen, egen omgång efter kampanjen).
    const main = document.querySelector('main')
    const ram = main ? [...main.querySelectorAll('header, nav')].map((e) => e.innerText).join(' ') : ''
    const t = (main?.innerText ?? '').replace(ram, '').replace(/\s+/g, ' ')
    const traffar = [...t.matchAll(/(.{0,12})149 kr i månaden/g)].map((m) => m[1])
    return { antal: traffar.length, utanSedan: traffar.filter((f) => !/sedan\s*$/.test(f)).length }
  })
  logg(`${lage}: i-prov har ett pris per sida`, ord ? tvaPriser.utanSedan === 0 && tvaPriser.antal > 0 : tvaPriser.antal > 0, tvaPriser)
}

/**
 * Provsidan i inloggat (ProvTypSida): ett talserieprov utan konto, hämtat
 * till kontot. Fejkad x-forwarded-for i TEST-NET-3 så att IP-gränsen inte
 * delas med någon annan; token och IP sparas och raderas per nyckel.
 */
async function provsida(p, kontoNamn) {
  const ip = `203.0.113.${Math.floor(Math.random() * 250) + 2}`
  const start = await p.evaluate(async (ip) => {
    const r = await fetch('/api/public/test-session', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify({ typ: 'talserie' }) })
    const j = await r.json()
    return { status: r.status, token: j.token ?? null, fel: j.error }
  }, ip)
  const fil = `${SCRATCH}/qa-kampanj-konton.json`
  const k = JSON.parse(fs.readFileSync(fil, 'utf8'))
  k.prov = [...(k.prov ?? []), { token: start.token, ip, konto: kontoNamn }]
  fs.writeFileSync(fil, JSON.stringify(k, null, 2))
  // Svaren sätts tomma direkt i raden: ett besvarat prov skriver en rad i
  // prov_utfall som saknar nyckel och inte går att radera per id.
  if (start.token) await admin.from('anon_test_sessions').update({ answers: [] }).eq('token', start.token)
  const svar = start.token
    ? await p.evaluate(async (token) => {
        const c = await fetch('/api/public/test-session/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
        const cj = await c.json()
        return { status: c.status, token, redirect: cj.redirect }
      }, start.token)
    : start
  if (!svar.redirect) {
    logg('provsidan: provet hämtades', false, svar)
    return
  }
  await ga(p, svar.redirect)
  const text = await p.evaluate(() => document.querySelector('[data-prov-typ]')?.innerText.replace(/\s+/g, ' ') ?? '')
  const ok = kontoNamn === 'gratis'
    ? text.includes('Premium, 99 kr första månaden, sedan 149 kr i månaden')
    : text.includes('Premium, 149 kr i månaden') && !text.includes('första månaden')
  logg('provsidan visar rätt pris', ok, { url: svar.redirect, utdrag: text.slice(text.indexOf('Nästa steg'), text.indexOf('Nästa steg') + 220) })
  await bild(p, 'provsida')
}

async function inloggat(browser, mobil, kontoNamn) {
  const konto = KONTON[kontoNamn]
  if (!konto) throw new Error(`konto ${kontoNamn} saknas, kör qa-kampanj-konton.mjs skapa`)
  const p = await nySida(browser, mobil)
  await loggaIn(p, konto)
  await ga(p, '/dashboard')
  const rad = await p.evaluate(() => document.body.innerText.includes('Nej tack'))
  logg('raden i inloggat', kontoNamn === 'gratis' ? rad : !rad, { rad })
  await bild(p, 'hemvy')

  await ga(p, '/dashboard/valj-spar?paket=all_month&steg=kop&plats=kampanjrad')
  const text = await p.evaluate(() => document.body.innerText)
  const harKampanj = text.includes('99 kr första månaden') && text.includes('Till betalning, 99 kr')
  logg('köpsteget visar rätt pris', kontoNamn === 'gratis' ? harKampanj : text.includes('Till betalning, 149 kr') && !harKampanj, {})
  const samtycke = await p.evaluate(() => document.querySelector('input[type="checkbox"]')?.closest('label')?.innerText)
  logg('samtycket', kontoNamn === 'gratis' ? /99 kr dras i dag, sedan 149 kr/.test(samtycke ?? '') : /149 kr dras varje månad/.test(samtycke ?? ''), { samtycke })
  await bild(p, 'kopsteg', true)

  if (kontoNamn === 'gratis') {
    // Fel kampanj från klienten ska ge 409 prisAndrat, aldrig en kassa.
    const svar = await p.evaluate(async () => {
      const r = await fetch('/api/stripe/create-plan-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'all_month', consent: true, kampanj: null, source: 'qa' }) })
      return { status: r.status, json: await r.json() }
    })
    logg('fel pris ger 409 prisAndrat', svar.status === 409 && svar.json.prisAndrat === true && svar.json.kampanj?.nyckel === 'black-week-2026', { status: svar.status, fel: svar.json.error })

    await p.click('input[type="checkbox"]')
    await vanta(300)
    await Promise.all([
      p.waitForFunction(() => location.host.includes('stripe.com'), { timeout: 60000 }).catch(() => {}),
      p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Till betalning/.test(b.innerText))?.click()),
    ])
    await vanta(4000)
    const stripeText = await p.evaluate(() => document.body.innerText)
    logg('Stripes kassa visar 99 kr att betala', /99,00|99 kr|SEK 99|99,00 kr/.test(stripeText) && /Black Week/i.test(stripeText), { url: p.url().slice(0, 60) })
    await bild(p, 'stripe-kassa')
    await ga(p, '/dashboard')
  }
  await provsida(p, kontoNamn)
  await p.close()
}

async function registrering(browser, mobil) {
  const p = await nySida(browser, mobil)
  await ga(p, '/register')
  await avvisaKakor(p)
  const ruta = await p.evaluate(() => {
    const l = [...document.querySelectorAll('label')].find((e) => /Mejla mig erbjudanden/.test(e.innerText))
    return l ? { text: l.innerText.trim(), ikryssad: l.querySelector('input')?.checked } : null
  })
  logg('rutan för mejlvalet finns och är oikryssad', !!ruta && ruta.ikryssad === false, ruta ?? {})
  await bild(p, 'registrering', true)
  await p.close()
}

async function installningar(browser, mobil) {
  const p = await nySida(browser, mobil)
  await loggaIn(p, KONTON.gratis)
  await ga(p, '/dashboard/installningar')
  const finns = await p.evaluate(() => document.body.innerText.includes('Erbjudanden och tips på mejl'))
  logg('växeln finns', finns)
  const fore = await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.getAttribute('aria-checked'))
  await p.click('[aria-label="Ta emot erbjudanden och tips"]')
  await vanta(1500)
  const efter = await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.getAttribute('aria-checked'))
  logg('växeln byter läge', fore !== efter, { fore, efter })
  await bild(p, 'installningar')
  await p.close()
}

async function nySida(browser, mobil) {
  const p = await browser.newPage()
  await p.setViewport(mobil ? { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true } : { width: 1280, height: 860, deviceScaleFactor: 1 })
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))
  // MORKT=1 ger mörkt läge. PostHog stängs alltid av, så att klicktestet
  // aldrig hamnar i produktionens mätning.
  if (process.env.MORKT === '1') await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
  await p.setRequestInterception(true)
  p.on('request', (r) => (/posthog\.com|\/ingest\//.test(r.url()) ? r.abort() : r.continue()))
  return p
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const mobil = bredd === '412'
try {
  if (floede === 'publikt') await publikt(browser, mobil)
  else if (floede === 'gratis' || floede === 'betalt') await inloggat(browser, mobil, floede)
  else if (floede === 'registrering') await registrering(browser, mobil)
  else if (floede === 'installningar') await installningar(browser, mobil)
  else throw new Error('okänt flöde')
} finally {
  await browser.close()
}
console.log(fel.length ? `\n${fel.length} FEL: ${fel.join(', ')}` : '\nAllt OK')
process.exit(fel.length ? 1 : 0)
