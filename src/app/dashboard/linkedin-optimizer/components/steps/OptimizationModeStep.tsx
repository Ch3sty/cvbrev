'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, ChevronRight, ChevronLeft, Globe } from 'lucide-react'

type OptimizationMode = 'stand_out' | 'target_role'
type Language = 'sv' | 'en'

interface OptimizationModeStepProps {
  mode: OptimizationMode
  targetRole: string
  language: Language
  onModeChange: (mode: OptimizationMode) => void
  onTargetRoleChange: (role: string) => void
  onLanguageChange: (language: Language) => void
  onNext: () => void
  onBack: () => void
  isFirstStep?: boolean
}

export default function OptimizationModeStep({
  mode,
  targetRole,
  language,
  onModeChange,
  onTargetRoleChange,
  onLanguageChange,
  onNext,
  onBack,
  isFirstStep = false
}: OptimizationModeStepProps) {
  const canProceed = mode === 'stand_out' || (mode === 'target_role' && targetRole.trim().length > 0)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Vad vill du uppnå?
        </h1>
        <p className="text-lg text-gray-600">
          Välj vilket optimeringsläge som passar dina mål bäst
        </p>
      </motion.div>

      {/* Mode Cards */}
      <div className="space-y-4 mb-12">
        {/* Stand Out Mode */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => onModeChange('stand_out')}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-2xl p-8 border-2 transition-all relative overflow-hidden ${
            mode === 'stand_out'
              ? 'border-pink-500 shadow-xl shadow-pink-500/20'
              : 'border-gray-200 hover:border-pink-300 hover:shadow-lg'
          }`}
        >
          {/* Gradient overlay on hover/active */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0"
            animate={{ opacity: mode === 'stand_out' ? 0.5 : 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0">
              <motion.div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  mode === 'stand_out'
                    ? 'border-pink-600 bg-pink-600 shadow-lg shadow-pink-500/50'
                    : 'border-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {mode === 'stand_out' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Få min profil att sticka ut mer
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Allmän optimering för att göra din profil mer professionell, attraktiv
                och synlig för rekryterare. Perfekt för att öka din räckvidd.
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#83941f]"></div>
                  <span>Optimerad för LinkedIns algoritm</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#83941f]"></div>
                  <span>Professionell ton och språk</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#83941f]"></div>
                  <span>Fokus på achievements och resultat</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Target Role Mode */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onModeChange('target_role')}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-2xl p-8 border-2 transition-all relative overflow-hidden ${
            mode === 'target_role'
              ? 'border-purple-500 shadow-xl shadow-purple-500/20'
              : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
          }`}
        >
          {/* Gradient overlay on hover/active */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0"
            animate={{ opacity: mode === 'target_role' ? 0.5 : 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0">
              <motion.div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  mode === 'target_role'
                    ? 'border-purple-600 bg-purple-600 shadow-lg shadow-purple-500/50'
                    : 'border-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {mode === 'target_role' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Target className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Optimera för en specifik roll
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Anpassa din profil för att perfekt matcha en specifik position eller
                karriärväg. Ökar dina chanser att hittas för just den rollen.
              </p>

              {/* Benefits */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e7a33e]"></div>
                  <span>Rollspecifika nyckelord</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e7a33e]"></div>
                  <span>Matchar jobbannonsers språk</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e7a33e]"></div>
                  <span>Framhäver relevant erfarenhet</span>
                </div>
              </div>

              {/* Target Role Input */}
              {mode === 'target_role' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <label className="block mb-2 text-sm font-semibold text-gray-900">
                    Vilken roll vill du optimera för?
                  </label>
                  <input
                    type="text"
                    placeholder="T.ex. VD, Projektledare, UX Designer, Säljchef..."
                    value={targetRole}
                    onChange={(e) => onTargetRoleChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Ange den exakta jobbtiteln för bästa resultat
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Language Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-12"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Välj språk för optimering
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Vilken LinkedIn-profil vill du optimera texten för?
            </p>

            {/* Language Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
              <motion.button
                onClick={() => onLanguageChange('sv')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 relative ${
                  language === 'sv'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {language === 'sv' && (
                  <motion.div
                    layoutId="language-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10">🇸🇪</span>
                <span className="relative z-10">Svenska</span>
              </motion.button>

              <motion.button
                onClick={() => onLanguageChange('en')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 relative ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {language === 'en' && (
                  <motion.div
                    layoutId="language-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10">🇬🇧</span>
                <span className="relative z-10">English</span>
              </motion.button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              💡 Texten kommer att genereras på det valda språket
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        {!isFirstStep ? (
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
        ) : (
          <div /> /* Spacer för layout */
        )}

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            canProceed
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Fortsätt</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
