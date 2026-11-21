/**
 * Efter sparandet på testvägen ska listan läsas om (felet efter klicktestet
 * 2026-11-21). Adressen ?logga=1 rensas med window.history.replaceState, som i
 * Next:s router blir en ACTION_RESTORE och kastar en router.refresh() som redan
 * är på väg. Testet låser att uppdateringen begärs och att adressen rensas
 * före den, aldrig efter. Arket, listan och väggen är utbytta mot enkla
 * stand-ins: här prövas bara SoktaVy:s ordning.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

const handelser: string[] = []
const refresh = vi.fn(() => {
  handelser.push(`refresh ${window.location.search}`)
})
const summering = vi.fn(async () => {})
let sokParametrar = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
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

import SoktaVy from '../SoktaVy'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'

const DATA = { veckansMal: { mal: 3 } } as unknown as SoktaTjansterData
const originalReplace = window.history.replaceState.bind(window.history)

function oppna(sok: string) {
  sokParametrar = sok
  originalReplace(null, '', `/dashboard/sokta-tjanster?${sok}`)
  render(<SoktaVy data={DATA} forifyllt={{ job_title: 'Redovisningsassistent', company: 'QA Testbolag U', fran: 'test-hem' }} />)
}

beforeEach(() => {
  handelser.length = 0
  refresh.mockClear()
  summering.mockClear()
  vi.spyOn(window.history, 'replaceState').mockImplementation((d, u, url) => {
    handelser.push(`rensa ${url}`)
    originalReplace(d, u, url)
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  originalReplace(null, '', '/')
})

describe('sparandet på testvägen', () => {
  it('begär uppdateringen efter att adressen rensats, och rensar bara en gång', () => {
    oppna('logga=1&tjanst=Redovisningsassistent&arbetsgivare=QA%20Testbolag%20U&fran=test-hem')
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(summering).toHaveBeenCalledTimes(1)
    // Ingen replaceState efter refresh: den hade kastat uppdateringen.
    expect(handelser).toEqual(['rensa /dashboard/sokta-tjanster', 'refresh '])
    // Kvittensen står kvar överst i listan.
    expect(screen.getByTestId('golv').textContent).toContain('QA Testbolag U står nu som kallad till test')
  })

  it('vanlig loggning utan ?logga i adressen: uppdateringen begärs, adressen rörs inte', () => {
    oppna('vy=lista')
    fireEvent.click(screen.getAllByRole('button', { name: 'Logga sökt tjänst' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Spara i arket' }))
    expect(handelser).toEqual(['refresh ?vy=lista'])
  })
})
