'use client'

/**
 * Inställningarnas tre nedre kort (skiss-installningar-2026-10-12), flyttade
 * från profilens sektion Konto:
 *
 *   MejlSection           Mejl från oss. Växlarna står direkt på sidan, inte
 *                         längre i ett ark, eftersom sidan nu är deras plats.
 *   PrenumerationSection  En rad med paketet och läget, som länkar till
 *                         Prenumeration.
 *   KontoSection          Inloggningen (adress och sätt, bara visande), Logga
 *                         ut och Radera mitt konto som röd länk sist, med
 *                         dagens bekräftelseflöde i ett ark.
 *
 * Logiken är densamma som förut: samma routes för mejlväxlarna, optimistisk
 * växel som backar vid fel, och samma bekräftelse med text före radering.
 */

import { KNAPP_SEKUNDAR_SMAL, LANK_FEL } from '@/components/shell/knappar'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import Sheet from '@/components/shell/Sheet'
import Chip from '@/components/rum/Chip'
import { ToggleSwitch, INPUT_CLASS } from '@/app/dashboard/profil/components/ProfileField'
import { KONTO_SEKTION } from '@/app/dashboard/profil/profil-copy'

interface MejlRad {
  key: 'digest' | 'quota'
  endpoint: string
  title: string
  body: string
  ariaLabel: string
}

const MEJL: MejlRad[] = [
  {
    key: 'digest',
    endpoint: '/api/email/digest-preference',
    title: 'Veckosammanfattning',
    body: 'En gång i veckan: hur många jobb du sökte, vad som väntar på svar och vilka sökta tjänster som är värda en påminnelse. Skickas bara när du har sökta tjänster igång.',
    ariaLabel: 'Veckosammanfattning via mejl',
  },
  {
    key: 'quota',
    endpoint: '/api/profile/quota-emails',
    title: 'Påminnelser om din kvot',
    body: 'Mejl när dina gratisbrev återställs och när något du använt tagit slut. Av om du hellre håller koll själv.',
    ariaLabel: 'Påminnelser om din kvot via mejl',
  },
]

const KORT = 'scroll-mt-24 rounded-xl border border-kant bg-papper'
const HUVUD = 'border-b border-kant px-4 py-3 sm:px-5'
const KROPP = 'px-4 py-1 sm:px-5'
const RAD =
  'flex min-h-14 w-full items-center justify-between gap-3 border-b border-kant py-2 text-left last:border-b-0'

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-3" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function Rad({ titel, text }: { titel: ReactNode; text: ReactNode }) {
  return (
    <span className="min-w-0">
      <b className="block text-sm font-medium leading-5 text-ink-1">{titel}</b>
      <small className="block text-meta text-ink-3">{text}</small>
    </span>
  )
}

