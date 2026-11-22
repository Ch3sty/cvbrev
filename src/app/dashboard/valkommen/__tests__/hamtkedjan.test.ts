/**
 * Hämtkedjan säger vad den hämtade, och brevet från startflödet ger valet
 * brev för Kom igång när hon inte valt själv (klicktestet 2026-11-22, punkt 4).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const svar: Record<string, string | null> = {}
vi.mock('@/lib/letters/claim-draft-client', () => ({
  claimPendingDraft: async () => svar.draft ?? null,
  claimPendingCvStart: async () => svar.cv_start ?? null,
  claimPendingTestSession: async () => svar.test ?? null,
  claimPendingIntervju: async () => svar.intervju ?? null,
  claimPendingPersonlighet: async () => svar.personlighet ?? null,
}))
vi.mock('@/lib/jobbsok/provaSokt', () => ({ claimPendingSokt: async () => svar.sokt ?? null }))
vi.mock('@/lib/jobmatching/provaCv', () => ({ claimPendingJobbCv: async () => svar.jobb_cv ?? null }))

import { hamtkedjan, hamtkedjanMedTyp, valUrHamtat } from '../ValkommenClient'

beforeEach(() => {
  for (const k of Object.keys(svar)) delete svar[k]
})

describe('hämtkedjan', () => {
  it('brevet först, med typen', async () => {
    svar.draft = '/dashboard/mina-brev/b1'
    svar.sokt = '/dashboard/sokta-tjanster'
    expect(await hamtkedjanMedTyp(null)).toEqual({ vag: '/dashboard/mina-brev/b1', typ: 'draft' })
    expect(await hamtkedjan(null)).toBe('/dashboard/mina-brev/b1')
  })

  it('CV:t till matchningen sist', async () => {
    svar.jobb_cv = '/dashboard/jobbmatchning'
    expect(await hamtkedjanMedTyp(null)).toEqual({ vag: '/dashboard/jobbmatchning', typ: 'jobb_cv' })
  })

  it('inget att hämta', async () => {
    expect(await hamtkedjanMedTyp(null)).toBeNull()
  })
})

describe('valet ur det hon tog med sig', () => {
  it('bara brevet ger ett val', () => {
    expect(valUrHamtat('draft')).toBe('brev')
    for (const t of ['cv_start', 'test', 'intervju', 'personlighet', 'sokt', 'jobb_cv'] as const) expect(valUrHamtat(t)).toBeNull()
  })
})
