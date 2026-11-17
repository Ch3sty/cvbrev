// scripts/qa-kampanj.mjs
//
// Klicktest för Black Week och Cyber Monday (lib/kampanj) i riktig Chrome,
// en skärmdump per steg i docs/qa/kampanj/ (gitignorerade QA-bilder läggs
// i SCRATCH, se feedback_arbetskopior_och_qa_bilder).
//
//   SCRATCH=<tmp> BAS=http://localhost:3471 node scripts/qa-kampanj.mjs <flöde> <bredd>
//     flöde  publikt | gratis | betalt | registrering | installningar | ytor-publikt | ytor-gratis | ytor-betalt
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
//
// 2026-11-17, ytorna som ändrats sedan 13 nov (fix/kampanj-qa):
// ytor-publikt: utloggat i fyra klockor (localStorage): slutrutan på
//   /verktyg/skapa-cv, Premium-raden på /cv-mallar/word, /foto, /enkla,
//   premiumknappen och kontoarket på /cv-mallar och /cv-mallar/prova, och
//   inga kampanjord i title, H1, description, FAQ eller schema.
// ytor-gratis / ytor-betalt: byggaren (premiummall, betalväggen,
//   Jobbcoachens kvotvägg) och CV-mallarna (premiummall, Word,
//   merförsäljningen). Konton med CV ur qa-kampanj-konton.mjs.
// LAGE=fore|bw|cm|efter säger vilken klocka servern startats med
//   (KAMPANJ_NU) för de inloggade flödena; standard bw. Kontrollerna
//   väntar sig kampanjpriset bara för gratis under bw och cm.

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
const prefix = `${floede}-${bredd}${process.env.LAGE ? '-' + process.env.LAGE : ''}${process.env.MORKT === '1' ? '-morkt' : ''}`
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
async function ga(p, u, waitUntil = process.env.VANTA || 'networkidle2') {
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

/** Serverns klocka (KAMPANJ_NU) för de inloggade flödena: fore | bw | cm | efter. */
const LAGE = process.env.LAGE || 'bw'
const NYCKEL = { bw: 'black-week-2026', cm: 'cyber-monday-2026' }
const KAMPANJPRIS = { bw: 99, cm: 49 }
/** Kampanjpriset kontot ska se i inloggat just nu, annars null (före detta kund eller ingen kampanj). */
const kampanjPris = (kontoNamn) => (kontoNamn === 'gratis' ? KAMPANJPRIS[LAGE] ?? null : null)

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
  // \b: "149 kr" ska inte räknas som "49 kr".
  const kampanjord = /Black Week|Cyber Monday|\b99 kr|\b49 kr|första månaden|rabatt/i
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
  const kp = kampanjPris(kontoNamn)
  const ok = kp
    ? text.includes(`Premium, ${kp} kr första månaden, sedan 149 kr i månaden`)
    : text.includes('Premium, 149 kr i månaden') && !text.includes('första månaden')
  logg('provsidan visar rätt pris', ok, { url: svar.redirect, utdrag: text.slice(text.indexOf('Nästa steg'), text.indexOf('Nästa steg') + 220) })
  await bild(p, 'provsida')
}

