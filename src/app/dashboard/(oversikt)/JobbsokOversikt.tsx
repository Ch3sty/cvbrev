'use client'

/**
 * Jobbsöket i tillstånd C: ett tal med sin fördelning
 * (regel 5 i docs/design/analys-visuell-linje-2026-09-22.html). "11 sökta i
 * september", en segmentrad för tysta, väntande och intervjuer, och en
 * mening om svaren och veckan. Aldrig svarsfrekvens: den bor på
 * ansökningssidan. Ingen egen länk: Logga sökt tjänst står en gång, på
 * väggen (spec 16.2 fråga 14).
 */

import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary'
import Fordelning from '@/components/shell/Fordelning'

interface JobbsokOversiktProps {
  summary: ApplicationsSummary
  fordelning?: { tysta: number; vantar: number; intervju: number }
}

function manad(now: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { month: 'long', timeZone: 'Europe/Stockholm' }).format(now)
}


export default function JobbsokOversikt({ summary, fordelning }: JobbsokOversiktProps) {
  const f = fordelning ?? {
    tysta: summary.followUpCount,
    vantar: Math.max(0, summary.waitingCount - summary.followUpCount),
    intervju: summary.interviewCount,
  }
  const svar =
    summary.replyCount === 0
      ? 'Inga svar än.'
      : `${summary.replyCount} svar hittills.`
  const vecka =
    summary.weekCount === 0
      ? 'Du har inte sökt något jobb den här veckan än.'
      : summary.weekCount === 1
        ? 'En ansökan den här veckan.'
        : `${summary.weekCount} ansökningar den här veckan.`

  return (
    <section className="rounded-xl border border-kant bg-papper p-4 sm:p-6" aria-label="Ditt jobbsök">
      <Fordelning
        total={summary.total}
        unit={`sökta i ${manad(new Date())}`}
        mening={`${svar} ${vecka}`}
        segments={[
          { label: 'tysta över två veckor', value: f.tysta, tone: 'ink' },
          { label: 'väntar svar', value: f.vantar, tone: 'stark' },
          { label: f.intervju === 1 ? 'intervju' : 'intervjuer', value: f.intervju, tone: 'positiv' },
        ]}
      />
    </section>
  )
}
