/**
 * Efter sparandet ska listan läsas om (felet efter klicktestet 2026-11-21).
 *
 * Uppmätt i webbläsaren 2026-11-22: när ?logga=1 rensades med
 * window.history.replaceState behöll Next sidans gamla träd under den nya
 * adressen, och router.refresh() hämtade nya data (svaret bar tjänsten) som
 * aldrig lades in. Det gällde vilken ordning anropen än kom i. Rättningen
 * rensar adressen med router.replace, som hämtar sidan om i samma steg.
 *
 * Testet låser det: med ?logga=1 i adressen anropas router.replace mot den
 * rena adressen, och window.history.replaceState anropas aldrig. Sidan
 * monteras om efter bytet (sökparametrarna ingår i sidans nyckel), och
 * kvittensen ska stå kvar i den nya monteringen. Utan ?logga=1 räcker
 * router.refresh(). Arket, listan och väggen är enkla stand-ins.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

const refresh = vi.fn()
const replace = vi.fn()
const summering = vi.fn(async () => {})
let sokParametrar = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(sokParametrar),
}))
vi.mock('@/components/rum/Topprad', () => ({ default: () => null }))
vi.mock('@/context/notificationcontext', () => ({
  useNotification: () => ({ successWithActivity: vi.fn(), success: vi.fn(), logActivity: vi.fn(async () => {}) }),
}))
vi.mock('@/contexts/DashboardDataContext', () => ({ useDashboardData: () => ({ refresh: summering }) }))
vi.mock('@/components/jobb3/kit', async (orig) => ({
  ...(await orig<typeof import('@/components/jobb3/kit')>()),
  JobbVagg: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('../Lista', () => ({
  ListaVagg: () => null,
  ListaGolv: ({ kvittens }: { kvittens: ReactNode }) => <div data-testid="golv">{kvittens}</div>,
}))
vi.mock('../Statistik', () => ({ StatistikVagg: () => null, StatistikGolv: () => null }))
vi.mock('../Rapport', () => ({ RapportVagg: () => null, RapportGolv: () => null }))
vi.mock('../SmaArk', () => ({ MalArk: () => null }))
// Arket som det riktiga: onKlar med serverns svar, sedan onClose.
vi.mock('../LoggaArk', () => ({
  default: ({ open, onKlar, onClose }: { open: boolean; onKlar: (r: unknown) => void; onClose: () => void }) =>
    open ? (
      <button
        type="button"
        onClick={() => {
          onKlar({
            typ: 'sokt',
            nytt: true,
            data: { id: 'app1', job_title: 'Redovisningsassistent', company: 'QA Testbolag U', application_channel: 'ad', current_status: 'test_invited' },
          })
          onClose()
        }}
      >
        Spara i arket
      </button>
    ) : null,
}))

import SoktaVy, { KVITTENS_EFTER_BYTET } from '../SoktaVy'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'

const DATA = { veckansMal: { mal: 3 } } as unknown as SoktaTjansterData
const originalReplace = window.history.replaceState.bind(window.history)
let historikRensningar: string[] = []

function oppna(sok: string) {
  sokParametrar = sok
  originalReplace(null, '', `/dashboard/sokta-tjanster?${sok}`)
  return render(<SoktaVy data={DATA} forifyllt={{ job_title: 'Redovisningsassistent', company: 'QA Testbolag U', fran: 'test-hem' }} />)
}

beforeEach(() => {
  refresh.mockClear()
  replace.mockClear()
  summering.mockClear()
  KVITTENS_EFTER_BYTET.k = null
  historikRensningar = []
  vi.spyOn(window.history, 'replaceState').mockImplementation((d, u, url) => {
    historikRensningar.push(String(url))
    originalReplace(d, u, url)
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  originalReplace(null, '', '/')
})

describe('sparandet med ?logga=1 i adressen', () => {
  it('testvägen: router.replace mot den rena adressen, en gång, aldrig history.replaceState', () => {
    oppna('logga=1&tjanst=Redovisningsassistent&arbetsgivare=QA%20Testbolag%20U&fran=test-hem')
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith('/dashboard/sokta-tjanster', { scroll: false })
    // history.replaceState lämnade sidans gamla träd kvar, och uppdateringen lades aldrig in.
    expect(historikRensningar).toEqual([])
    expect(summering).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('golv').textContent).toContain('QA Testbolag U står nu som kallad till test')
  })

  it('kvittensen står kvar när sidan monteras om efter bytet, och bara en gång', () => {
    const forsta = oppna('logga=1&tjanst=Redovisningsassistent&arbetsgivare=QA%20Testbolag%20U&fran=test-hem')
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))
    forsta.unmount()

    // Den nya sidan efter router.replace: ren adress, nya data.
    const andra = oppna('')
    expect(screen.getByTestId('golv').textContent).toContain('QA Testbolag U står nu som kallad till test')
    andra.unmount()

    // Nästa besök har ingen kvittens.
    oppna('')
    expect(screen.getByTestId('golv').textContent).not.toContain('står nu som kallad till test')
  })

  it('utan fran (till exempel från en träff): samma byte av adress', () => {
    sokParametrar = ''
    oppna('logga=1&tjanst=Redovisningsassistent&arbetsgivare=QA%20Testbolag%20U')
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))
    expect(replace).toHaveBeenCalledWith('/dashboard/sokta-tjanster', { scroll: false })
    expect(historikRensningar).toEqual([])
  })
})

describe('sparandet utan ?logga=1', () => {
  it('vanlig loggning från knappen: router.refresh(), adressen rörs inte', () => {
    oppna('vy=lista')
    fireEvent.click(screen.getAllByRole('button', { name: 'Logga sökt tjänst' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
    expect(historikRensningar).toEqual([])
  })
})
