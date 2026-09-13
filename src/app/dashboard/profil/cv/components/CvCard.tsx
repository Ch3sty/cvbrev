'use client';

/**
 * CvCard i designsystemet (docs/plan-inloggat-omdesign.md, punkt 18).
 *
 * Bort: gradientruta runt ikonen, orange toppstreck, skuggor på ett
 * stillastående kort, dekorativt bakgrundsmönster och gradientknappar.
 * Kvar: allt beteende, men i kortformen border plus rounded-xl.
 *
 * Knapparna är h-11 hela vägen. Låst läge förklaras i klartext, inte med
 * ett talstreck i en title-attribut ingen ser på mobil.
 */

import { Clock, Trash2, Eye, EyeOff, Download, ExternalLink, Lock } from 'lucide-react';
import type { ParsedCV } from '@/lib/cv/cv-parser';
import dynamic from 'next/dynamic';

// Detaljvyn är 423 rader och visas bara när ett kort expanderas, men den
// importerades statiskt i varje kort. Med åtta CV drog listan in åtta
// kopior av kedjan vid hydrering, vilket syntes som sju långa uppgifter på
// huvudtråden och sköt LCP till 2,4 sekunder.
const CvDetailView = dynamic(() => import('./CvDetailView'), { ssr: false });

interface CvCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
    structured_data: ParsedCV | null;
  };
  index?: number;
  isDeleting: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenInNewWindow: () => void;
  onDownload: () => void;
  userContact?: { full_name?: string; email?: string; phone?: string; location?: string };
  onDelete: () => void;
  onStructured: (data: ParsedCV) => void;
  preview: string;
  formatDate: (iso: string) => string;
  /** Sant om CV:t är låst (gratisanvändare med fler CV än kvoten) */
  isLocked?: boolean;
}

const LOCKED_HINT = 'Låst tills du uppgraderar till Premium';

export default function CvCard({
  cv,
  index = 0,
  isDeleting,
  expanded,
  onToggleExpand,
  onOpenInNewWindow,
  onDownload,
  onDelete,
  onStructured,
  preview,
  formatDate,
  isLocked = false,
  userContact,
  // Ren opacity, ingen förflyttning: ett element som tonar in sent och
  // samtidigt flyttar sig räknas som layoutskifte.
}: CvCardProps) {
  return (
    <div
      style={{ animationDelay: `${index * 30}ms` }}
      className={`flex flex-col rounded-xl border transition-colors motion-safe:animate-[fadeInPlace_200ms_ease-out_both] ${
        isLocked
          ? 'border-neutral-200 bg-neutral-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      {/* Huvud: filnamn, ålder, radera */}
      <div className="flex items-start gap-3 border-b border-neutral-200 p-4">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
              {cv.file_name}
            </h3>
            {isLocked ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Låst
              </span>
            ) : null}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(cv.created_at)}
          </span>
        </span>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Ta bort ${cv.file_name}`}
          className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          {isDeleting ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"
              aria-hidden="true"
            />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {!expanded && (
          <p className="mb-4 line-clamp-3 min-h-[60px] text-sm leading-relaxed text-neutral-600">
            {preview}
          </p>
        )}

        {isLocked ? (
          <p className="mb-3 text-sm text-neutral-600">{LOCKED_HINT}</p>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={isLocked ? undefined : onToggleExpand}
            disabled={isLocked}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            {expanded ? (
              <>
                <EyeOff className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Dölj</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Visa</span>
              </>
            )}
          </button>

          <button
            onClick={isLocked ? undefined : onDownload}
            disabled={isLocked}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 disabled:text-neutral-400"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Välj mall</span>
          </button>
        </div>

        {/* Höjden animeras med grid-template-rows i stället för height: auto.
            Expansionen sker bara på klick, aldrig vid inladdning. */}
        {expanded && (
          <div className="grid grid-rows-[1fr] motion-safe:animate-[cvDetailIn_200ms_ease-out_both]">
            <div className="overflow-hidden">
              <div className="mt-5 space-y-5 border-t border-neutral-200 pt-5">
                <CvDetailView
                  cvId={cv.id}
                  structuredData={cv.structured_data}
                  onStructured={onStructured}
                  userContact={userContact}
                />

                <div className="flex justify-end">
                  <button
                    onClick={onOpenInNewWindow}
                    className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Öppna råtext i nytt fönster
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
