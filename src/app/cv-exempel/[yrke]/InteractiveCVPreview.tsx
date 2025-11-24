'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Crown, ChevronDown, Check, Sparkles, Type, Palette } from 'lucide-react'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

interface InteractiveCVPreviewProps {
  exempelCV: {
    namn: string
    titel: string
    kontakt: {
      telefon: string
      epost: string
      plats: string
      linkedin?: string
    }
    profil: string
    erfarenhet: Array<{
      titel: string
      arbetsgivare: string
      period: string
      beskrivning: string[]
    }>
    utbildning: Array<{
      titel: string
      skola: string
      period: string
      beskrivning?: string
    }>
    kompetenser: {
      tekniska: string[]
      personliga: string[]
    }
    certifieringar: string[]
    sprak: Array<{
      sprak: string
      niva: string
    }>
  }
  yrke: string
}

// Font options similar to letter preview
const FONTS = [
  // ATS-Safe System Fonts
  { id: 'calibri', name: 'Calibri', family: 'Calibri, Arial, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'arial', name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'verdana', name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'ATS-Säkra', tier: 'free' },

  // Modern Google Fonts
  { id: 'lato', name: 'Lato', family: "'Lato', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', Arial, sans-serif", category: 'Moderna', tier: 'free' },

  // Formal Serif Fonts
  { id: 'georgia', name: 'Georgia', family: 'Georgia, Times, serif', category: 'Formella', tier: 'free' },
  { id: 'garamond', name: 'Garamond', family: 'Garamond, Georgia, serif', category: 'Formella', tier: 'free' },
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'Formella', tier: 'free' },

  // Premium
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Premium', tier: 'premium' }
]

