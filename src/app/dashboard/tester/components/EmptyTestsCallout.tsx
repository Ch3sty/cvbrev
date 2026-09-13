'use client';

/**
 * Tomt tillstånd på hubben: scen 96, kortrubrik, en mening, ink-knapp.
 * Vyns enda primära handling när användaren ännu inte gjort något test.
 */

import Link from 'next/link';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomTester } from '@/components/illustrations/EmptyStateIllustrations';

export default function EmptyTestsCallout() {
  return (
    <EmptyState
      illustration={IlluTomTester}
      title="Börja med logiktestet på grundnivå"
      description="Det är den vanligaste typen av begåvningstest och en mjuk start på mönsterigenkänning."
      action={
        <Link
          href="/dashboard/tester/matrislogik-grund"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          Starta första testet
        </Link>
      }
    />
  );
}
