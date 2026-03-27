'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ArrowRight, X,
  CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react'

interface Example {
  before: string
  after: string
  improvements: string[]
  atsScoreBefore: number
  atsScoreAfter: number
}

interface BeforeAfterSliderProps {
  examples?: Example[]
}

const defaultExamples: Example[] = [
  {
    before: "Jag är intresserad av denna tjänst eftersom jag har erfarenhet av programmering och tycker att ert företag verkar bra. Jag har arbetat med olika projekt och känner att jag skulle passa bra hos er.",
    after: "Som passionerad Frontend-utvecklare med 3+ års erfarenhet av React och TypeScript blev jag mycket intresserad av er roll hos Spotify. Mitt arbete med att optimera laddningstider med 40% och implementera tillgängliga komponentsystem matchar perfekt era krav på skalbar webbutveckling.",
    improvements: [
      "15 branschspecifika nyckelord tillagda",
      "Konkreta mätbara resultat inkluderade",
      "Personlig ton anpassad till företagskultur",
      "ATS-optimerad struktur"
    ],
    atsScoreBefore: 32,
    atsScoreAfter: 89
  },
  {
    before: "Hej, jag såg er annons och vill söka jobbet. Jag har utbildning inom ekonomi och har jobbat på kontor tidigare. Hoppas vi kan träffas för intervju.",
    after: "Med min kandidatexamen i företagsekonomi och 5 års erfarenhet som ekonomiassistent på SEB, där jag automatiserade månadsrapporteringen och minskade fel med 60%, ser jag fram emot att bidra till er finansavdelnings digitala transformation.",
    improvements: [
      "Specifik utbildning och erfarenhet framhävd",
      "Kvantifierbara prestationer tillagda",
      "Koppling till företagets behov",
      "Professionell och engagerande ton"
    ],
    atsScoreBefore: 28,
    atsScoreAfter: 92
  }
]

export default function BeforeAfterSlider({ examples = defaultExamples }: BeforeAfterSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBefore, setShowBefore] = useState(true)

  const currentExample = examples[currentIndex]

  const nextExample = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length)
    setShowBefore(true)
  }

  const prevExample = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length)
    setShowBefore(true)
  }

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Samma CV. Helt annat resultat.</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevExample}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm text-slate-600 px-3">
              {currentIndex + 1} / {examples.length}
            </span>
            <button
              onClick={nextExample}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setShowBefore(true)}
          className={`flex-1 px-6 py-4 font-medium transition-all ${
            showBefore
              ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Före</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {currentExample.atsScoreBefore}%
            </span>
          </div>
        </button>
        <button
          onClick={() => setShowBefore(false)}
          className={`flex-1 px-6 py-4 font-medium transition-all ${
            !showBefore
              ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Efter</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {currentExample.atsScoreAfter}%
            </span>
          </div>
        </button>
      </div>

      {/* Content area with animation */}
      <div className="relative h-64 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {showBefore ? (
            <motion.div
              key="before"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-6"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <p className="text-slate-700 leading-relaxed">
                    {currentExample.before}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Generisk och ospecifik</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="after"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-6"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <p className="text-slate-700 leading-relaxed">
                    {currentExample.after}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Anpassad och kraftfull</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Improvements section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-t border-slate-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2">Förbättringar</h4>
            <div className="grid grid-cols-2 gap-2">
              {currentExample.improvements.map((improvement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-xs text-green-800">{improvement}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ATS Score improvement */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">ATS-poäng ökning:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${currentExample.atsScoreBefore}%` }}
                  />
                </div>
                <span className="text-xs text-red-600 font-bold">{currentExample.atsScoreBefore}%</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentExample.atsScoreAfter}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-xs text-green-600 font-bold">{currentExample.atsScoreAfter}%</span>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full"
              >
                +{currentExample.atsScoreAfter - currentExample.atsScoreBefore}%
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}