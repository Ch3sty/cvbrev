// Paketen och spårvalet: reglerna som är lätta att bryta utan att märka det.
import { describe, it, expect } from 'vitest'
import {
  PAKET,
  PAKETSKARM,
  fornyelserad,
  isTrack,
} from '../program'
import * as program from '../program'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { requiredStepsForTrack, isTrackOnboardingComplete } from '../steps'

describe('paketen', () => {
  it('speglar plans.ts priser och namn, så kassan och skärmen aldrig glider isär', () => {
    for (const key of Object.keys(PAKET) as Array<keyof typeof PAKET>) {
      const paket = PAKET[key]
      const plan = PLAN_BY_KEY[key]
      expect(paket.namn).toBe(plan.name)
      expect(paket.belopp).toBe(plan.amount)
    }
  })

  it('bara Dagspasset är engångs, och bara spåren har en ingår inte-rad', () => {
    expect(PAKET.all_day.engangs).toBe(true)
    expect(PAKET.all_week.engangs).toBeUndefined()
    expect(PAKET.cv_week.ingarInte).toBeTruthy()
    expect(PAKET.test_week.ingarInte).toBeTruthy()
    // Allt har inget att räkna upp, och raden ska då inte finnas alls.
    expect(PAKET.all_week.ingarInte).toBeUndefined()
    expect(PAKET.all_month.ingarInte).toBeUndefined()
  })

  it('varje paket har exakt fyra ingår-rader', () => {
    for (const paket of Object.values(PAKET)) expect(paket.ingar).toHaveLength(4)
  })

  it('Premium per månad räknar upp det som ingår utan att nämna de gamla paketen', () => {
    const rader = PAKET.all_month.ingar.join(' ')
    expect(rader).not.toMatch(/CV-paketet|Träningspaketet|Hela paketet|fyra veckor/)
    for (const p of Object.values(PAKET)) {
      for (const r of [...p.ingar, p.ingarInte ?? '']) {
        expect(r).not.toMatch(/Hela paketet|de andra paketen|allt i CV-paketet/i)
      }
    }
  })
})

describe('kassans lagkravsrader', () => {
  it('engångsköpet får en sluttidsrad, aldrig ett dragningsdatum', () => {
    const rad = fornyelserad(PAKET.all_day, 'torsdag 21:00')
    expect(rad).toContain('Inget dras igen')
    expect(rad).not.toContain('Nästa dragning')
  })

  it('löpande paket får dragningsdatum och uppsägning i samma rad', () => {
    const rad = fornyelserad(PAKET.cv_week, '29 september')
    expect(rad).toContain('Nästa dragning 29 september')
    expect(rad).toContain('Säg upp')
  })
})

describe('fel spår i taket, för befintliga spårkunder', () => {
  it('har ingen egen copy sedan FelSpar togs bort (spec-rummen 17.5)', () => {
    // Spårkunden får den vanliga Premium-väggen; bytet sker på
    // prenumerationssidan med KONTO.bytPrisrad.
    expect(program).not.toHaveProperty('FEL_SPAR')
    expect(program).not.toHaveProperty('felSparKnapp')
  })
})

describe('spårets steg', () => {
  it('varje spår har tre steg, alla tre krävs', () => {
    for (const track of ['cv', 'tester', 'allt'] as const) {
      expect(requiredStepsForTrack(track)).toHaveLength(3)
      expect(isTrackOnboardingComplete(track, requiredStepsForTrack(track).slice(0, 2))).toBe(false)
      expect(isTrackOnboardingComplete(track, [...requiredStepsForTrack(track)])).toBe(true)
    }
  })

  it('utan spår faller vi tillbaka på den spårlösa listan', () => {
    expect(requiredStepsForTrack(null)).toEqual(['upload_cv'])
  })
})

describe('isTrack', () => {
  it('släpper bara igenom de tre spåren', () => {
    expect(isTrack('cv')).toBe(true)
    expect(isTrack('tester')).toBe(true)
    expect(isTrack('allt')).toBe(true)
    expect(isTrack('premium')).toBe(false)
    expect(isTrack(null)).toBe(false)
    expect(isTrack(undefined)).toBe(false)
  })
})

describe('ångerrättssamtycket i uppgraderingsrutten', () => {
  it('står kvar ordagrant (lagkrav)', () => {
    expect(PAKETSKARM.samtycke).toBe(
      'Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.'
    )
    expect(PAKETSKARM).not.toHaveProperty('bytPaket')
  })
})

describe('?paket förväljer spår och längd', () => {
  it('varje paketnyckel pekar på exakt ett spår', () => {
    expect(PLAN_BY_KEY.cv_week.scope).toBe('cv')
    expect(PLAN_BY_KEY.test_week.scope).toBe('tester')
    for (const key of ['all_day', 'all_week', 'all_month', 'all_quarter'] as const) {
      expect(PLAN_BY_KEY[key].scope).toBe('allt')
    }
  })

  it('PAKET känner alla sex nycklar, så befintliga kunder beskrivs rätt', () => {
    expect(Object.keys(PAKET).sort()).toEqual(Object.keys(PLAN_BY_KEY).sort())
  })
})
