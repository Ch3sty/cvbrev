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
    <section className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        <span className="shrink-0 text-neutral-900 self-center sm:self-start" aria-hidden="true">
          <IlluTidKvar size={96} fraction={fraction} />
        </span>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            Premium till och med {formatDate(premiumUntil.toISOString())}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            {daysLeft === 0
              ? 'Sista dygnet. Efter det går kontot tillbaka till gratisnivån.'
              : `${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar. Sedan går kontot tillbaka till gratisnivån av sig självt.`}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            Du har ingen prenumeration, så ingenting dras automatiskt och det finns inget att säga
            upp.
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
            >
              Förläng
            </button>
          </div>
        </div>
      </div>

      {grants.length > 0 ? (
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-900 mb-3">Din historik</h3>
          <ul className="space-y-2">
            {grants.map((grant) => (
              <li
                key={grant.id}
                className="flex items-baseline justify-between gap-3 text-sm border-b border-neutral-100 last:border-0 pb-2 last:pb-0"
              >
                <span className="text-neutral-700 min-w-0">{labelFor(grant)}</span>
                <span className="text-neutral-500 tabular-nums whitespace-nowrap">
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
