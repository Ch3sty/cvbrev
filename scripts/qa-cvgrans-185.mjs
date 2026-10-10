// scripts/qa-cvgrans-185.mjs
//
// Klicktest för CV-gränsen vid LinkedIn-importen (Hela paketet via
// premium_grants) och vägen cv-mallar till skapa-brev steg 2 (React-fel #185).
// Riktig Chrome, Pixel 7 och desktop, en skärmdump per steg.
//
//   SCRATCH=<tmp> BAS=http://localhost:3491 node scripts/qa-cvgrans-185.mjs brev pixel7
//   SCRATCH=<tmp> BAS=http://localhost:3491 node scripts/qa-cvgrans-185.mjs linkedin desktop
//   SCRATCH=<tmp> BAS=http://localhost:3491 node scripts/qa-cvgrans-185.mjs gratis desktop  (efter att grants-raden raderats)
//
// Kontona skapas och raderas med scripts/qa-cvgrans-konton.mjs.
// Skärmdumpar hamnar i docs/qa/cvgrans-185/.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.BAS || 'http://localhost:3491'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = process.env.UT || 'docs/qa/cvgrans-185'
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
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-cvgrans-konton.json`, 'utf8'))

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

function logg(steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), floede, vy, steg, ok, ...data }
  fs.appendFileSync(RESULTAT, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 600)}`)
}

async function bild(p, namn) {
  nr += 1
  const fil = path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`)
  await p.screenshot({ path: fil }).catch(() => {})
  return fil
}

async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 120000 })
  await vanta(800)
}

async function klickaText(p, re, sel = 'button, a, [role="button"], [role="radio"], label') {
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

/** Primärknappen ligger i viewporten utan scroll. */
async function iViewport(p, re) {
  return p.evaluate(
    (src, flags) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll('button, a')].find((e) => r.test((e.innerText || '').trim()) && e.offsetParent !== null)
      if (!el) return false
      const b = el.getBoundingClientRect()
      return b.top >= 0 && b.bottom <= window.innerHeight
    },
    re.source,
    re.flags
  )
}

async function loggaIn(p) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {}),
    p.click('button[type="submit"]'),
  ])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 60000 })
  await vanta(1500)
}

const fel185 = () => fel.filter((f) => /185|Maximum update depth/i.test(f))

/* ------------------------------------------------------------------ */

/** Vägen cv-mallar till skapa-brev steg 2. UTAN_MALLAR=1 hoppar över mallarna. */
async function brevFlode(p) {
  await loggaIn(p)
  if (process.env.UTAN_MALLAR) {
    await ga(p, '/dashboard')
  } else {
    await mallarSteg(p)
  }
  const forre = fel.length
  await brevSteg2(p, forre)
}

async function mallarSteg(p) {
  await ga(p, `/dashboard/cv-mallar?cv=${konto.cvId}`)
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 90000 })
  await vanta(1000)
  await bild(p, 'cv-mallar')
  // Receptet där felet sågs: kontaktraden i CV-mallen ändras och sparas.
  const ny = { namn: `Bea Dokument ${vy} ${Date.now() % 10000}`, telefon: '073-555 12 34', epost: `qa-cvgrans-dok-${vy}@jobbcoach-qa.test` }
  await p.evaluate(() => {
    let el = document.querySelector('[data-kontaktrad="cv"]')
    el?.scrollIntoView({ block: 'center' })
    while (el && ![...el.querySelectorAll('button')].some((b) => b.innerText.trim() === 'Ändra')) el = el.parentElement
    ;[...(el?.querySelectorAll('button') ?? [])].find((b) => b.innerText.trim() === 'Ändra')?.click()
  })
  await p.waitForSelector('#kontakt-cv-namn', { timeout: 20000 })
  for (const [falt, v] of Object.entries(ny)) {
    const sel = `#kontakt-cv-${falt}`
    await p.click(sel, { clickCount: 3 })
    await p.keyboard.press('Backspace')
    await p.$eval(sel, (e) => {
      e.value = ''
    })
    await p.type(sel, v)
  }
  const sparat = p.waitForResponse((r) => r.url().includes('/api/profile/contact') && r.request().method() === 'PATCH', { timeout: 30000 })
  await klickaText(p, /^Spara$/)
  const res = await sparat
  await p.waitForSelector('[data-kontaktrad="cv"]', { timeout: 20000 })
  await vanta(1500)
  await bild(p, 'cv-mallar-kontakt-sparad')
  logg('cv-mallar: kontaktraden sparad', res.status() === 200, { status: res.status() })
}

