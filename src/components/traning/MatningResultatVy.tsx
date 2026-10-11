'use client'

/**
 * M1: nivåmätningens resultat med betalväggen (spec-rummen 4.4, konceptets
 * M1, ägarens gratisnivå 17.2).
 *
 * Resultatet visas helt för alla: nivån som stort heltal (spec 14.1:
 * decimalen bara på kurvan) på instrumentet, meningen i provets termer, tre
 * tal, var du tappar, och planen till datumet. Gratis: dagens grundpass står
 * först och är gratis, allt efter i dag står låst med "Ingår i Premium", och
 * betalväggen sist på golvet bär vyns enda kopparknapp ("Köp Premium, 149 kr
 * i månaden") under prisraden med fulla namnet, och en textlänk under. Ingen fot för gratis (art-director 20.2 fråga 1: en fast
 * fot ligger aldrig ovanpå en betalvägg). Betalande: ingen betalvägg,
 * kopparknappen i foten.
 *
 * Decimalen står under pricken på skalan (testansvarig 19.2 fråga 2), heltalet
 * stort ovanför.
 *
 * betalvagg_visad (plats matning) skickas en gång per montering när kortet
 * visas. Köpknappen bär platsen till köpsteget.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { Rad } from '@/components/rum/Rader'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { passHref } from '@/lib/traning/klient'
import { nivaText, PASS_COPY } from '@/lib/traning/pass-copy'
import type { MatningResultat } from '@/lib/traning/resultat'
import Nivaskala from './Nivaskala'
import Plan from './Plan'
import ResultatSkal, { TreTal } from './ResultatSkal'

const M = PASS_COPY.matning

export interface MatningResultatVyProps {
  vm: MatningResultat
  antal: number
  onTillbaka: () => void
  /** Siktets ändra-länk (inställningarna, våg 2). */
  sikteHref?: string
  motion?: boolean
}

/**
 * "Var du tappar" som lyft kort: M1 och O1 utan milstolpe (art-director 20.2
 * fråga 8, samma komponent).
 */
export function VarDuTapparKort({
  eyebrow,
  familjer,
  className,
}: {
  eyebrow: string
  familjer: MatningResultat['familjer']
  className?: string
}) {
  return (
    <section
      aria-label={eyebrow}
      className={`relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft ${className ?? ''}`}
    >
      <p className="text-ey text-ink-3">{eyebrow}</p>
      {familjer.length ? (
        <div className="-mx-4 -mb-2 [&>*+*]:border-t [&>*+*]:border-kant">
          {familjer.map((f, i) => (
            <Rad key={i} titel={f.titel} meta={f.meta} stapel={f.andel != null && f.ton ? { andel: f.andel, ton: f.ton } : undefined} />
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{M.ingaFamiljer}</p>
      )}
    </section>
  )
}

export default function MatningResultatVy({ vm, antal, onTillbaka, sikteHref = '/dashboard/tester/installningar#sikte', motion = true }: MatningResultatVyProps) {
  const visad = useRef(false)
  const harVagg = vm.betalvagg != null
  useEffect(() => {
    if (!harVagg || visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'matning', dagar_kvar: vm.dagarKvar })
  }, [harVagg, vm.dagarKvar])

  return (
    <ResultatSkal
      label={M.eyebrow}
      kontext={PASS_COPY.resultat.sparat.matning}
      raknare={`${antal} / ${antal}`}
      motion={motion}
      onStang={onTillbaka}
      vagg={
        <>
          <div className="steg s1" role="status" aria-live="polite">
            <p className="mt-2 text-ey text-koppar-ljus">{M.eyebrow}</p>
            <p className="text-tal-stor mt-1 text-vagg-ink">
              {vm.heltal}
              <span className="ml-2 align-baseline font-display text-[22px] font-bold tracking-normal text-vagg-mjuk">{M.av10}</span>
            </p>
            <p className="mt-2.5 max-w-[36ch] text-[15px] leading-[22px] text-vagg-mjuk">{vm.mening}</p>
          </div>
          <div className="steg s2">
            <Nivaskala
              className="mt-[18px]"
              nu={vm.skala.nu}
              sikte={vm.skala.sikte}
              etikettNu="Du"
              etikettUnder={nivaText(vm.skala.nu)}
              siktLank={vm.skala.sikte != null ? { href: sikteHref, etikett: `Sikte ${nivaText(vm.skala.sikte)}`, verb: 'ändra' } : null}
              aria={vm.skala.aria}
            />
            <TreTal tal={vm.tal} />
            {vm.siktetMening ? <p className="mt-3 text-meta text-vagg-mjuk">{vm.siktetMening}</p> : null}
          </div>
        </>
      }
      golv={
        <>
          <VarDuTapparKort eyebrow={M.varDuTappar} familjer={vm.familjer} className="steg s3" />
          <section aria-label={vm.planRubrik} className="steg s4 rounded-2xl border border-kant bg-papper p-4">
            <p className="text-ey text-ink-3">{vm.planRubrik}</p>
            <Plan rader={vm.plan} />
          </section>
          {vm.betalvagg ? (
            // Gratis (art-director 20.2 fråga 1): betalväggen bär sin egen knapp
            // och är sista elementet på golvet. Ingen fast fot ovanpå resultatet;
            // hela resultatet läses före priset.
            <section
              aria-label={vm.betalvagg.eyebrow}
              className="steg s4 rounded-2xl border border-kant bg-papper p-4"
            >
              <p className="text-ey text-koppar-ink">{vm.betalvagg.eyebrow}</p>
              <h2 className="mt-1 text-kort-t text-ink-1">{vm.betalvagg.rubrik}</h2>
              <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{vm.betalvagg.text}</p>
              <p className="mt-2 text-sm font-medium text-ink-1">{vm.betalvagg.prisrad}</p>
              <div className={KNAPPRAD}>
                <Link
                  href={kopstegHref(SALD_PLAN, 'matning')}
                  className={KNAPP_PRIMAR}
                  onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: SALD_PLAN, surface: 'matning', cta: 'primary', plats: 'matning' })}
                >
                  {vm.betalvagg.knapp}
                </Link>
                {vm.betalvagg.lankTill === 'grundpass' ? (
                  <Link
                    href={passHref('pass')}
                    className={`${LANK} inline-flex min-h-9 items-center justify-center`}
                    onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', surface: 'matning', cta: 'secondary', plats: 'matning' })}
                  >
                    {vm.betalvagg.lank}
                  </Link>
                ) : (
                  <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                    {vm.betalvagg.lank}
                  </button>
                )}
              </div>
            </section>
          ) : null}
        </>
      }
      fot={
        vm.betalvagg ? undefined : (
          <>
            <Link href={passHref('pass')} className={KNAPP_PRIMAR}>
              {PASS_COPY.knapp.startaPass}
            </Link>
            <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {PASS_COPY.knapp.tillbaka}
            </button>
          </>
        )
      }
    />
  )
}
