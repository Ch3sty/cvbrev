'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Shield, Clock, CheckCircle,
  Star, TrendingUp, Zap, Sparkles
} from 'lucide-react'

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
}

function AnimatedCounter({ from, to, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(from + (to - from) * progress))

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [from, to, duration])

  return <span>{count.toLocaleString('sv-SE')}</span>
}

export default function EnhancedFinalCTA() {
  const [isInView, setIsInView] = useState(false)

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
      {/* Sophisticated gradient background - matching the site's light theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-slate-50/30" />

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="elegantGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="rgb(59 130 246)" opacity="0.4"/>
              <rect x="8" y="8" width="4" height="4" fill="none" stroke="rgb(99 102 241)" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#elegantGrid)"/>
        </svg>
      </div>

      {/* Animated background orbs - lighter and more subtle */}
      <motion.div
        className="absolute top-20 left-1/4 w-48 h-48 bg-blue-100/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-1/3 w-40 h-40 bg-indigo-100/10 rounded-full blur-2xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.8, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-100/8 rounded-full blur-2xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 10, 0],
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.12, 0.08]
        }}
        transition={{ duration: 7, repeat: Infinity, delay: 1, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left: Main message */}
            <div className="lg:col-span-3 text-center lg:text-left">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-[1.1]"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onViewportEnter={() => setIsInView(true)}
              >
                Starta din{' '}
                <motion.span
                  className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  framgångsresa
                </motion.span>{' '}
                idag
              </motion.h2>

              {/* Social proof with animation */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${
                        i === 0 ? 'from-blue-400 to-blue-500' :
                        i === 1 ? 'from-indigo-400 to-indigo-500' :
                        i === 2 ? 'from-purple-400 to-purple-500' :
                        i === 3 ? 'from-pink-400 to-pink-500' :
                        'from-violet-400 to-violet-500'
                      }`} />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: 'auto', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="overflow-hidden"
                >
                  <p className="text-lg font-medium text-slate-700 whitespace-nowrap">
                    Gå med{' '}
                    {isInView && (
                      <span className="font-bold text-slate-900">
                        <AnimatedCounter from={1800} to={2000} duration={2000} />+
                      </span>
                    )}{' '}
                    svenskar som redan landat drömjobbet
                  </p>
                </motion.div>
              </motion.div>

              {/* Trust metrics - desktop only */}
              <motion.div
                className="hidden lg:grid grid-cols-3 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {[
                  {
                    metric: "89%",
                    label: "Får intervju",
                    subtext: "inom 2 veckor",
                    icon: TrendingUp,
                    color: "text-green-600",
                    bgColor: "from-green-50 to-emerald-50"
                  },
                  {
                    metric: "60s",
                    label: "Skapandetid",
                    subtext: "per dokument",
                    icon: Zap,
                    color: "text-blue-600",
                    bgColor: "from-blue-50 to-indigo-50"
                  },
                  {
                    metric: "4.9",
                    label: "Betyg",
                    subtext: "200+ recensioner",
                    icon: Star,
                    color: "text-yellow-600",
                    bgColor: "from-yellow-50 to-orange-50"
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className={`p-4 bg-gradient-to-br ${stat.bgColor} rounded-xl border border-white/60 backdrop-blur-sm`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + idx * 0.1, duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.metric}</div>
                        <div className="text-sm font-medium text-slate-800">{stat.label}</div>
                        <div className="text-xs text-slate-500">{stat.subtext}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: CTA and trust */}
            <div className="lg:col-span-2">
              {/* Primary CTA */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
              >
                <motion.button
                  onClick={() => window.location.href = '/register'}
                  className="group relative w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/25 overflow-hidden"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full"
                    animate={{ x: [-400, 400] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />

                  {/* Sparkle effects on hover */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100"
                        style={{
                          left: `${25 + i * 25}%`,
                          top: `${30 + i * 15}%`,
                        }}
                        animate={{
                          scale: [0, 1.5, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          repeatDelay: 1,
                        }}
                      />
                    ))}
                  </div>

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5 opacity-80" />
                    Kom igång gratis
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </motion.button>

                <motion.p
                  className="text-center text-sm text-slate-500 mt-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                >
                  Ingen registrering krävs • Klart på 2 minuter
                </motion.p>
              </motion.div>

              {/* Trust indicators with icons */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {[
                  { icon: Clock, text: "Setup på 2 minuter", color: "from-emerald-400 to-emerald-500" },
                  { icon: Shield, text: "GDPR-säker", color: "from-blue-400 to-blue-500" },
                  { icon: CheckCircle, text: "Ingen bindningstid", color: "from-indigo-400 to-indigo-500" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="group flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 hover:bg-white hover:border-slate-200 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <motion.div
                      className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.text}</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}