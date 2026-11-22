/**
 * Sidans skal i publikt omgång 3. Sätter sidans färg (data-p3-sida, som
 * globals.css lyfter till roten så att menyn, kampanjraden och foten tar
 * samma färg) och laddar grundens CSS. Serverkomponent.
 *
 *   <Sida farg="cv"> ...sektioner... </Sida>
 *
 * Bara ett skal per sida. En sektion eller ö i en annan färg sätter farg på
 * sig själv (lokalt), aldrig ett andra skal.
 */

import type { ReactNode } from 'react'
import type { Farg } from './farg'
import './v3.css'

export function Sida({ farg, id, className = '', children }: { farg: Farg; id?: string; className?: string; children: ReactNode }) {
  return (
    <div id={id} className={`p3 ${className}`.trim()} data-p3-sida={farg}>
      {children}
    </div>
  )
}
