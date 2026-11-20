'use client'

/**
 * Nästa steg (utkast v4 avsnitt 2, skissen Hem A): den första hinten ur
 * datan som vyns lyfta kort. "Nästa steg" och skälets kategori, rubrik
 * (handlingen), skäl ur datan, en knapp och ett kort tips. Samma kort ligger
 * överst i Tester.
 *
 * På Hem står typens nivåband till höger (på mobil mellan texten och
 * knappen): nivån, osäkerhetsbandet, zonerna Grund, Avancerad och Expert och
 * en förklaringsrad. Koppar bara i knappen och bandet.
 *
 * Knappen öppnar testtypens meny på Tester eller startar Nivåkollen direkt
 * (hintLank.ts). Kräver knappen Premium står "Ingår i Premium" med lås.
 * Första steget (ny användare, plan från en artikel) går att stänga.
 */

import Link from 'next/link'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { IkonLas, IkonPil, IkonX } from '@/components/illustrations/RumSymboler'
import Nivaband from '@/components/tester-v4/Nivaband'
import { SIDKORT_KLASS } from '@/components/tester-v4/SidKort'
import TypSymbol from '@/components/tester-v4/tester/TypSymbol'
import { IngarChip } from '@/components/tester-v4/tester/TesttypKort'
import { NIVAKOLL_FINNS } from '@/lib/tester/v4/rutter'
import { nivakollOmfang } from '@/lib/nivakoll/omfang'
import { talord } from '@/lib/traning/copy'
import { kortDatum } from '@/lib/traning/rubrik'
import type { Dag, Hint, TesttypKort } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { hintEtikett, hintHref } from './hintLank'
import type { NivaKalla } from './hemData'
import { hintKlickad, useHintStangd, type HintKontext } from './HintSparning'

export { hintEtikett, hintHref } from './hintLank'

const TOM_KONTEXT: HintKontext = { planTest: null, planTyper: [] }

/** Förklaringsraden under bandet. Ren, testas. */
export function bandForklaring(kort: Pick<TesttypKort, 'id' | 'niva' | 'senasteNivakoll' | 'ingarIPlan'>, kalla: NivaKalla | null = null): string {
  const B = HEM_V4.nastaBand
  if (kort.niva.status === 'paborjad') return B.paborjad
  if (kort.niva.status !== 'matt') {
    const o = NIVAKOLL_FINNS[kort.id] ? nivakollOmfang(kort.id) : null
    return o ? B.omatt(talord(o.minuter)) : B.omattUtanNivakoll
  }
  const fran =
    kalla?.slag === 'trana'
      ? B.efterTraning(kortDatum(kalla.dag))
      : kalla?.slag === 'nivatest'
        ? B.nivatest(kortDatum(kalla.dag))
        : kalla || kort.senasteNivakoll
          ? B.matt(kortDatum((kalla?.dag ?? kort.senasteNivakoll) as Dag))
          : B.utanDag
  return `${fran}${kort.ingarIPlan ? B.provetsNiva : ''}`
}

function TypBand({ kort, planNamn, kalla }: { kort: TesttypKort; planNamn: string | null; kalla: NivaKalla | null }) {
  return (
    <div className="grid gap-2.5 rounded-[14px] bg-papper-2 px-4 pb-3.5 pt-4 lg:px-[18px]" data-nasta-band={kort.id}>
      <div className="flex items-center gap-3">
        <TypSymbol typ={kort.id} size={40} />
        <div className="grid min-w-0 gap-1">
          <b className="text-[15px] font-semibold leading-5 text-ink-1">{kort.namn}</b>
          {planNamn && kort.ingarIPlan ? <IngarChip namn={planNamn} /> : null}
        </div>
      </div>
      <Nivaband namn={kort.namn} typ={kort.id} lage={kort.niva} storlek="mellan" ton={!planNamn || kort.ingarIPlan ? 'koppar' : 'neutral'} />
      <p className="text-[12.5px] leading-[17px] text-ink-3">{bandForklaring(kort, kalla)}</p>
    </div>
  )
}

export default function NastaSteg({
  hint,
  kontext = TOM_KONTEXT,
  utanOverlapp,
  className,
  typ,
  planNamn = null,
  nivaKalla = null,
}: {
  hint: Hint | null | undefined
  kontext?: HintKontext
  /** Utan överlappet mot väggen, när kortet inte står direkt under den. */
  utanOverlapp?: boolean
  className?: string
  /** Hem: hintens testtyp, för nivåbandet till höger. */
  typ?: TesttypKort | null
  planNamn?: string | null
  /** Var typens nivå kommer ifrån, för förklaringsraden. */
  nivaKalla?: NivaKalla | null
}) {
  const [stangd, stang] = useHintStangd(hint?.id ?? '')
  if (!hint || (hint.stangbar && stangd)) return null
  const las = hint.knapp.las
  const band = typ ? <TypBand kort={typ} planNamn={planNamn} kalla={nivaKalla} /> : null
  return (
    <LyftKort label={HEM_V4.nastaSteg} utanOverlapp={utanOverlapp} className={`${SIDKORT_KLASS} ${className ?? ''}`}>
      {hint.stangbar ? (
        <button
          type="button"
          onClick={stang}
          aria-label={HEM_V4.stangEtikett}
          className="absolute right-2 top-2 z-[1] flex h-11 w-11 items-center justify-center rounded-xl text-ink-3 hover:bg-papper-2"
        >
          <IkonX size={20} />
        </button>
      ) : null}
      <div className={`grid gap-3 ${band ? 'xl:grid-cols-[minmax(0,1fr)_400px] xl:items-center xl:gap-x-7 xl:gap-y-0' : ''}`} data-hint={hint.typ}>
        <div className={`grid gap-2 ${hint.stangbar ? 'pr-10' : ''}`}>
          <p className="text-ey">
            <span className="text-koppar-ink">{HEM_V4.nastaSteg}</span>
            {hint.eyebrow ? <span className="ml-2 text-[12px] font-medium normal-case tracking-normal text-ink-3">{hint.eyebrow}</span> : null}
          </p>
          <h2 className="max-w-[24ch] font-display text-[23px] font-bold leading-[27px] tracking-[-.02em] text-ink-1 lg:text-[26px] lg:leading-[30px]">
            {hint.rubrik}
          </h2>
          <p className="max-w-[56ch] text-[14.5px] leading-[21px] text-ink-2 lg:text-[15px] lg:leading-[22px]">{hint.skal}</p>
        </div>
        {band ? <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">{band}</div> : null}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4 xl:col-start-1 xl:mt-2">
          <Link
            href={hintHref(hint)}
            className={`${KNAPP_PRIMAR} sm:w-auto`}
            onClick={() => hintKlickad(hint, kontext, 0)}
            aria-label={las ? `${hint.knapp.etikett}. ${HEM_V4.las}.` : undefined}
          >
            {las ? <IkonLas size={18} /> : null}
            {hintEtikett(hint)}
            {las ? null : <IkonPil size={18} />}
          </Link>
          {hint.tips ? (
            <p className="text-center text-meta text-ink-3 sm:text-left">
              {HEM_V4.tips} {hint.tips}
            </p>
          ) : null}
        </div>
      </div>
    </LyftKort>
  )
}
