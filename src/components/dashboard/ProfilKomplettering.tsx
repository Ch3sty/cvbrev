'use client'

/**
 * Kortet "Komplettera profilen" (docs/plan-inloggat-saljflode.md, punkt 6).
 *
 * Visas i tillstånd B och C, under statusraden, bara när något saknas.
 * Max tre fält, inline-redigering, ingen egen sida och ingen modal.
 * "Inte nu" döljer kortet i sju dagar.
 *
 * Principen: fråga aldrig innan vi levererat något. Punkt 2 fyller telefon
 * och ort automatiskt från uppladdat CV, så det här kortet fångar bara det
 * parsern missade.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { IlluProfilKomplettering } from '@/components/illustrations/ProfileIllustrations'

const SNOOZE_KEY = 'jc_profil_komplettering_snoozed_at'
const SNOOZE_DAYS = 7

/**
 * DowngradedNotice äger samma yta första gången den visas. En säljyta och en
 * kompletteringsfråga samtidigt är två uppmaningar på samma skärm, så vi står
 * tillbaka tills nedgraderingskortet är avfärdat.
 * Nyckeln ägs av DowngradedNotice, vi läser den bara.
 */
const DOWNGRADED_KEY = 'jc_downgraded_notice_dismissed'

/** Trial-källor, speglar DowngradedNotice. */
const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial']

type FieldKey = 'full_name' | 'phone' | 'location'

interface FieldDef {
  key: FieldKey
  label: string
  placeholder: string
  inputMode?: 'tel' | 'text'
  autoComplete: string
}

const FIELDS: FieldDef[] = [
  { key: 'full_name', label: 'Namn', placeholder: 'Anna Lindqvist', autoComplete: 'name' },
  { key: 'phone', label: 'Telefon', placeholder: '070-123 45 67', inputMode: 'tel', autoComplete: 'tel' },
  { key: 'location', label: 'Ort', placeholder: 'Göteborg', autoComplete: 'address-level2' },
]

/**
 * Saknat värde: null, tom sträng eller triggerns gamla platshållare.
 * Efter punkt 3 skriver triggern NULL, men befintliga konton har
 * fortfarande strängen "Ej angivet" sparad.
 */
function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value !== 'string') return true
  const trimmed = value.trim()
  return trimmed === '' || trimmed.toLowerCase() === 'ej angivet'
}

interface ProfilKompletteringProps {
  className?: string
}

export default function ProfilKomplettering({ className }: ProfilKompletteringProps) {
  const [missing, setMissing] = useState<FieldKey[] | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(true)

  // Snooze läses först efter mount, annars skiljer sig server och klient.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SNOOZE_KEY)
      if (!raw) {
        setDismissed(false)
        return
      }
      const at = Number(raw)
      const expired =
        Number.isNaN(at) || Date.now() - at > SNOOZE_DAYS * 24 * 60 * 60 * 1000
      setDismissed(!expired)
    } catch {
      setDismissed(false)
    }
  }, [])

  /**
   * Nedgraderingskortet går först, men bara för den som faktiskt kan se det.
   * Villkoret speglar DowngradedNotice: trial-källa, utgången premium inom
   * fjorton dagar, gratisnivå och inte redan avfärdat.
   */
  const [downgradedPending, setDowngradedPending] = useState(false)

  useEffect(() => {
    if (dismissed) return
    let cancelled = false

    const load = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('profiles')
          .select(
            'full_name, phone, location, premium_source, premium_until, subscription_tier'
          )
          .eq('id', user.id)
          .single()

        if (cancelled || !data) return

        const row = data as Record<string, unknown>

        // Samma villkor som DowngradedNotice. Kan den visas går den först.
        let noticeCouldShow = false
        try {
          const noticeDismissed = window.localStorage.getItem(DOWNGRADED_KEY) === '1'
          const source = typeof row.premium_source === 'string' ? row.premium_source : ''
          const until = row.premium_until ? new Date(row.premium_until as string) : null
          const daysSince = until
            ? (Date.now() - until.getTime()) / (24 * 60 * 60 * 1000)
            : Infinity
          noticeCouldShow =
            !noticeDismissed &&
            row.subscription_tier === 'free' &&
            TRIAL_SOURCES.includes(source) &&
            daysSince >= 0 &&
            daysSince <= 14
        } catch {
          noticeCouldShow = false
        }
        setDowngradedPending(noticeCouldShow)

        const missingKeys = FIELDS.filter((f) => isMissing(row[f.key])).map((f) => f.key)
        setMissing(missingKeys)
      } catch {
        // Kortet är en hjälp, inte en funktion. Fel tystas.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [dismissed])

  const snooze = () => {
    try {
      window.localStorage.setItem(SNOOZE_KEY, String(Date.now()))
    } catch {
      /* privat läge: kortet kommer tillbaka nästa besök */
    }
    setDismissed(true)
  }

  const save = async () => {
    const payload: Record<string, string> = {}
    for (const key of missing ?? []) {
      const v = (values[key] ?? '').trim()
      if (v) payload[key] = v
    }
    if (Object.keys(payload).length === 0) return

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Kunde inte spara.')
      }
      // Sparade fält räknas inte längre som saknade.
      const remaining = (missing ?? []).filter((k) => !payload[k])
      setMissing(remaining)
      if (remaining.length === 0) setDismissed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunde inte spara.')
    } finally {
      setSaving(false)
    }
  }

  if (dismissed || downgradedPending) return null
  if (missing === null || missing.length === 0) return null

  const count = missing.length
  const heading =
    count === 1
      ? 'En uppgift saknas i brevhuvudet'
      : count === 2
        ? 'Två uppgifter saknas i brevhuvudet'
        : 'Tre uppgifter saknas i brevhuvudet'

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 ${className ?? ''}`}
      aria-label={heading}
    >
      <div className="flex items-start gap-4">
        <span className="hidden sm:block shrink-0 text-neutral-900" aria-hidden="true">
          <IlluProfilKomplettering size={48} />
        </span>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
            {heading}
          </h2>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
            Brev och CV ser mer genomarbetade ut med fullständiga
            kontaktuppgifter. Rekryterare ska kunna nå dig utan att leta.
          </p>

          <div className="mt-4 space-y-3">
            {FIELDS.filter((f) => missing.includes(f.key)).map((field) => (
              <div
                key={field.key}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
              >
                <label
                  htmlFor={`profil-${field.key}`}
                  className="text-sm text-neutral-600 sm:w-20 shrink-0"
                >
                  {field.label}
                </label>
                <input
                  id={`profil-${field.key}`}
                  type="text"
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="flex-1 min-w-0 h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-red-700 mt-3">{error}</p> : null}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-60 w-full sm:w-auto"
            >
              {saving ? 'Sparar' : 'Spara'}
            </button>
            <button
              type="button"
              onClick={snooze}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
            >
              Inte nu
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
