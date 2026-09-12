'use client'

/**
 * Fältprimitiver för profilsidan (profil-spec, avsnitt 2, 4 och 5).
 *
 * Ordningen i varje fält är etikett, förklaring, inmatning. Förklaringen står
 * alltså före fältet, så den läses innan man fyller i och inte efteråt.
 *
 * Status visas per fält som en kort rad under inmatningen, aldrig som en
 * global bar. Vid fel behåller fältet sitt värde och raden säger vad som gick
 * fel.
 */

import { useId, type ReactNode } from 'react'
import type { FieldSaveState } from './useFieldSave'

/* ---------------------------------------------------------------- statusrad */

export function FieldStatusLine({
  state,
  hint,
}: {
  state: FieldSaveState
  /** Visas när fältet är i viloläge, till exempel "Hämtat från ditt CV". */
  hint?: ReactNode
}) {
  if (state.status === 'error') {
    return (
      <p className="mt-1.5 text-sm text-red-700" role="alert">
        {state.message}
      </p>
    )
  }
  if (state.status === 'saving') {
    return (
      <p className="mt-1.5 text-sm text-neutral-500" aria-live="polite">
        Sparar
      </p>
    )
  }
  if (state.status === 'saved') {
    return (
      <p className="mt-1.5 text-sm text-emerald-700" aria-live="polite">
        Sparat
      </p>
    )
  }
  if (hint) {
    return <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>
  }
  return null
}

/* ------------------------------------------------------------------ textfält */

interface TextFieldProps {
  label: string
  /** Den förklarande raden. Står mellan etikett och inmatning. */
  description: string
  value: string
  onChange: (value: string) => void
  /** Körs på blur. Sidan sparar per fält, inte per sida. */
  onBlur: () => void
  state: FieldSaveState
  hint?: ReactNode
  required?: boolean
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'tel' | 'url' | 'email'
  inputMode?: 'text' | 'tel' | 'url' | 'email'
  autoComplete?: string
  enterKeyHint?: 'next' | 'done'
  /** LinkedIn-URL:en ska aldrig få stor bokstav först. */
  autoCapitalize?: 'none' | 'sentences'
  maxLength?: number
}

export function ProfileTextField({
  label,
  description,
  value,
  onChange,
  onBlur,
  state,
  hint,
  required,
  disabled,
  placeholder,
  type = 'text',
  inputMode = 'text',
  autoComplete,
  enterKeyHint = 'next',
  autoCapitalize,
  maxLength,
}: TextFieldProps) {
  const id = useId()

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-900"
      >
        {label}
        {required ? (
          <span className="ml-1 text-neutral-500 font-normal">
            (obligatoriskt)
          </span>
        ) : (
          <span className="ml-1 text-neutral-500 font-normal">(valfritt)</span>
        )}
      </label>

      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        {description}
      </p>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        aria-invalid={state.status === 'error' || undefined}
        className="mt-2 block h-11 w-full rounded-lg border border-neutral-200 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-50 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-600"
      />

      <FieldStatusLine state={state} hint={hint} />
    </div>
  )
}

/* -------------------------------------------------------------------- toggle */

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
  state: FieldSaveState
  disabled?: boolean
}

/**
 * Växeln ligger direkt under sitt fält, aldrig i en egen grupp: utan sin
 * referent vet man inte vad "Ta med i brev" syftar på. Hela raden är 44 px
 * hög även om själva växeln är 24.
 */
export function ProfileToggle({
  label,
  description,
  checked,
  onChange,
  state,
  disabled,
}: ToggleProps) {
  const labelId = useId()

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 p-3">
      <div className="flex min-h-[44px] items-center justify-between gap-4">
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-medium text-neutral-900">
            {label}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-neutral-600">
            {description}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          disabled={disabled || state.status === 'saving'}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
            checked ? 'bg-orange-600' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <FieldStatusLine state={state} />
    </div>
  )
}

/* ---------------------------------------------------------------- sektionkort */

export function ProfileCard({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  /** En rad som säger var datan används. */
  description: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        {description}
      </p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}
