'use client'

/**
 * Övningsprovet i ramen (plan-testflode-2026-11-20 avsnitt 2), för format
 * med en uppgift per del (figurserier nu, deduktivt i etapp 3).
 *
 * - Ringen räknar ned från sessionens start på servern (useExamDeadline-
 *   mönstret: tiden räknas från started_at, en omladdning ger aldrig mer
 *   tid). Hård gräns: vid noll lämnas provet in, utan dialog.
 * - Tryck markerar, Nästa bekräftar; svaret skickas i bakgrunden med kö
 *   och omförsök, samma route och kropp som förut. Fasta format har ‹,
 *   räknaren och uppgiftsarket.
 * - Lämna in med dialog; kön töms före inlämningen.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Ovningsvy } from '@/lib/ovningsprov/typer'
import SessionsRam from '../SessionsRam'
import Klocka from '../Klocka'
import { SESSION } from '../copy'
import { lagesregler } from '../lagesregler'
import { sessionHandelser, type SessionHandelseBas } from '../handelser'
import type { ArkCell } from '../Uppgiftsarket'
import type { RamUppgift, TypRitare } from '../typ'
import { useSessionSparning } from '../useSessionSparning'
import { ovningsprovApi } from '../figurserie/api'
import Genomgang, { type GenomgangPost } from './Genomgang'
import { Sparfelsrad, useLamnadSida, useSekunderSedan } from './gemensamt'

export interface OvningsprovProps<U extends RamUppgift> {
  ritare: TypRitare<U>
  bas: SessionHandelseBas
  undertitel: string
  vy: Ovningsvy
  /** En uppgift per punkt, i provets ordning. */
  uppgifter: (vy: Ovningsvy) => U[]
  /** Visat index till svarsvärdet som servern tar emot, och tillbaka. */
  tillVarde: (i: number) => string
  franVarde: (v: string) => number | null
  genomgangPoster: (vy: Ovningsvy) => GenomgangPost<U>[]
  resultat: (vy: Ovningsvy, ctrl: { gaIgenom: (fran?: number) => void; stang: () => void }) => ReactNode
  stangHref: string
}

type Fas = 'fraga' | 'lamnar' | 'lamnafel' | 'resultat' | 'genomgang'

