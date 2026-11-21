/**
 * Appens Hem i Rekryteringstester (Testklar) ritar webbens sida med iAppen,
 * så att kortet "Vilken tjänst gäller provet?" aldrig ritas i appen
 * (Jobbsöket omgång 2, byggspec 9.14 och 9.19).
 */
import { describe, expect, it, vi } from 'vitest'

const TesterHemSida = vi.fn((_p: unknown) => null)
vi.mock('@/app/dashboard/tester/HemSida', () => ({ TesterHemSida: (p: unknown) => TesterHemSida(p) }))

import AppTesterHem from '../page'

describe('/app/tester', () => {
  it('ritar TesterHemSida med iAppen satt', async () => {
    const searchParams = Promise.resolve({})
    const el = (await AppTesterHem({ searchParams })) as { type: unknown; props: { iAppen?: boolean; searchParams: unknown } }
    expect(el.props.iAppen).toBe(true)
    expect(el.props.searchParams).toBe(searchParams)
    // Elementets typ är den mockade TesterHemSida ur HemSida.
    const typ = el.type as (p: unknown) => unknown
    typ(el.props)
    expect(TesterHemSida).toHaveBeenCalledWith(expect.objectContaining({ iAppen: true }))
  })
})
