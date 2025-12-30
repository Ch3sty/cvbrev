'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, CheckCircle, Sparkles,
  Palette, Clock, ArrowRight, User, Mail, Phone, Briefcase
} from 'lucide-react'

interface CreatorStep {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  content: React.ReactNode
}

const steps: CreatorStep[] = [
  {
    id: 'mall',
    title: 'Välj din mall',
    subtitle: 'Bläddra bland 8 professionella mallar',
    icon: Palette,
    color: 'from-blue-600 to-indigo-600',
    content: null // Will be rendered inline
  },
  {
    id: 'info',
    title: 'Fyll i dina uppgifter',
    subtitle: 'Svara på enkla frågor',
    icon: FileText,
    color: 'from-purple-600 to-pink-600',
    content: null
  },
  {
    id: 'ai',
    title: 'AI formulerar professionellt',
    subtitle: 'Dina svar blir CV-text',
    icon: Sparkles,
    color: 'from-orange-600 to-red-600',
    content: null
  },
  {
    id: 'download',
    title: 'Ladda ner som PDF',
    subtitle: 'Färdigt CV på 10 minuter',
    icon: Download,
    color: 'from-emerald-600 to-teal-600',
    content: null
  }
]

const mallPreviews = [
  { name: 'Modern Minimal', tier: 'Gratis', color: 'from-slate-100 to-slate-200' },
  { name: 'Klassisk', tier: 'Gratis', color: 'from-blue-100 to-blue-200' },
  { name: 'Nordic Pro', tier: 'Premium', color: 'from-emerald-100 to-emerald-200' },
  { name: 'Kreativ', tier: 'Premium', color: 'from-purple-100 to-purple-200' }
]

const formFields = [
  { icon: User, label: 'Namn', value: 'Anna Lindberg', delay: 0 },
  { icon: Mail, label: 'E-post', value: 'anna.lindberg@email.se', delay: 0.1 },
  { icon: Phone, label: 'Telefon', value: '070-123 45 67', delay: 0.2 },
  { icon: Briefcase, label: 'Senaste jobb', value: 'Kundtjänst på café', delay: 0.3 }
]

const aiTransformation = {
  before: 'Jobbade med att ta emot kunder och hantera kassan',
  after: 'Hanterade daglig kundbemötande för 200+ kunder, ansvarade för kassahantering med noll avvikelser, och bidrog till 15% ökad kundnöjdhet genom proaktiv service.'
}

