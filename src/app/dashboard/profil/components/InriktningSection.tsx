'use client'

/**
 * Sektion 2: "Så hjälper vi dig" (profil-spec, avsnitt 2).
 *
 * Målroll och bransch driver bara Jobbcoachens systemprompt. Sektionen säger
 * därför rakt ut att de inte hamnar i brev eller CV.
 *
 * Här bor också den förvalda tonen, som ChoiceCard med nakna ikoner ur
 * Ikoner.tsx. Val markeras med kant ink-1 och bock, aldrig med tråden.
 * Smart val kräver Premium: kortet öppnar premiumluckan i stället för att
 * välja.
 */

import { ProfileCard, ProfileTextField, FieldStatusLine } from './ProfileField'
import { TONALITIES, type TonalityValue } from './tonalities'
import type { FieldSaveState } from './useFieldSave'
import type { PremiumFeature } from './PremiumGateModal'
import ChoiceCard from '@/components/shell/ChoiceCard'
import {
  IkonProfessionell,
  IkonKreativ,
  IkonSjalvsaker,
  IkonBalanserad,
  IkonEntusiastisk,
  IkonKrona,
  type IkonProps,
} from '@/components/illustrations/Ikoner'

const TONE_ICON: Record<TonalityValue, (props: IkonProps) => React.JSX.Element> = {
  professional: IkonProfessionell,
  creative: IkonKreativ,
  enthusiastic: IkonEntusiastisk,
  confident: IkonSjalvsaker,
  balanced: IkonBalanserad,
  auto: IkonKrona,
}

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
    >
      <ProfileTextField
        label="Målroll"
        description="Jobbcoachen utgår från den här rollen när du frågar om lön, intervjuer och nästa steg."
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
        <p className="flex items-baseline gap-2 text-sm font-medium text-ink-1">
          Förvald ton
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Tonen vi börjar med när du skapar ett nytt brev. Du kan alltid byta i själva brevet.
        </p>

        <div role="radiogroup" aria-label="Förvald ton" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TONALITIES.map((tone) => {
            const isSelected = preferredTonality === tone.value
            const isLocked = Boolean(tone.premium) && isFree
            const Icon = TONE_ICON[tone.value]

            return (
              <ChoiceCard
                key={tone.value}
                selected={isSelected}
                onSelect={() => {
                  if (isLocked) {
                    onPremiumGate('smart-tone')
                    return
                  }
                  onTonalityChange(tone.value)
                  onSaveField('preferred_tonality')
                }}
                title={tone.label}
                description={tone.shortDescription}
                meta={isLocked ? 'Ingår i Premium' : undefined}
                leading={<Icon size={24} />}
              />
            )
          })}
        </div>

        <FieldStatusLine state={stateFor('preferred_tonality')} />
      </div>
    </ProfileCard>
  )
}
