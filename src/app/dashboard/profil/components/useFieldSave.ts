'use client'

/**
 * Autospara per fält (profil-spec, avsnitt 4).
 *
 * Sidan är en samling oberoende fält, inte ett formulär med ett resultat.
 * Den gamla SaveBar jämförde hela state-objektet med JSON.stringify, så en
 * toggle gjorde "Spara" aktiv för hela sidan, och den som bytte ort och
 * navigerade bort tappade ändringen tyst. Tre ytor sparade dessutom redan
 * själva, så samma data hade två sparmodeller.
 *
 * Här sparar varje fält sig själv och rapporterar sin egen status.
 */

import { useCallback, useRef, useState } from 'react'

export type FieldStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface FieldSaveState {
  status: FieldStatus
  /** Ifyllt när status är 'error'. Säger vad som gick fel. */
  message: string | null
}

const IDLE: FieldSaveState = { status: 'idle', message: null }

/** Hur länge "Sparat" står kvar innan raden tystnar igen. */
const SAVED_VISIBLE_MS = 2500

export interface UseFieldSaveResult {
  /** Status per fältnyckel. Okända nycklar är 'idle'. */
  stateFor: (key: string) => FieldSaveState
  /**
   * Sparar ett fält. `validate` får returnera ett felmeddelande för att
   * blockera sparningen av just det fältet, till exempel namnets minlängd.
   */
  save: (
    key: string,
    run: () => Promise<boolean>,
    validate?: () => string | null
  ) => Promise<void>
  /** Nollställer ett fälts status, till exempel när användaren skriver igen. */
  reset: (key: string) => void
}

export function useFieldSave(): UseFieldSaveResult {
  const [states, setStates] = useState<Record<string, FieldSaveState>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const setState = useCallback((key: string, next: FieldSaveState) => {
    setStates((prev) => ({ ...prev, [key]: next }))
  }, [])

  const reset = useCallback(
    (key: string) => {
      if (timers.current[key]) {
        clearTimeout(timers.current[key])
        delete timers.current[key]
      }
      setState(key, IDLE)
    },
    [setState]
  )

  const save = useCallback(
    async (
      key: string,
      run: () => Promise<boolean>,
      validate?: () => string | null
    ) => {
      const invalid = validate?.()
      if (invalid) {
        setState(key, { status: 'error', message: invalid })
        return
      }

      if (timers.current[key]) clearTimeout(timers.current[key])
      setState(key, { status: 'saving', message: null })

      try {
        const ok = await run()
        if (!ok) throw new Error('Kunde inte spara')

        setState(key, { status: 'saved', message: null })
        timers.current[key] = setTimeout(() => {
          setState(key, IDLE)
          delete timers.current[key]
        }, SAVED_VISIBLE_MS)
      } catch (err) {
        // Fältet behåller sitt värde. Användaren ska slippa skriva om det
        // bara för att nätet glappade.
        setState(key, {
          status: 'error',
          message:
            err instanceof Error && err.message !== 'Kunde inte spara'
              ? err.message
              : 'Ändringen sparades inte. Försök igen.',
        })
      }
    },
    [setState]
  )

  const stateFor = useCallback(
    (key: string): FieldSaveState => states[key] ?? IDLE,
    [states]
  )

  return { stateFor, save, reset }
}
