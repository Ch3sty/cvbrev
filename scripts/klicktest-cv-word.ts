/**
 * Klicktestet för CV som Word-fil (docs/plan-cv-word-2026-11-15.md avsnitt 7)
 * i riktig Chrome, som nya användare: Pixel 7 och 1280 px, ljust och mörkt.
 *
 *   npx tsx scripts/klicktest-cv-word.ts skapa  --ut <mapp>            # tre QA-konton, id i <mapp>/konton.json
 *   npx tsx scripts/klicktest-cv-word.ts klicka --ut <mapp> [--bas URL] [--skarpt] # skärmdumpar och kontroller
 *   npx tsx scripts/klicktest-cv-word.ts radera --ut <mapp>            # raderar exakt kontona i konton.json
 *
 * Kontona: gratis (före första nedladdningen), gratis med använd
 * nedladdning, och Premium. Varje konto har ett CV (Erik Lindberg).
 * Adresserna är unika per körning (qa-cvword-<roll>-<tid>@jobbcoach-qa.test),
 * och raderingen går bara på id:n som skriptet själv skapat.
 *
 * CV-rummet (omgång 1): Mallar i nya ytan (scripts/klicktest-cv-yta.ts).
 * Utan --skarpt besvaras nedladdningen i webbläsaren; med --skarpt laddas
 * filerna ner på riktigt.
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import puppeteer, { type Page } from 'puppeteer-core'
import { NORMALT_CV } from '../src/lib/cv/word/__tests__/fixtures'
import { SKARPT, YTA, fejkaNedladdning, klickaSynlig, synlig, synligText } from './klicktest-cv-yta'

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
async function bild(page: Page, namn: string, element?: string) {
  const fil = path.join(UT, `${namn}.png`) as `${string}.png`
  if (element) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), element)
    await new Promise((r) => setTimeout(r, 300))
  }
  await page.screenshot({ path: fil })
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
        await fejkaNedladdning(page, { traff: { traff: null } })
        await page.goto(`${BAS}/dashboard/cv-mallar?cv=${k.cvId}&mall=linne`, { waitUntil: 'networkidle2', timeout: 60000 })
        await page.waitForSelector(YTA.arkIframe, { timeout: 60000 }).catch(() => null)
        await new Promise((r) => setTimeout(r, 1500))
        const sista = n === kombinationer.length - 1
        const knapp = () => synligText(page, YTA.ladda)
        const wordEtikett = () => page.evaluate((s) => [...document.querySelectorAll<HTMLElement>(s)].find((e) => e.offsetParent !== null)?.getAttribute('aria-label') ?? '', YTA.word)

        let body = await text(page)
        kontroll(page.url().includes('/dashboard/cv-mallar') && (await synlig(page, YTA.format)), `${steg}: sidan öppnas med formatvalet (${page.url().replace(BAS, '')})`)
        const wordFilter = await page.evaluate((s) => [...document.querySelectorAll<HTMLElement>(s)].find((e) => /^Word/.test(e.innerText))?.innerText ?? '', '[aria-label="Filtrera mallar"] button')
        kontroll(/Word\s*\d+/.test(wordFilter), `${steg}: filtret Word räknar mallarna med Word (${wordFilter.replace(/\s+/g, ' ')})`)
        await bild(page, `${steg}-1-galleri`)

        if (k.roll === 'gratis') {
          kontroll((await wordEtikett()) === 'Word' && (await knapp()).startsWith('Ladda ner PDF'), `${steg}: gratismallen: Word öppet, knappen Ladda ner PDF`)
          await klickaSynlig(page, YTA.ruta('kalksten'))
          await new Promise((r) => setTimeout(r, 900))
          kontroll((await wordEtikett()) === 'Word, ingår i Premium', `${steg}: Premiummall: Word med lås`)
          await klickaSynlig(page, YTA.word)
          await page.waitForSelector(YTA.sparr('cv-export-word'), { timeout: 15000 }).catch(() => null)
          body = await text(page)
          // Dagens rubrik står som ögonrad i versaler (text-transform), och innerText ger versalerna.
          kontroll((await synlig(page, YTA.sparr('cv-export-word'))) && /Word i den här mallen ingår i Premium/i.test(body), `${steg}: låst Word öppnar spärren "Word i den här mallen ingår i Premium"`)
          kontroll(/Köp Premium/.test(body), `${steg}: spärren har köpknappen`)
          await bild(page, `${steg}-3-sparr`)
          await page.keyboard.press('Escape')
          await new Promise((r) => setTimeout(r, 600))
          kontroll(/Premium/.test(await knapp()) && (await knapp()).startsWith('Ladda ner Word'), `${steg}: med låst Word valt säger knappen priset (${(await knapp()).replace(/\s+/g, ' ')})`)
          await bild(page, `${steg}-4-word-last`)
          await klickaSynlig(page, YTA.pdf)
          await klickaSynlig(page, YTA.ruta('affisch'))
          await new Promise((r) => setTimeout(r, 900))
          kontroll((await wordEtikett()) === 'Word finns inte i den här mallen', `${steg}: mall utan Word: Word avstängt`)
          await bild(page, `${steg}-5-utan-word`)
          if (sista) {
            await klickaSynlig(page, YTA.ruta('linne'))
            await new Promise((r) => setTimeout(r, 900))
            await klickaSynlig(page, YTA.ladda)
            const pdf = await vantaFil(nedMapp, '.pdf', 60000)
            kontroll(Boolean(pdf) && fs.readFileSync(pdf!).subarray(0, 4).toString() === '%PDF', `${steg}: gratis-PDF laddas ner${SKARPT ? '' : ' (påhittad)'} (${pdf ? path.basename(pdf) : 'ingen fil'})`)
            await page.waitForSelector(YTA.final, { timeout: 15000 }).catch(() => null)
            kontroll(await synlig(page, YTA.final), `${steg}: målgången visas`)
            await bild(page, `${steg}-6-pdf-klar`)
          }
        }

        if (k.roll === 'anvand') {
          await klickaSynlig(page, YTA.ladda)
          await new Promise((r) => setTimeout(r, 1500))
          body = await text(page)
          kontroll((await synlig(page, YTA.merforsaljning)) || body.includes('Din gratis nedladdning är använd'), `${steg}: använd gratisnedladdning: merförsäljningen eller spärren`)
          kontroll(body.includes('Nej tack') || body.includes('Se vad som ingår'), `${steg}: en väg ut (Nej tack eller Se vad som ingår)`)
          await bild(page, `${steg}-2-anvand`)
        }

        if (k.roll === 'premium') {
          await klickaSynlig(page, YTA.ruta('kalksten'))
          await new Promise((r) => setTimeout(r, 900))
          await klickaSynlig(page, YTA.word)
          await new Promise((r) => setTimeout(r, 500))
          kontroll((await knapp()).startsWith('Ladda ner Word') && !/Premium/.test(await knapp()), `${steg}: Word öppet och knappen säger Ladda ner Word`)
          await bild(page, `${steg}-2-word-valt`)
          await klickaSynlig(page, YTA.ladda)
          const docx = await vantaFil(nedMapp, '.docx', 60000)
          const ok = Boolean(docx) && fs.readFileSync(docx!).subarray(0, 2).toString() === 'PK'
          kontroll(ok, `${steg}: Word-filen laddas ner${SKARPT ? '' : ' (påhittad)'} (${docx ? path.basename(docx) + ', ' + fs.statSync(docx).size + ' byte' : 'ingen fil'})`)
          await page.waitForSelector(YTA.final, { timeout: 15000 }).catch(() => null)
          body = await text(page)
          kontroll((await synlig(page, YTA.final)) && /.docx/.test(body) && body.includes('Kalksten'), `${steg}: målgången med filnamnet och mallen`)
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
