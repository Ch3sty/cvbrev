'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Info, Check, Crown } from 'lucide-react';

// Font definitions
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
  // ATS-Safe System Fonts
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

  // Modern Google Fonts
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

  // Formal Serif Fonts
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

  // Premium
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
  'ats-safe': 'ATS-Säkra Klassiker (System Fonts)',
  'modern': 'Moderna & Trendiga (Google Fonts)',
  'formal': 'Formella & Traditionella (Serif)',
  'premium': 'Premium'
};

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
  userName = 'Johanna Andersson'
}: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGoogleFontsInfo, setShowGoogleFontsInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFontData = FONTS[selectedFont];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Google Fonts when selector opens
  useEffect(() => {
    if (isOpen) {
      loadGoogleFonts();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  // Load Google Fonts dynamically
  const loadGoogleFonts = () => {
    const linkId = 'google-fonts-link';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  const handleFontSelect = (fontId: FontId) => {
    const font = FONTS[fontId];

    // Check if premium font and user doesn't have premium
    if (font.tier === 'premium' && !isPremium) {
      return;
    }

    onFontChange(fontId);
    setIsOpen(false);
  };

  // Group fonts by category
  const fontsByCategory: Record<FontCategory, Font[]> = {
    'ats-safe': [],
    'modern': [],
    'formal': [],
    'premium': []
  };

  Object.values(FONTS).forEach(font => {
    fontsByCategory[font.category].push(font);
  });

  const renderFontOption = (font: Font) => {
    const isSelected = font.id === selectedFont;
    const isLocked = font.tier === 'premium' && !isPremium;

    return (
      <button
        key={font.id}
        onClick={() => handleFontSelect(font.id)}
        disabled={isLocked}
        className={`
          w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors
          ${isSelected ? 'bg-pink-50 border-pink-300' : 'bg-white border-transparent'}
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
          ${isMobile ? 'border-2 rounded-lg mb-2' : 'border-l-2'}
        `}
        style={{
          fontFamily: font.fallback,
          minHeight: isMobile ? '60px' : '44px'
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${isSelected ? 'border-pink-600 bg-pink-600' : 'border-gray-300'}
          `}>
            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>

          <div className="flex-1 text-left">
            <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
              {font.name}
              {font.tier === 'premium' && (
                isLocked ? (
                  <Crown className="w-4 h-4 text-gray-400" />
                ) : (
                  <Crown className="w-4 h-4 text-purple-600" />
                )
              )}
            </div>
            <div
              className="text-gray-600 mt-0.5"
              style={{
                fontFamily: font.fallback,
                fontSize: isMobile ? '14px' : '13px'
              }}
            >
              {userName}
            </div>
          </div>
        </div>

        {isSelected && !isMobile && (
          <Check className="w-4 h-4 text-pink-600 flex-shrink-0" />
        )}
      </button>
    );
  };

  const renderCategorySection = (category: FontCategory) => {
    const fonts = fontsByCategory[category];
    if (fonts.length === 0) return null;

    const isModernCategory = category === 'modern';

    return (
      <div key={category} className={isMobile ? 'mb-6' : ''}>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {CATEGORY_LABELS[category]}
          </span>

          {isModernCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGoogleFontsInfo(!showGoogleFontsInfo);
              }}
              className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Information om Google Fonts"
            >
              <Info className="w-4 h-4 text-blue-600" />
            </button>
          )}
        </div>

        {isModernCategory && showGoogleFontsInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 border-b border-blue-200 px-4 py-3"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-medium mb-1">Google Fonts fungerar perfekt i PDF och HTML-format.</p>
                <p>För Word-dokument (DOCX) visas dessa fonter bara om du har dem installerade på din dator. Annars används Arial/Calibri som fallback.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className={isMobile ? 'px-2 pt-2' : ''}>
          {fonts.map(renderFontOption)}
        </div>
      </div>
    );
  };

  // Mobile: Fullscreen modal
  if (isMobile) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Type className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">Typsnitt</label>
            <p className="text-xs text-gray-600">Välj font för ditt brev</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-between"
        >
          <span
            className="text-sm font-medium"
            style={{ fontFamily: selectedFontData.fallback }}
          >
            {selectedFontData.name}
          </span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                  <h3 className="text-lg font-semibold text-gray-900">Välj Typsnitt</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 pb-safe">
                  {(['ats-safe', 'modern', 'formal', 'premium'] as FontCategory[]).map(renderCategorySection)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: Dropdown
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4" ref={dropdownRef}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-gray-600" />
          <div>
            <label className="text-sm font-medium text-gray-900">Typsnitt</label>
            <p className="text-xs text-gray-600">Välj ett professionellt typsnitt</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors min-w-[180px]"
            style={{ fontFamily: selectedFontData.fallback }}
          >
            <span className="text-sm font-medium flex-1 text-left">
              {selectedFontData.name}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-[500px] overflow-y-auto"
            >
              {(['ats-safe', 'modern', 'formal', 'premium'] as FontCategory[]).map(renderCategorySection)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
