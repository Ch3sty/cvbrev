'use client'

/**
 * Målgångens tredje kort när det finns ett matchat jobb utan brev: trycket
 * lägger annonsen i förifyllningen (cover-letter-store, som jobbmatchningens
 * "Skriv brev") och öppnar Skriv brev.
 */
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { coverLetterPrefill } from '@/store/cover-letter-store'

export default function NastaJobb({
  className,
  children,
  jobb,
}: {
  className: string
  children: ReactNode
  jobb: { cvId: string; titel: string; foretag: string; annons: string; url: string | null }
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        coverLetterPrefill.reset()
        coverLetterPrefill.set({ cvId: jobb.cvId, jobTitle: jobb.titel, company: jobb.foretag, jobDescription: jobb.annons, jobAdUrl: jobb.url ?? undefined })
        router.push('/dashboard/skapa-brev')
      }}
    >
      {children}
    </button>
  )
}
