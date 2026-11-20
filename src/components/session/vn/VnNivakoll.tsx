'use client'

/**
 * Nivåkollen i Ord och text och Siffror och tabeller i ramen
 * (plan-testflode-2026-11-20 etapp 2). Ersatte NivakollFlode för verbalt
 * och numeriskt (raderad i etapp 5). Samma rutter och
 * kroppar (pass-klient.ts): skapa {kind}, svar {sessionId, nyckel, svar,
 * tid}, slutför {sessionId}. nivamatning_startad och betalvagg_visad skjuts
 * med samma egenskaper som förut. Ingen klocka, inget "Vet inte".
 */

import { useRef } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { capture } from '@/lib/analytics/events'
import { fetchNivakollApi, type NivakollApi as KollApi } from '@/lib/tester/pass-klient'
import { NIVAKOLL_COPY, nivaMening } from '@/lib/nivakoll/copy'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import type { VnFacitData } from '@/lib/tester/pass-typer'
import { nivaHeltal } from '@/lib/traning/pass-copy'
import { sessionHref, TRANING_RUTT, vnPassHref } from '@/lib/traning/rutter'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Nivakoll, { type NivakollApi, type NivakollSession } from '../lagen/Nivakoll'
import Resultatskarm from '../Resultatskarm'
import NivakollKop from '../delat/NivakollKop'
import { vnRitare, type VnU } from '../typer/Vn'
import { SESSION } from '../copy'
import { VnMissar, vnFacit } from './delar'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import { indexFor, numrera, vnUnderlagFran, vnUppgiftFran, type VnKind, type VnUtanNummer } from './las'

export interface VnNivakollProps {
  kind: VnKind
  start?: { last: boolean; fortsatt: boolean; kvar: number | null } | null
  vy?: NivakollVy | null
  betalande: boolean
  datum: string | null
  gjordIdag?: boolean
  api?: KollApi
}

const GEMEN: Record<VnKind, string> = { verbal: 'ord och text', numerisk: 'siffror och tabeller' }

export function lasVnNivakoll(vy: NivakollVy): NivakollSession<VnU> {
  const kind = vy.kind as VnKind
  const lista: VnUtanNummer[] = []
  for (const u of vy.uppgifter) {
    if (u.kind !== 'verbal' && u.kind !== 'numerisk') continue
    const ul = vy.underlag[u.underlag]
    if (!ul) continue
    lista.push(vnUppgiftFran(kind, u, vnUnderlagFran(kind, ul)))
  }
  const uppgifter = numrera(lista)
  const besvarade: NivakollSession<VnU>['besvarade'] = {}
  for (const u of uppgifter) {
    const b = vy.besvarade[u.nyckel]
    if (b) besvarade[u.nyckel] = { valt: indexFor(u, b.svar), tid_s: b.tid_s }
  }
  let facit: NivakollSession<VnU>['facit'] = null
  if (vy.genomgang) {
    facit = {}
    for (const u of uppgifter) {
      const g = vy.genomgang[u.nyckel]
      if (!g) continue
      facit[u.nyckel] = vnFacit(u, indexFor(u, g.ratt) ?? -1, indexFor(u, g.valt), g.forklaring, (g.data as VnFacitData | null | undefined) ?? null)
    }
  }
  return { id: vy.id, uppgifter, besvarade, facit, avslutad: vy.avslutad, harResultat: Boolean(vy.resultat), budgetPerUppgift: vy.budget_s }
}

type KopplatApi = NivakollApi<NivakollVy> & { registrera: (vy: NivakollVy) => void }

function kollApi(kind: VnKind, a: KollApi): KopplatApi {
  // Svaret skickas som alternativets id, som förut (sant, falskt, går inte att avgöra eller id:t).
  const varden = new Map<string, string[]>()
  return {
    async skapa() {
      const r = await a.skapa(kind)
      if (r.ok) for (const u of r.session.uppgifter) if ('alternativ' in u) varden.set(u.nyckel, u.alternativ.map((x) => x.id))
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const svar = varden.get(nyckel)?.[valt]
      if (svar == null) return true
      const r = await a.svara({ sessionId, nyckel, svar, tid })
      return r.ok || r.status === 409
    },
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    /** Uppgifterna i en redan öppnad session (adressen /pass/<id>). */
    registrera(vy: NivakollVy) {
      for (const u of vy.uppgifter) if ('alternativ' in u) varden.set(u.nyckel, u.alternativ.map((x) => x.id))
    },
  }
}

export default function VnNivakoll({ kind, start = null, vy = null, betalande, datum, gjordIdag = false, api = fetchNivakollApi }: VnNivakollProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const ritare = vnRitare(kind)
  const omfang = NIVAKOLL_OMFANG[kind]
  const kopplad = useRef<KopplatApi | null>(null)
  if (!kopplad.current) {
    kopplad.current = kollApi(kind, api)
    if (vy) kopplad.current.registrera(vy)
  }
  return (
    <Nivakoll<VnU, NivakollVy>
      ritare={ritare}
      bas={{ test_kind: kind, lage: 'nivakoll', niva: null, format: null }}
      undertitel={SESSION.undertitel('nivakoll')}
      vy={vy}
      gjordIdag={gjordIdag}
      las={lasVnNivakoll}
      api={kopplad.current}
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
                { titel: `${nivakollAntalTid(omfang)}.`, text: kind === 'verbal' ? 'Två texter med fyra påståenden var. Ingen klocka.' : 'Två underlag med fyra uppgifter var. Ingen klocka.' },
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
      resultat={(v, ctrl) => <Resultat kind={kind} vy={v} betalande={betalande} datum={datum} gjordIdag={ctrl.gjordIdag} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} />}
    />
  )
}

function Resultat({
  kind,
  vy,
  betalande,
  datum,
  gjordIdag,
  gaIgenom,
  lista,
  stang,
}: {
  kind: VnKind
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
  const ritare = vnRitare(kind)
  const s = lasVnNivakoll(vy)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit?.[u.nyckel] })).filter((x) => !x.f?.correct)
  const snitt = Math.round(r.tid_s / Math.max(1, r.antal))
  const raden = gjordIdag ? 'Du gjorde Nivåkollen i dag. Nästa kan du göra i morgon.' : r.fore != null ? R.foreRad(r.fore, r.delta) : null
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
        { varde: `${snitt} s`, etikett: `per uppgift, provets tid ${vy.budget_s} s` },
      ]}
      mening={nivaMening(vy.kind, r.vantat)}
      nivaskala={{ nu: r.niva, fran: r.fore, aria: R.skalaAria(r.niva, r.fore) }}
      rad={raden}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: 'Rätt svar och förklaringen vid varje uppgift.',
        miniatyrer: <VnMissar poster={missar.map((m) => ({ nr: m.i + 1, u: m.u }))} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{ rader: r.tappade.map((t) => ({ namn: t.namn, meta: R.familjMeta(t.ratt, t.antal), andel: t.andel })) }}
      nastaSteg={{
        titel: R.pass.titel(vy.kind, r.passNiva),
        text: R.pass.text(vy.kind, r.passNiva),
        knapp: { text: r.passNiva === 'grund' ? 'Träna på grundnivå' : 'Träna på avancerad nivå', href: vnPassHref(kind), data: 'trana' },
      }}
      // Köpet i statusraden, som före ramen (plats matning, etapp 7).
      status={betalande ? null : <NivakollKop testKind={vy.kind} />}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
