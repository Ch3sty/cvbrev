'use client'

/**
 * Nivåtestet i ramen (plan-testflode-2026-11-20 avsnitt 2): fast lista med
 * fri navigering, mjuk gräns, tyst till resultatet.
 *
 * - Ringen räknar ned från provets tid ur config, räknat från serverns
 *   started_at; vid noll blir den koppar med tiden över och testet går vidare.
 * - Tryck markerar, Nästa bekräftar. Nästa utan val lämnar obesvarad.
 *   ‹, räknaren och uppgiftsarket går tillbaka; ett bekräftat svar får
 *   ändras och skickas på samma route med samma kropp som förut.
 * - Optimistisk nästa: svaret skickas i bakgrunden med kö och omförsök.
 * - Sista uppgiften: Lämna in med dialog; kön töms före inlämningen.
 *
 * Typen ritar uppgiften (TypRitare); läget äger allt annat.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import SessionsRam from '../SessionsRam'
import Klocka from '../Klocka'
import { SESSION } from '../copy'
import { sessionHandelser, type SessionHandelseBas } from '../handelser'
import type { ArkCell } from '../Uppgiftsarket'
import type { RamUppgift, TypRitare } from '../typ'
import { useSessionSparning } from '../useSessionSparning'
import { ramUnderlag, Sparfelsrad, useLamnadSida, useSekunderSedan } from './gemensamt'

export interface NivatestProps<U extends RamUppgift> {
  ritare: TypRitare<U>
  bas: SessionHandelseBas
  undertitel: string
  sessionId: string
  uppgifter: U[]
  /** Sparade svar per uppgift (visat index), null för obesvarad. */
  sparade: (number | null)[]
  /** Serverns started_at. */
  startad: string | null
  /** Provets tid i sekunder (config). */
  budgetS: number
  /** Skickar ett svar. Sant när servern tog emot det. Samma route och kropp som förut. */
  skicka: (u: U, index: number, sekunder: number) => Promise<boolean>
  /** Lämnar in. Sant när servern rättat. */
  lamnaIn: () => Promise<boolean>
  efterInlamning: () => void
  avbrytHref: string
}

