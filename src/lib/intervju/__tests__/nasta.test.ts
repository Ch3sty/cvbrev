/**
 * Rangordningen av Nästa handling på Inför intervjun och hemskärmen
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 2 och 3), och
 * frågornas publika spärr.
 */

import { describe, expect, it } from 'vitest'
import { FRAGA_ORDNING, PUBLIKA_FRAGOR, arFragaId, arPublikFraga } from '@/components/artiklar/intervjuprov/fragor'
import {
  arHogstaBetyg,
  dagEtikett,
  hemIntervjuSteg,
  imorgonFraga,
  rekommenderadFraga,
  saknadesFras,
  saknadesI,
  valjHubbHandling,
  type ProvSammanfattning,
} from '../nasta'
import { NASTA } from '@/app/dashboard/intervju/infor-intervjun-copy'
import { saknadDel, starUtfall } from '@/components/jobb3/intervju/text'

const NU = new Date('2026-09-24T12:00:00+02:00')

function prov(question: ProvSammanfattning['question'], level: number, timmarSedan = 1): ProvSammanfattning {
  return {
    token: `${question}-${level}-${timmarSedan}`,
    question,
    level,
    missingKind: 'planen',
    createdAt: new Date(NU.getTime() - timmarSedan * 3600000).toISOString(),
  }
}

describe('frågorna', () => {
  it('sju frågor, två publika: styrkor och star', () => {
    expect(FRAGA_ORDNING).toEqual(['beratta', 'styrkor', 'varfor_vi', 'varfor_jobbet', 'star', 'konflikt', 'misstag'])
    expect(PUBLIKA_FRAGOR).toEqual(['styrkor', 'star'])
    expect(arPublikFraga('konflikt')).toBe(false)
    expect(arFragaId('konflikt')).toBe(true)
    expect(arFragaId('toString')).toBe(false)
  })
})

describe('hubbens rangordning', () => {
  const bas = { kvotKvar: true, harSmakprov: false, harProfil: false }

  it('inga prov alls: forstaGang', () => {
    expect(valjHubbHandling({ ...bas, prov: [] })).toEqual({ kind: 'forstaGang' })
  })

  it('1. senaste provet 3 eller lägre och kvot finns: omskrivning', () => {
    const p = prov('styrkor', 3)
    expect(valjHubbHandling({ ...bas, prov: [p] })).toEqual({ kind: 'omskrivning', prov: p })
  })

  it('1b. samma prov men kvoten slut: lasIgen (designens mobilskärm)', () => {
    const p = prov('styrkor', 3)
    expect(valjHubbHandling({ ...bas, kvotKvar: false, harSmakprov: true, prov: [p] })).toEqual({ kind: 'lasIgen', prov: p })
  })

  it('2. senaste provet 4 eller mer: första ogjorda frågan i FRAGOR-ordning', () => {
    const lista = [prov('styrkor', 4), prov('beratta', 2, 30)]
    expect(valjHubbHandling({ ...bas, prov: lista })).toEqual({ kind: 'nyFraga', fraga: 'varfor_vi' })
  })

  it('3. alla frågor gjorda, smakprov utan riktig profil: helaTestet', () => {
    const lista = FRAGA_ORDNING.map((f) => prov(f, 4))
    expect(valjHubbHandling({ ...bas, harSmakprov: true, prov: lista })).toEqual({ kind: 'helaTestet' })
  })

  it('3b. kvoten slut och senaste på 4: helaTestet går före lasIgen', () => {
    expect(valjHubbHandling({ ...bas, kvotKvar: false, harSmakprov: true, prov: [prov('styrkor', 4)] })).toEqual({
      kind: 'helaTestet',
    })
  })

  it('4. kvoten slut och inget annat gäller: lasIgen', () => {
    const p = prov('styrkor', 5)
    expect(valjHubbHandling({ ...bas, kvotKvar: false, harProfil: true, prov: [p] })).toEqual({ kind: 'lasIgen', prov: p })
  })

  it('annars den rekommenderade: lägst bästa nivå', () => {
    const lista = FRAGA_ORDNING.map((f) => prov(f, f === 'konflikt' ? 4 : 5))
    expect(valjHubbHandling({ ...bas, harProfil: true, prov: [prov('styrkor', 5), ...lista] })).toEqual({
      kind: 'nyFraga',
      fraga: 'konflikt',
    })
  })

  it('rekommendationen: första ogjorda, annars lägst bästa nivå', () => {
    expect(rekommenderadFraga([])).toBe('beratta')
    expect(rekommenderadFraga([prov('beratta', 5)])).toBe('styrkor')
  })
})

