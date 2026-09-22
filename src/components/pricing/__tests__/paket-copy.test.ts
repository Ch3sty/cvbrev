/**
 * Vakttester för prissidans strängar.
 *
 * De flesta rör tal: besparingarna, mellanskillnaden och antalsraden. Alla
 * ska räknas ur PLANS och aldrig stå som fasta tal i en sträng (Fas 2E,
 * öppen punkt 4). Testerna finns för att ett prisbyte ska bryta här och inte
 * i produktion, där raden i stället hade ljugit tyst.
 */

import { describe, expect, it } from 'vitest'

import { PLANS, PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'
import { ALLA_FEATURES } from '@/lib/access/features'
import {
  FEATURE_ETIKETT,
  INTERVALL_RAD,
  PAKET_PUNKTER,
  PAKET_RAD,
  PR_H1,
  besparing,
  bytLangdKnapp,
  forslagSkal,
  gangerText,
  knappText,
  langdPrisRad,
  mellanskillnad,
  statusRadText,
} from '../paket-copy'

const ALLA_NYCKLAR = PLANS.map((p) => p.key)

describe('täckning', () => {
  it('har en rad, tre punkter och en intervallrad per paket', () => {
    for (const key of ALLA_NYCKLAR) {
      expect(PAKET_RAD[key], key).toBeTruthy()
      expect(PAKET_PUNKTER[key], key).toHaveLength(3)
      expect(INTERVALL_RAD[key], key).toBeTruthy()
    }
  })

  it('har en etikett per feature', () => {
    for (const feature of ALLA_FEATURES) {
      expect(FEATURE_ETIKETT[feature], feature).toBeTruthy()
    }
  })
})

describe('Allt-dagen', () => {
  it('säger att den inte förnyas, och det är kortets viktigaste rad', () => {
    expect(INTERVALL_RAD.all_day).toContain('förnyas inte')
  })

  it('bär prepositionen "för" och inte "i", eftersom den inte upprepas', () => {
    expect(langdPrisRad('all_day')).toBe('49 kr för ett dygn')
  })

  it('visar klockslag i statusraden, inte datum', () => {
    const slut = new Date('2026-09-22T21:40:00+02:00')
    expect(statusRadText('all_day', slut)).toContain('gäller till')
    expect(statusRadText('all_day', slut)).toContain('i dag')
  })
})

describe('besparingen räknas, den skrivs aldrig', () => {
  it('månaden mot fyra veckor', () => {
    const vantat = PLAN_BY_KEY.all_week.amount * 4 - PLAN_BY_KEY.all_month.amount
    expect(besparing('all_month')).toBe(`Sparar ${vantat} kr mot fyra veckor i rad`)
  })

  it('kvartalet mot tretton veckor', () => {
    const vantat = PLAN_BY_KEY.all_week.amount * 13 - PLAN_BY_KEY.all_quarter.amount
    expect(besparing('all_quarter')).toBe(`Sparar ${vantat} kr mot tretton veckor i rad`)
  })

  it('visas inte för veckan och dagen, där den inte är sann', () => {
    expect(besparing('all_week')).toBeNull()
    expect(besparing('all_day')).toBeNull()
    expect(besparing('cv_week')).toBeNull()
  })
})

describe('mellanskillnaden', () => {
  it('är skillnaden mot Allt-veckan, inte hela priset', () => {
    const vantat = PLAN_BY_KEY.all_week.amount - PLAN_BY_KEY.cv_week.amount
    expect(mellanskillnad('cv_week')).toBe(vantat)
    expect(mellanskillnad('test_week')).toBe(vantat)
  })

  it('blir aldrig negativ', () => {
    expect(mellanskillnad('all_quarter')).toBe(0)
  })
})

describe('antalsraden', () => {
  it('förkortar korrekt på svenska', () => {
    expect(gangerText(1)).toBe('1 gg')
    expect(gangerText(2)).toBe('2 ggr')
    expect(gangerText(11)).toBe('11 ggr')
  })
})

describe('knapptexterna', () => {
  it('använder samma verb som betalväggarna och namnger paketet', () => {
    for (const key of ALLA_NYCKLAR) {
      expect(knappText(key as PlanKey)).toBe(`Ta ${PLAN_BY_KEY[key].name}`)
    }
  })

  it('namnger målet i längdvalet, inte rubriken', () => {
    expect(bytLangdKnapp('all_month')).toBe('Byt till Allt-månaden')
  })
})

describe('förslagets skäl', () => {
  it('räknar ur samma tal som listan och skriver ut små tal', () => {
    const text = forslagSkal({ plan: 'cv_week', antal: 3, badaSparen: false, track: null })
    expect(text).toContain('tre gånger')
    expect(text).toContain('CV-veckan')
  })

  it('böjer singular rätt', () => {
    const text = forslagSkal({ plan: 'cv_week', antal: 1, badaSparen: false, track: null })
    expect(text).toContain('en gång')
    expect(text).not.toContain('1 gånger')
  })

  it('skriver tal över nio med siffra', () => {
    const text = forslagSkal({ plan: 'test_week', antal: 12, badaSparen: false, track: null })
    expect(text).toContain('12 gånger')
  })

  it('föreslår Allt när blockeringarna spänner båda spåren', () => {
    const text = forslagSkal({ plan: 'all_week', antal: 4, badaSparen: true, track: null })
    expect(text).toContain('Allt-veckan')
    expect(text).toContain('båda')
  })

  it('erkänner öppet att förslaget är en gissning utan underlag', () => {
    const text = forslagSkal({ plan: 'all_week', antal: 0, badaSparen: false, track: null })
    expect(text).toContain('Vi vet inte')
  })
})

describe('copyreglerna', () => {
  const allaStrangar = [
    PR_H1,
    ...Object.values(PAKET_RAD),
    ...Object.values(INTERVALL_RAD),
    ...Object.values(FEATURE_ETIKETT),
    ...Object.values(PAKET_PUNKTER).flat(),
  ]

  it('innehåller inga talstreck', () => {
    for (const s of allaStrangar) {
      expect(s, s).not.toContain('—')
      expect(s, s).not.toContain('–')
    }
  })

  it('säger aldrig "Lås upp" eller "gratis för alltid"', () => {
    for (const s of allaStrangar) {
      expect(s.toLowerCase(), s).not.toContain('lås upp')
      expect(s.toLowerCase(), s).not.toContain('gratis för alltid')
    }
  })

  it('har H1 enligt Fas 2E avsnitt 0', () => {
    expect(PR_H1).toBe('Välj spåret du söker på. Börja med en vecka.')
  })
})
