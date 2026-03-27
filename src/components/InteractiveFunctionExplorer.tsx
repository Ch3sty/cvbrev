'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, BrainCircuit, FileText, Download,
  CheckCircle, ArrowRight, Play, Sparkles
} from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ElementType
  color: string
  animation?: string
  demo?: React.ReactNode
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Ladda upp ditt CV',
    description: 'Dra och släpp eller välj din CV-fil. Vi stödjer PDF, Word och textformat.',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
    animation: 'slideInFromLeft'
  },
  {
    id: 2,
    title: 'Vi läser och analyserar innehållet',
    description: 'Vi skannar jobbannonsen och identifierar vad arbetsgivaren verkligen letar efter.',
    icon: BrainCircuit,
    color: 'from-purple-500 to-pink-500',
    animation: 'morphIn'
  },
  {
    id: 3,
    title: 'Generera dokument',
    description: 'Få ett perfekt anpassat personligt brev och optimerat CV på sekunder.',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    animation: 'slideInFromRight'
  },
  {
    id: 4,
    title: 'Ladda ner och skicka',
    description: 'Exportera som PDF eller kopiera direkt. Redo att skickas till arbetsgivaren.',
    icon: Download,
    color: 'from-orange-500 to-red-500',
    animation: 'fadeIn'
  }
]

export default function InteractiveFunctionExplorer() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const startExplorer = () => {
    setIsPlaying(true)
    setActiveStep(0)

    // Auto-advance through steps
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2500)

    return () => clearInterval(interval)
  }

  const goToStep = (stepId: number) => {
    setActiveStep(stepId)
    setIsPlaying(false)
  }

  return (
    <div className="relative">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Så fungerar det</h3>
        <motion.button
          onClick={startExplorer}
          disabled={isPlaying}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-4 h-4" />
          {isPlaying ? 'Spelar...' : 'Starta demo'}
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            animate={{
              width: `${((activeStep + 1) / steps.length) * 100}%`
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps navigation */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        {steps.map((step, idx) => (
          <motion.button
            key={step.id}
            onClick={() => goToStep(idx)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              activeStep === idx
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                : activeStep > idx
                ? 'border-green-300 bg-green-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Step number */}
            <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              activeStep === idx
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : activeStep > idx
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {activeStep > idx ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>

            {/* Icon */}
            <motion.div
              className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-3 mx-auto shadow-lg`}
              animate={activeStep === idx ? {
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <step.icon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Title */}
            <h4 className={`text-sm font-semibold ${
              activeStep === idx ? 'text-blue-900' : 'text-slate-700'
            }`}>
              {step.title}
            </h4>
          </motion.button>
        ))}
      </div>

      {/* Active step details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Step details */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${steps[activeStep].color} rounded-xl flex items-center justify-center shadow-lg`}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {React.createElement(steps[activeStep].icon, {
                    className: "w-8 h-8 text-white"
                  })}
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-slate-600">Steg {activeStep + 1} av {steps.length}</p>
                </div>
              </div>

              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                {steps[activeStep].description}
              </p>

              {/* Features for this step */}
              <div className="space-y-3">
                {activeStep === 0 && (
                  <>
                    <FeaturePoint text="Stödjer alla vanliga filformat" />
                    <FeaturePoint text="Automatisk textextraktion" />
                    <FeaturePoint text="Säker filhantering (GDPR)" />
                  </>
                )}
                {activeStep === 1 && (
                  <>
                    <FeaturePoint text="Identifierar nyckelkompetenser" />
                    <FeaturePoint text="Matchar mot jobbkrav" />
                    <FeaturePoint text="Analyserar ton och språk" />
                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <FeaturePoint text="Unika formuleringar varje gång" />
                    <FeaturePoint text="ATS-optimerat innehåll" />
                    <FeaturePoint text="Branschanpassat språk" />
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    <FeaturePoint text="Professionell PDF-export" />
                    <FeaturePoint text="Redigerbar Word-fil" />
                    <FeaturePoint text="Direkt kopiering till e-post" />
                  </>
                )}
              </div>
            </div>

            {/* Right: Visual demo */}
            <div className="relative">
              <motion.div
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-6 h-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                {/* Step-specific visualization */}
                {activeStep === 0 && <UploadVisualization />}
                {activeStep === 1 && <AnalysisVisualization />}
                {activeStep === 2 && <GenerationVisualization />}
                {activeStep === 3 && <DownloadVisualization />}
              </motion.div>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Föregående
            </button>

            {activeStep < steps.length - 1 ? (
              <motion.button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Nästa steg
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-4 h-4" />
                Klar!
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Helper components
function FeaturePoint({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      <span className="text-slate-700">{text}</span>
    </motion.div>
  )
}

// Visualization components
function UploadVisualization() {
  return (
    <div className="text-center">
      <motion.div
        className="w-32 h-40 bg-white border-2 border-dashed border-slate-300 rounded-lg mx-auto mb-4 flex items-center justify-center"
        animate={{
          borderColor: ['rgb(203 213 225)', 'rgb(59 130 246)', 'rgb(203 213 225)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Upload className="w-8 h-8 text-slate-400" />
      </motion.div>
      <p className="text-sm text-slate-600">Dra din fil hit</p>
    </div>
  )
}

function AnalysisVisualization() {
  return (
    <div className="space-y-4">
      {['Skannar innehåll...', 'Identifierar nyckelord...', 'Matchar kompetenser...'].map((text, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.3 }}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BrainCircuit className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm text-slate-700">{text}</span>
        </motion.div>
      ))}
    </div>
  )
}

function GenerationVisualization() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="h-2 bg-slate-100 rounded-full mb-2" />
        <div className="h-2 bg-slate-100 rounded-full w-3/4 mb-2" />
        <div className="h-2 bg-slate-100 rounded-full w-5/6" />
      </div>
      <motion.div
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Personligt brev klart!</span>
        </div>
      </motion.div>
    </div>
  )
}

function DownloadVisualization() {
  return (
    <div className="space-y-4">
      <motion.div
        className="w-24 h-32 bg-white border border-slate-300 rounded-lg mx-auto shadow-lg"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
      </motion.div>
      <motion.button
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg mx-auto flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download className="w-4 h-4" />
        Ladda ner PDF
      </motion.button>
    </div>
  )
}