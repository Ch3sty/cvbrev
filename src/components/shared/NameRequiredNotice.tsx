'use client'

/**
 * Inline-fält när export stoppas av saknat namn (punkt 13 i
 * docs/plan-inloggat-saljflode.md).
 *
 * Tidigare föll namnet tillbaka på e-postens lokaldel, vilket gav CV med
 * rubriken "anna.lindqvist92". Det är värre än att fråga.
 *
 * Ett fält, en knapp, och nedladdningen fortsätter automatiskt. En gate som
 * kräver att användaren klickar "ladda ner" igen efter att ha svarat känns
 * som ett straff.
 */

import { useState } from 'react'
import { useProfile } from '@/hooks/use-profile'

interface NameRequiredNoticeProps {
  /** Körs när namnet sparats. Anroparen gör om exporten. */
  onSaved: () => void
  className?: string
}

export default function NameRequiredNotice({ onSaved, className }: NameRequiredNoticeProps) {
  const { updateProfile, refreshProfile } = useProfile()
  const [name, setName] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed || state === 'saving') return
    setState('saving')
    try {
      const ok = await updateProfile({ full_name: trimmed })
      if (!ok) throw new Error('kunde inte spara')
      await refreshProfile()
      onSaved()
    } catch {
      setState('error')
    }
  }

  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-4 ${className ?? ''}`}>
      <h3 className="text-base font-semibold text-neutral-900">Vi behöver ditt namn först</h3>
      <p className="text-sm text-neutral-600 mt-1">Det hamnar överst i dokumentet.</p>

      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <label htmlFor="export-name" className="sr-only">
          Namn
        </label>
        <input
          id="export-name"
          type="text"
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
          }}
          placeholder="Anna Lindqvist"
          className="flex-1 h-11 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={save}
          disabled={!name.trim() || state === 'saving'}
          className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-60 shrink-0"
        >
          {state === 'saving' ? 'Sparar…' : 'Spara och ladda ner'}
        </button>
      </div>

      {state === 'error' ? (
        <p className="text-sm text-red-700 mt-2">Kunde inte spara namnet. Försök igen.</p>
      ) : null}
    </div>
  )
}
