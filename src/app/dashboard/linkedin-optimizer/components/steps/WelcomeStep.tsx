'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Linkedin, TrendingUp, Award, Zap } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="max-w-3xl mx-auto">
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
          AI-driven optimering som hjälper dig sticka ut, nå fler rekryterare och
          öka dina chanser att få drömjobbet.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold text-[#0A66C2]">3x</div>
            <div className="text-sm text-gray-600">Fler visningar</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold text-[#83941f]">+45%</div>
            <div className="text-sm text-gray-600">Högre score</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold text-[#e7a33e]">&lt; 2 min</div>
            <div className="text-sm text-gray-600">Snabb process</div>
          </motion.div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 mb-8 border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#0A66C2]" />
          Så här funkar det
        </h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0A66C2] text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Välj optimeringsläge</h3>
              <p className="text-gray-600">Stick ut generellt eller optimera för en specifik roll</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0A66C2] text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Kopiera dina LinkedIn-sektioner</h3>
              <p className="text-gray-600">Om mig, Erfarenhet, Utbildning och Kompetenser</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0A66C2] text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI analyserar och förbättrar</h3>
              <p className="text-gray-600">Vi optimerar varje sektion med beprövade tekniker</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#0A66C2] text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Kopiera och uppdatera</h3>
              <p className="text-gray-600">Använd den förbättrade texten direkt på LinkedIn</p>
            </div>
          </div>
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
        className="text-center"
      >
        <button
          onClick={onNext}
          className="px-10 py-5 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto text-lg group"
        >
          <span>Kom igång nu</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
          🔒 Din data är trygg och raderas efter analys
        </p>
      </motion.div>
    </div>
  )
}
