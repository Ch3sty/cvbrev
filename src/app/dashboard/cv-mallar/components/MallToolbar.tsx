'use client';

import { useState, useRef, useEffect } from 'react';
import { Type, Image as ImageIcon, Linkedin, ChevronDown, Check, X } from 'lucide-react';
import { FONTS, getFontsGroupedByCategory, type FontOption } from '@/lib/cv/preview-utils';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

/** Maste matcha langden pa ut-keyframsen i FONT_MENU_CSS. */
const FONT_EXIT_MS = 220;

/**
 * Bade desktop-dropdownen och mobilens bottom sheet oppnas av samma
 * `isFontOpen`, sa de delar in- och ut-animationer. Sheetens fjader ersatts av
 * en cubic-bezier med samma karaktar; ingen av keyframsen ror hojd, sa CLS
 * paverkas inte.
 */
const FONT_MENU_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .font-menu-enter { animation: fontMenuIn 150ms ease-out both; }
  .font-menu-leave { animation: fontMenuOut 150ms ease-in both; }
  .font-scrim-enter { animation: fontScrimIn 150ms ease-out both; }
  .font-scrim-leave { animation: fontScrimOut ${FONT_EXIT_MS}ms ease-in both; }
  .font-sheet-enter { animation: fontSheetIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  .font-sheet-leave { animation: fontSheetOut ${FONT_EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) both; }
  @keyframes fontMenuIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fontMenuOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-8px); }
  }
  @keyframes fontScrimIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fontScrimOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes fontSheetIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes fontSheetOut {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
}
`;

interface MallToolbarProps {
  template: SimpleTemplate | undefined;
  selectedFont: string;
  onFontChange: (fontId: string) => void;
  includePhoto: boolean;
  onTogglePhoto: () => void;
  includeLinkedIn: boolean;
  onToggleLinkedIn: () => void;
  isPremium: boolean;
}

/**
 * Liten toolbar som sitter ovanfOr live-previewn pa /dashboard/cv-mallar.
 *
 * - Typsnitt-dropdown (FONTS-array, grupperad)
 * - Foto-toggle (visas bara om template.features.supportsPhoto)
 * - LinkedIn-toggle (visas bara om template.features.supportsLinkedIn)
 *
 * Mobile: dropdown blir bottom sheet (samma teknik som InteractiveCVShowcase).
 */
export default function MallToolbar({
  template,
  selectedFont,
  onFontChange,
  includePhoto,
  onTogglePhoto,
  includeLinkedIn,
  onToggleLinkedIn,
  isPremium,
}: MallToolbarProps) {
  const [isFontOpen, setIsFontOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Menyn maste ligga kvar i DOM:en medan ut-animationen kor. `leaving` valjer
  // keyframe och en timer pa samma langd plockar bort den efterat, sa varken
  // dropdown eller sheet kan fastna oppen.
  const [fontMounted, setFontMounted] = useState(false);
  const [fontLeaving, setFontLeaving] = useState(false);

  useEffect(() => {
    if (isFontOpen) {
      setFontLeaving(false);
      setFontMounted(true);
      return;
    }
    if (!fontMounted) return;
    setFontLeaving(true);
    const timer = setTimeout(() => {
      setFontMounted(false);
      setFontLeaving(false);
    }, FONT_EXIT_MS);
    return () => clearTimeout(timer);
    // `fontMounted` las bara for att hoppa over forsta renderingen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFontOpen]);

  // Click-outside handler for desktop dropdown
  useEffect(() => {
    if (!isFontOpen) return;
    // Under md-brytpunkten ligger menyn i ett ark med egen scrim som stänger.
    // matchMedia läses vid klick, inte vid render, så den styr aldrig vad
    // servern ritar i första HTML.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFontOpen]);

  const currentFont = FONTS.find(f => f.id === selectedFont) || FONTS[0];
  const fontGroups = getFontsGroupedByCategory();
  const supportsPhoto = !!template?.features?.supportsPhoto;
  const supportsLinkedIn = !!template?.features?.supportsLinkedIn;

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 flex-wrap p-3 sm:p-4 rounded-xl bg-white border border-orange-100 min-h-[72px] sm:min-h-[76px]"
      >
      {fontMounted && <style dangerouslySetInnerHTML={{ __html: FONT_MENU_CSS }} />}
      {/* Typsnitt-dropdown */}
      <div ref={fontDropdownRef} className="relative">
        <button
          onClick={() => setIsFontOpen(!isFontOpen)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 text-neutral-800 font-semibold text-sm hover:border-orange-200 transition-colors min-h-[40px]"
        >
          <Type className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
          <span className="hidden sm:inline">Typsnitt:</span>
          <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-500 transition-transform ${isFontOpen ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>

        {/* Desktop dropdown */}
        {fontMounted && (
          <div
            className={`hidden md:block absolute top-full left-0 mt-2 w-64 max-h-[420px] overflow-y-auto bg-white rounded-xl border border-orange-100 z-50 ${
              fontLeaving ? 'font-menu-leave' : 'font-menu-enter'
            }`}
          >
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2 first:pt-3 last:pb-3">
                    <div className="px-4 pb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
                      {category}
                    </div>
                    {fonts.map(font => (
                      <FontOptionRow
                        key={font.id}
                        font={font}
                        isSelected={font.id === selectedFont}
                        isPremium={isPremium}
                        onSelect={() => {
                          onFontChange(font.id);
                          setIsFontOpen(false);
                        }}
                      />
                    ))}
                  </div>
                ))}
          </div>
        )}
      </div>

      {/* Foto-toggle */}
      {supportsPhoto && (
        <ToggleChip
          icon={<ImageIcon className="w-4 h-4" strokeWidth={2.5} />}
          label="Foto"
          checked={includePhoto}
          onClick={onTogglePhoto}
        />
      )}

      {/* LinkedIn-toggle */}
      {supportsLinkedIn && (
        <ToggleChip
          icon={<Linkedin className="w-4 h-4" strokeWidth={2.5} />}
          label="LinkedIn"
          checked={includeLinkedIn}
          onClick={onToggleLinkedIn}
        />
      )}

      {/* Mobile bottom sheet for font */}
      {fontMounted && (
          <>
            <div
              onClick={() => setIsFontOpen(false)}
              className={`md:hidden fixed inset-0 bg-black/40 z-50 ${
                fontLeaving ? 'font-scrim-leave' : 'font-scrim-enter'
              }`}
            />
            <div
              className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 max-h-[80vh] overflow-y-auto ${
                fontLeaving ? 'font-sheet-leave' : 'font-sheet-enter'
              }`}
            >
              <div className="sticky top-0 bg-white border-b border-orange-100 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Välj typsnitt</h3>
                <button
                  onClick={() => setIsFontOpen(false)}
                  className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center"
                  aria-label="Stäng"
                >
                  <X className="w-5 h-5 text-neutral-700" strokeWidth={2.5} />
                </button>
              </div>
              <div className="pb-4">
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2">
                    <div className="px-5 pb-1.5 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
                      {category}
                    </div>
                    {fonts.map(font => (
                      <FontOptionRow
                        key={font.id}
                        font={font}
                        isSelected={font.id === selectedFont}
                        isPremium={isPremium}
                        onSelect={() => {
                          onFontChange(font.id);
                          setIsFontOpen(false);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FontOptionRow                                                             */
/* -------------------------------------------------------------------------- */

function FontOptionRow({
  font,
  isSelected,
  isPremium,
  onSelect,
}: {
  font: FontOption;
  isSelected: boolean;
  isPremium: boolean;
  onSelect: () => void;
}) {
  const isLocked = font.tier === 'premium' && !isPremium;
  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-orange-50 transition-colors text-left ${
        isLocked ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-base text-neutral-900 truncate"
          style={{ fontFamily: font.family }}
        >
          {font.name}
        </span>
        {font.tier === 'premium' && (
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex-shrink-0">
            Premium
          </span>
        )}
      </div>
      {isSelected && (
        <Check className="w-4 h-4 text-orange-700 flex-shrink-0" strokeWidth={3} />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  ToggleChip - foto/LinkedIn toggles (renare design)                         */
/* -------------------------------------------------------------------------- */

function ToggleChip({
  icon,
  label,
  checked,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-xl border font-semibold text-sm transition-all min-h-[40px] ${
        checked
          ? 'bg-white border-orange-200 text-neutral-800'
          : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
      }`}
      aria-pressed={checked}
    >
      <span className={`transition-colors ${checked ? 'text-orange-600' : 'text-neutral-400'}`}>{icon}</span>
      <span>{label}</span>
      <span
        className="relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0"
        style={{
          background: checked
            ? '#EA580C'
            : '#D4D4D4',
        }}
      >
        <span
          className="absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-sm"
          style={{
            transform: checked ? 'translateX(16px)' : 'translateX(2px)',
          }}
        />
      </span>
    </button>
  );
}
