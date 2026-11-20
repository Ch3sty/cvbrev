'use client'

/**
 * Träna figurserier i ramen (plan-testflode-2026-11-20 etapp 1). Ersatte
 * FigurPassFlode på /dashboard/tester/pass?typ=figurpass och
 * /pass/<id> (raderad i etapp 5). Samma rutter och
 * kroppar (pass-klient.ts): skapa {}, svar {sessionId, nyckel, visat, tid},
 * slutför {sessionId}.
 */

import Link from 'next/link'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { fetchFigurPassApi, type FigurPassApi } from '@/lib/tester/pass-klient'
import { FIGUR_PASS_COPY } from '@/lib/tester/pass-copy'
import type { FigurPassVy } from '@/lib/tester/pass-figur'
import { serieFamiljNamn } from '@/lib/figurserierV1/familjer'
import { nivakollHref, sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { LANK } from '@/components/shell/knappar'
import Trana, { lasRamNiva, type TranaApi, type TranaSession } from '../lagen/Trana'
import Resultatskarm from '../Resultatskarm'
import { FIGURSERIE, type FigurserieU } from '../typer/Figurserie'
import { antalOrd, SESSION } from '../copy'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import { Miniatyrer, TempoStapel } from './delar'

export interface FigurserieTranaProps {
  /** Startskärmen (/pass?typ=figurpass). Utelämnad på /pass/<id>. */
  start?: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number } | null
  vy?: FigurPassVy | null
  forklaringEfterSvar: boolean
  harNivakoll: boolean
  datum: string | null
  api?: FigurPassApi
}

export function lasFigurPass(vy: FigurPassVy): TranaSession<FigurserieU> {
  const besvarade: TranaSession<FigurserieU>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.visat, tid_s: b.tid_s }
  const facit: TranaSession<FigurserieU>['facit'] = {}
  for (const [k, a] of Object.entries(vy.aterkoppling)) facit[k] = { ratt: a.rattVisat, correct: a.correct, regel: a.regel, misstag: a.misstag }
  return {
    id: vy.id,
    uppgifter: vy.uppgifter.map((u) => ({ nyckel: u.nyckel, form: u.form, rad: u.rad, options: u.options })),
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: Boolean(vy.resultat),
    budgetPerUppgift: vy.uppgifter.length ? Math.round(vy.budget_s / vy.uppgifter.length) : 45,
  }
}

function tranaApi(a: FigurPassApi): TranaApi<FigurPassVy> {
  return {
    async skapa() {
      const r = await a.skapa()
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const r = await a.svara({ sessionId, nyckel, visat: valt, tid })
      if (!r.ok) return { ok: false, status: r.status }
      const at = r.aterkoppling
      return { ok: true, klar: r.klar, facit: { ratt: at.rattVisat, correct: at.correct, regel: at.regel, misstag: at.misstag }, niva: lasRamNiva(r) }
    },
    hamta: (id) => a.session(id),
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
  }
}

const BAS = { test_kind: 'figurserie', lage: 'trana' as const, format: null }

export default function FigurserieTrana({ start = null, vy = null, forklaringEfterSvar, harNivakoll, datum, api = fetchFigurPassApi }: FigurserieTranaProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const niva = vy?.niva ?? null

  return (
    <Trana<FigurserieU, FigurPassVy>
      ritare={FIGURSERIE}
      bas={{ ...BAS, niva }}
      undertitel={(v) => SESSION.undertitel('trana', v?.niva ?? null)}
      vy={vy}
      las={lasFigurPass}
      api={tranaApi(api)}
      forklaringEfterSvar={forklaringEfterSvar}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: FIGURSERIE.namn,
              rubrik: FIGUR_PASS_COPY.namn,
              scen: 'figurserie',
              rita: !start.fortsatt && !start.last,
              regel1: {
                titel: `${antalOrd(start.antal, true)} uppgifter i egen takt.`,
                text: `Ringen visar provets tid per uppgift, ${start.budgetPerUppgift} sekunder.`,
              },
              regel3: { titel: 'Nivån rör sig högst ett halvt steg om dagen.', text: 'Svaren hittills sparas om du avbryter.' },
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och regeln i genomgången efteråt, också med förklaringen avstängd.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind('figurserie')} scope={scope} plats="dag2" matning={{ test_kind: 'figurserie', lage: 'trana' }} />
              ) : null,
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg (etapp 7).
              betalvagg: <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind('figurserie')} scope={scope} plats="dag2" matning={{ test_kind: 'figurserie', lage: 'trana' }} />,
            }
          : null
      }
      resultat={(v, ctrl) => <TranaResultat vy={v} datum={datum} harNivakoll={harNivakoll} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} />}
    />
  )
}

