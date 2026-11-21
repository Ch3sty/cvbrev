/**
 * Raderna en inläst roll ritas och poängsätts på (rollensRader i matt.ts).
 * Det som står i personens CV är det som ritas och räknas: korta nyckelord
 * från en äldre inläsning får aldrig tränga undan hennes egna meningar.
 */
import { describe, expect, it } from 'vitest'
import { kanonisktCv } from '@/lib/cv/poang'
import { arNyckelord, pastaenden, rollensRader } from '@/lib/cv/poang/matt'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'

const BESKRIVNING =
  'Plockade och packade order till butiker i hela Norden.\nAnsvarade för inleverans och kontroll av gods.\nUtbildade nya kollegor i lagersystemet.'

const NYCKELORD = ['Plocka order', 'Packa order', 'Inleverans']

const MENINGAR = ['Plockade order med truck i ett kyllager', 'Ansvarade för inleverans varje morgon']

function cv(roll: Record<string, unknown>) {
  return {
    name: 'Erik Lindberg',
    profile: 'Lagerarbetare med fem års erfarenhet.',
    roles: [{ title: 'Lagerarbetare', company: 'Logistikbolaget AB', period: '2019 - 2024', originalText: '', ...roll }],
    education: [],
    skills: [],
  }
}

describe('rollensRader', () => {
  it('nyckelord och en rik beskrivning ger beskrivningens rader', () => {
    expect(rollensRader(NYCKELORD, BESKRIVNING)).toEqual([
      'Plockade och packade order till butiker i hela Norden.',
      'Ansvarade för inleverans och kontroll av gods.',
      'Utbildade nya kollegor i lagersystemet.',
    ])
  })

  it('riktiga punkter med hela meningar behålls', () => {
    expect(rollensRader(MENINGAR, BESKRIVNING)).toEqual(MENINGAR)
  })

  it('tom beskrivning och nyckelord behåller nyckelorden', () => {
    expect(rollensRader(NYCKELORD, '')).toEqual(NYCKELORD)
    expect(rollensRader(NYCKELORD, undefined)).toEqual(NYCKELORD)
  })

  it('en kort beskrivning tränger inte undan nyckelorden', () => {
    expect(rollensRader(['inköp', 'drift', 'personal'], 'Ansvarig för inköp och drift')).toEqual([
      'inköp',
      'drift',
      'personal',
    ])
  })

  it('beskrivningen väljs bara när den har fler ord än nyckelorden tillsammans', () => {
    const manga = ['Plocka order', 'Packa order', 'Lasta bil', 'Truck', 'Inleverans och kontroll']
    // nyckelorden har tio ord, beskrivningen nio
    expect(rollensRader(manga, 'Jobbade på lagret med plock och pack varje dag')).toEqual(manga)
  })

  it('inga punkter ger beskrivningen delad på rader och punkttecken', () => {
    expect(rollensRader([], 'Kassa\nVarupåfyllning • Beställningar')).toEqual(['Kassa', 'Varupåfyllning', 'Beställningar'])
    expect(rollensRader(undefined, 'Kassa')).toEqual(['Kassa'])
    expect(rollensRader(undefined, undefined)).toEqual([])
  })

  it('tomma punkter och annat än text räknas inte', () => {
    expect(rollensRader(['  ', 7, null, ' Plockade order med truck '], '')).toEqual(['Plockade order med truck'])
  })

  it('är idempotent: raderna in som punkter ger samma rader ut', () => {
    for (const [punkter, beskrivning] of [
      [NYCKELORD, BESKRIVNING],
      [MENINGAR, BESKRIVNING],
      [NYCKELORD, ''],
      [[], BESKRIVNING],
    ] as const) {
      const forsta = rollensRader(punkter, beskrivning)
      expect(rollensRader(forsta, beskrivning)).toEqual(forsta)
      expect(rollensRader(punkter, beskrivning)).toEqual(forsta)
    }
  })

  it('arNyckelord: färre än hälften med minst tre ord', () => {
    expect(arNyckelord(NYCKELORD)).toBe(true)
    expect(arNyckelord(MENINGAR)).toBe(false)
    expect(arNyckelord(['Plockade order med truck', 'Kassa'])).toBe(false)
    expect(arNyckelord([])).toBe(false)
  })
})

describe('arket och poängen läser samma rader', () => {
  for (const [namn, roll] of [
    ['nyckelord och rik beskrivning', { responsibilities: NYCKELORD, description: BESKRIVNING }],
    ['hela meningar', { responsibilities: MENINGAR, description: BESKRIVNING }],
    ['nyckelord utan beskrivning', { responsibilities: NYCKELORD, description: '' }],
    ['bara beskrivning', { description: BESKRIVNING }],
  ] as const) {
    it(namn, () => {
      const data = cv(roll)
      const arket = normalizeStructuredData(data)!.experience[0].description
      const poangen = kanonisktCv(data)!.experience[0].description
      expect(poangen).toEqual(arket)
      expect(poangen).toEqual(rollensRader(roll.responsibilities, roll.description))
    })
  }

  it('en roll med nyckelord och egna meningar får påståenden att räkna', () => {
    const data = cv({ responsibilities: NYCKELORD, description: BESKRIVNING })
    expect(pastaenden(kanonisktCv(data)!.experience[0].description)).toHaveLength(3)
  })

  it('kanonisktCv är idempotent för rollen', () => {
    const data = cv({ responsibilities: NYCKELORD, description: BESKRIVNING })
    const en = kanonisktCv(data)!
    expect(kanonisktCv(en)).toEqual(en)
  })
})
