'use client'

/**
 * Nivåkollen i Figurer och mönster i ramen (plan-testflode-2026-11-20 etapp
 * 3): mätningen och ommätningen, adaptiv. Servern väljer nästa uppgift efter
 * varje svar, så Nästa väntar på servern med spinnern i knappen. Ersätter
 * PassFlode för /pass?typ=matning och /pass/<id>; PassFlode står kvar
 * oanvänd till etapp 5. Samma rutter och kroppar som förut (PassApi):
 * skapa {typ: 'matning'}, svar {sessionId, questionId, selectedIndex,
 * vetInte, tidenUte, timeSpent}, slutför {sessionId}. nivamatning_startad
 * och betalvagg_visad skjuts med samma egenskaper som förut. Kalibreringen
 * och nivåberäkningen är motorns, orörda.
 */

import { useEffect, useMemo, useRef } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PremiumPrisradText } from '@/components/kampanj/KampanjPrisKontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { capture } from '@/lib/analytics/events'
import { fetchPassApi, type PassApi, type Sessionsvy, type Traningsstatus } from '@/lib/traning/klient'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import { matningResultat, ommatningResultat } from '@/lib/traning/resultat'
import { nivaHeltal, PASS_COPY } from '@/lib/traning/pass-copy'
import { passHref, sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Kurva from '@/components/traning/Kurva'
import { imorgonFranStatus } from '@/components/traning/MatningResultatVy'
import { MilstolpeKortVy } from '@/components/traning/PassResultatVy'
import Nivakoll, { type NivakollApi, type NivakollSession } from '../lagen/Nivakoll'
import Resultatskarm from '../Resultatskarm'
import { MATRIS, type MatrisU } from '../typer/Matris'
import { SESSION } from '../copy'
import { MatrisMiniatyrer } from './delar'
import { skapaMatris, slutforMatris, svarKropp, type MatrisVy } from './api'
import type { RamFacit } from '../typ'

export interface MatrisNivakollProps {
  start?: { sparr: 'premium' | null; pagaende: { id: string; kvar: number } | null } | null
  vy?: MatrisVy | null
  betalande: boolean
  datum: string | null
  api?: PassApi
}

/** Antalet hon svarar på: smakprovets frågor räknas in men visas inte (spec 14.5). */
function visatAntal(vy: Sessionsvy): number {
  return vy.typ === 'matning' ? Math.max(1, vy.antal - vy.smakprov) : vy.antal
}

export function lasMatrisKoll(m: MatrisVy): NivakollSession<MatrisU> {
  const vy = m.vy
  const besvarade: NivakollSession<MatrisU>['besvarade'] = {}
  for (const b of vy.besvarade) besvarade[b.q_id] = { valt: b.valdVisat, tid_s: b.tid_s }
  let facit: Record<string, RamFacit> | null = null
  if (vy.genomgang) {
    facit = {}
    for (const g of vy.genomgang) {
      const valt = besvarade[g.id]?.valt ?? null
      facit[g.id] = { ratt: g.rattVisat, correct: valt === g.rattVisat, regel: g.rule || null, misstag: valt != null && valt !== g.rattVisat ? g.misstag : null }
    }
  }
  return {
    id: vy.id,
    uppgifter: vy.fragor.map((q) => ({ nyckel: q.id, grid: q.grid, options: q.options })),
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: m.avslut != null,
    budgetPerUppgift: vy.budget_s,
    antal: visatAntal(vy),
  }
}

function kollApi(api: PassApi, pagaende: string | null, forsta: Sessionsvy | null): NivakollApi<MatrisVy> {
  let senaste: Sessionsvy | null = forsta
  return {
    async skapa() {
      const r = await skapaMatris(api, 'matning', { pagaende })
      if (!r.ok) {
        if (r.status === 402) capture('betalvagg_visad', { plats: 'ommatning', dagar_kvar: null })
        return { ok: false, status: r.status }
      }
      senaste = r.vy.vy
      return { ok: true, vy: r.vy }
    },
    // Den adaptiva Nivåkollen svarar alltid via svaraAdaptivt; kön används inte.
    async svara() {
      return false
    },
    async svaraAdaptivt({ sessionId, nyckel, valt, tid }) {
      const r = await api.svara(svarKropp({ sessionId, questionId: nyckel, valt, tid }))
      if (!r.ok) return { ok: false, status: r.status }
      const bas = senaste && senaste.id === sessionId ? senaste : null
      if (!bas) {
        const ny = await api.session(sessionId)
        if (!ny) return { ok: false, status: 0 }
        senaste = ny
        return { ok: true, vy: { vy: ny, avslut: null, status: null }, klar: r.klar }
      }
      const idx = bas.fragor.findIndex((f) => f.id === nyckel)
      const ny: Sessionsvy = {
        ...bas,
        besvarade: [...bas.besvarade, { q_id: nyckel, valdVisat: valt, vetInte: false, tidenUte: false, tid_s: tid }],
        fragor: r.nasta && !bas.fragor.some((f) => f.id === r.nasta!.id) ? [...bas.fragor, r.nasta] : bas.fragor,
        aktuell: r.klar ? null : idx + 1,
      }
      senaste = ny
      return { ok: true, vy: { vy: ny, avslut: null, status: null }, klar: r.klar }
    },
    async hamta(id) {
      const ny = await api.session(id)
      if (ny) senaste = ny
      return ny ? { vy: ny, avslut: null, status: null } : null
    },
    async slutfor(id) {
      const r = await slutforMatris(api, id, senaste)
      if (r.ok) senaste = r.vy.vy
      return r
    },
  }
}

const BAS = { test_kind: 'matris', lage: 'nivakoll' as const, niva: null, format: null }

export default function MatrisNivakoll({ start = null, vy = null, betalande, datum, api = fetchPassApi }: MatrisNivakollProps) {
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const smakprov = vy?.vy.typ === 'matning' ? vy.vy.smakprov : 0
  const undertitel = smakprov > 0 ? `${SESSION.undertitel('nivakoll')}, ${PASS_COPY.topp.matningSmakprov(smakprov).toLowerCase()}` : SESSION.undertitel('nivakoll')
  const omfang = NIVAKOLL_OMFANG.matris
  const pagaendeId = start?.pagaende?.id ?? null
  // En instans per montering: den håller den senaste vyn mellan svaren.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const kApi = useMemo(() => kollApi(api, pagaendeId, vy?.vy ?? null), [api, pagaendeId])
  return (
    <Nivakoll<MatrisU, MatrisVy>
      ritare={MATRIS}
      bas={BAS}
      undertitel={undertitel}
      vy={vy}
      las={lasMatrisKoll}
      api={kApi}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      onStartad={(v) => capture('nivamatning_startad', { ommatning: v.vy.typ === 'ommatning', smakprov: v.vy.smakprov })}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: MATRIS.namn,
              rubrik: 'Nivåkollen i figurer och mönster',
              scen: 'matris',
              rita: !start.pagaende && !start.sparr,
              regler: [
                { titel: `${nivakollAntalTid(omfang)}, svårigheten följer dina svar.`, text: 'Ingen klocka. Tempot sparas och syns i resultatet.' },
                { titel: 'Ingen förklaring under tiden, den kommer efteråt.', text: 'Välj ett svar och tryck Nästa. Inget går att hoppa över.' },
                { titel: 'Nivån räknas och styr träningen.', text: 'Avbryter du kan du fortsätta där du var.' },
              ],
              fortsatt: Boolean(start.pagaende),
              kortRad: start.pagaende ? SESSION.start.kvar(start.pagaende.kvar) : null,
              fotnot: 'Rätt svar och regeln vid varje uppgift kommer i genomgången.',
              sparr: start.sparr ? (
                <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind('matris')} scope={scope} plats="ommatning" />
              ) : null,
            }
          : null
      }
      resultat={(v, ctrl) => <KollResultat m={v} betalande={betalande} datum={datum} gaIgenom={ctrl.gaIgenom} stang={ctrl.stang} />}
    />
  )
}

