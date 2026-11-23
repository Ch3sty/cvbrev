/**
 * Omgång 3, steg 3b: målgången, resultatsidan och spärrarna i det nya
 * utseendet. Data som saknas ritas inte; spärrens pris och köp är dagens.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const captureMock = vi.fn()
vi.mock('@/lib/analytics/events', () => ({
  capture: (...args: unknown[]) => captureMock(...args),
  identifyUser: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/tester/pass',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

import PaywallCard from '@/components/paywall/PaywallCard'
import { sparrLoften } from '@/components/paywall/TestSparr'
import { KampanjPrisProvider } from '@/components/kampanj/KampanjPrisKontext'
import { KAMPANJ_BY_NYCKEL, visning } from '@/lib/kampanj/kampanj'
import { paywallPrisrad } from '@/components/paywall/paywall-copy'
import Resultatskarm, { type ResultatskarmProps } from '../Resultatskarm'
import { hardaMellanrum } from '../typer/Siffror'
import { genomgangRubrik } from '../resultat/Genomgangen'
import type { RamUppgift, TypRitare } from '../typ'

const BW = visning(KAMPANJ_BY_NYCKEL['black-week-2026'])
const BW_KNAPP = 'Köp Premium, 99 kr första månaden'
const anrop = (namn: string) => captureMock.mock.calls.filter(([n]) => n === namn).map(([, p]) => p as Record<string, unknown>)
beforeEach(() => captureMock.mockClear())

describe('spärren i testflödet', () => {
  it('nya utseendet med samma pris, samma köpknapp och samma händelser', () => {
    const { container } = render(<PaywallCard variant="testniva" feature="test_daily_pass" plats="dag2" testTyp="talserier" matning={{ test_kind: 'talserie', lage: 'trana' }} />)
    expect(container.querySelector('[data-sparr-vagg="premium"]')).toBeTruthy()
    expect(container.querySelector('[data-sparr-pris]')!.textContent).toBe(paywallPrisrad())
    expect(anrop('betalvagg_visad')).toEqual([{ plats: 'dag2', dagar_kvar: null, test_kind: 'talserie', lage: 'trana' }])
    fireEvent.click(screen.getByRole('button', { name: /Köp Premium, 149 kr/ }))
    expect(anrop('paywall_cta_clicked')[0]).toMatchObject({ variant: 'testniva', cta: 'primary', plats: 'dag2', test_kind: 'talserie', lage: 'trana' })
  })

  it('Black Week: kampanjpriset i nya spärrens knapp och prisrad', () => {
    const { container } = render(
      <KampanjPrisProvider kampanj={BW}>
        <PaywallCard variant="testniva" feature="test_daily_pass" plats="dag2" matning={{ test_kind: 'figurserie', lage: 'trana' }} />
      </KampanjPrisProvider>
    )
    expect(screen.getByRole('button', { name: BW_KNAPP })).toBeTruthy()
    // Kampanjmärket står på egen rad före prisraden (spec-kampanjmarke 6.3).
    const pris = container.querySelector('[data-sparr-pris]')!
    expect(pris.querySelector('.km-liten [data-kn-text]')).toBeTruthy()
    expect(pris.textContent!.endsWith(paywallPrisrad(undefined, BW))).toBe(true)
  })

  it('utan hennes siffror faller raderna bort; med dem står de', () => {
    const utan = render(<PaywallCard variant="test-tak" testTyp="matris" quota={{ feature: 'test:matris', nextResetAt: '2026-11-21T00:00:00Z' }} matning={{ test_kind: 'matris', lage: 'nivatest' }} />)
    expect(utan.container.querySelector('[data-sparr-vagg="kvot"]')).toBeTruthy()
    expect(utan.container.querySelector('.sparr-du')).toBeNull()
    expect(utan.container.textContent).not.toContain('på grundnivån')
    expect(utan.container.querySelector('[data-sparr-ga-igenom]')).toBeNull()
    expect(utan.container.querySelector('[data-sparr-paminn]')!.textContent).toBe('Påminn mig i morgon')
    utan.unmount()
    const med = render(
      <PaywallCard
        variant="test-tak"
        testTyp="matris"
        quota={{ feature: 'test:matris', nextResetAt: '2026-11-21T00:00:00Z' }}
        matning={{ test_kind: 'matris', lage: 'nivatest' }}
        sparrData={{ resultat: { ratt: 7, antal: 9 }, niva: 3.3, gaIgenomHref: '/x' }}
      />
    )
    expect(med.container.querySelector('[data-sparr-rubrik]')!.textContent).toContain('7 av 9 på grundnivån.')
    expect(med.container.querySelector('.sparr-du')!.textContent).toContain('du, nivå 3,3')
    expect(med.container.querySelector('[data-sparr-ga-igenom]')).toBeTruthy()
  })

  it('löftena följer typen: riktad träning och övningsprov bara där de finns', () => {
    const ids = (t: Parameters<typeof sparrLoften>[0]['testTyp']) => sparrLoften({ testTyp: t, data: {}, plats: 'dag2' }).map((l) => l.id)
    expect(ids('figurer')).toEqual(['trana', 'prov', 'nivakoll'])
    expect(ids('talserier')).toEqual(['trana', 'riktad', 'nivakoll'])
    expect(ids('matris')).toEqual(['trana', 'riktad', 'prov', 'nivakoll'])
    expect(sparrLoften({ testTyp: 'verbalt', data: {}, plats: 'dag2' }).find((l) => l.id === 'prov')!.kort.join('')).not.toContain('så ofta du vill')
  })

  it('arket bakom ett lås (GraValSheet): provets bild, siffrorna som finns, krysset', () => {
    const stang = vi.fn()
    const { container } = render(<PaywallCard variant="testniva" feature="test_exam_mode" plats="generalrepetition" bare utseende="test" dagarKvar={5} sparrData={{ niva: 3.3 }} onStang={stang} />)
    expect(container.querySelector('[data-sparr-arket]')).toBeTruthy()
    expect(container.querySelector('[data-sparr-rubrik]')!.textContent).toBe('Gör provet en gång innan det gäller')
    expect([...container.querySelectorAll('.sparr-sif b')].map((b) => b.textContent)).toEqual(['5', '3,3', '0,7'])
    fireEvent.click(screen.getByRole('button', { name: 'Stäng' }))
    expect(stang).toHaveBeenCalled()
    expect(anrop('betalvagg_visad')[0]).toMatchObject({ plats: 'generalrepetition', dagar_kvar: 5 })
  })

  it('CV och brev: kortet som förut', () => {
    const { container } = render(<PaywallCard variant="mall" />)
    expect(container.querySelector('[data-sparr-vagg]')).toBeNull()
    expect(container.querySelector('section.rounded-2xl')).toBeTruthy()
  })
})

/* ------------------------------------------------------------- resultatet */

