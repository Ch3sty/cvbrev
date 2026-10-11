'use client'

/**
 * O1: veckans ommätning med före och efter i samma ram (spec-rummen 4.4 och
 * 6 våg 3b, konceptets O1).
 *
 * Rubriken jämför med vad passen räknat fram ("5,8. Passen hade räknat dig
 * till 5,7."), skalan visar mätningens punkt och var du är nu, talen säger
 * förflyttningen sedan mätningen, och kurvan får den nya, tyngre punkten som
 * enda rörelse. Milstolpen (oftast Första veckan) är det lyfta kortet när
 * den nåtts, och nästa ommätning står som datum.
 *
 * Kurvan: KurvaTillfallig tills våg 2:s Kurva finns (byts vid
 * sammanslagningen, se importen).
 */

import StatusRow from '@/components/shell/StatusRow'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { OmmatningResultat } from '@/lib/traning/resultat'
import type { Traningsstatus } from '@/lib/traning/klient'
// ersätts av Kurva från våg 2 vid sammanslagningen
import Kurva from './KurvaTillfallig'
import Nivaskala from './Nivaskala'
import { MilstolpeKortVy } from './PassResultatVy'
import ResultatSkal, { TreTal } from './ResultatSkal'

const O = PASS_COPY.ommatning

export interface OmmatningResultatVyProps {
  vm: OmmatningResultat
  status: Traningsstatus | null
  antal: number
  onTillbaka: () => void
  motion?: boolean
}

export default function OmmatningResultatVy({ vm, status, antal, onTillbaka, motion = true }: OmmatningResultatVyProps) {
  const start = vm.forsta?.dag ?? status?.punkter[0]?.dag ?? null
  return (
    <ResultatSkal
      label={O.eyebrow}
      kontext={PASS_COPY.resultat.sparat.ommatning}
      raknare={`${antal} / ${antal}`}
      motion={motion}
      onStang={onTillbaka}
      vagg={
        <>
          <div className="steg s1" role="status" aria-live="polite">
            <p className="mt-2 text-ey text-koppar-ljus">{O.eyebrow}</p>
            <h1 className="text-h1-liten mt-1 text-vagg-ink">{vm.rubrik}</h1>
          </div>
          <div className="steg s2">
            <Nivaskala
              className="mt-[18px]"
              layout="fore-efter"
              nu={vm.skala.nu}
              fran={vm.skala.fran}
              sikte={vm.skala.sikte}
              etikettNu={`Nu ${vm.niva.toFixed(1).replace('.', ',')}`}
              etikettFranOvan={vm.skala.franEtikett}
              aria={vm.skala.aria}
            />
            <TreTal tal={vm.tal} />
          </div>
          {status && start && status.punkter.length > 1 ? (
            <div className="steg s3">
              <p className="mt-[22px] text-ey text-vagg-mjuk">{O.kurvaRubrik}</p>
              <Kurva
                punkter={status.punkter}
                plan={status.plandagar}
                idag={status.idag}
                start={start}
                prov={status.plan?.provdatum ?? null}
                sikte={vm.skala.sikte}
                nyPunkt
                ariaLabel={vm.skala.aria}
              />
            </div>
          ) : null}
        </>
      }
      golv={
        <>
          {vm.milstolpe ? (
            <div className="steg s4">
              <MilstolpeKortVy m={vm.milstolpe} lyft />
            </div>
          ) : null}
          <div className={`steg s4 ${vm.milstolpe ? '' : 'relative z-[2] -mt-[30px] rounded-xl shadow-lyft'}`}>
            <StatusRow tone="warm" showDot wrap>
              <span className="text-ink-1">{vm.status}</span>
            </StatusRow>
          </div>
        </>
      }
      fot={
        <button type="button" onClick={onTillbaka} className={KNAPP_PRIMAR}>
          {PASS_COPY.knapp.tillbaka}
        </button>
      }
    />
  )
}