/** Kurvan med den nya punkten (ommätningens och övningsprovets kort 3). */
export function KurvKort({ status, rubrik, idPrefix }: { status: Traningsstatus | null; rubrik: string; idPrefix: string }) {
  const start = status?.start?.dag ?? status?.punkter[0]?.dag ?? null
  if (!status || !start || status.punkter.length < 1) return null
  return (
    <section aria-label={rubrik} className="rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-resultat-kurva>
      <p className="text-ey uppercase text-ink-3">{rubrik}</p>
      {(['mobil', 'dator'] as const).map((bredd) => (
        <div key={bredd} className={bredd === 'mobil' ? 'lg:hidden' : 'hidden lg:block'}>
          <Kurva
            punkter={status.punkter}
            plan={status.plandagar}
            idag={status.idag}
            start={start}
            prov={status.plan?.provdatum ?? null}
            sikte={status.plan?.sikte ?? null}
            bredd={bredd}
            idPrefix={`${idPrefix}-${bredd}`}
            nyPunkt
            hojd="kompakt"
            ariaLabel={rubrik}
          />
        </div>
      ))}
    </section>
  )
}

function KollResultat({ m, betalande, datum, gaIgenom, stang }: { m: MatrisVy; betalande: boolean; datum: string | null; gaIgenom: (fran?: number) => void; stang: () => void }) {
  const avslut = m.avslut!
  const status = m.status
  const ommatning = avslut.typ === 'ommatning'
  const s = lasMatrisKoll(m)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit?.[u.nyckel] })).filter((x) => !x.f?.correct)

  const vmM = !ommatning ? matningResultat(avslut, status, betalande, m.vy.smakprov) : null
  const vmO = ommatning ? ommatningResultat(avslut, status) : null
  // M1:s betalvägg mäts som förut, en gång per visning (plats matning).
  const visad = useRef(false)
  useEffect(() => {
    if (!vmM?.betalvagg || visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'matning', dagar_kvar: vmM.dagarKvar })
  }, [vmM])

  const niva = vmM ? vmM.niva : vmO!.niva
  const heltal = nivaHeltal(niva)
  const familjer = (vmM ? vmM.familjer : vmO!.familjer).filter((f) => f.andel != null)
  const imorgon = imorgonFranStatus(status, { last: !betalande })
  const tal = vmM ? [vmM.tal[0], vmM.tal[2]] : [vmO!.tal[0], vmO!.tal[1]]
  return (
    <Resultatskarm
      lage="nivakoll"
      titel={MATRIS.namn}
      undertitel={SESSION.undertitel('nivakoll')}
      datum={datum}
      onStang={stang}
      ring={null}
      huvudtal={String(heltal)}
      huvudtalEfter="av 10"
      tal={tal}
      mening={vmM ? vmM.mening : vmO!.rubrik.replace(/^[\d,]+\.\s*/, '')}
      nivaskala={vmM ? { nu: vmM.skala.nu, fran: null, aria: vmM.skala.aria } : { nu: vmO!.skala.nu, fran: vmO!.skala.fran, aria: vmO!.skala.aria }}
      rad={(vmM ? vmM.malRad : vmO!.malRad) ?? null}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: 'Rätt svar och regeln vid varje uppgift, i samma vy som Nivåkollen.',
        miniatyrer: <MatrisMiniatyrer poster={missar.map((x) => ({ u: x.u, ratt: x.f?.ratt ?? null }))} />,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={familjer.length ? { titel: null, rader: familjer.map((f) => ({ namn: f.titel, meta: f.meta, andel: f.andel ?? 0 })) } : null}
      tempoKort={ommatning ? <KurvKort status={status} rubrik={PASS_COPY.ommatning.kurvaRubrik} idPrefix="nk" /> : null}
      nastaSteg={{
        titel: imorgon.tema ? `I morgon: ${imorgon.tema.toLowerCase()}` : 'Träningen följer nivån',
        text: imorgon.status,
        extra: betalande ? null : (
          <p className="mt-2 text-sm font-medium leading-5 text-ink-1" data-nivakoll-prisrad>
            Träningen på din nivå ingår i Premium. <PremiumPrisradText />
          </p>
        ),
        knapp: { text: betalande ? 'Träna på din nivå' : 'Träna på grundnivå', href: passHref('pass'), data: 'trana' },
      }}
      status={vmO?.milstolpe ? <MilstolpeKortVy m={vmO.milstolpe} /> : null}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
