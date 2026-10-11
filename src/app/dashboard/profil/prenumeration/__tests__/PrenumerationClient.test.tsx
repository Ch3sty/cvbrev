/**
 * Prenumerationssidan i våg 5 (spec-rummen 17.3, copy-premium avsnitt 3,
 * art-director 24.2 fråga 3): rubriken, statusen som väggens rad och
 * kortet för Jobbcoach Premium i de tre lägena.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard/profil/prenumeration',
}))
vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))
vi.mock('@/components/rum/RumHuvud', () => ({
  default: ({ title, description }: { title: string; description?: string }) => (
    <header>
      <h1>{title}</h1>
      {description ? <p data-testid="vaggrad">{description}</p> : null}
    </header>
  ),
}))
vi.mock('../components/CancelFlowModal', () => ({ default: () => null }))

import PrenumerationClient, { type PrenumerationClientProps } from '../PrenumerationClient'

const tomma = { rader: [], totalt: 0, badaSparen: false }
const bas: PrenumerationClientProps = {
  tillstand: 'free',
  scope: null,
  track: null,
  paket: null,
  premiumUntil: null,
  premiumSource: null,
  harStripePrenumeration: false,
  blockeringar: tomma,
}

// jsdom saknar scrollIntoView; sidan rullar fram svarsraden efter ett byte.
Element.prototype.scrollIntoView ??= function () {}

beforeEach(() => vi.restoreAllMocks())

describe('PrenumerationClient', () => {
  it('rubriken heter Prenumeration, gratis ser Premium och köpknappen', () => {
    const { container } = render(<PrenumerationClient {...bas} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Prenumeration' })).toBeTruthy()
    // Statusen är väggens rad, ingen statusrad på golvet och ingen ingress.
    expect(screen.getByTestId('vaggrad').textContent).toBe('Du är på gratisnivån')
    expect(screen.queryByText('Vad du har i dag, och vad som öppnar resten.')).toBeNull()
    // Exakt en kopparknapp, och ingen kopparkant.
    expect(container.querySelectorAll('.knapp-primar')).toHaveLength(1)
    expect(container.innerHTML).not.toMatch(/border-koppar/)
    expect(screen.getByRole('heading', { name: 'Jobbcoach Premium' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Premium, 149 kr i månaden' })).toBeTruthy()
    expect(screen.getByText('149 kr i månaden, säg upp när du vill.')).toBeTruthy()
    // Inga spår, inga längder, inga tre kort.
    expect(screen.queryByText(/CV-paketet|Träningspaketet|Dagspasset|kr i veckan|kvartal/)).toBeNull()
    expect(screen.queryByRole('radiogroup')).toBeNull()
  })

  it('aktiv Premium: statusraden med nästa dragning och hanteringen', () => {
    render(
      <PrenumerationClient
        {...bas}
        tillstand="all"
        scope="allt"
        track="allt"
        paket="all_month"
        premiumUntil="2026-11-11T10:00:00Z"
        harStripePrenumeration
      />
    )
    expect(screen.getByTestId('vaggrad').textContent).toBe(
      'Jobbcoach Premium, 149 kr i månaden. Nästa dragning 11 november.'
    )
    // Ingen platta och inget kort: Hantera först, sedan Allt i Premium som rader.
    expect(screen.queryByText('Du har Premium')).toBeNull()
    expect(screen.getByText('Byt betalkort')).toBeTruthy()
    expect(screen.getByText('Kvitton')).toBeTruthy()
    expect(screen.getByText('Säg upp')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Köp Premium/ })).toBeNull()
    const allt = screen.getByRole('region', { name: 'Allt i Premium' })
    expect(allt.textContent).toContain('Jobbcoachen, fråga så mycket du vill')
    const hantera = screen.getByRole('region', { name: 'Hantera' })
    expect(hantera.compareDocumentPosition(allt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('admin-tilldelad Premium: bara meningen, inget att hantera', () => {
    const { container } = render(
      <PrenumerationClient {...bas} tillstand="all" scope="allt" premiumSource="admin" />
    )
    expect(screen.getByText('Din tillgång är tilldelad av oss och hanteras inte i ett abonnemang.')).toBeTruthy()
    expect(screen.queryByText('Byt betalkort')).toBeNull()
    expect(container.querySelectorAll('.knapp-primar')).toHaveLength(0)
  })

  it('uppsagd Premium: gäller till datumet, förnyas inte', () => {
    render(
      <PrenumerationClient
        {...bas}
        tillstand="all"
        scope="allt"
        paket="all_month"
        premiumUntil="2026-11-11T10:00:00Z"
        harStripePrenumeration
        uppsagd
      />
    )
    expect(screen.getByTestId('vaggrad').textContent).toBe(
      'Jobbcoach Premium, uppsagt. Gäller till 11 november, förnyas inte.'
    )
    expect(screen.getByText('Ångra uppsägningen')).toBeTruthy()
  })

  it('befintlig veckokund: paketet med namn, byte till Premium per månad', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ upgraded: true, planKey: 'all_month' }), { status: 200 })
    )
    render(
      <PrenumerationClient
        {...bas}
        tillstand="track"
        scope="tester"
        track="tester"
        paket="test_week"
        premiumUntil="2026-10-17T10:00:00Z"
        harStripePrenumeration
      />
    )
    expect(screen.getByTestId('vaggrad').textContent).toBe('Träningspaketet, 79 kr i veckan, förnyas 17 oktober')
    expect(screen.getByText(/Det du redan har betalat för resten av veckan drar vi av/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Köp Premium, 149 kr i månaden' }))
    await waitFor(() => expect(f).toHaveBeenCalled())
    const [url, init] = f.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/stripe/create-upgrade-session')
    expect(JSON.parse(init.body as string).planKey).toBe('all_month')
    await waitFor(() => expect(screen.getByText('Du har nu Jobbcoach Premium')).toBeTruthy())
  })
})
