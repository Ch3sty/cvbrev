'use client'

/**
 * "I morgon"-kortet (Testerna v2, skiss 5, riktlinjerna 4.2): dag 1 ska
 * sluta med något daterat och ogjort. Temat (mönstret hon tappade mest på),
 * formen och tidpunkten, som hon väljer med ett tryck på tre klockor:
 * Morgon, Lunch, Kväll. Ingen sparaknapp, ingen dialog; valet sparas direkt
 * i test_planer.pass_tid och styr påminnelsemejlet.
 *
 * Gratis ser värdet, inte bara låset: temat och formen står i klartext med
 * låset under, och betalväggen i samma kort säger formatet, datumet och vad
 * månaden täcker. Köpknappen är den enda kopparn på golvet.
 */

import { useState } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { IkonLas } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN, kopKnapp, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { PassTid } from '@/lib/traning/testplan'

const K = PASS_COPY.imorgonKort
const TIDER: PassTid[] = ['morgon', 'lunch', 'kvall']

/** Klockans visare per tidpunkt (skissens k-morgon, k-lunch, k-kvall). Ingen sol, ingen måne. */
function Klockikon({ tid }: { tid: PassTid }) {
  const visare = tid === 'morgon' ? 'M14 14V8M14 14l-4.5 3' : tid === 'lunch' ? 'M14 14V7.5M14 14l2.5-4.5' : 'M14 14V8M14 14h-5.5'
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" className="text-ink-1">
      <circle cx="14" cy="14" r="11" fill="var(--papper)" stroke="currentColor" strokeWidth="1.75" />
      <path d={visare} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export interface ImorgonKortProps {
  /** Mönstrets namn för morgondagens pass, null: blandade mönster. */
  tema: string | null
  /** Första passet efter Nivåkollen. */
  forsta?: boolean
  /** Sparad tidpunkt. */
  passTid: PassTid | null
  /** Gratis: passet är låst, betalväggen i kortet. */
  last: boolean
  /** Gratis: formatet i ord ("samma format som Matrigma, cirka 35 uppgifter på 40 minuter"). */
  format?: string
  provdatum?: string | null
  dagarKvar?: number | null
  /** Länken under köpknappen, till exempel dagens grundpass. */
  lank?: { text: string; href?: string; onClick?: () => void } | null
  lyft?: boolean
  /** Gratis: betalväggen i kortet. Av där vyn redan har sin kopparknapp (passets resultat). */
  betalvagg?: boolean
  className?: string
}

export default function ImorgonKort({
  tema,
  forsta = false,
  passTid,
  last,
  format,
  provdatum = null,
  dagarKvar = null,
  lank = null,
  lyft = true,
  betalvagg = true,
  className,
}: ImorgonKortProps) {
  const [vald, setVald] = useState<PassTid | null>(passTid)
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState(false)

  const valj = async (tid: PassTid) => {
    const fore = vald
    setVald(tid)
    setSparar(true)
    setFel(false)
    try {
      const res = await fetch('/api/traning/pass-tid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass_tid: tid }),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      setVald(fore)
      setFel(true)
    }
    setSparar(false)
  }

  const yta = lyft
    ? 'relative z-[2] -mt-[30px] border-[color:var(--lyft-kant)] shadow-lyft'
    : 'border-kant'

  return (
    <section aria-label={forsta ? K.eyebrowForsta : K.eyebrow} className={`rounded-2xl border bg-papper p-4 ${yta} ${className ?? ''}`} data-imorgon>
      <p className={`text-ey uppercase ${last ? 'text-ink-3' : 'text-koppar-ink'}`}>{forsta ? K.eyebrowForsta : K.eyebrow}</p>
      <h2 className={`mt-1 font-display text-[22px] font-bold leading-[27px] tracking-[-.02em] ${last ? 'text-ink-2' : 'text-ink-1'}`}>
        {tema ?? K.temaSaknas}
      </h2>
      <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{K.form}</p>

      {last ? (
        <>
          <p className="mt-2.5 flex items-center gap-2 text-[13px] text-ink-3">
            <IkonLas size={16} />
            {K.last}
          </p>
          {betalvagg ? (
          <div className="mt-3.5 border-t border-kant pt-3.5">
            {provdatum ? <p className="text-ey uppercase text-koppar-ink">{K.provRubrik(provdatum)}</p> : null}
            <p className="mt-1.5 text-sm leading-[21px] text-ink-2">
              {format ? K.provText(format, dagarKvar) : K.utanDatumText}
            </p>
            <p className="mt-2 text-sm font-medium text-ink-1">{`${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}. Säg upp när du vill.`}</p>
            <div className={KNAPPRAD}>
              <Link
                href={kopstegHref(SALD_PLAN, 'matning')}
                className={KNAPP_PRIMAR}
                onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: SALD_PLAN, surface: 'imorgon', cta: 'primary', plats: 'matning' })}
              >
                {kopKnapp(SALD_PLAN)}
              </Link>
              {lank ? (
                lank.href ? (
                  <Link href={lank.href} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                    {lank.text}
                  </Link>
                ) : (
                  <button type="button" onClick={lank.onClick} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                    {lank.text}
                  </button>
                )
              ) : null}
            </div>
          </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-3 text-[13px] font-medium text-ink-2">{K.fraga}</p>
          <div role="radiogroup" aria-label={K.tidAria} className="mt-2 grid grid-cols-3 gap-2">
            {TIDER.map((t) => {
              const v = K.val[t]
              const arVald = vald === t
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={arVald}
                  disabled={sparar}
                  onClick={() => void valj(t)}
                  className={`flex min-h-11 flex-col items-center gap-1.5 rounded-xl border bg-papper px-1.5 pb-2 pt-2.5 text-[13px] font-semibold ${
                    arVald ? 'border-ink-1 text-ink-1 shadow-[inset_0_0_0_1.5px_var(--ink-1)]' : 'border-kant-stark text-ink-2'
                  }`}
                  data-pass-tid={t}
                >
                  <Klockikon tid={t} />
                  {v.namn}
                  <small className="text-[11px] font-normal leading-[14px] text-ink-3">{v.tid}</small>
                </button>
              )
            })}
          </div>
          <p className="mt-2.5 text-meta text-ink-3" role="status" aria-live="polite">
            {fel ? K.sparfel : vald ? K.paminner(K.val[vald].klocka) : K.utanVal}
          </p>
        </>
      )}
    </section>
  )
}
