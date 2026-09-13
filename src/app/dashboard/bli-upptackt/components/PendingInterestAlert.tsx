'use client';

import Link from 'next/link';
import StatusRow from '@/components/shell/StatusRow';

/**
 * Prioriterat larm högst upp på Bli upptäckt när det finns obesvarade
 * intressen. Renderar ingenting när allt är besvarat. Det här är vyns varma
 * statusrad, alltså sidans orange bläck.
 *
 * Kortet fetchade förut /api/candidate/interests vid mount, och
 * MessagesShortcut strax intill hämtade samma svar en gång till. Siffran
 * räknas nu på servern i getPageData.ts och kommer hit som prop.
 */
export default function PendingInterestAlert({ pending }: { pending: number }) {
  if (pending === 0) return null;

  return (
    <StatusRow
      tone="warm"
      showDot
      action={
        <Link
          href="/dashboard/meddelanden"
          className="inline-flex min-h-11 items-center text-sm font-medium text-accent-ink underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
        >
          Svara
        </Link>
      }
    >
      {pending === 1
        ? 'En rekryterare vill komma i kontakt'
        : `${pending} rekryterare vill komma i kontakt`}
    </StatusRow>
  );
}
