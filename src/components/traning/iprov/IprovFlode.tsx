'use client'

/**
 * Övningsprovet för I-prov 2025 i sessionsramen (plan-testflode-2026-11-20
 * avsnitt 2 och 4.1, etapp 4). Samma rutter och kroppar som förut, låsta i
 * kontrakt-steg2.test.ts:
 *
 *   start    POST /api/traning/iprov/session {halvt}
 *   deltest  POST /api/traning/iprov/del {sessionId, nr, handling}
 *   svar     POST /api/traning/iprov/svar {sessionId, nyckel, visat, tid}
 *
 * Startskärmen   startskärmens mall: halva eller hela provet, tre regler,
 *                deltesten i ordning under kortet. Utan Premium står
 *                betalväggen i kortets plats (plats provlage).
 * Mellanskärmen  per deltest, startskärmens korta mall: "Deltest 2 av 6",
 *                deltestets namn, antal och tid, "Starta deltestet". Klockan
 *                startar när hon trycker.
 * Deltestet      ramen: räknaren "3 / 6" öppnar arket inom deltestet, ringen
 *                räknar ned med hård gräns (deltestet avslutas vid noll), tryck
 *                markerar och Nästa bekräftar, ‹ och arket går tillbaka inom
 *                deltestet. Sist "Avsluta deltestet" med dialog, i sista
 *                deltestet "Lämna in" med dialog.
 * Resultatet     ramens resultatskärm: rätt per deltest, tiden per deltest mot
 *                maxtiden och genomgången deltest för deltest i ramen.
 *
 * Servern äger klockan och spärren: ett deltest startas och avslutas av
 * servern, och ett avslutat deltest öppnas aldrig igen. Svaren skickas i tur
 * och ordning (servern skriver hela provets meta per svar), med omförsök.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { PremiumKnappText, PremiumPrisradText, useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import { capture } from '@/lib/analytics/events'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { TRANING_HREF, TRANING_RUTT, steg2PassHref } from '@/lib/traning/rutter'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { IPROV_COPY as C, iprovDelar, iprovSumma, type IprovDelVy, type IprovVy } from '@/lib/tester/steg2/iprov'
import SessionsRam from '@/components/session/SessionsRam'
import Startskarm from '@/components/session/Startskarm'
import Resultatskarm from '@/components/session/Resultatskarm'
import RamDialog from '@/components/session/RamDialog'
import Klocka from '@/components/session/Klocka'
import Genomgang, { type GenomgangKalla, type GenomgangPost } from '@/components/session/lagen/Genomgang'
import type { ListPost } from '@/components/session/Uppgiftslistan'
import { Sparfelsrad, useLamnadSida } from '@/components/session/lagen/gemensamt'
import { SESSION, antalOrd } from '@/components/session/copy'
import { sessionHandelser, type SessionHandelseBas } from '@/components/session/handelser'
import type { ArkCell } from '@/components/session/Uppgiftsarket'
import type { TypRitare } from '@/components/session/typ'
import { steg2Facit, steg2Ritare, Steg2Miniatyrer, tillSteg2U, type Steg2U } from '@/components/session/typer/Steg2'

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

/** POST-kropparna, ordagrant som förut (kontrakt-steg2.test.ts). */
export const IPROV_KROPP = {
  start: (halvt: boolean) => ({ halvt }),
  del: (sessionId: string, nr: number, handling: 'starta' | 'avsluta') => ({ sessionId, nr, handling }),
  svar: (sessionId: string, nyckel: string, visat: number, tid: number) => ({ sessionId, nyckel, visat, tid }),
} as const

export const iprovApi = {
  starta: (halvt: boolean) => post<{ session: IprovVy }>('/api/traning/iprov/session', IPROV_KROPP.start(halvt)),
  del: (sessionId: string, nr: number, handling: 'starta' | 'avsluta') => post<{ session: IprovVy }>('/api/traning/iprov/del', IPROV_KROPP.del(sessionId, nr, handling)),
  /** Sant när servern tog emot svaret; 409 (tiden ute, deltestet avslutat) räknas som taget, det går inte att spara om. */
  async svara(sessionId: string, nyckel: string, visat: number, tid: number): Promise<boolean> {
    const r = await post('/api/traning/iprov/svar', IPROV_KROPP.svar(sessionId, nyckel, visat, tid))
    return r.ok || r.status === 409
  },
}

