'use client'

/**
 * Övningsprovet mot klockan i verbalt och numeriskt (Testerna v2, skiss 2
 * och 3, riktlinjerna 5.1).
 *
 * - Klockan är en lugn ring uppe till höger (Klocka). Tiden räknas från
 *   sessionens start på servern, så en omladdning ger aldrig mer tid. Vid
 *   noll lämnas provet in och resultatet visas.
 * - Toppraden är en tunn stapel med ett segment per påstående eller fråga,
 *   tryckbar: fasta format har "Föregående" och går att hoppa i.
 * - Ingen återkoppling efter svar. Svaret sparas direkt och kan bytas så
 *   länge provet pågår. Ett svar som inte gick att spara försöks igen vid
 *   nästa handling och innan provet lämnas in.
 * - Verbalt: texten står överst och följer med (klistrad, egen rullning när
 *   den är lång), påståendena byts under den, tre lika breda knappar.
 *   Numeriskt: underlaget i egen ram som rullar i sidled, frågan under och
 *   fyra alternativ som rader. "Räknare tillåten" vid första frågan per
 *   underlag.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import NumericalTable from '@/components/tests/numerical-shared/NumericalTable'
import NumericalChart, { type ChartConfig } from '@/components/tests/numerical-shared/NumericalChart'
import { FRAGA, RESULTAT } from '@/lib/ovningsprov/copy'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { NumeriskDel, Ovningsvy, VerbalDel } from '@/lib/ovningsprov/typer'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { useFlodeLage } from '../PassShell'
import Klocka from './Klocka'
import OvningsResultatVy from './OvningsResultatVy'
import Segmentstapel, { type SegmentLage } from './Segmentstapel'

export interface OvningsprovFlodeProps {
  vy: Ovningsvy
  dagarKvar: number | null
  /** "22 okt", för resultatets topprad. */
  datum: string | null
}

type Fas = 'fraga' | 'lamnar' | 'lamnafel' | 'resultat'

const SVARSORDNING = ['true', 'false', 'cannot_say'] as const

