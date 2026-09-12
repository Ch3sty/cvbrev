'use client'

/**
 * Sektion 3: "Bli upptäckt" (profil-spec, avsnitt 2).
 *
 * Ingen redigering här. Kandidatprofilen äger alla sina egna fält, CV-val,
 * villkor, pitch och synlighet, på sin egen sida. Sektionen finns bara för
 * att kandidatprofilen annars är helt osynlig från profilsidan, inte för att
 * duplicera den.
 */

import Link from 'next/link'
import { useCandidateInterests } from '@/hooks/useCandidateInterests'

export default function BliUpptacktSection() {
  const { isVisible, loaded } = useCandidateInterests()

  return (
    <section
      id="bli-upptackt"
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-neutral-900">Bli upptäckt</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        {!loaded
          ? 'Hämtar din status.'
          : isVisible
            ? 'Din profil är sökbar för rekryterare.'
            : 'Rekryterare kan inte hitta dig än. Du bestämmer själv vad som syns.'}
      </p>

      <div className="mt-4">
        <Link
          href="/dashboard/bli-upptackt"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400"
        >
          {isVisible ? 'Hantera din kandidatprofil' : 'Läs mer och kom igång'}
        </Link>
      </div>
    </section>
  )
}