describe('högsta betyg och kvoten slut (Jobbsöket omgång 2, byggspecen 4.4)', () => {
  it('arHogstaBetyg: sant för lasIgen med 5 av 5, också med missingKind kvar på raden', () => {
    expect(arHogstaBetyg({ kind: 'lasIgen', prov: prov('star', 5) })).toBe(true)
    expect(arHogstaBetyg({ kind: 'lasIgen', prov: { ...prov('star', 5), missingKind: '' } })).toBe(true)
  })

  it('arHogstaBetyg: falskt för lasIgen med 3 och 4, och för omskrivning', () => {
    expect(arHogstaBetyg({ kind: 'lasIgen', prov: prov('star', 3) })).toBe(false)
    expect(arHogstaBetyg({ kind: 'lasIgen', prov: prov('star', 4) })).toBe(false)
    expect(arHogstaBetyg({ kind: 'omskrivning', prov: prov('star', 5) })).toBe(false)
    expect(arHogstaBetyg({ kind: 'omskrivning', prov: prov('star', 3) })).toBe(false)
  })

  it('imorgonFraga: första ogjorda frågan', () => {
    expect(imorgonFraga({ prov: [prov('beratta', 5)], kvotKvar: false, harSmakprov: false, harProfil: false })).toBe('styrkor')
    expect(imorgonFraga({ prov: [prov('star', 5), prov('beratta', 4, 30)], kvotKvar: false, harSmakprov: false, harProfil: false })).toBe('styrkor')
  })

  const allaGjorda = (lagst: ProvSammanfattning['question']) =>
    FRAGA_ORDNING.map((f, i) => prov(f, f === lagst ? 4 : 5, i + 1))

  it('imorgonFraga: null när nästa handling är helaTestet', () => {
    expect(imorgonFraga({ prov: allaGjorda('konflikt'), kvotKvar: false, harSmakprov: true, harProfil: false })).toBeNull()
  })

  it('imorgonFraga: lägst bästa nivå när alla är gjorda', () => {
    expect(imorgonFraga({ prov: allaGjorda('konflikt'), kvotKvar: false, harSmakprov: false, harProfil: false })).toBe('konflikt')
  })
})

describe('hemskärmens steg', () => {
  const aldrig = () => false

  it('prov på 3 som är över ett dygn gammalt: interview-rewrite', () => {
    const p = prov('styrkor', 3, 25)
    expect(hemIntervjuSteg({ antalProv: 1, senaste: p, smakprovToken: null, harProfil: false }, NU.getTime(), aldrig)).toEqual({
      kind: 'interview-rewrite',
      prov: p,
    })
  })

  it('samma prov yngre än ett dygn: inget steg', () => {
    const p = prov('styrkor', 3, 5)
    expect(hemIntervjuSteg({ antalProv: 1, senaste: p, smakprovToken: null, harProfil: false }, NU.getTime(), aldrig)).toBeNull()
  })

  it('avfärdad omskrivning: nästa i rangordningen, personality-full', () => {
    const p = prov('styrkor', 3, 25)
    const i = { antalProv: 1, senaste: p, smakprovToken: 'tok', harProfil: false }
    expect(hemIntervjuSteg(i, NU.getTime(), (k) => k === 'interview-rewrite')).toEqual({
      kind: 'personality-full',
      smakprovToken: 'tok',
    })
  })

  it('smakprov men riktig profil finns: inget steg', () => {
    expect(hemIntervjuSteg({ antalProv: 0, senaste: null, smakprovToken: 'tok', harProfil: true }, NU.getTime(), aldrig)).toBeNull()
  })
})

describe('formuleringarna', () => {
  it('det som saknades', () => {
    expect(saknadesFras('planen', 'styrkor')).toBe('planen för svagheten')
    expect(saknadesFras('planen', 'misstag')).toBe('planen')
    expect(saknadesFras('kopplingen', 'varfor_vi')).toBe('kopplingen till rollen')
  })

})

describe('det som saknades, samma regel i hubben och bedömningen (klicktestet 2026-11-21)', () => {
  const nasta = (p: ProvSammanfattning) => NASTA.omskrivning.text(p.level, 'i dag', saknadesI(p), p.question)

  it('alla fyra med (5 av 5): inget saknades, även med missing_kind kvar på raden', () => {
    const p = { ...prov('star', 5), missingKind: 'resultatet' }
    expect(saknadesI(p)).toBeNull()
    expect(starUtfall(saknadDel(saknadesI(p))).map((d) => d.under)).toEqual(['Fanns med', 'Fanns med', 'Fanns med', 'Fanns med'])
    expect(nasta(p)).toBe('Du fick 5 av 5 i dag, med alla fyra delarna på plats.')
    expect(nasta(p)).not.toContain('saknades')
  })

  it('en del saknas (3 av 5): resultatet pekas ut, brickan R säger Saknades', () => {
    const p = { ...prov('star', 3), missingKind: 'resultatet' }
    expect(saknadesI(p)).toBe('resultatet')
    expect(starUtfall(saknadDel(saknadesI(p))).find((d) => d.bokstav === 'R')?.under).toBe('Saknades')
    expect(nasta(p)).toBe('Du fick 3 av 5 i dag, och det var resultatet som saknades. Skriv om med resultatet, så ser du om nivån lyfter.')
  })

  it('fråga utan STAR på 5 av 5: alla delarna, inte fyra', () => {
    expect(nasta({ ...prov('styrkor', 5), missingKind: 'planen' })).toBe('Du fick 5 av 5 i dag, med alla delarna på plats.')
  })

  it('inget prov: inget saknades', () => {
    expect(saknadesI(null)).toBeNull()
    expect(saknadesI(undefined)).toBeNull()
    expect(starUtfall(saknadDel(saknadesI(null))).every((d) => !d.saknas)).toBe(true)
  })
})

describe('dagen', () => {
  it('i svensk tid', () => {
    expect(dagEtikett(NU.toISOString(), NU)).toBe('I dag')
    expect(dagEtikett(new Date(NU.getTime() - 86400000).toISOString(), NU)).toBe('I går')
    expect(dagEtikett('2026-09-20T10:00:00Z', NU)).toBe('20 september')
  })
})
