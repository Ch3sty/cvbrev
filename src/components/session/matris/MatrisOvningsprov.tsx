'use client'

/**
 * Logikens övningsprov i ramen (plan-testflode-2026-11-20 avsnitt 2 och
 * etapp 3), motorns typ general: startskärmen på /ovningsprov/logik och
 * provet på /pass/<id>. Ersatte Startark och LogikProvFraga för logiken
 * (raderade i etapp 5).
 *
 * Format ur planens leverantör, som förut:
 *   Fast (vårt, Matrigma klassisk, SHL)  fri navigering: ‹, räknaren och
 *        uppgiftsarket; svaret kan ändras tills provet lämnas in. Svaren
 *        skickas i bakgrunden med kö och omförsök.
 *   Adaptivt (Matrigma adaptiv)  ingen väg tillbaka; Nästa väntar på
 *        serverns nästa uppgift med spinnern i knappen.
 *   Tid per uppgift (Alva)  adaptivt, och ringen gäller uppgiften: när
 *        uppgiftens tid är ute går provet vidare med tidenUte, som förut.
 * Ringen räknar ned från sessionens start på servern (hård gräns): vid noll
 * lämnas provet in, och ett 410 från servern gör samma sak. Samma rutter och
 * kroppar (PassApi) som de raderade PassFlode och LogikProvFraga skickade.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { fetchPassApi, type PassApi, type Sessionsvy } from '@/lib/traning/klient'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { logikResultat } from '@/lib/ovningsprov/resultat'
import { ovningsformatUrNyckel, type Ovningsformat } from '@/lib/ovningsprov/format'
import { START } from '@/lib/ovningsprov/copy'
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo'
import { kortDatum } from '@/lib/traning/rubrik'
import { ovningsprovHref, passHref, sessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { tranaMissatSteg } from '../resultat/nasta'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import Staplar from '@/components/traning/Staplar'
import SessionsRam from '../SessionsRam'
import Klocka from '../Klocka'
import Resultatskarm from '../Resultatskarm'
import { monsterRad, monsterText, riktadHref } from '../resultat/monster'
import Genomgang, { type GenomgangKalla, type GenomgangPost } from '../lagen/Genomgang'
import { ForsokIgen, Meddelande, Sparfelsrad, useLamnadSida, useSekunderSedan } from '../lagen/gemensamt'
import { SESSION } from '../copy'
import { sessionHandelser } from '../handelser'
import type { ArkCell } from '../Uppgiftsarket'
import { useSessionSparning } from '../useSessionSparning'
import OvningsprovStart from '../delat/OvningsprovStart'
import type { SparrProv } from '@/components/paywall/TestSparr'
import { MATRIS, type MatrisU } from '../typer/Matris'
import { MatrisMiniatyrer } from './delar'
import { KurvKort } from './MatrisNivakoll'
import { skapaMatris, slutforMatris, svarKropp, type MatrisVy } from './api'

function undertitel(f: Ovningsformat): string {
  return f.namn ? SESSION.undertitel('ovningsprov', null, f.namn) : `${SESSION.undertitel('ovningsprov')}, vårt format`
}

function bas(nyckel: string) {
  return { test_kind: 'matris', lage: 'ovningsprov' as const, niva: null, format: nyckel }
}

/* --------------------------------- Starten -------------------------------- */

export interface MatrisOvningsprovStartProps {
  format: Ovningsformat
  dagarKvar: number | null
  last: boolean
  pagaende: string | null
  tillbakaHref: string
  fran: string | null
  api?: PassApi
  /** Omgång 3: provet hon övar mot, för spärren. */
  prov?: SparrProv
}

export function MatrisOvningsprovStart({ api = fetchPassApi, ...p }: MatrisOvningsprovStartProps) {
  const router = useRouter()
  return (
    <OvningsprovStart
      typ="logik"
      testKind="matris"
      scen="matris"
      format={p.format}
      dagarKvar={p.dagarKvar}
      prov={p.prov}
      last={p.last}
      pagaende={Boolean(p.pagaende)}
      gjortIdag={null}
      tillbakaHref={p.tillbakaHref}
      fran={p.fran}
      regel2Text={START.regler[1].text}
      typnamn={MATRIS.namn}
      fotnot={START.efterLogik}
      starta={async () => {
        if (p.pagaende) {
          router.push(sessionHref(p.pagaende))
          return true
        }
        const r = await skapaMatris(api, 'general', {})
        if (!r.ok) {
          // 402: spärren gäller. Sidan läses om och visar övningsprovets vägg,
          // som mäter visningen (plats provlage, etapp 7) i stället för en
          // händelse utan vägg.
          if (r.status === 402) router.refresh()
          return false
        }
        capture('pass_startat', { typ: 'general', variant: r.vy.vy.variant })
        router.push(sessionHref(r.vy.vy.id))
        return true
      }}
    />
  )
}

