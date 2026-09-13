'use client';

/**
 * Listrad för Mina brev: miniatyr, företag och tjänst, datum som meta och
 * mer-menyn längst till höger. Samma handlingar som rutnätskortet.
 */

import Link from 'next/link';
import { LetterPaperThumbnail } from './illustrations/LetterIcons';
import LetterActions from './LetterActions';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

interface LetterCardCompactProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  /** Loggar brevet som en sökt tjänst i Sökta tjänster. */
  onMarkApplied?: (id: string) => void;
  isDeleting: boolean;
}

export default function LetterCardCompact({
  letter,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onMarkApplied,
  isDeleting,
}: LetterCardCompactProps) {
  const createdDate = letter.created_at ? new Date(letter.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
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
    <div className="group relative rounded-xl border border-kant bg-panel transition-[border-color] duration-[120ms] hover:border-kant-stark">
      <button
        type="button"
        onClick={() => onView(letter.id)}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`Visa brev till ${primary}`}
      />

      <div className="relative flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <LetterPaperThumbnail
          seed={letter.id || primary}
          className={`h-[52px] w-10 shrink-0 ${isLocked ? 'opacity-50' : ''}`}
        />

        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-sm font-semibold tracking-tight ${isLocked ? 'text-ink-3' : 'text-ink-1'}`}>
            {primary}
          </h3>
          {secondary ? (
            <p className={`truncate text-meta ${isLocked ? 'text-ink-3' : 'text-ink-2'}`}>{secondary}</p>
          ) : null}
          {isLocked ? (
            <Link
              href="/dashboard/profil/prenumeration"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 inline-flex min-h-11 items-center text-meta font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              Lås upp med Premium
            </Link>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3 text-meta text-ink-3">
          {isLocked ? <span className="hidden font-medium sm:inline">Låst</span> : null}
          {!isLocked && meta ? <span className="hidden lg:inline">{meta}</span> : null}
          <span className="tabular-nums">{dateStr}</span>
        </div>

        <div className="relative z-20 shrink-0">
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
            variant="plain"
          />
        </div>
      </div>
    </div>
  );
}
