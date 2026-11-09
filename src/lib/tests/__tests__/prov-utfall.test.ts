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
