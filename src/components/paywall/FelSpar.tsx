'use client'

/**
 * Fel spår i taket (docs/plan-paket-och-onboarding.md, Fas 2A flöde 4).
 *
 * Situationen: någon på Träningspaketet öppnar CV-mallarna. Hon ska inte mötas av
 * samma betalvägg som en gratisanvändare, för hon betalar redan. Skillnaden
 * måste synas.
 *
 * Principen är värdet först, spärren efter, uppgraderingen som en rad och
 * inte som ett kort. Därför två ytor, och de exporteras var för sig så att
 * mall- och testvyerna kan sätta raden ovanför listan och kortet först när
 * användaren faktiskt tryckt på något låst:
 *
 *   FelSparRad   neutral StatusRow ovanför listan (skärm 4.1)
 *   FelSpar      kortet i ett Sheet när hon trycker (skärm 4.2)
 *
 * Raden är neutral, aldrig warm: warm är reserverat för tidspress, och en
 * betalande som ser en varm rad tror att något är fel med prenumerationen.
 *
 * Priset i kortet är MELLANSKILLNADEN, aldrig hela paketpriset. Visar vi
 * 99 kr för någon som redan betalar 79 läser det som en dubbeldebitering.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sheet from '@/components/shell/Sheet'
import StatusRow from '@/components/shell/StatusRow'
import MarginPlate from '@/components/shell/MarginPlate'
import { IlluPlattaNedladdning } from '@/components/illustrations/TradenScener'
import { capture } from '@/lib/analytics/events'
import {
  FEL_SPAR,
  felSparRad,
  felSparRubrik,
  felSparKnapp,
  felSparText,
  mellanskillnad,
  type Track,
} from '@/lib/onboarding/program'
import type { Feature } from '@/lib/access/features'
import { bytPaket, type BytUtfall } from '@/lib/stripe/bytPaketKlient'
import PaketBytesRad from './PaketBytesRad'
import { PAKETBYTE } from '@/components/pricing/paket-copy'

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40'
const LANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const LANK_TYST =
  'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

export interface FelSparProps {
  /** Funktionen hon inte kommer åt. Skjuts med feature_blocked. */
  feature: Feature
  /** Hennes betalda spår. Null hör inte hit: då är det en vanlig betalvägg. */
  scope: Track | null
  /**
   * Mellanskillnaden i kronor, till exempel 20 för 79 mot 99. Går beloppet
   * inte att räkna fram före Stripe-sidan skickas null, och raden blir
   * "Bara mellanskillnaden" i stället.
   */
  priceDeltaKr?: number | null
  /** Arket är öppet. Föräldern äger tillståndet, så scrollpositionen består. */
  open: boolean
  onClose: () => void
  /** Vart Stripe ska skicka tillbaka henne, så hon landar på det hon ville ha. */
  returnPath?: string
  className?: string
}

/**
 * Raden ovanför listan (skärm 4.1).
 *
 * feature_blocked skjuts här, en gång per montering och aldrig per omritning:
 * händelsen är planens viktigaste enligt avsnitt 6, och dubbelräkning
 * förstör den.
 */
export function FelSparRad({
  feature,
  scope,
  surface,
  onOpen,
  className,
}: {
  feature: Feature
  scope: Track | null
  /** Sidan eller routen, normalt pathname. */
  surface: string
  /** Öppnar kortet. Utelämnas när raden bara ska informera. */
  onOpen?: () => void
  className?: string
}) {
  const skjutet = useRef(false)
  useEffect(() => {
    if (skjutet.current) return
    skjutet.current = true
    capture('feature_blocked', { feature, scope, surface })
    capture('upgrade_shown', { from_scope: scope, to_scope: 'allt', surface: 'statusrad' })
  }, [feature, scope, surface])

  if (!scope || scope === 'allt') return null

  return (
    <StatusRow
      tone="neutral"
      showDot
      wrap
      className={className}
      action={
        onOpen ? (
          <button type="button" onClick={onOpen} className={LANK_TYST}>
            {FEL_SPAR.radLank}
          </button>
        ) : undefined
      }
    >
      {felSparRad(scope)}
    </StatusRow>
  )
}

/** Kortet i arket (skärm 4.2). Bottenark på mobil, dialog på desktop. */
export default function FelSpar({
  feature,
  scope,
  priceDeltaKr = 20,
  open,
  onClose,
  returnPath,
  className,
}: FelSparProps) {
  const [busy, setBusy] = useState(false)
  const [utfall, setUtfall] = useState<BytUtfall | null>(null)
  const router = useRouter()

  // upgrade_shown för arket, en gång per öppning.
  const oppnat = useRef(false)
  useEffect(() => {
    if (!open) {
      oppnat.current = false
      return
    }
    if (oppnat.current) return
    oppnat.current = true
    capture('upgrade_shown', { from_scope: scope, to_scope: 'allt', surface: 'ark' })
  }, [open, scope])

  const uppgradera = async () => {
    if (busy) return
    setBusy(true)
    capture('paywall_cta_clicked', {
      variant: 'fel-spar',
      surface: typeof window === 'undefined' ? '' : window.location.pathname,
      cta: 'primary',
    })
    // Rutten byter pris på prenumerationen och svarar { upgraded: true }
    // utan url. Förut väntade knappen bara på url, så ett lyckat byte såg ut
    // som ingenting (köptestet 2026-09-24, bugg 3).
    setUtfall(null)
    const svar = await bytPaket('all_week', returnPath)
    if (svar.typ === 'kassa') {
      window.location.href = svar.url
      return
    }
    setUtfall(svar)
    setBusy(false)
  }

  // Efter ett lyckat byte hämtas sidan om först när arket stängs. Görs det
  // direkt byter föräldern scope till allt och arket försvinner innan
  // bekräftelsen hunnit läsas.
  const stang = () => {
    onClose()
    if (utfall?.typ === 'bytt') router.refresh()
  }

  if (!scope || scope === 'allt') return null

  return (
    <Sheet open={open} onClose={stang} bare className={className}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <MarginPlate>
            <IlluPlattaNedladdning size={48} />
          </MarginPlate>
          <div className="min-w-0 flex-1">
            <p className="text-kort text-ink-1">{felSparRubrik(feature)}</p>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">{felSparText(scope)}</p>
          </div>
        </div>

        <p className="mt-4 text-meta text-ink-3">{mellanskillnad(priceDeltaKr ?? null)}</p>
        <p className="mt-1 text-meta text-ink-3">{FEL_SPAR.proration}</p>

        <PaketBytesRad utfall={utfall} className="mt-4" />

        {utfall?.typ !== 'bytt' ? (
          <div className="mt-4">
            <button type="button" onClick={uppgradera} disabled={busy} className={KNAPP_PRIMAR}>
              {busy ? PAKETBYTE.arbetar : felSparKnapp(priceDeltaKr ?? null)}
            </button>
          </div>
        ) : null}

        <div className="mt-3 text-center">
          <button type="button" onClick={stang} className={LANK}>
            {FEL_SPAR.stang}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
