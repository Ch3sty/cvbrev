'use client'

/**
 * Nivåkollen i talserier, spatial förmåga och ordförråd i ramen
 * (plan-testflode-2026-11-20 avsnitt 10, etapp 6). Samma läge som de andra
 * Nivåkollerna (lagen/Nivakoll): startskärmen först, ingen klocka, ingen
 * väg tillbaka, ingen "Vet inte", tyst till resultatet. Samma rutter och
 * kroppar (pass-klient.ts): skapa {kind}, svar {sessionId, nyckel, svar, tid},
 * slutför {sessionId}. Uppgiften ritas av samma typ som nivåtestet och Träna
 * (typer/Steg2), så att testet ser likadant ut oavsett dörr.
 * nivamatning_startad och betalvagg_visad skjuts med samma egenskaper som i
 * de andra typerna, med typens test_kind.
 */

import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { capture } from '@/lib/analytics/events'
import { fetchNivakollApi, type NivakollApi as KollApi } from '@/lib/tester/pass-klient'
import { NIVAKOLL_COPY, nivaMening } from '@/lib/nivakoll/copy'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import type { Steg2NivakollKind } from '@/lib/nivakoll/niva'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import { STEG2_PASS_ANTAL } from '@/lib/tester/steg2/pass'
import { nivaHeltal } from '@/lib/traning/pass-copy'
import { sessionHref, steg2PassHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Nivakoll, { type NivakollApi, type NivakollSession } from '../lagen/Nivakoll'
import Resultatskarm from '../Resultatskarm'
import NivakollKop from '../delat/NivakollKop'
import { steg2Facit, steg2Ritare, Steg2Miniatyrer, tillSteg2U, type Steg2U } from '../typer/Steg2'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import { antalOrd, SESSION } from '../copy'

export interface Steg2NivakollProps {
  kind: Steg2NivakollKind
  start?: { last: boolean; fortsatt: boolean; kvar: number | null } | null
  vy?: NivakollVy | null
  betalande: boolean
  datum: string | null
  /** Dagens färdiga Nivåkoll, öppnad igen. */
  gjordIdag?: boolean
  api?: KollApi
}

const GEMEN: Record<Steg2NivakollKind, string> = { talserie: 'talserier', spatial: 'spatial förmåga', ordforrad: 'ordförråd' }

/** Vad Nivåkollen tar i typen, för startskärmens första regel. */
const INNEHALL: Record<Steg2NivakollKind, string> = {
  talserie: 'Tre talserier på varje nivå, från en lucka till blandade regler.',
  spatial: 'Tre uppgifter på varje nivå: vriden figur, vikning och tärningar.',
  ordforrad: 'Fyra ord på varje nivå, synonymer och motsatsord om vartannat.',
}

export function lasSteg2Nivakoll(vy: NivakollVy): NivakollSession<Steg2U> {
  const uppgifter: Steg2U[] = []
  for (const u of vy.uppgifter) {
    if (u.kind === 'talserie' || u.kind === 'spatial' || u.kind === 'ordforrad') uppgifter.push(tillSteg2U(u.kind, u.v, u.nyckel))
  }
  const besvarade: NivakollSession<Steg2U>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.svar == null ? null : Number(b.svar), tid_s: b.tid_s }
  let facit: NivakollSession<Steg2U>['facit'] = null
  if (vy.genomgang && (vy.kind === 'talserie' || vy.kind === 'spatial' || vy.kind === 'ordforrad')) {
    facit = {}
    for (const [k, g] of Object.entries(vy.genomgang)) {
      const valt = g.valt == null ? null : Number(g.valt)
      facit[k] = g.data ? steg2Facit(vy.kind, g.data, valt, g.correct) : { ratt: Number(g.ratt), correct: g.correct, regel: g.forklaring, misstag: g.misstag }
    }
  }
  return { id: vy.id, uppgifter, besvarade, facit, avslutad: vy.avslutad, harResultat: Boolean(vy.resultat), budgetPerUppgift: vy.budget_s }
}

