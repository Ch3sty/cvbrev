// scripts/qa-namn-dag2-2026-11-09.mjs
// Klicktest i riktig Chrome av namnfältets borttagning (docs/plan-efter-analys-2026-11-08.md,
// punkt 21, beslutad 2026-11-09):
//
//   bar /register utan namnfält, konto med e-post, bekräftelsemejlet utan namn,
//   kontosteget efter provet utan namnfält, en CV-export utan namn
//   (NameRequiredNotice, sedan PDF) och en brevgenerering utan namn
//   (NameRequiredNotice före modellanropet, sedan brevet med namnet).
//
//   QA_BAS=http://localhost:3121 QA_KONTON_FIL=<scratchpad>/qa-konton.json \
//   QA_BILDER=<scratchpad>/verifiering-2026-11-09/namn-dag2 node scripts/qa-namn-dag2-2026-11-09.mjs
//
// Pixel 7 (412 x 915) och desktop (1280 x 800), en ny kontext per genomgång.
// Skärmdumpar till QA_BILDER (utanför git), resultat till docs/qa/namn-dag2-2026-11-09/.
//
// STÄDREGEL: varje konto och prov skrivs direkt till QA_KONTON_FIL med id.
// Städningen sker per id med scripts/qa-registrering-stada.mjs (räknar först).

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:3121'
const KONTON_FIL = process.env.QA_KONTON_FIL
const BILDER = process.env.QA_BILDER
if (!KONTON_FIL || !BILDER) throw new Error('QA_KONTON_FIL och QA_BILDER krävs')
const UT = 'docs/qa/namn-dag2-2026-11-09'
const ETIKETT = process.env.QA_ETIKETT || 'lokal'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaNamn!2026x'
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
    return { konton: [], anonTest: [], cv: [], qaIp: [] }
  }
}
function spara(nyckel, v) {
  const d = lasKonton()
  d[nyckel] = [...(d[nyckel] ?? []), v]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
}

