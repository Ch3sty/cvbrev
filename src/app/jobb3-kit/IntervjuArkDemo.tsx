'use client'

/**
 * Arket "När är intervjun?" med valen av tjänst, för kitsidan (Jobbsöket
 * omgång 2, byggspecen 9.4, efter klicktestet 2026-11-21). Kortet ritas bara
 * för ett konto utan intervju på gång, så här går valen att granska utan
 * konto: tryck på "Lägg in intervjun". Tre påhittade tjänster, en med lång
 * titel och långt företagsnamn. Inget sparas: kitsidan finns inte i
 * produktion, och Spara anropar ett API som kräver inloggning.
 */

import IntervjuFraga from '@/components/jobb3/intervju/IntervjuFraga'
import type { ValbarForIntervju } from '@/lib/jobbsok/intervju'

const VALBARA: ValbarForIntervju[] = [
  { id: 'demo-ue', company: 'Umeå Energi', jobTitle: 'Ekonomiassistent', bokstaver: 'UE', appliedAt: '2026-11-10' },
  {
    id: 'demo-lang',
    company: 'Västerbottens läns landsting, Regionservice ekonomi och upphandling',
    jobTitle: 'Redovisningsekonom med inriktning mot leverantörsreskontra och bokslut, vikariat',
    bokstaver: 'VL',
    appliedAt: '2026-11-05',
  },
  { id: 'demo-no', company: 'Norrmejerier', jobTitle: 'Ekonomiassistent', bokstaver: 'NO', appliedAt: '2026-11-02' },
]

export function IntervjuArkDemo() {
  return (
    <div style={{ maxWidth: 520 }}>
      <IntervjuFraga tom valbara={VALBARA} />
    </div>
  )
}
