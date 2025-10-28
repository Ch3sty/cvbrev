'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  FileText, Download, Eye, CheckCircle, Sparkles,
  Upload, Clock, ArrowRight
} from 'lucide-react'

interface TemplateScenario {
  id: string
  name: string
  category: 'Modern' | 'Traditionell' | 'Kreativ'
  tier: 'Gratis' | 'Premium'
  imagePath: string
  description: string
  features: string[]
  usedBy: string
  downloadTime: string
}

const scenarios: TemplateScenario[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'Modern',
    tier: 'Gratis',
    imagePath: '/mallar/modern-minimal.svg',
    description: 'Minimalistisk design perfekt för tech och konsult',
    features: ['ATS-optimerad', 'PDF + Word', 'Alla branscher'],
    usedBy: '3 200+ nedladdningar',
    downloadTime: '60 sekunder'
  },
  {
    id: 'klassisk-professionell',
    name: 'Klassisk Professionell',
    category: 'Traditionell',
    tier: 'Gratis',
    imagePath: '/mallar/classic-professional.svg',
    description: 'Traditionell layout som fungerar överallt',
    features: ['Seriös stil', 'PDF + Word', 'Konservativ'],
    usedBy: '5 100+ nedladdningar',
    downloadTime: '60 sekunder'
  },
  {
    id: 'nordic-professional',
    name: 'Nordic Professional',
    category: 'Modern',
    tier: 'Premium',
    imagePath: '/mallar/nordic-professional.svg',
    description: 'Skandinavisk elegans med foto och LinkedIn',
    features: ['Foto-support', 'LinkedIn', 'Premium design'],
    usedBy: '2 400+ nedladdningar',
    downloadTime: '60 sekunder'
  },
  {
    id: 'creative-edge',
    name: 'Kreativ Profil',
    category: 'Kreativ',
    tier: 'Premium',
    imagePath: '/mallar/creative-edge.svg',
    description: 'För kreativa yrken med unik design-touch',
    features: ['Visuellt stark', 'PDF + Word', 'Kreativ bransch'],
    usedBy: '1 800+ nedladdningar',
    downloadTime: '60 sekunder'
  }
]

const processSteps = [
  {
    icon: Upload,
    title: 'Välj mall',
    subtitle: 'Bläddra bland 8 mallar',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: FileText,
    title: 'Ladda upp CV',
    subtitle: 'Vi läser din information',
    color: 'from-purple-600 to-pink-600'
  },
  {
    icon: Eye,
    title: 'Förhandsgranska',
    subtitle: 'Kontrollera resultatet',
    color: 'from-orange-600 to-red-600'
  },
  {
    icon: Download,
    title: 'Ladda ner',
    subtitle: 'PDF & Word-format',
    color: 'from-green-600 to-emerald-600'
  }
]

export default function CVTemplateDemo() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [showFeatures, setShowFeatures] = useState(false)

  const scenario = scenarios[currentScenario]

  // Rotation logic: change scenario every 8 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
      setProgress(0)
      setActiveStep(0)
      setShowFeatures(false)
    }, 8000)

    return () => clearInterval(rotationInterval)
  }, [])

  // Progress bar animation
  useEffect(() => {
    setProgress(0)
    setActiveStep(0)
    setShowFeatures(false)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1.25 // Reaches 100% in 8 seconds
      })
    }, 100)

    // Step animations
    const step1Timer = setTimeout(() => setActiveStep(1), 1000)
    const step2Timer = setTimeout(() => setActiveStep(2), 2500)
    const step3Timer = setTimeout(() => setActiveStep(3), 4000)
    const step4Timer = setTimeout(() => setActiveStep(4), 5500)
    const featuresTimer = setTimeout(() => setShowFeatures(true), 6000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(step1Timer)
      clearTimeout(step2Timer)
      clearTimeout(step3Timer)
      clearTimeout(step4Timer)
      clearTimeout(featuresTimer)
    }
  }, [currentScenario])

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Left: Template Preview */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Template card with shadow */}
            <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
              {/* Tier badge */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    scenario.tier === 'Gratis'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {scenario.tier}
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                  {scenario.category}
                </span>
              </div>

              {/* Template image */}
              <div className="aspect-[3/4] relative bg-slate-50 p-6">
                <motion.div
                  className="w-full h-full relative"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Image
                    src={scenario.imagePath}
                    alt={`${scenario.name} CV-mall`}
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              </div>

              {/* Template info footer */}
              <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Klar på {scenario.downloadTime}</span>
                  <span className="mx-2">•</span>
                  <span>{scenario.usedBy}</span>
                </div>
              </div>
            </div>

            {/* Floating sparkle effect */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-2xl opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Scenario indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {scenarios.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentScenario(idx)
                setProgress(0)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentScenario
                  ? 'w-8 bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Visa mall ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Right: Process Steps & Info */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Så snabbt skapar du ditt CV
            </h3>
            <span className="text-sm font-medium text-slate-600">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Process steps */}
        <div className="space-y-4">
          {processSteps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                activeStep >= idx + 1
                  ? 'bg-white shadow-lg border-2 border-slate-200'
                  : 'bg-slate-50 border border-slate-100 opacity-50'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              {/* Step icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activeStep >= idx + 1
                    ? `bg-gradient-to-br ${step.color} shadow-lg`
                    : 'bg-slate-200'
                }`}
              >
                <step.icon
                  className={`w-6 h-6 ${
                    activeStep >= idx + 1 ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h4
                  className={`font-semibold mb-1 ${
                    activeStep >= idx + 1 ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-sm ${
                    activeStep >= idx + 1 ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>

              {/* Check icon for completed steps */}
              {activeStep > idx + 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Features reveal */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-slate-900">
                  {scenario.name} inkluderar:
                </h4>
              </div>

              <div className="space-y-2">
                {scenario.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4 pt-4 border-t border-green-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Ladda ner {scenario.tier === 'Gratis' ? 'gratis' : 'med Premium'}
                  </span>
                  <ArrowRight className="w-5 h-5 text-green-600" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
