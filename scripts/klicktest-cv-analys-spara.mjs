// Klicktest av slutsteget: granska -> spara (ersätt) -> Mallar, för premiumkontot.
// Körs från arbetskopian: node <denna fil>. Ett konto, en körning.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
)
const SCRATCH = process.env.SCRATCH
const UT = path.join(SCRATCH, 'cv', 'bygge', 'steg4', 'flode')
fs.mkdirSync(UT, { recursive: true })
const k = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-cv-analys-konton.json`, 'utf8')).premium
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const BAS = 'http://localhost:5320'

async function cookies(epost) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost })
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const { data: s } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  const ref = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
  const payload = 'base64-' + Buffer.from(JSON.stringify({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at, expires_in: s.session.expires_in, token_type: 'bearer', user: s.session.user })).toString('base64')
  const namn = `sb-${ref}-auth-token`
  const ut = []
  for (let i = 0, n = 0; i < payload.length; i += 3200, n++) ut.push({ name: `${namn}.${n}`, value: payload.slice(i, i + 3200) })
  return ut
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  for (const c of await cookies(k.email)) await page.setCookie({ ...c, url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS, path: '/' })
  // Det utlovade: Analys-sidans tal för profilförslaget.
  await page.goto(`${BAS}/dashboard/cv-analys?cv=${k.cv.analyserat}`, { waitUntil: 'networkidle2', timeout: 120000 })
  const fore = await page.evaluate(() => document.querySelector('.cv4-tal[data-nu] b')?.textContent)
  const plusProfil = await page.evaluate(() => {
    const rad = [...document.querySelectorAll('.cv4-last, .cv4-papper')].find((e) => e.textContent.includes('Sammanfattningen'))
    return rad?.querySelector('.cv4-pluspill')?.textContent ?? null
  })
  console.log('före', fore, 'plus profil', plusProfil)
  await page.goto(`${BAS}/dashboard/cv-analys?job=${k.jobb.analyserat}&cv=${k.cv.analyserat}&steg=5&valj=profil`, { waitUntil: 'networkidle2', timeout: 120000 })
  await new Promise((r) => setTimeout(r, 2500))
  const klicka = async (text) => {
    const ok = await page.evaluate((t) => {
      const el = [...document.querySelectorAll('button, a, [role="radio"], label')].find((b) => b.textContent.trim().startsWith(t))
      if (!el) return false
      el.click()
      return true
    }, text)
    if (!ok) throw new Error('hittade inte ' + text)
    await new Promise((r) => setTimeout(r, 1500))
  }
  await klicka('Nästa')
  await page.screenshot({ path: path.join(UT, 'spara-1440.png'), fullPage: true })
  await klicka('Ersätt mitt nuvarande CV')
  await page.screenshot({ path: path.join(UT, 'spara-valt-1440.png'), fullPage: true })
  await klicka('Spara mitt CV')
  await page.waitForFunction(() => location.pathname.startsWith('/dashboard/cv-mallar'), { timeout: 60000 })
  console.log('landade på', page.url())
  await new Promise((r) => setTimeout(r, 2500))
  await page.screenshot({ path: path.join(UT, 'mallar-efter-1440.png') })
  await page.goto(`${BAS}/dashboard/profil/cv?cv=${k.cv.analyserat}`, { waitUntil: 'networkidle2', timeout: 120000 })
  await new Promise((r) => setTimeout(r, 3000))
  await page.screenshot({ path: path.join(UT, 'ditt-cv-efter-1440.png'), fullPage: true })
  await page.goto(`${BAS}/dashboard/cv-analys?cv=${k.cv.analyserat}`, { waitUntil: 'networkidle2', timeout: 120000 })
  await new Promise((r) => setTimeout(r, 3000))
  const efter = await page.evaluate(() => document.querySelector('.cv4-tal[data-nu] b')?.textContent)
  const kvarProfil = await page.evaluate(() => [...document.querySelectorAll('.cv4-last, .cv4-papper')].some((e) => e.textContent.includes('Sammanfattningen')))
  console.log('efter', efter, 'profilen kvar som fynd', kvarProfil)
  await page.screenshot({ path: path.join(UT, 'analys-efter-1440.png'), fullPage: true })
} finally {
  await browser.close()
}
const { data: rader } = await sb.from('cv_analysis_jobs').select('id, cv_id, forbattrad:result->forbattradSparad').eq('user_id', k.userId)
console.log(JSON.stringify(rader))
