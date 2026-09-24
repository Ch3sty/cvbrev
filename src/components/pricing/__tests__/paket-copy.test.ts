/**
 * Vakttester för prissidans strängar.
 *
 * De flesta rör tal: priserna, mallantalet, besparingarna och
 * mellanskillnaden. Alla ska räknas ur PLANS och TEMPLATE_COUNT och aldrig
 * stå som fasta tal i en sträng. Testerna finns för att ett prisbyte ska
 * bryta här och inte i produktion, där raden i stället hade ljugit tyst.
 */

import { describe, expect, it } from 'vitest'

import { PLANS, PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'
import { TEMPLATE_COUNT } from '@/lib/cv/simple-templates'
import { ALLA_FEATURES } from '@/lib/access/features'
import {
  FEATURE_ETIKETT,
  FUNKTIONER,
  GUIDE,
  HERO,
  INTERVALL_RAD,
  KOPSTEG,
  KOPSTEG_FAR,
  PAKET_IDS,
  PAKET_KORT,
  PAKET_PUNKTER,
  PAKET_RAD,
  PR_H1,
  SPARVAL,
  alltPrisSub,
  besparing,
  borjaKnapp,
  bytLangdKnapp,
  forslagSkal,
  gangerText,
  knappText,
  langdPrisRad,
  mellanskillnad,
  planForLangd,
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

  it('har tre kort med etikett, värdemening, lista och knapp', () => {
    for (const id of PAKET_IDS) {
      const kort = PAKET_KORT[id]
      expect(kort.tag, id).toBeTruthy()
      expect(kort.varde, id).toBeTruthy()
      expect(kort.rader.length, id).toBeGreaterThanOrEqual(3)
      expect(kort.rader.filter((r) => r.mobil).length, `${id} mobilrader`).toBe(3)
      expect(borjaKnapp(id), id).toMatch(/^Börja /)
    }
  })

  it('har fyra "du får"-rader per kort i spårvalet och köpsteget', () => {
    for (const kort of SPARVAL.kort) {
      expect(kort.duFar, kort.paket).toHaveLength(4)
    }
    for (const id of PAKET_IDS) {
      expect(KOPSTEG_FAR[id], id).toHaveLength(4)
    }
  })

  it('har fem funktionskort och en guidelista per paket', () => {
    expect(FUNKTIONER.kort).toHaveLength(5)
    for (const id of PAKET_IDS) {
      expect(GUIDE.listor[id].steg.length, id).toBeGreaterThanOrEqual(8)
    }
  })
})

