/**
 * Jobbsökets ikoner: inline-SVG, stroke 2, rundade ändar, 24 px i grunden
 * (skissens ikonstil). Aldrig Sparkles, aldrig emoji. Alla är dekor
 * (aria-hidden); texten bredvid bär betydelsen.
 */

import type { ReactNode } from 'react'

export interface IkonProps {
  size?: number
  className?: string
  /** Strokens bredd. 2 i grunden, 2.4 på pilar och plus som i skissen. */
  bredd?: number
}

function Ikon({ size = 24, className, bredd = 2, children }: IkonProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={bredd} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  )
}

export const IkonPil = (p: IkonProps) => <Ikon size={20} bredd={2.4} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ikon>
export const IkonTillbaka = (p: IkonProps) => <Ikon size={18} bredd={2.4} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Ikon>
export const IkonChevron = (p: IkonProps) => <Ikon size={18} bredd={2.4} {...p}><path d="M9 6l6 6-6 6" /></Ikon>
export const IkonNed = (p: IkonProps) => <Ikon size={20} bredd={2.4} {...p}><path d="M6 9l6 6 6-6" /></Ikon>
export const IkonPlus = (p: IkonProps) => <Ikon size={18} bredd={2.4} {...p}><path d="M12 5v14M5 12h14" /></Ikon>
export const IkonKryss = (p: IkonProps) => <Ikon size={22} bredd={2.4} {...p}><path d="M6 6l12 12M18 6L6 18" /></Ikon>
export const IkonBock = (p: IkonProps) => <Ikon size={16} bredd={2.4} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Ikon>
export const IkonKalender = (p: IkonProps) => <Ikon {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Ikon>
export const IkonKlocka = (p: IkonProps) => <Ikon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Ikon>
export const IkonMejl = (p: IkonProps) => <Ikon {...p}><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M4 8l8 5.5L20 8" /></Ikon>
export const IkonPenna = (p: IkonProps) => <Ikon {...p}><path d="M5 20l1-4L16.5 5.5a2.1 2.1 0 013 3L9 19z" /><path d="M14.5 7.5l3 3" /></Ikon>
export const IkonOga = (p: IkonProps) => <Ikon {...p}><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></Ikon>
export const IkonPrat = (p: IkonProps) => <Ikon {...p}><path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 014 13.5z" /></Ikon>
export const IkonRutnat = (p: IkonProps) => <Ikon {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 12h16M12 4v16" /></Ikon>
export const IkonFlagga = (p: IkonProps) => <Ikon size={18} {...p}><path d="M6 21V4" /><path d="M6 4h11l-2.5 4L17 12H6" /></Ikon>
export const IkonLas = (p: IkonProps) => <Ikon size={16} bredd={2.4} {...p}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></Ikon>
export const IkonLasUpp = (p: IkonProps) => <Ikon size={20} {...p}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 017.5-2" /></Ikon>
export const IkonKopiera = (p: IkonProps) => <Ikon size={18} {...p}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0013.5 4h-7A2.5 2.5 0 004 6.5v7A2.5 2.5 0 006.5 16H8" /></Ikon>
export const IkonBokmark = (p: IkonProps) => <Ikon size={18} {...p}><path d="M6.5 4h11v16l-5.5-4-5.5 4z" /></Ikon>
export const IkonSkicka = (p: IkonProps) => <Ikon size={18} {...p}><path d="M20 4L10 14M20 4l-6 16-4-6-6-4z" /></Ikon>
export const IkonPlan = (p: IkonProps) => <Ikon size={18} {...p}><path d="M20.5 3.5L3.5 10l7 2.5 2.5 7z" /><path d="M10.5 12.5l4-4" /></Ikon>
export const IkonPersoner = (p: IkonProps) => <Ikon size={18} {...p}><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 5.2a3.5 3.5 0 010 6.6M18.5 14.8c1.5.8 2.6 2.6 3 5.2" /></Ikon>
export const IkonPerson = (p: IkonProps) => <Ikon size={20} {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" /></Ikon>
export const IkonDokument = (p: IkonProps) => <Ikon size={18} {...p}><path d="M6.5 3.5h7l4 4v13h-11z" /><path d="M9 11h6M9 14.5h6M9 18h3.5" /></Ikon>
export const IkonVaska = (p: IkonProps) => <Ikon size={18} {...p}><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5" /></Ikon>
export const IkonAvslag = (p: IkonProps) => <Ikon size={18} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M8 12h8" /></Ikon>
export const IkonUtrop = (p: IkonProps) => <Ikon size={18} bredd={2.2} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16.2v.1" /></Ikon>
export const IkonLank = (p: IkonProps) => <Ikon size={16} {...p}><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7L11.5 6.8" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1.5-1.5" /></Ikon>
export const IkonUt = (p: IkonProps) => <Ikon size={14} bredd={2.4} {...p}><path d="M8 16L16 8M9 8h7v7" /></Ikon>
export const IkonSok = (p: IkonProps) => <Ikon size={18} bredd={2.2} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></Ikon>
export const IkonSkrivare = (p: IkonProps) => <Ikon size={20} {...p}><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2.5" /><path d="M7 14h10v6H7z" /></Ikon>
export const IkonSkold = (p: IkonProps) => <Ikon size={16} {...p}><path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></Ikon>
export const IkonPilUpp = (p: IkonProps) => <Ikon size={14} bredd={2.4} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Ikon>
export const IkonSkriv = IkonPenna

/** Pilen mellan tratten led (dator) och mellan facken i väggen. */
export const IkonPilHoger = (p: IkonProps) => <Ikon size={28} {...p}><path d="M4 12h16M14 6l6 6-6 6" /></Ikon>
