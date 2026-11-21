/**
 * Flikraden ensam, överst på Mallar och Analys tills deras väggar byggs om
 * (CV-rummet steg 2 och 4): väggens petrol, flikarna med rätt flik aktiv,
 * CV-raden och toppåtgärderna. Sidans eget innehåll följer under, oförändrat.
 *
 * Server component.
 */
import type { ReactNode } from 'react'
import Topprad from '@/components/rum/Topprad'
import CvFlikar from './CvFlikar'
import CvRadMobil, { cvRadData } from './CvRadMobil'
import type { CvFlik } from './flikar'

export interface CvFlikRemsaProps {
  aktiv: CvFlik
  cvId?: string | null
  cvRad?: ReactNode
  /** Utan toppåtgärder (sidan har redan en topprad under remsan). */
  utanAtgarder?: boolean
}

export default function CvFlikRemsa({ aktiv, cvId, cvRad, utanAtgarder }: CvFlikRemsaProps) {
  const rad = cvRadData(cvRad)
  return (
    <div className="cv3-remsa" data-cv-remsa data-sida={aktiv}>
      <div className="cv3-remsa-inre">
        <div className="min-w-0 flex-1 xl:flex-none">
          <CvFlikar aktiv={aktiv} cvId={cvId} />
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden xl:contents">{cvRad}</span>
          {utanAtgarder ? null : <Topprad bara="atgarder" />}
        </div>
      </div>
      {rad && rad.cvs.length > 1 ? (
        <div className="xl:hidden">
          <CvRadMobil {...rad} />
        </div>
      ) : null}
    </div>
  )
}
