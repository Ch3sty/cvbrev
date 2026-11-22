import { describe, expect, it } from 'vitest'
import { valjLasVidare } from '../lasVidare'

const a = (slug: string, date: string, tags: string[]) => ({ slug, date, tags })

describe('valjLasVidare', () => {
  it('tar gemensamma taggar först', () => {
    const alla = [
      a('egen', '2026-01-10', ['cv', 'ats']),
      a('ats', '2025-01-01', ['ats']),
      a('ny-test', '2026-11-20', ['logiskt test']),
      a('cv-1', '2026-01-09', ['cv mall']),
      a('cv-2', '2026-01-08', ['cv mall']),
    ]
    expect(valjLasVidare(alla, 'egen', ['cv', 'ats']).map((p) => p.slug)).toEqual(['ats', 'cv-1', 'cv-2'])
  })

  it('fyller på ur samma kluster närmast i tid, inte med de nyaste', () => {
    const alla = [
      a('egen', '2026-01-10', ['cv']),
      a('cv-nara', '2026-01-11', ['cv mall']),
      a('cv-langt', '2024-01-01', ['cv mall']),
      a('cv-mitten', '2025-06-01', ['cv mall']),
      a('cv-fjarran', '2020-01-01', ['cv mall']),
      a('ny-test', '2026-11-20', ['logiskt test']),
      a('ny-intervju', '2026-11-21', ['intervju']),
    ]
    expect(valjLasVidare(alla, 'egen', ['cv']).map((p) => p.slug)).toEqual(['cv-nara', 'cv-mitten', 'cv-langt'])
  })

  it('tar de nyaste bara när klustret har färre än tre', () => {
    const alla = [
      a('egen', '2026-01-10', ['logiskt test']),
      a('test-2', '2026-01-01', ['matrigma']),
      a('ny-cv', '2026-11-20', ['cv mall']),
      a('ny-intervju', '2026-11-21', ['intervju']),
      a('gammal-cv', '2020-01-01', ['cv mall']),
    ]
    expect(valjLasVidare(alla, 'egen', ['logiskt test']).map((p) => p.slug)).toEqual(['test-2', 'ny-intervju', 'ny-cv'])
  })

  it('ger samma urval varje gång och aldrig artikeln själv', () => {
    const alla = [a('egen', '2026-07-22', ['cv']), ...Array.from({ length: 12 }, (_, i) => a(`cv-${i}`, '2026-07-22', ['cv mall']))]
    const forsta = valjLasVidare(alla, 'egen', ['cv']).map((p) => p.slug)
    expect(forsta).toHaveLength(3)
    expect(forsta).not.toContain('egen')
    expect(valjLasVidare([...alla].reverse(), 'egen', ['cv']).map((p) => p.slug)).toEqual(forsta)
  })
})
