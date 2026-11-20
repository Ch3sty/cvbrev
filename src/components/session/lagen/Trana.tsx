'use client'

/**
 * Träna i ramen (plan-testflode-2026-11-20 avsnitt 2 och 5.1).
 *
 * Startskärmen först, kort variant med kryssrutan "Förklaring efter varje
 * svar" (på som standard, sparas per konto). Sessionen skapas när Starta
 * trycks, med samma POST som förut; ett påbörjat från i dag återupptas.
 *
 * Under sessionen: tryck markerar, knappen bekräftar, samma gest som provet.
 *   Förklaring på   "Svara" bekräftar, korten får rätt och fel, Förklaringen
 *                   glider in under svaren, knappen blir "Nästa".
 *   Förklaring av   "Nästa" bekräftar och nästa uppgift kommer; facit i
 *                   genomgången.
 * "Vet inte, visa förklaringen" (eller "Vet inte") i fotens vänsterplats
 * tills uppgiften är besvarad. Ringen fylls per uppgift mot provets tid,
 * utan tal. Ingen väg tillbaka. Servern rättar: knappen visar spinnern
 * medan svaret går.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { arAppen, haptik } from '@/components/mobilapp/skal'
import type { RapportTestKind } from '@/lib/traning/fragaRapport'
import SessionsRam from '../SessionsRam'
import Startskarm, { type StartskarmProps } from '../Startskarm'
import Klocka from '../Klocka'
import Forklaringen from '../Forklaringen'
import { SESSION } from '../copy'
import { lagesregler } from '../lagesregler'
import { sessionHandelser, type SessionHandelseBas } from '../handelser'
import type { RamFacit, RamUppgift, TypRitare } from '../typ'
import Genomgang from './Genomgang'
import { ForsokIgen, Meddelande, ramUnderlag, useLamnadSida } from './gemensamt'

/** Träningen i ramens form; typens wiring mappar motorns vy hit. */
export interface TranaSession<U extends RamUppgift> {
  id: string
  uppgifter: U[]
  besvarade: Record<string, { valt: number | null; tid_s: number }>
  facit: Record<string, RamFacit>
  avslutad: boolean
  harResultat: boolean
  budgetPerUppgift: number
}

export type ApiFel = { ok: false; status: number }

export interface TranaApi<S> {
  skapa(): Promise<{ ok: true; vy: S } | ApiFel>
  svara(inp: { sessionId: string; nyckel: string; valt: number | null; tid: number }): Promise<{ ok: true; facit: RamFacit; klar: boolean } | ApiFel>
  hamta(sessionId: string): Promise<S | null>
  slutfor(sessionId: string): Promise<{ ok: true; vy: S } | ApiFel>
}

export interface TranaStart extends Omit<StartskarmProps, 'bas' | 'knapp' | 'kryssruta' | 'regler' | 'sparrad' | 'fortsattTillganglig'> {
  regel1: { titel: string; text?: string | null }
  regel3: { titel: string; text?: string | null }
  /** Betalväggen när träningen inte ingår (gratis). */
  sparr?: ReactNode
  fortsatt: boolean
  /** Typens egen rad när starten nekas med en känd status (matrisens riktade pass: 422, för få uppgifter). */
  startfelRad?: (status: number) => ReactNode | null
}

export interface TranaProps<U extends RamUppgift, S> {
  ritare: TypRitare<U>
  bas: SessionHandelseBas
  undertitel: (s: S | null) => string
  /** Startskärmen; utelämnad när en session redan är öppnad (adressen /pass/<id>). */
  start?: TranaStart | null
  vy?: S | null
  las: (s: S) => TranaSession<U>
  api: TranaApi<S>
  /** Kryssrutans sparade läge. */
  forklaringEfterSvar: boolean
  resultat: (s: S, ctrl: { gaIgenom: (fran?: number) => void; stang: () => void }) => ReactNode
  tillbakaHref: string
  /** Adressen byts till sessionens, så att en omladdning återupptar. */
  sessionAdress?: (id: string) => string
  /** Falskt när typens rutt inte tar emot ett obesvarat svar (etapp 2: ord och text, siffror och tabeller). */
  vetInte?: boolean
}

type Fas =
  | { typ: 'start' }
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'sparar' }
  | { typ: 'svarfel'; valt: number | null; tid: number }
  | { typ: 'facit'; klar: boolean }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; fran: number }