async function brevSteg2(p, forre) {
  // NAV=klient: klientnavigering, som via menyn. Annars en ny sidladdning,
  // som i receptet där felet först sågs (qa-kontaktuppgifter-testsvar).
  if (process.env.NAV === 'klient') {
    // Bara synliga länkar, som en användare: på mobil öppnas Skapa-arket i
    // bottennavet först.
    const synligLank = () =>
      p.evaluate(() => {
        const a = [...document.querySelectorAll('a[href="/dashboard/skapa-brev"]')].find((e) => e.offsetParent !== null && e.getBoundingClientRect().height > 0)
        if (!a) return false
        a.click()
        return true
      })
    if (!(await synligLank())) {
      await klickaText(p, /^Skapa$/)
      await vanta(600)
      await bild(p, 'skapa-arket')
      await klickaText(p, /^Nytt personligt brev/)
    }
  } else {
    await p.goto(BAS + '/dashboard/skapa-brev', { waitUntil: 'networkidle2', timeout: 120000 })
  }
  await p.waitForFunction(() => location.pathname === '/dashboard/skapa-brev', { timeout: 60000 })
  await vantaText(p, /QA-CV byggaren/, 90000)
  await vanta(800)
  const cvLista = await p.evaluate(() => document.body.innerText)
  const { count: antalCv } = await admin.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', konto.userId)
  logg('steg 1: inga CV låsta för Hela paketet via premium_grants', !/Låst på gratisnivån/.test(cvLista), { antalCv })
  await klickaText(p, /QA-CV byggaren/, 'button, [role="radio"], label, div[role="button"]').catch(async () => {
    await klickaText(p, /QA-CV byggaren/, '*')
  })
  await bild(p, 'skapa-brev-steg1')
  logg('steg 1: Fortsätt i viewporten', await iViewport(p, /^Fortsätt$/))
  await klickaText(p, /^Fortsätt$/)
  await p.waitForSelector('textarea', { timeout: 30000 })
  await p.waitForFunction(() => location.search.includes('steg=2'), { timeout: 10000 }).catch(() => {})
  await p.type(
    'textarea',
    'Lagerarbetare till Nordlager i Örebro. Vi söker dig med truckkort A och B och erfarenhet av plock och inventering. Du är noggrann och gillar ordning och reda.'
  )
  await vanta(2000)
  await bild(p, 'skapa-brev-steg2')
  logg('steg 2: Fortsätt i viewporten', await iViewport(p, /^Fortsätt$/))
  logg('steg 2: url', p.url().includes('steg=2'), { url: p.url().replace(BAS, '') })
  logg('cv-mallar till skapa-brev steg 2 utan React-fel #185', fel185().length === 0, { nyaFel: fel.slice(forre) })
}

/** LinkedIn-optimeringen till Spara som CV, som tredje CV på kontot. */
async function linkedinFlode(p) {
  const { count: fore } = await admin.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', konto.userId)
  const { data: prof } = await admin.from('profiles').select('subscription_tier, premium_until').eq('id', konto.userId).single()
  logg('före: två CV, subscription_tier free, Hela paketet bara via premium_grants', fore === 2 && prof.subscription_tier !== 'premium', { fore, prof })

  await loggaIn(p)
  await ga(p, '/dashboard/linkedin-optimizer')
  await vanta(1500)
  await bild(p, 'steg1')
  // Utgå från CV:t (förvalt när det finns CV), välj CV-byggarens CV.
  await klickaText(p, /QA-CV byggaren/, 'button, [role="radio"], label, div[role="button"], li').catch(() => {})
  await vanta(500)
  await bild(p, 'steg1-cv-valt')
  logg('steg 1: Fortsätt i viewporten', await iViewport(p, /^Fortsätt$/))
  await klickaText(p, /^Fortsätt$/)
  await vanta(1500)
  // Fälten fylls från CV:t; fyll på om något krävs ändå.
  const tomma = await p.evaluate(() => [...document.querySelectorAll('textarea')].filter((t) => !t.value.trim()).length)
  if (tomma) {
    const tas = await p.$$('textarea')
    for (const t of tas) {
      const v = await t.evaluate((e) => e.value)
      if (!v.trim()) await t.type('Lagerarbetare med truckkort A och B, plock, pack och inventering i WMS sedan 2019.')
    }
  }
  await bild(p, 'steg2')
  logg('steg 2: Optimera profilen i viewporten', await iViewport(p, /^Optimera profilen$/))
  await klickaText(p, /^Optimera profilen$/)
  await vantaText(p, /Steg 3 av 4/i, 240000)
  await vanta(1500)
  await bild(p, 'steg3-resultat')
  await klickaText(p, /^Fortsätt$/)
  await vantaText(p, /Spara som CV i Jobbcoach/, 30000)
  await bild(p, 'steg4')

  const svar = p.waitForResponse((r) => r.url().includes('/api/cv/create-from-linkedin'), { timeout: 60000 })
  await klickaText(p, /^Spara som CV i Jobbcoach$/)
  const res = await svar
  const body = await res.json().catch(() => ({}))
  await vanta(800)
  await bild(p, 'sparat')
  logg('create-from-linkedin svarar 200 för tredje CV:t', res.status() === 200 && !!body.cvId, { status: res.status(), cvId: body.cvId, fel: body.message })

  await p.waitForFunction(() => location.pathname.startsWith('/dashboard/cv-mallar'), { timeout: 30000 }).catch(() => {})
  await vanta(2500)
  await bild(p, 'cv-mallar-nytt-cv')
  const { count: efter } = await admin.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', konto.userId)
  logg('efter: tre CV på kontot', efter === 3, { efter, url: p.url().replace(BAS, '') })
}

