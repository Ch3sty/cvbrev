'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, Check, ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';
import { formatCVDate } from '@/lib/utils/date-formatter';

interface CVSelectionStepProps {
  cvs: any[];
  selectedCV: string | null;
  onSelectCV: (cvId: string) => void;
}

/**
 * Steg 0: Välj vilket CV som ska analyseras.
 * Använder samma CV-picker-DNA som skapa-brev (orange/röd topp-linje,
 * emerald done-state, dokument-mönster i bakgrunden).
 */
export default function CVSelectionStep({ cvs, selectedCV, onSelectCV }: CVSelectionStepProps) {
  if (!cvs || cvs.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-8 text-center">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Inga CV:n hittades
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Du behöver minst ett CV för att kunna göra en analys.
        </p>
        <Link
          href="/dashboard/profil/cv"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg min-h-[44px]"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          <Upload className="w-4 h-4" />
          Ladda upp CV
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {cvs.map((cv) => (
          <CvPickerCard
            key={cv.id}
            cv={cv}
            isSelected={selectedCV === cv.id}
            onSelect={() => onSelectCV(cv.id)}
          />
        ))}
      </div>

      {/* Subtil länk till uppladdning */}
      <Link href="/dashboard/profil/cv" className="block group">
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Ladda upp ett nytt CV
              </div>
              <div className="text-xs text-slate-500">
                Tar dig till Mina CV:n
              </div>
            </div>
          </div>
          <ArrowRight
            className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
            strokeWidth={2.5}
          />
        </div>
      </Link>
    </div>
  );
}

function CvPickerCard({
  cv,
  isSelected,
  onSelect,
}: {
  cv: { id: string; file_name: string; created_at: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full text-left bg-white rounded-2xl border-2 transition-all overflow-hidden focus:outline-none ${
        isSelected
          ? 'border-emerald-500'
          : 'border-slate-200 hover:border-orange-300'
      }`}
      style={{
        boxShadow: isSelected
          ? '0 0 0 4px rgba(16, 185, 129, 0.15), 0 8px 24px -8px rgba(16, 185, 129, 0.25)'
          : '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
      aria-pressed={isSelected}
    >
      {/* Tunn topp-linje */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: isSelected
            ? 'linear-gradient(90deg, #10B981, #059669)'
            : 'linear-gradient(90deg, #F97316, #DC2626)',
        }}
      />

      {!isSelected && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
          style={{
            boxShadow: '0 12px 32px -8px rgba(249, 115, 22, 0.25)',
          }}
        />
      )}

      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.5)',
          }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      <div className="relative p-5 pt-6 overflow-hidden">
        <DocumentPatternBg active={isSelected} />

        <div className="relative flex items-start gap-3">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={
              isSelected
                ? {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 6px 14px -4px rgba(16, 185, 129, 0.4)',
                  }
                : {
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }
            }
          >
            <FileText className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0 pr-7">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {cv.file_name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatCVDate(cv.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`px-5 py-3 border-t flex items-center justify-between text-sm font-semibold transition-colors ${
          isSelected
            ? 'bg-emerald-50/60 border-emerald-100'
            : 'bg-orange-50/40 border-slate-100'
        }`}
      >
        {isSelected ? (
          <>
            <span className="text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              Valt CV
            </span>
            <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
              Aktivt
            </span>
          </>
        ) : (
          <>
            <span className="text-orange-700">Analysera detta CV</span>
            <ArrowRight
              className="w-4 h-4 text-orange-600 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </>
        )}
      </div>
    </motion.button>
  );
}

function DocumentPatternBg({ active }: { active: boolean }) {
  const stroke = active ? '#10B981' : '#DC2626';
  return (
    <svg
      className="absolute -right-4 -bottom-4 opacity-[0.07] pointer-events-none"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <rect x="20" y="15" width="80" height="100" rx="8" stroke={stroke} strokeWidth="2" />
      <line x1="32" y1="35" x2="80" y2="35" stroke={stroke} strokeWidth="2" />
      <line x1="32" y1="50" x2="72" y2="50" stroke={stroke} strokeWidth="2" />
      <line x1="32" y1="70" x2="80" y2="70" stroke={stroke} strokeWidth="2" />
      <line x1="32" y1="85" x2="64" y2="85" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
