'use client'

/**
 * Sektion 2: "Så hjälper vi dig" (profil-spec, avsnitt 2).
 *
 * Målroll och bransch driver bara Jobbcoachens systemprompt. De låg tidigare
 * som neutrala profilfält bland kontaktuppgifterna, vilket fick dem att se ut
 * som något som skrivs in i ansökan. Sektionen säger därför rakt ut att de
 * inte hamnar i brev eller CV.
 *
 * Här bor också den förvalda tonen. Avsteg från specen, som föreslog att
 * preferred_tonality skulle tas bort: i stället är den nu kopplad på riktigt,
 * brevflödet initierar sin tonalitet från den. Den hör hemma här och inte i
 * sektion 1, eftersom den styr hur vi skriver åt dig, inte vilka uppgifter
 * som står i brevhuvudet.
 */

import { Lock } from 'lucide-react'
import { ProfileCard, ProfileTextField, FieldStatusLine } from './ProfileField'
import { TONALITIES, type TonalityValue } from './tonalities'
import type { FieldSaveState } from './useFieldSave'
import type { PremiumFeature } from './PremiumGateModal'
import { SectionInriktningIcon } from './illustrations/SectionIcons'

export interface InriktningSectionProps {
  goalRole: string
  industry: string
  preferredTonality: TonalityValue
  subscriptionTier: 'free' | 'premium'

  onGoalRoleChange: (v: string) => void
  onIndustryChange: (v: string) => void
  onTonalityChange: (v: TonalityValue) => void
  onSaveField: (key: string) => void
  onPremiumGate: (feature: PremiumFeature) => void

  stateFor: (key: string) => FieldSaveState
}

export default function InriktningSection({
  goalRole,
  industry,
  preferredTonality,
  subscriptionTier,
  onGoalRoleChange,
  onIndustryChange,
  onTonalityChange,
  onSaveField,
  onPremiumGate,
  stateFor,
}: InriktningSectionProps) {
  const isFree = subscriptionTier === 'free'

  return (
    <ProfileCard
      id="inriktning"
      title="Så hjälper vi dig"
      description="Styr hur Jobbcoachen svarar dig och vilken ton vi börjar med i nya brev. Inget av det här hamnar i dina brev eller ditt CV."
      icon={SectionInriktningIcon}
    >
      <ProfileTextField
        label="Målroll"
        description="Jobbcoachen utgår från den här rollen när du frågar om lön, intervjuer och nästa steg. Utan den svarar den mer allmänt."
        value={goalRole}
        onChange={onGoalRoleChange}
        onBlur={() => onSaveField('goal_role')}
        state={stateFor('goal_role')}
        placeholder="Projektledare"
        inputMode="text"
        autoComplete="organization-title"
        enterKeyHint="next"
        maxLength={120}
      />

      <ProfileTextField
        label="Bransch"
        description="Används tillsammans med målrollen för att göra Jobbcoachens svar relevanta för din bransch."
        value={industry}
        onChange={onIndustryChange}
        onBlur={() => onSaveField('industry')}
        state={stateFor('industry')}
        placeholder="Vård, IT, bygg, handel"
        inputMode="text"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={120}
      />

      <div>
        <p className="block text-sm font-medium text-neutral-900">
          Förvald ton
          <span className="ml-1 font-normal text-neutral-500">(valfritt)</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          Förvald ton när du skapar ett nytt brev. Du kan alltid byta i själva
          brevet.
        </p>

        <div
          role="radiogroup"
          aria-label="Förvald ton"
          className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {TONALITIES.map((tone) => {
            const isSelected = preferredTonality === tone.value
            const isLocked = Boolean(tone.premium) && isFree

            return (
              <button
                key={tone.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  if (isLocked) {
                    onPremiumGate('smart-tone')
                    return
                  }
                  onTonalityChange(tone.value)
                  onSaveField('preferred_tonality')
                }}
                className={`flex min-h-[44px] flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  isSelected
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                  {tone.label}
                  {isLocked && (
                    <Lock
                      className="h-3.5 w-3.5 text-neutral-500"
                      strokeWidth={2}
                      aria-label="Ingår i Premium"
                    />
                  )}
                </span>
                <span className="mt-0.5 text-sm leading-relaxed text-neutral-600">
                  {tone.shortDescription}
                </span>
              </button>
            )
          })}
        </div>

        <FieldStatusLine state={stateFor('preferred_tonality')} />
      </div>
    </ProfileCard>
  )
}
