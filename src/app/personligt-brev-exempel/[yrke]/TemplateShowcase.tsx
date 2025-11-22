'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, CheckCircle, Crown, Palette, Layout, Grid3x3 } from 'lucide-react'
import Image from 'next/image'

const templates = [
  {
    id: 'classic',
    name: 'Klassisk',
    description: 'Traditionell svensk brevmall',
    tier: 'free',
    industries: ['Alla branscher', 'Traditionella företag', 'Offentlig sektor'],
    preview: '/template-previews/classic-letter.png',
    icon: Layout
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Modern layout med sidofält',
    tier: 'premium',
    industries: ['Tech', 'Startup', 'Kreativa branscher'],
    preview: '/template-previews/sidebar-letter.png',
    icon: Grid3x3
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ren och luftig design',
    tier: 'free',
    industries: ['Design', 'Konsult', 'Professional services'],
    preview: '/template-previews/minimal-letter.png',
    icon: Palette
  },
  {
    id: 'centered',
    name: 'Centrerad',
    description: 'Elegant centrerad layout',
    tier: 'premium',
    industries: ['Executive', 'Senior roller', 'Management'],
    preview: '/template-previews/centered-letter.png',
    icon: Layout
  },
  {
    id: 'compact',
    name: 'Kompakt',
    description: 'Kompakt för mycket innehåll',
    tier: 'premium',
    industries: ['Alla branscher', 'Erfarenhet yrken'],
    preview: '/template-previews/compact-letter.png',
    icon: Grid3x3
  },
  {
    id: 'twocolumn',
    name: 'Två kolumner',
    description: 'Professionell två-kolumn layout',
    tier: 'premium',
    industries: ['Kreativa yrken', 'Marketing', 'Business'],
    preview: '/template-previews/twocolumn-letter.png',
    icon: Grid3x3
  }
]

export default function TemplateShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState('classic')

  return (
    <div className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Välj från 6 professionella brevmallar
            </h2>
            <p className="text-lg text-slate-600">
              Alla mallar är ATS-optimerade och fungerar perfekt för både PDF och Word
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.id
              const isPremium = template.tier === 'premium'

              return (
                <motion.button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Premium Badge */}
                  {isPremium && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 left-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 mt-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                      : 'bg-gradient-to-br from-slate-100 to-slate-200'
                  }`}>
                    <template.icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                  </div>

                  {/* Content */}
                  <h3 className={`font-bold mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {template.description}
                  </p>

                  {/* Industries */}
                  <div className="flex flex-wrap gap-1">
                    {template.industries.slice(0, 2).map((industry, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Template Preview */}
          <AnimatePresence mode="wait">
            {selectedTemplate && (
              <motion.div
                key={selectedTemplate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {templates.find(t => t.id === selectedTemplate)?.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Förhandsvisning av mallen
                      </p>
                    </div>
                  </div>

                  {templates.find(t => t.id === selectedTemplate)?.tier === 'premium' && (
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Premium
                    </div>
                  )}
                </div>

                {/* Preview Image Placeholder */}
                <div className="aspect-[1/1.4] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                  <div className="text-center">
                    <Palette className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">
                      {templates.find(t => t.id === selectedTemplate)?.name} mall
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Förhandsvisning tillgänglig i verktyget
                    </p>
                  </div>
                </div>

                {/* Template Info */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Passar för
                    </h4>
                    <ul className="space-y-1">
                      {templates.find(t => t.id === selectedTemplate)?.industries.map((industry, idx) => (
                        <li key={idx} className="text-sm text-slate-600">• {industry}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Funktioner
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• ATS-optimerad struktur</li>
                      <li>• PDF & Word export</li>
                      <li>• Professionell typografi</li>
                      <li>• Anpassningsbara färger</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
