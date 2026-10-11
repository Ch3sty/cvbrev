// scripts/qa-rummen-vag2.mjs
// Klicktest av Rummen våg 2 i riktig Chrome: hemvyn i Rekryteringstester i
// alla tillstånd via förhandsvisningen (fixturdata, konceptets exempeltal),
// ingången E1 till E3 och E3-P, och nätverksfel på PUT /api/traning/plan.
// Pixel 7 (412 px) och 1280, ljust och mörkt, en skärmdump per tillstånd
// och steg.
//
//   SCRATCH=<tmp> node scripts/qa-rummen-vag2-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-rummen-vag2.mjs --port 3492 [--bara hem,ingang,natfel] [--tillstand 1b,1c]
//   SCRATCH=<tmp> node scripts/qa-rummen-vag2-konton.mjs radera
//
// Förhandsvisningen finns bara i utveckling eller med TRANING_FORHANDSVISNING=1.
// Resultat: docs/qa/rummen/vag-2/ (skärmdumpar och resultat.json).

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

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
function arg(namn, fallback) {
  const i = process.argv.indexOf('--' + namn)
  return i >= 0 ? process.argv[i + 1] : fallback
}
const PORT = arg('port', '3492')
const BAS = `http://localhost:${PORT}`
const BARA = arg('bara') ? arg('bara').split(',') : null
const kor = (d) => !BARA || BARA.includes(d)
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-2'))
fs.mkdirSync(UT, { recursive: true })
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-rummen-vag2-konton.json`, 'utf8'))

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) =>
  fs.existsSync(p)
)
const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const BRUS = [/favicon/, /posthog/i, /_vercel/, /hot-update/, /webpack-hmr/, /React DevTools/, /__nextjs/]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
const cache = new Map()
async function payloadFor(email) {
  if (cache.has(email)) return cache.get(email)
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const p =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: s.session.access_token,
        refresh_token: s.session.refresh_token,
        expires_at: s.session.expires_at,
        expires_in: s.session.expires_in,
        token_type: 'bearer',
        user: s.session.user,
      })
    ).toString('base64')
  cache.set(email, p)
  return p
}

export async function nySida(browser, { form, system, email }) {
  const page = await browser.newPage()
  if (form === 'pixel7') await page.emulate(PIXEL)
  else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  const cdp = await page.createCDPSession()
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
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
    if (m.type() === 'error') {
      const t = m.text()
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(t.slice(0, 300))
    }
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  return { page, logg }
}

async function besok(page, url) {
  await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 120000 })
  await page.reload({ waitUntil: 'networkidle0', timeout: 120000 })
  await vanta(1400)
}

/** Kontrollerna per vy: kopparknapp i bild, exakt en, aldrig på väggen, inga streck, axeltextens renderade storlek. */
async function kontroll(page, form) {
  return page.evaluate((form) => {
    const synlig = (el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
    }
    const koppar = [...document.querySelectorAll('.knapp-primar')].filter((k) => synlig(k))
    const kr = koppar[0]?.getBoundingClientRect()
    const vagg = document.querySelector('main .vagg')
    const kopparPaVagg = vagg ? [...vagg.querySelectorAll('.knapp-primar')].filter(synlig).length : 0
    const text = document.querySelector('main')?.innerText ?? ''
    const svgText = [...document.querySelectorAll('svg.kurva text, svg.skala text')]
      .filter((t) => synlig(t))
      .map((t) => {
        const svg = t.ownerSVGElement
        const vb = svg.viewBox.baseVal.width
        const fs = parseFloat(getComputedStyle(t).fontSize)
        return Math.round(fs * (svg.getBoundingClientRect().width / vb) * 10) / 10
      })
    const axHtml = [...document.querySelectorAll('.text-ax')].filter(synlig).map((e) => parseFloat(getComputedStyle(e).fontSize))
    return {
      tillstand: document.querySelector('[data-tillstand]')?.getAttribute('data-tillstand') ?? null,
      ram: document.querySelector('[data-ram]')?.getAttribute('data-ram') ?? null,
      h1: [...document.querySelectorAll('h1')].filter(synlig).map((h) => h.textContent.trim().slice(0, 80)),
      kopparknappar: koppar.length,
      kopparTexter: koppar.map((k) => k.textContent.trim()),
      kopparIBild: kr ? kr.top >= 0 && kr.bottom <= innerHeight : null,
      kopparPaVagg,
      nav: form === 'desktop' ? null : synlig(document.querySelector('nav[aria-label="Huvudmeny"]')),
      sidomeny: form === 'desktop' ? synlig(document.querySelector('nav[aria-label="Sidomeny"]')) : null,
      topprad: synlig(document.querySelector('[data-topprad]')),
      streck: /(^|\s)[–—-](\s|$)/m.test(text),
      nollProcent: /\b0 ?%/.test(text),
      emDash: text.includes('—'),
      svgTextMin: svgText.length ? Math.min(...svgText) : null,
      svgTextMax: svgText.length ? Math.max(...svgText) : null,
      axHtml: axHtml.length ? [Math.min(...axHtml), Math.max(...axHtml)] : null,
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      motion: !!document.querySelector('.motion'),
    }
  }, form)
}

const resultat = { bas: BAS, tid: new Date().toISOString(), hem: [], ingang: [], natfel: [] }
const RESULTATFIL = path.join(UT, BARA ? `resultat-${BARA.join('-')}.json` : 'resultat.json')
function spara() {
  fs.writeFileSync(RESULTATFIL, JSON.stringify(resultat, null, 2))
}

const MOBIL = ['T1', 'T1s', '1a', '1as', '1t', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1p', 'X1', 'L1', 'F1']
const DATORLISTA = ['W1', 'W2', 'W3', 'W4', 'T1', 'T1s', '1t', '1c', '1e', '1g', '1h', '1i', '1p', 'X1', 'L1', 'F1']
const FILTER = arg('tillstand') ? arg('tillstand').split(',') : null
const SYSTEM = arg('system') ? arg('system').split(',') : ['light', 'dark']
const FORMER = arg('former') ? arg('former').split(',') : ['pixel7', 'desktop']

/** Hela vyn i en bild: main rullar i skalet, så den fälls ut före skärmdumpen. */
async function helBild(page, fil) {
  await page.evaluate(() => {
    const m = document.querySelector('main')
    if (m) {
      m.style.overflow = 'visible'
      m.style.height = 'auto'
      m.style.flex = 'none'
    }
    for (const e of document.querySelectorAll('div')) {
      const s = getComputedStyle(e)
      if (s.overflowY === 'auto' || s.overflowY === 'hidden') {
        if (e.closest('main') || e.contains(document.querySelector('main'))) {
          e.style.overflow = 'visible'
          e.style.height = 'auto'
        }
      }
    }
    document.documentElement.style.overflow = 'visible'
    document.body.style.overflow = 'visible'
  })
  await vanta(300)
  await page.screenshot({ path: fil, fullPage: true })
}

async function delHem(browser) {
  const mapp = path.join(UT, 'hem')
  fs.mkdirSync(mapp, { recursive: true })
  for (const system of SYSTEM) {
    for (const form of FORMER) {
      const lista = (form === 'desktop' ? DATORLISTA : MOBIL).filter((t) => !FILTER || FILTER.includes(t))
      for (const t of lista) {
        const { page, logg } = await nySida(browser, { form, system, email: KONTON.mycket.email })
        const fil = `${t}-${form}-${system === 'dark' ? 'morkt' : 'ljust'}.png`
        try {
          await besok(page, t === 'F1' ? '/dashboard/tester/forhandsvisning?tillstand=1b&sida=kurvan' : `/dashboard/tester/forhandsvisning?tillstand=${t}`)
          const k = await kontroll(page, form)
          await page.screenshot({ path: path.join(mapp, fil) })
          await helBild(page, path.join(mapp, fil.replace('.png', '-hela.png')))
          resultat.hem.push({ t, form, system, ...k, konsol: logg.konsol, http: logg.http, fil })
          console.log(
            `${t} ${form} ${system}`,
            JSON.stringify({ ram: k.ram, h1: k.h1, koppar: k.kopparknappar, iBild: k.kopparIBild, vagg: k.kopparPaVagg, svg: [k.svgTextMin, k.svgTextMax], ax: k.axHtml, streck: k.streck, fel: [...logg.konsol, ...logg.http] })
          )
        } catch (e) {
          resultat.hem.push({ t, form, system, fel: String(e.message), konsol: logg.konsol, http: logg.http })
          console.log('FEL', t, form, system, e.message)
        }
        spara()
        await page.close()
      }
    }
  }
}

async function klicka(page, re) {
  const ok = await page.evaluate(
    (src, flags) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll('button, a, [role="checkbox"], [role="radio"]')].find(
        (e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.getClientRects().length > 0 && !e.disabled
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    re.flags
  )
  if (!ok) throw new Error(`hittade inte ${re}`)
  await vanta(700)
}

async function delIngang(browser) {
  const mapp = path.join(UT, 'ingang')
  fs.mkdirSync(mapp, { recursive: true })
  for (const system of SYSTEM) {
    for (const form of FORMER) {
      const tag = `${form}-${system === 'dark' ? 'morkt' : 'ljust'}`
      const steg = []
      const { page, logg } = await nySida(browser, { form, system, email: KONTON.gratis.email })
      const bild = async (namn) => page.screenshot({ path: path.join(mapp, `${namn}-${tag}.png`) })
      const iBild = () =>
        page.evaluate(() => {
          const k = [...document.querySelectorAll('.knapp-primar')].find((e) => e.getClientRects().length > 0)
          if (!k) return null
          const r = k.getBoundingClientRect()
          return r.top >= 0 && r.bottom <= innerHeight
        })
      try {
        // Ny användare som valde tester: hemvyn skickar till ingången (första vyn).
        await besok(page, '/dashboard/tester')
        const u = new URL(page.url())
        steg.push({ steg: 'landning', url: u.pathname + u.search, tillstand: await page.evaluate(() => document.querySelector('[data-ram]')?.getAttribute('data-ram') ?? null) })
        await bild('landning')
        // Mot en databas utan test_planer står hemvyn i felet (X1); ingången öppnas direkt som första vy.
        if (!u.pathname.includes('installningar')) await besok(page, '/dashboard/tester/installningar?forsta=1')
        await bild('E1')
        steg.push({ steg: 'E1', kopparIBild: await iBild(), utgang: await page.evaluate(() => [...document.querySelectorAll('button, a')].some((e) => /Stäng|Avsluta/.test(e.getAttribute('aria-label') || ''))) })
        await klicka(page, /^Figurer och mönster/)
        await bild('E1-vald')
        await klicka(page, /^Fortsätt$/)
        await bild('E2')
        steg.push({ steg: 'E2', kopparIBild: await iBild(), hoppaOver: await page.evaluate(() => /Hoppa över/.test(document.body.innerText)) })
        await klicka(page, /^Matrigma/)
        await bild('E2-matrigma')
        await klicka(page, /^Fortsätt$/)
        await bild('E3')
        await klicka(page, /^Om två veckor$/)
        await bild('E3-tva-veckor')
        steg.push({
          steg: 'E3',
          kopparIBild: await iBild(),
          hoppaOver: await page.evaluate(() => /Hoppa över, jag vet inte än/.test(document.body.innerText)),
          plan: await page.evaluate(() => document.querySelector('[data-plantext]')?.textContent ?? null),
        })
        // Spara: test_planer finns inte i prod än, så svaret är ett fel och UI:t får aldrig säga "sparat".
        await klicka(page, /^Visa min plan$/)
        await vanta(2500)
        await bild('E3-spara')
        steg.push({
          steg: 'spara',
          url: new URL(page.url()).pathname,
          felVisas: await page.evaluate(() => /gick inte att spara/i.test(document.body.innerText)),
          sparatText: await page.evaluate(() => /\bsparat\b/i.test(document.body.innerText)),
        })
        // E3-P: bara personlighet.
        await besok(page, '/dashboard/tester/installningar?steg=1')
        await klicka(page, /^Personlighet/)
        await bild('E3P-val')
        await klicka(page, /^Fortsätt$/)
        await bild('E3P')
        steg.push({ steg: 'E3-P', text: await page.evaluate(() => document.querySelector('main')?.innerText.slice(0, 500)) })
      } catch (e) {
        steg.push({ fel: String(e.message) })
        await bild('fel').catch(() => {})
      }
      resultat.ingang.push({ form, system, steg, konsol: logg.konsol, http: logg.http })
      console.log('ingang', tag, JSON.stringify(steg).slice(0, 1200), JSON.stringify(logg))
      spara()
      await page.close()
    }
  }
}

/** Nätverksfel på PUT /api/traning/plan: felet visas, aldrig "sparat". */
async function delNatfel(browser) {
  const mapp = path.join(UT, 'natfel')
  fs.mkdirSync(mapp, { recursive: true })
  const { page, logg } = await nySida(browser, { form: 'pixel7', system: 'light', email: KONTON.hela.email })
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    if (r.url().includes('/api/traning/plan') && r.method() === 'PUT') r.abort('failed')
    else r.continue()
  })
  const ut = {}
  try {
    await besok(page, '/dashboard/tester/installningar?steg=3')
    await klicka(page, /^Om en vecka$/)
    await klicka(page, /^Visa min plan$/)
    await vanta(1500)
    await page.screenshot({ path: path.join(mapp, 'put-plan-natfel-pixel7.png') })
    ut.felVisas = await page.evaluate(() => /gick inte att spara/i.test(document.body.innerText))
    ut.sparat = await page.evaluate(() => /\bsparat\b/i.test(document.body.innerText))
    ut.kvarPaSidan = new URL(page.url()).pathname
  } catch (e) {
    ut.fel = String(e.message)
  }
  resultat.natfel.push({ ...ut, konsol: logg.konsol })
  console.log('natfel', JSON.stringify(ut))
  spara()
  await page.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
try {
  if (kor('hem')) await delHem(browser)
  if (kor('ingang')) await delIngang(browser)
  if (kor('natfel')) await delNatfel(browser)
} finally {
  await browser.close()
  spara()
}
