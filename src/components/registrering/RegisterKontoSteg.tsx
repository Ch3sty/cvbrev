'use client'

/**
 * Steg 2, kontot (docs/design/profil-registrering-2026-09-24.html, Del B
 * steg 2). Google först, en avdelare och två fält i profilens fältform.
 * Namnfältet togs bort 2026-11-09: tappet skedde före första tangenttrycket
 * (158 såg steget, 30 började). Namnet frågas efter där det behövs, i CV,
 * personliga brev och profilen (NameRequiredNotice, KontaktuppgifterRad).
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
import { useEffect, useId, useState } from 'react'
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
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import StatusRow from '@/components/shell/StatusRow'
import ProvBrickor, { ProvBricka } from '@/components/publikt/ProvBrickor'
import { arNyProvTyp } from '@/lib/tests/prov-typer'
import { lasSparatProv, type Rutnat } from '@/lib/tests/prova-lokalt'
import type { ProvResultat } from '@/lib/tests/prov-resultat.server'
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
import {
  KONTO_GRATIS,
  KONTO_PANEL,
  PROV_TYP_PANEL,
  SKAL,
  SMAKPROV,
  SMAKPROV_UNDER,
  STEG2,
  type PanelRad,
} from './registrering-copy'

const MIN_LOSEN = 8

type FaltFel = 'epost' | 'losen' | null

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
  /** Frågan i steg 1 visades. Falsk på bar /register: frågan ställs i spårvalet. */
  fragaVisad?: boolean
  /** "Ändra" i valraden och tillbaka-pilen: till steg 1 med valet kvar. */
  onAndraVal?: () => void
  /** Steg 1 finns i det här läget, så pilen och stegräknaren visas. */
  visaSteg?: boolean
  /** Provets resultat ur servern (bara antal rätt, totalt och felens positioner). */
  provResultat?: ProvResultat | null
  /** Anropas när panelen är renderad, för signup_flow_viewed. */
  onPanelRenderad?: () => void
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
  fragaVisad = true,
  onAndraVal,
  visaSteg = false,
  provResultat = null,
  onPanelRenderad,
}: RegisterKontoStegProps) {
  const router = useRouter()
  const formId = useId()
  const [epost, setEpost] = useState('')
  const [losen, setLosen] = useState('')
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<Fel | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Mejlvalet: frivilligt, oikryssat, stoppar aldrig kontot.
  const [erbjudanden, setErbjudanden] = useState(false)

  // Smakprovets token läggs också i sessionStorage, som överlever Googles
  // redirect i samma flik. Cookien är huvudvägen, det här är reserven.
  useEffect(() => {
    smakprovTillSession(smakprov)
  }, [smakprov])

  const loginHref = loggaInHref({ intent, smakprov, paket, redirect })

  const skrivCookie = () =>
    skrivSignupCookie({ intent, entry, skipped, fragaVisad, smakprov, paket, redirect, erbjudanden })

  /** signup_failed med felkoden (undersökningen 2026-10-12). Aldrig adressen. */
  const matFel = (steg: 'validering' | 'turnstile' | 'signup', felkod: string) =>
    capture('signup_failed', { method: 'password', steg, felkod: felkod.slice(0, 80), intent, entry })

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setFel(null)

    if (!epost.includes('@') || epost.trim().length < 4) {
      setFel({ rubrik: STEG2.fel.epost, falt: 'epost' })
      matFel('validering', 'epost')
      return
    }
    if (losen.length < MIN_LOSEN) {
      setFel({ rubrik: STEG2.fel.losen, falt: 'losen' })
      matFel('validering', 'losen')
      return
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setFel({ rubrik: STEG2.fel.mansklig, falt: null })
      matFel('turnstile', 'turnstile_saknas')
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
          matFel('turnstile', res.ok ? 'turnstile_nekad' : `turnstile_http_${res.status}`)
          setBusy(false)
          return
        }
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: epost.trim(),
        password: losen,
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
        body: JSON.stringify({ userId, source: 'password', acquisition: getAcquisitionSource(), erbjudanden }),
      }).catch((err) => console.error('[register] post-signup misslyckades:', err))

      void fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.user.email, userId, isInvitation: false }),
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
      // Supabases AuthError har code (user_already_exists, weak_password,
      // over_email_send_rate_limit); våra egna fel har bara meddelandet.
      const kod =
        typeof err?.code === 'string' && err.code
          ? err.code
          : m.includes('already registered') || m.includes('already been registered')
            ? 'user_already_exists'
            : m === 'no_user'
              ? 'no_user'
              : typeof err?.status === 'number'
                ? `http_${err.status}`
                : err?.name === 'TypeError'
                  ? 'natverk'
                  : 'okant'
      matFel('signup', kod)
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
  const arTest = smakprov?.typ === 'test'

  // Panelen bredvid formuläret (skissen 2026-11-09): efter provet visar den
  // besökarens resultat, på bar /register vad som ingår gratis. Övriga
  // lägen har bara formuläret.
  const panel: 'prov' | 'gratis' | null = arTest ? 'prov' : lage === 'tratt' ? 'gratis' : null

  const eyebrow = arTest ? null : smak ? smak.eyebrow : visaSteg ? STEG2.steg : null
  const rubrik =
    arTest && provResultat && provResultat.fel.length === 0
      ? STEG2.rubrikAllaRatt
      : smak
        ? smak.rubrik
        : STEG2.rubrik
  const under = smak ? (smak.under ?? SMAKPROV_UNDER) : STEG2.under
  const underFet = under.startsWith(STEG2.underFet) ? STEG2.underFet : null

  // Brickornas figurer: rutnäten besökaren redan sett, ur fliken.
  const [rutnat, setRutnat] = useState<Rutnat[]>([])
  useEffect(() => {
    if (!arTest || !smakprov) return
    setRutnat(lasSparatProv(smakprov.token)?.rutnat ?? [])
  }, [arTest, smakprov])

  // Panelen står i första bilden (resultatet kommer från servern), så den är
  // renderad när effekten körs.
  useEffect(() => {
    onPanelRenderad?.()
  }, [onPanelRenderad])

  const google = (
    <GoogleSignInButton
      next={VALKOMMEN_PATH}
      label={STEG2.google}
      busyLabel={STEG2.googleOppnar}
      errorText={STEG2.googleFel}
      signup={{ intent, entry }}
      onBeforeRedirect={skrivCookie}
      className="pub-konto-google"
    />
  )

  return (
    <PubliktFlodesskal
      steg={medPil ? { nu: 2, av: 3 } : undefined}
      onBack={medPil ? onAndraVal : undefined}
      toppLank={{ href: loginHref, text: SKAL.loggaIn, forklaring: SKAL.harKonto }}
      bredd="full"
    >
      <div className={`pub-konto${panel ? ' pub-konto-med-panel' : ''}`}>
        <div className="pub-konto-g">
          {panel === 'prov' ? <ProvPanel resultat={provResultat} rutnat={rutnat} /> : null}
          {panel === 'gratis' ? <GratisPanel /> : null}

          <div className="pub-konto-form">
            {eyebrow ? <p className="pub-konto-eyebrow">{eyebrow}</p> : null}
            <h1>{rubrik}</h1>
            {fel ? null : (
              <p className="pub-konto-under">
                {underFet ? (
                  <>
                    <b>{underFet}</b>
                    {under.slice(underFet.length)}
                  </>
                ) : (
                  under
                )}
              </p>
            )}

            {fel ? (
              <div role="alert" className="pub-konto-fel">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5.5M12 16.5v.01" />
                </svg>
                <div className="min-w-0">
                  <p className="pub-konto-fel-rubrik">{fel.rubrik}</p>
                  {fel.text ? <p>{fel.text}</p> : null}
                  {fel.loggaIn ? (
                    <Link href={loginHref} className="pub-lank inline-flex min-h-11 items-center">
                      {STEG2.fel.finnsLank}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}

            {smak && !arTest && !fel ? (
              <StatusRow tone="positive" showDot>
                {smak.status}
              </StatusRow>
            ) : null}

            {intent && !smak && !fel && (lage === 'tratt' || lage === 'konto') ? (
              <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-kant bg-panel px-3 py-2">
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
                <p className="pub-konto-eller" aria-hidden="true">
                  {STEG2.eller}
                </p>
              </>
            ) : null}

            <form id={formId} onSubmit={skicka} noValidate className="pub-konto-falt-g">
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
              {/* Mejlvalet: frivilligt och oikryssat, före knappen så att valet
                  syns innan kontot skapas. Följer med genom Google i jc_signup. */}
              <label className="pub-konto-villkor" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', minHeight: 44, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={erbjudanden}
                  onChange={(e) => setErbjudanden(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: 'var(--ink-1)', cursor: 'pointer' }}
                />
                <span>{STEG2.erbjudanden}</span>
              </label>
              <button type="submit" disabled={busy} aria-disabled={busy || undefined} className="pub-knapp pub-konto-knapp">
                {busy ? STEG2.busy : smak ? smak.knapp : STEG2.primar}
              </button>
            </form>

            {fel ? google : null}

            <p className="pub-konto-villkor">
              {STEG2.villkorFore}
              <Link href="/anvandarvillkor">{STEG2.villkorLank}</Link>
              {STEG2.villkorMitt}
              <Link href="/integritetspolicy">{STEG2.integritetLank}</Link>
              {STEG2.villkorEfter}
            </p>
          </div>
        </div>
      </div>
    </PubliktFlodesskal>
  )
}

/* ------------------------------------------------------------ panelerna */

function PanelRader({ rader }: { rader: readonly PanelRad[] }) {
  return (
    <ul className="pub-prov-bock">
      {rader.map((r) => (
        <li key={r.fet}>
          <span>
            <b>{r.fet}</b>
            {r.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

function PremiumRad({ text }: { text: string }) {
  return (
    <p className="pub-konto-premium">
      <b>{KONTO_PANEL.premiumRad.namn}</b>
      {text}
    </p>
  )
}

/**
 * Efter provet: talet, de fem brickorna med den missade markerad och vad
 * kontot öppnar. Utan resultat (provet hämtat, utgånget eller över
 * gränsen) samma löfte utan tal, aldrig ett påhittat resultat.
 */
function ProvPanel({ resultat, rutnat }: { resultat: ProvResultat | null; rutnat: Rutnat[] }) {
  const totalt = resultat?.totalt ?? 5
  // Typerna utöver matrisen (spec-prov-fler-typer avsnitt 4): samma panel, egna rader.
  const ny = resultat?.typ && arNyProvTyp(resultat.typ) ? resultat.typ : null
  if (ny) rutnat = []
  const forstaFel = resultat?.fel[0]
  const lasbild = typeof forstaFel === 'number' ? rutnat[forstaFel] : undefined
  return (
    <aside className={`pub-rum-tran pub-konto-panel${resultat && resultat.fel.length ? ' pub-konto-panel-bild' : ''}`}>
      <p className="pub-kick">{KONTO_PANEL.kick}</p>
      {resultat ? (
        <div className="pub-konto-prov-rad">
          <p className="pub-konto-tal">
            {resultat.ratt}
            <small>{KONTO_PANEL.av(resultat.totalt)}</small>
          </p>
          <ProvBrickor totalt={resultat.totalt} fel={resultat.fel} rutnat={rutnat} numrerade={false} />
        </div>
      ) : null}
      <h2>{ny && resultat ? PROV_TYP_PANEL.rubrik(ny, resultat.fel, resultat.totalt) : resultat ? KONTO_PANEL.rubrik(resultat.fel, resultat.totalt) : KONTO_PANEL.rubrikUtan}</h2>
      <PanelRader rader={ny ? PROV_TYP_PANEL.rader(ny, resultat?.fel ?? null, totalt) : KONTO_PANEL.rader(resultat?.fel ?? null, totalt)} />
      <div className="pub-konto-dator">
        <PremiumRad text={ny ? PROV_TYP_PANEL.premium(ny) : KONTO_PANEL.premiumRad.text} />
      </div>
      {lasbild ? <ProvBricka rutnat={lasbild} className="pub-konto-lasbild" /> : null}
    </aside>
  )
}

/** Bar /register: vad som ingår gratis, samma panel. */
function GratisPanel() {
  return (
    <aside className="pub-rum-tran pub-konto-panel">
      <p className="pub-kick">{KONTO_GRATIS.kick}</p>
      <h2>{KONTO_GRATIS.rubrik}</h2>
      <ul className="pub-konto-ger">
        {KONTO_GRATIS.rader.map((r) => (
          <li key={r.namn}>
            <span className="pub-konto-obj" aria-hidden="true">
              <GratisIkon typ={r.ikon} />
            </span>
            <div>
              <b>{r.namn}</b>
              <span>{r.text}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="pub-konto-dator">
        <PremiumRad text={KONTO_GRATIS.premium} />
      </div>
    </aside>
  )
}

function GratisIkon({ typ }: { typ: 'matris' | 'cv' | 'brev' }) {
  if (typ === 'matris')
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <rect x="6" y="6" width="52" height="52" rx="8" />
        <path d="M23 6v52M41 6v52M6 23h52M6 41h52" opacity=".45" />
        <circle cx="14.5" cy="14.5" r="3.5" />
        <path d="M28 18h8v-7" />
        <circle cx="32" cy="32" r="3.5" />
        <rect x="44" y="44" width="10" height="10" rx="2" fill="var(--koppar)" stroke="none" />
      </svg>
    )
  if (typ === 'cv')
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <rect x="10" y="6" width="40" height="52" rx="6" />
        <circle cx="22" cy="19" r="4" />
        <path d="M31 17h12M18 31h28M18 39h28M18 47h18" />
        <circle cx="50" cy="12" r="9" fill="var(--rum-vagg)" />
        <path d="M50 4a8 8 0 1 1-7 4" stroke="var(--koppar)" strokeWidth="3" />
      </svg>
    )
  return (
    <svg viewBox="0 0 64 64" focusable="false">
      <path d="M12 6h26l14 14v36a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M38 6v14h14M18 30h24M18 38h28M18 46h28" />
      <rect x="18" y="51" width="18" height="4" rx="2" fill="var(--koppar)" stroke="none" />
    </svg>
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
    <div className="pub-konto-falt">
      <label htmlFor={id}>
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
      />
    </div>
  )
}