/** Deltestets ritare: ordtesten i Mellan (560), figurerna och talen i Smal (avsnitt 3). */
function ritareFor(d: Pick<IprovDelVy, 'kind'>): TypRitare<Steg2U> {
  const r = steg2Ritare(d.kind)
  return d.kind === 'ordforrad' ? { ...r, form: 'mellan' } : r
}

const bas = (halvt: boolean): SessionHandelseBas => ({ test_kind: 'iprov', lage: 'iprov', niva: null, format: halvt ? 'halvt' : 'helt' })

/* ------------------------------------------------------------ Startskärmen */

/**
 * Väggen på I-provets startskärm (plats provlage, som övningsprovets). Etapp 7:
 * mäts som övriga testväggar (betalvagg_visad och paywall_cta_clicked med
 * test_kind iprov och lage iprov; före etapp 7 mättes den inte alls) och
 * delar sig på mobil så att köpknappen står i foten.
 */
function Betalvagg({ tillbakaHref, del }: { tillbakaHref: string; del?: 'kort' | 'fot' }) {
  const kampanj = useKampanjPris()
  const visad = useRef(false)
  useEffect(() => {
    if (visad.current || del === 'fot') return
    visad.current = true
    capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: null, test_kind: 'iprov', lage: 'iprov' })
  }, [del])
  const knapp = (klass: string) => (
    <Link
      href={kopstegHref(SALD_PLAN, 'provlage')}
      className={`${KNAPP_PRIMAR} ${klass}`}
      onClick={() =>
        capture('paywall_cta_clicked', {
          variant: 'testniva',
          plan: SALD_PLAN,
          surface: 'iprov',
          cta: 'primary',
          plats: 'provlage',
          kampanj: kampanj?.nyckel ?? null,
          test_kind: 'iprov',
          lage: 'iprov',
        })
      }
    >
      <PremiumKnappText />
    </Link>
  )
  if (del === 'fot') return knapp('')
  return (
    <section aria-label="Ingår i Premium" className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-iprov-last>
      <p className="text-ey uppercase text-koppar-ink">Ingår i Premium</p>
      <p className="mt-1.5 text-sm leading-5 text-ink-2">Övningsprovet för I-provet, deltest för deltest mot klockan. Premium täcker hela vägen.</p>
      <p className="mt-1 text-sm font-medium leading-5 text-ink-1">
        <PremiumPrisradText />
      </p>
      <div className={KNAPPRAD}>
        {knapp(del === 'kort' ? 'hidden lg:inline-flex' : '')}
        <Link href={tillbakaHref} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
          {SESSION.resultat.tillbaka}
        </Link>
      </div>
    </section>
  )
}

Betalvagg.fotDel = true as const

