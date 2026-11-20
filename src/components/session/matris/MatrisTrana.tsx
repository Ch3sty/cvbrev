'use client'

/**
 * Träna Figurer och mönster i ramen (plan-testflode-2026-11-20 etapp 3):
 * dagens träning (grundnivån gratis dag 0, din nivå i Premium, med
 * kalibreringsfrågan som motorn lägger in) och det riktade träningspasset i
 * ett mönster, för /pass?typ=pass, /pass?typ=riktat och /pass/<id>.
 *
 * Samma rutter och kroppar som förut (PassApi): skapa {typ, family?}, svar
 * {sessionId, questionId, selectedIndex, vetInte, tidenUte, timeSpent},
 * slutför {sessionId}. pass_startat, vet_inte_tryckt och betalvagg_visad
 * skjuts med samma egenskaper som förut.
 *
 * "Gör Nivåkollen först" (avsnitt 2, Nivåkollen): utan en Nivåkoll visar
 * startskärmen knappen "Gör Nivåkollen" och länken "Träna utan Nivåkollen".
 */

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PremiumPrisradText } from '@/components/kampanj/KampanjPrisKontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import { fetchPassApi, type PassApi, type Sessionsvy } from '@/lib/traning/klient'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import { passResultat } from '@/lib/traning/resultat'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { passHref, sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import { LANK } from '@/components/shell/knappar'
import Staplar from '@/components/traning/Staplar'
import { MilstolpeKortVy } from '@/components/traning/resultatDelar'
import Trana, { lasRamNiva, type TranaApi, type TranaSession } from '../lagen/Trana'
import Startskarm from '../Startskarm'
import Resultatskarm from '../Resultatskarm'
import { MATRIS, type MatrisU } from '../typer/Matris'
import { antalOrd, SESSION } from '../copy'
import type { RamFacit } from '../typ'
import { MatrisMiniatyrer } from './delar'
import { skapaMatris, slutforMatris, svarKropp, type MatrisVy } from './api'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import type { MatrisStartlage } from '@/app/dashboard/tester/pass/start-etapp3.server'

export interface MatrisTranaProps {
  begard: 'pass' | 'riktat'
  family?: string | null
  /** Startskärmen; utelämnad på /pass/<id>. */
  start?: MatrisStartlage | null
  /** "Träna utan Nivåkollen" tryckt: ingen knuff mot Nivåkollen. */
  utanNivakoll?: boolean
  vy?: MatrisVy | null
  forklaringEfterSvar: boolean
  betalande: boolean
  datum: string | null
  api?: PassApi
}

function betalvaggPlats(typ: 'pass' | 'riktat'): BetalvaggPlats {
  return typ === 'pass' ? 'dag2' : 'riktat'
}

function undertitelFor(vy: Sessionsvy | null, begard: 'pass' | 'riktat', family: string | null): string {
  const typ = vy?.typ ?? begard
  const fam = vy?.family ?? family
  if (typ === 'riktat') return `Träna, ${(familjNamn(fam) ?? 'ett mönster').toLowerCase()}`
  if ((vy?.variant ?? null) === 'grund') return SESSION.undertitel('trana', 'grund')
  return 'Träna, din nivå'
}

export function lasMatrisPass(m: MatrisVy): TranaSession<MatrisU> {
  const vy = m.vy
  const besvarade: TranaSession<MatrisU>['besvarade'] = {}
  for (const b of vy.besvarade) besvarade[b.q_id] = { valt: b.valdVisat, tid_s: b.tid_s }
  const facit: Record<string, RamFacit> = {}
  for (const g of vy.genomgang ?? []) {
    const valt = besvarade[g.id]?.valt ?? null
    facit[g.id] = { ratt: g.rattVisat, correct: valt === g.rattVisat, regel: g.rule || null, misstag: valt != null && valt !== g.rattVisat ? g.misstag : null }
  }
  for (const [k, a] of Object.entries(vy.aterkoppling ?? {})) facit[k] = { ratt: a.rattVisat, correct: a.correct, regel: a.regel || null, misstag: a.misstag }
  return {
    id: vy.id,
    uppgifter: vy.fragor.map((q) => ({ nyckel: q.id, grid: q.grid, options: q.options })),
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: m.avslut != null,
    budgetPerUppgift: vy.budget_s,
  }
}

