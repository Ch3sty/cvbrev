'use client';

/**
 * Typsnittsväljaren i steg 6. En rad i panel med en sekundär knapp som
 * öppnar listan: dropdown (svävande, får skugga) från md, Sheet på mobil.
 * Valt typsnitt markeras med fylld radiopunkt i ink. Premiumtypsnitt är
 * spärrade med "Premium" som meta. Ingen rörelse.
 *
 * FONTS och FontId används också av nedladdnings-API:t, så datan ligger
 * kvar här oförändrad.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Sheet from '@/components/shell/Sheet';

export type FontId =
  | 'calibri' | 'arial' | 'verdana'
  | 'lato' | 'open-sans' | 'roboto' | 'poppins'
  | 'georgia' | 'garamond' | 'times'
  | 'helvetica';

export type FontCategory = 'ats-safe' | 'modern' | 'formal' | 'premium';

export interface Font {
  id: FontId;
  name: string;
  displayName: string;
  category: FontCategory;
  source: 'system' | 'google' | 'premium';
  fallback: string;
  tier: 'free' | 'premium';
  cssFamily: string;
}

export const FONTS: Record<FontId, Font> = {
  calibri: {
    id: 'calibri',
    name: 'Calibri',
    displayName: 'Calibri',
    category: 'ats-safe',
    source: 'system',
    fallback: 'Calibri, Arial, sans-serif',
    tier: 'free',
    cssFamily: 'Calibri'
  },
  arial: {
    id: 'arial',
    name: 'Arial',
    displayName: 'Arial',
    category: 'ats-safe',
    source: 'system',
    fallback: 'Arial, Helvetica, sans-serif',
    tier: 'free',
    cssFamily: 'Arial'
  },
  verdana: {
    id: 'verdana',
    name: 'Verdana',
    displayName: 'Verdana',
    category: 'ats-safe',
    source: 'system',
    fallback: 'Verdana, Geneva, sans-serif',
    tier: 'free',
    cssFamily: 'Verdana'
  },
  lato: {
    id: 'lato',
    name: 'Lato',
    displayName: 'Lato',
    category: 'modern',
    source: 'google',
    fallback: 'Lato, Arial, sans-serif',
    tier: 'free',
    cssFamily: "'Lato', sans-serif"
  },
  'open-sans': {
    id: 'open-sans',
    name: 'Open Sans',
    displayName: 'Open Sans',
    category: 'modern',
    source: 'google',
    fallback: "'Open Sans', Arial, sans-serif",
    tier: 'free',
    cssFamily: "'Open Sans', sans-serif"
  },
  roboto: {
    id: 'roboto',
    name: 'Roboto',
    displayName: 'Roboto',
    category: 'modern',
    source: 'google',
    fallback: 'Roboto, Arial, sans-serif',
    tier: 'free',
    cssFamily: "'Roboto', sans-serif"
  },
  poppins: {
    id: 'poppins',
    name: 'Poppins',
    displayName: 'Poppins',
    category: 'modern',
    source: 'google',
    fallback: 'Poppins, Arial, sans-serif',
    tier: 'free',
    cssFamily: "'Poppins', sans-serif"
  },
  georgia: {
    id: 'georgia',
    name: 'Georgia',
    displayName: 'Georgia',
    category: 'formal',
    source: 'system',
    fallback: 'Georgia, Times, serif',
    tier: 'free',
    cssFamily: 'Georgia'
  },
  garamond: {
    id: 'garamond',
    name: 'Garamond',
    displayName: 'Garamond',
    category: 'formal',
    source: 'system',
    fallback: 'Garamond, Georgia, serif',
    tier: 'free',
    cssFamily: 'Garamond'
  },
  times: {
    id: 'times',
    name: 'Times New Roman',
    displayName: 'Times New Roman',
    category: 'formal',
    source: 'system',
    fallback: "'Times New Roman', Times, serif",
    tier: 'free',
    cssFamily: "'Times New Roman'"
  },
  helvetica: {
    id: 'helvetica',
    name: 'Helvetica',
    displayName: 'Helvetica',
    category: 'premium',
    source: 'premium',
    fallback: 'Helvetica, Arial, sans-serif',
    tier: 'premium',
    cssFamily: 'Helvetica'
  }
};

const CATEGORY_LABELS: Record<FontCategory, string> = {
  'ats-safe': 'ATS-säkra klassiker',
  modern: 'Moderna (Google Fonts)',
  formal: 'Formella (serif)',
  premium: 'Premium',
};

const CATEGORY_ORDER: FontCategory[] = ['ats-safe', 'modern', 'formal', 'premium'];

interface FontSelectorProps {
  selectedFont: FontId;
  onFontChange: (fontId: FontId) => void;
  isPremium?: boolean;
  userName?: string;
}

export default function FontSelector({
  selectedFont,
  onFontChange,
  isPremium = false,
  userName = 'Johanna Andersson',
}: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFontData = FONTS[selectedFont];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Google Fonts hämtas först när listan öppnas.
  useEffect(() => {
    if (!isOpen) return;
    const linkId = 'google-fonts-link';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href =
        'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [isOpen]);

  // Klick utanför stänger dropdownen på desktop. Sheet sköter sig själv.
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  const handleFontSelect = (fontId: FontId) => {
    const font = FONTS[fontId];
    if (font.tier === 'premium' && !isPremium) return;
    onFontChange(fontId);
    setIsOpen(false);
  };

  const fontsByCategory: Record<FontCategory, Font[]> = {
    'ats-safe': [],
    modern: [],
    formal: [],
    premium: [],
  };
  Object.values(FONTS).forEach((font) => {
    fontsByCategory[font.category].push(font);
  });

  const renderFontOption = (font: Font) => {
    const isSelected = font.id === selectedFont;
    const isLocked = font.tier === 'premium' && !isPremium;

    return (
      <button
        key={font.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={() => handleFontSelect(font.id)}
        disabled={isLocked}
        className="flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isSelected ? 'border-ink-1 bg-ink-1' : 'border-kant-stark bg-panel'
          }`}
        >
          {isSelected ? <span className="h-2 w-2 rounded-full bg-panel" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">
            {font.name}
            {font.tier === 'premium' ? (
              <span className="ml-2 text-meta font-normal text-ink-3">Premium</span>
            ) : null}
          </span>
          <span className="block truncate text-meta text-ink-3" style={{ fontFamily: font.fallback }}>
            {userName}
          </span>
        </span>
      </button>
    );
  };

  const list = (
    <div role="radiogroup" aria-label="Typsnitt">
      {CATEGORY_ORDER.map((category) => {
        const fonts = fontsByCategory[category];
        if (fonts.length === 0) return null;
        return (
          <div key={category}>
            <div className="border-b border-kant bg-insunken px-4 py-2">
              <p className="text-sm font-medium text-ink-3">{CATEGORY_LABELS[category]}</p>
              {category === 'modern' ? (
                <p className="mt-0.5 text-meta text-ink-3">
                  Syns i PDF. I Word krävs att typsnittet finns på datorn, annars används Arial.
                </p>
              ) : null}
            </div>
            <div className="py-1">{fonts.map(renderFontOption)}</div>
          </div>
        );
      })}
    </div>
  );

  const trigger = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-kant bg-panel px-3 text-sm font-medium text-ink-1 transition-[border-color] duration-[120ms] hover:border-kant-stark sm:w-auto sm:min-w-[200px]"
      style={{ fontFamily: selectedFontData.fallback }}
    >
      {selectedFontData.name}
      <ChevronDown className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.75} />
    </button>
  );

  return (
    <div
      ref={dropdownRef}
      className="flex flex-col gap-3 rounded-xl border border-kant bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-1">Typsnitt</p>
        <p className="text-meta text-ink-3">Gäller PDF och Word.</p>
      </div>

      {isMobile ? (
        <>
          {trigger}
          <Sheet open={isOpen} onClose={() => setIsOpen(false)} title="Välj typsnitt" bare>
            {list}
          </Sheet>
        </>
      ) : (
        <div className="relative">
          {trigger}
          {isOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 max-h-[480px] w-[380px] overflow-y-auto rounded-xl border border-kant bg-panel shadow-svav">
              {list}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
