// scripts/qa-registrering-vag2.mjs
// Våg 2: tratten i tre steg, ingångarna, Kom igång per val, hemskärmen och
// menyn. Körs via scripts/qa-registrering.mjs 2.

export async function kor(q) {
  const { browser, ga, nySida, skott, text, logg, klickaText, skapaKonto, registreraId, nyEpost, vanta, admin, BAS, PIXEL7, DESKTOP } = q

  const konton = {}

  /** Steg 1 till landningen för ett val, med skärmdump per steg. */
  async function tratt(intent, vy, vyNamn, { beslut = 'gratis', kryss = false } = {}) {
    const { p, ctx, fel } = await nySida(browser, vy)
    await ga(p, '/')
    // Headerns Skapa konto, så att ingången blir header.
    await p.evaluate(() => document.querySelector('a[data-cta="navbar-signup"]')?.click())
    await p.waitForFunction(() => location.pathname === '/register', { timeout: 30000 })
    await vanta(1200)
    let t = await text(p)
    logg(`${intent}: steg 1 visas från headern`, t.includes('Vad vill du börja med?'))
    await skott(p, `${vyNamn}-${intent}-steg1`)
    await p.click(`[role="radio"][data-intent="${intent}"]`)
    await vanta(200)
    await skott(p, `${vyNamn}-${intent}-steg1-valt`)
    await klickaText(p, 'footer button', 'Fortsätt')
    await vanta(500)
    t = await text(p)
    logg(`${intent}: steg 2 med valraden`, t.includes('Skapa ditt konto') && t.includes('Du börjar med'))
    await skott(p, `${vyNamn}-${intent}-steg2`)
    const email = nyEpost(intent)
    await skapaKonto(p, { namn: `Anna ${intent}`, email })
    const id = await registreraId(email, intent)
    konton[intent] = { id, email }
    // Steg 3.
    for (let i = 0; i < 20 && !/steg 3 av 3/i.test(await text(p)); i++) await vanta(500)
    t = await text(p)
    logg(`${intent}: steg 3 visas`, /steg 3 av 3/i.test(t) && /förslag utifrån ditt val/i.test(t), p.url().replace(BAS, ''))
    logg(`${intent}: rubriken med förnamnet`, t.includes(`Klart, Anna.`))
    await skott(p, `${vyNamn}-${intent}-steg3`)
    // Lika stora knappar.
    const storlek = await p.evaluate(() => {
      const f = document.querySelector('footer')
      const b = [...(f?.querySelectorAll('button') ?? [])].map((e) => e.getBoundingClientRect())
      return b.map((r) => [Math.round(r.width), Math.round(r.height)])
    })
    logg(`${intent}: Köp och Börja gratis lika stora`, storlek.length === 2 && storlek[0][1] === storlek[1][1] && (vy.isMobile ? Math.abs(storlek[0][0] - storlek[1][0]) <= 1 : storlek[1][0] >= 200), JSON.stringify(storlek))
    if (beslut === 'kop') {
      await klickaText(p, 'footer button', 'Köp')
    } else if (kryss) {
      await p.click('header button[aria-label="Stäng"]')
    } else {
      await klickaText(p, 'footer button', 'Börja gratis')
    }
    await p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await vanta(2000)
    await skott(p, `${vyNamn}-${intent}-landning`)
    const url = p.url().replace(BAS, '')
    logg(`${intent}: inga sidfel`, fel.length === 0, fel.join(' | '))
    return { p, ctx, url }
  }

  /* 1. Pixel 7, steg 1: frågan, fyra kort och Fortsätt utan scroll, spärrorsaken. */
  {
    const { p, ctx } = await nySida(browser, PIXEL7)
    await ga(p, '/register')
    const matt = await p.evaluate(() => {
      const kort = [...document.querySelectorAll('[role="radio"]')]
      const knapp = [...document.querySelectorAll('footer button')].find((b) => b.innerText.trim() === 'Fortsätt')
      return {
        fjardeBotten: Math.round(kort[3]?.getBoundingClientRect().bottom ?? 9999),
        knappBotten: Math.round(knapp?.getBoundingClientRect().bottom ?? 9999),
        huvudTopp: Math.round(knapp?.closest('footer')?.getBoundingClientRect().top ?? 0),
        hojd: innerHeight,
        sparrad: knapp?.disabled,
        sparr: document.querySelector('footer [aria-live="polite"]')?.textContent ?? '',
      }
    })
    logg('steg 1: fyra kort ovanför foten', matt.fjardeBotten <= matt.huvudTopp, JSON.stringify(matt))
    logg('steg 1: Fortsätt syns utan scroll', matt.knappBotten <= matt.hojd)
    logg('steg 1: Fortsätt spärrad med orsak', matt.sparrad === true && matt.sparr.includes('Välj vad du vill börja med'))
    // Tangentbord: fokus på första kortet, två pilar ned väljer testerna.
    await p.focus('[role="radio"][data-intent="cv"]')
    await p.keyboard.press('ArrowDown')
    await p.keyboard.press('ArrowDown')
    const valt = await p.evaluate(() => document.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('data-intent'))
    const fokus = await p.evaluate(() => document.activeElement?.getAttribute('data-intent'))
    logg('steg 1: piltangenterna flyttar och väljer', valt === 'tester' && fokus === 'tester', `${valt}/${fokus}`)
    await p.keyboard.press('Tab')
    const tabb = await p.evaluate(() => document.activeElement?.textContent?.trim())
    logg('steg 1: Tabb går till Hoppa över', tabb === 'Hoppa över och skapa konto direkt', tabb)
    await skott(p, 'pixel7-steg1-tangentbord')
    // Tillbaka från steg 2 behåller valet.
    await klickaText(p, 'footer button', 'Fortsätt')
    await vanta(400)
    await p.click('button[aria-label="Föregående steg"]')
    await vanta(400)
    const kvar = await p.evaluate(() => document.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('data-intent'))
    logg('steg 2: tillbaka-pilen behåller valet', kvar === 'tester', kvar ?? '')
    await ctx.close()
  }

  /* 2. ?borja=tester: steg 2 direkt, Ändra leder till steg 1 med testerna förvalda. */
  {
    const { p, ctx } = await nySida(browser, PIXEL7)
    await ga(p, '/register?borja=tester')
    let t = await text(p)
    logg('borja: steg 2 direkt', /steg 2 av 3/i.test(t) && t.includes('Du börjar med rekryteringstesterna'))
    await skott(p, 'pixel7-borja-tester-steg2')
    await klickaText(p, 'button', 'Ändra')
    await vanta(400)
    const valt = await p.evaluate(() => document.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('data-intent'))
    logg('borja: Ändra ger steg 1 med testerna förvalda', valt === 'tester', valt ?? '')
    await skott(p, 'pixel7-borja-andra-steg1')
    await ctx.close()
  }

  /* 3. Verktygssidan skickar ?borja=tester. */
  {
    const { p, ctx } = await nySida(browser, DESKTOP)
    await ga(p, '/verktyg/rekryteringstester')
    const hrefs = await p.evaluate(() =>
      [...document.querySelectorAll('a')].filter((a) => a.innerText.trim() === 'Starta gratis test').map((a) => a.getAttribute('href'))
    )
    logg('testsidan: fyra Starta gratis test till ?borja=tester', hrefs.length === 4 && hrefs.every((h) => h === '/register?borja=tester'), JSON.stringify(hrefs))
    await ctx.close()
  }

  /* 4. De fem valen, ett nytt konto per val från headern. */
  const cv = await tratt('cv', PIXEL7, 'pixel7')
  logg('cv: Börja gratis landar på CV-byggaren', cv.url.startsWith('/dashboard/skapa-cv'), cv.url)
  await cv.ctx.close()

  const brev = await tratt('brev', PIXEL7, 'pixel7')
  logg('brev: Börja gratis landar på Skriv nytt brev', brev.url.startsWith('/dashboard/skapa-brev') || brev.url.startsWith('/dashboard/profil/cv'), brev.url)
  await brev.ctx.close()

  const tester = await tratt('tester', PIXEL7, 'pixel7', { beslut: 'kop' })
  const tt = await text(tester.p)
  logg('tester: Köp landar på köpsteget med Träningspaketet och samtycket', tester.url.includes('/dashboard/valj-spar?paket=test_week&steg=kop') && tt.includes('Träningspaketet') && /ångerrätten/.test(tt), tester.url)
  await tester.ctx.close()

  const intervju = await tratt('intervju', DESKTOP, 'desktop')
  logg('intervju: Börja gratis landar på Inför intervjun', intervju.url.startsWith('/dashboard/intervju'), intervju.url)
  await intervju.ctx.close()

  const jobb = await tratt('jobb', DESKTOP, 'desktop', { kryss: true })
  logg('jobb: krysset gör som Börja gratis', jobb.url.startsWith('/dashboard/jobbmatchning'), jobb.url)
  await jobb.ctx.close()

  /* 5. Hoppa över: spårvalet utan förvalt kort. */
  {
    const { p, ctx } = await nySida(browser, PIXEL7)
    await ga(p, '/register')
    await klickaText(p, 'button', 'Hoppa över')
    await vanta(400)
    const t = await text(p)
    logg('hoppa över: steg 2 utan valrad', t.includes('Skapa ditt konto') && !t.includes('Du börjar med'))
    const email = nyEpost('hoppa')
    await q.skapaKonto(p, { namn: 'Anna Hoppa', email })
    konton.hoppa = { id: await registreraId(email, 'hoppa'), email }
    const valda = await p.evaluate(() => document.querySelectorAll('[role="radio"][aria-checked="true"]').length)
    logg('hoppa över: spårvalet utan förval', p.url().includes('/dashboard/valj-spar') && valda === 0, `${p.url().replace(BAS, '')} valda=${valda}`)
    await skott(p, 'pixel7-hoppa-sparval')
    await ctx.close()
  }

  /* 6. Databasen: valet och spåret per konto. */
  const ids = Object.values(konton).map((k) => k.id).filter(Boolean)
  const { data: rader } = await admin.from('profiles').select('id, onboarding_intent, onboarding_track').in('id', ids)
  const per = Object.fromEntries((rader ?? []).map((r) => [r.id, r]))
  const vantat = { cv: ['cv', 'cv'], brev: ['brev', 'cv'], tester: ['tester', 'tester'], intervju: ['intervju', 'tester'], jobb: ['jobb', 'allt'], hoppa: [null, null] }
  for (const [namn, [intent, track]] of Object.entries(vantat)) {
    const r = per[konton[namn]?.id]
    logg(`db ${namn}: onboarding_intent ${intent}, onboarding_track ${track}`, r && r.onboarding_intent === intent && r.onboarding_track === track, JSON.stringify(r ?? null))
  }

  /* 7. Kom igång och hemskärmen för testvalet (Pixel 7), och menyn för cv, tester och jobb. */
  const menyer = {}
  for (const namn of ['tester', 'cv', 'jobb']) {
    const vy = namn === 'tester' ? PIXEL7 : DESKTOP
    const { p, ctx } = await nySida(browser, vy)
    await q.loggaIn(p, konton[namn].email)
    await ga(p, '/dashboard')
    await vanta(1500)
    if (namn === 'tester') {
      const t = await text(p)
      logg('hem tester: raden om valet', t.includes('Du valde testerna, så vi börjar med träningen.'))
      logg('hem tester: Gör ditt första rekryteringstest', t.includes('Gör ditt första rekryteringstest'))
      logg('hem tester: CV-länken finns kvar', t.includes('Vill du börja med CV:t i stället?'))
      await skott(p, 'pixel7-hem-tester')
      await p.evaluate(() => document.querySelector('[data-komigang-rad="flytande"]')?.click())
      await vanta(800)
      const ark = await text(p)
      const ordning = ['Matrislogik, grundnivå', 'Personlighetstestet', 'Intervjuprovet', 'Analysera ditt CV', 'Skriv ett personligt brev', 'Se tre matchade jobb'].map((s) => ark.indexOf(s))
      logg('kom igång tester: sex brickor i ordning', ordning.every((x, i) => x >= 0 && (i === 0 || x > ordning[i - 1])), JSON.stringify(ordning))
      logg('kom igång tester: områdesetiketterna', /Det du valde/i.test(ark) && /Gratis i de andra delarna/i.test(ark))
      logg('kom igång tester: ingen uppladdningsbricka', !ark.includes('CV uppladdat') && !ark.includes('Ladda upp CV:t'))
      await skott(p, 'pixel7-komigang-tester')
    } else {
      menyer[namn] = await p.evaluate(() => document.querySelector('nav[aria-label="Sidomeny"]')?.innerText ?? '')
      await skott(p, `desktop-meny-${namn}`)
    }
    if (namn === 'cv') {
      // Första CV:t, per id på kontot (städas med user_id), sedan raden Prova också.
      await admin.from('cv_texts').insert({
        user_id: konton.cv.id,
        file_name: 'Anna_CV.pdf',
        original_file_path: `qa/${konton.cv.id}/Anna_CV.pdf`,
        cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt.',
      })
      await ga(p, '/dashboard')
      await vanta(5000)
      const t = await text(p)
      logg('hem cv efter första CV:t: Prova också föreslår logiktestet', t.includes('Prova också') && t.includes('Klarar du logiktestet?'))
      await skott(p, 'desktop-hem-cv-prova-ocksa', true)
    }
    await ctx.close()
  }
  logg('menyn identisk för cv och jobb', menyer.cv && menyer.cv === menyer.jobb, `${menyer.cv?.length}/${menyer.jobb?.length}`)

  /* 8. Desktop steg 1. */
  {
    const { p, ctx } = await nySida(browser, DESKTOP)
    await ga(p, '/register')
    await p.click('[role="radio"][data-intent="cv"]')
    await skott(p, 'desktop-steg1')
    await ctx.close()
  }
}
