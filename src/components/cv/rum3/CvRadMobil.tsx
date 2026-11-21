'use client'

/**
 * CV-raden under flikarna på telefonen (projektledarens beslut i steg 2):
 * "CV: <namn>" som öppnar Byt CV, bara när hon har fler än ett CV. Samma rad
 * på Ditt CV, Mallar och Analys; väggen och flikremsan läser den ur CvRad,
 * så att ingen sida behöver skicka den själv. Arket ägs av CvRad.
 */
import { CV_RAD, CV_RAD_MOBIL } from './texter'
import { oppnaBytCv } from './CvRad'
import type { CvRadProps } from './CvRad'

export default function CvRadMobil({ cvs, aktivtId }: Pick<CvRadProps, 'cvs' | 'aktivtId'>) {
  const aktivt = cvs.find((c) => c.id === aktivtId)
  if (!aktivt || cvs.length < 2) return null
  return (
    <button type="button" className="cv3-cvrad-mobil" onClick={oppnaBytCv} aria-haspopup="dialog" aria-label={CV_RAD_MOBIL.aria(aktivt.namn)} data-cv-rad-mobil>
      <span className="min-w-0 truncate">
        {CV_RAD.cv} <b>{aktivt.namn}</b>
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}
