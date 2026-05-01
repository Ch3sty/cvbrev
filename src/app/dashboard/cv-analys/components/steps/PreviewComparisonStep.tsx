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
        <div
          className="rounded-2xl p-5 text-sm text-slate-700"
          style={{
            background:
              'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.18)',
          }}
        >
          Vi kunde inte bygga en strukturerad ändringslogg för den här analysen. Använd
          fullt CV-läge nedan för att granska.
        </div>
      )}

      {/* Toggle - visa fullt CV-text */}
      <div className="rounded-2xl bg-white border border-orange-200/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFullText((v) => !v)}
          className="w-full px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-orange-50/30 transition-colors min-h-[52px]"
          aria-expanded={showFullText}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
              }}
            >
              <FileText className="w-3.5 h-3.5 text-orange-700" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Visa hela CV-texten
              </div>
              <div className="text-xs text-slate-500">
                Jämför sida vid sida om du vill
              </div>
            </div>
          </div>
          {showFullText ? (
            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={2.25} />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={2.25} />
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
              <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <FullCVPanel
                  title="Nuvarande"
                  text={originalCV}
                  accent="slate"
                />
                <FullCVPanel
                  title="Förbättrad"
                  text={improvedCV}
                  accent="orange"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info-bottom */}
      <div
        className="rounded-xl px-4 py-3 text-sm text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.15)',
        }}
      >
        <p className="text-slate-700">
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
        className="h-[3px]"
        style={{
          background: isOrange
            ? 'linear-gradient(90deg, #F97316, #DC2626, #BE185D)'
            : '#CBD5E1',
        }}
      />
      <div
        className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: isOrange ? 'rgba(255, 247, 237, 0.6)' : '#F8FAFC',
          color: isOrange ? '#9A3412' : '#475569',
        }}
      >
        {title}
      </div>
      <div className="px-3 py-3 max-h-[400px] overflow-auto">
        <div className="space-y-2 text-xs leading-relaxed text-slate-700">
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