export default function InteractiveCVPreview({ exempelCV, yrke }: InteractiveCVPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal')
  const [selectedFont, setSelectedFont] = useState('calibri')
  const [isClient, setIsClient] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const templateDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)

  // SEO: Progressive enhancement - visa statiskt innehåll först
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close dropdown on click outside (desktop only)
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

  const template = SIMPLE_TEMPLATES.find(t => t.id === selectedTemplate) || SIMPLE_TEMPLATES[0]
  const font = FONTS.find(f => f.id === selectedFont) || FONTS[0]
  const freeTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'free')
  const premiumTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'premium')

  // Static CV component for SEO and noscript
  const StaticCV = () => (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{exempelCV.namn}</h1>
        <p className="text-lg text-slate-700 mb-2">{exempelCV.titel}</p>
        <div className="text-sm text-slate-600">
          <p>{exempelCV.kontakt.telefon} | {exempelCV.kontakt.epost}</p>
          <p>{exempelCV.kontakt.plats}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Profil</h2>
        <p className="text-slate-700">{exempelCV.profil}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Erfarenhet</h2>
        {exempelCV.erfarenhet.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <p className="font-semibold text-slate-900">{exp.titel}</p>
            <p className="text-sm text-slate-700">{exp.arbetsgivare} | {exp.period}</p>
            <ul className="list-disc list-inside text-sm text-slate-700 mt-1">
              {exp.beskrivning.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="my-16">
      {/* Section Header */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-full mb-4 border border-cyan-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Eye className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
            Interaktiv CV-förhandsvisning
          </span>
        </motion.div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Se hur CV:t ser ut i olika mallar
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Byt mellan våra professionella CV-mallar och testa olika typsnitt för att se vilket format som passar dig bäst
        </p>
      </div>

      {/* Noscript fallback för SEO och tillgänglighet */}
      <noscript>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-900 font-semibold">
            För bästa upplevelse, aktivera JavaScript i din webbläsare.
          </p>
        </div>
        <StaticCV />
      </noscript>

      {/* Visa statiskt innehåll innan JavaScript laddat (SEO) */}
      {!isClient && <StaticCV />}

      {/* Interaktiva kontroller (endast när JavaScript laddat) */}
      {isClient && (
        <>
          {/* Controls */}
          <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-cyan-100 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900">Anpassa förhandsvisningen</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Testa olika mallar och typsnitt för att se hur ditt CV kan se ut
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Template Selector */}
              <div className="relative" ref={templateDropdownRef}>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <Palette className="w-4 h-4 text-slate-600" />
                  Välj mall
                </label>

                <button
                  onClick={() => {
                    setIsTemplateOpen(!isTemplateOpen)
                    setIsFontOpen(false)
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    {template.tier === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
                    <span className="font-semibold text-slate-900">{template.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${isTemplateOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown */}
                {!isMobile && (
                  <AnimatePresence>
                    {isTemplateOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
                      >
                        {/* Free Templates */}
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Gratis mallar
                          </div>
                          {freeTemplates.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setSelectedTemplate(t.id)
                                setIsTemplateOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                selectedTemplate === t.id
                                  ? 'bg-cyan-50 text-cyan-900'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{t.name}</div>
                                <div className="text-xs text-slate-500">{t.description}</div>
                              </div>
                              {selectedTemplate === t.id && (
                                <Check className="w-5 h-5 text-cyan-600 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Premium Templates */}
                        <div className="border-t border-slate-100 p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium mallar
                          </div>
                          {premiumTemplates.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setSelectedTemplate(t.id)
                                setIsTemplateOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                selectedTemplate === t.id
                                  ? 'bg-amber-50 text-amber-900'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {t.name}
                                  <Crown className="w-3 h-3 text-amber-500" />
                                </div>
                                <div className="text-xs text-slate-500">{t.description}</div>
                              </div>
                              {selectedTemplate === t.id && (
                                <Check className="w-5 h-5 text-amber-600 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Mobile Bottom Sheet for Templates */}
                {isMobile && (
                  <AnimatePresence>
                    {isTemplateOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 z-40"
                          onClick={() => setIsTemplateOpen(false)}
                        />
                        <motion.div
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '100%' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
                        >
                          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Välj CV-mall</h3>
                          </div>

                          <div className="p-6">
                            {/* Free Templates */}
                            <div className="mb-6">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                Gratis mallar
                              </div>
                              <div className="space-y-2">
                                {freeTemplates.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => {
                                      setSelectedTemplate(t.id)
                                      setIsTemplateOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors border-2 ${
                                      selectedTemplate === t.id
                                        ? 'bg-cyan-50 border-cyan-500 text-cyan-900'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{t.name}</div>
                                      <div className="text-sm text-slate-500">{t.description}</div>
                                    </div>
                                    {selectedTemplate === t.id && (
                                      <Check className="w-6 h-6 text-cyan-600 flex-shrink-0 ml-2" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Premium Templates */}
                            <div>
                              <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                                <Crown className="w-4 h-4" />
                                Premium mallar
                              </div>
                              <div className="space-y-2">
                                {premiumTemplates.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => {
                                      setSelectedTemplate(t.id)
                                      setIsTemplateOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors border-2 ${
                                      selectedTemplate === t.id
                                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center gap-2">
                                        {t.name}
                                        <Crown className="w-4 h-4 text-amber-500" />
                                      </div>
                                      <div className="text-sm text-slate-500">{t.description}</div>
                                    </div>
                                    {selectedTemplate === t.id && (
                                      <Check className="w-6 h-6 text-amber-600 flex-shrink-0 ml-2" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Font Selector */}
              <div className="relative" ref={fontDropdownRef}>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <Type className="w-4 h-4 text-slate-600" />
                  Välj typsnitt
                </label>

                <button
                  onClick={() => {
                    setIsFontOpen(!isFontOpen)
                    setIsTemplateOpen(false)
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-cyan-400 transition-all flex items-center justify-between group"
                  style={{ fontFamily: font.family }}
                >
                  <div className="flex items-center gap-2">
                    {font.tier === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
                    <span className="font-semibold text-slate-900">{font.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${isFontOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Font Dropdown */}
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
                                    ? 'bg-cyan-50 border-cyan-600'
                                    : 'bg-white border-transparent hover:bg-slate-50'
                                }`}
                                style={{ fontFamily: fnt.family }}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>

                                <div className="flex-1 text-left">
                                  <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                    {fnt.name}
                                    {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                  </div>
                                  <div className="text-xs text-slate-600" style={{ fontFamily: fnt.family }}>
                                    {exempelCV.namn}
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

                {/* Mobile Font Bottom Sheet */}
                {isMobile && (
                  <AnimatePresence>
                    {isFontOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 z-40"
                          onClick={() => setIsFontOpen(false)}
                        />
                        <motion.div
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '100%' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
                        >
                          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Välj typsnitt</h3>
                          </div>

                          <div className="p-6">
                            {['ATS-Säkra', 'Moderna', 'Formella', 'Premium'].map((category) => {
                              const categoryFonts = FONTS.filter(f => f.category === category)
                              if (categoryFonts.length === 0) return null

                              return (
                                <div key={category} className="mb-6">
                                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                    {category}
                                  </div>
                                  <div className="space-y-2">
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
                                          className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors border-2 ${
                                            isSelected
                                              ? 'bg-cyan-50 border-cyan-500 text-cyan-900'
                                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                          }`}
                                          style={{ fontFamily: fnt.family }}
                                        >
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'
                                          }`}>
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                          </div>

                                          <div className="flex-1">
                                            <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                              {fnt.name}
                                              {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1" style={{ fontFamily: fnt.family }}>
                                              {exempelCV.namn}
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
                      </>
                    )}
                  </AnimatePresence>
                )}
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

          {/* CV Preview */}
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
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{template.name}</h3>
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

              {/* CV Content */}
              <div
                className="p-8 sm:p-12 bg-white"
                style={{
                  fontFamily: font.family,
                  maxHeight: '800px',
                  overflowY: 'auto'
                }}
              >
                {/* Modern Minimal Template */}
                {selectedTemplate === 'modern-minimal' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-4">
                      <h1 className="text-3xl font-bold text-slate-900 mb-1">{exempelCV.namn}</h1>
                      <p className="text-lg text-slate-700 mb-2">{exempelCV.titel}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>{exempelCV.kontakt.telefon}</span>
                        <span>•</span>
                        <span>{exempelCV.kontakt.epost}</span>
                        <span>•</span>
                        <span>{exempelCV.kontakt.plats}</span>
                        {exempelCV.kontakt.linkedin && (
                          <>
                            <span>•</span>
                            <span>{exempelCV.kontakt.linkedin}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Profil */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Profil</h2>
                      <p className="text-slate-700 leading-relaxed">{exempelCV.profil}</p>
                    </div>

                    {/* Erfarenhet */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Erfarenhet</h2>
                      <div className="space-y-4">
                        {exempelCV.erfarenhet.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-semibold text-slate-900">{exp.titel}</h3>
                              <span className="text-sm text-slate-600">{exp.period}</span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{exp.arbetsgivare}</p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                              {exp.beskrivning.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utbildning */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Utbildning</h2>
                      <div className="space-y-3">
                        {exempelCV.utbildning.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-semibold text-slate-900">{edu.titel}</h3>
                              <span className="text-sm text-slate-600">{edu.period}</span>
                            </div>
                            <p className="text-sm text-slate-700">{edu.skola}</p>
                            {edu.beskrivning && (
                              <p className="text-sm text-slate-600 mt-1">{edu.beskrivning}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kompetenser */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Kompetenser</h2>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Tekniska kompetenser</h3>
                          <div className="flex flex-wrap gap-2">
                            {exempelCV.kompetenser.tekniska.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Personliga egenskaper</h3>
                          <div className="flex flex-wrap gap-2">
                            {exempelCV.kompetenser.personliga.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifieringar */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Certifieringar</h2>
                      <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                        {exempelCV.certifieringar.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Språk */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide">Språk</h2>
                      <div className="space-y-1 text-sm text-slate-700">
                        {exempelCV.sprak.map((lang, idx) => (
                          <p key={idx}><span className="font-semibold">{lang.sprak}:</span> {lang.niva}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Classic Professional Template */}
                {selectedTemplate === 'classic-professional' && (
                  <div className="space-y-5">
                    {/* Header - Traditional centered */}
                    <div className="text-center border-b border-slate-300 pb-4">
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">{exempelCV.namn}</h1>
                      <p className="text-base text-slate-700 mb-2">{exempelCV.titel}</p>
                      <div className="text-sm text-slate-600">
                        <p>{exempelCV.kontakt.telefon} | {exempelCV.kontakt.epost}</p>
                        <p>{exempelCV.kontakt.plats}</p>
                      </div>
                    </div>

                    {/* Profil */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">PROFIL</h2>
                      <p className="text-sm text-slate-700 leading-relaxed">{exempelCV.profil}</p>
                    </div>

                    {/* Erfarenhet */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">ARBETSLIVSERFARENHET</h2>
                      <div className="space-y-3">
                        {exempelCV.erfarenhet.map((exp, idx) => (
                          <div key={idx}>
                            <p className="font-semibold text-slate-900">{exp.titel}</p>
                            <p className="text-sm text-slate-700">{exp.arbetsgivare}</p>
                            <p className="text-sm text-slate-600 mb-1">{exp.period}</p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                              {exp.beskrivning.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utbildning */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">UTBILDNING</h2>
                      <div className="space-y-2">
                        {exempelCV.utbildning.map((edu, idx) => (
                          <div key={idx}>
                            <p className="font-semibold text-slate-900">{edu.titel}</p>
                            <p className="text-sm text-slate-700">{edu.skola}, {edu.period}</p>
                            {edu.beskrivning && (
                              <p className="text-sm text-slate-600">{edu.beskrivning}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kompetenser */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">KOMPETENSER</h2>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">Tekniska kompetenser:</p>
                          <p className="text-sm text-slate-700">{exempelCV.kompetenser.tekniska.join(' • ')}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm mb-1">Personliga egenskaper:</p>
                          <p className="text-sm text-slate-700">{exempelCV.kompetenser.personliga.join(' • ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Certifieringar */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">CERTIFIERINGAR</h2>
                      <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                        {exempelCV.certifieringar.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Språk */}
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">SPRÅK</h2>
                      <div className="space-y-1 text-sm text-slate-700">
                        {exempelCV.sprak.map((lang, idx) => (
                          <p key={idx}>{lang.sprak}: {lang.niva}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Remaining templates (clean-corporate, creative-edge, executive-premium, nordic-professional, platinum-executive, creative-minimal) */}
                {/* These will use variations of the modern-minimal layout with different styling */}
                {(selectedTemplate === 'clean-corporate' ||
                  selectedTemplate === 'creative-edge' ||
                  selectedTemplate === 'executive-premium' ||
                  selectedTemplate === 'nordic-professional' ||
                  selectedTemplate === 'platinum-executive' ||
                  selectedTemplate === 'creative-minimal') && (
                  <div className="space-y-6">
                    {/* Header with accent color based on template */}
                    <div className={`pb-4 ${
                      selectedTemplate === 'creative-edge' ? 'border-b-4 border-indigo-600' :
                      selectedTemplate === 'executive-premium' ? 'border-b-2 border-slate-800' :
                      'border-b-2 border-slate-400'
                    }`}>
                      <h1 className={`text-3xl font-bold mb-1 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>{exempelCV.namn}</h1>
                      <p className="text-lg text-slate-700 mb-2">{exempelCV.titel}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>{exempelCV.kontakt.telefon}</span>
                        <span>•</span>
                        <span>{exempelCV.kontakt.epost}</span>
                        <span>•</span>
                        <span>{exempelCV.kontakt.plats}</span>
                        {exempelCV.kontakt.linkedin && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">{exempelCV.kontakt.linkedin}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Profil */}
                    <div>
                      <h2 className={`text-lg font-bold mb-2 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Profil</h2>
                      <p className="text-slate-700 leading-relaxed">{exempelCV.profil}</p>
                    </div>

                    {/* Erfarenhet */}
                    <div>
                      <h2 className={`text-lg font-bold mb-3 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Erfarenhet</h2>
                      <div className="space-y-4">
                        {exempelCV.erfarenhet.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-semibold text-slate-900">{exp.titel}</h3>
                              <span className="text-sm text-slate-600">{exp.period}</span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{exp.arbetsgivare}</p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                              {exp.beskrivning.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utbildning */}
                    <div>
                      <h2 className={`text-lg font-bold mb-3 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Utbildning</h2>
                      <div className="space-y-3">
                        {exempelCV.utbildning.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-semibold text-slate-900">{edu.titel}</h3>
                              <span className="text-sm text-slate-600">{edu.period}</span>
                            </div>
                            <p className="text-sm text-slate-700">{edu.skola}</p>
                            {edu.beskrivning && (
                              <p className="text-sm text-slate-600 mt-1">{edu.beskrivning}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kompetenser */}
                    <div>
                      <h2 className={`text-lg font-bold mb-3 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Kompetenser</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Tekniska kompetenser</h3>
                          <div className="space-y-1">
                            {exempelCV.kompetenser.tekniska.map((skill, idx) => (
                              <div key={idx} className="text-sm text-slate-700">• {skill}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Personliga egenskaper</h3>
                          <div className="space-y-1">
                            {exempelCV.kompetenser.personliga.map((skill, idx) => (
                              <div key={idx} className="text-sm text-slate-700">• {skill}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifieringar */}
                    <div>
                      <h2 className={`text-lg font-bold mb-3 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Certifieringar</h2>
                      <ul className="space-y-1 text-sm text-slate-700">
                        {exempelCV.certifieringar.map((cert, idx) => (
                          <li key={idx}>• {cert}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Språk */}
                    <div>
                      <h2 className={`text-lg font-bold mb-3 ${
                        selectedTemplate === 'creative-edge' ? 'text-indigo-900' : 'text-slate-900'
                      }`}>Språk</h2>
                      <div className="space-y-1 text-sm text-slate-700">
                        {exempelCV.sprak.map((lang, idx) => (
                          <p key={idx}><span className="font-semibold">{lang.sprak}:</span> {lang.niva}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Footer */}
              <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <p className="font-semibold">Gillar du vad du ser?</p>
                  <p className="text-sm text-cyan-100">Skapa ditt professionella CV på mindre än 5 minuter med våra mallar</p>
                </div>
                <a
                  href="/verktyg/cv-mallar"
                  className="px-6 py-3 bg-white text-cyan-600 font-bold rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-5 h-5" />
                  Skapa mitt CV
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Info Box */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex gap-3 mt-6">
            <Eye className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-900">
              <p className="font-semibold mb-1">Detta är en förhandsvisning</p>
              <p className="text-cyan-800">
                När du skapar ditt CV får du tillgång till alla mallar, anpassningsbara färger, och export till både PDF och Word. Helt kostnadsfritt att prova!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
