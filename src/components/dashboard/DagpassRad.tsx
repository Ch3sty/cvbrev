'use client'

/**
 * Sluttidsraden för Allt-dagen (docs/plan-paket-och-onboarding.md, avsnitt 6
 * och B3:s öppna beslut 12).
 *
 * Allt-dagen kör inget veckoprogram. Dygnet är ett engångsköp på 24 timmar,
 * och sju dagars program i en vy som varar ett dygn vore en lögn om vad hon
 * köpt. Veckopanelen visas därför inte alls för den som bara har ett dagpass,
 * och den här raden tar dess plats.
 *
 * Minsta möjliga med flit: en rad som säger när dygnet tar slut och
 * ingenting mer. Ingen nedräkning som tickar, ingen säljknapp. Hon har
 * precis betalat, och det enda hon behöver veta är hur länge hon har på sig.
 *
 * Tiden räknas i svensk tid, som allt annat som rör dygn i appen
 * (project_kvotmodell_dagsrytm).
 */

import StatusRow from '@/components/shell/StatusRow'

export interface DagpassRadProps {
  /** När dygnet tar slut (ISO). Är den null ritas ingenting. */
  endsAt: string | null
  className?: string
}

/** "i dag 21:40" eller "i morgon 09:15". Aldrig en tickande nedräkning. */
export function dagpassText(endsAt: string, now: Date = new Date()): string {
  const slut = new Date(endsAt)
  if (Number.isNaN(slut.getTime())) return 'Allt-dagen är aktiv.'

  const tid = new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  }).format(slut)

  const dag = (d: Date) =>
    new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Europe/Stockholm',
    }).format(d)

  const imorgon = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  if (dag(slut) === dag(now)) return `Allt-dagen gäller till ${tid} i dag.`
  if (dag(slut) === dag(imorgon)) return `Allt-dagen gäller till ${tid} i morgon.`
  return `Allt-dagen gäller till ${tid}.`
}

export default function DagpassRad({ endsAt, className }: DagpassRadProps) {
  if (!endsAt) return null

  return (
    <StatusRow tone="neutral" showDot className={className}>
      {dagpassText(endsAt)}
    </StatusRow>
  )
}
