// @vitest-environment node
/**
 * Dubbletten jämförs på innehåll, inte på filnamn (beslutet 2026-11-21,
 * punkt 3). Samma filnamn och samma maskade text: det befintliga CV:t öppnas
 * med fannsRedan. Annat innehåll: ett nytt CV med egen lagringsväg och eget
 * namn, och kvoten gäller som för vilket nytt CV som helst.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

let filText = ''
let rader: Record<string, unknown>[] = []
let profil: Record<string, unknown> = {}
let betalt = false
let sparad: Record<string, unknown> | null = null
const lagrade: { sokvag: string; upsert: unknown }[] = []
let struktureringar = 0
let lagringen: Record<string, Uint8Array> = {}
const nedladdningar: string[] = []
/** Filen som laddas upp i testerna. */
const FILEN = new Uint8Array([37, 80, 68, 70])

function kedja(tabell: string) {
  const k: Record<string, unknown> = {}
  let raknar = false
  let sokvag: string | null = null
  k.select = (_: string, opts?: { count?: string }) => {
    raknar = Boolean(opts?.count)
    return k
  }
  k.eq = (kolumn: string, varde: unknown) => {
    if (kolumn === 'original_file_path') sokvag = String(varde)
    return k
  }
  k.single = async () => (tabell === 'profiles' ? { data: profil, error: null } : { data: sparad, error: null })
  k.maybeSingle = async () => ({ data: sokvag ? (rader.find((r) => r.original_file_path === sokvag) ?? null) : null, error: null })
  k.insert = (rad: Record<string, unknown>) => {
    sparad = { id: 'nytt', ...rad }
    return k
  }
  k.then = (lyckas: (v: unknown) => unknown) =>
    lyckas(raknar ? { data: null, count: rader.length, error: null } : { data: rader, error: null })
  return k
}

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: (t: string) => kedja(t),
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        list: async () => ({ data: [{ name: 'x' }], error: null }),
        upload: async (sokvag: string, _fil: unknown, opts: { upsert?: unknown }) => {
          lagrade.push({ sokvag, upsert: opts?.upsert })
          return { data: {}, error: null }
        },
        getPublicUrl: (s: string) => ({ data: { publicUrl: `https://exempel.se/${s}` } }),
        download: async (s: string) => {
          nedladdningar.push(s)
          const b = lagringen[s]
          return b ? { data: new Blob([b]), error: null } : { data: null, error: { message: 'saknas' } }
        },
      }),
    },
  }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: betalt, maxCvs: 2 }) }))
vi.mock('@/lib/activation-tracking', () => ({ markFirstMilestone: async () => {} }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))
vi.mock('@/lib/profile/backfillContact', () => ({ backfillProfileContact: async () => {} }))
vi.mock('@/lib/cv/cv-parser', () => ({
  parseCV: async () => {
    struktureringar++
    return { roles: [], education: [], skills: [], languages: [] }
  },
}))
vi.mock('@/lib/cv-parser', () => {
  class ImageBasedPdfError extends Error {
    extractedLength = 0
  }
  return { ImageBasedPdfError, parseCV: async () => filText }
})
vi.mock('@/lib/cv-parser/ocr', () => ({ lasPdfMedOcr: async () => ({ ok: false }), maskaOcrRester: (t: string) => t }))

import { POST } from '@/app/api/cv/upload/route'
import { maskaLagradCvText } from '@/lib/privacy/lagradCvText'

const GAMMAL = 'Anna Andersson\nanna@exempel.se\n070-123 45 67\nLagerarbetare på Lager AB 2019 till 2024. Truckkort A och B.'
const NY = 'Anna Andersson\nanna@exempel.se\n070-123 45 67\nLagerarbetare på Lager AB 2019 till 2025. Truckkort A, B och C. Ny rad.'

async function laddaUpp(namn = 'cv.pdf') {
  const form = new FormData()
  form.append('file', new File([FILEN], namn, { type: 'application/pdf' }))
  form.append('title', namn.replace(/\.pdf$/, ''))
  const res = await POST(new Request('http://localhost/api/cv/upload', { method: 'POST', body: form }))
  const text = await new Response(res.body).text()
  return text
    .split('\n\n')
    .filter((b) => b.trim())
    .map((b) => ({ event: b.match(/^event: (.*)$/m)?.[1], data: JSON.parse(b.match(/^data: (.*)$/m)?.[1] ?? 'null') }))
}

beforeEach(() => {
  filText = GAMMAL
  profil = { subscription_tier: 'free', email_verified_at: '2026-01-01', full_name: null, phone: null }
  betalt = false
  sparad = null
  lagrade.length = 0
  struktureringar = 0
  nedladdningar.length = 0
  // Den sparade filen i lagringen är en annan än den som laddas upp, utom där testet säger annat.
  lagringen = { 'users/u1/cv.pdf': new Uint8Array([1, 2, 3, 4]) }
  rader = [
    {
      id: 'gammalt',
      file_name: 'cv',
      original_file_path: 'users/u1/cv.pdf',
      // Lagrat maskat vid uppladdningen, med andra radbrytningar och blanksteg.
      cv_text: maskaLagradCvText(GAMMAL).replace(/\n/g, '  \r\n '),
    },
  ]
})