type U = RamUppgift & { t: string }
const RITARE = { kind: 'matris', namn: 'Figurer och mönster', form: 'bred', antalAlternativ: () => 4, Uppgift: () => <div data-uppg /> } as unknown as TypRitare<U>
const post = (i: number, ratt: boolean, valt: number | null = ratt ? 0 : 1) => ({ u: { nyckel: `q${i}`, t: '' }, valt, facit: { ratt: 0, correct: ratt, regel: `Regel ${i}`, misstag: ratt ? null : `Misstag ${i}` }, tid_s: 30 + i * 10 })

function bas(lage: ResultatskarmProps['lage'], extra: Partial<ResultatskarmProps> = {}): ResultatskarmProps {
  const poster = [post(0, true), post(1, false), post(2, true), post(3, false, null)]
  return {
    lage,
    titel: 'Figurer och mönster',
    undertitel: 'Övningsprov',
    onStang: () => {},
    huvudtal: '2 av 4 rätt',
    tal: [{ varde: '31 s', etikett: 'i snitt' }],
    genomgang: { titel: '', onGaIgenom: () => {}, lista: { ritare: RITARE, lage, poster, budgetPerUppgift: 45, onOppna: () => {} } },
    nastaSteg: { titel: 'Träna det du missade', knapp: { text: 'Träna', href: '/x' } },
    tillbakaHref: '/t',
    ...extra,
  }
}

