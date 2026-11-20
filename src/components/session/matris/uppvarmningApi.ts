/**
 * Uppvärmningens väg till servern (/api/traning/uppvarmning): servern väljer
 * de tre uppgifterna (seedat på konto och dag) och dömer svaret. Inget
 * sparas. Kropparna är oförändrade sedan våg 3b; kontrakttestet låser dem.
 */

import type { VisadFraga } from '@/lib/logicTestV7/layered.v7'

export type UppvarmningSvar = { correct: boolean; rattVisat: number; regel: string }

export interface UppvarmningApi {
  hamta(): Promise<VisadFraga[] | null>
  svara(questionId: string, selectedIndex: number): Promise<UppvarmningSvar | null>
}

export const fetchUppvarmningApi: UppvarmningApi = {
  async hamta() {
    try {
      const r = await fetch('/api/traning/uppvarmning', { cache: 'no-store' })
      if (!r.ok) return null
      return ((await r.json()) as { fragor: VisadFraga[] }).fragor
    } catch {
      return null
    }
  },
  async svara(questionId, selectedIndex) {
    try {
      const r = await fetch('/api/traning/uppvarmning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedIndex }),
      })
      if (!r.ok) return null
      return (await r.json()) as UppvarmningSvar
    } catch {
      return null
    }
  },
}
