'use client';

import { motion } from 'framer-motion';
import { splitIntoParagraphs } from './splitParagraphs';

interface PassageDisplayProps {
  title: string;
  topic: string;
  text: string;
  difficulty: 1 | 2 | 3;
  passageNumber: number;
}

export default function PassageDisplay({
  title,
  topic,
  text,
  difficulty,
  passageNumber,
}: PassageDisplayProps) {
  // Strippa "PASSAGE X — "-prefix från titeln
  const cleanTitle = title.replace(/^PASSAGE\s+\d+\s*[—-]\s*/i, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <div className="p-5 sm:p-6 md:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
              Passage {passageNumber}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              {cleanTitle}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-medium text-slate-500">
                {topic}
              </span>
              <span className="text-slate-300">·</span>
              <div className="inline-flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Svårighet
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          level <= difficulty
                            ? 'linear-gradient(135deg, #F97316, #DC2626)'
                            : '#E2E8F0',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passage-text — premium typografi med naturliga stycken */}
        <div
          className="rounded-2xl p-4 sm:p-5 md:p-6 border border-orange-100"
          style={{
            background: 'linear-gradient(135deg, #FFFBF5, #FFF7ED)',
          }}
        >
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-800 leading-relaxed">
            {splitIntoParagraphs(text).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
