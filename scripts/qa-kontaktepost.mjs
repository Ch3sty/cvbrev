// scripts/qa-kontaktepost.mjs
//
// Klicktest för fix/kontaktepost-numeriskt (2026-10-10) mot ett lokalt
// produktionsbygge, Pixel 7 och desktop, en skärmdump per steg.
//
//   SCRATCH=<tmp> BAS=http://localhost:3482 node scripts/qa-kontaktepost.mjs epost pixel7
//   SCRATCH=<tmp> BAS=http://localhost:3482 node scripts/qa-kontaktepost.mjs numerisk pixel7 gratis
//   SCRATCH=<tmp> QA_UT=docs/qa/flodesutgang MORKT=1 node scripts/qa-kontaktepost.mjs flodesutgang pixel7
//
// flodesutgang (2026-10-11): brevet från Personliga brev genom alla steg,
// bakåt mitt i flödet, dörrarna och pappret på steg 6, Spara, Klar och EN
// bakåtgest ut till rummet; krysset i brevet och i Bygg ditt CV.
//
// Kontona skapas och raderas med scripts/qa-kontaktepost-konton.mjs.
// Skärmdumpar och PDF:er hamnar i docs/qa/kontaktepost/.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createClient } from '@supabase/supabase-js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const BAS = process.env.BAS || 'http://localhost:3482'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = process.env.QA_UT || 'docs/qa/kontaktepost'
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = `${UT}/resultat.jsonl`

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
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-kontaktepost-konton.json`, 'utf8'))

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const UA_MOBIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const VY = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 }, ua: UA_DESKTOP },
  smal360: { viewport: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
}

const [floede, vy, kontoNamn = 'allt'] = process.argv.slice(2)
const konto = KONTON[kontoNamn]
const prefix = `${floede}-${vy}`
let nr = 0
const fel = []
const natfel = []

function logg(steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), floede, vy, steg, ok, ...data }
  fs.appendFileSync(RESULTAT, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 400)}`)
}

