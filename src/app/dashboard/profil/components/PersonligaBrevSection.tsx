'use client'

/**
 * Sektion 2: "Personliga brev" (Del A). Allt som bara påverkar brevet på
 * ett ställe: förvald ton först, sedan brevhuvudets två växlar och
 * förhandsvisningen av brevhuvudet. Brevflödets tonsteg länkar hit
 * (#personliga-brev).
 *
 * Smart val kräver ett paket: kortet öppnar luckan i stället för att välja.
 * Tonvalet visar sin statusrad under kortgruppen, inte under varje kort.
 */

import ChoiceCard from '@/components/shell/ChoiceCard'
import {
  IkonBalanserad,
  IkonEntusiastisk,
  IkonKreativ,
  IkonKrona,
  IkonProfessionell,
  IkonSjalvsaker,
  type IkonProps,
} from '@/components/illustrations/Ikoner'
import { FieldStatusLine, ProfileToggle } from './ProfileField'
import BrevhuvudPreview from './illustrations/BrevhuvudPreview'
import { TONALITIES, type TonalityValue } from './tonalities'
import type { FieldSaveState } from './useFieldSave'
import { BREV_SEKTION } from '../profil-copy'

const TONE_ICON: Record<TonalityValue, (props: IkonProps) => React.JSX.Element> = {
  professional: IkonProfessionell,
  creative: IkonKreativ,
  enthusiastic: IkonEntusiastisk,
  confident: IkonSjalvsaker,
  balanced: IkonBalanserad,
  auto: IkonKrona,
}

export interface PersonligaBrevSectionProps {
  preferredTonality: TonalityValue
  harPaket: boolean
  fullName: string
  phone: string
  location: string
  hasPhoto: boolean
  includePhoneInLetters: boolean
  includeLocationInLetters: boolean
  onTonalityChange: (v: TonalityValue) => void
  onIncludePhoneChange: (v: boolean) => void
  onIncludeLocationChange: (v: boolean) => void
  onSaveField: (key: string) => void
  onSmartValSparrad: () => void
  stateFor: (key: string) => FieldSaveState
}

export default function PersonligaBrevSection(p: PersonligaBrevSectionProps) {
  return (
    <section id="personliga-brev" className="scroll-mt-24 rounded-xl border border-kant bg-panel">
      <div className="p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">{BREV_SEKTION.rubrik}</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{BREV_SEKTION.under}</p>
      </div>

      <div className="grid gap-5 border-t border-kant p-4 sm:p-5">
        <div>
          <p id="forvald-ton" className="text-sm font-medium text-ink-1">
            {BREV_SEKTION.ton}
          </p>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{BREV_SEKTION.tonText}</p>
          <div role="radiogroup" aria-labelledby="forvald-ton" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TONALITIES.map((tone) => {
              const last = Boolean(tone.premium) && !p.harPaket
              const Icon = TONE_ICON[tone.value]
              return (
                <ChoiceCard
                  key={tone.value}
                  selected={p.preferredTonality === tone.value}
                  onSelect={() => {
                    if (last) {
                      p.onSmartValSparrad()
                      return
                    }
                    p.onTonalityChange(tone.value)
                    p.onSaveField('preferred_tonality')
                  }}
                  title={tone.label}
                  description={tone.shortDescription}
                  meta={tone.premium && !p.harPaket ? BREV_SEKTION.smartMeta : undefined}
                  leading={<Icon size={24} />}
                  data-ton={tone.value}
                />
              )
            })}
          </div>
          <FieldStatusLine state={p.stateFor('preferred_tonality')} />
        </div>

        <div>
          <p className="text-sm font-medium text-ink-1">{BREV_SEKTION.huvud}</p>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{BREV_SEKTION.huvudText}</p>
          <div className="-mt-1">
            <ProfileToggle
              label={BREV_SEKTION.telefon.etikett}
              description={BREV_SEKTION.telefon.text}
              checked={p.includePhoneInLetters}
              onChange={(next) => {
                p.onIncludePhoneChange(next)
                p.onSaveField('include_phone_in_letters')
              }}
              state={p.stateFor('include_phone_in_letters')}
            />
            <ProfileToggle
              label={BREV_SEKTION.ort.etikett}
              description={BREV_SEKTION.ort.text}
              checked={p.includeLocationInLetters}
              onChange={(next) => {
                p.onIncludeLocationChange(next)
                p.onSaveField('include_location_in_letters')
              }}
              state={p.stateFor('include_location_in_letters')}
            />
          </div>

          <figure className="mt-3 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
            <div className="rounded-md border border-kant bg-panel p-3">
              <BrevhuvudPreview
                fullName={p.fullName}
                phone={p.phone}
                location={p.location}
                hasPhoto={p.hasPhoto}
                showPhone={p.includePhoneInLetters}
                showLocation={p.includeLocationInLetters}
                className="h-auto w-full text-ink-1"
              />
            </div>
            <figcaption className="mt-2 text-meta text-ink-3">{BREV_SEKTION.forhandsvisning}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
