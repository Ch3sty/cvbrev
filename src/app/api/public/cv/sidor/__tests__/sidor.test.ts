/**
 * Helskärmens sidor utan konto (/api/public/cv/sidor): giltig indata, kvoten
 * per adress, och att en fotoadress aldrig når serverns Chrome.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NORMALT_CV } from '@/lib/cv/word/__tests__/fixtures'

const rendera = vi.fn()
const kvot = vi.fn()
vi.mock('@/lib/cv/mallar/sidbilder', () => ({ renderaSidbilder: (...a: unknown[]) => rendera(...a) }))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }))
vi.mock('@/lib/rate-limit/ip', () => ({ getClientIp: () => '10.0.0.1', checkIpRateLimit: (...a: unknown[]) => kvot(...a) }))

import { POST } from '../route'

const anrop = (body: unknown) => new Request('http://x/api/public/cv/sidor', { method: 'POST', body: JSON.stringify(body) })

describe('POST /api/public/cv/sidor', () => {
  beforeEach(() => {
    rendera.mockReset().mockResolvedValue({ sidor: 2, bilder: ['data:image/webp;base64,AA', 'data:image/webp;base64,BB'], kvot: 1.414 })
    kvot.mockReset().mockResolvedValue({ allowed: true })
  })

  it('ger sidorna för CV:t i mallen, gamla mall-id löses', async () => {
    const res = await POST(anrop({ cv: NORMALT_CV, mall: 'linne', val: { enSida: true } }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.sidor).toBe(2)
    expect(j.bilder).toHaveLength(2)
    expect(rendera.mock.calls[0][1]).toBe('linne')
    expect(rendera.mock.calls[0][2]).toMatchObject({ enSida: true })
    expect(kvot.mock.calls[0][2]).toBe('cv_sidor')
  })

  it('skickar aldrig en fotoadress vidare till Chrome', async () => {
    const cv = structuredClone(NORMALT_CV)
    cv.personalInfo.profilePhotoUrl = 'http://169.254.169.254/latest/meta-data'
    await POST(anrop({ cv, mall: 'bjork' }))
    expect(rendera.mock.calls[0][0].personalInfo.profilePhotoUrl).toBeUndefined()
  })

  it('400 utan giltig mall eller CV, 429 över kvoten', async () => {
    expect((await POST(anrop({ cv: NORMALT_CV, mall: '../x' }))).status).toBe(400)
    expect((await POST(anrop({ mall: 'linne' }))).status).toBe(400)
    kvot.mockResolvedValue({ allowed: false })
    expect((await POST(anrop({ cv: NORMALT_CV, mall: 'linne' }))).status).toBe(429)
    expect(rendera).not.toHaveBeenCalled()
  })
})
