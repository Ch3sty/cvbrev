/**
 * POST /api/public/letter-draft/claim (publikt omgång 3, beslut 6). Supabase,
 * behörigheten och utkastet är mockade; ingen databas. Brevet ritas på
 * riktigt av brevmotorn (ritaRad).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUser = vi.fn()
const harAtkomst = vi.fn()
const utkast = vi.fn()
const insatt = vi.fn()
const markerat = vi.fn()
const befintligt = vi.fn()
const PROFIL = { full_name: 'Sara Lindström', email: 'sara@exempel.se', phone: null, include_phone_in_letters: false }

const kvitterat = vi.fn(async () => {})
vi.mock('@/lib/onboarding/forsta-handling.server', () => ({
  kvitteraBrevFranPublikt: (...a: unknown[]) => kvitterat(...(a as [])),
}))
vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: (...a: unknown[]) => harAtkomst(...a) }))
const tidigare = vi.fn()
const forsta = vi.fn()
const raknat = vi.fn(async (..._a: unknown[]) => {})
let kvotProfil: Record<string, unknown> = {}
vi.mock('@/lib/letters/public-draft', () => ({
  getClaimableDraft: async () => utkast(),
  raknaInhamtadeUtkast: async (...a: unknown[]) => tidigare(...a),
  forstaInhamtadeUtkast: async (...a: unknown[]) => forsta(...a),
}))
vi.mock('@/lib/letters/skrivBrev', () => ({
  raknaBrevMotKvot: (...a: unknown[]) => raknat(...a),
  kvotSlutSvar: (lage: { effectiveCount: number }) => ({ error: 'quota_exceeded', used: lage.effectiveCount }),
}))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { ...PROFIL, ...kvotProfil }, error: null }) }) }),
    }),
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (tabell: string) => {
      if (tabell === 'letters')
        return {
          insert: (rad: Record<string, unknown>) => {
            insatt(rad)
            return { select: () => ({ single: async () => ({ data: { id: 'b1' }, error: null }) }) }
          },
          select: () => {
            const kedja = { eq: () => kedja, order: () => kedja, limit: () => kedja, maybeSingle: async () => ({ data: befintligt(), error: null }) }
            return kedja
          },
        }
      return {
        update: (v: Record<string, unknown>) => {
          markerat(v)
          const kedja = { eq: () => kedja, is: async () => ({ error: null }) }
          return kedja
        },
      }
    },
  }),
}))

import { POST } from '../route'

const anrop = (body: unknown) => new Request('http://lokal/api/public/letter-draft/claim', { method: 'POST', body: JSON.stringify(body) })

const UTKAST = {
  token: 'tok-1',
  role: 'Projektledare',
  employer: 'Nordhaga Bygg',
  letter_text: 'När ni söker en projektledare känner jag igen mina senaste tre år.\n\nJag har drivit fyra upphandlingar.',
  yrke_slug: 'projektledare',
  claimed_by: null,
  expires_at: '2099-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'sara@exempel.se' } } })
  harAtkomst.mockResolvedValue(false)
  utkast.mockReturnValue(UTKAST)
  befintligt.mockReturnValue(null)
  tidigare.mockResolvedValue(0)
  forsta.mockResolvedValue('tok-1')
  kvotProfil = {}
})

describe('claim av brevutkastet', () => {
  it('utan val: brevet i Linne, i brevrummets format, till brevet', async () => {
    const res = await POST(anrop({ token: 'tok-1' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/b1' })
    const rad = insatt.mock.calls[0][0]
    expect(rad).toMatchObject({ mall_id: 'linne', tonality: 'professional', job_description: null, title: 'Projektledare', company: 'Nordhaga Bygg' })
    expect(rad.body_stycken).toEqual(['När ni söker en projektledare känner jag igen mina senaste tre år.', 'Jag har drivit fyra upphandlingar.'])
    // content är brevet ritat i mallen (brevmotorns stycken), inte den råa texten.
    expect(String(rad.content)).toContain('data-stycke="0"')
    expect(markerat).toHaveBeenCalledWith(expect.objectContaining({ claimed_by: 'u1' }))
    // Kontots första brev i Kom igång och aktiveringen (klicktestet 2026-11-22, punkt 4).
    expect(kvitterat).toHaveBeenCalledWith(expect.anything(), 'u1', 'b1')
  })

  it('Premiummall på gratisnivån: sparas i Linne och öppnas provad i Mallar', async () => {
    const res = await POST(anrop({ token: 'tok-1', mall: 'koppar', ton: 'balanced', annons: 'Vi söker en projektledare.' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/mallar?brev=b1&mall=koppar' })
    expect(insatt.mock.calls[0][0]).toMatchObject({ mall_id: 'linne', tonality: 'balanced', job_description: 'Vi söker en projektledare.' })
  })

  it('gratismallen Björk sparas och öppnas direkt', async () => {
    const res = await POST(anrop({ token: 'tok-1', mall: 'bjork' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/b1' })
    expect(insatt.mock.calls[0][0].mall_id).toBe('bjork')
  })

  it('med betald behörighet sparas Premiummallen', async () => {
    harAtkomst.mockResolvedValue(true)
    const res = await POST(anrop({ token: 'tok-1', mall: 'koppar' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/b1' })
    expect(insatt.mock.calls[0][0].mall_id).toBe('koppar')
  })

  it('auto (Premium) tas inte emot som ton', async () => {
    await POST(anrop({ token: 'tok-1', ton: 'auto' }))
    expect(insatt.mock.calls[0][0].tonality).toBe('professional')
  })

  it('redan hämtat av samma konto: samma brev, ingen ny rad', async () => {
    utkast.mockReturnValue({ ...UTKAST, claimed_by: 'u1' })
    befintligt.mockReturnValue({ id: 'b0', mall_id: 'linne' })
    const res = await POST(anrop({ token: 'tok-1', mall: 'koppar' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/mallar?brev=b0&mall=koppar' })
    expect(insatt).not.toHaveBeenCalled()
    expect(kvitterat).not.toHaveBeenCalled()
  })

  it('hämtat av någon annan: 409, utan inloggning: 401', async () => {
    utkast.mockReturnValue({ ...UTKAST, claimed_by: 'u2' })
    expect((await POST(anrop({ token: 'tok-1' }))).status).toBe(409)
    getUser.mockResolvedValue({ data: { user: null } })
    expect((await POST(anrop({ token: 'tok-1' }))).status).toBe(401)
  })

  it('kontots första inhämtade utkast räknas inte mot veckans gratisbrev', async () => {
    const res = await POST(anrop({ token: 'tok-1' }))
    expect(res.status).toBe(200)
    expect(tidigare).toHaveBeenCalledWith(expect.anything(), 'u1', 'tok-1')
    expect(raknat).not.toHaveBeenCalled()
  })

  it('försök att hämta in ett andra utkast: hämtas in och räknas som veckans gratisbrev', async () => {
    tidigare.mockResolvedValue(1)
    utkast.mockReturnValue({ ...UTKAST, token: 'tok-2' })
    const res = await POST(anrop({ token: 'tok-2' }))
    expect(await res.json()).toEqual({ redirect: '/dashboard/mina-brev/b1' })
    expect(insatt).toHaveBeenCalledTimes(1)
    expect(raknat).toHaveBeenCalledTimes(1)
    expect(raknat.mock.calls[0][0]).toBe('u1')
  })

  it('andra utkastet när veckans gratisbrev redan är skrivet: 429, inget brev, inget märkt', async () => {
    tidigare.mockResolvedValue(1)
    kvotProfil = { weekly_letter_count: 1, weekly_letter_first_used_at: new Date(Date.now() - 2 * 864e5).toISOString() }
    const res = await POST(anrop({ token: 'tok-2' }))
    expect(res.status).toBe(429)
    expect((await res.json()).error).toBe('quota_exceeded')
    expect(insatt).not.toHaveBeenCalled()
    expect(markerat).not.toHaveBeenCalled()
    expect(raknat).not.toHaveBeenCalled()
  })

  it('två samtidiga utkast: det som inte blev kontots första räknas ändå', async () => {
    forsta.mockResolvedValue('tok-0')
    await POST(anrop({ token: 'tok-1' }))
    expect(raknat).toHaveBeenCalledTimes(1)
  })

  it('betalt konto: ingen räkning alls', async () => {
    harAtkomst.mockResolvedValue(true)
    tidigare.mockResolvedValue(4)
    await POST(anrop({ token: 'tok-1' }))
    expect(tidigare).not.toHaveBeenCalled()
    expect(raknat).not.toHaveBeenCalled()
  })
})
