'use client'

/**
 * Nivåkollens flöde för figurserier, deduktivt, verbalt och numeriskt
 * (testplanen steg 1, 2026-11-09). Samma form som matrisens Nivåkoll: en
 * uppgift i taget i passets skal, ingen återkoppling under tiden, lugn
 * tidsrad mot provets tid, resultatet med nivån på skalan och genomgången
 * efteråt. Ett tryck väljer, Svara lämnar in, "Vet inte" går vidare.
 *
 * Servern dömer och sparar. Ett svar som inte gick att spara visar en banner
 * och "Försök igen". När Nivåkollen startats här byts adressen till
 * sessionens, så en omladdning återupptar.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { hemEfterHref, sessionHref, TRANING_HREF } from '@/lib/traning/rutter'
import { fetchNivakollApi, type NivakollApi } from '@/lib/tester/pass-klient'
import { NIVAKOLL_COPY } from '@/lib/nivakoll/copy'
import type { NivakollKind } from '@/lib/nivakoll/niva'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import PassShell from '../PassShell'
import NivakollUppgift from './NivakollUppgift'
import NivakollResultatVy from './NivakollResultatVy'

const C = NIVAKOLL_COPY
const TIDSINTERVALL_MS = 250

type Fas =
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: string | null }
  | { typ: 'svarfel'; vald: string | null; tid: number }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; pos: number }

export interface NivakollFlodeProps {
  api?: NivakollApi
  /** Starta (eller återuppta dagens) Nivåkoll för typen. */
  kind?: NivakollKind
  vy?: NivakollVy | null
  /** tests_above_base: passen efter Nivåkollen är öppna. */
  betalande: boolean
}

function forstaObesvarade(vy: NivakollVy): number {
  const i = vy.uppgifter.findIndex((u) => !vy.besvarade[u.nyckel])
  return i < 0 ? vy.uppgifter.length : i
}

let senasteStart: { at: number; kind: NivakollKind; svar: ReturnType<NivakollApi['skapa']> } | null = null