async function bild(p, namn) {
  nr += 1
  const fil = path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`)
  await p.screenshot({ path: fil }).catch(() => {})
  return fil
}

async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 90000 })
  await vanta(800)
}

async function klickaText(p, re, sel = 'button, a, [role="button"], label') {
  const ok = await p.evaluate(
    (src, flags, sel) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll(sel)].find(
        (e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.offsetParent !== null && !e.disabled
      )
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

async function vantaText(p, re, timeout = 60000) {
  await p.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body.innerText), { timeout }, re.source, re.flags)
}

/** Ligger elementet inom viewporten utan scroll? */
async function iBild(p, re) {
  return p.evaluate((src, flags) => {
    const r = new RegExp(src, flags)
    const el = [...document.querySelectorAll('button, a, p, span, label')].find((e) => r.test(e.innerText || ''))
    if (!el) return null
    const b = el.getBoundingClientRect()
    return b.top >= 0 && b.bottom <= window.innerHeight
  }, re.source, re.flags)
}

async function loggaIn(p) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('button[type="submit"]'),
  ])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 30000 })
  await vanta(1500)
}

/** Fångar svaret från en nedladdning och läser PDF-texten. */
function fangaPdf(p, urlDel) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('ingen PDF inom 120 s: ' + urlDel)), 120000)
    const h = async (res) => {
      if (!res.url().includes(urlDel) || res.request().method() !== 'POST') return
      p.off('response', h)
      clearTimeout(t)
      try {
        let buf = await res.buffer().catch(() => Buffer.alloc(0))
        if (!buf.length) {
          // Puppeteer lämnar ibland ut en tom kropp för blob-nedladdningar.
          // Hämta då samma anrop en gång till i sidan och läs bytes därifrån.
          const req = res.request()
          const b64 = await p.evaluate(async (u, body) => {
            const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
            const ab = await r.arrayBuffer()
            let s = ''
            const v = new Uint8Array(ab)
            for (let i = 0; i < v.length; i++) s += String.fromCharCode(v[i])
            return btoa(s)
          }, req.url(), req.postData())
          buf = Buffer.from(b64, 'base64')
          console.log('  tom kropp från puppeteer, hämtade om:', buf.length, 'byte')
        }
        const fil = path.join(UT, `${prefix}-${String(nr + 1).padStart(2, '0')}-${urlDel.replace(/\W+/g, '_')}.pdf`)
        fs.writeFileSync(fil, buf)
        const text = res.status() === 200 ? (await pdfParse(buf)).text : ''
        resolve({ status: res.status(), fil, text })
      } catch (e) {
        reject(e)
      }
    }
    p.on('response', h)
  })
}

async function profilEpost(p, varde) {
  await ga(p, '/dashboard/profil#cv-epost')
  await p.waitForSelector('#profil-epost')
  await p.evaluate(() => document.getElementById('cv-epost')?.scrollIntoView({ block: 'center' }))
  await vanta(400)
  await bild(p, 'profil-fore')
  await p.click('#profil-epost', { clickCount: 3 })
  await p.keyboard.press('Backspace')
  if (varde) await p.type('#profil-epost', varde)
  // Blur sparar.
  await p.evaluate(() => document.getElementById('profil-epost')?.blur())
  await vantaText(p, /Sparat/, 15000).catch(() => {})
  await vanta(600)
  await bild(p, varde ? 'profil-ny-adress' : 'profil-tomd')
  const falt = await p.$eval('#profil-epost', (e) => e.value)
  const { data } = await admin.from('profiles').select('contact_email').eq('id', konto.userId).single()
  return { falt, db: data?.contact_email ?? null }
}

/** Väntar på räknaren i flödets topprad, till exempel "3 / 6". */
async function vantaSteg(p, n, tot, timeout = 30000) {
  await p.waitForFunction(
    (t) => [...document.querySelectorAll('header span')].some((e) => e.innerText.trim() === t),
    { timeout },
    `${n} / ${tot}`
  )
  await vanta(300)
}

/** Ett steg framåt: Fortsätt och vänta tills räknaren visar nästa steg. */
async function fortsatt(p, till, tot) {
  await klickaText(p, /^Fortsätt$/)
  await vantaSteg(p, till, tot)
}

async function sokvag(p) {
  return p.evaluate(() => location.pathname + location.search)
}

/** Utkast från förra varvet skulle annars ge återkomstvalet i stället för steg 1. */
async function rensaUtkast(p) {
  await p.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (/^flow:|jobbcoach_cv_draft/.test(k)) localStorage.removeItem(k)
  })
}

async function valjCvOchAnnons(p) {
  await vantaText(p, /QA-CV/)
  await klickaText(p, /QA-CV/, 'button, [role="radio"], label, div[role="button"]').catch(async () => {
    await klickaText(p, /QA-CV/, '*')
  })
  await bild(p, 'brev-steg1')
  await fortsatt(p, 2, 6)
  await p.waitForSelector('textarea')
  await p.type(
    'textarea',
    'Lagerarbetare till Nordlager i Örebro. Vi söker dig med truckkort A och B och erfarenhet av plock och inventering. Du är noggrann, gillar ordning och reda och har ett gott säkerhetstänk. Heltid, dagtid, tillsvidare med inledande provanställning.'
  )
  await bild(p, 'brev-steg2')
}

async function brevFlode(p, epostVantad, { franRum = false, bakatMitt = false } = {}) {
  if (franRum) {
    // Från rummet med en riktig klientnavigering, som när användaren trycker.
    await ga(p, '/dashboard/mina-brev')
    await rensaUtkast(p)
    await bild(p, 'rummet-personliga-brev')
    await klickaText(p, /./, 'a[href="/dashboard/skapa-brev"]')
    await vantaSteg(p, 1, 6)
  } else {
    await ga(p, '/dashboard/skapa-brev')
  }
  await valjCvOchAnnons(p)
  await fortsatt(p, 3, 6)
  if (bakatMitt) {
    // Bakåtgesten mitt i flödet ska backa ett steg, inte lämna flödet.
    await p.goBack({ waitUntil: 'networkidle2' }).catch(() => {})
    await vanta(800)
    const steg2 = await p.evaluate(() => [...document.querySelectorAll('header span')].some((e) => e.innerText.trim() === '2 / 6'))
    await bild(p, 'bakat-mitt-i-flodet')
    logg('flöde: bakåt mitt i flödet backar ett steg', steg2 && (await sokvag(p)).startsWith('/dashboard/skapa-brev'), { url: await sokvag(p) })
    await fortsatt(p, 3, 6)
  }
  await fortsatt(p, 4, 6)
  await fortsatt(p, 5, 6)
  await p.waitForSelector('[data-kontaktrad="brev"]', { timeout: 60000 })
  await p.evaluate(() => {
    const el = document.querySelector('[data-kontaktrad="brev"]')
    el?.scrollIntoView({ block: 'center' })
  })
  await vanta(400)
  await bild(p, 'brev-steg5-rad')
  const radText = await p.evaluate(() => document.querySelector('[data-kontaktrad="brev"]')?.innerText ?? '')
  logg('brev: raden vid Skapa mitt brev', radText.includes(epostVantad), { radText, primarIBild: await iBild(p, /^Skapa mitt brev$/) })

  await klickaText(p, /^Skapa mitt brev$/)
  await vantaText(p, /Ditt brev .*är klart|Ditt brev är klart/, 120000)
  await vanta(1500)
  await bild(p, 'brev-steg6')
  const brevHtml = await p.evaluate(() => document.body.innerText)
  logg('brev: adressen i det genererade brevet', brevHtml.includes(epostVantad), { epostVantad })
  if (franRum) return klartBrev(p)

  const pdfLofte = fangaPdf(p, '/api/letters/download')
  await klickaText(p, /^Ladda ner PDF$/)
  const pdf = await pdfLofte
  logg('brev: adressen i PDF:en', pdf.status === 200 && pdf.text.includes(epostVantad), { status: pdf.status, fil: pdf.fil })
  await vanta(800)
  await p.evaluate(() => {
    const el = document.querySelector('[data-kontaktrad="brev"]')
    el?.scrollIntoView({ block: 'center' })
  })
  await bild(p, 'brev-nedladdat')

  // Spara så att brevet kan laddas ner igen från Mina brev.
  await klickaText(p, /^Spara brevet$/).catch(() => {})
  await vanta(3000)
  const { data: brev } = await admin
    .from('letters')
    .select('id')
    .eq('user_id', konto.userId)
    .order('created_at', { ascending: false })
    .limit(1)
  return brev?.[0]?.id ?? null
}

/** Steg 6: pappret, dörrarna, Spara, Klar och en bakåtgest ut. */
async function klartBrev(p) {
  const mobil = vy !== 'desktop'
  // Pappret: vitt även i mörkt läge, mörk text.
  await p.evaluate(() => document.querySelector('.dokument')?.scrollIntoView({ block: 'start' }))
  await vanta(600)
  const papper = await p.evaluate(() => {
    const el = document.querySelector('.dokument')
    if (!el) return null
    const cs = getComputedStyle(el)
    const text = el.querySelector('p') ?? el
    return {
      bakgrund: cs.backgroundColor,
      text: getComputedStyle(text).color,
      morkt: matchMedia('(prefers-color-scheme: dark)').matches,
    }
  })
  await bild(p, 'steg6-papper')
  const vitt = /rgb\(255, 255, 255\)/.test(papper?.bakgrund ?? '')
  const ljus = (c) => {
    const m = (c || '').match(/\d+/g)?.map(Number) ?? [255, 255, 255]
    return (m[0] + m[1] + m[2]) / 3
  }
  logg('steg 6: pappret är vitt med mörk text', vitt && ljus(papper?.text) < 110, papper ?? {})

  // Dörrarna: syns på mobil, och Spara brevet ligger ovanför dem.
  const lage = await p.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Huvudmeny"]')
    const knapp = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Spara brevet')
    const nb = nav?.getBoundingClientRect()
    const kb = knapp?.getBoundingClientRect()
    return {
      navSyns: !!nav && getComputedStyle(nav).display !== 'none' && nb.height > 0,
      navTopp: nb ? Math.round(nb.top) : null,
      knappTopp: kb ? Math.round(kb.top) : null,
      knappBotten: kb ? Math.round(kb.bottom) : null,
      vh: window.innerHeight,
    }
  })
  await bild(p, 'steg6-dorrar')
  if (mobil) {
    logg('steg 6: dörrarna syns', lage.navSyns, lage)
    logg('steg 6: Spara brevet ovanför dörrarna', lage.knappBotten !== null && lage.knappBotten <= lage.navTopp, lage)
  } else {
    logg('steg 6: desktop har sidomenyn, inga dörrar', !lage.navSyns, lage)
  }

  await klickaText(p, /^Spara brevet$/)
  await p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.innerText.trim() === 'Klar'), { timeout: 30000 })
  await vanta(2500)
  const efterSpar = await p.evaluate(() => ({ url: location.pathname + location.search, djup: history.state?.flodesdjup ?? null }))
  await bild(p, 'sparat')
  logg('spara: historiken krympt till en post', efterSpar.djup === 0 && /steg=6/.test(efterSpar.url), efterSpar)

  await klickaText(p, /^Klar$/)
  await p.waitForFunction(() => /^\/dashboard\/mina-brev\/[^/]+/.test(location.pathname), { timeout: 30000 })
  await vanta(1500)
  const brevUrl = await sokvag(p)
  await bild(p, 'mina-brev-brevet')
  await p.goBack({ waitUntil: 'networkidle2' }).catch(() => {})
  await vanta(1500)
  const efterBakat = await sokvag(p)
  await bild(p, 'en-bakatgest')
  logg('klart brev: en bakåtgest lämnar till rummet', efterBakat === '/dashboard/mina-brev', { brevUrl, efterBakat })
  return brevUrl.split('/').pop().split('?')[0]
}

/** Krysset i steg 2 ska gå till rummet man kom från. */
async function krysset(p, rum, start, tot, namn, forbered) {
  await ga(p, rum)
  await rensaUtkast(p)
  await ga(p, rum)
  if (start.startsWith('router:')) {
    // Rummet saknar egen länk till flödet: samma klientnavigering som en Link.
    await p.evaluate((u) => window.next.router.push(u), start.slice(7))
  } else {
    await klickaText(p, /./, `a[href="${start}"]`)
  }
  await vantaSteg(p, 1, tot)
  await forbered()
  await bild(p, `${namn}-steg2`)
  await klickaText(p, /^Stäng$/, 'button[aria-label="Stäng"]')
  await p.waitForFunction((r) => location.pathname === r, { timeout: 20000 }, rum).catch(() => {})
  await vanta(1200)
  const dar = await sokvag(p)
  await bild(p, `${namn}-efter-kryss`)
  logg(`${namn}: krysset i steg 2 går till rummet`, dar === rum, { dar, rum })
}

async function flodesutgang(p) {
  await loggaIn(p)
  // (a) och (d): brevet från Personliga brev, bakåt mitt i, klart, en bakåtgest ut.
  await brevFlode(p, konto.email, { franRum: true, bakatMitt: true })
  // (b) krysset i brevet.
  await krysset(p, '/dashboard/mina-brev', '/dashboard/skapa-brev', 6, 'brev-kryss', async () => {
    await valjCvOchAnnons(p)
  })
  // (c) krysset i Bygg ditt CV, från CV-rummet.
  await krysset(p, '/dashboard/profil/cv', 'router:/dashboard/skapa-cv', 7, 'cv-kryss', async () => {
    await fortsatt(p, 2, 7)
  })
}

async function cvMall(p, epostVantad, etikett) {
  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}`)
  await vantaText(p, /E-post i CV:t/)
  await p.evaluate(() => {
    const el = [...document.querySelectorAll('span')].find((e) => /^E-post i CV:t/.test(e.innerText))
    el?.scrollIntoView({ block: 'center' })
  })
  await vanta(600)
  await bild(p, `cv-mall-rad-${etikett}`)
  const radText = await p.evaluate(() => [...document.querySelectorAll('span')].find((e) => /^E-post i CV:t/.test(e.innerText))?.innerText ?? '')
  const pdfLofte = fangaPdf(p, '/api/cv/generate-formatted')
  await klickaText(p, /^Skapa CV-PDF/)
  const pdf = await pdfLofte
  await vanta(1500)
  await bild(p, `cv-mall-nedladdad-${etikett}`)
  logg(`cv-mall (${etikett}): raden och PDF:en`, radText.includes(epostVantad) && pdf.text.includes(epostVantad), {
    radText,
    status: pdf.status,
    fil: pdf.fil,
    pdfHarAdressen: pdf.text.includes(epostVantad),
  })
}

