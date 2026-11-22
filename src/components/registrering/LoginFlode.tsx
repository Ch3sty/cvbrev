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
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { Dorr, Ikon } from '@/components/publikt/v3/Ikon'
import PubliktFlodesskal from './PubliktFlodesskal'
import { ENTRY_STORAGE_KEY, INTENTS, lasIntent } from './intent'
import { LOGIN, STEG2 } from './registrering-copy'
import './registrering.css'

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
      bredd="full"
    >
      <section className="rg-konto">
        <div className="p3-bredd rg-konto-rad rg-med-panel">
          <div className="rg-kort">
            <h1 className="rg-h1">{LOGIN.rubrik}</h1>
            <p className="rg-under">{LOGIN.under}</p>

            {bekraftelse && !fel ? (
              <div className="rg-rad rg-bra" role="status">
                <i aria-hidden="true">
                  <Ikon namn="bock" />
                </i>
                <span>{bekraftelse}</span>
              </div>
            ) : null}

            {fel ? (
              <div role="alert" className="rg-rad rg-fel">
                <i aria-hidden="true">!</i>
                <div>
                  <p>
                    <b>{LOGIN.fel.rubrik}</b>
                  </p>
                  <p>{fel}</p>
                </div>
              </div>
            ) : null}

            <GoogleSignInButton
              next={mal ?? '/dashboard'}
              label={LOGIN.google}
              busyLabel={STEG2.googleOppnar}
              errorText={STEG2.googleFel}
              className="rg-google"
            />
            <p className="rg-eller" aria-hidden="true">
              {STEG2.eller}
            </p>

            <form id={formId} onSubmit={skicka} noValidate className="rg-form">
              <div className="rg-falt">
                <label htmlFor={`${formId}-epost`}>{LOGIN.epost}</label>
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
                />
              </div>
              <div className="rg-falt">
                <label htmlFor={`${formId}-losen`}>{LOGIN.losen}</label>
                <input
                  id={`${formId}-losen`}
                  type="password"
                  autoComplete="current-password"
                  enterKeyHint="done"
                  value={losen}
                  onChange={(e) => setLosen(e.target.value)}
                  aria-invalid={fel === LOGIN.fel.fel || undefined}
                />
                <Link href="/auth/forgot-password" className="rg-glomt">
                  {LOGIN.glomt}
                </Link>
              </div>
              <button type="submit" disabled={busy} aria-disabled={busy || undefined} className="p3-knapp p3-knapp-bred">
                {busy ? LOGIN.busy : LOGIN.primar}
              </button>
            </form>

            <p className="rg-byt">
              {LOGIN.harInte}{' '}
              <Link href={registerHref} onClick={markeraIngang}>
                {LOGIN.skapa}
              </Link>
            </p>
          </div>

          {/* Panelen bredvid kortet (nytt-innehall.md, inloggning): de fyra delarna väntar.
              Text som läses upp, inga rubriker (sidan har bara sin H1). */}
          <div className="rg-tillbaka">
            <p className="p3-ey">{LOGIN.panel.kick}</p>
            <p className="rg-h2">{LOGIN.panel.rubrik}</p>
            <ul className="rg-vantar">
              {LOGIN.panel.delar.map((d) => (
                <li key={d.namn} className="rg-vt" data-p3-farg={d.farg}>
                  <Dorr ikon={d.farg} />
                  <b>{d.namn}</b>
                  <span>{d.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PubliktFlodesskal>
  )
}
