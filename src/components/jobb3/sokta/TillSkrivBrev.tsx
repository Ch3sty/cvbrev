'use client'

/**
 * Lägger förifyllningen för Skriv brev (samma sessionStorage som Matchade
 * jobb använder) och byter sida. Ritar bara en rad medan bytet pågår.
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { coverLetterPrefill, type CoverLetterPrefillData } from '@/store/cover-letter-store'

export default function TillSkrivBrev({ prefill, href }: { prefill: CoverLetterPrefillData; href: string }) {
  const router = useRouter()
  useEffect(() => {
    coverLetterPrefill.set(prefill)
    router.replace(href)
  }, [prefill, href, router])
  return (
    <main className="j3-golv">
      <p className="j3-text" role="status" style={{ padding: '40px 0' }}>
        Vi öppnar Skriv brev med tjänsten ifylld.
      </p>
    </main>
  )
}
