'use client'

/**
 * Sektion 1: "Så presenteras du" (profil-spec, avsnitt 2).
 *
 * Går rakt in i varje brev och CV, därför överst. Fältordningen följer hur
 * informationen möter rekryteraren: namn, e-post, telefon, ort, foto,
 * LinkedIn. Togglarna ligger direkt under sitt fält.
 *
 * Varje fält sparar sig självt på blur. Ingen SaveBar.
 */

import Image from 'next/image'
import { InlineProfilePhotoUpload } from './InlineProfilePhotoUpload'
import {
  ProfileCard,
  ProfileTextField,
  ProfileToggle,
  FieldStatusLine,
} from './ProfileField'
import ProfilePhotoPlaceholder from './illustrations/ProfilePhotoPlaceholder'
import BrevhuvudPreview from './illustrations/BrevhuvudPreview'
import { SectionPresentationIcon } from './illustrations/SectionIcons'
import type { FieldSaveState } from './useFieldSave'

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
      title="Så presenteras du"
      description="De här uppgifterna sparas separat från dina dokument och skickas aldrig till någon AI. Vi lägger in dem i brev och CV efteråt, med vår egen kod."
      icon={SectionPresentationIcon}
      aside={
        <figure className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <BrevhuvudPreview
            fullName={props.fullName}
            phone={props.phone}
            location={props.location}
            hasPhoto={Boolean(props.profilePhotoUrl)}
            showPhone={props.includePhoneInLetters}
            showLocation={props.includeLocationInLetters}
            className="h-auto w-full text-neutral-800"
          />
          <figcaption className="mt-2 text-xs text-neutral-500">
            Så här börjar dina brev och ditt CV. Miniatyren fylls i medan du
            skriver.
          </figcaption>
        </figure>
      }
    >
      <ProfileTextField
        label="Namn"
        description="Står överst i dina personliga brev och i ditt CV. Utan namn har rekryteraren inget att sätta på ansökan."
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
        <label
          htmlFor="profil-epost"
          className="block text-sm font-medium text-neutral-900"
        >
          E-post
        </label>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          Din inloggning och den adress rekryteraren svarar på. Ändras under
          Konto.
        </p>
        <input
          id="profil-epost"
          type="email"
          value={props.email}
          disabled
          autoComplete="email"
          className="mt-2 block h-11 w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-base text-neutral-600"
        />
      </div>

      <div>
        <ProfileTextField
          label="Telefon"
          description="Hamnar i brevhuvudet och i CV:t. Utan telefon kan rekryteraren inte ringa dig."
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
        <p className="block text-sm font-medium text-neutral-900">
          Profilbild
          <span className="ml-1 font-normal text-neutral-500">(valfritt)</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          Används i de CV-mallar som har plats för foto. Foto är frivilligt i
          Sverige och påverkar inte ATS-läsningen.
        </p>

        <div className="mt-2 flex items-start gap-4">
          <div className="shrink-0">
            {props.profilePhotoUrl ? (
              <Image
                src={props.profilePhotoUrl}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-lg border border-neutral-200 object-cover"
              />
            ) : (
              /* Streckad ram och illustration i stället för en tom ruta: en
                 platshållare ska se ut som en plats, inte som ett fel. */
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
                <ProfilePhotoPlaceholder className="h-10 w-10 text-neutral-400" />
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
          hint={
            props.photoFromGoogle && props.profilePhotoUrl
              ? 'Hämtad från ditt Google-konto'
              : undefined
          }
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
