'use client'

/**
 * PaketKort: ett kort per paket (docs/design/spec-prissida-2026-09-22.html,
 * sektion 1 och 2, .kort).
 *
 * Färgetikett, illustration, namn, värdemening, "för dig som", pris, listan
 * "Så här fungerar det" med en ikon per rad, och knappen. Allt-kortet står i
 * ink-1 med vit text och bär längdvalet dag, vecka, månad, kvartal.
 *
 * På mobil (sektion 2, vänstra telefonen) numreras korten "Paket 1 av 3",
 * värdemeningen är kortare, "för dig som" faller bort på spåren, och bara de
 * rader som är märkta mobil visas. Båda varianterna står i HTML och växlas
 * med lg:, så kortet ser rätt ut utan JavaScript.
 *
 * Delas mellan publika prissidan och kontosidan. Anroparen bestämmer knappen
 * (text och handling), en status i stället för knapp, eller en egen prisrad
 * (mellanskillnaden för en spårkund). Kortet vet ingenting om inloggning.
 */

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

import {
  IlluScenAllt,
  IlluScenCv,
  IlluScenMatris,
  RadIkon,
} from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY, type PlanKey, type PlanLength } from '@/lib/plans/plans'
import LangdVal from './LangdVal'
import {
  PAKET_KORT,
  PAKET_PLAN,
  VALJARE,
  alltPrisSub,
  planForLangd,
  type PaketId,
} from './paket-copy'

export interface PaketKortKnapp {
  text: string
  onClick: () => void
  disabled?: boolean
}

export interface PaketKortProps {
  paket: PaketId
  /** Mobilens "Paket 1 av 3". */
  nummer?: number
  /** Allt: vald längd. Utelämnad styr kortet längden själv, vecka förvald. */
  langd?: PlanLength
  onLangd?: (langd: PlanLength, plan: PlanKey) => void
  /** Allt: visa längdvalet. Standard sant. */
  visaLangd?: boolean
  /** Längder som inte går att välja, till exempel dagen för en löpande kund. */
  inaktivaLangder?: readonly PlanLength[]
  /** Raden under längdvalet när ett läge är spärrat. */
  langdNot?: string
  /** Knappen. null döljer den. Utelämnad ger paketets standardknapp utan handling. */
  knapp?: PaketKortKnapp | null
  /** Ersätter raden under knappen. null tar bort den. */
  fotnot?: string | null
  /** Status i stället för knapp: "Du har det här paketet". */
  status?: string
  /** Egen prisrad, till exempel mellanskillnaden. */
  pris?: { belopp: string; sub: string }
  /** Textlänk under knappen eller statusen. */
  lank?: { text: string; onClick: () => void }
  id?: string
  className?: string
}

const SCEN = {
  cv: IlluScenCv,
  test: IlluScenMatris,
  allt: IlluScenAllt,
} as const

const SCEN_ALT: Record<PaketId, string> = {
  cv: 'CV med analysmarkeringar och poäng 74',
  test: 'Matrislogik med saknad ruta och en klocka',
  allt: 'Tre papper på tråden: CV, tester och jobb',
}

const TAG: Record<PaketId, string> = {
  cv: 'bg-cv-mjuk text-cv',
  test: 'bg-test-mjuk text-test',
  allt: 'bg-panel text-ink-1',
}

