// @vitest-environment node
/**
 * Analys-sidan när [antal] står kvar i CV:t (efterrättning A 2026-11-21):
 * inte "Inget drar ner just nu" utan fyndet Dina siffror, med sant plus.
 */
import { describe, expect, it } from 'vitest'
import { byggAnalysVy, fyndHref } from '../analysData'
import { arkForParam, tolkaPost } from '@/app/dashboard/skapa-cv/arbetslage'
import { kanonisktCv, medSiffror, plusForSiffror, raknaPoang } from '@/lib/cv/poang'
import { underlagUrRad } from '@/lib/cv/analys/cvAnalys'
import { medForslagUrAnalys, poangUrAnalys } from '@/lib/rum/cvRum'

const CV = {
  personalInfo: { fullName: 'Sara Lind', email: 'sara.lind@exempel.se', phone: '070-555 12 34', address: 'Uppsala', title: 'Butikssäljare' },
  summary:
    'Butikssäljare med vana av kassa, varuplock och kundmöten i en stor butik. Jag har hjälpt många kunder om dagen och vet hur man håller ordning på lager och hyllor när det är mycket att göra.',
  experience: [
    {
      position: 'Butikssäljare',
      company: 'ICA Kvantum',
      startDate: '2019',
      endDate: '2024',
      description: ['Hjälpte kunder att hitta rätt varor i butiken', 'Ansvarade för kassan under helger med [antal] kunder per pass', 'Fyllde på hyllor och tog emot leveranser'],
    },
  ],
  education: [{ degree: 'Gymnasieexamen', institution: 'Katedralskolan', startDate: '2014', endDate: '2017' }],
  skills: [{ category: 'Färdigheter', skills: ['Kassa', 'Kundservice', 'Truckkort', 'Lagerhantering', 'Varuplock', 'Merförsäljning'] }],
  languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
}

// Analysen som sparades före Ersätt: förslaget är redan infört i CV:t, så inget förslag återstår.
const JOBB = {
  id: 'jobb-siffror',
  completed_at: null,
  result: {
    roleBasedImprovements: [
      { roleTitle: 'Butikssäljare', company: 'ICA Kvantum', suggestedText: CV.experience[0].description.join('\n'), atsImpact: 4 },
    ],
    skillSuggestions: [],
    generalImprovements: [],
  } as Record<string, unknown>,
}

describe('samma "med"-tal på Ditt CV, Mallar och Analys', () => {
  const cvRad = { id: 'cv-1', structured_data: CV, cv_text: null, original_file_path: 'x', created_at: null }
  const rad = (r: Record<string, unknown>) => ({
    id: 'jobb', cv_id: 'cv-1', completed_at: null, display_name: null,
    struktur: r.structuredCV, profil: r.profileSummary, roller: r.roleBasedImprovements, kompetenser: r.skillSuggestions, allmant: r.generalImprovements,
  })

  it('bara siffrorna: med = i dag + siffrornas plus, överallt', () => {
    const vy = byggAnalysVy(JOBB, { structured_data: CV }, true)!
    const u = underlagUrRad(rad(JOBB.result), cvRad as never, true)
    expect(vy.poang.siffrorPlus).toBe(vy.fynd[0].plus)
    expect(vy.poang.medAllt).toBe(vy.poang.idag + vy.poang.siffrorPlus)
    expect(vy.poang.kategorier.reduce((s, k) => s + k.plusAllt, 0)).toBe(vy.poang.plusAllt)
    // Ditt CV och Mallar läser medForslagUrAnalys(underlag).
    expect(medForslagUrAnalys(u)).toBe(vy.poang.medAllt)
    expect(medForslagUrAnalys(u)! - poangUrAnalys(u)!).toBe(vy.poang.siffrorPlus)
  })

  it('förslag och siffror: summan räknas på CV:t och är densamma på båda sidorna', () => {
    const result = { ...JOBB.result, skillSuggestions: [{ skill: 'Butiksdata' }, { skill: 'Varuexponering' }, { skill: 'Kassahantering' }] }
    const cv = { ...CV, skills: [{ category: 'Färdigheter', skills: ['Kassa'] }] }
    const vy = byggAnalysVy({ ...JOBB, result }, { structured_data: cv }, true)!
    const u = underlagUrRad(rad(result), { ...cvRad, structured_data: cv } as never, true)
    expect(vy.poang.plus).toBeGreaterThan(0)
    expect(vy.poang.siffrorPlus).toBeGreaterThan(0)
    expect(vy.poang.medAllt).toBeGreaterThanOrEqual(vy.poang.medAlla)
    expect(medForslagUrAnalys(u)).toBe(vy.poang.medAllt)
  })
})

