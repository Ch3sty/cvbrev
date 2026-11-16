'use client'

/**
 * Bladets ram (skissen beslut 4): på mobil ett bottenblad (Ark), på dator
 * dockat till höger, 400 px på mallkolumnens plats, utan dimma så att hela
 * arket syns medan hon skriver. Samma dialog i båda: rubrik, fokus på
 * första fältet, Esc stänger, fokus tillbaka till träffytan på arket.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react'
import Ark from '@/components/cv/Dokument/Ark'
import { IkonStang } from '@/components/illustrations/MallIkoner'
import { DOK } from '@/components/cv/Dokument/texter'

export interface RamProps {
  dator: boolean
  rubrik: ReactNode
  under?: ReactNode
  onClose: () => void
  fot?: ReactNode
  children: ReactNode
  /** Byts nyckeln flyttas fokus på nytt (ett annat blad i samma ram). */
  nyckel: string
}

function Dockad({ rubrik, under, onClose, fot, children, nyckel }: Omit<RamProps, 'dator'>) {
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const stang = useRef(onClose)
  stang.current = onClose

  useEffect(() => {
    const forra = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => {
      const forsta = ref.current?.querySelector<HTMLElement>('input, textarea, select, button:not([data-stang])')
      ;(forsta ?? ref.current)?.focus()
    }, 30)
    const tangent = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Ett ark ovanpå (rubriker, mallar) tar Esc själv.
      if (document.querySelector('.dok-ark')) return
      e.stopPropagation()
      stang.current()
    }
    window.addEventListener('keydown', tangent, true)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', tangent, true)
      if (forra && document.contains(forra)) forra.focus?.()
    }
  }, [nyckel])

  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-r`}
      tabIndex={-1}
      data-bygg-blad
      className="sticky top-3 flex max-h-[calc(100dvh-178px)] flex-col overflow-hidden rounded-2xl border border-kant bg-papper outline-none motion-safe:animate-[threadEnter_160ms_ease-out_both]"
    >
      <div className="flex shrink-0 items-start gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-r`} className="font-display text-xl font-bold leading-tight text-ink-1">
            {rubrik}
          </h2>
          {under ? <p className="mt-1 text-meta text-ink-3">{under}</p> : null}
        </div>
        <button
          type="button"
          data-stang
          onClick={onClose}
          aria-label={DOK.stangEsc}
          className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-2 hover:bg-papper-2"
        >
          <IkonStang size={20} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
      {fot ? <div className="shrink-0 border-t border-kant px-4 py-3">{fot}</div> : null}
    </section>
  )
}

export default function Ram(p: RamProps) {
  if (p.dator) return <Dockad key={p.nyckel} {...p} />
  return (
    <Ark key={p.nyckel} open onClose={p.onClose} rubrik={p.rubrik} under={p.under} fot={p.fot}>
      {p.children}
    </Ark>
  )
}
