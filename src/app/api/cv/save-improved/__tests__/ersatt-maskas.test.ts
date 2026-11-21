// @vitest-environment node
/**
 * "Ersätt mitt nuvarande CV" sparar cv_text maskad med samma funktion som
 * uppladdningen (beslutet 2026-11-21, punkt 4). Kontaktuppgifterna för arket
 * och nedladdningen kommer ur structured_data, som sparas omaskad som förut.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

let uppdatering: Record<string, unknown> | null = null

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => {
      const k: Record<string, unknown> = {}
      k.update = (rad: Record<string, unknown>) => {
        uppdatering = rad
        return k
      }
      k.eq = () => k
      k.select = () => k
      k.maybeSingle = async () => ({ data: { id: 'cv1' }, error: null })
      return k
    },
  }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: false, maxCvs: 2 }) }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))

import { POST } from '@/app/api/cv/save-improved/route'
import { maskaLagradCvText } from '@/lib/privacy/lagradCvText'
import { kanonisktCv } from '@/lib/cv/poang/kanon'
import { lasKontaktIStrukturerad } from '@/lib/profile/dokumentKontakt'

const TEXT = 'Anna Andersson\nanna@exempel.se | 070-123 45 67 | Storgatan 12, 123 45 Örebro\nhttps://linkedin.com/in/anna\n\nERFARENHET\nLagerarbetare, Lager AB 2019 till 2024'
const STRUKTUR = {
  personalInfo: { fullName: 'Anna Andersson', email: 'anna@exempel.se', phone: '070-123 45 67', address: 'Storgatan 12, 123 45 Örebro' },
  experience: [{ position: 'Lagerarbetare', company: 'Lager AB', startDate: '2019', endDate: '2024', description: ['Plock och pack'] }],
  education: [],
  skills: [],
  languages: [{ language: 'Engelska', proficiency: 'Goda kunskaper' }],
}

beforeEach(() => {
  uppdatering = null
})

describe('Ersätt maskar cv_text som uppladdningen', () => {
  it('cv_text sparas maskad, structured_data orörd', async () => {
    const res = await POST(
      new Request('http://localhost/api/cv/save-improved', {
        method: 'POST',
        body: JSON.stringify({ lage: 'ersatt', cvId: 'cv1', fileName: 'cv', improvedText: TEXT, structuredData: STRUKTUR }),
      }) as never,
    )
    expect(res.status).toBe(200)
    const cvText = String(uppdatering?.cv_text)
    expect(cvText).toBe(maskaLagradCvText(TEXT))
    expect(cvText).not.toContain('anna@exempel.se')
    expect(cvText).not.toContain('070-123 45 67')
    expect(cvText).not.toContain('https://')
    expect(cvText).toContain('[EMAIL]')
    expect(uppdatering?.structured_data).toEqual(STRUKTUR)
  })

  it('arket och poängen läser namn och kontakt ur strukturen, också med maskad text', () => {
    const maskad = maskaLagradCvText(TEXT)
    const cv = kanonisktCv(STRUKTUR, maskad)
    expect(cv?.personalInfo.fullName).toBe('Anna Andersson')
    expect(cv?.personalInfo.email).toBe('anna@exempel.se')
    expect(cv?.personalInfo.phone).toBe('070-123 45 67')
    expect(kanonisktCv(STRUKTUR, maskad)).toEqual(kanonisktCv(STRUKTUR, TEXT))
    const kontakt = lasKontaktIStrukturerad(STRUKTUR)
    expect(kontakt?.email).toBe('anna@exempel.se')
  })
})