function Omfang({ halvt, onAndra }: { halvt: boolean; onAndra: (h: boolean) => void }) {
  const val = (h: boolean) => {
    const s = iprovSumma(h)
    const vald = halvt === h
    return (
      <button
        type="button"
        role="radio"
        aria-checked={vald}
        onClick={() => onAndra(h)}
        className={`flex min-h-[52px] flex-1 flex-col items-center justify-center rounded-[10px] px-2 py-1.5 text-center transition-colors ${
          vald ? 'bg-papper text-ink-1 shadow-[inset_0_0_0_2px_var(--ink-1)]' : 'text-ink-2 hover:text-ink-1'
        }`}
        data-iprov-val={h ? 'halvt' : 'helt'}
      >
        <b className="text-[15px] font-semibold leading-5">{h ? C.halvt : C.helt}</b>
        <span className="text-[12px] leading-4 text-ink-3">{C.valRad(s.antal, s.minuter)}</span>
      </button>
    )
  }
  return (
    <div role="radiogroup" aria-label="Halva eller hela provet" className="flex gap-1 rounded-xl border border-kant bg-papper-2 p-1">
      {val(true)}
      {val(false)}
    </div>
  )
}

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
  const s = iprovSumma(halvt)

  const starta = async () => {
    if (pagaende) {
      router.push(`/dashboard/tester/iprov/${pagaende}`)
      return
    }
    setStartar(true)
    setFel(false)
    const r = await iprovApi.starta(halvt)
    if (r.ok) {
      router.push(`/dashboard/tester/iprov/${r.data.session.id}`)
      return
    }
    setFel(true)
    setStartar(false)
  }

  return (
    <Startskarm
      bas={bas(halvt)}
      tillbakaHref={tillbakaHref}
      eyebrow={dagarKvar != null && dagarKvar > 0 ? `Övningsprov, ${dagarKvar === 1 ? 'en dag' : `${dagarKvar} dagar`} kvar` : 'Övningsprov'}
      rubrik="I-provet"
      formatrad={`${C.format}.`}
      scen="iprov"
      rita={!pagaende && !last}
      regler={[
        { titel: `${s.antal} uppgifter på ${s.minuter} minuter.`, text: halvt ? 'Halva provet: sex uppgifter i varje deltest.' : 'Hela provet: tolv uppgifter i varje deltest.' },
        { titel: 'Deltesten i ordning, ingen väg tillbaka.', text: 'Inom ett deltest kan du gå tillbaka och ändra. Klockan går per deltest.' },
        { titel: 'Sex deltester, ett i taget.', text: 'Avbryter du sparas inget resultat. Ett deltest lämnas in när tiden är ute.' },
      ]}
      sparrad={last ? 'premium' : 'none'}
      fortsattTillganglig={Boolean(pagaende)}
      sparr={last ? <Betalvagg tillbakaHref={tillbakaHref} /> : null}
      knapp={{ text: pagaende ? SESSION.start.fortsatt.iprov : C.starta, onClick: () => void starta(), laddar: startar }}
      kortRad={
        <div className="flex flex-col gap-2.5">
          {pagaende ? null : <Omfang halvt={halvt} onAndra={setHalvt} />}
          {fel ? (
            <span role="alert" className="text-ink-1">
              Provet gick inte att starta. Försök igen.
            </span>
          ) : pagaende ? (
            'Du har ett påbörjat övningsprov.'
          ) : null}
        </div>
      }
      fotnot={`${C.version} ${C.formatRad}`}
      efter={
        <ol className="mt-4 list-none overflow-hidden rounded-xl border border-kant bg-papper p-0" aria-label="Deltesten i ordning" data-iprov-delar>
          {delar.map((d, i) => (
            <li key={d.nr} className={`flex min-h-11 items-center gap-3 px-3.5 py-2 ${i ? 'border-t border-kant' : ''}`}>
              <span className="w-4 text-[12px] tabular-nums text-ink-3">{d.nr}</span>
              <b className="min-w-0 flex-1 text-sm font-semibold leading-[19px] text-ink-1">{d.namn}</b>
              <span className="text-[13px] tabular-nums text-ink-3">{C.delRad(d.antal, d.minuter)}</span>
            </li>
          ))}
        </ol>
      }
    />
  )
}

/* ------------------------------------------------------- Svaren i tur och ordning */

const OMFORSOK_MS = [0, 500, 1500]
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Kön för svaren: ett i taget, så att servern aldrig skriver över ett nyare
 * (den skriver provets hela meta per svar). Varje svar försöks tre gånger;
 * gick det inte räknas det som osparat och "Försök igen" skickar det igen.
 */
function useSvarsko(sessionId: string) {
  const ko = useRef<Promise<unknown>>(Promise.resolve())
  const osparade = useRef<Map<string, { visat: number; tid: number }>>(new Map())
  const [antal, setAntal] = useState(0)
  const skicka = useCallback(
    (nyckel: string, visat: number, tid: number) => {
      osparade.current.delete(nyckel)
      setAntal(osparade.current.size)
      ko.current = ko.current.then(async () => {
        for (const ms of OMFORSOK_MS) {
          if (ms) await vanta(ms)
          if (await iprovApi.svara(sessionId, nyckel, visat, tid)) return
        }
        osparade.current.set(nyckel, { visat, tid })
        setAntal(osparade.current.size)
      })
    },
    [sessionId]
  )
  const forsokIgen = useCallback(() => {
    const lista = Array.from(osparade.current.entries())
    for (const [k, v] of lista) skicka(k, v.visat, v.tid)
    return ko.current
  }, [skicka])
  /** Väntar in kön (före deltestets avslut). */
  const tom = useCallback(async () => {
    await ko.current
    if (osparade.current.size) await forsokIgen()
    return osparade.current.size === 0
  }, [forsokIgen])
  return { skicka, forsokIgen, tom, osparade: antal }
}

