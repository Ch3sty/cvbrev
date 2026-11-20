'use client'

/**
 * Träna deduktiv slutledning i ramen (plan-testflode-2026-11-20 etapp 3).
 * Ersatte DeduktivPassFlode på /dashboard/tester/pass?typ=deduktivpass och
 * /pass/<id> (raderad i etapp 5). Samma rutter och
 * kroppar (pass-klient.ts): skapa {}, svar {sessionId, nyckel, visat, tid},
 * slutför {sessionId}. Förklaringen bär lösningsgången och schemat.
 */

import Link from 'next/link'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { fetchDeduktivPassApi, type DeduktivPassApi } from '@/lib/tester/pass-klient'
import { DEDUKTIV_PASS_COPY } from '@/lib/tester/pass-copy'
import type { DeduktivPassVy } from '@/lib/tester/pass-deduktiv'
import { deduktivFamiljNamn } from '@/lib/deduktivV1/familjer'
import { nivakollHref, sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { LANK } from '@/components/shell/knappar'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import Trana, { type TranaApi, type TranaSession } from '../lagen/Trana'
import Resultatskarm from '../Resultatskarm'
import { DEDUKTIV, type DeduktivU } from '../typer/Deduktiv'
import { antalOrd, SESSION } from '../copy'
import { TempoStapel } from '../figurserie/delar'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import Losningsgang from './Losningsgang'

export interface DeduktivTranaProps {
  start?: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number } | null
  vy?: DeduktivPassVy | null
  forklaringEfterSvar: boolean
  harNivakoll: boolean
  datum: string | null
  api?: DeduktivPassApi
}

export function lasDeduktivPass(vy: DeduktivPassVy): TranaSession<DeduktivU> {
  const besvarade: TranaSession<DeduktivU>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.visat, tid_s: b.tid_s }
  const facit: TranaSession<DeduktivU>['facit'] = {}
  for (const [k, a] of Object.entries(vy.aterkoppling))
    facit[k] = { ratt: a.rattVisat, correct: a.correct, regel: null, misstag: a.misstag, detalj: <Losningsgang losning={a.losning} /> }
  return {
    id: vy.id,
    uppgifter: vy.uppgifter.map((u) => ({ nyckel: u.nyckel, intro: u.intro, villkor: u.villkor, fraga: u.fraga, options: u.options })),
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: Boolean(vy.resultat),
    budgetPerUppgift: vy.uppgifter.length ? Math.round(vy.budget_s / vy.uppgifter.length) : 75,
  }
}

function tranaApi(a: DeduktivPassApi): TranaApi<DeduktivPassVy> {
  return {
    async skapa() {
      const r = await a.skapa()
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const r = await a.svara({ sessionId, nyckel, visat: valt, tid })
      if (!r.ok) return { ok: false, status: r.status }
      const at = r.aterkoppling
      return {
        ok: true,
        klar: r.klar,
        facit: { ratt: at.rattVisat, correct: at.correct, regel: null, misstag: at.misstag, detalj: <Losningsgang losning={at.losning} /> },
      }
    },
    hamta: (id) => a.session(id),
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
  }
}

const BAS = { test_kind: 'deduktiv', lage: 'trana' as const, format: null }

export default function DeduktivTrana({ start = null, vy = null, forklaringEfterSvar, harNivakoll, datum, api = fetchDeduktivPassApi }: DeduktivTranaProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  return (
    <Trana<DeduktivU, DeduktivPassVy>
      ritare={DEDUKTIV}
      bas={{ ...BAS, niva: vy?.niva ?? null }}
      undertitel={(v) => SESSION.undertitel('trana', v?.niva ?? null)}
      vy={vy}
      las={lasDeduktivPass}
      api={tranaApi(api)}
      forklaringEfterSvar={forklaringEfterSvar}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: DEDUKTIV.namn,
              rubrik: DEDUKTIV_PASS_COPY.namn,
              scen: 'deduktiv',
              rita: !start.fortsatt && !start.last,
              regel1: {
                titel: `${antalOrd(start.antal, true)} uppgifter i egen takt.`,
                text: `Ringen visar provets tid per uppgift, ${start.budgetPerUppgift} sekunder. Utgå bara från det som står.`,
              },
              regel3: { titel: 'Nivån rör sig högst ett halvt steg om dagen.', text: 'Svaren hittills sparas om du avbryter.' },
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och lösningsgången i genomgången efteråt, också med förklaringen avstängd.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind('deduktiv')} scope={scope} plats="dag2" matning={{ test_kind: 'deduktiv', lage: 'trana' }} />
              ) : null,
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg (etapp 7).
              betalvagg: <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind('deduktiv')} scope={scope} plats="dag2" matning={{ test_kind: 'deduktiv', lage: 'trana' }} />,
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
  vy: DeduktivPassVy
  datum: string | null
  harNivakoll: boolean
  gaIgenom: (fran?: number) => void
  lista: ResultatListaVidare
  stang: () => void
}) {
  const r = vy.resultat!
  const s = lasDeduktivPass(vy)
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = s.budgetPerUppgift
  const over = s.uppgifter.filter((u) => (s.besvarade[u.nyckel]?.tid_s ?? 0) > budgetPer).length
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit[u.nyckel] })).filter((x) => !x.f?.correct)
  const R = DEDUKTIV_PASS_COPY.resultat
  return (
    <Resultatskarm
      lage="trana"
      titel={DEDUKTIV.namn}
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
        text: missar.length ? 'Lösningsgången och ditt misstag vid varje uppgift, i samma vy som träningen.' : 'Gå igenom uppgifterna och lösningen bakom varje.',
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{
        rader: r.tappade.map((t) => ({ namn: deduktivFamiljNamn(t.familj) ?? t.familj, meta: R.tappadeMeta(t.ratt, t.antal), andel: t.andel })),
      }}
      tempo={{ titel: R.tempo(tidPer, budgetPer), innehall: <TempoStapel tidPer={tidPer} budgetPer={budgetPer} /> }}
      nastaSteg={
        harNivakoll
          ? {
              titel: R.imorgon,
              text: vy.upprepad ? R.upprepad : null,
              extra: vy.expertRad ? (
                <p className="mt-1.5 text-sm leading-5 text-ink-2">
                  <Link href={testPaths.hub('deduktiv-expert')} className={LANK}>
                    {R.expertRad}
                  </Link>
                </p>
              ) : null,
              knapp: { text: 'Alla tester', href: TRANING_RUTT.alla, data: 'alla-tester' },
            }
          : {
              titel: 'Mät din nivå i deduktiv slutledning',
              text: `${nivakollAntalTid(NIVAKOLL_OMFANG.deduktiv)}. Träningen följer nivån.`,
              knapp: { text: 'Gör Nivåkollen', href: nivakollHref('deduktiv'), data: 'nivakoll' },
            }
      }
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
