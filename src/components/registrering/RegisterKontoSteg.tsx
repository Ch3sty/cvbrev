'use client'

/**
 * Steg 2, kontot (docs/design/profil-registrering-2026-09-24.html, Del B
 * steg 2). Google först, en avdelare och tre fält i profilens fältform.
 * Skapa konto ligger i den klistrade foten så att knappen följer med
 * tangentbordet.
 *
 * Ingen hämtkedja här: den bor på /dashboard/valkommen, som är enda
 * landningen efter ett nytt konto, för lösenord och för Google. Före
 * signUp och före hoppet till Google skrivs cookien jc_signup, så att valet,
 * smakprovet, paketet och redirecten följer med genom båda vägarna.
 *
 * Fel står överst i flödet, där ögat börjar efter trycket, aldrig som toast.
 * Efter ett fel flyttar Google-knappen under fälten, så att den som skrivit
 * in allt inte börjar om.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logUserActivity } from '@/lib/activity-logger'
import { capture, identifyUser } from '@/lib/analytics/events'
import { getAcquisitionSource, getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import {
  storePendingCvStart,
  storePendingDraft,
  storePendingIntervju,
  storePendingPersonlighet,
  storePendingTestSession,
} from '@/lib/letters/claim-draft-client'
import GoogleSignInButton, { AuthDivider } from '@/components/auth/GoogleSignInButton'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import StatusRow from '@/components/shell/StatusRow'
import { INPUT_CLASS } from '@/app/dashboard/profil/components/ProfileField'
import { VALKOMMEN_PATH, TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'
import type { PlanKey } from '@/lib/plans/plans'
import PubliktFlodesskal, { TEXTLANK } from './PubliktFlodesskal'
import IntentIkon from './IntentIkon'
import {
  skrivSignupCookie,
  type RegisterLage,
  type SignupEntry,
  type SignupIntent,
  type Smakprov,
} from './intent'
import { SKAL, SMAKPROV, SMAKPROV_FOTNOT, SMAKPROV_UNDER, STEG2 } from './registrering-copy'

const MIN_LOSEN = 8

type FaltFel = 'namn' | 'epost' | 'losen' | null

interface Fel {
  rubrik: string
  text?: string
  /** Logga in-länken som bär med sig valet. */
  loggaIn?: boolean
  falt: FaltFel
}

export interface RegisterKontoStegProps {
  lage: RegisterLage
  intent: SignupIntent | null
  smakprov?: Smakprov | null
  paket?: PlanKey | null
  redirect?: string | null
  entry: SignupEntry
  /** Hoppade över steg 1. Går med i cookien och i signup_intent_selected. */
  skipped?: boolean
  /** "Ändra" i valraden och tillbaka-pilen: till steg 1 med valet kvar. */
  onAndraVal?: () => void
  /** Steg 1 finns i det här läget, så pilen och stegräknaren visas. */
  visaSteg?: boolean
}

export function smakprovTillSession(s: Smakprov | null | undefined): void {
  if (!s) return
  if (s.typ === 'draft') storePendingDraft(s.token)
  else if (s.typ === 'cv_start') storePendingCvStart(s.token)
  else if (s.typ === 'test') storePendingTestSession(s.token)
  else if (s.typ === 'intervju') storePendingIntervju(s.token)
  else storePendingPersonlighet(s.token)
}

/** Inloggningen som bär med sig valet, redirecten eller köpsteget. */
export function loggaInHref(p: {
  intent: SignupIntent | null
  smakprov?: Smakprov | null
  paket?: PlanKey | null
  redirect?: string | null
}): string {
  const q = new URLSearchParams()
  if (p.smakprov) q.set('redirect', VALKOMMEN_PATH)
  else if (p.redirect) q.set('redirect', p.redirect)
  else if (p.paket) q.set('redirect', `${TRACK_CHOICE_PATH}?paket=${p.paket}&steg=kop`)
  else if (p.intent) q.set('borja', p.intent)
  const s = q.toString()
  return s ? `/login?${s}` : '/login'
}

