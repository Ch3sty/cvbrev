'use client'

/**
 * Ramens två dialoger (plan-testflode-2026-11-20 avsnitt 1): Avbryt och
 * Lämna in. Primärknappen är det trygga valet i avbryt-dialogen
 * ("Fortsätt") och handlingen i inlämningen ("Lämna in"); det andra är en
 * textlänk. Esc, klick utanför och svep stänger dialogen, aldrig sessionen.
 * Byggd på Sheet: bottenark på mobil, centrerad dialog på dator, scroll-lås
 * och fokus.
 */

import { useState } from 'react'
import Sheet from '@/components/shell/Sheet'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'

export interface RamDialogProps {
  open: boolean
  titel: string
  text: string
  primar: string
  lank: string
  /** Primärknappen. Får vara async: knappen väntar. */
  onPrimar: () => void | Promise<void>
  onLank: () => void
  /** Esc, klick utanför, svep: stänger bara dialogen. */
  onStang: () => void
  data?: string
}

export default function RamDialog({ open, titel, text, primar, lank, onPrimar, onLank, onStang, data }: RamDialogProps) {
  const [upptagen, setUpptagen] = useState(false)
  const tryck = async () => {
    if (upptagen) return
    setUpptagen(true)
    try {
      await onPrimar()
    } finally {
      setUpptagen(false)
    }
  }
  return (
    <Sheet open={open} onClose={upptagen ? () => {} : onStang} size="md" bare>
      <div className="px-5 pb-5 pt-5 font-sess-text sm:px-7 sm:pb-6 sm:pt-7" data-ramdialog={data}>
        <h2 className="font-sess-display text-[22px] font-bold leading-[27px] tracking-[-.015em] text-ink-1">{titel}</h2>
        <p className="mt-2 text-[15px] leading-[22px] text-ink-2">{text}</p>
        <div className="mt-6 flex flex-col-reverse gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={onLank}
            disabled={upptagen}
            className="inline-flex h-11 items-center justify-center px-2 text-[15px] font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 transition-colors hover:text-ink-1 disabled:opacity-60"
            data-dialog-lank
          >
            {lank}
          </button>
          <button type="button" onClick={() => void tryck()} disabled={upptagen} className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[160px]`} data-dialog-primar>
            {primar}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