/* --------------------------------- Provet --------------------------------- */

function uppgifterFor(vy: Sessionsvy): MatrisU[] {
  return vy.fragor.map((q) => ({ nyckel: q.id, grid: q.grid, options: q.options }))
}

function poster(vy: Sessionsvy): GenomgangPost<MatrisU>[] {
  const per = new Map(vy.besvarade.map((b) => [b.q_id, b]))
  return (vy.genomgang ?? []).map((g) => {
    const b = per.get(g.id)
    const valt = b?.valdVisat ?? null
    return {
      u: { nyckel: g.id, grid: g.grid, options: g.options },
      valt,
      facit: { ratt: g.rattVisat, correct: valt === g.rattVisat, regel: g.rule || null, misstag: valt != null && valt !== g.rattVisat ? g.misstag : null },
      tid_s: b?.tid_s ?? null,
    }
  })
}

type Fas = 'fraga' | 'sparar' | 'svarfel' | 'lamnar' | 'lamnafel' | 'resultat' | 'genomgang'

export interface MatrisOvningsprovProps {
  vy: MatrisVy
  api?: PassApi
}

export default function MatrisOvningsprov({ vy: forsta, api = fetchPassApi }: MatrisOvningsprovProps) {
  const router = useRouter()
  const [m, setM] = useState<MatrisVy>(forsta)
  const vy = m.vy
  const format = PROVFORMAT[vy.format as FormatNyckel] ?? PROVFORMAT.eget
  const of = ovningsformatUrNyckel('logik', vy.format)
  const perUppgift = format.tidsform === 'per_uppgift'
  const adaptiv = vy.adaptiv
  const tidsgrans = vy.tidsgrans_s ?? format.minuter * 60
  const b = useMemo(() => bas(vy.format), [vy.format])
  const antal = adaptiv ? vy.antal : vy.fragor.length
  const uppgifter = useMemo(() => uppgifterFor(vy), [vy])

  const [fas, setFas] = useState<Fas>(() => (forsta.vy.avslutad ? (forsta.avslut ? 'resultat' : 'genomgang') : 'fraga'))
  const [genomgangFran, setGenomgangFran] = useState(0)
  const [genomgangKalla, setGenomgangKalla] = useState<GenomgangKalla>('ga_igenom')
  const [svar, setSvar] = useState<Record<string, number>>(() =>
    Object.fromEntries(forsta.vy.besvarade.filter((x) => x.valdVisat != null).map((x) => [x.q_id, x.valdVisat as number]))
  )
  const besvaradeIds = useMemo(() => new Set(vy.besvarade.map((x) => x.q_id)), [vy.besvarade])
  const [idx, setIdx] = useState<number>(() => Math.min(forsta.vy.aktuell ?? 0, Math.max(0, forsta.vy.fragor.length - 1)))
  const [markerad, setMarkerad] = useState<number | null>(() => {
    const q = forsta.vy.fragor[forsta.vy.aktuell ?? 0]
    return q ? svar[q.id] ?? null : null
  })
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set([forsta.vy.aktuell ?? 0]))
  const [lamnaInOppen, setLamnaInOppen] = useState(false)
  const tider = useRef<Record<string, number>>(Object.fromEntries(forsta.vy.besvarade.map((x) => [x.q_id, x.tid_s])))
  const ankom = useRef<number>(Date.now())
  const via = useRef<'tap' | 'keyboard'>('tap')

  const startMs = useMemo(() => new Date(vy.startad).getTime(), [vy.startad])
  const pagar = fas === 'fraga' || fas === 'sparar' || fas === 'svarfel'
  const forflutet = useSekunderSedan(startMs, pagar)
  const kvarTotal = tidsgrans - forflutet
  // Alva: uppgiftens egen tid, räknad om per uppgift.
  const [uppgiftStart, setUppgiftStart] = useState<number>(() => Date.now())
  const paUppgiften = useSekunderSedan(uppgiftStart, pagar && perUppgift)
  const kvarUppgift = format.budget_s - paUppgiften

  const sparning = useSessionSparning<{ valt: number; tid: number }>(async (nyckel, d) => {
    const r = await api.svara(svarKropp({ sessionId: vy.id, questionId: nyckel, valt: d.valt, tid: d.tid }))
    if (!r.ok && r.status === 410) {
      void lamnaInRef.current(true)
      return true
    }
    return r.ok || r.status === 409
  })

  const startadSkjuten = useRef(false)
  useEffect(() => {
    if (startadSkjuten.current || forsta.vy.avslutad) return
    startadSkjuten.current = true
    sessionHandelser.startad(b, { session_id: vy.id, antal, tid_budget_s: tidsgrans, resumed: forsta.vy.besvarade.length > 0 || forflutet > 5 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lamnaUppgiften = useCallback(() => {
    const q = uppgifter[idx]
    if (!q) return 0
    const tid = (tider.current[q.nyckel] ?? 0) + Math.max(0, Math.round((Date.now() - ankom.current) / 1000))
    tider.current[q.nyckel] = tid
    ankom.current = Date.now()
    return tid
  }, [uppgifter, idx])

  /** Fast format: bekräftar den markerade på uppgiften hon lämnar, om den är ny. */
  const bekrafta = useCallback(() => {
    const q = uppgifter[idx]
    const tid = lamnaUppgiften()
    if (!q || markerad == null || markerad === svar[q.nyckel]) return svar
    const nya = { ...svar, [q.nyckel]: markerad }
    setSvar(nya)
    sparning.spara(q.nyckel, { valt: markerad, tid })
    sessionHandelser.besvarad(b, { session_id: vy.id, index: idx, elapsed_ms: tid * 1000, via: via.current, vet_inte: false })
    return nya
  }, [uppgifter, idx, lamnaUppgiften, markerad, svar, sparning, b, vy.id])

  const ga = (till: number, nya: Record<string, number> = svar) => {
    if (adaptiv || till < 0 || till >= uppgifter.length) return
    setIdx(till)
    setMarkerad(nya[uppgifter[till].nyckel] ?? null)
    setBesokta((x) => new Set(x).add(till))
    ankom.current = Date.now()
    via.current = 'tap'
    if (sparning.osparade) void sparning.forsokIgen()
  }

  const avbrottVidLamning = useLamnadSida(pagar, () =>
    sessionHandelser.avbruten(b, { session_id: vy.id, index: idx, besvarade: Object.keys(svar).length, elapsed_ms: Math.round(forflutet * 1000) })
  )

  const lamnad = useRef(false)
  const lamnaIn = useCallback(
    async (avTiden: boolean) => {
      if (lamnad.current) return
      lamnad.current = true
      const nya = adaptiv ? svar : bekrafta()
      setLamnaInOppen(false)
      setFas('lamnar')
      await sparning.tom()
      const r = await slutforMatris(api, vy.id, vy)
      if (!r.ok) {
        lamnad.current = false
        setFas('lamnafel')
        return
      }
      avbrottVidLamning()
      sessionHandelser.klar(b, { session_id: vy.id, besvarade: Object.keys(nya).length, elapsed_ms: Math.round(forflutet * 1000), over_tid: avTiden })
      setM(r.vy)
      setFas(r.vy.avslut ? 'resultat' : 'genomgang')
    },
    [adaptiv, svar, bekrafta, sparning, api, vy, avbrottVidLamning, b, forflutet]
  )
  const lamnaInRef = useRef(lamnaIn)
  lamnaInRef.current = lamnaIn

  // Hård gräns: provet lämnas in vid noll, också när det öppnas efter tiden.
  useEffect(() => {
    if (pagar && kvarTotal <= 0) void lamnaIn(true)
  }, [pagar, kvarTotal, lamnaIn])

  /** Adaptivt och tid per uppgift: svaret går till servern, som svarar med nästa uppgift. */
  const svaraAdaptivt = useCallback(
    async (valt: number | null, opt: { tidenUte?: boolean } = {}) => {
      const q = uppgifter[idx]
      if (!q || fas === 'sparar') return
      const tid = opt.tidenUte ? format.budget_s : lamnaUppgiften()
      setFas('sparar')
      const r = await api.svara(svarKropp({ sessionId: vy.id, questionId: q.nyckel, valt, tidenUte: opt.tidenUte, tid }))
      if (!r.ok) {
        if (r.status === 410) {
          void lamnaIn(true)
          return
        }
        if (r.status === 409) {
          const ny = await api.session(vy.id)
          if (ny) {
            setM((x) => ({ ...x, vy: ny }))
            if (ny.aktuell == null) {
              void lamnaIn(false)
              return
            }
            setIdx(ny.aktuell)
            setMarkerad(null)
            setUppgiftStart(Date.now())
            setFas('fraga')
            return
          }
        }
        setFas('svarfel')
        return
      }
      if (valt != null) setSvar((x) => ({ ...x, [q.nyckel]: valt }))
      sessionHandelser.besvarad(b, { session_id: vy.id, index: idx, elapsed_ms: tid * 1000, via: via.current, vet_inte: false })
      const ny: Sessionsvy = {
        ...vy,
        besvarade: [...vy.besvarade, { q_id: q.nyckel, valdVisat: opt.tidenUte ? null : valt, vetInte: false, tidenUte: !!opt.tidenUte, tid_s: tid }],
        fragor: r.nasta && !vy.fragor.some((f) => f.id === r.nasta!.id) ? [...vy.fragor, r.nasta] : vy.fragor,
        aktuell: r.klar ? null : idx + 1,
      }
      setM((x) => ({ ...x, vy: ny }))
      if (r.klar) {
        lamnad.current = false
        void lamnaIn(false)
        return
      }
      setIdx((i) => i + 1)
      setMarkerad(null)
      ankom.current = Date.now()
      setUppgiftStart(Date.now())
      via.current = 'tap'
      setFas('fraga')
    },
    [uppgifter, idx, fas, format.budget_s, lamnaUppgiften, api, vy, b, lamnaIn]
  )

  // Alva: uppgiftens tid är ute, provet går vidare utan svar.
  useEffect(() => {
    if (!perUppgift || fas !== 'fraga' || kvarUppgift > 0) return
    void svaraAdaptivt(null, { tidenUte: true })
  }, [perUppgift, fas, kvarUppgift, svaraAdaptivt])

  const stang = useCallback(() => router.push(TRANING_RUTT.alla), [router])

  /* ------------------------------ Ritningen ---------------------------- */

  if (fas === 'resultat' && m.avslut) {
    return (
      <LogikResultat
        m={m}
        gaIgenom={(fran = 0) => (setGenomgangFran(fran), setGenomgangKalla('ga_igenom'), setFas('genomgang'))}
        oppna={(i) => (setGenomgangFran(i), setGenomgangKalla('rad'), setFas('genomgang'))}
        stang={stang}
      />
    )
  }
  if (fas === 'genomgang') {
    return (
      <Genomgang
        ritare={MATRIS}
        lage="ovningsprov"
        titel={MATRIS.namn}
        poster={poster(vy)}
        start={genomgangFran}
        kalla={m.avslut ? genomgangKalla : 'direkt'}
        budgetPerUppgift={vy.budget_s}
        sessionId={vy.id}
        onStang={m.avslut ? () => setFas('resultat') : stang}
      />
    )
  }

  const q = uppgifter[Math.min(idx, uppgifter.length - 1)]
  if (!q) {
    return (
      <SessionsRam lage="ovningsprov" titel={MATRIS.namn} undertitel={undertitel(of)} form={MATRIS.form} raknare={null} framsteg={0} bekraftaAvbryt={false} onAvbryt={stang} fot={null}>
        <Meddelande titel={SESSION.fel.hamta} text={SESSION.fel.hamtaRad}>
          <ForsokIgen onClick={() => window.location.reload()} />
        </Meddelande>
      </SessionsRam>
    )
  }
  const sista = idx >= antal - 1
  const lamnar = fas === 'lamnar'
  const sparar = fas === 'sparar'
  const obesvarade = adaptiv
    ? Math.max(0, antal - vy.besvarade.length - (markerad != null ? 1 : 0))
    : uppgifter.filter((x) => svar[x.nyckel] == null && !besvaradeIds.has(x.nyckel) && !(x.nyckel === q.nyckel && markerad != null)).length
  const celler: ArkCell[] = uppgifter.map((x, i) =>
    i === idx ? 'aktuell' : svar[x.nyckel] != null ? 'besvarad' : besokta.has(i) && i < Math.max(...besokta) ? 'hoppad' : 'kvar'
  )
  const klocka = perUppgift ? <Klocka lage="grans" kvar={kvarUppgift} total={format.budget_s} /> : <Klocka lage="grans" kvar={kvarTotal} total={tidsgrans} />

  const tryckNasta = () => {
    if (sista) {
      if (!adaptiv) {
        const nya = bekrafta()
        const ob = uppgifter.filter((x) => nya[x.nyckel] == null).length
        if (ob > 0) sessionHandelser.lamnaInSparrad(b, { session_id: vy.id, obesvarade: ob })
      } else if (markerad == null) {
        sessionHandelser.lamnaInSparrad(b, { session_id: vy.id, obesvarade: 1 })
      }
      setLamnaInOppen(true)
      return
    }
    if (adaptiv) {
      if (markerad != null) void svaraAdaptivt(markerad)
      return
    }
    const nya = bekrafta()
    ga(idx + 1, nya)
  }

  return (
    <SessionsRam
      lage="ovningsprov"
      titel={MATRIS.namn}
      undertitel={undertitel(of)}
      form={MATRIS.form}
      scen="matris"
      raknare={{ nr: Math.min(idx + 1, antal), antal }}
      framsteg={Math.min(idx + 1, antal) / antal}
      klocka={klocka}
      nyckel={q.nyckel}
      bekraftaAvbryt={!lamnar}
      onAvbryt={() => {
        avbrottVidLamning()
        sessionHandelser.avbruten(b, { session_id: vy.id, index: idx, besvarade: Object.keys(svar).length, elapsed_ms: Math.round(forflutet * 1000) })
        stang()
      }}
      lamnaIn={{
        open: lamnaInOppen,
        obesvarade,
        onBekrafta: async () => {
          if (adaptiv && markerad != null && !svar[q.nyckel]) {
            setLamnaInOppen(false)
            await svaraAdaptivt(markerad)
            if (!lamnad.current) void lamnaIn(false)
            return
          }
          void lamnaIn(false)
        },
        onStang: () => setLamnaInOppen(false),
      }}
      ark={
        adaptiv
          ? null
          : {
              celler,
              onValj: (i) => {
                const nya = bekrafta()
                ga(i, nya)
              },
            }
      }
      tangent={fas === 'fraga' ? { antal: MATRIS.antalAlternativ(q), onValj: (i) => ((via.current = 'keyboard'), setMarkerad(i)) } : null}
      rad={
        fas === 'lamnafel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.lamnaIn}
          </p>
        ) : fas === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.blockerat}
          </p>
        ) : sparning.osparade > 0 ? (
          <Sparfelsrad antal={sparning.osparade} onForsok={() => void sparning.forsokIgen()} />
        ) : null
      }
      fot={{
        vanster: adaptiv
          ? null
          : {
              typ: 'tillbaka',
              disabled: idx === 0 || lamnar,
              onClick: () => {
                const nya = bekrafta()
                ga(idx - 1, nya)
              },
            },
        primar:
          fas === 'lamnafel'
            ? { text: SESSION.knapp.forsokIgen, onClick: () => void lamnaIn(kvarTotal <= 0), data: 'forsok-igen' }
            : fas === 'svarfel'
              ? { text: SESSION.knapp.forsokIgen, onClick: () => void svaraAdaptivt(markerad), data: 'forsok-igen' }
              : {
                  text: sista ? SESSION.knapp.lamnaIn : SESSION.knapp.nasta,
                  laddar: lamnar || sparar,
                  disabled: adaptiv && !sista && markerad == null,
                  data: sista ? 'lamna-in' : 'nasta',
                  onClick: tryckNasta,
                },
      }}
    >
      <MATRIS.Uppgift
        u={q}
        nr={idx + 1}
        antal={antal}
        vald={markerad}
        facit={null}
        last={fas !== 'fraga'}
        onValj={(i) => {
          via.current = 'tap'
          setMarkerad(i)
        }}
      />
    </SessionsRam>
  )
}