async function brevIgen(p, brevId, epostVantad) {
  if (!brevId) return logg('mina brev: inget sparat brev', false)
  await ga(p, `/dashboard/mina-brev/${brevId}`)
  await p.waitForSelector('[data-kontaktrad="brev"]', { timeout: 60000 })
  await p.evaluate(() => {
    const el = document.querySelector('[data-kontaktrad="brev"]')
    el?.scrollIntoView({ block: 'center' })
  })
  await bild(p, 'mina-brev-rad')
  const pdfLofte = fangaPdf(p, '/api/letters/download')
  await klickaText(p, /^Ladda ner PDF$/)
  const pdf = await pdfLofte
  logg('mina brev: sparat brev får kontoadressen tillbaka', pdf.status === 200 && pdf.text.includes(epostVantad), {
    status: pdf.status,
    fil: pdf.fil,
  })
  await bild(p, 'mina-brev-nedladdat')
}

async function epostFlode(p) {
  const ny = `qa-dokument-${vy}@jobbcoach-qa.test`
  await loggaIn(p)
  const efter = await profilEpost(p, ny)
  logg('profil: ny adress sparad', efter.db === ny && efter.falt === ny, efter)

  const brevId = await brevFlode(p, ny)
  await cvMall(p, ny, 'ny')

  const tomd = await profilEpost(p, '')
  logg('profil: tömt fält ger kontoadressen', tomd.db === null && tomd.falt === konto.email, tomd)

  await cvMall(p, konto.email, 'konto')
  await brevIgen(p, brevId, konto.email)

  // Ogiltig adress: klientvalidering.
  await ga(p, '/dashboard/profil#cv-epost')
  await p.waitForSelector('#profil-epost')
  await p.click('#profil-epost', { clickCount: 3 })
  await p.type('#profil-epost', 'inte-en-adress')
  await p.evaluate(() => document.getElementById('profil-epost')?.blur())
  await vanta(800)
  await bild(p, 'profil-ogiltig')
  const ogiltig = await p.evaluate(() => document.body.innerText.includes('Det ser inte ut som en e-postadress.'))
  logg('profil: ogiltig adress stoppas på klienten', ogiltig)
  // Servern: samma kontroll.
  const status = await p.evaluate(async () => {
    const r = await fetch('/api/profile/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_email: 'inte-en-adress' }),
    })
    return r.status
  })
  logg('profil: ogiltig adress stoppas på servern', status === 400, { status })
}

