'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, Check, Plus } from 'lucide-react';
import { useCVStore } from '@/store/cv-store';
import { formatCVDate } from '@/lib/utils/date-formatter';

interface CompactCvPickerProps {
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
}

/**
 * Kompakt CV-vajare for /dashboard/cv-mallar.
 *
 * Skiljer sig fran CvPickerGrid genom att vara en dropdown istallet for
 * en stor grid - tar mycket mindre plats sa fokus ligger pa preview.
 * Visar valt CV med fil-namn + datum, och dropdown for att byta.
 */
export default function CompactCvPicker({ selectedCV, onCVSelect }: CompactCvPickerProps) {
  const { cvs, isLoading } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50/40 border border-orange-100">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-600">Laddar CV:n...</span>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <Link
        href="/dashboard/profil/cv"
        className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50/40 border-2 border-dashed border-orange-200 hover:border-orange-300 transition-colors group"
      >
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">Ladda upp ett CV</div>
          <div className="text-xs text-slate-600">Du behöver minst ett CV för att börja</div>
        </div>
      </Link>
    );
  }

  const current = cvs.find(cv => cv.id === selectedCV);
  const displayName = current?.file_name?.replace(/\.[^.]+$/, '') || 'Välj CV...';
  const displayDate = current?.created_at ? formatCVDate(current.created_at) : '';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center gap-3 p-3 pl-4 rounded-2xl bg-orange-50/40 border border-orange-200 hover:border-orange-300 transition-colors text-left"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
      >
        {/* Aktiv-pip i vanster kant */}
        <span
          aria-hidden
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, #F97316, #DC2626)' }}
        />

        <span className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          <FileText className="w-5 h-5" strokeWidth={2.25} />
          {/* Emerald-check som visar att CV:t ar aktivt och redo */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
            Aktivt CV
          </span>
          <div className="text-sm font-bold text-slate-900 truncate">{displayName}</div>
          {displayDate && (
            <div className="text-xs text-slate-500">{displayDate}</div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-orange-100 z-30 max-h-[360px] overflow-y-auto"
            style={{ boxShadow: '0 16px 40px -12px rgba(249, 115, 22, 0.2)' }}
          >
            <ul>
              {cvs.map(cv => {
                const isSelected = cv.id === selectedCV;
                const name = cv.file_name?.replace(/\.[^.]+$/, '') || 'CV';
                const date = cv.created_at ? formatCVDate(cv.created_at) : '';
                return (
                  <li key={cv.id}>
                    <button
                      onClick={() => {
                        onCVSelect(cv.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                        isSelected ? 'bg-orange-50/60' : ''
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'text-white' : 'bg-orange-50 text-orange-700'
                        }`}
                        style={
                          isSelected
                            ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' }
                            : undefined
                        }
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.25} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{name}</div>
                        {date && <div className="text-xs text-slate-500">{date}</div>}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-orange-700 flex-shrink-0" strokeWidth={3} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-orange-100">
              <Link
                href="/dashboard/profil/cv"
                className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-orange-700 font-bold"
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 flex-shrink-0">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <span className="text-sm">Ladda upp ett nytt CV</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
