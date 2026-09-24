'use client'

/**
 * Sektion 4: "Konto" (Del A). Fyra rader i stället för fyra paneler:
 * Prenumeration (länk), Mejl från oss (ark med dagens två växlar), Logga ut
 * (direkt) och Radera mitt konto (ark med dagens bekräftelseflöde).
 * Innehållet i arken är det som förut stod i NotisInstallningar och
 * AccountSection: samma routes, samma bekräftelse med text.
 */

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import Sheet from '@/components/shell/Sheet'
import { ToggleSwitch, INPUT_CLASS } from './ProfileField'
import { KONTO_SEKTION } from '../profil-copy'

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
    body: 'En gång i veckan: hur många jobb du sökte, vad som väntar på svar och vilka ansökningar som är värda en påminnelse. Skickas bara när du har ansökningar igång.',
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

export interface KontoSectionProps {
  /** Prenumerationsradens undertext, till exempel "Gratisnivån · tre paket, från 49 kr". */
  prenumerationRad: string
  harPaket: boolean
  initialDigestOptOut: boolean
  initialQuotaOptOut: boolean
  onLogout: () => void
  onDeleteAccount: () => Promise<void>
}

const RAD =
  'flex min-h-14 w-full items-center justify-between gap-3 border-b border-kant py-2 text-left last:border-b-0'

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-3" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function Rad({ titel, text }: { titel: string; text: ReactNode }) {
  return (
    <span className="min-w-0">
      <b className="block text-sm font-medium leading-5 text-ink-1">{titel}</b>
      <small className="block text-meta text-ink-3">{text}</small>
    </span>
  )
}

export default function KontoSection(p: KontoSectionProps) {
  const [ark, setArk] = useState<'mejl' | 'radera' | null>(null)
  const [optOut, setOptOut] = useState<Record<MejlRad['key'], boolean>>({
    digest: p.initialDigestOptOut,
    quota: p.initialQuotaOptOut,
  })

  return (
    <section id="konto" className="scroll-mt-24 rounded-xl border border-kant bg-panel">
      <div className="p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">{KONTO_SEKTION.rubrik}</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{KONTO_SEKTION.under}</p>
      </div>

      <div className="border-t border-kant px-4 py-1 sm:px-5">
        <Link href="/dashboard/profil/prenumeration" className={RAD}>
          <Rad titel={KONTO_SEKTION.prenumeration} text={p.prenumerationRad} />
          <Chevron />
        </Link>
        <button type="button" onClick={() => setArk('mejl')} className={RAD}>
          <Rad titel={KONTO_SEKTION.mejl} text={KONTO_SEKTION.mejlStatus(!optOut.digest, !optOut.quota)} />
          <Chevron />
        </button>
        <button type="button" onClick={p.onLogout} className={RAD}>
          <Rad titel={KONTO_SEKTION.loggaUt} text={KONTO_SEKTION.loggaUtText} />
          <Chevron />
        </button>
        <button type="button" onClick={() => setArk('radera')} className={RAD}>
          <Rad titel={KONTO_SEKTION.radera} text={KONTO_SEKTION.raderaText} />
          <Chevron />
        </button>
      </div>

      <Sheet open={ark === 'mejl'} onClose={() => setArk(null)} title={KONTO_SEKTION.mejl} description={KONTO_SEKTION.mejlUnder}>
        <div className="space-y-3">
          {MEJL.map((rad) => (
            <MejlVaxel
              key={rad.key}
              rad={rad}
              optOut={optOut[rad.key]}
              onChange={(v) => setOptOut((o) => ({ ...o, [rad.key]: v }))}
            />
          ))}
        </div>
      </Sheet>

      <Sheet open={ark === 'radera'} onClose={() => setArk(null)} title={KONTO_SEKTION.radera}>
        <RaderaKonto harPaket={p.harPaket} onAvbryt={() => setArk(null)} onDeleteAccount={p.onDeleteAccount} />
      </Sheet>
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
    <div className="rounded-lg border border-kant p-3">
      <div className="flex min-h-11 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-1">{rad.title}</p>
          <p className="mt-0.5 text-meta text-ink-3">{rad.body}</p>
        </div>
        <ToggleSwitch checked={!optOut} onChange={vaxla} disabled={sparar} label={rad.ariaLabel} />
      </div>
      {fel ? <p className="mt-2 text-meta text-fel">{fel}</p> : null}
    </div>
  )
}

const BTN_SEKUNDAR =
  'inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:border-kant-stark disabled:opacity-60'

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
          className="inline-flex h-11 items-center justify-center rounded-lg bg-fel px-4 text-sm font-medium text-white transition-colors hover:bg-fel-morker disabled:cursor-not-allowed disabled:opacity-40"
        >
          {raderar ? 'Tar bort' : 'Radera permanent'}
        </button>
      </div>
    </div>
  )
}