describe('länkarna till arbetsläget öppnar rätt roll', () => {
  // [antal] står bara i den tredje rollen (plats 2 i listan), som i klicktestet 2026-11-21.
  const tre = {
    ...CV,
    experience: [
      { position: 'Butikschef', company: 'Coop', startDate: '2024', endDate: 'pågående', description: ['Ledde ett lag på tolv personer', 'Ansvarade för schema och bemanning'] },
      { position: 'Kassaansvarig', company: 'Hemköp', startDate: '2022', endDate: '2024', description: ['Ansvarade för kassan', 'Utbildade nya kollegor'] },
      { position: 'Butikssäljare', company: 'ICA Kvantum', startDate: '2019', endDate: '2022', description: ['Hjälpte kunder', 'Ansvarade för kassan med [antal] kunder per pass'] },
    ],
  }

  it('Fyll i siffrorna: rollen där [antal] står, inte den första', () => {
    const vy = byggAnalysVy({ ...JOBB, result: {} }, { structured_data: tre }, false)!
    const f = vy.fynd.find((x) => x.typ === 'siffror')!
    expect(f.post).toBe(2)
    expect(f.roll).toEqual({ titel: 'Butikssäljare', foretag: 'ICA Kvantum' })
    expect(fyndHref('cv-1', f, 'linne')).toBe('/dashboard/skapa-cv?cv=cv-1&avsnitt=erfarenhet&post=2&mall=linne&fran=analys')
    // Arbetsläget tolkar adressen till just den posten.
    expect(arkForParam(tre as never, 'erfarenhet', tolkaPost('2'))).toEqual({ typ: 'post', sektion: 'erfarenhet', index: 2 })
  })

  it('Ändra texten på ett rollförslag: förslagets roll', () => {
    const jobb = {
      ...JOBB,
      result: {
        roleBasedImprovements: [
          { roleTitle: 'Kassaansvarig', company: 'Hemköp', currentText: 'Ansvarade för kassan', suggestedText: 'Ansvarade för kassan och dagskassan för tre kassor\nUtbildade fem nya kollegor i kassasystemet\nHöll ordning på växelkassan', atsImpact: 5 },
        ],
        skillSuggestions: [],
        generalImprovements: [],
      } as Record<string, unknown>,
    }
    const vy = byggAnalysVy(jobb, { structured_data: tre }, true)!
    const f = vy.fynd.find((x) => x.typ === 'roll')
    expect(f).toBeDefined()
    expect(f!.post).toBe(1)
    expect(fyndHref('cv-1', f!, 'linne')).toContain('&post=1&')
  })

  it('profil och kompetenser bär ingen post', () => {
    expect(fyndHref('cv-1', { sektion: 'profil' }, 'linne')).toBe('/dashboard/skapa-cv?cv=cv-1&avsnitt=profil&mall=linne&fran=analys')
  })
})

describe('fyndet Dina siffror', () => {
  for (const full of [false, true]) {
    it(`${full ? 'Premium' : 'gratis'}: ett öppet fynd med plus ur poängmodellen`, () => {
      const vy = byggAnalysVy(JOBB, { structured_data: CV }, full)!
      expect(vy.fynd).toHaveLength(1)
      const f = vy.fynd[0]
      expect(f).toMatchObject({ nyckel: 'siffror', typ: 'siffror', titel: 'Dina siffror', oppen: true, sektion: 'erfarenhet', rader: 1 })
      expect(f.roll).toEqual({ titel: 'Butikssäljare', foretag: 'ICA Kvantum' })
      const bas = kanonisktCv(CV)!
      expect(f.plus).toBe(plusForSiffror(bas))
      expect(f.plus).toBe(raknaPoang(medSiffror(bas)).total - vy.poang.idag)
      expect(f.plus).toBeGreaterThan(0)
    })
  }

  it('när siffrorna fyllts i finns inget fynd och poängen är den utlovade', () => {
    const fore = byggAnalysVy(JOBB, { structured_data: CV }, true)!
    const lovat = fore.poang.idag + fore.fynd[0].plus
    const ifyllt = JSON.parse(JSON.stringify(CV).replace('[antal]', '45'))
    const efter = byggAnalysVy(JOBB, { structured_data: ifyllt }, true)!
    expect(efter.fynd.find((x) => x.typ === 'siffror')).toBeUndefined()
    expect(efter.poang.idag).toBe(lovat)
  })

  it('bland andra fynd står siffrorna sist vid lika plus, och gratisnivåns öppna förslag först', () => {
    const jobb = {
      ...JOBB,
      result: {
        ...JOBB.result,
        skillSuggestions: [{ skill: 'Butiksdata' }, { skill: 'Visuell marknadsföring' }],
        roleBasedImprovements: [],
      },
    }
    const cv = { ...CV, skills: [{ category: 'Färdigheter', skills: ['Kassa'] }] }
    const vy = byggAnalysVy(jobb, { structured_data: cv }, false)!
    const typer = vy.fynd.map((x) => x.typ)
    expect(typer).toContain('siffror')
    expect(typer[0]).not.toBe('siffror')
    const i = typer.indexOf('siffror')
    for (const x of vy.fynd.slice(i + 1)) expect(x.plus).toBeLessThan(vy.fynd[i].plus)
  })
})
