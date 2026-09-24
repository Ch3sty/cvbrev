'use client'

/**
 * Sektion 1: "Överst i ditt CV" (docs/design/profil-registrering-2026-09-24.html,
 * Del A). Vyns aktiva sektion med tråden. Fältordningen är foto, namn, ort,
 * telefon, e-post, LinkedIn: fotot först eftersom det är det enda fältet som
 * inte är text, och det man letar efter när en mall frågar efter foto.
 *
 * Brevhuvudets växlar och förhandsvisning bor i Personliga brev, där de
 * hör hemma. Förtroendetexten är en statusrad sist, och "Så gör vi" öppnar
 * hela stycket i ett ark.
 *
 * Desktop: två spalter, fälten till vänster och CV:ts huvud till höger i ett
 * insunket fält som ligger kvar medan man scrollar genom sektionen.
 */

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ProfileTextField, INPUT_CLASS } from './ProfileField'
import StatusRow from '@/components/shell/StatusRow'
import FotoFalt from './FotoFalt'
import type { FieldSaveState } from './useFieldSave'
import { CV_SEKTION } from '../profil-copy'

const Sheet = dynamic(() => import('@/components/shell/Sheet'), { ssr: false })

export interface CvUppgifterSectionProps {
  email: string
  fullName: string
  phone: string
  location: string
  linkedinUrl: string
  profilePhotoUrl: string
  phoneFromCv: boolean
  locationFromCv: boolean
  photoFromGoogle: boolean
  onFullNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onLocationChange: (v: string) => void
  onLinkedInChange: (v: string) => void
  onPhotoChange: (url: string) => void
  onPhotoRemove: () => void
  /** Anropas på blur för textfält, direkt för fotot. */
  onSaveField: (key: string) => void
  stateFor: (key: string) => FieldSaveState
}

