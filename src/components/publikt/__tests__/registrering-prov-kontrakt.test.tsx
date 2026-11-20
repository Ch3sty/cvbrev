/**
 * Registreringens resultatpanel efter provet och genomgången efter kontot,
 * omgång 2 steg C. Ombyggnaden får rita om ProvPanel, ProvBrickor och
 * ProvTypGenomgang, men inte det här: panelen visar besökarens resultat som
 * en bild med texten ur brickorText (vilka som blev fel), utan resultat inget
 * påhittat tal, tokens från adressen sparas i fliken (smakprovTillSession),
 * och genomgången visar en post per uppgift med rätt svar först efter kontot.
 */

import { cleanup, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn(), identifyUser: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))
vi.mock('@/components/auth/GoogleSignInButton', () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
  AuthDivider: () => null,
}))

import RegisterFlode from '@/components/registrering/RegisterFlode'
import { smakprovTillSession } from '@/components/registrering/RegisterKontoSteg'
import { registerIngang } from '@/components/registrering/intent'
import { brickorText } from '@/components/registrering/registrering-copy'
import ProvBrickor from '@/components/publikt/ProvBrickor'
import ProvTypGenomgang from '@/app/dashboard/tester/prov/[token]/ProvTypGenomgang'
import { genomgaProv, underlagFor, valjProv } from '@/lib/tests/prov-typer.server'
import type { NyProvTyp } from '@/lib/tests/prov-typer'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const TOKEN = '88888888-9999-4aaa-8bbb-cccccccccccc'
const ur = (q: string) => {
  const p = new URLSearchParams(q)
  return (n: string) => p.get(n)
}

beforeEach(() => {
  cleanup()
  sessionStorage.clear()
})

describe('kontosteget efter provet', () => {
  it.each<[string, { ratt: number; totalt: number; fel: number[]; typ?: NyProvTyp }]>([
    ['matrisen', { ratt: 4, totalt: 5, fel: [2] }],
    ['numeriskt', { ratt: 3, totalt: 5, fel: [0, 4], typ: 'numerisk' }],
    ['I-provet', { ratt: 5, totalt: 6, fel: [5], typ: 'iprov' }],
  ])('%s: resultatet som bild med brickornas text', (_n, provResultat) => {
    render(<RegisterFlode ingang={registerIngang(ur(`test=${TOKEN}`))} provResultat={provResultat} />)
    expect(screen.getByRole('img', { name: brickorText(provResultat.fel, provResultat.totalt) })).toBeTruthy()
    expect(document.body.textContent).toContain(String(provResultat.ratt))
  })

  it('utan resultat: ingen bild och inget tal', () => {
    render(<RegisterFlode ingang={registerIngang(ur(`test=${TOKEN}`))} provResultat={null} />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('tokens ur adressen sparas i fliken för hämtningen efter kontot', () => {
    smakprovTillSession({ typ: 'test', token: TOKEN })
    smakprovTillSession({ typ: 'personlighet', token: TOKEN })
    expect(sessionStorage.getItem('jc_pending_test')).toBe(TOKEN)
    expect(sessionStorage.getItem('jc_pending_personlighet')).toBe(TOKEN)
  })
})

describe('ProvBrickor', () => {
  it('en bild med texten ur brickorText', () => {
    render(<ProvBrickor totalt={5} fel={[1, 3]} rutnat={[]} />)
    const bild = screen.getByRole('img', { name: brickorText([1, 3], 5) })
    expect(bild).toBeTruthy()
  })
})

describe('genomgången efter kontot (ProvTypGenomgang)', () => {
  it.each<[NyProvTyp]>([['figurserie'], ['verbal'], ['numerisk'], ['deduktiv'], ['spatial'], ['talserie'], ['ordforrad'], ['iprov']])(
    '%s: en post per uppgift',
    (typ) => {
      const refs = valjProv(typ, TOKEN, TOKEN)
      const uppgifter = genomgaProv(refs, refs.map(() => ({ svar: null, selected: -1, correct: false })))
      render(<ProvTypGenomgang uppgifter={uppgifter} underlag={underlagFor(refs)} token={TOKEN} />)
      const lista = screen.getAllByRole('list')[0]
      expect(within(lista).getAllByRole('listitem').filter((li) => li.parentElement === lista)).toHaveLength(refs.length)
    }
  )
})
