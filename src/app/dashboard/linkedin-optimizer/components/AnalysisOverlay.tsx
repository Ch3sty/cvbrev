'use client'

import LoadingSkeleton from '@/components/shell/LoadingSkeleton'

interface AnalysisOverlayProps {
  /** Avbryter optimeringen. Utan väg ut är en väntevy en fälla. */
  onCancel?: () => void
}

/**
 * Den långa väntan medan edge-funktionen skriver om profilen. Ingen
 * fullskärmsoverlay längre: skrivskelettet står i flödets scrollyta, med
 * rubrik, tre rader som fylls och en rad om tiden. Avbryt är en textlänk.
 */
export default function AnalysisOverlay({ onCancel }: AnalysisOverlayProps) {
  return (
    <div className="space-y-4">
      <LoadingSkeleton
        variant="writing"
        label="Läser din profil"
        meta="Tar oftast 15 till 30 sekunder. Stäng inte fliken."
      />

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
        >
          Avbryt
        </button>
      )}
    </div>
  )
}
