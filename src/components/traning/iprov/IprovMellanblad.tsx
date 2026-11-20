'use client'

/**
 * I-provets mellanblad (omgång 3 steg 2a, skissens Test-iprov-mellanblad):
 * före varje deltest ett eget blad på väggen. Till vänster deltestets nummer,
 * namnet stort, antalet och maxtiden, raden om uppgiftens form, ett exempel
 * (talserierna: fyra tal och två luckor) och "Starta deltestet" med raden om
 * klockan. Till höger panelen "Så här långt har du kommit": deltesten i tur
 * och ordning, de klara med bock, det som börjar nu i koppar, och regeln om
 * att hoppa inom ett deltest. Överst krysset, provets namn, en bit per
 * deltest och hela provets omfång.
 *
 * Skärmen skjuter ingen händelse (som Startskärmen med onAvbryt): servern
 * startar deltestet när knappen trycks. Telefonen: allt i en spalt, panelen
 * under knappen.
 */

import { useRef } from 'react'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { SESSION } from '@/components/session/copy'
import { Snurra } from '@/components/session/SessionsRam'
import { useRamLage } from '@/components/session/useRamLage'
import { IPROV_COPY as C, iprovDelar, iprovSumma, type IprovVy } from '@/lib/tester/steg2/iprov'

function Bock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

/** Exemplet under raden om formen: talserierna (skissen). Andra deltest har inget exempel. */
function Exempel({ kind }: { kind: string }) {
  if (kind !== 'talserie') return null
  const tal = ['4', '7', '10', '13']
  return (
    <div className="mt-6 flex gap-2.5 lg:mt-[26px]" role="img" aria-label="Exempel: fyra tal och två tomma rutor.">
      {tal.map((t) => (
        <span key={t} className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[color:var(--sess-ruta)] font-sess-display text-[22px] font-extrabold text-[color:var(--sess-figur)] shadow-[0_5px_0_var(--sess-bage)] lg:h-14 lg:w-14 lg:text-2xl" aria-hidden="true">
          {t}
        </span>
      ))}
      {[0, 1].map((i) => (
        <span key={`l${i}`} className="sess-lucka !h-12 !w-12 !rounded-[13px] !text-[22px] lg:!h-14 lg:!w-14 lg:!text-2xl" aria-hidden="true">
          ?
        </span>
      ))}
    </div>
  )
}

export interface IprovMellanbladProps {
  vy: IprovVy
  /** Deltestets plats i provet, nollbaserad. */
  delIndex: number
  onAvbryt: () => void
  onStarta: () => void
  laddar: boolean
  fel: string | null
}

