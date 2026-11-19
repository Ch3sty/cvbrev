import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))

import { HintVisad, hintKlickad, redanVisad, type HintKontext } from '../HintSparning'
import type { Hint } from '@/lib/tester/v4/typer'

const hintar: Pick<Hint, 'id' | 'typ' | 'testtyp'>[] = [
  { id: 'nivakoll_saknas:spatial', typ: 'nivakoll_saknas', testtyp: 'spatial' },
  { id: 'svagt_monster:talserie', typ: 'svagt_monster', testtyp: 'talserie' },
]
const iprov: HintKontext = { planTest: 'iprov', planTyper: ['ordforrad', 'spatial', 'talserie'] }
const fritt: HintKontext = { planTest: null, planTyper: [] }

beforeEach(() => {
  capture.mockClear()
  window.localStorage.clear()
})

describe('HintSparning', () => {
  it('hint_visad en gång per hint och dag', () => {
    const { unmount } = render(<HintVisad hintar={hintar} idag="2026-11-19" kontext={iprov} />)
    expect(capture).toHaveBeenCalledTimes(2)
    expect(capture.mock.calls[0][0]).toBe('hint_visad')
    expect(capture.mock.calls[0][1]).toMatchObject({ hint_typ: 'nivakoll_saknas', plan_test: 'iprov', i_planens_test: true, plattform: 'webb', plats: 0 })
    unmount()
    render(<HintVisad hintar={hintar} idag="2026-11-19" kontext={iprov} />)
    expect(capture).toHaveBeenCalledTimes(2)
    expect(redanVisad('svagt_monster:talserie', '2026-11-19')).toBe(true)
  })

  it('nästa dag räknas den igen', () => {
    render(<HintVisad hintar={hintar.slice(0, 1)} idag="2026-11-19" kontext={fritt} />)
    render(<HintVisad hintar={hintar.slice(0, 1)} idag="2026-11-20" kontext={fritt} />)
    expect(capture).toHaveBeenCalledTimes(2)
  })

  it('hint_klickad med plats och utan plan', () => {
    hintKlickad(hintar[1], fritt, 2)
    expect(capture).toHaveBeenCalledWith('hint_klickad', expect.objectContaining({ hint_typ: 'svagt_monster', plats: 2, i_planens_test: false, plan_test: null }))
  })
})