export default function OvningsprovFlode({ vy: start, dagarKvar, datum }: OvningsprovFlodeProps) {
  const router = useRouter()
  const [vy, setVy] = useState<Ovningsvy>(start)
  const [fas, setFas] = useState<Fas>(start.avslutad ? 'resultat' : 'fraga')
  const [svar, setSvar] = useState<Record<string, string>>(start.svar)
  const tider = useRef<Record<string, number>>({ ...start.tider })
  const osparade = useRef<Map<string, string>>(new Map())
  const [sparfel, setSparfel] = useState(false)
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set([0]))
  const forsta = Math.max(0, start.punkter.findIndex((p) => !start.svar[p.nyckel]))
  const [idx, setIdx] = useState<number>(start.avslutad ? 0 : forsta)
  const ankom = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)

  const startMs = useMemo(() => new Date(vy.startad).getTime(), [vy.startad])
  const [nu, setNu] = useState<number>(() => Date.now())
  const kvar = Math.max(0, vy.tidsgrans_s - (nu - startMs) / 1000)

  const footerRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, fas !== 'resultat')

  /* ------------------------------- Tiden ------------------------------- */

  useEffect(() => {
    if (fas !== 'fraga') return
    const t = setInterval(() => setNu(Date.now()), 1000)
    return () => clearInterval(t)
  }, [fas])

  /** Tiden på den aktuella punkten sedan hon kom dit, i sekunder. */
  const pagaendeTid = useCallback(() => Math.max(0, Math.round((performance.now() - ankom.current) / 1000)), [])

  const lamnaPunkt = useCallback(() => {
    const p = vy.punkter[idx]
    if (!p) return
    tider.current[p.nyckel] = (tider.current[p.nyckel] ?? 0) + pagaendeTid()
    ankom.current = performance.now()
  }, [vy.punkter, idx, pagaendeTid])

  /* ------------------------------- Svaret ------------------------------ */

  const skicka = useCallback(
    async (nyckel: string, varde: string, tid: number): Promise<boolean> => {
      try {
        const res = await fetch('/api/traning/ovningsprov/svar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: vy.id, nyckel, svar: varde, tid }),
        })
        if (res.ok || res.status === 410 || res.status === 409) {
          osparade.current.delete(nyckel)
          return true
        }
      } catch {
        // Nätet: svaret står kvar som osparat och försöks igen.
      }
      osparade.current.set(nyckel, varde)
      return false
    },
    [vy.id]
  )

  const sparaOsparade = useCallback(async () => {
    const lista = [...osparade.current.entries()]
    const res = await Promise.all(lista.map(([k, v]) => skicka(k, v, tider.current[k] ?? 0)))
    setSparfel(res.some((ok) => !ok))
  }, [skicka])

  const valj = (varde: string) => {
    const p = vy.punkter[idx]
    if (!p || fas !== 'fraga') return
    setSvar((s) => ({ ...s, [p.nyckel]: varde }))
    const tid = (tider.current[p.nyckel] ?? 0) + pagaendeTid()
    void skicka(p.nyckel, varde, tid).then((ok) => {
      if (!ok) setSparfel(true)
      else if (osparade.current.size === 0) setSparfel(false)
    })
  }

  /* ----------------------------- Navigeringen -------------------------- */

  const ga = (till: number) => {
    if (till < 0 || till >= vy.punkter.length || till === idx) return
    lamnaPunkt()
    setIdx(till)
    setBesokta((b) => new Set(b).add(till))
    if (osparade.current.size) void sparaOsparade()
  }

  /* ------------------------------ Inlämningen -------------------------- */

  const lamnad = useRef(false)
  const lamnaIn = useCallback(async () => {
    if (lamnad.current) return
    lamnad.current = true
    lamnaPunkt()
    setFas('lamnar')
    if (osparade.current.size) await sparaOsparade()
    try {
      const res = await fetch('/api/traning/ovningsprov/slutfor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: vy.id }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.session) {
        setVy(data.session as Ovningsvy)
        setFas('resultat')
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
        return
      }
    } catch {
      // Faller igenom till felet nedan.
    }
    lamnad.current = false
    setFas('lamnafel')
  }, [lamnaPunkt, sparaOsparade, vy.id])

  // Klockan lämnar in vid noll, också när provet öppnas efter tiden.
  useEffect(() => {
    if (fas === 'fraga' && kvar <= 0) void lamnaIn()
  }, [fas, kvar, lamnaIn])

  /* -------------------------------- Ritningen -------------------------- */

  const stang = () => router.push(TRANING_RUTT.alla)

  if (fas === 'resultat' && vy.resultat) {
    const vm = ovningsResultat(vy, { datum, dagarKvar })
    if (vm) {
      return <OvningsResultatVy vm={vm} genomgang={<Genomgang vy={vy} />} onStang={stang} />
    }
  }

  const p = vy.punkter[idx]
  const verbal = vy.typ === 'verbal'
  const delar = vy.delar as (VerbalDel | NumeriskDel)[]
  const del = p ? delar.find((d) => d.id === p.del) ?? null : null
  const iDelAntal = p ? vy.punkter.filter((x) => x.del === p.del).length : 0
  const sista = idx === vy.punkter.length - 1
  const lagen: SegmentLage[] = vy.punkter.map((x, i) =>
    i === idx ? 'aktuell' : svar[x.nyckel] ? 'besvarad' : besokta.has(i) && i < idx ? 'hoppad' : 'kvar'
  )
  const hoppad = lagen.findIndex((l) => l === 'hoppad')
  const vald = p ? svar[p.nyckel] ?? null : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-ovningsprov={vy.typ}>
      <header className="flex-shrink-0 border-b border-kant bg-papper">
        <div className="mx-auto flex h-[60px] w-full max-w-[640px] items-center gap-2 pl-1 pr-2">
          <button type="button" onClick={stang} aria-label={FRAGA.avbryt} className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-1 hover:bg-papper-2">
            <IkonX />
          </button>
          <p className="min-w-0 flex-1">
            <span className="block truncate font-display text-[15px] font-bold leading-5 tracking-[-.01em] text-ink-1">{FRAGA.titel}</span>
            <span className="block truncate text-xs leading-[14px] text-ink-3">{FRAGA.undertitel(vy.format)}</span>
          </p>
          <Klocka kvar={kvar} total={vy.tidsgrans_s} />
        </div>
      </header>
      <div className="mx-auto w-full max-w-[640px] flex-shrink-0 px-4 pt-2.5">
        <Segmentstapel
          lagen={lagen}
          aria={FRAGA.stapelAria(vy.typ, idx + 1, vy.punkter.length)}
          onValj={(i) => ga(i)}
          etikett={(i) => FRAGA.stapelAria(vy.typ, i + 1, vy.punkter.length)}
        />
        <div className="flex justify-between pt-1 text-[12px] leading-4 text-ink-3">
          <span>{p && vy.format.delar ? FRAGA.delMeta(vy.format.delar.ord, p.delNr, vy.format.delar.antal) : null}</span>
          <span>
            {hoppad >= 0 ? FRAGA.hoppade(vy.typ, hoppad + 1) : !verbal && p?.iDel === 1 ? FRAGA.rakning : p ? FRAGA.punktMeta(vy.typ, idx + 1) : null}
          </span>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3.5 px-4 pb-4 pt-3">
          {sparfel ? (
            <p role="alert" className="rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
              {FRAGA.sparfel}
            </p>
          ) : null}
          {fas === 'lamnar' || fas === 'lamnafel' ? (
            <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
              <p className="text-sm leading-5 text-ink-1">{fas === 'lamnar' ? (kvar <= 0 ? FRAGA.tidenUte : FRAGA.lamnar) : FRAGA.lamnaFel}</p>
              {fas === 'lamnafel' ? (
                <button type="button" onClick={() => void lamnaIn()} className={`${KNAPP_PRIMAR} mt-3`}>
                  {FRAGA.forsokIgen}
                </button>
              ) : null}
            </section>
          ) : null}
          {p && del && fas === 'fraga' ? (
            verbal ? (
              <Verbalt del={del as VerbalDel} punkt={Number(p.punkt)} iDel={p.iDel} antal={iDelAntal} vald={vald} onValj={valj} />
            ) : (
              <Numeriskt del={del as NumeriskDel} fragaId={p.punkt} iDel={p.iDel} antal={iDelAntal} vald={vald} onValj={valj} />
            )
          ) : null}
        </div>
      </main>

      {fas === 'fraga' ? (
        <footer ref={footerRef} className="flex-shrink-0 border-t border-kant bg-papper" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="mx-auto flex w-full max-w-[640px] items-center gap-2.5 px-4 py-3">
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
        </footer>
      ) : null}
    </div>
  )
}

