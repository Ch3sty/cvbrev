'use client'

/**
 * Resultatskärmen (plan-testflode-2026-11-20 avsnitt 4.2), samma vy i alla
 * lägen. Väggen överst, golvet med korten i fast ordning; ett kort utan data
 * tas bort, visas aldrig tomt.
 *
 *   VÄGG   topprad: X, typens namn och läget, datumet
 *          ringen 56 px fylld till andelen rätt (s1)
 *          eyebrow "[Läget] klart", huvudtalet
 *          två tal, aldrig fler (s2), meningen, nivåskalan där läget rör nivån
 *   GOLV   Genomgång (det lyfta kortet, s3), Var du tappade, Tempo,
 *          Nästa steg med vyns enda kopparknapp (s4), statusraden,
 *          länken "Tillbaka till Rekryteringstester"
 *
 * Avslöjandet .steg s1 till s4 i alla lägen (motion), väggen tonar in 240 ms.
 * Resultatväggen är aldrig röd.
 */

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import { Rad } from '@/components/rum/Rader'
import Nivaskala from '@/components/traning/Nivaskala'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import { KLART, SESSION } from './copy'
import type { Lage } from './lagesregler'
import { useRamLage } from './useRamLage'

export interface ResultatTal {
  varde: string
  etikett: string
  koppar?: boolean
}

export interface ResultatskarmProps {
  lage: Lage
  titel: string
  undertitel: string
  datum?: string | null
  onStang: () => void
  eyebrow?: string
  /** Ringen, fylld till andelen rätt. Utelämnad i Nivåkollen, där nivån är talet. */
  ring?: { andel: number; aria: string } | null
  huvudtal: string
  /** Liten text efter huvudtalet, till exempel "av 10" efter nivån. */
  huvudtalEfter?: string | null
  tal: ResultatTal[]
  mening?: string | null
  nivaskala?: { nu: number; fran: number | null; aria: string } | null
  /** En rad på väggen, till exempel att Nivåkollen är gjord i dag. */
  rad?: string | null
  /**
   * Genomgången i det lyfta kortet. null bara i personlighetstestet, som
   * saknar rätt svar: då står `lyft` i kortets plats.
   */
  genomgang: {
    titel: string
    text?: string | null
    miniatyrer?: ReactNode
    onGaIgenom: () => void
    onVisaAlla?: (() => void) | null
  } | null
  /** Det lyfta kortets innehåll när genomgången saknas (personlighetsprofilen). */
  lyft?: ReactNode
  /** Kort mellan det lyfta kortet och Nästa steg (personlighetsprofilens dimensioner). */
  innehall?: ReactNode
  tappade?: { titel?: string | null; rader: { namn: string; meta: string; andel: number }[] } | null
  tempo?: { titel: string; text?: string | null; innehall?: ReactNode } | null
  /** Färdiga kort i Var du tappades och Tempots plats (nivåtestets TappadeKort och TempoKort). */
  tappadeKort?: ReactNode
  tempoKort?: ReactNode
  nastaSteg: {
    titel: string
    text?: string | null
    knapp: { text: string; href?: string; onClick?: () => void; data?: string }
    extra?: ReactNode
  }
  status?: ReactNode
  tillbakaHref: string
  motion?: boolean
}

function Tal({ t }: { t: ResultatTal }) {
  return (
    <div className="flex min-w-0 flex-col-reverse">
      <dt className="mt-1 text-xs leading-4 text-vagg-mjuk">{t.etikett}</dt>
      <dd
        className={`m-0 whitespace-nowrap font-sess-display text-[24px] font-bold leading-[28px] tracking-[-.02em] tabular-nums min-[400px]:text-[28px] min-[400px]:leading-[30px] ${
          t.koppar ? 'text-koppar-ljus' : 'text-vagg-ink'
        }`}
      >
        {t.varde}
      </dd>
    </div>
  )
}