function Huvud({ id, titel, under }: { id: string; titel: string; under?: string }) {
  return (
    <div className={HUVUD}>
      <h2 id={id} className="text-kort text-ink-1">{titel}</h2>
      {under ? <p className="mt-0.5 text-meta text-ink-3">{under}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------ Mejl */

export function MejlSection({
  initialDigestOptOut,
  initialQuotaOptOut,
}: {
  initialDigestOptOut: boolean
  initialQuotaOptOut: boolean
}) {
  const [optOut, setOptOut] = useState<Record<MejlRad['key'], boolean>>({
    digest: initialDigestOptOut,
    quota: initialQuotaOptOut,
  })

  return (
    <section id="mejl" aria-labelledby="mejl-rubrik" className={KORT}>
      <Huvud id="mejl-rubrik" titel={KONTO_SEKTION.mejl} under={KONTO_SEKTION.mejlUnder} />
      <div className={KROPP}>
        {MEJL.map((rad) => (
          <MejlVaxel
            key={rad.key}
            rad={rad}
            optOut={optOut[rad.key]}
            onChange={(v) => setOptOut((o) => ({ ...o, [rad.key]: v }))}
          />
        ))}
      </div>
    </section>
  )
}

function MejlVaxel({ rad, optOut, onChange }: { rad: MejlRad; optOut: boolean; onChange: (optOut: boolean) => void }) {
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  const vaxla = async () => {
    if (sparar) return
    const nasta = !optOut
    // Optimistiskt: växeln ska kännas direkt. Vid fel backar vi och säger till.
    onChange(nasta)
    setSparar(true)
    setFel(null)
    try {
      const res = await fetch(rad.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optOut: nasta }),
      })
      if (!res.ok) throw new Error()
    } catch {
      onChange(!nasta)
      setFel('Inställningen kunde inte sparas. Försök igen.')
    } finally {
      setSparar(false)
    }
  }

  return (
    <div className="border-b border-kant py-3 last:border-b-0">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-ink-1">{rad.title}</p>
          <p className="mt-0.5 text-meta text-ink-3">{rad.body}</p>
        </div>
        <ToggleSwitch checked={!optOut} onChange={vaxla} disabled={sparar} label={rad.ariaLabel} />
      </div>
      {fel ? <p className="mt-2 text-meta text-fel">{fel}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------ Prenumeration */

export function PrenumerationSection({ titel, text, chip }: { titel: string; text: string; chip?: string | null }) {
  return (
    <section id="prenumeration" aria-labelledby="prenumeration-rubrik" className={KORT}>
      <Huvud id="prenumeration-rubrik" titel={KONTO_SEKTION.prenumeration} />
      <div className={KROPP}>
        <Link href="/dashboard/profil/prenumeration" prefetch className={RAD}>
          <Rad titel={titel} text={text} />
          <span className="inline-flex shrink-0 items-center gap-2">
            {chip ? <Chip liten ton>{chip}</Chip> : null}
            <Chevron />
          </span>
        </Link>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Konto */

export interface KontoSectionProps {
  /** Kontoadressen, den man loggar in med. */
  epost: string
  /** Inloggningssättet i klartext: "Google" eller "Lösenord". */
  inloggningSatt: string
  harPaket: boolean
  onLogout: () => void
  onDeleteAccount: () => Promise<void>
}

export default function KontoSection(p: KontoSectionProps) {
  const [radera, setRadera] = useState(false)
  const inloggning = [p.epost, p.inloggningSatt].filter(Boolean).join(' · ')

  return (
    <section id="konto" aria-labelledby="konto-rubrik" className={KORT}>
      <Huvud id="konto-rubrik" titel={KONTO_SEKTION.rubrik} />
      <div className={KROPP}>
        {/* Bara visande tills byte av lösenord och e-post byggs (ägarens beslut 2026-10-13). */}
        <div className={RAD}>
          <Rad titel={KONTO_SEKTION.inloggning} text={<span className="break-all">{inloggning}</span>} />
        </div>
        <button type="button" onClick={p.onLogout} className={RAD}>
          <Rad titel={KONTO_SEKTION.loggaUt} text={KONTO_SEKTION.loggaUtText} />
          <Chevron />
        </button>
        <div className={RAD}>
          <span className="min-w-0">
            <button type="button" onClick={() => setRadera(true)} className={`${LANK_FEL} inline-flex min-h-11 items-center`}>
              {KONTO_SEKTION.radera}
            </button>
            <small className="block text-meta text-ink-3">{KONTO_SEKTION.raderaText}</small>
          </span>
        </div>
      </div>

      <Sheet open={radera} onClose={() => setRadera(false)} title={KONTO_SEKTION.radera}>
        <RaderaKonto harPaket={p.harPaket} onAvbryt={() => setRadera(false)} onDeleteAccount={p.onDeleteAccount} />
      </Sheet>
    </section>
  )
}

const BTN_SEKUNDAR =
  `${KNAPP_SEKUNDAR_SMAL} shrink-0`

function RaderaKonto({
  harPaket,
  onAvbryt,
  onDeleteAccount,
}: {
  harPaket: boolean
  onAvbryt: () => void
  onDeleteAccount: () => Promise<void>
}) {
  const [text, setText] = useState('')
  const [raderar, setRaderar] = useState(false)
  const [fel, setFel] = useState('')
  const kan = text.trim().toLowerCase() === 'radera mitt konto'

  const radera = async () => {
    if (!kan) return
    setRaderar(true)
    setFel('')
    try {
      await onDeleteAccount()
    } catch (err: any) {
      setFel(err?.message || 'Något gick fel. Försök igen.')
      setRaderar(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-ink-1">Det här raderas</p>
        <ul className="mt-1 space-y-1 text-sm leading-[22px] text-ink-2">
          <li>All personlig information</li>
          <li>Uppladdade CV:n och sparade personliga brev</li>
          <li>Genomförda CV-analyser och historik</li>
          {harPaket ? (
            <li className="font-medium text-ink-1">
              Ditt paket sägs inte upp automatiskt. Säg upp det under Prenumeration först.
            </li>
          ) : null}
        </ul>
      </div>
      <div>
        <label htmlFor="radera-bekrafta" className="block text-sm font-medium text-ink-1">
          Skriv <span className="font-semibold">radera mitt konto</span> för att bekräfta
        </label>
        <input
          id="radera-bekrafta"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          enterKeyHint="done"
          autoComplete="off"
          placeholder="radera mitt konto"
          disabled={raderar}
          className={INPUT_CLASS}
        />
      </div>
      {fel ? (
        <p className="text-meta text-fel" role="alert">
          {fel}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
        <button type="button" onClick={onAvbryt} disabled={raderar} className={BTN_SEKUNDAR}>
          Avbryt
        </button>
        <button
          type="button"
          onClick={radera}
          disabled={!kan || raderar}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-fel px-4 text-sm font-medium text-papper transition-colors hover:bg-fel-morker disabled:cursor-not-allowed disabled:opacity-40"
        >
          {raderar ? 'Tar bort' : 'Radera permanent'}
        </button>
      </div>
    </div>
  )
}