export default function IprovMellanblad({ vy, delIndex, onAvbryt, onStarta, laddar, fel }: IprovMellanbladProps) {
  // Bladet äger skärmen som ramen: bottennavigeringen och bannrarna håller undan.
  const fotRef = useRef<HTMLElement | null>(null)
  useRamLage(fotRef, false)
  const defs = iprovDelar(vy.halvt)
  const del = vy.delar[delIndex]
  const def = defs.find((x) => x.nr === del.nr)
  const antalDelar = vy.delar.length
  const klara = vy.delar.filter((d) => d.avslutad).length
  const summa = iprovSumma(vy.halvt)
  const minuter = (s: number) => Math.round(s / 60)
  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-[color:var(--sess-brade)] font-sess-text text-[color:var(--sess-brade-ink)]" data-sessionsram="mellanblad" data-iprov-mellanblad={del.nr}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="1280" cy="-60" r="340" fill="var(--sess-brade-2)" opacity=".55" />
        <path d="M0 900V770C260 720 520 810 820 740S1260 650 1440 700V900Z" fill="var(--sess-brade-2)" opacity=".35" />
      </svg>
      <header className="relative z-10 mx-auto grid w-full max-w-[1160px] flex-shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 px-4 pt-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:pt-4 xl:px-0">
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            type="button"
            onClick={onAvbryt}
            aria-label={SESSION.avbryt.aria}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-white/[.08] text-[color:var(--sess-brade-ink)]"
            data-kryss=""
          >
            <IkonX />
          </button>
          <span className="hidden truncate font-sess-display text-base font-bold leading-5 lg:block">{C.titel}</span>
        </div>
        <div
          className="grid w-full gap-1.5 lg:w-[520px] lg:gap-2"
          style={{ gridTemplateColumns: `repeat(${antalDelar}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`${C.mellanEyebrow(delIndex + 1, antalDelar)}. ${klara} av ${antalDelar} klara.`}
        >
          {vy.delar.map((d, i) => (
            <i
              key={d.nr}
              className={`block h-3 rounded-[6px] lg:h-3.5 lg:rounded-[7px] ${d.avslutad ? 'bg-[color:var(--sess-bage)]' : i === delIndex ? 'bg-[color:var(--sess-brade)] shadow-[inset_0_0_0_3px_var(--sess-lucka)]' : 'bg-[color:var(--sess-brade-2)]'}`}
            />
          ))}
        </div>
        <span className="hidden justify-self-end text-sm leading-5 text-[color:var(--sess-brade-ink-2)] lg:block">
          {vy.halvt ? C.halvt : C.helt}: {C.valRad(summa.antal, summa.minuter).replace(' min', ' minuter')}
        </span>
      </header>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto grid w-full max-w-[1160px] gap-8 px-4 pb-8 pt-8 lg:min-h-full lg:grid-cols-[minmax(0,560px)_minmax(0,520px)] lg:items-center lg:justify-between lg:gap-10 lg:pb-14 lg:pt-6 xl:px-0">
          <div className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-lucka-ink)]">{C.mellanEyebrow(delIndex + 1, antalDelar)}</p>
            <h1 className="mt-3 font-sess-display text-[48px] font-extrabold leading-[52px] tracking-[-.03em] lg:text-[84px] lg:leading-[86px]" data-start-rubrik>
              {del.namn}
            </h1>
            <p className="mt-3 font-sess-display text-xl font-bold leading-7 lg:mt-4 lg:text-2xl lg:leading-8">{C.mellanAntal(def?.antal ?? del.uppgifter.length, minuter(del.max_s))}</p>
            {def ? <p className="mt-2.5 max-w-[500px] text-base leading-6 text-[color:var(--sess-brade-ink-2)] lg:text-[17px] lg:leading-[26px]">{def.beskrivning}</p> : null}
            <Exempel kind={del.kind} />
            <div className="mt-8 flex flex-wrap items-center gap-x-[22px] gap-y-3 lg:mt-10">
              <button
                type="button"
                onClick={onStarta}
                disabled={laddar}
                aria-busy={laddar || undefined}
                className={`${KNAPP_PRIMAR} sess-knapp !h-16 !w-auto gap-3 !rounded-[18px] !px-9 !text-[19px]`}
                data-starta
              >
                {laddar ? <Snurra /> : null}
                {laddar ? SESSION.start.startar : C.startaDel}
                {laddar ? null : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
              <span className="max-w-[190px] text-[15px] leading-[22px] text-[color:var(--sess-brade-ink-2)]">Klockan startar när du trycker.</span>
            </div>
            {fel ? (
              <p role="alert" className="mt-4 rounded-xl bg-white/[.08] px-3.5 py-2.5 text-sm leading-5">
                {fel}
              </p>
            ) : null}
          </div>

          <section className="rounded-[26px] border border-white/10 bg-[color:var(--sess-brade-2)] px-3 pb-4 pt-5 shadow-[0_6px_0_var(--sess-brade-kant)] lg:px-[22px] lg:pb-[18px] lg:pt-[22px]" aria-labelledby="iprov-delar-rubrik" data-iprov-delar>
            <div className="flex items-baseline justify-between gap-4 px-3.5 pb-2.5">
              <h2 id="iprov-delar-rubrik" className="font-sess-display text-lg font-bold leading-6 lg:text-xl">
                Så här långt har du kommit
              </h2>
              <span className="flex-shrink-0 text-[13px] leading-[18px] text-[color:var(--sess-brade-ink-2)]">
                {klara} av {antalDelar} klara
              </span>
            </div>
            <ol className="relative list-none p-0">
              <span className="absolute bottom-[30px] left-[31px] top-[30px] w-[3px] rounded-sm bg-white/[.12]" aria-hidden="true" />
              {vy.delar.map((d, i) => {
                const nu = i === delIndex
                const klar = Boolean(d.avslutad)
                const dd = defs.find((x) => x.nr === d.nr)
                return (
                  <li
                    key={d.nr}
                    className={`relative flex items-center gap-3.5 rounded-2xl px-3.5 py-[11px] ${nu ? 'bg-white/[.08] shadow-[inset_0_0_0_2px_var(--sess-lucka)]' : ''}`}
                    aria-current={nu ? 'step' : undefined}
                  >
                    <span
                      className={`relative z-[1] flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-[3px] font-sess-display text-[15px] font-extrabold ${
                        klar
                          ? 'border-[color:var(--sess-bage)] bg-[color:var(--sess-bage)] text-[color:var(--sess-brade)]'
                          : nu
                            ? 'border-[color:var(--sess-brade-ink)] bg-[color:var(--sess-lucka)] text-[color:var(--sess-skala-vald-ink)]'
                            : 'border-[color:var(--sess-brade-pil)] bg-[color:var(--sess-brade-2)] text-[color:var(--sess-brade-ink-2)]'
                      }`}
                      aria-hidden="true"
                    >
                      {klar ? <Bock /> : i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <b className={`text-base font-semibold leading-[22px] ${klar ? 'text-[color:var(--sess-brade-ink-2)]' : ''}`}>{d.namn}</b>
                      {klar ? <small className="text-[13px] leading-[18px] text-[color:var(--sess-brade-ink-2)]">Klart, går inte att öppna igen</small> : null}
                      {nu ? <small className="text-[13px] leading-[18px] text-[color:var(--sess-brade-ink-2)]">Börjar nu</small> : null}
                    </span>
                    <span className={`flex-shrink-0 whitespace-nowrap text-[13px] font-semibold leading-[18px] ${nu ? 'text-[color:var(--sess-lucka-ink)]' : 'text-[color:var(--sess-brade-ink-2)]'}`}>
                      {C.delRad(dd?.antal ?? d.uppgifter.length, minuter(d.max_s))}
                    </span>
                  </li>
                )
              })}
            </ol>
            <p className="mx-3.5 mt-3 border-t border-white/[.12] pt-3.5 text-[13px] leading-[19px] text-[color:var(--sess-brade-ink-2)]">{C.regel}</p>
          </section>
        </div>
      </main>
    </div>
  )
}
