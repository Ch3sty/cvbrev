// scripts/qa-samlad.mjs
//
// Klicktest för fix/samlad-2026-10-10: kontaktuppgifterna i CV och brev,
// svarssparningen, de blandade svarsalternativen i matrislogiken och
// skrivspärren på testsessionerna (alla skrivningar via servern). Bygger på
// scripts/qa-kontaktuppgifter.mjs. Lokalt produktionsbygge, riktig Chrome,
// Pixel 7 och desktop, en skärmdump per steg.
//
//   SCRATCH=<tmp> BAS=http://localhost:3495 node scripts/qa-samlad.mjs kontakt pixel7
//   SCRATCH=<tmp> BAS=http://localhost:3495 node scripts/qa-samlad.mjs tester pixel7
//
// tester: matrislogik grund med snabba klick (varje svar sparat med visat,
//   selected = originalindex, poängen räknad på facit, genomgången stämmer,
//   svar-API:t säger inte om svaret var rätt), skurtest mot svar-API:t,
//   verbalt och numeriskt.
// kontakt: CV-PDF och brev med ändrade kontaktuppgifter.
//
// Kontona skapas och raderas med scripts/qa-kontaktuppgifter-konton.mjs.
// Skärmdumpar, PDF:er och Word-filer hamnar i docs/qa/samlad/.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createClient } from '@supabase/supabase-js'
import { alternativSeed, blandadPermutation, hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

const BAS = process.env.BAS || 'http://localhost:3483'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = 'docs/qa/samlad'
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
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-kontaktuppgifter-konton.json`, 'utf8'))

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const UA_MOBIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const VY = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 }, ua: UA_DESKTOP },
}

const [floede, vy] = process.argv.slice(2)
const konto = KONTON[vy]
const prefix = `${floede}-${vy}`
let nr = 0
const fel = []
const natfel = []
let tillatnaNatfel = []

function logg(steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), floede, vy, steg, ok, ...data }
  fs.appendFileSync(RESULTAT, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 500)}`)
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

/** Fångar svaret från en nedladdning och läser texten (PDF eller Word). */
function fangaFil(p, urlDel, typ = 'pdf') {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('ingen fil inom 120 s: ' + urlDel)), 120000)
    const h = async (res) => {
      if (!res.url().includes(urlDel) || res.request().method() !== 'POST') return
      p.off('response', h)
      clearTimeout(t)
      try {
        let buf = await res.buffer().catch(() => Buffer.alloc(0))
        if (!buf.length) {
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
        }
        const fil = path.join(UT, `${prefix}-${String(nr + 1).padStart(2, '0')}-${urlDel.replace(/\W+/g, '_')}.${typ}`)
        fs.writeFileSync(fil, buf)
        let text = ''
        if (res.status() === 200) {
          text = typ === 'pdf' ? (await pdfParse(buf)).text : (await mammoth.extractRawText({ buffer: buf })).value
        }
        resolve({ status: res.status(), fil, text })
      } catch (e) {
        reject(e)
      }
    }
    p.on('response', h)
  })
}

const rad = (p, dok) =>
  p.evaluate((dok) => document.querySelector(`[data-kontaktrad="${dok}"]`)?.innerText ?? '', dok)

async function visaRad(p, dok) {
  await p.evaluate((dok) => {
    const el = document.querySelector(`[data-kontaktrad="${dok}"]`) || document.getElementById(`kontakt-${dok}-namn`)
    el?.scrollIntoView({ block: 'center' })
  }, dok)
  await vanta(400)
}

