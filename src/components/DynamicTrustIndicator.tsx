'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { Users, TrendingUp, Sparkles, CheckCircle } from 'lucide-react'

interface LiveMetric {
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
  color: string
}

export default function DynamicTrustIndicator() {
  const [todayLetters, setTodayLetters] = useState(43)
  const [activeUsers, setActiveUsers] = useState(127)
  const [successRate, setSuccessRate] = useState(89)
  const [recentUser, setRecentUser] = useState<string | null>(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  const userNames = [
    'Anna L.', 'Marcus S.', 'Sofia A.', 'Erik J.', 'Maria K.',
    'Johan P.', 'Emma N.', 'Viktor H.', 'Lisa M.', 'Oscar B.'
  ]

  const cities = [
    'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Linköping',
    'Örebro', 'Västerås', 'Helsingborg', 'Jönköping', 'Norrköping'
  ]

  useEffect(() => {
    // Simulera ny användare var 8:e sekund
    const userInterval = setInterval(() => {
      const randomName = userNames[Math.floor(Math.random() * userNames.length)]
      const randomCity = cities[Math.floor(Math.random() * cities.length)]
      setRecentUser(`${randomName} från ${randomCity}`)
      setPulseAnimation(true)

      // Öka räknare
      setTodayLetters(prev => prev + 1)
      setActiveUsers(prev => Math.min(prev + Math.floor(Math.random() * 3), 150))

      // Ta bort notification efter 4 sekunder
      setTimeout(() => {
        setRecentUser(null)
        setPulseAnimation(false)
      }, 4000)
    }, 8000)

    // Uppdatera success rate ibland
    const successInterval = setInterval(() => {
      setSuccessRate(prev => {
        const change = (Math.random() - 0.5) * 2
        return Math.min(Math.max(prev + change, 85), 93)
      })
    }, 15000)

    return () => {
      clearInterval(userInterval)
      clearInterval(successInterval)
    }
  }, [cities, userNames])

  const metrics: LiveMetric[] = [
    {
      label: 'personliga brev idag',
      value: todayLetters,
      suffix: '',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'aktiva just nu',
      value: activeUsers,
      suffix: '',
      icon: <Users className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'får intervju',
      value: successRate,
      suffix: '%',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="relative">
      {/* Live notification popup */}
      <AnimatePresence>
        {recentUser && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white shadow-xl rounded-full px-4 py-2 flex items-center gap-2 border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                {recentUser} skapade just ett brev
              </span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main metrics container */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3 group cursor-default">
              {/* Icon with gradient background */}
              <motion.div
                className={`relative w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="text-white">{metric.icon}</div>
                {/* Pulse effect on update */}
                {idx === 0 && pulseAnimation && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-xl"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>

              {/* Metric content */}
              <div className="text-left">
                <div className="flex items-baseline gap-1">
                  <CountUp
                    start={metric.value * 0.8}
                    end={metric.value}
                    duration={2}
                    separator=""
                    decimals={metric.suffix === '%' ? 0 : 0}
                    className="text-2xl font-bold text-slate-900"
                  />
                  <span className="text-2xl font-bold text-slate-900">{metric.suffix}</span>
                  {idx === 0 && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm font-bold text-green-600 ml-1"
                    >
                      +1
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{metric.label}</p>
              </div>
            </div>

            {/* Live indicator dot for active users */}
            {idx === 1 && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Subtle background animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full filter blur-3xl opacity-20"
          animate={{
            x: ['-50%', '-45%', '-55%', '-50%'],
            y: ['-50%', '-45%', '-55%', '-50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
    </div>
  )
}