'use client'

import Link from 'next/link'
import { useCVStore } from '@/store/cv-store'
import { formatCVDate } from '@/lib/utils/date-formatter'
import ChoiceCard from '@/components/shell/ChoiceCard'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import { IkonCv } from '@/components/illustrations/Ikoner'

interface Props {
  selectedCvId: string | null
  onSelect: (cvId: string) => void
  /**
   * Id på CV som är låsta av CV-kvoten. Förut räknade listan ut det själv med
   * useCvQuota, alltså ett auth.getUser() över nätet följt av två frågor, mitt
   * i första vyn. Kvotregeln är oförändrad, den räknas nu på servern i
   * getLinkedInData och skickas hit.
   */
  lockedCvIds: Set<string>
}

/**
 * CV-listan i steg 1: en rad per CV som ChoiceCard plain, naken ikon 24 i
 * ink-2, filnamn och datum. Valet markeras med kant ink-1 och bock, aldrig
 * med orange. Låsta CV är spärrade och säger varför i metaraden.
 */
export default function CvSelectorList({
  selectedCvId,
  onSelect,
  lockedCvIds,
}: Props) {
  const { cvs, isLoading } = useCVStore()

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={2} label="Laddar dina CV" />
  }

  if (cvs.length === 0) {
    return null
  }

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Välj CV att utgå ifrån">
      {cvs.map((cv) => {
        const isSelected = selectedCvId === cv.id
        const locked = lockedCvIds.has(cv.id)
        const ageLabel = formatCVDate(cv.created_at)

        return (
          <ChoiceCard
            key={cv.id}
            variant="plain"
            selected={isSelected && !locked}
            onSelect={() => {
              if (!locked) onSelect(cv.id)
            }}
            disabled={locked}
            title={cv.file_name}
            meta={
              locked
                ? 'Låst. Uppgradera till Premium för att kunna välja det.'
                : ageLabel
            }
            leading={<IkonCv size={24} />}
          />
        )
      })}

      <Link
        href="/dashboard/profil/cv"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
      >
        Ladda upp ett nytt CV
      </Link>
    </div>
  )
}
