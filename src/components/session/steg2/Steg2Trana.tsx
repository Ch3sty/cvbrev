'use client'

/**
 * Träna talserier, spatial förmåga och ordförråd i ramen
 * (plan-testflode-2026-11-20 etapp 4). Ersatte Steg2PassFlode på
 * /dashboard/tester/pass?typ=steg2pass&kind=<typ> (med grupp: det riktade)
 * och /pass/<id> (raderad i etapp 5). Samma rutter och
 * kroppar (pass-klient.ts): skapa {kind, grupp}, svar {sessionId, nyckel,
 * visat, tid}, slutför {sessionId}.
 *
 * Talseriens Träna byter inte längre hela vyn mot en genomgång: korten får
 * rätt och fel och Förklaringen kommer under svaren, som i alla typer.
 * "Vet inte" finns (passens rutt tar emot ett obesvarat svar).
 *
 * "Gör Nivåkollen först" (avsnitt 2, Nivåkollen; etapp 7): utan en Nivåkoll i
 * typen visar startskärmen knappen "Gör Nivåkollen" och länken "Träna utan
 * Nivåkollen", som matrisen. Inte för det riktade, inte vid Fortsätt och inte
 * när väggen står där.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import type { Scope } from '@/lib/access/features'
import { fetchSteg2PassApi, type Steg2PassApi } from '@/lib/tester/pass-klient'
import { steg2PassCopy } from '@/lib/tester/steg2/copy'
import type { Steg2PassKind, Steg2PassVy } from '@/lib/tester/steg2/pass'
import { FAMILJ_NAMN, FORM_NAMN } from '@/lib/tester/steg2/namn'
import { nivakollHref, sessionHref, steg2PassHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { NIVAKOLL_OMFANG, nivakollAntalTid } from '@/lib/nivakoll/omfang'
import { LANK } from '@/components/shell/knappar'
import Startskarm from '../Startskarm'
import { testTypForKind } from '@/components/illustrations/TestGlyfer'
import Trana, { lasRamNiva, lasSlutNiva, type TranaApi, type TranaSession } from '../lagen/Trana'
import Resultatskarm, { type MalData } from '../Resultatskarm'
import { monsterRad, monsterText } from '../resultat/monster'
import { steg2Facit, steg2Ritare, Steg2Miniatyrer, tillSteg2U, type Steg2U } from '../typer/Steg2'
import { antalOrd, SESSION } from '../copy'
import type { ResultatListaVidare } from '../lagen/gemensamt'
import { TempoStapel } from '../figurserie/delar'

export interface Steg2TranaProps {
  kind: Steg2PassKind
  grupp?: string | null
  /** Startskärmen (/pass?typ=steg2pass). Utelämnad på /pass/<id>. */
  start?: { last: boolean; fortsatt: boolean; kvar: number | null; antal: number; budgetPerUppgift: number | null } | null
  vy?: Steg2PassVy | null
  /** En Nivåkoll i typen finns. Utelämnad (gammal anropare): ingen knuff. */
  harNivakoll?: boolean
  /** "Träna utan Nivåkollen" tryckt: ingen knuff mot Nivåkollen. */
  utanNivakoll?: boolean
  forklaringEfterSvar: boolean
  datum: string | null
  api?: Steg2PassApi
}

const GEMEN: Record<Steg2PassKind, string> = { talserie: 'talserier', spatial: 'spatial förmåga', ordforrad: 'ordförråd' }
const ORD_GRUPP: Record<string, string> = { synonym: 'Synonymer', antonym: 'Motsatsord' }

/** Gruppens namn i klartext: talseriens regelfamilj, spatialens form, ordförrådets typ. */
export function steg2GruppNamn(kind: Steg2PassKind, grupp: string | null | undefined): string | null {
  if (!grupp) return null
  if (kind === 'talserie') return FAMILJ_NAMN[grupp] ?? null
  if (kind === 'spatial') return (FORM_NAMN as Record<string, string>)[grupp] ?? null
  return ORD_GRUPP[grupp] ?? null
}

