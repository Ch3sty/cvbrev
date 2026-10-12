'use client'

/**
 * Figurpassets flöde (beställning omgång 3, A3): fyra figurserier en i taget,
 * tre härnäst och en bryter mönstret. Ett tryck på ett alternativ (eller en
 * figur i bryter) är svaret; efter svaret regelpanelen med regeln och
 * misstaget och "Nästa". Lugn tidsrad mot provets tid per uppgift, ingen
 * nedräkning. Samma skal som text- och sifferpasset (PassShell), med
 * figurseriernas 640-kolumn på dator.
 *
 * Servern dömer. Ett svar som inte gick att spara visar en banner och
 * "Försök igen", aldrig regeln. När passet startats här byts adressen till
 * sessionens, så en omladdning återupptar.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN, kopKnapp, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { hemEfterHref, sessionHref, TRANING_HREF } from '@/lib/traning/rutter'
import { fetchFigurPassApi, type FigurPassApi } from '@/lib/tester/pass-klient'
import { FIGUR_PASS_COPY } from '@/lib/tester/pass-copy'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { FigurAterkoppling, FigurPassVy, FigurUppgift } from '@/lib/tester/pass-figur'
import { FigurserieAlternativ, FigurserieBryter, FigurserieRad } from '@/components/tests/serie/FigurserieRad'
import PassShell from '../PassShell'
import Regelpanel from '../Regelpanel'
import FigurResultatVy from './FigurResultatVy'

const C = FIGUR_PASS_COPY
const TIDSINTERVALL_MS = 250

type Fas =
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: number | null }
  | { typ: 'svarfel'; vald: number | null; tid: number }
  | { typ: 'aterkoppling'; at: FigurAterkoppling; klar: boolean }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; pos: number }

export interface FigurPassFlodeProps {
  api?: FigurPassApi
  /** Starta ett nytt (eller dagens påbörjade) pass. */
  starta?: boolean
  vy?: FigurPassVy | null
  /** Testerna: adressen byts inte. */
  forhandsvisning?: boolean
}

function forstaObesvarade(vy: FigurPassVy): number {
  const i = vy.uppgifter.findIndex((u) => !vy.besvarade[u.nyckel])
  return i < 0 ? vy.uppgifter.length : i
}

function Meddelande({ titel, text, children }: { titel: string; text?: string; children?: React.ReactNode }) {
  return (
    <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
      <h2 className="text-kort-t text-ink-1">{titel}</h2>
      {text ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{text}</p> : null}
      {children}
    </section>
  )
}

/** En uppgift: frågeraden, raden och alternativen (eller de sex i bryter), regelpanelen efter svar. */
export function FigurUppgiftVy({
  u,
  nr,
  antal,
  vald,
  at,
  tid,
  last,
  onValj,
  sessionId,
}: {
  u: FigurUppgift
  nr: number
  antal: number
  vald: number | null
  at: FigurAterkoppling | null
  /** Sekunder på uppgiften, för regelpanelens rad. */
  tid: number
  last: boolean
  onValj?: (i: number) => void
  sessionId: string | null
}) {
  const bryter = u.form === 'bryter'
  const ratt = at ? at.rattVisat : null
  const rad = at
    ? at.valtVisat === null
      ? PASS_COPY.regel.vetInte(tid)
      : at.correct
        ? PASS_COPY.regel.ratt(tid)
        : PASS_COPY.regel.fel(tid)
    : ''
  return (
    <div className="space-y-3.5" data-figurpass-uppgift={u.form}>
      <div>
        <p className="flex items-baseline justify-between gap-3 text-[13px] leading-[18px] text-ink-3">
          <span className="whitespace-nowrap" aria-label={C.fraga.uppgift(nr, antal)}>
            Uppgift {nr}
          </span>
          <b className="text-right text-sm font-semibold text-ink-1">{bryter ? C.fraga.bryter : C.fraga.harnast}</b>
        </p>
        {bryter ? <p className="mt-1 text-right text-[13px] leading-[18px] text-ink-3">{C.fraga.bryterHjalp}</p> : null}
      </div>
      {bryter ? (
        <FigurserieBryter rad={u.rad} vald={vald} ratt={ratt} onValj={(i) => !last && onValj?.(i)} disabled={last} />
      ) : (
        <>
          <FigurserieRad rad={u.rad} facit={ratt != null ? u.options[ratt] : null} />
          <FigurserieAlternativ options={u.options} valt={vald} ratt={ratt} onValj={(i) => onValj?.(i)} disabled={last} />
        </>
      )}
      {at ? (
        <Regelpanel
          rad={rad}
          regel={at.regel}
          misstag={at.misstag}
          visaVidSvar
          rapport={{ qId: u.nyckel, sessionId, testKind: 'figurserie', bankVersion: null }}
        />
      ) : null}
    </div>
  )
}

