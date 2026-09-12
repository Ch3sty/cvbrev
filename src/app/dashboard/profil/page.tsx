'use client';

/**
 * Profilsidan (profil-spec).
 *
 * Fyra sektioner, rangordnade efter hur mycket de påverkar användarens
 * resultat: så presenteras du, så hjälper vi dig, bli upptäckt, konto och
 * notiser. Sidmallen enligt docs/plan-inloggat-omdesign.md avsnitt 3:
 * PageHeader, sedan vita kort med border.
 *
 * Sparbeteendet är autospara per fält. Den gamla SaveBar jämförde hela
 * state-objektet, så en toggle gjorde "Spara" aktiv för hela sidan och den
 * som bytte ort och navigerade bort tappade ändringen tyst. Nu sparar varje
 * fält sig självt på blur, toggles och foto direkt vid klick, och statusen
 * visas per fält.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
import PageHeader from '@/components/shell/PageHeader';

import IntegritetsBlock from './components/IntegritetsBlock';
import PresentationSection from './components/PresentationSection';
import InriktningSection from './components/InriktningSection';
import BliUpptacktSection from './components/BliUpptacktSection';
import AccountSection from './components/AccountSection';
import NotisInstallningar from './components/NotisInstallningar';
import PremiumGateModal, { type PremiumFeature } from './components/PremiumGateModal';
import { type TonalityValue } from './components/tonalities';
import { useFieldSave } from './components/useFieldSave';

interface ProfileFormState {
  full_name: string;
  linkedin_url: string;
  profile_photo_url: string;
  preferred_tonality: TonalityValue;
  phone: string;
  location: string;
  goal_role: string;
  industry: string;
  include_phone_in_letters: boolean;
  include_location_in_letters: boolean;
}

const EMPTY_FORM: ProfileFormState = {
  full_name: '',
  linkedin_url: '',
  profile_photo_url: '',
  preferred_tonality: 'balanced',
  phone: '',
  location: '',
  goal_role: '',
  industry: '',
  include_phone_in_letters: true,
  include_location_in_letters: true,
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
  } = useProfile();

  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [premiumGate, setPremiumGate] = useState<PremiumFeature | null>(null);
  const { stateFor, save, reset } = useFieldSave();

  /* Vad som kom från parsat CV respektive Google, så att fälten kan säga
     "Hämtat från ditt CV". Läses en gång vid första laddningen: därefter är
     värdet användarens eget, oavsett varifrån det kom. */
  const [prefilled, setPrefilled] = useState({
    phone: false,
    location: false,
    photo: false,
  });
  const prefillChecked = useRef(false);

  useEffect(() => {
    if (!profile) return;

    const next: ProfileFormState = {
      full_name: profile.full_name || '',
      linkedin_url: profile.linkedin_url || '',
      profile_photo_url: profile.profile_photo_url || '',
      preferred_tonality: (profile.preferred_tonality || 'balanced') as TonalityValue,
      phone: profile.phone || '',
      location: profile.location || '',
      goal_role: (profile as any).goal_role || '',
      industry: (profile as any).industry || '',
      include_phone_in_letters: profile.include_phone_in_letters ?? true,
      include_location_in_letters: profile.include_location_in_letters ?? true,
    };
    setFormData(next);

    if (prefillChecked.current) return;
    prefillChecked.current = true;

    // Telefon och ort skrivs tillbaka från CV-parsern, fotot kommer från
    // Google-avataren vid inloggning. Har användaren aldrig sparat något
    // själv är värdet alltså hämtat, inte inskrivet.
    const parsedAt = (profile as any).contact_parsed_at;
    const cameFromCv = Boolean(parsedAt);
    const googleAvatar = (profile as any).avatar_source === 'google';

    setPrefilled({
      phone: cameFromCv && Boolean(next.phone),
      location: cameFromCv && Boolean(next.location),
      photo: googleAvatar && Boolean(next.profile_photo_url),
    });
  }, [profile]);

  const setField = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Användaren skriver igen: tysta en gammal statusrad så att "Sparat"
      // inte står kvar bredvid ett värde som ännu inte är sparat.
      reset(key as string);
    },
    [reset]
  );

  /**
   * Sparar ett enskilt fält. Värdet läses ur senaste state via setFormData,
   * så att en blur direkt efter ett tangenttryck aldrig sparar ett gammalt
   * värde.
   */
  const saveField = useCallback(
    (key: string) => {
      setFormData((current) => {
        const value = current[key as keyof ProfileFormState];

        const validate =
          key === 'full_name'
            ? () =>
                String(value).trim().length < 2
                  ? 'Namnet måste vara minst två tecken.'
                  : null
            : undefined;

        void save(key, () => updateProfile({ [key]: value } as any), validate);

        return current;
      });
    },
    [save, updateProfile]
  );

  const handleLogout = async () => {
    if (profile) {
      logUserActivity(profile.id, 'logout', 'Användaren loggade ut', {
        from_page: 'profile',
      }).catch((e) => console.error('Loggningsfel:', e));
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
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

    try {
      await fetch('/api/cv', { method: 'DELETE' });
    } catch (err) {
      console.warn('Kunde inte ta bort alla CV-data:', err);
    }

    try {
      await fetch('/api/letters', { method: 'DELETE' });
    } catch (err) {
      console.warn('Kunde inte ta bort alla brev:', err);
    }

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

  if (profileLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Laddar profil">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-96 animate-pulse rounded-xl border border-neutral-200 bg-white" />
        <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Din profil"
        description="Uppgifterna här används i dina brev, ditt CV och i Jobbcoachens svar. Allt sparas när du lämnar fältet."
      />

      {/* Invändningen kommer före ifyllandet, därför överst. */}
      <IntegritetsBlock />

      <PresentationSection
        email={profile?.email || ''}
        fullName={formData.full_name}
        phone={formData.phone}
        location={formData.location}
        linkedinUrl={formData.linkedin_url}
        profilePhotoUrl={formData.profile_photo_url}
        includePhoneInLetters={formData.include_phone_in_letters}
        includeLocationInLetters={formData.include_location_in_letters}
        phoneFromCv={prefilled.phone}
        locationFromCv={prefilled.location}
        photoFromGoogle={prefilled.photo}
        onFullNameChange={(v) => setField('full_name', v)}
        onPhoneChange={(v) => setField('phone', v)}
        onLocationChange={(v) => setField('location', v)}
        onLinkedInChange={(v) => setField('linkedin_url', v)}
        onPhotoChange={(url) => setField('profile_photo_url', url)}
        onPhotoRemove={() => setField('profile_photo_url', '')}
        onIncludePhoneChange={(v) => setField('include_phone_in_letters', v)}
        onIncludeLocationChange={(v) => setField('include_location_in_letters', v)}
        onSaveField={saveField}
        stateFor={stateFor}
        onError={(msg) => successWithMascot(msg, 'profile-error', 4000, false)}
        onSuccess={(msg) => successWithMascot(msg, 'profile-updated', 3500)}
      />

      <InriktningSection
        goalRole={formData.goal_role}
        industry={formData.industry}
        preferredTonality={formData.preferred_tonality}
        subscriptionTier={subscriptionTier}
        onGoalRoleChange={(v) => setField('goal_role', v)}
        onIndustryChange={(v) => setField('industry', v)}
        onTonalityChange={(v) => setField('preferred_tonality', v)}
        onSaveField={saveField}
        onPremiumGate={(feature) => setPremiumGate(feature)}
        stateFor={stateFor}
      />

      <BliUpptacktSection />

      <NotisInstallningar />

      <AccountSection
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      <PremiumGateModal
        feature={premiumGate}
        onClose={() => setPremiumGate(null)}
      />
    </div>
  );
}
