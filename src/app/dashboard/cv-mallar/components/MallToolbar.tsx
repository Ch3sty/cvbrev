'use client';

import { PAKETRADER } from '@/components/paywall/paywall-copy'
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
    <div className="flex min-h-[72px] flex-wrap items-center gap-2 rounded-xl border border-kant bg-panel p-3 sm:min-h-[76px] sm:gap-3 sm:p-4">
      {fontMounted && <style dangerouslySetInnerHTML={{ __html: FONT_MENU_CSS }} />}
      {/* Typsnitt-dropdown */}
      <div ref={fontDropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsFontOpen(!isFontOpen)}
          aria-expanded={isFontOpen}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-kant-stark bg-panel px-3 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken sm:px-4"
        >
          <Type className="h-4 w-4 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">Typsnitt:</span>
          <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
          <ChevronDown
            className={`h-4 w-4 text-ink-3 transition-transform ${isFontOpen ? 'rotate-180' : ''}`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>

        {/* Desktop dropdown */}
        {fontMounted && (
          <div
            className={`absolute left-0 top-full z-50 mt-2 hidden max-h-[420px] w-64 overflow-y-auto rounded-xl border border-kant bg-panel md:block ${
              fontLeaving ? 'font-menu-leave' : 'font-menu-enter'
            }`}
          >
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2 first:pt-3 last:pb-3">
                    <div className="px-4 pb-1.5 text-steg uppercase text-ink-3">
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
          icon={<ImageIcon className="h-4 w-4" strokeWidth={1.75} />}
          label="Foto"
          checked={includePhoto}
          onClick={onTogglePhoto}
        />
      )}

      {/* LinkedIn-toggle */}
      {supportsLinkedIn && (
        <ToggleChip
          icon={<Linkedin className="h-4 w-4" strokeWidth={1.75} />}
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
              className={`fixed inset-0 z-50 bg-ink-1/40 md:hidden ${
                fontLeaving ? 'font-scrim-leave' : 'font-scrim-enter'
              }`}
            />
            <div
              className={`fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-xl bg-panel md:hidden ${
                fontLeaving ? 'font-sheet-leave' : 'font-sheet-enter'
              }`}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-kant bg-panel px-4 py-3">
                <h3 className="text-kort text-ink-1">Välj typsnitt</h3>
                <button
                  type="button"
                  onClick={() => setIsFontOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 hover:bg-insunken"
                  aria-label="Stäng"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              <div className="pb-4">
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2">
                    <div className="px-5 pb-1.5 pt-2 text-steg uppercase text-ink-3">
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
      type="button"
      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-insunken ${
        isLocked ? 'cursor-not-allowed opacity-40' : ''
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="truncate text-base text-ink-1" style={{ fontFamily: font.family }}>
          {font.name}
        </span>
        {font.tier === 'premium' && (
          <span className="flex-shrink-0 rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-3">
            {PAKETRADER.bricka}
          </span>
        )}
      </span>
      {isSelected && (
        <Check className="h-4 w-4 flex-shrink-0 text-ink-1" strokeWidth={1.75} aria-hidden="true" />
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
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2.5 rounded-lg border border-kant-stark bg-panel py-2 pl-3 pr-2.5 text-sm font-medium transition-colors hover:bg-insunken ${
        checked ? 'text-ink-1' : 'text-ink-3'
      }`}
      aria-pressed={checked}
    >
      <span className={checked ? 'text-ink-2' : 'text-ink-3'} aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`relative h-[18px] w-8 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-ink-1' : 'bg-kant-stark'
        }`}
      >
        <span
          className="absolute top-[2px] h-3.5 w-3.5 rounded-full bg-panel transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(2px)' }}
        />
      </span>
    </button>
  );
}
