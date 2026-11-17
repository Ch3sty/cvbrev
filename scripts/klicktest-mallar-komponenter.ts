/**
 * Klicktestet för mallkomponenterna (plan-mallar 3.2, svepets steg 2), i
 * riktig Chrome, Pixel 7 och 1280, som utloggad, gratis och Premium.
 *
 *   npx tsx scripts/klicktest-mallar-komponenter.ts skapa  --ut <mapp>
 *   npx tsx scripts/klicktest-mallar-komponenter.ts klicka --ut <mapp> [--bas URL]
 *   npx tsx scripts/klicktest-mallar-komponenter.ts radera --ut <mapp>
 *
 * Konton: gratis och premium med ett CV vardera, plus kontot som skapas i
 * kontoarket på provsidan (utloggad). Adresserna är unika per körning,
 * qa-mallar-<roll>-<tid>@jobbcoach-qa.test, och raderingen går bara på id:n
 * i konton.json (räknas före delete). Skärmdumparna hamnar i --ut, aldrig i git.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'

function laddaEnv() {
  for (const fil of ['.env.local', '../../../.env.local']) {
    if (!fs.existsSync(fil)) continue
    for (const rad of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
      const i = rad.indexOf('=')
      if (i < 0 || rad.trim().startsWith('#')) continue
      const k = rad.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    }
  }
}
laddaEnv()

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const UT = path.resolve(arg('ut', 'qa-mallar')!)
const BAS = arg('bas', 'http://localhost:8320')!
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Roll = 'gratis' | 'premium' | 'utloggad'
interface Konto { roll: Roll; epost: string; id: string; cvId?: string; losen?: string }

const lasKonton = (): Konto[] => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : [])
const sparaKonton = (k: Konto[]) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

async function skapa() {
  const tid = Date.now()
  const konton = lasKonton()
  for (const roll of ['gratis', 'premium'] as Roll[]) {
    const epost = `qa-mallar-${roll}-${tid}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: `QaMallar!${tid}`,
      email_confirm: true,
      user_metadata: { full_name: 'Erik Lindberg' },
    })
    if (error || !data.user) throw new Error(`createUser ${roll}: ${error?.message}`)
    const id = data.user.id
    // Sparas direkt, så att raderingen hittar kontot även om resten fallerar.
    konton.push({ roll, epost, id })
    sparaKonton(konton)
    const premium = roll === 'premium'
    const { error: pe } = await sb
      .from('profiles')
      .update({
        full_name: 'Erik Lindberg',
        onboarding_track: 'cv',
        free_cv_exports_used: 0,
        subscription_tier: premium ? 'premium' : 'free',
        premium_scope: premium ? 'allt' : null,
        premium_until: premium ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
      })
      .eq('id', id)
    if (pe) throw new Error(`profiles ${roll}: ${pe.message}`)
    const { data: cv, error: ce } = await sb
      .from('cv_texts')
      .insert({
        user_id: id,
        file_name: 'Erik Lindberg.pdf',
        original_file_path: '',
        cv_text: `${NORMALT_CV.personalInfo.fullName}\n${NORMALT_CV.summary}`,
        structured_data: NORMALT_CV,
      })
      .select('id')
      .single()
    if (ce || !cv) throw new Error(`cv_texts ${roll}: ${ce?.message}`)
    konton[konton.length - 1].cvId = cv.id
    sparaKonton(konton)
    console.log('SKAPAD', roll, epost, id)
  }
}

async function radera() {
  const konton = lasKonton()
  const ids = konton.map((k) => k.id).filter(Boolean)
  if (ids.length === 0) return console.log('inga konton')
  for (const tabell of ['cv_texts', 'formatted_cv_downloads', 'user_activities']) {
    const { count } = await sb.from(tabell).select('*', { count: 'exact', head: true }).in('user_id', ids)
    const { error } = await sb.from(tabell).delete().in('user_id', ids)
    console.log(`${tabell}: ${count ?? 0} rader${error ? ' FEL ' + error.message : ' raderade'}`)
  }
  for (const k of konton) {
    const { error } = await sb.auth.admin.deleteUser(k.id)
    console.log(error ? `FEL radera ${k.epost}: ${error.message}` : `RADERAD ${k.epost} (${k.id})`)
  }
}

async function sessionsCookie(epost: string) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: s, error } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
  const payload =
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
  const namn = `sb-${ref}-auth-token`
  const C = 3200
  if (payload.length <= C) return [{ name: namn, value: payload }]
  const ut: { name: string; value: string }[] = []
  for (let i = 0, n = 0; i < payload.length; i += C, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + C) })
  return ut
}

const VYER = {
  pixel7: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  dator: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
} as const
type Vy = keyof typeof VYER

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}
const vila = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function bild(page: Page, namn: string, full = false) {
  await page.screenshot({ path: path.join(UT, `${namn}.png`) as `${string}.png`, fullPage: full })
}

async function klickaText(page: Page, text: string, sel = 'button, a') {
  const ok = await page.evaluate(
    (t, s) => {
      const el = [...document.querySelectorAll<HTMLElement>(s)].find(
        (e) => e.innerText.replace(/\s+/g, ' ').trim().startsWith(t) && !(e as HTMLButtonElement).disabled && e.offsetParent !== null
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    text,
    sel
  )
  if (!ok) throw new Error(`hittade inget "${text}"`)
}

async function vantaText(page: Page, text: string, ms = 30000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: ms }, text)
}

async function vantaFil(mapp: string, slut: string, ms = 60000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const f = fs.readdirSync(mapp).find((x) => x.endsWith(slut))
    if (f) return path.join(mapp, f)
    await vila(500)
  }
  return null
}

async function nySida(browser: Browser, vy: Vy, steg: string, tema: 'ljus' | 'mork' = 'ljus') {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  const fel: string[] = []
  page.on('pageerror', (e) => fel.push('js: ' + String(e).slice(0, 200)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && ![402, 404].includes(r.status()) && u.startsWith(BAS)) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  await page.setViewport(VYER[vy])
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'mork' ? 'dark' : 'light' }])
  const nedMapp = path.join(UT, `ned-${steg}`)
  fs.mkdirSync(nedMapp, { recursive: true })
  const bcdp = await browser.target().createCDPSession()
  await bcdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: nedMapp, browserContextId: (ctx as unknown as { id: string }).id })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  return { page, ctx, fel, nedMapp }
}

/** En CV-PDF att ladda upp: exempel-CV:t utskrivet av Chrome. */
async function testPdf(browser: Browser): Promise<string> {
  const fil = path.join(UT, 'Erik-Lindberg-CV.pdf')
  if (fs.existsSync(fil)) return fil
  const p = await browser.newPage()
  await p.goto(`${BAS}/api/public/exempel/cv?mall=linne`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.querySelectorAll('script').forEach((s) => s.remove()))
  await p.evaluate(() => (document.documentElement.style.zoom = '1'))
  await p.pdf({ path: fil, format: 'A4', printBackground: true })
  await p.close()
  return fil
}

