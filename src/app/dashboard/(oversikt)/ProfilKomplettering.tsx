'use client'

/**
 * Kortet "Komplettera profilen" (docs/plan-inloggat-saljflode.md, punkt 6).
 *
 * Visas i tillstånd B och C, bara när något saknas. Max tre fält,
 * inline-redigering, ingen egen sida och ingen modal. "Inte nu" döljer
 * kortet i sju dagar. Panel med insunkna fält och en ink-knapp.
 *
 * Principen: fråga aldrig innan vi levererat något. Telefon och ort fylls
 * från uppladdat CV, så det här kortet fångar bara det parsern missade.
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { isTrialSource } from '@/lib/premium/trial'

const SNOOZE_KEY = 'jc_profil_komplettering_snoozed_at'
const SNOOZE_DAYS = 7

/**
 * DowngradedNotice äger samma yta första gången den visas. Nyckeln ägs av
 * DowngradedNotice, vi läser den bara.
 */
const DOWNGRADED_KEY = 'jc_downgraded_notice_dismissed'

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

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value !== 'string') return true
  const trimmed = value.trim()
  return trimmed === '' || trimmed.toLowerCase() === 'ej angivet'
}

const INPUT =
  'h-11 w-full min-w-0 flex-1 rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 transition-colors focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'
const LINK = 'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

interface ProfilKompletteringProps {
  className?: string
}

export default function ProfilKomplettering({ className }: ProfilKompletteringProps) {
  const [missing, setMissing] = useState<FieldKey[] | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SNOOZE_KEY)
      if (!raw) {
        setDismissed(false)
        return
      }
      const at = Number(raw)
      const expired = Number.isNaN(at) || Date.now() - at > SNOOZE_DAYS * 24 * 60 * 60 * 1000
      setDismissed(!expired)
    } catch {
      setDismissed(false)
    }
  }, [])

  const [downgradedPending, setDowngradedPending] = useState(false)

  const { user } = useAuth()
  const userId = user?.id ?? null
  const { summary } = useDashboardData()
  const summaryProfile = summary?.profile ?? null

  useEffect(() => {
    if (dismissed) return
    if (!userId || !summaryProfile) return
    let cancelled = false

    const load = async () => {
      try {
        const supabase = getSupabaseClient()

        const { data } = await supabase.from('profiles').select('phone, location').eq('id', userId).single()

        if (cancelled || !data) return

        const row = {
          ...(summaryProfile as Record<string, unknown>),
          ...(data as Record<string, unknown>),
        } as Record<string, unknown>

        let noticeCouldShow = false
        try {
          const noticeDismissed = window.localStorage.getItem(DOWNGRADED_KEY) === '1'
          const source = typeof row.premium_source === 'string' ? row.premium_source : ''
          const until = row.premium_until ? new Date(row.premium_until as string) : null
          const daysSince = until ? (Date.now() - until.getTime()) / (24 * 60 * 60 * 1000) : Infinity
          noticeCouldShow =
            !noticeDismissed &&
            row.subscription_tier === 'free' &&
            isTrialSource(source) &&
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
  }, [dismissed, userId, summaryProfile])

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
    <section className={`rounded-xl border border-kant bg-panel p-4 sm:p-5 ${className ?? ''}`} aria-label={heading}>
      <h2 className="text-kort text-ink-1">{heading}</h2>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">
        Brev och CV ser mer genomarbetade ut med fullständiga kontaktuppgifter. Rekryterare ska
        kunna nå dig utan att leta.
      </p>

      <div className="mt-4 space-y-3">
        {FIELDS.filter((f) => missing.includes(f.key)).map((field) => (
          <div key={field.key} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor={`profil-${field.key}`} className="shrink-0 text-sm text-ink-2 sm:w-20">
              {field.label}
            </label>
            <input
              id={`profil-${field.key}`}
              type="text"
              inputMode={field.inputMode}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              className={INPUT}
            />
          </div>
        ))}
      </div>

      {error ? <p className="mt-3 text-meta text-fel">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:opacity-60 sm:w-auto"
        >
          {saving ? 'Sparar' : 'Spara'}
        </button>
        <button type="button" onClick={snooze} className={LINK}>
          Inte nu
        </button>
        <Link href="/dashboard/profil#cv" className={LINK}>
          Se hela profilen
        </Link>
      </div>
    </section>
  )
}
