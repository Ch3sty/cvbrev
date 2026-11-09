/**
 * /verktyg/rekryteringstester/prova (docs/plan-konvertering.md, C9).
 *
 * Fem matrislogikfrågor utan konto. Sidan är noindex med canonical till
 * verktygssidan, som är den vi vill ranka på. Till skillnad från
 * /verktyg/rekryteringstester redirectar vi inte inloggade härifrån: den
 * som redan har konto och landar här ska kunna göra provet i fred.
 *
 * Skissen docs/design/skiss-prov-konto-2026-11-09.html (godkänd 2026-11-09):
 * provet ligger i flödesskalet med logga och Logga in i toppraden, utan den
 * publika menyn och sidfoten (src/lib/flodessidor.ts). H1, ingressen och
 * länken "Läs om rekryteringstester" står i intron. Metadata orörd.
 */

import type { Metadata } from 'next'
import PubliktSida from '@/components/publikt/PubliktSida'
import ProvaFlow from './ProvaFlow'

const BASE_URL = 'https://www.jobbcoach.ai'

export const metadata: Metadata = {
  title: 'Prova ett rekryteringstest gratis | jobbcoach.ai',
  description:
    'Fem matrislogikfrågor av samma typ som i skarpa rekryteringstester. Inget konto behövs och du ser resultatet direkt.',
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE_URL}/verktyg/rekryteringstester` },
}

export default function ProvaSida() {
  return (
    <PubliktSida>
      <ProvaFlow />
    </PubliktSida>
  )
}
