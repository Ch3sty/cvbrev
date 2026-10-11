'use client'

/**
 * Övningsprovets resultat (Testerna v2, skiss 3, riktlinjerna 1.4 och 5.2),
 * samma vy för logik, verbalt och numeriskt. Fyra steg om 300 ms:
 *   s1 ringen fylls till andelen rätt, rubriken "23 av 35 rätt"
 *   s2 två tal: tiden och obesvarade, eller "Tiden räckte"
 *   s3 kurvan med den nya punkten (logik) och ordet om varför
 *   s4 genomgången, var du tappade och tempot mot provets tid
 * Statusraden sist pekar på i morgon. Ingen percentil, inget rött.
 */

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import { Rad } from '@/components/rum/Rader'
import StatusRow from '@/components/shell/StatusRow'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { RESULTAT } from '@/lib/ovningsprov/copy'
import type { OvningsResultatVM } from '@/lib/ovningsprov/resultat'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import ResultatSkal from '../ResultatSkal'
import Staplar from '../Staplar'

export interface OvningsResultatVyProps {
  vm: OvningsResultatVM
  /** Kurvan med den nya punkten (logik). */
  kurva?: ReactNode
  /** Verbalt och numeriskt: genomgången som fälls ut under kortet. */
  genomgang?: ReactNode
  /** Logik: genomgången i passflödets egen vy. */
  onGenomga?: () => void
  onStang: () => void
  motion?: boolean
}

export default function OvningsResultatVy({ vm, kurva, genomgang, onGenomga, onStang, motion = true }: OvningsResultatVyProps) {
  const [oppen, setOppen] = useState(false)
  const G = RESULTAT.genomgang
  const visaGenomgang = () => {
    if (onGenomga) return onGenomga()
    setOppen((o) => !o)
    if (!oppen && typeof document !== 'undefined') {
      requestAnimationFrame(() => document.getElementById('ovningsprov-genomgang')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  return (
    <ResultatSkal
      label={RESULTAT.eyebrow}
      kontext={vm.brand}
      raknare={vm.datum}
      motion={motion}
      onStang={onStang}
      vagg={
        <>
          <div className="steg s1" role="status" aria-live="polite">
            <div className="mt-2 flex items-center gap-4">
              <Dagsring status="gjord" label={RESULTAT.ringAria(vm.ratt, vm.antal)} fyllAnimering andel={vm.antal ? vm.ratt / vm.antal : 0} storlek={64} />
              <div className="min-w-0">
                <p className="text-ey uppercase text-koppar-ljus">{RESULTAT.eyebrow}</p>
                <h1 className="text-h1-liten mt-1 text-vagg-ink" data-ovningsprov-rubrik>
                  {RESULTAT.rubrik(vm.ratt, vm.antal)}
                </h1>
              </div>
            </div>
          </div>
          <dl className="steg s2 mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col-reverse">
              <dt className="mt-1 text-xs leading-4 text-vagg-mjuk">{vm.tid.etikett}</dt>
              <dd className="m-0 font-display text-[28px] font-bold leading-[30px] tracking-[-.02em] text-vagg-ink tabular-nums">{vm.tid.varde}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="mt-1 text-xs leading-4 text-vagg-mjuk">{vm.andra.etikett}</dt>
              <dd
                className={`m-0 font-display font-bold tracking-[-.02em] tabular-nums ${
                  vm.andra.koppar ? 'text-[28px] leading-[30px] text-koppar-ljus' : 'text-[22px] leading-[30px] text-vagg-ink'
                }`}
                data-obesvarade={vm.andra.koppar ? vm.andra.varde : '0'}
              >
                {vm.andra.varde}
              </dd>
            </div>
          </dl>
          {kurva ? <div className="steg s3 mt-[18px]">{kurva}</div> : null}
          {vm.mening ? <p className="steg s3 mt-3.5 text-sm leading-[21px] text-vagg-mjuk">{vm.mening}</p> : null}
        </>
      }
      golv={
        <>
          <section
            aria-label={G.rub}
            className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft"
          >
            <p className="text-ey uppercase text-koppar-ink">{G.rub}</p>
            <p className="mt-1 font-display text-[22px] font-bold leading-[27px] tracking-[-.02em] text-ink-1">{vm.genomgang.titel}</p>
            <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{vm.genomgang.text}</p>
            {vm.genomgang.antal > 0 ? (
              <div className="mt-3.5">
                <button type="button" onClick={visaGenomgang} className={KNAPP_PRIMAR} aria-expanded={onGenomga ? undefined : oppen}>
                  {oppen ? G.dolj : vm.genomgang.knapp}
                </button>
              </div>
            ) : null}
          </section>
          {oppen && genomgang ? (
            <div id="ovningsprov-genomgang" className="flex flex-col gap-3">
              {genomgang}
            </div>
          ) : null}

          {vm.tappade ? (
            <section aria-label={RESULTAT.tappade.rub} className="steg s4 rounded-2xl border border-kant bg-papper p-4">
              <p className="text-ey uppercase text-ink-3">{RESULTAT.tappade.rub}</p>
              <p className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{vm.tappade.titel}</p>
              <div className="-mx-4 -mb-2 mt-1 [&>*+*]:border-t [&>*+*]:border-kant">
                {vm.tappade.rader.map((r) => (
                  <Rad key={r.namn} titel={r.namn} meta={r.meta} stapel={{ andel: Math.max(0.04, r.andel), ton: 'koppar' }} />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-label={RESULTAT.tempo.rub} className="steg s4 rounded-2xl border border-kant bg-papper p-4">
            <p className="text-ey uppercase text-ink-3">{RESULTAT.tempo.rub}</p>
            <p className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{vm.tempo.titel}</p>
            <p className="mt-0.5 text-sm leading-[21px] text-ink-2">{vm.tempo.text}</p>
            <Staplar data={vm.tempo.staplar} aria={vm.tempo.aria} axel={vm.tempo.axel} />
          </section>

          <div className="steg s4">
            <StatusRow
              tone="warm"
              showDot
              wrap
              action={
                <Link href={TRANING_RUTT.hem} className={`${LANK} text-[13px]`}>
                  {RESULTAT.status.minPlan}
                </Link>
              }
            >
              <span className="text-ink-1">{vm.status}</span>
            </StatusRow>
          </div>
        </>
      }
      fot={
        <Link href={TRANING_RUTT.alla} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
          {RESULTAT.allaTester}
        </Link>
      }
    />
  )
}
