'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createCVFromLinkedIn } from '@/lib/linkedin/linkedin-to-cv-converter'
import { createClient } from '@/lib/supabase/client'
import PaywallCard from '@/components/paywall/PaywallCard'
import Confirmation from '@/components/shell/Confirmation'
import FlowError from '@/components/shell/FlowError'
import LinkedInProfileMockup, { type ProfileMockupData } from '../LinkedInProfileMockup'
import type { OptimizationResults } from './Step3Results'
import type { LinkedInSections } from './Step2Profile'

interface Props {
  originalSections: LinkedInSections
  results: OptimizationResults
  fullName?: string
  onStartOver: () => void
}

const HOW_TO_STEPS = [
  { title: 'Öppna LinkedIn', desc: 'Gå till din profil.' },
  { title: 'Klistra in', desc: 'En sektion i taget.' },
  { title: 'Spara', desc: 'LinkedIn uppdaterar profilen direkt.' },
]

/**
 * Steg 4: bekräftelsen. Titeln säger vad som är klart, och de två vägarna
 * vidare är öppna LinkedIn eller spara texten som CV hos oss.
 */
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
    experience: results.sections.experience?.optimized || originalSections.experience,
    education: results.sections.education?.optimized || originalSections.education,
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

      toast.success('CV sparat', {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
        theme: 'light',
      })

      setTimeout(() => {
        router.push(`/dashboard/cv-mallar?cv=${cvId}`)
      }, 2000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kunde inte spara som CV'
      const isQuota =
        err instanceof Error &&
        (err as Error & { quotaExceeded?: boolean }).quotaExceeded === true
      setSaveError(msg)
      setQuotaExceeded(isQuota)
      // Toast bara för icke-kvot-fel, kvot visas tydligt i UI:t
      if (!isQuota) {
        toast.error(msg, { position: 'bottom-center' })
      }
    } finally {
      setIsSavingCV(false)
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
      <div className="space-y-4">
        <Confirmation
          title="Din LinkedIn-profil är optimerad"
          description="Kopiera in texten på LinkedIn, eller spara den som ett CV hos oss."
          action={
            <button
              type="button"
              onClick={handleOpenLinkedIn}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
            >
              Öppna LinkedIn
            </button>
          }
          secondaryAction={
            <button
              type="button"
              onClick={handleSaveAsCV}
              disabled={isSavingCV}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:opacity-40"
            >
              {isSavingCV ? 'Sparar' : 'Spara som CV i Jobbcoach'}
            </button>
          }
        />

        {saveError && quotaExceeded && <PaywallCard variant="cv-antal" />}

        {saveError && !quotaExceeded && <FlowError message={saveError} />}

        <section className="rounded-xl border border-kant bg-panel p-4">
          <h3 className="text-sm font-medium text-ink-3">Så uppdaterar du på LinkedIn</h3>
          <ol className="mt-2 divide-y divide-kant">
            {HOW_TO_STEPS.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}.</span>
                <span className="min-w-0">
                  <span className="block text-kort text-ink-1">{s.title}</span>
                  <span className="block text-meta text-ink-3">{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          Optimera en till profil
        </button>
      </div>

      <div className="lg:sticky lg:top-4">
        <LinkedInProfileMockup data={finalData} variant="optimized" badge="Din nya profil" />
      </div>
    </div>
  )
}
