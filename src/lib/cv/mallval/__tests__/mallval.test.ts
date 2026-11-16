import { describe, expect, it } from 'vitest'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { FORESLAGNA, MERFORSALJNING_URVAL, foreslagna, signalerUrCv, type ForslagSkal } from '../forslag'
import { sektionForRubrik } from '../sektioner'
import { filnamn, valTillParams, valUrParams } from '../val'
import { uppsattningForTitel } from '../uppsattning'
import { merforsaljningsUrval } from '@/components/cv/Dokument/Merforsaljning'

const kort = (id: string, over: Partial<MallKort> = {}): MallKort => ({
  id,
  namn: id,
  niva: 'premium',
  familj: 'en-spalt',
  stil: '',
  kort: '',
  word: true,
  foto: false,
  accenter: ['#000', '#111', '#222', '#333'],
  bild: { liten: '', stor: '' },
  ...over,
})

const KATALOG: MallKort[] = [
  kort('a', { niva: 'gratis' }),
  kort('b', { niva: 'gratis', foto: true }),
  kort('panel', { familj: 'sidospalt', kort: 'Sidospalt och foto', foto: true }),
  kort('kolumn', { familj: 'marginal', kort: 'Rubriker i marginalen' }),
  kort('raster', { kort: 'Kompetenser i spalter' }),
  kort('konst', { familj: 'konstnarlig', word: false }),
]

const cv = (over: Partial<CVMetadata> = {}): CVMetadata => ({
  personalInfo: { fullName: 'Anna Berg', email: '' },
  experience: [{ position: 'Undersköterska', company: 'X', startDate: '2015', description: [] }],
  education: [],
  skills: [],
  ...over,
})

describe('föreslagna för dig', () => {
  it('sätter alltid en gratismall först', () => {
    for (const c of [cv(), cv({ certifications: [1, 2, 3].map((i) => ({ name: `i${i}`, issuer: '' })) })]) {
      const f = foreslagna(KATALOG, c)
      expect(KATALOG.find((m) => m.id === f.ids[0])?.niva).toBe('gratis')
      expect(f.ids).toHaveLength(3)
    }
  })
  it('många intyg ger intyg först och sidospalt', () => {
    const f = foreslagna(KATALOG, cv({ certifications: [1, 2, 3].map((i) => ({ name: `i${i}`, issuer: '' })) }))
    expect(f.skal).toBe('intyg')
    expect(f.ordning).toBe('intyg')
    expect(f.ids).toContain('panel')
  })
  it('kort erfarenhet ger utbildning först', () => {
    const f = foreslagna(KATALOG, cv({ experience: [{ position: 'x', company: 'y', startDate: '2025', endDate: '2026', description: [] }] }))
    expect(f.skal).toBe('kort')
    expect(f.ordning).toBe('utbildning')
  })
  it('räknar år ur perioder', () => {
    expect(signalerUrCv(cv()).erfarenhetAr).toBeGreaterThanOrEqual(10)
  })
})

describe('rubrik till avsnitt', () => {
  it.each([
    ['Arbetslivserfarenhet', 'erfarenhet'],
    ['Klinisk erfarenhet', 'erfarenhet'],
    ['Legitimation och behörigheter', 'intyg'],
    ['Kompetensområden', 'kompetenser'],
    ['System och verktyg', 'kompetenser'],
    ['Språk', 'sprak'],
    ['Profil', 'profil'],
    ['Utbildning', 'utbildning'],
  ])('%s är %s', (text, sektion) => {
    expect(sektionForRubrik(text)).toBe(sektion)
  })
  it('vanlig text är ingen rubrik', () => {
    expect(sektionForRubrik('Erik Lindberg')).toBeNull()
  })
})

describe('valen i adressen', () => {
  it('går fram och tillbaka och släpper skräp', () => {
    const q = valTillParams({ ordning: 'intyg', typsnitt: 'georgia', farg: 2, enSida: true, uppsattning: 'vard' })
    expect(valUrParams((n) => q.get(n))).toEqual({ ordning: 'intyg', typsnitt: 'georgia', farg: 2, enSida: true, uppsattning: 'vard' })
    expect(valUrParams((n) => ({ ordning: 'x', typsnitt: 'comic', farg: '9' } as Record<string, string>)[n])).toEqual({})
  })
  it('filnamnet', () => {
    expect(filnamn('Björk', 'Åsa Öberg', 'docx')).toBe('cv-bjork-asa-oberg.docx')
  })
  it('titel till uppsättning', () => {
    expect(uppsattningForTitel('Undersköterska')).toBe('vard')
    expect(uppsattningForTitel('Förskollärare')).toBe('skola')
    expect(uppsattningForTitel('ab')).toBeUndefined()
  })
})

describe('merförsäljningen', () => {
  it('visar aldrig nuvarande mall, aldrig konstnärliga och tre olika', () => {
    const u = merforsaljningsUrval(KATALOG, 'panel', 1, true)
    expect(u.map((m) => m.id)).not.toContain('panel')
    expect(u.map((m) => m.id)).not.toContain('konst')
    expect(u.every((m) => m.niva === 'premium')).toBe(true)
  })
})

import { UPPSATTNING_IDS, uppsattningForTitel as fullTitel } from '@/lib/cv/rubriker'

describe('artikelns korta ordlista mot rubrikmodellen', () => {
  it.each(['Undersköterska', 'Förskollärare', 'Systemutvecklare', 'Snickare', 'Butikssäljare', 'Redovisningsekonom', 'Handläggare', 'Lagerarbetare', 'Kock', 'Kundtjänst'])(
    '%s ger samma uppsättning som rubrikmodellen eller ingen',
    (t) => {
      const kort = uppsattningForTitel(t)
      if (kort) {
        expect(UPPSATTNING_IDS as readonly string[]).toContain(kort)
        expect(kort).toBe(fullTitel(t))
      }
    }
  )
})