describe('resultatsidan efter test', () => {
  it('brickor, staplar och genomgången; inget förra försök och ingen nivå ritas inte', () => {
    const { container } = render(<Resultatskarm {...bas('ovningsprov')} />)
    expect(container.querySelector('[data-resultat-v3="test"]')).toBeTruthy()
    expect(container.querySelectorAll('.res-br').length).toBe(4)
    expect([...container.querySelectorAll('.res-br')].map((b) => b.getAttribute('data-utfall'))).toEqual(['ratt', 'fel', 'ratt', 'obesvarad'])
    expect(container.querySelector('[data-resultat-tidstaplar]')).toBeTruthy()
    expect(container.querySelector('[data-resultat-forra]')).toBeNull()
    expect(container.querySelector('[data-resultat-matare]')).toBeNull()
    expect(screen.getByText('Ett fel och en obesvarad')).toBeTruthy()
    // Första missen utfälld, de rätta samlade.
    expect(container.querySelectorAll('[data-lista-panel]').length).toBe(1)
    expect(container.querySelector('[data-lista-klarade]')).toBeTruthy()
  })

  it('förra försöket och nivån när de finns', () => {
    const { container } = render(<Resultatskarm {...bas('ovningsprov', { forra: { ratt: 1, antal: 4, namn: 'övningsprovet' }, niva: 4.1 })} />)
    expect(container.querySelector('[data-resultat-forra]')!.textContent).toBe('En fler än förra övningsprovet')
    expect(container.querySelector('[data-resultat-matare]')!.textContent).toContain('din nivå 4,1')
  })
})

describe('målgången efter Träna', () => {
  it('utan nivå: huvudtalet och inga mätare', () => {
    const { container } = render(<Resultatskarm {...bas('trana')} />)
    expect(container.querySelector('[data-resultat-v3="malgang"]')).toBeTruthy()
    expect(container.querySelector('[data-resultat-huvudtal]')!.textContent).toBe('2 av 4 rätt')
    expect(container.querySelector('[data-resultat-matare]')).toBeNull()
    expect(container.querySelector('[data-resultat-nivadiagram]')).toBeNull()
    // Huvudtalet upprepas inte som nyckeltal.
    expect([...container.querySelectorAll('.res-stat dt')].map((d) => d.textContent)).not.toContain('rätt')
  })
})

describe('många missar och tider på noll', () => {
  it('fem rader, sedan Visa alla; ingen tid på noll; ikonbrickan före miniatyren', () => {
    const poster = Array.from({ length: 12 }, (_, i) => ({ ...post(i, false), tid_s: 0 }))
    const ikonRitare = { ...RITARE, RadIkon: () => <span data-test-ikon /> } as unknown as TypRitare<U>
    const p = bas('nivatest')
    const { container } = render(<Resultatskarm {...p} genomgang={{ ...p.genomgang!, lista: { ritare: ikonRitare, lage: 'nivatest', poster } }} />)
    expect(container.querySelectorAll('[data-lista-rad]').length).toBe(5)
    expect(container.querySelectorAll('[data-test-ikon]').length).toBe(5)
    expect(container.querySelector('[data-dom-tid]')).toBeNull()
    expect([...container.querySelectorAll('.res-rad .res-tid')].every((e) => e.textContent === '')).toBe(true)
    fireEvent.click(screen.getByText('Visa alla 12 missar'))
    expect(container.querySelectorAll('[data-lista-rad]').length).toBe(12)
  })

  it('med nivån: rubriken, mätaren och uppgifternas linje', () => {
    const { container } = render(<Resultatskarm {...bas('trana', { mal: { fore: 3.0, efter: 3.3, nivaer: [2.8, 3.1, 2.9, 3.2] } })} />)
    expect(container.querySelector('[data-resultat-huvudtal]')!.textContent).toBe('Du steg till 3,3')
    expect(container.textContent).toContain('0,7 kvar till provets nivå')
    expect(container.querySelector('[data-resultat-matare]')!.textContent).toContain('förut 3,0')
    expect(container.querySelector('[data-resultat-nivadiagram]')).toBeTruthy()
  })
})

describe('putsningarna', () => {
  it('tal i banktexter med hårda blanksteg', () => {
    expect(hardaMellanrum('Hyran är 1 000 kr och 42 000 kr, 60 %.')).toBe('Hyran är 1 000 kr och 42 000 kr, 60 %.')
    expect(hardaMellanrum('År 2024 var 3 av 10')).toBe('År 2024 var 3 av 10')
  })
  it('genomgångens rubrik', () => {
    expect(genomgangRubrik(4, 1, 'ovningsprov')).toBe('Fyra fel och en obesvarad')
    expect(genomgangRubrik(0, 0, 'nivakoll')).toBe('Alla rätt')
  })
})
