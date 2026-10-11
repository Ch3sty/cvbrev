// scripts/qa-rummen-knappar-360.mjs
// Knappkontrollen på 360 px (art-director 22.2 fråga 5, 22.3 punkt 5 och
// 21.3 punkt 11): KNAPP_PRIMAR har whitespace-nowrap, så en text som inte
// ryms bryts inte utan svämmar över. På 360 px, ljust läge, ska varje
// element med klassen `knapp-primar` på varje route ha scrollWidth <=
// clientWidth och inte sticka ut ur viewporten. En träff är rött.
// Knapptexter över 30 tecken listas för copywritern.
//
// Används två sätt:
//   1. Som modul: `import { kontrolleraKnappar } from './qa-rummen-knappar-360.mjs'`
//      och anropa på en öppen sida (de befintliga QA-skripten).
//   2. Fristående mot en produktionsserver:
//        node scripts/qa-rummen-knappar-360.mjs --port 5246 --konton <fil.json> \
//          --rutter tester,v4 --ut docs/qa/rummen/klar-3/knappar-360.json
//      Kontofilen är { roll: { email, dyn?: { letter, application, ... } } }
//      (samma form som qa-rummen-4-skriptets kontofil). Testrummets routes går
//      via förhandsvisningarna (TRANING_FORHANDSVISNING=1).
//
// Kontot loggas in med en magisk länk via service-nyckeln, som de andra
// QA-skripten. Inget skrivs i databasen.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Kontrollen på en öppen sida. Returnerar alla primärknappar och träffarna. */
export async function kontrolleraKnappar(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const knappar = [...document.querySelectorAll('.knapp-primar')]
    const alla = []
    for (const el of knappar) {
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      // Dolda förfäder (lg:hidden-varianter m.m.) ger bredd 0 ovan.
      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
      const over = el.scrollWidth > el.clientWidth + 0.5
      const utanfor = r.left < -0.5 || r.right > vw + 0.5
      alla.push({
        text,
        tecken: text.length,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        vanster: Math.round(r.left),
        hoger: Math.round(r.right),
        over,
        utanfor,
      })
    }
    return { viewport: vw, knappar: alla, rott: alla.filter((k) => k.over || k.utanfor) }
  })
}

/* ------------------------------------------------------------------ CLI */

