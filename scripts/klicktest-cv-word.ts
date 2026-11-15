/**
 * Klicktestet för CV som Word-fil (docs/plan-cv-word-2026-11-15.md avsnitt 7)
 * i riktig Chrome, som nya användare: Pixel 7 och 1280 px, ljust och mörkt.
 *
 *   npx tsx scripts/klicktest-cv-word.ts skapa  --ut <mapp>            # tre QA-konton, id i <mapp>/konton.json
 *   npx tsx scripts/klicktest-cv-word.ts klicka --ut <mapp> [--bas URL] # skärmdumpar och kontroller
 *   npx tsx scripts/klicktest-cv-word.ts radera --ut <mapp>            # raderar exakt kontona i konton.json
 *
 * Kontona: gratis (före första nedladdningen), gratis med använd
 * nedladdning, och Premium. Varje konto har ett CV (Erik Lindberg).
 * Adresserna är unika per körning (qa-cvword-<roll>-<tid>@jobbcoach-qa.test),
 * och raderingen går bara på id:n som skriptet själv skapat.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Page } from 'puppeteer-core'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'

function laddaEnv() {
  for (const rad of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const i = rad.indexOf('=')
    if (i < 0 || rad.trim().startsWith('#')) continue
    const k = rad.slice(0, i).trim()
    if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
}
laddaEnv()

const arg = (n: string, f?: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const UT = path.resolve(arg('ut', 'qa-cv-word')!)
const BAS = arg('bas', 'http://localhost:8300')!
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Roll = 'gratis' | 'anvand' | 'premium'
interface Konto { roll: Roll; epost: string; id: string; cvId: string }

async function skapa() {
  const tid = Date.now()
  const konton: Konto[] = []
  for (const roll of ['gratis', 'anvand', 'premium'] as Roll[]) {
    const epost = `qa-cvword-${roll}-${tid}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: `QaCvWord!${tid}`,
      email_confirm: true,
      user_metadata: { full_name: 'Erik Lindberg' },
    })
    if (error || !data.user) throw new Error(`createUser ${roll}: ${error?.message}`)
    const id = data.user.id
    const premium = roll === 'premium'
    const { error: pe } = await sb
      .from('profiles')
      .update({
        full_name: 'Erik Lindberg',
        email_verified_at: new Date().toISOString(),
        onboarding_track: 'cv',
        free_cv_exports_used: roll === 'anvand' ? 1 : 0,
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
        cv_text: `${NORMALT_CV.personalInfo.fullName}\n${NORMALT_CV.summary}\n${NORMALT_CV.experience.map((e) => `${e.position} ${e.company}`).join('\n')}`,
        structured_data: NORMALT_CV,
      })
      .select('id')
      .single()
    if (ce || !cv) throw new Error(`cv_texts ${roll}: ${ce?.message}`)
    konton.push({ roll, epost, id, cvId: cv.id })
    console.log('SKAPAD', roll, epost, id)
  }
  fs.writeFileSync(KONTOFIL, JSON.stringify(konton, null, 2))
}

async function radera() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const ids = konton.map((k) => k.id)
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

const VYER = [
  { namn: 'pixel7', viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { namn: 'desktop', viewport: { width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false } },
] as const
const TEMAN = ['light', 'dark'] as const

const resultat: string[] = []
const kontroll = (ok: boolean, text: string) => {
  resultat.push(`${ok ? 'OK  ' : 'FEL '} ${text}`)
  console.log(`${ok ? 'OK  ' : 'FEL '} ${text}`)
}

async function text(page: Page) {
  return page.evaluate(() => document.body.innerText)
}
async function klickaText(page: Page, selector: string, innehall: string) {
  const ok = await page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.innerText.trim().startsWith(t))
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    selector,
    innehall
  )
  if (!ok) throw new Error(`hittade inte ${selector} "${innehall}"`)
  await new Promise((r) => setTimeout(r, 700))
}
async function valjMall(page: Page, namn: string) {
  await page.evaluate((n) => {
    const b = [...document.querySelectorAll<HTMLElement>('[role="radiogroup"][aria-label="Välj mall"] [role="radio"]')].find((e) =>
      (e.getAttribute('aria-label') ?? '').startsWith(n)
    )
    b?.scrollIntoView({ block: 'center' })
    b?.click()
  }, namn)
  await new Promise((r) => setTimeout(r, 900))
}
async function bild(page: Page, namn: string, element?: string) {
  const fil = path.join(UT, `${namn}.png`) as `${string}.png`
  if (element) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), element)
    await new Promise((r) => setTimeout(r, 300))
  }
  await page.screenshot({ path: fil })
}
async function tillFormat(page: Page) {
  await page.evaluate(() => document.getElementById('formatval-rubrik')?.scrollIntoView({ block: 'center' }))
  await new Promise((r) => setTimeout(r, 400))
}
async function vantaFil(mapp: string, slut: string, ms = 30000) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    const f = fs.readdirSync(mapp).find((x) => x.endsWith(slut))
    if (f) return path.join(mapp, f)
    await new Promise((r) => setTimeout(r, 500))
  }
  return null
}

async function klicka() {
  const konton = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) as Konto[]
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox'],
  })
  const kombinationer = VYER.flatMap((v) => TEMAN.map((t) => ({ v, t })))
  try {
    for (const k of konton) {
      for (const [n, { v, t }] of kombinationer.entries()) {
        const steg = `${k.roll}-${v.namn}-${t}`
        const ctx = await browser.createBrowserContext()
        const page = await ctx.newPage()
        const fel: string[] = []
        page.on('console', (m) => {
          if (m.type() === 'error' && !/favicon|posthog|Failed to load resource: net::ERR_BLOCKED/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, 160))
        })
        page.on('response', (r) => {
          const u = r.url()
          if (r.status() >= 400 && u.startsWith(BAS) && !u.includes('/_vercel') && !u.includes('/monitoring')) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
        })
        await page.setViewport(v.viewport)
        await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: t }])
        const nedMapp = path.join(UT, `ned-${steg}`)
        fs.mkdirSync(nedMapp, { recursive: true })
        // Nedladdningar i ett eget kontext styrs på webbläsarnivå, med kontextets id.
        const bcdp = await browser.target().createCDPSession()
        await bcdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: nedMapp, browserContextId: (ctx as unknown as { id: string }).id })
        for (const c of await sessionsCookie(k.epost)) await page.setCookie({ ...c, url: BAS, path: '/' })
        await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
        await page.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2', timeout: 60000 })
        await new Promise((r) => setTimeout(r, 1500))
        const sista = n === kombinationer.length - 1

        let body = await text(page)
        kontroll(page.url().includes('/dashboard/cv-mallar'), `${steg}: sidan öppnas (${page.url().replace(BAS, '')})`)
        kontroll(/Sex av \d+ syns här\. Alla klarar rekryteringssystemens läsning\. Sex av dem finns också som Word/.test(body), `${steg}: steg 2 säger att sex finns som Word`)
        const wordEtiketter = await page.evaluate(
          () => [...document.querySelectorAll('[role="radiogroup"][aria-label="Välj mall"] [role="radio"]')].filter((e) => (e.getAttribute('aria-label') ?? '').includes('Finns också som Word')).length
        )
        kontroll(wordEtiketter === 5, `${steg}: Word-etiketten på fem av de sex synliga mallarna (${wordEtiketter})`)
        await bild(page, `${steg}-1-galleri`, '[role="radiogroup"][aria-label="Välj mall"]')

        await tillFormat(page)
        body = await text(page)
        kontroll(body.includes('Finns också som Word'), `${steg}: mallinfon har brickan Finns också som Word (Norrsken)`)

        if (k.roll === 'gratis') {
          kontroll(body.includes('PDF är gratis första gången. Word, för att ändra i filen själv, ingår i Premium.'), `${steg}: raden om gratis-PDF och Word i Premium`)
          kontroll(body.includes('Ladda ner som PDF'), `${steg}: knappen säger Ladda ner som PDF`)
          await bild(page, `${steg}-2-format-pdf`)
          await klickaText(page, '[role="radio"]', 'Word')
          body = await text(page)
          kontroll(body.includes('Word-filen ingår i Premium'), `${steg}: låst Word öppnar betalväggen "Word-filen ingår i Premium"`)
          kontroll(/Köp Premium, \d+ kr|Köp Premium/.test(body), `${steg}: betalväggen har köpknappen`)
          await bild(page, `${steg}-3-betalvagg`)
          await page.keyboard.press('Escape')
          await new Promise((r) => setTimeout(r, 600))
          await tillFormat(page)
          body = await text(page)
          kontroll(/Köp Premium/.test(body) && !body.includes('Ladda ner som Word'), `${steg}: med låst Word valt blir knappen köpknappen`)
          await bild(page, `${steg}-4-word-last`)
          await klickaText(page, '[role="radio"]', 'PDF')
          await valjMall(page, 'Sidopanel')
          await tillFormat(page)
          body = await text(page)
          kontroll(body.includes('Sidopanel laddas ner som PDF.'), `${steg}: mall utan Word visar "Sidopanel laddas ner som PDF."`)
          await page.evaluate(() => [...document.querySelectorAll('p')].find((p) => p.innerText === 'Sidopanel laddas ner som PDF.')?.scrollIntoView({ block: 'center' }))
          await bild(page, `${steg}-5-utan-word`)
          if (sista) {
            await valjMall(page, 'Norrsken')
            await tillFormat(page)
            await klickaText(page, 'button', 'Ladda ner som PDF')
            const pdf = await vantaFil(nedMapp, '.pdf', 60000)
            kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: gratis-PDF laddas ner (${pdf ? path.basename(pdf) : 'ingen fil'})`)
            await bild(page, `${steg}-6-pdf-klar`)
          }
        }

        if (k.roll === 'anvand') {
          kontroll(body.includes('Din gratisnedladdning är använd. Fler nedladdningar, i PDF och Word, ingår i Premium.'), `${steg}: raden om använd gratisnedladdning`)
          const last = await page.evaluate(() => [...document.querySelectorAll('[aria-labelledby="formatval-rubrik"] [role="radio"][aria-label*="Låst"]')].length)
          kontroll(last === 2, `${steg}: båda formaten låsta (${last})`)
          kontroll(body.includes('Se vad som ingår'), `${steg}: länken Se vad som ingår`)
          await bild(page, `${steg}-2-bada-lasta`)
        }

        if (k.roll === 'premium') {
          await valjMall(page, 'Tidlös')
          await tillFormat(page)
          body = await text(page)
          kontroll(/ATS-säker[\s\S]*Finns också som Word[\s\S]*Premium/.test(body), `${steg}: Tidlös mallinfo ATS-säker, Finns också som Word, Premium`)
          await klickaText(page, '[role="radio"]', 'Word')
          body = await text(page)
          kontroll(body.includes('Typsnitt i Word-filen: Garamond'), `${steg}: Typsnitt i Word-filen: Garamond`)
          kontroll(body.includes('Går att redigera') && body.includes('Ladda ner som Word'), `${steg}: Word öppet och knappen säger Ladda ner som Word`)
          await bild(page, `${steg}-2-word-valt`)
          await klickaText(page, 'button', 'Ladda ner som Word')
          const docx = await vantaFil(nedMapp, '.docx', 60000)
          const ok = Boolean(docx) && fs.readFileSync(docx!).subarray(0, 2).toString() === 'PK'
          kontroll(ok, `${steg}: Word-filen laddas ner (${docx ? path.basename(docx) + ', ' + fs.statSync(docx).size + ' byte' : 'ingen fil'})`)
          await new Promise((r) => setTimeout(r, 1200))
          body = await text(page)
          kontroll(/Ditt CV är klart som Word-fil: cv-tidlos-erik-lindberg\.docx/.test(body), `${steg}: bekräftelsen med filnamnet`)
          kontroll(body.includes('Ladda upp den nya versionen i CV-analysen'), `${steg}: återvägen till CV-analysen`)
          await page.evaluate(() => document.querySelector('section[role="status"]')?.scrollIntoView({ block: 'center' }))
          await bild(page, `${steg}-3-word-klar`)
        }

        kontroll(fel.length === 0, `${steg}: inga konsolfel eller 4xx/5xx${fel.length ? ': ' + fel.slice(0, 4).join(' | ') : ''}`)
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n'))
  }
}

const cmd = process.argv[2]
;(cmd === 'skapa' ? skapa() : cmd === 'radera' ? radera() : cmd === 'klicka' ? klicka() : Promise.reject(new Error('skapa | klicka | radera'))).catch((e) => {
  console.error(e)
  process.exit(1)
})
