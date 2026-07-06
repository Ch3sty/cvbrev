'use client';

import { useRouter } from 'next/navigation';
import { Columns3, X } from 'lucide-react';
import AddToProjectMenu from './AddToProjectMenu';
import { CTA_GRADIENT } from './types';

interface CompareToolbarProps {
  selectedIds: string[];
  onClear: () => void;
}

/** Verktygsraden som visas när minst en kandidat är markerad i tabellen. */
export default function CompareToolbar({ selectedIds, onClear }: CompareToolbarProps) {
  const router = useRouter();
  const count = selectedIds.length;
  const canCompare = count >= 2 && count <= 4;

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-2xl border border-orange-200 bg-orange-50/70 px-3 py-2">
      <span className="text-[12.5px] font-bold text-orange-900 mr-1">
        {count === 1 ? '1 markerad' : `${count} markerade`}
      </span>

      <button
        type="button"
        disabled={!canCompare}
        onClick={() =>
          router.push(`/rekryterare/jamfor?ids=${selectedIds.slice(0, 4).join(',')}`)
        }
        title={
          canCompare ? undefined : 'Markera 2 till 4 kandidater för att jämföra sida vid sida'
        }
        className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: CTA_GRADIENT }}
      >
        <Columns3 className="w-4 h-4" aria-hidden="true" />
        Jämför ({Math.min(count, 4)})
      </button>

      <AddToProjectMenu candidateUserIds={selectedIds} onAdded={onClear} />

      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-xl text-[12.5px] font-bold text-slate-500 hover:text-slate-700 hover:bg-white/70 transition-colors"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
        Rensa
      </button>
    </div>
  );
}