export function lasSteg2Pass(vy: Steg2PassVy): TranaSession<Steg2U> {
  const besvarade: TranaSession<Steg2U>['besvarade'] = {}
  for (const [k, b] of Object.entries(vy.besvarade)) besvarade[k] = { valt: b.visat, tid_s: b.tid_s }
  const facit: TranaSession<Steg2U>['facit'] = {}
  for (const [k, a] of Object.entries(vy.aterkoppling)) facit[k] = steg2Facit(vy.kind, a.genomgang, a.valtVisat, a.correct)
  return {
    id: vy.id,
    uppgifter: vy.uppgifter.map((u) => tillSteg2U(vy.kind, u, u.nyckel)),
    besvarade,
    facit,
    avslutad: vy.avslutad,
    harResultat: Boolean(vy.resultat),
    budgetPerUppgift: vy.uppgifter.length ? Math.round(vy.budget_s / vy.uppgifter.length) : 60,
  }
}

function tranaApi(kind: Steg2PassKind, grupp: string | null, a: Steg2PassApi): TranaApi<Steg2PassVy> {
  return {
    async skapa() {
      const r = await a.skapa(kind, grupp)
      return r.ok ? { ok: true, vy: r.session } : { ok: false, status: r.status }
    },
    async svara({ sessionId, nyckel, valt, tid }) {
      const r = await a.svara({ sessionId, nyckel, visat: valt, tid })
      if (!r.ok) return { ok: false, status: r.status }
      const at = r.aterkoppling
      return { ok: true, klar: r.klar, facit: steg2Facit(kind, at.genomgang, at.valtVisat, at.correct), niva: lasRamNiva(r) }
    },
    hamta: (id) => a.session(id),
    async slutfor(id) {
      const r = await a.slutfor(id)
      return r.ok ? { ok: true, vy: r.session, niva: lasSlutNiva(r) } : { ok: false, status: r.status }
    },
  }
}

function undertitelFor(kind: Steg2PassKind, grupp: string | null, niva: Steg2PassVy['niva'] | null): string {
  const namn = steg2GruppNamn(kind, grupp)
  if (grupp) return `Träna, ${(namn ?? 'mönstret').toLowerCase()}`
  return SESSION.undertitel('trana', niva)
}

