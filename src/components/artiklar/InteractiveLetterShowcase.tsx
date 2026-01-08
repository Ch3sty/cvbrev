'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Type, Eye, Sparkles, Crown, ChevronDown, Check } from 'lucide-react'

// Inbyggd exempeldata för personligt brev
const SHOWCASE_LETTER = {
  namn: 'Maria Johansson',
  adress: 'Stockholm',
  telefon: '070-987 65 43',
  epost: 'maria.johansson@email.se',
  arbetsgivare: 'Företaget AB',
  roll: 'Ekonomiassistent',
  datum: '7 januari 2026',
  brevText: `Hej,

Jag söker tjänsten som ekonomiassistent hos Företaget AB eftersom jag vill arbeta i en organisation där jag kan kombinera min analytiska förmåga med mitt intresse för ekonomi och administration.

Under mina tre år som ekonomiassistent på Konsultbolaget har jag utvecklat djup kompetens inom löpande bokföring, leverantörs- och kundreskontran samt månadsavstämningar. Jag arbetar dagligen i Fortnox och Excel och har även erfarenhet av att ta fram rapporter till ledningsgruppen.

Det som utmärker mig som kollega är min noggrannhet och mitt strukturerade arbetssätt. Jag trivs med att arbeta självständigt men uppskattar också samarbete i team. På min nuvarande arbetsplats har jag fått förtroendet att introducera nya medarbetare i våra ekonomirutiner.

Jag ser fram emot att berätta mer om hur jag kan bidra till ert team.

Med vänlig hälsning,
Maria Johansson`
}

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Klassisk',
    tier: 'free',
    description: 'Traditionell svensk brevmall',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'normal' as const,
    borderStyle: 'none' as const
  },
  {
    id: 'sidebar',
    name: 'Sidofält',
    tier: 'free',
    description: 'Vertikal linje som skiljer kontaktinfo från innehåll',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'compact' as const,
    borderStyle: 'left' as const
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tier: 'free',
    description: 'Ren från/till struktur',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'loose' as const,
    borderStyle: 'none' as const
  },
  {
    id: 'compact',
    name: 'Kompakt',
    tier: 'free',
    description: 'Sparar vertikalt utrymme med inline kontaktinfo',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'compact' as const,
    borderStyle: 'none' as const
  },
  {
    id: 'centered',
    name: 'Centrerad',
    tier: 'premium',
    description: 'Centrerad header med horisontell linje',
    headerAlign: 'center' as const,
    bodyAlign: 'left' as const,
    spacing: 'normal' as const,
    borderStyle: 'top' as const
  },
  {
    id: 'twocolumn',
    name: 'Professional Split',
    tier: 'premium',
    description: 'Två-kolumns layout med kontaktinfo till höger',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'normal' as const,
    borderStyle: 'bottom' as const
  }
]

const FONTS = [
  { id: 'calibri', name: 'Calibri', family: 'Calibri, Arial, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'arial', name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'verdana', name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'lato', name: 'Lato', family: "'Lato', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, Times, serif', category: 'Formella', tier: 'free' },
  { id: 'garamond', name: 'Garamond', family: 'Garamond, Georgia, serif', category: 'Formella', tier: 'free' },
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'Formella', tier: 'free' },
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Premium', tier: 'premium' }
]

