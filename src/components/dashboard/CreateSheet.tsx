'use client'

/**
 * Skapa-arket (docs/plan-inloggat-omdesign.md, avsnitt 3 och våg 1 punkt 9).
 *
 * Bottenark, aldrig centrerad modal: navets Skapa-slot sitter i nederkanten
 * och handlingen ska stanna där tummen redan är. Stängs med svep nedåt, tryck
 * utanför och Escape.
 *
 * Raderna är alltid samma tre och pekar alltid på samma mål, så ingen rad
 * byter betydelse mellan besök. Bara ordningen ändras: har användaren minst en
 * ansökan ligger "Logga ansökan" överst, annars "Nytt CV". Saknas CV går
 * brevraden till uppladdningen i stället, eftersom ett brev kräver ett CV, och
 * det sägs rakt ut i radens undertext i stället för med ett hänglås.
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  SkapaBrevIllu,
  SkapaCvIllu,
  SkapaAnsokanIllu,
} from './illustrations/NavIllustrations'

interface CreateSheetProps {
  open: boolean
  onClose: () => void
  /** Styr ordningen: minst en ansökan lyfter "Logga ansökan" överst. */
  applicationCount: number
  /** Utan CV går brevraden till uppladdningen i stället. */
  cvCount: number
}

interface Row {
  id: string
  label: string
  hint: string
  href: string
  Illu: (props: { className?: string }) => React.ReactElement
}

export default function CreateSheet({
  open,
  onClose,
  applicationCount,
  cvCount,
}: CreateSheetProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement | null>(null)

  const hasCv = cvCount > 0

  const rowBrev: Row = {
    id: 'brev',
    label: 'Nytt brev',
    hint: hasCv
      ? 'Klistra in en annons, få ett brev'
      : 'Kräver ett CV, vi tar det först',
    href: hasCv ? '/dashboard/skapa-brev' : '/dashboard/profil/cv',
    Illu: SkapaBrevIllu,
  }
  const rowCv: Row = {
    id: 'cv',
    label: 'Nytt CV',
    hint: hasCv ? 'Ladda upp eller bygg ett nytt' : 'Ladda upp ditt CV',
    href: '/dashboard/profil/cv',
    Illu: SkapaCvIllu,
  }
  const rowAnsokan: Row = {
    id: 'ansokan',
    label: 'Logga ansökan',
    hint: 'Håll koll på svaren',
    href: '/dashboard/sokta-tjanster?logga=1',
    Illu: SkapaAnsokanIllu,
  }

  const rows: Row[] =
    applicationCount > 0
      ? [rowAnsokan, rowBrev, rowCv]
      : [rowCv, rowBrev, rowAnsokan]

  // Escape, scrolllås och fokus in i arket.
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
  }, [open, onClose])

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-neutral-900/40"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Skapa nytt"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            drag={reduceMotion ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              // Svep nedåt stänger: antingen tillräckligt långt eller snabbt.
              if (info.offset.y > 96 || info.velocity.y > 600) onClose()
            }}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
            className="relative w-full rounded-t-xl border-t border-neutral-200 bg-white shadow-lg"
          >
            {/* Draghandtag: både affordans för svep och tryckyta för stängning. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="w-full pt-3 pb-2 flex justify-center touch-manipulation"
            >
              <span
                aria-hidden="true"
                className="block h-1 w-10 rounded-full bg-neutral-300"
              />
            </button>

            <h2 className="px-4 pb-2 text-base font-semibold text-neutral-900">
              Skapa nytt
            </h2>

            <ul className="px-2 pb-2">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => go(row.href)}
                    className="w-full min-h-[56px] flex items-center gap-3 px-2 py-3 rounded-lg text-left hover:bg-neutral-50 active:bg-neutral-100 transition-colors touch-manipulation"
                  >
                    <row.Illu className="w-6 h-6 text-neutral-700 flex-shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-neutral-900">
                        {row.label}
                      </span>
                      <span className="block text-xs text-neutral-500 truncate">
                        {row.hint}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
