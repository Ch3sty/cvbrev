/**
 * CV-rummets vägg (skissen Main, Mallar, Analys och Mobil-*): samma vägg på
 * Ditt CV, Mallar och Analys, bara innehållet byts. Testernas mått och
 * klasser (.t3-vagg: 558 px från 1280, 500 mellan 768 och 1280; på telefonen
 * 426 px enligt skissen Mobil-hem, där testerna har 344), i petrol via de
 * rumsmedvetna tokens. Panelen på golvet överlappar 60, 40 och 28 px som i
 * testerna (.t3-panel).
 *
 *   Toppen   flikarna, CV-raden (CvRad) och toppåtgärderna (klocka, profil)
 *   Dator    `vanster` (rubrik, knapp, chips) och `hoger` (talet, banan, arket)
 *   Mobil    `mobil`, under flikarna, under 1280 px
 *
 * Server component; CvRad och Topprad är klientöar.
 */
import type { ReactNode } from 'react'
import Topprad from '@/components/rum/Topprad'
import CvFlikar from './CvFlikar'
import type { CvFlik } from './flikar'

export interface CvVaggProps {
  aktiv: CvFlik
  /** CV:t som visas (följer med i flikarnas länkar). */
  cvId?: string | null
  /** CvRad, eller null utan CV. */
  cvRad?: ReactNode
  vanster: ReactNode
  hoger: ReactNode
  mobil: ReactNode
  /** Väggens tillgängliga namn. */
  etikett: string
  /** Lägets namn för skärmdumpar och tester. */
  lage?: string
}

export default function CvVagg({ aktiv, cvId, cvRad, vanster, hoger, mobil, etikett, lage }: CvVaggProps) {
  return (
    <section className="t3-vagg cv3-vagg" data-cv-vagg data-sida={aktiv} data-lage={lage} aria-label={etikett}>
      <div className="t3-vagg-dekor" aria-hidden="true">
        <span className="t3-vagg-cirkel" />
      </div>

      <div className="t3-vagg-dator hidden xl:block">
        <div className="t3-topp">
          <CvFlikar aktiv={aktiv} cvId={cvId} />
          <div className="flex min-w-0 items-center gap-3">
            {cvRad}
            <Topprad bara="atgarder" />
          </div>
        </div>
        <div className="t3-hero cv3-hero">
          <div className="t3-hero-text">{vanster}</div>
          <div className="cv3-hero-hoger">{hoger}</div>
        </div>
      </div>

      <div className="t3-vagg-mobil xl:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <CvFlikar aktiv={aktiv} cvId={cvId} />
          </div>
          <Topprad bara="atgarder" />
        </div>
        {mobil}
      </div>
    </section>
  )
}
