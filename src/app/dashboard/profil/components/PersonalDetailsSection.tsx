'use client';

import {
  Lock,
  Crown,
  Mail,
  User,
  Camera,
  Linkedin,
  Phone,
  MapPin,
  UserCircle,
} from 'lucide-react';
import { InlineProfilePhotoUpload } from './InlineProfilePhotoUpload';
import { InlineLinkedInField } from './InlineLinkedInField';
import IncludeInLettersToggle from './IncludeInLettersToggle';
import ProfileSection from './ProfileSection';
import { ShieldGradientIcon } from './illustrations/ProfileIcons';
import type { PremiumFeature } from './PremiumGateModal';

interface PersonalDetailsSectionProps {
  email: string;
  fullName: string;
  linkedinUrl: string;
  profilePhotoUrl: string;
  phone: string;
  location: string;
  includePhoneInLetters: boolean;
  includeLocationInLetters: boolean;
  subscriptionTier: 'free' | 'premium';
  isSaving: boolean;

  onFullNameChange: (value: string) => void;
  onLinkedInChange: (value: string) => void;
  onPhotoChange: (url: string) => void;
  onPhotoRemove: () => void;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onIncludePhoneChange: (value: boolean) => void;
  onIncludeLocationChange: (value: boolean) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;

  /** Öppna premium-gate modal för en specifik feature */
  onPremiumGate: (feature: PremiumFeature) => void;
}

export default function PersonalDetailsSection(props: PersonalDetailsSectionProps) {
  const isFree = props.subscriptionTier === 'free';

  return (
    <ProfileSection
      eyebrow="Personliga uppgifter"
      title="Vem är du?"
      description="Det här använder vi när vi skapar dina CV:n och personliga brev."
      icon={<UserCircle className="w-6 h-6" strokeWidth={2} />}
      delay={0.15}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* E-post */}
        <FieldCard
          icon={<Mail className="w-4 h-4" strokeWidth={2.25} />}
          label="E-postadress"
          required
        >
          <input
            type="email"
            value={props.email}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 cursor-not-allowed text-sm min-h-[48px]"
          />
          <FieldHint>Din e-postadress kan inte ändras.</FieldHint>
        </FieldCard>

        {/* Namn */}
        <FieldCard
          icon={<User className="w-4 h-4" strokeWidth={2.25} />}
          label="Fullständigt namn"
          required
        >
          <input
            type="text"
            value={props.fullName}
            onChange={(e) => props.onFullNameChange(e.target.value)}
            placeholder="Anna Andersson"
            disabled={props.isSaving}
            minLength={2}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
            style={{ border: '1px solid rgba(249, 115, 22, 0.25)' }}
          />
        </FieldCard>

        {/* Profilbild */}
        <FieldCard
          icon={<Camera className="w-4 h-4" strokeWidth={2.25} />}
          label="Profilbild"
          premium={isFree}
        >
          {isFree ? (
            <PremiumLockedField
              title="Lägg till profilbild"
              description="Då kan du välja att ha med ett foto när du skapar dina CV:n."
              onClick={() => props.onPremiumGate('photo')}
            />
          ) : (
            <InlineProfilePhotoUpload
              currentPhotoUrl={props.profilePhotoUrl}
              onUploadComplete={props.onPhotoChange}
              onRemovePhoto={props.onPhotoRemove}
              onError={props.onError}
              onSuccess={props.onSuccess}
              isUploading={props.isSaving}
            />
          )}
        </FieldCard>

        {/* LinkedIn */}
        <FieldCard
          icon={<Linkedin className="w-4 h-4" strokeWidth={2.25} />}
          label="LinkedIn-profil"
          premium={isFree}
        >
          {isFree ? (
            <PremiumLockedField
              title="Lägg till LinkedIn-länk"
              description="Då kan du välja att ha med din LinkedIn-profil när du skapar dina CV:n."
              onClick={() => props.onPremiumGate('linkedin')}
            />
          ) : (
            <InlineLinkedInField
              value={props.linkedinUrl}
              onChange={props.onLinkedInChange}
              disabled={props.isSaving}
            />
          )}
        </FieldCard>

        {/* Telefon */}
        <FieldCard
          icon={<Phone className="w-4 h-4" strokeWidth={2.25} />}
          label="Telefonnummer"
        >
          <input
            type="tel"
            value={props.phone}
            onChange={(e) => props.onPhoneChange(e.target.value)}
            placeholder="+46 70 123 45 67"
            disabled={props.isSaving}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
            style={{ border: '1px solid rgba(249, 115, 22, 0.25)' }}
          />
          <FieldFooterToggle>
            <IncludeInLettersToggle
              checked={props.includePhoneInLetters}
              onChange={props.onIncludePhoneChange}
              label="Inkludera i personliga brev"
              description="Telefonnumret visas på dina personliga brev."
            />
          </FieldFooterToggle>
        </FieldCard>

        {/* Ort */}
        <FieldCard
          icon={<MapPin className="w-4 h-4" strokeWidth={2.25} />}
          label="Ort"
        >
          <input
            type="text"
            value={props.location}
            onChange={(e) => props.onLocationChange(e.target.value)}
            placeholder="Stockholm"
            disabled={props.isSaving}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
            style={{ border: '1px solid rgba(249, 115, 22, 0.25)' }}
          />
          <FieldFooterToggle>
            <IncludeInLettersToggle
              checked={props.includeLocationInLetters}
              onChange={props.onIncludeLocationChange}
              label="Inkludera i personliga brev"
              description="Orten visas på dina personliga brev."
            />
          </FieldFooterToggle>
        </FieldCard>
      </div>

      {/* Integritets-info */}
      <div
        className="mt-5 sm:mt-6 rounded-2xl p-4 flex items-start gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.22)',
        }}
      >
        <ShieldGradientIcon className="w-8 h-8 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-emerald-900 mb-0.5">
            Din integritet är skyddad
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Dina personuppgifter skickas aldrig till någon AI-tjänst. Vi skickar
            enbart anonym råtext och sätter in dina uppgifter på vår egen server efteråt.
          </p>
        </div>
      </div>
    </ProfileSection>
  );
}

/* ---------- Helpers ---------- */

function FieldCard({
  icon,
  label,
  required,
  premium,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  premium?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0 text-orange-500">{icon}</div>
        <label className="text-sm font-semibold text-slate-900 leading-tight">
          {label}
          {required && (
            <span className="text-orange-600 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {premium && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
          >
            <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
            Premium
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mt-2">{children}</p>;
}

function FieldFooterToggle({ children }: { children: React.ReactNode }) {
  return <div className="mt-2.5">{children}</div>;
}

function PremiumLockedField({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      style={{
        background:
          'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
        border: '2px dashed rgba(249, 115, 22, 0.4)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white relative"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          <Lock className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900 leading-tight">
            {title}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
          style={{
            background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
            boxShadow: '0 3px 8px -2px rgba(245, 158, 11, 0.4)',
          }}
        >
          Lås upp
        </span>
      </div>
    </button>
  );
}
