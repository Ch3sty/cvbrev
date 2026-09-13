'use client';

import { IkonCv, IkonKrona } from '@/components/illustrations/Ikoner';

interface CvSelectorCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
  };
  onActivate: (cvId: string) => void;
  isActivating: boolean;
  isLocked?: boolean;
}

/**
 * Ett CV att aktivera matchningen mot. Panel med naken ikon, filnamn som
 * kortrubrik och datum i meta. Låst CV markeras med text, aldrig med orange
 * yta. Ingen skugga, ingen rörelse.
 */
export default function CvSelectorCard({
  cv,
  onActivate,
  isActivating,
  isLocked = false,
}: CvSelectorCardProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!isLocked) onActivate(cv.id)
      }}
      disabled={isActivating || isLocked}
      title={
        isLocked
          ? 'CV:t är låst, uppgradera till Premium för att kunna aktivera det'
          : undefined
      }
      className="w-full rounded-xl border border-kant bg-panel p-4 text-left transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        {isLocked ? (
          <IkonKrona className="mt-0.5 shrink-0 text-ink-2" />
        ) : (
          <IkonCv className="mt-0.5 shrink-0 text-ink-2" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-kort text-ink-1">{cv.file_name}</h3>
          <p className="mt-0.5 text-meta text-ink-3">
            Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')}
          </p>
        </div>
      </div>

      <p className="mt-3 border-t border-kant pt-3 text-sm font-medium text-ink-1">
        {isLocked
          ? 'Låst, uppgradera för att aktivera'
          : isActivating
          ? 'Aktiverar'
          : 'Aktivera det här CV:t'}
      </p>
    </button>
  );
}
