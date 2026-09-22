'use client'

/**
 * Brevflödet utan konto (docs/plan-konvertering.md, C6).
 *
 * Besökaren fyller i tjänst, arbetsgivare och sin erfarenhet, får ett brev
 * skrivet, ser första stycket och möts sedan av gaten. Resten av texten
 * finns bara på servern tills någon registrerat sig.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import { storePendingDraft } from '@/lib/letters/claim-draft-client'
import {
  IlluBlurGate,
  IlluUtkastKlart,
  StepIndicatorIcons,
} from '@/components/illustrations/StartFlowIllustrations'

const MIN_EXPERIENCE = 200

const STEPS = [
  { label: 'Tjänsten', hint: 'Vad heter rollen du söker?' },
  { label: 'Arbetsgivaren', hint: 'Vem söker du till?' },
  { label: 'Din erfarenhet', hint: 'Vad har du gjort som är relevant?' },
]

interface DraftResult {
  draftToken: string
  previewParagraph: string
  blurredLineCount: number
  expiresAt: string
}

interface StartFlowProps {
  /** Förifylld roll från ?yrke=. Tom sträng när slugen är okänd. */
  initialRole: string
  yrkeSlug?: string
  /** Yrkets visningsnamn, för rubrik och CTA. */
  yrkeLabel?: string
}

export default function StartFlow({ initialRole, yrkeSlug, yrkeLabel }: StartFlowProps) {
  const [role, setRole] = useState(initialRole)
  const [employer, setEmployer] = useState('')
  const [experience, setExperience] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [showJobAd, setShowJobAd] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftResult | null>(null)

  useEffect(() => {
    capture('sample_started', { kind: 'letter', yrke_slug: yrkeSlug, cluster: 'letter' })
  }, [yrkeSlug])

  useEffect(() => {
    if (draft) {
      storePendingDraft(draft.draftToken)
      capture('sample_completed', { kind: 'letter', yrke_slug: yrkeSlug, cluster: 'letter' })
      capture('signup_gate_shown', { kind: 'letter', cluster: 'letter' })
    }
  }, [draft, yrkeSlug])

  const canSubmit =
    role.trim().length > 0 &&
    employer.trim().length > 0 &&
    experience.trim().length >= MIN_EXPERIENCE &&
    !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    setRegisterHref(null)

    try {
      const res = await fetch('/api/public/letter-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim(),
          employer: employer.trim(),
          experience: experience.trim(),
          jobAd: jobAd.trim() || undefined,
          yrkeSlug,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Något gick fel. Försök igen.')
        if (typeof data.registerHref === 'string') setRegisterHref(data.registerHref)
        return
      }

      setDraft(data as DraftResult)
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  if (draft) {
    return <DraftGate draft={draft} yrkeLabel={yrkeLabel ?? role} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-8 grid grid-cols-3 gap-3">
        {STEPS.map((step, i) => {
          const Icon = StepIndicatorIcons[i]
          return (
            <li key={step.label} className="flex items-start gap-2">
              <Icon size={24} className="mt-0.5 flex-shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">
                  {step.label}
                </p>
                <p className="text-xs text-neutral-600 leading-tight mt-0.5">{step.hint}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          label="Tjänsten du söker"
          value={role}
          onChange={setRole}
          placeholder="Till exempel Butikssäljare"
        />

        <Field
          label="Arbetsgivare"
          value={employer}
          onChange={setEmployer}
          placeholder="Till exempel ICA Maxi Haninge"
        />

        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-semibold text-neutral-900 mb-1.5"
          >
            Din erfarenhet
          </label>
          <p className="text-sm text-neutral-600 mb-2">
            Skriv fritt om vad du gjort, vad du är bra på och varför du vill ha jobbet.
            Ju mer konkret du är, desto bättre blir brevet.
          </p>
          <textarea
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <p className="mt-1.5 text-xs text-neutral-500 tabular-nums">
            {experience.trim().length} av minst {MIN_EXPERIENCE} tecken
          </p>
        </div>

        {showJobAd ? (
          <div>
            <label
              htmlFor="jobAd"
              className="block text-sm font-semibold text-neutral-900 mb-1.5"
            >
              Jobbannonsen (valfritt)
            </label>
            <textarea
              id="jobAd"
              value={jobAd}
              onChange={(e) => setJobAd(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowJobAd(true)}
            className="text-sm font-semibold text-orange-700 hover:text-orange-800 underline decoration-orange-300"
          >
            Klistra in jobbannonsen också
          </button>
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
            {registerHref ? (
              <Link
                href={registerHref}
                className="mt-2 inline-block text-sm font-semibold text-red-800 underline"
              >
                Skapa ett gratiskonto
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          data-cta="start-flow-generate"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
        >
          {loading ? 'Skriver ditt brev…' : 'Skriv mitt brev'}
          {loading ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-neutral-900 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
      />
    </div>
  )
}

/**
 * Gaten. Första stycket i klartext, resten som suddade platshållare.
 * Vi blurrar aldrig riktig text med CSS: raderna nedanför är tomma element,
 * själva brevet ligger kvar på servern.
 */
function DraftGate({ draft, yrkeLabel }: { draft: DraftResult; yrkeLabel: string }) {
  const registerHref = `/register?draft=${encodeURIComponent(draft.draftToken)}`

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex justify-center">
        <IlluUtkastKlart size={160} className="text-neutral-700" />
      </div>

      <article className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800">
          {draft.previewParagraph}
        </p>

        <div className="mt-5 space-y-2.5" aria-hidden="true">
          {Array.from({ length: draft.blurredLineCount }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded bg-neutral-200"
              style={{ width: `${72 + ((i * 13) % 24)}%`, opacity: 0.55 }}
            />
          ))}
        </div>
        <p className="sr-only">
          Du ser resten av brevet när du skapat ett konto.
        </p>
      </article>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <IlluBlurGate size={96} className="hidden flex-shrink-0 text-neutral-700 sm:block" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-neutral-900 mb-1.5">
              Ditt brev är klart
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 mb-4">
              Skapa ett gratiskonto så får du hela brevet, och vi sparar det åt dig.
              Vill du ladda ner det som PDF eller Word ingår det i CV-veckan.
            </p>
            <Link
              href={registerHref}
              data-cta="start-flow-gate"
              onClick={() =>
                capture('signup_started', { cluster: 'letter', source_page: '/skapa-brev/start' })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Skapa konto och läs brevet
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-xs text-neutral-500">
              Inget kreditkort · Avsluta när du vill
            </p>
          </div>
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-neutral-500">
        Utkastet för {yrkeLabel.toLowerCase()} sparas i sju dagar.
      </p>
    </div>
  )
}
