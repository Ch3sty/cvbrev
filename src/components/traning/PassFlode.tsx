'use client'

/**
 * Passflödet (spec-rummen 6 våg 3b, konceptets P1 till P4, S1, M1, O1):
 * dagens pass, riktat pass, nivåmätningen, ommätningen och
 * generalrepetitionen i en och samma helskärm.
 *
 * - Servern dömer. Klienten skickar visat index och får tillbaka
 *   återkopplingen (pass och riktat pass: rätt svar som visat index, regeln
 *   och misstaget) eller nästa fråga (adaptiva mätningar). Facit finns aldrig
 *   i klienten.
 * - Svar med ett tryck. I pass avslöjas regeln och misstaget direkt; valt
 *   svar i bläck, rätt i koppar, aldrig rött. "Vet inte, visa regeln" räknas
 *   som fel och sparar tiden (bara i pass och riktat pass).
 * - Mätning, ommätning och generalrepetition visar inga förklaringar förrän
 *   efteråt. Generalrepetitionen har serverns tidsgräns: 410 avslutar, och i
 *   format med tid per uppgift (Alva) går passet vidare själv när uppgiftens
 *   tid är ute (tidenUte, spec 14.4). Tidsraden räknar fortfarande inte ner.
 * - Ett svar som inte gick att spara visar en banner och "Försök igen",
 *   aldrig återkoppling eller "sparat" (feedback_riktig_webblasartest).
 * - Interaktionen mellan frågorna laddar aldrig om sidan. När passet
 *   startats här byts adressen till sessionens (history.replaceState), så
 *   en omladdning återupptar i stället för att starta ett nytt.
 *
 * API:t är en prop (src/lib/traning/klient.ts), så att förhandsvisningen för
 * utvecklare kan köra exakt samma flöde mot fixturer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { paketMedPris, paketNamn } from '@/lib/plans/plans'
import {
  fetchPassApi,
  passHref,
  sessionHref,
  TRANING_HREF,
  type Aterkoppling,
  type Avslut,
  type Begard,
  type PassApi,
  type Sessionsvy,
  type Traningsstatus,
} from '@/lib/traning/klient'
import { nivaHeltal, PASS_COPY } from '@/lib/traning/pass-copy'
import { matningResultat, ommatningResultat, passResultat } from '@/lib/traning/resultat'
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo'
import GenomgangVy from './GenomgangVy'
import MatningResultatVy from './MatningResultatVy'
import OmmatningResultatVy from './OmmatningResultatVy'
import PassFraga from './PassFraga'
import PassResultatVy from './PassResultatVy'
import PassShell from './PassShell'
import Regelpanel from './Regelpanel'

export interface Resultatdata {
  avslut: Avslut
  vy: Sessionsvy
  status: Traningsstatus | null
}

type Fas =
  | { typ: 'startar' }
  | { typ: 'startfel'; status: number; fel: string }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: number | null }
  | { typ: 'svarfel'; vald: number | null; vetInte: boolean; tidenUte: boolean; tid: number }
  | { typ: 'aterkoppling'; at: Aterkoppling; vald: number | null; klar: boolean }
  | { typ: 'avslutar'; tidenUte?: boolean }
  | { typ: 'avslutfel' }
  | { typ: 'resultat'; data: Resultatdata }
  | { typ: 'genomgang'; vy: Sessionsvy; lista: number[]; pos: number; resultat: Resultatdata | null }

export interface PassFlodeInitial {
  idx?: number
  fas?: 'fraga' | 'aterkoppling' | 'resultat'
  aterkoppling?: Aterkoppling
  vald?: number | null
  klar?: boolean
  resultat?: Resultatdata
}

export interface PassFlodeProps {
  api?: PassApi
  /** Starta en ny session (passHref). */
  start?: { typ: Begard; family?: string | null; format?: string | null }
  /** En befintlig session, läst på servern. */
  vy?: Sessionsvy | null
  /** Hela paketet (tests_above_base): styr M1:s betalvägg. */
  betalande: boolean
  /** Förhandsvisningen: starttillstånd och fryst tid. */
  initial?: PassFlodeInitial
  fastTid?: number | null
  /** Adressen byts inte i förhandsvisningen. */
  forhandsvisning?: boolean
}

