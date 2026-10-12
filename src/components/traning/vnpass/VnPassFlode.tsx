'use client'

/**
 * Text- och sifferpassets flöde (beställning omgång 2, B2): ett underlag,
 * fyra uppgifter ett i taget, rätt svar och förklaring efter varje svar,
 * resultatet och genomgången. Samma skal som matrispasset (PassShell):
 * helskärm, lugn tidsrad mot provets tid för underlaget, ingen nedräkning,
 * aldrig rött.
 *
 * Toppradens titel är passets namn ("Textpass", "Sifferpass"), i riktat
 * pass familjen, och står still hela passet (C4). Den aktuella uppgiftens
 * typ visas aldrig.
 *
 * Servern dömer. Ett svar som inte gick att spara visar en banner och
 * "Försök igen", aldrig förklaringen. När passet startats här byts adressen
 * till sessionens, så en omladdning återupptar.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN, kopKnapp, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { hemEfterHref, sessionHref, TRANING_HREF, vnPassHref } from '@/lib/traning/rutter'
import { fetchVnPassApi, type VnPassApi } from '@/lib/tester/pass-klient'
import { VN_PASS_COPY } from '@/lib/tester/pass-copy'
import type { VnAterkoppling, VnKind, VnPassVy } from '@/lib/tester/pass-typer'
import PassShell from '../PassShell'
import { Underlag, VnUppgift } from './VnUppgift'
import VnResultatVy from './VnResultatVy'

const C = VN_PASS_COPY
const TIDSINTERVALL_MS = 250

type Fas =
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: string }
  | { typ: 'svarfel'; vald: string; tid: number }
  | { typ: 'aterkoppling'; vald: string; at: VnAterkoppling; klar: boolean }
  | { typ: 'avslutar' }
  | { typ: 'avslutfel' }
  | { typ: 'resultat' }
  | { typ: 'genomgang'; pos: number }

export interface VnPassFlodeProps {
  api?: VnPassApi
  start?: { kind: VnKind; familj?: string | null }
  vy?: VnPassVy | null
  /** Testerna: adressen byts inte. */
  forhandsvisning?: boolean
}