async function inloggat(browser, mobil, kontoNamn) {
  const konto = KONTON[kontoNamn]
  if (!konto) throw new Error(`konto ${kontoNamn} saknas, kör qa-kampanj-konton.mjs skapa`)
  const kp = kampanjPris(kontoNamn)
  const p = await nySida(browser, mobil)
  await loggaIn(p, konto)
  await ga(p, '/dashboard')
  const rad = await p.evaluate(() => document.body.innerText.includes('Nej tack'))
  logg('raden i inloggat', kp ? rad : !rad, { rad })
  await bild(p, 'hemvy')

  await ga(p, '/dashboard/valj-spar?paket=all_month&steg=kop&plats=kampanjrad')
  const text = await p.evaluate(() => document.body.innerText)
  const forstaManaden = /\d+ kr första månaden/.test(text)
  logg(
    'köpsteget visar rätt pris',
    kp ? text.includes(`${kp} kr första månaden`) && text.includes(`Till betalning, ${kp} kr`) : text.includes('Till betalning, 149 kr') && !forstaManaden,
    {}
  )
  const samtycke = await p.evaluate(() => document.querySelector('input[type="checkbox"]')?.closest('label')?.innerText)
  logg('samtycket', kp ? new RegExp(`${kp} kr dras i dag, sedan 149 kr`).test(samtycke ?? '') : /149 kr dras varje månad/.test(samtycke ?? ''), { samtycke })
  await bild(p, 'kopsteg', true)

  if (kontoNamn === 'gratis') {
    // Fel kampanj från klienten ska ge 409 prisAndrat, aldrig en kassa.
    const fel = kp ? null : 'black-week-2026'
    const svar = await p.evaluate(async (fel) => {
      const r = await fetch('/api/stripe/create-plan-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'all_month', consent: true, kampanj: fel, source: 'qa' }) })
      return { status: r.status, json: await r.json() }
    }, fel)
    logg('fel pris ger 409 prisAndrat', svar.status === 409 && svar.json.prisAndrat === true && (svar.json.kampanj?.nyckel ?? null) === (NYCKEL[LAGE] ?? null), { status: svar.status, fel: svar.json.error })

    await p.click('input[type="checkbox"]')
    await vanta(300)
    await Promise.all([
      p.waitForFunction(() => location.host.includes('stripe.com'), { timeout: 60000 }).catch(() => {}),
      p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Till betalning/.test(b.innerText))?.click()),
    ])
    await vanta(4000)
    const stripeText = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
    // Kassan är facit. På mobil ligger kupongens namn under "Visa mer info",
    // så beloppet och "Därefter 149,00 kr" räcker där.
    const belopp = kp ?? 149
    const kassaOk = kp
      ? new RegExp(`${belopp},00 kr`).test(stripeText) && (/Black Week|Cyber Monday/i.test(stripeText) || /Därefter 149,00 kr/.test(stripeText))
      : /149,00 kr/.test(stripeText) && !/Därefter/.test(stripeText)
    logg(`Stripes kassa visar ${belopp} kr att betala`, kassaOk, { url: p.url().slice(0, 60), utdrag: (stripeText.match(/Abonnera[^]{0,120}/) ?? [''])[0] })
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
  // På mobil kan växeln hamna under bottennavet; mitt i bild först.
  await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.scrollIntoView({ block: 'center' }))
  await vanta(300)
  await p.click('[aria-label="Ta emot erbjudanden och tips"]')
  await vanta(1500)
  const efter = await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.getAttribute('aria-checked'))
  logg('växeln byter läge', fore !== efter, { fore, efter })
  await bild(p, 'installningar')
  await p.close()
}


/* -------------------------------------------- ytorna sedan 13 november */

/**
 * Priset i den synliga texten, utan kampanjraderna (de prövas för sig).
 * Returnerar texterna med "kr" i, så att loggen visar vad som stod.
 */
async function prisTexter(p) {
  return p.evaluate(() => {
    const ut = []
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (tw.nextNode()) {
      const n = tw.currentNode
      if (!/\bkr\b/.test(n.textContent)) continue
      const el = n.parentElement
      if (!el || el.closest('.kampanj-rad, a[href*="kampanjrad"], script, style, [aria-hidden="true"]')) continue
      if (el.getClientRects().length === 0 || getComputedStyle(el).visibility === 'hidden') continue
      const blk = el.closest('p, li, button, a, h1, h2, h3, h4, label') ?? el
      ut.push(blk.innerText.replace(/\s+/g, ' ').trim())
    }
    return [...new Set(ut)].filter(Boolean)
  })
}

/** Stämmer texterna med väntat kampanjpris (tal) eller ordinarie (null)? */
function prisStammer(texter, kp) {
  const t = texter.join(' | ').toLowerCase()
  const forsta = [...t.matchAll(/(\d+) kr första månaden/g)].map((m) => Number(m[1]))
  if (kp) return forsta.length > 0 && forsta.every((x) => x === kp)
  return forsta.length === 0 && /149 kr/.test(t)
}

/** Inga kampanjord i title, H1, description, FAQ eller schema (CDN-cache ett dygn). */
async function seoRen(p, lage, sida) {
  const seo = await p.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.innerText ?? '',
    desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' '),
    faq: [...document.querySelectorAll('details, [data-faq], .faq')].map((e) => e.textContent).join(' '),
  }))
  const kampanjord = /Black Week|Cyber Monday|99 kr|49 kr|första månaden|rabatt/i
  const smutsigt = Object.entries(seo).filter(([, v]) => kampanjord.test(v)).map(([k]) => k)
  logg(`${lage}: ${sida} inga kampanjord i title, H1, description, FAQ eller schema`, smutsigt.length === 0, { smutsigt })
}

async function klickaRe(p, src, sel = 'button, a, [role="radio"]') {
  return p.evaluate(
    (src, sel) => {
      const r = new RegExp(src, 'i')
      const el = [...document.querySelectorAll(sel)].find(
        (e) => e.getClientRects().length > 0 && !e.disabled && r.test((e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
      )
      if (!el) return null
      el.scrollIntoView({ block: 'center' })
      el.click()
      return (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()
    },
    src,
    sel
  )
}

/** Dialogens (kontoark, betalvägg, merförsäljning) synliga text, annars null. */
const dialogText = (p) =>
  p.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]')].filter((e) => e.getClientRects().length > 0)
    return d.length ? d.map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ') : null
  })

