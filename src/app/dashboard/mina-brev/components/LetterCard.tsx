'use client';

/**
 * Brevkort i rutnätsvyn. Panel med miniatyren på en insunken yta, datum
 * som meta, kortrubrik 16/600 och en metarad med ton och mall. Låsta brev
 * (gratisnivån, äldre än de två senaste) är dämpade med en textlänk till
 * Premium. Ingen rotation, ingen skugga, ingen orange yta.
 */

import Link from 'next/link';
import { LetterPaperThumbnail } from './illustrations/LetterIcons';
import LetterActions from './LetterActions';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

interface LetterCardProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  /** Loggar brevet som en sökt tjänst i Sökta tjänster. */
  onMarkApplied?: (id: string) => void;
  isDeleting: boolean;
}

export default function LetterCard({
  letter,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onMarkApplied,
  isDeleting,
}: LetterCardProps) {
  const createdDate = letter.created_at ? new Date(letter.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const templateName =
    letter.template_id && DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  const tonalityDisplay = letter.tonality
    ? letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)
    : null;

  const primary = letter.company || letter.job_title || letter.title || 'Ansökningsbrev';
  const secondary = letter.company && letter.job_title ? letter.job_title : null;
  const isLocked = !!letter.isLocked;
  const meta = [tonalityDisplay, templateName].filter(Boolean).join(' · ');

  return (
    <article className="group relative overflow-hidden rounded-xl border border-kant bg-panel transition-[border-color] duration-[120ms] hover:border-kant-stark">
      {/* Hela kortet är klickbart till visa-sidan. Ligger under menyn. */}
      <button
        type="button"
        onClick={() => onView(letter.id)}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`Visa brev till ${primary}`}
      />

      <div className="relative flex h-40 items-center justify-center border-b border-kant bg-insunken shadow-insunken">
        <LetterPaperThumbnail
          seed={letter.id || primary}
          className={`h-28 w-[90px] ${isLocked ? 'opacity-50' : ''}`}
        />

        <span className="pointer-events-none absolute left-3 top-3 text-meta text-ink-3">{dateStr}</span>

        <div className="absolute right-3 top-3 z-20">
          <LetterActions
            letterId={letter.id}
            letterName={primary}
            isLocked={isLocked}
            isDeleting={isDeleting}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
            onMarkApplied={onMarkApplied}
            variant="panel"
          />
        </div>

        {isLocked ? (
          <span className="pointer-events-none absolute bottom-3 left-3 text-meta font-medium text-ink-3">
            Låst
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className={`line-clamp-2 text-kort ${isLocked ? 'text-ink-3' : 'text-ink-1'}`}>{primary}</h3>
        {secondary ? (
          <p className={`mt-0.5 line-clamp-1 text-sm ${isLocked ? 'text-ink-3' : 'text-ink-2'}`}>
            {secondary}
          </p>
        ) : null}
        {!isLocked && meta ? <p className="mt-1 text-meta text-ink-3">{meta}</p> : null}

        {isLocked ? (
          <Link
            href="/dashboard/profil/prenumeration"
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 mt-1 inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            Öppna brevet med Premium
          </Link>
        ) : null}
      </div>
    </article>
  );
}