function Verbalt({
  del,
  punkt,
  iDel,
  antal,
  vald,
  onValj,
}: {
  del: VerbalDel
  punkt: number
  iDel: number
  antal: number
  vald: string | null
  onValj: (v: string) => void
}) {
  return (
    <>
      <section className="sticky top-0 z-[2] max-h-[38vh] overflow-y-auto rounded-2xl border border-kant bg-papper px-4 py-3.5 text-sm leading-[22px] text-ink-2 lg:max-h-[46vh]" aria-label={FRAGA.texten}>
        <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[.06em] text-ink-3">{FRAGA.texten}</p>
        <b className="mb-1.5 mt-1.5 block font-display text-[15px] leading-5 tracking-[-.01em] text-ink-1">{del.titel}</b>
        {del.text}
      </section>
      <div className="px-0.5 pt-1">
        <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[.06em] text-ink-3">{FRAGA.pastaendeRubrik(iDel, antal)}</p>
        <p className="mt-1.5 font-display text-[19px] font-bold leading-[25px] tracking-[-.015em] text-ink-1" data-pastaende>
          {del.pastaenden[punkt]}
        </p>
      </div>
      <div role="radiogroup" aria-label={FRAGA.svarAria} className="grid grid-cols-3 gap-2">
        {SVARSORDNING.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={vald === v}
            onClick={() => onValj(v)}
            className={`flex min-h-14 items-center justify-center rounded-xl border bg-papper px-1.5 py-2 text-center text-[13px] font-semibold leading-4 text-ink-1 ${
              vald === v ? 'border-ink-1 shadow-[inset_0_0_0_1.5px_var(--ink-1)]' : 'border-kant-stark'
            }`}
            data-svar={v}
          >
            {FRAGA.svar[v]}
          </button>
        ))}
      </div>
    </>
  )
}