function tranaApi(api: PassApi, begard: 'pass' | 'riktat', family: string | null, pagaende: string | null, forsta: Sessionsvy | null): TranaApi<MatrisVy> {
  let senaste: Sessionsvy | null = forsta
  return {
    async skapa() {
      const r = await skapaMatris(api, begard, { family, pagaende })
      if (!r.ok) {
        return { ok: false, status: r.status }
      }
      senaste = r.vy.vy
      if (r.ny) capture('pass_startat', { typ: r.vy.vy.typ as 'pass' | 'riktat', variant: r.vy.vy.variant })
      return { ok: true, vy: r.vy }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const vetInte = valt === null
      if (vetInte) capture('vet_inte_tryckt', { fraga_index: Math.max(0, senaste?.fragor.findIndex((f) => f.id === nyckel) ?? 0) })
      const r = await api.svara(svarKropp({ sessionId, questionId: nyckel, valt, vetInte, tid }))
      if (!r.ok) return { ok: false, status: r.status }
      const at = r.aterkoppling
      if (senaste && senaste.id === sessionId) {
        senaste = {
          ...senaste,
          besvarade: [...senaste.besvarade, { q_id: nyckel, valdVisat: vetInte ? null : valt, vetInte, tidenUte: false, tid_s: tid }],
          aterkoppling: at ? { ...(senaste.aterkoppling ?? {}), [nyckel]: at } : senaste.aterkoppling,
        }
      }
      if (!at) return { ok: false, status: 0 }
      return { ok: true, klar: r.klar, facit: { ratt: at.rattVisat, correct: at.correct, regel: at.regel || null, misstag: at.misstag }, niva: lasRamNiva(r) }
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

export default function MatrisTrana({
  begard,
  family = null,
  start = null,
  utanNivakoll = false,
  vy = null,
  forklaringEfterSvar,
  betalande,
  datum,
  api = fetchPassApi,
}: MatrisTranaProps) {
  const router = useRouter()
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const pagaendeId = start?.pagaende?.id ?? null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tApi = useMemo(() => tranaApi(api, begard, family, pagaendeId, vy?.vy ?? null), [api, begard, family, pagaendeId])
  const famNamn = familjNamn(family)
  const bas = { test_kind: 'matris', lage: 'trana' as const, niva: vy?.vy.variant === 'grund' || start?.grund ? 'grund' : null, format: null }
  const rubrik = begard === 'riktat' ? 'Träna ett mönster' : 'Träna figurer och mönster'
  const formatrad = begard === 'riktat' && famNamn ? famNamn : null
  const premiumVagg = (
    <PaywallCard variant="testniva" feature="tests_above_base" testTyp={testTypForKind('matris')} scope={scope} plats={betalvaggPlats(begard)} matning={{ test_kind: 'matris', lage: 'trana' }} />
  )

  // Gör Nivåkollen först: startskärmens variant (avsnitt 2).
  if (start && begard === 'pass' && !start.harNivakoll && !start.pagaende && !start.sparr && !utanNivakoll) {
    return (
      <Startskarm
        bas={bas}
        tillbakaHref={TRANING_RUTT.alla}
        eyebrow={MATRIS.namn}
        rubrik={rubrik}
        scen="matris"
        rita
        regler={[
          { titel: `${nivakollAntalTid(NIVAKOLL_OMFANG.matris)}.`, text: 'Nivåkollen sätter din nivå, och träningen följer den.' },
          { titel: 'Gör Nivåkollen först.', text: 'Svårigheten följer dina svar. Ingen förklaring under tiden, den kommer efteråt.' },
          { titel: 'Sedan tränar du på rätt nivå.', text: `${antalOrd(start.antal, true)} uppgifter om dagen, med förklaringen efter varje svar.` },
        ]}
        sparrad="none"
        fortsattTillganglig={false}
        knapp={{ text: 'Gör Nivåkollen', onClick: () => router.push(passHref('matning')) }}
        kortRad={
          <Link href={`${passHref('pass')}&nivakoll=sen`} className={`${LANK} inline-flex min-h-11 items-center`} data-utan-nivakoll>
            Träna utan Nivåkollen
          </Link>
        }
        fotnot="Nivåkollen ingår gratis en gång."
      />
    )
  }

  return (
    <Trana<MatrisU, MatrisVy>
      ritare={MATRIS}
      bas={bas}
      undertitel={(v) => undertitelFor(v?.vy ?? null, begard, family)}
      vy={vy}
      las={lasMatrisPass}
      api={tApi}
      forklaringEfterSvar={forklaringEfterSvar}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: MATRIS.namn,
              rubrik,
              formatrad,
              scen: 'matris',
              rita: !start.pagaende && !start.sparr,
              regel1: {
                titel: `${antalOrd(start.antal, true)} uppgifter i egen takt.`,
                text: `Ringen visar provets tid per uppgift, ${start.budgetPerUppgift} sekunder.`,
              },
              regel3: start.grund
                ? start.sparr
                  ? { titel: 'Grundnivån ingår gratis, en gång om dagen.', text: 'Träningen på din nivå ingår i Premium.' }
                  : { titel: 'Grundnivån, gratis i dag.', text: 'Svaren hittills sparas om du avbryter.' }
                : { titel: 'Nivån rör sig högst ett halvt steg om dagen.', text: 'Svaren hittills sparas om du avbryter.' },
              fortsatt: Boolean(start.pagaende),
              kortRad: start.pagaende ? SESSION.start.kvar(start.pagaende.kvar) : null,
              // Riktad träning i ett mönster med för få osedda uppgifter (422), som i det raderade PassFlode.
              startfelRad: (status) =>
                status === 422 ? (
                  <>
                    {PASS_COPY.fel.familj} {PASS_COPY.fel.familjRad}{' '}
                    <Link href={passHref('pass')} className={LANK}>
                      Träna blandat
                    </Link>
                  </>
                ) : null,
              fotnot: 'Rätt svar och regeln i genomgången efteråt, också med förklaringen avstängd.',
              sparr:
                start.sparr === 'premium' ? (
                  premiumVagg
                ) : start.sparr === 'quota' ? (
                  <PaywallCard
                    variant="test-tak"
                    testTyp={testTypForKind('matris')}
                    scope={scope}
                    quota={{ feature: 'test:matrislogik-pass', nextResetAt: start.nastaTillfalle ?? new Date().toISOString() }}
                    matning={{ test_kind: 'matris', lage: 'trana' }}
                  />
                ) : null,
              sparrTyp: start.sparr === 'quota' ? 'quota' : 'premium',
              // Servern nekar starten (402) fast sidan såg öppen ut: samma vägg som vid
              // premiumspärren, som mäter sig själv (förut en händelse utan vägg).
              betalvagg: premiumVagg,
            }
          : null
      }
      resultat={(v, ctrl) => <TranaResultat m={v} betalande={betalande} datum={datum} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} nivaer={ctrl.mal?.nivaer ?? []} />}
    />
  )
}

