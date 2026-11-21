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
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget'
import StatusRow from '@/components/shell/StatusRow'
import { PROV3, PROV_NAMN, PROV_RAM } from '@/components/publikt/prov/prov-copy'
import { arNyProvTyp, type ProvTyp } from '@/lib/tests/prov-typer'
import { lasSparatProv, type Rutnat } from '@/lib/tests/prova-lokalt'
import { valjOppetFacit } from '@/lib/tests/oppet-facit'
import Marke, { Las } from '@/components/session/Marke'
import { IkonTillbaka } from '@/components/illustrations/RumSymboler'
import { Loften } from '@/components/publikt/prov/ProvSparr'
import { harRutnat, Mini } from '@/components/publikt/prov/ProvResultatSida'
import { franMatris, type MatrisFraga, type ProvPost } from '@/components/publikt/prov/provPost'
import type { ProvResultat } from '@/lib/tests/prov-resultat.server'
import { VALKOMMEN_PATH, TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'
import type { PlanKey } from '@/lib/plans/plans'
import PubliktFlodesskal, { TEXTLANK } from './PubliktFlodesskal'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import IntentIkon from './IntentIkon'
import {
  giltigtSmakprov,
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
  brickorText,
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
  /** Nio-raderna för panelerna, ritade på servern (S1, S3). */
  nio?: NioRader
}

/** Testelementet Nio som färdiga serverelement, ett per panel. */
export interface NioRader {
  prov: ReactNode
  gratis: ReactNode
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
  // Smakprovet följer med i adressen (/dashboard/valkommen?test=<token>), så att
  // valkommen-sidan hämtar hem det också för ett befintligt konto, som inte har
  // cookien jc_signup (2026-11-21: utan token skickades kontot till /dashboard
  // och provet blev ohämtat). Bara den fasta sökvägen och en token i rätt format.
  if (p.smakprov) q.set('redirect', giltigtSmakprov(p.smakprov.typ, p.smakprov.token) ? `${VALKOMMEN_PATH}?${p.smakprov.typ}=${encodeURIComponent(p.smakprov.token)}` : VALKOMMEN_PATH)
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
  nio,
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
    arTest && provResultat
      ? STEG2.rubrik
      : smak
        ? smak.rubrik
        : STEG2.rubrik
  const under = smak ? (smak.under ?? SMAKPROV_UNDER) : STEG2.under
  const underFet = under.startsWith(STEG2.underFet) ? STEG2.underFet : null

  // Brickornas figurer: rutnäten besökaren redan sett, ur fliken.
  const [rutnat, setRutnat] = useState<Rutnat[]>([])
  const [provPoster, setProvPoster] = useState<ProvPost[]>([])
  useEffect(() => {
    if (!arTest || !smakprov) return
    const sparat = lasSparatProv(smakprov.token)
    setRutnat(sparat?.rutnat ?? [])
    // Matrisens rutnät som hon redan sett, för panelens miniatyrer (inget facit).
    if (sparat && (!sparat.typ || sparat.typ === 'matris')) {
      const fragor = (sparat.uppgifter as MatrisFraga[] | undefined) ?? sparat.rutnat.map((g, i) => ({ id: `r${i}`, grid: g, options: [] }))
      setProvPoster(fragor.map(franMatris))
    }
  }, [arTest, smakprov])
  const provMedResultat = arTest && Boolean(provResultat)

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

  const formular = (
    <div className="pub-konto-form">
      {eyebrow ? <p className="pub-konto-eyebrow">{eyebrow}</p> : null}
      <h1>{rubrik}</h1>
      {fel ? null : provMedResultat && provResultat ? (
        <p className="pub-konto-under" data-prov-sedan>
          {PROV3.panel.sedan(
            provResultat.typ && arNyProvTyp(provResultat.typ) ? provResultat.typ : 'matris',
            valjOppetFacit(provResultat.fel, provResultat.totalt).variant,
            lastaFor(provResultat),
            provResultat.totalt
          )}
          <br />
          <b>{PROV3.panel.gratis}</b>
        </p>
      ) : (
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
  )

  // Efter provet (beslut G, förlagan Publik-registrering-1440 och -412): mörk vänsterhalva i
  // full höjd med provresultatet och löftena, formuläret i ett vitt kort till höger. Den
  // vanliga registreringen utan prov är som förut.
  if (provMedResultat && provResultat) {
    return (
      <div className="prov3-reg" data-prov-registrering>
        <ProvPanel
          resultat={provResultat}
          rutnat={rutnat}
          poster={provPoster}
          topp={
            <div className="prov3-reg-topp">
              <button type="button" onClick={() => router.back()} aria-label="Tillbaka till provet" className="res-x">
                <IkonTillbaka />
              </button>
              <Link href="/" className="inline-flex min-h-11 items-center font-sess-display text-[19px] font-extrabold tracking-[-.01em] text-vagg-ink">
                jobbcoach.ai
              </Link>
              <Link href={loginHref} className="ml-auto inline-flex min-h-11 items-center text-sm font-semibold text-vagg-ink underline underline-offset-[3px] min-[900px]:hidden">
                {SKAL.loggaIn}
              </Link>
            </div>
          }
        />
        <div className="prov3-reg-hoger">
          <p className="prov3-reg-logga-in">
            {SKAL.harKonto}{' '}
            <Link href={loginHref} className="inline-flex min-h-11 items-center font-semibold text-ink-1 underline underline-offset-[3px]">
              {SKAL.loggaIn}
            </Link>
          </p>
          <div className="prov3-reg-kort">{formular}</div>
          <ProvLoftenEfter resultat={provResultat} />
        </div>
      </div>
    )
  }

  return (
    <PubliktFlodesskal
      steg={medPil ? { nu: 2, av: 3 } : undefined}
      onBack={medPil ? onAndraVal : undefined}
      toppLank={{ href: loginHref, text: SKAL.loggaIn, forklaring: SKAL.harKonto }}
      bredd="full"
    >
      <div className={`pub-konto${panel ? ' pub-konto-med-panel' : ''}`}>
        <div className="pub-konto-g">
          {panel === 'prov' ? <ProvPanel resultat={provResultat} rutnat={rutnat} nio={nio?.prov} poster={provPoster} /> : null}
          {panel === 'gratis' ? <GratisPanel nio={nio?.gratis} /> : null}

          {formular}
        </div>
      </div>
    </PubliktFlodesskal>
  )
}

/* ------------------------------------------------------------ panelerna */

function PremiumRad({ text }: { text: string }) {
  return (
    <p className="pub-konto-premium">
      <b>{KONTO_PANEL.premiumRad.namn}</b>
      {/* Priset följer kampanjen (K2, K3): KampanjHuvud väljer variant före första målningen. */}
      <MedKampanjPris text={text} />
    </p>
  )
}

/**
 * Efter provet (omgång 2 steg C, skissen Register-prov): sessionsramens
 * resultatbild. Väggen med ringen och "3 av 5 rätt", Uppgiftslistans låsta
 * rader (på mobil märkena i en rad) och raden om vad kontot låser upp.
 * Resultatet kommer från servern (antal rätt, totalt, vilka som blev fel);
 * miniatyrerna ritas bara när matrisens rutnät finns i fliken. Utan
 * resultat (provet hämtat, utgånget eller över gränsen) samma löfte utan
 * tal, aldrig ett påhittat resultat.
 */
function ProvPanel({ resultat, rutnat, nio, poster, topp }: { resultat: ProvResultat | null; rutnat: Rutnat[]; nio?: ReactNode; poster: ProvPost[]; topp?: ReactNode }) {
  const typ: ProvTyp = resultat?.typ && arNyProvTyp(resultat.typ) ? resultat.typ : 'matris'
  // Rutnäten är matrisens; typerna utöver matrisen har inga i fliken.
  if (typ !== 'matris') rutnat = []
  const P = PROV_RAM.panel
  const eyebrow = !resultat ? KONTO_PANEL.kick : typ === 'iprov' ? P.eyebrowIprov : P.eyebrow(PROV_NAMN[typ])
  if (resultat) return <ProvPanel3 resultat={resultat} typ={typ} eyebrow={eyebrow} poster={poster} topp={topp} />
  return (
    <aside className="prov-rum pub-konto-provpanel self-start overflow-hidden rounded-[18px] border border-kant bg-papper shadow-lyft" data-prov-panel>
      <div className="vagg px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.08em] text-koppar-ljus">{eyebrow}</p>
        <h2 className="mt-1 font-sess-display text-[20px] font-bold leading-[26px] text-vagg-ink">{KONTO_PANEL.rubrikUtan}</h2>
        {nio ? <div className="mt-4">{nio}</div> : null}
      </div>
      <p className="border-t border-kant px-5 py-3.5 text-sm leading-5 text-ink-2 sm:px-6">{P.fot(typ)}</p>
    </aside>
  )
}

/**
 * Omgång 3 (beslut G, förlagan Publik-registrering): provresultatet och det
 * konkreta löftet. Huvudtalet, uppgifterna med Rätt, Öppet (den som var
 * öppen efter provet) och Öppnas (det som väntar bakom kontot) och löftena
 * för gratiskontot. Varianten och den öppna uppgiften räknas med samma regel
 * som servern (valjOppetFacit). Telefonen: en kompakt rad överst, löftena
 * efter formuläret (ProvLoftenEfter).
 */
function ProvPanel3({ resultat, typ, eyebrow, poster, topp }: { resultat: ProvResultat; typ: ProvTyp; eyebrow: string; poster: ProvPost[]; topp?: ReactNode }) {
  const { index: oppen, variant } = valjOppetFacit(resultat.fel, resultat.totalt)
  const fel = new Set(resultat.fel)
  const lasta = lastaFor(resultat)
  return (
    <aside className="prov-rum pub-konto-provpanel prov3-regpanel" data-prov-panel data-variant={variant}>
      <div className="res-vagg prov3-regpanel-vagg">
        {topp}
        <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }}>
          {eyebrow}
        </p>
        <h2 className="sr-only">{typ === 'matris' ? KONTO_PANEL.rubrik(resultat.fel, resultat.totalt) : PROV_TYP_PANEL.rubrik(typ, resultat.fel, resultat.totalt)}</h2>
        <div className="prov3-regpanel-topp">
          <p className="prov3-regpanel-tal">{PROV_RAM.panel.huvudtal(resultat.ratt, resultat.totalt)}</p>
          <ol className="prov3-panel-rad" style={{ ['--kol' as string]: resultat.totalt }} role="img" aria-label={brickorText(resultat.fel, resultat.totalt)}>
            {Array.from({ length: resultat.totalt }, (_, i) => {
              const ratt = !fel.has(i)
              const chip = i === oppen ? 'oppet' : !ratt ? 'oppnas' : 'ratt'
              return (
                <li key={i} data-utfall={ratt ? 'ratt' : 'fel'} data-chip-lage={chip}>
                  <span className="prov3-mini-ruta">{harRutnat(poster[i]) ? <Mini post={poster[i]} /> : <b>{i + 1}</b>}</span>
                  <span className="prov3-chip" data-chip={chip}>
                    {chip === 'oppnas' ? <Las storlek={11} /> : <Marke typ={ratt ? 'ratt' : 'fel'} storlek={14} fylld />}
                    <span className="prov3-chip-text">{chip === 'oppet' ? PROV3.panel.chipOppet : chip === 'oppnas' ? PROV3.panel.chipOppnas : PROV3.panel.chipRatt}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
        <p className="prov3-regpanel-under">{PROV3.panel.under}</p>
        <div className="prov3-regpanel-loften">
          <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }}>
            {PROV3.panel.oppnas}
          </p>
          <Loften typ={typ} variant={variant} ratt={resultat.ratt} antal={resultat.totalt} lasta={lasta} />
        </div>
      </div>
    </aside>
  )
}

function lastaFor(resultat: ProvResultat): number[] {
  const { index, variant } = valjOppetFacit(resultat.fel, resultat.totalt)
  const fel = new Set(resultat.fel)
  return Array.from({ length: resultat.totalt }, (_, i) => i).filter((i) => i !== index && (variant === 'noll' || fel.has(i)))
}

/** Telefonen: löftena efter formuläret, på ljus botten. */
function ProvLoftenEfter({ resultat }: { resultat: ProvResultat }) {
  const typ: ProvTyp = resultat.typ && arNyProvTyp(resultat.typ) ? resultat.typ : 'matris'
  const { variant } = valjOppetFacit(resultat.fel, resultat.totalt)
  return (
    <div className="prov-rum prov3-reg-efter" data-prov-loften-efter>
      <p className="res-ey text-ink-3">{PROV3.panel.oppnas}</p>
      <div data-ton="ljus">
        <Loften typ={typ} variant={variant} ratt={resultat.ratt} antal={resultat.totalt} lasta={lastaFor(resultat)} />
      </div>
    </div>
  )
}

/** Bar /register: vad som ingår gratis, samma panel. */
function GratisPanel({ nio }: { nio?: ReactNode }) {
  return (
    <aside className="pub-rum-tran pub-konto-panel">
      <p className="pub-kick">{KONTO_GRATIS.kick}</p>
      <h2>{KONTO_GRATIS.rubrik}</h2>
      <ul className="pub-konto-ger">
        {KONTO_GRATIS.rader.map((r) => (
          // Testraden: Nio-raden i stället för 64-ikonen, så att bredden syns
          // innan kontot skapas (S3). Raden blir glyfrad, namn, text.
          <li key={r.namn} className={r.ikon === 'matris' && nio ? 'glyfrad' : undefined}>
            {r.ikon === 'matris' && nio ? (
              nio
            ) : (
              <span className="pub-konto-obj" aria-hidden="true">
                <GratisIkon typ={r.ikon} />
              </span>
            )}
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
