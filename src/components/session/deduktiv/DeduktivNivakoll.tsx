'use client'

/**
 * Nivåkollen i deduktiv slutledning i ramen (plan-testflode-2026-11-20 etapp
 * 3). Ersatte NivakollFlode för deduktivt (raderad i etapp 5). Samma rutter
 * och kroppar (pass-klient.ts):
 * skapa {kind}, svar {sessionId, nyckel, svar, tid}, slutför {sessionId}.
 * nivamatning_startad och betalvagg_visad skjuts med samma egenskaper som förut.
 */

import PaywallCard from '@/components/paywall/PaywallCard'
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
import NivakollKop from '../delat/NivakollKop'
import { DEDUKTIV, type DeduktivU } from '../typer/Deduktiv'
import { SESSION } from '../copy'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import Losningsgang from './Losningsgang'

export interface DeduktivNivakollProps {
  start?: { last: boolean; fortsatt: boolean; kvar: number | null } | null
  vy?: NivakollVy | null
  betalande: boolean
  datum: string | null
  gjordIdag?: boolean
  api?: KollApi
}

export function lasDeduktivKoll(vy: NivakollVy): NivakollSession<DeduktivU> {
  const uppgifter: DeduktivU[] = []
  for (const u of vy.uppgifter) if (u.kind === 'deduktiv') uppgifter.push({ nyckel: u.nyckel, intro: u.intro, villkor: u.villkor, fraga: u.fraga, options: u.options })
  const besvarade: NivakollSession<DeduktivU>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.svar == null ? null : Number(b.svar), tid_s: b.tid_s }
  let facit: NivakollSession<DeduktivU>['facit'] = null
  if (vy.genomgang) {
    facit = {}
    for (const [k, g] of Object.entries(vy.genomgang))
      facit[k] = { ratt: Number(g.ratt), correct: g.correct, regel: null, misstag: g.misstag, detalj: g.losning ? <Losningsgang losning={g.losning} /> : null }
  }
  return { id: vy.id, uppgifter, besvarade, facit, avslutad: vy.avslutad, harResultat: Boolean(vy.resultat), budgetPerUppgift: vy.budget_s }
}

function kollApi(a: KollApi): NivakollApi<NivakollVy> {
  return {
    async skapa() {
      const r = await a.skapa('deduktiv')
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

const BAS = { test_kind: 'deduktiv', lage: 'nivakoll' as const, niva: null, format: null }

export default function DeduktivNivakoll({ start = null, vy = null, betalande, datum, gjordIdag = false, api = fetchNivakollApi }: DeduktivNivakollProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  return (
    <Nivakoll<DeduktivU, NivakollVy>
      ritare={DEDUKTIV}
      bas={BAS}
      undertitel={SESSION.undertitel('nivakoll')}
      vy={vy}
      gjordIdag={gjordIdag}
      las={lasDeduktivKoll}
      api={kollApi(api)}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      onStartad={(v) => capture('nivamatning_startad', { ommatning: v.typ === 'ommatning', smakprov: 0, test_kind: 'deduktiv' })}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: DEDUKTIV.namn,
              rubrik: 'Nivåkollen i deduktiv slutledning',
              scen: 'deduktiv',
              rita: !start.fortsatt && !start.last,
              regler: [
                { titel: `${nivakollAntalTid(NIVAKOLL_OMFANG.deduktiv)}.`, text: 'Ingen klocka. Utgå bara från det som står i villkoren.' },
                { titel: 'Ingen förklaring under tiden, den kommer efteråt.', text: 'Välj ett svar och tryck Nästa. Inget går att hoppa över.' },
                { titel: 'Nivån räknas. En gång om dagen.', text: 'Träningen följer nivån du får.' },
              ],
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och lösningsgången vid varje uppgift kommer i genomgången.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind('deduktiv')} scope={scope} plats="ommatning" matning={{ test_kind: 'deduktiv', lage: 'nivakoll' }} />
              ) : null,
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg (etapp 7).
              betalvagg: <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind('deduktiv')} scope={scope} plats="ommatning" matning={{ test_kind: 'deduktiv', lage: 'nivakoll' }} />,
            }
          : null
      }
      resultat={(v, ctrl) => <KollResultat vy={v} betalande={betalande} datum={datum} gjordIdag={ctrl.gjordIdag} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} />}
    />
  )
}

function KollResultat({
  vy,
  betalande,
  datum,
  gjordIdag,
  gaIgenom,
  lista,
  stang,
}: {
  vy: NivakollVy
  betalande: boolean
  datum: string | null
  gjordIdag: boolean
  gaIgenom: (fran?: number) => void
  lista: ResultatListaVidare
  stang: () => void
}) {
  const r = vy.resultat!
  const R = NIVAKOLL_COPY.resultat
  const s = lasDeduktivKoll(vy)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit?.[u.nyckel] })).filter((x) => !x.f?.correct)
  const snitt = Math.round(r.tid_s / Math.max(1, r.antal))
  const raden = gjordIdag ? 'Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon.' : r.fore != null ? R.foreRad(r.fore, r.delta) : null
  return (
    <Resultatskarm
      lage="nivakoll"
      titel={DEDUKTIV.namn}
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
        text: 'Rätt svar, lösningsgången och ditt misstag vid varje uppgift.',
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{ rader: r.tappade.map((t) => ({ namn: t.namn, meta: R.familjMeta(t.ratt, t.antal), andel: t.andel })) }}
      nastaSteg={{
        titel: R.pass.titel(vy.kind, r.passNiva),
        text: R.pass.text(vy.kind, r.passNiva),
        knapp: { text: r.passNiva === 'grund' ? 'Träna på grundnivå' : 'Träna på avancerad nivå', href: TRANING_RUTT.deduktivpass, data: 'trana' },
      }}
      // Köpet i statusraden, som före ramen (plats matning, etapp 7).
      status={betalande ? null : <NivakollKop testKind={vy.kind} />}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
