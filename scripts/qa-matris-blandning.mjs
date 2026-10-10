// scripts/qa-matris-blandning.mjs
//
// Klicktest för blandade svarsalternativ i matrislogiken
// (fix/matris-blanda-alternativ). Riktig Chrome, Pixel 7 och desktop, en
// skärmdump per steg i docs/qa/matris-blandning/.
//
//   SCRATCH=<tmp> BAS=http://localhost:3492 node scripts/qa-matris-blandning.mjs test grund pixel7 a
//   SCRATCH=<tmp> BAS=http://localhost:3492 node scripts/qa-matris-blandning.mjs test expert desktop a
//   SCRATCH=<tmp> BAS=http://localhost:3492 node scripts/qa-matris-blandning.mjs smakprov pixel7
//   SCRATCH=<tmp> BAS=http://localhost:3491 BLANDAD=0 node scripts/qa-matris-blandning.mjs gammal desktop a
//
// BLANDAD=1 (standard): servern förväntas blanda (meta.alternativ_blandade,
// eller QA_BLANDA_ALLA_SESSIONER=1 på en lokal dev-server före migreringen).
// BLANDAD=0: servern förväntas visa bankens ordning (gamla sessioner, eller
// ett bygge utan kolumnen).
//
// Skriptet räknar fram var rätt svar ska stå ur sessionId med samma urval
// och samma blandning som appen (scripts/lib/blanda-alternativ.mjs), klickar
// på den positionen och kontrollerar att servern gav rätt, att svaret står
// kvar efter omladdning och att genomgången visar samma bokstäver.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { alternativSeed, blandadPermutation, hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

const BAS = process.env.BAS || 'http://localhost:3492'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const BLANDAD = process.env.BLANDAD !== '0'
const UT = process.env.UT || 'docs/qa/matris-blandning'
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = `${UT}/resultat.jsonl`
const ANON = `${SCRATCH}/qa-matris-anon-tokens.json`

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
const KONTON = fs.existsSync(`${SCRATCH}/qa-matris-konton.json`)
  ? JSON.parse(fs.readFileSync(`${SCRATCH}/qa-matris-konton.json`, 'utf8'))
  : {}

const BANK = {
  grund: JSON.parse(fs.readFileSync('src/lib/logicTestV7/questionBankGrund.v7.json', 'utf8')),
  expert: JSON.parse(fs.readFileSync('src/lib/logicTestV7/questionBankExpert.v7.json', 'utf8')),
}

const [floede, ...args] = process.argv.slice(2)
const niva = floede === 'test' ? args[0] : 'grund'
const vy = floede === 'test' ? args[1] : args[0]
const kontoNamn = floede === 'test' ? args[2] : args[1]
const konto = KONTON[kontoNamn]
const prefix = `${floede}${floede === 'test' ? '-' + niva : ''}-${vy}${kontoNamn ? '-' + kontoNamn : ''}`
let nr = 0
const fel = []
const natfel = []

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const bokstav = (i) => String.fromCharCode(65 + i)
const UA_MOBIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const VY = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 }, ua: UA_DESKTOP },
}

function logg(steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), floede: prefix, bas: BAS, blandad: BLANDAD, steg, ok, ...data }
  fs.appendFileSync(RESULTAT, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 700)}`)
}

async function bild(p, namn) {
  nr += 1
  const fil = path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`)
  await p.screenshot({ path: fil }).catch(() => {})
}

async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 180000 })
  await vanta(800)
}

async function klickaText(p, re, sel = 'button, a, [role="button"]') {
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

async function vantaText(p, re, timeout = 90000) {
  await p.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body.innerText), { timeout }, re.source, re.flags)
}

async function loggaIn(p) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}),
    p.click('button[type="submit"]'),
  ])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 90000 })
  await vanta(1500)
}

/** Samma urval som selectQuestionsForSession. */
function urval(pool, sessionId, n) {
  const s = [...pool]
  const rng = mulberry32(hashString(sessionId))
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n)
}

/** Per fråga: id, originalfacit, permutation och var rätt svar ska stå. */
function forvantat(pool, sessionId, n, blandad) {
  return urval(pool, sessionId, n).map((q) => {
    const perm = blandad
      ? blandadPermutation(alternativSeed(sessionId, q.id), q.options.length)
      : q.options.map((_, i) => i)
    return { id: q.id, facit: q.correctAnswer, perm, rattVisat: perm.indexOf(q.correctAnswer) }
  })
}

