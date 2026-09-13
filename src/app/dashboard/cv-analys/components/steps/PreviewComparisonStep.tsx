'use client';

import { useState, useMemo } from 'react';

import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ReviewHeader from '../review/ReviewHeader';
import ChangeLogList, { type ChangeLogData } from '../review/ChangeLogList';

interface PreviewComparisonStepProps {
  originalCV: string;
  improvedCV: string;
  improvementsCount: number;
  atsImprovement: number;

  /** Strukturerad data för pedagogisk diff. Om inte tillgänglig faller vi tillbaka på text-diff. */
  changeLog?: ChangeLogData;
  /** Seed för CV-thumbnail (analys-id eller liknande) */
  thumbnailSeed?: string;
}

export default function PreviewComparisonStep({
  originalCV,
  improvedCV,
  improvementsCount,
  atsImprovement,
  changeLog,
  thumbnailSeed,
}: PreviewComparisonStepProps) {
  const [showFullText, setShowFullText] = useState(false);
  /** Vilken version som visas på mobil. Från lg visas båda. */
  const [compareSide, setCompareSide] = useState<'before' | 'after'>('after');

  // Räkna keyword-tillägg och edited sektioner
  const stats = useMemo(() => {
    if (!changeLog) {
      return {
        keywordsAdded: 0,
        editedSections: { profile: false, roleIndices: [] as number[], skills: false },
      };
    }
    const keywordsAdded = changeLog.roles.reduce(
      (sum, r) => sum + (r.keywordsAdded || 0),
      0
    );
    return {
      keywordsAdded,
      editedSections: {
        profile: !!changeLog.profile,
        roleIndices: changeLog.roles.map((r) => r.index),
        skills: !!changeLog.skills && changeLog.skills.items.length > 0,
      },
    };
  }, [changeLog]);

  const handleDotClick = (sectionId: string) => {
    const el = document.getElementById(`changelog-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Markera kortet med ett tillfälligt pulse
      el.classList.add('ring-2', 'ring-ink-1');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-ink-1');
      }, 1600);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero med stats + thumbnail */}
      <ReviewHeader
        changeCount={improvementsCount}
        atsImprovement={atsImprovement}
        keywordsAdded={stats.keywordsAdded}
        thumbnailSeed={thumbnailSeed}
        editedSections={stats.editedSections}
        onDotClick={handleDotClick}
      />

      {/* Change log */}
      {changeLog ? (
        <ChangeLogList data={changeLog} />
      ) : (
        <div className="rounded-xl border border-kant bg-panel p-5 text-sm text-ink-2">
          Vi kunde inte bygga en strukturerad ändringslogg för den här analysen. Använd
          fullt CV-läge nedan för att granska.
        </div>
      )}

      {/* Toggle - visa fullt CV-text */}
      <div className="overflow-hidden rounded-xl border border-kant bg-panel">
        <button
          type="button"
          onClick={() => setShowFullText((v) => !v)}
          className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-insunken sm:px-5"
          aria-expanded={showFullText}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-5 w-5 flex-shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-kort text-ink-1">
                Visa hela CV-texten
              </div>
              <div className="text-meta text-ink-3">
                Jämför sida vid sida om du vill
              </div>
            </div>
          </div>
          {showFullText ? (
            <ChevronUp className="h-4 w-4 flex-shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>

        {showFullText && (
            <div className="overflow-hidden">
              {/* På mobil visas en version i taget via växlaren: två
                  kolumner bredvid varandra på 375 px ger cirka 170 px per
                  spalt, vilket inte går att läsa. Från lg visas båda. */}
              <div className="px-4 sm:px-5 pb-5">
                <div className="mb-3 flex justify-center lg:hidden">
                  <div
                    role="tablist"
                    aria-label="Jämför före och efter"
                    className="inline-flex rounded-lg border border-kant bg-insunken p-1"
                  >
                    {(['before', 'after'] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        role="tab"
                        aria-selected={compareSide === side}
                        onClick={() => setCompareSide(side)}
                        className={`inline-flex h-11 min-w-[110px] items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                          compareSide === side
                            ? 'bg-panel text-ink-1'
                            : 'text-ink-3 hover:text-ink-1'
                        }`}
                      >
                        {side === 'before' ? 'Nuvarande' : 'Förbättrad'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div
                    className={compareSide === 'before' ? 'block' : 'hidden lg:block'}
                  >
                    <FullCVPanel title="Nuvarande" text={originalCV} />
                  </div>
                  <div
                    className={compareSide === 'after' ? 'block' : 'hidden lg:block'}
                  >
                    <FullCVPanel title="Förbättrad" text={improvedCV} />
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Info-bottom */}
      <p className="rounded-xl border border-kant bg-panel px-4 py-3 text-center text-sm text-ink-2">
        Vill du justera något? Gå tillbaka. Ser allt bra ut? Gå vidare för att
        välja mall och spara.
      </p>
    </div>
  );
}

function FullCVPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-kant bg-panel">
      <div className="border-b border-kant px-3 py-2 text-steg uppercase text-ink-3">
        {title}
      </div>
      {/* Ingen egen maxhöjd och ingen egen scroll: flödesskalet äger scrollen,
          och en scroll inuti en scroll gör att fingret ibland flyttar fel yta.
          Texten är 14 px i stället för 12. */}
      <div className="px-3 py-3">
        <div className="space-y-2 text-sm leading-relaxed text-ink-2">
          {text.split(/\n\n+/).map((paragraph, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
