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
  await p.goto(`${BAS}/api/public/exempel/cv?mall=prov-enspalt`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.querySelectorAll('script').forEach((s) => s.remove()))
  await p.evaluate(() => (document.documentElement.style.zoom = '1'))
  await p.pdf({ path: fil, format: 'A4', printBackground: true })
  await p.close()
  return fil
}

async function utloggad(browser: Browser, vy: Vy) {
  const steg = `utloggad-${vy}`
  const { page, ctx, fel, nedMapp } = await nySida(browser, vy, steg)
  await page.goto(`${BAS}/cv-mallar/prova`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(1500)
  await bild(page, `${steg}-01-prova`)
  kontroll(await page.$('#ladda-upp') !== null, `${steg}: uppladdningen syns högst upp`)

  const input = await page.$('#ladda-upp input[type=file]')
  await input!.uploadFile(await testPdf(browser))
  await vantaText(page, 'Vi hittade', 90000).catch(() => undefined)
  await vila(2500)
  const hittade = await page.evaluate(() => document.body.innerText.includes('Vi hittade'))
  kontroll(hittade, `${steg}: PDF:en tolkades utan konto ("Vi hittade ...")`)
  await page.evaluate(() => document.querySelector('#valj-mall')?.scrollIntoView())
  await vila(800)
  await bild(page, `${steg}-02-efter-uppladdning`)

  const utkast = await page.evaluate(() => localStorage.getItem('jc_cv_prova'))
  kontroll(Boolean(utkast), `${steg}: utkastet ligger i localStorage (jc_cv_prova)`)

  // Rubrikarket från ett tryck på en rubrik.
  const rubrik = await page.$('button[aria-label^="Byt rubrik"]')
  kontroll(Boolean(rubrik), `${steg}: rubrikerna har träffytor`)
  if (rubrik) {
    await rubrik.click()
    await vila(800)
    await bild(page, `${steg}-03-rubrikark`)
    const valt = await page.evaluate(() => {
      const r = [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] [role=radio]')][1]
      r?.click()
      return r?.innerText ?? ''
    })
    await vila(1500)
    await klickaText(page, 'Klar')
    await vila(600)
    kontroll(Boolean(valt), `${steg}: rubriken byttes till "${valt}"`)
  }

  // Typsnittet.
  await klickaText(page, 'Aa').catch(() => undefined)
  await vila(700)
  await bild(page, `${steg}-04-typsnitt`)
  await page.keyboard.press('Escape')
  await vila(400)

  // Helskärmen.
  await page.evaluate(() => (document.querySelector('button[aria-label="Läs i helskärm"]') as HTMLButtonElement | null)?.click())
  await vila(1500)
  await bild(page, `${steg}-05-helskarm`)
  await page.keyboard.press('Escape')
  await vila(400)

  // Ladda ner: kontoarket.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => /^Ladda ner (PDF|Word)/.test(e.innerText.trim()) && e.offsetParent !== null)
    b?.click()
  })
  await vantaText(page, 'Skapa ett konto, så följer ditt CV med.', 15000).catch(() => undefined)
  await vila(600)
  await bild(page, `${steg}-06-kontoark`)
  kontroll(await page.evaluate(() => document.body.innerText.includes('Fortsätt med Google')), `${steg}: kontoarket med Google först`)

  if (vy === 'pixel7') {
    const tid = Date.now()
    const epost = `qa-mallar-utloggad-${tid}@jobbcoach-qa.test`
    await page.type('[role=dialog] input[type=email]', epost)
    await page.type('[role=dialog] input[type=password]', `QaMallar!${tid}`)
    await klickaText(page, 'Skapa konto och ladda ner')
    // Kontot registreras direkt, så att raderingen hittar det.
    await vila(4000)
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 })
    const ny = data?.users.find((u) => u.email === epost)
    if (ny) {
      const k = lasKonton()
      k.push({ roll: 'utloggad', epost, id: ny.id })
      sparaKonton(k)
    }
    kontroll(Boolean(ny), `${steg}: kontot skapades i arket (${epost})`)
    await vantaText(page, 'Klart. Ditt CV är nedladdat.', 90000).catch(() => undefined)
    await vila(2500)
    await bild(page, `${steg}-07-final`)
    const pdf = await vantaFil(nedMapp, '.pdf', 10000)
    kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: PDF:en laddades ner direkt efter kontot (${pdf ? path.basename(pdf) : 'ingen'})`)
    if (ny) {
      const { count } = await sb.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', ny.id)
      kontroll((count ?? 0) === 1, `${steg}: utkastet hämtades hem till cv_texts (${count})`)
    }
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function inloggad(browser: Browser, k: Konto, vy: Vy, tema: 'ljus' | 'mork') {
  const steg = `${k.roll}-${vy}-${tema}`
  const { page, ctx, fel, nedMapp } = await nySida(browser, vy, steg, tema)
  for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
  const t0 = Date.now()
  await page.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2', timeout: 120000 })
  await vila(2000)
  await bild(page, `${steg}-01-galleri`)
  kontroll(page.url().includes('/dashboard/cv-mallar'), `${steg}: galleriet öppnas (${Date.now() - t0} ms)`)
  kontroll(page.url().includes('mall='), `${steg}: valet står i adressen (${page.url().replace(BAS, '')})`)
  kontroll(await page.evaluate(() => document.body.innerText.includes('CV: Erik Lindberg')), `${steg}: CV-chippen i toppraden`)

  if (tema === 'mork') {
    await ctx.close()
    return
  }
  // Byt CV-arket.
  await klickaText(page, 'CV: Erik Lindberg')
  await vila(700)
  await bild(page, `${steg}-02-byt-cv`)
  await page.keyboard.press('Escape')
  await vila(300)

  // Rubrik sparas.
  const rubrik = await page.$('button[aria-label^="Byt rubrik"]')
  if (rubrik) {
    await rubrik.click()
    await vila(700)
    const svar = page.waitForResponse((r) => r.url().includes('/api/cv/section-titles'), { timeout: 15000 }).catch(() => null)
    await page.evaluate(() => ([...document.querySelectorAll<HTMLButtonElement>('[role=dialog] [role=radio]')][1])?.click())
    const r = await svar
    kontroll(Boolean(r && r.ok()), `${steg}: rubriken sparades (PUT section-titles ${r?.status()})`)
    await klickaText(page, 'Klar').catch(() => undefined)
    await vila(1500)
  } else kontroll(false, `${steg}: rubrikerna har träffytor`)

  // Första nedladdningen: finalen (gratiskontot har redan använt sin i Pixel 7-varvet).
  const forsta = !(k.roll === 'gratis' && vy === 'dator')
  if (forsta) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => e.innerText.trim().startsWith('Ladda ner PDF') && e.offsetParent !== null)
    b?.click()
  })
  await vantaText(page, 'Klart. Ditt CV är nedladdat.', 90000).catch(() => undefined)
  await vila(2500)
  await bild(page, `${steg}-03-final`)
  const pdf = await vantaFil(nedMapp, '.pdf', 10000)
  kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: PDF nedladdad, finalen visas (${pdf ? path.basename(pdf) : 'ingen'})`)
  await page.keyboard.press('Escape')
  await vila(500)
  }

  if (k.roll === 'gratis') {
    // Andra nedladdningen: merförsäljningen, aldrig en tom vägg.
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => e.innerText.trim().startsWith('Ladda ner PDF') && e.offsetParent !== null)
      b?.click()
    })
    await vantaText(page, 'Ditt CV i en annan mall?', 30000).catch(() => undefined)
    await vila(2500)
    await bild(page, `${steg}-04-merforsaljning`)
    kontroll(await page.evaluate(() => document.body.innerText.includes('Ditt CV i en annan mall?')), `${steg}: andra nedladdningen visar merförsäljningen`)
  } else {
    // Premium: Word.
    await page.evaluate(() => ([...document.querySelectorAll<HTMLButtonElement>('[role=radio]')].find((b) => b.innerText.includes('Word')))?.click())
    await vila(500)
    await page.evaluate(() => {
      const b = [...document.querySelectorAll<HTMLButtonElement>('button')].find((e) => e.innerText.trim().startsWith('Ladda ner Word') && e.offsetParent !== null)
      b?.click()
    })
    const docx = await vantaFil(nedMapp, '.docx', 90000)
    kontroll(Boolean(docx), `${steg}: Word laddas ner (${docx ? path.basename(docx) : 'ingen'})`)
    await vila(1500)
    await bild(page, `${steg}-04-word-final`)
  }
  kontroll(fel.length === 0, `${steg}: inga JS-fel eller 5xx (${fel.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

async function klicka() {
  const konton = lasKonton()
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
  const bara = arg('bara')
  try {
    if (!bara || bara === 'utloggad') for (const vy of ['pixel7', 'dator'] as Vy[]) await utloggad(browser, vy).catch((e) => kontroll(false, `utloggad-${vy}: ${e.message}`))
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
