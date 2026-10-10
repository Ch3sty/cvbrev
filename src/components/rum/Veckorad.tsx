/**
 * Veckoraden (spec-rummen 4.4, konceptets .vecka): sju celler (eller fler
 * via celler), 22 px ringar med etikett under.
 *
 *   gjord  fylld koppar
 *   nu     streckad kopparkant (i dag, inte gjort än)
 *   vila   prickad kant, nedtonad (söndag)
 *   tom    ingen ring (före mätningen)
 *   kvar   ihålig ring i vagg-svag
 *   om     tjockare ring i vagg-mjuk (ommätning)
 *
 * Används också för CV-rummets dokumentväg och brevets träffar. På golvet
 * byter kanterna till kant-stark och etiketterna till ink-3.
 *
 * Server component.
 */

export type VeckoStatus = 'gjord' | 'nu' | 'vila' | 'tom' | 'kvar' | 'om'

export interface VeckoCell {
  etikett: string
  status: VeckoStatus
}

const VECKODAGAR = ['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön']

export interface VeckoradProps {
  /** Status per dag, måndag först. Ignoreras när celler anges. */
  status?: VeckoStatus[]
  /** Egna celler (dokumentvägen, träffarna). */
  celler?: VeckoCell[]
  /** Väggen (standard) eller golvet. */
  pa?: 'vagg' | 'golv'
  /** Tillgängligt namn som läser ut raden. */
  label: string
  className?: string
}

function ringKlass(status: VeckoStatus, pa: 'vagg' | 'golv'): string {
  const kant = pa === 'vagg' ? 'border-vagg-svag' : 'border-kant-stark'
  switch (status) {
    case 'gjord':
      return 'border-koppar bg-koppar'
    case 'nu':
      return 'border-dashed border-koppar'
    case 'vila':
      return `border-dotted opacity-60 ${kant}`
    case 'tom':
      return 'border-transparent'
    case 'om':
      return `border-[2.5px] ${pa === 'vagg' ? 'border-vagg-mjuk' : 'border-ink-3'}`
    default:
      return kant
  }
}

export default function Veckorad({ status, celler, pa = 'vagg', label, className }: VeckoradProps) {
  const rad: VeckoCell[] =
    celler ?? (status ?? []).map((s, i) => ({ etikett: VECKODAGAR[i % 7], status: s }))
  return (
    <div
      role="img"
      aria-label={label}
      className={`mt-3.5 grid gap-1.5 ${className ?? ''}`}
      style={{ gridTemplateColumns: `repeat(${rad.length}, minmax(0, 1fr))` }}
    >
      {rad.map((c, i) => (
        <div
          key={`${c.etikett}-${i}`}
          aria-hidden="true"
          className={`flex flex-col items-center gap-1.5 text-[11px] leading-[14px] ${
            pa === 'vagg' ? 'text-vagg-mjuk' : 'text-ink-3'
          }`}
        >
          <i className={`block h-[22px] w-[22px] rounded-full border-[1.5px] ${ringKlass(c.status, pa)}`} />
          {c.etikett}
        </div>
      ))}
    </div>
  )
}
