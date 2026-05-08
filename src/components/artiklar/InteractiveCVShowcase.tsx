'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Crown, ChevronDown, Check, Sparkles, Type, Palette } from 'lucide-react'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { getTemplateGenerator } from '@/lib/cv/templates'
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'
import { FONTS } from '@/lib/cv/preview-utils'

// Inbyggd exempeldata - projektledare (brett användbar för artiklar)
const SHOWCASE_CV = {
  namn: 'Erik Lindberg',
  titel: 'Projektledare inom IT',
  kontakt: {
    telefon: '073-456 78 90',
    epost: 'erik.lindberg@email.se',
    plats: 'Stockholm',
    linkedin: 'linkedin.com/in/eriklindberg'
  },
  profil: 'Erfaren projektledare med 6+ års erfarenhet av att leda digitala transformationsprojekt inom bank och fintech. Certifierad i både agila metoder (Scrum, SAFe) och traditionell projektledning (PMP). Levererat 15+ projekt med en genomsnittlig budget på 8 MSEK. Stark kommunikatör som bygger högpresterande team och säkerställer stakeholder-alignment.',
  erfarenhet: [
    {
      titel: 'Senior Projektledare',
      arbetsgivare: 'Nordea Bank',
      period: '2021 – Pågående',
      beskrivning: [
        'Leder cross-functional team på 12 personer i implementation av ny mobilbanksplattform',
        'Ansvarig för budget på 15 MSEK och rapportering till styrgrupp med IT-direktör',
        'Implementerade agil transformation som ökade leveranshastighet med 35%',
        'Koordinerar med externa leverantörer och säkerställer compliance med finansiella regelverk'
      ]
    },
    {
      titel: 'Projektledare',
      arbetsgivare: 'Klarna',
      period: '2018 – 2021',
      beskrivning: [
        'Ledde 8 produktutvecklingsprojekt inom checkout och betalningslösningar',
        'Introducerade Scrum-ramverk som minskade time-to-market med 40%',
        'Mentorerade 3 juniora projektledare och etablerade projektledarprogram',
        'Koordinerade release-planering med 5 utvecklingsteam (50+ utvecklare)'
      ]
    }
  ],
  utbildning: [
    {
      titel: 'Civilingenjör Industriell Ekonomi',
      skola: 'Kungliga Tekniska Högskolan',
      period: '2013 – 2018',
      beskrivning: 'Specialisering inom projektledning och verksamhetsstyrning'
    }
  ],
  kompetenser: {
    tekniska: [
      'Projektledningsmetodik: Scrum, Kanban, SAFe, Waterfall',
      'Verktyg: Jira, Confluence, MS Project, Miro',
      'Budget- och resursplanering',
      'Riskhantering och kvalitetssäkring',
      'Stakeholder management',
      'Agil transformation'
    ],
    personliga: [
      'Ledarskap och teamutveckling',
      'Kommunikation och presentation',
      'Problemlösning och beslutsfattande',
      'Förhandling och konflikthantering',
      'Strategiskt tänkande'
    ]
  },
  certifieringar: [
    'PMP – Project Management Professional (2022)',
    'SAFe 5.0 Agilist (2021)',
    'Professional Scrum Master I (2019)',
    'PRINCE2 Foundation (2018)'
  ],
  sprak: [
    { sprak: 'Svenska', niva: 'Modersmål' },
    { sprak: 'Engelska', niva: 'Flytande' }
  ]
}

// Font options imported from shared preview-utils.ts (single source of truth)

