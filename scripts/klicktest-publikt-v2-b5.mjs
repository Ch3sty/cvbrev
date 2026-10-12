// scripts/klicktest-publikt-v2-b5.mjs
// Klicktest för publikt v2 del B, våg B5 (spec-publikt-v2-del-b avsnitt 6):
// Om oss, För rekryterare, Kontakt och textmallen (juridik, hjälpcenter).
//
//   node scripts/klicktest-publikt-v2-b5.mjs --port 8305
//
// Pixel 7 (412 × 915) och 1280 × 800 i ljust läge, plus en skärmdump i mörkt
// läge per sidtyp. Skärmdumpar bara en per sidtyp och vid fel, i
// docs/qa/publikt-v2-b/vagB5. Kontaktformuläret skickas från ett eget
// testkonto som skapas här och raderas med sitt id efteråt (räknas före
// delete, docs: feedback_testdata_stadning). Den inloggade vägen skriver
// ingen rad i public_rate_limits.

import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const arg = (n, f) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const BAS = `http://localhost:${arg('port', '8305')}`
const UT = 'docs/qa/publikt-v2-b/vagB5'
fs.mkdirSync(UT, { recursive: true })

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

const ENHETER = {
  pixel7: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
}
const SIDTYPER = [
  { typ: 'om-oss', sida: '/om-oss' },
  { typ: 'for-rekryterare', sida: '/for-rekryterare' },
  { typ: 'kontakt', sida: '/kontakt' },
  { typ: 'textmall', sida: '/integritetspolicy' },
  { typ: 'hjalpcenter', sida: '/hjalpcenter' },
]

const rader = []
let fel = 0
const ok = (s) => rader.push(`- ok: ${s}`)
const brott = (s) => {
  fel++
  rader.push(`- FEL: ${s}`)
}
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
let bildNr = 0
async function bild(p, namn) {
  bildNr++
  const fil = `${UT}/${String(bildNr).padStart(2, '0')}-${namn}.jpg`
  await p.screenshot({ path: fil, type: 'jpeg', quality: 60, fullPage: true })
  return fil
}

async function nySida(browser, enhet, tema = 'light') {
  const p = await browser.newPage()
  await p.setViewport(ENHETER[enhet])
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }])
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS })
  return p
}

async function ga(p, sida) {
  const svar = await p.goto(BAS + sida, { waitUntil: 'load', timeout: 90000 })
  await vanta(300)
  return svar?.status() ?? 0
}

/** Kontrollerna i varje sida (avsnitt 6): bredd, minsta text, husreglerna. */
async function kontroll(p, etikett) {
  const r = await p.evaluate(() => {
    const main = document.querySelector('main')
    const text = (main?.innerText ?? '').replace(/\s+/g, ' ')
    const sma = []
    for (const el of main ? main.querySelectorAll('*') : []) {
      if (el.closest('.pub-tel, .pub-telefon, [aria-hidden="true"]')) continue
      const harText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      if (!harText) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const fs = parseFloat(cs.fontSize)
      if (fs < 12) sma.push(`${el.tagName.toLowerCase()} ${fs}px "${el.textContent.trim().slice(0, 30)}"`)
    }
    return {
      sw: document.documentElement.scrollWidth,
      bredd: window.innerWidth,
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      mittpunkt: /·/.test(text) || /·/.test(document.querySelector('footer')?.innerText ?? ''),
      talstreck: /—/.test(text),
      sma: sma.slice(0, 5),
    }
  })
  if (r.sw > r.bredd) brott(`${etikett}: scrollWidth ${r.sw} > ${r.bredd}`)
  if (r.h1.length !== 1) brott(`${etikett}: ${r.h1.length} h1`)
  if (r.mittpunkt) brott(`${etikett}: mittpunkt i main eller sidfot`)
  if (r.talstreck) brott(`${etikett}: talstreck i main`)
  if (r.sma.length) brott(`${etikett}: text under 12 px: ${r.sma.join('; ')}`)
  if (r.sw <= r.bredd && r.h1.length === 1 && !r.mittpunkt && !r.talstreck && !r.sma.length) {
    ok(`${etikett}: bredd ${r.sw}/${r.bredd}, en h1 "${r.h1[0]}", inga mittpunkter, talstreck eller text under 12 px`)
  }
}