const TIDSINTERVALL_MS = 250

function harAterkoppling(typ: Sessionsvy['typ']): boolean {
  return typ === 'pass' || typ === 'riktat'
}

/** Toppradens titel och undertitel för sessionen. */
function huvud(vy: Sessionsvy): { titel: string; undertitel: string } {
  const T = PASS_COPY.topp
  const heltal = vy.niva_fore != null ? nivaHeltal(vy.niva_fore) : null
  switch (vy.typ) {
    case 'pass':
      return {
        titel: familjNamn(vy.tema) ?? T.blandat,
        undertitel: vy.variant === 'grund' ? T.passGrundRad : T.passRad(heltal),
      }
    case 'riktat':
      return { titel: familjNamn(vy.family ?? vy.tema) ?? T.blandat, undertitel: T.riktatRad(heltal) }
    case 'matning':
      return { titel: T.matning, undertitel: vy.smakprov > 0 ? T.matningSmakprov(vy.smakprov) : T.matningRad }
    case 'ommatning':
      return { titel: T.ommatning, undertitel: T.ommatningRad }
    case 'general':
      return { titel: T.general, undertitel: T.generalRad(PROVFORMAT[vy.format as FormatNyckel]?.namn ?? null) }
  }
}

function betalvaggPlats(typ: Begard): 'dag2' | 'riktat' | 'provlage' | 'ommatning' {
  return typ === 'pass' ? 'dag2' : typ === 'riktat' ? 'riktat' : typ === 'general' ? 'provlage' : 'ommatning'
}

function Laddar({ text }: { text: string }) {
  return (
    <div aria-busy="true" aria-label={text} className="flex flex-col gap-3.5">
      <div className="rounded-2xl border border-kant bg-papper p-2.5 shadow-lyft">
        <div className="loading-thread aspect-square w-full rounded-lg bg-papper-2" />
      </div>
      <div className="h-[18px]" />
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-square rounded-xl border border-kant bg-papper" />
        ))}
      </div>
    </div>
  )
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

