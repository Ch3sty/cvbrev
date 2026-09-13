'use client'

import Segment from '@/components/shell/Segment'

export type CompareSide = 'before' | 'after'

interface Props {
  value: CompareSide
  onChange: (side: CompareSide) => void
}

const OPTIONS: { value: CompareSide; label: string }[] = [
  { value: 'before', label: 'Före' },
  { value: 'after', label: 'Efter' },
]

/** Före/efter på mobil, som Segment. Valet markeras med kant ink-1. */
export default function CompareToggle({ value, onChange }: Props) {
  return (
    <Segment
      value={value}
      onChange={onChange}
      options={OPTIONS}
      label="Jämför profil före och efter"
    />
  )
}
