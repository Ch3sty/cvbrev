/**
 * Arbete som följer med in i kontot räknas som kontots (klicktestet på live
 * 2026-11-22, punkt 4): milstolpen, onboardingsteget och Kom igångs bricka.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const milstolpe = vi.fn(async () => {})
const aktivitet = vi.fn(async () => {})
const bricka = vi.fn(async () => {})
vi.mock('@/lib/activation-tracking', () => ({
  markFirstMilestone: (...a: unknown[]) => milstolpe(...(a as [])),
  logActivityServer: (...a: unknown[]) => aktivitet(...(a as [])),
}))
vi.mock('../komigang-server', async (orig) => ({
  ...(await orig<typeof import('../komigang-server')>()),
  markeraBricka: (...a: unknown[]) => bricka(...(a as [])),
}))

import { kvitteraBrevFranPublikt, kvitteraNyttCv } from '../forsta-handling.server'
import { harledProvade } from '../komigang-server'
import { komIgangLage } from '../komigang'

const rpc = vi.fn(async () => ({ error: null }))
const supabase = { rpc }

beforeEach(() => vi.clearAllMocks())

describe('brevet från startflödet', () => {
  it('blir kontots första brev: milstolpe, onboardingsteg, bricka och aktivitet', async () => {
    await kvitteraBrevFranPublikt(supabase, 'u1', 'b1')
    expect(milstolpe).toHaveBeenCalledWith('u1', 'first_letter_created_at')
    expect(rpc).toHaveBeenCalledWith('update_onboarding_progress', { user_id: 'u1', step_name: 'create_letter' })
    expect(bricka).toHaveBeenCalledWith('u1', 'brev')
    expect(aktivitet).toHaveBeenCalledWith('u1', 'letter_created', expect.any(String), { letter_id: 'b1', kalla: 'publikt_startflode' })
  })

  it('ett fel i onboardingsteget fäller inget', async () => {
    rpc.mockRejectedValueOnce(new Error('nät'))
    await expect(kvitteraBrevFranPublikt(supabase, 'u1', 'b1')).resolves.toBeUndefined()
    expect(bricka).toHaveBeenCalled()
  })
})

describe('ett nytt CV utan uppladdning', () => {
  it('räknas som kontots CV', async () => {
    await kvitteraNyttCv(supabase, 'u1')
    expect(milstolpe).toHaveBeenCalledWith('u1', 'first_cv_uploaded_at')
    expect(rpc).toHaveBeenCalledWith('update_onboarding_progress', { user_id: 'u1', step_name: 'upload_cv' })
    expect(bricka).toHaveBeenCalledWith('u1', 'cv_upp')
  })
})

describe('Kom igång efter brevet', () => {
  const underlag = {
    sparade: [],
    goalRole: null,
    location: null,
    cvCount: 0,
    analysisCompleted: 0,
    matchCount: 0,
    templateDownloads: 0,
    letterCount: 1,
    linkedinCount: 0,
    visibility: null,
    conversationCount: 0,
    testTypes: [],
    personalityCompleted: 0,
  }

  it('utan val står brevet inte i listan (orsaken till 0 av 6)', () => {
    const lage = komIgangLage(null, harledProvade(underlag), false, null)
    expect(lage.antalTotalt).toBe(6)
    expect(lage.antalProvade).toBe(0)
  })

  it('med valet brev (härlett ur startflödet) räknas brevet: 1 av 7', () => {
    const lage = komIgangLage(null, harledProvade(underlag), false, 'brev')
    expect(lage.antalProvade).toBe(1)
    expect(lage.antalTotalt).toBe(7)
    expect(lage.nasta).toBe('analys_gratis')
  })

  it('sökt tjänst och CV räknas i listan utan val', () => {
    const lage = komIgangLage(null, harledProvade({ ...underlag, letterCount: 0, cvCount: 1, applicationCount: 1 }), false, null)
    expect(lage.provade).toEqual(['sokt_tjanst', 'cv_upp'])
  })
})
