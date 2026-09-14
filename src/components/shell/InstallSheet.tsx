'use client'

/**
 * iOS-arket med de tre stegen (docs/plan-pwa.md, avsnitt 4).
 *
 * Safari har ingen installationsdialog att öppna, så det enda vi kan göra är
 * att tala om vad användaren ska göra. Arket säger tre saker och slutar där.
 * Ingen bild av en telefon, ingen animering, ingen skärmdump av Safari: den
 * blir fel så fort Apple ritar om menyn.
 *
 * Dela-ikonen är vår egen (public/pwa/share-ios.svg, samma hand som
 * Ikoner.tsx), inte Apples symbol. Den står inline i meningen där den hör
 * hemma, inte som en dekoration bredvid.
 *
 * Sheet sköter fokus, Escape, body-lås och safe-area. Ingen egen modal.
 */

import Sheet from './Sheet'

interface InstallSheetProps {
  open: boolean
  /** Stäng utan att räkna frågan som besvarad. */
  onClose: () => void
  /** Användaren säger sig ha lagt till appen. Frågan ställs aldrig igen. */
  onDone: () => void
}

/** Dela-ikonen: fyrkant med öppen topp och en pil upp genom öppningen. */
function IkonDela({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="dela"
      focusable="false"
    >
      <path d="M8 11H5.5A1.5 1.5 0 0 0 4 12.5v7A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16" />
      <path d="M12 15V3" />
      <path d="M8.5 6.5 12 3l3.5 3.5" />
    </svg>
  )
}

/** Plus i ruta: raden "Lägg till på hemskärmen" i Safaris delameny. */
function IkonPlusruta({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

/** Stegets nummer, som en liten insunken ruta i stället för en fylld cirkel. */
function Nummer({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-kant bg-insunken text-meta font-medium text-ink-2 shadow-insunken"
    >
      {children}
    </span>
  )
}

export default function InstallSheet({ open, onClose, onDone }: InstallSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Lägg Jobbcoach på hemskärmen"
      description="Tre steg i Safari. Ingen nedladdning."
      footer={
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
        >
          Klart
        </button>
      }
    >
      <ol className="divide-y divide-kant">
        <li className="flex items-start gap-3 py-2 first:pt-0">
          <Nummer>1</Nummer>
          <span className="min-w-0 flex-1 text-sm leading-[22px] text-ink-1">
            Tryck på <IkonDela className="mx-0.5 inline align-[-5px] text-ink-2" /> längst ner i
            Safari.
          </span>
        </li>

        <li className="flex items-start gap-3 py-2">
          <Nummer>2</Nummer>
          <span className="min-w-0 flex-1 text-sm leading-[22px] text-ink-1">
            Välj <IkonPlusruta className="mx-0.5 inline align-[-5px] text-ink-2" />{' '}
            <strong className="font-medium">Lägg till på hemskärmen</strong>.
          </span>
        </li>

        <li className="flex items-start gap-3 py-2 last:pb-0">
          <Nummer>3</Nummer>
          <span className="min-w-0 flex-1 text-sm leading-[22px] text-ink-1">
            Tryck <strong className="font-medium">Lägg till</strong>. Klart.
          </span>
        </li>
      </ol>
    </Sheet>
  )
}
