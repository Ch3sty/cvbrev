'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  Users,
  FileText,
  TrendingUp,
  Award,
  Star,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Heart,
  Trophy,
  Sparkles
} from 'lucide-react'

interface StatItem {
  id: string
  label: string
  value: number
  suffix?: string
  prefix?: string
  icon: React.ElementType
  color: string
  description: string
  gradient: string
}

const statsData: StatItem[] = [
  {
    id: 'users',
    label: 'Nöjda användare',
    value: 15420,
    suffix: '+',
    icon: Users,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Svenskar som fått sitt drömjobb'
  },
  {
    id: 'letters',
    label: 'Personliga brev skapade',
    value: 47380,
    suffix: '+',
    icon: FileText,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    description: 'AI-genererade brev som imponerat'
  },
  {
    id: 'success',
    label: 'Framgångsgrad',
    value: 87,
    suffix: '%',
    icon: TrendingUp,
    color: 'text-green-600',
    gradient: 'from-green-500 to-teal-500',
    description: 'Får svar på sina ansökningar'
  },
  {
    id: 'rating',
    label: 'Användarrating',
    value: 4.8,
    suffix: '/5',
    icon: Star,
    color: 'text-yellow-600',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Baserat på 3,200+ recensioner'
  }
]

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

function CountUp({ end, duration = 2.5, suffix = '', prefix = '' }: CountUpProps) {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView && !isAnimating) {
      setIsAnimating(true)
      let startTime: number
      let animationFrameId: number

      const animate = (currentTime: number) => {
        if (startTime === undefined) {
          startTime = currentTime
        }

        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)

        const current = Math.floor(easeOutQuart * end)
        setCount(current)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }

      animationFrameId = requestAnimationFrame(animate)

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }
  }, [isInView, end, duration, isAnimating])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k'
    }
    return num.toLocaleString('sv-SE')
  }

  return (
    <span ref={ref} className="font-bold">
      {prefix}
      {end >= 1000 && count < 1000 ? count.toLocaleString('sv-SE') :
       end >= 1000 ? formatNumber(count) : count.toLocaleString('sv-SE')}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const iconVariants = {
    hover: {
      rotate: 360,
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  }

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            Våra resultat
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Siffror som talar för sig själva
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tusentals svenskar har redan förvandlat sina karriärer med hjälp av Jobbcoach.ai.
            Se varför vi är Sveriges mest betrodda AI-karriärcoach.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              whileHover={{
                y: -5,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-pink-200"
            >
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative">
                {/* Icon with Gradient Background */}
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Stat Number */}
                <div className="mb-4">
                  <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>+12% senaste månaden</span>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Betrodd av 15,000+ användare</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>4.8/5 i betyg</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Aktiv sedan 2020</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>99% kundnöjdhet</span>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Bli en del av framgångssagan. Testa Jobbcoach.ai idag och se varför tusentals svenskar litar på oss för sina karriärer.
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -12px rgba(236, 72, 153, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Testa gratis nu
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}