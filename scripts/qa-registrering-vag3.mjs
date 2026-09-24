// scripts/qa-registrering-vag3.mjs
// Våg 3: sidomenyns två rader under Konto, profilmenyn, toppradens plats och
// paketkortens knappar på prenumerationssidan. Körs via qa-registrering.mjs 3.
// Använder ett QA-konto från våg 2 (cv), ur QA_KONTON_FIL.

import fs from 'node:fs'

export async function kor(q) {
  const { browser, ga, nySida, skott, text, logg, loggaIn, vanta, PIXEL7, DESKTOP } = q
  const k = JSON.parse(fs.readFileSync(process.env.QA_KONTON_FIL, 'utf8')).konton
  const konto = [...k].reverse().find((x) => x.tagg === 'cv')
  if (!konto) throw new Error('inget cv-konto från våg 2')

  const aktiv = (p) =>
    p.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="Sidomeny"] a[aria-current="page"]')].map((a) => a.innerText.trim().split('\n')[0])
    )
  const plats = (p) => p.evaluate(() => document.querySelector('[data-dashboard-header]')?.innerText.split('\n')[0] ?? '')

  /* Desktop: menyn, raderna, aktiv-matchningen och toppraden. */
  {
    const { p, ctx } = await nySida(browser, DESKTOP)
    await loggaIn(p, konto.email)
    await ga(p, '/dashboard/profil')
    const konto2 = await p.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Sidomeny"]')
      const lankar = [...(nav?.querySelectorAll('a') ?? [])]
      const profil = lankar.find((a) => a.getAttribute('href') === '/dashboard/profil')
      const pren = lankar.filter((a) => a.getAttribute('href') === '/dashboard/profil/prenumeration').pop()
      const trunk = (a) => [...(a?.querySelectorAll('span') ?? [])].some((s) => s.scrollWidth > s.clientWidth + 1)
      return {
        profil: profil?.innerText.trim(),
        pren: pren?.innerText.replace(/\s+/g, ' ').trim(),
        ordning: profil && pren ? profil.compareDocumentPosition(pren) & Node.DOCUMENT_POSITION_FOLLOWING : 0,
        trunkerad: trunk(profil) || trunk(pren),
      }
    })
    logg('meny: Profil och Prenumeration under Konto', konto2.profil === 'Profil' && /^Prenumeration/.test(konto2.pren ?? '') && konto2.ordning > 0, JSON.stringify(konto2))
    logg('meny: ingen text trunkeras vid 256 px', !konto2.trunkerad)
    logg('profil: raden Profil aktiv', JSON.stringify(await aktiv(p)) === '["Profil"]', JSON.stringify(await aktiv(p)))
    logg('profil: toppraden Konto · Profil', (await plats(p)).includes('Konto · Profil'), await plats(p))
    await skott(p, 'desktop-meny-profil')

    await ga(p, '/dashboard/profil/prenumeration')
    logg('prenumeration: raden Prenumeration aktiv, inte Profil', JSON.stringify(await aktiv(p)) === '["Prenumeration"]', JSON.stringify(await aktiv(p)))
    logg('prenumeration: toppraden Konto · Prenumeration', (await plats(p)).includes('Konto · Prenumeration'), await plats(p))
    const knappar = await p.evaluate(() =>
      [...document.querySelectorAll('section button')]
        .filter((b) => /kr/.test(b.innerText))
        .map((b) => ({ t: b.innerText.trim(), klipp: b.scrollHeight > b.clientHeight + 1, h: Math.round(b.getBoundingClientRect().height) }))
    )
    logg('prenumeration: paketkortens knappar klipps inte', knappar.length > 0 && knappar.every((b) => !b.klipp), JSON.stringify(knappar))
    await skott(p, 'desktop-prenumeration', true)

    await ga(p, '/dashboard/profil/cv')
    logg('Mina CV: raden Mina CV aktiv och ingen Konto-rad', JSON.stringify(await aktiv(p)) === '["Mina CV"]', JSON.stringify(await aktiv(p)))

    // Profilmenyn i toppraden.
    await p.click('button[aria-label="Konto och inställningar"]')
    await vanta(400)
    const meny = await p.evaluate(() =>
      [...document.querySelectorAll('[role="menuitem"]')].map((e) => e.innerText.trim()).filter((t) => t && t !== 'Vad ingår?')
    )
    const vantat = meny[0] === 'Kom igång' ? ['Kom igång', 'Profil', 'Prenumeration', 'Logga ut'] : ['Profil', 'Prenumeration', 'Logga ut']
    logg('profilmenyn: Kom igång, Profil, Prenumeration, Logga ut', JSON.stringify(meny) === JSON.stringify(vantat), JSON.stringify(meny))
    await skott(p, 'desktop-profilmeny')
    await ctx.close()
  }

  /* Pixel 7: profilmenyn och sidomenyn bakom menyknappen. */
  {
    const { p, ctx } = await nySida(browser, PIXEL7)
    await loggaIn(p, konto.email)
    await ga(p, '/dashboard/profil/prenumeration')
    await skott(p, 'pixel7-prenumeration')
    await p.click('button[aria-label="Konto och inställningar"]')
    await vanta(400)
    await skott(p, 'pixel7-profilmeny')
    await p.keyboard.press('Escape')
    await vanta(300)
    const menyKnapp = await p.$('button[aria-label="Öppna meny"], button[aria-label="Meny"], button[aria-label="Öppna menyn"]')
    if (menyKnapp) {
      await menyKnapp.click()
      await vanta(600)
      await p.evaluate(() => document.querySelector('nav[aria-label="Sidomeny"]')?.scrollTo(0, 9999))
      await vanta(300)
      await skott(p, 'pixel7-sidomeny-konto')
      const t = await text(p)
      logg('pixel7: sidomenyn har Profil och Prenumeration', t.includes('Profil') && t.includes('Prenumeration'))
    } else logg('pixel7: menyknappen hittades', false)
    await ctx.close()
  }
}
