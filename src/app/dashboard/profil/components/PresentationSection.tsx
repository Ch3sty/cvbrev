'use client'

/**
 * Sektion 1: "Så presenteras du" (docs/design/koncept-2026-09-13.md, ram 2).
 *
 * Vyns aktiva sektion: tråden längs huvudet och vyns enda marginalplatta.
 * Fältordningen följer hur informationen möter rekryteraren: namn, e-post,
 * telefon, ort, foto, LinkedIn. Togglarna ligger direkt under sitt fält.
 * Brevhuvud-miniatyren ligger sist, i ett insunket fält.
 *
 * Varje fält sparar sig självt på blur. Ingen SaveBar.
 */

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ProfileCard, ProfileTextField, ProfileToggle, FieldStatusLine, INPUT_CLASS } from './ProfileField'
import ProfilePhotoPlaceholder from './illustrations/ProfilePhotoPlaceholder'
import BrevhuvudPreview from './illustrations/BrevhuvudPreview'
import MarginPlate from '@/components/shell/MarginPlate'
import { IlluPlattaPresentation } from '@/components/illustrations/TradenScener'
import type { FieldSaveState } from './useFieldSave'

/**
 * Fotouppladdningen ligger långt ner i kortet, utanför första vyn på en
 * telefon. Den laddas när den scrollas fram i stället för i sidans första
 * paket. Höjden reserveras så raderna under står stilla.
 */
const InlineProfilePhotoUpload = dynamic(
  () => import('./InlineProfilePhotoUpload').then((m) => m.InlineProfilePhotoUpload),
  { loading: () => <div className="min-h-[96px]" aria-hidden="true" /> }
)

export interface PresentationSectionProps {
  email: string
  fullName: string
  phone: string
  location: string
  linkedinUrl: string
  profilePhotoUrl: string
  includePhoneInLetters: boolean
  includeLocationInLetters: boolean

  /** Sant när värdet kom från ett parsat CV och användaren inte rört det. */
  phoneFromCv: boolean
  locationFromCv: boolean
  /** Sant när bilden kom från Google-inloggningen. */
  photoFromGoogle: boolean

  onFullNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onLocationChange: (v: string) => void
  onLinkedInChange: (v: string) => void
  onPhotoChange: (url: string) => void
  onPhotoRemove: () => void
  onIncludePhoneChange: (v: boolean) => void
  onIncludeLocationChange: (v: boolean) => void

  /** Anropas på blur för textfält, direkt vid klick för toggles och foto. */
  onSaveField: (key: string) => void

