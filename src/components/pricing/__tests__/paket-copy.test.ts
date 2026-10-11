/**
 * Vakttester för prissidans, köpstegets och kontosidans strängar
 * (copy-premium 2026-10-11, spec-rummen 17.3 och 17.4).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs. Testerna vaktar tre
 * saker: att inget val av ett osålt paket smiter in igen, att talen räknas
 * ur PLANS och TEMPLATE_COUNT och aldrig står fasta, och skrivregeln
 * (fulla namnet eller Premium, knappen "Köp Premium, 149 kr i månaden",
 * inga förbjudna ord).
 */

import { describe, expect, it } from 'vitest'

import { PLANS, PLAN_BY_KEY, SALD_PLAN, kopKnapp, type PlanKey } from '@/lib/plans/plans'
import { ALLA_FEATURES } from '@/lib/access/features'
import {
  ALLT_LANGDER,
  FEATURE_ETIKETT,
  FORTROENDE,
  FUNKTIONER,
  GRATIS,
  GUIDE,
  HERO,
  INTERVALL_RAD,
  KOPBEKRAFTELSE,
  KOPSTEG,
  KONTO,
  PAKETBYTE,
  PAKET_IDS,
  PAKET_KORT,
  PAKET_PUNKTER,
  PAKET_RAD,
  PR_H1,
  SPARVAL,
  borjaKnapp,
  bytLangdKnapp,
  forslagKnapp,
  forslagRubrik,
  forslagSkal,
  gangerText,
  knappText,
  langdPrisRad,
  planForLangd,
  statusRadText,
  uppsagdStatusText,
} from '../paket-copy'
import {
  COMPARISON,
  FREE_HIGHLIGHTS,
  GRATIS_RAD,
  JAMFORELSE_KOLUMNER,
  PRISER_FAQ_ITEMS,
  PRISER_FAQ_RUBRIK,
  PRISER_META,
} from '@/app/(public)/priser/components/priser-data'
import { prisSchema } from '@/app/(public)/priser/components/priser-schema'

const ALLA_NYCKLAR = PLANS.map((p) => p.key)
const KNAPP = 'Köp Premium, 149 kr i månaden'

describe('ett paket säljs', () => {
  it('kortet, längderna och planen pekar alla på månaden', () => {
    expect(PAKET_IDS).toEqual(['allt'])
    expect(ALLT_LANGDER.map((l) => l.plan)).toEqual([SALD_PLAN])
    for (const langd of ['dag', 'vecka', 'månad', 'kvartal'] as const) {
      expect(planForLangd(langd), langd).toBe('all_month')
    }
  })

  it('kortet bär fulla namnet, förklaringsraden och det som ingår ur PLANS', () => {
    const kort = PAKET_KORT.allt
    expect(kort.namn).toBe('Jobbcoach Premium')
    expect(kort.beskrivning).toBe('CV, personliga brev, tester, jobbmatchning och Jobbcoachen')
    expect(kort.ingar.length).toBeGreaterThanOrEqual(4)
    for (const rad of kort.ingar) expect(PLAN_BY_KEY.all_month.highlights).toContain(rad)
    expect(kort.prisrad).toBe('149 kr i månaden, säg upp när du vill.')
  })

  it('alla funktionskort ingår i Premium och säger vad gratis ger', () => {
    expect(FUNKTIONER.kort).toHaveLength(5)
    for (const k of FUNKTIONER.kort) {
      expect(k.ingar, k.id).toEqual(['allt'])
      expect(k.sub, k.id).toMatch(/^Ingår i Premium\. Gratis: /)
    }
    // FunktionerSida slår upp korten per id; de får inte byta namn.
    expect(FUNKTIONER.kort.map((k) => k.id)).toEqual([
      'cv-analys',
      'personliga-brev',
      'rekryteringstester',
      'matchade-jobb',
      'jobbcoachen',
    ])
  })

  it('har en guidelista och en etikett per feature', () => {
    expect(GUIDE.listor.allt.steg.length).toBeGreaterThanOrEqual(8)
    for (const feature of ALLA_FEATURES) expect(FEATURE_ETIKETT[feature], feature).toBeTruthy()
  })
})

