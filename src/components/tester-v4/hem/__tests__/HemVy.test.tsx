import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))
vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))

import HemVy from '../HemVy'
import { bandForklaring, hintHref, hintEtikett } from '../NastaSteg'
import { delarText, nivaKalla, fokusTyp, forandring, katalogStatus, navTexter, saLiggerTyper } from '../hemData'
import { flerStegBild } from '../FlerSteg'
import { veckan } from '../Dagsmal'
import { miniGrafModell } from '../MiniGraf'
import Navigering from '../Navigering'
import { talText } from '@/components/tester-v4/Nivaband'
import { fortsattMeta } from '../FortsattDarDuSlutade'
import { fixturTester } from '@/lib/tester/v4/fixturer'
import type { Hint, TesterV4Data, UtvecklingsPunkt } from '@/lib/tester/v4/typer'

beforeEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    /* jsdom */
  }
})

const text = (c: Element) => c.textContent ?? ''

describe('HemVy, omgång 3 (skissens Hem och Hem-ny)', () => {
  it('väggen: tre flikar med underrad, Hem aktiv, dagens träning och banan', () => {
    const { container } = render(<HemVy data={fixturTester('b', 'premium')} />)
    const nav = container.querySelector('[data-flikar3]')!
    expect([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/dashboard/tester', '/dashboard/tester/alla', '/dashboard/tester/kurvan'])
    expect(nav.querySelector('[aria-current="page"]')?.getAttribute('data-nav')).toBe('hem')
    expect(text(nav)).toContain('Läget och planen till provet')
    expect(container.querySelector('[data-vagg3]')).not.toBeNull()
    expect(container.querySelectorAll('svg[role="img"][aria-label^="Banan"]').length).toBe(2)
    expect(text(container.querySelector('[data-vagg3]')!)).toContain('Plan inför provet')
    expect(text(container)).not.toMatch(/\bpass\b/i)
  })

  it('Alva Logic: vägen till provet, ett kort per dag och provdagen sist', () => {
    const data = fixturTester('b', 'premium')
    const { container } = render(<HemVy data={data} />)
    const vagen = container.querySelector('[data-vagen]')!
    expect(text(vagen)).toContain('Vägen till provet')
    const kort = vagen.querySelectorAll('.t3-dag')
    expect(kort.length).toBe(data.vagen.length)
    expect(kort[0].getAttribute('data-dag')).toBe('idag')
    expect(kort[kort.length - 1].getAttribute('data-dag')).toBe('prov')
    expect(container.querySelector('[data-sa-gar-det-till]')).toBeNull()
  })

  it('ny användare: Så här går det till, inte mätt än som lucka, Gör Nivåkollen', () => {
    const data = fixturTester('a', 'gratis', { artikel: false })
    const ny = { ...data, dagens: { ...data.dagens, forstaSteget: true } }
    const { container } = render(<HemVy data={ny} />)
    expect(container.querySelector('[data-sa-gar-det-till]')).not.toBeNull()
    expect(container.querySelector('[data-vagen]')).toBeNull()
  })

  it('dagens knapp är en länk, ingen kopparknapp till', () => {
    const { container } = render(<HemVy data={fixturTester('b', 'premium')} />)
    const knappar = container.querySelectorAll('a[data-dagens-knapp]')
    expect(knappar.length).toBe(2)
    expect(knappar[0].getAttribute('href')).toBe(knappar[1].getAttribute('href'))
  })

  it('gratis med dagens grundnivå gjord: raden med priset ur paketet, ordagrant', () => {
    const data = fixturTester('b', 'gratis')
    const slut = { ...data, gratis: { ...data.gratis, grundKvarIdag: 0 } }
    const { container } = render(<HemVy data={slut} />)
    expect(container.querySelector('[data-gratis="gjord"]')).not.toBeNull()
  })
})

describe('hintHref och hintEtikett', () => {
  const bas: Hint = {
    id: 'x',
    typ: 'svagt_monster',
    eyebrow: '',
    rubrik: '',
    skal: '',
    tips: '',
    testtyp: 'talserie',
    knapp: { slag: 'trana', etikett: 'Träna', href: '/dashboard/tester/pass?typ=steg2pass&kind=talserie', las: null },
    stangbar: false,
  }
  it('öppnar typens meny i Tester', () => {
    expect(hintHref(bas)).toBe('/dashboard/tester/alla?typ=talserie')
  })
  it('Nivåkollen i en omätt typ startar direkt', () => {
    const h: Hint = { ...bas, typ: 'nivakoll_saknas', knapp: { slag: 'nivakoll', etikett: 'Mät din nivå', href: '/dashboard/tester/pass?typ=nivakoll&kind=deduktiv', las: null } }
    expect(hintHref(h)).toBe('/dashboard/tester/pass?typ=nivakoll&kind=deduktiv')
  })
  it('låst knapp öppnar menyn och säger Ingår i Premium', () => {
    const h: Hint = { ...bas, typ: 'nivakoll_igen', knapp: { slag: 'nivakoll', etikett: 'Mät din nivå', href: '/x', las: { skal: 'premium', chip: 'Ingår i Premium' } } }
    expect(hintHref(h)).toBe('/dashboard/tester/alla?typ=talserie')
    expect(hintEtikett(h)).toBe('Ingår i Premium')
  })
})

describe('Så ligger du till och Fortsätt', () => {
  it('med plan planens typer först, sedan övriga mätta; utan plan bara mätta', () => {
    const b = fixturTester('b', 'premium')
    const visa = saLiggerTyper(b.typer, b.plan)
    expect(visa[0].id).toBe('matris')
    expect(visa.length).toBeLessThanOrEqual(4)
    expect(visa.slice(1).every((t) => t.niva.status !== 'omatt' && !t.ingarIPlan)).toBe(true)
    const a = fixturTester('a', 'premium')
    expect(saLiggerTyper(a.typer, null).every((t) => t.niva.status !== 'omatt')).toBe(true)
  })
  it('Fortsätt: rätt av antal och när', () => {
    const a = fixturTester('a', 'premium')
    if (a.fortsatt) expect(fortsattMeta(a.fortsatt, a.idag)).toMatch(/rätt, (i dag|i går|\d+ \w+)$/)
  })
})

const P = (p: Partial<UtvecklingsPunkt> & Pick<UtvecklingsPunkt, 'dag' | 'niva'>): UtvecklingsPunkt => ({
  id: `p-${p.dag}-${p.niva}`,
  typ: 'matris',
  slag: 'nivakoll',
  raknas: true,
  resultat: null,
  overTid: null,
  href: null,
  ...p,
})

/** Matrisens aktuella nivå och kurva bytta, övriga typer orörda. */
function medKurva(data: TesterV4Data, niva: number, punkter: UtvecklingsPunkt[]): TesterV4Data {
  return {
    ...data,
    typer: data.typer.map((t) => (t.id === 'matris' ? { ...t, niva: { ...t.niva, status: 'matt' as const, niva } } : t)),
    kurva: [...data.kurva.filter((p) => p.typ !== 'matris'), ...punkter],
  }
}

describe('navigeringens undertexter (hemData)', () => {
  it('Hem: Nästa steg med knappens ord; Tester: antal, mätta och alla öppna för Premium', () => {
    const b = fixturTester('b', 'premium')
    const t = navTexter(b)
    expect(t.rad.hem).toBe(`Nästa steg: ${b.hintar[0].knapp.etikett}`)
    expect(t.rad.tester).toMatch(/^\d av 8 mätta, alla nivåer öppna$/)
    expect(t.kort.tester).toBe('Åtta testtyper')
  })

  it('gratis: grundnivån i stället för alla öppna', () => {
    expect(navTexter(fixturTester('b', 'gratis')).rad.tester).toBe('Åtta testtyper, ett grundnivåtest gratis i dag')
    expect(navTexter(fixturTester('b', 'gratis', { kvotAnvand: true })).rad.tester).toBe('Åtta testtyper, dagens grundnivåtest gjort')
  })

  it('Din utveckling: aktuell nivå (samma som bandet) mot första punkten inom fyra veckor', () => {
    const b = fixturTester('b', 'premium')
    // Samma tal som bandet: typer[typ].niva.niva.
    const matris = b.typer.find((t) => t.id === 'matris')!
    expect(navTexter(b).rad.utveckling.startsWith(`Nivå ${talText(matris.niva.niva as number)}`)).toBe(true)
    const upp = medKurva(b, 3.2, [P({ dag: '2026-10-24', niva: 2.4 }), P({ dag: '2026-11-17', niva: 3.2, slag: 'trana' })])
    expect(navTexter(upp).rad.utveckling).toBe('Nivå 3,2, upp 0,8 på fyra veckor')
    expect(navTexter(upp).kort.utveckling).toBe('Nivå 3,2, upp 0,8')
    const lika = medKurva(b, 3.0, [P({ dag: '2026-11-01', niva: 2.4 }), P({ dag: '2026-11-12', niva: 3.0 })])
    expect(forandring(lika, 'matris')?.riktning).toBe('oforandrad')
    expect(navTexter(lika).rad.utveckling).toBe('Nivå 3,0, oförändrad på fyra veckor')
    const ned = medKurva(b, 3.0, [P({ dag: '2026-11-01', niva: 4.0 }), P({ dag: '2026-11-12', niva: 3.0 })])
    expect(navTexter(ned).rad.utveckling).toBe('Nivå 3,0, ned 1,0 på fyra veckor')
    const gammal = medKurva(b, 3.0, [P({ dag: '2026-09-01', niva: 2.0 }), P({ dag: '2026-11-12', niva: 3.0 })])
    expect(navTexter(gammal).rad.utveckling).toBe('Nivå 3,0')
    const prov = medKurva(b, 3.0, [P({ dag: '2026-11-01', niva: null, slag: 'ovningsprov' }), P({ dag: '2026-11-12', niva: 3.0 })])
    expect(navTexter(prov).rad.utveckling).toBe('Nivå 3,0')
  })

  it('utan mätning: Kurvan börjar med Nivåkollen', () => {
    expect(navTexter(fixturTester('b', 'gratis', { artikel: true })).rad.utveckling).toBe('Kurvan börjar med Nivåkollen')
  })

  it('Navigering markerar valt kort med aria-current', () => {
    const { container } = render(<Navigering aktiv="utveckling" texter={navTexter(fixturTester('b', 'premium'))} />)
    expect(container.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/dashboard/tester/kurvan')
    expect(container.querySelectorAll('[aria-current]').length).toBe(1)
  })
})

describe('Hems härledda tal', () => {
  it('fokusTyp: planens första typ, annars typen med mest data', () => {
    expect(fokusTyp(fixturTester('c', 'premium'))).toBe('ordforrad')
    expect(fokusTyp(fixturTester('a', 'premium'))).toBe('matris')
    expect(fokusTyp({ ...fixturTester('b', 'gratis', { artikel: true }), plan: null })).toBeNull()
  })

  it('kurvan: bara de senaste 28 dagarna; gratis utan historik bara senaste punkten per typ', () => {
    const p = fixturTester('b', 'premium')
    expect(p.kurva.length).toBeGreaterThan(0)
    expect(p.kurva.every((x) => x.dag >= '2026-10-22' && x.dag <= p.idag)).toBe(true)
    const g = fixturTester('b', 'gratis')
    const perTyp = new Map<string, number>()
    for (const x of g.kurva) perTyp.set(x.typ, (perTyp.get(x.typ) ?? 0) + 1)
    expect([...perTyp.values()].every((n) => n === 1)).toBe(true)
  })

  it('senasteTraning och katalogens statusrad', () => {
    const b = fixturTester('b', 'premium')
    const matris = b.typer.find((t) => t.id === 'matris')!
    expect(matris.senasteTraning).toBe('2026-11-17')
    expect(katalogStatus(matris, b.idag)).toBeNull()
    const ded = b.typer.find((t) => t.id === 'deduktiv')!
    expect(katalogStatus({ ...ded, senasteTraning: '2026-11-17' }, b.idag)).toEqual({ text: 'Tränat i går', ton: 'positiv' })
    expect(katalogStatus({ ...ded, senasteTraning: null }, b.idag)?.text).toMatch(/^Nivåkoll \d+ \w+$/)
  })

  it('minigrafens modell: fokusens mätningar, träningar och högst två andra typer', () => {
    const b = fixturTester('b', 'premium')
    const m = miniGrafModell(b.kurva, 'matris', b.idag, b.plan)
    expect(m.provdag).toBe('2026-11-25')
    expect(m.matningar.every((p) => p.typ === 'matris' && p.slag === 'nivakoll')).toBe(true)
    expect(m.traningar.length).toBeGreaterThan(0)
    expect(m.andra.length).toBeLessThanOrEqual(2)
  })

  it('Fler steg ritar bara bilder ur strukturerad data', () => {
    const b = fixturTester('b', 'premium')
    const nara: Hint = { ...b.hintar[0], typ: 'provet_nara' }
    expect(flerStegBild(nara, b.plan, b.menyer, b.idag)).toEqual({ slag: 'kalender', dag: 23 })
    const svag: Hint = { ...b.hintar[0], typ: 'svagt_monster', testtyp: 'matris', rubrik: 'Träna på figuren speglas' }
    expect(flerStegBild(svag, b.plan, b.menyer, b.idag)).toEqual({ slag: 'prickar', ratt: 2, antal: 6 })
    const tempo: Hint = { ...b.hintar[0], typ: 'tempo' }
    expect(flerStegBild(tempo, b.plan, b.menyer, b.idag)).toBeNull()
  })

  it('veckoraden: måndag först, i dag markerad, inga missar', () => {
    const v = veckan('2026-11-18', ['2026-11-17'])
    expect(v[0].dag).toBe('2026-11-16')
    expect(v.map((d) => d.status)).toEqual(['forbi', 'gjord', 'idag', 'kommande', 'kommande', 'kommande', 'kommande'])
  })

  it('bandets förklaring och planens delar i löptext', () => {
    const b = fixturTester('b', 'premium')
    const matris = b.typer.find((t) => t.id === 'matris')!
    expect(bandForklaring(matris)).toMatch(/^Nivån från Nivåkollen \d+ \w+\. Det ljusa bandet är mätningens osäkerhet\. Provet ligger på avancerad nivå\.$/)
    expect(bandForklaring(matris, nivaKalla(b.kurva, 'matris'))).toBe('Nivån efter träningen 17 nov. Det ljusa bandet är mätningens osäkerhet. Provet ligger på avancerad nivå.')
    expect(delarText(['Ordförråd', 'Spatial förmåga', 'Talserier'])).toBe('Ordförråd, spatial förmåga och talserier')
  })
})
