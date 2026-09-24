'use client'

/**
 * Arket "Kom igång" (docs/design/spec-onboarding-2026-09-22.html, sektion 2).
 *
 * Hela listan i logisk ordning: profilen och CV:t först, sedan det som
 * bygger på dem. Tre tillstånd per bricka, och färgen är aldrig ensam bärare:
 *
 *   klar    insjunken yta, ikonen på panel, fylld bock i ink-1
 *   nästa   kant i ink-1 med shadow-val, ikonen på accent-mjuk, etiketten
 *           "Föreslaget nästa" i accent-ink, ringen med accentprick
 *   kvar    panel med kant, tom ring i kant-stark
 *
 * Varje bricka går att öppna direkt: trycket går till handlingen. Ingen
 * "bara i Hela paketet"-etikett här, gränsen syns där den är (sektion 3).
 * Kvitteringen är aldrig en knapp: den sker på servern när handlingen görs.
 */

import Link from 'next/link'
import type { ComponentType } from 'react'
import Sheet from '@/components/shell/Sheet'
import { useKomIgang } from './KomIgangContext'
import {
  brickaText,
  komIgangRubrik,
  KOM_IGANG,
  OMRADE_FOR_BRICKA,
  OMRADE_FOR_INTENT,
  utanforIntent,
  type BrickaKey,
  type Paket,
} from '@/lib/onboarding/komigang'
import { capture } from '@/lib/analytics/events'
import type { SignupIntent } from '@/components/registrering/intent'
import {
  IlluScenBrev,
  IlluScenCoach,
  IlluScenCv,
  IlluScenIntervju,
  IlluScenMatch,
  IlluScenMatris,
  type ScenProps,
} from '@/components/illustrations/PriserScener'
import {
  IlluBrickaDiag,
  IlluBrickaKurva,
  IlluBrickaLinkedin,
  IlluBrickaMall,
  IlluBrickaOga,
  IlluBrickaPerson,
  IlluBrickaProfil,
  IlluBrickaUpp,
} from '@/components/illustrations/OnboardingScener'

/** Ikon per bricka. De fem ur PriserScener bär samma symbol som prissidan. */
export const BRICKA_IKON: Record<BrickaKey, ComponentType<ScenProps>> = {
  profil: IlluBrickaProfil,
  cv_upp: IlluBrickaUpp,
  analys: IlluScenCv,
  analys_gratis: IlluScenCv,
  uppdatera_cv: IlluScenCv,
  jobbmatchning: IlluScenMatch,
  mall: IlluBrickaMall,
  brev: IlluScenBrev,
  linkedin: IlluBrickaLinkedin,
  bli_upptackt: IlluBrickaOga,
  coach: IlluScenCoach,
  matris_grund: IlluScenMatris,
  matris_avancerad: IlluScenMatris,
  verbalt_numeriskt_grund: IlluBrickaDiag,
  provlage: IlluScenMatris,
  personlighet: IlluBrickaPerson,
  intervjuprov: IlluScenIntervju,
  kurva: IlluBrickaKurva,
}

type Tillstand = 'klar' | 'nasta' | 'kvar'

const LANK =
  'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