describe('prissidan', () => {
  it('H1, förklaringsraden och ingressen enligt copy-premium', () => {
    expect(HERO.h1).toBe('Jobbcoach Premium, 149 kr i månaden')
    expect(PR_H1).toBe(HERO.h1)
    expect(HERO.rad).toBe('CV, personliga brev, tester, jobbmatchning och Jobbcoachen')
    expect(HERO.ingress).toBe(
      'Allt är öppet från första minuten. Ingen bindningstid, du säger upp med ett klick.'
    )
  })

  it('title och description håller on-page-standarden', () => {
    expect(PRISER_META.title).toBe('Priser: Jobbcoach Premium, 149 kr i månaden | Jobbcoach.ai')
    expect(PRISER_META.title.length).toBeLessThanOrEqual(60)
    expect(PRISER_META.description).toBe(
      'Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill.'
    )
    expect(PRISER_META.description.length).toBe(148)
    expect(PRISER_META.url).toBe('https://www.jobbcoach.ai/priser')
  })

  it('jämförelsen har två kolumner, gratis och Premium', () => {
    expect(JAMFORELSE_KOLUMNER.gratis).toBe('Gratis')
    expect(JAMFORELSE_KOLUMNER.premium).toBe('Premium')
    for (const grupp of COMPARISON) {
      for (const rad of grupp.rows) {
        expect(Object.keys(rad).sort(), rad.label).toEqual(
          ['free', 'label', 'premium', ...(rad.sub ? ['sub'] : [])].sort()
        )
      }
    }
  })

  it('FAQ:n frågar inte om vecka, byte mellan paket eller mellanskillnad', () => {
    expect(PRISER_FAQ_RUBRIK).toBe('Fler frågor om priset?')
    for (const f of PRISER_FAQ_ITEMS) {
      const t = `${f.q} ${f.a}`
      expect(t, f.id).not.toMatch(/veck|mellanskillnad|byt(a|er)? paket|CV-paketet|Träningspaketet/i)
    }
  })

  it('gratisnivån lovar bara det som är sant i båda gaterna (spec-rummen 23.3, 23.7 b)', () => {
    expect(FREE_HIGHLIGHTS).toContain('En nivåmätning i testerna med genomgång, och ett första träningspass')
    expect(GRATIS_RAD).toBe(
      '3 mallar, en CV-analys, ett personligt brev och en nivåmätning i testerna ingår utan att betala.'
    )
    const tester = COMPARISON.find((g) => g.title === 'Rekryteringstester')!
    const matning = tester.rows.find((r) => r.label === 'Nivåmätning och första passet')!
    expect(matning.sub).toBe('matrislogik, verbalt, numeriskt, personlighet')
    expect(matning.free.text).toBe('En gång, med genomgång')
    expect(matning.premium.text).toBe('Pass varje dag, utan tak')
    expect(tester.rows.find((r) => r.label === 'Förklaring efter varje fråga')!.free.text).toBe('Det du har gjort')
    const sist = tester.rows[tester.rows.length - 1]
    expect(sist.label).toBe('Riktade pass och generalrepetition')
    expect(sist.free.ton).toBe('nej')
    expect(sist.premium.text).toBe('Ingår')
    expect(PRISER_FAQ_ITEMS.find((f) => f.id === 'borja-gratis')!.a).toContain('och testernas nivåmätning fungerar')
    const texter = [
      ...FREE_HIGHLIGHTS,
      GRATIS_RAD,
      ...COMPARISON.flatMap((g) => g.rows.flatMap((r) => [r.label, r.sub ?? '', r.free.text, r.premium.text])),
      ...PRISER_FAQ_ITEMS.flatMap((f) => [f.q, f.a]),
      ...GRATIS.delar.map((d) => d.text),
      ...FUNKTIONER.kort.map((k) => k.sub),
      SPARVAL.fotnot,
    ]
    for (const t of texter) {
      expect(t, t).not.toMatch(/dygn|varje dag gratis|alltid gratis|Grundnivån är gratis/i)
    }
  })

  it('FAQ och hjälpredan enligt copy-vag5 6.1', () => {
    expect(PRISER_FAQ_ITEMS.find((f) => f.id === 'vad-ingar')!.q).toBe('Vad ingår i Jobbcoach Premium?')
    expect(PRISER_FAQ_ITEMS.find((f) => f.id === 'nar-manaden-ar-slut')!.a).toMatch(/Ingen förnyelse i smyg\.$/)
    expect(GUIDE.h2).toBe('Hjälpredan Kom igång tar dig igenom allt i rätt ordning')
    expect(GUIDE.ingress).toMatch(
      /Dagen innan månaden förnyas mejlar vi vad du gjort, så att du kan säga upp med ett klick om du är klar\.$/
    )
  })

  it('schemat: Product med AggregateOffer, ett erbjudande, inga betyg', () => {
    const s = prisSchema()
    expect(s['@type']).toBe('Product')
    expect(s.name).toBe('Jobbcoach Premium')
    expect(s.offers['@type']).toBe('AggregateOffer')
    expect(s.offers.offerCount).toBe(1)
    expect(s.offers.lowPrice).toBe(PLAN_BY_KEY.all_month.amount)
    expect(s.offers.highPrice).toBe(PLAN_BY_KEY.all_month.amount)
    expect(s.offers.priceCurrency).toBe('SEK')
    expect(s.offers.offers).toHaveLength(1)
    expect(s.offers.offers[0].price).toBe(PLAN_BY_KEY.all_month.amount)
    expect(s.offers.offers[0].name).toBe('Jobbcoach Premium, en månad')
    const json = JSON.stringify(s)
    expect(json).not.toMatch(/aggregateRating|review/i)
  })
})

