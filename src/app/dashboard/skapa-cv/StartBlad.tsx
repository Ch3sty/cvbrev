'use client'

/**
 * Startbladet (skissen yta 1): ett blad över det tomma arket, inte en egen
 * sida. Titeln först (styr rubriker, spöktext och Jobbcoachens förslag),
 * sedan två ingångar: "Ladda upp ett CV du har" som en rad och "Skriv från
 * början" som den enda kopparknappen. Spärren för antal CV visas här, inte
 * efter tjugo minuters skrivande.
 *
 * Bladet ritas utan portal, så att det finns i första HTML (LCP). Det går
 * inte att stänga: X i toppraden lämnar byggaren.
 *
 * Uppladdningen är samma som i Mina CV (CVUploadZone och uploadCV mot
 * /api/cv/upload), med samtyckestexten ordagrant.
 */
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useProfile } from '@/hooks/use-profile'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import PaywallCard from '@/components/paywall/PaywallCard'
import { IkonUppladdning } from '@/components/illustrations/MallIkoner'
import { START } from './texter'
import { FANNS_REDAN_VANTAN } from '@/lib/cv/dubblett'

const CVUploadZone = dynamic(() => import('@/components/cv/cv-upload-zone'), { ssr: false })

export default function StartBlad({
  titel,
  onTitel,
  onSkriv,
  sparr,
  mall,
  oppnaUppladdning,
}: {
  titel: string
  onTitel: (t: string) => void
  onSkriv: () => void
  sparr: boolean
  mall: string
  /** Från startbladet på /verktyg/skapa-cv (?ladda=1): uppladdningen är redan uppfälld. */
  oppnaUppladdning?: boolean
}) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { uploadCV } = useProfile()
  const [ladda, setLadda] = useState(Boolean(oppnaUppladdning))

  useEffect(() => {
    // Fokus in i bladet, inte på fältet: tangentbordet ska inte fälla upp av sig självt.
    ref.current?.focus()
  }, [])

  const laddaUpp = async (fil: File, fas?: (f: 'uploading' | 'vision', l: string) => void) => {
    const ext = fil.name.toLowerCase().split('.').pop()
    const metod = ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf'
    capture('cv_start_val', { val: 'upp', titel: Boolean(titel.trim()) })
    capture('cv_eget_start', { method: metod, surface: 'byggare' })
    let nyttId: string | null = null
    let fannsRedan = false
    try {
      await uploadCV(fil, fil.name.split('.').slice(0, -1).join('.') || fil.name, fas, (cv) => {
        nyttId = cv.id
        fannsRedan = cv.fannsRedan === true
      })
    } catch (e) {
      capture('cv_eget_misslyckad', { method: metod, reason: 'fel', surface: 'byggare' })
      throw e
    }
    if (!nyttId) return
    capture('cv_eget_inlast', { method: metod, ok: true, sektioner_hittade: 0, surface: 'byggare' })
    const q = new URLSearchParams({ cv: nyttId, upp: '1', mall })
    if (titel.trim()) q.set('titel', titel.trim().slice(0, 80))
    // Full laddning: servern läser det tolkade CV:t och ritar arket.
    const url = `/dashboard/skapa-cv?${q.toString()}`
    if (fannsRedan) {
      // Samma CV fanns redan: zonen visar raden en stund innan det öppnas.
      window.setTimeout(() => window.location.assign(url), FANNS_REDAN_VANTAN)
      return { fannsRedan: true }
    }
    window.location.assign(url)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" data-rum="cv">
      <div aria-hidden className="absolute inset-0 bg-[rgba(7,26,28,.55)]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-r`}
        tabIndex={-1}
        data-startblad
        className="relative flex max-h-[88dvh] w-full flex-col overflow-y-auto rounded-t-3xl border-t border-kant bg-papper px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,.25)] outline-none sm:max-w-[520px] sm:rounded-3xl sm:border sm:pb-5 sm:pt-5"
      >
        <div aria-hidden className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full bg-kant-stark sm:hidden" />
        <h2 id={`${id}-r`} className="font-display text-2xl font-bold leading-tight text-ink-1">
          {START.rubrik}
        </h2>
        <p className="mt-1 text-sm text-ink-2">{START.under}</p>

        {sparr ? (
          <div className="mt-4 grid gap-2">
            <PaywallCard variant="cv-antal" onSecondary={() => router.push('/dashboard/profil/cv')} />
            <Link href="/dashboard/profil/cv" className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
              {START.minaCv}
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-[13px] font-medium text-ink-2">{START.titel}</span>
              <input
                value={titel}
                onChange={(e) => onTitel(e.target.value.slice(0, 80))}
                placeholder={START.titelPlats}
                autoComplete="organization-title"
                enterKeyHint="done"
                data-start-titel
                className="h-12 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none placeholder:text-ink-3 focus:border-ink-1"
              />
            </label>

            {ladda ? (
              <div className="grid gap-2">
                <CVUploadZone
                  onUpload={laddaUpp}
                  maxSizeMB={5}
                  // En inskannad PDF som avvisas: samma väg som knappen Skriv från början.
                  onSkriv={() => {
                    capture('cv_start_val', { val: 'skriv', titel: Boolean(titel.trim()) })
                    onSkriv()
                  }}
                />
                <button type="button" onClick={() => setLadda(false)} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
                  {START.stangUppladdning}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLadda(true)}
                aria-expanded={false}
                data-start-ladda
                className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-kant-stark bg-papper px-3 py-2.5 text-left hover:border-ink-1"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ton text-ton-ink">
                  <IkonUppladdning size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink-1">{START.ladda}</span>
                  <span className="block text-meta text-ink-3">{START.laddaUnder}</span>
                </span>
              </button>
            )}

            {ladda ? null : (
              <button
                type="button"
                onClick={() => {
                  capture('cv_start_val', { val: 'skriv', titel: Boolean(titel.trim()) })
                  onSkriv()
                }}
                data-start-skriv
                className={KNAPP_PRIMAR}
              >
                {START.skriv}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
