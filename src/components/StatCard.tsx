'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  value: string
  label: string
  icon: LucideIcon
  delay?: number
}

/**
 * Ultra-stabil statistikkort med robust animation handling
 * - Använder React.memo för att förhindra onödiga re-renders
 * - Framer Motion med viewport={{ once: true }} för en-gångs animation
 * - Isolerad CSS layout för att undvika påverkan från föräldrakomponent
 * - Optimerade hover-effekter med transform för GPU-acceleration
 */
const StatCard = React.memo<StatCardProps>(({ value, label, icon: Icon, delay = 0 }) => (
  <motion.div
    className="relative bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 isolate pointer-events-auto group"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{
      delay,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] // Smooth easeOutCubic for professional feel
    }}
    style={{
      zIndex: 10,
      position: 'relative',
      isolation: 'isolate',
      willChange: 'transform', // Optimize for animations
    }}
    whileHover={{
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        mass: 0.8
      }
    }}
  >
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-3xl font-bold text-slate-900">
          {value}
        </div>
        <p className="text-sm text-slate-600 mt-1">{label}</p>
      </div>
    </div>
  </motion.div>
))

StatCard.displayName = 'StatCard'

export default StatCard