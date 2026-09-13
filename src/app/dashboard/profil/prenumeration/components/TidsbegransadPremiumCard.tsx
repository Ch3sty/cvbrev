'use client'

/**
 * Tillstånd två på prenumerationssidan (A8 i docs/plan-konvertering.md):
 * premium_until i framtiden utan prenumeration. Reverse trial, engångsköp
 * och admin-tilldelad premium hamnar här.
 *
 * Ingen uppsägningsknapp: det finns inget att säga upp. I stället "Förläng"
 * som öppnar produktvalet, och historiken över köpta dagar.
 */

import { useEffect, useState } from 'react'
import UpgradeSheet from '@/components/paywall/UpgradeSheet'
import { IlluTidKvar } from '@/components/illustrations/SubscriptionIllustrations'

interface Grant {
  id: string
  days: number
  source: string | null
  granted_at: string
  premium_until_after: string | null
}

const SOURCE_LABEL: Record<string, string> = {
  signup_trial: 'Fem dagar Premium vid registrering',
  oauth_signup_trial: 'Fem dagar Premium vid registrering',
  onetime_1d: 'Dagspass, 1 dygn',
  onetime_7d: 'Jobbsökarveckan, 7 dagar',
  admin: 'Tilldelad av oss',
  onboarding_completion: 'Belöning för avklarad onboarding',
  guest_invitation: 'Inbjudan från en vän',
}

function labelFor(grant: Grant): string {
  if (grant.source && SOURCE_LABEL[grant.source]) return SOURCE_LABEL[grant.source]
  return `${grant.days} dagar Premium`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function TidsbegransadPremiumCard({
  premiumUntil,
  premiumSource,
}: {
  premiumUntil: Date
  premiumSource: string | null
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [grants, setGrants] = useState<Grant[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/subscription/grants')
      .then((res) => (res.ok ? res.json() : { grants: [] }))
      .then((data) => {
        if (!cancelled) setGrants(Array.isArray(data?.grants) ? data.grants : [])
      })
      .catch(() => {
        // Historiken är trevlig att ha, inte nödvändig. Tyst fallback.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const now = new Date()
  const msLeft = premiumUntil.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
  const isTrial = premiumSource === 'signup_trial' || premiumSource === 'oauth_signup_trial'

  // Mätaren fylls mot en referensperiod, så den säger något även för långa
  // engångsköp. Trial jämförs mot fem dagar, resten mot trettio.
  const referenceDays = isTrial ? 5 : 30
  const fraction = Math.min(1, daysLeft / referenceDays)

  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="self-center text-ink-1 sm:self-start" aria-hidden="true">
          <IlluTidKvar size={96} fraction={fraction} />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-kort text-ink-1">
            Premium till och med {formatDate(premiumUntil.toISOString())}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {daysLeft === 0
              ? 'Sista dygnet. Efter det går kontot tillbaka till gratisnivån.'
              : `${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar. Sedan går kontot tillbaka till gratisnivån av sig självt.`}
          </p>
          <p className="mt-1 text-sm text-ink-2">
            Du har ingen prenumeration, så ingenting dras automatiskt och det finns inget att säga
            upp.
          </p>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover sm:w-auto"
          >
            Förläng
          </button>
        </div>
      </div>

      {grants.length > 0 ? (
        <div className="mt-6 border-t border-kant pt-4">
          <h3 className="mb-2 text-sm font-medium text-ink-3">Din historik</h3>
          <ul className="divide-y divide-kant">
            {grants.map((grant) => (
              <li
                key={grant.id}
                className="flex items-baseline justify-between gap-3 py-2 text-sm"
              >
                <span className="min-w-0 text-ink-2">{labelFor(grant)}</span>
                <span className="whitespace-nowrap text-meta tabular-nums text-ink-3">
                  {formatDate(grant.granted_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <UpgradeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        order="month-first"
        source="prenumeration:tidsbegransad"
      />
    </section>
  )
}
