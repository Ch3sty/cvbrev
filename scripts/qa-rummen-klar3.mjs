// scripts/qa-rummen-klar3.mjs
// Klicktest av det som är nytt i slutbranchen klar-3 (spec-rummen 21.3 och
// 22.3) och som qa-rummen-4.mjs inte redan fotograferar:
//
//   aterupptagning  "Åtgärda i CV:t" öppnar den sparade analysen (?job=<id>)
//                   för gratis och hela: antalet rader i cv_analysis_jobs och
//                   profilens analysräknare är lika före och efter klicket,
//                   ingen betalvägg, landar i granskningen.
//   klart           brevet med ?klart=1 på Pixel 7 och 1280, ljust och mörkt,
//                   mot B1 (eyebrow, h1, träffarna, raderna under), och att
//                   rörelsen stängs av under prefers-reduced-motion.
//   forstarad       Jobbsökets första rad på dator: tre lyfta kort med samma
//                   överkant, 30 px över väggens underkant (mycket-kontot).
//   tomtcv          Mina CV utan CV: uppladdningen i lyftkortet, ingen
//                   kopparknapp "Ladda upp CV", ingen förtroenderad.
//   hem             hemmet utan "Det här har du gjort", Nästa handling
//                   namnger den tysta tjänsten, jobbmatchningen utan
//                   .thread-chain (mörkt, 1280).
//
//   node scripts/qa-rummen-klar3.mjs --port 5246 --konton scripts/.qa-klar3-konton.json \
//     [--bara aterupptagning,klart] [--ut docs/qa/rummen/klar-3/klar3]
//
// Kontona skapas av qa-rummen-4.mjs --prefix qa-klar3 (unika adresser per
// körning). Gratiskontot får under aterupptagning ett CV och en sparad
// analys; raderna sparas med id och raderas med id efteråt, räknade före
// delete (feedback_testdata_stadning). Inget annat skrivs.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'
import { kontrolleraKnappar } from './qa-rummen-knappar-360.mjs'

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
const arg = (namn, fallback) => {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const PORT = arg('port', '5246')
const BAS = `http://localhost:${PORT}`
const KONTON = JSON.parse(fs.readFileSync(arg('konton', 'scripts/.qa-klar3-konton.json'), 'utf8'))
const BARA = arg('bara') ? arg('bara').split(',') : null
const kor = (d) => !BARA || BARA.includes(d)
const UT = path.resolve(arg('ut', 'docs/qa/rummen/klar-3/klar3'))
fs.mkdirSync(UT, { recursive: true })
for (const k of Object.values(KONTON)) {
  if (!/^qa-[a-z0-9-]+@jobbcoach-qa\.test$/.test(k.email)) throw new Error(`fel konto ${k.email}`)
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const resultat = { datum: new Date().toISOString(), fel: [] }
const fel = (t) => {
  resultat.fel.push(t)
  console.log('FEL', t)
}

async function payloadFor(email) {
  const { data: link, error: lErr } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  if (lErr) throw new Error(lErr.message)
  const { data: s, error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const { access_token, refresh_token, expires_at, expires_in, user } = s.session
  return 'base64-' + Buffer.from(JSON.stringify({ access_token, refresh_token, expires_at, expires_in, token_type: 'bearer', user })).toString('base64')
}

async function nySida(browser, { form, system, email, reducerad = false }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else if (form === 'smal') await page.emulate({ ...PIXEL, viewport: { ...PIXEL.viewport, width: 360, height: 780 } })
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  const media = [{ name: 'prefers-color-scheme', value: system }]
  if (reducerad) media.push({ name: 'prefers-reduced-motion', value: 'reduce' })
  await page.emulateMediaFeatures(media)
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
    } catch {}
  })
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(m.text().slice(0, 300))
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  return { page, logg }
}

async function besok(page, url) {
  // Referensen inne i appen: /dashboard landar annars i senaste rummet.
  await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 90000, referer: BAS + '/dashboard/profil' })
  await vanta(900)
}
const bild = (page, namn, full = false) => page.screenshot({ path: path.join(UT, `${namn}.png`), fullPage: full })
const sys = (s) => (s === 'light' ? 'ljust' : 'morkt')

async function rakna(userId) {
  const { count } = await sb.from('cv_analysis_jobs').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  const { data: p } = await sb.from('profiles').select('weekly_analysis_count').eq('id', userId).maybeSingle()
  return { rader: count ?? 0, raknare: p?.weekly_analysis_count ?? null }
}

/* ------------------------------------------------------------ delarna */

