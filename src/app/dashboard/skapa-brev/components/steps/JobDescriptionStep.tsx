'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, CheckCircle2 } from 'lucide-react';
import LetterFlowStepHeader from '../LetterFlowStepHeader';
import { JobPostingIcon } from '../illustrations/LetterFlowIcons';

interface JobDescriptionStepProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
  isActive: boolean;
  startCollapsed: boolean;
  onComplete: () => void;
  registerRef?: (el: HTMLElement | null) => void;
  prefillCompany?: string | null;
  prefillJobTitle?: string | null;
}

const KEYWORD_REGEX = /\b(React|TypeScript|JavaScript|Python|Java|C\+\+|SQL|AWS|Azure|Docker|Kubernetes|Git|Agile|Scrum|Node|Angular|Vue|AI|ML|DevOps|Backend|Frontend|Fullstack|UX|UI|Figma|REST|GraphQL|Linux|CI\/CD)\b/gi;

export default function JobDescriptionStep({
  jobDescription,
  onJobDescriptionChange,
  isActive,
  startCollapsed,
  onComplete,
  registerRef,
  prefillCompany,
  prefillJobTitle,
}: JobDescriptionStepProps) {
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [hasMarkedDone, setHasMarkedDone] = useState(startCollapsed);

  useEffect(() => {
    if (startCollapsed) {
      setCollapsed(true);
      setHasMarkedDone(true);
    }
  }, [startCollapsed]);

  useEffect(() => {
    if (jobDescription.length > 50) {
      const matches = jobDescription.match(KEYWORD_REGEX) || [];
      const unique = matches.filter((v, i, a) => a.indexOf(v) === i);
      setDetectedKeywords(unique.slice(0, 8));
    } else {
      setDetectedKeywords([]);
    }
  }, [jobDescription]);

  const isValid = jobDescription.length > 20;
  const isDone = isValid;

  // Auto-mark done first time user hits 50+ chars
  useEffect(() => {
    if (jobDescription.length >= 50 && !hasMarkedDone) {
      setHasMarkedDone(true);
      onComplete();
    }
  }, [jobDescription, hasMarkedDone, onComplete]);

  const previewText =
    prefillJobTitle && prefillCompany
      ? `${prefillJobTitle} – ${prefillCompany}`
      : jobDescription.slice(0, 90).trim() + (jobDescription.length > 90 ? '…' : '');

  return (
    <motion.section
      ref={registerRef}
      data-flow-section="job"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <LetterFlowStepHeader
        stepNumber={2}
        title="Beskriv positionen"
        description="Klistra in annonsen. Ju mer info, desto bättre brev."
        isDone={isDone}
        isActive={isActive}
        rightSlot={
          isDone && collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors min-h-[36px]"
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
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-50/60 border border-orange-100"
          >
            <JobPostingIcon className="w-10 h-10 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">
                Annons hämtad
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {previewText || 'Annonsbeskrivning klar'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {jobDescription.length} tecken
                {detectedKeywords.length > 0 && (
                  <span className="ml-2">
                    · {detectedKeywords.length} nyckelord
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Klistra in jobbannonsen här. Företagsnamn, position och alla krav ger oss bäst förutsättningar att skriva ett vasst brev."
                className="w-full min-h-[200px] sm:min-h-[260px] p-4 sm:p-5 pr-20 rounded-2xl border-2 border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-200/40 focus:outline-none transition-all resize-y text-sm sm:text-base text-slate-900 placeholder:text-slate-400 leading-relaxed"
              />
              <div className="absolute bottom-3 right-4 text-xs text-slate-400 tabular-nums pointer-events-none">
                {jobDescription.length} tecken
              </div>
            </div>

            {detectedKeywords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Nyckelord vi hittat
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detectedKeywords.map((kw, i) => (
                    <motion.span
                      key={kw}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {jobDescription.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                {jobDescription.length < 50 ? (
                  <>
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <span className="text-slate-600">
                      Fortsätt skriva. Mer kontext ger bättre brev.
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-slate-700">
                      Bra. Vi har vad vi behöver för att skriva ett starkt brev.
                    </span>
                  </>
                )}
              </div>
            )}

            {isValid && !collapsed && hasMarkedDone && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="text-sm text-orange-700 font-semibold hover:underline"
              >
                Klart, dölj denna ruta
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
