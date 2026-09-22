'use client'

/**
 * Prissidans spårväljare och tre paketkort
 * (docs/plan-paket-och-onboarding.md, Fas 2D avsnitt 2).
 *
 * Väljaren filtrerar aldrig bort ett kort. Den scrollar till rätt kort och
 * markerar det, så den som klickar CV ser sitt kort direkt utan att förlora
 * vad hon väljer bort.
 *
 * Utan JavaScript står alla tre korten kvar med Allt-kortet i sitt veckoläge,
 * eftersom vecka är förvald i PaketKort. Ingen besökare ser en tom sida.
 *
 * Knapparna: utloggad går till registreringen med paketet i adressen,
 * inloggad går raka vägen till kassan.
 *
 * Inloggningen läses i klienten och aldrig på servern. Sidan är CDN-cachad
 * ett dygn (reference_vercel_env_saknas), och en serverläsning av sessionen
 * hade gjort den dynamisk för varje besökare. Sidan ser likadan ut i båda
 * lägena, det är bara knappens destination som skiljer, så ingenting flyttar
 * sig när svaret kommer.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import PaketKort from '@/components/pricing/PaketKort'
import Segment from '@/components/shell/Segment'
import { SPAR_LAGEN, PR_SEKTIONER, PR_UPPSAGNING, type SparVal } from '@/components/pricing/paket-copy'
import { capture } from '@/lib/analytics/events'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import type { PlanKey } from '@/lib/plans/plans'

const KORT_ID: Record<SparVal, string> = {
  cv: 'paket-cv',
  tester: 'paket-tester',
  allt: 'paket-allt',
}

export default function PriserPaket() {
  const router = useRouter()
  const [spar, setSpar] = useState<SparVal | null>(null)
  const [busy, setBusy] = useState<PlanKey | null>(null)
  const [fel, setFel] = useState<string | null>(null)
  const [inloggad, setInloggad] = useState(false)
  const forsta = useRef(true)

  useEffect(() => {
    let levande = true
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (levande) setInloggad(Boolean(data.session))
      })
      .catch(() => {
        // Kan inte läsas: behandla som utloggad. Registreringen tar ändå
        // emot den som redan har ett konto.
      })
    return () => {
      levande = false
    }
  }, [])

  // Scrollningen sker i en effekt och inte i klickhanteraren, så att kortets
  // markering hinner målas innan sidan flyttar sig.
  useEffect(() => {
    if (forsta.current) {
      forsta.current = false
      return
    }
    if (!spar) return
    document.getElementById(KORT_ID[spar])?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [spar])

  const bytSpar = useCallback(
    (nytt: SparVal) => {
      capture('track_changed', { from: spar, to: nytt, surface: 'pricing_segment' })
      setSpar(nytt)
    },
    [spar]
  )

  const valj = useCallback(
    async (plan: PlanKey) => {
      capture('paywall_cta_clicked', {
        variant: 'onboarding_paket',
        surface: 'public_pricing',
        plan,
        cta: 'primary',
      })

      if (!inloggad) {
        router.push(`/registrera?paket=${plan}`)
        return
      }

      setBusy(plan)
      setFel(null)
      try {
        const res = await fetch('/api/stripe/create-plan-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, source: 'public_pricing' }),
        })
        const data = (await res.json()) as { url?: string; error?: string }
        if (data.url) {
          window.location.href = data.url
          return
        }
        setFel(data.error ?? 'Det gick inte att öppna kassan. Försök igen.')
      } catch {
        setFel('Det gick inte att öppna kassan. Försök igen.')
      } finally {
        setBusy(null)
      }
    },
    [inloggad, router]
  )

  const langdBytt = useCallback((plan: PlanKey) => {
    capture('plan_length_changed', { plan, surface: 'public' })
  }, [])

  return (
    <>
      <Segment
        className="mx-auto mt-6 max-w-sm"
        label="Vilket spår söker du på"
        value={spar ?? 'cv'}
        onChange={bytSpar}
        options={SPAR_LAGEN.map((l) => ({ value: l.value, label: l.label }))}
      />

      <h2 className="mt-8 text-sm font-medium text-ink-3">{PR_SEKTIONER.paket}</h2>

      <div className="mt-3 grid gap-4 sm:gap-6 lg:grid-cols-3">
        <PaketKort
          id={KORT_ID.cv}
          plan="cv_week"
          markerad={spar === 'cv'}
          busy={busy === 'cv_week'}
          onSelect={valj}
        />
        <PaketKort
          id={KORT_ID.tester}
          plan="test_week"
          markerad={spar === 'tester'}
          busy={busy === 'test_week'}
          onSelect={valj}
        />
        <PaketKort
          id={KORT_ID.allt}
          plan="all_week"
          lengths
          recommended
          markerad={spar === 'allt'}
          busy={busy !== null && busy.startsWith('all')}
          onSelect={valj}
          onLengthChange={langdBytt}
        />
      </div>

      {fel ? (
        <p role="alert" className="mt-4 text-sm text-fel">
          {fel}
        </p>
      ) : null}

      <p className="mt-6 flex items-start gap-2 text-sm leading-[22px] text-ink-2">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
        {PR_UPPSAGNING}
      </p>
    </>
  )
}
