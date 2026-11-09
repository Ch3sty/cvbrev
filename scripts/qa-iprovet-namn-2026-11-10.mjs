// scripts/qa-iprovet-namn-2026-11-10.mjs
// Skärmdumpar av namnet "I-provet" (ägaren 2026-11-10) för ett konto med
// valet Polisen: hemvyn, Alla tester och startarket. Pixel 7 ljust, 1280 mörkt.
// Kontot skapas och raderas per id i samma körning.
//
//   QA_UT=<mapp utanför git> node scripts/qa-iprovet-namn-2026-11-10.mjs

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:3119'
const UT = process.env.QA_UT
if (!UT) throw new Error('QA_UT saknas')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
fs.mkdirSync(UT, { recursive: true })
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const LOSEN = 'QaIprovet!2026'
const email = `qa-iprovet-${Date.now()}@jobbcoach-qa.test`
const resultat = []
const logg = (n, ok, not = '') => { resultat.push({ n, ok: !!ok, not }); console.log(`${ok ? 'OK ' : 'FEL'}  ${n}${not ? '  ' + not : ''}`) }

const { data: skapad, error } = await admin.auth.admin.createUser({ email, password: LOSEN, email_confirm: true })
if (error) throw error
const id = skapad.user.id
fs.writeFileSync(path.join(UT, 'qa-konto-iprovet.json'), JSON.stringify({ id, email }))
try {
  await vanta(1500)
  await admin.from('test_planer').upsert({ user_id: id, mitt_test: 'iprov', mitt_test_variant: 'polis', testtyper: [], extra_typer: ['ordforrad', 'spatial', 'talserie'] })
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  for (const [namn, vy, morkt] of [
    ['pixel7-ljust', { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, false],
    ['desktop-morkt', { width: 1280, height: 800, deviceScaleFactor: 1 }, true],
  ]) {
    const ctx = await browser.createBrowserContext()
    const p = await ctx.newPage()
    await p.setViewport(vy)
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: morkt ? 'dark' : 'light' }])
    const fel = []
    p.on('pageerror', (e) => fel.push(String(e.message).slice(0, 160)))
    await p.goto(BAS + '/login', { waitUntil: 'networkidle2' })
    await p.type('input[type="email"]', email)
    await p.type('input[type="password"]', LOSEN)
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('footer button[type="submit"]')])
    await vanta(1500)
    for (const [sida, url] of [['hem', '/dashboard/tester'], ['alla', '/dashboard/tester/alla'], ['startark', '/dashboard/tester/iprov']]) {
      await p.goto(BAS + url, { waitUntil: 'networkidle2' })
      await vanta(1200)
      const t = await p.evaluate(() => document.body.innerText)
      logg(`${namn} ${sida}: inget "I-prov 2025" utom versionsraden`, !t.replace('Versionen heter I-prov 2025 och används sedan maj 2025.', '').includes('I-prov 2025'))
      logg(`${namn} ${sida}: I-provet nämns`, t.includes('I-provet'))
      if (sida === 'startark') logg(`${namn} startark: versionsraden`, t.includes('Versionen heter I-prov 2025 och används sedan maj 2025.'))
      await p.screenshot({ path: path.join(UT, `namn-${namn}-${sida}.png`) })
    }
    logg(`${namn}: inga sidfel`, fel.length === 0, fel.join(' | '))
    await ctx.close()
  }
  await browser.close()
} finally {
  const { count } = await admin.from('test_planer').select('*', { count: 'exact', head: true }).eq('user_id', id)
  console.log('räknat före radering: test_planer', count)
  await admin.from('test_planer').delete().eq('user_id', id)
  const { error: e2 } = await admin.auth.admin.deleteUser(id)
  console.log(e2 ? `FEL radering ${e2.message}` : `raderad ${id}`)
}
console.log(`${resultat.filter((r) => r.ok).length} av ${resultat.length} OK`)