let senasteStart: { at: number; svar: ReturnType<FigurPassApi['skapa']> } | null = null

export default function FigurPassFlode({ api = fetchFigurPassApi, starta = false, vy: initialVy = null, forhandsvisning = false }: FigurPassFlodeProps) {
  const router = useRouter()
  const [vy, setVy] = useState<FigurPassVy | null>(initialVy)
  const [idx, setIdx] = useState<number>(() => (initialVy ? Math.min(forstaObesvarade(initialVy), initialVy.uppgifter.length - 1) : 0))
  const [fas, setFas] = useState<Fas>(() => {
    if (!initialVy) return { typ: 'startar' }
    if (initialVy.avslutad) return initialVy.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 }
    return { typ: 'fraga' }
  })

  /* ------------------------------ Tiden ------------------------------ */

  const fragaStart = useRef<number>(0)
  const [sekunder, setSekunder] = useState(0)
  const tickar = fas.typ === 'fraga' || fas.typ === 'sparar'
  const tidigare = vy ? Object.values(vy.besvarade).reduce((s, b) => s + b.tid_s, 0) : 0

  useEffect(() => {
    if (fas.typ !== 'fraga') return
    fragaStart.current = performance.now()
    setSekunder(0)
  }, [idx, vy?.id, fas.typ])

  useEffect(() => {
    if (!tickar) return
    const t = setInterval(() => setSekunder((performance.now() - fragaStart.current) / 1000), TIDSINTERVALL_MS)
    return () => clearInterval(t)
  }, [tickar])

  /* ------------------------------ Starten ----------------------------- */

  const startad = useRef(false)
  const skapa = useCallback(async () => {
    setFas({ typ: 'startar' })
    const nu = Date.now()
    if (!senasteStart || nu - senasteStart.at > 30_000) senasteStart = { at: nu, svar: api.skapa() }
    const r = await senasteStart.svar
    if (!r.ok) {
      senasteStart = null
      setFas({ typ: 'startfel', status: r.status })
      return
    }
    const s = r.session
    setVy(s)
    setIdx(Math.min(forstaObesvarade(s), s.uppgifter.length - 1))
    setFas(s.avslutad ? (s.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 }) : { typ: 'fraga' })
    if (!forhandsvisning) {
      try {
        window.history.replaceState(null, '', sessionHref(s.id))
      } catch {
        // Adressen är en bekvämlighet.
      }
    }
  }, [api, forhandsvisning])

  useEffect(() => {
    if (startad.current || initialVy || !starta) return
    startad.current = true
    void skapa()
  }, [skapa, initialVy, starta])

  /* ------------------------------ Avslutet ---------------------------- */

  const avsluta = useCallback(
    async (aktuell: FigurPassVy) => {
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
    async (vald: number | null, tidIn?: number) => {
      if (!vy) return
      const u = vy.uppgifter[idx]
      if (!u) return
      const tid = tidIn ?? Math.max(0, Math.round((performance.now() - fragaStart.current) / 1000))
      setFas({ typ: 'sparar', vald })
      const r = await api.svara({ sessionId: vy.id, nyckel: u.nyckel, visat: vald, tid })
      if (!r.ok) {
        if (r.status === 409) {
          const ny = await api.session(vy.id)
          const at = ny?.aterkoppling[u.nyckel]
          if (ny && at) {
            setVy(ny)
            setFas({ typ: 'aterkoppling', at, klar: forstaObesvarade(ny) >= ny.uppgifter.length })
            return
          }
        }
        setFas({ typ: 'svarfel', vald, tid })
        return
      }
      setVy({
        ...vy,
        besvarade: { ...vy.besvarade, [u.nyckel]: { visat: vald, tid_s: tid } },
        aterkoppling: { ...vy.aterkoppling, [u.nyckel]: r.aterkoppling },
      })
      setFas({ typ: 'aterkoppling', at: r.aterkoppling, klar: r.klar })
    },
    [api, vy, idx]
  )

  const nasta = useCallback(() => {
    if (!vy || fas.typ !== 'aterkoppling') return
    if (fas.klar) {
      void avsluta(vy)
      return
    }
    setIdx((i) => Math.min(i + 1, vy.uppgifter.length - 1))
    setFas({ typ: 'fraga' })
  }, [vy, fas, avsluta])

  const hemHref = vy && !forhandsvisning ? hemEfterHref(vy.id) : TRANING_HREF
  const tillbaka = useCallback(() => router.push(hemHref), [router, hemHref])

  /* ------------------------------ Ritningen --------------------------- */

  const titel = C.topp.titel
  const undertitel = vy ? C.topp.rad(vy.niva) : C.laddar.session

  if (!vy || fas.typ === 'startar' || fas.typ === 'startfel') {
    let innehall: React.ReactNode
    if (fas.typ === 'startfel' && (fas.status === 403 || fas.status === 402)) {
      innehall = (
        <section aria-label={C.fel.betalvagg} className="rounded-2xl border border-kant bg-papper p-4" data-figurpass-betalvagg>
          <h2 className="text-kort-t text-ink-1">{C.fel.betalvagg}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{C.fel.betalvaggRad}</p>
          <p className="mt-2 text-sm font-medium text-ink-1">{`${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}. Säg upp när du vill.`}</p>
          <div className={KNAPPRAD}>
            <Link href={kopstegHref(SALD_PLAN, 'dag2')} className={KNAPP_PRIMAR}>
              {kopKnapp(SALD_PLAN)}
            </Link>
            <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {C.knapp.tillbaka}
            </Link>
          </div>
        </section>
      )
    } else if (fas.typ === 'startfel') {
      innehall = (
        <Meddelande titel={C.fel.hamta} text={C.fel.hamtaRad}>
          <div className={KNAPPRAD}>
            <button type="button" onClick={() => void skapa()} className={KNAPP_PRIMAR}>
              {C.knapp.forsokIgen}
            </button>
            <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {C.knapp.tillbaka}
            </Link>
          </div>
        </Meddelande>
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
    return (
      <PassShell titel={titel} undertitel={undertitel} fraga={null} antal={null} tid={null} onAvsluta={tillbaka} avslutaEtikett={C.knapp.tillbaka}>
        <FigurResultatVy vy={vy} onGenomga={() => setFas({ typ: 'genomgang', pos: 0 })} onTillbaka={tillbaka} />
      </PassShell>
    )
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
        bred
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
        <FigurUppgiftVy u={u} nr={pos + 1} antal={antal} vald={b?.visat ?? null} at={vy.aterkoppling[u.nyckel] ?? null} tid={b?.tid_s ?? 0} last sessionId={vy.id} />
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
          <Meddelande titel={C.fel.avslut} />
        ) : (
          <p className="text-center text-meta text-ink-3" role="status" aria-live="polite">
            {C.laddar.resultat}
          </p>
        )}
      </PassShell>
    )
  }

  const u = vy.uppgifter[Math.min(idx, antal - 1)]
  const at = fas.typ === 'aterkoppling' ? fas.at : null
  const vald = fas.typ === 'sparar' || fas.typ === 'svarfel' ? fas.vald : at ? at.valtVisat : null
  const nuTid = fas.typ === 'fraga' || fas.typ === 'sparar' ? sekunder : 0
  const tidPaUppgift = vy.besvarade[u.nyckel]?.tid_s ?? Math.round(sekunder)

  return (
    <PassShell
      titel={titel}
      undertitel={undertitel}
      fraga={Math.min(idx + 1, antal)}
      antal={antal}
      tid={{ sekunder: tidigare + nuTid, budget: vy.budget_s }}
      bred
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
        ) : at ? (
          <button type="button" onClick={nasta} className={KNAPP_PRIMAR} data-figurpass-nasta>
            {fas.typ === 'aterkoppling' && fas.klar ? C.knapp.visaResultat : C.knapp.nasta}
          </button>
        ) : (
          <button
            type="button"
            disabled={fas.typ !== 'fraga'}
            onClick={() => void svara(null)}
            className={`${LANK} inline-flex min-h-9 items-center justify-center disabled:opacity-50`}
          >
            {C.aterkoppling.vetInte}
          </button>
        )
      }
    >
      <FigurUppgiftVy
        key={u.nyckel}
        u={u}
        nr={Math.min(idx + 1, antal)}
        antal={antal}
        vald={vald}
        at={at}
        tid={tidPaUppgift}
        last={fas.typ !== 'fraga'}
        onValj={(i) => void svara(i)}
        sessionId={vy.id}
      />
    </PassShell>
  )
}