export default function PassFlode({
  api = fetchPassApi,
  start,
  vy: initialVy = null,
  betalande,
  initial,
  fastTid: fastTidProp = null,
  forhandsvisning = false,
}: PassFlodeProps) {
  // Förhandsvisningens frysta tid gäller bara den första frågan; sedan går klockan.
  const [fastTid, setFastTid] = useState<number | null>(fastTidProp)
  const router = useRouter()
  const [vy, setVy] = useState<Sessionsvy | null>(initialVy)
  const [idx, setIdx] = useState<number>(() => initial?.idx ?? initialVy?.aktuell ?? 0)
  const [fas, setFas] = useState<Fas>(() => {
    if (initial?.fas === 'resultat' && initial.resultat) return { typ: 'resultat', data: initial.resultat }
    if (initial?.fas === 'aterkoppling' && initial.aterkoppling)
      return { typ: 'aterkoppling', at: initial.aterkoppling, vald: initial.vald ?? null, klar: initial.klar ?? false }
    if (!initialVy) return { typ: 'startar' }
    if (initialVy.avslutad) return { typ: 'genomgang', vy: initialVy, lista: initialVy.fragor.map((_, i) => i), pos: 0, resultat: null }
    return { typ: 'fraga' }
  })

  /* --------------------------------- Tiden --------------------------------- */

  const startTid = useRef<number>(0)
  const [sekunder, setSekunder] = useState<number>(fastTid ?? 0)
  const [frusen, setFrusen] = useState<number | null>(initial?.aterkoppling ? initial.aterkoppling.tid_s : null)
  const tickar = fas.typ === 'fraga' || fas.typ === 'sparar'

  // Ny fråga: klockan börjar om. Fryst tid i förhandsvisningen.
  useEffect(() => {
    if (fas.typ !== 'fraga') return
    startTid.current = performance.now() - (fastTid ?? 0) * 1000
    setFrusen(null)
    setSekunder(fastTid ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, vy?.id])

  useEffect(() => {
    if (!tickar || fastTid != null) return
    const t = setInterval(() => setSekunder((performance.now() - startTid.current) / 1000), TIDSINTERVALL_MS)
    return () => clearInterval(t)
  }, [tickar, fastTid])

  const sekunderNu = useCallback(
    () => (fastTid != null ? fastTid : Math.max(0, Math.round((performance.now() - startTid.current) / 1000))),
    [fastTid]
  )

  /* -------------------------------- Starten -------------------------------- */

  const startad = useRef(false)
  const skapa = useCallback(async () => {
    if (!start) return
    setFas({ typ: 'startar' })
    const r = await api.skapa(start.typ, { family: start.family, format: start.format })
    if (!r.ok) {
      if (r.status === 402) capture('betalvagg_visad', { plats: betalvaggPlats(start.typ), dagar_kvar: null })
      setFas({ typ: 'startfel', status: r.status, fel: r.fel })
      return
    }
    const s = r.session
    setVy(s)
    setIdx(s.aktuell ?? 0)
    setFas(s.avslutad ? { typ: 'genomgang', vy: s, lista: s.fragor.map((_, i) => i), pos: 0, resultat: null } : { typ: 'fraga' })
    if (!forhandsvisning) {
      try {
        window.history.replaceState(null, '', sessionHref(s.id))
      } catch {
        // Adressen är en bekvämlighet; passet fungerar ändå.
      }
    }
    if (s.typ === 'matning' || s.typ === 'ommatning') {
      capture('nivamatning_startad', { ommatning: s.typ === 'ommatning', smakprov: s.smakprov })
    } else {
      capture('pass_startat', { typ: s.typ, variant: s.variant })
    }
  }, [api, start, forhandsvisning])

  useEffect(() => {
    if (startad.current || initialVy || !start) return
    startad.current = true
    void skapa()
  }, [skapa, initialVy, start])

  /* -------------------------------- Avslutet ------------------------------- */

  const avsluta = useCallback(
    async (aktuell: Sessionsvy, opt?: { tidenUte?: boolean }) => {
      setFas({ typ: 'avslutar', tidenUte: opt?.tidenUte })
      const r = await api.slutfor(aktuell.id)
      if (!r.ok) {
        if (r.status === 409) {
          // Redan avslutad (dubbelklick, annan flik): visa genomgången.
          const ny = await api.session(aktuell.id)
          if (ny) {
            setVy(ny)
            setFas({ typ: 'genomgang', vy: ny, lista: ny.fragor.map((_, i) => i), pos: 0, resultat: null })
            return
          }
        }
        setFas({ typ: 'avslutfel' })
        return
      }
      const [vyEfter, status] = await Promise.all([api.session(aktuell.id), api.status()])
      setFas({ typ: 'resultat', data: { avslut: r.avslut, vy: vyEfter ?? aktuell, status } })
    },
    [api]
  )

  // En session där alla frågor redan är besvarade men som inte avslutats
  // (fliken stängdes efter sista svaret): avsluta den direkt vid start.
  const avslutadVidStart = useRef(false)
  useEffect(() => {
    if (avslutadVidStart.current || !initialVy || initial) return
    avslutadVidStart.current = true
    if (!initialVy.avslutad && initialVy.aktuell == null && initialVy.besvarade.length > 0) void avsluta(initialVy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* --------------------------------- Svaret -------------------------------- */

  const svara = useCallback(
    async (vald: number | null, opt: { vetInte?: boolean; tidenUte?: boolean; tid?: number } = {}) => {
      if (!vy) return
      const q = vy.fragor[idx]
      if (!q) return
      const tid = opt.tid ?? sekunderNu()
      const vetInte = opt.vetInte === true
      const tidenUte = opt.tidenUte === true
      setFrusen(tid)
      setSekunder(tid)
      setFastTid(null)
      setFas({ typ: 'sparar', vald })
      if (vetInte) capture('vet_inte_tryckt', { fraga_index: idx })

      const r = await api.svara({ sessionId: vy.id, questionId: q.id, selectedIndex: vald, vetInte, tidenUte, timeSpent: tid })
      if (!r.ok) {
        if (r.status === 410) {
          void avsluta(vy, { tidenUte: true })
          return
        }
        if (r.status === 409) {
          // Redan besvarad eller avslutad: läs om sessionen och fortsätt där den står.
          const ny = await api.session(vy.id)
          if (ny) {
            setVy(ny)
            if (ny.avslutad) {
              setFas({ typ: 'genomgang', vy: ny, lista: ny.fragor.map((_, i) => i), pos: 0, resultat: null })
              return
            }
            const at = ny.aterkoppling?.[q.id]
            if (at && harAterkoppling(ny.typ)) {
              const b = ny.besvarade.find((x) => x.q_id === q.id)
              setFas({ typ: 'aterkoppling', at, vald: b?.valdVisat ?? null, klar: ny.aktuell == null })
              return
            }
            if (ny.aktuell == null) {
              void avsluta(ny)
              return
            }
            setIdx(ny.aktuell)
            setFas({ typ: 'fraga' })
            return
          }
        }
        setFas({ typ: 'svarfel', vald, vetInte, tidenUte, tid })
        return
      }

      const nyVy: Sessionsvy = {
        ...vy,
        besvarade: [
          ...vy.besvarade,
          { q_id: q.id, valdVisat: vetInte || tidenUte ? null : vald, vetInte, tidenUte, tid_s: tid },
        ],
        aterkoppling: r.aterkoppling ? { ...(vy.aterkoppling ?? {}), [q.id]: r.aterkoppling } : vy.aterkoppling,
        fragor: r.nasta && !vy.fragor.some((f) => f.id === r.nasta!.id) ? [...vy.fragor, r.nasta] : vy.fragor,
        aktuell: r.klar ? null : idx + 1,
      }
      setVy(nyVy)
      if (r.aterkoppling) {
        setFas({ typ: 'aterkoppling', at: r.aterkoppling, vald, klar: r.klar })
      } else if (r.klar) {
        void avsluta(nyVy)
      } else {
        setIdx(idx + 1)
        setFas({ typ: 'fraga' })
      }
    },
    [api, vy, idx, sekunderNu, avsluta]
  )

  // Generalrepetition med tid per uppgift: vidare när uppgiftens tid är ute.
  const perUppgift = vy?.typ === 'general' && PROVFORMAT[vy.format as FormatNyckel]?.tidsform === 'per_uppgift'
  useEffect(() => {
    if (!perUppgift || fas.typ !== 'fraga' || !vy || fastTid != null) return
    if (sekunder >= vy.budget_s) void svara(null, { tidenUte: true, tid: vy.budget_s })
  }, [perUppgift, fas.typ, sekunder, vy, svara, fastTid])

  const nasta = useCallback(() => {
    if (!vy || fas.typ !== 'aterkoppling') return
    if (fas.klar) {
      void avsluta(vy)
      return
    }
    setIdx((i) => i + 1)
    setFas({ typ: 'fraga' })
  }, [vy, fas, avsluta])

  const tillbaka = useCallback(() => router.push(TRANING_HREF), [router])

  /* ------------------------------ Genomgången ------------------------------ */

  const genomga = useCallback(
    (data: Resultatdata, startIndex?: number) => {
      const vyEfter = data.vy
      const r = passResultat(data.avslut, vyEfter, data.status)
      const missar = r.genomgang.missar
      const alla = vyEfter.fragor.map((_, i) => i)
      const lista = startIndex == null ? alla : missar.includes(startIndex) ? missar : alla
      const pos = startIndex == null ? 0 : Math.max(0, lista.indexOf(startIndex))
      setFas({ typ: 'genomgang', vy: vyEfter, lista, pos, resultat: data })
    },
    []
  )

  /* -------------------------------- Ritningen ------------------------------ */

  const hv = useMemo(() => (vy ? huvud(vy) : null), [vy])

  if (fas.typ === 'resultat') {
    const { avslut, vy: vyEfter, status } = fas.data
    if (avslut.typ === 'matning') {
      return <MatningResultatVy vm={matningResultat(avslut, status, betalande)} antal={avslut.antal} onTillbaka={tillbaka} />
    }
    if (avslut.typ === 'ommatning') {
      return <OmmatningResultatVy vm={ommatningResultat(avslut, status)} status={status} antal={avslut.antal} onTillbaka={tillbaka} />
    }
    return (
      <PassResultatVy
        vm={passResultat(avslut, vyEfter, status)}
        onGenomga={(i) => genomga(fas.data, i)}
        onTillbaka={tillbaka}
      />
    )
  }

  if (fas.typ === 'genomgang') {
    return (
      <GenomgangVy
        vy={fas.vy}
        lista={fas.lista}
        pos={fas.pos}
        onPos={(pos) => setFas({ ...fas, pos })}
        onTillbakaResultat={fas.resultat ? () => setFas({ typ: 'resultat', data: fas.resultat! }) : null}
        onTillbaka={tillbaka}
      />
    )
  }

  if (fas.typ === 'startar' || !vy || !hv) {
    if (fas.typ === 'startfel') {
      const t = start?.typ ?? 'pass'
      const F = PASS_COPY.fel
      let innehall: React.ReactNode
      if (fas.status === 402) {
        const B = PASS_COPY.betalvagg
        const vad = t === 'pass' ? B.pass : t === 'riktat' ? B.riktat : t === 'general' ? B.general : B.ommatning
        innehall = (
          <section className="rounded-2xl border border-koppar bg-papper p-4 shadow-[inset_0_0_0_1px_var(--koppar)]">
            <p className="text-ey text-koppar-ink">{paketNamn('all_month')}</p>
            <h2 className="mt-1 text-kort-t text-ink-1">{`${vad} ${paketNamn('all_month')}.`}</h2>
            <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{B.text}</p>
            <div className={KNAPPRAD}>
              <Link
                href={kopstegHref('all_month')}
                className={KNAPP_PRIMAR}
                onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: 'all_month', surface: 'pass', cta: 'primary' })}
              >
                {`Köp ${paketMedPris('all_month')}`}
              </Link>
              <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {PASS_COPY.knapp.tillbaka}
              </Link>
            </div>
          </section>
        )
      } else if (fas.status === 429) {
        innehall = (
          <Meddelande titel={F.kvot} text={F.kvotRad}>
            <div className={KNAPPRAD}>
              <Link href={TRANING_HREF} className={KNAPP_PRIMAR}>
                {PASS_COPY.knapp.tillbaka}
              </Link>
            </div>
          </Meddelande>
        )
      } else if (fas.status === 422) {
        innehall = (
          <Meddelande titel={F.familj} text={F.familjRad}>
            <div className={KNAPPRAD}>
              <Link href={passHref('pass')} className={KNAPP_PRIMAR}>
                {PASS_COPY.knapp.startaPass}
              </Link>
              <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {PASS_COPY.knapp.tillbaka}
              </Link>
            </div>
          </Meddelande>
        )
      } else {
        innehall = (
          <Meddelande titel={F.hamta} text={F.hamtaRad}>
            <div className={KNAPPRAD}>
              <button type="button" onClick={() => void skapa()} className={KNAPP_PRIMAR}>
                {PASS_COPY.knapp.forsokIgen}
              </button>
              <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {PASS_COPY.knapp.tillbaka}
              </Link>
            </div>
          </Meddelande>
        )
      }
      return (
        <PassShell titel={startTitel(t)} undertitel={PASS_COPY.topp.avsluta} fraga={null} antal={null} tid={null} onAvsluta={tillbaka}>
          {innehall}
        </PassShell>
      )
    }
    return (
      <PassShell titel={start ? startTitel(start.typ) : PASS_COPY.laddar.session} undertitel={PASS_COPY.laddar.session} fraga={null} antal={null} tid={null} onAvsluta={tillbaka}>
        <Laddar text={PASS_COPY.laddar.session} />
      </PassShell>
    )
  }

  const visatAntal = vy.typ === 'matning' ? Math.max(1, vy.antal - vy.smakprov) : vy.antal
  const q = vy.fragor[Math.min(idx, vy.fragor.length - 1)]
  const tidVisas = frusen ?? sekunder

  if (fas.typ === 'avslutar' || fas.typ === 'avslutfel') {
    return (
      <PassShell
        titel={hv.titel}
        undertitel={hv.undertitel}
        fraga={visatAntal}
        antal={visatAntal}
        tid={null}
        onAvsluta={tillbaka}
        fot={
          fas.typ === 'avslutfel' ? (
            <button type="button" onClick={() => void avsluta(vy)} className={KNAPP_PRIMAR}>
              {PASS_COPY.knapp.forsokIgen}
            </button>
          ) : undefined
        }
      >
        {fas.typ === 'avslutfel' ? (
          <Meddelande titel={PASS_COPY.fel.avslut} />
        ) : (
          <>
            {fas.tidenUte ? <Meddelande titel={PASS_COPY.fel.tidenUte} /> : null}
            <p className="text-center text-meta text-ink-3" role="status" aria-live="polite">
              {PASS_COPY.laddar.resultat}
            </p>
            <Laddar text={PASS_COPY.laddar.resultat} />
          </>
        )}
      </PassShell>
    )
  }

  const visaAterkoppling = fas.typ === 'aterkoppling'
  const at = visaAterkoppling ? fas.at : null
  const vald = fas.typ === 'sparar' || fas.typ === 'aterkoppling' || fas.typ === 'svarfel' ? fas.vald : null
  const last = fas.typ !== 'fraga'
  const iPass = harAterkoppling(vy.typ)

  let fot: React.ReactNode = undefined
  if (fas.typ === 'svarfel') {
    fot = (
      <button
        type="button"
        onClick={() => void svara(fas.vald, { vetInte: fas.vetInte, tidenUte: fas.tidenUte, tid: fas.tid })}
        className={KNAPP_PRIMAR}
      >
        {PASS_COPY.knapp.forsokIgen}
      </button>
    )
  } else if (visaAterkoppling) {
    fot = (
      <button type="button" onClick={nasta} className={KNAPP_PRIMAR}>
        {fas.klar ? PASS_COPY.knapp.visaResultat : PASS_COPY.knapp.nasta}
      </button>
    )
  } else if (iPass) {
    fot = (
      <button
        type="button"
        disabled={fas.typ !== 'fraga'}
        onClick={() => void svara(null, { vetInte: true })}
        className={`${LANK} inline-flex min-h-9 items-center justify-center disabled:opacity-50`}
      >
        {PASS_COPY.vetInte}
      </button>
    )
  }

  const regelRad = at
    ? at.vetInte
      ? PASS_COPY.regel.vetInte(at.tid_s)
      : at.correct
        ? PASS_COPY.regel.ratt(at.tid_s)
        : PASS_COPY.regel.fel(at.tid_s)
    : ''

  return (
    <PassShell
      titel={hv.titel}
      undertitel={hv.undertitel}
      fraga={Math.min(idx + 1, visatAntal)}
      antal={visatAntal}
      tid={{ sekunder: tidVisas, budget: vy.budget_s }}
      onAvsluta={tillbaka}
      fot={fot}
      nyckel={q?.id}
      banner={
        fas.typ === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
            {PASS_COPY.fel.svar}
          </p>
        ) : null
      }
    >
      {q ? (
        <PassFraga
          key={q.id}
          fraga={q}
          vald={vald}
          ratt={at ? at.rattVisat : null}
          last={last}
          onValj={(i) => void svara(i)}
        />
      ) : null}
      {at ? <Regelpanel rad={regelRad} regel={at.regel} misstag={at.misstag} visaVidSvar /> : null}
      {fas.typ === 'sparar' ? (
        <p className="sr-only" role="status" aria-live="polite">
          {PASS_COPY.knapp.sparar}
        </p>
      ) : null}
    </PassShell>
  )
}

function startTitel(typ: Begard): string {
  const T = PASS_COPY.topp
  return typ === 'matning' ? T.matning : typ === 'general' ? T.general : typ === 'riktat' ? T.riktatRad(null) : T.passRad(null)
}
