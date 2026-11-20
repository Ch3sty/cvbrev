'use client'

/**
 * Nivåkollen i ramen (plan-testflode-2026-11-20 avsnitt 2 och 5.2).
 *
 * Startskärmen först; sessionen skapas när Starta trycks och första
 * uppgiften kommer i samma svar (samma POST som förut). Ingen klocka, ingen
 * väg tillbaka, ingen "Vet inte": Nästa är inaktiv tills ett svar är valt.
 * Tyst till resultatet. Svaren skickas i bakgrunden med kö och omförsök;
 * före avslutet töms kön. Sista knappen heter "Visa resultatet".
 * Öppnas den igen samma dag visas dagens resultat direkt.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import SessionsRam from '../SessionsRam'
import Startskarm, { type StartRegel, type StartskarmProps } from '../Startskarm'
import { SESSION } from '../copy'
import { sessionHandelser, type SessionHandelseBas } from '../handelser'
import type { RamFacit, RamUppgift, TypRitare } from '../typ'
import { useSessionSparning } from '../useSessionSparning'
import Genomgang from './Genomgang'
import { ForsokIgen, Meddelande, Sparfelsrad, useLamnadSida } from './gemensamt'
import type { ApiFel } from './Trana'

export interface NivakollSession<U extends RamUppgift> {
  id: string
  uppgifter: U[]
  besvarade: Record<string, { valt: number | null; tid_s: number }>
  /** Efter avslutet: facit och förklaring per uppgift. */
  facit: Record<string, RamFacit> | null
  avslutad: boolean
  harResultat: boolean
  budgetPerUppgift: number
}

export interface NivakollApi<S> {
  skapa(): Promise<{ ok: true; vy: S } | ApiFel>
  /** Sant när svaret sparades (409 räknas som sparat). */
  svara(inp: { sessionId: string; nyckel: string; valt: number; tid: number }): Promise<boolean>
  slutfor(sessionId: string): Promise<{ ok: true; vy: S } | ApiFel>
}

export interface NivakollStart extends Omit<StartskarmProps, 'bas' | 'knapp' | 'kryssruta' | 'regler' | 'sparrad' | 'fortsattTillganglig'> {
  regler: [StartRegel, StartRegel, StartRegel]
  sparr?: ReactNode
  fortsatt: boolean
}

export interface NivakollProps<U extends RamUppgift, S> {
  ritare: TypRitare<U>
  bas: SessionHandelseBas
  undertitel: string
  start?: NivakollStart | null
  vy?: S | null
  las: (s: S) => NivakollSession<U>
  api: NivakollApi<S>
  /** Skjuts när en ny Nivåkoll visar sin första uppgift (nivamatning_startad som förut). */
  onStartad?: (s: S) => void
  /** Raden på resultatet när dagens Nivåkoll öppnas igen. */
  resultat: (s: S, ctrl: { gaIgenom: (fran?: number) => void; stang: () => void; gjordIdag: boolean }) => ReactNode
  tillbakaHref: string
  sessionAdress?: (id: string) => string
  /** Dagens färdiga Nivåkoll öppnad igen: resultatet får raden om i morgon. */
  gjordIdag?: boolean
}

type Fas =
  | { typ: 'start' }
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; fran: number }

function forstaObesvarade<U extends RamUppgift>(s: NivakollSession<U>): number {
  const i = s.uppgifter.findIndex((u) => !s.besvarade[u.nyckel])
  return i < 0 ? s.uppgifter.length : i
}

let senasteStart: { at: number; nyckel: string; svar: Promise<unknown> } | null = null