export default function NivakollFlode({ api = fetchNivakollApi, kind, vy: initialVy = null, betalande }: NivakollFlodeProps) {
  const router = useRouter()
  const [vy, setVy] = useState<NivakollVy | null>(initialVy)
  const [idx, setIdx] = useState<number>(() => (initialVy ? Math.min(forstaObesvarade(initialVy), initialVy.uppgifter.length - 1) : 0))
  const [fas, setFas] = useState<Fas>(() => {
    if (!initialVy) return { typ: 'startar' }
    if (initialVy.avslutad) return initialVy.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 }
    return { typ: 'fraga' }
  })
  const [markerad, setMarkerad] = useState<string | null>(null)

  /* ------------------------------ Tiden ------------------------------ */

  const fragaStart = useRef<number>(0)
  const [sekunder, setSekunder] = useState(0)
  const tickar = fas.typ === 'fraga' || fas.typ === 'sparar'
  const tidigare = vy ? Object.values(vy.besvarade).reduce((s, b) => s + b.tid_s, 0) : 0

  useEffect(() => {
    if (fas.typ !== 'fraga') return
    fragaStart.current = performance.now()
    setSekunder(0)
    setMarkerad(null)
  }, [idx, vy?.id, fas.typ])

  useEffect(() => {
    if (!tickar) return
    const t = setInterval(() => setSekunder((performance.now() - fragaStart.current) / 1000), TIDSINTERVALL_MS)
    return () => clearInterval(t)
  }, [tickar])

  /* ------------------------------ Starten ----------------------------- */

  const startad = useRef(false)
  const skapa = useCallback(async () => {
    if (!kind) return
    setFas({ typ: 'startar' })
    const nu = Date.now()
    if (!senasteStart || senasteStart.kind !== kind || nu - senasteStart.at > 30_000) senasteStart = { at: nu, kind, svar: api.skapa(kind) }
    const r = await senasteStart.svar
    if (!r.ok) {
      senasteStart = null
      setFas({ typ: 'startfel', status: r.status })
      if (r.status === 402) capture('betalvagg_visad', { plats: 'ommatning', dagar_kvar: null, test_kind: kind })
      return
    }
    const s = r.session
    setVy(s)
    setIdx(Math.min(forstaObesvarade(s), s.uppgifter.length - 1))
    setFas(s.avslutad ? (s.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 }) : { typ: 'fraga' })
    if (!s.avslutad && forstaObesvarade(s) === 0) capture('nivamatning_startad', { ommatning: s.typ === 'ommatning', smakprov: 0, test_kind: kind })
    try {
      window.history.replaceState(null, '', sessionHref(s.id))
    } catch {
      // Adressen är en bekvämlighet.
    }
  }, [api, kind])

  useEffect(() => {
    if (startad.current || initialVy || !kind) return
    startad.current = true
    void skapa()
  }, [skapa, initialVy, kind])

  /* ------------------------------ Avslutet ---------------------------- */

  const avsluta = useCallback(
    async (aktuell: NivakollVy) => {
      setFas({ typ: 'avslutar' })
      const r = await api.slutfor(aktuell.id)
      if (!r.ok) {
        setFas({ typ: 'avslutfel' })
        return
      }
      senasteStart = null
      setVy(r.session)
      setFas(r.session.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 })
    },
    [api]
  )

  const avslutadVidStart = useRef(false)
  useEffect(() => {
    if (avslutadVidStart.current || !initialVy) return
    avslutadVidStart.current = true
    if (!initialVy.avslutad && forstaObesvarade(initialVy) >= initialVy.uppgifter.length) void avsluta(initialVy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------- Svaret ----------------------------- */

  const svara = useCallback(
    async (vald: string | null, tidIn?: number) => {
      if (!vy) return
      const u = vy.uppgifter[idx]
      if (!u) return
      const tid = tidIn ?? Math.max(0, Math.round((performance.now() - fragaStart.current) / 1000))
      setFas({ typ: 'sparar', vald })
      const r = await api.svara({ sessionId: vy.id, nyckel: u.nyckel, svar: vald, tid })
      if (!r.ok && r.status !== 409) {
        setFas({ typ: 'svarfel', vald, tid })
        return
      }
      const ny: NivakollVy = { ...vy, besvarade: { ...vy.besvarade, [u.nyckel]: { svar: vald, tid_s: tid } } }
      setVy(ny)
      if (forstaObesvarade(ny) >= ny.uppgifter.length) {
        void avsluta(ny)
        return
      }
      setIdx((i) => Math.min(i + 1, vy.uppgifter.length - 1))
      setFas({ typ: 'fraga' })
    },
    [api, vy, idx, avsluta]
  )

  const hemHref = vy ? hemEfterHref(vy.id) : TRANING_HREF
  const tillbaka = useCallback(() => router.push(hemHref), [router, hemHref])

  /* ------------------------------ Ritningen --------------------------- */

  const visadKind = vy?.kind ?? kind ?? 'deduktiv'
  const titel = C.topp.titel
  const undertitel = C.topp.rad(visadKind, vy?.typ ?? 'matning')
  const bredd = { bred: visadKind === 'figurserie', deduktiv: visadKind === 'deduktiv' }

  if (!vy || fas.typ === 'startar' || fas.typ === 'startfel') {
    let innehall: React.ReactNode
    if (fas.typ === 'startfel' && (fas.status === 402 || fas.status === 403)) {
      innehall = (
        <section aria-label={C.fel.betalvagg} className="rounded-2xl border border-kant bg-papper p-4" data-nivakoll-betalvagg>
          <h2 className="text-kort-t text-ink-1">{C.fel.betalvagg}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{C.fel.betalvaggRad()}</p>
          <div className={KNAPPRAD}>
            <Link href={kopstegHref(SALD_PLAN, 'ommatning')} className={KNAPP_PRIMAR}>
              {C.fel.kop()}
            </Link>
            <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {C.knapp.tillbaka}
            </Link>
          </div>
        </section>
      )
    } else if (fas.typ === 'startfel') {
      innehall = (
        <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
          <h2 className="text-kort-t text-ink-1">{C.fel.hamta}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{C.fel.hamtaRad}</p>
          <div className={KNAPPRAD}>
            <button type="button" onClick={() => void skapa()} className={KNAPP_PRIMAR}>
              {C.knapp.forsokIgen}
            </button>
            <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {C.knapp.tillbaka}
            </Link>
          </div>
        </section>
      )
    } else {
      innehall = (
        <p aria-busy="true" className="loading-thread rounded-xl border border-kant bg-papper p-4 text-sm text-ink-3">
          {C.laddar.session}
        </p>
      )
    }
    return (
      <PassShell titel={titel} undertitel={undertitel} fraga={null} antal={null} tid={null} onAvsluta={tillbaka} avslutaEtikett={C.topp.avsluta}>
        {innehall}
      </PassShell>
    )
  }

  const antal = vy.uppgifter.length

  if (fas.typ === 'resultat' && vy.resultat) {
    return <NivakollResultatVy vy={vy} betalande={betalande} onGenomga={() => setFas({ typ: 'genomgang', pos: 0 })} onTillbaka={tillbaka} />
  }

  if (fas.typ === 'genomgang') {
    const pos = Math.min(fas.pos, antal - 1)
    const u = vy.uppgifter[pos]
    const sista = pos >= antal - 1
    const tillResultat = vy.resultat ? () => setFas({ typ: 'resultat' }) : tillbaka
    const b = vy.besvarade[u.nyckel]
    return (
      <PassShell
        titel={titel}
        undertitel={undertitel}
        fraga={pos + 1}
        antal={antal}
        tid={null}
        {...bredd}
        onAvsluta={tillResultat}
        avslutaEtikett={vy.resultat ? C.knapp.tillResultatet : C.knapp.tillbaka}
        nyckel={`g-${u.nyckel}`}
        fot={
          <>
            <button type="button" onClick={sista ? tillResultat : () => setFas({ typ: 'genomgang', pos: pos + 1 })} className={KNAPP_PRIMAR}>
              {sista ? (vy.resultat ? C.knapp.tillResultatet : C.knapp.tillbaka) : C.knapp.nasta}
            </button>
            {pos > 0 ? (
              <button type="button" onClick={() => setFas({ typ: 'genomgang', pos: pos - 1 })} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {C.knapp.foregaende}
              </button>
            ) : null}
          </>
        }
      >
        <NivakollUppgift
          u={u}
          nr={pos + 1}
          antal={antal}
          vald={b?.svar ?? null}
          genomgang={vy.genomgang?.[u.nyckel] ?? null}
          tid_s={b?.tid_s ?? 0}
          underlag={vy.underlag}
          sessionId={vy.id}
          last
        />
      </PassShell>
    )
  }

  if (fas.typ === 'avslutar' || fas.typ === 'avslutfel') {
    return (
      <PassShell
        titel={titel}
        undertitel={undertitel}
        fraga={antal}
        antal={antal}
        tid={null}
        onAvsluta={tillbaka}
        avslutaEtikett={C.topp.avsluta}
        fot={
          fas.typ === 'avslutfel' ? (
            <button type="button" onClick={() => void avsluta(vy)} className={KNAPP_PRIMAR}>
              {C.knapp.forsokIgen}
            </button>
          ) : undefined
        }
      >
        {fas.typ === 'avslutfel' ? (
          <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
            <h2 className="text-kort-t text-ink-1">{C.fel.avslut}</h2>
          </section>
        ) : (
          <p className="text-center text-meta text-ink-3" role="status" aria-live="polite">
            {C.laddar.resultat}
          </p>
        )}
      </PassShell>
    )
  }

  const u = vy.uppgifter[Math.min(idx, antal - 1)]
  const vald = fas.typ === 'sparar' || fas.typ === 'svarfel' ? fas.vald : markerad
  const nuTid = fas.typ === 'fraga' || fas.typ === 'sparar' ? sekunder : 0

  return (
    <PassShell
      titel={titel}
      undertitel={undertitel}
      fraga={Math.min(idx + 1, antal)}
      antal={antal}
      tid={{ sekunder: tidigare + nuTid, budget: vy.budget_s * antal }}
      {...bredd}
      onAvsluta={tillbaka}
      avslutaEtikett={C.topp.avsluta}
      nyckel={u.nyckel}
      banner={
        fas.typ === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
            {C.fel.svar}
          </p>
        ) : null
      }
      fot={
        fas.typ === 'svarfel' ? (
          <button type="button" onClick={() => void svara(fas.vald, fas.tid)} className={KNAPP_PRIMAR}>
            {C.knapp.forsokIgen}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={fas.typ !== 'fraga' || markerad === null}
              onClick={() => markerad !== null && void svara(markerad)}
              className={`${KNAPP_PRIMAR} disabled:opacity-50`}
              data-nivakoll-svara
            >
              {C.fraga.svara}
            </button>
            <button
              type="button"
              disabled={fas.typ !== 'fraga'}
              onClick={() => void svara(null)}
              className={`${LANK} inline-flex min-h-9 items-center justify-center disabled:opacity-50`}
            >
              {C.fraga.vetInte}
            </button>
          </>
        )
      }
    >
      <NivakollUppgift
        key={u.nyckel}
        u={u}
        nr={Math.min(idx + 1, antal)}
        antal={antal}
        vald={vald}
        onValj={(v) => fas.typ === 'fraga' && setMarkerad(v)}
        underlag={vy.underlag}
        sessionId={vy.id}
        last={fas.typ !== 'fraga'}
      />
    </PassShell>
  )
}
