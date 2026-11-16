'use client'

/**
 * Kontoarket (skissen yta 1, "Ladda ner"): kontot som ett ark ovanpå hennes
 * dokument, Google först. Efter kontot hämtas filen direkt i samma flik
 * (onKlar), aldrig efter e-postverifiering.
 *
 * Villkor a i planen: arket bär vilken väg hon valde, filen direkt i
 * gratismallen eller kassan för Premium, så att ingen betalspärr kommer som
 * en överraskning efter kontot.
 *
 * Kontot kräver lösenord (minst 8 tecken) som registreringen; skissen
 * ritade bara e-postfältet. Google går via /auth/callback tillbaka till
 * `nasta`, där utkastet i localStorage hämtas hem.
 */
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { capture, identifyUser } from '@/lib/analytics/events'
import { getAcquisitionSource, getSignupAnalyticsContext } from '@/lib/analytics/attribution'
import { skrivSignupCookie } from '@/components/registrering/intent'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import Ark from './Ark'
import { KONTO_ARK } from './texter'

export interface KontoArkProps {
  open: boolean
  onClose: () => void
  /** Dit Google ska tillbaka (provsidan med ?hamta=1). */
  nasta: string
  /** Vägen hon valde: gratis i en mall, eller köpet. */
  /** null: arket öppnades för något annat än filen (fotot), ingen rad om vägen. */
  vag: { typ: 'gratis'; mall: string } | { typ: 'kop'; mall: string; pris: string; fotnot?: string } | null
  /** Knapptexten när arket öppnats för något annat (fotot). */
  knapp?: string
  /** Kontot finns och sessionen är satt i fliken. */
  onKlar: (userId: string) => void
  /** Rubriken och raden under, om arket öppnas för något annat (fotot). */
  rubrik?: string
  under?: string
}

const MIN_LOSEN = 8

export default function KontoArk({ open, onClose, nasta, vag, onKlar, rubrik, under, knapp }: KontoArkProps) {
  const [epost, setEpost] = useState('')
  const [losen, setLosen] = useState('')
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<{ text: string; loggaIn?: boolean } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const cookie = () =>
    skrivSignupCookie({ intent: 'cv', entry: 'cv_prova', skipped: true, fragaVisad: false, redirect: nasta })

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setFel(null)
    if (!epost.includes('@') || epost.trim().length < 4) return setFel({ text: KONTO_ARK.fel.epost })
    if (losen.length < MIN_LOSEN) return setFel({ text: KONTO_ARK.fel.losen })
    setBusy(true)
    const kontext = getSignupAnalyticsContext()
    capture('signup_started', { method: 'password', intent: 'cv', entry: 'cv_prova', ...kontext })
    cookie()
    try {
      if (TURNSTILE_SITE_KEY) {
        const res = await fetch('/api/auth/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) throw Object.assign(new Error('turnstile'), { code: 'turnstile' })
      }
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({ email: epost.trim(), password: losen })
      if (error) throw error
      if (!data.user) throw new Error('no_user')
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('User already registered')
      const userId = data.user.id
      void fetch('/api/auth/post-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, source: 'password', acquisition: getAcquisitionSource(), erbjudanden: false }),
      }).catch(() => {})
      void fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.user.email, userId, isInvitation: false }),
      }).catch(() => {})
      identifyUser(userId, { signup_method: 'password' })
      capture('signup_completed', { method: 'password', intent: 'cv', entry: 'cv_prova', ...kontext })
      onKlar(userId)
    } catch (err: any) {
      const m = String(err?.message ?? '')
      const kod = typeof err?.code === 'string' && err.code ? err.code : m.includes('already') ? 'user_already_exists' : 'okant'
      capture('signup_failed', {
        method: 'password',
        steg: kod === 'turnstile' ? 'turnstile' : 'signup',
        felkod: kod.slice(0, 80),
        intent: 'cv',
        entry: 'cv_prova',
      })
      if (m.includes('already registered') || m.includes('already been registered') || kod === 'user_already_exists') {
        setFel({ text: KONTO_ARK.fel.finns, loggaIn: true })
      } else if (m.includes('Password should be at least')) {
        setFel({ text: KONTO_ARK.fel.losen })
      } else {
        setFel({ text: KONTO_ARK.fel.allman })
      }
      setBusy(false)
    }
  }

  const loggaInHref = `/login?redirect=${encodeURIComponent(nasta)}`

  return (
    <Ark open={open} onClose={onClose} rubrik={rubrik ?? KONTO_ARK.rubrik} under={under ?? KONTO_ARK.under}>
      {vag ? (
        <p className="mb-3 rounded-[10px] bg-papper-2 px-3 py-2 text-[13px] leading-5 text-ink-2">
          {vag.typ === 'gratis' ? KONTO_ARK.vagGratis(vag.mall) : KONTO_ARK.vagKop(vag.mall, vag.pris)}
          {vag.typ === 'kop' && vag.fotnot ? ` ${vag.fotnot}` : null}
        </p>
      ) : null}
      <GoogleSignInButton
        next={nasta}
        label={KONTO_ARK.google}
        busyLabel={KONTO_ARK.googleOppnar}
        errorText={KONTO_ARK.googleFel}
        signup={{ intent: 'cv', entry: 'cv_prova' }}
        onBeforeRedirect={cookie}
      />
      <div className="my-3 flex items-center gap-2.5 text-xs text-ink-3 before:flex-1 before:border-t before:border-kant after:flex-1 after:border-t after:border-kant">
        {KONTO_ARK.eller}
      </div>
      <form onSubmit={skicka} className="grid gap-2.5" noValidate>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-ink-2">{KONTO_ARK.epost}</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            className="h-12 rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none focus:border-ink-1"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium text-ink-2">{KONTO_ARK.losen}</span>
          <input
            type="password"
            autoComplete="new-password"
            value={losen}
            onChange={(e) => setLosen(e.target.value)}
            aria-describedby="konto-losen-hjalp"
            className="h-12 rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none focus:border-ink-1"
          />
          <span id="konto-losen-hjalp" className="text-meta text-ink-3">
            {KONTO_ARK.losenHjalp}
          </span>
        </label>
        {TURNSTILE_SITE_KEY ? <TurnstileWidget onToken={setToken} /> : null}
        {fel ? (
          <p role="alert" className="text-sm text-fel">
            {fel.text}{' '}
            {fel.loggaIn ? (
              <Link href={loggaInHref} className="font-medium text-ink-1 underline underline-offset-4">
                {KONTO_ARK.loggaIn}
              </Link>
            ) : null}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-ink-1 px-4 text-sm font-semibold text-papper disabled:opacity-70"
        >
          {busy ? KONTO_ARK.sparar : knapp ?? (vag?.typ === 'kop' ? KONTO_ARK.knappKop : KONTO_ARK.knapp)}
        </button>
      </form>
      <p className="mt-3 text-center text-[13px] text-ink-2">
        {KONTO_ARK.harKonto}{' '}
        <Link href={loggaInHref} className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
          {KONTO_ARK.loggaIn}
        </Link>
      </p>
    </Ark>
  )
}
