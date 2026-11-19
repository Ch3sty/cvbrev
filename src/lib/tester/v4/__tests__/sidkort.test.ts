import { describe, expect, it } from 'vitest'
import { laggTill } from '@/lib/traning/datum'
import { FIXTUR_IDAG, fixturTester, fixturUnderlag, fixturUtveckling } from '../fixturer'
import { byggTesterV4, byggUtvecklingV4, type ModellIn } from '../modell'
import { huvudTyp, kurvKort, testerKort } from '../sidkort'
import { TEST_TYP_ORDNING, type NivaLage, type TestTypId, type UtvecklingV4Data, type UtvecklingsPunkt } from '../typer'

/** Helt ny användare: ingen plan, inga punkter, inget påbörjat. */
function ny(niva: 'premium' | 'gratis', kvotAnvand = false): ModellIn {
  const u = fixturUnderlag('a', niva, { kvotAnvand })
  for (const t of TEST_TYP_ORDNING) u.typer[t] = { ...u.typer[t], punkter: [], paborjad: null, svagaste: null, monster: [], tempo: null, provad: false }
  return { ...u, gratis: { ...u.gratis, nivakollGjord: {} }, aktivaDagar: [], matrisMonster: null }
}

/** Alla typer mätta: en Nivåkoll per typ, matris också tränad i dag. */
function allaMatta(niva: 'premium' | 'gratis', kvotAnvand = false): ModellIn {
  const u = ny(niva, kvotAnvand)
  const gjord: Partial<Record<TestTypId, boolean>> = {}
  for (const t of TEST_TYP_ORDNING) {
    const nk: UtvecklingsPunkt = { id: `nk-${t}`, typ: t, dag: laggTill(FIXTUR_IDAG, -10), slag: 'nivakoll', niva: 5, raknas: true, resultat: null, overTid: null, href: null }
    const punkter = [nk]
    if (t !== 'deduktiv') punkter.push({ ...nk, id: `tr-${t}`, slag: 'trana', dag: laggTill(FIXTUR_IDAG, t === 'matris' ? 0 : -2), niva: 5.1 })
    u.typer[t] = { ...u.typer[t], punkter, provad: true }
    gjord[t] = true
  }
  return { ...u, gratis: { ...u.gratis, nivakollGjord: gjord } }
}

describe('testerKort: Prova något nytt', () => {
  it('helt ny användare: Nivåkollen i figurer och mönster, alla åtta väntar', () => {
    const k = testerKort(byggTesterV4(ny('premium')))
    expect(k.slag).toBe('nivakoll')
    expect(k.typ).toBe('matris')
    expect(k.vantar).toBe(8)
    expect(k.meta).toBe('8 testtyper väntar')
    expect(k.knapp.href).toBe('/dashboard/tester/pass?typ=matning')
    expect(k.rubrik).toBe('Gör Nivåkollen i figurer och mönster')
  })

  it('premium utan plan: första omätta i ordningen, påbörjad räknas som omätt', () => {
    const k = testerKort(fixturTester('a', 'premium'))
    expect(k.typ).toBe('figurserie')
    expect(k.vantar).toBe(4)
  })

  it('plan utan datum (artikel): planens del först, med provets namn i skälet', () => {
    const k = testerKort(fixturTester('b', 'gratis', { artikel: true }))
    expect(k.slag).toBe('nivakoll')
    expect(k.typ).toBe('matris')
    expect(k.skal).toContain('ingår i Alva Logic')
  })

  it('typ utan Nivåkoll: grundnivåtestet', () => {
    const d = fixturTester('c', 'premium')
    // I-provet: ordförråd är planens första omätta del och saknar Nivåkoll.
    const k = testerKort(d)
    expect(k.slag === 'paborjad' || k.slag === 'grund').toBe(true)
    const utan = testerKort({ ...d, typer: d.typer.map((t) => (t.id === 'ordforrad' ? { ...t, niva: { ...t.niva, status: 'omatt' as const, svar: undefined } } : t)) })
    expect(utan.slag).toBe('grund')
    expect(utan.knapp.href).toBe('/dashboard/tester/ordforrad-grund')
    expect(utan.knapp.etikett).toBe('Testa grundnivån')
  })

  it('gratis med kvoten slut men Nivåkollen kvar i en omätt typ: Nivåkollen', () => {
    const k = testerKort(fixturTester('a', 'gratis', { kvotAnvand: true }))
    expect(k.slag).toBe('nivakoll')
    expect(k.typ).toBe('figurserie')
  })

  it('gratis med kvoten slut och ingen Nivåkoll kvar: nästa test i morgon, Premium', () => {
    const d = fixturTester('a', 'gratis', { kvotAnvand: true })
    const k = testerKort({ ...d, gratis: { ...d.gratis, nivakollGjord: Object.fromEntries(TEST_TYP_ORDNING.map((t) => [t, true])) } })
    expect(k.slag).toBe('imorgon')
    expect(k.knapp.href).toContain('plats=kvot')
    expect(k.skal).toContain(d.gratis.pris.prisrad)
  })

  it('alla mätta, premium: Träna i typen du tränat minst senaste veckan', () => {
    const k = testerKort(byggTesterV4(allaMatta('premium')))
    expect(k.slag).toBe('trana')
    // Deduktiv har ingen träning alls.
    expect(k.typ).toBe('deduktiv')
    expect(k.skal).toContain('inte tränat där än')
    expect(k.vantar).toBe(0)
  })

  it('alla mätta, gratis med grundnivån kvar: grundnivåtestet i samma typ', () => {
    const k = testerKort(byggTesterV4(allaMatta('gratis')))
    expect(k.slag).toBe('grund_igen')
    expect(k.typ).toBe('deduktiv')
  })

  it('alla mätta, gratis med kvoten slut: i morgon', () => {
    expect(testerKort(byggTesterV4(allaMatta('gratis', true))).slag).toBe('imorgon')
  })
})

