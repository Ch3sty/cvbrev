'use client'

/**
 * "Prova också" (docs/design/profil-registrering-2026-09-24.html, Bredden
 * punkt 3): hemskärmens rad med en oprövad funktion ur det andra området än
 * det hon valde vid registreringen. CV-valet får logiktestet, testvalet
 * CV-analysen. Raden byts när funktionen använts (useUnusedFeatures).
 *
 * Mäts med next_action_clicked och outside_intent, så att andelen som provar
 * något utanför sitt val går att följa.
 */

import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { featureUtanforVal, type FeatureSlug } from '@/hooks/useUnusedFeatures'
import { PROVA_OCKSA } from '@/components/registrering/registrering-copy'
import type { SignupIntent } from '@/components/registrering/intent'

export default function ProvaOcksa({ slug, intent }: { slug: FeatureSlug['slug']; intent: SignupIntent }) {
  if (slug !== 'tester' && slug !== 'cv-analys') return null
  const c = PROVA_OCKSA[slug]
  return (
    <section aria-label={PROVA_OCKSA.etikett}>
      <p className="mb-2 text-sm font-medium leading-5 text-ink-3">{PROVA_OCKSA.etikett}</p>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-kant bg-panel px-4 py-3">
        <span className="min-w-0">
          <b className="block text-sm font-semibold leading-5 text-ink-1">{c.rubrik}</b>
          <small className="mt-0.5 block text-[13px] leading-[18px] text-ink-3">{c.text}</small>
        </span>
        <Link
          href={c.href}
          onClick={() =>
            capture('next_action_clicked', {
              kind: 'feature',
              surface: 'hem',
              slug,
              outside_intent: featureUtanforVal(slug, intent),
            })
          }
          className="inline-flex min-h-11 flex-none items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
        >
          {PROVA_OCKSA.knapp}
        </Link>
      </div>
    </section>
  )
}
