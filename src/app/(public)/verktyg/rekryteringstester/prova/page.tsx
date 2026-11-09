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
import { arNyProvTyp, provTypUrAdress } from '@/lib/tests/prov-typer'
import { artikelUppgift } from '@/lib/tests/prov-typer.server'

const BASE_URL = 'https://www.jobbcoach.ai'

export const metadata: Metadata = {
  title: 'Prova ett rekryteringstest gratis | jobbcoach.ai',
  description:
    'Fem matrislogikfrågor av samma typ som i skarpa rekryteringstester. Inget konto behövs och du ser resultatet direkt.',
  robots: { index: false, follow: true },
  alternates: { canonical: `${BASE_URL}/verktyg/rekryteringstester` },
}

/**
 * ?typ= väljer provet (spec-prov-fler-typer-2026-11-09 avsnitt 2): figurer,
 * verbal, numerisk, deduktiv, spatial, talserie, ordforrad och iprov. Utan
 * parameter matrislogik som förut. Introts exempel är en riktig uppgift ur
 * typens bank, utan facit, ritad på servern.
 */
export default async function ProvaSida({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const typ = provTypUrAdress(Array.isArray(sp.typ) ? sp.typ[0] : sp.typ)
  const exempel = arNyProvTyp(typ) ? artikelUppgift(typ, 'prova-intro') : null
  return (
    <PubliktSida>
      <ProvaFlow key={typ} typ={typ} exempel={exempel} />
    </PubliktSida>
  )
}
