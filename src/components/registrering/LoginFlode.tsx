'use client'

/**
 * Inloggningen i det publika flödesskalet. Logiken är dagens login-form:
 * rekryterare till /rekryterare, annars ?redirect= om den är relativ, annars
 * hemskärmen. Nytt: ?borja= från registreringens "Logga in i stället" leder
 * till verktyget hon valde, och Skapa konto bär med sig valet tillbaka.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logUserActivity } from '@/lib/activity-logger'
import GoogleSignInButton, { AuthDivider } from '@/components/auth/GoogleSignInButton'
import StatusRow from '@/components/shell/StatusRow'
import { INPUT_CLASS } from '@/app/dashboard/profil/components/ProfileField'
import PubliktFlodesskal from './PubliktFlodesskal'
import { ENTRY_STORAGE_KEY, INTENTS, lasIntent } from './intent'
import { LOGIN, STEG2 } from './registrering-copy'

/**
 * Godkända rekryterare hör hemma i rekryterarportalen. Fel eller timeout
 * faller alltid tillbaka på /dashboard.
 */
async function efterInloggning(): Promise<string> {
  try {
    const res = await fetch('/api/recruiter/status', { cache: 'no-store' })
    if (!res.ok) return '/dashboard'
    const data = (await res.json()) as { status?: string }
    return data?.status === 'approved' ? '/rekryterare' : '/dashboard'
  } catch {
    return '/dashboard'
  }
}

function sakerRelativ(v: string | null): string | null {
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : null
}

const LANK = 'text-ink-1 underline decoration-kant-stark underline-offset-[3px]'

export interface LoginParams {
  redirect: string | null
  borja: string | null
  error: string | null
  confirmed: string | null
  reset: string | null
}

export default function LoginFlode({ params }: { params: LoginParams }) {
  const router = useRouter()
  const formId = useId()
  const [epost, setEpost] = useState('')
  const [losen, setLosen] = useState('')
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<string | null>(() => {
    const e = params.error
    return e && e.startsWith('oauth') ? LOGIN.fel.oauth : null
  })

  const redirect = sakerRelativ(params.redirect)
  const borja = lasIntent(params.borja)
  const mal = redirect ?? (borja ? INTENTS[borja].landning : null)

  const bekraftelse =
    params.confirmed === 'true'
      ? LOGIN.bekraftad
      : params.reset === 'success'
        ? LOGIN.aterstallt
        : null

  const registerQ = new URLSearchParams()
  if (borja) registerQ.set('borja', borja)
  else if (redirect && !redirect.startsWith('/dashboard/valkommen')) registerQ.set('redirect', redirect)
  const registerHref = registerQ.toString() ? `/register?${registerQ.toString()}` : '/register'
  const markeraIngang = () => {
    try {
      sessionStorage.setItem(ENTRY_STORAGE_KEY, 'login')
    } catch {
      /* privat läge */
    }
  }

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setFel(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email: epost.trim(), password: losen })
      if (error) {
        setFel(error.message.includes('Invalid login credentials') ? LOGIN.fel.fel : LOGIN.fel.allman)
        setBusy(false)
        return
      }
      if (data?.user) {
        // Aldrig await: loggningen får inte hålla kvar inloggningen.
        void logUserActivity(data.user.id, 'login', 'User logged in via email/password').catch(() => {})
      }
      const bas = await efterInloggning()
      router.push(bas === '/dashboard' && mal ? mal : bas)
      router.refresh()
    } catch (err) {
      console.error('[login] Inloggningsfel:', err)
      setFel(LOGIN.fel.allman)
      setBusy(false)
    }
  }

  return (
    <PubliktFlodesskal
      toppLank={{ href: registerHref, text: LOGIN.skapa, forklaring: LOGIN.harInte, onClick: markeraIngang }}
      primar={{ text: LOGIN.primar, formId, busy, busyText: LOGIN.busy }}
      fotnot={
        <>
          {LOGIN.harInte}{' '}
          <Link href={registerHref} onClick={markeraIngang} className={LANK}>
            {LOGIN.skapa}
          </Link>
        </>
      }
    >
      <h1 className="font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1">
        {LOGIN.rubrik}
      </h1>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{LOGIN.under}</p>

      {bekraftelse && !fel ? (
        <StatusRow tone="positive" showDot wrap className="mt-4">
          {bekraftelse}
        </StatusRow>
      ) : null}

      {fel ? (
        <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-fel">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="mt-px shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
          <div>
            <p className="text-sm font-semibold leading-5">{LOGIN.fel.rubrik}</p>
            <p className="mt-0.5 text-sm leading-[22px] text-fel-morker">{fel}</p>
          </div>
        </div>
      ) : null}

      <GoogleSignInButton
        next={mal ?? '/dashboard'}
        label={LOGIN.google}
        busyLabel={STEG2.googleOppnar}
        errorText={STEG2.googleFel}
        className="mt-4"
      />
      <AuthDivider text={STEG2.eller} />

      <form id={formId} onSubmit={skicka} noValidate className="mt-3 grid gap-4">
        <div>
          <label htmlFor={`${formId}-epost`} className="block text-sm font-medium text-ink-1">
            {LOGIN.epost}
          </label>
          <input
            id={`${formId}-epost`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="next"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder={STEG2.epostPlats}
            aria-invalid={fel === LOGIN.fel.fel || undefined}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-losen`} className="block text-sm font-medium text-ink-1">
            {LOGIN.losen}
          </label>
          <input
            id={`${formId}-losen`}
            type="password"
            autoComplete="current-password"
            enterKeyHint="done"
            value={losen}
            onChange={(e) => setLosen(e.target.value)}
            aria-invalid={fel === LOGIN.fel.fel || undefined}
            className={INPUT_CLASS}
          />
          <Link
            href="/auth/forgot-password"
            className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4"
          >
            {LOGIN.glomt}
          </Link>
        </div>
      </form>
    </PubliktFlodesskal>
  )
}
