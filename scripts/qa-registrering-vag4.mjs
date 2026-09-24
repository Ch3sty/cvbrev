// scripts/qa-registrering-vag4.mjs
// Våg 4: profilsidan (Del A). Körs via scripts/qa-registrering.mjs 4.
// Använder QA-kontot "bar" från våg 1 (namn ifyllt, ort saknas) ur
// QA_KONTON_FIL. Fixturerna (ett 5 MB-foto och en PDF) ligger i QA_FIXTURER.

import fs from 'node:fs'
import path from 'node:path'

export async function kor(q) {
  const { browser, ga, nySida, skott, text, logg, loggaIn, vanta, admin, cls, PIXEL7, DESKTOP } = q
  const k = JSON.parse(fs.readFileSync(process.env.QA_KONTON_FIL, 'utf8')).konton
  const konto = [...k].reverse().find((x) => x.tagg === 'bar')
  if (!konto) throw new Error('inget bar-konto från våg 1')
  const FIX = process.env.QA_FIXTURER
  const foto = path.join(FIX, 'foto-5mb.jpg')
  const pdf = path.join(FIX, 'dokument.pdf')

  // Utgångsläge: namn ifyllt, ort, foto och ton tomma.
  await admin
    .from('profiles')
    .update({ location: null, profile_photo_url: null, preferred_tonality: 'balanced', avatar_source: null })
    .eq('id', konto.id)

  /* Pixel 7 */
  {
    const { p, ctx, fel } = await nySida(browser, PIXEL7)
    await loggaIn(p, konto.email)
    const uppladdningar = []
    p.on('request', (r) => {
      if (r.url().includes('/api/profile/photo/upload')) uppladdningar.push(Number(r.headers()['content-length'] ?? 0))
    })
    await ga(p, '/dashboard/profil')
    const matt = await p.evaluate(() => {
      const y = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY)
      const knapp = [...document.querySelectorAll('#cv button')].find((b) => b.innerText.includes('Ladda upp foto'))
      const cv = document.getElementById('cv')
      const ram = document.querySelector('[data-foto-falt]')
      return {
        ram: ram ? y(ram) + Math.round(ram.getBoundingClientRect().height) : 9999,
        knapp: knapp ? y(knapp) + Math.round(knapp.getBoundingClientRect().height) : 9999,
        cvSlut: cv ? y(cv) + Math.round(cv.getBoundingClientRect().height) : 9999,
      }
    })
    logg('pixel7: fotoramen och knappen inom 900 px', matt.ram <= 900 && matt.knapp <= 900, JSON.stringify(matt))
    logg('pixel7: Överst i ditt CV slutar före 1 400 px', matt.cvSlut < 1400, String(matt.cvSlut))
    let t = await text(p)
    logg('statusrad: Ort saknas i ditt CV', t.includes('Ort saknas i ditt CV'))
    logg('statusrad: ordet foto nämns inte', !/Ort saknas i ditt CV[^\n]*foto/i.test(t))
    const ordning = await p.evaluate(() => [...document.querySelectorAll('section[id] > div > h2')].map((h) => h.closest('section').id))
    logg('sektionsordning cv, personliga-brev, jobbsok, konto', JSON.stringify(ordning) === JSON.stringify(['cv', 'personliga-brev', 'jobbsok', 'konto']), JSON.stringify(ordning))
    logg('växlarna för brevhuvudet bara i Personliga brev', await p.evaluate(() => !document.querySelector('#cv [role="switch"]') && document.querySelectorAll('#personliga-brev [role="switch"]').length === 2))
    logg('profil: CLS 0', (await cls(p)) === 0)
    await skott(p, 'pixel7-profil-topp')
    await skott(p, 'pixel7-profil-hel', true)

    // Hoppa till → Personliga brev.
    await p.click('nav[aria-label="Hoppa till"] a[href="#personliga-brev"]')
    await vanta(900)
    const rubrik = await p.evaluate(() => Math.round(document.querySelector('#personliga-brev h2').getBoundingClientRect().top))
    logg('Hoppa till: Personliga brev med rubriken under toppraden', rubrik >= 56 && rubrik < 300, String(rubrik))
    await skott(p, 'pixel7-hoppa-personliga-brev')

    // Förvald ton: Självsäker.
    await p.click('#personliga-brev [data-ton="confident"]')
    await vanta(2000)
    t = await text(p)
    logg('ton: Självsäker sparad', /Sparat/.test(t))

    // 5 MB-foto.
    const input = await p.$('input[data-foto-input]')
    await input.uploadFile(foto)
    for (let i = 0; i < 30; i++) {
      const klar = await p.evaluate(() => [...document.querySelectorAll('#cv button')].some((b) => b.innerText.includes('Byt foto')))
      if (klar) break
      await vanta(500)
    }
    await vanta(1500)
    const { data: r1 } = await admin.from('profiles').select('profile_photo_url').eq('id', konto.id).maybeSingle()
    logg('foto: 5 MB-fotot sparat', Boolean(r1?.profile_photo_url))
    const { data: filer } = await admin.storage.from('profile-photos').list(`users/${konto.id}`)
    const storlek = (filer ?? []).map((f) => f.metadata?.size ?? 0)
    logg('foto: sparat under 2 MB (lagrat i bucketen)', storlek.length === 1 && storlek[0] > 0 && storlek[0] < 2 * 1024 * 1024, JSON.stringify({ storlek, fore: fs.statSync(foto).size, anrop: uppladdningar.length }))
    await skott(p, 'pixel7-foto-klart')

    // PDF: felraden under ramen, ingen toast.
    const input2 = await p.$('input[data-foto-input]')
    await input2.uploadFile(pdf)
    await vanta(800)
    t = await text(p)
    const toast = await p.evaluate(() => Boolean(document.querySelector('.Toastify__toast')))
    logg('foto: PDF ger felraden Filen går inte att läsa', t.includes('Filen går inte att läsa') && t.includes('Välj en bild i JPG, PNG eller WebP.'))
    logg('foto: ingen toast', !toast)
    await p.evaluate(() => document.querySelector('[data-foto-falt]')?.scrollIntoView({ block: 'center' }))
    await skott(p, 'pixel7-foto-fel-pdf')

    // Ta bort.
    await p.evaluate(() => [...document.querySelectorAll('#cv button')].find((b) => b.innerText.trim() === 'Ta bort')?.click())
    await vanta(2500)
    const { data: r2 } = await admin.from('profiles').select('profile_photo_url, preferred_tonality').eq('id', konto.id).maybeSingle()
    logg('foto: Ta bort sparat', !r2?.profile_photo_url, JSON.stringify(r2))
    logg('ton: confident i databasen', r2?.preferred_tonality === 'confident')

    // Ort, och statusraden försvinner.
    const ort = await p.$('input[autocomplete="address-level2"]')
    await ort.click()
    await ort.type('Örebro')
    await p.keyboard.press('Tab')
    await vanta(2000)
    t = await text(p)
    logg('statusrad: försvinner med namn och ort ifyllda', !t.includes('Ort saknas i ditt CV'))

    // Ladda om: allt sparat.
    await ga(p, '/dashboard/profil#personliga-brev')
    await vanta(800)
    const efter = await p.evaluate(() => ({
      ton: document.querySelector('#personliga-brev [role="radio"][aria-checked="true"]')?.getAttribute('data-ton'),
      ort: document.querySelector('input[autocomplete="address-level2"]')?.value,
      rubrik: Math.round(document.querySelector('#personliga-brev h2').getBoundingClientRect().top),
    }))
    logg('omladdning: ton och ort sparade', efter.ton === 'confident' && efter.ort === 'Örebro', JSON.stringify(efter))
    logg('#personliga-brev landar med rubriken synlig under toppraden', efter.rubrik >= 56 && efter.rubrik < 300, String(efter.rubrik))
    await skott(p, 'pixel7-ankare-personliga-brev')

    // Konto: arken.
    await p.evaluate(() => [...document.querySelectorAll('#konto button')].find((b) => b.innerText.startsWith('Mejl från oss'))?.click())
    await vanta(600)
    logg('konto: Mejl från oss öppnar arket med två växlar', (await p.$$('[role="dialog"] [role="switch"]')).length === 2)
    await skott(p, 'pixel7-konto-mejl')
    await p.keyboard.press('Escape')
    await vanta(400)
    logg('pixel7: inga sidfel', fel.length === 0, fel.join(' | '))
    await ctx.close()
  }

  /* Desktop: två spalter med CV-huvudets förhandsvisning. */
  {
    const { p, ctx } = await nySida(browser, DESKTOP)
    await loggaIn(p, konto.email)
    await ga(p, '/dashboard/profil')
    const d = await p.evaluate(() => {
      const fig = document.querySelector('#cv figure')
      const r = fig?.getBoundingClientRect()
      return { synlig: Boolean(r && r.width > 100), bredd: Math.round(r?.width ?? 0), text: fig?.innerText ?? '' }
    })
    logg('desktop: CV-huvudets förhandsvisning till höger', d.synlig && d.text.includes('Örebro'), JSON.stringify(d))
    const skift = await p.evaluate(() => new Promise((res) => { const ut = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) ut.push({ v: Math.round(e.value * 1000) / 1000, src: (e.sources || []).map((s) => (s.node?.nodeName || '') + '#' + (s.node?.id || '') + '.' + String(s.node?.className || '').slice(0, 50)) }) }).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(ut), 800) }))
    logg('desktop: CLS 0', skift.reduce((a, x) => a + x.v, 0) === 0, JSON.stringify(skift))
    await skott(p, 'desktop-profil')
    // Smart val på gratisnivån.
    await p.click('#personliga-brev [data-ton="auto"]')
    await vanta(800)
    const t = await text(p)
    logg('Smart val: luckan med paketnamn och pris', t.includes('Smart val ingår när du har ett paket') && /79 kr i veckan/.test(t))
    await skott(p, 'desktop-smart-val')
    await ctx.close()
  }
}
