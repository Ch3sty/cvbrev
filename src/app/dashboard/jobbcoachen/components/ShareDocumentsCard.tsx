'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  PenLine,
  Target,
  ArrowRight,
  Upload,
  Plus,
} from 'lucide-react';
import { DocumentShareIcon } from './illustrations/JobbcoachenIcons';

interface ShareDocumentsCardProps {
  cvCount: number;
  letterCount: number;
  onOpenSelector: () => void;
}

const USE_CASES = [
  { Icon: FileText, label: 'Granska mitt CV' },
  { Icon: PenLine, label: 'Förbättra mitt brev' },
  { Icon: Target, label: 'Hur matchar jag tjänsten?' },
];

export default function ShareDocumentsCard({
  cvCount,
  letterCount,
  onOpenSelector,
}: ShareDocumentsCardProps) {
  const total = cvCount + letterCount;
  const hasDocuments = total > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Subtila bakgrundsdots */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="share-docs-dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="16" cy="16" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#share-docs-dots)" opacity="0.4" />
      </svg>

      <div className="relative grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-5 sm:gap-6 items-start">
        <div className="flex justify-center sm:justify-start">
          <DocumentShareIcon className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
            Personliga svar
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1.5 leading-tight">
            Dela dina dokument
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Bifoga ditt CV eller personliga brev. Vi läser dem och svarar utifrån just din situation.
          </p>

          {/* Use-case-pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {USE_CASES.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold"
              >
                <Icon className="w-3 h-3" strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>

          {/* Document count + CTA */}
          {hasDocuments ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                Du har{' '}
                {cvCount > 0 && (
                  <span className="font-bold text-slate-900">
                    {cvCount} {cvCount === 1 ? 'CV' : 'CV:n'}
                  </span>
                )}
                {cvCount > 0 && letterCount > 0 && ' och '}
                {letterCount > 0 && (
                  <span className="font-bold text-slate-900">
                    {letterCount} {letterCount === 1 ? 'brev' : 'brev'}
                  </span>
                )}{' '}
                redo att dela.
              </div>
              <button
                type="button"
                onClick={onOpenSelector}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                }}
              >
                <Upload className="w-4 h-4" strokeWidth={2.5} />
                Välj dokument att dela
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Inga sparade dokument än. Skapa något först så kan du fråga om det här.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/profil/cv"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors min-h-[44px]"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Ladda upp CV
                </Link>
                <Link
                  href="/dashboard/skapa-brev"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors min-h-[44px]"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Skapa brev
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