describe('talen räknas, de skrivs aldrig', () => {
  it('mallantalet kommer ur TEMPLATE_COUNT', () => {
    expect(PAKET_KORT.cv.rader[1].rubrik).toContain(String(TEMPLATE_COUNT))
    expect(SPARVAL.kort[0].duFar[1].fet).toContain(String(TEMPLATE_COUNT))
    expect(KOPSTEG_FAR.cv[1].fet).toContain(String(TEMPLATE_COUNT))
  })

  it('priserna i heron, spårvalet och köpsteget kommer ur PLANS', () => {
    expect(HERO.bevis[1].tal).toBe(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(SPARVAL.kort[0].pris).toBe(`${PLAN_BY_KEY.cv_week.amount} kr / vecka`)
    expect(SPARVAL.kort[2].prisText).toContain(String(PLAN_BY_KEY.all_quarter.amount))
    expect(KOPSTEG.primar('cv_week')).toBe(`Till betalning, ${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(KOPSTEG.samtycke('cv_week')).toContain(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(alltPrisSub('all_week')).toContain(String(PLAN_BY_KEY.all_month.amount))
  })

  it('samtycket säger att innehållet startar direkt och att ångerrätten inte gäller', () => {
    for (const key of ALLA_NYCKLAR) {
      const text = KOPSTEG.samtycke(key)
      expect(text, key).toContain('startar direkt')
      expect(text, key).toContain('ångerrätten')
    }
    expect(KOPSTEG.samtycke('all_day')).toContain('engångsköp')
    expect(KOPSTEG.samtycke('all_week')).toContain('dras var sjunde dag')
    expect(KOPSTEG.samtycke('all_month')).toContain('dras varje månad på samma datum')
  })

  it('längdvalet leder till rätt paket', () => {
    expect(planForLangd('dag')).toBe('all_day')
    expect(planForLangd('vecka')).toBe('all_week')
    expect(planForLangd('månad')).toBe('all_month')
    expect(planForLangd('kvartal')).toBe('all_quarter')
  })
})

describe('Dagspasset', () => {
  it('säger att den inte förnyas, och det är kortets viktigaste rad', () => {
    expect(INTERVALL_RAD.all_day).toContain('förnyas inte')
    expect(alltPrisSub('all_day')).toContain('inget dras igen')
  })

  it('bär prepositionen "för" och inte "i", eftersom den inte upprepas', () => {
    expect(langdPrisRad('all_day')).toBe('49 kr för ett dygn')
  })

  it('visar klockslag i statusraden, inte datum', () => {
    const slut = new Date('2026-09-22T21:40:00+02:00')
    expect(statusRadText('all_day', slut)).toContain('gäller till')
    expect(statusRadText('all_day', slut)).toContain('i dag')
  })

  it('får rubriken "från nu" i köpsteget, veckan "från i kväll"', () => {
    expect(KOPSTEG.rubrik('all_day')).toBe('Dagspasset, från nu')
    expect(KOPSTEG.rubrik('cv_week')).toBe('CV-paketet, från i kväll')
    expect(KOPSTEG.rubrik('all_week')).toBe('Hela paketet, från i kväll')
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
  it('är skillnaden mot Hela paketet, inte hela priset', () => {
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
  it('betalväggarna säger Skaffa, namnger paketet och bär pris och period', () => {
    for (const key of ALLA_NYCKLAR) {
      expect(knappText(key as PlanKey)).toMatch(new RegExp(`^Skaffa ${PLAN_BY_KEY[key].name}, ${PLAN_BY_KEY[key].amount} kr`))
    }
    expect(knappText('cv_week')).toBe('Skaffa CV-paketet, 79 kr i veckan')
  })

  it('korten säger Börja med, namnet, pris och period', () => {
    expect(borjaKnapp('cv')).toBe('Börja med CV-paketet, 79 kr i veckan')
    expect(borjaKnapp('test')).toBe('Börja med Träningspaketet, 79 kr i veckan')
    expect(borjaKnapp('allt')).toBe('Börja med Hela paketet, 99 kr i veckan')
    expect(borjaKnapp('allt', 'all_month')).toBe('Börja med Hela paketet, 149 kr i månaden')
  })

  it('namnger målet i längdvalet, inte rubriken', () => {
    expect(bytLangdKnapp('all_month')).toBe('Byt till Hela paketet, 149 kr i månaden')
  })

  it('spårvalets primär namnger paketet', () => {
    expect(SPARVAL.primar('cv')).toBe('Fortsätt med CV-paketet, 79 kr i veckan')
    expect(SPARVAL.primar('allt')).toBe('Fortsätt med Hela paketet, 99 kr i veckan')
    expect(SPARVAL.primar('allt', 'all_month')).toBe('Fortsätt med Hela paketet, 149 kr i månaden')
    expect(SPARVAL.primar('allt', 'all_day')).toBe('Fortsätt med Dagspasset, 49 kr, ett dygn')
  })
})

describe('förslagets skäl', () => {
  it('räknar ur samma tal som listan och skriver ut små tal', () => {
    const text = forslagSkal({ plan: 'cv_week', antal: 3, badaSparen: false, track: null })
    expect(text).toContain('tre gånger')
    expect(text).toContain('CV-paketet')
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

  it('föreslår Hela paketet när blockeringarna spänner båda spåren', () => {
    const text = forslagSkal({ plan: 'all_week', antal: 4, badaSparen: true, track: null })
    expect(text).toContain('Hela paketet')
    expect(text).toContain('båda')
  })

  it('erkänner öppet att förslaget är en gissning utan underlag', () => {
    const text = forslagSkal({ plan: 'all_week', antal: 0, badaSparen: false, track: null })
    expect(text).toContain('Vi vet inte')
  })
})

describe('copyreglerna', () => {
  const allaStrangar: string[] = [
    PR_H1,
    HERO.ingress,
    HERO.ingressFet,
    HERO.ingressMobil,
    GUIDE.ingress,
    SPARVAL.fraga,
    SPARVAL.under,
    KOPSTEG.under,
    ...Object.values(PAKET_RAD),
    ...Object.values(INTERVALL_RAD),
    ...Object.values(FEATURE_ETIKETT),
    ...Object.values(PAKET_PUNKTER).flat(),
    ...PAKET_IDS.flatMap((id) => {
      const k = PAKET_KORT[id]
      return [
        k.varde,
        k.vardeMobil,
        k.fordig,
        k.fotnot,
        ...k.rader.flatMap((r) => [r.rubrik, r.text, r.textMobil ?? '']),
      ]
    }),
    ...FUNKTIONER.kort.flatMap((k) => [k.sub, k.text, ...(k.steg ?? [])]),
    ...PAKET_IDS.flatMap((id) => [...GUIDE.listor[id].steg]),
    ...SPARVAL.kort.flatMap((k) => [k.rubrik, ...k.duFar.map((d) => d.fet + d.text)]),
    ...ALLA_NYCKLAR.map((k) => KOPSTEG.samtycke(k)),
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

  it('säger "personliga brev", aldrig bara "brev" som produktnamn i korten', () => {
    for (const id of PAKET_IDS) {
      for (const rad of PAKET_KORT[id].rader) {
        expect(rad.rubrik, rad.rubrik).not.toMatch(/(?<!ersonlig[at] )\b[Bb]rev\b/)
      }
    }
  })

  it('har H1 enligt specen 2026-09-22', () => {
    expect(PR_H1).toBe('En vecka som bär hela jobbsöket.')
  })
})
