'use client'

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import Link from 'next/link'
import { formatCVDate } from '@/lib/utils/date-formatter'
import ChoiceCard from '@/components/shell/ChoiceCard'
import { IkonCv } from '@/components/illustrations/Ikoner'

/** Det listan behöver av ett CV. */
export interface CvRad {
  id: string
  file_name: string
  created_at: string
}

interface Props {
  /**
   * CV-listan. Kommer från servern (getLinkedInData) via steg 1, så första
   * HTML innehåller listan färdig och inget byts efter första målningen.
   * Förut läste listan cv-storen och ritade ett skelett medan storen
   * laddade; bytet mot listan mätte CLS 0,292 (Rummen våg 1a och 1b).
   */
  cvs: CvRad[]
  selectedCvId: string | null
  onSelect: (cvId: string) => void
  /**
   * Id på CV som är låsta av CV-kvoten. Kvotregeln är oförändrad, den räknas
   * på servern i getLinkedInData och skickas hit.
   */
  lockedCvIds: Set<string>
}

/**
 * CV-listan i steg 1: en rad per CV som ChoiceCard plain, naken ikon 24 i
 * ink-2, filnamn och datum. Valet markeras med kant ink-1 och bock, aldrig
 * med orange. Låsta CV är spärrade och säger varför i metaraden.
 */
export default function CvSelectorList({
  cvs,
  selectedCvId,
  onSelect,
  lockedCvIds,
}: Props) {
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
                ? PAKETRADER.lastCv
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