describe('knapparna', () => {
  it('säger "Köp Premium, 149 kr i månaden" överallt, under 30 tecken', () => {
    const knappar = [
      PAKET_KORT.allt.knapp,
      borjaKnapp(),
      borjaKnapp('allt', 'all_week'),
      SPARVAL.primar('allt'),
      KONTO.bytTillAllt,
      KONTO.bytSpar('cv_week'),
      KONTO.bytLangd('all_quarter'),
      bytLangdKnapp('all_day'),
      ...ALLA_NYCKLAR.map((k) => knappText(k as PlanKey)),
      ...ALLA_NYCKLAR.map((k) => forslagKnapp(k as PlanKey)),
    ]
    for (const k of knappar) {
      expect(k).toBe(KNAPP)
      expect(k).toBe(kopKnapp())
    }
    expect(KNAPP.length).toBeLessThan(30)
  })

  it('köpstegets knapp bär beloppet ur PLANS', () => {
    expect(KOPSTEG.primar()).toBe(`Till betalning, ${PLAN_BY_KEY.all_month.amount} kr`)
    expect(KOPSTEG.primar('cv_week')).toBe(KOPSTEG.primar('all_month'))
  })

  it('förslagets rubrik bär fulla namnet med pris, bara det som säljs', () => {
    for (const k of ALLA_NYCKLAR) {
      expect(forslagRubrik(k as PlanKey)).toBe('Vi föreslår Jobbcoach Premium, 149 kr i månaden')
    }
  })
})

describe('köpsteget', () => {
  it('rubriken är fulla namnet, prisraden kort form', () => {
    expect(KOPSTEG.rubrik()).toBe('Jobbcoach Premium')
    expect(KOPSTEG.rubrik('cv_week')).toBe('Jobbcoach Premium')
    expect(KOPSTEG.prisrad()).toBe('149 kr i månaden, säg upp när du vill.')
  })

  it('samtycket säger att innehållet startar direkt och att ångerrätten inte gäller', () => {
    for (const key of ALLA_NYCKLAR) {
      const text = KOPSTEG.samtycke(key)
      expect(text, key).toContain('startar direkt')
      expect(text, key).toContain('ångerrätten')
    }
    expect(KOPSTEG.samtycke('all_month')).toContain(
      `${PLAN_BY_KEY.all_month.amount} kr dras varje månad på samma datum`
    )
  })

  it('ett osålt paket ger ett fel som säger vad som säljs', () => {
    expect(KOPSTEG.saljsInte).toContain('Jobbcoach Premium, 149 kr i månaden')
    expect(KOPSTEG.saljsInte).not.toMatch(/klart/i)
  })
})

