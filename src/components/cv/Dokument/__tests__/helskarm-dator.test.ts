/**
 * Helskärmen och mallistan på datorn (ägarens fynd 2026-11-16): grupperna i
 * Alla-listan och helskärmens remsa, sidans bredd per skärm och
 * formatbrickornas etikett.
 */
import { describe, expect, it } from 'vitest'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { grupperaMallar } from '../grupper'
import { passarFilter, type Filter } from '../AllaArk'
import { sidbredd } from '../Helskarm'
import { formatTillagg } from '../Formatbrickor'
import { A4_KVOT } from '../matning'

const FORSLAG = [['linne', 'bjork', 'koppar'], ['koppar', 'antikva', 'fasad'], ['kalksten', 'stal', 'granit'], []]

describe('grupperaMallar', () => {
  for (const f of FORSLAG) {
    it(`Alla-arket: varje mall en gång, ingen tom grupp (föreslagna ${f.join(',') || 'inga'})`, () => {
      const g = grupperaMallar({ katalog: MALL_KATALOG, foreslagna: f })
      const ids = g.flatMap((x) => x.mallar.map((m) => m.id))
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.length).toBe(MALL_KATALOG.length)
      for (const x of g) expect(x.mallar.length).toBeGreaterThan(0)
    })
    it(`kolumnen: föreslagna står ovanför och upprepas inte (${f.join(',') || 'inga'})`, () => {
      const g = grupperaMallar({ katalog: MALL_KATALOG, foreslagna: f, utanForeslagna: true })
      const ids = g.flatMap((x) => x.mallar.map((m) => m.id))
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.length).toBe(MALL_KATALOG.length - f.length)
      for (const id of f) expect(ids).not.toContain(id)
      for (const x of g) expect(x.mallar.length).toBeGreaterThan(0)
    })
  }
  it('Koppar, Antikva och Fasad ligger under En spalt när de inte föreslås', () => {
    const g = grupperaMallar({ katalog: MALL_KATALOG, foreslagna: ['linne', 'bjork', 'kalksten'] })
    const enSpalt = g.find((x) => x.namn === 'En spalt')!
    expect(enSpalt.mallar.map((m) => m.id)).toEqual(expect.arrayContaining(['koppar', 'antikva', 'fasad']))
  })
  for (const filter of ['alla', 'gratis', 'word', 'foto', 'tva', 'enSida'] as Filter[]) {
    it(`filtret ${filter}: bara träffarna, ingen dubblett, ingen tom grupp`, () => {
      const traffar = MALL_KATALOG.filter((m) => passarFilter(m, filter))
      const g = grupperaMallar({ katalog: MALL_KATALOG, foreslagna: ['linne'], traffar, utanSok: filter === 'alla' })
      const ids = g.flatMap((x) => x.mallar.map((m) => m.id))
      expect(new Set(ids).size).toBe(ids.length)
      expect([...ids].sort()).toEqual(traffar.map((m) => m.id).sort())
      for (const x of g) expect(x.mallar.length).toBeGreaterThan(0)
    })
  }
  it('Word-filtret ger bara mallar med Word', () => {
    expect(MALL_KATALOG.filter((m) => passarFilter(m, 'word')).every((m) => m.word)).toBe(true)
  })
})

describe('sidbredd i helskärmen', () => {
  it('mobil: ytans bredd minus 24, högst 794', () => {
    expect(sidbredd(412, 700)).toBe(388)
    expect(sidbredd(860, 1000)).toBe(794)
  })
  it('dator: en hel sida i höjd, mellan 540 och 1200', () => {
    expect(sidbredd(1280, 558)).toBe(540)
    expect(sidbredd(1920, 838)).toBe(Math.floor((838 - 58) / A4_KVOT))
    expect(sidbredd(1920, 900)).toBe(Math.floor((900 - 58) / A4_KVOT))
    expect(sidbredd(2560, 1200)).toBe(Math.floor((1200 - 58) / A4_KVOT))
    expect(sidbredd(2560, 2400)).toBe(1200)
  })
})

describe('formatbrickornas etikett', () => {
  it('säger alltid PDF, och Word när mallen har det', () => {
    expect(formatTillagg(false)).toBe(', PDF')
    expect(formatTillagg(true)).toBe(', PDF och Word')
  })
})
