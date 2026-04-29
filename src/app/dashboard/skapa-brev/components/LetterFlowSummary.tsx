'use client';

import { motion } from 'framer-motion';
import { Wand2, Loader2, FileText, Briefcase, Layout, SlidersHorizontal } from 'lucide-react';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

const TONE_LABELS: Record<string, string> = {
  professional: 'Professionell',
  enthusiastic: 'Entusiastisk',
  creative: 'Kreativ',
  confident: 'Självsäker',
  balanced: 'Balanserad',
  auto: 'Smart-anpassad',
};

const LANG_LABELS: Record<string, string> = {
  sv: 'Svenska',
  en: 'English',
};

interface LetterFlowSummaryProps {
  cvName: string | null;
  jobDescriptionPreview: string;
  templateId: string;
  tonality: string;
  language: string;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  remainingWeeklyLetters?: number | null;
}

export default function LetterFlowSummary({
  cvName,
  jobDescriptionPreview,
  templateId,
  tonality,
  language,
  canGenerate,
  isGenerating,
  onGenerate,
  remainingWeeklyLetters,
}: LetterFlowSummaryProps) {
  const template = DOCX_TEMPLATES[templateId as keyof typeof DOCX_TEMPLATES];

  const summaryRows = [
    {
      icon: FileText,
      label: 'CV',
      value: cvName || '—',
      ok: !!cvName,
    },
    {
      icon: Briefcase,
      label: 'Annons',
      value: jobDescriptionPreview || '—',
      ok: !!jobDescriptionPreview,
    },
    {
      icon: Layout,
      label: 'Brevmall',
      value: template?.name || '—',
      ok: !!template,
    },
    {
      icon: SlidersHorizontal,
      label: 'Ton & språk',
      value: `${TONE_LABELS[tonality] || tonality} · ${LANG_LABELS[language] || language}`,
      ok: true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
        Dina val
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
        Allt klart för att skriva
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        Vi sätter ihop brevet baserat på det här. Du kan redigera efteråt.
      </p>

      <ul className="divide-y divide-slate-100 mb-6">
        {summaryRows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="flex items-center gap-3 py-2.5 text-sm"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  row.ok
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {row.label}
                </div>
                <div
                  className={`truncate font-medium ${
                    row.ok ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {row.value}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background:
            !canGenerate || isGenerating
              ? '#94A3B8'
              : 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          boxShadow:
            !canGenerate || isGenerating
              ? 'none'
              : '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Skriver brevet…
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" strokeWidth={2.5} />
            Skapa mitt brev
          </>
        )}
      </button>
      <div className="text-center text-xs text-slate-500 mt-3">
        Tar 10–15 sekunder.
        {typeof remainingWeeklyLetters === 'number' && (
          <span className="ml-1">
            Du har {remainingWeeklyLetters} brev kvar denna vecka.
          </span>
        )}
      </div>
    </motion.section>
  );
}
