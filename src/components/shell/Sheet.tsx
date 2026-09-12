'use client'

/**
 * Sheet: bottenark på mobil, centrerad dialog på desktop
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Ett svävande element, så skugga är tillåten här.
 *
 * Regler som byggs in i stället för att upprepas per anropsplats:
 * - Body-scroll låses medan arket är öppet, och scrollpositionen behålls.
 * - Escape stänger, liksom klick utanför och svep nedåt på mobil.
 * - Stängknappen är 44 px.
 * - Botten respekterar safe-area, så arket inte hamnar under hemindikatorn.
 * - Fokus flyttas in i arket vid öppning och tillbaka vid stängning.
 * - z-index enligt skalan: sheet 50.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface SheetProps {
  open: boolean
  onClose: () => void
  /** Rubrik i arkets huvud. Blir även dialogens tillgängliga namn. */
  title?: string
  /** Kort rad under rubriken. */
  description?: string
  children: React.ReactNode
  /** Fast fot, till exempel primär handling. Ligger kvar när innehållet scrollar. */
  footer?: React.ReactNode
  /** Maxbredd på desktop. */
  size?: 'md' | 'lg'
  className?: string
}

const SIZE: Record<NonNullable<SheetProps['size']>, string> = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
}

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  // Escape stänger. Registreras bara när arket är öppet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lås body-scroll utan att tappa scrollpositionen.
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [open])

  // Flytta fokus in i arket, och tillbaka dit det kom ifrån vid stängning.
  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const id = window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })
    return () => {
      window.cancelAnimationFrame(id)
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  // Återställ svepet när arket öppnas på nytt.
  useEffect(() => {
    if (open) setDragY(0)
  }, [open])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const delta = (e.touches[0]?.clientY ?? 0) - touchStartY.current
    // Bara nedåt. Uppåt ska inte kunna dra loss arket från kanten.
    if (delta > 0) setDragY(delta)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (dragY > 96) onClose()
    else setDragY(0)
    touchStartY.current = null
  }, [dragY, onClose])

  if (!open || typeof document === 'undefined') return null

  const labelledBy = title ? 'sheet-title' : undefined

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Stäng"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : 'Dialog'}
        tabIndex={-1}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-white shadow-lg outline-none sm:rounded-xl ${SIZE[size]} ${className ?? ''}`}
      >
        {/* Draghandtag, bara mobil. Bär svepgesten. */}
        <div
          className="shrink-0 pt-2 sm:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span
            className="mx-auto block h-1 w-10 rounded-full bg-neutral-300"
            aria-hidden="true"
          />
        </div>

        {title || description ? (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              {title ? (
                <h2
                  id="sheet-title"
                  className="text-base font-semibold tracking-tight text-neutral-900"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {description}
                </p>
              ) : null}
            </div>
            <CloseButton onClose={onClose} />
          </div>
        ) : (
          <div className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4">
            <CloseButton onClose={onClose} />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div
            className="shrink-0 border-t border-neutral-200 px-4 py-3 sm:px-6"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        ) : (
          <div
            aria-hidden="true"
            style={{ height: 'env(safe-area-inset-bottom)' }}
            className="shrink-0 sm:hidden"
          />
        )}
      </div>
    </div>,
    document.body
  )
}

/** 44 px träffyta enligt designsystemet. */
function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Stäng"
      className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}