/* ------------------------------------------------------------------- Flödet */

type Fas = { typ: 'prov' } | { typ: 'resultat' } | { typ: 'genomgang'; del: number; pos: number; kalla?: GenomgangKalla }

export default function IprovFlode({ vy: start }: { vy: IprovVy }) {
  const router = useRouter()
  const [vy, setVy] = useState<IprovVy>(start)
  const [fas, setFas] = useState<Fas>(start.avslutad ? { typ: 'resultat' } : { typ: 'prov' })
  const [svar, setSvar] = useState<Record<string, number>>(() => Object.assign({}, ...start.delar.map((d) => d.svar)))
  const forstaIdx = (d: IprovDelVy | null) => (d ? Math.max(0, d.uppgifter.findIndex((u) => d.svar[u.nyckel] === undefined)) : 0)
  const del0 = start.delar.find((d) => !d.avslutad) ?? null
  const [idx, setIdx] = useState(() => forstaIdx(del0))
  const [markerad, setMarkerad] = useState<number | null>(() => {
    const u = del0?.uppgifter[forstaIdx(del0)]
    return u ? del0!.svar[u.nyckel] ?? null : null
  })
  const [besokta, setBesokta] = useState<Set<number>>(() => new Set([0, forstaIdx(del0)]))
  const [avslutaOppen, setAvslutaOppen] = useState(false)
  const [fragarAvbryt, setFragarAvbryt] = useState(false)
  const [upptagen, setUpptagen] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  const [nu, setNu] = useState(() => Date.now())
  const ankom = useRef(Date.now())
  const via = useRef<'tap' | 'keyboard'>('tap')
  const sessionStart = useRef(Date.now())
  const ko = useSvarsko(vy.id)
  const B = bas(vy.halvt)

  const del = vy.delar.find((d) => !d.avslutad) ?? null
  const antalDelar = vy.delar.length
  const delIndex = del ? vy.delar.findIndex((d) => d.nr === del.nr) : -1
  const stang = useCallback(() => router.push(TRANING_HREF), [router])

  useEffect(() => {
    if (!del?.startad || vy.avslutad) return
    const t = setInterval(() => setNu(Date.now()), 500)
    return () => clearInterval(t)
  }, [del?.startad, vy.avslutad])

  const kvar = del?.startad ? del.max_s - (nu - new Date(del.startad).getTime()) / 1000 : del?.max_s ?? 0
  const besvaradeTotalt = Object.keys(svar).length

  // test_session_started när första uppgiften visas, en gång per visning.
  const startadSkjuten = useRef(false)
  useEffect(() => {
    if (startadSkjuten.current || !del?.startad || vy.avslutad) return
    startadSkjuten.current = true
    const total = vy.delar.reduce((s, d) => s + d.max_s, 0)
    const antal = iprovSumma(vy.halvt).antal
    sessionHandelser.startad(B, { session_id: vy.id, antal, tid_budget_s: total, resumed: delIndex > 0 || besvaradeTotalt > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [del?.startad, vy.avslutad])

  const aktiv = !vy.avslutad && fas.typ === 'prov'
  const avbrottVidLamning = useLamnadSida(aktiv, () =>
    sessionHandelser.avbruten(B, { session_id: vy.id, index: idx, besvarade: besvaradeTotalt, elapsed_ms: Date.now() - sessionStart.current })
  )

  /** Bekräftar den markerade på uppgiften hon lämnar, om den är ny. */
  const bekrafta = useCallback(() => {
    if (!del) return svar
    const u = del.uppgifter[idx]
    const tid = Math.max(0, Math.round((Date.now() - ankom.current) / 1000))
    ankom.current = Date.now()
    if (!u || markerad == null || markerad === svar[u.nyckel]) return svar
    const nya = { ...svar, [u.nyckel]: markerad }
    setSvar(nya)
    ko.skicka(u.nyckel, markerad, tid)
    sessionHandelser.besvarad(B, { session_id: vy.id, index: idx, elapsed_ms: tid * 1000, via: via.current, vet_inte: false })
    return nya
  }, [del, idx, markerad, svar, ko, B, vy.id])

  const ga = (till: number, nya: Record<string, number> = svar) => {
    if (!del || till < 0 || till >= del.uppgifter.length) return
    setIdx(till)
    setMarkerad(nya[del.uppgifter[till].nyckel] ?? null)
    setBesokta((b) => new Set(b).add(till))
    ankom.current = Date.now()
    via.current = 'tap'
  }

  const delHandling = useCallback(
    async (handling: 'starta' | 'avsluta', nr: number) => {
      setUpptagen(true)
      setFel(null)
      if (handling === 'avsluta') await ko.tom()
      const r = await iprovApi.del(vy.id, nr, handling)
      setUpptagen(false)
      setAvslutaOppen(false)
      if (!r.ok) {
        setFel(SESSION.sparfel.lamnaIn)
        return
      }
      const ny = r.data.session
      setVy(ny)
      const nasta = ny.delar.find((d) => !d.avslutad) ?? null
      const i = forstaIdx(nasta)
      setIdx(i)
      setMarkerad(nasta?.uppgifter[i] ? nasta.svar[nasta.uppgifter[i].nyckel] ?? null : null)
      setBesokta(new Set([0, i]))
      ankom.current = Date.now()
      if (ny.avslutad) {
        avbrottVidLamning()
        sessionHandelser.klar(B, {
          session_id: ny.id,
          besvarade: Object.keys(svar).length,
          elapsed_ms: Date.now() - sessionStart.current,
          over_tid: Boolean(ny.resultat?.delar.some((d) => d.tidenSlut)),
        })
        setFas({ typ: 'resultat' })
      }
    },
    [vy.id, ko, avbrottVidLamning, B, svar]
  )

  // Tiden ute: deltestet avslutas av sig självt, med det markerade svaret.
  const avslutasAvTiden = useRef<number | null>(null)
  useEffect(() => {
    if (!del?.startad || kvar > 0 || avslutasAvTiden.current === del.nr) return
    avslutasAvTiden.current = del.nr
    bekrafta()
    void delHandling('avsluta', del.nr)
  }, [kvar, del, delHandling, bekrafta])

  /* ---------------- Resultat och genomgång */
  if (vy.avslutad && vy.resultat) {
    if (fas.typ === 'genomgang' && vy.genomgang) {
      const d = vy.delar[fas.del]
      const lista = (vy.genomgang[fas.del] ?? []) as ({ nyckel: string } & Record<string, unknown>)[]
      const poster: GenomgangPost<Steg2U>[] = lista.map((g) => {
        const valt = d.svar[g.nyckel] ?? null
        return { u: tillSteg2U(d.kind, g, g.nyckel), valt, facit: steg2Facit(d.kind, g, valt) }
      })
      const nasta = fas.del < vy.delar.length - 1 ? fas.del + 1 : null
      return (
        <Genomgang
          key={`g-${fas.del}`}
          ritare={ritareFor(d)}
          lage="iprov"
          titel="I-provet"
          undertitel={`Genomgång, ${d.namn.toLowerCase()}`}
          poster={poster}
          start={fas.pos}
          sessionId={vy.id}
          onStang={() => setFas({ typ: 'resultat' })}
          kalla={fas.kalla ?? 'ga_igenom'}
          sista={nasta != null ? { text: 'Nästa deltest', onClick: () => setFas({ typ: 'genomgang', del: nasta, pos: 0, kalla: fas.kalla }) } : null}
        />
      )
    }
    return <IprovResultat vy={vy} onStang={stang} gaIgenom={(delNr, pos, kalla = 'ga_igenom') => setFas({ typ: 'genomgang', del: delNr, pos, kalla })} />
  }

  if (!del) {
    return (
      <SessionsRam lage="iprov" titel="I-provet" undertitel={LAGES_UNDERTITEL(vy)} form="smal" raknare={null} framsteg={1} bekraftaAvbryt={false} onAvbryt={stang} fot={null}>
        <p className="text-center text-meta text-ink-3" role="status">
          {SESSION.laddar.resultat}
        </p>
      </SessionsRam>
    )
  }

  const avbryt = () => {
    avbrottVidLamning()
    sessionHandelser.avbruten(B, { session_id: vy.id, index: idx, besvarade: besvaradeTotalt, elapsed_ms: Date.now() - sessionStart.current })
    stang()
  }

  /* ---------------- Mellanskärmen */
  if (!del.startad) {
    const def = iprovDelar(vy.halvt).find((x) => x.nr === del.nr)!
    const klara = vy.delar.filter((d) => d.avslutad).map((d) => d.namn.toLowerCase())
    return (
      <>
        <Startskarm
          key={`mellan-${del.nr}`}
          bas={B}
          onAvbryt={() => setFragarAvbryt(true)}
          eyebrow={C.mellanEyebrow(delIndex + 1, antalDelar)}
          rubrik={del.namn}
          formatrad={C.mellanAntal(def.antal, Math.round(del.max_s / 60))}
          scen={del.kind}
          rita={delIndex === 0}
          regler={[
            { titel: 'Klockan startar när du trycker.', text: 'Ringen räknar ned. Deltestet lämnas in när tiden är ute.' },
            { titel: 'Inom deltestet kan du gå tillbaka och ändra.', text: 'Räknaren uppe till höger visar alla uppgifter i deltestet.' },
            {
              titel: 'Ett avslutat deltest går inte att öppna igen.',
              text: klara.length ? `${antalOrd(klara.length, true)} av ${antalOrd(antalDelar)} deltester är klara.` : null,
            },
          ]}
          sparrad="none"
          fortsattTillganglig={false}
          knapp={{ text: C.startaDel, onClick: () => void delHandling('starta', del.nr), laddar: upptagen }}
          kortRad={
            fel ? (
              <span role="alert" className="text-ink-1">
                {fel}
              </span>
            ) : (
              def.beskrivning
            )
          }
        />
        <RamDialog
          open={fragarAvbryt}
          titel={SESSION.avbryt.titel('iprov')}
          text={SESSION.avbryt.text('iprov')}
          primar={SESSION.avbryt.fortsatt}
          lank={SESSION.avbryt.avbryt}
          onPrimar={() => setFragarAvbryt(false)}
          onLank={() => {
            setFragarAvbryt(false)
            avbryt()
          }}
          onStang={() => setFragarAvbryt(false)}
          data="avbryt"
        />
      </>
    )
  }

  /* ---------------- Deltestet */
  const ritare = ritareFor(del)
  const uppgifter = del.uppgifter.map((x) => tillSteg2U(del.kind, x, x.nyckel))
  const antal = uppgifter.length
  const u = uppgifter[Math.min(idx, antal - 1)]
  const sistaUppgift = idx >= antal - 1
  const sistaDelen = delIndex === antalDelar - 1
  const obesvarade = uppgifter.filter((x) => svar[x.nyckel] === undefined && !(x.nyckel === u?.nyckel && markerad != null)).length
  const celler: ArkCell[] = uppgifter.map((x, i) =>
    i === idx ? 'aktuell' : svar[x.nyckel] !== undefined ? 'besvarad' : besokta.has(i) && i < Math.max(...besokta) ? 'hoppad' : 'kvar'
  )
  const Uppgift = ritare.Uppgift
  if (!u) return null

  return (
    <SessionsRam
      lage="iprov"
      titel="I-provet"
      undertitel={`Deltest ${delIndex + 1} av ${antalDelar}, ${del.namn.toLowerCase()}`}
      form={ritare.form}
      scen={ritare.kind}
      raknare={{ nr: idx + 1, antal }}
      framsteg={(idx + 1) / antal}
      klocka={<Klocka lage="grans" kvar={kvar} total={del.max_s} />}
      nyckel={u.nyckel}
      bekraftaAvbryt={!upptagen}
      onAvbryt={avbryt}
      lamnaIn={{
        open: avslutaOppen,
        obesvarade,
        onBekrafta: () => delHandling('avsluta', del.nr),
        onStang: () => setAvslutaOppen(false),
        ...(sistaDelen
          ? {}
          : { titel: C.avslutaDelFraga, text: `${SESSION.lamnaIn.text(obesvarade)} Du kan inte gå tillbaka till deltestet efteråt.`, bekrafta: C.avslutaDel }),
      }}
      ark={{
        celler,
        onValj: (i) => {
          const nya = bekrafta()
          ga(i, nya)
        },
      }}
      tangent={upptagen ? null : { antal: ritare.antalAlternativ(u), onValj: (i) => ((via.current = 'keyboard'), setMarkerad(i)) }}
      rad={
        fel ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {fel}
          </p>
        ) : ko.osparade > 0 ? (
          <Sparfelsrad antal={ko.osparade} onForsok={() => void ko.forsokIgen()} />
        ) : null
      }
      fot={{
        vanster: {
          typ: 'tillbaka',
          disabled: idx === 0 || upptagen,
          onClick: () => {
            const nya = bekrafta()
            ga(idx - 1, nya)
          },
        },
        primar: sistaUppgift
          ? {
              text: sistaDelen ? SESSION.knapp.lamnaIn : C.avslutaDel,
              laddar: upptagen,
              data: sistaDelen ? 'lamna-in' : 'avsluta-deltestet',
              onClick: () => {
                const nya = bekrafta()
                const ob = uppgifter.filter((x) => nya[x.nyckel] === undefined).length
                if (sistaDelen && ob > 0) sessionHandelser.lamnaInSparrad(B, { session_id: vy.id, obesvarade: ob })
                setAvslutaOppen(true)
              },
            }
          : {
              text: SESSION.knapp.nasta,
              data: 'nasta',
              onClick: () => {
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
        last={upptagen}
        onValj={(i) => {
          via.current = 'tap'
          setMarkerad(i)
        }}
      />
    </SessionsRam>
  )
}

function LAGES_UNDERTITEL(vy: IprovVy): string {
  return vy.halvt ? 'Övningsprov, halva provet' : 'Övningsprov, hela provet'
}

/* ------------------------------------------------------------------ Resultatet */

function IprovResultat({ vy, onStang, gaIgenom }: { vy: IprovVy; onStang: () => void; gaIgenom: (del: number, pos: number, kalla?: GenomgangKalla) => void }) {
  const r = vy.resultat!
  const tid = r.delar.reduce((s, d) => s + d.tid_s, 0)
  const max = r.delar.reduce((s, d) => s + d.max_s, 0)
  const slut = r.delar.filter((d) => d.tidenSlut).length
  // Missarna i provets ordning, med deltest och plats för "Gå igenom".
  const missar: { del: number; pos: number; u: Steg2U }[] = []
  vy.delar.forEach((d, di) => {
    const lista = (vy.genomgang?.[di] ?? []) as ({ nyckel: string; rattVisat: number } & Record<string, unknown>)[]
    lista.forEach((g, pos) => {
      if (d.svar[g.nyckel] !== g.rattVisat) missar.push({ del: di, pos, u: tillSteg2U(d.kind, g, g.nyckel) })
    })
  })
  // Uppgiftslistan (omgång 2): alla deltestens uppgifter i provets ordning, deltesten som mellanrubriker.
  const lista: ListPost<Steg2U>[] = []
  const plats: { del: number; pos: number }[] = []
  const grupper: { fran: number; rubrik: string }[] = []
  vy.delar.forEach((d, di) => {
    const g = (vy.genomgang?.[di] ?? []) as ({ nyckel: string } & Record<string, unknown>)[]
    if (g.length) grupper.push({ fran: lista.length, rubrik: d.namn })
    g.forEach((x, pos) => {
      const valt = d.svar[x.nyckel] ?? null
      lista.push({ u: tillSteg2U(d.kind, x, x.nyckel), valt, facit: steg2Facit(d.kind, x, valt), ritare: ritareFor(d) })
      plats.push({ del: di, pos })
    })
  })
  const sorterade = [...r.delar].sort((a, b) => a.ratt / Math.max(1, a.antal) - b.ratt / Math.max(1, b.antal))
  const svagast = sorterade.find((d) => d.ratt < d.antal) ?? null
  const riktat = (nr: number) => {
    const def = iprovDelar(vy.halvt).find((x) => x.nr === nr)!
    if (def.kind === 'spatial') return steg2PassHref('spatial', def.form === 'C' ? 'C' : 'B')
    if (def.kind === 'talserie') return steg2PassHref('talserie')
    return steg2PassHref('ordforrad', def.form)
  }
  return (
    <Resultatskarm
      lage="iprov"
      titel="I-provet"
      undertitel={LAGES_UNDERTITEL(vy)}
      datum={kortDatum(dagSthlm(vy.skapad))}
      onStang={onStang}
      ring={{ andel: r.antal ? r.ratt / r.antal : 0, aria: SESSION.resultat.ringAria(r.ratt, r.antal) }}
      huvudtal={SESSION.resultat.rattAv(r.ratt, r.antal)}
      tal={[
        { varde: mmss(tid), etikett: `av ${Math.round(max / 60)} min` },
        { varde: `${slut} av ${r.delar.length}`, etikett: 'deltester där tiden tog slut', koppar: slut > 0 },
      ]}
      mening={C.stanine(vy.variant)}
      genomgang={{
        titel: SESSION.resultat.genomgangTitel(missar.length),
        text: 'Rätt svar och förklaringen vid varje uppgift, deltest för deltest.',
        miniatyrer: <Steg2Miniatyrer poster={missar.map((m) => m.u)} />,
        lista: lista.length
          ? {
              ritare: ritareFor(vy.delar[0]),
              lage: 'iprov',
              poster: lista,
              grupper,
              sessionId: vy.id,
              onOppna: (i: number) => gaIgenom(plats[i]?.del ?? 0, plats[i]?.pos ?? 0, 'rad'),
            }
          : null,
        onGaIgenom: () => gaIgenom(missar[0]?.del ?? 0, missar[0]?.pos ?? 0),
        onVisaAlla: missar.length ? () => gaIgenom(0, 0) : null,
      }}
      tappade={{
        titel: 'Rätt per deltest',
        rader: sorterade.map((d) => ({ namn: d.namn, meta: C.delUtfall(d.ratt, d.antal, d.tidenSlut), andel: d.antal ? d.ratt / d.antal : 0 })),
      }}
      tempo={{
        titel: C.tidRubrik,
        text: C.tidFot,
        innehall: (
          <ul className="mt-3 flex list-none flex-col gap-2.5 p-0" data-iprov-tempo>
            {r.delar.map((d) => (
              <li key={d.nr} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                <span className="text-sm leading-5 text-ink-1">{d.kort}</span>
                <span className="text-[13px] tabular-nums text-ink-3">{mmss(d.tid_s)}</span>
                <span className="relative col-span-2 block h-1.5 rounded-full bg-papper-2" role="img" aria-label={`${d.namn}: ${mmss(d.tid_s)} av ${mmss(d.max_s)}`}>
                  <i className={`absolute inset-y-0 left-0 block rounded-full ${d.tidenSlut ? 'bg-koppar' : 'bg-ink-2'}`} style={{ width: `${Math.min(100, (d.tid_s / Math.max(1, d.max_s)) * 92)}%` }} />
                  <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: 'calc(92% - 1px)' }} />
                </span>
              </li>
            ))}
          </ul>
        ),
      }}
      nastaSteg={{
        titel: 'Plan inför provet',
        text: svagast ? `Svagast var ${svagast.namn.toLowerCase()}. ${C.riktat}.` : 'Alla deltester satt. Gör hela provet nästa gång.',
        extra: svagast ? (
          <p className="mt-1.5 text-sm leading-5">
            <Link href={riktat(svagast.nr)} className={`${LANK} inline-flex min-h-11 items-center`} data-iprov-riktat>
              {`Träna ${svagast.namn.toLowerCase()}`}
            </Link>
          </p>
        ) : null,
        knapp: { text: 'Öppna planen', href: TRANING_RUTT.installningar, data: 'plan' },
      }}
      tillbakaHref={TRANING_RUTT.alla}
    />
  )
}

export function useIprovDagar(provdatum: string | null): number | null {
  return useMemo(() => (provdatum ? Math.round((new Date(provdatum).getTime() - Date.now()) / 86400000) : null), [provdatum])
}