export default function Resultatskarm(p: ResultatskarmProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  useRamLage(fotRef, false)
  const motion = p.motion ?? true
  const knapp = p.nastaSteg.knapp
  const R = SESSION.resultat

  return (
    <div
      className={`fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text ${motion ? 'motion' : ''}`}
      data-sessionsram="resultat"
      data-resultat
      data-resultatskarm={p.lage}
      role="region"
      aria-label={p.eyebrow ?? KLART[p.lage]}
    >
      <main className="sess-tona min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[672px]">
            <div className="-mx-1 flex h-14 items-center gap-2 text-vagg-ink">
              <button
                type="button"
                onClick={p.onStang}
                aria-label={R.stang}
                data-kryss=""
                className="-ml-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]"
              >
                <IkonX />
              </button>
              <p className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold leading-5">{p.titel}</span>
                <span className="block truncate text-xs leading-4 text-vagg-mjuk">{p.undertitel}</span>
              </p>
              {p.datum ? <span className="pr-1 text-[13px] tabular-nums text-vagg-mjuk">{p.datum}</span> : null}
            </div>

            <div className="steg s1 mt-3 flex items-center gap-4" role="status">
              {p.ring ? <Dagsring status="gjord" storlek={56} fyllAnimering andel={p.ring.andel} label={p.ring.aria} /> : null}
              <div className="min-w-0">
                <p className="text-ey uppercase text-koppar-ljus" data-resultat-eyebrow>
                  {p.eyebrow ?? KLART[p.lage]}
                </p>
                <h1 className="text-h1-liten mt-1 text-vagg-ink" data-resultat-huvudtal>
                  {p.huvudtal}
                  {p.huvudtalEfter ? (
                    <span className="ml-2 align-baseline font-sess-display text-[20px] font-bold tracking-normal text-vagg-mjuk">{p.huvudtalEfter}</span>
                  ) : null}
                </h1>
              </div>
            </div>
            {p.tal.length ? (
              <dl className="steg s2 mt-4 grid grid-cols-2 gap-3">
                {p.tal.slice(0, 2).map((t) => (
                  <Tal key={t.etikett} t={t} />
                ))}
              </dl>
            ) : null}
            {p.mening ? <p className="steg s2 mt-3.5 max-w-[46ch] text-[15px] leading-[22px] text-vagg-mjuk">{p.mening}</p> : null}
            {p.nivaskala ? (
              <div className="steg s2">
                <Nivaskala className="mt-[18px]" nu={p.nivaskala.nu} fran={p.nivaskala.fran} aria={p.nivaskala.aria} />
              </div>
            ) : null}
            {p.rad ? (
              <p className="steg s2 mt-3.5 flex items-center gap-2 text-sm leading-5 text-vagg-ink" data-resultat-rad>
                <span className="h-2 w-2 shrink-0 rounded-full bg-koppar-ljus" aria-hidden="true" />
                {p.rad}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-4 pb-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[672px] flex-col gap-4">
            {p.genomgang ? (
              <section
                aria-label={R.genomgang}
                className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5"
                data-resultat-genomgang
              >
                <p className="text-ey uppercase text-koppar-ink">{R.genomgang}</p>
                <h2 className="mt-1 text-kort-t text-ink-1">{p.genomgang.titel}</h2>
                {p.genomgang.text ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{p.genomgang.text}</p> : null}
                {p.genomgang.miniatyrer ? <div className="mt-3.5">{p.genomgang.miniatyrer}</div> : null}
                <div className="mt-3.5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-5">
                  <button type="button" onClick={p.genomgang.onGaIgenom} className={`${KNAPP_SEKUNDAR} sm:w-auto sm:min-w-[160px]`} data-ga-igenom>
                    {R.gaIgenom}
                  </button>
                  {p.genomgang.onVisaAlla ? (
                    <button type="button" onClick={p.genomgang.onVisaAlla} className={`${LANK} inline-flex min-h-11 items-center justify-center`} data-visa-alla>
                      {R.visaAlla}
                    </button>
                  ) : null}
                </div>
              </section>
            ) : p.lyft ? (
              <div className="steg s3 relative z-[2] -mt-[30px]" data-resultat-lyft>
                {p.lyft}
              </div>
            ) : null}

            {p.innehall ? <div className="steg s4 flex flex-col gap-4">{p.innehall}</div> : null}

            {p.tappadeKort ? <div className="steg s4">{p.tappadeKort}</div> : null}
            {!p.tappadeKort && p.tappade && p.tappade.rader.length ? (
              <section aria-label={R.tappade} className="steg s4 rounded-2xl border border-kant bg-papper p-4" data-resultat-tappade>
                <p className="text-ey uppercase text-ink-3">{R.tappade}</p>
                {p.tappade.titel ? <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.tappade.titel}</p> : null}
                <div className="-mx-4 -mb-2 mt-1 [&>*+*]:border-t [&>*+*]:border-kant">
                  {p.tappade.rader.map((r, i) => (
                    <Rad key={r.namn} titel={r.namn} meta={r.meta} stapel={{ andel: Math.max(0.04, r.andel), ton: i === 0 ? 'koppar' : 'ton' }} />
                  ))}
                </div>
              </section>
            ) : null}

            {p.tempoKort ? <div className="steg s4">{p.tempoKort}</div> : null}
            {!p.tempoKort && p.tempo ? (
              <section aria-label={R.tempo} className="steg s4 rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-resultat-tempo>
                <p className="text-ey uppercase text-ink-3">{R.tempo}</p>
                <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.tempo.titel}</p>
                {p.tempo.text ? <p className="mt-0.5 text-sm leading-[21px] text-ink-2">{p.tempo.text}</p> : null}
                {p.tempo.innehall}
              </section>
            ) : null}

            <section aria-label={R.nastaSteg} className="steg s4 rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-resultat-nasta>
              <p className="text-ey uppercase text-ink-3">{R.nastaSteg}</p>
              <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.nastaSteg.titel}</p>
              {p.nastaSteg.text ? <p className="mt-1 text-sm leading-[21px] text-ink-2">{p.nastaSteg.text}</p> : null}
              {p.nastaSteg.extra}
              <div className="mt-3.5">
                {knapp.href ? (
                  <Link href={knapp.href} onClick={knapp.onClick} className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[220px]`} data-nasta-steg={knapp.data ?? ''}>
                    {knapp.text}
                  </Link>
                ) : (
                  <button type="button" onClick={knapp.onClick} className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[220px]`} data-nasta-steg={knapp.data ?? ''}>
                    {knapp.text}
                  </button>
                )}
              </div>
            </section>

            {p.status ? <div className="steg s4">{p.status}</div> : null}

            <div className="steg s4 flex justify-center">
              <Link href={p.tillbakaHref} className={`${LANK} inline-flex min-h-11 items-center`} data-resultat-tillbaka>
                {R.tillbaka}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
