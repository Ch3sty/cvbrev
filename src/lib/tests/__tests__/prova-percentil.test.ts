import { describe, expect, it } from 'vitest'
import { andelSomLoserFlest, PERCENTIL_MIN_PROV } from '../prova-percentil'
import { felIndex } from '../anon-session'
import { fragorText, KONTO_PANEL } from '@/components/registrering/registrering-copy'
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7'

const utfall = (fordelning: Record<number, number>) =>
  Object.entries(fordelning).flatMap(([s, n]) => new Array<number>(n).fill(Number(s)))

describe('percentilraden (ägarens beslut 2026-11-09)', () => {
  it('döljs under 200 avslutade prov', () => {
    expect(andelSomLoserFlest(5, utfall({ 5: 10, 3: 189 }))).toBeNull()
    expect(PERCENTIL_MIN_PROV).toBe(200)
  })

  it('räknas på utfallen och avrundas uppåt till närmaste fem', () => {
    // 200 prov: 30 med fem rätt, 40 med fyra, resten färre.
    const u = utfall({ 5: 30, 4: 40, 3: 60, 2: 50, 1: 20 })
    expect(andelSomLoserFlest(5, u)).toBe(15)
    expect(andelSomLoserFlest(4, u)).toBe(35)
  })

  it('döljs i nedre halvan, där meningen inte säger något', () => {
    const u = utfall({ 5: 30, 4: 40, 3: 60, 2: 50, 1: 20 })
    expect(andelSomLoserFlest(3, u)).toBeNull()
    expect(andelSomLoserFlest(0, u)).toBeNull()
  })
})

describe('felIndex', () => {
  it('ger positionerna som blev fel eller obesvarade, aldrig facit', () => {
    const q = (correctAnswer: number) => ({ correctAnswer }) as unknown as LayeredQuestion
    expect(felIndex([q(0), q(1), q(2), q(3), q(4)], [0, 1, 5, -1, 4])).toEqual([2, 3])
  })
})

describe('panelens text', () => {
  it('namnger frågorna som blev fel', () => {
    expect(fragorText([2])).toBe('fråga 3')
    expect(fragorText([1, 3])).toBe('fråga 2 och 4')
    expect(fragorText([0, 2, 4])).toBe('fråga 1, 3 och 5')
    expect(KONTO_PANEL.rubrik([2], 5)).toBe('Kontot visar fråga 3 och regeln bakom')
    expect(KONTO_PANEL.rader([2], 5)[0]).toEqual({ fet: 'Fråga 3', text: ' med rätt svar och regeln bakom mönstret' })
  })

  it('Nivåkollen räknas till fem minuter med fem svar, som på hemvyn', () => {
    expect(KONTO_PANEL.rader([2], 5)[2].text).toBe(', 5 minuter, räknar in de här svaren')
  })

  it('priset kommer ur PLANS och Premium står som text', () => {
    expect(KONTO_PANEL.premiumRad.namn).toBe('Premium')
    expect(KONTO_PANEL.premiumRad.text).toContain('149 kr i månaden')
  })

  it('inga talstreck och inga mittpunkter', () => {
    const allt = JSON.stringify([KONTO_PANEL.rader([1, 3], 5), KONTO_PANEL.premiumRad, KONTO_PANEL.rubrik([1], 5)])
    expect(allt).not.toMatch(/[—–·]/)
  })
})
