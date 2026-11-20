'use client'

/**
 * Spärren efter de publika proven, omgång 3 (beslut A, B, D, F; förlagorna
 * Publik-prov-resultat, -en, -noll och Publik-artikel-resultat): det mörka
 * kortet med rubriken per variant, Skapa konto gratis, Google-knappen som bär
 * provets token, löftena som är sanna för gratiskontot och villkorsraden
 * ordagrant ur STEG2.villkor*. På telefon ett fast ark i tumgrepp med samma
 * rubrik och knapp.
 *
 * Google-knappen laddas först när spärren ritas (next/dynamic), så att
 * Supabase-klienten inte belastar provsidans första laddning.
 *
 * Inga rubrikelement (h1 till h6): kortet står också i artiklarnas provruta,
 * som inte får lägga till rubriker. Provsidan sätter sin egen rubriknivå runt.
 */

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { capture, type SparrKontext } from '@/lib/analytics/events'
import { gateCtaKlick } from '@/lib/analytics/sparren'
import { storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { skrivSignupCookie } from '@/components/registrering/intent'
import { STEG2 } from '@/components/registrering/registrering-copy'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { Las } from '@/components/session/Marke'
import { IkonPil } from '@/components/session/resultat/delar'
import { VALKOMMEN_PATH } from '@/lib/onboarding/steps'
import type { ProvTyp } from '@/lib/tests/prov-typer'
import type { OppetFacitVariant } from '@/lib/tests/oppet-facit'
import { PROV3 } from './prov-copy'

/* ------------------------------------------------------------ Google */

function GoogleVantar() {
  return (
    <div className="prov3-google">
      <button type="button" disabled aria-hidden="true" tabIndex={-1}>
        {PROV3.sparr.google}
      </button>
    </div>
  )
}

const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false, loading: GoogleVantar })

/** Google från spärren: provets token följer med genom jc_signup och fliken, signup_started skjuts av knappen. */
export function SparrGoogle({ token, ktx, className = '' }: { token: string; ktx: SparrKontext; className?: string }) {
  return (
    <GoogleSignInButton
      next={VALKOMMEN_PATH}
      label={STEG2.google}
      busyLabel={STEG2.googleOppnar}
      errorText={STEG2.googleFel}
      signup={{ intent: null, entry: 'smakprov' }}
      onBeforeRedirect={() => {
        storePendingTestSession(token)
        skrivSignupCookie({ intent: null, entry: 'smakprov', skipped: false, fragaVisad: false, smakprov: { typ: 'test', token } })
        gateCtaKlick('google', ktx)
      }}
      className={`prov3-google ${className}`.trim()}
    />
  )
}

/** Villkorsraden, ordagrant ur registreringen (beslut F). */
export function Villkorsrad({ className = '' }: { className?: string }) {
  return (
    <p className={`prov3-villkor ${className}`.trim()} data-prov-villkor>
      {STEG2.villkorFore}
      <Link href="/anvandarvillkor">{STEG2.villkorLank}</Link>
      {STEG2.villkorMitt}
      <Link href="/integritetspolicy">{STEG2.integritetLank}</Link>
      {STEG2.villkorEfter}
    </p>
  )
}

/* ------------------------------------------------------------ löftena */

