/**
 * Talserier, spatial förmåga och ordförråd som lösta uppgifter i artiklarna
 * (SEO-planen för de nya testerna 2026-11-10, U1, N1 till N3). Samma ritare
 * och samma uttryck som testerna (src/lib/spatialV1/ritare.tsx, visaTal), men
 * ritat på servern utan knappar och utan rubriker, så att artikelns
 * rubrikträd och JavaScript inte påverkas.
 *
 * Uppgifterna står i src/lib/artikelfigurer/{talserier,spatial,ordforrad}.json.
 * De är artiklarnas egna och finns inte i någon bank; facit i artikeln får
 * aldrig vara facit i provet. Talserier och spatial byggs av
 * scripts/gen-artikel-steg2.mjs med testernas generatorer och spärrar, och
 * allt kontrolleras av scripts/artikel-steg2-check.mjs.
 *
 *   <TalserieUppgift id="ts-art-01" />    raden med luckor och fem alternativ
 *   <SpatialUppgift id="sp-art-u1-vik" />  vikningen eller tärningen och A till D
 *   <SpatialFacit id="sp-art-u1-vik" />    uppvikningen steg för steg, eller rätt tärning
 *   <OrdUppgift id="of-art-01" />          ordet i versaler och fem alternativ
 *
 * Figurerna är aria-hidden; uppgiften står som text i en figcaption.
 */

import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { SpatialFigur, SpatialFraga } from '@/lib/spatialV1/types'
import { visaTal } from '@/lib/talserierV1/layout'
import talserier from '@/lib/artikelfigurer/talserier.json'
import spatial from '@/lib/artikelfigurer/spatial.json'
import ordforrad from '@/lib/artikelfigurer/ordforrad.json'

const BOKSTAV = ['A', 'B', 'C', 'D', 'E']

type Talserie = { id: string; visade: number[]; luckor: number; options: number[][]; correctAnswer: number; regel: string }
type Ord = { id: string; typ: 'synonym' | 'antonym'; ord: string; options: string[]; correctAnswer: number }

const TS = new Map((talserier as unknown as Talserie[]).map((q) => [q.id, q]))
const SP = new Map((spatial as unknown as SpatialFraga[]).map((q) => [q.id, q]))
const OF = new Map((ordforrad as unknown as Ord[]).map((q) => [q.id, q]))

function hamta<T>(m: Map<string, T>, id: string, namn: string): T {
  const u = m.get(id)
  if (!u) throw new Error(`${namn}: okänt id ${id}`)
  return u
}

/* ---------------------------------------------------------------- talserier */