export default function Nivatest<U extends RamUppgift>(p: NivatestProps<U>) {
  const router = useRouter()
  const { ritare, uppgifter, bas, sessionId } = p
  const antal = uppgifter.length
  const forstaObesvarade = useMemo(() => {
    const i = p.sparade.findIndex((s) => s == null)
    return i < 0 ? Math.max(0, antal - 1) : i
    // Bara vid montering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [idx, setIdx] = useState(forstaObesvarade)
  const [svar, setSvar] = useState<(number | null)[]>(() => uppgifter.map((_, i) => p.sparade[i] ?? null))
  const [markerad, setMarkerad] = useState<number | null>(() => p.sparade[forstaObesvarade] ?? null)
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set(Array.from({ length: forstaObesvarade + 1 }, (_, i) => i)))
  const [lamnaInOppen, setLamnaInOppen] = useState(false)
  const [lamnar, setLamnar] = useState(false)
  const [lamnaFel, setLamnaFel] = useState(false)
  const via = useRef<'tap' | 'keyboard'>('tap')
  const ankom = useRef<number>(Date.now())

  const startMs = useMemo(() => (p.startad ? new Date(p.startad).getTime() : Date.now()), [p.startad])
  const forflutet = useSekunderSedan(startMs, !lamnar)
  const kvar = p.budgetS - forflutet

  const sparning = useSessionSparning<{ index: number; sekunder: number; u: U }>((_, d) => p.skicka(d.u, d.index, d.sekunder))

  // test_session_started när första uppgiften visas.
  const startadSkjuten = useRef(false)
  useEffect(() => {
    if (startadSkjuten.current) return
    startadSkjuten.current = true
    sessionHandelser.startad(bas, {
      session_id: sessionId,
      antal,
      tid_budget_s: p.budgetS,
      resumed: p.sparade.some((s) => s != null),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const besvaradeAntal = svar.filter((s) => s != null).length
  const avbrottVidLamning = useLamnadSida(!lamnar, () =>
    sessionHandelser.avbruten(bas, { session_id: sessionId, index: idx, besvarade: besvaradeAntal, elapsed_ms: Math.round(forflutet * 1000) })
  )

  /** Bekräftar den markerade på uppgiften hon lämnar, om den är ny. */
  const bekrafta = useCallback(() => {
    const u = uppgifter[idx]
    if (!u || markerad == null || markerad === svar[idx]) return svar
    const sek = Math.max(0, Math.floor((Date.now() - ankom.current) / 1000))
    const nya = [...svar]
    nya[idx] = markerad
    setSvar(nya)
    sparning.spara(u.nyckel, { index: markerad, sekunder: sek, u })
    sessionHandelser.besvarad(bas, {
      session_id: sessionId,
      index: idx,
      elapsed_ms: Date.now() - ankom.current,
      via: via.current,
      vet_inte: false,
    })
    return nya
  }, [uppgifter, idx, markerad, svar, sparning, bas, sessionId])

  const ga = useCallback(
    (till: number, nya: (number | null)[] = svar) => {
      if (till < 0 || till >= antal) return
      setIdx(till)
      setMarkerad(nya[till] ?? null)
      setBesokta((b) => new Set(b).add(till))
      ankom.current = Date.now()
      via.current = 'tap'
      if (sparning.osparade) void sparning.forsokIgen()
    },
    [antal, svar, sparning]
  )

  const sista = idx === antal - 1
  const nasta = () => {
    const nya = bekrafta()
    if (sista) {
      const obesvarade = nya.filter((s) => s == null).length
      if (obesvarade > 0) sessionHandelser.lamnaInSparrad(bas, { session_id: sessionId, obesvarade })
      setLamnaFel(false)
      setLamnaInOppen(true)
      return
    }
    ga(idx + 1, nya)
  }

  const lamna = async () => {
    setLamnar(true)
    setLamnaFel(false)
    const tom = await sparning.tom()
    const ok = tom && (await p.lamnaIn())
    if (!ok) {
      setLamnar(false)
      setLamnaFel(true)
      setLamnaInOppen(false)
      return
    }
    avbrottVidLamning()
    const besvarade = svar.filter((s) => s != null).length
    sessionHandelser.klar(bas, { session_id: sessionId, besvarade, elapsed_ms: Math.round(forflutet * 1000), over_tid: kvar < 0 })
    setLamnaInOppen(false)
    p.efterInlamning()
  }

  const celler: ArkCell[] = uppgifter.map((_, i) =>
    i === idx ? 'aktuell' : svar[i] != null ? 'besvarad' : besokta.has(i) && i < Math.max(...besokta) ? 'hoppad' : 'kvar'
  )

  const u = uppgifter[idx]
  if (!u) return null
  const Uppgift = ritare.Uppgift
  const valj = (i: number) => setMarkerad(i)

  return (
    <SessionsRam
      lage="nivatest"
      titel={ritare.namn}
      undertitel={p.undertitel}
      form={ritare.form}
      raknare={{ nr: idx + 1, antal }}
      framsteg={(idx + 1) / antal}
      klocka={<Klocka lage="grans" kvar={kvar} total={p.budgetS} mjuk />}
      nyckel={u.nyckel}
      underlag={ramUnderlag(ritare, u)}
      bekraftaAvbryt
      onAvbryt={() => {
        avbrottVidLamning()
        bekrafta()
        sessionHandelser.avbruten(bas, { session_id: sessionId, index: idx, besvarade: besvaradeAntal, elapsed_ms: Math.round(forflutet * 1000) })
        router.push(p.avbrytHref)
      }}
      lamnaIn={{
        open: lamnaInOppen,
        obesvarade: svar.filter((s) => s == null).length,
        onBekrafta: lamna,
        onStang: () => setLamnaInOppen(false),
      }}
      ark={{
        celler,
        grupper: ritare.arkGrupper?.(uppgifter),
        onValj: (i) => {
          const nya = bekrafta()
          ga(i, nya)
        },
      }}
      tangent={{
        antal: ritare.antalAlternativ(u),
        onValj: (i) => {
          via.current = 'keyboard'
          valj(i)
        },
      }}
      rad={
        lamnaFel ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.lamnaIn}
          </p>
        ) : sparning.osparade > 0 ? (
          <Sparfelsrad antal={sparning.osparade} onForsok={() => void sparning.forsokIgen()} />
        ) : null
      }
      fot={{
        vanster: {
          typ: 'tillbaka',
          disabled: idx === 0,
          onClick: () => {
            const nya = bekrafta()
            ga(idx - 1, nya)
          },
        },
        primar: {
          text: sista ? SESSION.knapp.lamnaIn : SESSION.knapp.nasta,
          onClick: nasta,
          laddar: lamnar,
          data: sista ? 'lamna-in' : 'nasta',
        },
      }}
    >
      <Uppgift
        u={u}
        nr={idx + 1}
        antal={antal}
        vald={markerad}
        facit={null}
        last={lamnar}
        onValj={(i) => {
          via.current = 'tap'
          valj(i)
        }}
      />
    </SessionsRam>
  )
}
