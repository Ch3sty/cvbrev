/**
 * /api/letters/download, den nya vägen för brev i brevmallen. Supabase och
 * behörigheten är mockade; ingen databas och ingen webbläsare (PDF:en ritas
 * inte här, Word-filen byggs på riktigt).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import JSZip from 'jszip'

const getUser = vi.fn()
const harAtkomst = vi.fn()
const brevRad = vi.fn()
const uppdatera = vi.fn()
const PROFIL = { full_name: 'Erik Lindberg', email: 'erik@exempel.se', phone: '070-123 45 67', include_phone_in_letters: true }

vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: (...a: unknown[]) => harAtkomst(...a) }))
vi.mock('@/lib/analytics/server', () => ({ captureServer: async () => {} }))
vi.mock('@/lib/premium/logPremiumUsage', () => ({ logPremiumUsage: () => {} }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser },
    from: (tabell: string) => {
      if (tabell === 'letters')
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: brevRad(), error: null }) }) }) }),
          // markeraForberett: update().eq().eq().is().select().maybeSingle()
          update: (v: Record<string, unknown>) => {
            uppdatera(v)
            const svar = { data: { forberett_at: v.forberett_at ?? null, forberett_som: v.forberett_som ?? null }, error: null }
            const kedja = {
              eq: () => kedja,
              is: () => kedja,
              select: () => kedja,
              maybeSingle: async () => svar,
              then: (ok: (r: unknown) => unknown) => Promise.resolve({ error: null }).then(ok),
            }
            return kedja
          },
        }
      if (tabell === 'cv_texts')
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { structured_data: { personalInfo: { title: 'Projektledare' } } }, error: null }) }) }),
          }),
        }
      // profiles: hela raden (gamla vägen), motorns avsändarkolumner
      // (hamtaBrevProfil) och onboarding_track (loggningen).
      return {
        select: (kolumner: string) => ({
          eq: () => ({
            single: async () => ({ data: PROFIL, error: null }),
            maybeSingle: async () => ({
              data: kolumner.includes('full_name') ? PROFIL : { onboarding_track: null },
              error: null,
            }),
          }),
        }),
      }
    },
  }),
}))

import { POST } from '../route'

const anrop = (body: unknown) => new Request('http://lokal/api/letters/download', { method: 'POST', body: JSON.stringify(body) })

const RAD = {
  id: 'b1',
  company: 'Nordanvind Energi',
  job_title: 'IT-projektledare',
  title: 'Brev till Nordanvind',
  content: '<html></html>',
  body_stycken: ['Första stycket.', 'Andra stycket.'],
  halsning: 'Hej Maria,',
  mottagare_person: 'Maria Ekström',
  mall_id: 'koppar',
  font_id: 'georgia',
}

beforeEach(() => {
  for (const f of [getUser, harAtkomst, brevRad, uppdatera]) f.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'erik@exempel.se' } } })
  harAtkomst.mockResolvedValue(true)
  brevRad.mockReturnValue(RAD)
})

describe('nya vägen', () => {
  it('kräver inloggning och letter_download som förut', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })
    expect((await POST(anrop({ id: 'b1', format: 'docx' }))).status).toBe(401)
    harAtkomst.mockResolvedValueOnce(false)
    expect((await POST(anrop({ id: 'b1', format: 'docx' }))).status).toBe(402)
  })

  it('ett okänt brev ger 404', async () => {
    brevRad.mockReturnValue(null)
    expect((await POST(anrop({ id: 'finns-inte', format: 'docx' }))).status).toBe(404)
  })

  it('Word ur brevets rad: mall, typsnitt och stycken, och forberett_at sätts', async () => {
    const svar = await POST(anrop({ id: 'b1', format: 'docx' }))
    expect(svar.status).toBe(200)
    expect(svar.headers.get('Content-Disposition')).toContain('Brev_till_Nordanvind.docx')
    const zip = await JSZip.loadAsync(Buffer.from(await svar.arrayBuffer()))
    const xml = await zip.file('word/document.xml')!.async('string')
    expect(xml).toContain('Första stycket.')
    expect(xml).toContain('Hej Maria,')
    expect(xml).toContain('Georgia')
    expect(xml).toContain('070-123 45 67')
    expect(uppdatera).toHaveBeenCalledWith(expect.objectContaining({ forberett_at: expect.any(String) }))
  })

  it('Word i en mall utan Word ger 400', async () => {
    brevRad.mockReturnValue({ ...RAD, mall_id: 'morkrum' })
    expect((await POST(anrop({ id: 'b1', format: 'docx' }))).status).toBe(400)
  })

  it('brev utan mall_id går den gamla vägen (som saknar innehåll här: 400)', async () => {
    brevRad.mockReturnValue({ ...RAD, mall_id: null, content: '' })
    const svar = await POST(anrop({ id: 'b1', format: 'pdf' }))
    expect(svar.status).toBe(400)
    expect(uppdatera).not.toHaveBeenCalled()
  })
})