export function LoftesIkon({ id }: { id: 'forklaringar' | 'niva' | 'grund' }) {
  if (id === 'forklaringar') {
    return (
      <svg viewBox="0 0 56 44" width="56" height="44" aria-hidden="true" focusable="false">
        <rect x="8" y="7" width="11" height="11" rx="3" fill="var(--papper)" />
        <rect x="22.5" y="7" width="11" height="11" rx="3" fill="var(--papper)" />
        <rect x="37" y="7" width="11" height="11" rx="3" fill="var(--papper)" />
        <path d="M13.5 9.5l3.5 6h-7z" fill="none" stroke="var(--ink-1)" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="28" cy="12.5" r="3.2" fill="none" stroke="var(--ink-1)" strokeWidth="1.6" />
        <rect x="39.5" y="9.5" width="6" height="6" rx="1" fill="var(--sess-ratt-yta)" stroke="var(--sess-ratt)" strokeWidth="1.6" />
        <rect x="8" y="24" width="40" height="4" rx="2" fill="var(--sess-indigo-mjuk)" />
        <rect x="8" y="32" width="26" height="4" rx="2" fill="var(--vagg-mjuk)" opacity=".7" />
      </svg>
    )
  }
  if (id === 'niva') {
    return (
      <svg viewBox="0 0 56 44" width="56" height="44" aria-hidden="true" focusable="false">
        <text x="8" y="12" fontSize="8" fontWeight="700" fill="var(--vagg-ink)">1</text>
        <text x="40" y="12" fontSize="8" fontWeight="700" fill="var(--vagg-ink)">10</text>
        <rect x="8" y="19" width="40" height="6" rx="3" fill="var(--vagg-2)" />
        <rect x="8" y="19" width="22" height="6" rx="3" fill="var(--koppar)" />
        <circle cx="16" cy="22" r="6" fill="var(--koppar)" stroke="var(--vagg-ink)" strokeWidth="2" />
        <path d="M16 31v6M13.5 33.5L16 31l2.5 2.5" fill="none" stroke="var(--koppar)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 56 44" width="56" height="44" aria-hidden="true" focusable="false">
      <rect x="7" y="7" width="18" height="20" rx="4" fill="var(--papper)" />
      <text x="16" y="22.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ink-1)">1</text>
      <text x="29" y="14" fontSize="6.5" fontWeight="700" fill="var(--koppar)">test</text>
      <text x="29" y="22" fontSize="6.5" fontWeight="700" fill="var(--koppar)">per dag</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={10 + i * 6} cy="35" r="2.2" fill={i === 0 ? 'var(--koppar)' : 'var(--vagg-mjuk)'} opacity={i === 0 ? 1 : 0.6} />
      ))}
    </svg>
  )
}

