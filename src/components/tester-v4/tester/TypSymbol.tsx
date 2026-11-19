/**
 * Testtypens symbol (48-glyferna, en kopparyta per symbol). Står utan
 * färgad ruta: ikoner står aldrig på en färgad ruta i inloggat
 * (designsystemet avsnitt 7), så skissens tonade plattor är bara konturen här.
 */

import { SymDeduktiv, SymFigurer, SymMatris, SymPerson, SymSiffror, SymSpatial, SymTalserie, SymVerbal } from '@/components/illustrations/TestGlyfer'
import { SymOrdforrad } from '@/components/tests/steg2/Symboler'
import type { TestTypId } from '@/lib/tester/v4/typer'

export default function TypSymbol({ typ, size = 44 }: { typ: TestTypId | 'personlighet'; size?: number }) {
  const p = { size, className: 'shrink-0 text-ink-1' }
  switch (typ) {
    case 'matris':
      return <SymMatris {...p} />
    case 'figurserie':
      return <SymFigurer {...p} />
    case 'deduktiv':
      return <SymDeduktiv {...p} />
    case 'verbal':
      return <SymVerbal {...p} />
    case 'numerisk':
      return <SymSiffror {...p} />
    case 'talserie':
      return <SymTalserie {...p} />
    case 'spatial':
      return <SymSpatial {...p} />
    case 'ordforrad':
      return <SymOrdforrad {...p} />
    case 'personlighet':
      return <SymPerson {...p} />
  }
}