/** Mönstrets namn ur namntabellen, aldrig ett id. */
function famNamn(f: string | null | undefined): string {
  return monsterText('matris', f) ?? familjNamn(f ?? null) ?? 'Blandat'
}

function LogikResultat({ m, gaIgenom, oppna, stang }: { m: MatrisVy; gaIgenom: (fran?: number) => void; oppna: (i: number) => void; stang: () => void }) {
  const avslut = m.avslut!
  const vy = m.vy
  const status = m.status
  const f = PROVFORMAT[vy.format as FormatNyckel] ?? PROVFORMAT.eget
  const of = ovningsformatUrNyckel('logik', vy.format)
  const per = new Map(vy.besvarade.map((x) => [x.q_id, x]))
  const uppgifter = vy.fragor.map((q) => {
    const x = per.get(q.id)
    return { tid_s: x?.tid_s ?? 0, correct: !!vy.aterkoppling?.[q.id]?.correct || (vy.genomgang?.find((g) => g.id === q.id)?.rattVisat === x?.valdVisat && x?.valdVisat != null), besvarad: !!x && !x.tidenUte }
  })
  const saknas = Math.max(0, (avslut.obesvarade ?? 0) - uppgifter.filter((u) => !u.besvarad).length)
  for (let i = 0; i < saknas; i++) uppgifter.push({ tid_s: 0, correct: false, besvarad: false })
  const datum = status ? kortDatum(status.idag) : null
  const vm = logikResultat({
    ratt: avslut.ratt,
    antal: avslut.antal,
    obesvarade: avslut.obesvarade ?? 0,
    tid_s: avslut.tid_vagg_s ?? avslut.tid_s,
    minuter: f.minuter,
    budget_s: avslut.budget_s,
    niva_fore: avslut.niva_fore,
    niva_efter: avslut.niva_efter,
    uppgifter,
    familjer: [...avslut.familjer.passet].sort((a, b) => a.andel - b.andel).map((x) => ({ namn: famNamn(x.family), ratt: x.ratt, antal: x.antal })),
    imorgon: avslut.imorgon.text,
    datum,
  })
  const alla = poster(vy)
  const missar = alla.map((x, i) => ({ ...x, i })).filter((x) => !x.facit.correct)
  // Mönstret per uppgift ur genomgången (familjen per fråga), taggen i genomgången.
  const familjPerId = new Map((vy.genomgang ?? []).map((g) => [g.id, g.family] as const))
  return (
    <Resultatskarm
      lage="ovningsprov"
      titel={MATRIS.namn}
      monsterRader={vy.fragor.map((q) => monsterRad('matris', familjPerId.get(q.id)))}
      undertitel={undertitel(of)}
      datum={datum}
      onStang={stang}
      niva={avslut.niva_efter ?? null}
      igen={{ text: 'Gör ett nytt övningsprov', href: ovningsprovHref('logik') }}
      ring={{ andel: vm.antal ? vm.ratt / vm.antal : 0, aria: SESSION.resultat.ringAria(vm.ratt, vm.antal) }}
      huvudtal={SESSION.resultat.rattAv(vm.ratt, vm.antal)}
      tal={[
        { varde: vm.tid.varde, etikett: vm.tid.etikett },
        { varde: vm.andra.varde, etikett: vm.andra.etikett, koppar: vm.andra.koppar },
      ]}
      mening={vm.mening}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: vm.genomgang.text,
        miniatyrer: <MatrisMiniatyrer poster={missar.map((x) => ({ u: x.u, ratt: x.facit.ratt }))} />,
        lista: { ritare: MATRIS, lage: 'ovningsprov', poster: alla, sessionId: vy.id, budgetPerUppgift: vy.budget_s, onOppna: oppna },
        onGaIgenom: () => gaIgenom(missar[0]?.i ?? 0),
        onVisaAlla: missar.length && missar.length < alla.length ? () => gaIgenom(0) : null,
      }}
      tappade={
        vm.tappade
          ? {
              titel: vm.tappade.titel,
              rader: vm.tappade.rader.map((r) => {
                const fam = avslut.familjer.passet.find((x) => famNamn(x.family) === r.namn)
                return fam ? { ...r, ratt: fam.ratt, antal: fam.antal } : r
              }),
            }
          : null
      }
      tempo={{ titel: vm.tempo.titel, text: vm.tempo.text, innehall: <Staplar data={vm.tempo.staplar} aria={vm.tempo.aria} axel={vm.tempo.axel} /> }}
      tempoKort={null}
      nastaSteg={tranaMissatSteg({
        monster: avslut.familjer.passet.map((x) => ({ namn: famNamn(x.family), ratt: x.ratt, antal: x.antal, riktadHref: riktadHref('matris', x.family) })),
        typensHref: passHref('pass'),
        annars: { titel: 'Plan inför provet', text: vm.status, knapp: { text: 'Öppna planen', href: TRANING_RUTT.installningar, data: 'plan' } },
      })}
      status={<KurvKort status={status} rubrik={PASS_COPY.ommatning.kurvaRubrik} idPrefix="ov" />}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}
