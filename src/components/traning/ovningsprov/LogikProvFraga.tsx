'use client'

/**
 * Logikens övningsprov mot klockan i passflödet (Testerna v2, skiss 2,
 * riktlinjerna 1.3 och 5.1). Testmotorns typ 'general'.
 *
 * - Klockan är en lugn ring med minuter kvar; i Alva-formatet gäller den
 *   uppgiften (två minuter) och fylls om per fråga. Tiden räknas från
 *   sessionens start, så en omladdning ger aldrig mer tid.
 * - Ingen återkoppling efter svar. Fasta format: svaret sparas vid trycket
 *   och kan bytas, "Föregående" och stapeln går bakåt, "Lämna in" sist.
 *   Adaptiva format (Matrigma adaptiv, Alva): välj och "Svara och gå
 *   vidare", ingen väg bakåt. Meningen om att provet anpassar sig står på
 *   startarket, aldrig här (granskningen 6.4).
 * - När tiden är ute lämnas provet in; obesvarade räknas som fel.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import { FRAGA } from '@/lib/ovningsprov/copy'
import { ovningsformatUrNyckel } from '@/lib/ovningsprov/format'
import type { PassApi, Sessionsvy } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo'
import PassFraga from '../PassFraga'
import PassShell from '../PassShell'
import Klocka from './Klocka'
import Segmentstapel, { type SegmentLage } from './Segmentstapel'

export interface LogikProvFragaProps {
  vy: Sessionsvy
  api: PassApi
  /** Lämna in: alla svar är sparade (eller tiden är ute). */
  onKlar: (opt?: { tidenUte?: boolean }) => void
  onAvbryt: () => void
  /** Förhandsvisningen: fryst klocka. */
  fastNu?: number | null
}