export default function Ovningsprov<U extends RamUppgift>(p: OvningsprovProps<U>) {
  const router = useRouter()
  const { ritare, bas } = p
  const [vy, setVy] = useState<Ovningsvy>(p.vy)
  const uppgifter = useMemo(() => p.uppgifter(vy), [vy, p])
  const antal = uppgifter.length
  const regler = lagesregler('ovningsprov', { adaptiv: vy.format.adaptiv })
  const fri = regler.navigering === 'fri'
  const [fas, setFas] = useState<Fas>(p.vy.avslutad ? 'resultat' : 'fraga')
  const [genomgangFran, setGenomgangFran] = useState(0)
  const [svar, setSvar] = useState<Record<string, number>>(() => {
    const ut: Record<string, number> = {}
    for (const [k, v] of Object.entries(p.vy.svar)) {
      const i = p.franVarde(v)
      if (i != null) ut[k] = i
    }
    return ut
  })
  const forsta = Math.max(0, p.vy.punkter.findIndex((x) => !p.vy.svar[x.nyckel]))
  const [idx, setIdx] = useState(p.vy.avslutad ? 0 : forsta)
  const [markerad, setMarkerad] = useState<number | null>(() => svar[uppgifter[forsta]?.nyckel ?? ''] ?? null)
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set([0, forsta]))
  const [lamnaInOppen, setLamnaInOppen] = useState(false)
  const tider = useRef<Record<string, number>>({ ...p.vy.tider })
  const ankom = useRef<number>(Date.now())
  const via = useRef<'tap' | 'keyboard'>('tap')

  const startMs = useMemo(() => new Date(vy.startad).getTime(), [vy.startad])
  const forflutet = useSekunderSedan(startMs, fas === 'fraga')
  const kvar = vy.tidsgrans_s - forflutet

  const sparning = useSessionSparning<{ varde: string; tid: number }>((nyckel, d) => ovningsprovApi.svara(vy.id, nyckel, d.varde, d.tid))

  const startadSkjuten = useRef(false)
  useEffect(() => {
    if (startadSkjuten.current || p.vy.avslutad) return
    startadSkjuten.current = true
    sessionHandelser.startad(bas, { session_id: vy.id, antal, tid_budget_s: vy.tidsgrans_s, resumed: Object.keys(p.vy.svar).length > 0 || forflutet > 5 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Tiden på uppgiften hon lämnar läggs till (summerad över besöken, som förut). */
  const lamnaUppgift = useCallback(() => {
    const u = uppgifter[idx]
    if (!u) return 0
    const tid = (tider.current[u.nyckel] ?? 0) + Math.max(0, Math.round((Date.now() - ankom.current) / 1000))
    tider.current[u.nyckel] = tid
    ankom.current = Date.now()
    return tid
  }, [uppgifter, idx])

  const bekrafta = useCallback(() => {
    const u = uppgifter[idx]
    const tid = lamnaUppgift()
    if (!u || markerad == null || markerad === svar[u.nyckel]) return svar
    const nya = { ...svar, [u.nyckel]: markerad }
    setSvar(nya)
    sparning.spara(u.nyckel, { varde: p.tillVarde(markerad), tid })
    sessionHandelser.besvarad(bas, { session_id: vy.id, index: idx, elapsed_ms: tid * 1000, via: via.current, vet_inte: false })
    return nya
  }, [uppgifter, idx, lamnaUppgift, markerad, svar, sparning, p, bas, vy.id])

  const ga = (till: number, nya: Record<string, number> = svar) => {
    if (till < 0 || till >= antal) return
    setIdx(till)
    setMarkerad(nya[uppgifter[till].nyckel] ?? null)
    setBesokta((b) => new Set(b).add(till))
    ankom.current = Date.now()
    via.current = 'tap'
    if (sparning.osparade) void sparning.forsokIgen()
  }

  const lamnad = useRef(false)
  const avbrottVidLamning = useLamnadSida(fas === 'fraga', () =>
    sessionHandelser.avbruten(bas, { session_id: vy.id, index: idx, besvarade: Object.keys(svar).length, elapsed_ms: Math.round(forflutet * 1000) })
  )
  const lamnaIn = useCallback(
    async (avTiden: boolean) => {
      if (lamnad.current) return
      lamnad.current = true
      const nya = bekrafta()
      setLamnaInOppen(false)
      setFas('lamnar')
      await sparning.tom()
      const ny = await ovningsprovApi.lamnaIn<Ovningsvy>(vy.id)
      if (!ny) {
        lamnad.current = false
        setFas('lamnafel')
        return
      }
      avbrottVidLamning()
      sessionHandelser.klar(bas, { session_id: vy.id, besvarade: Object.keys(nya).length, elapsed_ms: Math.round(forflutet * 1000), over_tid: avTiden })
      setVy(ny)
      setFas('resultat')
    },
    [bekrafta, sparning, vy.id, avbrottVidLamning, bas, forflutet]
  )

  // Klockan lämnar in vid noll, också när provet öppnas efter tiden.
  useEffect(() => {
    if (fas === 'fraga' && kvar <= 0) void lamnaIn(true)
  }, [fas, kvar, lamnaIn])

  const stang = useCallback(() => router.push(p.stangHref), [router, p.stangHref])

  if (fas === 'resultat' && vy.resultat) {
    return <>{p.resultat(vy, { gaIgenom: (fran = 0) => (setGenomgangFran(fran), setFas('genomgang')), stang })}</>
  }
  if (fas === 'genomgang') {
    return (
      <Genomgang
        ritare={ritare}
        lage="ovningsprov"
        titel={ritare.namn}
        poster={p.genomgangPoster(vy)}
        start={genomgangFran}
        budgetPerUppgift={vy.format.budget_s}
        sessionId={vy.id}
        onStang={() => setFas('resultat')}
      />
    )
  }

  const u = uppgifter[Math.min(idx, antal - 1)]
  if (!u) return null
  const sista = idx === antal - 1
  const lamnar = fas === 'lamnar'
  const obesvarade = uppgifter.filter((x) => svar[x.nyckel] == null && !(x.nyckel === u.nyckel && markerad != null)).length
  const celler: ArkCell[] = uppgifter.map((x, i) =>
    i === idx ? 'aktuell' : svar[x.nyckel] != null ? 'besvarad' : besokta.has(i) && i < Math.max(...besokta) ? 'hoppad' : 'kvar'
  )
  const Uppgift = ritare.Uppgift

  return (
    <SessionsRam
      lage="ovningsprov"
      titel={ritare.namn}
      undertitel={p.undertitel}
      form={ritare.form}
      raknare={{ nr: idx + 1, antal }}
      framsteg={(idx + 1) / antal}
      klocka={<Klocka lage="grans" kvar={kvar} total={vy.tidsgrans_s} />}
      nyckel={u.nyckel}
      bekraftaAvbryt={!lamnar}
      onAvbryt={() => {
        avbrottVidLamning()
        sessionHandelser.avbruten(bas, { session_id: vy.id, index: idx, besvarade: Object.keys(svar).length, elapsed_ms: Math.round(forflutet * 1000) })
        stang()
      }}
      lamnaIn={{
        open: lamnaInOppen,
        obesvarade,
        onBekrafta: () => lamnaIn(false),
        onStang: () => setLamnaInOppen(false),
      }}
      ark={
        fri
          ? {
              celler,
              onValj: (i) => {
                const nya = bekrafta()
                ga(i, nya)
              },
            }
          : null
      }
      tangent={fas === 'fraga' ? { antal: ritare.antalAlternativ(u), onValj: (i) => ((via.current = 'keyboard'), setMarkerad(i)) } : null}
      rad={
        fas === 'lamnafel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.lamnaIn}
          </p>
        ) : sparning.osparade > 0 ? (
          <Sparfelsrad antal={sparning.osparade} onForsok={() => void sparning.forsokIgen()} />
        ) : null
      }
      fot={{
        vanster: fri
          ? {
              typ: 'tillbaka',
              disabled: idx === 0 || lamnar,
              onClick: () => {
                const nya = bekrafta()
                ga(idx - 1, nya)
              },
            }
          : null,
        primar:
          fas === 'lamnafel'
            ? { text: SESSION.knapp.forsokIgen, onClick: () => void lamnaIn(kvar <= 0), data: 'forsok-igen' }
            : {
                text: sista ? SESSION.knapp.lamnaIn : SESSION.knapp.nasta,
                laddar: lamnar,
                data: sista ? 'lamna-in' : 'nasta',
                onClick: () => {
                  if (sista) {
                    const nya = bekrafta()
                    const ob = uppgifter.filter((x) => nya[x.nyckel] == null).length
                    if (ob > 0) sessionHandelser.lamnaInSparrad(bas, { session_id: vy.id, obesvarade: ob })
                    setLamnaInOppen(true)
                    return
                  }
                  const nya = bekrafta()
                  ga(idx + 1, nya)
                },
              },
      }}
    >
      <Uppgift
        u={u}
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
