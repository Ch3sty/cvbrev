/**
 * Resultatets vägg (skiss Provbladet, avsnitt 3, steg s1 och s2): ringen,
 * rubriken med resultatet och två tal. På dator i två spalter, ringen och
 * rubriken till vänster och talen till höger.
 *
 * Ett huvudtal (art-director 2026-10-11, beslut 2): rubriken säger
 * "12 av 15 rätt", ringen fylls till andelen och bär procenten (bara i
 * aria-label), och bredvid står tiden och tempot som display-tal med en
 * kort etikett under. Antalet fel är Genomgångens rubrik och står inte
 * här. Utan tid per fråga (gamla sessioner) blir tempot snittet per fråga.
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
  /** Tempot: antalet över provets tid, eller snittet per fråga. */
  tempo: { tal: string; etikett: string }
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
          <Dagsring
            status="gjord"
            storlek={64}
            fyllAnimering
            andel={p.totalt > 0 ? p.ratt / p.totalt : 0}
            label={RESULTAT.ringAria(p.ratt, p.totalt, p.pct)}
          />
          <div className="min-w-0">
            <p className={`text-ey ${p.eyebrowKoppar ? 'text-koppar-ljus' : 'text-vagg-mjuk'}`}>{p.eyebrow}</p>
            <h1 className="text-h1-liten mt-1 text-vagg-ink">{RESULTAT.rubrik(p.ratt, p.totalt)}</h1>
            {p.rad ? (
              <p className="mt-2 hidden text-[15px] leading-[22px] text-vagg-mjuk lg:block">
                <b className="font-semibold text-vagg-ink">{p.rad}</b>
              </p>
            ) : null}
          </div>
        </div>
        <div className="steg s2 mt-4 grid grid-cols-2 gap-2 lg:mt-0">
          <Tal tal={minSek(p.tidSek)} etikett={RESULTAT.tre.tid(p.minuter)} />
          <Tal tal={p.tempo.tal} etikett={p.tempo.etikett} />
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
