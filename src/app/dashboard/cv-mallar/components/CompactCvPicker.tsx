'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronDown, Check, Plus } from 'lucide-react';
import { formatCVDate } from '@/lib/utils/date-formatter';

/** Maste matcha langden pa cvPickerOut nedan. */
const PICKER_EXIT_MS = 150;

export interface PickerCv {
  id: string;
  file_name: string;
  created_at: string;
}

interface CompactCvPickerProps {
  /** CV-listan, redan hämtad på servern. Väljaren hämtar ingenting själv. */
  cvs: PickerCv[];
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
export default function CompactCvPicker({ cvs, selectedCV, onCVSelect }: CompactCvPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listan maste ligga kvar i DOM:en medan ut-animationen kor, annars finns
  // inget att animera. `leaving` valjer keyframe och en timer pa exakt samma
  // langd plockar bort den efterat, sa ingen lista kan fastna oppen.
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLeaving(false);
      setMounted(true);
      return;
    }
    if (!mounted) return;
    setLeaving(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, PICKER_EXIT_MS);
    return () => clearTimeout(timer);
    // `mounted` las bara for att hoppa over forsta renderingen; den ska inte
    // trigga om timern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  // Inget laddningsläge längre. Listan kommer serverrenderad, så väljaren har
  // sin slutliga höjd i första målningen. Laddningsrutan var lägre än kortet
  // den byttes mot, och just det bytet var sidans layoutförskjutning.

  if (cvs.length === 0) {
    return (
      <Link
        href="/dashboard/profil/cv"
        className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/40 border-2 border-dashed border-orange-200 hover:border-orange-300 transition-colors group"
      >
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: '#EA580C' }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-neutral-900">Ladda upp ett CV</div>
          <div className="text-xs text-neutral-600">Du behöver minst ett CV för att börja</div>
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
        className="relative w-full flex items-center gap-3 p-3 pl-4 rounded-xl bg-orange-50/40 border border-orange-200 hover:border-orange-300 transition-colors text-left"
        >
        {/* Aktiv-pip i vanster kant */}
        <span
          aria-hidden
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ background: '#EA580C' }}
        />

        <span className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: '#EA580C' }}
        >
          <FileText className="w-5 h-5" strokeWidth={2.25} />
          {/* Emerald-check som visar att CV:t ar aktivt och redo */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
            Aktivt CV
          </span>
          <div className="text-sm font-bold text-neutral-900 truncate">{displayName}</div>
          {displayDate && (
            <div className="text-xs text-neutral-500">{displayDate}</div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={2.5}
        />
      </button>

      {mounted && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
        @media (prefers-reduced-motion: no-preference) {
          .cv-picker-enter { animation: cvPickerIn ${PICKER_EXIT_MS}ms ease-out both; }
          .cv-picker-leave { animation: cvPickerOut ${PICKER_EXIT_MS}ms ease-in both; }
          @keyframes cvPickerIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes cvPickerOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-8px); }
          }
        }
      `,
            }}
          />
          <div
            className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-orange-100 z-30 max-h-[360px] overflow-y-auto ${
              leaving ? 'cv-picker-leave' : 'cv-picker-enter'
            }`}
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
                            ? { background: '#EA580C' }
                            : undefined
                        }
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.25} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-900 truncate">{name}</div>
                        {date && <div className="text-xs text-neutral-500">{date}</div>}
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
          </div>
        </>
      )}
    </div>
  );
}