/** Knapparna med "Ladda ner" och ett pris. */
const prisKnappar = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((e) => e.getClientRects().length > 0 && /ladda ner/i.test(e.innerText) && /\bkr\b/i.test(e.innerText))
      .map((e) => e.innerText.replace(/\s+/g, ' ').trim())
  )

/** Väntat pris per läge för publika sidor (besökarens klocka). */
const PUBLIKT_KP = { fore: null, bw: 99, cm: 49, efter: null }

async function ytorPublikt(browser, mobil) {
  for (const [lage, nu] of Object.entries(LAGEN)) {
    const kp = PUBLIKT_KP[lage]
    const p = await nySida(browser, mobil)
    await p.evaluateOnNewDocument((nu) => {
      try { localStorage.setItem('kampanj_nu', nu) } catch {}
    }, nu)

    // Verktygssidan: slutrutan på bläck (VerktygsMall, eyebrow med priset).
    await ga(p, '/verktyg/skapa-cv')
    await avvisaKakor(p)
    const kick = await p.evaluate(() =>
      [...document.querySelectorAll('.pub-kick')]
        .filter((e) => e.getClientRects().length > 0 && /\bkr\b/i.test(e.innerText))
        .map((e) => e.innerText.replace(/\s+/g, ' ').trim())
    )
    logg(`${lage}: /verktyg/skapa-cv slutrutan följer kampanjen`, kick.length === 1 && prisStammer(kick, kp), { kick })
    await p.evaluate(() => [...document.querySelectorAll('.pub-kick')].find((e) => /\bkr\b/i.test(e.innerText) && e.getClientRects().length > 0)?.scrollIntoView({ block: 'center' }))
    await vanta(300)
    await bild(p, `skapa-cv-slut-${lage}`)
    await seoRen(p, lage, '/verktyg/skapa-cv')

    // Stilsidorna: Premium-raden under galleriet.
    for (const stil of ['word', 'foto', 'enkla']) {
      await ga(p, `/cv-mallar/${stil}`)
      const rad = await p.evaluate(() =>
        [...document.querySelectorAll('p')]
          .filter((e) => e.getClientRects().length > 0 && /ingår i/.test(e.innerText) && /Säg upp när du vill/.test(e.innerText) && /\bkr\b/i.test(e.innerText))
          .map((e) => e.innerText.replace(/\s+/g, ' ').trim())
      )
      logg(`${lage}: /cv-mallar/${stil} Premium-raden följer kampanjen`, rad.length === 1 && prisStammer(rad, kp), { rad })
      await seoRen(p, lage, `/cv-mallar/${stil}`)
      if (stil === 'word') {
        await p.evaluate(() => [...document.querySelectorAll('p')].find((e) => /Säg upp när du vill/.test(e.innerText) && /ingår i/.test(e.innerText) && e.getClientRects().length > 0)?.scrollIntoView({ block: 'center' }))
        await vanta(300)
        await bild(p, `stil-word-${lage}`)
      }
    }

    // Mallsidan och provsidan utloggad: premiumknappen och kontoarket.
    for (const sida of ['/cv-mallar', '/cv-mallar/prova']) {
      const namnet = sida.endsWith('prova') ? 'prova' : 'mallar'
      await ga(p, sida)
      const falt = await p.$('input[placeholder="Ditt namn"]')
      if (falt) {
        await falt.type('Erik Lindberg', { delay: 5 })
        await vanta(1500)
      }
      const mall = await klickaRe(p, 'Premium$', 'button')
      await vanta(1500)
      const knapp = await prisKnappar(p)
      logg(`${lage}: ${sida} premiumknappen följer kampanjen`, knapp.length > 0 && prisStammer(knapp, kp), { mall, knapp })
      await bild(p, `${namnet}-knapp-${lage}`)
      const klick = await klickaRe(p, '^Ladda ner (PDF|Word) i ', 'button')
      await vanta(1500)
      const ark = await dialogText(p)
      logg(`${lage}: ${sida} kontoarket följer kampanjen`, !!ark && prisStammer([ark], kp), { klick, ark: ark?.slice(0, 300) })
      await bild(p, `${namnet}-kontoark-${lage}`)
    }
    await p.close()
  }
}

