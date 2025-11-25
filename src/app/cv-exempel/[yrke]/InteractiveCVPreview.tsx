'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Crown, ChevronDown, Check, Sparkles, Type, Palette } from 'lucide-react'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { getTemplateGenerator } from '@/lib/cv/templates'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'

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
  initialHTML: string
}

// Font options (typsnittsbytet appliceras via CSS)
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

export default function InteractiveCVPreview({ exempelCV, yrke, initialHTML }: InteractiveCVPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal')
  const [selectedFont, setSelectedFont] = useState('calibri')
  const [isClient, setIsClient] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [generatedHTML, setGeneratedHTML] = useState(initialHTML)

  const templateDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)


  // Generate HTML using the actual template generator (same as Puppeteer)
  useEffect(() => {
    // Skip first render - use initialHTML from SSR
    if (!isClient) {
      setIsClient(true)
      return
    }

    // Only regenerate when user changes template or font
    try {
      const cvMetadata = convertToCVMetadata(exempelCV)
      const templateGenerator = getTemplateGenerator(selectedTemplate as any)

      if (templateGenerator) {
        const html = templateGenerator.generate(cvMetadata, {})

        // Apply font family by injecting CSS
        const font = FONTS.find(f => f.id === selectedFont) || FONTS[0]
        const styledHTML = html.replace(
          /<style>/,
          `<style>\n      body, body * { font-family: ${font.family} !important; }\n      `
        )

        setGeneratedHTML(styledHTML)
      }
    } catch (error) {
      console.error('Error generating CV HTML:', error)
    }
  }, [selectedTemplate, selectedFont, isClient, exempelCV])

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

  const template = SIMPLE_TEMPLATES.find(t => t.id === selectedTemplate) || SIMPLE_TEMPLATES[0]
  const font = FONTS.find(f => f.id === selectedFont) || FONTS[0]
  const freeTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'free')
  const premiumTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'premium')

  // Static CV for SEO/noscript
  const StaticCV = () => (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-slate-900">{exempelCV.namn}</h1>
      <p className="text-lg text-slate-700 mb-2">{exempelCV.titel}</p>
      <div className="text-sm text-slate-600 mb-6">
        <p>{exempelCV.kontakt.telefon} | {exempelCV.kontakt.epost}</p>
        <p>{exempelCV.kontakt.plats}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Profil</h2>
        <p className="text-slate-700">{exempelCV.profil}</p>
      </div>
    </div>
  )

  return (
    <div className="my-16">
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
          Byt mellan våra professionella CV-mallar och testa olika typsnitt
        </p>
      </div>

      <noscript>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-900 font-semibold">
            För bästa upplevelse, aktivera JavaScript i din webbläsare.
          </p>
        </div>
      </noscript>
          <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-cyan-100 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900">Anpassa förhandsvisningen</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Testa olika mallar och typsnitt
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
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-cyan-400 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {template.tier === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
                    <span className="font-semibold text-slate-900">{template.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${isTemplateOpen ? 'rotate-180' : ''}`} />
                </button>

                {!isMobile && isTemplateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
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

                    <div className="border-t border-slate-100 p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-amber-600 uppercase flex items-center gap-1">
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
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-cyan-400 transition-all flex items-center justify-between"
                  style={{ fontFamily: font.family }}
                >
                  <span className="font-semibold text-slate-900">{font.name}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${isFontOpen ? 'rotate-180' : ''}`} />
                </button>

                {!isMobile && isFontOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto"
                  >
                    {['ATS-Säkra', 'Moderna', 'Formella', 'Premium'].map((category) => {
                      const categoryFonts = FONTS.filter(f => f.category === category)
                      if (categoryFonts.length === 0) return null

                      return (
                        <div key={category}>
                          <div className="px-4 py-2 bg-slate-50">
                            <span className="text-xs font-semibold text-slate-600 uppercase">
                              {category}
                            </span>
                          </div>
                          {categoryFonts.map((fnt) => (
                            <button
                              key={fnt.id}
                              onClick={() => {
                                setSelectedFont(fnt.id)
                                setIsFontOpen(false)
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                                selectedFont === fnt.id ? 'bg-cyan-50' : 'hover:bg-slate-50'
                              }`}
                              style={{ fontFamily: fnt.family }}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedFont === fnt.id ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'
                              }`}>
                                {selectedFont === fnt.id && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm">{fnt.name}</div>
                                <div className="text-xs text-slate-600">{exempelCV.namn}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            </div>
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
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-600">Med {font.name} typsnitt</p>
                  </div>
                </div>
                {template.tier === 'premium' && (
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                )}
              </div>

              <div className="bg-white" style={{ minHeight: '800px', maxHeight: '800px', overflowY: 'auto' }}>
                {generatedHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: generatedHTML }} />
                ) : (
                  <div className="p-12 space-y-6 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <p className="font-semibold">Förbättra ditt nuvarande CV</p>
                  <p className="text-sm text-cyan-100">Ladda upp ditt CV. Vi pekar ut vad som saknas och flyttar över din info till professionell design.</p>
                </div>
                <a
                  href="/dashboard/cv-mallar"
                  className="px-6 py-3 bg-white text-cyan-600 font-bold rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-5 h-5" />
                  Kom igång gratis
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex gap-3 mt-6">
            <Eye className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-900">
              <p className="font-semibold mb-1">Detta är en förhandsvisning</p>
              <p className="text-cyan-800">
                När du skapar ditt CV får du tillgång till alla mallar, färger och export till PDF/Word.
              </p>
            </div>
          </div>
    </div>
  )
}