async function delAterupptagning(browser) {
  const ut = (resultat.aterupptagning = [])
  // Gratiskontot har inget CV (tomma Mina CV fotograferas i tomtcv före detta).
  const g = KONTON.gratis
  const skapat = { cv: null, jobb: null }
  try {
    const { data: cv, error: cErr } = await sb
      .from('cv_texts')
      .insert({ user_id: g.id, file_name: 'Anna_CV.pdf', original_file_path: `qa/${g.id}/cv.pdf`, cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet. Göteborg.' })
      .select('id')
      .single()
    if (cErr) throw new Error('cv gratis: ' + cErr.message)
    skapat.cv = cv.id
    const { QA_ANALYS } = await import('./qa-rummen-4-analys.mjs')
    const { data: jobb, error: jErr } = await sb
      .from('cv_analysis_jobs')
      .insert({ user_id: g.id, cv_id: cv.id, status: 'completed', display_name: 'Projektledare, Volvo Cars', completed_at: new Date().toISOString(), result: QA_ANALYS })
      .select('id')
      .single()
    if (jErr) throw new Error('analys gratis: ' + jErr.message)
    skapat.jobb = jobb.id

    for (const [roll, k, jobbId] of [
      ['gratis', g, skapat.jobb],
      ['hela', KONTON.hela, KONTON.hela?.dyn?.analysJob],
    ]) {
      if (!k || !jobbId) {
        fel(`${roll}: inget analysjobb att återuppta`)
        continue
      }
      for (const [form, system] of [['pixel7', 'light'], ['desktop', 'light'], ['pixel7', 'dark'], ['desktop', 'dark']]) {
        const fore = await rakna(k.id)
        const { page, logg } = await nySida(browser, { form, system, email: k.email })
        try {
          await besok(page, '/dashboard/profil/cv')
          const tag = `aterupptagning-${roll}-${form}-${sys(system)}`
          await bild(page, `${tag}-01-mina-cv`)
          const lank = await page.evaluate(() => {
            const a = [...document.querySelectorAll('a')].find((e) => e.textContent?.trim() === 'Åtgärda i CV:t')
            return a ? a.getAttribute('href') : null
          })
          if (!lank || !lank.includes(`job=${jobbId}`)) fel(`${tag}: länken pekar inte på jobbet (${lank})`)
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {}),
            page.evaluate(() => [...document.querySelectorAll('a')].find((e) => e.textContent?.trim() === 'Åtgärda i CV:t')?.click()),
          ])
          await page.waitForFunction(() => /Granska din nya version/.test(document.body.innerText), { timeout: 30000 }).catch(() => {})
          await vanta(1500)
          await bild(page, `${tag}-02-granskning`)
          const u = new URL(page.url())
          const text = await page.evaluate(() => document.body.innerText)
          const efter = await rakna(k.id)
          const rad = {
            roll,
            form,
            system,
            url: u.pathname + u.search,
            granskning: /Granska din nya version/.test(text),
            betalvagg: /Du har använt din CV-analys|Köp /.test(text) && !/Granska din nya version/.test(text),
            raderFore: fore.rader,
            raderEfter: efter.rader,
            raknareFore: fore.raknare,
            raknareEfter: efter.raknare,
            konsol: logg.konsol,
            http: logg.http,
          }
          ut.push(rad)
          if (!rad.granskning) fel(`${tag}: landade inte i granskningen (${rad.url})`)
          if (u.searchParams.get('steg') !== '5') fel(`${tag}: steg ${u.searchParams.get('steg')}, inte 5`)
          if (rad.betalvagg) fel(`${tag}: betalvägg i stället för analysen`)
          if (fore.rader !== efter.rader) fel(`${tag}: cv_analysis_jobs ${fore.rader} -> ${efter.rader}`)
          if (fore.raknare !== efter.raknare) fel(`${tag}: analysräknaren ${fore.raknare} -> ${efter.raknare}`)
          // Bakåt i flödet tre gånger (granskning, val, resultat) ska aldrig starta en analys.
          if (form === 'pixel7' && system === 'light') {
            for (let i = 0; i < 3; i++) {
              const tillbaka = await page.$('button[aria-label="Tillbaka"], button[aria-label="Föregående steg"], [data-flow-back]')
              if (!tillbaka) break
              await tillbaka.click()
              await vanta(1500)
            }
            await bild(page, `${tag}-03-bakat`)
            const u2 = new URL(page.url())
            const ef2 = await rakna(k.id)
            rad.bakatSteg = u2.searchParams.get('steg')
            if (ef2.rader !== fore.rader) fel(`${tag}: bakåt skapade en analysrad`)
            if (u2.searchParams.get('steg') === '2') fel(`${tag}: bakåt landade i steg 2 (analysen)`)
          }
          console.log(tag, JSON.stringify(rad).slice(0, 400))
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    // Bara de egna raderna, med id, räknade före delete.
    if (skapat.jobb) {
      const { count } = await sb.from('cv_analysis_jobs').select('*', { count: 'exact', head: true }).eq('id', skapat.jobb)
      await sb.from('cv_analysis_jobs').delete().eq('id', skapat.jobb)
      console.log(`  raderade cv_analysis_jobs ${skapat.jobb}: ${count}`)
    }
    if (skapat.cv) {
      const { count } = await sb.from('cv_texts').select('*', { count: 'exact', head: true }).eq('id', skapat.cv)
      await sb.from('cv_texts').delete().eq('id', skapat.cv)
      console.log(`  raderade cv_texts ${skapat.cv}: ${count}`)
    }
  }
}

async function delKlart(browser) {
  const ut = (resultat.klart = [])
  const id = KONTON.mycket?.dyn?.letter
  if (!id) return fel('klart: inget brev')
  for (const form of ['pixel7', 'desktop']) {
    for (const system of ['light', 'dark']) {
      const { page, logg } = await nySida(browser, { form, system, email: KONTON.mycket.email })
      try {
        await besok(page, `/dashboard/mina-brev/${id}?klart=1`)
        await vanta(1200)
        const tag = `klart-${form}-${sys(system)}`
        await bild(page, tag)
        await bild(page, `${tag}-hela`, true)
        const r = await page.evaluate(() => {
          const t = document.body.innerText
          const h1 = document.querySelector('h1')?.textContent?.trim() ?? null
          const steg = [...document.querySelectorAll('.steg')].map((e) => getComputedStyle(e).animationName)
          return {
            h1,
            eyebrow: /brevet klart/i.test(t),
            eyebrowFarg: (() => { const e = [...document.querySelectorAll(".text-ey")].find((x) => /brevet klart/i.test(x.textContent ?? "")); return e ? getComputedStyle(e).color : null })(),
            traffar: /Brevet täcker/.test(t),
            saknas: /saknas\./.test(t),
            laggTill: /Lägg till /.test(t),
            sparaSokt: /Spara som sökt tjänst/.test(t),
            steg,
          }
        })
        ut.push({ form, system, ...r, konsol: logg.konsol, http: logg.http })
        if (!r.eyebrow) fel(`${tag}: eyebrow Brevet klart saknas`)
        if (r.h1 !== 'Ditt brev till Klarna') fel(`${tag}: h1 ${r.h1}`)
        if (!r.traffar) fel(`${tag}: träffraden saknas`)
        if (!r.sparaSokt) fel(`${tag}: Spara som sökt tjänst saknas`)
        console.log(tag, JSON.stringify(r))
      } finally {
        await page.close()
      }
    }
  }
  // Rörelsen stängs av under prefers-reduced-motion.
  const { page } = await nySida(browser, { form: 'pixel7', system: 'light', email: KONTON.mycket.email, reducerad: true })
  try {
    await besok(page, `/dashboard/mina-brev/${id}?klart=1`)
    const steg = await page.evaluate(() => [...document.querySelectorAll('.steg')].map((e) => getComputedStyle(e).animationName))
    resultat.klartReducerad = steg
    if (steg.some((a) => a && a !== 'none')) fel(`klart reducerad: animation ${steg.join(',')}`)
    // Utan ?klart=1 ingen rörelse alls.
    await besok(page, `/dashboard/mina-brev/${id}`)
    resultat.utanKlart = await page.evaluate(() => ({ steg: document.querySelectorAll('.steg').length, eyebrow: /brevet klart/i.test(document.body.innerText) }))
  } finally {
    await page.close()
  }
}

async function delForstaRad(browser) {
  const ut = (resultat.forstarad = [])
  for (const system of ['light', 'dark']) {
    const { page, logg } = await nySida(browser, { form: 'desktop', system, email: KONTON.mycket.email })
    try {
      await besok(page, '/dashboard')
      const tag = `forstarad-desktop-${sys(system)}`
      await bild(page, tag)
      const r = await page.evaluate(() => {
        const vagg = document.querySelector('.vagg, [data-vagg]')
        const vaggBotten = vagg ? vagg.getBoundingClientRect().bottom : null
        const grid = [...document.querySelectorAll('main .grid')].find((g) => g.querySelector('section[aria-label="Nästa handling"]'))
        if (!grid) return { vaggBotten, kort: [] }
        const kort = [...grid.children].map((c) => {
          const s = c.matches('section') ? c : c.querySelector('section')
          const r = s?.getBoundingClientRect()
          return { label: s?.getAttribute('aria-label') ?? null, topp: r ? Math.round(r.top) : null, skugga: s ? getComputedStyle(s).boxShadow !== 'none' : false }
        })
        return { vaggBotten: vaggBotten ? Math.round(vaggBotten) : null, kort, aktivitet: /Det här har du gjort/.test(document.body.innerText) }
      })
      ut.push({ system, ...r, konsol: logg.konsol, http: logg.http })
      const toppar = new Set(r.kort.map((k) => k.topp))
      if (r.kort.length < 2) fel(`${tag}: färre än två kort i första raden`)
      if (toppar.size !== 1) fel(`${tag}: olika överkanter ${[...toppar].join(',')}`)
      if (r.vaggBotten !== null && r.kort[0] && Math.abs(r.vaggBotten - r.kort[0].topp - 30) > 2) fel(`${tag}: överkanten ${r.kort[0].topp} är inte 30 px över väggen ${r.vaggBotten}`)
      if (r.kort.some((k) => !k.skugga)) fel(`${tag}: ett kort i första raden är inte lyft`)
      if (r.aktivitet) fel(`${tag}: Det här har du gjort står kvar`)
      console.log(tag, JSON.stringify(r))
    } finally {
      await page.close()
    }
  }
}

async function delTomtCv(browser) {
  const ut = (resultat.tomtcv = [])
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light'], ['smal', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: KONTON.gratis.email })
    try {
      await besok(page, '/dashboard/profil/cv')
      const tag = `tomtcv-${form}-${sys(system)}`
      await bild(page, tag)
      const r = await page.evaluate(() => {
        const t = document.body.innerText
        const lyft = document.querySelector('section[aria-label="Ladda upp ett CV"]')
        return {
          uppladdningILyft: Boolean(lyft?.querySelector('input[type="file"]')),
          kopparLaddaUpp: [...document.querySelectorAll('.knapp-primar')].some((e) => /Ladda upp CV/.test(e.textContent ?? '')),
          fortroende: /GDPR-säkert|Krypterat och privat/.test(t),
          antalLaddaUpp: (t.match(/ladda upp/gi) ?? []).length,
        }
      })
      ut.push({ form, system, ...r, konsol: logg.konsol, http: logg.http })
      if (!r.uppladdningILyft) fel(`${tag}: uppladdningen står inte i lyftkortet`)
      if (r.kopparLaddaUpp) fel(`${tag}: kopparknappen Ladda upp CV står kvar`)
      if (r.fortroende) fel(`${tag}: förtroenderaden står kvar`)
      console.log(tag, JSON.stringify(r))
    } finally {
      await page.close()
    }
  }
}

async function delHem(browser) {
  const ut = (resultat.hem = [])
  for (const [form, system] of [['pixel7', 'light'], ['pixel7', 'dark'], ['desktop', 'light']]) {
    const { page, logg } = await nySida(browser, { form, system, email: KONTON.mycket.email })
    try {
      await besok(page, '/dashboard')
      const tag = `hem-${form}-${sys(system)}`
      await bild(page, `${tag}-hela`, true)
      const r = await page.evaluate(() => {
        const t = document.body.innerText
        const nasta = document.querySelector('section[aria-label="Nästa handling"]')
        return {
          aktivitet: /Det här har du gjort/.test(t),
          nastaTitel: nasta?.querySelector('h2')?.textContent?.trim() ?? null,
          nastaHref: nasta?.querySelector('.knapp-primar')?.getAttribute('href') ?? null,
          ansokan: /ansökan|ansökningar/i.test(t),
          vaggRad: document.querySelector('h1')?.parentElement?.innerText?.slice(0, 200) ?? null,
        }
      })
      ut.push({ form, system, ...r, konsol: logg.konsol, http: logg.http })
      if (r.aktivitet) fel(`${tag}: Det här har du gjort står kvar`)
      if (r.nastaTitel && /ansökan/.test(r.nastaTitel)) fel(`${tag}: Nästa handling säger ansökan`)
      console.log(tag, JSON.stringify(r))
    } finally {
      await page.close()
    }
  }
  for (const system of ['light', 'dark']) {
    const { page, logg } = await nySida(browser, { form: 'desktop', system, email: KONTON.mycket.email })
    try {
      await besok(page, '/dashboard/jobbmatchning')
      const tag = `jobbmatchning-desktop-${sys(system)}`
      await bild(page, tag)
      const kedja = await page.evaluate(() => document.querySelectorAll('.thread-chain').length)
      ut.push({ jobbmatchning: system, kedja, konsol: logg.konsol, http: logg.http })
      if (kedja) fel(`${tag}: .thread-chain finns kvar`)
    } finally {
      await page.close()
    }
  }
}

/* ------------------------------------------------------------------ kör */

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  if (kor('tomtcv')) await delTomtCv(browser)
  if (kor('aterupptagning')) await delAterupptagning(browser)
  if (kor('klart')) await delKlart(browser)
  if (kor('forstarad')) await delForstaRad(browser)
  if (kor('hem')) await delHem(browser)
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.fel.length} problem.`)
  for (const f of resultat.fel) console.log(' -', f)
}
