'use client'

/**
 * ConfirmDialog: ersätter native confirm()
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Native confirm blockerar tråden, går inte att formge, ser ut som ett
 * webbläsarfel och är olika på varje plattform. Den här bygger på Sheet, så
 * scroll-lås, Escape, safe area och fokushantering följer med gratis.
 *
 * Bekräftelseknappen är enda primära handlingen, i ink. Avbryt är alltid en
 * textlänk, aldrig en andra knapp, utom i destruktivt läge där avbryt är
 * det trygga valet och därför får knappform, och bekräftelsen blir fel-röd.
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
    ? 'bg-fel text-white hover:bg-fel-morker'
    : 'bg-ink-1 text-white hover:bg-ink-hover'

  return (
    <Sheet
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      description={description}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={
              destructive
                ? 'inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:border-kant-stark disabled:opacity-60'
                : 'inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 transition-colors hover:text-ink-1 disabled:opacity-60'
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