export function Loften({
  typ,
  variant,
  ratt,
  antal,
  lasta,
  layout = 'lista',
}: {
  typ: ProvTyp
  variant: OppetFacitVariant
  ratt: number
  antal: number
  lasta: readonly number[]
  /** lista: ikon till vänster (provsidan, registreringen); brickor: tre kort i rad (artikeln). */
  layout?: 'lista' | 'brickor'
}) {
  const rader = PROV3.loften(typ, variant, ratt, antal, lasta)
  return (
    <ul className="prov3-loften" data-layout={layout} data-prov-loften>
      {rader.map((r) => (
        <li key={r.id} data-lofte={r.id}>
          <i aria-hidden="true">
            <LoftesIkon id={r.id} />
          </i>
          <span>
            <b>{r.titel}</b>
            <span>{r.text}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ nivåskalan (noll missar) */

function NivaSkala() {
  const S = PROV3.sparr
  return (
    <div className="prov3-niva" aria-hidden="true" data-prov-niva>
      <div className="prov3-niva-ord">
        <span>{S.nivaGrund}</span>
        <span data-prov>{S.nivaProv}</span>
        <span>{S.nivaExpert}</span>
      </div>
      <div className="prov3-niva-band">
        <i />
        <i data-prov />
        <i />
        <u>?</u>
      </div>
      <div className="prov3-niva-tal">
        <span>1</span>
        <span>4</span>
        <span>7</span>
        <span>10</span>
      </div>
      <p className="mt-2 text-[13px] leading-[18px] text-vagg-mjuk">
        {S.nivaDin} <b className="font-semibold text-vagg-ink">{S.nivaInte}</b>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ kortet */

export interface SparrData {
  typ: ProvTyp
  variant: OppetFacitVariant
  antalFel: number
  antal: number
  ratt: number
  /** Uppgifterna (index) som väntar bakom låset: missarna utom den öppna, eller alla utom den öppna vid noll. */
  lasta: readonly number[]
  token: string
  ktx: SparrKontext
  /** signup_started:s source_page, som förut. */
  sourcePage: string
  /** data-cta på kortets knapp: prova-gate eller artikel-prov-gate. */
  cta: string
}

export function registerHrefFor(token: string): string {
  return `/register?test=${encodeURIComponent(token)}`
}

/** Kortets knapp: signup_started som förut, och gate_cta_clicked med platsen. */
export function SkapaKontoLank({
  d,
  position,
  cta,
  className,
  children,
}: {
  d: SparrData
  position: 'ark' | 'kort'
  cta: string
  className: string
  children: ReactNode
}) {
  return (
    <Link
      href={registerHrefFor(d.token)}
      data-cta={cta}
      className={className}
      onClick={() => {
        capture('signup_started', { cluster: 'test', source_page: d.sourcePage })
        gateCtaKlick(position, d.ktx)
      }}
    >
      {children}
    </Link>
  )
}

/**
 * Provsidans spärrkort (kolumnen till höger på dator, sist på telefon).
 * `topp` är miniatyrerna av de låsta uppgifterna över raden "väntar på dig".
 */
export function ProvSparrKort({ d, topp }: { d: SparrData; topp?: ReactNode }) {
  const S = PROV3.sparr
  const vantar = S.vantar(d.variant, d.variant === 'noll' ? [] : d.lasta)
  return (
    <section aria-label={S.eyebrow} className="res-nasta prov3-sparr" data-prova-sparr data-variant={d.variant}>
      <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true" className="pointer-events-none absolute -right-[70px] -top-20">
        <circle cx="100" cy="100" r="100" fill="var(--sess-res-panel)" />
      </svg>
      <div className="relative">
        {d.variant === 'noll' ? (
          <NivaSkala />
        ) : vantar ? (
          <div className="prov3-vantar">
            {topp ? <span className="prov3-vantar-mini">{topp}</span> : null}
            <span className="text-[13px] leading-[18px] text-vagg-mjuk">
              {vantar.fet}
              <br />
              <b className="font-semibold text-vagg-ink">{vantar.text}</b>
            </span>
          </div>
        ) : null}
        <p className="res-ey mt-4 flex items-center gap-2" style={{ color: 'var(--sess-lucka-ink)' }}>
          <Las storlek={13} />
          {S.eyebrow}
        </p>
        <p className="prov3-sparr-rubrik" data-sparr-rubrik>
          {S.rubrik(d.typ, d.variant, d.antalFel, d.antal)}
        </p>
        <SkapaKontoLank d={d} position="kort" cta={d.cta} className={`${KNAPP_PRIMAR} res-stor mt-5 w-full`}>
          {S.knapp}
          <IkonPil />
        </SkapaKontoLank>
        <SparrGoogle token={d.token} ktx={d.ktx} className="mt-3" />
        <p className="mt-3 text-center text-[13px] leading-[18px] text-vagg-mjuk">{S.liten}</p>
        <Loften typ={d.typ} variant={d.variant} ratt={d.ratt} antal={d.antal} lasta={d.lasta} />
        <Villkorsrad className="mt-4" />
      </div>
    </section>
  )
}

/** Telefonens fasta ark i tumgrepp: rubriken och knappen. Döljs när kortet sist på sidan syns. */
export function ProvSparrArk({ d, dold }: { d: SparrData; dold: boolean }) {
  const S = PROV3.sparr
  return (
    <div className="res-fot prov3-ark" data-prov-ark data-dold={dold ? '' : undefined} aria-hidden={dold || undefined}>
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-2.5">
        <span className="prov3-ark-handtag" aria-hidden="true" />
        <p className="m-0 flex items-center gap-3">
          <span className="prov3-ark-las" aria-hidden="true">
            <Las storlek={16} />
          </span>
          <span className="min-w-0">
            <b className="block text-[15px] font-semibold leading-5 text-vagg-ink">{S.arkRubrik(d.typ, d.variant, d.antalFel, d.antal)}</b>
            <span className="block text-[13px] leading-[18px] text-vagg-mjuk">{S.liten}</span>
          </span>
        </p>
        <SkapaKontoLank d={d} position="ark" cta={`${d.cta}-ark`} className={`${KNAPP_PRIMAR} res-stor !h-14 w-full`}>
          {S.knapp}
          <IkonPil />
        </SkapaKontoLank>
      </div>
    </div>
  )
}
