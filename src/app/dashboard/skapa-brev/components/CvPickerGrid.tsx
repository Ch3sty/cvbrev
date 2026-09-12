'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, Check, ArrowRight, Upload, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatCVDate } from '@/lib/utils/date-formatter';

/** Raden väljaren behöver. cv_text hämtas inte: den visas aldrig här. */
export interface PickerCv {
  id: string;
  file_name: string;
  created_at: string;
}

interface CvPickerGridProps {
  /* CV och låsstatus kommer utifrån, server-hämtade i page.tsx. Förut läste
     komponenten cv-store och körde dessutom useCvQuota, som i sin tur gjorde
     auth.getUser, en profilfråga och ännu en CV-fråga i tur och ordning. Tre
     seriella rundturer för att kunna rita kort som servern redan kände till. */
  cvs: PickerCv[];
  /** ID:n som ligger utanför gratisgränsen och därför är låsta. */
  lockedCvIds: Set<string>;
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
}

/**
 * CV-väljare för skapa-brev. Bygger på samma DNA som
 * jobbmatchningens CvSelectorCard men med radio-semantik:
 * varje kort har "Välj"-CTA i omarkerat läge och "Valt" (emerald)
 * i markerat läge, inget separat aktiverings-action.
 *
 * Skiljer sig från UnifiedCVSelector genom:
 * - Inget cv_text-utdrag (för mycket brus)
 * - Emerald done-state istället för pink/purple
 * - Orange/röd ikon-gradient + dokument-mönster
 * - Tunn orange topp-linje på varje kort
 * - 1 kolumn på mobil, 2 kolumner från md
 */
export default function CvPickerGrid({
  cvs,
  lockedCvIds,
  selectedCV,
  onCVSelect,
}: CvPickerGridProps) {
  // Ingen laddningssnurra längre: listan finns i första HTML från servern.
  if (cvs.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-8 text-center">
        <p className="text-sm font-semibold text-neutral-900 mb-1">
          Inga CV:n hittades
        </p>
        <p className="text-sm text-neutral-600 mb-4">
          Du behöver minst ett CV för att skriva brev.
        </p>
        <Link
          href="/dashboard/profil/cv"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm min-h-[44px]"
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
        {cvs.map((cv) => {
          const locked = lockedCvIds.has(cv.id)
          return (
            <CvPickerCard
              key={cv.id}
              cv={cv}
              isSelected={selectedCV === cv.id}
              isLocked={locked}
              onSelect={() => {
                if (!locked) onCVSelect(cv.id)
              }}
            />
          )
        })}
      </div>

      {/* Subtil länk till uppladdning */}
      <Link
        href="/dashboard/profil/cv"
        className="block group"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-orange-600" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900">
                Ladda upp ett nytt CV
              </div>
              <div className="text-xs text-neutral-500">
                Tar dig till Mina CV:n
              </div>
            </div>
          </div>
          <ArrowRight
            className="w-4 h-4 text-neutral-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
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
  isLocked,
  onSelect,
}: {
  cv: { id: string; file_name: string; created_at: string };
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={isLocked}
      title={
        isLocked
          ? 'CV:t är låst, uppgradera till Premium för att kunna använda det'
          : undefined
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isLocked ? 0.6 : 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={isLocked ? undefined : { y: -3 }}
      whileTap={isLocked ? undefined : { scale: 0.98 }}
      className={`group relative w-full text-left rounded-xl border-2 transition-all overflow-hidden focus:outline-none ${
        isLocked
          ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
          : isSelected
            ? 'bg-white border-emerald-500'
            : 'bg-white border-neutral-200 hover:border-orange-300'
      }`}
      aria-pressed={isSelected}
    >
      {/* Lås-pill i övre högra hörnet när låst */}
      {isLocked && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 border border-orange-200">
          <Lock className="w-3 h-3 text-orange-700" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            Låst
          </span>
        </div>
      )}

      {/* Selected check i övre högra hörnet */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10 bg-emerald-600"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Header med subtilt dokument-mönster */}
      <div className="relative p-5 pt-6 overflow-hidden">
        <DocumentPatternBg active={isSelected} />

        <div className="relative flex items-start gap-3">
          <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
            <FileText
              className={`w-6 h-6 ${isSelected ? 'text-emerald-600' : 'text-orange-600'}`}
              strokeWidth={2.25}
            />
          </div>
          <div className="flex-1 min-w-0 pr-7">
            <h3 className="text-base font-bold text-neutral-900 truncate">
              {cv.file_name}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatCVDate(cv.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* CTA-rad: "Välj detta CV" / "Valt" / "Låst" */}
      <div
        className={`px-5 py-3 border-t flex items-center justify-between text-sm font-semibold transition-colors ${
          isLocked
            ? 'bg-neutral-100/80 border-neutral-200'
            : isSelected
              ? 'bg-emerald-50/60 border-emerald-100'
              : 'bg-orange-50/40 border-neutral-100'
        }`}
      >
        {isLocked ? (
          <>
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Lock className="w-4 h-4" strokeWidth={2.5} />
              Premium-låst
            </span>
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
              Uppgradera
            </span>
          </>
        ) : isSelected ? (
          <>
            <span className="text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              Valt CV
            </span>
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Aktivt
            </span>
          </>
        ) : (
          <>
            <span className="text-orange-700">Välj detta CV</span>
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