export default function InteractiveLetterShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [selectedFont, setSelectedFont] = useState('calibri')
  const [isClient, setIsClient] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const templateDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setIsTemplateOpen(false)
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontOpen(false)
      }
    }

    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]
  const font = FONTS.find(f => f.id === selectedFont) || FONTS[0]

  const StaticLetter = () => (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg">
      <div className="mb-8 space-y-1 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{SHOWCASE_LETTER.namn}</p>
        <p>{SHOWCASE_LETTER.adress}</p>
        <p>{SHOWCASE_LETTER.telefon}</p>
        <p>{SHOWCASE_LETTER.epost}</p>
      </div>
      <div className="mb-8 space-y-1 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{SHOWCASE_LETTER.arbetsgivare}</p>
        <p className="font-medium text-slate-800">{SHOWCASE_LETTER.roll}</p>
      </div>
      <div className="space-y-4">
        {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    </div>
  )

  if (!isClient) {
    return (
      <div className="my-10 not-prose">
        <StaticLetter />
      </div>
    )
  }

  return (
    <div className="my-10 not-prose space-y-6">
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-4 border border-blue-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Interaktiv brev-förhandsvisning
          </span>
        </motion.div>

        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Testa våra brevmallar
        </h3>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Byt mellan mallar och typsnitt för att se hur ditt personliga brev kan se ut
        </p>
      </div>

      <noscript>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-900 font-semibold">
            För bästa upplevelse, aktivera JavaScript i din webbläsare.
          </p>
        </div>
        <StaticLetter />
      </noscript>

      {/* Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-slate-900">Anpassa förhandsvisningen</h4>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Testa olika mallar och typsnitt för att se hur ditt personliga brev kan se ut
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Template Dropdown */}
          <div ref={templateDropdownRef} className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Palette className="w-4 h-4 text-slate-600" />
              Välj mall
            </label>

            <button
              onClick={() => {
                setIsTemplateOpen(!isTemplateOpen)
                setIsFontOpen(false)
              }}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                {template.tier === 'premium' && (
                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-slate-900">{template.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isTemplateOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Dropdown */}
            {!isMobile && isTemplateOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
              >
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id
                  const isPremium = tmpl.tier === 'premium'

                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl.id)
                        setIsTemplateOpen(false)
                      }}
                      className={`w-full px-4 py-3 flex items-start gap-3 transition-colors border-l-4 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600'
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                          {tmpl.name}
                          {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{tmpl.description}</p>
                      </div>
                    </button>
                  )
                })}
              </motion.div>
            )}

            {/* Mobile Modal */}
            <AnimatePresence>
              {isMobile && isTemplateOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-end"
                  onClick={() => setIsTemplateOpen(false)}
                >
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                      <h4 className="text-lg font-semibold text-slate-900">Välj mall</h4>
                      <button
                        onClick={() => setIsTemplateOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                      {TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplate === tmpl.id
                        const isPremium = tmpl.tier === 'premium'

                        return (
                          <button
                            key={tmpl.id}
                            onClick={() => {
                              setSelectedTemplate(tmpl.id)
                              setIsTemplateOpen(false)
                            }}
                            className={`w-full px-4 py-4 mb-2 rounded-lg border-2 flex items-start gap-3 transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>

                            <div className="flex-1 text-left">
                              <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                {tmpl.name}
                                {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{tmpl.description}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Font Dropdown */}
          <div ref={fontDropdownRef} className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Type className="w-4 h-4 text-slate-600" />
              Välj typsnitt
            </label>

            <button
              onClick={() => {
                setIsFontOpen(!isFontOpen)
                setIsTemplateOpen(false)
              }}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-400 transition-all flex items-center justify-between group"
              style={{ fontFamily: font.family }}
            >
              <div className="flex items-center gap-2">
                {font.tier === 'premium' && (
                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-slate-900">{font.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isFontOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Dropdown */}
            {!isMobile && isFontOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
              >
                {['ATS-Säkra', 'Moderna', 'Formella', 'Premium'].map((category) => {
                  const categoryFonts = FONTS.filter(f => f.category === category)
                  if (categoryFonts.length === 0) return null

                  return (
                    <div key={category}>
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          {category}
                        </span>
                      </div>

                      {categoryFonts.map((fnt) => {
                        const isSelected = selectedFont === fnt.id
                        const isPremium = fnt.tier === 'premium'

                        return (
                          <button
                            key={fnt.id}
                            onClick={() => {
                              setSelectedFont(fnt.id)
                              setIsFontOpen(false)
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors border-l-4 ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600'
                                : 'bg-white border-transparent hover:bg-slate-50'
                            }`}
                            style={{ fontFamily: fnt.family }}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                {fnt.name}
                                {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                              </div>
                              <div className="text-xs text-slate-600" style={{ fontFamily: fnt.family }}>
                                {SHOWCASE_LETTER.namn}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* Mobile Modal */}
            <AnimatePresence>
              {isMobile && isFontOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-end"
                  onClick={() => setIsFontOpen(false)}
                >
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                      <h4 className="text-lg font-semibold text-slate-900">Välj typsnitt</h4>
                      <button
                        onClick={() => setIsFontOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {['ATS-Säkra', 'Moderna', 'Formella', 'Premium'].map((category) => {
                        const categoryFonts = FONTS.filter(f => f.category === category)
                        if (categoryFonts.length === 0) return null

                        return (
                          <div key={category} className="mb-6">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 sticky top-0">
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                {category}
                              </span>
                            </div>

                            <div className="p-2">
                              {categoryFonts.map((fnt) => {
                                const isSelected = selectedFont === fnt.id
                                const isPremium = fnt.tier === 'premium'

                                return (
                                  <button
                                    key={fnt.id}
                                    onClick={() => {
                                      setSelectedFont(fnt.id)
                                      setIsFontOpen(false)
                                    }}
                                    className={`w-full px-4 py-4 mb-2 rounded-lg border-2 flex items-center gap-3 transition-all ${
                                      isSelected
                                        ? 'bg-blue-50 border-blue-600'
                                        : 'bg-white border-slate-200'
                                    }`}
                                    style={{ fontFamily: fnt.family }}
                                  >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                    }`}>
                                      {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>

                                    <div className="flex-1 text-left">
                                      <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                        {fnt.name}
                                        {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                                      </div>
                                      <div className="text-sm text-slate-600 mt-1" style={{ fontFamily: fnt.family }}>
                                        {SHOWCASE_LETTER.namn}
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Premium Notice */}
        {template.tier === 'premium' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2"
          >
            <Crown className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-semibold">{template.name}</span> är en premium-mall. Uppgradera till Premium för tillgång till alla mallar och obegränsade nedladdningar.
            </div>
          </motion.div>
        )}
      </div>

      {/* Live Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedTemplate}-${selectedFont}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden"
        >
          {/* Preview Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{template.name}</h4>
                <p className="text-sm text-slate-600">
                  Med {font.name} typsnitt
                </p>
              </div>
            </div>
            {template.tier === 'premium' && (
              <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>

          {/* Letter Preview */}
          <div
            className="p-8 sm:p-12 bg-white"
            style={{
              fontFamily: font.family,
              maxHeight: '700px',
              overflowY: 'auto'
            }}
          >
            {/* Classic Template */}
            {selectedTemplate === 'classic' && (
              <div>
                <div className="mb-8">
                  <p className="font-bold text-slate-900 mb-2">{SHOWCASE_LETTER.namn}</p>
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.telefon}</p>
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.epost}</p>
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.adress}</p>
                </div>
                <div className="mb-8">
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.datum}</p>
                </div>
                <div className="mb-8">
                  <p className="font-bold text-slate-900">{SHOWCASE_LETTER.arbetsgivare}</p>
                  <p className="font-bold text-slate-900">Ansökan: {SHOWCASE_LETTER.roll}</p>
                </div>
                <div className="space-y-6">
                  {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Template */}
            {selectedTemplate === 'sidebar' && (
              <div className="flex gap-8">
                <div className="w-[23%] border-r-2 border-gray-400 pr-8 flex-shrink-0">
                  <p className="font-bold text-sm text-slate-900 mb-3 break-words">{SHOWCASE_LETTER.namn}</p>
                  <p className="text-xs text-slate-700 mb-2 break-words">{SHOWCASE_LETTER.telefon}</p>
                  <p className="text-xs text-slate-700 mb-2 break-words">{SHOWCASE_LETTER.epost}</p>
                  <p className="text-xs text-slate-700 break-words">{SHOWCASE_LETTER.adress}</p>
                </div>
                <div className="flex-1">
                  <div className="mb-8">
                    <p className="text-xs text-slate-700">{SHOWCASE_LETTER.datum}</p>
                  </div>
                  <div className="mb-8">
                    <p className="font-bold text-sm text-slate-900">{SHOWCASE_LETTER.arbetsgivare}</p>
                    <p className="font-bold text-sm text-slate-900">Ansökan: {SHOWCASE_LETTER.roll}</p>
                  </div>
                  <div className="space-y-6">
                    {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Minimal Template */}
            {selectedTemplate === 'minimal' && (
              <div>
                <div className="flex gap-8 mb-8">
                  <div className="flex-1">
                    <p className="font-bold text-xs text-gray-600 mb-3">Från</p>
                    <p className="text-sm text-slate-900 mb-2">{SHOWCASE_LETTER.namn}</p>
                    <p className="text-xs text-slate-700 mb-1">{SHOWCASE_LETTER.telefon}</p>
                    <p className="text-xs text-slate-700 mb-1">{SHOWCASE_LETTER.epost}</p>
                    <p className="text-xs text-slate-700">{SHOWCASE_LETTER.adress}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs text-gray-600 mb-3">Till</p>
                    <p className="text-sm text-slate-900 mb-2">{SHOWCASE_LETTER.arbetsgivare}</p>
                    <p className="text-xs text-slate-700">{SHOWCASE_LETTER.roll}</p>
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.datum}</p>
                </div>
                <div className="space-y-6">
                  {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Template */}
            {selectedTemplate === 'compact' && (
              <div>
                <div className="border-b border-gray-300 pb-2 mb-6">
                  <p className="text-xs text-gray-700">
                    {SHOWCASE_LETTER.namn} | {SHOWCASE_LETTER.epost} | {SHOWCASE_LETTER.telefon} | {SHOWCASE_LETTER.adress}
                  </p>
                </div>
                <div className="text-right mb-6">
                  <p className="text-xs text-gray-600">{SHOWCASE_LETTER.datum}</p>
                </div>
                <div className="mb-6">
                  <p className="font-bold text-sm text-slate-900">{SHOWCASE_LETTER.arbetsgivare}</p>
                  <p className="text-sm text-slate-900">Ansökan: {SHOWCASE_LETTER.roll}</p>
                </div>
                <div className="space-y-6">
                  {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Centered Template */}
            {selectedTemplate === 'centered' && (
              <div>
                <div className="text-center mb-6">
                  <p className="font-bold text-base text-slate-900 mb-2">{SHOWCASE_LETTER.namn}</p>
                  <p className="text-sm text-slate-700 mb-1">{SHOWCASE_LETTER.telefon}</p>
                  <p className="text-sm text-slate-700 mb-1">{SHOWCASE_LETTER.epost}</p>
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.adress}</p>
                </div>
                <div className="border-b border-black mb-8"></div>
                <div className="mb-3">
                  <p className="font-bold text-xs text-slate-900">Till</p>
                </div>
                <div className="mb-8">
                  <p className="text-sm text-slate-900">{SHOWCASE_LETTER.arbetsgivare}</p>
                </div>
                <div className="mb-8">
                  <p className="text-sm text-slate-700">{SHOWCASE_LETTER.datum}</p>
                </div>
                <div className="space-y-6">
                  {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Twocolumn Template */}
            {selectedTemplate === 'twocolumn' && (
              <div className="flex gap-8">
                <div className="w-[70%]">
                  <p className="font-bold text-lg text-slate-900 mb-2">{SHOWCASE_LETTER.namn}</p>
                  <p className="text-sm text-gray-600 mb-6">{SHOWCASE_LETTER.arbetsgivare}</p>
                  <p className="text-sm text-slate-700 mb-8">{SHOWCASE_LETTER.adress}, {SHOWCASE_LETTER.datum}</p>
                  <div className="space-y-6">
                    {SHOWCASE_LETTER.brevText.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="w-[30%]">
                  <div className="mb-8">
                    <p className="font-bold text-xs text-slate-900 mb-3">Till</p>
                    <p className="text-xs text-slate-700 mb-2">{SHOWCASE_LETTER.arbetsgivare}</p>
                    <p className="text-xs text-slate-700">{SHOWCASE_LETTER.roll}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 mb-3">Från</p>
                    <p className="text-xs text-slate-700 mb-2">{SHOWCASE_LETTER.namn}</p>
                    <p className="text-xs text-slate-700 mb-2">{SHOWCASE_LETTER.adress}</p>
                    <p className="text-xs text-slate-700 mb-2">{SHOWCASE_LETTER.telefon}</p>
                    <p className="text-xs text-blue-600">{SHOWCASE_LETTER.epost}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-semibold">Skapa ditt personliga brev</p>
              <p className="text-sm text-blue-100">Vi matchar ditt CV med jobbannonsen och skapar brevet åt dig på mindre än 60 sekunder</p>
            </div>
            <a
              href="/dashboard/skapa-brev"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5" />
              Skapa mitt brev
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Detta är en förhandsvisning</p>
          <p className="text-blue-800">
            När du skapar ditt personliga brev får du tillgång till alla 6 mallar, 11 typsnitt och export till PDF/Word.
          </p>
        </div>
      </div>
    </div>
  )
}
