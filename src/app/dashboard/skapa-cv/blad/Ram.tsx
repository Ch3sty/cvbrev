'use client'

/**
 * Bladets ram (skissen beslut 4): på mobil ett bottenblad (Ark), på dator
 * dockat till höger i full höjd mellan toppraden och den fasta raden, 400 px
 * på mallkolumnens plats, papper med kant och skugga åt vänster, egen
 * rullning i kroppen och Spara i foten. Ingen dimma: hela arket syns medan
 * hon skriver. Samma dialog i båda: rubrik, fokus på
 * första fältet, Esc stänger, fokus tillbaka till träffytan på arket.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
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

/** Toppraden i FlowShell: 56 px och linjen om 3 px, plus kanten. */
const TOPP = 60

/**
 * Var den fasta raden börjar, räknat från vyns nederkant. Raden är sticky
 * längst ner i flödets rullyta, så dess överkant står still medan hon rullar;
 * den mäts om när raden byter höjd (förslaget, felraden) eller fönstret.
 */
function useRadensHojd(): number {
  const [h, setH] = useState(72)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-fast-rad]')
    if (!el) return
    const mat = () => setH(Math.max(0, Math.round(window.innerHeight - el.getBoundingClientRect().top)))
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    window.addEventListener('resize', mat)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', mat)
    }
  }, [])
  return h
}

function Dockad({ rubrik, under, onClose, fot, children, nyckel }: Omit<RamProps, 'dator'>) {
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const stang = useRef(onClose)
  stang.current = onClose
  const radH = useRadensHojd()

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
      style={{ top: TOPP, bottom: radH }}
      className="fixed right-0 z-[45] flex w-[340px] flex-col border-l border-kant bg-papper shadow-[-16px_0_32px_-20px_rgba(0,0,0,.35)] outline-none motion-safe:animate-[bladIn_160ms_ease-out] xl:w-[400px]"
    >
      <style>{'@keyframes bladIn{from{opacity:0}to{opacity:1}}'}</style>
      <div className="flex shrink-0 items-start gap-3 px-5 pb-2 pt-5">
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
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
      {fot ? <div className="shrink-0 border-t border-kant px-5 py-3">{fot}</div> : null}
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
