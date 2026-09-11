'use client'

/**
 * Mallväljaren på /cv-mallar/start (docs/plan-konvertering.md, C7).
 *
 * Ingen AI och inget serveranrop: besökaren väljer mall, vi sparar valet och
 * skickar dem till registreringen. CV-utkastet skapas när kontot finns.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import { storePendingCvStart } from '@/lib/letters/claim-draft-client'

export interface StartTemplate {
  id: string
  name: string
  description: string
  imagePath: string
  tier: 'free' | 'premium'
}

interface StartMallvalProps {
  templates: StartTemplate[]
  /** Mallen som förväljs, oftast yrkets rekommenderade gratismall. */
  defaultTemplateId: string
  yrkeSlug?: string
  yrkeLabel?: string
}

export default function StartMallval({
  templates,
  defaultTemplateId,
  yrkeSlug,
  yrkeLabel,
}: StartMallvalProps) {
  const [selected, setSelected] = useState(defaultTemplateId)

  useEffect(() => {
    capture('sample_started', { kind: 'cv', yrke_slug: yrkeSlug, cluster: 'cv' })
  }, [yrkeSlug])

  const value = `${yrkeSlug ?? ''}:${selected}`
  const registerHref = `/register?cv_start=${encodeURIComponent(value)}`

  const ctaLabel = yrkeLabel
    ? `Använd denna mall som ${yrkeLabel.toLowerCase()}`
    : 'Använd denna mall'

  return (
    <div>
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
        role="radiogroup"
        aria-label="Välj CV-mall"
      >
        {templates.map((template) => {
          const isSelected = template.id === selected
          return (
            <li key={template.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(template.id)}
                className={`group w-full overflow-hidden rounded-xl border text-left transition-colors ${
                  isSelected
                    ? 'border-orange-400'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="relative aspect-[3/4] bg-neutral-50">
                  <img
                    src={template.imagePath}
                    alt={`Förhandsvisning av CV-mallen ${template.name}`}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                  {isSelected ? (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-neutral-900 leading-tight">
                    {template.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600 leading-tight">
                    {template.tier === 'free' ? 'Gratis' : 'Ingår i Premium'}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          href={registerHref}
          data-cta="cv-start-continue"
          onClick={() => {
            storePendingCvStart(value)
            capture('signup_gate_shown', { kind: 'cv', cluster: 'cv' })
            capture('signup_started', { cluster: 'cv', source_page: '/cv-mallar/start' })
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="text-xs text-neutral-500">
          Inget kreditkort · Avsluta när du vill
        </p>
      </div>
    </div>
  )
}