function TranaResultat({
  vy,
  datum,
  harNivakoll,
  gaIgenom,
  lista,
  stang,
}: {
  vy: FigurPassVy
  datum: string | null
  harNivakoll: boolean
  gaIgenom: (fran?: number) => void
  lista: ResultatListaVidare
  stang: () => void
}) {
  const r = vy.resultat!
  const s = lasFigurPass(vy)
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = s.budgetPerUppgift
  const over = s.uppgifter.filter((u) => (s.besvarade[u.nyckel]?.tid_s ?? 0) > budgetPer).length
  const missar = s.uppgifter
    .map((u, i) => ({ u, i, f: s.facit[u.nyckel] }))
    .filter((x) => !x.f?.correct)
  const R = FIGUR_PASS_COPY.resultat
  return (
    <Resultatskarm
      lage="trana"
      titel={FIGURSERIE.namn}
      undertitel={SESSION.undertitel('trana', vy.niva)}
      datum={datum}
      onStang={stang}
      ring={{ andel: r.antal ? r.ratt / r.antal : 0, aria: SESSION.resultat.ringAria(r.ratt, r.antal) }}
      huvudtal={SESSION.resultat.rattAv(r.ratt, r.antal)}
      tal={[
        { varde: `${tidPer} s`, etikett: `per uppgift, provets tid ${budgetPer} s` },
        { varde: `${over} av ${r.antal}`, etikett: 'över provets tid', koppar: over > 0 },
      ]}
      mening={R.ingenNiva}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: missar.length ? 'Regeln och ditt misstag vid varje uppgift, i samma vy som träningen.' : 'Gå igenom uppgifterna och regeln bakom varje.',
        miniatyrer: <Miniatyrer poster={missar.map((m) => ({ u: m.u, ratt: m.f?.ratt ?? null }))} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{
        rader: r.tappade.map((t) => ({ namn: serieFamiljNamn(t.familj) ?? t.familj, meta: R.tappadeMeta(t.ratt, t.antal), andel: t.andel })),
      }}
      tempo={{ titel: R.tempo(tidPer, budgetPer), innehall: <TempoStapel tidPer={tidPer} budgetPer={budgetPer} /> }}
      nastaSteg={
        harNivakoll
          ? {
              titel: R.imorgon,
              text: vy.upprepad ? R.upprepad : null,
              extra: vy.expertRad ? (
                <p className="mt-1.5 text-sm leading-5 text-ink-2">
                  <Link href={testPaths.hub('figurserier-expert')} className={LANK}>
                    {R.expertRad}
                  </Link>
                </p>
              ) : null,
              knapp: { text: 'Alla tester', href: TRANING_RUTT.alla, data: 'alla-tester' },
            }
          : {
              titel: 'Mät din nivå i figurserier',
              text: `${nivakollAntalTid(NIVAKOLL_OMFANG.figurserie)}. Träningen följer nivån.`,
              knapp: { text: 'Gör Nivåkollen', href: nivakollHref('figurserie'), data: 'nivakoll' },
            }
      }
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
