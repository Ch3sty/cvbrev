'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, BrainCircuit, FileText, CheckCircle,
  FileCheck, Sparkles, ArrowRight, Download,
  Zap, Code, Database, Eye
} from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'Ladda upp ditt CV',
    description: 'Dra och släpp eller klicka för att ladda upp. Vi läser alla format.',
    icon: Upload,
    color: 'from-blue-500 to-indigo-600',
    demoContent: {
      files: [
        { name: 'mitt-cv.pdf', size: '245 KB', status: 'uploaded' },
        { name: 'Parsing innehåll...', size: '', status: 'processing' },
        { name: 'Text extraherad', size: '✓', status: 'complete' }
      ],
      stats: { format: 'PDF', pages: '2', words: '450' }
    }
  },
  {
    id: 2,
    title: 'AI analyserar jobbet',
    description: 'Vår AI matchar dina kompetenser mot jobbkraven på sekunder.',
    icon: BrainCircuit,
    color: 'from-purple-500 to-pink-600',
    demoContent: {
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Agile'],
      matching: [
        { skill: 'React', match: 95 },
        { skill: 'TypeScript', match: 88 },
        { skill: 'AWS', match: 76 }
      ],
      processing: ['Skannar jobbannons', 'Matchar kompetenser', 'Optimerar innehåll']
    }
  },
  {
    id: 3,
    title: 'Få perfekt ansökan',
    description: 'Ladda ner anpassat CV och personligt brev redo att skickas.',
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
    demoContent: {
      documents: [
        { type: 'CV', status: 'ready', score: 92 },
        { type: 'Personligt brev', status: 'ready', score: 89 }
      ],
      improvements: ['ATS-optimerad', 'Nyckelord inkluderade', 'Branschanpassad ton']
    }
  }
]

export default function InteractiveSteps() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [activeDemo, setActiveDemo] = useState<number | null>(null)

  return (
    <div className="relative">
      {/* Animated connection line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 hidden lg:block">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            onMouseEnter={() => setHoveredStep(step.id)}
            onMouseLeave={() => setHoveredStep(null)}
            onClick={() => setActiveDemo(activeDemo === step.id ? null : step.id)}
            className="relative cursor-pointer"
          >
            {/* Card container with morphing effect */}
            <motion.div
              className="relative h-full"
              whileHover={{ scale: 1.05, rotateY: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Gradient glow effect */}
              <motion.div
                className={`absolute -inset-1 bg-gradient-to-r ${step.color} rounded-2xl blur-lg`}
                animate={{
                  opacity: hoveredStep === step.id ? 0.5 : 0.2,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Main card */}
              <div className="relative h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Default state */}
                <AnimatePresence mode="wait">
                  {hoveredStep !== step.id ? (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >
                      {/* Step number badge */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600">{step.id}</span>
                      </div>

                      {/* Icon container */}
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                      <p className="text-slate-600">{step.description}</p>

                      {/* Progress indicator */}
                      <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${step.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(step.id / 3) * 100}%` }}
                            transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{step.id}/3</span>
                      </div>
                    </motion.div>
                  ) : (
                    /* Hover state - Mini demo */
                    <motion.div
                      key="hover"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      {/* Animated header */}
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className={`w-10 h-10 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <step.icon className="w-5 h-5 text-white" />
                        </motion.div>
                        <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Live Demo
                        </span>
                      </div>

                      {/* Demo content based on step */}
                      {step.id === 1 && (
                        <div className="space-y-3">
                          {step.demoContent.files.map((file, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-slate-700">{file.name}</span>
                              </div>
                              {file.status === 'complete' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {file.status === 'processing' && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Code className="w-4 h-4 text-purple-500" />
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                          <div className="pt-3 border-t border-slate-200">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Format: {step.demoContent.stats.format}</span>
                              <span>{step.demoContent.stats.words} ord</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 2 && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {step.demoContent.skills.map((skill, i) => (
                              <motion.span
                                key={skill}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                          {step.demoContent.matching.map((match, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-slate-700">{match.skill}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${match.match}%` }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-purple-600">{match.match}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.id === 3 && (
                        <div className="space-y-3">
                          {step.demoContent.documents.map((doc, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-slate-700">{doc.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-green-600">Score: {doc.score}</span>
                                <Download className="w-4 h-4 text-green-600" />
                              </div>
                            </motion.div>
                          ))}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                            {step.demoContent.improvements.map((imp, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-xs text-green-700 flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {imp}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}

                      <motion.button
                        className="mt-4 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mx-auto"
                        whileHover={{ x: 5 }}
                      >
                        Klicka för mer info
                        <ArrowRight className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Animated particles in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
            animate={{
              x: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
              y: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}