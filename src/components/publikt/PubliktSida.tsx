/**
 * Ramen för en ombyggd publik sida (spec-publikt-v2 del A). Klassen pub-sida
 * lyfter publikt v2:s tokens till roten (globals.css, PUBLIKT V2), så att
 * sidhuvud och sidfot följer med i ljust och mörkt läge, och laddar
 * komponenternas stilar. Serverkomponent.
 */

import type { ReactNode } from 'react'
import './publikt.css'

export default function PubliktSida({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`pub-sida ${className}`.trim()}>{children}</div>
}
