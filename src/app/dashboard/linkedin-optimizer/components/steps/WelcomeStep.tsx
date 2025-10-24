'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Linkedin, TrendingUp, Award, Zap } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 -mx-4 -my-8 overflow-hidden pointer-events-none">
        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(10, 102, 194, 0.15) 0%, transparent 70%)',
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-[#0A66C2]/10 rounded-full mb-6">
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          <span className="text-sm font-semibold text-gray-900">LinkedIn Profiloptimering</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Gör din LinkedIn-profil
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/70">
            omöjlig att missa
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Smart optimering som hjälper dig sticka ut, nå fler rekryterare och
          öka dina chanser att få drömjobbet.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-xl p-4 shadow-lg shadow-blue-500/10 border border-gray-100 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-[#0A66C2]">3x</div>
              <div className="text-sm text-gray-600">Fler visningar</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-xl p-4 shadow-lg shadow-green-500/10 border border-gray-100 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-[#83941f]">+45%</div>
              <div className="text-sm text-gray-600">Högre score</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-xl p-4 shadow-lg shadow-orange-500/10 border border-gray-100 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-[#e7a33e]">&lt; 2 min</div>
              <div className="text-sm text-gray-600">Snabb process</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 mb-8 border border-blue-100 shadow-lg shadow-blue-500/10 relative z-10 overflow-hidden"
      >
        {/* Decorative gradient overlay */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
          <Sparkles className="w-6 h-6 text-[#0A66C2]" />
          Så här funkar det
        </h2>

        <div className="space-y-4 relative z-10">
          {[
            {
              step: 1,
              title: 'Välj optimeringsläge',
              desc: 'Stick ut generellt eller optimera för en specifik roll',
            },
            {
              step: 2,
              title: 'Kopiera dina LinkedIn-sektioner',
              desc: 'Om mig, Erfarenhet, Utbildning och Kompetenser',
            },
            {
              step: 3,
              title: 'Vi analyserar och förbättrar',
              desc: 'Vi optimerar varje sektion med beprövade tekniker',
            },
            {
              step: 4,
              title: 'Kopiera och uppdatera',
              desc: 'Använd den förbättrade texten direkt på LinkedIn',
            },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
              whileHover={{ x: 5 }}
              className="flex gap-4 group"
            >
              <motion.div
                className="flex-shrink-0 w-8 h-8 bg-[#0A66C2] text-white rounded-full flex items-center justify-center font-semibold"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {item.step}
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#0A66C2] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-4 mb-12"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <TrendingUp className="w-8 h-8 text-[#0A66C2] mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Bättre synlighet</h3>
          <p className="text-sm text-gray-600">Optimerad för LinkedIns algoritm och rekryterare</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <Award className="w-8 h-8 text-[#83941f] mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Professionell framtoning</h3>
          <p className="text-sm text-gray-600">Rätt nyckelord och strukturerad information</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <Zap className="w-8 h-8 text-[#e7a33e] mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Snabbt & enkelt</h3>
          <p className="text-sm text-gray-600">Hela processen tar mindre än 2 minuter</p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center relative z-10"
      >
        <div className="relative inline-block">
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-20"
            animate={{
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          <motion.button
            onClick={onNext}
            className="relative px-10 py-5 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3 text-lg group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Kom igång nu</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2"
        >
          🔒 Din data är trygg och raderas efter analys
        </motion.p>
      </motion.div>
    </div>
  )
}
