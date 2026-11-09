'use client'

/**
 * En uppgift i provet utan konto, per typ (spec-prov-fler-typer-2026-11-09
 * avsnitt 3). Frågevyn är den inloggade: Nivåkollens komponenter för
 * figurserier, deduktivt och verbalt, steg 2:s för spatial förmåga,
 * talserier och ordförråd. Ingen återkoppling under provet: ett val är ett
 * svar och nästa uppgift kommer.
 *
 * Numeriskt (specens avsnitt 3, kravet att frågan och alla alternativ ryms
 * på Pixel 7): på mobil står frågan och alternativen överst och underlaget
 * under, från 1024 px underlaget först som i testerna.
 *
 * I artiklarna (rubrik="p") blir uppgiftens rubriker p, så att artikelns
 * rubrikträd inte ändras.
 */

import NivakollUppgift from '@/components/traning/nivakoll/NivakollUppgift'
import { Underlag, VnUppgift } from '@/components/traning/vnpass/VnUppgift'
import { RubrikTaggProvider } from '@/components/tests/RubrikTagg'
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
  rubrik = 'h2',
}: {
  uppgift: PublikUppgift
  underlag: Record<string, VnUnderlag>
  nr: number
  antal: number
  seed: string
  onSvar: (svar: string) => void
  disabled?: boolean
  /** p i artiklarna, så att uppgiften inte lägger till rubriker i artikelns rubrikträd. */
  rubrik?: 'h2' | 'p'
}) {
  const kind = uppgift.kind
  let kropp
  if (kind === 'numerisk') {
    const u = uppgift.data as Extract<NUppgift, { kind: 'verbal' | 'numerisk' }>
    const ul = underlag[u.underlag]
    kropp = (
      <div className="flex flex-col gap-3.5" data-nivakoll-uppgift="numerisk">
        <div className="order-1 lg:order-2">
          <VnUppgift
            kind="numerisk"
            punkt={{ nyckel: u.nyckel, text: u.text, alternativ: u.alternativ }}
            nr={nr}
            antal={antal}
            vald={null}
            aterkoppling={null}
            last={disabled}
            onValj={(v) => {
              if (!disabled) onSvar(v)
            }}
          />
        </div>
        {ul ? (
          <div className="order-2 lg:order-1">
            <Underlag kind="numerisk" underlag={ul} />
          </div>
        ) : null}
      </div>
    )
  } else if (kind === 'figurserie' || kind === 'deduktiv' || kind === 'verbal') {
    kropp = (
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
    )
  } else {
    kropp = (
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
  }
  return (
    <RubrikTaggProvider value={rubrik}>
      <div className="typ-uppgift" data-typ-uppgift={kind}>
        {uppgift.deltest ? <p className="mb-2 text-[13px] font-semibold leading-[18px] text-ink-2">{uppgift.deltest}</p> : null}
        {kropp}
      </div>
    </RubrikTaggProvider>
  )
}
