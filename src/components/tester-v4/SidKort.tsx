/**
 * Kortet under väggen på Tester och Din utveckling (skissen 2026-11-19).
 * Samma storlek och samma två spalter som Hems Nästa steg: till vänster
 * överraden, rubriken (handlingen), skälet, en kopparknapp och ett tips; till
 * höger en ljus panel. På mobil staplat, panelen mellan texten och knappen.
 *
 * Innehållet räknas i lib/tester/v4/sidkort.ts. Server component utan
 * klientkod, så det fungerar i både server- och klientvyer.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { IkonLas, IkonPil } from '@/components/illustrations/RumSymboler'
import type { SidKortInnehall } from '@/lib/tester/v4/sidkort'
import { HEM_V4 } from './hem/copy'

/**
 * Kortets mått, samma på Hem (Nästa steg), Tester och Din utveckling. Minsta
 * höjden på dator gör att navigeringen under står på samma plats på alla tre.
 */
export const SIDKORT_KLASS = 'lg:px-6 lg:py-[22px] xl:min-h-[248px] xl:flex xl:flex-col xl:justify-center'

/** Den ljusa panelen till höger, samma som nivåbandet på Hem. */
export function SidKortPanel({ children, className, namn }: { children: ReactNode; className?: string; namn: string }) {
  return (
    <div className={`grid gap-2.5 rounded-[14px] bg-papper-2 px-4 pb-3.5 pt-4 lg:px-[18px] ${className ?? ''}`} data-sidkort-panel={namn}>
      {children}
    </div>
  )
}

export default function SidKort({ kort, panel, sida }: { kort: SidKortInnehall; panel: ReactNode; sida: 'tester' | 'utveckling' }) {
  const las = kort.knapp.las
  return (
    <LyftKort label={kort.etikett} className={SIDKORT_KLASS}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-center xl:gap-x-7 xl:gap-y-0" data-sidkort={sida} data-slag={kort.slag}>
        <div className="grid gap-2">
          <p className="text-ey">
            <span className="text-koppar-ink">{kort.etikett}</span>
            {kort.meta ? <span className="ml-2 text-[12px] font-medium normal-case tracking-normal text-ink-3">{kort.meta}</span> : null}
          </p>
          <h2 className="max-w-[24ch] font-display text-[23px] font-bold leading-[27px] tracking-[-.02em] text-ink-1 lg:text-[26px] lg:leading-[30px]">
            {kort.rubrik}
          </h2>
          <p className="max-w-[56ch] text-[14.5px] leading-[21px] text-ink-2 lg:text-[15px] lg:leading-[22px]">{kort.skal}</p>
        </div>
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">{panel}</div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4 xl:col-start-1 xl:mt-2">
          <Link href={kort.knapp.href} className={`${KNAPP_PRIMAR} sm:w-auto`} aria-label={las ? `${kort.knapp.etikett}. ${HEM_V4.las}.` : undefined} data-sidkort-knapp>
            {las ? <IkonLas size={18} /> : null}
            {las ? HEM_V4.las : kort.knapp.etikett}
            {las ? null : <IkonPil size={18} />}
          </Link>
          {kort.tips ? (
            <p className="text-center text-meta text-ink-3 sm:text-left">
              {HEM_V4.tips} {kort.tips}
            </p>
          ) : null}
        </div>
      </div>
    </LyftKort>
  )
}
