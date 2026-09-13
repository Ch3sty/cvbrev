'use client'

import Link from 'next/link'
import ChoiceCard from '@/components/shell/ChoiceCard'
import Segment from '@/components/shell/Segment'
import MarginPlate from '@/components/shell/MarginPlate'
import { IlluPlattaPresentation } from '@/components/illustrations/TradenScener'
import {
  IkonCv,
  IkonLank,
  IkonMatchning,
  IkonSynlig,
} from '@/components/illustrations/Ikoner'
import CvSelectorList from '../CvSelectorList'

export type OptimizationMode = 'stand_out' | 'target_role'
export type Language = 'sv' | 'en'
export type SourceMode = 'cv' | 'manual'

interface Props {
  mode: OptimizationMode
  targetRole: string
  language: Language
  sourceMode: SourceMode
  selectedCvId: string | null
  hasCvs: boolean
  /** Låsta CV enligt CV-kvoten, uträknade på servern. Regeln är oförändrad. */
  lockedCvIds: Set<string>
  onModeChange: (mode: OptimizationMode) => void
  onTargetRoleChange: (role: string) => void
  onLanguageChange: (lang: Language) => void
  onSourceModeChange: (mode: SourceMode) => void
  onCvSelect: (cvId: string) => void
}

/**
 * Steg 1: varifrån texten kommer och vad optimeringen siktar mot. Ett steg,
 * en fråga i taget. Fortsätt ligger i FlowShell-foten, inte här.
 */
export default function Step1Mode({
  mode,
  targetRole,
  language,
  sourceMode,
  selectedCvId,
  hasCvs,
  lockedCvIds,
  onModeChange,
  onTargetRoleChange,
  onLanguageChange,
  onSourceModeChange,
  onCvSelect,
}: Props) {
  const trimmedRole = targetRole.trim()
  const roleTooShort = trimmedRole.length > 0 && trimmedRole.length < 3

  return (
    <div className="space-y-6">
      <div>
        <p className="text-steg uppercase text-ink-3">Steg 1 av 4</p>
        <h2 className="text-fraga text-ink-1">Hur vill du börja?</h2>
        <p className="mt-2 text-sm text-ink-2">
          Valet styr vad vi fyller fälten med i nästa steg.
        </p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Utgångspunkt">
        <ChoiceCard
          selected={sourceMode === 'cv'}
          onSelect={() => onSourceModeChange('cv')}
          disabled={!hasCvs}
          variant="featured"
          /* Orange får aldrig sitta på något som inte går att välja: utan CV
             är kortet utgråat, och då faller etiketten bort helt. */
          eyebrow={hasCvs ? 'Rekommenderas' : undefined}
          leading={
            <MarginPlate>
              <IlluPlattaPresentation size={48} />
            </MarginPlate>
          }
          title="Utgå från mitt CV"
          description="Vi fyller LinkedIn-fälten med det som redan står i ditt CV. Du redigerar fritt innan vi optimerar."
          meta={hasCvs ? undefined : 'Du har inget CV uppladdat ännu'}
        />
        <ChoiceCard
          selected={sourceMode === 'manual'}
          onSelect={() => onSourceModeChange('manual')}
          variant="plain"
          leading={<IkonLank className="text-ink-2" />}
          title="Klistra in min nuvarande LinkedIn"
          description="Vi skärper formuleringar och struktur utan att hitta på något du inte skrivit."
        />
      </div>

      {sourceMode === 'cv' && hasCvs && (
        <section className="rounded-xl border border-kant bg-panel p-4">
          <h3 className="mb-2 text-sm font-medium text-ink-3">
            Välj CV att utgå ifrån
          </h3>
          <CvSelectorList
            selectedCvId={selectedCvId}
            onSelect={onCvSelect}
            lockedCvIds={lockedCvIds}
          />
        </section>
      )}

      {sourceMode === 'cv' && !hasCvs && (
        <section className="rounded-xl border border-kant bg-panel p-4">
          <div className="flex items-start gap-3">
            <IkonCv className="mt-0.5 shrink-0 text-ink-2" />
            <div className="min-w-0">
              <p className="text-kort text-ink-1">Du har inget CV ännu</p>
              <p className="mt-1 text-meta text-ink-3">
                Ladda upp ditt CV först så fyller vi i LinkedIn-fälten åt dig.
              </p>
              <Link
                href="/dashboard/profil/cv"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Ladda upp CV
              </Link>
            </div>
          </div>
        </section>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink-3">Vad ska vi optimera mot?</h3>
        <div className="space-y-2" role="radiogroup" aria-label="Optimeringsmål">
          <ChoiceCard
            selected={mode === 'stand_out'}
            onSelect={() => onModeChange('stand_out')}
            variant="plain"
            leading={<IkonSynlig className="text-ink-2" />}
            title="Stå ut i mängden"
            description="Bredd och slagkraft. Vi säljer din unika styrka och rensar bort buzzwords."
          />
          <ChoiceCard
            selected={mode === 'target_role'}
            onSelect={() => onModeChange('target_role')}
            variant="plain"
            leading={<IkonMatchning className="text-ink-2" />}
            title="Sikta på en specifik roll"
            description="Vi anpassar nyckelord, ton och prioriteringar mot rollen du har i sikte."
          />
        </div>
      </div>

      {mode === 'target_role' && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">
            Vilken roll siktar du på?
          </span>
          <input
            id="targetRole"
            type="text"
            value={targetRole}
            enterKeyHint="done"
            inputMode="text"
            autoComplete="organization-title"
            onChange={(e) => onTargetRoleChange(e.target.value)}
            placeholder="Senior Product Manager"
            className={`h-11 w-full rounded-lg border bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1 ${
              roleTooShort ? 'border-fel' : 'border-kant'
            }`}
          />
          <span
            className={`mt-1 block text-meta ${roleTooShort ? 'text-fel' : 'text-ink-3'}`}
          >
            {roleTooShort
              ? 'Skriv minst tre tecken så vi kan optimera mot rätt roll.'
              : 'Används bara för att välja nyckelord och ton.'}
          </span>
        </label>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink-3">Språk</h3>
        <Segment
          value={language}
          onChange={onLanguageChange}
          label="Språk för den optimerade profilen"
          options={[
            { value: 'sv', label: 'Svenska' },
            { value: 'en', label: 'English' },
          ]}
        />
      </div>
    </div>
  )
}
