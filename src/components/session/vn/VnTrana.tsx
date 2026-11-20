'use client'

/**
 * Träna Ord och text och Siffror och tabeller i ramen
 * (plan-testflode-2026-11-20 etapp 2). Ersatte VnPassFlode på
 * /dashboard/tester/pass?typ=textpass|sifferpass (med family: det riktade)
 * och /pass/<id> (raderad i etapp 5). Samma rutter och
 * kroppar (pass-klient.ts): skapa {kind, familj?}, svar {sessionId, nyckel,
 * svar, tid}, slutför {sessionId}.
 *
 * Passens rutt tar bara emot ett valt svar, så "Vet inte" finns inte här
 * (som förut): att lägga till ett obesvarat svar hade ändrat rättningen och
 * nivån. Allt annat är Träna som i de andra typerna.
 */

import { useRef } from 'react'
import Link from 'next/link'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { fetchVnPassApi, type VnPassApi } from '@/lib/tester/pass-klient'
import { VN_PASS_COPY, vnFamiljNamn } from '@/lib/tester/pass-copy'
import type { VnPassVy } from '@/lib/tester/pass-typer'
import { nivakollHref, sessionHref, TRANING_RUTT, vnPassHref } from '@/lib/traning/rutter'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import { LANK } from '@/components/shell/knappar'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Trana, { lasRamNiva, type TranaApi, type TranaSession } from '../lagen/Trana'
import Resultatskarm from '../Resultatskarm'
import { vnRitare, type VnU } from '../typer/Vn'
import { antalOrd, SESSION } from '../copy'
import { TempoStapel } from '../figurserie/delar'
import { VnMissar, vnFacit } from './delar'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import { indexFor, numrera, vnUnderlagFran, vnUppgiftFran, type VnKind } from './las'

export interface VnTranaProps {
  kind: VnKind
  familj?: string | null
  start?: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number } | null
  vy?: VnPassVy | null
  forklaringEfterSvar: boolean
  harNivakoll: boolean
  datum: string | null
  api?: VnPassApi
}

const GEMEN: Record<VnKind, string> = { verbal: 'ord och text', numerisk: 'siffror och tabeller' }

export function lasVnPass(vy: VnPassVy): TranaSession<VnU> {
  const ul = vnUnderlagFran(vy.kind, vy.underlag)
  const uppgifter = numrera(vy.punkter.map((p) => vnUppgiftFran(vy.kind, p, ul)))
  const besvarade: TranaSession<VnU>['besvarade'] = {}
  const facit: TranaSession<VnU>['facit'] = {}
  for (const u of uppgifter) {
    const b = vy.besvarade[u.nyckel]
    if (b) besvarade[u.nyckel] = { valt: indexFor(u, b.svar), tid_s: b.tid_s }
    const a = vy.aterkoppling[u.nyckel]
    if (a) facit[u.nyckel] = vnFacit(u, indexFor(u, a.ratt) ?? -1, indexFor(u, b?.svar), a.forklaring)
  }
  return {
    id: vy.id,
    uppgifter,
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: Boolean(vy.resultat),
    budgetPerUppgift: Math.round(vy.budget_s / Math.max(1, uppgifter.length)),
  }
}

type KopplatApi = TranaApi<VnPassVy> & { registrera: (vy: VnPassVy) => VnPassVy }

function tranaApi(kind: VnKind, familj: string | null, a: VnPassApi): KopplatApi {
  // Svaret skickas som alternativets id, som förut; alternativen per uppgift
  // ur vyn, så att "Rätt svar: ..." kan skrivas direkt efter svaret.
  const alternativ = new Map<string, { id: string; text: string }[]>()
  const registrera = (vy: VnPassVy) => {
    for (const p of vy.punkter) alternativ.set(p.nyckel, p.alternativ)
    return vy
  }
  return {
    registrera,
    async skapa() {
      const r = await a.skapa(kind, familj)
      return r.ok ? { ok: true, vy: registrera(r.session) } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const alt = alternativ.get(nyckel) ?? []
      const svar = valt == null ? null : alt[valt]?.id ?? null
      if (svar == null) return { ok: false, status: 400 }
      const r = await a.svara({ sessionId, nyckel, svar, tid })
      if (!r.ok) return { ok: false, status: r.status }
      const at = r.aterkoppling
      return { ok: true, klar: r.klar, facit: vnFacit({ alternativ: alt } as VnU, indexFor({ alternativ: alt }, at.ratt) ?? -1, valt, at.forklaring), niva: lasRamNiva(r) }
    },
    hamta: async (id) => {
      const vy = await a.session(id)
      return vy ? registrera(vy) : null
    },
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: registrera(r.session) } : { ok: false, status: r.status }
    },
  }
}