async function numeriskFlode(p) {
  await loggaIn(p)
  await ga(p, '/dashboard/tester/numeriskt-test')
  await bild(p, 'hubb')
  const hubbText = await p.evaluate(() => document.body.innerText)
  logg('numerisk: hubben lovar 32 frågor', /32 frågor/.test(hubbText), { rad: (hubbText.match(/\d+ frågor[^\n]*/) || [''])[0] })

  await klickaText(p, /^(Starta testet|Gör om testet|Starta|Börja|Gör testet|Kör testet)/i)
  await p.waitForFunction(() => /\/test\//.test(location.pathname), { timeout: 30000 })
  await vantaText(p, /Fråga 1 av/)
  await vanta(800)
  const sessionId = (await p.evaluate(() => location.pathname)).split('/').pop()
  await bild(p, 'fraga-1')
  const forsta = await p.evaluate(() => {
    const knapp = [...document.querySelectorAll('button')].find((b) => /Nästa fråga/.test(b.innerText))
    const alt = [...document.querySelectorAll('button[aria-pressed]')]
    const vh = window.innerHeight
    return {
      vh,
      sidhojd: document.documentElement.scrollHeight,
      knappTopp: knapp ? Math.round(knapp.getBoundingClientRect().top) : null,
      forstaAlternativTopp: alt[0] ? Math.round(alt[0].getBoundingClientRect().top) : null,
      horisontellScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }
  })
  logg('numerisk: första vyn', true, forsta)

  for (let i = 1; i <= 40; i++) {
    const meter = await p.evaluate(() => (document.body.innerText.match(/Fråga (\d+) av (\d+)/) || []).slice(1).map(Number))
    // Välj första alternativet; inget i testet beror på vilket.
    await p.evaluate(() => {
      const alt = [...document.querySelectorAll('button[aria-pressed]')].find((b) => !b.disabled)
      alt?.scrollIntoView({ block: 'center' })
      alt?.click()
    })
    await vanta(250)
    if ([2, 9, 16, 31].includes(i)) await bild(p, `fraga-${i}`)
    const sista = await p.evaluate(() => [...document.querySelectorAll('button')].some((b) => /Lämna in/.test(b.innerText)))
    await klickaText(p, /^(Nästa fråga|Lämna in)$/)
    await vanta(500)
    if (sista) {
      logg('numerisk: sista frågan', meter[0] === meter[1], { fraga: meter[0], av: meter[1] })
      break
    }
  }
  await vantaText(p, /Avsluta testet\?/)
  await bild(p, 'avsluta')
  await klickaText(p, /^Avsluta och se resultat$/)
  await p.waitForFunction(() => /\/results/.test(location.pathname), { timeout: 60000 })
  await vanta(2500)
  await bild(p, 'resultat')
  const resText = await p.evaluate(() => document.body.innerText)
  const { data: s } = await admin.from('logic_test_v4_sessions').select('id, score, completed_at, answers').eq('id', sessionId).single()
  logg('numerisk: slutförd och sparad', Boolean(s?.completed_at) && s.answers.length === 32, {
    sessionId,
    score: s?.score,
    svar: s?.answers?.length,
    resultatRad: (resText.match(/av 3\d[^\n]*/) || resText.match(/av \d+[^\n]*/) || [''])[0],
  })
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})
try {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(90000)
  await p.setViewport(VY[vy].viewport)
  await p.setUserAgent(VY[vy].ua)
  // MORKT=1: mörkt läge, för brevets pappersyta (2026-10-11).
  if (process.env.MORKT) await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|Failed to load resource/i.test(m.text())) fel.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => {
    const rad = `pageerror ${new Date().toISOString()} ${p.url().replace(BAS, '')}: ` + String(e?.message ?? e).slice(0, 160)
    fel.push(rad)
    console.log('  ' + rad)
  })
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !/_next\/image|favicon/.test(u)) natfel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (floede === 'epost') await epostFlode(p)
  else if (floede === 'numerisk') await numeriskFlode(p)
  else if (floede === 'brev') { await loggaIn(p); await brevFlode(p, konto.email) }
  else if (floede === 'flodesutgang') await flodesutgang(p)
  else throw new Error('okänt flöde')
} catch (e) {
  logg('avbrott', false, { fel: String(e?.message ?? e).slice(0, 300) })
} finally {
  logg('konsolfel', fel.length === 0, { fel })
  logg('nätverksfel', natfel.length === 0, { natfel })
  await browser.close()
}
