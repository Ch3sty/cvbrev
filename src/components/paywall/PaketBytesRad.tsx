'use client'

/**
 * Svaret på en bytesknapp, som en rad (docs/qa/qa-kop-testlage-2026-09-24.md,
 * bugg 3). Lyckat byte, uppgradering eller sidbyte: positiv rad "Du har nu
 * Träningspaketet". Nedgradering eller längdbyte: neutral rad om att det sker
 * vid nästa förnyelse, med länk till kundportalen. Samma paket igen (409):
 * neutral rad med länk till prenumerationssidan. Fel: neutral rad, knappen
 * blir tryckbar igen.
 */
import Link from 'next/link'
import StatusRow from '@/components/shell/StatusRow'
import { PAKETBYTE } from '@/components/pricing/paket-copy'
import type { BytUtfall } from '@/lib/stripe/bytPaketKlient'

const LANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

export default function PaketBytesRad({
  utfall,
  className,
}: {
  utfall: BytUtfall | null
  className?: string
}) {
  if (!utfall || utfall.typ === 'kassa') return null

  if (utfall.typ === 'bytt') {
    return (
      <div role="status" className={className}>
        <StatusRow tone="positive" showDot wrap>
          {PAKETBYTE.klart(utfall.planKey)}
        </StatusRow>
      </div>
    )
  }

  if (utfall.typ === 'vidFornyelse') {
    return (
      <div role="status" className={className}>
        <StatusRow
          tone="neutral"
          showDot
          wrap
          action={
            <a href={PAKETBYTE.portalHref} className={LANK}>
              {PAKETBYTE.tillPortalen}
            </a>
          }
        >
          {PAKETBYTE.vidFornyelse(utfall.skal)}
        </StatusRow>
      </div>
    )
  }

  if (utfall.typ === 'redan') {
    return (
      <div role="status" className={className}>
        <StatusRow
          tone="neutral"
          showDot
          wrap
          action={
            <Link href={PAKETBYTE.href} className={LANK}>
              {PAKETBYTE.tillPrenumeration}
            </Link>
          }
        >
          {PAKETBYTE.redanPaket}
        </StatusRow>
      </div>
    )
  }

  return (
    <div role="alert" className={className}>
      <StatusRow tone="neutral" showDot wrap>
        {PAKETBYTE.fel}
      </StatusRow>
    </div>
  )
}
