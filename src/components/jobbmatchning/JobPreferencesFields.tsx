'use client'

/**
 * Preferensfälten för jobbmatchningen (docs/plan-jobbmatchning.md, våg 1).
 *
 * Samma fyra fält visas på två ställen: i profilens Inriktning-sektion och i
 * arket "Så söker vi åt dig" på sidan Dina matchningar. De bor därför här i
 * stället för i någon av sidorna, så att ett tillägg bara behöver göras en
 * gång och orden blir identiska på båda ställena.
 *
 * Komponenten äger inget sparande. Den tar ett värde och ropar onChange, och
 * anroparen bestämmer när det skrivs: profilen sparar per fält på blur,
 * arket sparar när användaren trycker Spara.
 *
 * Lönefältet har en egen hjälptext av ett skäl: lön får aldrig lämna vår
 * sida. Den används bara för att sortera bort annonser under användarens
 * nivå (Bli upptäckt-regeln), och det ska stå i klartext bredvid fältet.
 */

import { useId, useState } from 'react'
import Segment from '@/components/shell/Segment'
import type { JobPreferences, JobExtent } from '@/types/user.types'

const INPUT_CLASS =
  'block h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 transition-colors focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

/** Vad som står bredvid lönefältet. Ett ställe, så texten inte glider isär. */
export const SALARY_HELP =
  'Visas aldrig för arbetsgivare eller rekryterare. Används bara för att sortera bort annonser under din nivå.'

export interface JobPreferencesFieldsProps {
  value: JobPreferences
  onChange: (next: JobPreferences) => void
  /** Körs när ett fält lämnas, så profilen kan spara per fält. */
  onCommit?: () => void
  /** Statusrader per fält, till exempel profilens "Sparat". */
  statusSlot?: React.ReactNode
}