export default function PaketKort({
  paket,
  nummer,
  langd: langdProp,
  onLangd,
  visaLangd = true,
  inaktivaLangder,
  langdNot,
  knapp,
  fotnot,
  status,
  pris,
  lank,
  id,
  className,
}: PaketKortProps) {
  const copy = PAKET_KORT[paket]
  const allt = paket === 'allt'
  const Scen = SCEN[paket]

  const [egenLangd, setEgenLangd] = useState<PlanLength>('vecka')
  const langd = langdProp ?? egenLangd
  const plan: PlanKey = allt ? planForLangd(langd) : PAKET_PLAN[paket]
  const belopp = PLAN_BY_KEY[plan].amount

  function bytLangd(ny: PlanLength) {
    if (langdProp === undefined) setEgenLangd(ny)
    onLangd?.(ny, planForLangd(ny))
  }

  const knappen: PaketKortKnapp | null =
    knapp === null ? null : knapp ?? { text: copy.knapp, onClick: () => {} }
  const fot = fotnot === undefined ? copy.fotnot : fotnot

  const yta = allt ? 'text-white' : 'text-ink-1'
  const damp = allt ? 'text-ink-1-mjuk' : 'text-ink-2'
  const meta = allt ? 'text-ink-1-mjuk' : 'text-ink-3'
  const linje = allt ? 'border-ink-1-kant' : 'border-kant'

  return (
    <section
      id={id}
      aria-label={copy.namn}
      className={`flex flex-col overflow-hidden rounded-xl border ${
        allt ? 'border-ink-1 bg-ink-1' : 'border-kant bg-panel'
      } ${yta} ${className ?? ''}`}
    >
      {/* Topp: nummer på mobil, färgetikett, Rekommenderas. */}
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
        {nummer ? (
          <span className={`text-steg uppercase lg:hidden ${meta}`}>{VALJARE.nummer(nummer)}</span>
        ) : null}
        <span
          className={`rounded-md px-2 py-1 text-steg font-semibold uppercase ${TAG[paket]} ${
            allt && nummer ? 'hidden lg:inline-block' : ''
          }`}
        >
          {copy.tag}
        </span>
        {allt ? (
          <span className="ml-auto py-1 text-steg font-semibold uppercase text-ink-1-accent">
            {VALJARE.rekommenderas}
          </span>
        ) : null}
      </div>

      {/* Illustration, fäst i nederkant så namnen hamnar på samma höjd. */}
      <div className="flex h-[110px] items-end px-4 pt-2 sm:px-6 lg:h-[150px]">
        <Scen className="h-auto max-h-[100px] w-full lg:max-h-[140px]" title={SCEN_ALT[paket]} />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
        <h3 className="font-display text-[26px] font-bold leading-[30px] tracking-[-0.025em] lg:text-[30px] lg:leading-[34px]">
          {copy.namn}
        </h3>

        {/* Värdemeningen, en per skärmstorlek. */}
        <p className="mt-2 font-display text-[18px] font-semibold leading-6 tracking-[-0.01em] lg:hidden">
          {copy.vardeMobil}
        </p>
        <p className="mt-2 hidden font-display text-[18px] font-semibold leading-6 tracking-[-0.01em] lg:block">
          {copy.varde}
        </p>

        {/* För dig som: desktop på spåren, båda på Allt. */}
        {copy.fordigMobil ? (
          <p className={`mt-2 text-sm leading-[22px] lg:hidden ${damp}`}>{copy.fordigMobil}</p>
        ) : null}
        <p className={`mt-2 hidden text-sm leading-[22px] lg:block lg:min-h-[46px] ${damp}`}>
          {copy.fordig}
        </p>

        {/* Prisraden. */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="whitespace-nowrap font-display text-[40px] font-bold leading-[40px] tracking-[-0.03em] tabular-nums lg:text-[48px] lg:leading-[48px]">
            {pris ? pris.belopp : `${belopp} kr`}
          </span>
          {pris ? (
            <span className={`whitespace-pre-line text-meta ${meta}`}>{pris.sub}</span>
          ) : allt ? (
            <span className={`whitespace-pre-line text-meta ${meta}`}>{alltPrisSub(plan)}</span>
          ) : (
            <>
              <span className={`whitespace-pre-line text-meta lg:hidden ${meta}`}>
                {copy.prisSubMobil}
              </span>
              <span className={`hidden whitespace-pre-line text-meta lg:block ${meta}`}>
                {copy.prisSub}
              </span>
            </>
          )}
        </div>

        {allt && visaLangd ? (
          <div className="mt-3">
            <LangdVal
              label="Hur länge vill du ha Allt"
              value={langd}
              onChange={bytLangd}
              yta="ink"
              inaktiva={inaktivaLangder}
              langaEtiketter
            />
            {langdNot ? <p className={`mt-2 text-meta ${meta}`}>{langdNot}</p> : null}
          </div>
        ) : null}

        {/* Så här fungerar det. */}
        <div className={`mt-6 border-t pt-4 ${linje}`}>
          {/* Spårens etikett "Så här fungerar det" faller bort på mobil
              (sektion 2), Allt behåller sin "Utöver allt i ...". */}
          <p className={`mb-3 text-steg uppercase ${meta} ${allt ? '' : 'hidden lg:block'}`}>
            {copy.listEtikett}
          </p>
          <ul className="grid gap-3">
            {copy.rader.map((rad) => (
              <li
                key={rad.rubrik}
                className={`grid grid-cols-[28px_1fr] items-start gap-3 text-sm leading-5 ${
                  rad.mobil ? '' : 'hidden lg:grid'
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg ${
                    allt ? 'bg-ink-hover text-white' : 'bg-insunken text-ink-1'
                  }`}
                  aria-hidden="true"
                >
                  <RadIkon namn={rad.ikon} />
                </span>
                <span>
                  <span className="block font-semibold lg:hidden">{rad.rubrikMobil ?? rad.rubrik}</span>
                  <span className="hidden font-semibold lg:block">{rad.rubrik}</span>
                  <span className={`block text-[13px] leading-[18px] lg:hidden ${damp}`}>
                    {rad.textMobil ?? rad.text}
                  </span>
                  <span className={`hidden text-[13px] leading-[18px] lg:block ${damp}`}>
                    {rad.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Knappen sist i flödet men tryckt mot kortets fot. */}
        <div className="mt-auto pt-6">
          {status ? (
            <p
              className={`flex h-[52px] items-center justify-center rounded-lg border text-base font-semibold ${
                allt ? 'border-ink-1-kant' : 'border-kant-stark'
              }`}
              role="status"
            >
              {status}
            </p>
          ) : knappen ? (
            <button
              type="button"
              onClick={knappen.onClick}
              disabled={knappen.disabled}
              className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors disabled:opacity-40 ${
                allt
                  ? 'bg-panel text-ink-1 hover:bg-mark'
                  : 'bg-ink-1 text-white hover:bg-ink-hover'
              }`}
            >
              {knappen.text}
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          ) : null}

          {lank ? (
            <button
              type="button"
              onClick={lank.onClick}
              className={`mt-2 block w-full text-center text-sm font-medium underline underline-offset-4 ${
                allt ? 'decoration-ink-1-kant text-white' : 'decoration-kant-stark text-ink-1'
              }`}
            >
              {lank.text}
            </button>
          ) : null}

          {fot ? <p className={`mt-2 text-center text-xs ${meta}`}>{fot}</p> : null}
        </div>
      </div>
    </section>
  )
}
