'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

interface Feature {
  id: string
  icon: React.ElementType
  title: string
  description: string
  badge: string
  badgeColor: string
  stats: string
  demoPoints?: string[]
  gradient: string
}

interface FeatureMorphingCardProps {
  feature: Feature
  delay?: number
  onInteract?: (featureId: string) => void
}

export default function FeatureMorphingCard({ feature, delay = 0, onInteract }: FeatureMorphingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false)
        setShowDemo(false)
      }}
    >
      {/* Gradient glow effect */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg`}
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card */}
      <motion.div
        className="relative h-full bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-lg"
        layout
        whileHover={{
          y: -8,
          rotateX: 5,
          rotateY: -5,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            // Default state
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <feature.icon className="w-7 h-7 text-slate-700" />
                </motion.div>
                <motion.span
                  className={`px-3 py-1 bg-gradient-to-r ${feature.badgeColor} text-white text-xs font-bold rounded-full shadow-sm`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.badge}
                </motion.span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Stats bar */}
              <div className="pt-4 border-t border-slate-100">
                <motion.p
                  className="text-sm font-medium text-slate-500 flex items-center gap-2"
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true }}
                  transition={{ delay: delay + 0.5, duration: 0.5 }}
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  {feature.stats}
                </motion.p>
              </div>
            </motion.div>
          ) : (
            // Hover state with demo
            <motion.div
              key="hover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Demo header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold text-slate-900">Live Demo</span>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>

              {/* Demo content */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">{feature.title}</h4>

                {feature.demoPoints && (
                  <div className="space-y-2">
                    {feature.demoPoints.map((point, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Interactive CTA */}
                <motion.button
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDemo(true)
                    onInteract?.(feature.id)
                  }}
                >
                  Testa nu
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute top-2 right-2"
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
                <Sparkles className="w-4 h-4 text-yellow-400 opacity-60" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Corner sparkle on hover */}
      <motion.div
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      >
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      </motion.div>
    </motion.div>
  )
}