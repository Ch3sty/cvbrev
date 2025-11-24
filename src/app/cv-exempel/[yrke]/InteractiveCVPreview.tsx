'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Crown, ChevronDown, Check, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

interface InteractiveCVPreviewProps {
  exempelCV: {
    namn: string
    titel: string
    kontakt: any
    profil: string
    erfarenhet: any[]
    utbildning: any[]
    kompetenser: any
    certifieringar: string[]
    sprak: any[]
  }
  yrke: string
}

export default function InteractiveCVPreview({ exempelCV, yrke }: InteractiveCVPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal')
  const [isClient, setIsClient] = useState(false)
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTemplateOpen(false)
      }
    }

    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  const template = SIMPLE_TEMPLATES.find(t => t.id === selectedTemplate) || SIMPLE_TEMPLATES[0]
  const freeTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'free')
  const premiumTemplates = SIMPLE_TEMPLATES.filter(t => t.tier === 'premium')

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
          Byt mellan våra professionella CV-mallar för att se vilket format som passar dig bäst
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {/* Template Selector - Desktop Dropdown / Mobile Bottom Sheet */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsTemplateOpen(!isTemplateOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-3 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-cyan-500 transition-all shadow-sm"
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
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
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
        </div>

        {/* Mobile Bottom Sheet */}
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

      {/* CV Preview */}
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200"
        key={selectedTemplate}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Show SVG template image */}
        <div className="relative w-full aspect-[1/1.414] bg-slate-50 rounded-lg overflow-hidden">
          <Image
            src={template.imagePath}
            alt={`${template.name} CV-mall`}
            fill
            className="object-contain"
            priority
          />

          {/* Overlay with example data hint */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-6">
            <div className="text-center text-white">
              <p className="text-sm font-medium mb-2">
                Detta är en förhandsvisning av mallen
              </p>
              <p className="text-xs opacity-90">
                Ditt faktiska CV kommer innehålla din egen information
              </p>
            </div>
          </div>
        </div>

        {/* Template info */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {template.tier === 'premium' && <Crown className="w-5 h-5 text-amber-500" />}
            <h3 className="text-xl font-bold text-slate-900">{template.name}</h3>
          </div>
          <p className="text-slate-600 mb-4">{template.description}</p>

          {/* CTA to CV Mallar */}
          <a href="/verktyg/cv-mallar" className="inline-block">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ladda ner denna mall
              </span>
            </motion.button>
          </a>
        </div>
      </motion.div>

      {/* Help text */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-sm text-slate-600">
          <strong>Tips:</strong> Välj en mall som passar din bransch. Traditionella branscher (vård, offentlig sektor) → klassiska mallar. Kreativa branscher → modernare mallar.
        </p>
      </div>
    </div>
  )
}