export default function RegisterKontoSteg({
  lage,
  intent,
  smakprov = null,
  paket = null,
  redirect = null,
  entry,
  skipped = false,
  onAndraVal,
  visaSteg = false,
}: RegisterKontoStegProps) {
  const router = useRouter()
  const formId = useId()
  const [namn, setNamn] = useState('')
  const [epost, setEpost] = useState('')
  const [losen, setLosen] = useState('')
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<Fel | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Smakprovets token läggs också i sessionStorage, som överlever Googles
  // redirect i samma flik. Cookien är huvudvägen, det här är reserven.
  useEffect(() => {
    smakprovTillSession(smakprov)
  }, [smakprov])

  const loginHref = loggaInHref({ intent, smakprov, paket, redirect })

  const skrivCookie = () =>
    skrivSignupCookie({ intent, entry, skipped, smakprov, paket, redirect })

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setFel(null)

    if (namn.trim().length < 2) {
      setFel({ rubrik: STEG2.fel.namn, falt: 'namn' })
      return
    }
    if (!epost.includes('@') || epost.trim().length < 4) {
      setFel({ rubrik: STEG2.fel.epost, falt: 'epost' })
      return
    }
    if (losen.length < MIN_LOSEN) {
      setFel({ rubrik: STEG2.fel.losen, falt: 'losen' })
      return
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setFel({ rubrik: STEG2.fel.mansklig, falt: null })
      return
    }

    setBusy(true)
    const kontext = getSignupAnalyticsContext()
    capture('signup_started', { method: 'password', intent, entry, ...kontext })
    skrivCookie()

    try {
      if (TURNSTILE_SITE_KEY) {
        const res = await fetch('/api/auth/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) {
          setFel({ rubrik: STEG2.fel.mansklig, falt: null })
          setBusy(false)
          return
        }
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: epost.trim(),
        password: losen,
        options: { data: { full_name: namn.trim() } },
      })

      if (error) throw error
      if (!data.user) throw new Error('no_user')

      // Supabase svarar utan fel men med en tom identitetslista när
      // adressen redan finns och e-postbekräftelse är påslagen.
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('User already registered')
      }

      const userId = data.user.id

      // Attribution och livscykelmail. Fire and forget: ett fel här får
      // aldrig hindra användaren från att komma in i appen.
      void fetch('/api/auth/post-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source: 'password', acquisition: getAcquisitionSource() }),
      }).catch((err) => console.error('[register] post-signup misslyckades:', err))

      void fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.user.email, fullName: namn.trim(), userId, isInvitation: false }),
      }).catch((err) => console.error('[register] bekräftelsemail misslyckades:', err))

      void logUserActivity(userId, 'registered', 'Konto skapat med e-post och lösenord')
      void logUserActivity(userId, 'signup_method', 'Kontot skapades med lösenord', { method: 'password' })

      identifyUser(userId, { signup_method: 'password' })
      capture('signup_completed', { method: 'password', intent, entry, ...kontext })

      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({ event: 'user_registered' })
      }

      router.push(VALKOMMEN_PATH)
      router.refresh()
    } catch (err: any) {
      const m = String(err?.message ?? '')
      if (m.includes('already registered') || m.includes('already been registered')) {
        setFel({ rubrik: STEG2.fel.finnsRubrik, text: STEG2.fel.finnsText, loggaIn: true, falt: 'epost' })
      } else if (m.includes('Password should be at least')) {
        setFel({ rubrik: STEG2.fel.losen, falt: 'losen' })
      } else if (m.toLowerCase().includes('email')) {
        setFel({ rubrik: STEG2.fel.epost, falt: 'epost' })
      } else {
        setFel({ rubrik: STEG2.fel.allmanRubrik, text: STEG2.fel.allman, falt: null })
      }
      console.error('[register] Registreringsfel:', err)
      setBusy(false)
    }
  }

  const smak = smakprov ? SMAKPROV[smakprov.typ] : null
  const medPil = visaSteg && Boolean(onAndraVal)

  const eyebrow = smak ? smak.eyebrow : visaSteg ? STEG2.steg : null
  const rubrik = smak ? smak.rubrik : STEG2.rubrik
  const under = smak ? SMAKPROV_UNDER : STEG2.under

  const google = (
    <GoogleSignInButton
      next={VALKOMMEN_PATH}
      label={STEG2.google}
      busyLabel={STEG2.googleOppnar}
      errorText={STEG2.googleFel}
      signup={{ intent, entry }}
      onBeforeRedirect={skrivCookie}
      className="mt-4"
    />
  )

  const fotnot: ReactNode = smak ? (
    SMAKPROV_FOTNOT
  ) : (
    <>
      {SKAL.harKonto}{' '}
      <Link href={loginHref} className="text-ink-1 underline decoration-kant-stark underline-offset-[3px]">
        {SKAL.loggaIn}
      </Link>
    </>
  )

  return (
    <PubliktFlodesskal
      steg={medPil ? { nu: 2, av: 3 } : undefined}
      onBack={medPil ? onAndraVal : undefined}
      toppLank={{ href: loginHref, text: SKAL.loggaIn, forklaring: SKAL.harKonto }}
      primar={{
        text: smak ? smak.knapp : STEG2.primar,
        formId,
        busy,
        busyText: STEG2.busy,
      }}
      fotnot={fotnot}
    >
      {eyebrow ? <p className="text-steg uppercase text-ink-3">{eyebrow}</p> : null}
      <h1 className="mt-1 font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1">
        {rubrik}
      </h1>
      {fel ? null : <p className="mt-1 text-sm leading-[22px] text-ink-2">{under}</p>}

      {fel ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-fel"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="mt-px shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5">{fel.rubrik}</p>
            {fel.text ? <p className="mt-0.5 text-sm leading-[22px] text-fel-morker">{fel.text}</p> : null}
            {fel.loggaIn ? (
              <Link
                href={loginHref}
                className="inline-flex min-h-11 items-center text-sm font-medium text-fel-morker underline decoration-fel-kant underline-offset-4"
              >
                {STEG2.fel.finnsLank}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {smak && !fel ? (
        <StatusRow tone="positive" showDot className="mt-4">
          {smak.status}
        </StatusRow>
      ) : null}

      {intent && !smak && !fel && (lage === 'tratt' || lage === 'konto') ? (
        <div className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-kant bg-panel px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-1">
            <IntentIkon intent={intent} size={20} className="shrink-0 text-ink-2" />
            <span>{STEG2.valrad[intent]}</span>
          </span>
          {onAndraVal ? (
            <button type="button" onClick={onAndraVal} className={`${TEXTLANK} shrink-0 text-ink-2`}>
              {STEG2.andra}
            </button>
          ) : null}
        </div>
      ) : null}

      {!fel ? (
        <>
          {google}
          <AuthDivider text={STEG2.eller} />
        </>
      ) : null}

      <form id={formId} onSubmit={skicka} noValidate className="mt-3 grid gap-4">
        <Falt
          label={STEG2.namn}
          id={`${formId}-namn`}
          value={namn}
          onChange={setNamn}
          placeholder={STEG2.namnPlats}
          autoComplete="name"
          enterKeyHint="next"
          invalid={fel?.falt === 'namn'}
        />
        <Falt
          label={STEG2.epost}
          id={`${formId}-epost`}
          type="email"
          inputMode="email"
          value={epost}
          onChange={setEpost}
          placeholder={STEG2.epostPlats}
          autoComplete="email"
          enterKeyHint="next"
          autoCapitalize="none"
          invalid={fel?.falt === 'epost'}
        />
        <Falt
          label={STEG2.losen}
          id={`${formId}-losen`}
          type="password"
          value={losen}
          onChange={setLosen}
          placeholder={STEG2.losenPlats}
          autoComplete="new-password"
          enterKeyHint="done"
          invalid={fel?.falt === 'losen'}
        />
        <TurnstileWidget onToken={setTurnstileToken} />
      </form>

      {fel ? google : null}

      {!smak ? (
        <p className="mt-4 text-meta text-ink-3">
          {STEG2.villkorFore}
          <Link href="/anvandarvillkor" className="underline decoration-kant-stark underline-offset-[3px]">
            {STEG2.villkorLank}
          </Link>
          {STEG2.villkorMitt}
          <Link href="/integritetspolicy" className="underline decoration-kant-stark underline-offset-[3px]">
            {STEG2.integritetLank}
          </Link>
          {STEG2.villkorEfter}
        </p>
      ) : null}
    </PubliktFlodesskal>
  )
}

function Falt({
  label,
  id,
  value,
  onChange,
  invalid,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
  enterKeyHint,
  autoCapitalize,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  type?: 'text' | 'email' | 'password'
  inputMode?: 'text' | 'email'
  placeholder: string
  autoComplete: string
  enterKeyHint: 'next' | 'done'
  autoCapitalize?: 'none'
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        autoCapitalize={autoCapitalize}
        aria-invalid={invalid || undefined}
        className={INPUT_CLASS}
      />
    </div>
  )
}