function Numeriskt({
  del,
  fragaId,
  iDel,
  antal,
  vald,
  onValj,
}: {
  del: NumeriskDel
  fragaId: string
  iDel: number
  antal: number
  vald: string | null
  onValj: (v: string) => void
}) {
  const q = del.fragor.find((f) => f.id === fragaId)
  if (!q) return null
  return (
    <>
      <section className="rounded-2xl border border-kant bg-papper px-1 py-1" aria-label={FRAGA.underlaget}>
        <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase leading-[14px] tracking-[.06em] text-ink-3">{del.titel}</p>
        <p className="px-3 pb-2 text-[13px] leading-5 text-ink-2">{del.kontext}</p>
        {del.tabell ? <NumericalTable data={del.tabell} /> : null}
        {del.diagram ? (
          <div className="px-2 pb-2">
            <NumericalChart config={del.diagram as ChartConfig} />
          </div>
        ) : null}
      </section>
      <div className="px-0.5 pt-1">
        <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[.06em] text-ink-3">{FRAGA.fragaRubrik(iDel, antal)}</p>
        <p className="mt-1.5 font-display text-[19px] font-bold leading-[25px] tracking-[-.015em] text-ink-1" data-fragetext>
          {q.text}
        </p>
      </div>
      <div role="radiogroup" aria-label={FRAGA.svarAria} className="flex flex-col gap-2">
        {q.alternativ.map((a, i) => {
          const bokstav = String.fromCharCode(65 + i)
          const arVald = vald === a.id
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={arVald}
              onClick={() => onValj(a.id)}
              className={`flex min-h-12 items-center gap-3 rounded-xl border bg-papper px-3.5 text-left text-[15px] font-medium text-ink-1 ${
                arVald ? 'border-ink-1 shadow-[inset_0_0_0_1.5px_var(--ink-1)]' : 'border-kant-stark'
              }`}
              data-alternativ={a.id}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold ${
                  arVald ? 'border-ink-1 bg-ink-1 text-papper' : 'border-kant-stark text-ink-3'
                }`}
              >
                {bokstav}
              </span>
              {a.text}
            </button>
          )
        })}
      </div>
    </>
  )
}

/** Genomgången under resultatet: varje fel och obesvarad punkt som ett provblad. */
function Genomgang({ vy }: { vy: Ovningsvy }) {
  const G = RESULTAT.genomgang
  const ord = vy.format.delar?.ord ?? 'underlag'
  const per = new Map(vy.punkter.map((p) => [p.nyckel, p]))
  const delar = vy.delar as (VerbalDel | NumeriskDel)[]
  const missar = (vy.genomgang ?? []).filter((g) => !g.korrekt)
  const svarText = (punktNyckel: string, v: string): string => {
    if (vy.typ === 'verbal') return FRAGA.svar[v] ?? v
    const p = per.get(punktNyckel)
    const d = delar.find((x) => x.id === p?.del) as NumeriskDel | undefined
    const q = d?.fragor.find((f) => f.id === p?.punkt)
    return q?.alternativ.find((a) => a.id === v)?.text ?? v
  }
  return (
    <>
      {missar.map((g) => {
        const p = per.get(g.nyckel)
        if (!p) return null
        const d = delar.find((x) => x.id === p.del)
        const text =
          vy.typ === 'verbal'
            ? (d as VerbalDel | undefined)?.pastaenden[Number(p.punkt)]
            : (d as NumeriskDel | undefined)?.fragor.find((f) => f.id === p.punkt)?.text
        return (
          <article
            key={g.nyckel}
            className={`rounded-2xl border bg-papper p-4 ${g.svar === null ? 'border-dashed border-kant-stark' : 'border-kant'}`}
            data-genomgang-punkt
          >
            <p className="text-ey uppercase text-ink-3">{G.punkt(vy.typ, p.delNr, p.iDel, ord)}</p>
            {d ? <p className="mt-1 text-[13px] leading-5 text-ink-3">{d.titel}</p> : null}
            <p className="mt-1 font-display text-[16px] font-bold leading-[22px] tracking-[-.01em] text-ink-1">{text}</p>
            <p className="mt-2 text-sm leading-5 text-ink-2">{g.svar === null ? G.obesvarad : G.ditt(svarText(g.nyckel, g.svar))}</p>
            <p className="text-sm font-semibold leading-5 text-koppar-ink">{G.ratt(svarText(g.nyckel, g.ratt))}</p>
            {g.forklaring ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{g.forklaring}</p> : null}
          </article>
        )
      })}
    </>
  )
}