function forstaObesvarade<U extends RamUppgift>(s: TranaSession<U>): number {
  const i = s.uppgifter.findIndex((u) => !s.besvarade[u.nyckel])
  return i < 0 ? s.uppgifter.length : i
}

let senasteStart: { at: number; nyckel: string; svar: Promise<unknown> } | null = null

export default function Trana<U extends RamUppgift, S>(p: TranaProps<U, S>) {
  const router = useRouter()
  const { ritare, bas, api } = p
  const [vy, setVy] = useState<S | null>(p.vy ?? null)
  const s = useMemo(() => (vy ? p.las(vy) : null), [vy, p])
  const [idx, setIdx] = useState(() => (s ? Math.min(forstaObesvarade(s), s.uppgifter.length - 1) : 0))
  const [fas, setFas] = useState<Fas>(() => {
    if (!s) return p.start ? { typ: 'start' } : { typ: 'startar' }
    if (s.avslutad) return s.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 }
    return { typ: 'fraga' }
  })
  const [forklaring, setForklaring] = useState(p.forklaringEfterSvar)
  const [markerad, setMarkerad] = useState<number | null>(null)
  const regler = lagesregler('trana', { forklaringEfterSvar: forklaring })
  const direkt = regler.aterkoppling === 'direkt'
  const via = useRef<'tap' | 'keyboard'>('tap')

  /* ------------------------------ Tiden ------------------------------ */
  const ankom = useRef<number>(0)
  const [sekunder, setSekunder] = useState(0)
  const tickar = fas.typ === 'fraga' || fas.typ === 'sparar'
  useEffect(() => {
    if (fas.typ !== 'fraga') return
    ankom.current = performance.now()
    setSekunder(0)
    setMarkerad(null)
    via.current = 'tap'
  }, [idx, s?.id, fas.typ])
  useEffect(() => {
    if (!tickar) return
    const t = setInterval(() => setSekunder((performance.now() - ankom.current) / 1000), 250)
    return () => clearInterval(t)
  }, [tickar])
  const sessionStart = useRef<number>(Date.now())

  /* ------------------------------ Starten ----------------------------- */
  const visaSession = useCallback(
    (ny: S, resumed: boolean) => {
      const n = p.las(ny)
      setVy(ny)
      setIdx(Math.min(forstaObesvarade(n), n.uppgifter.length - 1))
      if (n.avslutad) {
        setFas(n.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 })
        return
      }
      setFas({ typ: 'fraga' })
      sessionStart.current = Date.now()
      sessionHandelser.startad(bas, {
        session_id: n.id,
        antal: n.uppgifter.length,
        tid_budget_s: n.budgetPerUppgift * n.uppgifter.length,
        resumed: resumed || Object.keys(n.besvarade).length > 0,
      })
      if (p.sessionAdress) {
        try {
          window.history.replaceState(null, '', p.sessionAdress(n.id))
        } catch {
          // Adressen är en bekvämlighet.
        }
      }
    },
    [p, bas]
  )

  const starta = useCallback(async () => {
    setFas({ typ: 'startar' })
    const nu = Date.now()
    const nyckel = `${bas.test_kind}:${bas.lage}`
    if (!senasteStart || senasteStart.nyckel !== nyckel || nu - senasteStart.at > 30_000) senasteStart = { at: nu, nyckel, svar: api.skapa() }
    const r = (await senasteStart.svar) as Awaited<ReturnType<TranaApi<S>['skapa']>>
    if (!r.ok) {
      senasteStart = null
      setFas({ typ: 'startfel', status: r.status })
      return
    }
    visaSession(r.vy, p.start?.fortsatt ?? false)
  }, [api, bas, visaSession, p.start?.fortsatt])

  // Utan startskärm och utan session (gammal länk): starta direkt som förut.
  const autostart = useRef(false)
  useEffect(() => {
    if (autostart.current || p.start || p.vy) return
    autostart.current = true
    void starta()
  }, [starta, p.start, p.vy])

  // Öppnad på sessionens adress mitt i: första uppgiften visas nu.
  const oppnadSkjuten = useRef(false)
  useEffect(() => {
    if (oppnadSkjuten.current || !s || s.avslutad || !p.vy) return
    oppnadSkjuten.current = true
    sessionHandelser.startad(bas, { session_id: s.id, antal: s.uppgifter.length, tid_budget_s: s.budgetPerUppgift * s.uppgifter.length, resumed: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const andraForklaring = (v: boolean) => {
    setForklaring(v)
    sessionHandelser.installningAndrad({ forklaring_efter_svar: v })
    void fetch('/api/traning/installningar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forklaring_efter_svar: v }),
    }).catch(() => {})
  }

  /* ------------------------------ Avslutet ---------------------------- */
  const avsluta = useCallback(
    async (id: string) => {
      setFas({ typ: 'avslutar' })
      const r = await api.slutfor(id)
      if (!r.ok) {
        setFas({ typ: 'avslutfel' })
        return
      }
      senasteStart = null
      const n = p.las(r.vy)
      sessionHandelser.klar(bas, {
        session_id: n.id,
        besvarade: Object.keys(n.besvarade).length,
        elapsed_ms: Date.now() - sessionStart.current,
        over_tid: Object.values(n.besvarade).reduce((sum, b) => sum + b.tid_s, 0) > n.budgetPerUppgift * n.uppgifter.length,
      })
      setVy(r.vy)
      setFas(n.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 })
    },
    [api, p, bas]
  )

  // Alla besvarade men inte avslutad (omladdning efter sista svaret): avsluta.
  const avslutadVidStart = useRef(false)
  useEffect(() => {
    if (avslutadVidStart.current || !s || !p.vy) return
    avslutadVidStart.current = true
    if (!s.avslutad && forstaObesvarade(s) >= s.uppgifter.length) void avsluta(s.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------- Svaret ----------------------------- */
  // Svar i den här visningen, ovanpå motorns vy (som läses om först vid avslutet).
  const [lokal, setLokal] = useState<Record<string, { valt: number | null; tid: number; facit: RamFacit }>>({})
  const svara = useCallback(
    async (valt: number | null, tidIn?: number) => {
      if (!s) return
      const u = s.uppgifter[idx]
      if (!u) return
      const tid = tidIn ?? Math.max(0, Math.round((performance.now() - ankom.current) / 1000))
      const elapsed = Math.round(performance.now() - ankom.current)
      setFas({ typ: 'sparar' })
      const r = await api.svara({ sessionId: s.id, nyckel: u.nyckel, valt, tid })
      let facit: RamFacit | null = null
      let klar = false
      if (r.ok) {
        facit = r.facit
        klar = r.klar
      } else if (r.status === 409) {
        // Redan besvarad (dubbeltryck, två flikar): läs om sessionen.
        const ny = await api.hamta(s.id)
        if (ny) {
          const n = p.las(ny)
          facit = n.facit[u.nyckel] ?? null
          klar = forstaObesvarade(n) >= n.uppgifter.length
          setVy(ny)
        }
      }
      if (!facit) {
        setFas({ typ: 'svarfel', valt, tid })
        return
      }
      sessionHandelser.besvarad(bas, { session_id: s.id, index: idx, elapsed_ms: elapsed, via: via.current, vet_inte: valt === null, ratt: facit.correct })
      if (arAppen() && valt !== null && direkt) haptik('latt')
      const f = facit
      setLokal((l) => ({ ...l, [u.nyckel]: { valt, tid, facit: f } }))
      if (direkt) {
        setFas({ typ: 'facit', klar })
        return
      }
      if (klar) {
        void avsluta(s.id)
        return
      }
      setIdx((i) => Math.min(i + 1, s.uppgifter.length - 1))
      setFas({ typ: 'fraga' })
    },
    [api, s, idx, p, bas, direkt, avsluta]
  )
  const nasta = useCallback(() => {
    if (!s || fas.typ !== 'facit') return
    if (fas.klar) {
      void avsluta(s.id)
      return
    }
    setIdx((i) => Math.min(i + 1, s.uppgifter.length - 1))
    setFas({ typ: 'fraga' })
  }, [s, fas, avsluta])

  const sessionAktiv = Boolean(s) && (fas.typ === 'fraga' || fas.typ === 'sparar' || fas.typ === 'facit' || fas.typ === 'svarfel')
  const besvaradeAntal = s ? new Set([...Object.keys(s.besvarade), ...Object.keys(lokal)]).size : 0
  const avbrottVidLamning = useLamnadSida(sessionAktiv, () => {
    if (s) sessionHandelser.avbruten(bas, { session_id: s.id, index: idx, besvarade: besvaradeAntal, elapsed_ms: Date.now() - sessionStart.current })
  })

  const tillbaka = useCallback(() => router.push(p.tillbakaHref), [router, p.tillbakaHref])

  /* ------------------------------ Ritningen --------------------------- */

  if (fas.typ === 'start' || ((fas.typ === 'startar' || fas.typ === 'startfel') && p.start && !s)) {
    const st = p.start!
    const sparrad = st.sparr ? 'premium' : 'none'
    const startfel = fas.typ === 'startfel'
    return (
      <Startskarm
        {...st}
        bas={bas}
        regler={[st.regel1, st.sparr ? { titel: 'Förklaringen efter varje svar.', text: SESSION.start.kryssrutaPa } : null, st.regel3]}
        kryssruta={st.sparr ? null : { varde: forklaring, onAndra: andraForklaring }}
        sparrad={sparrad}
        fortsattTillganglig={st.fortsatt}
        knapp={
          st.sparr
            ? null
            : {
                text: st.fortsatt ? SESSION.start.fortsatt.trana : SESSION.start.starta.trana,
                onClick: () => void starta(),
                laddar: fas.typ === 'startar',
              }
        }
        kortRad={
          startfel ? (
            <span role="alert" className="text-ink-1">
              {(fas.typ === 'startfel' && st.startfelRad?.(fas.status)) || SESSION.fel.start}
            </span>
          ) : (
            st.kortRad
          )
        }
      />
    )
  }

  const titel = ritare.namn
  const undertitel = p.undertitel(vy)

  if (!s || fas.typ === 'startar' || fas.typ === 'startfel') {
    return (
      <SessionsRam lage="trana" titel={titel} undertitel={undertitel} form={ritare.form} raknare={null} framsteg={0} bekraftaAvbryt={false} onAvbryt={tillbaka} fot={null}>
        {fas.typ === 'startfel' ? (
          <Meddelande titel={SESSION.fel.hamta} text={SESSION.fel.hamtaRad}>
            <ForsokIgen onClick={() => void starta()} />
          </Meddelande>
        ) : (
          <p aria-busy="true" className="loading-thread rounded-xl border border-kant bg-papper p-4 text-sm text-ink-3">
            {SESSION.laddar.session}
          </p>
        )}
      </SessionsRam>
    )
  }

  const antal = s.uppgifter.length

  if (fas.typ === 'resultat' && vy) {
    return <>{p.resultat(vy, { gaIgenom: (fran = 0) => setFas({ typ: 'genomgang', fran }), stang: tillbaka })}</>
  }

  if (fas.typ === 'genomgang') {
    const poster = s.uppgifter.map((u) => {
      const b = s.besvarade[u.nyckel]
      const f = s.facit[u.nyckel]
      return { u, valt: b?.valt ?? null, facit: f ?? { ratt: -1, correct: false, regel: null, misstag: null }, tid_s: b?.tid_s ?? null }
    })
    return (
      <Genomgang
        ritare={ritare}
        lage="trana"
        titel={titel}
        poster={poster}
        start={fas.fran}
        budgetPerUppgift={s.budgetPerUppgift}
        sessionId={s.id}
        onStang={s.harResultat ? () => setFas({ typ: 'resultat' }) : tillbaka}
      />
    )
  }

  if (fas.typ === 'avslutar' || fas.typ === 'avslutfel') {
    return (
      <SessionsRam
        lage="trana"
        titel={titel}
        undertitel={undertitel}
        form={ritare.form}
        raknare={{ nr: antal, antal }}
        framsteg={1}
        bekraftaAvbryt={false}
        onAvbryt={tillbaka}
        fot={
          fas.typ === 'avslutfel'
            ? { primar: { text: SESSION.knapp.forsokIgen, onClick: () => void avsluta(s.id) } }
            : { primar: { text: SESSION.knapp.visaResultat, onClick: () => {}, laddar: true } }
        }
      >
        {fas.typ === 'avslutfel' ? (
          <Meddelande titel={SESSION.fel.avslut} />
        ) : (
          <p className="text-center text-meta text-ink-3" role="status" aria-live="polite">
            {SESSION.laddar.resultat}
          </p>
        )}
      </SessionsRam>
    )
  }

  const u = s.uppgifter[Math.min(idx, antal - 1)]
  const sparad = lokal[u.nyckel]
  const facit = fas.typ === 'facit' ? sparad?.facit ?? s.facit[u.nyckel] ?? null : null
  const valtVisat = fas.typ === 'facit' ? (sparad ? sparad.valt : s.besvarade[u.nyckel]?.valt ?? null) : fas.typ === 'svarfel' ? fas.valt : markerad
  const besvarade = besvaradeAntal
  const harSvarat = fas.typ === 'facit'
  const sistaSvaret = fas.typ === 'facit' && fas.klar
  const Uppgift = ritare.Uppgift
  const kanValja = fas.typ === 'fraga'

  const primar =
    fas.typ === 'svarfel'
      ? { text: SESSION.knapp.forsokIgen, onClick: () => void svara(fas.valt, fas.tid), data: 'forsok-igen' }
      : harSvarat
        ? { text: sistaSvaret ? SESSION.knapp.visaResultat : SESSION.knapp.nasta, onClick: nasta, data: 'nasta' }
        : direkt
          ? { text: SESSION.knapp.svara, onClick: () => markerad !== null && void svara(markerad), disabled: markerad === null, laddar: fas.typ === 'sparar', data: 'svara' }
          : {
              text: idx >= antal - 1 ? SESSION.knapp.visaResultat : SESSION.knapp.nasta,
              onClick: () => markerad !== null && void svara(markerad),
              disabled: markerad === null,
              laddar: fas.typ === 'sparar',
              data: 'nasta',
            }

  const utfall = facit ? (valtVisat === null ? 'vet_inte' : facit.correct ? 'ratt' : 'fel') : null
  const tidPaUppgift = sparad?.tid ?? s.besvarade[u.nyckel]?.tid_s ?? Math.round(sekunder)
  const forklaringen =
    facit && utfall ? (
      <Forklaringen
        utfall={utfall}
        tid={{ sekunder: tidPaUppgift, budget: s.budgetPerUppgift }}
        regel={facit.regel}
        text={facit.text}
        misstag={facit.misstag}
        detalj={facit.detalj}
        rapport={{ qId: u.nyckel, sessionId: s.id, testKind: ritare.kind as RapportTestKind, bankVersion: null }}
        rullaFram
      />
    ) : null

  return (
    <SessionsRam
      lage="trana"
      titel={titel}
      undertitel={undertitel}
      form={ritare.form}
      raknare={{ nr: Math.min(idx + 1, antal), antal }}
      framsteg={besvarade / antal}
      klocka={<Klocka lage="referens" sekunder={harSvarat ? tidPaUppgift : sekunder} budget={s.budgetPerUppgift} />}
      nyckel={u.nyckel}
      underlag={ramUnderlag(ritare, u)}
      bekraftaAvbryt
      onAvbryt={() => {
        avbrottVidLamning()
        sessionHandelser.avbruten(bas, { session_id: s.id, index: idx, besvarade, elapsed_ms: Date.now() - sessionStart.current })
        tillbaka()
      }}
      tangent={kanValja ? { antal: ritare.antalAlternativ(u), onValj: (i) => ((via.current = 'keyboard'), setMarkerad(i)) } : null}
      rad={
        fas.typ === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.blockerat}
          </p>
        ) : null
      }
      fot={{
        vanster:
          harSvarat || fas.typ === 'svarfel' || p.vetInte === false
            ? null
            : {
                typ: 'vet_inte',
                text: direkt ? SESSION.knapp.vetInte : SESSION.knapp.vetInteKort,
                onClick: () => void svara(null),
                disabled: fas.typ !== 'fraga',
              },
        primar,
      }}
    >
      <div className="flex flex-col gap-4">
        <Uppgift
          u={u}
          nr={idx + 1}
          antal={antal}
          vald={valtVisat}
          facit={facit ? facit.ratt : null}
          efterFel={Boolean(facit && !facit.correct && valtVisat !== null)}
          last={!kanValja}
          onValj={(i) => {
            via.current = 'tap'
            setMarkerad(i)
          }}
          forklaring={ritare.forklaringIUppgift ? forklaringen : undefined}
        />
        {ritare.forklaringIUppgift ? null : forklaringen}
      </div>
    </SessionsRam>
  )
}
