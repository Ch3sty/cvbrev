'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <motion.div
      className="group relative h-full overflow-visible"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Main card - always present */}
      <motion.div
        className="relative h-full bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg flex flex-col"
        whileHover={{
          y: -8,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative p-6 flex-1 flex flex-col">
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

          {/* Content - always visible */}
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
            {feature.title}
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed">
            {feature.description}
          </p>

          {/* Demo points - shown on hover with smooth transition */}
          {feature.demoPoints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isHovered ? 'auto' : 0,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-4"
            >
              <div className="space-y-2 pb-2">
                {feature.demoPoints.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      x: isHovered ? 0 : -20
                    }}
                    transition={{ delay: isHovered ? idx * 0.05 : 0, duration: 0.2 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Spacer to push stats to bottom */}
          <div className="flex-1"></div>

          {/* Stats bar - always visible */}
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

          {/* Hover CTA button */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isHovered ? 'auto' : 0,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.button
              className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInteract?.(feature.id)}
            >
              Testa nu
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Corner sparkle on hover */}
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      </motion.div>
    </motion.div>
  )
}