export default function CVCreatorDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedMall, setSelectedMall] = useState(0)
  const [typedText, setTypedText] = useState('')

  // Rotation logic: change step every 8 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
      setProgress(0)
      setActiveStep(0)
      setShowResult(false)
      setTypedText('')
    }, 8000)

    return () => clearInterval(rotationInterval)
  }, [])

  // Progress bar animation
  useEffect(() => {
    setProgress(0)
    setActiveStep(0)
    setShowResult(false)
    setTypedText('')

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1.25
      })
    }, 100)

    // Step animations
    const step1Timer = setTimeout(() => setActiveStep(1), 1000)
    const step2Timer = setTimeout(() => setActiveStep(2), 2500)
    const step3Timer = setTimeout(() => setActiveStep(3), 4000)
    const step4Timer = setTimeout(() => setActiveStep(4), 5500)
    const resultTimer = setTimeout(() => setShowResult(true), 6000)

    // Typing animation for AI step
    if (currentStep === 2) {
      let charIndex = 0
      const typeInterval = setInterval(() => {
        if (charIndex < aiTransformation.after.length) {
          setTypedText(aiTransformation.after.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
        }
      }, 30)
      return () => {
        clearInterval(progressInterval)
        clearInterval(typeInterval)
        clearTimeout(step1Timer)
        clearTimeout(step2Timer)
        clearTimeout(step3Timer)
        clearTimeout(step4Timer)
        clearTimeout(resultTimer)
      }
    }

    return () => {
      clearInterval(progressInterval)
      clearTimeout(step1Timer)
      clearTimeout(step2Timer)
      clearTimeout(step3Timer)
      clearTimeout(step4Timer)
      clearTimeout(resultTimer)
    }
  }, [currentStep])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Mall selection
        return (
          <div className="grid grid-cols-2 gap-3">
            {mallPreviews.map((mall, idx) => (
              <motion.div
                key={mall.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedMall === idx
                    ? 'border-emerald-500 shadow-lg bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
                onClick={() => setSelectedMall(idx)}
              >
                <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${mall.color} mb-2`} />
                <p className="text-sm font-medium text-slate-900">{mall.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  mall.tier === 'Gratis'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {mall.tier}
                </span>
                {selectedMall === idx && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )

      case 1: // Form filling
        return (
          <div className="space-y-3">
            {formFields.map((field, idx) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: field.delay + 0.5, duration: 0.3 }}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <field.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{field.label}</p>
                  <motion.p
                    className="text-sm font-medium text-slate-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: field.delay + 0.8, duration: 0.3 }}
                  >
                    {field.value}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        )

      case 2: // AI transformation
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Ditt svar:</p>
              <p className="text-sm text-slate-700 italic">&quot;{aiTransformation.before}&quot;</p>
            </div>
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-orange-500" />
              </motion.div>
              <span className="mx-2 text-sm text-slate-500">AI omvandlar...</span>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
              <p className="text-xs text-emerald-600 mb-1 font-medium">CV-text:</p>
              <p className="text-sm text-slate-800 leading-relaxed">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5"
                />
              </p>
            </div>
          </div>
        )

      case 3: // Download
        return (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-40 mx-auto bg-white rounded-xl shadow-2xl border-2 border-slate-200 relative overflow-hidden"
            >
              {/* Mini CV preview */}
              <div className="p-3 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-400" />
                <div className="h-2 bg-slate-200 rounded w-3/4 mx-auto" />
                <div className="h-1.5 bg-slate-100 rounded w-full" />
                <div className="h-1.5 bg-slate-100 rounded w-5/6" />
                <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                <div className="h-1.5 bg-slate-100 rounded w-full" />
              </div>
              {/* PDF badge */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded">
                PDF
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-2"
            >
              <p className="text-lg font-bold text-slate-900">Ditt CV är klart!</p>
              <p className="text-sm text-slate-600">Anna_Lindberg_CV.pdf</p>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Redo att laddas ner</span>
              </div>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Demo card */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-white/80 text-sm font-medium">
              Steg {currentStep + 1} av 4
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step title */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center shadow-lg`}>
                  {(() => {
                    const IconComponent = steps[currentStep].icon
                    return <IconComponent className="w-6 h-6 text-white" />
                  })()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{steps[currentStep].title}</h4>
                  <p className="text-sm text-slate-500">{steps[currentStep].subtitle}</p>
                </div>
              </div>

              {/* Dynamic content */}
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => {
              setCurrentStep(idx)
              setProgress(0)
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep
                ? 'w-8 bg-gradient-to-r from-emerald-600 to-teal-600'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Visa steg ${idx + 1}`}
          />
        ))}
      </div>

      {/* Process steps summary */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            className={`p-3 rounded-xl text-center transition-all duration-300 ${
              idx <= currentStep
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-slate-50 border border-slate-100 opacity-50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${
              idx <= currentStep
                ? `bg-gradient-to-br ${step.color}`
                : 'bg-slate-200'
            }`}>
              <step.icon className={`w-4 h-4 ${idx <= currentStep ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <p className={`text-xs font-medium ${idx <= currentStep ? 'text-slate-700' : 'text-slate-400'}`}>
              {step.title.split(' ')[0]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Time estimate */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Clock className="w-4 h-4" />
        <span>Total tid: ca 10 minuter</span>
      </div>
    </div>
  )
}