describe('dubbletten jämförs på innehåll', () => {
  it('samma filnamn och samma innehåll: det befintliga öppnas med fannsRedan, inget nytt och ingen överskrivning', async () => {
    const h = await laddaUpp()
    const klar = h.find((x) => x.event === 'complete')
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(klar?.data.data.id).toBe('gammalt')
    expect(klar?.data.data.fannsRedan).toBe(true)
    expect(sparad).toBeNull()
    expect(lagrade).toHaveLength(0)
    expect(struktureringar).toBe(0)
  })

  it('samma innehåll öppnas också vid full kvot (en avbruten uppladdning som görs om)', async () => {
    rader.push({ id: 'annat', file_name: 'annat', original_file_path: 'users/u1/annat.pdf', cv_text: 'x' })
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(h.find((x) => x.event === 'complete')?.data.data.fannsRedan).toBe(true)
  })

  it('samma filnamn men annat innehåll: nytt CV med egen sökväg och namnet "cv (2)", den gamla filen orörd', async () => {
    filText = NY
    const h = await laddaUpp()
    const klar = h.find((x) => x.event === 'complete')
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(klar?.data.data.fannsRedan).toBeUndefined()
    expect(sparad?.file_name).toBe('cv (2)')
    expect(sparad?.original_file_path).toMatch(/^users\/u1\/cv__v[a-z0-9]+\.pdf$/)
    expect(lagrade.map((l) => l.sokvag)).not.toContain('users/u1/cv.pdf')
    expect(lagrade[0].sokvag).toBe(sparad?.original_file_path)
    expect(sparad?.cv_text).toBe(maskaLagradCvText(NY))
  })

  it('en tredje version jämförs också mot den andra: samma innehåll som den öppnas', async () => {
    rader.push({ id: 'andra', file_name: 'cv (2)', original_file_path: 'users/u1/cv__vabc123.pdf', cv_text: maskaLagradCvText(NY) })
    filText = NY
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'complete')?.data.data.id).toBe('andra')
    expect(sparad).toBeNull()
  })

  it('annat innehåll vid full gratiskvot: nej efter inläsningen, inget sparas och ingen fil lagras', async () => {
    rader.push({ id: 'annat', file_name: 'annat', original_file_path: 'users/u1/annat.pdf', cv_text: 'x' })
    filText = NY
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')?.data.code).toBe('CV_LIMIT_REACHED')
    expect(sparad).toBeNull()
    expect(lagrade).toHaveLength(0)
    expect(struktureringar).toBe(0)
  })

  it('annat innehåll utan verifierad e-post: samma spärr som för ett nytt CV', async () => {
    profil = { ...profil, email_verified_at: null }
    filText = NY
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')?.data.code).toBe('EMAIL_NOT_VERIFIED')
    expect(sparad).toBeNull()
  })

  it('annat innehåll för betalande: sparas som nytt utan kvotspärr', async () => {
    betalt = true
    rader.push({ id: 'annat', file_name: 'annat', original_file_path: 'users/u1/annat.pdf', cv_text: 'x' })
    filText = NY
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(sparad?.file_name).toBe('cv (2)')
  })

  it('en rad som sparats omaskad (efter Ersätt förr) matchar inte och sparas som ny', async () => {
    rader[0].cv_text = GAMMAL
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'complete')?.data.data.fannsRedan).toBeUndefined()
    expect(sparad?.id).toBe('nytt')
  })

  it('texten omskriven av byggaren men samma fil byte för byte: det befintliga öppnas', async () => {
    rader[0].cv_text = 'Mira Vallgren\nmira@exempel.se\n\nSAMMANFATTNING\nOmskriven ur strukturen'
    lagringen['users/u1/cv.pdf'] = FILEN
    const h = await laddaUpp()
    const klar = h.find((x) => x.event === 'complete')
    expect(klar?.data.data.id).toBe('gammalt')
    expect(klar?.data.data.fannsRedan).toBe(true)
    expect(nedladdningar).toEqual(['users/u1/cv.pdf'])
    expect(sparad).toBeNull()
    expect(lagrade).toHaveLength(0)
  })

  it('samma text behöver ingen nedladdning av den sparade filen', async () => {
    await laddaUpp()
    expect(nedladdningar).toEqual([])
  })

  it('ett nytt filnamn sparas som förut, på grundvägen och med sitt eget namn', async () => {
    const h = await laddaUpp('cv-nytt.pdf')
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(sparad?.original_file_path).toBe('users/u1/cv-nytt.pdf')
    expect(sparad?.file_name).toBe('cv-nytt')
  })
})
