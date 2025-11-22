'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Type, Eye, Download, Sparkles, Crown, CheckCircle } from 'lucide-react'

interface InteractiveLetterPreviewProps {
  exempelBrev: {
    namn: string
    adress: string
    telefon: string
    epost: string
    arbetsgivare: string
    roll: string
    datum: string
    brevText: string
  }
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
    id: 'minimal',
    name: 'Minimal',
    tier: 'free',
    description: 'Ren och luftig design',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'loose' as const,
    borderStyle: 'none' as const
  },
  {
    id: 'centered',
    name: 'Centrerad',
    tier: 'premium',
    description: 'Elegant centrerad layout',
    headerAlign: 'center' as const,
    bodyAlign: 'left' as const,
    spacing: 'normal' as const,
    borderStyle: 'top' as const
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    tier: 'premium',
    description: 'Modern med sidofält',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'compact' as const,
    borderStyle: 'left' as const
  },
  {
    id: 'compact',
    name: 'Kompakt',
    tier: 'premium',
    description: 'Kompakt för mycket innehåll',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'compact' as const,
    borderStyle: 'none' as const
  },
  {
    id: 'twocolumn',
    name: 'Två kolumner',
    tier: 'premium',
    description: 'Professionell två-kolumn',
    headerAlign: 'left' as const,
    bodyAlign: 'left' as const,
    spacing: 'normal' as const,
    borderStyle: 'bottom' as const
  }
]

const FONTS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', style: 'modern' },
  { id: 'lora', name: 'Lora', family: 'Lora, serif', style: 'elegant' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', style: 'clean' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif', style: 'traditional' },
  { id: 'opensans', name: 'Open Sans', family: '"Open Sans", sans-serif', style: 'friendly' },
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", serif', style: 'sophisticated' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', style: 'geometric' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', style: 'classic' }
]

export default function InteractiveLetterPreview({ exempelBrev }: InteractiveLetterPreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [selectedFont, setSelectedFont] = useState('inter')

  const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]
  const font = FONTS.find(f => f.id === selectedFont) || FONTS[0]

  const spacingClasses = {
    compact: 'space-y-3',
    normal: 'space-y-4',
    loose: 'space-y-6'
  }

  const borderStyles = {
    none: '',
    top: 'border-t-4 border-blue-600 pt-6',
    bottom: 'border-b-4 border-blue-600 pb-6',
    left: 'border-l-4 border-blue-600 pl-6'
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Anpassa förhandsvisningen</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Testa olika mallar och typsnitt för att se hur ditt personliga brev kan se ut
        </p>

        {/* Template Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-slate-600" />
            <label className="text-sm font-semibold text-slate-900">Välj mall</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id
              const isPremium = tmpl.tier === 'premium'

              return (
                <motion.button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPremium && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-3 h-3 text-amber-500" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 left-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'} ${isPremium ? 'pr-5' : ''}`}>
                    {tmpl.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {tmpl.description}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Font Selector */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-slate-600" />
            <label className="text-sm font-semibold text-slate-900">Välj typsnitt</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FONTS.map((fnt) => {
              const isSelected = selectedFont === fnt.id

              return (
                <motion.button
                  key={fnt.id}
                  onClick={() => setSelectedFont(fnt.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                  style={{ fontFamily: fnt.family }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {fnt.name}
                  </div>
                  <div className="text-xs text-slate-600 capitalize">
                    {fnt.style}
                  </div>
                </motion.button>
              )
            })}
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

          {/* Letter Preview */}
          <div
            className="p-8 sm:p-12 bg-white"
            style={{
              fontFamily: font.family,
              maxHeight: '800px',
              overflowY: 'auto'
            }}
          >
            <div className={borderStyles[template.borderStyle]}>
              {/* Header */}
              <div
                className={`mb-8 ${template.headerAlign === 'center' ? 'text-center' : 'text-left'}`}
              >
                <div className={`${template.spacing === 'compact' ? 'space-y-0.5' : template.spacing === 'loose' ? 'space-y-2' : 'space-y-1'} text-sm text-slate-700`}>
                  <p className="font-semibold text-slate-900">{exempelBrev.namn}</p>
                  <p>{exempelBrev.adress}</p>
                  <p>{exempelBrev.telefon}</p>
                  <p>{exempelBrev.epost}</p>
                </div>
              </div>

              {/* Recipient */}
              <div className={`mb-8 ${template.spacing === 'compact' ? 'space-y-0.5' : template.spacing === 'loose' ? 'space-y-2' : 'space-y-1'} text-sm text-slate-700`}>
                <p className="font-semibold text-slate-900">{exempelBrev.arbetsgivare}</p>
                <p className="font-medium text-slate-800">{exempelBrev.roll}</p>
              </div>

              {/* Date */}
              <div className="mb-8 text-sm text-slate-700">
                <p>{exempelBrev.datum}</p>
              </div>

              {/* Body */}
              <div className={spacingClasses[template.spacing]}>
                {exempelBrev.brevText.split('\n\n').map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`text-slate-700 leading-relaxed ${
                      template.spacing === 'compact' ? 'text-sm' : 'text-base'
                    }`}
                    style={{ textAlign: template.bodyAlign }}
                  >
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <p className="font-semibold">Gillar du vad du ser?</p>
              <p className="text-sm text-blue-100">Skapa ditt eget personliga brev på 60 sekunder</p>
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
            När du skapar ditt personliga brev får du tillgång till alla mallar, anpassningsbara färger, och export till både PDF och Word. Helt kostnadsfritt att prova!
          </p>
        </div>
      </div>
    </div>
  )
}
