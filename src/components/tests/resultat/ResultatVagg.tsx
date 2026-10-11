/**
 * Resultatets vägg (skiss Provbladet, avsnitt 3, steg s1 och s2): ringen,
 * rubriken med resultatet och tre tal. På dator i två spalter, ringen och
 * rubriken till vänster och talen till höger.
 *
 * Talen står som display-tal med en kort etikett under, aldrig i en
 * metarad. Utan tid per fråga (gamla sessioner) blir det tredje talet
 * snittet per fråga i stället för antalet över provets tid.
 */

import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Dagsring from '@/components/rum/Dagsring'
import { RESULTAT } from '@/lib/tester/copy'
import { minSek } from '@/lib/tester/resultat'

export interface ResultatVaggProps {
  brand: string
  /** "Testet klart" direkt efter testet, annars datumet. */
  eyebrow: string
  eyebrowKoppar: boolean
  ratt: number
  totalt: number
  pct: number
  tidSek: number
  minuter: number
  tredje: { tal: string; etikett: string }
  /** Raden under rubriken: ditt bästa på nivån. */
  rad?: string | null
}

function Tal({ tal, etikett }: { tal: string; etikett: string }) {
  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap font-display text-[22px] font-bold leading-6 tracking-[-0.02em] text-vagg-ink tabular-nums min-[400px]:text-[28px] min-[400px]:leading-[30px]">{tal}</p>
      <p className="mt-1 text-xs leading-4 text-vagg-mjuk">{etikett}</p>
    </div>
  )
}

export default function ResultatVagg(p: ResultatVaggProps) {
  return (
    <Vagg>
      <Topprad brand={p.brand} />
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="steg s1 mt-2 flex items-center gap-4 lg:gap-5" role="status">
          <Dagsring status="gjord" storlek={64} fyllAnimering label={RESULTAT.klart} />
          <div className="min-w-0">
            <p className={`text-ey ${p.eyebrowKoppar ? 'text-koppar-ljus' : 'text-vagg-mjuk'}`}>{p.eyebrow}</p>
            <h1 className="text-h1-liten mt-1 text-vagg-ink">{RESULTAT.rubrik(p.ratt, p.totalt, p.pct)}</h1>
            {p.rad ? (
              <p className="mt-2 hidden text-[15px] leading-[22px] text-vagg-mjuk lg:block">
                <b className="font-semibold text-vagg-ink">{p.rad}</b>
              </p>
            ) : null}
          </div>
        </div>
        <div className="steg s2 mt-4 grid grid-cols-3 gap-2 lg:mt-0">
          <Tal tal={`${p.ratt} av ${p.totalt}`} etikett={RESULTAT.tre.ratt} />
          <Tal tal={minSek(p.tidSek)} etikett={RESULTAT.tre.tid(p.minuter)} />
          <Tal tal={p.tredje.tal} etikett={p.tredje.etikett} />
        </div>
      </div>
      {p.rad ? (
        <p className="steg s3 mt-3.5 text-sm leading-[21px] lg:hidden">
          <b className="font-semibold text-vagg-ink">{p.rad}</b>
        </p>
      ) : null}
    </Vagg>
  )
}
