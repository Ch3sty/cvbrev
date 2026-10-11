'use client'

/**
 * M1: nivåmätningens resultat med betalväggen (spec-rummen 4.4, konceptets
 * M1, ägarens gratisnivå 17.2).
 *
 * Resultatet visas helt för alla: nivån som stort heltal (spec 14.1:
 * decimalen bara på kurvan) på instrumentet, meningen i provets termer, tre
 * tal, var du tappar, och planen till datumet. Gratis: dagens grundpass står
 * först och är gratis, allt efter i dag står låst med "Ingår i Premium", och
 * betalväggen sist på golvet bär vyns enda kopparknapp (kopKnapp) under
 * prisraden med fulla namnet, och en textlänk under. Ingen fot för gratis (art-director 20.2 fråga 1: en fast
 * fot ligger aldrig ovanpå en betalvägg). Betalande: ingen betalvägg,
 * kopparknappen i foten.
 *
 * Det stora heltalet bär värdet; skalan har ingen etikett vid punkten och
 * ingen decimal under den. Målet står aldrig på skalan (bara triangeln), utan
 * på en egen rad under de tre talen (copy-efter-lyftet avsnitt 4).
 *
 * betalvagg_visad (plats matning) skickas en gång per montering när kortet
 * visas. Köpknappen bär platsen till köpsteget.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { Rad } from '@/components/rum/Rader'
import StatusRow from '@/components/shell/StatusRow'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { antalTid, ovningsformat } from '@/lib/ovningsprov/format'
import { passHref, type Traningsstatus } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { MatningResultat } from '@/lib/traning/resultat'
import { datumText } from '@/lib/traning/rubrik'
import type { PassTid } from '@/lib/traning/testplan'
import ImorgonKort from './ImorgonKort'
import Nivaskala from './Nivaskala'
import ResultatSkal, { TreTal } from './ResultatSkal'

const M = PASS_COPY.matning

export interface MatningResultatVyProps {
  vm: MatningResultat
  antal: number
  /** Statusen efter Nivåkollen: morgondagens tema, planen och tidpunkten. */
  status?: Traningsstatus | null
  onTillbaka: () => void
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
  lyft = true,
}: {
  eyebrow: string
  familjer: MatningResultat['familjer']
  className?: string
  /** Lyft kort direkt under väggen (M1 och O1 utan milstolpe). Under "I morgon" står det platt. */
  lyft?: boolean
}) {
  return (
    <section
      aria-label={eyebrow}
      className={`rounded-2xl border bg-papper p-4 ${
        lyft ? 'relative z-[2] -mt-[30px] border-[color:var(--lyft-kant)] shadow-lyft' : 'border-kant'
      } ${className ?? ''}`}
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

/** Det I morgon-kortet behöver ur statusen (Testerna v2, skiss 5). */
export function imorgonFranStatus(status: Traningsstatus | null, opt: { last: boolean; reservTema?: string | null }) {
  const plan = status?.plan ?? null
  const provdatum = plan?.provdatum ?? null
  const f = ovningsformat('logik', plan?.leverantor ?? null, plan?.variant ?? null)
  const tema = familjNamn(status?.dagensTema ?? null) ?? opt.reservTema ?? null
  return {
    tema,
    passTid: (plan?.pass_tid ?? null) as PassTid | null,
    format: `${f.namn ? `samma format som ${f.namn}` : 'vårt format'}, ${antalTid(f)}`,
    provdatum: provdatum ? datumText(provdatum) : null,
    status: opt.last ? (provdatum ? PASS_COPY.efterNivakollen.gratisDatum : PASS_COPY.efterNivakollen.gratis) : PASS_COPY.efterNivakollen.betalande,
  }
}

export default function MatningResultatVy({ vm, antal, status = null, onTillbaka, motion = true }: MatningResultatVyProps) {
  const imorgon = imorgonFranStatus(status, { last: vm.betalvagg != null, reservTema: vm.familjer.find((x) => x.andel != null)?.titel ?? null })
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
              aria={vm.skala.aria}
            />
            <TreTal tal={vm.tal} />
            {/* Målet på egen rad. Länken M.malAndra visas inte än: inställningarna
                saknar avsnittet för målet (ankaret #sikte finns inte), så länken
                kommer när inställningen "Ditt mål" är byggd. */}
            {vm.malRad ? <p className="mt-3 text-sm font-medium text-vagg-ink">{vm.malRad}</p> : null}
            {vm.siktetMening ? <p className="mt-3 text-meta text-vagg-mjuk">{vm.siktetMening}</p> : null}
          </div>
        </>
      }
      golv={
        <>
          {/* Dag 1-slutet (Testerna v2, skiss 5): "I morgon" med temat, formen
              och tidpunkten som lyft kort. Gratis: passet låst men synligt,
              betalväggen med formatet och datumet i samma kort, som sista
              kopparn på golvet. Ingen fast fot ovanpå en betalvägg. */}
          <ImorgonKort
            className="steg s3"
            forsta
            tema={imorgon.tema}
            passTid={imorgon.passTid}
            last={vm.betalvagg != null}
            format={imorgon.format}
            provdatum={imorgon.provdatum}
            dagarKvar={vm.dagarKvar}
            lank={
              vm.betalvagg
                ? vm.betalvagg.lankTill === 'grundpass'
                  ? { text: vm.betalvagg.lank, href: passHref('pass') }
                  : { text: vm.betalvagg.lank, onClick: onTillbaka }
                : null
            }
          />
          <VarDuTapparKort eyebrow={M.varDuTapparNivakollen} familjer={vm.familjer} className="steg s4" lyft={false} />
          <div className="steg s4">
            <StatusRow tone="warm" showDot wrap>
              <span className="text-ink-1">{imorgon.status}</span>
            </StatusRow>
          </div>
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
