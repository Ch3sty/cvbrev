'use client'

/**
 * Övningsprovet för I-prov 2025 (skiss-tester-steg2-2026-11-09, fliken
 * I-prov-provet; brief-tester-steg2 avsnitt 5):
 *
 *   Startark  formatet i klartext, halva provet förvalt, de sex deltesterna i
 *             ordning, regeln om att ett avslutat deltest inte går att öppna
 *             igen. Utan Premium byts foten mot paketraden.
 *   Mellanblad  hela väggen, deltestets nummer stort, ingen klocka; den
 *             startar när hon trycker.
 *   Fråga     klockan uppe till höger, segmentstapeln för deltestet, hoppa
 *             och ändra inom deltestet, Avsluta deltestet sist.
 *   Resultat  huvudtalet och sex liggande staplar med deltestens namn,
 *             aldrig stanine; Var du tappar med riktade pass, meningen om
 *             skalan, detaljvyn med tempot och genomgången deltest för deltest.
 *
 * Servern äger klockan och spärren: ett deltest startas och avslutas av
 * servern, och ett avslutat deltest öppnas aldrig igen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IkonTillbaka, IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import ConfirmDialog from '@/components/shell/ConfirmDialog'
import Dagsring from '@/components/rum/Dagsring'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN, kopKnapp, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { TRANING_HREF, steg2PassHref } from '@/lib/traning/rutter'
import { IPROV_COPY as C, iprovDelar, iprovSumma, type IprovVy } from '@/lib/tester/steg2/iprov'
import { Steg2Genomgang, Steg2Uppgift } from '@/components/tests/steg2/Uppgifter'
import Klocka from '../ovningsprov/Klocka'
import Segmentstapel, { type SegmentLage } from '../ovningsprov/Segmentstapel'
import { useFlodeLage } from '../PassShell'

const datum = (iso: string) => new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(new Date(iso))
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) return { ok: false, status: r.status }
    return { ok: true, data: (await r.json()) as T }
  } catch {
    return { ok: false, status: 0 }
  }
}

/* ------------------------------------------------------------ Skalet */

