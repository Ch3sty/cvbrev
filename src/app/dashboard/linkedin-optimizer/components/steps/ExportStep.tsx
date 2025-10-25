'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, FileText, Loader2, AlertCircle, Download, Linkedin, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createCVFromLinkedIn } from '@/lib/linkedin/linkedin-to-cv-converter'
import { createClient } from '@/lib/supabase/client'

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

interface ExportStepProps {
  optimizedSections: {
    about: SectionResult
    experience: SectionResult
    education?: SectionResult
    skills?: SectionResult
  }
  onStartOver: () => void
}

export default function ExportStep({ optimizedSections, onStartOver }: ExportStepProps) {
  const router = useRouter()
  const [copiedAll, setCopiedAll] = useState(false)
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const copyAllForLinkedIn = async () => {
    const allText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OM MIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.about.optimized}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERFARENHET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.experience.optimized}

${optimizedSections.education ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UTBILDNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.education.optimized}

` : ''}${optimizedSections.skills ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KOMPETENSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${optimizedSections.skills.optimized}` : ''}`

    try {
      await navigator.clipboard.writeText(allText)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 3000)
      toast.success('✓ Allt kopierat! Klistra nu in på LinkedIn', {
        position: 'bottom-right',
        autoClose: 4000
      })
    } catch (error) {
      toast.error('Kunde inte kopiera', { position: 'bottom-right' })
    }
  }

  const handleSaveAsCV = async () => {
    setIsSavingCV(true)
    setSaveError(null)

    try {
      // Get authenticated user from Supabase client
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Du måste vara inloggad')
      }

      const cvId = await createCVFromLinkedIn(
        user.id,
        optimizedSections,
        user.email,
        user.user_metadata?.full_name
      )

      toast.success('✓ CV sparat! Omdirigerar...', {
        position: 'bottom-right',
        autoClose: 2000
      })

      setTimeout(() => {
        router.push(`/dashboard/cv-mallar?cv=${cvId}`)
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kunde inte spara som CV'
      setSaveError(errorMessage)
      toast.error(errorMessage, { position: 'bottom-right' })
    } finally {
      setIsSavingCV(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-xl"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Grattis! Din profil är redo
        </h1>
        <p className="text-lg text-gray-600">
          Nu är det dags att uppdatera LinkedIn med din nya, optimerade profil
        </p>
      </motion.div>

      {/* Main Export Options */}
      <div className="space-y-4 mb-8">
        {/* Copy All for LinkedIn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/80 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Uppdatera LinkedIn</h2>
              <p className="text-blue-100">
                Kopiera all optimerad text och uppdatera din LinkedIn-profil direkt
              </p>
            </div>
          </div>

          <button
            onClick={copyAllForLinkedIn}
            className="w-full px-6 py-4 bg-white text-[#0A66C2] font-semibold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
          >
            {copiedAll ? (
              <>
                <Check className="w-5 h-5" />
                <span>Kopierat! Klistra in på LinkedIn</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Kopiera allt för LinkedIn</span>
              </>
            )}
          </button>

          {copiedAll && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              <p className="text-sm text-blue-100">
                ✓ Texten är kopierad! Öppna nu LinkedIn och klistra in i respektive sektion.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Save as CV */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-sm"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spara som CV</h3>
              <p className="text-gray-600">
                Använd den optimerade texten som utgångspunkt för ditt CV
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAsCV}
            disabled={isSavingCV}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingCV ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sparar...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Spara som CV på Jobbcoach.ai</span>
              </>
            )}
          </button>

          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{saveError}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          Hur uppdaterar jag LinkedIn?
        </h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="font-semibold flex-shrink-0">1.</span>
            <span>Klicka på "Kopiera allt för LinkedIn" ovan</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold flex-shrink-0">2.</span>
            <span>Öppna din LinkedIn-profil och klicka på "Redigera"</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold flex-shrink-0">3.</span>
            <span>Klistra in texten i varje sektion (Om mig, Erfarenhet, etc.)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold flex-shrink-0">4.</span>
            <span>Spara ändringarna och se din profil lysa upp! ✨</span>
          </li>
        </ol>
      </motion.div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStartOver}
          className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analysera en ny profil</span>
        </button>

        <p className="text-sm text-gray-500 text-center">
          Tack för att du använder Jobbcoach.ai! 💙
        </p>
      </div>
    </div>
  )
}
