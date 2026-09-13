'use client';

/**
 * Kortet som visas när användaren kommer från jobbmatchningen med CV och
 * annons redan valda. Upphöjd panel med marginalplatta (steg 1:s enda), och
 * genvägen som textlänk: den primära handlingen ligger i skalets fot.
 */

import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaAnsokan } from '@/components/illustrations/TradenScener';

interface PrefillBadgeCardProps {
  company: string;
  jobTitle: string;
  hasCv: boolean;
  hasJobDescription: boolean;
  onJumpToTemplate: () => void;
}

export default function PrefillBadgeCard({
  company,
  jobTitle,
  hasCv,
  hasJobDescription,
  onJumpToTemplate,
}: PrefillBadgeCardProps) {
  const done = [hasCv ? 'CV valt' : null, hasJobDescription ? 'Annons hämtad' : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      aria-label="Förifyllt från jobbmatchningen"
      className="mb-4 rounded-xl border border-kant-stark bg-panel p-4"
    >
      <div className="flex items-start gap-3">
        <MarginPlate>
          <IlluPlattaAnsokan size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-ink-3">Från jobbmatchningen</p>
          <h3 className="mt-0.5 text-kort text-ink-1">{jobTitle || 'Tjänsten'}</h3>
          {company ? <p className="text-sm leading-[22px] text-ink-2">{company}</p> : null}
          {done ? <p className="mt-1 text-meta text-ink-3">{done}</p> : null}
          <button
            type="button"
            onClick={onJumpToTemplate}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            Hoppa direkt till brevmallen
          </button>
        </div>
      </div>
    </section>
  );
}
