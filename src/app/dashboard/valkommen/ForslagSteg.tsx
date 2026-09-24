'use client'

/**
 * Steg 3, förslaget (docs/design/profil-registrering-2026-09-24.html, Del B
 * steg 3). Ett paketkort i spårvalets form, en ruta med vad gratis ger för
 * just valet och "Jämför alla tre paketen". Foten har två knappar i samma
 * storlek: "Köp {paket}, {pris}" i ink och "Börja gratis" med kant. Krysset
 * gör samma sak som Börja gratis.
 *
 * Båda sparar spåret (och valet) via /api/onboarding/track. Köp går till
 * köpsteget som finns, Börja gratis till landningen för valet.
 *
 * Mätregel (saas-lead 2026-09-24): fyra veckor efter deploy, över 85 procent
 * Börja gratis och under 5 procent till kassan byter primärknapp, inget annat.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import SparKort from '@/components/pricing/SparKort'
import { IlluScenAllt, IlluScenCv, IlluScenMatris } from '@/components/illustrations/PriserScener'
import { capture } from '@/lib/analytics/events'
import { paketNamn } from '@/lib/plans/plans'
import { TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'
import { INTENTS, type SignupEntry, type SignupIntent } from '@/components/registrering/intent'
import { STEG3 } from '@/components/registrering/registrering-copy'

export interface ForslagStegProps {
  intent: SignupIntent
  fornamn: string | null
  entry?: SignupEntry
}

const SCEN = {
  cv: IlluScenCv,
  brev: IlluScenCv,
  tester: IlluScenMatris,
  intervju: IlluScenMatris,
  jobb: IlluScenAllt,
} as const

/** Köpstegets adress för valets paket. */
export function kopHref(intent: SignupIntent): string {
  return `${TRACK_CHOICE_PATH}?paket=${INTENTS[intent].plan}&steg=kop`
}

export default function ForslagSteg({ intent, fornamn, entry = 'direkt' }: ForslagStegProps) {
  const router = useRouter()
  const { plan, track, landning } = INTENTS[intent]
  const copy = STEG3.forslag[intent]
  const [busy, setBusy] = useState<'kop' | 'gratis' | null>(null)

  const matt = useRef(false)
  useEffect(() => {
    if (matt.current) return
    matt.current = true
    capture('signup_flow_viewed', { step: 'forslag', entry, preset_intent: intent })
    capture('pricing_viewed', { trigger: 'cta', surface: 'signup_forslag', plan, intent })
  }, [entry, intent, plan])

  const valj = useCallback(
    async (vag: 'purchase' | 'free') => {
      if (busy) return
      setBusy(vag === 'purchase' ? 'kop' : 'gratis')
      try {
        const res = await fetch('/api/onboarding/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track, intent }),
        })
        if (!res.ok) throw new Error('spara')
      } catch {
        // Spåret kunde inte sparas. Vi släpper ändå vidare: valet får aldrig
        // stoppa den som vill börja, och betalväggarna fungerar utan spår.
      }
      capture('track_selected', { track, surface: 'signup_forslag', intent: vag, onboarding_intent: intent })
      const destination = vag === 'purchase' ? kopHref(intent) : landning
      capture('signup_landed', { destination, intent, claimed: false, via: 'forslag' })
      router.push(destination)
    },
    [busy, track, intent, landning, router]
  )

  return (
    <FlowShell
      title={STEG3.topp}
      step={3}
      totalSteps={3}
      onExit={() => void valj('free')}
      utanTillbaka
      smal
      primaryLabel={STEG3.kop(plan)}
      onPrimary={() => void valj('purchase')}
      primaryBusy={busy === 'kop'}
      busyLabel={STEG3.busy}
      footerSecondarySameSize
      footerSecondary={
        <button
          type="button"
          onClick={() => void valj('free')}
          disabled={busy !== null}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
        >
          {busy === 'gratis' ? STEG3.busy : STEG3.borjaGratis}
        </button>
      }
    >
      <div>
        <p className="text-steg uppercase text-ink-3">{STEG3.steg}</p>
        <h2 className="mt-1 font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1">
          {copy.rubrik(fornamn)}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.under}</p>

        <div className="mt-4">
          <SparKort
            Scen={SCEN[intent]}
            ink={intent === 'jobb'}
            eyebrow={STEG3.eyebrow}
            eyebrowTon="dampad"
            rubrik={copy.kortRubrik}
            namn={paketNamn(plan)}
            duFar={copy.rader}
            prisText={copy.prisText}
            pris={STEG3.pris(plan)}
          />
        </div>

        <section className="mt-3 rounded-xl border border-kant bg-panel px-4 py-3" aria-label={STEG3.gratisEtikett}>
          <p className="text-steg uppercase text-ink-3">{STEG3.gratisEtikett}</p>
          <ul className="mt-1.5 grid gap-1 text-[13px] leading-[18px] text-ink-2">
            {copy.gratis.map((rad) => (
              <li key={rad} className="flex gap-2">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden="true">
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                <span>{rad}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/dashboard/profil/prenumeration"
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
        >
          {STEG3.jamfor}
        </Link>
      </div>
    </FlowShell>
  )
}