export default function JobPreferencesFields({
  value,
  onChange,
  onCommit,
  statusSlot,
}: JobPreferencesFieldsProps) {
  const ortId = useId()
  const lonId = useId()
  const [ortDraft, setOrtDraft] = useState('')

  const addOrt = () => {
    const ort = ortDraft.trim()
    if (!ort) return
    // Samma ort två gånger ger ingen bredare sökning, bara en extra chip.
    const finns = value.locations.some(
      (l) => l.toLowerCase() === ort.toLowerCase()
    )
    setOrtDraft('')
    if (finns) return
    onChange({ ...value, locations: [...value.locations, ort] })
    onCommit?.()
  }

  const removeOrt = (ort: string) => {
    onChange({ ...value, locations: value.locations.filter((l) => l !== ort) })
    onCommit?.()
  }

  return (
    <div className="space-y-5">
      {/* Ort(er) som chips med fritext */}
      <div>
        <label
          htmlFor={ortId}
          className="flex items-baseline gap-2 text-sm font-medium text-ink-1"
        >
          Ort
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </label>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Lägg till en eller flera orter du vill jobba i. Vi söker i alla.
        </p>

        {value.locations.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {value.locations.map((ort) => (
              <li key={ort}>
                <button
                  type="button"
                  onClick={() => removeOrt(ort)}
                  aria-label={`Ta bort ${ort}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-kant bg-panel px-3 text-sm text-ink-1 hover:border-kant-stark hover:bg-insunken"
                >
                  {ort}
                  <span aria-hidden="true" className="text-ink-3">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex gap-2">
          <input
            id={ortId}
            type="text"
            value={ortDraft}
            onChange={(e) => setOrtDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addOrt()
              }
            }}
            onBlur={addOrt}
            placeholder="Stockholm"
            inputMode="text"
            autoComplete="address-level2"
            enterKeyHint="done"
            maxLength={80}
            className={INPUT_CLASS}
          />
          <button
            type="button"
            onClick={addOrt}
            disabled={!ortDraft.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken disabled:opacity-40"
          >
            Lägg till
          </button>
        </div>
      </div>

      {/* Distans */}
      <div>
        <p className="flex items-baseline gap-2 text-sm font-medium text-ink-1">
          Distans
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Ska vi ta med jobb som går att göra på distans?
        </p>
        <Segment
          className="mt-2"
          label="Distans"
          value={value.remote ? 'ja' : 'nej'}
          onChange={(v) => {
            onChange({ ...value, remote: v === 'ja' })
            onCommit?.()
          }}
          options={[
            { value: 'ja', label: 'Ja' },
            { value: 'nej', label: 'Nej' },
          ]}
        />
      </div>

      {/* Omfattning */}
      <div>
        <p className="flex items-baseline gap-2 text-sm font-medium text-ink-1">
          Omfattning
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Lämna på Spelar ingen roll så visar vi både heltid och deltid.
        </p>
        <Segment
          className="mt-2"
          label="Omfattning"
          value={value.extent === '' ? 'alla' : value.extent}
          onChange={(v) => {
            const extent: JobExtent = v === 'alla' ? '' : (v as JobExtent)
            onChange({ ...value, extent })
            onCommit?.()
          }}
          options={[
            { value: 'heltid', label: 'Heltid' },
            { value: 'deltid', label: 'Deltid' },
            { value: 'alla', label: 'Spelar ingen roll' },
          ]}
        />
      </div>

      {/* Lägsta lön */}
      <div>
        <label
          htmlFor={lonId}
          className="flex items-baseline gap-2 text-sm font-medium text-ink-1"
        >
          Lägsta lön
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </label>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Månadslön före skatt.
        </p>
        <input
          id={lonId}
          type="text"
          value={value.min_salary === null ? '' : String(value.min_salary)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '')
            onChange({
              ...value,
              min_salary: digits === '' ? null : Number(digits),
            })
          }}
          onBlur={() => onCommit?.()}
          placeholder="35000"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={7}
          className={`mt-2 ${INPUT_CLASS}`}
        />
        <p className="mt-1.5 text-meta text-ink-3">{SALARY_HELP}</p>
      </div>

      {statusSlot}
    </div>
  )
}

/**
 * Preferenserna som en rad chips, till panelen "Så söker vi åt dig".
 * Lönen visas som satt eller ej satt, aldrig som belopp: sidan får se att
 * fältet är ifyllt, men beloppet står bara i själva fältet.
 *
 * Alla fyra inställningarna visas alltid, även de som inte är valda. Förut
 * ritades distans bara när den var påslagen och omfattning bara när den var
 * heltid eller deltid, så ett konto utan dem såg bara ort och lön och kunde
 * tro att panelen inte kände till resten. Panelen ska svara på vad vi söker
 * efter, och "nej" och "alla" är lika mycket svar som "ja" och "heltid".
 *
 * Ortsdelen kan bli flera chips. Den ligger först och `locationChipCount`
 * säger hur många de blev, så en anropare kan byta ut just dem.
 */
export function jobPreferenceChips(prefs: JobPreferences): string[] {
  const orter =
    prefs.locations.length > 0 ? [...prefs.locations] : ['Ingen ort vald']

  return [
    ...orter,
    `Distans: ${prefs.remote ? 'ja' : 'nej'}`,
    `Omfattning: ${
      prefs.extent === 'heltid'
        ? 'heltid'
        : prefs.extent === 'deltid'
          ? 'deltid'
          : 'alla'
    }`,
    `Lön: ${prefs.min_salary !== null ? 'satt' : 'ej satt'}`,
  ]
}

/**
 * Hur många av chipsen ovan som är ortschips. Anroparen som vill visa CV:ts
 * ort i stället behöver veta det: annars klipper den fel när användaren valt
 * flera orter.
 */
export function jobPreferenceLocationChipCount(prefs: JobPreferences): number {
  return prefs.locations.length > 0 ? prefs.locations.length : 1
}
