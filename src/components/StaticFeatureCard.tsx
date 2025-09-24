'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

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

interface StaticFeatureCardProps {
  feature: Feature
  delay?: number
}

export default function StaticFeatureCard({ feature, delay = 0 }: StaticFeatureCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
    >
      {/* Simple card with consistent styling */}
      <div className="group relative h-full bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">

        {/* Subtle hover glow - only visible on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 rounded-xl blur-sm transition-all duration-300 -z-10" />

        <div className="relative p-6 h-full flex flex-col">
          {/* Header - Always visible */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center shadow-sm">
              <feature.icon className="w-7 h-7 text-slate-700" />
            </div>
            <span className={`px-3 py-1 bg-gradient-to-r ${feature.badgeColor} text-white text-xs font-bold rounded-full shadow-sm`}>
              {feature.badge}
            </span>
          </div>

          {/* Main content - Always visible */}
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
            {feature.title}
          </h3>

          <p className="text-slate-600 mb-4 leading-relaxed">
            {feature.description}
          </p>

          {/* Demo points - Always visible if they exist */}
          {feature.demoPoints && (
            <div className="mb-4">
              <div className="space-y-2">
                {feature.demoPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacer to push stats to bottom */}
          <div className="flex-1"></div>

          {/* Stats - Always visible */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {feature.stats}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}