describe('statusraderna på kontosidan', () => {
  const nov = new Date('2026-11-11T10:00:00Z')

  it('Premium per månad: namn, pris och nästa dragning', () => {
    expect(statusRadText('all_month', nov)).toBe(
      'Jobbcoach Premium, 149 kr i månaden. Nästa dragning 11 november.'
    )
  })

  it('uppsagt: gäller till datumet, förnyas inte', () => {
    expect(uppsagdStatusText('all_month', nov)).toBe(
      'Jobbcoach Premium, uppsagt. Gäller till 11 november, förnyas inte.'
    )
  })

  it('befintliga vecko- och spårkunder får sitt paket rätt namngivet', () => {
    const okt = new Date('2026-10-17T10:00:00Z')
    expect(statusRadText('test_week', okt)).toBe('Träningspaketet, 79 kr i veckan, förnyas 17 oktober')
    expect(statusRadText('cv_week', okt)).toMatch(/^CV-paketet, .*förnyas 17 oktober$/)
    expect(statusRadText('all_week', okt)).toBe('Jobbcoach Premium, 99 kr i veckan. Nästa dragning 17 oktober.')
    expect(uppsagdStatusText('cv_week', okt)).toBe('CV-paketet, uppsagt. Gäller till 17 oktober, förnyas inte.')
  })

  it('Dagspasset visar klockslag, inte datum', () => {
    const slut = new Date('2026-09-22T21:40:00+02:00')
    expect(statusRadText('all_day', slut)).toBe('Dagspasset, gäller till 21:40 i dag')
  })

  it('rubriken heter Prenumeration och kortet säger Du har Premium', () => {
    expect(KONTO.paketRubrik).toBe('Prenumeration')
    expect(KONTO.dittPaket).toBe('Du har Premium')
  })

  it('bytet för en spårkund säger vad som dras och att veckan räknas av', () => {
    expect(KONTO.bytRubrik).toBe('Jobbcoach Premium')
    // copy-vag5 6.1, och sant mot create-upgrade-session: proration och ny
    // period från bytesdagen.
    expect(KONTO.bytPrisrad).toBe(
      '149 kr i månaden. Det du redan har betalat för resten av veckan drar vi av, och månaden räknas från i dag.'
    )
    expect(KONTO.bytText('test_week')).toContain('CV-mallar')
    expect(KONTO.bytText('cv_week')).toContain('rekryteringstester')
  })
})

describe('köpbekräftelsen', () => {
  it('nästa dragning och beloppet', () => {
    expect(KOPBEKRAFTELSE.lopande('all_month', '11 november')).toBe(
      'Nästa dragning 11 november, 149 kr. Säg upp när du vill i ditt konto.'
    )
  })
})

describe('bytet från betalväggen', () => {
  it('klart namnger Premium, redan säger att kunden har det', () => {
    expect(PAKETBYTE.klart('all_month')).toBe('Du har nu Jobbcoach Premium')
    expect(PAKETBYTE.redanPaket).toBe('Du har redan Jobbcoach Premium.')
  })

  it('spårkunden i köpsteget får sitt eget paket namngivet, inte Premium', () => {
    expect(KOPSTEG.harSpar('Träningspaketet')).toBe(
      'Du har Träningspaketet. Byt till Premium på prenumerationssidan.'
    )
    expect(KOPSTEG.prenumerationHref).toBe('/dashboard/profil/prenumeration')
  })
})

describe('förslagets skäl (D28)', () => {
  it('räknar ur samma tal som listan och skriver ut små tal', () => {
    const text = forslagSkal({ antal: 3, badaSparen: false, track: null })
    expect(text).toContain('tre gånger')
    expect(text).toContain('Premium')
  })

  it('böjer singular rätt och skriver tal över nio med siffra', () => {
    expect(forslagSkal({ antal: 1, badaSparen: false, track: null })).toContain('en gång')
    expect(forslagSkal({ antal: 12, badaSparen: false, track: null })).toContain('12 gånger')
  })

  it('säger båda när blockeringarna spänner båda delarna', () => {
    const text = forslagSkal({ antal: 4, badaSparen: true, track: null })
    expect(text).toContain('båda')
    expect(text).toContain('Premium')
  })

  it('erkänner öppet att förslaget är en gissning utan underlag', () => {
    expect(forslagSkal({ antal: 0, badaSparen: false, track: null })).toContain('Vi vet inte')
  })
})

