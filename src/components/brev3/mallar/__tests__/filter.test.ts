import { describe, expect, it } from 'vitest'
import { mallarKatalog, passarFilter } from '../filter'
import { arKopRetur } from '@/lib/stripe/kopRetur'
import { BREV_TYPSNITT, typsnittNamn, malltypsnittNamn } from '@/lib/letters/typsnitt'

const kat = mallarKatalog()
const ids = (f: Parameters<typeof passarFilter>[1]) => kat.filter((k) => passarFilter(k, f)).map((k) => k.id)

describe('Mallarnas filter', () => {
  it('har alla 40 mallar i katalogens ordning, gratismallarna först', () => {
    expect(kat).toHaveLength(40)
    expect(kat.slice(0, 2).map((k) => k.id)).toEqual(['linne', 'bjork'])
  })

  it('Gratis är Linne och Björk', () => {
    expect(ids('gratis')).toEqual(['linne', 'bjork'])
  })

  it('Med färg tar fyllda huvuden, band och spalter men inte accentlinjer', () => {
    const f = ids('farg')
    for (const id of ['koppar', 'granit', 'morkrum', 'ritning', 'raster', 'skylt', 'terrakotta']) expect(f).toContain(id)
    for (const id of ['linne', 'bjork', 'kalksten', 'arsring', 'fasad']) expect(f).not.toContain(id)
  })

  it('Sidospalt tar familjen och spalterna i stilen', () => {
    const s = ids('sidospalt')
    for (const id of ['kalksten', 'granit', 'stal', 'sand', 'ek', 'ritning']) expect(s).toContain(id)
    expect(s).not.toContain('kolumn')
    expect(s).not.toContain('raster')
  })

  it('Enkla är en spalt utan färgfält, och aldrig samtidigt Med färg eller Sidospalt', () => {
    const e = ids('enkla')
    expect(e).toContain('linne')
    expect(e).toContain('bjork')
    for (const k of kat.filter((k) => k.enkel)) {
      expect(k.farg).toBe(false)
      expect(k.sidospalt).toBe(false)
    }
  })
})

describe('Typsnitten', () => {
  it('är de elva i FontSelector, Helvetica som enda Premium', () => {
    expect(BREV_TYPSNITT).toHaveLength(11)
    expect(BREV_TYPSNITT.filter((t) => t.premium).map((t) => t.id)).toEqual(['helvetica'])
    expect(typsnittNamn(null)).toBe('Mallens eget')
    expect(typsnittNamn('times')).toBe('Times New Roman')
    expect(malltypsnittNamn('ibm-plex-sans')).toBe('IBM Plex Sans')
  })
})

describe('Köpreturen', () => {
  const id = '0f8fad5b-d9cb-469f-a165-70867728950e'
  it('godtar CV-mallarna, brevrummets Mallar och Brevet', () => {
    expect(arKopRetur('/dashboard/cv-mallar?mall=linne')).toBe(true)
    expect(arKopRetur(`/dashboard/mina-brev/mallar?brev=${id}&mall=koppar&format=pdf`)).toBe(true)
    expect(arKopRetur(`/dashboard/mina-brev/${id}?format=pdf`)).toBe(true)
  })
  it('nekar allt annat', () => {
    for (const v of [null, 1, 'https://ond.example/', '//ond.example', '/dashboard/mina-brev?x', `/dashboard/mina-brev/${id}`, '/dashboard/mina-brev/mallar?x=<s>', `/dashboard/mina-brev/mallar?${'a'.repeat(300)}`]) {
      expect(arKopRetur(v), String(v)).toBe(false)
    }
  })
})
