// Paketen och spårvalet: reglerna som är lätta att bryta utan att märka det.
import { describe, it, expect } from 'vitest'
import {
  PAKET,
  ALLT_LANGDER,
  paketForTrack,
  PAKETSKARM,
  fornyelserad,
  felSparRad,
  felSparText,
  mellanskillnad,
  isTrack,
} from '../program'
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

  it('bara Allt-dagen är engångs, och bara spåren har en ingår inte-rad', () => {
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

  it('spåren har ingen längd att välja, Allt har fyra', () => {
    expect(ALLT_LANGDER).toHaveLength(4)
    expect(paketForTrack('cv').key).toBe('cv_week')
    expect(paketForTrack('tester').key).toBe('test_week')
    expect(paketForTrack('allt').key).toBe('all_week')
    expect(paketForTrack('allt', 'all_month').key).toBe('all_month')
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

describe('fel spår i taket', () => {
  it('raden säger vad paketet ger, inte vad det saknar', () => {
    const rad = felSparRad('tester')
    expect(rad).toContain('Du har Testveckan')
    expect(rad).not.toMatch(/ingår inte|saknas|låst/i)
  })

  it('kortet pekar på Allt-veckan för båda spåren', () => {
    expect(felSparText('tester')).toContain('Allt-veckan')
    expect(felSparText('cv')).toContain('Allt-veckan')
  })

  it('prisraden visar mellanskillnaden, aldrig hela paketpriset', () => {
    expect(mellanskillnad(20)).toBe('Mellanskillnad, 20 kr')
    expect(mellanskillnad(20)).not.toContain('99')
    expect(mellanskillnad(null)).toBe('Bara mellanskillnaden')
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

describe('dirigentens beslut D48b: dagläget mot löpande prenumeration', () => {
  it('dagläget ligger kvar som längd, så raden ser likadan ut för alla', () => {
    // Beslutet spärrar läget, det tar inte bort det. Fyra lägen alltid.
    expect(ALLT_LANGDER).toContain('all_day')
    expect(ALLT_LANGDER).toHaveLength(4)
  })

  it('en spärrad knapp har en mening som säger varför', () => {
    expect(PAKETSKARM.dagSpärrad).toMatch(/engångsköp/)
    expect(PAKETSKARM.dagSpärrad).toMatch(/prenumeration/)
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

  it('bara Allt-nycklarna är längder, så bara de får förvälja i segmentet', () => {
    const langder = (Object.keys(PAKET) as Array<keyof typeof PAKET>).filter((k) =>
      k.startsWith('all_')
    )
    expect(langder.sort()).toEqual([...ALLT_LANGDER].sort())
  })
})
