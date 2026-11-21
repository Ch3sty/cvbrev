/**
 * CvRad-propsen ur väggens cvRad, om det är en CvRad. Ren funktion utan
 * 'use client', så att serverkomponenter (CvFlikRemsa på Analys-sidans
 * återupptagna analys) kan anropa den; i CvRadMobil.tsx (klientmodul) gav
 * anropet från servern ett fel i produktionsbygget.
 */
import type { CvRadProps } from './CvRad'

export function cvRadData(nod: unknown): Pick<CvRadProps, 'cvs' | 'aktivtId'> | null {
  if (!nod || typeof nod !== 'object' || !('props' in nod)) return null
  const p = (nod as { props: Partial<CvRadProps> }).props
  if (!p || !Array.isArray(p.cvs) || p.utanRad) return null
  return { cvs: p.cvs, aktivtId: p.aktivtId ?? null }
}