async function idFor(epost) {
  for (let i = 0; i < 20; i++) {
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

async function ny(browser, vp) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(vp)
  if (vp.isMobile) await p.setUserAgent(MOBIL_UA)
  p.setDefaultTimeout(30000)
  if (BAS.includes('localhost')) {
    const ip = `10.98.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
    spara('qaIp', ip)
  }
  return { ctx, p }
}

/** Synliga inmatningsfält i formuläret (inte Turnstile och dolda fält). */
async function formFalt(p) {
  return p.evaluate(() =>
    [...document.querySelectorAll('form input')]
      .filter((i) => i.offsetParent && i.type !== 'hidden')
      .map((i) => ({ type: i.type, ac: i.getAttribute('autocomplete') }))
  )
}

/** Skapar kontot i kontosteget och väntar in landningen. */
async function skapaKonto(p, enhet, etikett, landning) {
  const epost = `qa-namn-${etikett}-${enhet}-${Date.now()}@jobbcoach-qa.example.com`
  let bekraftelse = null
  const lyssna = (r) => {
    if (r.url().endsWith('/api/auth/send-confirmation') && r.request().method() === 'POST') {
      bekraftelse = { status: r.status(), body: r.request().postData() }
    }
  }
  p.on('response', lyssna)
  await p.type('form input[type="email"]', epost)
  await p.type('form input[type="password"]', LOSEN)
  await bild(p, `${enhet}-${etikett}-ifyllt`, `Kontosteget ifyllt (${etikett}), två fält`)
  const skapa = (await p.$('button[type="submit"]')) ?? (await p.$('button[form]'))
  await skapa.click()
  await p.waitForFunction((l) => location.pathname.startsWith(l), { timeout: 45000 }, landning).catch(() => {})
  const uid = await idFor(epost)
  spara('konton', { epost, id: uid, enhet, etikett, skapad: new Date().toISOString() })
  for (let i = 0; i < 20 && !bekraftelse; i++) await vanta(250)
  p.off('response', lyssna)
  return { epost, uid, bekraftelse, landat: new URL(p.url()).pathname }
}

/** Ett CV utan namn, och bekräftad e-post så att exporten inte stoppas av B1. */
async function cvUtanNamn(uid) {
  await admin.from('profiles').update({ email_verified_at: new Date().toISOString() }).eq('id', uid)
  const strukturerad = {
    personalInfo: { fullName: '', email: '', phone: '', address: 'Göteborg', title: 'Lagerarbetare' },
    summary: 'Lagerarbetare med fem års erfarenhet av plock, truck och inventering.',
    experience: [
      {
        position: 'Lagerarbetare',
        company: 'Nordlager AB',
        location: 'Göteborg',
        startDate: '2021-03',
        endDate: '',

        description: ['Plock och pack, truckkörning (A och B), inventering och mottagning av gods.'],
        achievements: ['Minskade plockfelen genom att märka om hyllplatserna'],
      },
    ],
    education: [{ degree: 'Gymnasieexamen', institution: 'Hvitfeldtska gymnasiet', startDate: '2014', endDate: '2017' }],
    skills: [{ category: 'Lager', skills: ['Truckkort A och B', 'Inventering', 'Plock och pack'] }],
    languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
  }
  const { data, error } = await admin
    .from('cv_texts')
    .insert({
      user_id: uid,
      file_name: 'QA lager-cv.pdf',
      original_file_path: `qa/${uid}/lager.pdf`,
      cv_text:
        'Lagerarbetare\nGöteborg\n\nProfil\nLagerarbetare med fem års erfarenhet av plock, truck och inventering.\n\nErfarenhet\nLagerarbetare, Nordlager AB, 2021 till nu\nPlock och pack, truckkörning (A och B), inventering och mottagning av gods.\n\nUtbildning\nGymnasieexamen, Hvitfeldtska gymnasiet, 2014 till 2017\n\nKompetenser\nTruckkort A och B, inventering, plock och pack',
      structured_data: strukturerad,
    })
    .select('id')
    .single()
  if (error) throw error
  spara('cv', { id: data.id, uid })
  return data.id
}

/* ------------------------------------------------------------ bar /register och CV-export */

async function registerOchCv(browser, enhet, vp) {
  const { ctx, p } = await ny(browser, vp)
  await p.goto(`${BAS}/register`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('form input[type="email"]')
  await vanta(600)
  await bild(p, `${enhet}-01-register`, 'Bar /register: Google, e-post och lösenord, inget namnfält')
  await avvisaSamtycke(p)
  const falt = await formFalt(p)
  logg(`${enhet}: /register har två fält, e-post och lösenord`, falt.length === 2 && falt[0].type === 'email' && falt[1].type === 'password', JSON.stringify(falt))
  logg(`${enhet}: inget namnfält på /register`, !falt.some((f) => f.ac === 'name'))
  logg(`${enhet}: /register utan sidledsscroll`, await sidled(p))
  const ovanVecket = await p.evaluate(() => {
    const b = document.querySelector('button[form], button[type="submit"]')
    return b ? Math.round(b.getBoundingClientRect().bottom) <= window.innerHeight : false
  })
  logg(`${enhet}: Skapa konto syns utan att rulla`, ovanVecket)

  const k = await skapaKonto(p, enhet, 'register', '/dashboard')
  logg(`${enhet}: kontot skapat utan namn och landar inloggat`, k.uid && k.landat.startsWith('/dashboard'), `${k.landat}`)
  logg(
    `${enhet}: bekräftelsemejlet skickas utan namn (200, inget fullName)`,
    k.bekraftelse?.status === 200 && !/fullName/.test(k.bekraftelse?.body ?? ''),
    JSON.stringify(k.bekraftelse?.status)
  )
  const { data: prof } = await admin.from('profiles').select('full_name').eq('id', k.uid).maybeSingle()
  logg(`${enhet}: profilen saknar namn`, !prof?.full_name, JSON.stringify(prof))
  await vanta(1200)
  await bild(p, `${enhet}-02-landning`, 'Landningen efter kontot, utan namn')
  const landText = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: landningen visar ingen platshållare för namnet`, !/undefined|null,|Användare|Namn saknas,/.test(landText))

  // Hemvyn: tilltalet utan namn och toppradens reserv.
  await p.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2' })
  await vanta(1500)
  await bild(p, `${enhet}-03-hem`, 'Hemvyn utan namn')
  const hemText = await p.evaluate(() => document.querySelector('main')?.innerText ?? '')
  logg(`${enhet}: hemvyn utan "undefined" eller platshållare`, !/undefined|Namn saknas|Ditt namn/.test(hemText))

  // CV-export utan namn.
  const cvId = await cvUtanNamn(k.uid)
  let exportSvar = []
  const lyssna = (r) => {
    if (r.url().endsWith('/api/cv/generate-formatted')) exportSvar.push({ status: r.status(), typ: r.headers()['content-type'] })
  }
  p.on('response', lyssna)
  await p.goto(`${BAS}/dashboard/cv-mallar?cv=${cvId}`, { waitUntil: 'networkidle2' })
  await vanta(2500)
  await avvisaSamtycke(p)
  await bild(p, `${enhet}-04-cv-mallar`, 'CV-mallar med ett CV utan namn')
  const skapaPdf = await knappMedText(p, 'Skapa CV-PDF', false)
  logg(`${enhet}: CV-mallar har Skapa CV-PDF`, !!skapaPdf)
  if (skapaPdf) {
    await skapaPdf.click()
    await p.waitForSelector('[data-testid="namn-kravs"]', { timeout: 30000 }).catch(() => {})
    await vanta(900)
    const ruta = await p.$('[data-testid="namn-kravs"]')
    logg(`${enhet}: CV-exporten frågar efter namnet (422 name_required)`, !!ruta && exportSvar.some((s) => s.status === 422), JSON.stringify(exportSvar))
    await bild(p, `${enhet}-05-cv-namnfraga`, 'CV-exporten: Vi behöver ditt namn först')
    if (ruta) {
      const iVy = await p.evaluate(() => {
        const r = document.querySelector('[data-testid="namn-kravs"]').getBoundingClientRect()
        return r.top >= 0 && r.bottom <= window.innerHeight
      })
      logg(`${enhet}: namnrutan rullas in i bild`, iVy)
      await p.type('#export-name', 'Sara Lind')
      const sparaKnapp = await knappMedText(p, 'Spara och ladda ner')
      await sparaKnapp.click()
      for (let i = 0; i < 120 && !exportSvar.some((s) => s.status === 200); i++) await vanta(500)
      const pdf = exportSvar.find((s) => s.status === 200)
      logg(`${enhet}: PDF:en laddas ned efter namnet`, pdf && /pdf/.test(pdf.typ ?? ''), JSON.stringify(exportSvar))
      await vanta(1500)
      await bild(p, `${enhet}-06-cv-klar`, 'CV-exporten efter namnet')
      const { data: prof2 } = await admin.from('profiles').select('full_name').eq('id', k.uid).maybeSingle()
      logg(`${enhet}: namnet sparat i profilen`, prof2?.full_name === 'Sara Lind', JSON.stringify(prof2))
    }
  }
  p.off('response', lyssna)
  await ctx.close()
}

/* ------------------------------------------------------------ provet och brevet */

async function provOchBrev(browser, enhet, vp) {
  const { ctx, p } = await ny(browser, vp)
  await p.goto(`${BAS}/verktyg/rekryteringstester/prova`, { waitUntil: 'networkidle2' })
  p.on('response', async (r) => {
    if (r.url().endsWith('/api/public/test-session') && r.request().method() === 'POST') {
      try {
        const j = await r.json()
        if (j.token) spara('anonTest', j.token)
      } catch {}
    }
  })
  await p.click('[data-cta="prova-start"]')
  await p.waitForSelector('button[aria-label^="Svarsalternativ"]')
  await avvisaSamtycke(p)
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('button[aria-label^="Svarsalternativ"]:not([disabled])')
    await vanta(250)
    const b = await p.$$('button[aria-label^="Svarsalternativ"]')
    await b[i % b.length].click()
    await vanta(150)
  }
  await p.waitForSelector('[data-cta="prova-gate"]')
  await vanta(700)
  await p.evaluate(() => document.querySelector('[data-cta="prova-gate"]').scrollIntoView({ block: 'center' }))
  await bild(p, `${enhet}-07-prova-resultat`, 'Provets resultat med kontoknappen')
  await p.click('[data-cta="prova-gate"]')
  await p.waitForFunction(() => location.pathname === '/register')
  await p.waitForSelector('form input[type="email"]')
  await vanta(1000)
  await bild(p, `${enhet}-08-register-efter-provet`, 'Kontosteget efter provet, utan namnfält')
  const falt = await formFalt(p)
  logg(`${enhet}: kontosteget efter provet har två fält`, falt.length === 2, JSON.stringify(falt))
  logg(`${enhet}: inget namnfält efter provet`, !falt.some((f) => f.ac === 'name'))
  logg(`${enhet}: kontosteget efter provet utan sidledsscroll`, await sidled(p))

  const k = await skapaKonto(p, enhet, 'provet', '/dashboard/tester/prov/')
  logg(`${enhet}: kontot efter provet landar på provets resultatsida`, k.landat.startsWith('/dashboard/tester/prov/'), k.landat)
  logg(`${enhet}: bekräftelsemejlet efter provet 200`, k.bekraftelse?.status === 200, JSON.stringify(k.bekraftelse?.status))
  await vanta(1200)
  await bild(p, `${enhet}-09-provsida`, 'Provets resultatsida efter kontot')

  // Brev utan namn.
  const cvId = await cvUtanNamn(k.uid)
  const annons =
    'Vi söker en lagerarbetare till vårt lager i Göteborg. Du plockar och packar order, kör truck och tar emot gods. Truckkort A och B krävs. Du är noggrann och trivs i ett högt tempo. Heltid, dagtid. Ansök senast 30 november.'
  await p.evaluate(
    (cv, text) =>
      sessionStorage.setItem(
        'jobbcoach-cover-letter-prefill',
        JSON.stringify({ cvId: cv, jobDescription: text, jobTitle: 'Lagerarbetare', company: 'Nordlager AB' })
      ),
    cvId,
    annons
  )
  const brevSvar = []
  const lyssna = (r) => {
    if (r.url().includes('/api/letters/generate')) brevSvar.push({ url: new URL(r.url()).pathname, status: r.status() })
  }
  p.on('response', lyssna)
  await p.goto(`${BAS}/dashboard/skapa-brev`, { waitUntil: 'networkidle2' })
  await vanta(1500)
  await avvisaSamtycke(p)
  // Prefill hoppar till mallen. Fortsätt till sammanfattningen.
  for (let i = 0; i < 4; i++) {
    const skapa = await knappMedText(p, 'Skapa mitt brev')
    if (skapa) break
    const fortsatt = await knappMedText(p, 'Fortsätt')
    if (!fortsatt) break
    await fortsatt.click()
    await vanta(900)
  }
  await bild(p, `${enhet}-10-brev-sammanfattning`, 'Brevflödet, steg 5 före genereringen')
  const skapa = await knappMedText(p, 'Skapa mitt brev')
  logg(`${enhet}: brevflödet når Skapa mitt brev`, !!skapa)
  if (skapa) {
    await skapa.click()
    await p.waitForSelector('[data-testid="namn-kravs"]', { timeout: 30000 }).catch(() => {})
    await vanta(900)
    const ruta = await p.$('[data-testid="namn-kravs"]')
    logg(
      `${enhet}: brevet frågar efter namnet före modellanropet (422)`,
      !!ruta && brevSvar.some((s) => s.status === 422),
      JSON.stringify(brevSvar)
    )
    await bild(p, `${enhet}-11-brev-namnfraga`, 'Brevflödet: Vilket namn ska stå under brevet?')
    if (ruta) {
      await p.type('#export-name', 'Sara Lind')
      const knapp = await knappMedText(p, 'Spara och skriv brevet')
      await knapp.click()
      await p
        .waitForFunction(() => /är klart/.test(document.body.innerText), { timeout: 90000 })
        .catch(() => {})
      await vanta(2000)
      const brevText = await p.evaluate(() => document.body.innerText)
      const iframeText = await p.evaluate(() => {
        const f = document.querySelector('iframe')
        try {
          return f?.contentDocument?.body?.innerText ?? ''
        } catch {
          return ''
        }
      })
      const allt = brevText + '\n' + iframeText
      logg(`${enhet}: brevet skrevs efter namnet`, /är klart/.test(brevText), JSON.stringify(brevSvar))
      logg(`${enhet}: brevet har namnet och ingen platshållare`, /Sara Lind/.test(allt) && !/Namn saknas|Ditt namn/.test(allt))
      await bild(p, `${enhet}-12-brev-klart`, 'Brevet med namnet i huvud och underskrift', true)
    }
  }
  p.off('response', lyssna)
  await ctx.close()
}

/* ------------------------------------------------------------ kör */

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
try {
  for (const [enhet, vp] of [
    ['pixel7', PIXEL7],
    ['desktop', DESKTOP],
  ]) {
    if (!BARA.length || BARA.includes('register')) await registerOchCv(browser, enhet, vp).catch((e) => logg(`${enhet}: registerOchCv kraschade`, false, e.message))
    if (!BARA.length || BARA.includes('brev')) await provOchBrev(browser, enhet, vp).catch((e) => logg(`${enhet}: provOchBrev kraschade`, false, e.message))
  }
} finally {
  await browser.close()
  const ok = resultat.filter((r) => r.ok).length
  fs.writeFileSync(path.join(UT, `resultat-${ETIKETT}.json`), JSON.stringify({ bas: BAS, ok, av: resultat.length, resultat, bilder }, null, 2))
  console.log(`\n${ok} av ${resultat.length} godkända`)
}
