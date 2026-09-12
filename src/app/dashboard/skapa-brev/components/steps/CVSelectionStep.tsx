'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, FileText } from 'lucide-react';
import CvPickerGrid, { type PickerCv } from '../CvPickerGrid';
import LetterFlowStepHeader from '../LetterFlowStepHeader';
import { CvDocumentIcon } from '../illustrations/LetterFlowIcons';

interface CVSelectionStepProps {
  /* CV-listan kommer server-hämtad från page.tsx. Förut läste steget den ur
     cv-store, som inte hade något innan klienten hunnit fråga Supabase. */
  cvs: PickerCv[];
  /** ID:n för CV som ligger utanför gratisgränsen och därför är låsta. */
  lockedCvIds: Set<string>;
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
  isActive: boolean;
  startCollapsed: boolean;
  onComplete: () => void;
  registerRef?: (el: HTMLElement | null) => void;
}

export default function CVSelectionStep({
  cvs,
  lockedCvIds,
  selectedCV,
  onCVSelect,
  isActive,
  startCollapsed,
  onComplete,
  registerRef,
}: CVSelectionStepProps) {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  useEffect(() => {
    if (startCollapsed) {
      setCollapsed(true);
    }
  }, [startCollapsed]);

  const isDone = !!selectedCV;
  const selected = cvs.find((cv) => cv.id === selectedCV);
  const cvDisplayName = selected?.file_name?.replace(/\.[^.]+$/, '') || 'Valt CV';

  const handleSelect = (cvId: string) => {
    onCVSelect(cvId);
    setCollapsed(true);
    onComplete();
  };

  return (
    <motion.section
      ref={registerRef}
      data-flow-section="cv"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-orange-200/50 p-5 sm:p-7"
    >
      <LetterFlowStepHeader
        stepNumber={1}
        title="Välj ditt CV"
        description="Välj från dina sparade CV:n"
        isDone={isDone}
        isActive={isActive}
        rightSlot={
          isDone && collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors min-h-[44px]"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
              Ändra
            </button>
          ) : undefined
        }
      />

      <AnimatePresence initial={false} mode="wait">
        {isDone && collapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50/60 border border-orange-100"
          >
            <CvDocumentIcon className="w-10 h-10 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Valt CV
              </div>
              <div className="text-sm font-semibold text-neutral-900 truncate">
                {cvDisplayName}
              </div>
            </div>
            <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CvPickerGrid
              cvs={cvs}
              lockedCvIds={lockedCvIds}
              selectedCV={selectedCV}
              onCVSelect={handleSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