/** Öppnar raden, fyller i värdena och sparar. */
async function andraRad(p, dok, varden, bildnamn) {
  await visaRad(p, dok)
  await p.evaluate((dok) => {
    let el = document.querySelector(`[data-kontaktrad="${dok}"]`)
    while (el && ![...el.querySelectorAll('button')].some((b) => b.innerText.trim() === 'Ändra')) el = el.parentElement
    const knapp = el && [...el.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Ändra')
    knapp?.click()
  }, dok)
  await p.waitForSelector(`#kontakt-${dok}-namn`)
  await visaRad(p, dok)
  for (const [falt, v] of Object.entries(varden)) {
    const sel = `#kontakt-${dok}-${falt}`
    await p.click(sel, { clickCount: 3 })
    await p.keyboard.press('Backspace')
    await p.$eval(sel, (e) => {
      e.value = ''
    })
    if (v) await p.type(sel, v)
  }
  await bild(p, `${bildnamn}-formular`)
  const svar = p.waitForResponse((r) => r.url().includes('/api/profile/contact') && r.request().method() === 'PATCH', { timeout: 30000 })
  await klickaText(p, /^Spara$/)
  const res = await svar
  await p.waitForSelector(`[data-kontaktrad="${dok}"]`, { timeout: 20000 })
  await vanta(1200)
  await visaRad(p, dok)
  await bild(p, `${bildnamn}-sparad`)
  return { status: res.status(), rad: await rad(p, dok) }
}

/** Texten i det renderade brevet (inte raden): förfadern till underskriften och kroppen. */
const brevText = (p) =>
  p.evaluate(() => {
    let el = document.querySelector('.signature')
    while (el && !el.querySelector('.body-content')) el = el.parentElement
    return el?.innerText ?? ''
  })

const harAlla = (text, varden) => varden.every((v) => text.replace(/\s+/g, ' ').includes(v))

/* ------------------------------------------------------------------ */

async function cvMall(p) {
  const ny = {
    namn: `Bea Dokument ${vy}`,
    telefon: '073-555 12 34',
    epost: `qa-dok-${vy}@jobbcoach-qa.test`,
  }
  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}`)
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 60000 })
  await visaRad(p, 'cv')
  await bild(p, 'cv-rad-fore')
  const fore = await rad(p, 'cv')
  logg('cv-mall: raden visar CV:ts uppgifter', harAlla(fore, [konto.fullName, konto.phone, konto.email]), { rad: fore })

  const forhandsLofte = p.waitForResponse((r) => r.url().includes('/api/cv/preview-html'), { timeout: 60000 })
  const sparad = await andraRad(p, 'cv', ny, 'cv-rad')
  logg('cv-mall: raden efter sparning', sparad.status === 200 && harAlla(sparad.rad, [ny.namn, ny.telefon, ny.epost]), sparad)
  const forhands = await forhandsLofte.then((r) => r.json()).catch(() => null)
  logg('cv-mall: förhandsvisningen hämtades om med nya värden', harAlla(forhands?.html ?? '', [ny.namn, ny.telefon, ny.epost]), {})

  const pdfLofte = fangaFil(p, '/api/cv/generate-formatted')
  await klickaText(p, /^Skapa CV-PDF/)
  const pdf = await pdfLofte
  await vanta(1500)
  await bild(p, 'cv-pdf-nedladdad')
  logg('cv-mall: PDF:en har nya namn, telefon och e-post', pdf.status === 200 && harAlla(pdf.text, [ny.namn, ny.telefon, ny.epost]) && !pdf.text.includes(konto.fullName), {
    status: pdf.status,
    fil: pdf.fil,
  })

  const { data: prof } = await admin.from('profiles').select('full_name, phone, contact_email').eq('id', konto.userId).single()
  const { data: cv } = await admin.from('cv_texts').select('structured_data').eq('id', konto.cvId).single()
  const pi = cv?.structured_data?.personalInfo ?? {}
  logg('cv-mall: profil och CV sparade', prof.full_name === ny.namn && prof.phone === ny.telefon && prof.contact_email === ny.epost && pi.fullName === ny.namn && pi.phone === ny.telefon && pi.email === ny.epost, { prof, pi })

  // Hård omladdning: värdena ligger kvar.
  await p.reload({ waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 60000 })
  await visaRad(p, 'cv')
  await bild(p, 'cv-rad-omladdad')
  const efterOmladdning = await rad(p, 'cv')
  logg('cv-mall: efter omladdning', harAlla(efterOmladdning, [ny.namn, ny.telefon, ny.epost]), { rad: efterOmladdning })
  return ny
}

async function brevFlode(p) {
  const steg5 = { namn: `Cia Brev ${vy}`, telefon: '076-222 33 44', epost: `qa-brev5-${vy}@jobbcoach-qa.test` }
  const steg6 = { namn: `Dan Steg Sex ${vy}`, telefon: '070-444 55 66', epost: `qa-brev6-${vy}@jobbcoach-qa.test` }

  await ga(p, '/dashboard/skapa-brev')
  await vantaText(p, /QA-CV byggaren/)
  await klickaText(p, /QA-CV byggaren/, 'button, [role="radio"], label, div[role="button"]').catch(async () => {
    await klickaText(p, /QA-CV byggaren/, '*')
  })
  await bild(p, 'brev-steg1')
  await klickaText(p, /^Fortsätt$/)
  await p.waitForSelector('textarea')
  await p.type(
    'textarea',
    'Lagerarbetare till Nordlager i Örebro. Vi söker dig med truckkort A och B och erfarenhet av plock och inventering. Du är noggrann, gillar ordning och reda och har ett gott säkerhetstänk. Heltid, dagtid, tillsvidare med inledande provanställning.'
  )
  await bild(p, 'brev-steg2')
  await klickaText(p, /^Fortsätt$/)
  await vanta(800)
  await klickaText(p, /^Fortsätt$/)
  await vanta(800)
  await klickaText(p, /^Fortsätt$/)
  await p.waitForSelector('[data-kontaktrad="brev"]', { timeout: 60000 })
  await visaRad(p, 'brev')
  await bild(p, 'brev-steg5-rad')
  logg('brev steg 5: raden', true, { rad: await rad(p, 'brev') })

  const s5 = await andraRad(p, 'brev', steg5, 'brev-steg5')
  logg('brev steg 5: raden efter sparning', s5.status === 200 && harAlla(s5.rad, [steg5.namn, steg5.telefon, steg5.epost]), s5)

  await klickaText(p, /^Skapa mitt brev$/)
  await vantaText(p, /Ditt brev .*är klart|Ditt brev är klart/, 150000)
  await vanta(1500)
  await p.evaluate(() => document.querySelector('.signature')?.scrollIntoView({ block: 'center' }))
  await bild(p, 'brev-steg6-forhandsvisning')
  const t5 = await brevText(p)
  logg('brev steg 6: brevet skrevs med värdena från steg 5', harAlla(t5, [steg5.namn, steg5.telefon, steg5.epost]), {})

  const s6 = await andraRad(p, 'brev', steg6, 'brev-steg6')
  logg('brev steg 6: raden efter sparning', s6.status === 200 && harAlla(s6.rad, [steg6.namn, steg6.telefon, steg6.epost]), s6)
  await p.evaluate(() => document.querySelector('.signature')?.scrollIntoView({ block: 'center' }))
  await vanta(400)
  await bild(p, 'brev-steg6-forhandsvisning-ny')
  const t6 = await brevText(p)
  logg(
    'brev steg 6: förhandsvisningen bytt direkt, utan nedladdning',
    harAlla(t6, [steg6.namn, steg6.telefon, steg6.epost]) && !t6.includes(steg5.namn) && !t6.includes(steg5.epost) && !t6.includes(steg5.telefon),
    {}
  )

  const pdfLofte = fangaFil(p, '/api/letters/download')
  await klickaText(p, /^Ladda ner PDF$/)
  const pdf = await pdfLofte
  await vanta(800)
  await bild(p, 'brev-pdf-nedladdad')
  logg('brev: PDF:en har värdena från steg 6', pdf.status === 200 && harAlla(pdf.text, [steg6.namn, steg6.telefon, steg6.epost]) && !pdf.text.includes(steg5.namn), {
    status: pdf.status,
    fil: pdf.fil,
  })

  const docxLofte = fangaFil(p, '/api/letters/download', 'docx')
  await klickaText(p, /^Ladda ner Word$/)
  const docx = await docxLofte
  await vanta(800)
  await bild(p, 'brev-word-nedladdad')
  logg('brev: Word-filen har värdena från steg 6', docx.status === 200 && harAlla(docx.text, [steg6.namn, steg6.telefon, steg6.epost]), {
    status: docx.status,
    fil: docx.fil,
  })

  await klickaText(p, /^Spara brevet$/).catch(() => {})
  await vanta(3000)
  await bild(p, 'brev-sparat')
  const { data: brev } = await admin
    .from('letters')
    .select('id, content')
    .eq('user_id', konto.userId)
    .order('created_at', { ascending: false })
    .limit(1)
  const brodtextOrord = brev?.[0]?.content?.includes('class="body-content"')
  logg('brev: sparat', Boolean(brev?.[0]?.id), { brevId: brev?.[0]?.id, harBodyContent: brodtextOrord })
  return { brevId: brev?.[0]?.id ?? null, steg6 }
}

async function minaBrev(p, brevId, varden) {
  if (!brevId) return logg('mina brev: inget sparat brev', false)
  await ga(p, `/dashboard/mina-brev/${brevId}`)
  await p.waitForSelector('[data-kontaktrad="brev"]', { timeout: 60000 })
  await p.evaluate(() => document.querySelector('.signature')?.scrollIntoView({ block: 'center' }))
  await bild(p, 'mina-brev')
  const t = await brevText(p)
  const pdfLofte = fangaFil(p, '/api/letters/download')
  await klickaText(p, /^Ladda ner PDF$/)
  const pdf = await pdfLofte
  await bild(p, 'mina-brev-nedladdat')
  logg('mina brev: visning och PDF följer profilen', harAlla(t, [varden.namn, varden.telefon, varden.epost]) && pdf.status === 200 && harAlla(pdf.text, [varden.namn, varden.telefon, varden.epost]), {
    status: pdf.status,
    fil: pdf.fil,
  })
}

/** Raderar ett eget CV via id, efter räkning (feedback_testdata_stadning). */
async function raderaEgetCv(id) {
  const { count } = await admin.from('cv_texts').select('*', { count: 'exact', head: true }).eq('id', id).eq('user_id', konto.userId)
  if (count === 1) await admin.from('cv_texts').delete().eq('id', id).eq('user_id', konto.userId)
  logg('städning: eget CV', null, { id, raknade: count })
}

async function linkedinImport(p, personalInfo) {
  return p.evaluate(
    async (userId, personalInfo) => {
      const cvData = {
        personalInfo,
        summary: 'Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.',
        experience: [{ position: 'Lagerarbetare', company: 'Nordlager AB', startDate: '2021', endDate: 'Nu', description: ['Plock och pack.'] }],
        education: [],
        skills: [{ category: 'Kompetenser', skills: ['Truckkort A och B'] }],
      }
      const r = await fetch('/api/cv/create-from-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source: 'linkedin_optimization', cvData }),
      })
      return { status: r.status, body: await r.json().catch(() => null) }
    },
    konto.userId,
    personalInfo
  )
}

async function cvPdfFranProfil(p, id, etikett, profilVarden) {
  const platshallare = /Ditt namn|din@email\.com|Professionell titel/
  await ga(p, `/dashboard/cv-mallar?cv=${id}`)
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 60000 })
  await visaRad(p, 'cv')
  await bild(p, `linkedin-${etikett}-rad`)
  const r = await rad(p, 'cv')
  const pdfLofte = fangaFil(p, '/api/cv/generate-formatted')
  await klickaText(p, /^Skapa CV-PDF/)
  const pdf = await pdfLofte
  await vanta(1200)
  await bild(p, `linkedin-${etikett}-pdf`)
  logg(
    `linkedin (${etikett}): raden och PDF:en har profilens uppgifter, inga platshållare`,
    harAlla(r, [profilVarden.namn, profilVarden.epost]) && pdf.status === 200 && harAlla(pdf.text, [profilVarden.namn, profilVarden.telefon, profilVarden.epost]) && !platshallare.test(pdf.text) && !platshallare.test(r),
    { rad: r, status: pdf.status, fil: pdf.fil }
  )
}

async function linkedin(p, profilVarden) {
  const platshallare = /Ditt namn|din@email\.com|Professionell titel/
  // CV-gränsen i importen räknar på subscription_tier, och testkontot har
  // paketet via premium_grants: gör plats genom att radera CV-byggarens CV.
  await raderaEgetCv(konto.cvId)

  // 1. Importen som klienten gör den nu: inget namn, ingen e-post.
  const ny = await linkedinImport(p, { fullName: '', email: '', title: '' })
  const { data: radNy } = await admin.from('cv_texts').select('structured_data, cv_text').eq('id', ny.body?.cvId).single()
  logg('linkedin (ny import utan e-post): sparad utan platshållare', ny.status === 200 && radNy && !platshallare.test(JSON.stringify(radNy.structured_data)) && !platshallare.test(radNy.cv_text), {
    status: ny.status,
    personalInfo: radNy?.structured_data?.personalInfo,
  })
  if (ny.body?.cvId) await cvPdfFranProfil(p, ny.body.cvId, 'ny-import', profilVarden)
  if (ny.body?.cvId) await raderaEgetCv(ny.body.cvId)

  // 2. En äldre klient som fortfarande skickar platshållarna.
  const gammalKlient = await linkedinImport(p, { fullName: 'Ditt namn', email: 'din@email.com', title: 'Professionell titel' })
  const { data: radGk } = await admin.from('cv_texts').select('structured_data, cv_text').eq('id', gammalKlient.body?.cvId).single()
  logg('linkedin (äldre klient med platshållare): rensas vid källan', gammalKlient.status === 200 && radGk && !platshallare.test(JSON.stringify(radGk.structured_data)) && !platshallare.test(radGk.cv_text), {
    status: gammalKlient.status,
    personalInfo: radGk?.structured_data?.personalInfo,
  })

  // 3. Ett CV importerat före fixen, med platshållarna sparade: rättas vid export.
  await cvPdfFranProfil(p, konto.linkedinGammalId, 'gammal-import', profilVarden)
}

/**
 * Profilsidan: namn och telefon sparas via /api/profile/contact och följer
 * med in i CV:n där fältet hade profilens gamla värde. Ett CV med ett eget
 * namn lämnas orört, och brevhuvudets toggel rörs inte.
 */
async function profilFlode(p) {
  await loggaIn(p)
  const { data: fore } = await admin.from('profiles').select('full_name, phone, include_phone_in_letters').eq('id', konto.userId).single()
  const sd = (fullName, phone) => ({
    personalInfo: { fullName, email: '', phone, address: 'Örebro' },
    summary: 'Lagerarbetare.',
    experience: [],
    education: [],
    skills: [{ category: 'Kompetenser', skills: ['WMS'] }],
  })
  const { data: cvs } = await admin
    .from('cv_texts')
    .insert([
      { user_id: konto.userId, file_name: 'QA-CV förifyllt', original_file_path: `qa/${konto.userId}/a.json`, cv_text: 'Lagerarbetare.', structured_data: sd(fore.full_name, fore.phone) },
      { user_id: konto.userId, file_name: 'QA-CV eget namn', original_file_path: `qa/${konto.userId}/b.json`, cv_text: 'Lagerarbetare.', structured_data: sd('Egen Namnsson', '072-999 00 11') },
    ])
    .select('id, file_name')
  const forifyllt = cvs.find((c) => c.file_name === 'QA-CV förifyllt').id
  const eget = cvs.find((c) => c.file_name === 'QA-CV eget namn').id

  const nyttNamn = `Eva Profil ${vy}`
  const nyTel = '070-777 88 99'
  await ga(p, '/dashboard/profil#cv')
  await p.waitForSelector('input[autocomplete="name"]')
  await bild(p, 'profil-fore')
  for (const [sel, v] of [['input[autocomplete="name"]', nyttNamn], ['input[autocomplete="tel"]', nyTel]]) {
    await p.click(sel)
    await p.$eval(sel, (e) => e.select())
    await p.keyboard.press('Backspace')
    await p.type(sel, v)
    const svar = p.waitForResponse((r) => r.url().includes('/api/profile/contact'), { timeout: 20000 })
    await p.evaluate((sel) => document.querySelector(sel)?.blur(), sel)
    await svar
    await vanta(1200)
  }
  await bild(p, 'profil-sparad')
  const { data: efter } = await admin.from('profiles').select('full_name, phone, include_phone_in_letters').eq('id', konto.userId).single()
  const { data: rader } = await admin.from('cv_texts').select('id, structured_data').in('id', [forifyllt, eget])
  const pi = Object.fromEntries(rader.map((r) => [r.id, r.structured_data.personalInfo]))
  logg('profil: namn och telefon sparade, togglen orörd', efter.full_name === nyttNamn && efter.phone === nyTel && efter.include_phone_in_letters === fore.include_phone_in_letters, { fore, efter })
  logg('profil: förifyllt CV följer med, CV med eget namn orört', pi[forifyllt].fullName === nyttNamn && pi[forifyllt].phone === nyTel && pi[eget].fullName === 'Egen Namnsson' && pi[eget].phone === '072-999 00 11', {
    forifyllt: pi[forifyllt],
    eget: pi[eget],
  })
  await ga(p, `/dashboard/cv-mallar?cv=${eget}`)
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 60000 })
  await visaRad(p, 'cv')
  await bild(p, 'profil-cv-eget-namn-rad')
  logg('profil: CV med eget namn visar sitt eget namn i raden', (await rad(p, 'cv')).includes('Egen Namnsson'), { rad: await rad(p, 'cv') })
}

async function kontaktFlode(p) {
  await loggaIn(p)
  await cvMall(p)
  const { brevId, steg6 } = await brevFlode(p)
  await minaBrev(p, brevId, steg6)
  // Profilens värden är nu steg 6:s, och LinkedIn-CV:na har tomma fält.
  await linkedin(p, steg6)
}

/* ------------------------------------------------------------------ */

async function vantaPaKlickbar(p, sel, timeout = 8000) {
  await p.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((b) => !b.disabled && b.offsetParent !== null), { timeout, polling: 20 }, sel)
}

async function startaTest(p, slug) {
  await ga(p, `/dashboard/tester/${slug}`)
  await bild(p, `${slug}-hubb`)
  const hubb = await p.evaluate(() => document.body.innerText)
  logg(`${slug}: hubben`, null, { rad: (hubb.match(/\d+ frågor[^\n]*/) || [''])[0] })
  await klickaText(p, /^(Starta testet|Gör om testet|Starta|Börja|Gör testet|Kör testet|Fortsätt testet)/i)
  await p.waitForFunction(() => /\/test\//.test(location.pathname), { timeout: 30000 })
  await vanta(1500)
  return (await p.evaluate(() => location.pathname)).split('/').pop()
}

async function avsluta(p, slug) {
  await klickaText(p, /^Lämna in$/)
  await vantaText(p, /Avsluta testet\?/)
  await bild(p, `${slug}-avsluta`)
  await klickaText(p, /^Avsluta och se resultat$/)
  await p.waitForFunction(() => /\/results/.test(location.pathname), { timeout: 90000 })
  await vanta(2500)
  await bild(p, `${slug}-resultat`)
}

/** Samma urval och blandning som appen (selectQuestions.v7 + blanda.ts). */
function forvantatMatris(pool, sessionId, n, blandad) {
  const s = [...pool]
  const rng = mulberry32(hashString(sessionId))
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n).map((q) => {
    const perm = blandad ? blandadPermutation(alternativSeed(sessionId, q.id), q.options.length) : q.options.map((_, i) => i)
    return { id: q.id, facit: q.correctAnswer, perm, rattVisat: perm.indexOf(q.correctAnswer) }
  })
}

const bokstav = (i) => String.fromCharCode(65 + i)

/** Genomgångens rad i (öppnar den). */
async function genomgangsRad(p, i) {
  return p.evaluate(async (i) => {
    const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
    const knapp = sek?.querySelectorAll('li > button')[i]
    if (!knapp) return null
    if (knapp.getAttribute('aria-expanded') !== 'true') knapp.click()
    await new Promise((r) => setTimeout(r, 400))
    const text = knapp.parentElement.innerText
    return {
      status: (text.match(/\b(Rätt|Fel|Hoppad)\b/) || [])[1] ?? null,
      ditt: (text.match(/Ditt svar \(([A-F])\)/) || [])[1] ?? null,
      ratt: (text.match(/Rätt svar \(([A-F])\)/) || [])[1] ?? null,
    }
  }, i)
}

async function matris(p) {
  const slug = 'matrislogik-grund'
  const svarsKroppar = []
  const lyssnare = async (r) => {
    if (!/\/api\/logicTestV4\/answer$/.test(new URL(r.url()).pathname) || r.request().method() !== 'POST') return
    svarsKroppar.push({ status: r.status(), body: await r.json().catch(() => null) })
  }
  p.on('response', lyssnare)
  const sessionId = await startaTest(p, slug)
  await vantaText(p, /Välj rätt svar/i)
  await bild(p, `${slug}-fraga-1`)
  const { data: start } = await admin.from('logic_test_v4_sessions').select('meta').eq('id', sessionId).single()
  const blandad = start?.meta?.alternativ_blandade === true
  logg('matris: ny session har blandade alternativ', blandad, { sessionId, meta: start?.meta })
  const bank = JSON.parse(fs.readFileSync('src/lib/logicTestV7/questionBankGrund.v7.json', 'utf8'))
  const fv = forvantatMatris(bank, sessionId, 15, blandad)
  // Fråga 2, 5, 8, 11, 14 besvaras fel med flit, övriga rätt, alltid på den
  // position där alternativet visas för just den här sessionen.
  const valdPos = (n) => (n % 3 === 2 ? (fv[n - 1].rattVisat + 1) % fv[n - 1].perm.length : fv[n - 1].rattVisat)

  const besvarade = []
  for (let i = 0; i < 15; i++) {
    // Snabba klick: nästa svar så fort frågan byts, utan att vänta på servern.
    await vantaPaKlickbar(p, 'button[aria-label^="Svarsalternativ"]')
    const n = await p.evaluate(() => Number((document.body.innerText.match(/Fråga (\d+)/) || [])[1]))
    const pos = valdPos(n)
    await p.evaluate((l) => {
      const b = [...document.querySelectorAll(`button[aria-label="Svarsalternativ ${l}"]`)].find((e) => e.offsetParent !== null && !e.disabled)
      b?.click()
    }, bokstav(pos))
    besvarade.push(n)
    if (n === 8) await bild(p, `${slug}-fraga-8`)
    if (n < 15) {
      await p
        .waitForFunction((n) => Number((document.body.innerText.match(/Fråga (\d+)/) || [])[1]) !== n, { timeout: 5000, polling: 20 }, n)
        .catch(() => {})
    }
  }
  await vanta(2500)
  await bild(p, `${slug}-alla-besvarade`)

  // Databasen före inlämning: ett svar per fråga, visat = klickad position,
  // selected = originalindex enligt sessionens permutation.
  const { data: fore } = await admin.from('logic_test_v4_sessions').select('answers').eq('id', sessionId).single()
  const kontroll = fv.map((f, i) => {
    const n = i + 1
    const a = fore.answers.find((x) => x.q_id === f.id)
    const visat = valdPos(n)
    return { n, ok: !!a && a.visat === visat && a.selected === f.perm[visat], visat: a?.visat, selected: a?.selected, vantatVisat: visat, vantatSelected: f.perm[visat] }
  })
  const unikaFore = new Set(fore.answers.map((a) => a.q_id)).size
  logg('matris: 15 svar sparade med visat och originalindex', fore.answers.length === 15 && unikaFore === 15 && kontroll.every((k) => k.ok), {
    sessionId,
    besvaradeFragor: besvarade.join(','),
    sparade: fore.answers.length,
    unika: unikaFore,
    fel: kontroll.filter((k) => !k.ok),
  })
  const vantadPoang = fv.filter((f, i) => f.perm[valdPos(i + 1)] === f.facit).length

  await avsluta(p, slug)
  await vantaText(p, /Fråga för fråga/i, 120000)
  await vanta(1000)
  const resText = await p.evaluate(() => document.body.innerText)
  const { data: s } = await admin.from('logic_test_v4_sessions').select('answers, score, completed_at').eq('id', sessionId).single()
  logg('matris: poängen räknad på facit och originalindex', Boolean(s.completed_at) && s.score === vantadPoang && vantadPoang === 10, {
    score: s.score,
    vantad: vantadPoang,
    resultatRad: (resText.match(/\d+ av \d+[^\n]*/) || [''])[0],
  })
  const r1 = await genomgangsRad(p, 0)
  const r2 = await genomgangsRad(p, 1)
  await p.evaluate(() => {
    const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
    sek?.querySelectorAll('li')[1]?.scrollIntoView({ block: 'center' })
  })
  await vanta(400)
  await bild(p, `${slug}-genomgang-fraga-2`)
  logg(
    'matris: genomgången visar samma bokstäver som testet',
    r1?.status === 'Rätt' && r1?.ratt === bokstav(fv[0].rattVisat) && r2?.status === 'Fel' && r2?.ditt === bokstav(valdPos(2)) && r2?.ratt === bokstav(fv[1].rattVisat),
    { r1, r2, vantat1: bokstav(fv[0].rattVisat), vantatDitt2: bokstav(valdPos(2)), vantatRatt2: bokstav(fv[1].rattVisat) }
  )
  p.off('response', lyssnare)
  const medCorrect = svarsKroppar.filter((k) => k.body && ('correct' in k.body || 'isCorrect' in k.body))
  logg('matris: svar-API:t säger inte om svaret var rätt', svarsKroppar.length >= 15 && medCorrect.length === 0, {
    anrop: svarsKroppar.length,
    statusar: [...new Set(svarsKroppar.map((k) => k.status))],
    exempel: svarsKroppar[0]?.body,
  })

  // Skurtest mot servern: 15 svar och 5 omval på en gång, utan klientkö.
  const ids = bank.slice(0, 15).map((q) => q.id)
  const skur = await p.evaluate(async (ids) => {
    const r = await fetch('/api/logicTestV4/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const { session } = await r.json()
    const post = (qid, val) =>
      fetch('/api/logicTestV4/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, questionId: qid, selectedIndex: val, timeSpent: 1 }),
      }).then(async (x) => ({ status: x.status, body: await x.json().catch(() => null) }))
    const svar = await Promise.all([...ids.map((q) => post(q, 0)), ...ids.slice(0, 5).map((q) => post(q, 1))])
    return { id: session.id, statusar: svar.map((s) => s.status), kroppar: svar.map((s) => s.body) }
  }, ids)
  const { data: sk } = await admin.from('logic_test_v4_sessions').select('answers').eq('id', skur.id).single()
  const omval = sk.answers.filter((a) => ids.slice(0, 5).includes(a.q_id))
  logg('matris: 20 samtidiga anrop (15 frågor, 5 omval) ger 15 svar med visat', sk.answers.length === 15 && new Set(sk.answers.map((a) => a.q_id)).size === 15 && sk.answers.every((a) => typeof a.visat === 'number' && typeof a.selected === 'number'), {
    sessionId: skur.id,
    statusar: [...new Set(skur.statusar)],
    sparade: sk.answers.length,
    omvalVisat: omval.map((a) => a.visat),
    utanCorrect: skur.kroppar.every((b) => b && !('correct' in b)),
  })
  // Sessionen lämnas oavslutad och raderas med kontot.
}

async function verbal(p) {
  const slug = 'verbal-resonemang'
  const sessionId = await startaTest(p, slug)
  await bild(p, `${slug}-passage-1`)
  let klick = 0
  for (let passage = 0; passage < 20; passage++) {
    await p.waitForSelector('[role="radiogroup"] button[role="radio"]', { timeout: 15000 })
    // Snabba klick: alla fyra påståenden i samma tick, inga pauser.
    klick += await p.evaluate((passage) => {
      const grupper = [...document.querySelectorAll('[role="radiogroup"]')]
      let n = 0
      grupper.forEach((g, i) => {
        const knappar = g.querySelectorAll('button[role="radio"]')
        knappar[(passage + i) % knappar.length]?.click()
        n++
      })
      return n
    }, passage)
    if (passage === 0 || passage === 7) await bild(p, `${slug}-passage-${passage + 1}-besvarad`)
    const sista = await p.evaluate(() => [...document.querySelectorAll('button')].some((b) => /^Lämna in$/.test(b.innerText.trim()) && b.offsetParent !== null))
    if (sista) break
    await klickaText(p, /^Nästa$/)
    await vanta(150)
  }
  await vanta(1500)
  await avsluta(p, slug)
  const resText = await p.evaluate(() => document.body.innerText)
  const { data: s } = await admin.from('logic_test_v4_sessions').select('answers, score, completed_at').eq('id', sessionId).single()
  const unika = new Set(s.answers.map((a) => `${a.passageId}#${a.statementIndex}`)).size
  logg('verbalt: sparade svar = antal påståenden', s.completed_at && s.answers.length === 60 && unika === 60 && klick === 60, {
    sessionId,
    klick,
    sparade: s.answers.length,
    unika,
    score: s.score,
    resultatRad: (resText.match(/\d+ av \d+[^\n]*/) || [''])[0],
  })
}