export default function KomIgangArk() {
  const { lage, fakta, arkOppet, stang, dolj } = useKomIgang()
  if (!lage) return null

  const rubrik = komIgangRubrik(lage.paket, lage.dagspass)

  return (
    <Sheet open={arkOppet} onClose={stang} bare size="md">
      <div className="px-4 pb-4 pt-2 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold leading-[26px] tracking-[-0.02em] text-ink-1">
              {rubrik}
            </h2>
            <span className="shrink-0 text-sm tabular-nums text-ink-3">
              {lage.antalProvade} av {lage.antalTotalt}
            </span>
          </div>
          <button
            type="button"
            onClick={stang}
            aria-label="Stäng"
            className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lage.dagspass ? (
          <p className="mt-1 text-sm leading-5 text-ink-2">{KOM_IGANG.dygnRad}</p>
        ) : null}
        {lage.gratisMedVal ? (
          <p className="mt-0.5 text-sm leading-[22px] text-ink-2">{KOM_IGANG.gratisUnder}</p>
        ) : null}

        {grupper(lage.lista, lage.gratisMedVal ? lage.intent : null).map((grupp) => (
          <div key={grupp.etikett ?? 'alla'}>
            {grupp.etikett ? (
              <p className="mb-2 mt-3.5 text-steg uppercase text-ink-3">{grupp.etikett}</p>
            ) : null}
            <ol role="list" className={`grid gap-2 ${grupp.etikett ? '' : 'mt-3'}`}>
              {grupp.brickor.map((key) => {
                const tillstand: Tillstand = lage.provade.includes(key)
                  ? 'klar'
                  : key === lage.nasta
                    ? 'nasta'
                    : 'kvar'
                return (
                  <Bricka
                    key={key}
                    bricka={key}
                    paket={lage.paket}
                    tillstand={tillstand}
                    onNavigate={stang}
                    fakta={fakta}
                    gratisMedVal={lage.gratisMedVal}
                    intent={lage.intent}
                  />
                )
              })}
            </ol>
          </div>
        ))}

        <div className="mt-4 text-center">
          <button type="button" onClick={dolj} className={LANK}>
            {KOM_IGANG.dolj}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

/**
 * Gratislistan per val delas i två områden, "Det du valde" och "Gratis i de
 * andra delarna" (designfilen, Bredden). Övriga listor är en grupp utan etikett.
 */
function grupper(
  lista: readonly BrickaKey[],
  intent: SignupIntent | null
): { etikett: string | null; brickor: BrickaKey[] }[] {
  if (!intent) return [{ etikett: null, brickor: [...lista] }]
  const valt = lista.filter((k) => OMRADE_FOR_BRICKA[k] === OMRADE_FOR_INTENT[intent])
  const andra = lista.filter((k) => OMRADE_FOR_BRICKA[k] !== OMRADE_FOR_INTENT[intent])
  return [
    { etikett: KOM_IGANG.omradeValt, brickor: valt },
    { etikett: KOM_IGANG.omradeAndra, brickor: andra },
  ].filter((g) => g.brickor.length > 0)
}

function Bricka({
  bricka,
  paket,
  tillstand,
  onNavigate,
  fakta,
  gratisMedVal = false,
  intent = null,
}: {
  bricka: BrickaKey
  paket: Paket
  tillstand: Tillstand
  onNavigate: () => void
  fakta: Parameters<typeof brickaText>[2]
  gratisMedVal?: boolean
  intent?: SignupIntent | null
}) {
  const t = brickaText(bricka, paket, fakta, gratisMedVal)
  const Ikon = BRICKA_IKON[bricka]
  const klar = tillstand === 'klar'
  const nasta = tillstand === 'nasta'
  const under = klar ? (t.klarText ?? t.text) : t.text

  const ram = klar
    ? 'border-transparent bg-insunken'
    : nasta
      ? 'border-ink-1 bg-panel shadow-val'
      : 'border-kant bg-panel'
  const ikonYta = klar ? 'bg-panel' : nasta ? 'bg-accent-mjuk' : 'bg-insunken'

  return (
    <li>
      <Link
        href={t.href}
        onClick={() => {
          capture('kom_igang_tile_clicked', {
            bricka,
            paket,
            intent,
            outside_intent: utanforIntent(bricka, intent),
          })
          onNavigate()
        }}
        aria-label={`${t.titel}, ${under}, ${klar ? 'provad' : nasta ? 'föreslagen som nästa' : 'inte provad än'}`}
        className={`grid min-h-[64px] grid-cols-[44px_1fr_24px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors hover:border-kant-stark ${ram}`}
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-1 ${ikonYta}`}
        >
          <Ikon className="h-[30px] w-[30px]" />
        </span>

        <span className="min-w-0">
          {nasta ? (
            <span className="block text-steg uppercase text-accent-ink">{KOM_IGANG.nastaEtikett}</span>
          ) : null}
          <span className="block text-sm font-semibold leading-[19px] text-ink-1">{t.titel}</span>
          <span className="block text-xs leading-[17px] text-ink-3">{under}</span>
        </span>

        <span
          aria-hidden="true"
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            klar ? 'border-ink-1 bg-ink-1' : nasta ? 'border-ink-1' : 'border-kant-stark'
          }`}
        >
          {klar ? (
            <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10.5l4 4 8-9" />
            </svg>
          ) : nasta ? (
            <span className="h-2 w-2 rounded-full bg-accent" />
          ) : null}
        </span>
      </Link>
    </li>
  )
}