/**
 * Motprov: samma konto utan premium_grants-raden (raderad via id av
 * anroparen) ska stoppas vid gratisnivåns gräns, alltså 403 med kvotfelet.
 */
async function gratisFlode(p) {
  const { count: grants } = await admin.from('premium_grants').select('id', { count: 'exact', head: true }).eq('user_id', konto.userId)
  await loggaIn(p)
  await ga(p, '/dashboard/linkedin-optimizer')
  await bild(p, 'utan-paket')
  const svar = await p.evaluate(async (userId) => {
    const r = await fetch('/api/cv/create-from-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cvData: { personalInfo: { fullName: '' }, experience: [], education: [], skills: [] }, source: 'qa' }),
    })
    return { status: r.status, body: await r.json().catch(() => ({})) }
  }, konto.userId)
  const { count: efter } = await admin.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', konto.userId)
  logg('utan paket: create-from-linkedin svarar 403 och inget CV skapas', grants === 0 && svar.status === 403 && svar.body.quota_exceeded === true, {
    grants,
    status: svar.status,
    message: svar.body.message,
    cvEfter: efter,
  })
  // 403 från kvotspärren är det väntade svaret i det här flödet.
  natfel.splice(0, natfel.length, ...natfel.filter((n) => !n.startsWith('403 /api/cv/create-from-linkedin')))
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})
try {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(120000)
  // DIAG=1: räknar vilka komponenter som renderar i varje commit, via
  // DevTools-kroken. Används mot ett bygge med --no-mangling.
  if (process.env.DIAG) {
    await p.evaluateOnNewDocument((DIAGLATT) => {
      const commits = []
      window.__diagLatt = DIAGLATT
      window.__commits = commits
      const namn = (f) => {
        const t = f.type
        if (!t || typeof t === 'string') return null
        return t.displayName || t.name || (t.render && (t.render.displayName || t.render.name)) || null
      }
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        supportsFiber: true,
        renderers: new Map(),
        inject(r) {
          this.renderers.set(1, r)
          return 1
        },
        onCommitFiberRoot(_id, root) {
          const ut = []
          if (window.__diagLatt) {
            ut.push((new Error().stack || '').split('\n').slice(2, 14).map((r) => r.trim().replace(/\(http.*?chunks\//, '(')).join(' | '))
            commits.push({ t: performance.now(), ut })
            if (commits.length > 400) commits.shift()
            return
          }
          const stack = [root.current]
          while (stack.length) {
            const f = stack.pop()
            if (f.flags & 1) {
              const n = namn(f)
              if (n) ut.push(n)
            }
            if (f.child) stack.push(f.child)
            if (f.sibling) stack.push(f.sibling)
          }
          commits.push({ t: performance.now(), ut })
          if (commits.length > 400) commits.shift()
        },
        onCommitFiberUnmount() {},
        onPostCommitFiberRoot() {},
        checkDCE() {},
      }
    }, process.env.DIAG === 'latt')
  }
  await p.setViewport(VY[vy].viewport)
  await p.setUserAgent(VY[vy].ua)
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|Failed to load resource/i.test(m.text())) {
      fel.push(m.text().slice(0, 1500))
      if (/185|Maximum update depth/i.test(m.text())) console.log('  KONSOL: ' + m.text().slice(0, 3000))
    }
  })
  p.on('pageerror', (e) => {
    const r = `pageerror ${p.url().replace(BAS, '')}: ` + String(e?.message ?? e).slice(0, 400)
    if (process.env.STACK) console.log(String(e?.stack ?? '').slice(0, 6000))
    if (process.env.DIAG)
      p.evaluate(() => {
        const c = (window.__commits || []).slice(-70)
        return c.map((x) => `${x.t.toFixed(0)} ${[...new Set(x.ut)].slice(0, 25).join(',')}`).join('\n')
      })
        .then((s) => fs.writeFileSync(`${UT}/diag-commits.txt`, s))
        .catch(() => {})
    fel.push(r)
    console.log('  ' + r)
  })
  p.on('response', (r) => {
    const u = r.url()
    if (u.startsWith(BAS) && r.status() >= 400 && !/_next\/image|favicon/.test(u)) natfel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  if (floede === 'brev') await brevFlode(p)
  else if (floede === 'linkedin') await linkedinFlode(p)
  else if (floede === 'gratis') await gratisFlode(p)
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
