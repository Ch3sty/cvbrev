'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ExternalLink,
  FileText,
  RotateCcw,
  Loader2,
  AlertCircle,
  Linkedin,
  ClipboardPaste,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { createCVFromLinkedIn } from '@/lib/linkedin/linkedin-to-cv-converter'
import { createClient } from '@/lib/supabase/client'
import LinkedInProfileMockup, {
  type ProfileMockupData,
} from '../LinkedInProfileMockup'
import SuccessStamp from '@/components/auth/SuccessStamp'
import type { OptimizationResults } from './Step3Results'
import type { LinkedInSections } from './Step2Profile'

interface Props {
  originalSections: LinkedInSections
  results: OptimizationResults
  fullName?: string
  onStartOver: () => void
}

const HOW_TO_STEPS = [
  {
    icon: ExternalLink,
    title: 'Öppna LinkedIn',
    desc: 'Gå till din profil',
  },
  {
    icon: ClipboardPaste,
    title: 'Klistra in',
    desc: 'En sektion i taget',
  },
  {
    icon: ArrowRight,
    title: 'Spara',
    desc: 'LinkedIn uppdaterar dig',
  },
]

export default function Step4Done({
  originalSections,
  results,
  fullName,
  onStartOver,
}: Props) {
  const router = useRouter()
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  const finalData: ProfileMockupData = {
    fullName,
    headline: results.sections.headline?.optimized || originalSections.headline,
    about: results.sections.about?.optimized || originalSections.about,
    experience:
      results.sections.experience?.optimized || originalSections.experience,
    education:
      results.sections.education?.optimized || originalSections.education,
    skills: results.sections.skills?.optimized || originalSections.skills,
  }

  const handleOpenLinkedIn = () => {
    window.open('https://www.linkedin.com/in/me/', '_blank', 'noopener,noreferrer')
  }

  const handleSaveAsCV = async () => {
    setIsSavingCV(true)
    setSaveError(null)
    setQuotaExceeded(false)
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Du måste vara inloggad')
      }

      // createCVFromLinkedIn förväntar struktur utan headline (det är bara på LinkedIn)
      const sectionsForCv = {
        about: results.sections.about,
        experience: results.sections.experience,
        education: results.sections.education,
        skills: results.sections.skills,
      }

      const cvId = await createCVFromLinkedIn(
        user.id,
        sectionsForCv as any,
        user.email,
        user.user_metadata?.full_name
      )

      toast.success('CV sparat! Omdirigerar...', {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
        theme: 'light',
      })

      setTimeout(() => {
        router.push(`/dashboard/cv-mallar?cv=${cvId}`)
      }, 2000)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Kunde inte spara som CV'
      const isQuota =
        err instanceof Error &&
        (err as Error & { quotaExceeded?: boolean }).quotaExceeded === true
      setSaveError(msg)
      setQuotaExceeded(isQuota)
      // Toast bara för icke-kvot-fel — kvot visas tydligt i UI:t
      if (!isQuota) {
        toast.error(msg, { position: 'bottom-center' })
      }
    } finally {
      setIsSavingCV(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-start">
      {/* Vänster: text + CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Steg 4 av 4
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Du är redo
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Din profil är optimerad. Välj hur du vill ta nästa steg.
          </p>
        </div>

        {/* CTA: Öppna LinkedIn */}
        <button
          type="button"
          onClick={handleOpenLinkedIn}
          className="w-full inline-flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mb-3"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 16px 32px -10px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-5 h-5 text-white" strokeWidth={2.2} />
            </span>
            <span className="text-left min-w-0">
              <span className="block text-base font-black">
                Öppna LinkedIn
              </span>
              <span className="block text-xs font-medium text-white/85">
                Klistra in den optimerade texten direkt
              </span>
            </span>
          </span>
          <ExternalLink className="w-5 h-5 flex-shrink-0" strokeWidth={2.4} />
        </button>

        {/* CTA: Spara som CV */}
        <button
          type="button"
          onClick={handleSaveAsCV}
          disabled={isSavingCV}
          className="w-full inline-flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              }}
            >
              {isSavingCV ? (
                <Loader2
                  className="w-5 h-5 text-white animate-spin"
                  strokeWidth={2.4}
                />
              ) : (
                <FileText className="w-5 h-5 text-white" strokeWidth={2.2} />
              )}
            </span>
            <span className="text-left min-w-0">
              <span className="block text-base font-black text-slate-900">
                {isSavingCV ? 'Sparar...' : 'Spara som CV i Jobbcoach.ai'}
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Använd optimerad text till ditt CV
              </span>
            </span>
          </span>
          <ArrowRight
            className="w-5 h-5 text-slate-400 flex-shrink-0"
            strokeWidth={2.4}
          />
        </button>

        {saveError && quotaExceeded && (
          <div
            className="mb-3 rounded-xl border border-orange-200 bg-orange-50/60 p-3.5"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5"
                strokeWidth={2.4}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 mb-1">
                  Du har nått din CV-gräns
                </p>
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  {saveError}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/profil/cv"
                    className="text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    Hantera CV →
                  </Link>
                  <Link
                    href="/dashboard/profil/prenumeration"
                    className="text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    Uppgradera till Premium →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {saveError && !quotaExceeded && (
          <div
            className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle
              className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <p className="text-xs text-red-800">{saveError}</p>
          </div>
        )}

        {/* Tertiary: Optimera ny profil */}
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 hover:text-orange-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.4} />
          Optimera en till profil
        </button>

        {/* Så uppdaterar du på LinkedIn */}
        <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-1 h-3 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
              }}
              aria-hidden="true"
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Så uppdaterar du på LinkedIn
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HOW_TO_STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.title}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                          : i === 1
                          ? 'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)'
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    }}
                  >
                    <Icon
                      className="w-4 h-4 text-white"
                      strokeWidth={2.4}
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">
                    {i + 1}. {s.title}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {s.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tack-rad */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Tack för att du använder Jobbcoach.ai
        </p>
      </motion.div>

      {/* Höger: final-mockup med stämpel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative lg:sticky lg:top-32"
      >
        <div className="absolute -top-4 -right-2 z-20 sm:-right-4">
          <SuccessStamp text="Optimerad" rotation={-8} />
        </div>
        <LinkedInProfileMockup data={finalData} variant="optimized" />
      </motion.div>
    </div>
  )
}