/** Fingeravtryck av alternativen som visas: en kort hash per ruta. */
async function avtryck(p) {
  const html = await p.$$eval('button[aria-label^="Svarsalternativ"]', (b) =>
    b.filter((e) => e.offsetParent !== null).map((e) => e.querySelector('svg')?.innerHTML ?? '')
  )
  return html.map((h) => createHash('sha1').update(h).digest('hex').slice(0, 8))
}

async function valdBokstav(p) {
  return p.$$eval('button[aria-label^="Svarsalternativ"][aria-pressed="true"]', (b) =>
    b.filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('aria-label').slice(-1))
  )
}

async function klickaAlternativ(p, i) {
  await p.waitForSelector(`button[aria-label="Svarsalternativ ${bokstav(i)}"]:not([disabled])`, { timeout: 30000 })
  await p.evaluate((l) => {
    const b = [...document.querySelectorAll(`button[aria-label="Svarsalternativ ${l}"]`)].find((e) => e.offsetParent !== null)
    b.scrollIntoView({ block: 'center' })
    b.click()
  }, bokstav(i))
}

async function vantaSvar(p) {
  return p
    .waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 })
    .then((r) => r.status())
}

/** Läser genomgångens etiketter för en rad (öppnar den). */
async function genomgangsRad(p, i) {
  return p.evaluate(async (i) => {
    const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
    const knapp = sek?.querySelectorAll('li > button')[i]
    if (!knapp) return null
    if (knapp.getAttribute('aria-expanded') !== 'true') knapp.click()
    await new Promise((r) => setTimeout(r, 400))
    const li = knapp.parentElement
    const text = li.innerText
    return {
      status: (text.match(/\b(Rätt|Fel|Hoppad)\b/) || [])[1] ?? null,
      ditt: (text.match(/Ditt svar \(([A-F])\)/) || [])[1] ?? null,
      ratt: (text.match(/Rätt svar \(([A-F])\)/) || [])[1] ?? null,
    }
  }, i)
}

/* --------------------------- Flödena --------------------------- */

