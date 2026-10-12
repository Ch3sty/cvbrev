/**
 * Telefonen (spec-publikt-v2 del A avsnitt 3 och 4): ett skal i 272 × 590
 * med radie 42, ram #1B1A1F och ön 76 × 22. Statusraden ingår. Hela
 * telefonen är aria-hidden; allt den visar står också i löptexten bredvid.
 *
 * Glider in med scroll-tidslinjen där den finns (data-glid, ren CSS). Utan
 * stöd står den still och syns. Fasta mått, så inget flyttar sig (CLS 0).
 */

import type { ReactNode } from 'react'

export type RumNamn = 'tran' | 'cv' | 'brev' | 'jobb' | 'neu'

export default function Telefon({
  rum,
  children,
  glid = true,
  tid = '14:05',
  className = '',
}: {
  rum: RumNamn
  children: ReactNode
  glid?: boolean
  tid?: string
  className?: string
}) {
  return (
    <div className={`pub-telefon pub-rum-${rum} ${className}`.trim()} data-glid={glid ? '' : undefined} aria-hidden="true">
      <div className="pub-tel">
        <div className="s-skarm">
          <div className="s-status">
            <span>{tid}</span>
            <svg viewBox="0 0 40 11" fill="currentColor" focusable="false">
              <rect x="0" y="6" width="3" height="5" rx="1" />
              <rect x="5" y="4" width="3" height="7" rx="1" />
              <rect x="10" y="2" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="11" rx="1" />
              <rect x="24" y="1" width="14" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="26" y="3" width="9" height="5" rx="1" />
            </svg>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
