'use client'

/**
 * Sektion 3: "Bli upptäckt" (profil-spec, avsnitt 2).
 *
 * Ingen redigering här. Kandidatprofilen äger alla sina egna fält på sin
 * egen sida. Sektionen finns bara för att kandidatprofilen annars är helt
 * osynlig från profilsidan.
 *
 * Läget är en statusrad: punkt i positiv när profilen är sökbar, i ink-3
 * annars. Handlingen är en textlänk, aldrig en andra knapp.
 */

import Link from 'next/link'
import { useCandidateInterests } from '@/hooks/useCandidateInterests'
import StatusRow from '@/components/shell/StatusRow'

interface BliUpptacktSectionProps {
  /** Synligheten, läst på servern ur candidate_profiles. */
  initialVisible: boolean
}

export default function BliUpptacktSection({ initialVisible }: BliUpptacktSectionProps) {
  const { isVisible: hookVisible, loaded } = useCandidateInterests()

  // Serverns värde gäller tills hooken har läst klart.
  const isVisible = loaded ? hookVisible : initialVisible

  return (
    <section id="bli-upptackt" className="scroll-mt-24 rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <h2 className="text-kort text-ink-1">Bli upptäckt</h2>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">
        Rekryterare kan söka bland kandidater hos oss. Du bestämmer själv vad de får se och när.
      </p>

      <StatusRow
        className="mt-4"
        tone={isVisible ? 'positive' : 'neutral'}
        showDot
        label="Synlighet för rekryterare"
        action={
          <Link
            href="/dashboard/bli-upptackt"
            className="text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            {isVisible ? 'Hantera' : 'Kom igång'}
          </Link>
        }
      >
        {isVisible ? 'Sökbar för rekryterare' : 'Inte sökbar än'}
      </StatusRow>
    </section>
  )
}
