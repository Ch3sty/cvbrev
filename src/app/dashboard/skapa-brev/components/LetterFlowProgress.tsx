'use client';

import { motion } from 'framer-motion';
import { Check, FileText, MessageSquare, Layout, SlidersHorizontal, Wand2 } from 'lucide-react';

export type FlowSection = 'cv' | 'job' | 'template' | 'tone' | 'generate';

interface LetterFlowProgressProps {
  activeSection: FlowSection;
  completedSections: Record<FlowSection, boolean>;
  onSectionClick: (section: FlowSection) => void;
}

const SECTIONS: { id: FlowSection; label: string; icon: typeof FileText }[] = [
  { id: 'cv', label: 'CV', icon: FileText },
  { id: 'job', label: 'Annons', icon: MessageSquare },
  { id: 'template', label: 'Mall', icon: Layout },
  { id: 'tone', label: 'Ton', icon: SlidersHorizontal },
  { id: 'generate', label: 'Skapa', icon: Wand2 },
];

export default function LetterFlowProgress({
  activeSection,
  completedSections,
  onSectionClick,
}: LetterFlowProgressProps) {
  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);
  const completedCount = SECTIONS.filter((s) => completedSections[s.id]).length;
  const progressPercent = Math.round((completedCount / SECTIONS.length) * 100);

  return (
    <>
      {/* Desktop: sticky top */}
      <div className="hidden md:block sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-3 pb-4 bg-gradient-to-b from-white via-white to-white/85 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div
            className="grid items-center gap-2"
            style={{ gridTemplateColumns: `repeat(${SECTIONS.length}, minmax(0, 1fr))` }}
          >
            {SECTIONS.map((section, i) => {
              const isDone = completedSections[section.id];
              const isActive = section.id === activeSection;
              const canClick = isDone || i <= activeIndex;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => canClick && onSectionClick(section.id)}
                  disabled={!canClick}
                  className="relative flex flex-col items-center text-center group disabled:cursor-not-allowed"
                >
                  <div className="relative">
                    {isActive && !isDone && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #DC2626)',
                        }}
                        animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <div
                      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={
                        isDone
                          ? {
                              background:
                                'linear-gradient(135deg, #10B981, #059669)',
                            }
                          : isActive
                          ? {
                              background:
                                'linear-gradient(135deg, #F97316, #DC2626)',
                              boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.45)',
                            }
                          : { background: '#F1F5F9' }
                      }
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={2.75} />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                          strokeWidth={2.25}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium leading-tight ${
                      isActive
                        ? 'text-slate-900'
                        : isDone
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom (above mobile bottom-nav) */}
      <div
        className="md:hidden fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
          boxShadow: '0 -4px 12px -4px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="grid flex-1 gap-1"
            style={{ gridTemplateColumns: `repeat(${SECTIONS.length}, minmax(0, 1fr))` }}
          >
            {SECTIONS.map((section, i) => {
              const isDone = completedSections[section.id];
              const isActive = section.id === activeSection;
              const canClick = isDone || i <= activeIndex;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => canClick && onSectionClick(section.id)}
                  disabled={!canClick}
                  className="flex flex-col items-center disabled:cursor-not-allowed"
                  aria-label={`Gå till ${section.label}`}
                >
                  <div className="relative">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={
                        isDone
                          ? {
                              background:
                                'linear-gradient(135deg, #10B981, #059669)',
                            }
                          : isActive
                          ? {
                              background:
                                'linear-gradient(135deg, #F97316, #DC2626)',
                            }
                          : { background: '#F1F5F9' }
                      }
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.75} />
                      ) : (
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                          strokeWidth={2.25}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-0.5 text-[9px] font-medium leading-tight ${
                      isActive
                        ? 'text-slate-900'
                        : isDone
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1.5 h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
          />
        </div>
      </div>
    </>
  );
}
