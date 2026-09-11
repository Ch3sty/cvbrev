/**
 * /verktyg/rekryteringstester/prova (docs/plan-konvertering.md, C9).
 *
 * Fem matrislogikfrågor utan konto. Sidan är noindex med canonical till
 * verktygssidan, som är den vi vill ranka på. Till skillnad från
 * /verktyg/rekryteringstester redirectar vi inte inloggade härifrån: den
 * som redan har konto och landar här ska kunna göra provet i fred.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
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
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Prova ett rekryteringstest
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
            Matrislogik är den vanligaste testtypen i svensk rekrytering. Här får du fem
            frågor att bryta ryggen av, utan konto och utan tidtagning.
          </p>
        </header>

        <ProvaFlow />

        <p className="mt-12 text-center text-sm text-neutral-600">
          Vill du veta mer om hur testerna fungerar?{' '}
          <Link
            href="/verktyg/rekryteringstester"
            className="font-medium text-neutral-900 underline underline-offset-4"
          >
            Läs om rekryteringstester
          </Link>
        </p>
      </div>
    </main>
  )
}