  stateFor: (key: string) => FieldSaveState
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function PresentationSection(props: PresentationSectionProps) {
  const photoState = props.stateFor('profile_photo_url')

  return (
    <ProfileCard
      id="presentation"
      active
      title="Så presenteras du"
      description="Namn, telefon och ort läggs in i brev och CV efteråt, med vår egen kod. De skickas aldrig till någon AI."
      plate={
        <MarginPlate>
          <IlluPlattaPresentation size={48} />
        </MarginPlate>
      }
      aside={
        <figure className="rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
          <div className="rounded-md border border-kant bg-panel p-3">
            <BrevhuvudPreview
              fullName={props.fullName}
              phone={props.phone}
              location={props.location}
              hasPhoto={Boolean(props.profilePhotoUrl)}
              showPhone={props.includePhoneInLetters}
              showLocation={props.includeLocationInLetters}
              className="h-auto w-full text-ink-1"
            />
          </div>
          <figcaption className="mt-2 text-meta text-ink-3">
            Så börjar dina brev och ditt CV. Fylls i medan du skriver.
          </figcaption>
        </figure>
      }
    >
      <ProfileTextField
        label="Namn"
        description="Står överst i dina personliga brev och i ditt CV."
        value={props.fullName}
        onChange={props.onFullNameChange}
        onBlur={() => props.onSaveField('full_name')}
        state={props.stateFor('full_name')}
        required
        placeholder="Anna Andersson"
        inputMode="text"
        autoComplete="name"
        enterKeyHint="next"
        maxLength={120}
      />

      <div>
        <label htmlFor="profil-epost" className="block text-sm font-medium text-ink-1">
          E-post
        </label>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Din inloggning och den adress rekryteraren svarar på. Ändras under Konto.
        </p>
        <input
          id="profil-epost"
          type="email"
          value={props.email}
          disabled
          autoComplete="email"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <ProfileTextField
          label="Telefon"
          description="Hamnar i brevhuvudet och i CV:t, så rekryteraren kan ringa dig."
          value={props.phone}
          onChange={props.onPhoneChange}
          onBlur={() => props.onSaveField('phone')}
          state={props.stateFor('phone')}
          hint={props.phoneFromCv ? 'Hämtat från ditt CV' : undefined}
          placeholder="+46 70 123 45 67"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="next"
          maxLength={32}
        />
        <ProfileToggle
          label="Ta med i brev"
          description="Av om du hellre vill bli kontaktad på mejl."
          checked={props.includePhoneInLetters}
          onChange={(next) => {
            props.onIncludePhoneChange(next)
            props.onSaveField('include_phone_in_letters')
          }}
          state={props.stateFor('include_phone_in_letters')}
        />
      </div>

      <div>
        <ProfileTextField
          label="Ort"
          description="Står i brevhuvudet och i CV:t, och hjälper Jobbcoachen svara om din lokala arbetsmarknad."
          value={props.location}
          onChange={props.onLocationChange}
          onBlur={() => props.onSaveField('location')}
          state={props.stateFor('location')}
          hint={props.locationFromCv ? 'Hämtat från ditt CV' : undefined}
          placeholder="Stockholm"
          inputMode="text"
          autoComplete="address-level2"
          enterKeyHint="next"
          maxLength={64}
        />
        <ProfileToggle
          label="Ta med i brev"
          description="Av om du söker jobb på annan ort."
          checked={props.includeLocationInLetters}
          onChange={(next) => {
            props.onIncludeLocationChange(next)
            props.onSaveField('include_location_in_letters')
          }}
          state={props.stateFor('include_location_in_letters')}
        />
      </div>

      <div>
        <p className="flex items-baseline gap-2 text-sm font-medium text-ink-1">
          Profilbild
          <span className="text-meta font-normal text-ink-3">Valfritt</span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Används i de CV-mallar som har plats för foto. Foto är frivilligt i Sverige och påverkar
          inte ATS-läsningen.
        </p>

        <div className="mt-2 flex items-start gap-4">
          <div className="shrink-0">
            {props.profilePhotoUrl ? (
              <Image
                src={props.profilePhotoUrl}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-lg border border-kant object-cover"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg border border-dashed border-kant-stark bg-insunken">
                <ProfilePhotoPlaceholder className="h-10 w-10 text-ink-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <InlineProfilePhotoUpload
              currentPhotoUrl={props.profilePhotoUrl}
              onUploadComplete={(url) => {
                props.onPhotoChange(url)
                props.onSaveField('profile_photo_url')
              }}
              onRemovePhoto={() => {
                props.onPhotoRemove()
                props.onSaveField('profile_photo_url')
              }}
              onError={props.onError}
              onSuccess={props.onSuccess}
            />
          </div>
        </div>

        <FieldStatusLine
          state={photoState}
          hint={props.photoFromGoogle && props.profilePhotoUrl ? 'Hämtad från ditt Google-konto' : undefined}
        />
      </div>

      <ProfileTextField
        label="LinkedIn"
        description="Läggs som en rad i ditt CV. Rekryterare klickar ofta dit innan de hör av sig."
        value={props.linkedinUrl}
        onChange={props.onLinkedInChange}
        onBlur={() => props.onSaveField('linkedin_url')}
        state={props.stateFor('linkedin_url')}
        placeholder="linkedin.com/in/ditt-namn"
        type="url"
        inputMode="url"
        autoComplete="url"
        enterKeyHint="done"
        autoCapitalize="none"
      />
    </ProfileCard>
  )
}
