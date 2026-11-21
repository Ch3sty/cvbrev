'use client'

/**
 * "Byt brev" i Mallar: användarens brev i ett Sheet, ett tryck byter brevet
 * som visas i mallarna. Laddas först när det öppnas.
 */
import Link from 'next/link'
import Sheet from '@/components/shell/Sheet'
import { IkonBock } from '@/components/brev3/kit'
import { MALLAR_TEXT as T } from './text'

export default function BytBrevArk({
  open,
  onClose,
  breven,
  valt,
}: {
  open: boolean
  onClose: () => void
  breven: { id: string; foretag: string | null; tjanst: string | null }[]
  valt: string | null
}) {
  return (
    <Sheet open={open} onClose={onClose} title={T.bytBrevRubrik}>
      <ul className="b3-ml-bytlista">
        {breven.map((b) => (
          <li key={b.id}>
            <Link href={`/dashboard/mina-brev/mallar?brev=${b.id}`} aria-current={b.id === valt ? 'true' : undefined} onClick={onClose}>
              <span>
                <b>{b.foretag || 'Brev utan företag'}</b>
                {b.tjanst ? <small>{b.tjanst}</small> : null}
              </span>
              {b.id === valt ? <IkonBock size={16} strokeWidth={3} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