export default function Steg2Trana({
  kind,
  grupp = null,
  start = null,
  vy = null,
  harNivakoll = true,
  utanNivakoll = false,
  forklaringEfterSvar,
  datum,
  api = fetchSteg2PassApi,
}: Steg2TranaProps) {
  const router = useRouter()
  const { summary } = useDashboardData()
  const scope = (summary?.paket?.scope ?? null) as Scope | null
  const ritare = steg2Ritare(kind)
  const g = grupp ?? vy?.grupp ?? null
  const gruppNamn = steg2GruppNamn(kind, g)
  const bas = { test_kind: kind, lage: 'trana' as const, niva: vy?.niva ?? null, format: null }

  // Gör Nivåkollen först: startskärmens variant (avsnitt 2), som matrisen.
  if (start && !grupp && !harNivakoll && !start.fortsatt && !start.last && !utanNivakoll) {
    return (
      <Startskarm
        bas={bas}
        tillbakaHref={TRANING_RUTT.alla}
        eyebrow={ritare.namn}
        rubrik={`Träna ${GEMEN[kind]}`}
        scen={kind}
        rita
        regler={[
          { titel: `${nivakollAntalTid(NIVAKOLL_OMFANG[kind])}.`, text: 'Nivåkollen sätter din nivå, och träningen följer den.' },
          { titel: 'Gör Nivåkollen först.', text: 'Ingen förklaring under tiden, den kommer efteråt.' },
          { titel: 'Sedan tränar du på rätt nivå.', text: `${antalOrd(start.antal, true)} uppgifter om dagen, med förklaringen efter varje svar.` },
        ]}
        sparrad="none"
        fortsattTillganglig={false}
        knapp={{ text: 'Gör Nivåkollen', onClick: () => router.push(nivakollHref(kind)) }}
        kortRad={
          <Link href={`${steg2PassHref(kind)}&nivakoll=sen`} className={`${LANK} inline-flex min-h-11 items-center`} data-utan-nivakoll>
            Träna utan Nivåkollen
          </Link>
        }
        fotnot="Nivåkollen ingår gratis en gång."
      />
    )
  }

  return (
    <Trana<Steg2U, Steg2PassVy>
      ritare={ritare}
      bas={bas}
      undertitel={(v) => undertitelFor(kind, g, v?.niva ?? null)}
      vy={vy}
      las={lasSteg2Pass}
      api={tranaApi(kind, grupp, api)}
      forklaringEfterSvar={forklaringEfterSvar}
      tillbakaHref={TRANING_RUTT.alla}
      sessionAdress={sessionHref}
      start={
        start
          ? {
              tillbakaHref: TRANING_RUTT.alla,
              eyebrow: ritare.namn,
              rubrik: gruppNamn ? `Träna: ${gruppNamn.toLowerCase()}` : `Träna ${GEMEN[kind]}`,
              scen: kind,
              rita: !start.fortsatt && !start.last,
              regel1: {
                titel: `${antalOrd(start.antal, true)} uppgifter i egen takt.`,
                text: start.budgetPerUppgift
                  ? `Ringen visar provets tid per uppgift, ${start.budgetPerUppgift} sekunder.`
                  : 'Ringen visar provets tid för varje uppgift.',
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
      resultat={(v, ctrl) => <Resultat vy={v} datum={datum} gaIgenom={ctrl.gaIgenom} lista={ctrl.lista} stang={ctrl.stang} mal={ctrl.mal} />}
    />
  )
}

function Resultat({ vy, datum, gaIgenom, lista, stang, mal }: { vy: Steg2PassVy; datum: string | null; gaIgenom: (fran?: number) => void; lista: ResultatListaVidare; stang: () => void; mal: MalData | null }) {
  const r = vy.resultat!
  const kind = vy.kind
  const ritare = steg2Ritare(kind)
  const s = lasSteg2Pass(vy)
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = r.antal ? Math.round(r.budget_s / r.antal) : s.budgetPerUppgift
  const over = s.uppgifter.filter((u) => {
    const b = s.besvarade[u.nyckel]
    return (b?.tid_s ?? 0) > budgetPer
  }).length
  const missar = s.uppgifter.map((u, i) => ({ u, i, f: s.facit[u.nyckel] })).filter((x) => !x.f?.correct)
  const R = steg2PassCopy(kind).resultat
  // Namnet ur namntabellen; ett okänt mönster ger ingen rad (aldrig ett id).
  const svagastF = r.tappade.find((t) => t.ratt < t.antal)?.familj ?? null
  const svagast = svagastF ? monsterText(kind, svagastF) : null
  return (
    <Resultatskarm
      lage="trana"
      titel={ritare.namn}
      undertitel={undertitelFor(kind, vy.grupp, vy.niva)}
      datum={datum}
      onStang={stang}
      mal={mal}
      ring={{ andel: r.antal ? r.ratt / r.antal : 0, aria: SESSION.resultat.ringAria(r.ratt, r.antal) }}
      huvudtal={SESSION.resultat.rattAv(r.ratt, r.antal)}
      tal={[
        { varde: `${tidPer} s`, etikett: `per uppgift, provets tid ${budgetPer} s` },
        { varde: `${over} av ${r.antal}`, etikett: 'över provets tid', koppar: over > 0 },
      ]}
      mening={vy.upprepad ? R.upprepad : R.ingenNiva}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: missar.length ? 'Rätt svar och förklaringen vid varje uppgift, i samma vy som träningen.' : 'Gå igenom uppgifterna och förklaringen bakom varje.',
        miniatyrer: <Steg2Miniatyrer poster={missar.map((m) => m.u)} />,
        lista: lista,
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < s.uppgifter.length ? () => gaIgenom(0) : null,
      }}
      monsterRader={s.uppgifter.map((u) => monsterRad(kind, vy.aterkoppling[u.nyckel]?.grupp))}
      tappade={{ rader: r.tappade.map((t) => ({ namn: monsterText(kind, t.familj) ?? 'Ett mönster', meta: R.tappadeMeta(t.ratt, t.antal), andel: t.andel, ratt: t.ratt, antal: t.antal })) }}
      tempo={{ titel: R.tempo(tidPer, budgetPer), innehall: <TempoStapel tidPer={tidPer} budgetPer={budgetPer} /> }}
      nastaSteg={{
        titel: R.imorgon(svagast),
        text: null,
        knapp: { text: 'En omgång till', href: steg2PassHref(kind, vy.grupp), data: 'en-omgang-till' },
      }}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