/** Unik adress per sida, bara mot den lokala servern: uppladdningskvoten är 5 per adress. */
let ipNr = 10
const nyIp = () => `10.77.${Math.floor(Date.now() / 1000) % 250}.${ipNr++ % 250}`

async function matArk(page: Page) {
  return page.evaluate(() => {
    const ark = document.querySelector<HTMLElement>('.mallyta .dok-ark-yta')
    const r = ark?.getBoundingClientRect()
    return r ? Math.round(r.top) : null
  })
}

/** Den fasta raden: höjd, underkant, och navets överkant om navet finns. */
async function matRad(page: Page) {
  return page.evaluate(() => {
    const rad = document.querySelector<HTMLElement>('[data-fast-rad]')?.getBoundingClientRect()
    const nav = [...document.querySelectorAll<HTMLElement>('nav')].find((n) => {
      const r = n.getBoundingClientRect()
      return getComputedStyle(n).position === 'fixed' && r.bottom >= window.innerHeight - 2 && r.height < 140 && r.width > 200
    })
    return {
      hojd: rad ? Math.round(rad.height) : null,
      under: rad ? Math.round(rad.bottom) : null,
      navTopp: nav ? Math.round(nav.getBoundingClientRect().top) : null,
      vy: window.innerHeight,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }
  })
}

/** Text som klipps vid högerkanten (granskningen V2). */
async function klippt(page: Page) {
  return page.evaluate(() => {
    const ut: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('.mallyta p, .mallyta span, .mallyta button')) {
      const r = el.getBoundingClientRect()
      if (r.width && r.right > window.innerWidth + 1 && !el.closest('[class*="overflow-x-auto"]')) ut.push(el.innerText.slice(0, 40))
    }
    return ut.slice(0, 5)
  })
}

