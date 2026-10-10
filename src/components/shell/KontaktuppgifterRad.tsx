'use client'

/**
 * Kontaktuppgifter i CV och brev (2026-10-10, ersätter DokumentEpostRad).
 *
 * En diskret rad nära nedladdnings- och genereringsknapparna som visar vad
 * dokumentet får överst: namn, telefon, e-post och ort. "Ändra" fäller ut ett
 * formulär på plats, så att ett osparat brev eller ett valt CV ligger kvar.
 *
 * Vad raden visar följer samma regler som PDF:en (src/lib/profile/
 * dokumentKontakt.ts): i ett brev profilens värden, i ett CV det som står i
 * CV:t med profilen som reserv för tomma fält och platshållare.
 *
 * Sparas via /api/profile/contact. Bara fält som ändrats skickas. I CV-läget
 * skickas cv_id med, så att CV:ts egna uppgifter byts och PDF:en följer med.
 * Efter sparningen hämtas dashboardens delade data om och onSparad får de
 * gamla och nya värdena, så att en öppen förhandsvisning kan bytas direkt.
 */

import { useState } from 'react'
import StatusRow from '@/components/shell/StatusRow'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { arGiltigEpost, kontoEpost, EPOST_MAX } from '@/lib/profile/dokumentEpost'
import {
  kontaktForCv,
  kontaktIBrev,
  lasKontaktIStrukturerad,
  NAMN_MAX,
  ORT_MAX,
  TELEFON_MAX,
  type KontaktIBrev,
  type ProfilKontakt,
} from '@/lib/profile/dokumentKontakt'
import { DOKUMENT_KONTAKT } from '@/lib/profile/dokumentKontakt-copy'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'

const FALT =
  'block h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 aria-[invalid=true]:border-fel-kant'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:opacity-40'

export type SparadKontakt = {
  /** Det dokumentet visade före och efter, i brevets form. */
  fore: KontaktIBrev
  efter: KontaktIBrev
  /** CV-läget: CV:ts nya structured_data, när servern bytte i det. */
  cv?: { id: string; structured_data: unknown } | null
}

type Varden = { namn: string; telefon: string; epost: string; ort: string }
type Fel = Partial<Record<keyof Varden | 'allmant', string>>

function visadeVarden(
  dokument: 'cv' | 'brev',
  profil: ProfilKontakt,
  cv: { structured_data: unknown } | null | undefined
): Varden {
  if (dokument === 'brev') {
    const k = kontaktIBrev(profil)
    return { namn: k.namn, telefon: k.telefon, epost: k.epost, ort: k.ort }
  }
  const sd = cv?.structured_data
  const kalla = normalizeStructuredData(sd) ? 'strukturerad' : 'text'
  const k = kontaktForCv(lasKontaktIStrukturerad(sd), profil, null, kalla)
  return { namn: k.fullName, telefon: k.phone, epost: k.email, ort: k.address }
}

