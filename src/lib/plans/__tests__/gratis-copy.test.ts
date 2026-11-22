/**
 * Den kanoniska gratisnivån (beslut om säljytorna 2026-11-15, avsnitt 0 och
 * byggordningen punkt 2). En källa, flera läsare: om en läsare börjar skriva
 * egen text, eller om en gräns i koden ändras, ska det brytas här.
 */
import { describe, expect, it } from 'vitest'

import {
  ANTAL_TESTTYPER,
  GRATIS_BREVFONSTER,
  GRATIS_CHATTFRAGOR,
  GRATIS_FAQ,
  GRATIS_LISTA,
  GRATIS_MALLRAD,
  GRATIS_MENING_KORT,
  GRATIS_MENING_LANG,
  GRATIS_MENING_LANG_DELAR,
  GRATIS_PASTAENDEN,
  GRATIS_TESTRAD_PROV,
  GRUNDNIVAN_ALLA_DAG,
  GRUNDNIVAN_RAD,
  TESTTYPER_ORD,
} from '../gratis-copy'
import { TEST_GROUPS } from '@/app/dashboard/tester/components/testCatalog'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import { TESTTAL } from '@/components/publikt/testtal'
import { GRATIS_KORT } from '@/components/artiklar/reklam/reklam-copy'
import { FREE_HIGHLIGHTS, GRATIS_RAD } from '@/app/(public)/priser/components/priser-data'
import { GRATIS } from '@/components/pricing/paket-copy'
import { KONTO_GRATIS, STEG3 } from '@/components/registrering/registrering-copy'

const ALLA = [GRUNDNIVAN_ALLA_DAG, GRUNDNIVAN_RAD, GRATIS_FAQ, ...GRATIS_LISTA, GRATIS_MENING_KORT, GRATIS_MENING_LANG, GRATIS_TESTRAD_PROV]

describe('gratisnivån, en källa', () => {
  it('räknar de kognitiva testtyperna som Alla tester visar', () => {
    const kognitiva = TEST_GROUPS.filter((g) => g.cognitive.length > 0).length
    expect(ANTAL_TESTTYPER).toBe(kognitiva)
    expect(ANTAL_TESTTYPER).toBe(8)
    expect(TESTTYPER_ORD).toBe('åtta')
  })

  it('talen stämmer mot kvottjänsten och påståendebanken', () => {
    expect(GRATIS_CHATTFRAGOR).toBe(FREE_CHAT_MESSAGES_PER_ACCOUNT)
    expect(LETTER_WINDOW_DAYS).toBe(7)
    expect(GRATIS_BREVFONSTER).toBe('var sjunde dag')
    expect(GRATIS_PASTAENDEN).toBe(TESTTAL.personlighetGrund.fragor)
  })

  it('listan är sex rader, tester först, och mallraden pekas ut', () => {
    expect(GRATIS_LISTA).toHaveLength(6)
    expect(GRATIS_LISTA[0]).toBe('Grundnivån i alla åtta testtyperna med ett test om dagen, personlighetstestet och förklaring efter varje uppgift')
    expect(GRATIS_LISTA[GRATIS_MALLRAD]).toBe('Två CV-mallar och en nedladdning')
    expect(GRATIS_LISTA[2]).toBe('CV-analysens läsbarhetspoäng och genomgång i sju delar, för varje CV')
    expect(GRATIS_LISTA[3]).toBe('Ett personligt brev var sjunde dag, och de två senaste går att ändra')
    expect(GRATIS_LISTA[4]).toBe('Tre matchade jobb, tio meddelanden till Jobbcoachen och ett intervjuprov om dagen')
    expect(GRATIS_LISTA[5]).toBe('Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet')
  })

  it('meningarna ordagrant enligt beslutet', () => {
    expect(GRATIS_MENING_LANG).toBe(
      'Utan att betala gör du grundnivån i alla åtta testtyperna, ett test om dagen, och personlighetstestet med 50 påståenden, får två CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev var sjunde dag där de två senaste går att ändra, tre matchade jobb, tio meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet. Inget kort behövs.'
    )
    expect(GRATIS_MENING_LANG_DELAR.map((d) => d.text).join('')).toBe(GRATIS_MENING_LANG)
    expect(GRATIS_MENING_KORT).toBe(
      'Ett grundnivåtest om dagen, två CV-mallar, CV-analysens läsbarhetspoäng för varje CV, ett personligt brev var sjunde dag, tre matchade jobb, tio meddelanden till Jobbcoachen och Sökta tjänster ingår utan att betala.'
    )
    expect(GRATIS_TESTRAD_PROV).toBe('Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto, ett test om dagen.')
    expect(GRATIS_FAQ).toBe(
      'Gratisnivån kräver inget kort: grundnivån i alla åtta testtyperna, ett test om dagen, och personlighetstestet, 2 CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev var sjunde dag, 3 matchade jobb, 10 meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet.'
    )
  })

  it('läsarna läser källan', () => {
    expect(GRATIS_KORT.rader).toBe(GRATIS_LISTA)
    expect(FREE_HIGHLIGHTS).toBe(GRATIS_LISTA)
    expect(GRATIS_RAD).toBe(GRATIS_MENING_KORT)
    expect(GRATIS.delar).toBe(GRATIS_MENING_LANG_DELAR)
    expect(KONTO_GRATIS.rader[0].namn).toBe('Rekryteringstesterna')
    expect(KONTO_GRATIS.rader[0].text).toBe('Grundnivån i alla åtta typerna, ett test om dagen, med genomgång av varje fråga.')
    expect(STEG3.forslag.tester.gratis).toEqual(['Grundnivån i alla åtta testtyperna, ett test om dagen', 'Genomgång av varje fråga', 'Personlighetstestet med 50 påståenden'])
    expect(STEG3.forslag.cv.gratis).toEqual([GRATIS_LISTA[1], GRATIS_LISTA[2]])
    expect(STEG3.forslag.brev.gratis).toEqual([GRATIS_LISTA[3], GRATIS_LISTA[2]])
  })

  it('husreglerna: inga talstreck, inga mittpunkter, aldrig obegränsat eller Nivåkollen', () => {
    for (const t of ALLA) {
      expect(t, t).not.toMatch(/[–—·]/)
      expect(t, t).not.toMatch(/obegränsat/i)
      expect(t, t).not.toMatch(/Nivåkoll/i)
      expect(t, t).not.toMatch(/i veckan/)
    }
  })
})
