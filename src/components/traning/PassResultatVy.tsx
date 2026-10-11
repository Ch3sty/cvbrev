'use client'

/**
 * P4 och S1: resultatet efter ett pass, ett riktat pass eller en
 * generalrepetition (spec-rummen 4.4 Resultatvy, konceptets P4 och S1).
 *
 * Avslöjas i fyra steg om 300 ms: (s1) ringen fylls och rubriken, (s2)
 * nivåskalan och de tre talen, (s3) meningen och tempokortet, (s4)
 * genomgången och "I morgon"-raden. Nivån kan sjunka och visas då lika
 * lugnt, med ordet om varför och utan rött (S1).
 *
 * Allt som står här kommer ur passResultat() (src/lib/traning/resultat.ts).
 */

import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import Rader, { Rad } from '@/components/rum/Rader'
import SektRubrik from '@/components/rum/SektRubrik'
import StatusRow from '@/components/shell/StatusRow'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import { KURVAN_HREF, kvittoHref } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { MilstolpeKort, PassResultat } from '@/lib/traning/resultat'
import type { Traningsstatus } from '@/lib/traning/klient'
import ImorgonKort from './ImorgonKort'
import { imorgonFranStatus } from './MatningResultatVy'
import Marke, { MARKE_FOR } from './Marke'
import Nivaskala from './Nivaskala'
import ResultatSkal, { TreTal } from './ResultatSkal'
import Staplar from './Staplar'

const R = PASS_COPY.resultat

export function MilstolpeKortVy({ m, lyft }: { m: MilstolpeKort; lyft?: boolean }) {
  return (
    <section
      aria-label={m.namn}
      className={`relative rounded-2xl border bg-papper p-4 ${lyft ? 'z-[2] -mt-[30px] border-[color:var(--lyft-kant)] shadow-lyft' : 'border-kant'}`}
    >
      <div className="flex items-center gap-3.5">
        <Marke typ={MARKE_FOR[m.nyckel]} storlek={48} />
        <div className="min-w-0">
          <p className="text-ey text-koppar-ink">{R.milstolpe.eyebrow}</p>
          <p className="mt-0.5 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{m.titel}</p>
        </div>
      </div>
      <div className="mt-3">
        <Link href={kvittoHref(m.nyckel)} className={KNAPP_SEKUNDAR}>
          {PASS_COPY.knapp.visaKvittot}
        </Link>
      </div>
    </section>
  )
}

export interface PassResultatVyProps {
  vm: PassResultat
  onGenomga: (start?: number) => void
  onTillbaka: () => void
  motion?: boolean
  /** Statusen efter passet, för "I morgon"-kortet (Testerna v2 4.2). Utan den visas bara statusraden. */
  status?: Traningsstatus | null
  betalande?: boolean
}

export default function PassResultatVy({ vm, onGenomga, onTillbaka, motion = true, status = null, betalande = true }: PassResultatVyProps) {
  const sista = vm.antal
  // "I morgon"-kortet efter varje pass: morgondagens tema, formen och tidpunkten.
  const imorgon = status ? imorgonFranStatus(status, { last: !betalande }) : null
  return (
    <ResultatSkal
      label={vm.eyebrow}
      kontext={vm.sparat}
      raknare={`${sista} / ${sista}`}
      motion={motion}
      onStang={onTillbaka}
      vagg={
        <>
          <div className="steg s1" role="status" aria-live="polite">
            <div className="mt-2 flex items-center gap-4">
              <Dagsring status="gjord" label={R.ringKlar} fyllAnimering storlek={64} />
              <div className="min-w-0">
                <p className="text-ey text-koppar-ljus">{vm.eyebrow}</p>
                <h1 className="text-h1-liten mt-1 text-vagg-ink">{vm.rubrik}</h1>
              </div>
            </div>
          </div>
          <div className="steg s2">
            {vm.skala ? (
              <Nivaskala
                className="mt-[18px]"
                nu={vm.skala.nu}
                fran={vm.skala.fran}
                sikte={vm.skala.sikte}
                etikettNu={vm.skala.etikettNu}
                etikettFran={vm.skala.etikettFran}
                aria={vm.skala.aria}
              />
            ) : null}
            <TreTal tal={vm.tal} />
            {/* Målet på egen rad, aldrig på skalan (copy-efter-lyftet avsnitt 4). */}
            {vm.malRad ? <p className="mt-3 text-sm font-medium text-vagg-ink">{vm.malRad}</p> : null}
          </div>
          {vm.mening ? <p className="steg s3 mt-3.5 text-meta text-vagg-mjuk">{vm.mening}</p> : null}
        </>
      }
      golv={
        <>
          <section
            aria-label={vm.kort.eyebrow}
            className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft"
          >
            <p className="text-ey text-ink-3">{vm.kort.eyebrow}</p>
            <p className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{vm.kort.titel}</p>
            {vm.kort.text ? <p className="mt-0.5 text-sm leading-[21px] text-ink-2">{vm.kort.text}</p> : null}
            <Staplar
              data={vm.kort.staplar}
              aria={R.tempo.aria(vm.kort.staplar.budget_s)}
              axel={{ start: R.tempo.axelStart, mitt: vm.kort.axelMitt, slut: R.tempo.axelSlut(vm.kort.staplar.staplar.length) }}
            />
          </section>
          {vm.milstolpe ? (
            <div className="steg s3">
              <MilstolpeKortVy m={vm.milstolpe} />
            </div>
          ) : null}
          <div className="steg s4">
            <SektRubrik as="h2">{R.genomgang.rubrik}</SektRubrik>
          </div>
          <div className="steg s4">
            <Rader label={R.genomgang.rubrik}>
              {vm.genomgang.rader.map((r) => (
                <Rad
                  key={r.index}
                  titel={r.titel}
                  meta={r.meta}
                  hoger={
                    <button type="button" onClick={() => onGenomga(r.index)} className={`${LANK} inline-flex min-h-11 items-center text-[13px]`}>
                      {R.genomgang.visa}
                    </button>
                  }
                />
              ))}
              {vm.genomgang.ratt > 0 ? (
                <button type="button" onClick={() => onGenomga()} className="block w-full text-left">
                  <Rad
                    titel={R.genomgang.allaRatt(vm.genomgang.ratt)}
                    meta={R.genomgang.allaRattMeta}
                    hoger={<IkonChev className="text-ink-3" />}
                  />
                </button>
              ) : null}
            </Rader>
          </div>
          {imorgon ? (
            <div className="steg s4">
              <ImorgonKort
                lyft={false}
                betalvagg={false}
                tema={imorgon.tema}
                passTid={imorgon.passTid}
                last={!betalande}
                format={imorgon.format}
                provdatum={imorgon.provdatum}
                dagarKvar={status?.dagarKvar ?? null}
              />
            </div>
          ) : null}
          <div className="steg s4">
            <StatusRow tone="warm" showDot wrap>
              <span className="text-ink-1">{vm.status}</span>
            </StatusRow>
          </div>
        </>
      }
      fot={
        <>
          <button
            type="button"
            onClick={vm.primar.handling === 'genomga' ? () => onGenomga(vm.genomgang.missar[0]) : onTillbaka}
            className={KNAPP_PRIMAR}
          >
            {vm.primar.etikett}
          </button>
          <Link href={KURVAN_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
            {PASS_COPY.knapp.visaKurvan}
          </Link>
        </>
      }
    />
  )
}