async function klickTill(p, selektor, vantadVag, etikett) {
  const el = await p.$(selektor)
  if (!el) return brott(`${etikett}: hittar inte ${selektor}`)
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => {}), el.click()])
  await vanta(400)
  const vag = new URL(p.url()).pathname
  if (vantadVag instanceof RegExp ? vantadVag.test(vag) : vag === vantadVag) ok(`${etikett}: ${vag}`)
  else {
    brott(`${etikett}: hamnade på ${vag}`)
    await bild(p, `fel-${etikett.replace(/\W+/g, '-')}`)
  }
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox'],
  })
  try {
    for (const enhet of ['pixel7', 'desktop']) {
      rader.push(`\n### ${enhet} (${ENHETER[enhet].width} × ${ENHETER[enhet].height}), ljust`)
      const p = await nySida(browser, enhet)
      for (const { typ, sida } of SIDTYPER) {
        const status = await ga(p, sida)
        if (status !== 200 && status !== 304) brott(`${sida}: status ${status}`)
        await kontroll(p, `${enhet} ${sida}`)
        if (enhet === 'pixel7') await bild(p, `pixel7-ljus-${typ}`)
      }

      // Om oss: hjältens knapp.
      await ga(p, '/om-oss')
      await klickTill(p, '#hjalte a[data-primar]', '/funktioner', `${enhet} Om oss "Se våra verktyg"`)

      // För rekryterare: hjältens knapp, en insikt och FAQ.
      await ga(p, '/for-rekryterare')
      const knappBotten = await p.$eval('#hjalte a[data-primar]', (e) => e.getBoundingClientRect().bottom + scrollY)
      if (enhet === 'pixel7') ok(`pixel7 rekryterare: hjältens knapp slutar på ${Math.round(knappBotten)} px`)
      await klickTill(p, '#hjalte a[data-primar]', '/rekryterare/registrera', `${enhet} rekryterare "Skapa rekryterarkonto"`)
      await ga(p, '/for-rekryterare')
      const insikter = await p.$$eval('.if-insikter a', (as) => as.map((a) => a.getAttribute('href')))
      if (insikter.length === 6) ok(`${enhet} rekryterare: sex insiktslänkar`)
      else brott(`${enhet} rekryterare: ${insikter.length} insiktslänkar`)
      await klickTill(p, '.if-insikter a', /^\/for-rekryterare\/insikter\/.+/, `${enhet} rekryterare första insikten`)
      const insiktH1 = await p.$eval('h1', (h) => h.textContent.trim()).catch(() => '')
      if (insiktH1) ok(`${enhet} insikten har h1 "${insiktH1.slice(0, 60)}"`)
      else brott(`${enhet} insikten saknar h1`)
      await ga(p, '/for-rekryterare')
      await klickTill(p, '.ib-rubrikrad a.pub-lank', '/for-rekryterare/insikter', `${enhet} rekryterare "Alla insikter"`)
      await ga(p, '/for-rekryterare')
      const faq = await p.evaluate(async () => {
        const d = document.querySelectorAll('.pub-faq details')[1]
        d.scrollIntoView({ block: 'center' })
        d.querySelector('summary').click()
        await new Promise((r) => setTimeout(r, 200))
        const svar = d.querySelector('p')
        return { antal: document.querySelectorAll('.pub-faq details').length, oppen: d.open, hojd: svar.getBoundingClientRect().height }
      })
      if (faq.antal === 11 && faq.oppen && faq.hojd > 0) ok(`${enhet} rekryterare FAQ: 11 frågor, fråga 2 öppnas och svaret syns`)
      else brott(`${enhet} rekryterare FAQ: ${JSON.stringify(faq)}`)

      // Textmallen: innehållsförteckningen (dator) och sidfotens cookielänk.
      await ga(p, '/integritetspolicy')
      if (enhet === 'desktop') {
        await p.click('.if-jur-toc a[href="#cookies"]')
        await vanta(1500)
        const top = await p.$eval('#cookies', (h) => Math.round(h.getBoundingClientRect().top))
        if (top >= 0 && top < 200) ok(`desktop textmall: innehållsförteckningen hoppar till #cookies (top ${top} px)`)
        else brott(`desktop textmall: #cookies hamnade på ${top} px`)
      }
      await ga(p, '/om-oss')
      await klickTill(p, 'footer a[href="/integritetspolicy#cookies"]', '/integritetspolicy', `${enhet} sidfotens "Cookies"`)
      const harCookies = await p.$('#cookies')
      if (harCookies) ok(`${enhet} #cookies finns i integritetspolicyn`)
      else brott(`${enhet} #cookies saknas`)

      // Hjälpcentret: ett länkkort.
      await ga(p, '/hjalpcenter')
      await klickTill(p, '.if-hjalpkort a[href="/verktyg/personligt-brev"]', '/verktyg/personligt-brev', `${enhet} hjälpcentrets kort "Personliga brev"`)
      await p.close()
    }

    // Mörkt läge, en skärmdump per sidtyp.
    rader.push('\n### pixel7, mörkt')
    const m = await nySida(browser, 'pixel7', 'dark')
    for (const { typ, sida } of SIDTYPER) {
      await ga(m, sida)
      await kontroll(m, `mörkt ${sida}`)
      await bild(m, `pixel7-mork-${typ}`)
    }
    await m.close()

    // 360 px: hjältens knapp inom 640 px.
    rader.push('\n### 360 × 800')
    const s = await browser.newPage()
    await s.setViewport({ width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await s.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS })
    for (const sida of ['/om-oss', '/for-rekryterare']) {
      await ga(s, sida)
      const b = await s.$eval('#hjalte a[data-primar]', (e) => Math.round(e.getBoundingClientRect().bottom))
      if (b <= 640) ok(`360 ${sida}: hjältens knapp slutar på ${b} px`)
      else brott(`360 ${sida}: hjältens knapp slutar på ${b} px`)
      await kontroll(s, `360 ${sida}`)
    }
    const kf = await (async () => {
      await ga(s, '/kontakt')
      return s.$eval('#name', (e) => Math.round(e.getBoundingClientRect().top))
    })()
    if (kf <= 640) ok(`360 /kontakt: formulärets första fält börjar på ${kf} px`)
    else brott(`360 /kontakt: formulärets första fält börjar på ${kf} px`)
    await s.close()

    // Kontaktformuläret från ett eget testkonto.
    rader.push('\n### Kontaktformuläret, inloggat testkonto (pixel7)')
    const email = `qa-b5-kontakt-${Date.now()}@jobbcoach-qa.test`
    const losen = 'QaB5Kontakt!2026-10-12'
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: losen,
      email_confirm: true,
      user_metadata: { full_name: 'QA B5 Kontakt' },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    fs.writeFileSync(`${UT}/testkonto.json`, JSON.stringify({ email, userId }, null, 2))
    try {
      const k = await nySida(browser, 'pixel7')
      await ga(k, '/login')
      await k.waitForSelector('input[type="email"]')
      await k.type('input[type="email"]', email)
      await k.type('input[type="password"]', losen)
      await Promise.all([
        k.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => {}),
        k.click('button[type="submit"]'),
      ])
      await vanta(1500)
      ok(`inloggad, landade på ${new URL(k.url()).pathname}`)
      await ga(k, '/kontakt')
      await k.type('#name', 'QA B5 Kontakt')
      await k.type('#email', email)
      await k.type('#subject', 'QA-test av kontaktformuläret, publikt v2 B5')
      await k.type('#message', 'Automatiskt klicktest av /kontakt (våg B5). Inget att svara på.')
      const [svar] = await Promise.all([
        k.waitForResponse((r) => r.url().endsWith('/api/contact'), { timeout: 60000 }),
        k.click('.if-form button[type="submit"]'),
      ])
      await vanta(800)
      const status = await k.$eval('[role="status"], [role="alert"]', (e) => `${e.getAttribute('role')}: ${e.textContent.trim()}`).catch(() => 'inget')
      if (svar.status() === 200 && status.startsWith('status')) ok(`/api/contact ${svar.status()}, "${status}"`)
      else {
        brott(`/api/contact ${svar.status()}, ${status}`)
        await bild(k, 'fel-kontakt')
      }
      await k.close()
    } finally {
      // Bara det egna kontot, med id. Räkna före delete.
      const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', userId)
      const { error: dErr } = await admin.auth.admin.deleteUser(userId)
      const { count: efter } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', userId)
      if (dErr || efter) brott(`testkontot ${userId} raderades inte: ${dErr?.message ?? `profiler kvar ${efter}`}`)
      else ok(`testkontot ${userId} raderat med sitt id (profiler före ${pc}, efter 0)`)
      fs.renameSync(`${UT}/testkonto.json`, `${UT}/testkonto-raderat.json`)
    }
  } finally {
    await browser.close()
  }
  const rapport = `# Klicktest publikt v2 våg B5\n\nKört ${new Date().toISOString()} mot ${BAS} (lokalt produktionsbygge), Chrome via puppeteer-core.\n\nFel: ${fel}\n${rader.join('\n')}\n`
  fs.writeFileSync(`${UT}/resultat.md`, rapport)
  console.log(rapport)
  process.exit(fel ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
