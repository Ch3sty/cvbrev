'use client'

/**
 * Det valda utseendet och ett sätt att byta det (src/lib/tema.ts).
 *
 * Före montering är värdet "system" (servern vet inget om enheten), så
 * segmenten renderas likadant på servern och i första bilden. Segmenten har
 * samma mått i alla lägen, så inget hoppar när det sparade valet läses in.
 *
 * Byts temat i avatarmenyn medan Inställningar är öppen följer sidan med,
 * och tvärtom, genom händelsen TEMA_HANDELSE. Byts det i en annan flik
 * följer den här fliken med genom storage-händelsen.
 */

import { useCallback, useEffect, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { TEMA_HANDELSE, TEMA_NYCKEL, lasTema, sparaTema, tillampaTema, type Tema } from '@/lib/tema'

/** Var valet gjordes, för tema_bytt. */
export type TemaKalla = 'meny' | 'installningar'

export function useTema(kalla: TemaKalla): { tema: Tema; valj: (nytt: Tema) => void } {
  const [tema, setTema] = useState<Tema>('system')

  useEffect(() => {
    setTema(lasTema())
    const fran = (e: Event) => setTema((e as CustomEvent<Tema>).detail)
    const lagring = (e: StorageEvent) => {
      if (e.key !== TEMA_NYCKEL && e.key !== null) return
      const nytt = lasTema()
      tillampaTema(nytt)
      setTema(nytt)
    }
    window.addEventListener(TEMA_HANDELSE, fran)
    window.addEventListener('storage', lagring)
    return () => {
      window.removeEventListener(TEMA_HANDELSE, fran)
      window.removeEventListener('storage', lagring)
    }
  }, [])

  const valj = useCallback(
    (nytt: Tema) => {
      setTema(nytt)
      sparaTema(nytt)
      capture('tema_bytt', { tema: nytt, kalla })
    },
    [kalla],
  )

  return { tema, valj }
}