function Rad({ visade, luckor, facit }: { visade: number[]; luckor: number; facit?: number[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {visade.map((t, i) => (
        <span key={i} className="min-w-[38px] rounded-lg border border-kant bg-papper px-1 py-2 text-center text-[16px] font-semibold tabular-nums text-ink-1">
          {visaTal(t)}
        </span>
      ))}
      {Array.from({ length: luckor }, (_, i) =>
        facit ? (
          <span key={`l${i}`} className="min-w-[38px] rounded-lg border-2 border-koppar bg-papper px-1 py-2 text-center text-[16px] font-semibold tabular-nums text-ink-1">
            {visaTal(facit[i])}
          </span>
        ) : (
          <span key={`l${i}`} className="min-w-[38px] rounded-lg border border-dashed border-ink-3 bg-papper-2 px-1 py-2 text-center text-[16px] font-semibold text-ink-3">
            ?
          </span>
        )
      )}
    </div>
  )
}

export function TalserieUppgift({ id, facit = false }: { id: string; facit?: boolean }) {
  const u = hamta(TS, id, 'TalserieUppgift')
  const text = u.luckor === 2 ? 'Vilka två tal kommer härnäst, i ordning?' : 'Vilket tal kommer härnäst?'
  return (
    <figure className="not-prose my-6" data-talserieuppgift={u.id}>
      <div aria-hidden="true" className="mx-auto w-full max-w-[560px] rounded-2xl border border-kant bg-papper p-3 shadow-lyft">
        <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[.06em] text-ink-3">{facit ? 'Lösningen' : text}</p>
        <Rad visade={u.visade} luckor={u.luckor} facit={facit ? u.options[u.correctAnswer] : undefined} />
        {facit ? null : (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {u.options.map((o, i) => (
              <span key={i} className="rounded-full border border-kant bg-papper px-3 py-1 text-[14px] tabular-nums text-ink-2">
                <b className="mr-1 text-[12px] text-ink-3">{BOKSTAV[i]}</b>
                {o.map(visaTal).join(' och ')}
              </span>
            ))}
          </div>
        )}
      </div>
      <figcaption className="sr-only">
        {`Talserie: ${u.visade.map(visaTal).join(', ')}, ${u.luckor === 2 ? 'två tal saknas' : 'ett tal saknas'}. Alternativ: ${u.options
          .map((o, i) => `${BOKSTAV[i]}, ${o.map(visaTal).join(' och ')}`)
          .join('; ')}.`}
      </figcaption>
    </figure>
  )
}

/* ---------------------------------------------------------- spatial förmåga */

function Ruta({ fig, etikett, ratt = false }: { fig: SpatialFigur; etikett?: string; ratt?: boolean }) {
  return (
    <div className={`relative [aspect-ratio:1/1] rounded-xl border bg-papper ${ratt ? 'border-2 border-koppar' : 'border-kant'}`}>
      {etikett ? <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold leading-4 text-ink-3">{etikett}</span> : null}
      <span className="absolute inset-2">
        <SpatialSvg fig={fig} className="block h-full w-full" />
      </span>
    </div>
  )
}

function Pil() {
  return (
    <span aria-hidden="true" className="flex w-3 shrink-0 items-center justify-center text-ink-3">
      <svg viewBox="0 0 10 10" width="10" height="10">
        <path d="M3 2l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function Sekvens({ figurer, etiketter }: { figurer: SpatialFigur[]; etiketter: string[] }) {
  return (
    <div className="flex items-stretch gap-1">
      {figurer.map((f, i) => (
        <div key={i} className="contents">
          {i > 0 ? <Pil /> : null}
          <div className={`flex min-w-0 flex-col items-center rounded-xl border border-kant bg-papper-2 p-1 ${figurer.length < 3 ? 'w-[calc((100%-2.5rem)/3)] flex-none' : 'flex-1'}`}>
            <span className="block [aspect-ratio:1/1] w-full">
              <SpatialSvg fig={f} className="block h-full w-full" />
            </span>
            <span className="text-[11px] font-semibold leading-4 text-ink-3">{etiketter[i]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const sekvensEtiketter = (n: number) => Array.from({ length: n }, (_, i) => (i === n - 1 ? 'Stansa' : 'Vik'))

function spatialBeskrivning(u: SpatialFraga): string {
  if (u.form === 'C') return 'Tärningar: en tärning och fyra alternativ, A till D. Vilken kan vara samma tärning sedd från ett annat håll?'
  if (u.form === 'D') {
    const n = u.sekvens?.length ?? 1
    return `Pappersvikning: ett utvikt ark med hål${u.sekvens?.[0] && 'klipp' in u.sekvens[0] && u.sekvens[0].klipp?.length ? ' och klipp' : ''} viks ${n === 1 ? 'en gång' : n === 2 ? 'två gånger' : 'tre gånger'} längs streckade linjer. Fyra alternativ, A till D, visar arket ihopvikt. Hål syns bara där de går genom alla lager.`
  }
  const vik = (u.sekvens?.length ?? 1) - 1
  return `Pappersvikning${u.klipp ? ' med klipp' : ''}: arket viks ${vik === 1 ? 'en gång' : `${vik} gånger`} och ${u.klipp ? 'ett hål stansas och ett hörn klipps' : 'ett hål stansas'}. Fyra alternativ, A till D, visar arket uppvikt.`
}

export function SpatialUppgift({ id }: { id: string }) {
  const u = hamta(SP, id, 'SpatialUppgift')
  return (
    <figure className="not-prose matrisyta my-6" data-spatialuppgift={u.id}>
      <div aria-hidden="true" className="mx-auto w-full max-w-[460px]">
        {u.form === 'D' && u.sekvens ? (
          <Sekvens figurer={u.sekvens} etiketter={u.sekvens.map((_, i) => `Vik ${i + 1}`)} />
        ) : u.form === 'B' && u.sekvens ? (
          <Sekvens figurer={u.sekvens} etiketter={sekvensEtiketter(u.sekvens.length)} />
        ) : u.referens ? (
          <div className="mx-auto w-1/2 max-w-[200px]">
            <Ruta fig={u.referens} etikett="Tärningen" />
          </div>
        ) : null}
        <p className="my-3 text-center text-[14px] font-semibold text-ink-2">{u.fraga}</p>
        <div className="grid grid-cols-4 gap-2">
          {u.options.map((o, i) => (
            <Ruta key={i} fig={o} etikett={BOKSTAV[i]} />
          ))}
        </div>
      </div>
      <figcaption className="sr-only">{spatialBeskrivning(u)}</figcaption>
    </figure>
  )
}

/** Lösningen i bild: uppvikningen baklänges för vikningen, rätt tärning bredvid den första för tärningarna. */
export function SpatialFacit({ id }: { id: string }) {
  const u = hamta(SP, id, 'SpatialFacit')
  const ratt = u.options[u.correctAnswer]
  if (u.form === 'D' && u.hopvikning?.length) {
    const steg = u.hopvikning as SpatialFigur[]
    return (
      <div className="not-prose matrisyta my-4" aria-hidden="true" data-spatialfacit={u.id}>
        <div className="w-full max-w-[460px]">
          <Sekvens figurer={steg} etiketter={steg.map((_, i) => (i === 0 ? 'Arket' : i === steg.length - 1 ? 'Ihopvikt' : `Vik ${i}`))} />
        </div>
      </div>
    )
  }
  if (u.form === 'B') {
    const stans = u.sekvens?.[u.sekvens.length - 1]
    const steg = [stans, ...(u.uppvikning ?? [])].filter(Boolean) as SpatialFigur[]
    return (
      <div className="not-prose matrisyta my-4" aria-hidden="true" data-spatialfacit={u.id}>
        <div className="w-full max-w-[460px]">
          <Sekvens figurer={steg} etiketter={steg.map((_, i) => (i === 0 ? 'Stansat' : i === steg.length - 1 ? 'Uppvikt' : 'Vik upp'))} />
        </div>
      </div>
    )
  }
  return (
    <div className="not-prose matrisyta my-4" aria-hidden="true" data-spatialfacit={u.id}>
      <div className="grid w-full max-w-[260px] grid-cols-2 gap-2">
        {u.referens ? <Ruta fig={u.referens} etikett="Första" /> : null}
        <Ruta fig={ratt} etikett={BOKSTAV[u.correctAnswer]} ratt />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- ordförråd */

export function OrdUppgift({ id }: { id: string }) {
  const u = hamta(OF, id, 'OrdUppgift')
  const etikett = u.typ === 'synonym' ? 'Synonym' : 'Motsatsord'
  return (
    <figure className="not-prose my-6" data-orduppgift={u.id}>
      <div aria-hidden="true" className="mx-auto w-full max-w-[460px] rounded-2xl border border-kant bg-papper p-3 shadow-lyft">
        <p className="text-[12px] font-semibold uppercase tracking-[.06em] text-ink-3">{etikett}</p>
        <p className="mt-1 font-display text-[22px] font-extrabold tracking-[.04em] text-ink-1">{u.ord.toUpperCase()}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {u.options.map((o, i) => (
            <span key={i} className="rounded-full border border-kant bg-papper px-3 py-1 text-[14px] text-ink-2">
              <b className="mr-1 text-[12px] text-ink-3">{BOKSTAV[i]}</b>
              {o}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">
        {`${etikett} till ${u.ord}: ${u.options.map((o, i) => `${BOKSTAV[i]}, ${o}`).join('; ')}.`}
      </figcaption>
    </figure>
  )
}