function forstaObesvarade(vy: VnPassVy): number {
  const i = vy.punkter.findIndex((p) => !vy.besvarade[p.nyckel])
  return i < 0 ? vy.punkter.length : i
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

let senasteStart: { nyckel: string; at: number; svar: ReturnType<VnPassApi['skapa']> } | null = null

export default function VnPassFlode({ api = fetchVnPassApi, start, vy: initialVy = null, forhandsvisning = false }: VnPassFlodeProps) {
  const router = useRouter()
  const [vy, setVy] = useState<VnPassVy | null>(initialVy)
  const [idx, setIdx] = useState<number>(() => (initialVy ? Math.min(forstaObesvarade(initialVy), initialVy.punkter.length - 1) : 0))
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
    if (!start) return
    setFas({ typ: 'startar' })
    const nyckel = `${start.kind}|${start.familj ?? ''}`
    const nu = Date.now()
    if (!senasteStart || senasteStart.nyckel !== nyckel || nu - senasteStart.at > 30_000) {
      senasteStart = { nyckel, at: nu, svar: api.skapa(start.kind, start.familj ?? null) }
    }
    const r = await senasteStart.svar
    if (!r.ok) {
      senasteStart = null
      setFas({ typ: 'startfel', status: r.status })
      return
    }
    const s = r.session
    setVy(s)
    setIdx(Math.min(forstaObesvarade(s), s.punkter.length - 1))
    setFas(s.avslutad ? (s.resultat ? { typ: 'resultat' } : { typ: 'genomgang', pos: 0 }) : { typ: 'fraga' })
    if (!forhandsvisning) {
      try {
        window.history.replaceState(null, '', sessionHref(s.id))
      } catch {
        // Adressen är en bekvämlighet.
      }
    }
  }, [api, start, forhandsvisning])

  useEffect(() => {
    if (startad.current || initialVy || !start) return
    startad.current = true
    void skapa()
  }, [skapa, initialVy, start])

  /* ------------------------------ Avslutet ---------------------------- */

  const avsluta = useCallback(
    async (aktuell: VnPassVy) => {
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

  // Alla svar sparade men passet inte avslutat (fliken stängdes): avsluta direkt.
  const avslutadVidStart = useRef(false)
  useEffect(() => {
    if (avslutadVidStart.current || !initialVy) return
    avslutadVidStart.current = true
    if (!initialVy.avslutad && forstaObesvarade(initialVy) >= initialVy.punkter.length) void avsluta(initialVy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------- Svaret ----------------------------- */

  const svara = useCallback(
    async (vald: string, tidIn?: number) => {
      if (!vy) return
      const p = vy.punkter[idx]
      if (!p) return
      const tid = tidIn ?? Math.max(0, Math.round((performance.now() - fragaStart.current) / 1000))
      setFas({ typ: 'sparar', vald })
      const r = await api.svara({ sessionId: vy.id, nyckel: p.nyckel, svar: vald, tid })
      if (!r.ok) {
        if (r.status === 409) {
          const ny = await api.session(vy.id)
          if (ny) {
            setVy(ny)
            const at = ny.aterkoppling[p.nyckel]
            if (at) {
              setFas({ typ: 'aterkoppling', vald: ny.besvarade[p.nyckel]?.svar ?? vald, at, klar: forstaObesvarade(ny) >= ny.punkter.length })
              return
            }
          }
        }
        setFas({ typ: 'svarfel', vald, tid })
        return
      }
      setVy({
        ...vy,
        besvarade: { ...vy.besvarade, [p.nyckel]: { svar: vald, tid_s: tid } },
        aterkoppling: { ...vy.aterkoppling, [p.nyckel]: r.aterkoppling },
      })
      setFas({ typ: 'aterkoppling', vald, at: r.aterkoppling, klar: r.klar })
    },
    [api, vy, idx]
  )

  const nasta = useCallback(() => {
    if (!vy || fas.typ !== 'aterkoppling') return
    if (fas.klar) {
      void avsluta(vy)
      return
    }
    setIdx((i) => Math.min(i + 1, vy.punkter.length - 1))
    setFas({ typ: 'fraga' })
  }, [vy, fas, avsluta])

  const hemHref = vy && !forhandsvisning ? hemEfterHref(vy.id) : TRANING_HREF
  const tillbaka = useCallback(() => router.push(hemHref), [router, hemHref])

  /* ------------------------------ Ritningen --------------------------- */

  const kind: VnKind = vy?.kind ?? start?.kind ?? 'verbal'
  const familj = vy?.familj ?? start?.familj ?? null
  const titel = C.topp.titel(kind, familj)
  const undertitel = vy ? C.topp.rad(kind, vy.niva, vy.typ === 'riktat') : C.laddar.session

  if (!vy || fas.typ === 'startar' || fas.typ === 'startfel') {
    let innehall: React.ReactNode
    if (fas.typ === 'startfel') {
      if (fas.status === 403 || fas.status === 402) {
        innehall = (
          <section aria-label={C.fel.betalvagg(kind)} className="rounded-2xl border border-kant bg-papper p-4">
            <h2 className="text-kort-t text-ink-1">{C.fel.betalvagg(kind)}</h2>
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
      } else if (fas.status === 422) {
        innehall = (
          <Meddelande titel={C.fel.familj} text={C.fel.familjRad}>
            <div className={KNAPPRAD}>
              <Link href={vnPassHref(kind)} className={KNAPP_PRIMAR}>
                {C.namn(kind)}
              </Link>
              <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {C.knapp.tillbaka}
              </Link>
            </div>
          </Meddelande>
        )
      } else {
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
      }
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

  const antal = vy.punkter.length

  if (fas.typ === 'resultat' && vy.resultat) {
    return (
      <PassShell titel={titel} undertitel={undertitel} fraga={null} antal={null} tid={null} onAvsluta={tillbaka} avslutaEtikett={C.knapp.tillbaka}>
        <VnResultatVy vy={vy} onGenomga={() => setFas({ typ: 'genomgang', pos: 0 })} onTillbaka={tillbaka} />
      </PassShell>
    )
  }

  if (fas.typ === 'genomgang') {
    const pos = Math.min(fas.pos, antal - 1)
    const p = vy.punkter[pos]
    const sista = pos >= antal - 1
    const tillResultat = vy.resultat ? () => setFas({ typ: 'resultat' }) : tillbaka
    return (
      <PassShell
        titel={titel}
        undertitel={undertitel}
        fraga={pos + 1}
        antal={antal}
        tid={null}
        onAvsluta={tillResultat}
        avslutaEtikett={vy.resultat ? C.knapp.tillResultatet : C.knapp.tillbaka}
        nyckel={`g-${p.nyckel}`}
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
        <Underlag kind={vy.kind} underlag={vy.underlag} />
        <VnUppgift kind={vy.kind} punkt={p} nr={pos + 1} antal={antal} vald={vy.besvarade[p.nyckel]?.svar ?? null} aterkoppling={vy.aterkoppling[p.nyckel] ?? null} last />
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

  const p = vy.punkter[Math.min(idx, antal - 1)]
  const at = fas.typ === 'aterkoppling' ? fas.at : null
  const vald = fas.typ === 'sparar' || fas.typ === 'svarfel' || fas.typ === 'aterkoppling' ? fas.vald : null
  const nuTid = fas.typ === 'fraga' || fas.typ === 'sparar' ? sekunder : 0

  return (
    <PassShell
      titel={titel}
      undertitel={undertitel}
      fraga={Math.min(idx + 1, antal)}
      antal={antal}
      tid={{ sekunder: tidigare + nuTid, budget: vy.budget_s }}
      onAvsluta={tillbaka}
      avslutaEtikett={C.topp.avsluta}
      nyckel={vy.kind === 'numerisk' ? p.nyckel : undefined}
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
          <button type="button" onClick={nasta} className={KNAPP_PRIMAR}>
            {fas.typ === 'aterkoppling' && fas.klar ? C.knapp.visaResultat : C.knapp.nasta}
          </button>
        ) : undefined
      }
    >
      <Underlag kind={vy.kind} underlag={vy.underlag} />
      <VnUppgift
        key={p.nyckel}
        kind={vy.kind}
        punkt={p}
        nr={Math.min(idx + 1, antal)}
        antal={antal}
        vald={vald}
        aterkoppling={at}
        last={fas.typ !== 'fraga'}
        onValj={(s) => void svara(s)}
      />
    </PassShell>
  )
}
