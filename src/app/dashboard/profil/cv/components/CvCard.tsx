'use client';

/**
 * Ett CV i Mina CV, som rad (spec-rummen 16.4 (b) punkt 10, konceptets C1
 * "Mina CV"): symbol, namn, metaraden med analysens poäng och när det
 * ändrades, chevron till höger. Raden fäller ut detaljvyn; handlingarna står
 * där som textlänkar, och "Ta bort" är en röd länk som bekräftas i dialog
 * (spec 18.2), aldrig en knappfyllnad.
 *
 * Allt beteende från kortet är kvar: visa och dölj, välj mall, öppna
 * råtexten, ta bort, och låst läge i klartext.
 */

import { PAKETRADER } from '@/components/paywall/paywall-copy';
import { DorrCv, IkonChev, IkonLas } from '@/components/illustrations/RumSymboler';
import { LANK, LANK_FEL } from '@/components/shell/knappar';
import { CV_RUM } from '@/lib/rum/copy';
import type { ParsedCV } from '@/lib/cv/cv-parser';
import dynamic from 'next/dynamic';

// Detaljvyn visas bara när en rad fälls ut; den laddas inte med listan.
const CvDetailView = dynamic(() => import('./CvDetailView'), { ssr: false });

interface CvCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
    updated_at?: string | null;
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
  /** Senaste analysens läsbarhetspoäng för just det här CV:t, om någon. */
  poang?: number | null;
}

const RADLANK = `${LANK} inline-flex min-h-11 items-center`;

export default function CvCard({
  cv,
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
  poang = null,
}: CvCardProps) {
  const andrad = cv.updated_at ?? cv.created_at;
  const meta = isLocked
    ? PAKETRADER.lastCv
    : [
        poang !== null ? CV_RUM.cvMeta.poang(poang) : CV_RUM.cvMeta.inteAnalyserat,
        CV_RUM.cvMeta.andrat(formatDate(andrad).toLowerCase()),
      ].join(' ');
  const panelId = `cv-${cv.id}-detalj`;

  return (
    <div>
      <button
        type="button"
        onClick={isLocked ? undefined : onToggleExpand}
        aria-expanded={isLocked ? undefined : expanded}
        aria-controls={isLocked ? undefined : panelId}
        aria-disabled={isLocked || undefined}
        className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left ${isLocked ? 'cursor-default' : ''}`}
      >
        <span className={`h-10 w-10 shrink-0 ${isLocked || poang === null ? 'text-ink-3' : 'text-ton-ink'}`} aria-hidden="true">
          <DorrCv size={40} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold leading-5 text-ink-1">{cv.file_name}</span>
          <span className="mt-0.5 block text-meta text-ink-3">{meta}</span>
        </span>
        {isLocked ? (
          <IkonLas size={20} className="shrink-0 text-ink-3" />
        ) : (
          <IkonChev
            size={20}
            className={`shrink-0 text-ink-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        )}
      </button>

      {expanded && !isLocked ? (
        <div id={panelId} className="border-t border-kant px-4 pb-4 pt-4">
          <p className="line-clamp-3 text-sm leading-[21px] text-ink-2">{preview}</p>
          <div className="mt-4">
            <CvDetailView
              cvId={cv.id}
              structuredData={cv.structured_data}
              onStructured={onStructured}
              userContact={userContact}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 border-t border-kant pt-2">
            <button type="button" onClick={onDownload} className={RADLANK}>
              Välj mall och ladda ner
            </button>
            <button type="button" onClick={onOpenInNewWindow} className={RADLANK}>
              Öppna råtext i nytt fönster
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className={`${LANK_FEL} ml-auto inline-flex min-h-11 items-center disabled:opacity-60`}
            >
              {isDeleting ? 'Tar bort' : 'Ta bort'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
