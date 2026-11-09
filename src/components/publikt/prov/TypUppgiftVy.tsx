'use client'

/**
 * En uppgift i provet utan konto, per typ (spec-prov-fler-typer-2026-11-09
 * avsnitt 3). Frågevyn är den inloggade: Nivåkollens komponenter för
 * figurserier, deduktivt, verbalt och numeriskt, steg 2:s för spatial
 * förmåga, talserier och ordförråd. Ingen återkoppling under provet: ett
 * val är ett svar och nästa uppgift kommer.
 */

import NivakollUppgift from '@/components/traning/nivakoll/NivakollUppgift'
import { Steg2Uppgift } from '@/components/tests/steg2/Uppgifter'
import type { PublikUppgift, Steg2ProvKind } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { NivakollUppgift as NUppgift } from '@/lib/nivakoll/typer'

export default function TypUppgiftVy({
  uppgift,
  underlag,
  nr,
  antal,
  seed,
  onSvar,
  disabled = false,
}: {
  uppgift: PublikUppgift
  underlag: Record<string, VnUnderlag>
  nr: number
  antal: number
  seed: string
  onSvar: (svar: string) => void
  disabled?: boolean
}) {
  const kind = uppgift.kind
  const kropp =
    kind === 'figurserie' || kind === 'deduktiv' || kind === 'verbal' || kind === 'numerisk' ? (
      <NivakollUppgift
        u={uppgift.data as NUppgift}
        nr={nr}
        antal={antal}
        vald={null}
        onValj={(v) => {
          if (!disabled) onSvar(v)
        }}
        underlag={underlag}
        sessionId={seed}
        last={disabled}
      />
    ) : (
      <Steg2Uppgift
        kind={kind as Steg2ProvKind}
        u={uppgift.data}
        valt={null}
        onValj={(i) => {
          if (!disabled) onSvar(String(i))
        }}
        disabled={disabled}
      />
    )
  return (
    <div className="typ-uppgift" data-typ-uppgift={kind}>
      {uppgift.deltest ? <p className="mb-2 text-[13px] font-semibold leading-[18px] text-ink-2">{uppgift.deltest}</p> : null}
      {kropp}
    </div>
  )
}
