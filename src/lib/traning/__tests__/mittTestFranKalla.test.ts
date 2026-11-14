import { describe, expect, it, vi } from 'vitest'
import { nyssSattAvKallan, sattMittTestFranKalla } from '../mittTestFranKalla.server'

const NU = Date.parse('2026-11-14T12:00:00Z')

describe('nyssSattAvKallan', () => {
  it('räknar en plan med samma val från samma landning som satt', () => {
    expect(nyssSattAvKallan({ mitt_test: 'alva', skapad_at: '2026-11-14T11:59:58Z' }, 'alva', NU)).toBe(true)
  })
  it('inte när valet skiljer sig', () => {
    expect(nyssSattAvKallan({ mitt_test: 'matrigma', skapad_at: '2026-11-14T11:59:58Z' }, 'alva', NU)).toBe(false)
  })
  it('inte när planen är äldre än fem minuter', () => {
    expect(nyssSattAvKallan({ mitt_test: 'alva', skapad_at: '2026-11-14T11:50:00Z' }, 'alva', NU)).toBe(false)
  })
  it('inte utan skapad_at', () => {
    expect(nyssSattAvKallan({ mitt_test: 'alva', skapad_at: null }, 'alva', NU)).toBe(false)
  })
})

/** Liten låtsasklient: maybeSingle ger planen, upsert lyckas. */
function klient(plan: Record<string, unknown> | null) {
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const kedja = {
    select: () => kedja,
    eq: () => kedja,
    maybeSingle: () => Promise.resolve({ data: plan, error: null }),
    upsert,
  }
  return { admin: { from: () => kedja } as never, upsert }
}

describe('sattMittTestFranKalla, två renderingar', () => {
  it('första renderingen skriver planen och svarar satt', async () => {
    const { admin, upsert } = klient(null)
    const r = await sattMittTestFranKalla(admin, 'u1', { via: 'smakprov', slug: 'alva-labs-logiktest', mitt_test: 'alva' })
    expect(upsert).toHaveBeenCalledOnce()
    expect(r.satt).toBe(true)
  })
  it('andra renderingen (router.refresh) svarar också satt', async () => {
    const { admin, upsert } = klient({ mitt_test: 'alva', provdatum: null, skapad_at: new Date(Date.now() - 2000).toISOString() })
    const r = await sattMittTestFranKalla(admin, 'u1', { via: 'smakprov', slug: 'alva-labs-logiktest', mitt_test: 'alva' })
    expect(upsert).not.toHaveBeenCalled()
    expect(r).toEqual({ mittTest: 'alva', satt: true, provdatumSkarm: false })
  })
  it('en äldre plan med eget val rörs inte och räknas inte', async () => {
    const { admin } = klient({ mitt_test: 'iprov', provdatum: null, skapad_at: '2026-10-01T10:00:00Z' })
    const r = await sattMittTestFranKalla(admin, 'u1', { via: 'artikel', slug: 'alva-labs-logiktest', mitt_test: 'alva' })
    expect(r).toEqual({ mittTest: 'iprov', satt: false, provdatumSkarm: true })
  })
})
