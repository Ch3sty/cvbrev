/**
 * GET /api/cv/originalfil: ägaren får en signerad länk, ingen annan.
 * Supabase är mockad; raden läses med användarens session (RLS) och filtret
 * på user_id, och länken skapas med samma session.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ID = 'eaae1e54-6e46-4fdf-bc44-602d7e0867ae'
const CV = '11111111-2222-3333-4444-555555555555'

const getUser = vi.fn()
const rad = vi.fn()
const signera = vi.fn()
const filter: Array<[string, string]> = []

vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser },
    from: () => {
      const kedja = {
        select: () => kedja,
        eq: (k: string, v: string) => {
          filter.push([k, v])
          return kedja
        },
        maybeSingle: async () => ({ data: rad(), error: null }),
      }
      return kedja
    },
    storage: { from: (hink: string) => ({ createSignedUrl: (...a: unknown[]) => signera(hink, ...a) }) },
  }),
}))

import { GET } from '../route'

const anrop = (q: string) => new Request(`http://lokal/api/cv/originalfil${q}`)

beforeEach(() => {
  vi.clearAllMocks()
  filter.length = 0
  getUser.mockResolvedValue({ data: { user: { id: ID } } })
  rad.mockReturnValue({ id: CV, file_name: 'test-testsson-cv.pdf', original_file_path: `users/${ID}/test-testsson-cv__abc.pdf` })
  signera.mockResolvedValue({ data: { signedUrl: 'https://lagring.test/signerad?token=x' }, error: null })
})

describe('originalfilen', () => {
  it('ägaren skickas vidare till en signerad länk i hinken cvs, en minut', async () => {
    const res = await GET(anrop(`?cv=${CV}`))
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://lagring.test/signerad?token=x')
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(signera).toHaveBeenCalledWith('cvs', `users/${ID}/test-testsson-cv__abc.pdf`, 60, undefined)
    expect(filter).toContainEqual(['user_id', ID])
    expect(filter).toContainEqual(['id', CV])
  })

  it('?ladda=1 ger nedladdning med filnamnet hon laddade upp', async () => {
    await GET(anrop(`?cv=${CV}&ladda=1`))
    expect(signera).toHaveBeenCalledWith('cvs', `users/${ID}/test-testsson-cv__abc.pdf`, 60, { download: 'test-testsson-cv.pdf' })
  })

  it('ett annat kontos CV (ingen rad under RLS): 404 och ingen länk', async () => {
    rad.mockReturnValue(null)
    const res = await GET(anrop(`?cv=${CV}`))
    expect(res.status).toBe(404)
    expect(await res.text()).toContain('Vi hittar inte originalfilen')
    expect(signera).not.toHaveBeenCalled()
  })

  it('en väg utanför kontots mapp signeras aldrig', async () => {
    rad.mockReturnValue({ id: CV, file_name: 'x.pdf', original_file_path: `users/3a684b50-127b-48e5-a91d-d39bd89eddc9/x.pdf` })
    expect((await GET(anrop(`?cv=${CV}`))).status).toBe(404)
    rad.mockReturnValue({ id: CV, file_name: 'x', original_file_path: `ai-improved/${ID}/1-x.txt` })
    expect((await GET(anrop(`?cv=${CV}`))).status).toBe(404)
    expect(signera).not.toHaveBeenCalled()
  })

  it('filen borta ur lagringen: 404', async () => {
    signera.mockResolvedValue({ data: null, error: { message: 'Object not found' } })
    expect((await GET(anrop(`?cv=${CV}`))).status).toBe(404)
  })

  it('utan inloggning: till inloggningen med vägen tillbaka', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(anrop(`?cv=${CV}`))
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`http://lokal/login?redirect=${encodeURIComponent(`/api/cv/originalfil?cv=${CV}`)}`)
  })

  it('ett ogiltigt id: 404 utan databasfråga', async () => {
    expect((await GET(anrop('?cv=..%2Fx'))).status).toBe(404)
    expect(filter).toEqual([])
  })
})