export default function Nivakoll<U extends RamUppgift, S>(p: NivakollProps<U, S>) {
  const router = useRouter()
  const { ritare, bas, api } = p
  const [vy, setVy] = useState<S | null>(p.vy ?? null)
  const s = useMemo(() => (vy ? p.las(vy) : null), [vy, p])
  const [idx, setIdx] = useState(() => (s ? Math.min(forstaObesvarade(s), s.uppgifter.length - 1) : 0))
  const [svar, setSvar] = useState<Record<string, number>>(() => {
    const ut: Record<string, number> = {}
    if (s) for (const [k, b] of Object.entries(s.besvarade)) if (b.valt != null) ut[k] = b.valt
    return ut
  })
  // Öppnad samma dag när den redan är gjord: resultatet med raden om i morgon.
  const gjordIdag = useRef(Boolean(p.gjordIdag))
  const [fas, setFas] = useState<Fas>(() => {
    if (!s) return p.start ? { typ: 'start' } : { typ: 'startar' }
    if (s.avslutad) return s.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 }
    return { typ: 'fraga' }
  })
  const [markerad, setMarkerad] = useState<number | null>(null)
  const via = useRef<'tap' | 'keyboard'>('tap')
  const ankom = useRef<number>(Date.now())
  const sessionStart = useRef<number>(Date.now())

  const sparning = useSessionSparning<{ sessionId: string; valt: number; tid: number }>((nyckel, d) =>
    api.svara({ sessionId: d.sessionId, nyckel, valt: d.valt, tid: d.tid })
  )

  const visaSession = useCallback(
    (ny: S, resumed: boolean) => {
      const n = p.las(ny)
      setVy(ny)
      const forsta = forstaObesvarade(n)
      setIdx(Math.min(forsta, n.uppgifter.length - 1))
      const ut: Record<string, number> = {}
      for (const [k, b] of Object.entries(n.besvarade)) if (b.valt != null) ut[k] = b.valt
      setSvar(ut)
      if (n.avslutad) {
        gjordIdag.current = true
        setFas(n.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 })
        return
      }
      if (forsta === 0) p.onStartad?.(ny)
      setFas({ typ: 'fraga' })
      ankom.current = Date.now()
      sessionStart.current = Date.now()
      sessionHandelser.startad(bas, { session_id: n.id, antal: n.uppgifter.length, tid_budget_s: null, resumed: resumed || forsta > 0 })
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
    const nyckel = `${bas.test_kind}:nivakoll`
    if (!senasteStart || senasteStart.nyckel !== nyckel || nu - senasteStart.at > 30_000) senasteStart = { at: nu, nyckel, svar: api.skapa() }
    const r = (await senasteStart.svar) as Awaited<ReturnType<NivakollApi<S>['skapa']>>
    if (!r.ok) {
      senasteStart = null
      setFas({ typ: 'startfel', status: r.status })
      return
    }
    visaSession(r.vy, p.start?.fortsatt ?? false)
  }, [api, bas, visaSession, p.start?.fortsatt])

  const autostart = useRef(false)
  useEffect(() => {
    if (autostart.current || p.start || p.vy) return
    autostart.current = true
    void starta()
  }, [starta, p.start, p.vy])

  const oppnad = useRef(false)
  useEffect(() => {
    if (oppnad.current || !s || s.avslutad || !p.vy) return
    oppnad.current = true
    sessionHandelser.startad(bas, { session_id: s.id, antal: s.uppgifter.length, tid_budget_s: null, resumed: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const avsluta = useCallback(
    async (id: string) => {
      setFas({ typ: 'avslutar' })
      const tom = await sparning.tom()
      const r = tom ? await api.slutfor(id) : ({ ok: false, status: 0 } as ApiFel)
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
        over_tid: false,
      })
      setVy(r.vy)
      setFas(n.harResultat ? { typ: 'resultat' } : { typ: 'genomgang', fran: 0 })
    },
    [api, p, bas, sparning]
  )

  const avslutadVidStart = useRef(false)
  useEffect(() => {
    if (avslutadVidStart.current || !s || !p.vy) return
    avslutadVidStart.current = true
    if (!s.avslutad && forstaObesvarade(s) >= s.uppgifter.length) void avsluta(s.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const besvaradeAntal = Object.keys(svar).length
  const aktiv = Boolean(s) && fas.typ === 'fraga'
  const avbrottVidLamning = useLamnadSida(aktiv, () => {
    if (s) sessionHandelser.avbruten(bas, { session_id: s.id, index: idx, besvarade: besvaradeAntal, elapsed_ms: Date.now() - sessionStart.current })
  })
  const tillbaka = useCallback(() => router.push(p.tillbakaHref), [router, p.tillbakaHref])

  const nasta = () => {
    if (!s || markerad === null || fas.typ !== 'fraga') return
    const u = s.uppgifter[idx]
    const tid = Math.max(0, Math.round((Date.now() - ankom.current) / 1000))
    sparning.spara(u.nyckel, { sessionId: s.id, valt: markerad, tid })
    sessionHandelser.besvarad(bas, { session_id: s.id, index: idx, elapsed_ms: Date.now() - ankom.current, via: via.current, vet_inte: false })
    const nya = { ...svar, [u.nyckel]: markerad }
    setSvar(nya)
    const kvar = s.uppgifter.findIndex((x) => nya[x.nyckel] == null)
    if (kvar < 0) {
      avbrottVidLamning()
      void avsluta(s.id)
      return
    }
    setIdx(kvar)
    setMarkerad(null)
    ankom.current = Date.now()
    via.current = 'tap'
  }

  /* ------------------------------ Ritningen --------------------------- */

  if (fas.typ === 'start' || ((fas.typ === 'startar' || fas.typ === 'startfel') && p.start && !s)) {
    const st = p.start!
    return (
      <Startskarm
        {...st}
        bas={bas}
        sparrad={st.sparr ? 'premium' : 'none'}
        fortsattTillganglig={st.fortsatt}
        knapp={
          st.sparr
            ? null
            : {
                text: st.fortsatt ? SESSION.start.fortsatt.nivakoll : SESSION.start.starta.nivakoll,
                onClick: () => void starta(),
                laddar: fas.typ === 'startar',
              }
        }
        kortRad={
          fas.typ === 'startfel' ? (
            <span role="alert" className="text-ink-1">
              {SESSION.fel.start}
            </span>
          ) : (
            st.kortRad
          )
        }
      />
    )
  }

  const titel = ritare.namn
  if (!s || fas.typ === 'startar' || fas.typ === 'startfel') {
    return (
      <SessionsRam lage="nivakoll" titel={titel} undertitel={p.undertitel} form={ritare.form} raknare={null} framsteg={0} bekraftaAvbryt={false} onAvbryt={tillbaka} fot={null}>
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
    return <>{p.resultat(vy, { gaIgenom: (fran = 0) => setFas({ typ: 'genomgang', fran }), stang: tillbaka, gjordIdag: gjordIdag.current })}</>
  }

  if (fas.typ === 'genomgang') {
    const poster = s.uppgifter.map((u) => ({
      u,
      valt: s.besvarade[u.nyckel]?.valt ?? null,
      facit: s.facit?.[u.nyckel] ?? { ratt: -1, correct: false, regel: null, misstag: null },
      tid_s: s.besvarade[u.nyckel]?.tid_s ?? null,
    }))
    return (
      <Genomgang
        ritare={ritare}
        lage="nivakoll"
        titel={titel}
        poster={poster}
        start={fas.fran}
        budgetPerUppgift={s.budgetPerUppgift}
        sessionId={s.id}
        onStang={s.harResultat ? () => setFas({ typ: 'resultat' }) : tillbaka}
      />
    )
  }

  const avslutar = fas.typ === 'avslutar' || fas.typ === 'avslutfel'
  const u = s.uppgifter[Math.min(idx, antal - 1)]
  const sista = Object.keys(svar).length >= antal - 1 && svar[u.nyckel] == null
  const Uppgift = ritare.Uppgift

  return (
    <SessionsRam
      lage="nivakoll"
      titel={titel}
      undertitel={p.undertitel}
      form={ritare.form}
      raknare={{ nr: Math.min(idx + 1, antal), antal }}
      framsteg={(Math.min(idx + 1, antal)) / antal}
      nyckel={u.nyckel}
      bekraftaAvbryt={!avslutar}
      onAvbryt={() => {
        avbrottVidLamning()
        sessionHandelser.avbruten(bas, { session_id: s.id, index: idx, besvarade: besvaradeAntal, elapsed_ms: Date.now() - sessionStart.current })
        void sparning.tom()
        tillbaka()
      }}
      tangent={fas.typ === 'fraga' ? { antal: ritare.antalAlternativ(u), onValj: (i) => ((via.current = 'keyboard'), setMarkerad(i)) } : null}
      rad={
        fas.typ === 'avslutfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.fel.avslut}
          </p>
        ) : sparning.osparade > 0 ? (
          <Sparfelsrad antal={sparning.osparade} onForsok={() => void sparning.forsokIgen()} />
        ) : null
      }
      fot={{
        primar:
          fas.typ === 'avslutfel'
            ? { text: SESSION.knapp.forsokIgen, onClick: () => void avsluta(s.id), data: 'forsok-igen' }
            : {
                text: sista || avslutar ? SESSION.knapp.visaResultat : SESSION.knapp.nasta,
                onClick: nasta,
                disabled: markerad === null && !avslutar,
                laddar: fas.typ === 'avslutar',
                data: sista ? 'visa-resultatet' : 'nasta',
              },
      }}
    >
      <Uppgift
        u={u}
        nr={idx + 1}
        antal={antal}
        vald={avslutar ? svar[u.nyckel] ?? markerad : markerad}
        facit={null}
        last={fas.typ !== 'fraga'}
        onValj={(i) => {
          via.current = 'tap'
          setMarkerad(i)
        }}
      />
    </SessionsRam>
  )
}
