'use client'

/**
 * E-post i CV och brev (2026-10-10): en diskret rad nära nedladdnings- och
 * genereringsknapparna som visar vilken adress dokumentet får. "Ändra"
 * fäller ut ett fält på plats, så att ett osparat brev eller ett valt CV
 * ligger kvar. Samma fält finns i profilen under Överst i ditt CV.
 *
 * Adressen läses ur dashboardens delade profil (summary.profile) och sparas
 * via /api/profile/contact, som validerar och mäter. Efter sparning hämtas
 * den delade datan om, så att alla rader och profilen visar samma adress.
 */

import { useState } from 'react'
import StatusRow from '@/components/shell/StatusRow'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { arGiltigEpost, dokumentEpost, epostForCv, kontoEpost, EPOST_MAX } from '@/lib/profile/dokumentEpost'
import { DOKUMENT_EPOST } from '@/lib/profile/dokumentEpost-copy'

const FALT =
  'block h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 aria-[invalid=true]:border-fel-kant'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:opacity-40'

export default function DokumentEpostRad({
  dokument,
  cvEpost,
  className,
}: {
  /** Styr etiketten: "E-post i CV:t" eller "E-post i brevet". */
  dokument: 'cv' | 'brev'
  /**
   * E-postfältet i CV-datan, om det finns. Samma regel som PDF:en
   * (epostForCv): en adress användaren skrivit i CV-byggaren vinner.
   */
  cvEpost?: string | null
  className?: string
}) {
  const { summary, refresh } = useDashboardData()
  const profil = (summary?.profile as { contact_email?: string | null; email?: string | null } | null) ?? null
  const profilEpost = dokumentEpost(profil)
  const konto = kontoEpost(profil)
  const visad = dokument === 'cv' ? epostForCv(cvEpost, profil) : profilEpost

  const [oppen, setOppen] = useState(false)
  const [varde, setVarde] = useState('')
  const [fel, setFel] = useState<string | null>(null)
  const [sparar, setSparar] = useState(false)

  if (!visad) return null

  const oppna = () => {
    setVarde(profilEpost)
    setFel(null)
    setOppen(true)
  }

  const spara = async () => {
    const t = varde.trim()
    if (t && !arGiltigEpost(t)) {
      setFel(DOKUMENT_EPOST.fel)
      return
    }
    setSparar(true)
    setFel(null)
    try {
      const res = await fetch('/api/profile/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_email: t }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setFel(data?.field === 'contact_email' ? DOKUMENT_EPOST.fel : DOKUMENT_EPOST.sparfel)
        return
      }
      await refresh()
      setOppen(false)
    } catch {
      setFel(DOKUMENT_EPOST.sparfel)
    } finally {
      setSparar(false)
    }
  }

  if (!oppen) {
    return (
      <StatusRow
        wrap
        className={className}
        action={
          <button type="button" onClick={oppna} className={LANK}>
            {DOKUMENT_EPOST.andra}
          </button>
        }
      >
        <span className="text-sm text-ink-2">
          {dokument === 'cv' ? DOKUMENT_EPOST.radCv : DOKUMENT_EPOST.radBrev}{' '}
          <span className="break-all text-ink-1">{visad}</span>
        </span>
      </StatusRow>
    )
  }

  return (
    <div className={`rounded-lg border border-kant bg-panel p-3 ${className ?? ''}`}>
      <label htmlFor={`dokument-epost-${dokument}`} className="block text-sm font-medium text-ink-1">
        {DOKUMENT_EPOST.etikett}
      </label>
      <input
        id={`dokument-epost-${dokument}`}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        enterKeyHint="done"
        maxLength={EPOST_MAX}
        value={varde}
        placeholder={konto}
        onChange={(e) => {
          setVarde(e.target.value)
          setFel(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            void spara()
          }
        }}
        aria-invalid={fel ? true : undefined}
        className={`mt-2 ${FALT}`}
      />
      {fel ? (
        <p className="mt-1.5 text-meta text-fel" role="alert">
          {fel}
        </p>
      ) : (
        <p className="mt-1.5 text-meta text-ink-3">{DOKUMENT_EPOST.konto(konto)}</p>
      )}
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={() => void spara()}
          disabled={sparar}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40"
        >
          {sparar ? DOKUMENT_EPOST.sparar : DOKUMENT_EPOST.spara}
        </button>
        <button type="button" onClick={() => setOppen(false)} disabled={sparar} className={LANK}>
          {DOKUMENT_EPOST.avbryt}
        </button>
      </div>
    </div>
  )
}