export default function LogikProvFraga({ vy: start, api, onKlar, onAvbryt, fastNu = null }: LogikProvFragaProps) {
  const [vy, setVy] = useState<Sessionsvy>(start)
  const format = PROVFORMAT[vy.format as FormatNyckel] ?? PROVFORMAT.eget
  const of = ovningsformatUrNyckel('logik', vy.format)
  const perUppgift = format.tidsform === 'per_uppgift'
  const adaptiv = vy.adaptiv
  const tidsgrans = vy.tidsgrans_s ?? format.minuter * 60

  const [svar, setSvar] = useState<Record<string, number>>(() =>
    Object.fromEntries(start.besvarade.filter((b) => b.valdVisat != null).map((b) => [b.q_id, b.valdVisat as number]))
  )
  const besvarade = useMemo(() => new Set(vy.besvarade.map((b) => b.q_id)), [vy.besvarade])
  const [idx, setIdx] = useState<number>(start.aktuell ?? 0)
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set([start.aktuell ?? 0]))
  const [valt, setValt] = useState<number | null>(null)
  const [sparar, setSparar] = useState(false)
  const [sparfel, setSparfel] = useState(false)
  const osparade = useRef<Map<string, number>>(new Map())
  const tider = useRef<Record<string, number>>(Object.fromEntries(start.besvarade.map((b) => [b.q_id, b.tid_s])))
  const ankom = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)

  const startMs = useMemo(() => new Date(vy.startad).getTime(), [vy.startad])
  const [nu, setNu] = useState<number>(() => fastNu ?? Date.now())
  useEffect(() => {
    if (fastNu != null) return
    const t = setInterval(() => setNu(Date.now()), 1000)
    return () => clearInterval(t)
  }, [fastNu])
  const kvarTotal = Math.max(0, tidsgrans - (nu - startMs) / 1000)
  const paFragan = useCallback(() => Math.max(0, Math.round((performance.now() - ankom.current) / 1000)), [])
  // Alva: uppgiftens egen tid, räknad om per fråga.
  const [fragaStart, setFragaStart] = useState<number>(() => fastNu ?? Date.now())
  const kvarUppgift = Math.max(0, format.budget_s - (nu - fragaStart) / 1000)

  const q = vy.fragor[Math.min(idx, vy.fragor.length - 1)]

  /* ------------------------------ Svaren ------------------------------ */

  const skicka = useCallback(
    async (qid: string, visat: number | null, opt: { tidenUte?: boolean } = {}) => {
      const tid = (tider.current[qid] ?? 0) + paFragan()
      const r = await api.svara({ sessionId: vy.id, questionId: qid, selectedIndex: visat, tidenUte: opt.tidenUte, timeSpent: tid })
      if (!r.ok) {
        if (r.status === 410) {
          onKlar({ tidenUte: true })
          return null
        }
        if (r.status !== 409 && visat != null) osparade.current.set(qid, visat)
        setSparfel(r.status !== 409)
        return null
      }
      osparade.current.delete(qid)
      if (osparade.current.size === 0) setSparfel(false)
      return r
    },
    [api, vy.id, paFragan, onKlar]
  )

  const sparaOsparade = useCallback(async () => {
    for (const [qid, visat] of [...osparade.current.entries()]) await skicka(qid, visat)
  }, [skicka])

  const lamnaFragan = useCallback(() => {
    if (!q) return
    tider.current[q.id] = (tider.current[q.id] ?? 0) + paFragan()
    ankom.current = performance.now()
  }, [q, paFragan])

  const ga = (till: number) => {
    if (adaptiv || till < 0 || till >= vy.fragor.length || till === idx) return
    lamnaFragan()
    setIdx(till)
    setBesokta((b) => new Set(b).add(till))
    if (osparade.current.size) void sparaOsparade()
  }

  // Fast format: trycket sparar svaret direkt, och det kan bytas.
  const valjFast = (i: number) => {
    if (!q) return
    setSvar((s) => ({ ...s, [q.id]: i }))
    void skicka(q.id, i)
  }

  // Adaptivt: välj, sedan "Svara och gå vidare".
  const svaraAdaptivt = async (visat: number | null, opt: { tidenUte?: boolean } = {}) => {
    if (!q || sparar) return
    setSparar(true)
    const r = await skicka(q.id, visat, opt)
    setSparar(false)
    if (!r) return
    lamnaFragan()
    setValt(null)
    if (r.klar) {
      onKlar()
      return
    }
    const nasta = r.nasta
    setVy((v) => ({
      ...v,
      besvarade: [...v.besvarade, { q_id: q.id, valdVisat: visat, vetInte: false, tidenUte: !!opt.tidenUte, tid_s: tider.current[q.id] ?? 0 }],
      fragor: nasta && !v.fragor.some((f) => f.id === nasta.id) ? [...v.fragor, nasta] : v.fragor,
    }))
    setIdx((i) => i + 1)
    setFragaStart(Date.now())
  }

  const lamnaIn = async () => {
    lamnaFragan()
    if (osparade.current.size) await sparaOsparade()
    onKlar()
  }

  // Tiden ute: hela provet, eller uppgiften i Alva-formatet.
  const inlamnad = useRef(false)
  useEffect(() => {
    if (fastNu != null || inlamnad.current) return
    if (kvarTotal <= 0) {
      inlamnad.current = true
      onKlar({ tidenUte: true })
    }
  }, [kvarTotal, onKlar, fastNu])
  useEffect(() => {
    if (!perUppgift || fastNu != null || sparar || !q || kvarUppgift > 0) return
    void svaraAdaptivt(null, { tidenUte: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perUppgift, kvarUppgift])

  /* ------------------------------ Ritningen ---------------------------- */

  const antal = adaptiv ? vy.antal : vy.fragor.length
  const lagen: SegmentLage[] = Array.from({ length: antal }, (_, i) => {
    if (i === idx) return 'aktuell'
    const f = vy.fragor[i]
    if (f && (svar[f.id] != null || besvarade.has(f.id))) return 'besvarad'
    return besokta.has(i) && i < idx ? 'hoppad' : 'kvar'
  })
  const hoppad = lagen.findIndex((l) => l === 'hoppad')
  const sista = idx >= antal - 1
  const vald = adaptiv ? valt : q ? svar[q.id] ?? null : null

  const fot = adaptiv ? (
    <button type="button" disabled={valt == null || sparar} onClick={() => void svaraAdaptivt(valt)} className={`${KNAPP_SEKUNDAR} disabled:opacity-50`} data-svara-vidare>
      {FRAGA.svaraVidare}
    </button>
  ) : (
    <div className="flex items-center gap-2.5">
      <button type="button" onClick={() => ga(idx - 1)} disabled={idx === 0} className={`${LANK} inline-flex min-h-11 items-center px-1.5 disabled:opacity-40`}>
        {FRAGA.foregaende}
      </button>
      {sista ? (
        <button type="button" onClick={() => void lamnaIn()} className={`${KNAPP_PRIMAR} flex-1`} data-lamna-in>
          {FRAGA.lamnaIn}
        </button>
      ) : (
        <button type="button" onClick={() => ga(idx + 1)} className={`${KNAPP_SEKUNDAR} flex-1`} data-nasta>
          {FRAGA.nasta}
        </button>
      )}
    </div>
  )

  return (
    <PassShell
      titel={PASS_COPY.topp.general}
      undertitel={FRAGA.undertitel(of)}
      fraga={null}
      antal={null}
      tid={null}
      onAvsluta={onAvbryt}
      avslutaEtikett={FRAGA.avbryt}
      hoger={perUppgift ? <Klocka kvar={kvarUppgift} total={format.budget_s} perUppgift /> : <Klocka kvar={kvarTotal} total={tidsgrans} />}
      underTopp={
        <div className="mx-auto w-full max-w-[560px] px-4 pt-2.5">
          <Segmentstapel
            lagen={lagen}
            aria={FRAGA.stapelAria('logik', idx + 1, antal)}
            onValj={adaptiv ? undefined : (i) => ga(i)}
            etikett={(i) => FRAGA.stapelAria('logik', i + 1, antal)}
          />
          <div className="flex justify-between pt-1 text-[12px] leading-4 text-ink-3">
            <span>{FRAGA.punktMeta('logik', idx + 1)}</span>
            <span>{hoppad >= 0 ? FRAGA.hoppade('logik', hoppad + 1) : null}</span>
          </div>
        </div>
      }
      fot={fot}
      nyckel={q?.id}
      banner={
        sparfel ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
            {FRAGA.sparfel}
          </p>
        ) : null
      }
    >
      {q ? (
        <PassFraga
          key={q.id}
          fraga={q}
          vald={vald}
          ratt={null}
          last={sparar}
          onValj={(i) => (adaptiv ? setValt(i) : valjFast(i))}
        />
      ) : null}
    </PassShell>
  )
}
