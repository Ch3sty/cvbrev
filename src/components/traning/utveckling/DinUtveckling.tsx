/**
 * Din utveckling i Rekryteringstester (skiss Provbladet v3, avsnitt 2):
 * nivåkurvan på väggen, fyra kort på golvet (Var du står, Nivåerna, Var du
 * tappar, Tempo) och små multiplar för de klassiska testerna. Utan något
 * gjort test: det tomma läget med IlluTomtUtveckling.
 *
 * ---------------------------------------------------------------- PROPS ---
 *
 *   <DinUtveckling
 *     data={{
 *       idag,          // Dag, svensk tid: dagSthlm()
 *       kurva,         // UtvecklingKurva | null: kurvaUrStatus(await hamtaTraningsstatus(...))
 *       perTest,       // Record<TestSlug, PerTestStats>: getTesterHubData(...).perTest
 *       hasHistory,    // boolean: scopeHasFeature(scope, 'test_history')
 *       varDuStar,     // VarDuStarNiva[]: await hamtaVarDuStar(admin, user.id)
 *       familjer,      // Familjestatistik[] | null  } await hamtaMotordata(admin, user.id)
 *       tempo,         // UtvecklingTempo | null     }
 *     }}
 *     topprad={<Topprad ... />}   // valfri: väggens topprad, ritas först på väggen
 *     flikar={<TesterTabs ... />} // valfri: flikraden, står efter golvets första rad
 *   />
 *
 * Alla serverfunktioner ligger i ./data.server.ts (hamtaVarDuStar,
 * hamtaMotordata) och ./berakna.ts (kurvaUrStatus). Typerna i ./typer.ts.
 * Komponenten har inga hooks och kan renderas som server component; i-knapparna
 * (HjalpKnapp) är klientkomponenter och läser HjalpProvider om sidan har en.
 *
 * Layout: väggen (Vagg) bär rubriken och kurvan. Golvet är ett rutnät: på
 * mobil Var du står (lyft), flikarna, Nivåerna, Var du tappar, Tempo, små
 * multiplar; på dator Var du står och Nivåerna lyfta i första raden, sedan
 * flikarna, sedan Var du tappar och Tempo, sist små multiplar.
 * --------------------------------------------------------------------------
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import Vagg from '@/components/rum/Vagg'
import Rubrik from '@/components/rum/Rubrik'
import Golv from '@/components/rum/Golv'
import { HjalpKnapp } from '@/components/hjalp'
import { IlluTomtUtveckling } from '@/components/traning/illu'
import { KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { UTV } from './copy'
import { UKort } from './delar'
import Nivavagg from './Nivavagg'
import VarDuStar from './VarDuStar'
import Nivaerna from './Nivaerna'
import VarDuTappar from './VarDuTappar'
import Tempo from './Tempo'
import SmaMultiplar from './SmaMultiplar'
import type { DinUtvecklingData } from './typer'

export type { DinUtvecklingData } from './typer'

export interface DinUtvecklingProps {
  data: DinUtvecklingData
  /** Väggens topprad (Topprad). Utelämnad: ingen. */
  topprad?: ReactNode
  /** Flikraden. Står efter golvets första rad, som i skissen. */
  flikar?: ReactNode
}

/** Har hon gjort något alls som Din utveckling kan visa? */
export function harUtveckling(d: Pick<DinUtvecklingData, 'kurva' | 'perTest'>): boolean {
  return !!d.kurva || Object.values(d.perTest).some((s) => (s?.attempts ?? 0) > 0)
}

function RubrikMedHjalp({ rad }: { rad: string }) {
  return (
    <div className="relative">
      <Rubrik
        titel={UTV.rubrik}
        liten
        rad={
          <span className="inline-flex items-center gap-1">
            {rad}
            <HjalpKnapp id="C2" etikett={UTV.kurvaHjalp} className="text-vagg-mjuk hover:text-vagg-ink" />
          </span>
        }
      />
    </div>
  )
}

function Tomt({ topprad, flikar }: { topprad?: ReactNode; flikar?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col" data-utv-lage="tomt">
      <Vagg>
        {topprad}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <Rubrik titel={UTV.rubrik} liten rad={UTV.tomt.text} />
          <div className="illu-vagg mx-auto w-full max-w-[200px] text-vagg-ink lg:mx-0 lg:w-60 lg:max-w-none">
            <IlluTomtUtveckling className="h-24 w-full lg:h-auto" />
          </div>
        </div>
      </Vagg>
      <Golv lyft>
        <UKort label={UTV.tomt.titel} lyft className="-mt-[30px]" data="tomt">
          <h2 className="text-kort-t text-ink-1">{UTV.tomt.titel}</h2>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Link href={TRANING_RUTT.matning} className={`${KNAPP_PRIMAR} lg:w-auto`}>
              {UTV.tomt.knapp}
            </Link>
            <Link href={TRANING_RUTT.alla} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
              {UTV.tomt.lank}
            </Link>
          </div>
        </UKort>
        {flikar}
      </Golv>
    </div>
  )
}

export default function DinUtveckling({ data, topprad, flikar }: DinUtvecklingProps) {
  if (!harUtveckling(data)) return <Tomt topprad={topprad} flikar={flikar} />
  const k = data.kurva

  return (
    <div className="flex flex-1 flex-col" data-utv-lage={k ? 'kurva' : 'klassiska'}>
      <Vagg>
        {topprad}
        <RubrikMedHjalp rad={k ? UTV.rad : UTV.radUtanKurva} />
        {k ? (
          <Nivavagg k={k} idag={data.idag} />
        ) : (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-vagg-kant bg-white/5 p-3.5 lg:max-w-[640px]">
            <p className="text-sm leading-[21px] text-vagg-mjuk">
              <b className="font-semibold text-vagg-ink">{UTV.utanKurva.titel}</b> {UTV.utanKurva.text}
            </p>
            <Link href={TRANING_RUTT.matning} className={`${LANK_VAGG} inline-flex min-h-11 items-center self-start`}>
              {UTV.utanKurva.knapp}
            </Link>
          </div>
        )}
      </Vagg>
      <Golv lyft>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <VarDuStar nivaer={data.varDuStar} className="order-1 -mt-[30px]" />
          {flikar ? <div className="order-2 lg:order-3 lg:col-span-2">{flikar}</div> : null}
          <Nivaerna perTest={data.perTest} hasHistory={data.hasHistory} lyft className="order-3 lg:order-2 lg:-mt-[30px]" />
          <VarDuTappar familjer={data.familjer} className="order-4" />
          <Tempo tempo={data.tempo} className="order-5" />
          <SmaMultiplar perTest={data.perTest} className="order-6 lg:col-span-2" />
        </div>
      </Golv>
    </div>
  )
}