export function steg2KollApi(kind: Steg2NivakollKind, a: KollApi): NivakollApi<NivakollVy> {
  return {
    async skapa() {
      const r = await a.skapa(kind)
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

export default function Steg2Nivakoll({ kind, start = null, vy = null, betalande, datum, gjordIdag = false, api = fetchNivakollApi }: Steg2NivakollProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const ritare = steg2Ritare(kind)
  const omfang = NIVAKOLL_OMFANG[kind]
  return (
    <Nivakoll<Steg2U, NivakollVy>
      ritare={ritare}
      bas={{ test_kind: kind, lage: 'nivakoll', niva: null, format: null }}
      undertitel={SESSION.undertitel('nivakoll')}
      vy={vy}
      gjordIdag={gjordIdag}
      las={lasSteg2Nivakoll}
      api={steg2KollApi(kind, api)}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      onStartad={(v) => capture('nivamatning_startad', { ommatning: v.typ === 'ommatning', smakprov: 0, test_kind: kind })}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: ritare.namn,
              rubrik: `Nivåkollen i ${GEMEN[kind]}`,
              scen: kind,
              rita: !start.fortsatt && !start.last,
              regler: [
                { titel: `${nivakollAntalTid(omfang)}.`, text: `${INNEHALL[kind]} Ingen klocka, tempot syns i resultatet.` },
                { titel: 'Ingen förklaring under tiden, den kommer efteråt.', text: 'Välj ett svar och tryck Nästa. Inget går att hoppa över.' },
                { titel: 'Nivån räknas. En gång om dagen.', text: 'Träningen följer nivån du får.' },
              ],
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och förklaringen vid varje uppgift kommer i genomgången.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind(kind)} scope={scope} plats="ommatning" matning={{ test_kind: kind, lage: 'nivakoll' }} />
              ) : null,
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg (etapp 7).
              betalvagg: <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind(kind)} scope={scope} plats="ommatning" matning={{ test_kind: kind, lage: 'nivakoll' }} />,
            }
          : null
      }
      resultat={(v, ctrl) => (
        <NivakollResultat kind={kind} vy={v} betalande={betalande} datum={datum} gjordIdag={ctrl.gjordIdag} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} />
      )}
    />
  )
}

function NivakollResultat({
  kind,
  vy,
  betalande,
  datum,
  gjordIdag,
  gaIgenom,
  lista,
  stang,
}: {
  kind: Steg2NivakollKind
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
  const ritare = steg2Ritare(kind)
  const s = lasSteg2Nivakoll(vy)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit?.[u.nyckel] })).filter((x) => !x.f?.correct)
  const snitt = Math.round(r.tid_s / Math.max(1, r.antal))
  const budgetPer = Math.round(r.budget_s / Math.max(1, r.antal))
  const raden = gjordIdag ? 'Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon.' : r.fore != null ? R.foreRad(r.fore, r.delta) : null
  const nivaText = r.passNiva === 'grund' ? 'grundnivå' : 'avancerad nivå'
  return (
    <Resultatskarm
      lage="nivakoll"
      titel={ritare.namn}
      undertitel={SESSION.undertitel('nivakoll')}
      datum={datum}
      onStang={stang}
      ring={null}
      huvudtal={String(nivaHeltal(r.niva))}
      huvudtalEfter="av 10"
      tal={[
        { varde: `${r.ratt} av ${r.antal}`, etikett: 'rätt' },
        { varde: `${snitt} s`, etikett: `per uppgift, provets tid ${budgetPer} s` },
      ]}
      mening={nivaMening(kind, r.vantat)}
      nivaskala={{ nu: r.niva, fran: r.fore, aria: R.skalaAria(r.niva, r.fore) }}
      rad={raden}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: missar.length ? 'Rätt svar och förklaringen vid varje uppgift, i samma vy som Nivåkollen.' : 'Gå igenom uppgifterna och förklaringen bakom varje.',
        miniatyrer: <Steg2Miniatyrer poster={missar.map((m) => m.u)} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{ rader: r.tappade.map((t) => ({ namn: t.namn, meta: R.familjMeta(t.ratt, t.antal), andel: t.andel })) }}
      nastaSteg={{
        titel: R.pass.titel(kind, r.passNiva),
        text: `${antalOrd(STEG2_PASS_ANTAL, true)} uppgifter på ${nivaText} med förklaringen efter varje svar. Träningen flyttar nivån högst ett halvt steg om dagen.`,
        knapp: { text: r.passNiva === 'grund' ? 'Träna på grundnivå' : 'Träna på avancerad nivå', href: steg2PassHref(kind), data: 'trana' },
      }}
      // Köpet i statusraden, som före ramen (plats matning, etapp 7).
      status={betalande ? null : <NivakollKop testKind={vy.kind} />}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