const matt = (niva: number): NivaLage => ({ status: 'matt', niva, osakerhet: 0.6, tak: 7.5 })
const p = (typ: TestTypId, dag: string, niva: number, slag: UtvecklingsPunkt['slag'] = 'nivakoll'): UtvecklingsPunkt => ({
  id: `${typ}-${dag}-${slag}`,
  typ,
  dag,
  slag,
  niva,
  raknas: true,
  resultat: null,
  overTid: null,
  href: null,
})

function utv(punkter: UtvecklingsPunkt[], over: Partial<UtvecklingV4Data> = {}): UtvecklingV4Data {
  const bas = byggUtvecklingV4(ny('premium'))
  const nivaer = new Map<TestTypId, number>()
  for (const x of punkter) nivaer.set(x.typ, x.niva as number)
  return {
    ...bas,
    punkter,
    typer: bas.typer.map((t) => (nivaer.has(t.id) ? { ...t, niva: matt(nivaer.get(t.id) as number) } : t)),
    ...over,
  }
}

describe('kurvKort: Vad kurvan säger', () => {
  it('helt ny användare: första Nivåkollen, panelen omätt utan plan', () => {
    const k = kurvKort(byggUtvecklingV4(ny('gratis')))
    expect(k.slag).toBe('forsta')
    expect(k.rubrik).toBe('Kurvan börjar med Nivåkollen')
    expect(k.knapp.href).toBe('/dashboard/tester/pass?typ=matning')
    expect(k.knapp.las).toBe(false)
    expect(k.panel.niva?.status).toBe('omatt')
    expect(k.panel.rubrik).toBe('Din nivå')
  })

  it('plan utan datum (artikel), ingen mätning: första Nivåkollen, Mot provets nivå', () => {
    const k = kurvKort(fixturUtveckling('b', 'gratis', { artikel: true }))
    expect(k.slag).toBe('forsta')
    expect(k.panel.rubrik).toBe('Mot provets nivå')
    expect(k.panel.text).toBe('Inte mätt än. Provet ligger på avancerad nivå.')
  })

  it('I-provet: planens första del saknar mätning och Nivåkoll, grundnivåtestet', () => {
    const k = kurvKort(fixturUtveckling('c', 'premium'))
    expect(huvudTyp(fixturUtveckling('c', 'premium'))).toBe('ordforrad')
    expect(k.slag).toBe('forsta')
    expect(k.rubrik).toBe('Ingen kurva i ordförråd än')
    expect(k.knapp.href).toBe('/dashboard/tester/ordforrad-grund')
  })

  it('stått still: senaste mätningen mer än 14 dagar gammal', () => {
    const k = kurvKort(utv([p('matris', laggTill(FIXTUR_IDAG, -30), 4.8), p('matris', laggTill(FIXTUR_IDAG, -20), 5.0)]))
    expect(k.slag).toBe('still')
    expect(k.meta).toBe('20 dagar sedan sist')
    expect(k.knapp.etikett).toBe('Mät din nivå')
  })

  it('stått still, gratis med Nivåkollen gjord: knappen är låst', () => {
    const d = utv([p('matris', laggTill(FIXTUR_IDAG, -20), 5.0)])
    const k = kurvKort({ ...d, gratis: { ...d.gratis, premium: false, nivakollGjord: { matris: true } } })
    expect(k.slag).toBe('still')
    expect(k.knapp.las).toBe(true)
  })

  it('uppåt, premium med plan: ungefär ett steg, övningsprovet som nästa steg', () => {
    const k = kurvKort(fixturUtveckling('b', 'premium'))
    expect(k.slag).toBe('upp')
    expect(k.rubrik).toBe('Uppåt i figurer och mönster, ungefär ett steg')
    expect(k.knapp.etikett).toBe('Gör ett övningsprov')
    expect(k.panel.text).toBe('Du ligger inom provets nivå, den avancerade zonen.')
    // Inga decimaler i löptexten.
    expect(`${k.rubrik} ${k.skal}`).not.toMatch(/\d,\d/)
  })

  it('uppåt två steg utan plan: Träna', () => {
    const k = kurvKort(utv([p('deduktiv', laggTill(FIXTUR_IDAG, -10), 3.0), p('deduktiv', laggTill(FIXTUR_IDAG, -1), 5.1, 'trana')]))
    expect(k.slag).toBe('upp')
    expect(k.rubrik).toContain('ungefär två steg')
    expect(k.knapp.etikett).toBe('Träna')
    expect(k.panel.rubrik).toBe('Din nivå')
    expect(k.panel.typ).toBe('deduktiv')
  })

  it('nedåt i matris: mönstret där du tappar mest', () => {
    const d = utv([p('matris', laggTill(FIXTUR_IDAG, -10), 6.0), p('matris', laggTill(FIXTUR_IDAG, -1), 5.0, 'trana')], {
      matrisMonster: [
        { namn: 'Figuren speglas', family: 'spegling', lage: 'mott', ratt: 2, antal: 6, href: '/x' },
        { namn: 'Två rutor läggs ihop', family: 'overlagring', lage: 'mott', ratt: 3, antal: 4, href: '/y' },
      ],
    })
    const k = kurvKort(d)
    expect(k.slag).toBe('ned')
    expect(k.rubrik).toBe('Du tappar mest på figuren speglas')
    expect(k.knapp.href).toBe('/x')
  })

  it('nedåt utan mönster, gratis med kvoten slut: låst Träna till Premium', () => {
    const d = utv([p('verbal', laggTill(FIXTUR_IDAG, -10), 6.0), p('verbal', laggTill(FIXTUR_IDAG, -1), 5.0)])
    const k = kurvKort({ ...d, gratis: { ...d.gratis, premium: false, grundKvarIdag: 0 } })
    expect(k.slag).toBe('ned')
    expect(k.knapp.las).toBe(true)
    expect(k.knapp.href).toContain('plats=kurvan')
  })

  it('stadigt inom osäkerheten', () => {
    expect(kurvKort(utv([p('matris', laggTill(FIXTUR_IDAG, -10), 5.0), p('matris', laggTill(FIXTUR_IDAG, -1), 5.3)])).slag).toBe('stadig')
  })

  it('gratis med låst historik: en punkt, och texten säger att hela kurvan ingår i Premium', () => {
    const d = utv([p('matris', laggTill(FIXTUR_IDAG, -1), 5.3)], { historikLast: true })
    const k = kurvKort({ ...d, gratis: { ...d.gratis, premium: false } })
    expect(k.slag).toBe('en_punkt')
    expect(k.skal).toContain('ingår i Premium')
  })
})

describe('sidkortens texter', () => {
  const alla = [
    ...['premium', 'gratis'].flatMap((n) => [testerKort(byggTesterV4(ny(n as 'premium'))), kurvKort(byggUtvecklingV4(ny(n as 'premium')))]),
    testerKort(fixturTester('a', 'gratis', { kvotAnvand: true })),
    testerKort(byggTesterV4(allaMatta('premium'))),
    kurvKort(fixturUtveckling('b', 'premium')),
    kurvKort(fixturUtveckling('c', 'gratis')),
  ]
  it('inget "pass", inga talstreck eller mittpunkter, inga paketnamn utom Premium', () => {
    for (const k of alla) {
      const t = [k.etikett, k.meta, k.rubrik, k.skal, k.tips, k.knapp.etikett].join(' ')
      expect(t).not.toMatch(/\bpass(et|en)?\b/i)
      expect(t).not.toMatch(/[—–·]/)
      expect(t).not.toMatch(/kategori/i)
    }
  })
})
