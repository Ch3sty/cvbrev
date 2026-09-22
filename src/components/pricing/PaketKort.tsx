'use client'

/**
 * PaketKort: ett kort per spår (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Tre kort, inte sex. CV-veckan och Testveckan har ett fast pris. Allt-kortet
 * bär ett Segment med fyra längder, och pris, intervallrad, punkter och
 * knapptext följer valt läge. Vecka är förvald, så kortet visar rätt sak även
 * utan JavaScript.
 *
 * Kortet är en panel, aldrig en gradient. Det rekommenderade kortet får
 * stegetiketten i accent-ink och en marginalplatta, alltså sidans enda två
 * accenter. Valt segment är ink-1 och räknas inte.
 *
 * Delas mellan publika prissidan och den inloggade vyn, eftersom två kopior
 * av samma kort glider isär. Anroparen bestämmer vad knappen gör.
 */

import { useState } from 'react'
import { Check } from 'lucide-react'

import MarginPlate from '@/components/shell/MarginPlate'
import Segment from '@/components/shell/Segment'
import { IlluPlattaPremium } from '@/components/illustrations/TradenScener'
import { IkonCv, IkonAnalys } from '@/components/illustrations/Ikoner'
import { PLAN_BY_KEY, type PlanKey, type PlanLength } from '@/lib/plans/plans'
import {
  ALLT_LANGDER,
  INTERVALL_RAD,
  PAKET_INGAR_INTE,
  PAKET_PUNKTER,
  PAKET_RAD,
  knappText,
} from './paket-copy'

export interface PaketKortProps {
  /** Paketet kortet visar. För Allt skickas all_week, längdvalet sköter resten. */
  plan: PlanKey
  /** Visa Allt-kortets fyra längder. Bara sant på Allt. */
  lengths?: boolean
  /** Stegetikett i accent-ink plus marginalplatta. Högst ett kort per sida. */
  recommended?: boolean
  /** Anropas med det paket knappen gäller. */
  onSelect: (plan: PlanKey) => void
  /** Anropas när längdvalet ändras, för plan_length_changed. */
  onLengthChange?: (plan: PlanKey) => void
  /** Markerad av spårväljaren: kant i ink-1, samma märkning som ett val. */
  markerad?: boolean
  /** Knappen jobbar. Spärrar dubbelklick. */
  busy?: boolean
  /** id på kortet, så spårväljaren kan scrolla hit. */
  id?: string
  className?: string
}

const PRIMAR =
  'mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:opacity-40'

export default function PaketKort({
  plan,
  lengths,
  recommended,
  onSelect,
  onLengthChange,
  markerad,
  busy,
  id,
  className,
}: PaketKortProps) {
  const [langd, setLangd] = useState<PlanLength>(PLAN_BY_KEY[plan].length)

  // Utan längdval är det aktiva paketet alltid kortets eget.
  const aktivPlan = lengths
    ? (ALLT_LANGDER.find((l) => l.length === langd)?.plan ?? plan)
    : plan
  const paket = PLAN_BY_KEY[aktivPlan]

  function bytLangd(nyLangd: PlanLength) {
    setLangd(nyLangd)
    const ny = ALLT_LANGDER.find((l) => l.length === nyLangd)
    if (ny) onLengthChange?.(ny.plan)
  }

  const ingarInte = PAKET_INGAR_INTE[aktivPlan]

  return (
    <section
      id={id}
      className={`flex flex-col rounded-xl border bg-panel p-4 sm:p-5 ${
        markerad ? 'border-ink-1 shadow-val' : 'border-kant'
      } ${className ?? ''}`}
      aria-label={paket.name}
    >
      {recommended ? (
        <p className="text-steg uppercase text-accent-ink">Rekommenderas</p>
      ) : null}

      <div className={`flex items-center gap-3 ${recommended ? 'mt-2' : ''}`}>
        {recommended ? (
          <MarginPlate>
            <IlluPlattaPremium size={48} />
          </MarginPlate>
        ) : (
          <span className="text-ink-2" aria-hidden="true">
            {plan === 'test_week' ? <IkonAnalys /> : <IkonCv />}
          </span>
        )}
        <h3 className="text-kort text-ink-1">{lengths ? 'Allt' : paket.name}</h3>
      </div>

      {lengths ? (
        <Segment
          className="mt-4"
          label="Hur länge"
          value={langd}
          onChange={bytLangd}
          options={ALLT_LANGDER.map((l) => ({ value: l.length, label: l.label }))}
        />
      ) : null}

      <p className="mt-4 text-tal tabular-nums text-ink-1">{paket.amount} kr</p>
      <p className="text-meta text-ink-3">{INTERVALL_RAD[aktivPlan]}</p>

      <p className="mt-3 text-sm leading-[22px] text-ink-2">{PAKET_RAD[aktivPlan]}</p>

      <ul className="mt-4 space-y-2">
        {PAKET_PUNKTER[aktivPlan].map((punkt) => (
          <li key={punkt} className="flex gap-2 text-sm leading-[22px] text-ink-2">
            <Check
              className="mt-0.5 h-5 w-5 shrink-0 text-ink-2"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>{punkt}</span>
          </li>
        ))}
      </ul>

      {/* Knappen sist i flödet men tryckt mot kortets fot, så tre kort i en
          rad får sina knappar på samma höjd utan flex-hack per kolumn. */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={() => onSelect(aktivPlan)}
          disabled={busy}
          className={PRIMAR}
        >
          {knappText(aktivPlan)}
        </button>

        {ingarInte ? <p className="mt-3 text-meta text-ink-3">{ingarInte}</p> : null}
      </div>
    </section>
  )
}
