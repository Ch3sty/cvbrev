'use client'

/**
 * Fältprimitiver för profilsidan i Tråden (docs/designsystem.md, "Fält").
 *
 * Ordningen i varje fält är etikett, förklaring, inmatning. Fälten är
 * insunkna i papperet: insunken med 1 px inre överkant, fokus lyfter fältet
 * till panel med kant-stark och en fokusring i accent. Toggles i ink-1.
 *
 * Status visas per fält som en kort rad under inmatningen, aldrig som en
 * global bar. Sparat i positiv, fel i fel.
 */

import { useId, type ReactNode } from 'react'
import type { FieldSaveState } from './useFieldSave'

export const INPUT_CLASS =
  'mt-2 block h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 transition-colors focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:text-ink-3 aria-[invalid=true]:border-fel-kant aria-[invalid=true]:bg-panel'

/* ------------------------------------------------------------------ etikett */

/** Liten etikett i metadata i stället för "(obligatoriskt)" inom parentes. */
export function FieldTag({ required }: { required?: boolean }) {
  return <span className="text-meta font-normal text-ink-3">{required ? 'Krävs' : 'Valfritt'}</span>
}

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
      <p className="mt-1.5 text-meta text-fel" role="alert">
        {state.message}
      </p>
    )
  }
  if (state.status === 'saving') {
    return (
      <p className="mt-1.5 text-meta text-ink-3" aria-live="polite">
        Sparar
      </p>
    )
  }
  if (state.status === 'saved') {
    return (
      <p className="mt-1.5 text-meta text-positiv" aria-live="polite">
        Sparat
      </p>
    )
  }
  if (hint) {
    return <p className="mt-1.5 text-meta text-ink-3">{hint}</p>
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
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium text-ink-1">
        {label}
        <FieldTag required={required} />
      </label>

      <p className="mt-1 text-sm leading-[22px] text-ink-2">{description}</p>

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
        className={INPUT_CLASS}
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

/** Växeln i ink-1, direkt under sitt fält. Hela raden är 44 px hög. */
export function ProfileToggle({ label, description, checked, onChange, state, disabled }: ToggleProps) {
  const labelId = useId()

  return (
    <div className="mt-3 rounded-lg border border-kant p-3">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-medium text-ink-1">
            {label}
          </p>
          <p className="mt-0.5 text-meta text-ink-3">{description}</p>
        </div>

        <ToggleSwitch
          checked={checked}
          disabled={disabled || state.status === 'saving'}
          labelledBy={labelId}
          onChange={onChange}
        />
      </div>

      <FieldStatusLine state={state} />
    </div>
  )
}

/** Själva växeln: ink-1 när på, kant-stark när av. 160 ms. */
export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  labelledBy,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  labelledBy?: string
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[160ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 ${
        checked ? 'bg-ink-1' : 'bg-kant-stark'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-panel transition-transform duration-[160ms] ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

/* ---------------------------------------------------------------- sektionkort */

export function ProfileCard({
  id,
  title,
  description,
  plate,
  active,
  aside,
  children,
}: {
  id: string
  title: string
  /** En rad som säger var datan används. */
  description: string
  /** Marginalplattan. En per vy, bara på den aktiva sektionen. */
  plate?: ReactNode
  /** Aktiv sektion: tråden längs sektionshuvudet. */
  active?: boolean
  /** Valfritt innehåll under huvudet, till exempel en levande miniatyr. */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-xl border border-kant bg-panel ${active ? 'thread-head' : ''}`}
    >
      <div className={`flex items-start gap-3 p-4 sm:p-5 ${active ? 'thread-head-block' : ''}`}>
        {plate}
        <div className="min-w-0 flex-1">
          <h2 className="text-kort text-ink-1">{title}</h2>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{description}</p>
        </div>
      </div>

      <div className="space-y-5 border-t border-kant p-4 sm:p-5">
        {children}
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}
