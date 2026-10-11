import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { HjalpProvider } from '@/components/hjalp'
import TestKategori from '../components/TestKategori'
import { TEST_GROUPS } from '../components/testCatalog'
import { emptyHubData } from '../getHubData'
import { spann } from '../components/Fakta'

afterEach(() => cleanup())

const logik = TEST_GROUPS.find((g) => g.key === 'logik')!
const numerisk = TEST_GROUPS.find((g) => g.key === 'numerisk')!
const verbal = TEST_GROUPS.find((g) => g.key === 'verbal')!

function medGrund(scope: 'allt' | null) {
  const data = emptyHubData(scope !== null, scope !== null, scope)
  data.perTest['matrislogik-grund'] = {
    attempts: 20,
    bestScore: 14,
    bestPercentage: 93,
    totalTimeSeconds: 600,
    lastAttempt: '2026-10-10T10:00:00Z',
    history: [],
  }
  return data
}

describe('faktaraden', () => {
  it('skriver ett tal eller ett spann', () => {
    expect(spann([15, 15, 15])).toBe('15')
    expect(spann([20, 30, 25])).toBe('20 till 30')
  })
})

describe('testkortets nivåsegment (skiss version 3)', () => {
  it('ett tal bär segmentet, "X av Y" och försöken står bara i title och aria', () => {
    const data = medGrund('allt')
    const { container } = render(
      <HjalpProvider dold={null} forsta={false}>
        <TestKategori group={logik} perTest={data.perTest} scope="allt" />
      </HjalpProvider>,
    )
    const gjord = container.querySelector('[data-niva="gjord"]') as HTMLElement
    expect(gjord.textContent).toContain('93 %')
    expect(gjord.textContent).not.toMatch(/av|försök/)
    expect(gjord.getAttribute('title')).toBe('14 av 15, 20 försök')
    expect(gjord.getAttribute('aria-label')).toContain('bäst 93 procent, 14 av 15, 20 försök')
    // inga mittpunkter i kortets text
    expect(container.textContent).not.toContain('·')
    // talet förklaras under rutnätet när något är gjort
    expect(container.textContent).toContain('Bästa resultat per nivå')
    // inte gjord: minuterna och vad nivån gör, aldrig "lätt"
    const ny = container.querySelectorAll('[data-niva="ny"]')
    expect(ny.length).toBe(2)
    expect(ny[0].textContent).toMatch(/\d+ min/)
    expect(ny[0].textContent).toContain('två regler')
    expect(ny[1].textContent).toContain('tre regler')
    expect(container.textContent).not.toMatch(/lätt/i)
    // grund sitter (93 procent): Nästa på avancerad, bara där
    expect(container.querySelectorAll('[data-nasta]').length).toBe(1)
    expect(ny[0].getAttribute('data-nasta')).toBe('ja')
  })

  it('låsta nivåer har lås och "Premium" och är knappar', () => {
    const data = emptyHubData(false, false, null)
    const { container } = render(
      <HjalpProvider dold={null} forsta={false}>
        <TestKategori group={numerisk} perTest={data.perTest} scope={null} />
      </HjalpProvider>,
    )
    const last = container.querySelectorAll('[data-niva="last"]')
    expect(last.length).toBeGreaterThan(0)
    expect(last[0].tagName).toBe('BUTTON')
    expect(last[0].textContent).toContain('Premium')
    expect(container.textContent).not.toContain('Bästa resultat per nivå')
  })

  it('alla tre kognitiva kort har tre nivåsegment och provraden (Testerna v2, skiss 1)', () => {
    const data = emptyHubData(true, true, 'allt')
    const logikKort = render(
      <HjalpProvider dold={null} forsta={false}>
        <TestKategori group={logik} perTest={data.perTest} scope="allt" />
      </HjalpProvider>,
    ).container
    expect(logikKort.querySelectorAll('[data-niva]').length).toBe(3)
    expect(logikKort.querySelectorAll('[data-provrad]').length).toBe(1)
    cleanup()
    const verbalKort = render(
      <HjalpProvider dold={null} forsta={false}>
        <TestKategori group={verbal} perTest={data.perTest} scope="allt" />
      </HjalpProvider>,
    ).container
    expect(verbalKort.querySelectorAll('[data-niva]').length).toBe(3)
    expect(verbalKort.querySelectorAll('[data-provrad]').length).toBe(1)
    expect(verbalKort.textContent).toContain('Vårt format: 32 påståenden på 20 minuter.')
    expect(verbalKort.textContent).not.toContain('Prov ')
  })

  it('har en i-knapp per kort och rubriken som fråga', () => {
    const data = emptyHubData(false, false, null)
    const { container, getByRole } = render(
      <HjalpProvider dold={null} forsta={false}>
        <TestKategori group={numerisk} perTest={data.perTest} scope={null} />
      </HjalpProvider>,
    )
    expect(getByRole('heading', { level: 2 }).textContent).toBe('Läs tabellen och räkna under tid.')
    expect(container.querySelectorAll('button[aria-haspopup="dialog"]').length).toBe(1)
  })
})