async function ytorInloggat(browser, mobil, kontoNamn) {
  const konto = KONTON[kontoNamn]
  if (!konto?.cvId) throw new Error(`konto ${kontoNamn} saknar cvId, kör qa-kampanj-konton.mjs skapa`)
  const kp = kampanjPris(kontoNamn)
  const p = await nySida(browser, mobil)
  await loggaIn(p, konto)

  // Byggaren: premiummallen förvald, knappen och betalväggen.
  await ga(p, `/dashboard/skapa-cv?cv=${konto.cvId}&mall=koppar`)
  await vanta(1500)
  const knappB = await prisKnappar(p)
  logg('skapa-cv: premiumknappen följer kampanjen', knappB.length > 0 && prisStammer(knappB, kp), { knappB })
  await bild(p, 'skapa-cv-knapp')
  const klickB = await klickaRe(p, '^(Spara och )?ladda ner (PDF|Word) i ', 'button')
  await vanta(2000)
  const vaggB = (await dialogText(p)) ?? (await prisTexter(p)).join(' | ')
  logg('skapa-cv: betalväggen för premiummallen följer kampanjen', prisStammer([vaggB], kp), { klickB, vagg: vaggB.slice(0, 300) })
  await bild(p, 'skapa-cv-betalvagg')

  // Byggaren: Jobbcoachens kvotvägg (tre gratisförslag förbrukade i skapa).
  await ga(p, `/dashboard/skapa-cv?cv=${konto.cvId}&ark=erfarenhet:0`)
  await p.waitForSelector('[data-coach-knapp]', { visible: true, timeout: 20000 }).catch(() => null)
  await p.click('[data-coach-knapp]').catch(() => {})
  await p.waitForFunction(() => document.body.innerText.includes('Låt Jobbcoachen skriva resten av ditt CV'), { timeout: 15000 }).catch(() => null)
  const kvot = await p.evaluate(() => {
    const h = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /Låt Jobbcoachen skriva resten av ditt CV/.test(e.textContent))
    let kort = h
    for (let i = 0; i < 8 && kort && !/\bkr\b/i.test(kort.innerText); i++) kort = kort.parentElement
    return kort ? kort.innerText.replace(/\s+/g, ' ').trim() : null
  })
  logg('skapa-cv: Jobbcoachens kvotvägg följer kampanjen', !!kvot && prisStammer([kvot], kp), { kvot: kvot?.slice(0, 300) })
  await p.evaluate(() => [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /Låt Jobbcoachen skriva resten/.test(e.textContent))?.scrollIntoView({ block: 'center' }))
  await vanta(300)
  await bild(p, 'skapa-cv-kvotvagg')

  // CV-mallarna: premiummall, Word i premiummall och merförsäljningen.
  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}&mall=koppar`)
  await vanta(1500)
  const knappM = await prisKnappar(p)
  logg('cv-mallar: premiumknappen följer kampanjen', knappM.length > 0 && prisStammer(knappM, kp), { knappM })
  const klickM = await klickaRe(p, '^(Spara och )?ladda ner (PDF|Word) i ', 'button')
  await vanta(2000)
  const vaggM = (await dialogText(p)) ?? (await prisTexter(p)).join(' | ')
  logg('cv-mallar: betalväggen för premiummallen följer kampanjen', prisStammer([vaggM], kp), { klickM, vagg: vaggM.slice(0, 300) })
  await bild(p, 'cv-mallar-betalvagg')

  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}&mall=koppar`)
  await vanta(1500)
  const word = await klickaRe(p, 'Word$', '[role="radio"]')
  // Valet Word i en premiummall öppnar betalväggen direkt (onFormat).
  await vanta(1500)
  let klickW = 'valet Word'
  if (!(await dialogText(p))) {
    klickW = await klickaRe(p, '^(Spara och )?ladda ner Word i ', 'button')
    await vanta(2000)
  }
  const vaggW = (await dialogText(p)) ?? (await prisTexter(p)).join(' | ')
  logg('cv-mallar: betalväggen för Word följer kampanjen', /Word/i.test(vaggW) && prisStammer([vaggW], kp), { word, klickW, vagg: vaggW.slice(0, 300) })
  await bild(p, 'cv-mallar-word')

  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}&mall=linne`)
  await vanta(1500)
  const klickS = await klickaRe(p, 'ladda ner', 'button')
  await vanta(2500)
  const salj = await dialogText(p)
  logg('cv-mallar: merförsäljningen följer kampanjen', !!salj && prisStammer([salj], kp), { klickS, salj: salj?.slice(0, 300) })
  await bild(p, 'cv-mallar-merforsaljning')
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
  else if (floede === 'ytor-publikt') await ytorPublikt(browser, mobil)
  else if (floede === 'ytor-gratis' || floede === 'ytor-betalt') await ytorInloggat(browser, mobil, floede.slice(5))
  else throw new Error('okänt flöde')
} finally {
  await browser.close()
}
console.log(fel.length ? `\n${fel.length} FEL: ${fel.join(', ')}` : '\nAllt OK')
process.exit(fel.length ? 1 : 0)
