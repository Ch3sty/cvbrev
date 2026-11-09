import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sparaProvUtfall } from '../prov-utfall.server'

const klient = (rpc: (...a: unknown[]) => unknown) => ({ rpc }) as unknown as SupabaseClient<any>

describe('sparaProvUtfall', () => {
  it('anropar databasfunktionen med provets token', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null })
    await sparaProvUtfall(klient(rpc), 'abc')
    expect(rpc).toHaveBeenCalledWith('spara_prov_utfall', { p_token: 'abc' })
  })

  it('fäller aldrig rättningen, varken vid fel i svaret eller vid undantag', async () => {
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      sparaProvUtfall(klient(vi.fn().mockResolvedValue({ data: null, error: { message: 'nere' } })), 'abc')
    ).resolves.toBeUndefined()
    await expect(sparaProvUtfall(klient(vi.fn().mockRejectedValue(new Error('nät'))), 'abc')).resolves.toBeUndefined()
    expect(logg).toHaveBeenCalledTimes(2)
    logg.mockRestore()
  })
})

describe('hamtaProvUtfall', () => {
  it('läser prov_utfall i sidor om 1000 och bara dagens provtyp', async () => {
    const { hamtaProvUtfall } = await import('../prova-percentil.server')
    const sidor = [new Array(1000).fill({ ratt: 4 }), [{ ratt: 5 }, { ratt: 2 }]]
    const anrop: unknown[][] = []
    const kedja: Record<string, unknown> = {}
    for (const m of ['select', 'order']) kedja[m] = () => kedja
    kedja.eq = (...a: unknown[]) => (anrop.push(['eq', ...a]), kedja)
    kedja.range = (fran: number) => Promise.resolve({ data: sidor[fran / 1000], error: null })
    const from = vi.fn(() => kedja)
    const utfall = await hamtaProvUtfall({ from } as unknown as SupabaseClient<any>)
    expect(from).toHaveBeenCalledWith('prov_utfall')
    expect(anrop).toContainEqual(['eq', 'testtyp', 'matris-prova'])
    expect(anrop).toContainEqual(['eq', 'totalt', 5])
    expect(utfall).toHaveLength(1002)
    expect(utfall?.slice(-2)).toEqual([5, 2])
  })
})