async function testFlode(p) {
  const slug = `matrislogik-${niva}`
  await loggaIn(p)
  await ga(p, `/dashboard/tester/${slug}`)
  await bild(p, 'hubb')
  await klickaText(p, /^(Starta testet|Gör om testet)$/)
  await p.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
  const sessionId = p.url().split('/test/')[1].split(/[/?#]/)[0]
  await vantaText(p, /Välj rätt svar/i)
  await vanta(800)
  await bild(p, 'fraga-1')
  const fv = forvantat(BANK[niva], sessionId, 15, BLANDAD)
  logg('session startad', true, {
    sessionId,
    rattPosition: fv.map((f) => bokstav(f.rattVisat)).join(''),
    frageId: fv.map((f) => f.id),
  })
  const avtryckPerFraga = {}

  // Fråga 1-3: rätt position enligt blandningen.
  for (let i = 0; i < 3; i++) {
    avtryckPerFraga[fv[i].id] = await avtryck(p)
    const svar = vantaSvar(p)
    await klickaAlternativ(p, fv[i].rattVisat)
    logg(`fråga ${i + 1}: klick på ${bokstav(fv[i].rattVisat)}`, (await svar) === 200)
    await vanta(700)
  }
  // Fråga 4 är nu aktuell. Avtryck, ladda om, jämför.
  const fore = await avtryck(p)
  await bild(p, 'fraga-4-fore-omladdning')
  await p.reload({ waitUntil: 'networkidle2', timeout: 180000 })
  await vantaText(p, /Välj rätt svar/i)
  await vanta(800)
  await bild(p, 'fraga-4-efter-omladdning')
  const efter = await avtryck(p)
  const fragaText = await p.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
  logg('omladdning: samma fråga och samma ordning', fragaText === '4' && JSON.stringify(fore) === JSON.stringify(efter), {
    fragaText,
    fore,
    efter,
  })
  // Tillbaka till fråga 1: det valda alternativet ska stå kvar på samma bokstav.
  for (let i = 0; i < 3; i++) {
    await p.keyboard.press('ArrowLeft')
    await vanta(350)
  }
  const vald1 = await valdBokstav(p)
  await bild(p, 'fraga-1-efter-omladdning')
  logg('omladdning: fråga 1 har kvar sitt val', vald1[0] === bokstav(fv[0].rattVisat), {
    vald: vald1,
    vantat: bokstav(fv[0].rattVisat),
  })
  for (let i = 0; i < 3; i++) {
    await p.keyboard.press('ArrowRight')
    await vanta(350)
  }

  // Fråga 4: fel med flit. Fråga 5-15: rätt.
  const felPos = (fv[3].rattVisat + 1) % 6
  for (let i = 3; i < 15; i++) {
    avtryckPerFraga[fv[i].id] = await avtryck(p)
    const pos = i === 3 ? felPos : fv[i].rattVisat
    const svar = vantaSvar(p)
    await klickaAlternativ(p, pos)
    const st = await svar
    if (st !== 200) logg(`fråga ${i + 1}: svar sparades inte`, false, { status: st })
    await vanta(700)
  }
  await bild(p, 'sista-fragan')
  logg('alla 15 besvarade', true, { felPaFraga4: bokstav(felPos) })

  // Databasen: originalindex i selected, visad position i visat.
  const { data: rad } = await admin.from('logic_test_v4_sessions').select('answers').eq('id', sessionId).single()
  const kontroll = fv.map((f, i) => {
    const a = rad.answers.find((x) => x.q_id === f.id)
    const visat = i === 3 ? felPos : f.rattVisat
    return {
      ok: !!a && a.visat === visat && a.selected === f.perm[visat] && a.correct === (i !== 3),
      id: f.id,
      selected: a?.selected,
      visat: a?.visat,
      correct: a?.correct,
    }
  })
  logg('databasen: selected = originalindex, visat = klickad position, rätt rättat', kontroll.every((k) => k.ok), {
    fel: kontroll.filter((k) => !k.ok),
    exempel: kontroll.slice(2, 5),
  })

  await klickaText(p, /^Lämna in$/)
  await vanta(600)
  await bild(p, 'lamna-in')
  await klickaText(p, /Avsluta och se resultat/)
  await p.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
  await vantaText(p, /Fråga för fråga/i, 120000)
  await vanta(1200)
  await bild(p, 'resultat')
  const { data: klar } = await admin.from('logic_test_v4_sessions').select('score, completed_at').eq('id', sessionId).single()
  logg('poängen: 14 av 15', klar.score === 14, { score: klar.score })

  const r1 = await genomgangsRad(p, 0)
  const r4 = await genomgangsRad(p, 3)
  await p.evaluate(() => {
    const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
    sek?.querySelectorAll('li')[3]?.scrollIntoView({ block: 'center' })
  })
  await vanta(400)
  await bild(p, 'genomgang-fraga-4')
  logg(
    'genomgången: samma bokstäver som i testet',
    r1?.status === 'Rätt' &&
      r1?.ratt === bokstav(fv[0].rattVisat) &&
      r4?.status === 'Fel' &&
      r4?.ditt === bokstav(felPos) &&
      r4?.ratt === bokstav(fv[3].rattVisat),
    { r1, r4, vantat1: bokstav(fv[0].rattVisat), vantatDitt4: bokstav(felPos), vantatRatt4: bokstav(fv[3].rattVisat) }
  )
  fs.writeFileSync(`${SCRATCH}/qa-matris-avtryck-${prefix}.json`, JSON.stringify({ sessionId, avtryckPerFraga, fv }, null, 2))
}

async function smakprovFlode(p) {
  let token = null
  let poang = null
  p.on('response', async (r) => {
    if (!r.url().endsWith('/api/public/test-session') || r.request().method() !== 'POST') return
    const body = await r.json().catch(() => null)
    if (body?.token) {
      token = body.token
      const t = fs.existsSync(ANON) ? JSON.parse(fs.readFileSync(ANON, 'utf8')) : []
      t.push(token)
      fs.writeFileSync(ANON, JSON.stringify(t))
    }
    if (typeof body?.score === 'number') poang = body.score
  })
  await ga(p, '/verktyg/rekryteringstester/prova')
  await bild(p, 'intro')
  await klickaText(p, /^Starta provet$/)
  await vantaText(p, /Fråga 1 av 5/)
  await vanta(600)
  await bild(p, 'fraga-1')
  if (!token) throw new Error('fick ingen token')
  const fv = forvantat(BANK.grund, token, 5, BLANDAD)
  logg('smakprov startat', true, { token, rattPosition: fv.map((f) => bokstav(f.rattVisat)).join('') })
  const klick = fv.map((f, i) => (i < 3 ? f.rattVisat : (f.rattVisat + 1) % 6))
  for (let i = 0; i < 5; i++) {
    await klickaAlternativ(p, klick[i])
    await vanta(600)
  }
  await vantaText(p, /av 5 rätt/)
  await vanta(800)
  await bild(p, 'resultat')
  const text = await p.evaluate(() => (document.body.innerText.match(/(\d) av 5 rätt/) || [])[1])
  logg('smakprovet: 3 av 5 rätt', text === '3' && poang === 3, { visat: text, poang })
  const { data: rad } = await admin.from('anon_test_sessions').select('answers, score').eq('token', token).single()
  const vantat = fv.map((f, i) => f.perm[klick[i]])
  logg('databasen: answers är originalindex', JSON.stringify(rad.answers) === JSON.stringify(vantat), {
    lagrat: rad.answers,
    vantat,
    klickat: klick.map(bokstav).join(''),
  })
}

async function gammalFlode(p) {
  await loggaIn(p)
  // Avslutad session från före fixen: 10 rätt (A), 5 fel (B).
  await ga(p, `/dashboard/tester/matrislogik-grund/test/${konto.gammalKlar}/results`)
  await vantaText(p, /Fråga för fråga/i, 120000)
  await vanta(1000)
  await bild(p, 'gammal-resultat')
  const r1 = await genomgangsRad(p, 0)
  const r11 = await genomgangsRad(p, 10)
  await p.evaluate(() => {
    const sek = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-label') === 'Fråga för fråga')
    sek?.querySelectorAll('li')[10]?.scrollIntoView({ block: 'center' })
  })
  await vanta(400)
  await bild(p, 'gammal-genomgang-fraga-11')
  const poang = await p.evaluate(() => document.body.innerText.includes('10'))
  logg(
    'gammal session: visas och rättas som förut (A rätt, B fel)',
    poang && r1?.status === 'Rätt' && r1?.ratt === 'A' && r11?.status === 'Fel' && r11?.ditt === 'B' && r11?.ratt === 'A',
    { r1, r11 }
  )

  // Pågående session från före fixen: C och E sparade på fråga 1 och 2.
  await ga(p, `/dashboard/tester/matrislogik-grund/test/${konto.gammalPagaende}`)
  await vantaText(p, /Välj rätt svar/i)
  await vanta(800)
  await bild(p, 'gammal-pagaende-fraga-3')
  const fragaText = await p.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
  await p.keyboard.press('ArrowLeft')
  await vanta(350)
  const v2 = await valdBokstav(p)
  await p.keyboard.press('ArrowLeft')
  await vanta(350)
  const v1 = await valdBokstav(p)
  await bild(p, 'gammal-pagaende-fraga-1')
  logg('gammal pågående: svaren står kvar på samma bokstäver', fragaText === '3' && v1[0] === 'C' && v2[0] === 'E', {
    fragaText,
    v1,
    v2,
  })
  // Ett nytt svar i den gamla sessionen rättas mot bankens ordning.
  await p.keyboard.press('ArrowRight')
  await p.keyboard.press('ArrowRight')
  await vanta(400)
  const fv = forvantat(BANK.grund, konto.gammalPagaende, 15, false)
  const svar = vantaSvar(p)
  await klickaAlternativ(p, fv[2].rattVisat)
  await svar
  await vanta(600)
  const { data: rad } = await admin.from('logic_test_v4_sessions').select('answers').eq('id', konto.gammalPagaende).single()
  const a = rad.answers.find((x) => x.q_id === fv[2].id)
  logg('gammal pågående: nytt svar lagras i bankens ordning', a?.selected === fv[2].facit && a?.visat === fv[2].facit && a?.correct === true, {
    a,
  })
}

/* ------------------------------------------------------------------ */

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})
try {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(180000)
  // Lokalt saknas x-forwarded-for, så alla körningar delar IP-gränsen för
  // smakprovet ("unknown"). QA_IP ger körningen en egen nyckel (en
  // dokumentationsadress, TEST-NET-3) utan att röra public_rate_limits.
  if (process.env.QA_IP) await p.setExtraHTTPHeaders({ 'x-forwarded-for': process.env.QA_IP })
  await p.setViewport(VY[vy].viewport)
  await p.setUserAgent(VY[vy].ua)
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|Failed to load resource|HMR|webpack-hmr|turbopack|Invalid source map/i.test(m.text())) {
      fel.push(m.text().slice(0, 800))
    }
  })
  p.on('pageerror', (e) => fel.push(`pageerror ${p.url().replace(BAS, '')}: ` + String(e?.message ?? e).slice(0, 400)))
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !/_next\/image|favicon|__nextjs/.test(u)) natfel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (floede === 'test') await testFlode(p)
  else if (floede === 'smakprov') await smakprovFlode(p)
  else if (floede === 'gammal') await gammalFlode(p)
  else throw new Error('okänt flöde')
} catch (e) {
  logg('avbrott', false, { fel: String(e?.message ?? e).slice(0, 300) })
  try {
    const sidor = await browser.pages()
    if (sidor.length) await bild(sidor[sidor.length - 1], 'avbrott')
  } catch {}
} finally {
  logg('konsolfel', fel.length === 0, { fel })
  logg('nätverksfel', natfel.length === 0, { natfel })
  await browser.close()
}
