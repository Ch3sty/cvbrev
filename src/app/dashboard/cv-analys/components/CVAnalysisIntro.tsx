'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Sparkles, Target, FileSearch, Zap } from 'lucide-react'

interface CVAnalysisIntroProps {
  onStartAnalysis: () => void
  remainingAnalyses?: number | null
  isPremium?: boolean
}

export default function CVAnalysisIntro({
  onStartAnalysis,
  remainingAnalyses,
  isPremium = false
}: CVAnalysisIntroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-semibold text-pink-700">AI-driven CV-analys</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Sluta gissa vad som är fel
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              med ditt CV
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            30 ansökningar. 0 svar. Känns det bekant? Vårt AI-verktyg hittar exakt vad
            som håller dig tillbaka och ger konkreta förbättringsförslag.
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={onStartAnalysis}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg group"
          >
            <span>Analysera mitt CV nu</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Quota Info */}
          {remainingAnalyses !== null && remainingAnalyses !== undefined && (
            <p className="mt-4 text-sm text-gray-500">
              {isPremium ? (
                <span className="text-purple-600 font-medium">Obegränsade analyser med Premium</span>
              ) : (
                <>Du har <span className="font-semibold text-pink-600">{remainingAnalyses}</span> {remainingAnalyses === 1 ? 'analys' : 'analyser'} kvar denna vecka</>
              )}
            </p>
          )}
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: Target,
              title: 'ATS-optimering',
              description: 'Vi analyserar om ditt CV passerar automatiska urvalssystem som 70% av arbetsgivare använder.'
            },
            {
              icon: FileSearch,
              title: 'Detaljerad feedback',
              description: 'Få specifika förslag på förbättringar för varje sektion av ditt CV.'
            },
            {
              icon: Zap,
              title: 'Direkt resultat',
              description: 'AI-driven analys på under en minut. Inga väntetider.'
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* What You Get Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-pink-100"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Det här får du
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Poäng för hur ATS-vänligt ditt CV är',
              'Analys av dina kompetenser och nyckelord',
              'Granskning av personlig beskrivning',
              'Förslag på förbättringar för varje sektion',
              'Jämförelse före och efter',
              'Möjlighet att exportera till PDF'
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </motion.div>
            ))}
          </div>

          {/* Secondary CTA */}
          <div className="mt-10 text-center">
            <motion.button
              onClick={onStartAnalysis}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 font-semibold rounded-xl border-2 border-pink-600 hover:bg-pink-50 transition-colors"
            >
              <span>Kom igång</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
