'use client'

/**
 * Skapa-arket (docs/plan-inloggat-omdesign.md, avsnitt 3).
 *
 * Bottenark, aldrig centrerad modal: navets Skapa-slot sitter i nederkanten
 * och handlingen ska stanna där tummen redan är. Bygger på shell/Sheet, så
 * svep nedåt, tryck utanför, Escape, scroll-lås och fokus följer med. All
 * rörelse är CSS, inget animeringsbibliotek behövs.
 *
 * Raderna är alltid samma tre och pekar alltid på samma mål, så ingen rad
 * byter betydelse mellan besök. Bara ordningen ändras: har användaren minst en
 * ansökan ligger "Logga ansökan" överst, annars "Nytt CV". Saknas CV går
 * brevraden till uppladdningen i stället, och det sägs rakt ut i radens
 * undertext i stället för med ett hänglås. Tre rader på 56 px, nakna ikoner 24.
 */

import { useRouter } from 'next/navigation'
import Sheet from '@/components/shell/Sheet'
import {
  IkonBrev,
  IkonCv,
  IkonAnsokningar,
  type IkonProps,
} from '@/components/illustrations/Ikoner'

interface CreateSheetProps {
  open: boolean
  onClose: () => void
  /** Styr ordningen: minst en ansökan lyfter "Logga ansökan" överst. */
  applicationCount: number
  /** Utan CV går brevraden till uppladdningen i stället. */
  cvCount: number
}

interface Row {
  id: string
  label: string
  hint: string
  href: string
  Ikon: (props: IkonProps) => React.ReactElement
}

export default function CreateSheet({ open, onClose, applicationCount, cvCount }: CreateSheetProps) {
  const router = useRouter()
  const hasCv = cvCount > 0

  const rowBrev: Row = {
    id: 'brev',
    label: 'Nytt personligt brev',
    hint: hasCv ? 'Klistra in annonsen, vi skriver utkastet' : 'Kräver ett CV, vi tar det först',
    href: hasCv ? '/dashboard/skapa-brev' : '/dashboard/profil/cv',
    Ikon: IkonBrev,
  }
  const rowCv: Row = {
    id: 'cv',
    label: 'Nytt CV',
    hint: hasCv ? 'Ladda upp eller bygg ett nytt' : 'Ladda upp ditt CV',
    href: '/dashboard/profil/cv',
    Ikon: IkonCv,
  }
  const rowAnsokan: Row = {
    id: 'ansokan',
    label: 'Logga ansökan',
    hint: 'Håll koll på svaren',
    href: '/dashboard/sokta-tjanster?logga=1',
    Ikon: IkonAnsokningar,
  }

  const rows: Row[] = applicationCount > 0 ? [rowAnsokan, rowBrev, rowCv] : [rowCv, rowBrev, rowAnsokan]

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Skapa nytt" size="md">
      <ul className="-mx-4 -my-4 sm:-mx-6">
        {rows.map((row) => (
          <li key={row.id} className="border-b border-kant last:border-b-0">
            <button
              type="button"
              onClick={() => go(row.href)}
              className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-insunken/60 active:bg-insunken touch-manipulation sm:px-6"
            >
              <row.Ikon size={24} className="shrink-0 text-ink-2" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-5 text-ink-1">{row.label}</span>
                <span className="block truncate text-meta text-ink-3">{row.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
