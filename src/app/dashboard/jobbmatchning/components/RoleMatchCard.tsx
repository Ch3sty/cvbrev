'use client';

import { IkonMatchning } from '@/components/illustrations/Ikoner';
import ConfidenceMeter from './ConfidenceMeter';

interface RoleMatchCardProps {
  normalized: string;
  original: string;
  alternativeLabels: string[];
  confidence: 'high' | 'medium' | 'low';
  index?: number;
}

/**
 * En yrkesroll som en rad i rollpanelen: naken ikon 24, normaliserad titel,
 * originaltiteln som meta när den skiljer sig, säkerheten som 2 px mätare
 * och synonymerna som text i meta. Inga piller, ingen färgkodning.
 */
export default function RoleMatchCard({
  normalized,
  original,
  alternativeLabels,
  confidence,
}: RoleMatchCardProps) {
  const showOriginal = original && original !== normalized;
  const synonyms = alternativeLabels.slice(0, 2);
  const hiddenSynonyms = Math.max(0, alternativeLabels.length - 2);

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-ink-2" aria-hidden="true">
        <IkonMatchning size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-ink-1">{normalized}</p>
        {showOriginal && (
          <p className="mt-0.5 truncate text-meta text-ink-3">I ditt CV: {original}</p>
        )}
        {synonyms.length > 0 && (
          <p className="mt-1 text-meta text-ink-3">
            Även: {synonyms.join(', ')}
            {hiddenSynonyms > 0 ? ` och ${hiddenSynonyms} till` : ''}
          </p>
        )}
      </div>

      <div className="shrink-0 pt-1">
        <ConfidenceMeter confidence={confidence} />
      </div>
    </div>
  );
}
