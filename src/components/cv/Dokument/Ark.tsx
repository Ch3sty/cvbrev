'use client'

/**
 * Arket: ett blad som glider upp ovanpå dokumentet (skissen, yta 1 och 3).
 * Mobil: nederst, full bredd, rundat överst med handtag. Dator: samma blad,
 * högst 520 px brett, centrerat nederst, så dokumentet bakom syns och byts
 * live. Esc och tryck på dimman stänger. Fokus flyttas in och tillbaka.
 * Arket ligger över helskärmen (z 90 mot 80), så Alla-arket kan öppnas där.
 */

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IkonStang } from '@/components/illustrations/MallIkoner'
import { DOK } from './texter'
import { oppnaDialog } from './dialoglager'

export interface ArkProps {
  open: boolean
  onClose: () => void
  rubrik: ReactNode
  under?: ReactNode
  children: ReactNode
  /** Foten (knappar) som står kvar när innehållet rullar. */
  fot?: ReactNode
  /** Bredare blad (Alla-arket). */
  bred?: boolean
  /** Ingen dimma: dokumentet bakom ska synas helt (typsnitt, rubriker). */
  utanDimma?: boolean
  /** Extra i rubrikraden, till höger (antal, filter). */
  tillagg?: ReactNode
}

export default function Ark({ open, onClose, rubrik, under, children, fot, bred, utanDimma, tillagg }: ArkProps) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  // onClose skapas på nytt vid varje rendering hos ytan; i en ref så att
  // fokus inte flyttas tillbaka till första fältet vid varje rendering.
  const stang = useRef(onClose)
  stang.current = onClose

  useEffect(() => {
    if (!open) return
    const forra = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => {
      const forsta = ref.current?.querySelector<HTMLElement>(
        'input, button:not([data-stang]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      ;(forsta ?? ref.current)?.focus()
    }, 30)
    // Fångstfasen på window: arket ligger överst (också ovanpå helskärmen),
    // så Esc stänger bara arket och når aldrig helskärmens lyssnare.
    const tangent = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      stang.current()
    }
    window.addEventListener('keydown', tangent, true)
    const slapp = oppnaDialog()
    return () => {
      slapp()
      window.clearTimeout(t)
      window.removeEventListener('keydown', tangent, true)
      forra?.focus?.()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      <button
        type="button"
        aria-label={DOK.stang}
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${utanDimma ? 'bg-transparent' : 'bg-[rgba(10,12,30,.55)]'}`}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-r`}
        tabIndex={-1}
        className={`dok-ark relative flex ${utanDimma ? 'max-h-[52dvh] sm:max-h-[88dvh]' : 'max-h-[88dvh]'} w-full flex-col rounded-t-3xl border-t border-kant bg-papper shadow-[0_-12px_40px_rgba(0,0,0,.25)] outline-none ${bred ? 'sm:max-w-[640px]' : 'sm:max-w-[520px]'}`}
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-kant-stark" />
        <div className="flex shrink-0 items-start gap-3 px-4 pb-2 pt-3">
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-r`} className="font-display text-lg font-bold leading-tight text-ink-1">
              {rubrik}
            </h2>
            {under ? <p className="mt-1 text-sm leading-5 text-ink-2">{under}</p> : null}
          </div>
          {tillagg}
          <button
            type="button"
            data-stang
            onClick={onClose}
            aria-label={DOK.stang}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-2 hover:bg-papper-2"
          >
            <IkonStang size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
        {fot ? (
          <div className="shrink-0 border-t border-kant px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">{fot}</div>
        ) : (
          <div className="h-[env(safe-area-inset-bottom)] shrink-0" />
        )}
      </div>
    </div>,
    document.body
  )
}
