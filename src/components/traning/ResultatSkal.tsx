'use client'

/**
 * Skalet för resultatskärmarna P4, S1, M1 och O1 (spec-rummen 4.4
 * Resultatvy): helskärm som passet, men med väggen överst. Väggens topprad är
 * passets egen (stäng, "Dagens pass · sparat", "9 / 9"), inte rummets
 * Topprad: den döljs under ett flöde och har avatar och notiser som inte hör
 * hemma här.
 *
 * Väggen säger var du är, det lyfta kortet vad som hände (spec 16.3.1).
 * Kopparknappen står i foten, aldrig på väggen. M1 har ingen fot för gratis:
 * kopparknappen står i betalväggens kort.
 *
 * `motion` sätter rörelseklassen så att stegen s1 till s4 avslöjas i tur och
 * ordning (120, 420, 720, 1020 ms) och ringen fylls. prefers-reduced-motion
 * ger sluttillståndet direkt (globals.css).
 */

import { useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { TRANING_HREF } from '@/lib/traning/klient'
import { useFlodeLage } from './PassShell'

export interface ResultatSkalProps {
  /** "Dagens pass · sparat" */
  kontext: string
  /** "9 / 9" */
  raknare?: string | null
  /** Väggens innehåll under toppraden. */
  vagg: ReactNode
  /** Golvets innehåll. Första barnet är det lyfta kortet. */
  golv: ReactNode
  fot?: ReactNode
  motion?: boolean
  onStang?: () => void
  label: string
}

export default function ResultatSkal({ kontext, raknare, vagg, golv, fot, motion = true, onStang, label }: ResultatSkalProps) {
  const router = useRouter()
  const footerRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, Boolean(fot))
  const stang = onStang ?? (() => router.push(TRANING_HREF))

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px] ${motion ? 'motion' : ''}`}
      data-resultat
      aria-label={label}
      role="region"
    >
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[640px]">
            <div className="-mx-1 flex h-[60px] items-center gap-2 text-vagg-ink lg:h-[72px]">
              <button
                type="button"
                onClick={stang}
                aria-label={PASS_COPY.topp.stang}
                className="-ml-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]"
              >
                <IkonX />
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{kontext}</span>
              {raknare ? <span className="pr-1 text-[13px] tabular-nums text-vagg-mjuk">{raknare}</span> : null}
            </div>
            {vagg}
          </div>
        </div>
        <div className="px-4 pb-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4">{golv}</div>
        </div>
      </main>
      {fot ? (
        <footer
          ref={footerRef}
          className="flex-shrink-0 border-t border-kant bg-papper"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto flex w-full max-w-[640px] flex-col items-stretch gap-1 px-4 py-3">{fot}</div>
        </footer>
      ) : null}
    </div>
  )
}

/** De tre talen på väggen (konceptets .tre). */
export function TreTal({ tal }: { tal: { varde: string; etikett: string; koppar?: boolean }[] }) {
  return (
    <dl className="mt-3 grid grid-cols-3 gap-2">
      {tal.map((t, i) => (
        <div key={i} className="flex flex-col-reverse">
          <dt className="mt-1 text-xs leading-4 text-vagg-mjuk">{t.etikett}</dt>
          <dd className={`m-0 font-display text-tal-tre font-bold tabular-nums tracking-[-.02em] ${t.koppar ? 'text-koppar-ljus' : 'text-vagg-ink'}`}>
            {t.varde}
          </dd>
        </div>
      ))}
    </dl>
  )
}
