'use client'

/**
 * Nivåkollen i figurserier i ramen (plan-testflode-2026-11-20 etapp 1).
 * Ersätter NivakollFlode för figurserier; de tre andra typerna går kvar i
 * NivakollFlode till etapp 2 och 3. Samma rutter och kroppar
 * (pass-klient.ts): skapa {kind}, svar {sessionId, nyckel, svar, tid},
 * slutför {sessionId}. nivamatning_startad och betalvagg_visad skjuts med
 * samma egenskaper som förut.
 */

import { useEffect, useRef } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PremiumPrisradText } from '@/components/kampanj/KampanjPrisKontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { capture } from '@/lib/analytics/events'
import { fetchNivakollApi, type NivakollApi as KollApi } from '@/lib/tester/pass-klient'
import { NIVAKOLL_COPY, nivaMening } from '@/lib/nivakoll/copy'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import { nivaHeltal } from '@/lib/traning/pass-copy'
import { sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Nivakoll, { type NivakollApi, type NivakollSession } from '../lagen/Nivakoll'
import Resultatskarm from '../Resultatskarm'
import { FIGURSERIE, type FigurserieU } from '../typer/Figurserie'
import { SESSION } from '../copy'
import { Miniatyrer } from './delar'

export interface FigurserieNivakollProps {
  start?: { last: boolean; fortsatt: boolean; kvar: number | null } | null
  vy?: NivakollVy | null
  betalande: boolean
  datum: string | null
  /** Dagens färdiga Nivåkoll, öppnad igen. */
  gjordIdag?: boolean
  api?: KollApi
}

export function lasNivakoll(vy: NivakollVy): NivakollSession<FigurserieU> {
  const uppgifter: FigurserieU[] = []
  for (const u of vy.uppgifter) if (u.kind === 'figurserie') uppgifter.push({ nyckel: u.nyckel, form: u.form, rad: u.rad, options: u.options })
  const besvarade: NivakollSession<FigurserieU>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.svar == null ? null : Number(b.svar), tid_s: b.tid_s }
  let facit: NivakollSession<FigurserieU>['facit'] = null
  if (vy.genomgang) {
    facit = {}
    for (const [k, g] of Object.entries(vy.genomgang)) facit[k] = { ratt: Number(g.ratt), correct: g.correct, regel: g.forklaring, misstag: g.misstag }
  }
  return { id: vy.id, uppgifter, besvarade, facit, avslutad: vy.avslutad, harResultat: Boolean(vy.resultat), budgetPerUppgift: vy.budget_s }
}

function kollApi(a: KollApi): NivakollApi<NivakollVy> {
  return {
    async skapa() {
      const r = await a.skapa('figurserie')
      if (!r.ok && r.status === 402) capture('betalvagg_visad', { plats: 'ommatning', dagar_kvar: null, test_kind: 'figurserie' })
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const r = await a.svara({ sessionId, nyckel, svar: String(valt), tid })
      return r.ok || r.status === 409
    },
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
  }
}

const BAS = { test_kind: 'figurserie', lage: 'nivakoll' as const, niva: null, format: null }

export default function FigurserieNivakoll({ start = null, vy = null, betalande, datum, gjordIdag = false, api = fetchNivakollApi }: FigurserieNivakollProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const omfang = NIVAKOLL_OMFANG.figurserie
  return (
    <Nivakoll<FigurserieU, NivakollVy>
      ritare={FIGURSERIE}
      bas={BAS}
      undertitel={SESSION.undertitel('nivakoll')}
      vy={vy}
      gjordIdag={gjordIdag}
      las={lasNivakoll}
      api={kollApi(api)}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      onStartad={(v) => capture('nivamatning_startad', { ommatning: v.typ === 'ommatning', smakprov: 0, test_kind: 'figurserie' })}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: FIGURSERIE.namn,
              rubrik: 'Nivåkollen i figurserier',
              scen: 'figurserie',
              rita: !start.fortsatt && !start.last,
              regler: [
                { titel: `${nivakollAntalTid(omfang)}.`, text: 'Ingen klocka. Tempot sparas och syns i resultatet.' },
                { titel: 'Ingen förklaring under tiden, den kommer efteråt.', text: 'Välj ett svar och tryck Nästa. Inget går att hoppa över.' },
                { titel: 'Nivån räknas. En gång om dagen.', text: 'Träningen följer nivån du får.' },
              ],
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och regeln vid varje uppgift kommer i genomgången.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind('figurserie')} scope={scope} plats="ommatning" />
              ) : null,
            }
          : null
      }
      resultat={(v, ctrl) => <NivakollResultat vy={v} betalande={betalande} datum={datum} gjordIdag={ctrl.gjordIdag} gaIgenom={ctrl.gaIgenom} stang={ctrl.stang} />}
    />
  )
}

function NivakollResultat({
  vy,
  betalande,
  datum,
  gjordIdag,
  gaIgenom,
  stang,
}: {
  vy: NivakollVy
  betalande: boolean
  datum: string | null
  gjordIdag: boolean
  gaIgenom: (fran?: number) => void
  stang: () => void
}) {
  const r = vy.resultat!
  const R = NIVAKOLL_COPY.resultat
  // Betalväggen bor på Träna-startskärmen; resultatet mäter som förut (plats matning).
  const visad = useRef(false)
  useEffect(() => {
    if (betalande || visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'matning', dagar_kvar: null, test_kind: vy.kind })
  }, [betalande, vy.kind])
  const s = lasNivakoll(vy)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit?.[u.nyckel] })).filter((x) => !x.f?.correct)
  const snitt = Math.round(r.tid_s / Math.max(1, r.antal))
  const raden = gjordIdag ? 'Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon.' : r.fore != null ? R.foreRad(r.fore, r.delta) : null
  return (
    <Resultatskarm
      lage="nivakoll"
      titel={FIGURSERIE.namn}
      undertitel={SESSION.undertitel('nivakoll')}
      datum={datum}
      onStang={stang}
      ring={null}
      huvudtal={String(nivaHeltal(r.niva))}
      huvudtalEfter="av 10"
      tal={[
        { varde: `${r.ratt} av ${r.antal}`, etikett: 'rätt' },
        { varde: `${snitt} s`, etikett: `per uppgift, provets tid ${vy.budget_s} s` },
      ]}
      mening={nivaMening(vy.kind, r.vantat)}
      nivaskala={{ nu: r.niva, fran: r.fore, aria: R.skalaAria(r.niva, r.fore) }}
      rad={raden}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: 'Rätt svar, regeln och ditt misstag vid varje uppgift.',
        miniatyrer: <Miniatyrer poster={missar.map((m) => ({ u: m.u, ratt: m.f?.ratt ?? null }))} />,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{ rader: r.tappade.map((t) => ({ namn: t.namn, meta: R.familjMeta(t.ratt, t.antal), andel: t.andel })) }}
      nastaSteg={{
        titel: R.pass.titel(vy.kind, r.passNiva),
        text: R.pass.text(vy.kind, r.passNiva),
        extra: betalande ? null : (
          <p className="mt-2 text-sm font-medium leading-5 text-ink-1" data-nivakoll-prisrad>
            Träningen ingår i Premium. <PremiumPrisradText />
          </p>
        ),
        knapp: { text: r.passNiva === 'grund' ? 'Träna på grundnivå' : 'Träna på avancerad nivå', href: TRANING_RUTT.figurpass, data: 'trana' },
      }}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
