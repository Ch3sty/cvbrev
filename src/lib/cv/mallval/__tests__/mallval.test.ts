import { describe, expect, it } from 'vitest'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { foreslagna, signalerUrCv } from '../forslag'
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

describe('merförsäljningen mot utbudet (utbudets avsnitt 6)', () => {
  it('utan foto: tre sidospalter', () => {
    const u = merforsaljningsUrval(MALL_KATALOG, MALL_KATALOG[0].id, 1, false)
    expect(u).toHaveLength(3)
    expect(u.every((m) => m.familj === 'sidospalt' && m.niva === 'premium')).toBe(true)
  })
  it('med foto: olika former, sidospalt med foto först', () => {
    const u = merforsaljningsUrval(MALL_KATALOG, MALL_KATALOG[0].id, 1, true)
    expect(u[0].familj).toBe('sidospalt')
    expect(u[0].foto).toBe(true)
    expect(new Set(u.map((m) => `${m.familj}:${m.foto}`)).size).toBe(3)
  })
})
