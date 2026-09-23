// @vitest-environment node
/**
 * OG-routen för Räkna ut: en PNG i 1200 × 630 för varje kalkylator, 404 för
 * okänd slug, och talet i bilden är sammanfattningens tal.
 */
import { describe, expect, it } from 'vitest'
import { GET } from '../route'
import { talStorlek } from '../bild'
import { SLUGGAR } from '@/lib/rakna/delning'

const PNG = [0x89, 0x50, 0x4e, 0x47]

function anrop(slug: string, qs = '') {
  return GET(new Request(`https://www.jobbcoach.ai/api/og/rakna-ut/${slug}${qs ? `?${qs}` : ''}`), {
    params: Promise.resolve({ slug }),
  })
}

function bredd(buf: Uint8Array): number {
  return (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19]
}
function hojd(buf: Uint8Array): number {
  return (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23]
}

describe('GET /api/og/rakna-ut/[slug]', () => {
  it('ritar lön efter skatt med parametrarna som PNG i 1200 × 630', async () => {
    const svar = await anrop('lon-efter-skatt', 'lon=45000&kommun=G%C3%B6teborg')
    expect(svar.status).toBe(200)
    expect(svar.headers.get('content-type')).toBe('image/png')
    expect(svar.headers.get('cache-control')).toContain('s-maxage')
    const buf = new Uint8Array(await svar.arrayBuffer())
    expect(Array.from(buf.slice(0, 4))).toEqual(PNG)
    expect(bredd(buf)).toBe(1200)
    expect(hojd(buf)).toBe(630)
  }, 30_000)

  it('ritar en bild för var och en av de nio utan parametrar', async () => {
    for (const slug of SLUGGAR) {
      const svar = await anrop(slug)
      expect(svar.status, slug).toBe(200)
      const buf = new Uint8Array(await svar.arrayBuffer())
      expect(Array.from(buf.slice(0, 4)), slug).toEqual(PNG)
    }
  }, 60_000)

  it('svarar 404 för en okänd kalkylator', async () => {
    const svar = await anrop('bolan')
    expect(svar.status).toBe(404)
  })

  it('krymper talet så att långa belopp får plats bredvid räknaren', () => {
    expect(talStorlek('7 av 10')).toBe(150)
    expect(talStorlek('+263 402 kr')).toBeLessThan(150)
    expect(talStorlek('+263 402 kr') * '+263 402 kr'.length * 0.56).toBeLessThanOrEqual(700)
  })
})
