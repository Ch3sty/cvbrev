'use client';

import CVThumbnailIllustration from './CVThumbnailIllustration';

interface ReviewHeaderProps {
  changeCount: number;
  atsImprovement: number;
  keywordsAdded: number;
  thumbnailSeed?: string;
  editedSections: {
    profile: boolean;
    roleIndices: number[];
    skills: boolean;
  };
  onDotClick?: (sectionId: string) => void;
}

/**
 * Toppen av granskningssteget: miniatyren av CV:t och vad som ändrats.
 *
 * Bort: orange kant, versalerad etikett i orange, rubriken i 24 px fet och
 * de tre glasrutorna med orange text. Siffrorna står som stora tal.
 */
export default function ReviewHeader({
  changeCount,
  atsImprovement,
  keywordsAdded,
  thumbnailSeed,
  editedSections,
  onDotClick,
}: ReviewHeaderProps) {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[180px,1fr] sm:gap-6">
        {/* CV-thumbnail */}
        <div className="flex justify-center sm:justify-start">
          <div className="w-[160px] sm:w-[180px]">
            <CVThumbnailIllustration
              seed={thumbnailSeed}
              editedSections={editedSections}
              onDotClick={onDotClick}
            />
          </div>
        </div>

        {/* Stats + text */}
        <div className="text-center sm:text-left">
          <h2 className="text-kort text-ink-1">
            {changeCount > 0
              ? `Vi har gjort ${changeCount} ${changeCount === 1 ? 'ändring' : 'ändringar'} åt dig`
              : 'Inga ändringar valda'}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
            Klicka på en sektion nedan eller på en markering i miniatyren för
            att se exakt vad vi har ändrat.
          </p>

          {/* Stats-rad */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat value={changeCount} label={changeCount === 1 ? 'ändring' : 'ändringar'} />
            <Stat value={`+${atsImprovement}`} label="ATS-poäng" />
            <Stat value={keywordsAdded} label="nyckelord" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="text-tal tabular-nums text-ink-1">{value}</div>
      <div className="text-meta text-ink-3">{label}</div>
    </div>
  );
}
