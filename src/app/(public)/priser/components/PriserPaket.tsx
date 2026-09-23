'use client'

/**
 * Tre paket (docs/design/spec-prissida-2026-09-22.html, .valjare och .paket).
 *
 * Desktop: rubrik och ingress centrerade, tre kort i rad där Allt är något
 * bredare. Mobil: en eyebrow, korten numrerade "Paket 1 av 3" under
 * varandra, och en ankarrad till gratisnivån, funktionerna och hjälpredan.
 *
 * Knapparna: utloggad går till registreringen med paketet i adressen,
 * inloggad går till spårvalet med paketet förvalt. Inloggningen läses i
 * klienten och aldrig på servern, eftersom sidan är CDN-cachad ett dygn
 * (reference_vercel_env_saknas). Sidan ser likadan ut i båda lägena, det är
 * bara knappens destination som skiljer, så ingenting flyttar sig.
 */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import PaketKort from '@/components/pricing/PaketKort'
import {
  PAKET_IDS,
  PAKET_PLAN,
  VALJARE,
  borjaKnapp,
  planForLangd,
  type PaketId,
} from '@/components/pricing/paket-copy'
import { capture } from '@/lib/analytics/events'
import { useAuth } from '@/contexts/AuthContext'
import type { PlanKey, PlanLength } from '@/lib/plans/plans'

export default function PriserPaket() {
  const router = useRouter()
  // Ur AuthContext, som bara laddar Supabase-klienten när det finns en
  // sessionscookie. Prissidan och startsidan betalade annars klienten för
  // varje besökare.
  const { user } = useAuth()
  const inloggad = Boolean(user)
  const [busy, setBusy] = useState<PlanKey | null>(null)
  const [alltLangd, setAlltLangd] = useState<PlanLength>('vecka')

  const valj = useCallback(
    (plan: PlanKey) => {
      capture('paywall_cta_clicked', {
        variant: 'onboarding_paket',
        surface: 'public_pricing',
        plan,
        cta: 'primary',
      })
      setBusy(plan)
      // Ångerrättssamtycket lämnas på köpsteget, som bär både kryssrutan och
      // knappen. Prissidan öppnar därför aldrig kassan själv.
      router.push(
        inloggad ? `/dashboard/valj-spar?paket=${plan}` : `/registrera?paket=${plan}`
      )
    },
    [inloggad, router]
  )

  const planFor = (paket: PaketId): PlanKey =>
    paket === 'allt' ? planForLangd(alltLangd) : PAKET_PLAN[paket]

  return (
    <section aria-labelledby="priser-paket" className="mt-8 lg:mt-[72px]">
      <div className="text-center">
        <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3 lg:hidden">
          {VALJARE.eyebrowMobil}
        </p>
        <h2
          id="priser-paket"
          className="hidden font-display text-[40px] font-bold leading-[44px] tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:block"
        >
          {VALJARE.h2}
        </h2>
        <p className="mt-2 hidden text-base text-ink-2 lg:block">{VALJARE.ingress}</p>
      </div>

      <div className="mt-3 grid gap-3 lg:mt-8 lg:grid-cols-[1fr_1fr_1.12fr] lg:items-stretch lg:gap-5">
        {PAKET_IDS.map((paket, i) => (
          <PaketKort
            key={paket}
            id={`paket-${paket}`}
            paket={paket}
            nummer={i + 1}
            langd={paket === 'allt' ? alltLangd : undefined}
            onLangd={(langd, plan) => {
              setAlltLangd(langd)
              capture('plan_length_changed', { plan, surface: 'public' })
            }}
            knapp={{
              text: borjaKnapp(paket),
              onClick: () => valj(planFor(paket)),
              disabled: busy !== null,
            }}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] text-ink-3 lg:hidden">
        {VALJARE.ankare.map((a, i) => (
          <span key={a.href}>
            {i > 0 ? ' · ' : ''}
            <a href={a.href} className="underline decoration-kant-stark underline-offset-4">
              {a.text} ↓
            </a>
          </span>
        ))}
      </p>
    </section>
  )
}
