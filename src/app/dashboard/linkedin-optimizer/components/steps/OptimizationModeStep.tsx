'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, ChevronRight, ChevronLeft } from 'lucide-react'

type OptimizationMode = 'stand_out' | 'target_role'

interface OptimizationModeStepProps {
  mode: OptimizationMode
  targetRole: string
  onModeChange: (mode: OptimizationMode) => void
  onTargetRoleChange: (role: string) => void
  onNext: () => void
  onBack: () => void
}

export default function OptimizationModeStep({
  mode,
  targetRole,
  onModeChange,
  onTargetRoleChange,
  onNext,
  onBack
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
          className={`cursor-pointer bg-white rounded-2xl p-8 border-2 transition-all ${
            mode === 'stand_out'
              ? 'border-[#0A66C2] shadow-lg shadow-[#0A66C2]/20'
              : 'border-gray-200 hover:border-[#0A66C2]/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  mode === 'stand_out'
                    ? 'border-[#0A66C2] bg-[#0A66C2]'
                    : 'border-gray-300'
                }`}
              >
                {mode === 'stand_out' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-[#0A66C2]" />
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
          className={`cursor-pointer bg-white rounded-2xl p-8 border-2 transition-all ${
            mode === 'target_role'
              ? 'border-[#0A66C2] shadow-lg shadow-[#0A66C2]/20'
              : 'border-gray-200 hover:border-[#0A66C2]/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  mode === 'target_role'
                    ? 'border-[#0A66C2] bg-[#0A66C2]'
                    : 'border-gray-300'
                }`}
              >
                {mode === 'target_role' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-6 h-6 text-[#0A66C2]" />
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
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

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            canProceed
              ? 'bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white hover:shadow-lg hover:scale-105'
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
