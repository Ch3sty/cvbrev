'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      el.classList.add('ring-2', 'ring-orange-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-orange-400');
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
        <div className="rounded-xl p-5 text-sm text-neutral-700 bg-white border border-orange-200">
          Vi kunde inte bygga en strukturerad ändringslogg för den här analysen. Använd
          fullt CV-läge nedan för att granska.
        </div>
      )}

      {/* Toggle - visa fullt CV-text */}
      <div className="rounded-xl bg-white border border-orange-200/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFullText((v) => !v)}
          className="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-orange-50/30 transition-colors min-h-[52px]"
          aria-expanded={showFullText}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-neutral-700 flex-shrink-0" strokeWidth={2.25} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900">
                Visa hela CV-texten
              </div>
              <div className="text-xs text-neutral-500">
                Jämför sida vid sida om du vill
              </div>
            </div>
          </div>
          {showFullText ? (
            <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={2.25} />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={2.25} />
          )}
        </button>

        <AnimatePresence initial={false}>
          {showFullText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {/* På mobil visas en version i taget via växlaren: två
                  kolumner bredvid varandra på 375 px ger cirka 170 px per
                  spalt, vilket inte går att läsa. Från lg visas båda. */}
              <div className="px-4 sm:px-5 pb-5">
                <div className="mb-3 flex justify-center lg:hidden">
                  <div
                    role="tablist"
                    aria-label="Jämför före och efter"
                    className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1"
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
                            ? 'bg-orange-600 text-white'
                            : 'text-neutral-600 hover:text-neutral-900'
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
                    <FullCVPanel title="Nuvarande" text={originalCV} accent="slate" />
                  </div>
                  <div
                    className={compareSide === 'after' ? 'block' : 'hidden lg:block'}
                  >
                    <FullCVPanel title="Förbättrad" text={improvedCV} accent="orange" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info-bottom */}
      <div className="rounded-xl px-4 py-3 text-sm text-center bg-white border border-orange-200">
        <p className="text-neutral-700">
          Vill du justera något? Gå{' '}
          <span className="font-semibold text-orange-700">tillbaka</span>. Allt ser bra
          ut? Klicka <span className="font-semibold text-orange-700">Nästa</span> för
          att välja mall och spara.
        </p>
      </div>
    </div>
  );
}

function FullCVPanel({
  title,
  text,
  accent,
}: {
  title: string;
  text: string;
  accent: 'slate' | 'orange';
}) {
  const isOrange = accent === 'orange';
  return (
    <div
      className="rounded-xl bg-white overflow-hidden"
      style={{
        border: isOrange
          ? '1px solid rgba(249, 115, 22, 0.3)'
          : '1px solid #E2E8F0',
      }}
    >
      <div
        className="px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]"
        style={{
          background: isOrange ? 'rgba(255, 247, 237, 0.6)' : '#F8FAFC',
          color: isOrange ? '#9A3412' : '#475569',
        }}
      >
        {title}
      </div>
      {/* Ingen egen maxhöjd och ingen egen scroll: flödesskalet äger scrollen,
          och en scroll inuti en scroll gör att fingret ibland flyttar fel yta.
          Texten är 14 px i stället för 12. */}
      <div className="px-3 py-3">
        <div className="space-y-2 text-sm leading-relaxed text-neutral-700">
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