describe('talen räknas, de skrivs aldrig', () => {
  it('Dagspassets prisrad bär "för", längden står kvar för befintliga köp', () => {
    expect(langdPrisRad('all_day')).toBe(`${PLAN_BY_KEY.all_day.amount} kr för 24 timmar`)
    expect(langdPrisRad('all_month')).toBe(`${PLAN_BY_KEY.all_month.amount} kr i månaden`)
  })

  it('antalsraden förkortar korrekt på svenska', () => {
    expect(gangerText(1)).toBe('1 gg')
    expect(gangerText(2)).toBe('2 ggr')
  })

  it('har en rad, tre punkter och en intervallrad per nyckel, sålda och osålda', () => {
    for (const key of ALLA_NYCKLAR) {
      expect(PAKET_RAD[key], key).toBeTruthy()
      expect(PAKET_PUNKTER[key], key).toHaveLength(3)
      expect(INTERVALL_RAD[key], key).toBeTruthy()
    }
  })
})

describe('skrivregeln (copy-premium avsnitt 2 och 7)', () => {
  const allaStrangar: string[] = [
    HERO.h1,
    HERO.rad,
    HERO.ingress,
    HERO.scenAlt,
    GUIDE.h2,
    GUIDE.ingress,
    ...GUIDE.listor.allt.steg,
    ...FUNKTIONER.kort.flatMap((k) => [k.sub, k.text, k.rubrik, ...(k.steg ?? [])]),
    ...FORTROENDE.flatMap((f) => [f.rubrik, f.text]),
    ...Object.values(PAKET_KORT.allt).flat().filter((v): v is string => typeof v === 'string'),
    ...Object.values(PAKET_RAD),
    ...Object.values(PAKET_PUNKTER).flat(),
    ...Object.values(INTERVALL_RAD),
    ...Object.values(FEATURE_ETIKETT),
    KOPSTEG.rubrik(),
    KOPSTEG.prisrad(),
    KOPSTEG.under,
    KOPSTEG.farEtikett,
    KOPSTEG.saljsInte,
    KOPSTEG.redan,
    KOPSTEG.harSpar('CV-paketet'),
    KOPSTEG.tillPrenumeration,
    ...ALLA_NYCKLAR.map((k) => KOPSTEG.samtycke(k)),
    KONTO.paketRubrik,
    KONTO.dittPaket,
    KONTO.ingarIAllt,
    KONTO.bytPrisrad,
    KONTO.uppsagdNot,
    KONTO.bytText('cv_week'),
    KONTO.bytText('test_week'),
    PAKETBYTE.arbetar,
    PAKETBYTE.redanPaket,
    PAKETBYTE.fel,
    PAKETBYTE.saljsInte,
    PAKETBYTE.vidFornyelse('nedgradering'),
    PAKETBYTE.vidFornyelse('langd'),
    KOPBEKRAFTELSE.lopande('all_month', '11 november'),
    forslagSkal({ antal: 0, badaSparen: false, track: 'cv' }),
    forslagSkal({ antal: 0, badaSparen: false, track: 'tester' }),
    forslagSkal({ antal: 2, badaSparen: true, track: null }),
    PRISER_META.title,
    PRISER_META.description,
    PRISER_META.ogSubtitle,
    ...PRISER_FAQ_ITEMS.flatMap((f) => [f.q, f.a]),
  ]

  it('inga talstreck', () => {
    for (const s of allaStrangar) expect(s, s).not.toMatch(/[—–]/)
  })

  it('inga förbjudna ord om flera paket eller gamla namn', () => {
    const forbjudet =
      /Hela paketet|hela paketet|paketen|alla tre|Byt paket|ett paket|Uppgradera|Skaffa|Premiumpaketet|Premium-[a-zåäö]|Jobbcoachen Premium|Jobbcoach\.ai Premium|149 kr\/mån|per månad|Lås upp/
    for (const s of allaStrangar) expect(s, s).not.toMatch(forbjudet)
  })

  it('Premium skrivs med stort P om produkten', () => {
    for (const s of allaStrangar) expect(s, s).not.toMatch(/\bpremium\b/)
  })

  it('fulla namnet står en gång i kortets egna rader', () => {
    const kort = PAKET_KORT.allt
    const rader = [kort.beskrivning, kort.listEtikett, kort.prisrad, kort.knapp, kort.fotnot, ...kort.ingar]
    for (const r of rader) expect(r, r).not.toContain('Jobbcoach Premium')
    expect(kort.namn).toBe('Jobbcoach Premium')
  })
})
