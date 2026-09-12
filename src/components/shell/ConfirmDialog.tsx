'use client'

/**
 * ConfirmDialog: ersätter native confirm()
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Native confirm blockerar tråden, går inte att formge, ser ut som ett
 * webbläsarfel och är olika på varje plattform. Den här bygger på Sheet, så
 * scroll-lås, Escape, safe area och fokushantering följer med gratis.
 *
 * Bekräftelseknappen är enda primära handlingen. Avbryt är alltid en
 * textlänk, aldrig en andra knapp, utom i destruktivt läge där avbryt är
 * det trygga valet och därför får knappform.
 */

import { useState } from 'react'
import Sheet from './Sheet'

export interface ConfirmDialogProps {
  open: boolean
  /** Stänger utan att bekräfta. */
  onCancel: () => void
  /** Körs vid bekräftelse. Får vara async, knappen visar då väntläge. */
  onConfirm: () => void | Promise<void>
  title: string
  /** En eller två meningar om vad som händer. */
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Destruktiv handling får röd bekräftelseknapp. */
  destructive?: boolean
}

export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Bekräfta',
  cancelLabel = 'Avbryt',
  destructive,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    if (busy) return
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  const confirmClass = destructive
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-orange-600 text-white hover:bg-orange-700'

  return (
    <Sheet
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      description={description}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={
              destructive
                ? 'inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 disabled:opacity-60'
                : 'inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline disabled:opacity-60'
            }
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? 'Vänta' : confirmLabel}
          </button>
        </div>
      }
    >
      {/* Sheet kräver ett barn. Texten bor i description, så kroppen är tom
          om inget mer behöver sägas. */}
      <span className="sr-only">{description ?? title}</span>
    </Sheet>
  )
}
