'use client';

import { MessageSquareQuote } from '@/components/illustrations/RumIkoner';
import { interviewTips } from '@/lib/personalityTest/insights';
import type { BigFiveScores } from '@/lib/personalityTest/types';

export default function InterviewTipsCard({ scores }: { scores: BigFiveScores }) {
  const tips = interviewTips(scores);

  return (
    <section className="steg s3 overflow-hidden rounded-2xl border border-kant bg-papper">
      <div className="p-5 sm:p-7">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-papper-2 text-ink-1">
            <MessageSquareQuote className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="mb-0.5 text-ey uppercase text-ink-3">
              Intervjutips för din profil
            </div>
            <h2 className="font-display text-lg font-bold leading-tight text-ink-1 sm:text-xl">
              Så här kan du prata om din personlighet
            </h2>
          </div>
        </div>

        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-papper-2 p-3 text-sm leading-relaxed text-ink-2 sm:text-base">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-ink-1 text-xs font-bold tabular-nums text-papper">
                {i + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