export default function CvUppgifterSection(props: CvUppgifterSectionProps) {
  const [integritet, setIntegritet] = useState(false)

  return (
    <section id="cv" className="thread-head scroll-mt-24 rounded-xl border border-kant-stark bg-panel">
      <div className="thread-head-block p-4 sm:p-5">
        <h2 className="text-kort text-ink-1">{CV_SEKTION.rubrik}</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{CV_SEKTION.under}</p>
      </div>

      <div className="grid items-start gap-6 border-t border-kant p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_232px]">
        <div className="grid gap-5">
          <FotoFalt
            url={props.profilePhotoUrl}
            franGoogle={props.photoFromGoogle}
            onUppladdad={(url) => {
              props.onPhotoChange(url)
              props.onSaveField('profile_photo_url')
            }}
            onBorttagen={() => {
              props.onPhotoRemove()
              props.onSaveField('profile_photo_url')
            }}
            state={props.stateFor('profile_photo_url')}
          />

          <ProfileTextField
            label={CV_SEKTION.namn.etikett}
            description={CV_SEKTION.namn.text}
            value={props.fullName}
            onChange={props.onFullNameChange}
            onBlur={() => props.onSaveField('full_name')}
            state={props.stateFor('full_name')}
            required
            placeholder={CV_SEKTION.namn.plats}
            autoComplete="name"
            enterKeyHint="next"
            maxLength={120}
          />

          <ProfileTextField
            label={CV_SEKTION.ort.etikett}
            description={CV_SEKTION.ort.text}
            value={props.location}
            onChange={props.onLocationChange}
            onBlur={() => props.onSaveField('location')}
            state={props.stateFor('location')}
            hint={props.locationFromCv ? CV_SEKTION.hamtatCv : undefined}
            placeholder={CV_SEKTION.ort.plats}
            autoComplete="address-level2"
            enterKeyHint="next"
            maxLength={64}
          />

          <ProfileTextField
            label={CV_SEKTION.telefon.etikett}
            description={CV_SEKTION.telefon.text}
            value={props.phone}
            onChange={props.onPhoneChange}
            onBlur={() => props.onSaveField('phone')}
            state={props.stateFor('phone')}
            hint={props.phoneFromCv ? CV_SEKTION.hamtatCv : undefined}
            placeholder={CV_SEKTION.telefon.plats}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            maxLength={32}
          />

          <div>
            <label htmlFor="profil-epost" className="block text-sm font-medium text-ink-1">
              {CV_SEKTION.epost.etikett}
            </label>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">{CV_SEKTION.epost.text}</p>
            <div className="relative">
              <input
                id="profil-epost"
                type="email"
                value={props.email}
                disabled
                autoComplete="email"
                className={`${INPUT_CLASS} pr-10`}
              />
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="pointer-events-none absolute right-3 top-[26px] text-ink-3" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
          </div>

          <ProfileTextField
            label={CV_SEKTION.linkedin.etikett}
            description={CV_SEKTION.linkedin.text}
            value={props.linkedinUrl}
            onChange={props.onLinkedInChange}
            onBlur={() => props.onSaveField('linkedin_url')}
            state={props.stateFor('linkedin_url')}
            placeholder={CV_SEKTION.linkedin.plats}
            type="url"
            inputMode="url"
            autoComplete="url"
            enterKeyHint="done"
            autoCapitalize="none"
          />

          <StatusRow
            tone="positive"
            showDot
            wrap
            label="Integritet"
            action={
              <button
                type="button"
                onClick={() => setIntegritet(true)}
                className="text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
              >
                {CV_SEKTION.saGorVi}
              </button>
            }
          >
            {CV_SEKTION.integritet}
          </StatusRow>
        </div>

        <CvHuvudPreview
          namn={props.fullName}
          ort={props.location}
          telefon={props.phone}
          foto={props.profilePhotoUrl}
        />
      </div>

      {integritet ? (
        <Sheet open onClose={() => setIntegritet(false)} title={CV_SEKTION.integritetRubrik}>
          <p className="text-sm leading-[22px] text-ink-2">
            Namn, e-post, telefon, ort och foto sparas för sig, skilt från dina CV:n och brev. Innan
            något skickas till en AI byter vi ut personuppgifterna mot platshållare, så den ser att du
            har ett telefonnummer men aldrig vilket. Namnet och kontaktraderna sätts in i det färdiga
            dokumentet efteråt, av vår egen kod. Du ändrar eller raderar uppgifterna när du vill.
          </p>
        </Sheet>
      ) : null}
    </section>
  )
}

/**
 * CV:ts huvud som det ser ut i mallar med foto (bara desktop). Fylls i medan
 * man skriver. Tomma fält blir streckade platshållare.
 */
export function CvHuvudPreview({ namn, ort, telefon, foto }: { namn: string; ort: string; telefon: string; foto: string }) {
  const rad = [ort.trim(), telefon.trim()].filter(Boolean).join(' · ')
  return (
    <figure className="sticky top-24 m-0 hidden lg:block">
      <div className="rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
        <div className="rounded-md border border-kant bg-panel p-3">
          <div className="flex items-center gap-2.5">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-kant bg-insunken">
              {foto ? <Image src={foto} alt="" width={40} height={40} className="h-full w-full object-cover" /> : null}
            </span>
            <span className="min-w-0">
              {namn.trim() ? (
                <b className="block truncate text-[13px] font-semibold leading-4 text-ink-1">{namn}</b>
              ) : (
                <i className="block h-2.5 w-24 rounded-sm border border-dashed border-kant-stark" />
              )}
              {rad ? (
                <small className="mt-0.5 block truncate text-[11px] leading-4 text-ink-3">{rad}</small>
              ) : (
                <i className="mt-1 block h-2 w-16 rounded-sm border border-dashed border-kant-stark" />
              )}
            </span>
          </div>
          <div className="mt-3 grid gap-1.5" aria-hidden="true">
            {[90, 75, 82, 40, 88, 70].map((w, i) => (
              <i key={i} className={`block h-1.5 rounded-sm bg-kant ${i === 3 ? 'mt-1.5' : ''}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-meta text-ink-3">{CV_SEKTION.forhandsvisning}</figcaption>
    </figure>
  )
}
