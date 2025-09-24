'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import {
  Upload, FileText, CheckCircle, Sparkles,
  BrainCircuit, TrendingUp, Clock, Target
} from 'lucide-react'

export default function LiveAIDemo() {
  const [activeStep, setActiveStep] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Auto-advance steps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep < 2) {
        setActiveStep(activeStep + 1)
      } else {
        setShowResults(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [activeStep])

  const steps = [
    {
      icon: Upload,
      title: "CV Uppladdas",
      status: "processing",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BrainCircuit,
      title: "AI Analyserar",
      status: "analyzing",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Genererar Brev",
      status: "generating",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const improvements = [
    { label: "Nyckelord identifierade", value: "15", icon: Target },
    { label: "ATS-score ökning", value: "+340%", icon: TrendingUp },
    { label: "Tidsbesparning", value: "2h", icon: Clock }
  ]

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Se AI:n i aktion</h3>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-700">Live Demo</span>
        </motion.div>
      </div>

      {/* Process Steps */}
      <div className="space-y-6 mb-8">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
              activeStep >= idx
                ? 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
                : 'border-slate-100 bg-white opacity-50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: activeStep >= idx ? 1 : 0.5,
              x: 0,
              scale: activeStep === idx ? 1.02 : 1
            }}
            transition={{ delay: idx * 0.2 }}
          >
            {/* Icon */}
            <motion.div
              className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}
              animate={activeStep === idx ? {
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 2, repeat: activeStep === idx ? Infinity : 0 }}
            >
              <step.icon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{step.title}</h4>
              {activeStep === idx && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                />
              )}
            </div>

            {/* Status */}
            {activeStep > idx && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Output Preview */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-slate-900">AI-genererat personligt brev</h4>
            </div>

            {/* Typewriter effect for generated content */}
            <div className="text-slate-700 mb-6 leading-relaxed">
              <TypeAnimation
                sequence={[
                  'Hej! Jag blev mycket intresserad av er roll som Frontend Developer hos Spotify...',
                  1000,
                  'Hej! Jag blev mycket intresserad av er roll som Frontend Developer hos Spotify. Med min erfarenhet inom React, TypeScript och modern webbutveckling ser jag fram emot att bidra till ert team...',
                ]}
                wrapper="p"
                speed={70}
                repeat={0}
                className="text-sm"
              />
            </div>

            {/* Improvements metrics */}
            <div className="grid grid-cols-3 gap-4">
              {improvements.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-xl font-bold text-green-600">{item.value}</div>
                  <div className="text-xs text-slate-600">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
      {showResults && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => {
            setActiveStep(0)
            setShowResults(false)
          }}
          className="mt-6 w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Kör demo igen
        </motion.button>
      )}

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: 0,
            }}
            animate={{
              x: [null, Math.random() * 100 + '%'],
              y: [null, Math.random() * 100 + '%'],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  )
}