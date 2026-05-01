'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';

import ProfileHero from './components/ProfileHero';
import ProfileOverviewCards from './components/ProfileOverviewCards';
import PersonalDetailsSection from './components/PersonalDetailsSection';
import TonalitySection, {
  type TonalityValue,
  TONALITIES,
} from './components/TonalitySection';
import AccountSection from './components/AccountSection';
import SaveBar from './components/SaveBar';
import PremiumGateModal, { type PremiumFeature } from './components/PremiumGateModal';

interface ProfileFormState {
  full_name: string;
  linkedin_url: string;
  profile_photo_url: string;
  preferred_tonality: TonalityValue;
  phone: string;
  location: string;
  include_phone_in_letters: boolean;
  include_location_in_letters: boolean;
}

const EMPTY_FORM: ProfileFormState = {
  full_name: '',
  linkedin_url: '',
  profile_photo_url: '',
  preferred_tonality: 'professional',
  phone: '',
  location: '',
  include_phone_in_letters: false,
  include_location_in_letters: false,
};

export default function ProfilPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { successWithMascot } = useNotification();

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    subscriptionTier,
    isTrialUser,
    isAdminGranted,
    premiumUntil,
    hasActiveTrialOrPremium,
  } = useProfile();

  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [savedSnapshot, setSavedSnapshot] = useState<ProfileFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [premiumGate, setPremiumGate] = useState<PremiumFeature | null>(null);

  // Sync form-state med profile när data laddas
  useEffect(() => {
    if (profile) {
      const next: ProfileFormState = {
        full_name: profile.full_name || '',
        linkedin_url: profile.linkedin_url || '',
        profile_photo_url: profile.profile_photo_url || '',
        preferred_tonality: (profile.preferred_tonality || 'professional') as TonalityValue,
        phone: profile.phone || '',
        location: profile.location || '',
        include_phone_in_letters: profile.include_phone_in_letters || false,
        include_location_in_letters: profile.include_location_in_letters || false,
      };
      setFormData(next);
      setSavedSnapshot(next);
    }
  }, [profile]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedSnapshot);
  }, [formData, savedSnapshot]);

  // Set helpers
  const setField = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    if (formData.full_name.trim().length < 2) {
      successWithMascot(
        'Namnet måste vara minst två tecken långt.',
        'profile-error',
        4000,
        false
      );
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setSavedSnapshot(formData);
        successWithMascot(
          'Vi har uppdaterat din profil.',
          'profile-updated',
          3500
        );
      } else {
        throw new Error('Kunde inte spara profilen');
      }
    } catch (err: any) {
      console.error('Profile save error:', err);
      successWithMascot(
        err.message || 'Något gick fel. Försök igen.',
        'profile-error',
        4000,
        false
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (profile) {
      logUserActivity(
        profile.id,
        'logout',
        'Användaren loggade ut',
        { from_page: 'profile' }
      ).catch((e) => console.error('Loggningsfel:', e));
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    // Logga aktiviteten
    if (profile) {
      await logUserActivity(
        profile.id,
        'registered',
        'Användaren raderade sitt konto',
        {
          email: profile.email,
          subscription_tier: subscriptionTier,
          timestamp: new Date().toISOString(),
        }
      );
    }

    // Ta bort CV:n
    try {
      await fetch('/api/cv', { method: 'DELETE' });
    } catch (err) {
      console.warn('Kunde inte ta bort alla CV-data:', err);
    }

    // Ta bort brev
    try {
      await fetch('/api/letters', { method: 'DELETE' });
    } catch (err) {
      console.warn('Kunde inte ta bort alla brev:', err);
    }

    // Ta bort kontot
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      profile?.id || ''
    );

    if (deleteError) {
      if (deleteError.message.includes('permissions')) {
        await supabase.auth.signOut();
        const { error: clientDeleteError } = await supabase.rpc('delete_user_account');
        if (clientDeleteError) {
          throw new Error(
            `Kontoborttagning misslyckades: ${clientDeleteError.message}`
          );
        }
      } else {
        throw deleteError;
      }
    }

    successWithMascot(
      'Ditt konto är raderat. Tack för att du använde Jobbcoach.ai.',
      'account-deleted',
      4000,
      false
    );

    setTimeout(() => router.push('/'), 2000);
  };

  /* --- Render --- */

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"
          aria-label="Laddar profil"
        />
      </div>
    );
  }

  // Räkna ifyllda fält för översiktskortet
  // E-post räknas alltid som ifylld eftersom den kommer från Supabase Auth
  const filledFields =
    1 +
    [
      formData.full_name.trim().length > 0,
      Boolean(formData.profile_photo_url),
      Boolean(formData.linkedin_url),
      formData.phone.trim().length > 0,
      formData.location.trim().length > 0,
    ].filter(Boolean).length;

  const tonalityLabel =
    TONALITIES.find((t) => t.value === formData.preferred_tonality)?.label ??
    'Smart val';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 sm:pb-12 space-y-5 sm:space-y-6">
      {/* HERO */}
      <ProfileHero
        fullName={formData.full_name || profile?.full_name || ''}
        email={profile?.email || ''}
        profilePhotoUrl={formData.profile_photo_url}
        subscriptionTier={subscriptionTier}
        isTrialUser={isTrialUser}
        isAdminGranted={isAdminGranted}
        premiumUntil={premiumUntil}
        hasActiveTrialOrPremium={hasActiveTrialOrPremium}
      />

      {/* ÖVERSIKT */}
      <ProfileOverviewCards
        filledFields={Math.min(filledFields, 6)}
        totalFields={6}
        tonalityLabel={tonalityLabel}
        subscriptionTier={subscriptionTier}
        hasActiveTrialOrPremium={hasActiveTrialOrPremium}
      />

      {/* SEKTIONER */}
      <div id="personal-details" className="scroll-mt-24">
        <PersonalDetailsSection
          email={profile?.email || ''}
          fullName={formData.full_name}
          linkedinUrl={formData.linkedin_url}
          profilePhotoUrl={formData.profile_photo_url}
          phone={formData.phone}
          location={formData.location}
          includePhoneInLetters={formData.include_phone_in_letters}
          includeLocationInLetters={formData.include_location_in_letters}
          subscriptionTier={subscriptionTier}
          isSaving={isSaving}
          onFullNameChange={(v) => setField('full_name', v)}
          onLinkedInChange={(v) => setField('linkedin_url', v)}
          onPhotoChange={(url) => setField('profile_photo_url', url)}
          onPhotoRemove={() => setField('profile_photo_url', '')}
          onPhoneChange={(v) => setField('phone', v)}
          onLocationChange={(v) => setField('location', v)}
          onIncludePhoneChange={(v) => setField('include_phone_in_letters', v)}
          onIncludeLocationChange={(v) => setField('include_location_in_letters', v)}
          onError={(msg) =>
            successWithMascot(msg, 'profile-error', 4000, false)
          }
          onSuccess={(msg) => successWithMascot(msg, 'profile-updated', 3500)}
          onPremiumGate={(feature) => setPremiumGate(feature)}
        />
      </div>

      <div id="tonality" className="scroll-mt-24">
        <TonalitySection
          selected={formData.preferred_tonality}
          onChange={(v) => setField('preferred_tonality', v)}
          subscriptionTier={subscriptionTier}
          onPremiumGate={(feature) => setPremiumGate(feature)}
        />
      </div>

      <div id="account" className="scroll-mt-24">
        <AccountSection
          subscriptionTier={subscriptionTier}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>

      {/* SAVE BAR */}
      <SaveBar
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* PREMIUM GATE MODAL */}
      <PremiumGateModal
        feature={premiumGate}
        onClose={() => setPremiumGate(null)}
      />
    </div>
  );
}
