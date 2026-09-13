'use client';

import Link from 'next/link';
import SectionCard, { type CollapseProps } from './SectionCard';
import type { CvOption } from './types';

interface CvPickerCardProps {
  cvs: CvOption[];
  selectedId: string | null;
  onSelect: (cvId: string) => void;
  collapse?: CollapseProps;
}

function formatUpdated(cv: CvOption): string {
  const date = cv.updated_at ?? cv.created_at;
  if (!date) return '';
  return new Date(date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

/**
 * CV-väljare: radiokort över användarens CV:n. Låsta CV (utanför
 * gratisplanens 2 aktiva) visas som disabled med lås-ikon.
 */
export default function CvPickerCard({ cvs, selectedId, onSelect, collapse }: CvPickerCardProps) {
  const selectedCv = cvs.find((c) => c.id === selectedId);
  return (
    <SectionCard
      title="Vilket CV vill du visa för rekryterare?"
      sub="Vi visar aldrig själva dokumentet. Kompetenser, roll och erfarenhet hämtas ur CV:t du väljer, ett åt gången."
      delay={0.05}
      summary={selectedCv ? selectedCv.file_name || 'Namnlöst CV' : undefined}
      {...collapse}
    >
      {cvs.length === 0 ? (
        <Link
          href="/dashboard/profil/cv"
          className="flex min-h-[56px] items-center gap-3 rounded-lg border border-dashed border-kant-stark bg-insunken p-4 text-sm font-medium text-ink-1 shadow-insunken hover:bg-panel"
        >
          Du har inget CV ännu. Ladda upp ett för att komma igång.
        </Link>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Välj CV">
          {cvs.map((cv) => {
            const selected = cv.id === selectedId;
            return (
              <button
                key={cv.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={cv.isLocked}
                onClick={() => onSelect(cv.id)}
                className={`flex min-h-[56px] items-center gap-3 rounded-lg border bg-panel p-3.5 text-left transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
                  selected ? 'border-ink-1 shadow-val' : 'border-kant'
                }`}
              >
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-ink-1' : 'border-kant-stark'
                  }`}
                  aria-hidden="true"
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-ink-1" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-kort text-ink-1">
                    {cv.file_name || 'Namnlöst CV'}
                  </span>
                  <span className="mt-0.5 block text-meta text-ink-3">
                    {cv.isLocked ? 'Låst på gratisplanen' : `Uppdaterat ${formatUpdated(cv)}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