const arHuvud = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (arHuvud) {
  const { createClient } = await import('@supabase/supabase-js')
  const puppeteer = (await import('puppeteer-core')).default

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
  const arg = (namn, fallback) => {
    const i = process.argv.indexOf('--' + namn)
    return i >= 0 ? process.argv[i + 1] : fallback
  }
  const PORT = arg('port', '5246')
  const BAS = `http://localhost:${PORT}`
  const KONTOFIL = arg('konton')
  if (!KONTOFIL) throw new Error('--konton <fil.json> krävs')
  const KONTON = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  const RUTTER = (arg('rutter', 'tester,v4') || '').split(',')
  const UT = path.resolve(arg('ut', 'docs/qa/rummen/klar-3/knappar-360.json'))
  fs.mkdirSync(path.dirname(UT), { recursive: true })

  // Testrummet (22.3 punkt 5): hemvyns alla tillstånd, E1 till E3, passets ramar.
  const HEM = ['T1', 'T1s', '1a', '1as', '1t', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1p', 'X1', 'L1', 'W1', 'W2', 'W3', 'W4']
  const RAMER = ['P1', 'P2', 'P3', 'P4', 'S1', 'M0', 'M1', 'M1&betalande=1', 'M1&grundgjort=1', 'O1', 'O1&milstolpe=0', 'K1', 'uppvarmning']
  const TESTER = [
    ...HEM.map((t) => ({ namn: `hem-${t}`, path: `/dashboard/tester/forhandsvisning?tillstand=${t}` })),
    { namn: 'hem-F1', path: '/dashboard/tester/forhandsvisning?tillstand=1b&sida=kurvan' },
    { namn: 'E1', path: '/dashboard/tester/installningar?forsta=1' },
    { namn: 'E1-steg1', path: '/dashboard/tester/installningar?steg=1' },
    { namn: 'E2', path: '/dashboard/tester/installningar?steg=2' },
    { namn: 'E3', path: '/dashboard/tester/installningar?steg=3' },
    ...RAMER.map((r) => ({ namn: `pass-${r.replace(/[&=]/g, '-')}`, path: `/dashboard/tester/forhandsvisning-pass?ram=${r}` })),
    { namn: 'tester', path: '/dashboard/tester' },
  ]
  // Våg 4 (21.3 punkt 11): CV-, brev- och Jobbsök-routes.
  const V4 = [
    { namn: 'dashboard', path: '/dashboard' },
    { namn: 'profil-cv', path: '/dashboard/profil/cv' },
    { namn: 'cv-analys', path: '/dashboard/cv-analys' },
    { namn: 'cv-analys-job', path: '/dashboard/cv-analys?job=ID', dyn: 'analysJob' },
    { namn: 'cv-mallar', path: '/dashboard/cv-mallar' },
    { namn: 'skapa-cv', path: '/dashboard/skapa-cv' },
    { namn: 'linkedin-optimizer', path: '/dashboard/linkedin-optimizer' },
    { namn: 'mina-brev', path: '/dashboard/mina-brev' },
    { namn: 'mina-brev-id', path: '/dashboard/mina-brev/ID', dyn: 'letter' },
    { namn: 'mina-brev-id-klart', path: '/dashboard/mina-brev/ID?klart=1', dyn: 'letter' },
    { namn: 'mina-brev-id-edit', path: '/dashboard/mina-brev/ID/edit', dyn: 'letter' },
    { namn: 'skapa-brev', path: '/dashboard/skapa-brev' },
    { namn: 'sokta-tjanster', path: '/dashboard/sokta-tjanster' },
    { namn: 'sokta-tjanster-id', path: '/dashboard/sokta-tjanster/ID', dyn: 'application' },
    { namn: 'jobbmatchning', path: '/dashboard/jobbmatchning' },
    { namn: 'jobbcoachen', path: '/dashboard/jobbcoachen' },
    { namn: 'bli-upptackt', path: '/dashboard/bli-upptackt' },
    { namn: 'intervju', path: '/dashboard/intervju' },
    { namn: 'arbetsstil', path: '/dashboard/arbetsstil' },
    { namn: 'profil', path: '/dashboard/profil' },
    { namn: 'prenumeration', path: '/dashboard/profil/prenumeration' },
  ]

  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
  const COOKIE = `sb-${projektRef}-auth-token`
  async function payloadFor(email) {
    const { data: link, error: lErr } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
    if (lErr) throw new Error('länk: ' + lErr.message)
    const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
    if (error || !s?.session) throw new Error('session: ' + error?.message)
    const { access_token, refresh_token, expires_at, expires_in, user } = s.session
    return 'base64-' + Buffer.from(JSON.stringify({ access_token, refresh_token, expires_at, expires_in, token_type: 'bearer', user })).toString('base64')
  }

  const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  const resultat = { datum: new Date().toISOString(), bredd: 360, rutter: RUTTER, konton: {}, rott: [], langaTexter: [] }
  const langa = new Map()
  try {
    for (const [roll, k] of Object.entries(KONTON)) {
      if (!k?.email) continue
      const page = await browser.newPage()
      await page.emulate({
        viewport: { width: 360, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      })
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
      const p = await payloadFor(k.email)
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
      const lista = [...(RUTTER.includes('tester') ? TESTER : []), ...(RUTTER.includes('v4') ? V4 : [])]
      resultat.konton[roll] = []
      for (const r of lista) {
        let url = r.path
        if (r.dyn) {
          const id = k.dyn?.[r.dyn]
          if (!id) continue
          url = url.replace('ID', id)
        }
        try {
          await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 90000 })
          await new Promise((res) => setTimeout(res, 700))
          const k360 = await kontrolleraKnappar(page)
          const landade = new URL(page.url()).pathname + new URL(page.url()).search
          resultat.konton[roll].push({ namn: r.namn, url, landade, viewport: k360.viewport, knappar: k360.knappar.map((b) => b.text), rott: k360.rott })
          for (const b of k360.knappar) if (b.tecken > 30) langa.set(b.text, (langa.get(b.text) ?? 0) + 1)
          for (const b of k360.rott) resultat.rott.push({ roll, namn: r.namn, url, ...b })
          console.log(`${roll} ${r.namn}: ${k360.knappar.length} knappar, ${k360.rott.length} röda`)
        } catch (e) {
          resultat.konton[roll].push({ namn: r.namn, url, fel: String(e.message).slice(0, 200) })
          console.log(`${roll} ${r.namn}: FEL ${e.message}`)
        }
      }
      await page.close()
    }
  } finally {
    await browser.close()
  }
  resultat.langaTexter = [...langa.entries()].map(([text, antal]) => ({ text, tecken: text.length, antal }))
  fs.writeFileSync(UT, JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.rott.length} röda. Resultat: ${UT}`)
  if (resultat.rott.length) process.exitCode = 1
}