export default function VnTrana({ kind, familj = null, start = null, vy = null, forklaringEfterSvar, harNivakoll, datum, api = fetchVnPassApi }: VnTranaProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const ritare = vnRitare(kind)
  const familjNamn = vnFamiljNamn(familj ?? vy?.familj ?? null)
  const kopplad = useRef<KopplatApi | null>(null)
  if (!kopplad.current) {
    kopplad.current = tranaApi(kind, familj, api)
    if (vy) kopplad.current.registrera(vy)
  }
  return (
    <Trana<VnU, VnPassVy>
      ritare={ritare}
      bas={{ test_kind: kind, lage: 'trana', niva: vy?.niva ?? null, format: null }}
      undertitel={(v) => (v?.typ === 'riktat' || familj ? `Träna, ${familjNamn ? familjNamn.toLowerCase() : 'mönstret'}` : SESSION.undertitel('trana', v?.niva ?? null))}
      vy={vy}
      las={lasVnPass}
      api={kopplad.current}
      vetInte={false}
      forklaringEfterSvar={forklaringEfterSvar}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: ritare.namn,
              rubrik: familjNamn ? `Träna: ${familjNamn.toLowerCase()}` : `Träna ${GEMEN[kind]}`,
              scen: kind,
              rita: !start.fortsatt && !start.last,
              regel1: {
                titel: kind === 'verbal' ? `En text och ${antalOrd(start.antal)} påståenden i egen takt.` : `Ett underlag och ${antalOrd(start.antal)} uppgifter i egen takt.`,
                text: `Ringen visar provets tid per uppgift, ${start.budgetPerUppgift} sekunder.`,
              },
              regel3: { titel: 'Nivån rör sig högst ett halvt steg om dagen.', text: 'Svaren hittills sparas om du avbryter.' },
              fortsatt: start.fortsatt,
              kortRad: start.fortsatt && start.kvar != null ? SESSION.start.kvar(start.kvar) : null,
              fotnot: 'Rätt svar och förklaringen i genomgången efteråt, också med förklaringen avstängd.',
              sparr: start.last ? (
                <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind(kind)} scope={scope} plats="dag2" matning={{ test_kind: kind, lage: 'trana' }} />
              ) : null,
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg (etapp 7).
              betalvagg: <PaywallCard variant="testniva" feature="test_daily_pass" testTyp={testTypForKind(kind)} scope={scope} plats="dag2" matning={{ test_kind: kind, lage: 'trana' }} />,
            }
          : null
      }
      resultat={(v, ctrl) => <Resultat vy={v} datum={datum} harNivakoll={harNivakoll} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} />}
    />
  )
}

function Resultat({
  vy,
  datum,
  harNivakoll,
  gaIgenom,
  lista,
  stang,
}: {
  vy: VnPassVy
  datum: string | null
  harNivakoll: boolean
  gaIgenom: (fran?: number) => void
  lista: ResultatListaVidare
  stang: () => void
}) {
  const r = vy.resultat!
  const kind = vy.kind
  const ritare = vnRitare(kind)
  const s = lasVnPass(vy)
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = s.budgetPerUppgift
  const over = s.uppgifter.filter((u) => (s.besvarade[u.nyckel]?.tid_s ?? 0) > budgetPer).length
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit[u.nyckel] })).filter((x) => !x.f?.correct)
  const R = VN_PASS_COPY.resultat
  const svagast = r.tappade.find((t) => t.riktat) ?? null
  const riktat = vy.typ === 'riktat'
  return (
    <Resultatskarm
      lage="trana"
      titel={ritare.namn}
      undertitel={riktat ? `Träna, ${(vnFamiljNamn(vy.familj) ?? 'mönstret').toLowerCase()}` : SESSION.undertitel('trana', vy.niva)}
      datum={datum}
      onStang={stang}
      ring={{ andel: r.antal ? r.ratt / r.antal : 0, aria: SESSION.resultat.ringAria(r.ratt, r.antal) }}
      huvudtal={SESSION.resultat.rattAv(r.ratt, r.antal)}
      tal={[
        { varde: `${tidPer} s`, etikett: `per uppgift, provets tid ${budgetPer} s` },
        { varde: `${over} av ${r.antal}`, etikett: 'över provets tid', koppar: over > 0 },
      ]}
      mening={vy.upprepad ? R.upprepad : null}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: missar.length ? 'Rätt svar och förklaringen vid varje uppgift.' : 'Gå igenom uppgifterna och förklaringen bakom varje.',
        miniatyrer: <VnMissar poster={missar.map((m) => ({ nr: m.i + 1, u: m.u }))} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={{ rader: r.tappade.map((t) => ({ namn: vnFamiljNamn(t.familj) ?? t.familj, meta: R.tappadeMeta(t.ratt, t.antal), andel: t.andel })) }}
      tempo={{ titel: R.tempo(r.tid_s, r.budget_s), innehall: <TempoStapel tidPer={tidPer} budgetPer={budgetPer} /> }}
      nastaSteg={
        harNivakoll
          ? {
              titel: R.imorgon(kind),
              text: null,
              extra:
                svagast || vy.expertRad ? (
                  <div className="mt-1.5 flex flex-col gap-1 text-sm leading-5 text-ink-2">
                    {svagast ? (
                      <Link href={vnPassHref(kind, svagast.familj)} className={`${LANK} inline-flex min-h-11 items-center`} data-ova-typen>
                        {`Öva ${(vnFamiljNamn(svagast.familj) ?? svagast.familj).toLowerCase()}`}
                      </Link>
                    ) : null}
                    {vy.expertRad ? (
                      <Link href={testPaths.hub(kind === 'verbal' ? 'verbal-resonemang-expert' : 'numeriskt-test-expert')} className={`${LANK} inline-flex min-h-11 items-center`}>
                        {R.expertRad}
                      </Link>
                    ) : null}
                  </div>
                ) : null,
              knapp: { text: 'Alla tester', href: TRANING_RUTT.alla, data: 'alla-tester' },
            }
          : {
              titel: `Mät din nivå i ${GEMEN[kind]}`,
              text: `${nivakollAntalTid(NIVAKOLL_OMFANG[kind])}. Träningen följer nivån.`,
              knapp: { text: 'Gör Nivåkollen', href: nivakollHref(kind), data: 'nivakoll' },
            }
      }
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