async function utloggad(browser: Browser, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `utloggad-${vy}-${tema}`
  const { page, ctx, fel, nedMapp } = await nySida(browser, vy, steg, tema)
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': nyIp() })
  await page.goto(`${BAS}/cv-mallar`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await bild(page, `${steg}-01-cv-mallar`)
  const uppY = await page.evaluate(() => Math.round(document.querySelector('#ladda-upp')!.getBoundingClientRect().top))
  kontroll(uppY < (vy === 'pixel7' ? 700 : 400), `${steg}: uppladdningen före vecket (y ${uppY})`)

  const input = await page.$('#ladda-upp input[type=file]')
  await input!.uploadFile(await testPdf(browser))
  await vantaText(page, 'Vi hittade', 90000).catch(() => undefined)
  await vila(2500)
  const topp = await matArk(page)
  const huvud = await page.evaluate(() => Math.round(document.querySelector('header')?.getBoundingClientRect().bottom ?? 0))
  kontroll(topp !== null && topp >= huvud && topp - huvud <= 80, `${steg}: arket i vyn efter uppladdningen utan att hon rullar (arkets överkant ${topp} px, ${topp === null ? '?' : topp - huvud} px under sidhuvudet på ${huvud} px)`)
  const ihop = await page.evaluate(() => {
    const yta = document.querySelector('#ladda-upp > div:not([hidden])') as HTMLElement | null
    return yta ? Math.round(yta.getBoundingClientRect().height) : null
  })
  kontroll(ihop !== null && ihop <= 48, `${steg}: uppladdningsytan ihopfälld till en rad (${ihop} px)`)
  await bild(page, `${steg}-02-efter-uppladdning`)
  const r = await matRad(page)
  kontroll((r.hojd ?? 999) <= (vy === 'pixel7' ? 76 : 72), `${steg}: fasta raden ${r.hojd} px hög`)
  kontroll(r.overflow <= 0, `${steg}: ingen sidled (scrollWidth minus bredd ${r.overflow})`)
  const k = await klippt(page)
  kontroll(k.length === 0, `${steg}: ingen text klipps vid högerkanten (${k.join(' | ')})`)

  if (tema === 'ljus') {
    // Rubrikarket.
    const rubrik = await page.$('button[aria-label^="Byt rubrik"]')
    if (rubrik) {
      await rubrik.click()
      await vila(900)
      await bild(page, `${steg}-03-rubrikark`)
      const synligt = await page.evaluate(() => {
        const ark = document.querySelector('[role=dialog]')!.getBoundingClientRect()
        const yta = document.querySelector('.mallyta .dok-ark-yta')!.getBoundingClientRect()
        return Math.round(ark.top - Math.max(yta.top, 0))
      })
      kontroll(synligt >= 150, `${steg}: dokumentet syns ovanför rubrikarket (${synligt} px)`)
      await page.evaluate(() => ([...document.querySelectorAll<HTMLButtonElement>('[role=dialog] [role=radio]')][1])?.click())
      await vila(1200)
      await klickaText(page, 'Klar').catch(() => undefined)
      await vila(500)
    } else kontroll(false, `${steg}: rubrikerna har träffytor`)

    // Typsnittsarket.
    await klickaText(page, 'Aa').catch(() => undefined)
    await vila(1000)
    await bild(page, `${steg}-04-typsnitt`)
    const ovan = await page.evaluate(() => {
      const ark = document.querySelector('[role=dialog]')!.getBoundingClientRect()
      return Math.round(ark.top)
    })
    kontroll(ovan >= (vy === 'pixel7' ? 380 : 100), `${steg}: typsnittsarket lämnar dokumentets topp synlig (arkets överkant ${ovan} px)`)
    await page.keyboard.press('Escape')
    await vila(400)

    // Helskärmen via zoomknappen.
    await page.evaluate(() => (document.querySelector('.mallyta button[aria-label="Läs i helskärm"]') as HTMLButtonElement | null)?.click())
    await vila(1800)
    await bild(page, `${steg}-05-helskarm`)
    await page.keyboard.press('Escape')
    await vila(400)

    // Foto i en fotomall (gratis med foto, ur katalogens fält).
    const fotoMall = await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('.mallyta [aria-label*="Gratis"]')].find((x) => /Björk|foto/i.test(x.getAttribute('aria-label') ?? ''))
      b?.click()
      return Boolean(b)
    })
    await vila(2500)
    const fotoKnapp = await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('.mallyta button[aria-haspopup="dialog"]')].find((x) => /^Foto|A\s*Foto/.test(x.innerText.trim()) || x.innerText.trim().endsWith('Foto'))
      b?.click()
      return Boolean(b)
    })
    await vila(800)
    await bild(page, `${steg}-06-fotoark`)
    kontroll(fotoMall && fotoKnapp && (await page.evaluate(() => document.body.innerText.includes('Lägg till foto när du skapat konto'))), `${steg}: fotoarket utloggad i fotomallen`)
    await page.keyboard.press('Escape')
    await vila(300)
  }

  // Premiummall: knappen i två rader och kontoarket med vägen till kassan.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('.mallyta [aria-label*="Premium"]')].find((x) => x.offsetParent !== null)
    b?.click()
  })
  await vila(2500)
  await bild(page, `${steg}-07-premiummall`)
  const knapp = await page.evaluate(() => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((x) => x.innerText.includes('Ladda ner'))
    return b ? { text: b.innerText.replace(/\n/g, ' | '), h: Math.round(b.getBoundingClientRect().height) } : null
  })
  kontroll(Boolean(knapp && knapp.text.includes('|') && knapp.text.includes('Premium')), `${steg}: premiumknappen i två rader (${knapp?.text}, ${knapp?.h} px)`)

  if (tema === 'ljus') {
    const somWord = vy === 'dator'
    // Gratisvägen i Linne-mallen: konto i arket, sedan filen direkt (datorn: Word, gratis i gratismallen).
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('.mallyta button')].find((x) => x.innerText.startsWith('Ladda ner gratis i'))
      b?.click()
    })
    await vila(2500)
    // Färgen: andra pricken byter dokumentet.
    const fore = await page.evaluate(() => (document.querySelector('.mallyta .dok-ark-yta iframe') as HTMLIFrameElement | null)?.srcdoc.length ?? 0)
    await page.evaluate(() => (document.querySelector('.mallyta [role=radiogroup][aria-label="Färg"] [role=radio]:nth-of-type(2)') as HTMLButtonElement | null)?.click())
    await vila(2500)
    const farg = await page.evaluate(() => {
      const f = document.querySelector('.mallyta .dok-ark-yta iframe') as HTMLIFrameElement | null
      return getComputedStyle(f!.contentDocument!.documentElement).getPropertyValue('--accent').trim()
    })
    kontroll(Boolean(farg), `${steg}: färgbytet slår igenom i dokumentet (--accent ${farg}, srcdoc ${fore} tecken före)`)
    if (somWord) {
      await page.evaluate(() => ([...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] [role=radio]')].find((b) => b.innerText.includes('Word') && b.offsetParent !== null))?.click())
      await vila(500)
    }
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((x) => /^Ladda ner (PDF|Word)$/.test(x.innerText.trim()))
      b?.click()
    })
    await vantaText(page, 'Skapa ett konto, så följer ditt CV med.', 15000).catch(() => undefined)
    await vila(600)
    await bild(page, `${steg}-08-kontoark`)
    const tid = Date.now()
    const epost = `qa-mallar-utloggad-${tid}@jobbcoach-qa.test`
    await page.type('[role=dialog] input[type=email]', epost)
    await page.type('[role=dialog] input[type=password]', `QaMallar!${tid}`)
    await klickaText(page, 'Skapa konto och ladda ner')
    await vila(4000)
    const { data: prof } = await sb.from('profiles').select('id').eq('email', epost).maybeSingle()
    const ny = prof ? { id: (prof as { id: string }).id } : null
    if (ny) {
      const kk = lasKonton()
      kk.push({ roll: 'utloggad', epost, id: ny.id })
      sparaKonton(kk)
    }
    kontroll(Boolean(ny), `${steg}: kontot skapades i arket`)
    await vantaText(page, 'Klart. Ditt CV är nedladdat.', 90000).catch(() => undefined)
    await vila(2500)
    await bild(page, `${steg}-09-final`)
    if (somWord) {
      const docx = await vantaFil(nedMapp, '.docx', 10000)
      kontroll(Boolean(docx) && fs.readFileSync(docx!).subarray(0, 2).toString() === 'PK', `${steg}: Word gratis i gratismallen direkt efter kontot (${docx ? path.basename(docx) : 'ingen'})`)
    } else {
      const pdf = await vantaFil(nedMapp, '.pdf', 10000)
      kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: PDF direkt efter kontot (${pdf ? path.basename(pdf) : 'ingen'})`)
      if (pdf) {
        const typsnitt = [...new Set((fs.readFileSync(pdf).toString('latin1').match(/\/BaseFont\s*\/([A-Z]{6}\+)?[A-Za-z0-9-]+/g) ?? []).map((x) => x.replace(/\/BaseFont\s*\/([A-Z]{6}\+)?/, '')))]
        kontroll(typsnitt.length > 0 && typsnitt.every((t) => !/^(Times|Helvetica|Arial|Liberation)/.test(t)), `${steg}: PDF:ens /BaseFont är inbäddade typsnitt (${typsnitt.join(', ')})`)
      }
    }
    const jobb = await page.evaluate(() => {
      const a = document.querySelector<HTMLAnchorElement>('[role=dialog] a[aria-label*="Öppna annonsen"], [role=dialog] a[aria-label*="Dina matchningar"]')
      return a ? a.getAttribute('href') : null
    })
    kontroll(jobb !== null || (await page.evaluate(() => document.body.innerText.includes('Nu brevet'))), `${steg}: jobbkortet klickbart (${jobb}) eller brevet som nästa steg`)
    if (ny) {
      // R4: ett andra anspråk på samma utkast ger ingen ny rad.
      const andra = await page.evaluate(async () => {
        const r = await fetch('/api/cv/prova/hamta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv: { personalInfo: { fullName: 'Erik Lindberg', email: '' }, experience: [], education: [], skills: [] } }),
        })
        return r.json()
      })
      const { count } = await sb.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', ny.id)
      kontroll(count === 1 && andra.ny === false, `${steg}: utkastet hämtas en gång, andra anspråket återanvänder raden (${count} rad, ny ${andra.ny})`)
    }
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function inloggad(browser: Browser, k: Konto, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `${k.roll}-${vy}-${tema}`
  const { page, ctx, fel, nedMapp } = await nySida(browser, vy, steg, tema)
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(2500)
  await bild(page, `${steg}-01-galleri`)
  kontroll(page.url().includes('mall='), `${steg}: valet i adressen (${page.url().replace(BAS, '')})`)
  // Rulla till mitten och till slutet: raden ska ligga mot navet hela vägen.
  for (const lage of ['mitt', 'slut'] as const) {
    await page.evaluate((l) => {
      const m = document.querySelector('main.dashboard-main-content') as HTMLElement | null
      const el = m && m.scrollHeight > m.clientHeight ? m : document.scrollingElement!
      el.scrollTop = l === 'mitt' ? el.scrollHeight / 3 : el.scrollHeight
    }, lage)
    await vila(700)
    const r = await matRad(page)
    const mal = r.navTopp ?? r.vy
    kontroll(r.under !== null && Math.abs(r.under - mal) <= 2, `${steg}: fasta raden mot ${r.navTopp ? 'navet' : 'vyns botten'} vid ${lage} (radens underkant ${r.under}, mål ${mal}, höjd ${r.hojd})`)
    if (lage === 'slut') await bild(page, `${steg}-02-rad-${lage}`)
  }
  if (tema === 'mork') {
    kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
    await ctx.close()
    return
  }
  await page.evaluate(() => {
    const m = document.querySelector('main.dashboard-main-content') as HTMLElement | null
    if (m) m.scrollTop = 0
    window.scrollTo(0, 0)
  })
  await vila(500)

  // B6: rubrikarket följer det sparade valet.
  const rubrik = await page.$('button[aria-label^="Byt rubrik"]')
  if (rubrik) {
    await rubrik.click()
    await vila(800)
    const valt = await page.evaluate(() => {
      const r = [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] [role=radio]')][1]
      r?.click()
      return r?.innerText.trim() ?? ''
    })
    await page.waitForResponse((r) => r.url().includes('/api/cv/section-titles'), { timeout: 15000 }).catch(() => null)
    await vila(1500)
    const markerad = await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] [role=radio]')].find((r) => r.getAttribute('aria-checked') === 'true')?.innerText.trim() ?? '')
    await bild(page, `${steg}-03-rubrikark`)
    kontroll(markerad === valt, `${steg}: rubrikarket markerar det sparade valet ("${markerad}" mot "${valt}")`)
    await klickaText(page, 'Tillbaka till förslagen').catch(() => undefined)
    await vila(1200)
    await klickaText(page, 'Klar').catch(() => undefined)
    await vila(500)
  }

  if (k.roll === 'gratis') {
    // Premiummall: köpet går direkt till köpsteget med mallen och returen.
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('.mallyta [aria-label*="Premium"]')].find((x) => x.offsetParent !== null)
      b?.click()
    })
    await vila(2500)
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((x) => x.innerText.startsWith('Ladda ner') && x.innerText.includes('Premium'))
      b?.click()
    })
    await vila(1500)
    await bild(page, `${steg}-04-vagg-premiummall`)
    const kop = await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button, [role=dialog] a')].find((x) => /Premium|Köp/.test(x.innerText))
      b?.click()
      return Boolean(b)
    })
    await vila(3000)
    const url = decodeURIComponent(page.url())
    kontroll(kop && url.includes('/dashboard/valj-spar') && url.includes('retur=/dashboard/cv-mallar?') && url.includes('mall='), `${steg}: köpet går till köpsteget med retur och mall (${url.replace(BAS, '').slice(0, 160)})`)
    await bild(page, `${steg}-05-kopsteg`)
    await page.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2' })
    await vila(2500)
  }

  // Första nedladdningen (gratis bara på Pixel 7, annars använd).
  const forsta = !(k.roll === 'gratis' && vy === 'dator')
  if (forsta) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((e) => e.innerText.trim().startsWith('Ladda ner PDF'))
      b?.click()
    })
    await vantaText(page, 'Klart. Ditt CV är nedladdat.', 90000).catch(() => undefined)
    await vila(2500)
    await bild(page, `${steg}-06-final`)
    const pdf = await vantaFil(nedMapp, '.pdf', 10000)
    kontroll(Boolean(pdf), `${steg}: PDF nedladdad, finalen visas (${pdf ? path.basename(pdf) : 'ingen'})`)
    await page.keyboard.press('Escape')
    await vila(500)
  }
  if (k.roll === 'gratis') {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((e) => e.innerText.trim().startsWith('Ladda ner PDF'))
      b?.click()
    })
    await vantaText(page, 'Ditt CV i en annan mall?', 30000).catch(() => undefined)
    await vila(3000)
    await bild(page, `${steg}-07-merforsaljning`)
    const bilder = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[role=dialog] [role=radio] > span:first-child')].map((e) => Math.round(e.getBoundingClientRect().width)))
    kontroll(bilder.length === 3 && bilder.every((b) => b >= 100), `${steg}: merförsäljningen med tre bilder om 100 px eller mer (${bilder.join(', ')})`)
    const lofte = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] [role=radio]')].map((e) => (e as HTMLElement).innerText).join(' | '))
    kontroll(!/foto|bild/i.test(lofte), `${steg}: korten lovar inget foto utan foto (${lofte.replace(/\n/g, ' ')})`)
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find((x) => x.innerText.startsWith('Ladda ner i'))
      b?.click()
    })
    await vila(3000)
    const url = decodeURIComponent(page.url())
    kontroll(url.includes('/dashboard/valj-spar') && url.includes('retur=/dashboard/cv-mallar?') && url.includes('mall='), `${steg}: merförsäljningens knapp direkt till köpsteget med vald mall (${url.replace(BAS, '').slice(0, 160)})`)
  } else {
    // Premium: Word, och köpreturen (?ladda=1) startar nedladdningen.
    await page.goto(`${BAS}/dashboard/cv-mallar?cv=${k.cvId}&mall=kalksten&format=pdf&ladda=1&premium_activated=true`, { waitUntil: 'networkidle2' })
    const pdf2 = await vantaFil(nedMapp, 'kalksten-erik-lindberg.pdf', 90000)
    await vila(2000)
    await bild(page, `${steg}-07-retur-ladda`)
    kontroll(Boolean(pdf2) && !page.url().includes('ladda=1'), `${steg}: köpreturen laddar ner filen direkt och tar bort ladda ur adressen (${pdf2 ? path.basename(pdf2) : 'ingen'})`)
    await page.keyboard.press('Escape')
    await page.evaluate(() => ([...document.querySelectorAll<HTMLButtonElement>('[role=radio]')].find((b) => b.innerText.includes('Word')))?.click())
    await vila(500)
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('[data-fast-rad] button')].find((e) => e.innerText.trim().startsWith('Ladda ner Word'))
      b?.click()
    })
    const docx = await vantaFil(nedMapp, '.docx', 90000)
    kontroll(Boolean(docx), `${steg}: Word laddas ner (${docx ? path.basename(docx) : 'ingen'})`)
    // Byggarens gamla steg 7 (granskningen V8) finns inte längre: CV-byggaren
    // Direkt på arket (f039f965) testas i scripts/klicktest-cv-byggare.ts.
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function artikelOchYrke(browser: Browser, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `publik-${vy}-${tema}`
  const { page, ctx, fel } = await nySida(browser, vy, steg, tema)
  await page.goto(`${BAS}/artiklar/bra-cv-guide`, { waitUntil: 'networkidle2', timeout: 120000 })
  const aside = await page.$('aside[aria-label="Så ser ditt CV ut i våra mallar"]')
  if (aside) {
    await aside.scrollIntoView()
    await vila(2500)
    await page.type('aside[aria-label="Så ser ditt CV ut i våra mallar"] input', 'Anna Berg')
    await vila(1500)
    const namn = await page.evaluate(() => (document.querySelector('aside iframe') as HTMLIFrameElement).contentDocument?.querySelector('[data-falt="namn"]')?.textContent)
    await aside.screenshot({ path: path.join(UT, `${steg}-01-artikel.png`) as `${string}.png` })
    const lank = await page.evaluate(() => document.querySelector('aside a[href^="/cv-mallar/prova"]')?.getAttribute('href'))
    kontroll(namn === 'Anna Berg' && Boolean(lank?.includes('namn=Anna')), `${steg}: artikelkomponenten byter namnet i dokumentet och Fortsätt bär valet (${namn}, ${lank})`)
  } else kontroll(false, `${steg}: artikelkomponenten saknas`)
  await page.goto(`${BAS}/cv-mallar/underskoterska`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(2500)
  await bild(page, `${steg}-02-yrkessida`)
  const yrke = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    titel: (document.querySelectorAll('#preview input')[1] as HTMLInputElement | undefined)?.value,
    rubrik: (document.querySelector('#preview iframe') as HTMLIFrameElement | null)?.contentDocument?.body.innerText.includes('Klinisk erfarenhet'),
  }))
  kontroll(yrke.h1 === 'CV-mall för Undersköterska' && yrke.titel === 'Undersköterska' && Boolean(yrke.rubrik), `${steg}: yrkessidan med dokumentet som hjälte, titeln förifylld och yrkets rubriker (${JSON.stringify(yrke)})`)
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function anonymt(browser: Browser) {
  const p = await browser.newPage()
  await p.goto(`${BAS}/cv-mallar/prova`, { waitUntil: 'domcontentloaded' })
  const status = await p.evaluate(async () => {
    const r = await fetch('/api/cv/generate-formatted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: 'linne', structuredData: { personalInfo: { fullName: 'A B', email: '' }, experience: [], education: [], skills: [] }, format: 'pdf' }),
    })
    return r.status
  })
  kontroll(status === 401, `R3: generate-formatted utan konto svarar ${status}`)
  await p.close()
}

async function klicka() {
  const konton = lasKonton()
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  const bara = arg('bara')
  try {
    if (!bara || bara === 'anonymt') await anonymt(browser)
    if (!bara || bara === 'publik')
      for (const vy of ['pixel7', 'dator'] as Vy[])
        for (const tema of ['ljus', 'mork'] as const)
          await artikelOchYrke(browser, vy, tema).catch((e) => kontroll(false, `publik-${vy}-${tema}: ${e.message}`))
    if (!bara || bara === 'utloggad')
      for (const vy of ['pixel7', 'dator'] as Vy[])
        for (const tema of ['ljus', 'mork'] as const)
          await utloggad(browser, vy, tema).catch((e) => kontroll(false, `utloggad-${vy}-${tema}: ${e.message}`))
    if (!bara || bara === 'inloggad')
      for (const k of konton.filter((x) => x.roll !== 'utloggad'))
        for (const vy of ['pixel7', 'dator'] as Vy[])
          for (const tema of ['ljus', 'mork'] as const)
            await inloggad(browser, k, vy, tema).catch((e) => kontroll(false, `${k.roll}-${vy}-${tema}: ${e.message}`))
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n'))
}

const cmd = process.argv[2]
;(cmd === 'skapa' ? skapa() : cmd === 'radera' ? radera() : klicka()).catch((e) => {
  console.error(e)
  process.exit(1)
})