export default function KontaktuppgifterRad({
  dokument,
  cv,
  onSparad,
  className,
}: {
  /** Styr etiketten och vilka regler som gäller. */
  dokument: 'cv' | 'brev'
  /** CV-läget: det valda CV:t. */
  cv?: { id: string; structured_data: unknown } | null
  /** Anropas efter lyckad sparning. */
  onSparad?: (r: SparadKontakt) => void
  className?: string
}) {
  const { summary, refresh } = useDashboardData()
  const profil = (summary?.profile as ProfilKontakt) ?? null
  const visade = visadeVarden(dokument, profil, cv)
  const konto = kontoEpost(profil)

  const [oppen, setOppen] = useState(false)
  const [varden, setVarden] = useState<Varden>(visade)
  const [start, setStart] = useState<Varden>(visade)
  const [fel, setFel] = useState<Fel>({})
  const [sparar, setSparar] = useState(false)

  if (!profil) return null

  const oppna = () => {
    setVarden(visade)
    setStart(visade)
    setFel({})
    setOppen(true)
  }

  const satt = (k: keyof Varden) => (v: string) => {
    setVarden((prev) => ({ ...prev, [k]: v }))
    setFel((prev) => ({ ...prev, [k]: undefined, allmant: undefined }))
  }

  const spara = async () => {
    const t: Varden = {
      namn: varden.namn.trim(),
      telefon: varden.telefon.trim(),
      epost: varden.epost.trim(),
      ort: varden.ort.trim(),
    }
    const nyaFel: Fel = {}
    if (t.namn.length < 2) nyaFel.namn = DOKUMENT_KONTAKT.namnFel
    if (t.epost && !arGiltigEpost(t.epost)) nyaFel.epost = DOKUMENT_KONTAKT.epostFel
    if (Object.keys(nyaFel).length > 0) {
      setFel(nyaFel)
      return
    }

    // Bara det som ändrats. Ett orört fält ska aldrig skriva över profilen.
    const kropp: Record<string, unknown> = { kalla: dokument === 'cv' ? 'rad_cv' : 'rad_brev' }
    if (t.namn !== start.namn.trim()) kropp.full_name = t.namn
    if (t.telefon !== start.telefon.trim()) kropp.phone = t.telefon || null
    if (t.ort !== start.ort.trim()) kropp.location = t.ort || null
    if (t.epost.toLowerCase() !== start.epost.trim().toLowerCase()) kropp.contact_email = t.epost
    const andrat = ['full_name', 'phone', 'location', 'contact_email'].some((k) => k in kropp)
    if (!andrat) {
      setOppen(false)
      return
    }
    if (dokument === 'cv' && cv?.id) kropp.cv_id = cv.id

    setSparar(true)
    setFel({})
    try {
      const res = await fetch('/api/profile/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kropp),
      })
      const data = (await res.json().catch(() => null)) as {
        field?: string
        profil?: ProfilKontakt
        cv?: { id: string; structured_data: unknown } | null
      } | null
      if (!res.ok) {
        if (data?.field === 'contact_email') setFel({ epost: DOKUMENT_KONTAKT.epostFel })
        else if (data?.field === 'full_name') setFel({ namn: DOKUMENT_KONTAKT.namnFel })
        else setFel({ allmant: DOKUMENT_KONTAKT.sparfel })
        return
      }
      const fore = kontaktIBrev(profil)
      const efterProfil = data?.profil ?? profil
      const efter = kontaktIBrev(efterProfil)
      onSparad?.({ fore, efter, cv: data?.cv ?? null })
      await refresh()
      setOppen(false)
    } catch {
      setFel({ allmant: DOKUMENT_KONTAKT.sparfel })
    } finally {
      setSparar(false)
    }
  }

  if (!oppen) {
    const delar = [visade.namn || DOKUMENT_KONTAKT.namnSaknas, visade.telefon, visade.epost, visade.ort].filter(Boolean)
    return (
      <StatusRow
        wrap
        className={className}
        action={
          <button type="button" onClick={oppna} className={LANK}>
            {DOKUMENT_KONTAKT.andra}
          </button>
        }
      >
        <span className="text-sm text-ink-2" data-kontaktrad={dokument}>
          {dokument === 'cv' ? DOKUMENT_KONTAKT.radCv : DOKUMENT_KONTAKT.radBrev}{' '}
          <span className="break-words text-ink-1">{delar.join(' · ')}</span>
        </span>
      </StatusRow>
    )
  }

  const id = (k: string) => `kontakt-${dokument}-${k}`
  const falt = (
    k: keyof Varden,
    opts: {
      type?: string
      inputMode?: 'text' | 'tel' | 'email'
      autoComplete: string
      maxLength: number
      placeholder?: string
      hint?: string
    }
  ) => (
    <div>
      <label htmlFor={id(k)} className="block text-sm font-medium text-ink-1">
        {DOKUMENT_KONTAKT.falt[k]}
      </label>
      <input
        id={id(k)}
        name={k}
        type={opts.type ?? 'text'}
        inputMode={opts.inputMode}
        autoComplete={opts.autoComplete}
        autoCapitalize={k === 'epost' ? 'none' : undefined}
        enterKeyHint="next"
        maxLength={opts.maxLength}
        value={varden[k]}
        placeholder={opts.placeholder}
        onChange={(e) => satt(k)(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            void spara()
          }
        }}
        aria-invalid={fel[k] ? true : undefined}
        aria-describedby={`${id(k)}-hjalp`}
        className={`mt-1.5 ${FALT}`}
      />
      {fel[k] ? (
        <p id={`${id(k)}-hjalp`} className="mt-1 text-meta text-fel" role="alert">
          {fel[k]}
        </p>
      ) : opts.hint ? (
        <p id={`${id(k)}-hjalp`} className="mt-1 text-meta text-ink-3">
          {opts.hint}
        </p>
      ) : null}
    </div>
  )

  return (
    <div className={`rounded-lg border border-kant bg-panel p-3 ${className ?? ''}`}>
      <p className="text-sm font-medium text-ink-1">{DOKUMENT_KONTAKT.rubrik}</p>
      <p className="mt-0.5 text-meta text-ink-3">
        {dokument === 'cv' ? DOKUMENT_KONTAKT.forklaringCv : DOKUMENT_KONTAKT.forklaringBrev}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {falt('namn', { autoComplete: 'name', maxLength: NAMN_MAX, placeholder: DOKUMENT_KONTAKT.plats.namn })}
        {falt('telefon', {
          type: 'tel',
          inputMode: 'tel',
          autoComplete: 'tel',
          maxLength: TELEFON_MAX,
          placeholder: DOKUMENT_KONTAKT.plats.telefon,
          hint: DOKUMENT_KONTAKT.tomRad,
        })}
        {falt('epost', {
          type: 'email',
          inputMode: 'email',
          autoComplete: 'email',
          maxLength: EPOST_MAX,
          placeholder: konto,
          hint: DOKUMENT_KONTAKT.epostKonto(konto),
        })}
        {falt('ort', {
          autoComplete: 'address-level2',
          maxLength: ORT_MAX,
          placeholder: DOKUMENT_KONTAKT.plats.ort,
          hint: DOKUMENT_KONTAKT.tomRad,
        })}
      </div>
      {fel.allmant ? (
        <p className="mt-2 text-meta text-fel" role="alert">
          {fel.allmant}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => void spara()}
          disabled={sparar}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40"
        >
          {sparar ? DOKUMENT_KONTAKT.sparar : DOKUMENT_KONTAKT.spara}
        </button>
        <button type="button" onClick={() => setOppen(false)} disabled={sparar} className={LANK}>
          {DOKUMENT_KONTAKT.avbryt}
        </button>
      </div>
    </div>
  )
}