async function numerisk(p) {
  const slug = 'numeriskt-test'
  const sessionId = await startaTest(p, slug)
  await vantaText(p, /Fråga 1 av/)
  await vanta(600)
  await bild(p, `${slug}-fraga-1`)
  let klick = 0
  for (let i = 1; i <= 40; i++) {
    const meter = await p.evaluate(() => (document.body.innerText.match(/Fråga (\d+) av (\d+)/) || []).slice(1).map(Number))
    await p.evaluate(() => {
      const alt = [...document.querySelectorAll('button[aria-pressed]')].find((b) => !b.disabled)
      alt?.scrollIntoView({ block: 'center' })
      alt?.click()
    })
    klick++
    await vanta(150)
    if ([9, 31].includes(i)) await bild(p, `${slug}-fraga-${i}`)
    const sista = await p.evaluate(() => [...document.querySelectorAll('button')].some((b) => /Lämna in/.test(b.innerText)))
    await klickaText(p, /^(Nästa fråga|Lämna in)$/)
    await vanta(250)
    if (sista) {
      logg('numerisk: sista frågan', meter[0] === meter[1], { fraga: meter[0], av: meter[1] })
      break
    }
  }
  await vantaText(p, /Avsluta testet\?/)
  await bild(p, `${slug}-avsluta`)
  await klickaText(p, /^Avsluta och se resultat$/)
  await p.waitForFunction(() => /\/results/.test(location.pathname), { timeout: 90000 })
  await vanta(2500)
  await bild(p, `${slug}-resultat`)
  const resText = await p.evaluate(() => document.body.innerText)
  const { data: s } = await admin.from('logic_test_v4_sessions').select('score, completed_at, answers').eq('id', sessionId).single()
  const unika = new Set(s.answers.map((a) => `${a.passageId}#${a.questionId}`)).size
  const ratt = s.answers.filter((a) => a.isCorrect).length
  logg('numerisk: 32 svar sparade, avslutad med poäng', Boolean(s.completed_at) && s.answers.length === 32 && unika === 32 && s.score === ratt, {
    sessionId,
    klick,
    sparade: s.answers.length,
    unika,
    score: s.score,
    resultatRad: (resText.match(/\d+ av \d+[^\n]*/) || [''])[0],
  })
}

async function testFlode(p) {
  await loggaIn(p)
  await matris(p)
  await verbal(p)
  await numerisk(p)
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
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|Failed to load resource/i.test(m.text())) fel.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => {
    const r = `pageerror ${p.url().replace(BAS, '')}: ` + String(e?.message ?? e).slice(0, 160)
    fel.push(r)
    console.log('  ' + r)
  })
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !/_next\/image|favicon/.test(u)) natfel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (floede === 'kontakt') await kontaktFlode(p)
  else if (floede === 'tester') await testFlode(p)
  else if (floede === 'profil') await profilFlode(p)
  else throw new Error('okänt flöde')
} catch (e) {
  logg('avbrott', false, { fel: String(e?.message ?? e).slice(0, 300) })
  try {
    const sidor = await browser.pages()
    if (sidor.length) await bild(sidor[sidor.length - 1], 'avbrott')
  } catch {}
} finally {
  logg('konsolfel', fel.length === 0, { fel })
  logg('nätverksfel', natfel.filter((n) => !tillatnaNatfel.includes(n)).length === 0, { natfel })
  await browser.close()
}
