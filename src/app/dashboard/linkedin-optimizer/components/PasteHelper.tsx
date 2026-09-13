'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const STEPS = [
  { title: 'Öppna LinkedIn', desc: 'Gå till din profilsida.' },
  { title: 'Hitta sektionen', desc: 'Markera all text i den.' },
  { title: 'Kopiera', desc: 'Ctrl eller Cmd + C.' },
  { title: 'Klistra in här', desc: 'Ctrl eller Cmd + V i rätt fält.' },
]

/**
 * Hjälpen för att kopiera från LinkedIn: en panel med ett huvud som fälls
 * ut till fyra numrerade rader. Ingen orange, ingen rörelse.
 */
export default function PasteHelper() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-kant bg-panel">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left hover:bg-insunken"
        aria-expanded={open}
        aria-controls="paste-helper-steps"
      >
        <span className="text-sm font-medium text-ink-1">Så kopierar du från LinkedIn</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-3 transition-transform duration-[120ms] ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <ol id="paste-helper-steps" className="divide-y divide-kant border-t border-kant">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex min-h-11 items-center gap-3 px-4 py-2">
              <span className="w-5 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}.</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink-1">{step.title}</span>
                <span className="block text-meta text-ink-3">{step.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
