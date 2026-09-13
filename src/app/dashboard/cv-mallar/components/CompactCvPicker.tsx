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
        className="flex items-center gap-3 rounded-xl border border-dashed border-kant-stark bg-insunken p-4 shadow-insunken transition-colors hover:border-ink-1"
      >
        <Plus className="h-6 w-6 flex-shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-kort text-ink-1">Ladda upp ett CV</span>
          <span className="block text-meta text-ink-3">
            Du behöver minst ett CV för att börja
          </span>
        </span>
      </Link>
    );
  }

  const current = cvs.find(cv => cv.id === selectedCV);
  const displayName = current?.file_name?.replace(/\.[^.]+$/, '') || 'Välj CV...';
  const displayDate = current?.created_at ? formatCVDate(current.created_at) : '';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-xl border border-kant bg-panel p-3 text-left transition-colors hover:border-kant-stark"
      >
        <FileText
          className="h-6 w-6 flex-shrink-0 text-ink-2"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-steg uppercase text-ink-3">Aktivt CV</span>
          <span className="mt-0.5 block truncate text-kort text-ink-1">{displayName}</span>
          {displayDate && <span className="block text-meta text-ink-3">{displayDate}</span>}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-ink-3 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
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
            className={`absolute left-0 right-0 top-full z-30 mt-2 max-h-[360px] overflow-y-auto rounded-xl border border-kant bg-panel ${
              leaving ? 'cv-picker-leave' : 'cv-picker-enter'
            }`}
          >
            <ul className="divide-y divide-kant">
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
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-insunken ${
                        isSelected ? 'bg-insunken' : ''
                      }`}
                    >
                      <FileText
                        className="h-5 w-5 flex-shrink-0 text-ink-2"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-kort text-ink-1">{name}</span>
                        {date && <span className="block text-meta text-ink-3">{date}</span>}
                      </span>
                      {isSelected && (
                        <Check
                          className="h-4 w-4 flex-shrink-0 text-ink-1"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-kant">
              <Link
                href="/dashboard/profil/cv"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
              >
                <Plus className="h-5 w-5 flex-shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
                Ladda upp ett nytt CV
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
