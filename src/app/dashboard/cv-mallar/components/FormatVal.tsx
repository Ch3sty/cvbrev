'use client';

/**
 * Formatvalet i steg 3 (docs/design/skiss-cv-word-2026-11-15.html, avsnitt 3).
 *
 * Två segment, PDF och Word, direkt ovanför den enda kopparknappen. Valet
 * markeras med mörk kant och bock, aldrig med koppar, så kopparn förblir
 * knappen. Ett låst segment är synligt och går att trycka på: det visar ett
 * lås i stället för bock, och föräldern öppnar betalväggen. Mallar utan
 * Word-version visar inget val, bara raden "<Mall> laddas ner som PDF."
 */

import { Check, Lock } from '@/components/illustrations/RumIkoner';
import { PAKETRADER } from '@/components/paywall/paywall-copy';

export type CvFormat = 'pdf' | 'docx';

interface FormatValProps {
  mallNamn: string;
  harWordVersion: boolean;
  format: CvFormat;
  pdfLast: boolean;
  wordLast: boolean;
  /** Raden under segmenten, eller null. */
  rad: string | null;
  /** Typsnittet Word-filen får, visas när Word är valt och öppet. */
  wordTypsnitt: string;
  onValj: (format: CvFormat) => void;
}

export default function FormatVal({
  mallNamn,
  harWordVersion,
  format,
  pdfLast,
  wordLast,
  rad,
  wordTypsnitt,
  onValj,
}: FormatValProps) {
  if (!harWordVersion) {
    return <p className="text-meta text-ink-2">{`${mallNamn} laddas ner som PDF.`}</p>;
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p id="formatval-rubrik" className="text-steg uppercase text-ink-3">
          Format
        </p>
        {format === 'docx' && !wordLast ? (
          <p className="text-meta text-ink-3">{`Typsnitt i Word-filen: ${wordTypsnitt}`}</p>
        ) : null}
      </div>
      <div role="radiogroup" aria-labelledby="formatval-rubrik" className="grid grid-cols-2 gap-2">
        <Segment
          titel="PDF"
          under={pdfLast ? PAKETRADER.ingar : 'Klar att skicka'}
          vald={format === 'pdf'}
          last={pdfLast}
          onClick={() => onValj('pdf')}
        />
        <Segment
          titel="Word"
          under={wordLast ? PAKETRADER.ingar : 'Går att redigera'}
          vald={format === 'docx'}
          last={wordLast}
          onClick={() => onValj('docx')}
        />
      </div>
      {rad ? <p className="mt-2 text-meta text-ink-2">{rad}</p> : null}
    </div>
  );
}

function Segment({
  titel,
  under,
  vald,
  last,
  onClick,
}: {
  titel: string;
  under: string;
  vald: boolean;
  last: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={vald}
      aria-label={`${titel}. ${under}${last ? '. Låst.' : ''}`}
      onClick={onClick}
      className={`flex min-h-[56px] items-center justify-between gap-2 rounded-lg border bg-papper px-3 py-2 text-left transition-colors hover:bg-papper-2 ${
        vald ? 'border-ink-1 ring-1 ring-ink-1' : 'border-kant-stark'
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-1">{titel}</span>
        <span className="block truncate text-meta text-ink-3">{under}</span>
      </span>
      {last ? (
        <Lock className="h-4 w-4 flex-shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
      ) : vald ? (
        <Check className="h-4 w-4 flex-shrink-0 text-ink-1" strokeWidth={1.75} aria-hidden="true" />
      ) : null}
    </button>
  );
}