function Skal({
  titel,
  rad,
  hoger,
  stapel,
  fot,
  onStang,
  vagg = false,
  children,
}: {
  titel: string
  rad?: string
  hoger?: React.ReactNode
  stapel?: React.ReactNode
  fot?: React.ReactNode
  onStang: () => void
  vagg?: boolean
  children: React.ReactNode
}) {
  const fotRef = useRef<HTMLElement | null>(null)
  useFlodeLage(fotRef, !!fot)
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-iprov>
      <header className={`flex-shrink-0 ${vagg ? 'bg-vagg text-vagg-ink' : 'border-b border-kant bg-papper'}`}>
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center gap-2 px-2">
          <button type="button" onClick={onStang} aria-label="Stäng" className={`inline-flex h-11 w-11 items-center justify-center rounded-[10px] ${vagg ? 'text-vagg-ink' : 'text-ink-1'}`}>
            <IkonX />
          </button>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[15px] font-bold leading-5 tracking-[-.01em] ${vagg ? 'text-vagg-ink' : 'text-ink-1'}`}>{titel}</p>
            {rad ? <p className={`truncate text-[12px] leading-4 ${vagg ? 'text-vagg-mjuk' : 'text-ink-3'}`}>{rad}</p> : null}
          </div>
          {hoger}
        </div>
        {stapel ? <div className="mx-auto w-full max-w-[560px] px-4 pb-2">{stapel}</div> : null}
      </header>
      <main className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${vagg ? 'vagg' : ''}`}>
        <div className="mx-auto w-full max-w-[560px] px-4 py-4">{children}</div>
      </main>
      {fot ? (
        <footer ref={fotRef} className="flex-shrink-0 border-t border-kant bg-papper" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="mx-auto w-full max-w-[560px] px-4 py-3">{fot}</div>
        </footer>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------ Startarket */

export function IprovStartark({
  dagarKvar,
  last,
  pagaende,
  tillbakaHref,
}: {
  dagarKvar: number | null
  last: boolean
  pagaende: string | null
  tillbakaHref: string
}) {
  const router = useRouter()
  const [halvt, setHalvt] = useState(true)
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)
  const delar = iprovDelar(halvt)
  const fotRef = useRef<HTMLElement | null>(null)
  useFlodeLage(fotRef, true)

  const starta = async () => {
    if (pagaende) {
      router.push(`/dashboard/tester/iprov/${pagaende}`)
      return
    }
    setStartar(true)
    setFel(false)
    const r = await post<{ session: IprovVy }>('/api/traning/iprov/session', { halvt })
    if (r.ok) {
      router.push(`/dashboard/tester/iprov/${r.data.session.id}`)
      return
    }
    setFel(true)
    setStartar(false)
  }

  const val = (h: boolean) => {
    const s = iprovSumma(h)
    const vald = halvt === h
    return (
      <button
        type="button"
        role="radio"
        aria-checked={vald}
        onClick={() => setHalvt(h)}
        className={`flex flex-1 flex-col items-center justify-center rounded-[11px] px-2 py-2 text-center ${vald ? 'bg-papper text-ink-1' : 'text-vagg-mjuk'}`}
        data-iprov-val={h ? 'halvt' : 'helt'}
      >
        <b className="text-[15px] font-semibold leading-5">{h ? C.halvt : C.helt}</b>
        <span className={`text-[12px] leading-4 ${vald ? 'text-ink-3' : 'text-vagg-mjuk'}`}>{C.valRad(s.antal, s.minuter)}</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-iprov-startark>
      <main className="vagg min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[560px] px-4 pb-6">
          <div className="-mx-1 flex h-14 items-center gap-2 text-vagg-ink">
            <Link href={tillbakaHref} aria-label="Tillbaka" className="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px]">
              <IkonTillbaka />
            </Link>
            <span className="flex-1 text-center text-[15px] font-bold tracking-[-.01em]">Övningsprov</span>
            <span className="w-11" aria-hidden="true" />
          </div>
          <p className="text-ey uppercase text-koppar-ljus">{C.eyebrow(dagarKvar)}</p>
          <h1 className="text-h1-liten mt-1 text-vagg-ink">{C.startRubrik}</h1>
          <div className="mt-3 flex items-center gap-3.5">
            <svg viewBox="0 0 72 56" width="64" height="50" aria-hidden="true" className="shrink-0 text-vagg-ink">
              <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
                <rect x="8" y="6" width="56" height="44" rx="4" fill="rgba(255,255,255,.08)" />
                {[14, 29, 44].flatMap((x) => [13, 27].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="10" rx="2" />))}
                <path d="M14 44h28" />
              </g>
              <rect x="14" y="13" width="14" height="10" rx="2" fill="#E07A2F" opacity=".9" />
              <rect x="29" y="13" width="14" height="10" rx="2" fill="#E07A2F" opacity=".55" />
            </svg>
            <div className="min-w-0">
              <b className="block font-display text-[16px] font-bold leading-[21px] tracking-[-.015em] text-vagg-ink">{C.format}</b>
              <span className="mt-1 block text-[13px] leading-[18px] text-vagg-mjuk">{C.formatRad}</span>
            </div>
          </div>
          <div role="radiogroup" aria-label="Halva eller hela provet" className="mt-3.5 flex gap-1 rounded-[14px] border border-vagg-kant bg-white/[.06] p-1">
            {val(true)}
            {val(false)}
          </div>
          <ol className="mt-3 list-none overflow-hidden rounded-[14px] border border-vagg-kant bg-white/[.05] p-0" aria-label="Deltesterna i ordning">
            {delar.map((d, i) => (
              <li key={d.nr} className={`flex min-h-[38px] items-center gap-3 px-3.5 py-1.5 ${i ? 'border-t border-vagg-kant' : ''}`}>
                <span className="w-4 text-[12px] tabular-nums text-vagg-mjuk">{d.nr}</span>
                <b className="min-w-0 flex-1 text-sm font-semibold leading-[19px] text-vagg-ink">{d.namn}</b>
                <span className="text-[13px] tabular-nums text-vagg-mjuk">{C.delRad(d.antal, d.minuter)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex items-start gap-2.5 text-[13px] leading-[18px] text-vagg-mjuk">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="mt-px shrink-0 text-vagg-ink">
              <g fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></g>
            </svg>
            <span>
              <b className="font-semibold text-vagg-ink">{C.regelStark}</b> {last ? C.regelLast : C.regel}
            </span>
          </p>
        </div>
      </main>
      <footer ref={fotRef} className="flex-shrink-0 border-t border-kant bg-papper" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="mx-auto w-full max-w-[560px] px-4 py-3">
          {last ? (
            <div data-iprov-last>
              <p className="text-[13px] leading-[19px] text-ink-2">{C.last(paketNamn(SALD_PLAN), prisPeriod(SALD_PLAN))}</p>
              <Link href={kopstegHref(SALD_PLAN, 'provlage')} className={`${KNAPP_PRIMAR} mt-2.5`}>
                {kopKnapp(SALD_PLAN)}
              </Link>
            </div>
          ) : (
            <>
              {fel ? <p role="alert" className="mb-2 text-sm text-ink-1">Provet gick inte att starta. Försök igen.</p> : null}
              <button type="button" onClick={() => void starta()} disabled={startar} className={KNAPP_PRIMAR} data-iprov-starta>
                {startar ? 'Startar provet' : pagaende ? 'Fortsätt övningsprovet' : C.starta}
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------ Flödet */

type Fas = { typ: 'prov' } | { typ: 'resultat' } | { typ: 'detalj' } | { typ: 'genomgang'; del: number; pos: number }

export default function IprovFlode({ vy: start }: { vy: IprovVy }) {
  const router = useRouter()
  const [vy, setVy] = useState<IprovVy>(start)
  const [fas, setFas] = useState<Fas>(start.avslutad ? { typ: 'resultat' } : { typ: 'prov' })
  const [idx, setIdx] = useState(0)
  const [svar, setSvar] = useState<Record<string, number>>(() => Object.assign({}, ...start.delar.map((d) => d.svar)))
  const [fragaAvsluta, setFragaAvsluta] = useState(false)
  const [upptagen, setUpptagen] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  const [nu, setNu] = useState(() => Date.now())
  const ko = useRef<Promise<unknown>>(Promise.resolve())
  const fragaStart = useRef(Date.now())

  const del = vy.delar.find((d) => !d.avslutad) ?? null
  const antalDelar = vy.delar.length
  const stang = useCallback(() => router.push(TRANING_HREF), [router])

  useEffect(() => {
    if (!del?.startad || vy.avslutad) return
    const t = setInterval(() => setNu(Date.now()), 500)
    return () => clearInterval(t)
  }, [del?.startad, vy.avslutad])

  const kvar = del?.startad ? Math.max(0, del.max_s - (nu - new Date(del.startad).getTime()) / 1000) : del?.max_s ?? 0

  const delHandling = useCallback(
    async (handling: 'starta' | 'avsluta', nr: number) => {
      setUpptagen(true)
      setFel(null)
      await ko.current
      const r = await post<{ session: IprovVy }>('/api/traning/iprov/del', { sessionId: vy.id, nr, handling })
      setUpptagen(false)
      if (!r.ok) {
        setFel('Det gick inte att spara. Försök igen.')
        return
      }
      setVy(r.data.session)
      setIdx(0)
      fragaStart.current = Date.now()
      if (r.data.session.avslutad) setFas({ typ: 'resultat' })
    },
    [vy.id]
  )

  // Tiden ute: deltestet avslutas av sig självt.
  const avslutasAvTiden = useRef<number | null>(null)
  useEffect(() => {
    if (!del?.startad || kvar > 0 || avslutasAvTiden.current === del.nr) return
    avslutasAvTiden.current = del.nr
    void delHandling('avsluta', del.nr)
  }, [kvar, del, delHandling])

  const valj = (nyckel: string, i: number) => {
    const tid = Math.round((Date.now() - fragaStart.current) / 1000)
    fragaStart.current = Date.now()
    setSvar((s) => ({ ...s, [nyckel]: i }))
    // Svaren sparas i tur och ordning, så att servern aldrig skriver över ett nyare.
    ko.current = ko.current.then(() => post('/api/traning/iprov/svar', { sessionId: vy.id, nyckel, visat: i, tid })).then((r) => {
      if (!(r as { ok: boolean }).ok) setFel('Svaret gick inte att spara. Det sparas igen vid nästa svar.')
    })
    if (del && idx < del.uppgifter.length - 1) setTimeout(() => setIdx((x) => Math.min(x + 1, del.uppgifter.length - 1)), 180)
  }

  /* ---------------- Resultat, detalj och genomgång */
  if (vy.avslutad && vy.resultat) {
    const r = vy.resultat
    if (fas.typ === 'genomgang' && vy.genomgang) {
      const lista = vy.genomgang[fas.del] ?? []
      const g = lista[fas.pos] as { nyckel: string } | undefined
      const d = vy.delar[fas.del]
      const sista = fas.pos >= lista.length - 1
      return (
        <Skal
          titel={C.genomgangRubrik}
          rad={`${d.namn}, uppgift ${fas.pos + 1} av ${lista.length}`}
          onStang={() => setFas({ typ: 'detalj' })}
          fot={
            <div className="flex items-center gap-3">
              <button type="button" className={`${LANK} min-h-11`} onClick={() => setFas(fas.pos > 0 ? { ...fas, pos: fas.pos - 1 } : { typ: 'detalj' })}>
                {C.foregaende}
              </button>
              <button type="button" className={`${KNAPP_PRIMAR} flex-1`} onClick={() => setFas(sista ? { typ: 'detalj' } : { ...fas, pos: fas.pos + 1 })}>
                {sista ? 'Till deltesten' : C.nasta}
              </button>
            </div>
          }
        >
          {g ? <Steg2Genomgang kind={d.kind} g={g} valt={d.svar[g.nyckel] ?? null} /> : null}
        </Skal>
      )
    }
    if (fas.typ === 'detalj') {
      return (
        <Skal titel={C.genomgangRubrik} rad={`${C.titel}, ${datum(vy.skapad)}`} onStang={() => setFas({ typ: 'resultat' })}>
          <section className="rounded-2xl border border-kant bg-papper p-4" data-iprov-tempo>
            <h2 className="text-ey uppercase text-ink-3">{C.tidRubrik}</h2>
            <ul className="mt-2.5 flex list-none flex-col gap-2.5 p-0">
              {r.delar.map((d) => (
                <li key={d.nr} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                  <span className="text-sm leading-5 text-ink-1">{d.kort}</span>
                  <span className="text-[13px] tabular-nums text-ink-3">{mmss(d.tid_s)}</span>
                  <span className="relative col-span-2 block h-1.5 rounded-full bg-papper-2" role="img" aria-label={`${d.namn}: ${mmss(d.tid_s)} av ${mmss(d.max_s)}`}>
                    <i className={`absolute inset-y-0 left-0 block rounded-full ${d.tidenSlut ? 'bg-koppar' : 'bg-ton-ink'}`} style={{ width: `${Math.min(100, (d.tid_s / Math.max(1, d.max_s)) * 92)}%` }} />
                    <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: 'calc(92% - 1px)' }} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[12px] leading-4 text-ink-3">{C.tidFot}</p>
          </section>
          <h2 className="mb-2 mt-4 px-0.5 text-[13px] font-semibold text-ink-2">{C.genomgangRubrik}</h2>
          <ul className="list-none divide-y divide-kant overflow-hidden rounded-2xl border border-kant bg-papper p-0">
            {r.delar.map((d, i) => (
              <li key={d.nr}>
                <button type="button" onClick={() => setFas({ typ: 'genomgang', del: i, pos: 0 })} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left" data-iprov-genomga={d.nr}>
                  <span className="w-4 text-meta tabular-nums text-ink-3">{d.nr}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink-1">{d.namn}</span>
                    <span className="block text-[13px] text-ink-3">{C.delUtfall(d.ratt, d.antal, d.tidenSlut)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Skal>
      )
    }
    // Var du tappar: de två deltesten med lägst andel rätt.
    const tappar = [...r.delar].sort((a, b) => a.ratt / a.antal - b.ratt / b.antal).slice(0, 2).filter((d) => d.ratt < d.antal)
    const riktat = (nr: number) => {
      const def = iprovDelar(vy.halvt).find((x) => x.nr === nr)!
      if (def.kind === 'spatial') return steg2PassHref('spatial', def.form === 'C' ? 'C' : 'B')
      if (def.kind === 'talserie') return steg2PassHref('talserie')
      return steg2PassHref('ordforrad', def.form)
    }
    return (
      <Skal titel={C.titel} onStang={stang} vagg>
        <div data-resultat data-iprov-resultat>
          <div className="flex items-center gap-4">
            <Dagsring status="gjord" andel={r.antal ? r.ratt / r.antal : 0} storlek={64} label={C.resultatRubrik(r.ratt, r.antal)} />
            <div className="min-w-0">
              <p className="text-ey uppercase text-koppar-ljus">{C.resultatEyebrow(vy.halvt, datum(vy.skapad))}</p>
              <h1 className="mt-0.5 font-display text-[28px] font-bold leading-[33px] tracking-[-.02em] text-vagg-ink">{C.resultatRubrik(r.ratt, r.antal)}</h1>
            </div>
          </div>
          <ul className="mt-4 flex list-none flex-col gap-2 p-0" aria-label="Rätt per deltest">
            {r.delar.map((d) => {
              const svag = tappar.some((t) => t.nr === d.nr)
              return (
                <li key={d.nr} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-[13px] leading-4 text-vagg-mjuk" data-iprov-stapel>
                  <span className="truncate">{d.kort}</span>
                  <span className="block h-2 rounded-full bg-white/[.12]" role="img" aria-label={`${d.namn}: ${d.ratt} av ${d.antal}`}>
                    <i className={`block h-full rounded-full ${svag ? 'bg-koppar' : 'bg-vagg-ink'}`} style={{ width: `${d.antal ? Math.max(3, (d.ratt / d.antal) * 100) : 0}%` }} />
                  </span>
                  <b className="tabular-nums text-vagg-ink">{`${d.ratt} av ${d.antal}`}</b>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="-mx-4 mt-5 rounded-t-2xl bg-golv px-4 pb-2 pt-4">
          {tappar.length ? (
            <section className="rounded-2xl border border-kant bg-papper px-4 py-3" aria-label={C.tappar}>
              <h2 className="text-ey uppercase text-ink-3">{C.tappar}</h2>
              <ul className="mt-1 list-none p-0">
                {tappar.map((t, i) => (
                  <li key={t.nr} className={i ? 'border-t border-kant' : ''}>
                    <Link href={riktat(t.nr)} className="flex min-h-[52px] items-center gap-3 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink-1">{t.namn}</span>
                        <span className="block text-[13px] text-ink-3">{C.riktat}</span>
                      </span>
                      <span aria-hidden="true" className="text-ink-3">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="mt-3 rounded-2xl border border-kant bg-papper px-4 py-3 text-sm leading-[21px] text-ink-2" data-iprov-skala>
            {C.stanine(vy.variant)}
          </p>
          <button type="button" onClick={() => setFas({ typ: 'detalj' })} className="mt-3 flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-kant bg-papper px-4 py-2 text-left">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink-1">{C.tidRubrik}</span>
              <span className="block text-[13px] text-ink-3">{C.tidRad}</span>
            </span>
            <span aria-hidden="true" className="text-ink-3">›</span>
          </button>
          <button type="button" onClick={() => setFas({ typ: 'detalj' })} className={`${KNAPP_PRIMAR} mt-4`} data-iprov-ga-igenom>
            {C.genomga}
          </button>
          <Link href={TRANING_HREF} className={`${LANK} mt-2 flex min-h-11 items-center justify-center`}>
            {C.tillbaka}
          </Link>
        </div>
      </Skal>
    )
  }

  if (!del) {
    return (
      <Skal titel={C.titel} onStang={stang}>
        <p className="text-center text-meta text-ink-3" role="status">Räknar fram resultatet</p>
      </Skal>
    )
  }

  const segment = (
    <div className="flex gap-1" aria-hidden="true">
      {vy.delar.map((d) => (
        <i key={d.nr} className={`block h-[4px] flex-1 rounded-full ${d.avslutad ? 'bg-koppar' : d.nr === del.nr ? 'bg-vagg-ink' : 'bg-white/[.18]'}`} />
      ))}
    </div>
  )

  /* ---------------- Mellanbladet */
  if (!del.startad) {
    const def = iprovDelar(vy.halvt).find((x) => x.nr === del.nr)!
    const klara = vy.delar.filter((d) => d.avslutad).map((d) => d.namn.toLowerCase())
    const klaraText = klara.length ? [klara[0].charAt(0).toUpperCase() + klara[0].slice(1), ...klara.slice(1)] : []
    const nrIndex = vy.delar.findIndex((d) => d.nr === del.nr) + 1
    return (
      <Skal
        titel={C.titel}
        onStang={stang}
        vagg
        stapel={segment}
        fot={
          <>
            {fel ? <p role="alert" className="mb-2 text-sm text-ink-1">{fel}</p> : null}
            <button type="button" onClick={() => void delHandling('starta', del.nr)} disabled={upptagen} className={KNAPP_PRIMAR} data-iprov-starta-del>
              {C.startaDel}
            </button>
          </>
        }
      >
        <div className="pt-6" data-iprov-mellanblad={del.nr}>
          <p className="text-ey uppercase text-koppar-ljus">{C.mellanEyebrow(nrIndex, antalDelar)}</p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-[88px] font-bold leading-[80px] tracking-[-.04em] text-koppar-ljus">{nrIndex}</span>
            <span className="text-[20px] font-semibold text-vagg-mjuk">av {antalDelar}</span>
          </p>
          <h1 className="mt-5 font-display text-[32px] font-bold leading-[38px] tracking-[-.02em] text-vagg-ink">{del.namn}</h1>
          <p className="mt-3 text-[15px] leading-[22px] text-vagg-mjuk">
            <b className="font-semibold text-vagg-ink">{C.mellanAntal(del.uppgifter.length || def.antal, Math.round(del.max_s / 60))}</b> {def.beskrivning}
          </p>
          <p className="mt-3 text-[15px] leading-[22px] text-vagg-mjuk">{C.mellanKlara(klaraText)}</p>
        </div>
      </Skal>
    )
  }

  /* ---------------- Frågan */
  const u = del.uppgifter[Math.min(idx, del.uppgifter.length - 1)]
  const lagen: SegmentLage[] = del.uppgifter.map((x, i) => (i === idx ? 'aktuell' : svar[x.nyckel] !== undefined ? 'besvarad' : i < idx ? 'hoppad' : 'kvar'))
  const obesvarade = del.uppgifter.filter((x) => svar[x.nyckel] === undefined).length
  const sistaUppgift = idx >= del.uppgifter.length - 1
  const nrIndex = vy.delar.findIndex((d) => d.nr === del.nr) + 1
  return (
    <Skal
      titel={C.titel}
      rad={`Deltest ${nrIndex} av ${antalDelar}, ${del.namn.toLowerCase()}`}
      onStang={stang}
      hoger={<Klocka kvar={kvar} total={del.max_s} />}
      stapel={<Segmentstapel lagen={lagen} aria={`Uppgift ${idx + 1} av ${del.uppgifter.length}`} onValj={(i) => setIdx(i)} etikett={(i) => `Uppgift ${i + 1}`} />}
      fot={
        <div className="flex items-center gap-3">
          <button type="button" className={`${LANK} min-h-11 disabled:opacity-40`} disabled={idx === 0} onClick={() => setIdx((x) => Math.max(0, x - 1))}>
            {C.foregaende}
          </button>
          {sistaUppgift ? (
            <button type="button" className={`${KNAPP_PRIMAR} flex-1`} onClick={() => setFragaAvsluta(true)} disabled={upptagen} data-iprov-avsluta-del>
              {C.avslutaDel}
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-kant-stark bg-papper text-[15px] font-semibold text-ink-1"
              onClick={() => setIdx((x) => Math.min(x + 1, del.uppgifter.length - 1))}
              data-iprov-nasta
            >
              {C.nasta}
            </button>
          )}
        </div>
      }
    >
      {fel ? <p role="alert" className="mb-3 rounded-xl border border-kant bg-papper px-4 py-2.5 text-sm text-ink-1">{fel}</p> : null}
      <div className="mx-auto max-w-[420px] lg:max-w-[560px]" data-iprov-fraga={del.nr}>
        {u ? <Steg2Uppgift key={u.nyckel} kind={del.kind} u={u} valt={svar[u.nyckel] ?? null} onValj={(i) => valj(u.nyckel, i)} /> : null}
      </div>
      <ConfirmDialog
        open={fragaAvsluta}
        onCancel={() => setFragaAvsluta(false)}
        onConfirm={() => {
          setFragaAvsluta(false)
          void delHandling('avsluta', del.nr)
        }}
        title={C.avslutaDelFraga}
        description={C.avslutaDelText(obesvarade)}
        confirmLabel={C.avslutaDel}
        cancelLabel={C.tillbakaTillDel}
      />
    </Skal>
  )
}

export function useIprovDagar(provdatum: string | null): number | null {
  return useMemo(() => (provdatum ? Math.round((new Date(provdatum).getTime() - Date.now()) / 86400000) : null), [provdatum])
}