export default function InteractiveCVShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal')
  const [selectedFont, setSelectedFont] = useState('calibri')
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [isClient, setIsClient] = useState(false)

  const templateDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)

  // Generate initial HTML on mount and when template/font changes
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    try {
      const cvMetadata = convertToCVMetadata(SHOWCASE_CV)
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
  }, [selectedTemplate, selectedFont, isClient])

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

  // Static fallback for SSR/noscript
  const StaticCV = () => (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-slate-900">{SHOWCASE_CV.namn}</h1>
      <p className="text-lg text-slate-700 mb-2">{SHOWCASE_CV.titel}</p>
      <div className="text-sm text-slate-600 mb-6">
        <p>{SHOWCASE_CV.kontakt.telefon} | {SHOWCASE_CV.kontakt.epost}</p>
        <p>{SHOWCASE_CV.kontakt.plats}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Profil</h2>
        <p className="text-slate-700">{SHOWCASE_CV.profil}</p>
      </div>
    </div>
  )

  if (!isClient) {
    return (
      <div className="my-10 not-prose">
        <StaticCV />
      </div>
    )
  }

  return (
    <div className="my-10 not-prose">
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

        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Testa våra CV-mallar
        </h3>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Byt mellan mallar och typsnitt för att se hur ditt CV kan se ut
        </p>
      </div>

      <noscript>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-900 font-semibold">
            För bästa upplevelse, aktivera JavaScript i din webbläsare.
          </p>
        </div>
      </noscript>

      {/* Controls */}
      <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-cyan-100 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-cyan-600" />
          <h4 className="font-bold text-slate-900">Anpassa förhandsvisningen</h4>
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

            {/* Mobile Modal for Templates */}
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
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-900">Välj mall</h4>
                      <button onClick={() => setIsTemplateOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-4 space-y-2">
                      {[...freeTemplates, ...premiumTemplates].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTemplate(t.id)
                            setIsTemplateOpen(false)
                          }}
                          className={`w-full px-4 py-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                            selectedTemplate === t.id
                              ? 'bg-cyan-50 border-cyan-600'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedTemplate === t.id ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'
                          }`}>
                            {selectedTemplate === t.id && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm text-slate-900 flex items-center gap-2">
                              {t.name}
                              {t.tier === 'premium' && <Crown className="w-4 h-4 text-amber-500" />}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
                            <div className="text-xs text-slate-600">{SHOWCASE_CV.namn}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* Mobile Modal for Fonts */}
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
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-900">Välj typsnitt</h4>
                      <button onClick={() => setIsFontOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
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
                          <div key={category}>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 sticky top-0">
                              <span className="text-xs font-semibold text-slate-600 uppercase">{category}</span>
                            </div>
                            <div className="p-2">
                              {categoryFonts.map((fnt) => (
                                <button
                                  key={fnt.id}
                                  onClick={() => {
                                    setSelectedFont(fnt.id)
                                    setIsFontOpen(false)
                                  }}
                                  className={`w-full px-4 py-4 mb-2 rounded-lg border-2 flex items-center gap-3 ${
                                    selectedFont === fnt.id
                                      ? 'bg-cyan-50 border-cyan-600'
                                      : 'bg-white border-slate-200'
                                  }`}
                                  style={{ fontFamily: fnt.family }}
                                >
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedFont === fnt.id ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300'
                                  }`}>
                                    {selectedFont === fnt.id && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-medium text-sm">{fnt.name}</div>
                                    <div className="text-sm text-slate-600 mt-1" style={{ fontFamily: fnt.family }}>
                                      {SHOWCASE_CV.namn}
                                    </div>
                                  </div>
                                </button>
                              ))}
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
      </div>

      {/* CV Preview */}
      <AnimatePresence mode="wait" initial={false}>
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
                <h4 className="font-bold text-slate-900">{template.name}</h4>
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

          <div className="bg-white" style={{ minHeight: '600px', maxHeight: '800px', overflowY: 'auto' }}>
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
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-semibold">Skapa ditt eget CV</p>
              <p className="text-sm text-cyan-100">Ladda upp ditt CV eller börja från början – vi hjälper dig hela vägen.</p>
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
            När du skapar ditt CV får du tillgång till alla 8 mallar, 11 typsnitt och export till PDF/Word.
          </p>
        </div>
      </div>
    </div>
  )
}
