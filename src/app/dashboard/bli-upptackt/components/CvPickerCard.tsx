'use client';

import Link from 'next/link';
import { Lock, FileText, Upload } from 'lucide-react';
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
          className="flex items-center gap-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-4 min-h-[56px] text-sm font-semibold text-orange-800 hover:bg-orange-50 transition-colors touch-manipulation"
        >
          <Upload className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
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
                className={`flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 min-h-[56px] text-left transition-all touch-manipulation ${
                  selected
                    ? 'border-orange-500 bg-orange-50/60'
                    : cv.isLocked
                      ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                      : 'border-neutral-200 bg-white hover:border-orange-300'
                }`}
              >
                {/* Radio-prick */}
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selected ? 'border-orange-600' : 'border-neutral-300'
                  }`}
                  aria-hidden="true"
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-orange-600" />}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-neutral-900 truncate">
                    {cv.file_name || 'Namnlöst CV'}
                  </span>
                  <span className="block text-xs text-neutral-500 mt-0.5">
                    {cv.isLocked ? 'Låst på gratisplanen' : `Uppdaterat ${formatUpdated(cv)}`}
                  </span>
                </span>

                {cv.isLocked ? (
                  <Lock className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={2.5} />
                ) : (
                  <FileText
                    className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-orange-600' : 'text-neutral-300'}`}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
