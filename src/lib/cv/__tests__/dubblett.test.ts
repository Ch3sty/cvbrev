import { describe, it, expect } from 'vitest'
import { arSammaFilnamn, hittaSammaCv, nastaLedigaNamn, sammaFilinnehall, unikSokvag } from '../dubblett'
import { sammaCvInnehall } from '@/lib/privacy/lagradCvText'

describe('dubbletten, rena delar', () => {
  it('innehållet jämförs med blanktecken normaliserade, tom text matchar aldrig', () => {
    expect(sammaCvInnehall('Anna\n\nLager  AB', ' Anna Lager\tAB ')).toBe(true)
    expect(sammaCvInnehall('Anna Lager AB', 'Anna Lager AC')).toBe(false)
    expect(sammaCvInnehall('', '')).toBe(false)
    expect(sammaCvInnehall(null, null)).toBe(false)
  })

  it('unik sökväg behåller mappen och ändelsen och räknas som samma filnamn', () => {
    const v = unikSokvag('users/u1/cv.pdf', 1_700_000_000_000)
    expect(v).toMatch(/^users\/u1\/cv__v[a-z0-9]+\.pdf$/)
    expect(arSammaFilnamn(v, 'users/u1/cv.pdf')).toBe(true)
    expect(arSammaFilnamn('users/u1/cv.pdf', 'users/u1/cv.pdf')).toBe(true)
    expect(arSammaFilnamn('users/u1/cv-2.pdf', 'users/u1/cv.pdf')).toBe(false)
    expect(arSammaFilnamn('users/u1/cv__vx.docx', 'users/u1/cv.pdf')).toBe(false)
    expect(unikSokvag('users/u1/cv', 1)).toBe('users/u1/cv__v1')
  })

  it('hittaSammaCv ser bara rader med samma filnamn', () => {
    const rader = [
      { id: 'a', original_file_path: 'users/u1/annat.pdf', cv_text: 'Samma text' },
      { id: 'b', original_file_path: 'users/u1/cv.pdf', cv_text: 'Gammal text' },
      { id: 'c', original_file_path: 'users/u1/cv__vk1.pdf', cv_text: 'Samma  text' },
    ]
    expect(hittaSammaCv(rader, 'users/u1/cv.pdf', 'Samma text')?.id).toBe('c')
    expect(hittaSammaCv(rader, 'users/u1/cv.pdf', 'Ny text')).toBeNull()
  })

  it('samma fil byte för byte, tom fil räknas aldrig', () => {
    expect(sammaFilinnehall(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true)
    expect(sammaFilinnehall(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false)
    expect(sammaFilinnehall(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false)
    expect(sammaFilinnehall(new Uint8Array([]), new Uint8Array([]))).toBe(false)
    expect(sammaFilinnehall(null, new Uint8Array([1]))).toBe(false)
  })

  it('nästa lediga namn: "cv.pdf" blir "cv (2).pdf", sedan "(3)", ledigt namn orört', () => {
    expect(nastaLedigaNamn('cv.pdf', ['cv.pdf'])).toBe('cv (2).pdf')
    expect(nastaLedigaNamn('cv.pdf', ['CV.pdf', 'cv (2).pdf'])).toBe('cv (3).pdf')
    expect(nastaLedigaNamn('cv', ['cv'])).toBe('cv (2)')
    expect(nastaLedigaNamn('cv', ['cv', 'cv (2)', null])).toBe('cv (3)')
    expect(nastaLedigaNamn('Mitt CV.docx', ['annat'])).toBe('Mitt CV.docx')
    expect(nastaLedigaNamn('CV Anna.Lindqvist', ['CV Anna.Lindqvist'])).toBe('CV Anna.Lindqvist (2)')
  })
})
