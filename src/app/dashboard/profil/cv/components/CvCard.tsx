'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import type { ParsedCV } from '@/lib/cv/cv-parser';
import CvDetailView from './CvDetailView';

interface CvCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
    structured_data: ParsedCV | null;
  };
  index?: number;
  isDeleting: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenInNewWindow: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onStructured: (data: ParsedCV) => void;
  preview: string;
  formatDate: (iso: string) => string;
  /** Sant om CV:t är låst (free-användare med fler CV än kvoten) */
  isLocked?: boolean;
}

export default function CvCard({
  cv,
  index = 0,
  isDeleting,
  expanded,
  onToggleExpand,
  onOpenInNewWindow,
  onDownload,
  onDelete,
  onStructured,
  preview,
  formatDate,
  isLocked = false,
}: CvCardProps) {
  const ageDays = Math.floor(
    (Date.now() - new Date(cv.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isFresh = ageDays < 7 && !isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={!expanded && !isLocked ? { y: -4 } : undefined}
      className={`group relative rounded-2xl border transition-all overflow-hidden ${
        isLocked
          ? 'bg-slate-50/80 border-slate-200'
          : expanded
            ? 'bg-white border-orange-300'
            : 'bg-white border-slate-200 hover:border-orange-300'
      }`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {!isLocked && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            boxShadow: '0 12px 32px -8px rgba(249, 115, 22, 0.25)',
            borderRadius: 'inherit',
          }}
        />
      )}

      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{
          background: isLocked
            ? 'linear-gradient(90deg, #CBD5E1, #94A3B8)'
            : isFresh
              ? 'linear-gradient(90deg, #FB923C, #DC2626)'
              : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
        }}
      />

      {/* Premium-låst overlay-banner */}
      {isLocked && (
        <div className="relative bg-gradient-to-r from-orange-50 to-rose-50 border-b border-orange-100 px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              }}
            >
              <Lock className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700 truncate">
              Premium-låst
            </span>
          </div>
          <Link
            href="/dashboard/profil/prenumeration"
            className="flex-shrink-0 text-[11px] font-bold text-orange-700 hover:text-orange-800 transition-colors"
          >
            Lås upp →
          </Link>
        </div>
      )}

      <div className="relative p-4 sm:p-5 overflow-hidden border-b border-slate-100">
        <DocumentPatternBg />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
              }}
            >
              <FileText className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate mb-1">
                {cv.file_name}
              </h3>
              <div className="flex items-center text-xs text-slate-500 gap-1.5">
                <Clock className="w-3 h-3" strokeWidth={2.25} />
                <span>{formatDate(cv.created_at)}</span>
                {isFresh && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-semibold">
                    Ny
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="Ta bort CV"
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            {isDeleting ? (
              <motion.div
                className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {!expanded && (
          <div
            className={`rounded-xl p-3 mb-4 min-h-[72px] ${
              isLocked
                ? 'bg-slate-100/60 border border-slate-200'
                : 'bg-orange-50/40 border border-orange-100'
            }`}
          >
            <p
              className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                isLocked ? 'text-slate-500' : 'text-slate-600'
              }`}
            >
              {preview}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={isLocked ? undefined : onToggleExpand}
            disabled={isLocked}
            title={
              isLocked
                ? 'CV:t är låst — uppgradera till Premium för att kunna använda det'
                : undefined
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all touch-manipulation min-h-[40px] ${
              isLocked
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'text-white'
            }`}
            style={
              isLocked
                ? undefined
                : {
                    background: 'linear-gradient(90deg, #F97316, #DC2626)',
                    boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
                  }
            }
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                <span className="truncate">Låst</span>
              </>
            ) : expanded ? (
              <>
                <EyeOff className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                <span className="truncate">Dölj</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                <span className="truncate">Visa</span>
              </>
            )}
          </button>

          <button
            onClick={isLocked ? undefined : onDownload}
            disabled={isLocked}
            title={
              isLocked
                ? 'CV:t är låst — uppgradera till Premium för att kunna använda det'
                : undefined
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all touch-manipulation min-h-[40px] ${
              isLocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/60'
            }`}
          >
            <Download className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            <span className="truncate">Välj mall</span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-slate-100 space-y-5">
                <CvDetailView
                  cvId={cv.id}
                  structuredData={cv.structured_data}
                  onStructured={onStructured}
                />

                <div className="flex justify-end">
                  <button
                    onClick={onOpenInNewWindow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-orange-700 transition-colors"
                  >
                    <ExternalLink
                      className="w-3.5 h-3.5"
                      strokeWidth={2.25}
                    />
                    Öppna råtext i nytt fönster
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DocumentPatternBg() {
  return (
    <svg
      className="absolute -right-4 -bottom-4 opacity-[0.06] pointer-events-none"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="15"
        width="80"
        height="100"
        rx="8"
        stroke="#DC2626"
        strokeWidth="2"
      />
      <line x1="32" y1="35" x2="80" y2="35" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="50" x2="72" y2="50" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="70" x2="80" y2="70" stroke="#DC2626" strokeWidth="2" />
      <line x1="32" y1="85" x2="64" y2="85" stroke="#DC2626" strokeWidth="2" />
    </svg>
  );
}