import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'

describe('merförsäljningen och Föreslagna med 40 mallar (saas-lead 2026-11-16)', () => {
  const ids = (u: MallKort[]) => u.map((m) => m.id)
  const perId = new Map(MALL_KATALOG.map((m) => [m.id, m]))
  const SKAL: ForslagSkal[] = ['intyg', 'kort', 'system', 'lang', 'ingen']
  const intyg = { certifications: [1, 2, 3].map((i) => ({ name: `i${i}`, issuer: '' })) }
  const cvFor: Record<ForslagSkal, [CVMetadata, number]> = {
    intyg: [cv(intyg), 1],
    kort: [cv({ experience: [], education: [{ degree: 'Kandidat', institution: 'Uppsala universitet' }] }), 1],
    system: [cv({ skills: [{ category: 'System', skills: Array.from({ length: 10 }, (_, i) => `s${i}`) }] }), 1],
    lang: [cv(), 2],
    ingen: [cv(), 1],
  }

  it('Linne utan foto: Kalksten, Koppar, Skylt', () => {
    expect(ids(merforsaljningsUrval(MALL_KATALOG, 'linne', 1, false))).toEqual(['kalksten', 'koppar', 'skylt'])
  })
  it('Björk med foto: Sand, Koppar, Alm; Linne med foto: Kalksten, Koppar, Alm', () => {
    expect(ids(merforsaljningsUrval(MALL_KATALOG, 'bjork', 1, true))).toEqual(['sand', 'koppar', 'alm'])
    expect(ids(merforsaljningsUrval(MALL_KATALOG, 'linne', 1, true))).toEqual(['kalksten', 'koppar', 'alm'])
  })
  it('längre än en sida: Not på plats 3', () => {
    for (const [nu, foto] of [['linne', false], ['bjork', true], ['linne', true]] as const) {
      const u = merforsaljningsUrval(MALL_KATALOG, nu, 2, foto)
      expect(u).toHaveLength(3)
      expect(u[2].id).toBe('not')
    }
  })
  it('aldrig nuvarande, aldrig konstnärlig, bara Premium med Word; med foto bara fotomallar', () => {
    for (const nu of ['linne', 'bjork', 'kalksten', 'koppar', 'alm', 'sand']) {
      for (const foto of [false, true]) {
        for (const sidor of [1, 2]) {
          const u = merforsaljningsUrval(MALL_KATALOG, nu, sidor, foto)
          expect(u).toHaveLength(3)
          expect(ids(u)).not.toContain(nu)
          expect(u.every((m) => m.niva === 'premium' && m.word && m.familj !== 'konstnarlig')).toBe(true)
          if (foto) expect(u.filter((m) => m.id !== 'not').every((m) => m.foto)).toBe(true)
        }
      }
    }
  })
  it('varje id i tabellerna finns i katalogen', () => {
    const T = MERFORSALJNING_URVAL
    const alla = [...Object.values(FORESLAGNA).flatMap((x) => [...x.utanFoto, ...x.medFoto]), ...T.utanFoto, ...T.medFotoLinne, ...T.medFotoBjork, T.enSida, ...T.reserv.utanFoto, ...T.reserv.medFoto]
    for (const id of alla) expect(perId.get(id), id).toBeDefined()
  })
  it('Föreslagna: exakt en gratis på plats 1, Premium med Word på 2 och 3, för alla skäl med och utan foto', () => {
    for (const skal of SKAL) {
      for (const foto of [false, true]) {
        const [c, sidor] = cvFor[skal]
        const f = foreslagna(MALL_KATALOG, c, sidor, 3, foto)
        expect(f.skal, skal).toBe(skal)
        expect(f.ids, `${skal} ${foto}`).toEqual(foto ? [...FORESLAGNA[skal].medFoto] : [...FORESLAGNA[skal].utanFoto])
        const m = f.ids.map((id) => perId.get(id)!)
        expect(m[0].niva).toBe('gratis')
        expect(m.slice(1).every((x) => x.niva === 'premium' && x.word && x.familj !== 'konstnarlig')).toBe(true)
      }
    }
  })
  it('komplementregeln: högst en gemensam mall mellan Föreslagna och merförsäljningen', () => {
    for (const skal of SKAL) {
      for (const foto of [false, true]) {
        const [c, sidor] = cvFor[skal]
        const f = foreslagna(MALL_KATALOG, c, sidor, 3, foto)
        const u = ids(merforsaljningsUrval(MALL_KATALOG, f.ids[0], sidor, foto))
        expect(f.ids.filter((id) => u.includes(id)).length, `${skal} ${foto}`).toBeLessThanOrEqual(1)
      }
    }
  })
  it('tom erfarenhet med utbildning ger kort och utbildning först', () => {
    const f = foreslagna(MALL_KATALOG, cvFor.kort[0])
    expect(f.skal).toBe('kort')
    expect(f.ordning).toBe('utbildning')
  })
})

import { kortText } from '@/components/cv/Dokument/Merforsaljning'

describe('merförsäljningens kort utan foto (R2)', () => {
  it('lovar inget foto när CV:t saknar foto', () => {
    // Konstnärliga mallar visas aldrig i merförsäljningen.
    for (const m of MALL_KATALOG.filter((k) => k.foto && k.familj !== 'konstnarlig')) {
      expect(kortText(m, false)).not.toMatch(/foto|bild|\boch$/i)
      expect(kortText(m, true)).toBe(m.kort)
    }
  })
})
