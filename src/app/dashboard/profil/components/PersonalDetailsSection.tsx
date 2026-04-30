'use client';

import { Mail, User, Phone, MapPin, Camera, Linkedin, Crown, Lock } from 'lucide-react';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { LinkedInInput } from '@/components/profile/LinkedInInput';
import IncludeInLettersToggle from './IncludeInLettersToggle';
import ProfileSection from './ProfileSection';
import { ProfileHeroOrb, ShieldGradientIcon } from './illustrations/ProfileIcons';
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
      description="Uppgifterna används bara för att personalisera dina CV:n och brev. Vi delar dem aldrig med externa AI-tjänster."
      icon={<ProfileHeroOrb />}
      delay={0.05}
    >
      <div className="space-y-5">
        {/* E-post */}
        <FieldGroup label="E-postadress" icon={<Mail className="w-4 h-4" />} required>
          <input
            type="email"
            value={props.email}
            disabled
            className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 cursor-not-allowed text-sm min-h-[48px]"
          />
          <FieldHint>Din e-postadress kan inte ändras.</FieldHint>
        </FieldGroup>

        {/* Namn */}
        <FieldGroup label="Fullständigt namn" icon={<User className="w-4 h-4" />} required>
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
        </FieldGroup>

        {/* Profilbild */}
        <FieldGroup
          label="Profilbild"
          icon={<Camera className="w-4 h-4" />}
          premium={isFree}
        >
          {isFree ? (
            <PremiumLockedField
              icon={<Camera className="w-5 h-5" />}
              title="Lägg till profilbild"
              description="Visas på premium CV-mallar för ett mer personligt intryck."
              onClick={() => props.onPremiumGate('photo')}
            />
          ) : (
            <ProfilePhotoUpload
              currentPhotoUrl={props.profilePhotoUrl}
              onUploadComplete={props.onPhotoChange}
              onRemovePhoto={props.onPhotoRemove}
              onError={props.onError}
              onSuccess={props.onSuccess}
              isUploading={props.isSaving}
            />
          )}
        </FieldGroup>

        {/* LinkedIn */}
        <FieldGroup
          label="LinkedIn-profil"
          icon={<Linkedin className="w-4 h-4" />}
          premium={isFree}
        >
          {isFree ? (
            <PremiumLockedField
              icon={<Linkedin className="w-5 h-5" />}
              title="Visa LinkedIn på CV:n"
              description="Förbättrar ATS-poängen och rekryterare kan verifiera din profil snabbt."
              onClick={() => props.onPremiumGate('linkedin')}
            />
          ) : (
            <LinkedInInput
              value={props.linkedinUrl}
              onChange={props.onLinkedInChange}
              disabled={props.isSaving}
            />
          )}
        </FieldGroup>

        {/* Telefon */}
        <FieldGroup label="Telefonnummer" icon={<Phone className="w-4 h-4" />}>
          <input
            type="tel"
            value={props.phone}
            onChange={(e) => props.onPhoneChange(e.target.value)}
            placeholder="+46 70 123 45 67"
            disabled={props.isSaving}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
            style={{ border: '1px solid rgba(249, 115, 22, 0.25)' }}
          />
          <div className="mt-3">
            <IncludeInLettersToggle
              checked={props.includePhoneInLetters}
              onChange={props.onIncludePhoneChange}
              label="Inkludera i personliga brev"
              description="Telefonnumret visas på dina genererade brev."
            />
          </div>
        </FieldGroup>

        {/* Ort */}
        <FieldGroup label="Ort" icon={<MapPin className="w-4 h-4" />}>
          <input
            type="text"
            value={props.location}
            onChange={(e) => props.onLocationChange(e.target.value)}
            placeholder="Stockholm"
            disabled={props.isSaving}
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
            style={{ border: '1px solid rgba(249, 115, 22, 0.25)' }}
          />
          <div className="mt-3">
            <IncludeInLettersToggle
              checked={props.includeLocationInLetters}
              onChange={props.onIncludeLocationChange}
              label="Inkludera i personliga brev"
              description="Orten visas på dina genererade brev."
            />
          </div>
        </FieldGroup>

        {/* Integritets-info */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
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
              Vi lagrar dina uppgifter säkert och anonymiserar dem innan de skickas
              till AI-tjänster. Du har full kontroll över vad som syns i dina brev.
            </p>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}

/* ---------- Helpers ---------- */

function FieldGroup({
  label,
  icon,
  required,
  premium,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  premium?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-700">{icon}</span>
        <label className="text-sm font-semibold text-slate-900">{label}</label>
        {required && <span className="text-orange-600 text-sm">*</span>}
        {premium && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{
              background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
            }}
          >
            <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
            Premium
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mt-2">{children}</p>;
}

function PremiumLockedField({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      style={{
        background:
          'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
        border: '2px dashed rgba(249, 115, 22, 0.4)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white relative"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
          }}
        >
          {icon}
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 2px 6px -1px rgba(15, 23, 42, 0.2)' }}
          >
            <Lock className="w-2.5 h-2.5 text-orange-600" strokeWidth={3} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
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
