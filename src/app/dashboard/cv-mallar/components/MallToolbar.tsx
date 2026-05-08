'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Image as ImageIcon, Linkedin, ChevronDown, Check, X } from 'lucide-react';
import { FONTS, getFontsGroupedByCategory, type FontOption } from '@/lib/cv/preview-utils';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

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
  const [isMobile, setIsMobile] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click-outside handler for desktop dropdown
  useEffect(() => {
    if (!isFontOpen || isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFontOpen, isMobile]);

  const currentFont = FONTS.find(f => f.id === selectedFont) || FONTS[0];
  const fontGroups = getFontsGroupedByCategory();
  const supportsPhoto = !!template?.features?.supportsPhoto;
  const supportsLinkedIn = !!template?.features?.supportsLinkedIn;

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 flex-wrap p-3 sm:p-4 rounded-2xl bg-white border border-orange-100"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      {/* Typsnitt-dropdown */}
      <div ref={fontDropdownRef} className="relative">
        <button
          onClick={() => setIsFontOpen(!isFontOpen)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 text-slate-800 font-semibold text-sm hover:border-orange-200 transition-colors min-h-[40px]"
        >
          <Type className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
          <span className="hidden sm:inline">Typsnitt:</span>
          <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${isFontOpen ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>

        {/* Desktop dropdown */}
        {!isMobile && (
          <AnimatePresence>
            {isFontOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-64 max-h-[420px] overflow-y-auto bg-white rounded-2xl border border-orange-100 z-50"
                style={{ boxShadow: '0 16px 40px -12px rgba(249, 115, 22, 0.2)' }}
              >
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2 first:pt-3 last:pb-3">
                    <div className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
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
              </motion.div>
            )}
          </AnimatePresence>
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
      <AnimatePresence>
        {isFontOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFontOpen(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-orange-100 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Välj typsnitt</h3>
                <button
                  onClick={() => setIsFontOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
                  aria-label="Stäng"
                >
                  <X className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
                </button>
              </div>
              <div className="pb-4">
                {Object.entries(fontGroups).map(([category, fonts]) => (
                  <div key={category} className="py-2">
                    <div className="px-5 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
          className="text-base text-slate-900 truncate"
          style={{ fontFamily: font.family }}
        >
          {font.name}
        </span>
        {font.tier === 'premium' && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex-shrink-0">
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
/*  ToggleChip - foto/LinkedIn toggles                                         */
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
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border font-semibold text-sm transition-colors min-h-[40px] ${
        checked
          ? 'bg-orange-50 border-orange-200 text-orange-700'
          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
      }`}
      aria-pressed={checked}
    >
      <span className={checked ? 'text-orange-700' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
      <span
        className={`w-8 h-4 rounded-full relative transition-colors ${
          checked ? 'bg-orange-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