function TranaResultat({ m, betalande, datum, gaIgenom, lista, stang, nivaer }: { m: MatrisVy; betalande: boolean; datum: string | null; gaIgenom: (fran?: number) => void; lista: ResultatListaVidare; stang: () => void; nivaer: (number | null)[] }) {
  const avslut = m.avslut!
  const vm = passResultat(avslut, m.vy, m.status)
  const s = lasMatrisPass(m)
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit[u.nyckel] })).filter((x) => !x.f?.correct)
  const antal = avslut.antal
  const overAntal = vm.kort.staplar.staplar.filter((x) => x.over).length
  const tappade = [...avslut.familjer.passet]
    .filter((f) => f.antal > 0 && f.ratt < f.antal)
    .sort((a, b) => a.andel - b.andel)
    .slice(0, 4)
    .map((f) => ({ namn: familjNamn(f.family) ?? f.family ?? 'Blandat', meta: `${f.ratt} av ${f.antal} rätt i träningen`, andel: f.andel, ratt: f.ratt, antal: f.antal }))
  const harNiva = avslut.niva_fore != null || avslut.niva_efter != null
  const riktat = avslut.typ === 'riktat'
  return (
    <Resultatskarm
      lage="trana"
      titel={MATRIS.namn}
      undertitel={undertitelFor(m.vy, riktat ? 'riktat' : 'pass', m.vy.family)}
      datum={datum}
      onStang={stang}
      mal={avslut.niva_efter != null || nivaer.some((n) => n != null) ? { fore: avslut.niva_fore ?? null, efter: avslut.niva_efter ?? null, nivaer } : null}
      ring={{ andel: antal ? avslut.ratt / antal : 0, aria: SESSION.resultat.ringAria(avslut.ratt, antal) }}
      huvudtal={SESSION.resultat.rattAv(avslut.ratt, antal)}
      tal={[vm.tal[1], vm.tal[2]]}
      mening={vm.mening}
      nivaskala={vm.skala ? { nu: vm.skala.nu, fran: vm.skala.fran, aria: vm.skala.aria } : null}
      rad={vm.malRad}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: missar.length ? 'Regeln och ditt misstag vid varje uppgift, i samma vy som träningen.' : 'Gå igenom uppgifterna och regeln bakom varje.',
        miniatyrer: <MatrisMiniatyrer poster={missar.map((x) => ({ u: x.u, ratt: x.f?.ratt ?? null }))} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      tappade={tappade.length ? { rader: tappade } : null}
      tempo={{
        titel: overAntal ? `${overAntal} av ${antal} över provets tid` : 'Alla uppgifter inom provets tid',
        text: avslut.snitt_s != null ? `Snitt ${avslut.snitt_s} s, provet ger ${avslut.budget_s} s.` : null,
        innehall: (
          <Staplar
            data={vm.kort.staplar}
            aria={`Tid per uppgift. Streckad linje: provets tid, ${vm.kort.staplar.budget_s} sekunder.`}
            axel={{ start: 'uppgift 1', mitt: vm.kort.axelMitt, slut: `uppgift ${vm.kort.staplar.staplar.length}` }}
          />
        ),
      }}
      nastaSteg={
        harNiva || riktat
          ? {
              titel: vm.status,
              extra: betalande ? null : (
                <p className="mt-2 text-sm font-medium leading-5 text-ink-1">
                  Träningen på din nivå ingår i Premium. <PremiumPrisradText />
                </p>
              ),
              knapp: { text: 'En omgång till', href: riktat && m.vy.family ? passHref('riktat', { family: m.vy.family }) : passHref('pass'), data: 'en-omgang-till' },
            }
          : {
              titel: 'Mät din nivå i figurer och mönster',
              text: `${nivakollAntalTid(NIVAKOLL_OMFANG.matris)}. Träningen följer nivån.`,
              knapp: { text: 'Gör Nivåkollen', href: passHref('matning'), data: 'nivakoll' },
            }
      }
      status={vm.milstolpe ? <MilstolpeKortVy m={vm.milstolpe} /> : null}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
