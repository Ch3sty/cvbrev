'use client';

/**
 * CV-väljaren i steg 1. Varje CV är ett plain ChoiceCard med naken ikon 24,
 * filnamn och datum som meta. Låsta CV (utanför gratisgränsen) är spärrade
 * med förklaring i meta. Uppladdning är en rad med chevron, ingen knapp:
 * den primära handlingen ligger i skalets fot.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ChoiceCard from '@/components/shell/ChoiceCard';
import EmptyState from '@/components/shell/EmptyState';
import { IkonCv } from '@/components/illustrations/Ikoner';
import { IlluTomCv } from '@/components/illustrations/EmptyStateIllustrations';
import { formatCVDate } from '@/lib/utils/date-formatter';

/** Raden väljaren behöver. cv_text hämtas inte: den visas aldrig här. */
export interface PickerCv {
  id: string;
  file_name: string;
  created_at: string;
}

interface CvPickerGridProps {
  /* CV och låsstatus kommer utifrån, server-hämtade i page.tsx. */
  cvs: PickerCv[];
  /** ID:n som ligger utanför gratisgränsen och därför är låsta. */
  lockedCvIds: Set<string>;
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
}

export default function CvPickerGrid({
  cvs,
  lockedCvIds,
  selectedCV,
  onCVSelect,
}: CvPickerGridProps) {
  if (cvs.length === 0) {
    return (
      <EmptyState
        illustration={IlluTomCv}
        title="Inga CV än"
        description="Du behöver minst ett CV för att vi ska kunna skriva brevet."
        action={
          <Link
            href="/dashboard/profil/cv"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
          >
            Ladda upp CV
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <div role="radiogroup" aria-label="Dina CV" className="space-y-2">
        {cvs.map((cv) => {
          const locked = lockedCvIds.has(cv.id);
          return (
            <ChoiceCard
              key={cv.id}
              variant="plain"
              selected={selectedCV === cv.id}
              disabled={locked}
              onSelect={() => {
                if (!locked) onCVSelect(cv.id);
              }}
              title={cv.file_name}
              meta={
                locked
                  ? `${formatCVDate(cv.created_at)} · Låst på gratisnivån`
                  : formatCVDate(cv.created_at)
              }
              leading={<IkonCv size={24} />}
            />
          );
        })}
      </div>

      <Link
        href="/dashboard/profil/cv"
        className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-kant bg-panel px-3 text-sm font-medium text-ink-1 transition-[border-color] duration-[120ms] hover:border-kant-stark"
      >
        Ladda upp ett nytt CV
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
