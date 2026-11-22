/**
 * CV:ts ort för Matchade jobb (klicktestet på live 2026-11-22, punkt 5).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ortUrCv } from '../cvOrt'

describe('ortUrCv', () => {
  it('strukturens ort, med eller utan postnummer och gata', () => {
    expect(ortUrCv({ personalInfo: { address: 'Göteborg' } }, '')).toBe('Göteborg')
    expect(ortUrCv({ personalInfo: { address: '411 05 Göteborg' } }, '')).toBe('Göteborg')
    expect(ortUrCv({ personalInfo: { address: 'Storgatan 1, 411 05 göteborg' } }, '')).toBeNull()
    expect(ortUrCv({ personalInfo: { address: 'Storgatan 1, 411 05 Göteborg' } }, '')).toBe('Göteborg')
    expect(ortUrCv({ personalInfo: { location: 'umeå' } }, '')).toBe('Umeå')
  })

  it('kontaktblocket i texten när strukturen saknar ort (klicktestets CV)', () => {
    const text = 'Test Testsson\nProjektledare | Göteborg | test@exempel.se | 070-000 00 00\n\nProfil\nErfaren projektledare.'
    expect(ortUrCv({ personalInfo: { fullName: 'Test Testsson' } }, text)).toBe('Göteborg')
    expect(ortUrCv(null, text)).toBe('Göteborg')
  })

  it('ingen kommun, ingen ort: hellre ingen än fel', () => {
    expect(ortUrCv({ personalInfo: { address: 'Projektledare' } }, 'Projektledare\nErfarenhet')).toBeNull()
    expect(ortUrCv({}, '')).toBeNull()
    expect(ortUrCv(undefined, undefined)).toBeNull()
  })
})

/* ---------------------------------------------------- fyllCvOrt */

const uppdaterat: Array<Record<string, unknown>> = []
let cvRad: Record<string, unknown> | null = null
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      update: (v: Record<string, unknown>) => {
        uppdaterat.push(v)
        const k = { eq: () => k, then: (r: (x: unknown) => unknown) => r({ error: null }) }
        return k
      },
    }),
  }),
}))

import { fyllCvOrt } from '../cvOrt.server'

const supabase = {
  from: () => {
    const k = { select: () => k, eq: () => k, maybeSingle: async () => ({ data: cvRad }) }
    return k
  },
}
const AKTIVT = {
  cv_id: 'cv1',
  extracted_occupations: [],
  extracted_skills: [],
  extracted_educations: [],
  extracted_location: null,
  parsed_at: '2026-11-22T10:00:00Z',
}

beforeEach(() => {
  uppdaterat.length = 0
  cvRad = null
})

describe('fyllCvOrt', () => {
  it('fyller i och sparar orten när tolkningen lämnade den tom', async () => {
    cvRad = { structured_data: { personalInfo: { address: 'Göteborg' } }, cv_text: '' }
    const cv = await fyllCvOrt(supabase, 'u1', AKTIVT)
    expect(cv?.extracted_location).toBe('Göteborg')
    expect(uppdaterat).toEqual([{ extracted_location: 'Göteborg' }])
  })

  it('en ort som tolkningen redan hittat rörs inte', async () => {
    cvRad = { structured_data: { personalInfo: { address: 'Göteborg' } }, cv_text: '' }
    const cv = await fyllCvOrt(supabase, 'u1', { ...AKTIVT, extracted_location: 'Malmö' })
    expect(cv?.extracted_location).toBe('Malmö')
    expect(uppdaterat).toEqual([])
  })

  it('utan ort i CV:t: som förut', async () => {
    cvRad = { structured_data: {}, cv_text: 'Inget här' }
    expect((await fyllCvOrt(supabase, 'u1', AKTIVT))?.extracted_location).toBeNull()
    expect(await fyllCvOrt(supabase, 'u1', null)).toBeNull()
    expect(uppdaterat).toEqual([])
  })
})
