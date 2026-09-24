'use client'

/**
 * Statusraden för saknade CV-uppgifter (Del A, saas-leads beslut: namn och
 * ort, aldrig foto). Foto räknas aldrig och nämns aldrig: det är frivilligt
 * i Sverige. Namn saknas ger en varm rad, bara ort en neutral. Båda ifyllda
 * ger ingen rad.
 */

import StatusRow from '@/components/shell/StatusRow'
import { PROFIL } from '../profil-copy'

export interface SaknasRadProps {
  /** Sant om ifyllt. */
  namn: boolean
  ort: boolean
}

export function saknasText(p: SaknasRadProps): { ton: 'warm' | 'neutral'; text: string } | null {
  if (!p.namn) return { ton: 'warm', text: PROFIL.saknas.namn }
  if (!p.ort) return { ton: 'neutral', text: PROFIL.saknas.ort }
  return null
}

export default function SaknasRad(props: SaknasRadProps) {
  const rad = saknasText(props)
  if (!rad) return null
  return (
    <StatusRow tone={rad.ton} showDot wrap>
      {rad.text}
    </StatusRow>
  )
}
