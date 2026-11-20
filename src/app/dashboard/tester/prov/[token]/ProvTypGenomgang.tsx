'use client'

/**
 * Genomgången av provet utan konto i typerna utöver matrisen, efter kontot
 * (spec-prov-fler-typer-2026-11-09 avsnitt 4, omgång 2 steg C): sessionsramens
 * Uppgiftslistan med en rad per uppgift, rätt svar och Förklaringen i den
 * utfällda raden, och "Gå igenom" som öppnar ramens Genomgang. Uppgifterna
 * ritas av typernas komponenter i session/typer, samma som i testerna.
 */

import { useMemo, useState } from 'react'
import Uppgiftslistan from '@/components/session/Uppgiftslistan'
import Genomgang from '@/components/session/lagen/Genomgang'
import type { RamUppgift, TypRitare } from '@/components/session/typ'
import { genomgangPoster, provRitare, PROV_NAMN } from '@/components/publikt/prov/provPost'
import type { GenomgangUppgift, ProvTyp } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'

export default function ProvTypGenomgang({
  uppgifter,
  underlag,
  token,
}: {
  uppgifter: GenomgangUppgift[]
  underlag: Record<string, VnUnderlag>
  token: string
}) {
  const poster = useMemo(() => genomgangPoster(uppgifter, underlag), [uppgifter, underlag])
  // I-provets uppgifter bär sitt deltest; övriga prov är en typ.
  const typ: ProvTyp = uppgifter.some((u) => u.deltest) ? 'iprov' : (uppgifter[0]?.kind ?? 'figurserie')
  const ritare = useMemo(() => provRitare(typ, poster), [typ, poster]) as TypRitare<RamUppgift>
  const [oppen, setOppen] = useState<{ start: number; kalla: 'ga_igenom' | 'rad' } | null>(null)
  const forstaMiss = Math.max(0, poster.findIndex((p) => !p.facit.correct))

  return (
    <div data-prov-genomgang>
      <Uppgiftslistan
        ritare={ritare}
        lage="publikt"
        poster={poster as never}
        sessionId={token}
        onGaIgenom={() => setOppen({ start: forstaMiss, kalla: 'ga_igenom' })}
        onOppna={(i) => setOppen({ start: i, kalla: 'rad' })}
      />
      {oppen ? (
        <Genomgang
          ritare={ritare}
          lage="publikt"
          titel={PROV_NAMN[typ]}
          undertitel="Ditt prov, genomgång"
          poster={poster as never}
          start={oppen.start}
          sessionId={token}
          kalla={oppen.kalla}
          onStang={() => setOppen(null)}
        />
      ) : null}
    </div>
  )
}
