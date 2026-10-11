/**
 * Uppsägningsflödet (spec-rummen 23.7 a): rabatten visas bara när kundens
 * paket är Jobbcoach Premium per månad, och priset efter rabatten läses ur
 * PLANS.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { PlanKey } from '@/lib/plans/plans'

vi.mock('@/components/shell/Sheet', () => ({
  default: ({ open, children, footer }: { open: boolean; children: React.ReactNode; footer?: React.ReactNode }) =>
    open ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))

import CancelFlowModal from '../components/CancelFlowModal'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
})

async function tillErbjudandet(paket: PlanKey | null) {
  render(<CancelFlowModal open onClose={() => {}} paket={paket} />)
  fireEvent.click(screen.getByText('För dyrt'))
  fireEvent.click(screen.getByRole('button', { name: 'Fortsätt' }))
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Fortsätt' })).toBeNull())
}

describe('CancelFlowModal, för dyrt', () => {
  it('Premium per månad får rabatten, med ordinarie pris ur PLANS', async () => {
    await tillErbjudandet('all_month')
    expect(screen.getByText(/sedan ordinarie 149 kr/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Fortsätt för 49 kr i månaden' })).toBeTruthy()
  })

  it('en veckokund får ingen rabatt, bara tacket och Avsluta ändå', async () => {
    await tillErbjudandet('test_week')
    expect(screen.queryByText(/49 kr/)).toBeNull()
    expect(screen.getByText('Tack, det tar vi med oss')).toBeTruthy()
    expect(screen.getByText('Avsluta ändå')).toBeTruthy()
  })
})
