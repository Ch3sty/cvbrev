'use client'

/**
 * Passen i testplanens steg 2 (skiss-tester-steg2-2026-11-09): talseriepasset
 * och spatialpasset. Sex uppgifter en i taget; ett tryck på ett alternativ
 * svarar (skissen har bara "Vet inte" i foten), och efter svaret står
 * genomgången: rätt svar, förklaringen och misstaget för hennes val, med
 * "Nästa uppgift" i foten. Lugn tidsrad mot provets tid per uppgift, ingen
 * nedräkning. Samma skal som de andra passen (PassShell).
 *
 * Servern dömer. Ett svar som inte gick att spara visar en banner och
 * "Försök igen", aldrig facit. När passet startats här byts adressen till
 * sessionens, så en omladdning återupptar.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN, kopKnapp, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { hemEfterHref, sessionHref, TRANING_HREF } from '@/lib/traning/rutter'
import { fetchSteg2PassApi, type Steg2PassApi } from '@/lib/tester/pass-klient'
import { steg2PassCopy } from '@/lib/tester/steg2/copy'
import type { Steg2Aterkoppling, Steg2PassKind, Steg2PassVy } from '@/lib/tester/steg2/pass'
import { Steg2Genomgang, Steg2Uppgift } from '@/components/tests/steg2/Uppgifter'
import FragaRapport from '@/components/traning/FragaRapport'
import PassShell from '../PassShell'
import Steg2ResultatVy from './Steg2ResultatVy'

const TIDSINTERVALL_MS = 250

type Fas =
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: number | null }
  | { typ: 'svarfel'; vald: number | null; tid: number }
  | { typ: 'aterkoppling'; at: Steg2Aterkoppling; klar: boolean }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; pos: number }

export interface Steg2PassFlodeProps {
  api?: Steg2PassApi
  /** Starta ett nytt (eller dagens påbörjade) pass i den här typen. */
  starta?: { kind: Steg2PassKind; grupp: string | null } | null
  vy?: Steg2PassVy | null
  forhandsvisning?: boolean
}

function forstaObesvarade(vy: Steg2PassVy): number {
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

let senasteStart: { at: number; nyckel: string; svar: ReturnType<Steg2PassApi['skapa']> } | null = null

export default function Steg2PassFlode({ api = fetchSteg2PassApi, starta = null, vy: initialVy = null, forhandsvisning = false }: Steg2PassFlodeProps) {
  const router = useRouter()
  const [vy, setVy] = useState<Steg2PassVy | null>(initialVy)
  const kind: Steg2PassKind = vy?.kind ?? starta?.kind ?? 'talserie'
  const C = steg2PassCopy(kind)
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
    if (!starta) return
    setFas({ typ: 'startar' })
    const nu = Date.now()
    const nyckel = `${starta.kind}|${starta.grupp ?? ''}`
    if (!senasteStart || senasteStart.nyckel !== nyckel || nu - senasteStart.at > 30_000) senasteStart = { at: nu, nyckel, svar: api.skapa(starta.kind, starta.grupp) }
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
  }, [api, forhandsvisning, starta])

  useEffect(() => {
    if (startad.current || initialVy || !starta) return
    startad.current = true
    void skapa()
  }, [skapa, initialVy, starta])

  /* ------------------------------ Avslutet ---------------------------- */
  const avsluta = useCallback(
    async (aktuell: Steg2PassVy) => {
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

  if (!vy || fas.typ === 'startar' || fas.typ === 'startfel') {
    let innehall: React.ReactNode
    if (fas.typ === 'startfel' && (fas.status === 403 || fas.status === 402)) {
      innehall = (
        <section aria-label={C.fel.betalvagg} className="rounded-2xl border border-kant bg-papper p-4" data-steg2pass-betalvagg>
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
      <PassShell titel={titel} undertitel={C.laddar.session} fraga={null} antal={null} tid={null} onAvsluta={tillbaka} avslutaEtikett={C.topp.avsluta}>
        {innehall}
      </PassShell>
    )
  }

  const antal = vy.uppgifter.length
  const rad = (n: number) => C.topp.rad(vy.niva, vy.grupp ? vy.aterkoppling[vy.uppgifter[0].nyckel]?.grupp ?? null : null, n, antal)

  if (fas.typ === 'resultat' && vy.resultat) {
    return (
      <PassShell titel={titel} undertitel={C.topp.radUtan} fraga={null} antal={null} tid={null} onAvsluta={tillbaka} avslutaEtikett={C.knapp.tillbaka}>
        <Steg2ResultatVy vy={vy} onGenomga={() => setFas({ typ: 'genomgang', pos: 0 })} onTillbaka={tillbaka} />
      </PassShell>
    )
  }

  if (fas.typ === 'genomgang') {
    const pos = Math.min(fas.pos, antal - 1)
    const u = vy.uppgifter[pos]
    const sista = pos >= antal - 1
    const tillResultat = vy.resultat ? () => setFas({ typ: 'resultat' }) : tillbaka
    const at = vy.aterkoppling[u.nyckel]
    return (
      <PassShell
        titel={titel}
        undertitel={rad(pos + 1)}
        fraga={pos + 1}
        antal={antal}
        tid={null}
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
        {at ? <Steg2Genomgang kind={kind} g={at.genomgang} valt={at.valtVisat} /> : <Steg2Uppgift kind={kind} u={u} valt={null} disabled />}
      </PassShell>
    )
  }

  if (fas.typ === 'avslutar' || fas.typ === 'avslutfel') {
    return (
      <PassShell
        titel={titel}
        undertitel={rad(antal)}
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

  return (
    <PassShell
      titel={titel}
      undertitel={rad(Math.min(idx + 1, antal))}
      fraga={Math.min(idx + 1, antal)}
      antal={antal}
      tid={{ sekunder: tidigare + nuTid, budget: vy.budget_s }}
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
          <button type="button" onClick={nasta} className={KNAPP_PRIMAR} data-steg2pass-nasta>
            {fas.typ === 'aterkoppling' && fas.klar ? C.knapp.visaResultat : C.knapp.nasta}
          </button>
        ) : (
          <button
            type="button"
            disabled={fas.typ !== 'fraga'}
            onClick={() => void svara(null)}
            className={`${LANK} inline-flex min-h-11 items-center justify-start disabled:opacity-50`}
            data-steg2pass-vetinte
          >
            {C.vetInte}
          </button>
        )
      }
    >
      <div className="mx-auto w-full max-w-[420px] lg:max-w-[560px]" data-steg2pass={kind}>
        {at ? (
          <>
            <Steg2Genomgang kind={kind} g={at.genomgang} valt={at.valtVisat} />
            <FragaRapport qId={u.nyckel} sessionId={vy.id} testKind={kind} />
          </>
        ) : (
          <Steg2Uppgift key={u.nyckel} kind={kind} u={u} valt={vald} onValj={(i) => fas.typ === 'fraga' && void svara(i)} disabled={fas.typ !== 'fraga'} />
        )}
      </div>
    </PassShell>
  )
}
