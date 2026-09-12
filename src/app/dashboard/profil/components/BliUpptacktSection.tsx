'use client'

/**
 * Sektion 3: "Bli upptäckt" (profil-spec, avsnitt 2).
 *
 * Ingen redigering här. Kandidatprofilen äger alla sina egna fält, CV-val,
 * villkor, pitch och synlighet, på sin egen sida. Sektionen finns bara för
 * att kandidatprofilen annars är helt osynlig från profilsidan, inte för att
 * duplicera den.
 *
 * Statusraden bär en synlighetsindikator i stället för att bara vara en
 * mening: läget är binärt och ska gå att läsa av på en halv sekund.
 */

import Link from 'next/link'
import { useCandidateInterests } from '@/hooks/useCandidateInterests'
import { SectionUpptacktIcon } from './illustrations/SectionIcons'

interface BliUpptacktSectionProps {
  /**
   * Synligheten, läst på servern ur candidate_profiles. Förut stod raden och
   * sa "Hämtar din status" tills useCandidateInterests hunnit göra sitt
   * getSession och sina två anrop, alltså först en bit efter hydrering. Nu är
   * rätt text med i första HTML. Hooken får fortfarande rätta läget om det
   * hunnit ändras i en annan flik, men den blockerar inte första målningen.
   */
  initialVisible: boolean
}

export default function BliUpptacktSection({
  initialVisible,
}: BliUpptacktSectionProps) {
  const { isVisible: hookVisible, loaded } = useCandidateInterests()

  // Serverns värde gäller tills hooken har läst klart.
  const isVisible = loaded ? hookVisible : initialVisible

  return (
    <section
      id="bli-upptackt"
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <SectionUpptacktIcon className="h-10 w-10 shrink-0 text-neutral-700 sm:h-12 sm:w-12" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-900">Bli upptäckt</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            Rekryterare kan söka bland kandidater hos oss. Du bestämmer själv
            vad de får se och när.
          </p>
        </div>
      </div>

      {/* Statusraden: prick plus läge, samma mönster som statusrader i övrigt */}
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${
              isVisible ? 'bg-emerald-600' : 'bg-neutral-400'
            }`}
          />
          <p className="text-sm text-neutral-900">
            {isVisible
              ? 'Din profil är sökbar för rekryterare.'
              : 'Rekryterare kan inte hitta dig än. Du bestämmer själv vad som syns.'}
          </p>
        </div>

        <Link
          href="/dashboard/bli-upptackt"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400"
        >
          {isVisible ? 'Hantera' : 'Kom igång'}
        </Link>
      </div>
    </section>
  )
}
