'use client'

/**
 * M1: nivåmätningens resultat med betalväggen (spec-rummen 4.4, konceptets
 * M1, ägarens gratisnivå 17.2).
 *
 * Resultatet visas helt för alla: nivån som stort heltal (spec 14.1:
 * decimalen bara på kurvan) på instrumentet, meningen i provets termer, tre
 * tal, var du tappar, och planen till datumet. Gratis: dagens grundpass står
 * först och är gratis, allt efter i dag står låst med paketets namn, kortet
 * säger vad som ingår och foten bär vyns enda kopparknapp (Köp, namn, pris). Det
 * sekundära är en textlänk. Betalande: ingen betalvägg, kopparknappen i
 * foten.
 *
 * betalvagg_visad (plats matning) skickas när kortet visas.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { Rad } from '@/components/rum/Rader'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { passHref } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
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

export default function MatningResultatVy({ vm, antal, onTillbaka, sikteHref = '/dashboard/tester/installningar#sikte', motion = true }: MatningResultatVyProps) {
  useEffect(() => {
    if (vm.betalvagg) capture('betalvagg_visad', { plats: 'matning', dagar_kvar: vm.dagarKvar })
  }, [vm.betalvagg, vm.dagarKvar])

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
              siktLank={vm.skala.sikte != null ? { href: sikteHref, text: `Sikte ${String(vm.skala.sikte.toFixed(1)).replace('.', ',')}, ändra` } : null}
              aria={vm.skala.aria}
            />
            <TreTal tal={vm.tal} />
            {vm.siktetMening ? <p className="mt-3 text-meta text-vagg-mjuk">{vm.siktetMening}</p> : null}
          </div>
        </>
      }
      golv={
        <>
          <section
            aria-label={M.varDuTappar}
            className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft"
          >
            <p className="text-ey text-ink-3">{M.varDuTappar}</p>
            {vm.familjer.length ? (
              <div className="-mx-4 -mb-2 [&>*+*]:border-t [&>*+*]:border-kant">
                {vm.familjer.map((f, i) => (
                  <Rad
                    key={i}
                    titel={f.titel}
                    meta={f.meta}
                    stapel={f.andel != null && f.ton ? { andel: f.andel, ton: f.ton } : undefined}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{M.ingaFamiljer}</p>
            )}
          </section>
          <section aria-label={vm.planRubrik} className="steg s4 rounded-2xl border border-kant bg-papper p-4">
            <p className="text-ey text-ink-3">{vm.planRubrik}</p>
            <Plan rader={vm.plan} />
          </section>
          {vm.betalvagg ? (
            <section
              aria-label={vm.betalvagg.eyebrow}
              className="steg s4 rounded-2xl border border-koppar bg-papper p-4 shadow-[inset_0_0_0_1px_var(--koppar)]"
            >
              <p className="text-ey text-koppar-ink">{vm.betalvagg.eyebrow}</p>
              <h2 className="mt-1 text-kort-t text-ink-1">{vm.betalvagg.rubrik}</h2>
              <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{vm.betalvagg.text}</p>
            </section>
          ) : null}
        </>
      }
      fot={
        vm.betalvagg ? (
          // Gratis: betalväggens knapp står i foten, så att vyns enda
          // kopparknapp är inom viewport på Pixel 7 (spec 6 våg 3b acceptans
          // 8). Kortet på golvet säger vad som ingår.
          <>
            <Link
              href={kopstegHref('all_month')}
              className={KNAPP_PRIMAR}
              onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: 'all_month', surface: 'matning', cta: 'primary' })}
            >
              {vm.betalvagg.knapp}
            </Link>
            <Link
              href={passHref('pass')}
              className={`${LANK} inline-flex min-h-9 items-center justify-center`}
              onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', surface: 'matning', cta: 'secondary' })}
            >
              {vm.betalvagg.lank}
            </Link>
          </>
        ) : (
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
