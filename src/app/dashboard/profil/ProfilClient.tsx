'use client';

/**
 * Profilsidans interaktiva del.
 *
 * Fyra sektioner, rangordnade efter hur mycket de påverkar användarens
 * resultat: så presenteras du, så hjälper vi dig, bli upptäckt, konto och
 * notiser. Sidmallen enligt docs/plan-inloggat-omdesign.md avsnitt 3:
 * PageHeader, sedan vita kort med border.
 *
 * Sparbeteendet är oförändrat: autospara per fält. Varje fält sparar sig
 * självt på blur, toggles och foto direkt vid klick, och statusen visas per
 * fält.
 *
 * Det som ändrats är läsvägen. Profilen kommer ur den summary som
 * dashboard-layouten redan hämtade på servern, alltså utan ett enda eget
 * anrop, och den läses synkront vid första render i stället för genom en
 * effekt. Helsidesskelettet är därför borta: sidan öppnar med användarens
 * riktiga värden i fälten. Synligheten för Bli upptäckt och de två
 * mailinställningarna kommer som props från page.tsx.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
import PageHeader from '@/components/shell/PageHeader';

import IntegritetsBlock from './components/IntegritetsBlock';
import PresentationSection from './components/PresentationSection';
import { type PremiumFeature } from './components/PremiumGateModal';
import { type TonalityValue } from './components/tonalities';
import { useFieldSave } from './components/useFieldSave';
import type { ProfilPageData } from './getProfilData';
import {
  toJobPreferences,
  EMPTY_JOB_PREFERENCES,
  type JobPreferences,
} from '@/types/user.types';

/**
 * Bara PageHeader, integritetsblocket och "Så presenteras du" ryms i första
 * vyn på en telefon. Sektionerna under den laddas därför separat: de bär
 * tillsammans tonalitetsikonerna, kontoflödets bekräftelsedialog och två
 * mailväxlar, alltså en bra bit kod som ingen ser förrän hon scrollat.
 *
 * Varje reservation nedan är höjden på det färdiga kortet, så raderna under
 * står stilla när innehållet landar. CLS ska vara noll.
 */
const InriktningSection = dynamic(() => import('./components/InriktningSection'), {
  loading: () => <div className="min-h-[420px]" aria-hidden="true" />,
});
const BliUpptacktSection = dynamic(() => import('./components/BliUpptacktSection'), {
  loading: () => <div className="min-h-[240px]" aria-hidden="true" />,
});
const NotisInstallningar = dynamic(() => import('./components/NotisInstallningar'), {
  loading: () => <div className="min-h-[380px]" aria-hidden="true" />,
});
const AccountSection = dynamic(() => import('./components/AccountSection'), {
  loading: () => <div className="min-h-[320px]" aria-hidden="true" />,
});

/**
 * Premiumluckan syns aldrig i första vyn: den öppnas först när någon klickar
 * ett låst fält. Modalen drar in framer-motion och tre ikonuppsättningar, så
 * den laddas när den behövs i stället för i sidans första paket.
 */
const PremiumGateModal = dynamic(() => import('./components/PremiumGateModal'), {
  ssr: false,
});

interface ProfileFormState {
  full_name: string;
  linkedin_url: string;
  profile_photo_url: string;
  preferred_tonality: TonalityValue;
  phone: string;
  location: string;
  goal_role: string;
  industry: string;
  job_preferences: JobPreferences;
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
  job_preferences: EMPTY_JOB_PREFERENCES,
  include_phone_in_letters: true,
  include_location_in_letters: true,
};

/** Profilraden till formulärets fält. Samma avbildning som tidigare. */
function toForm(profile: Record<string, any> | null): ProfileFormState {
  if (!profile) return EMPTY_FORM;
  return {
    full_name: profile.full_name || '',
    linkedin_url: profile.linkedin_url || '',
    profile_photo_url: profile.profile_photo_url || '',
    preferred_tonality: (profile.preferred_tonality || 'balanced') as TonalityValue,
    phone: profile.phone || '',
    location: profile.location || '',
    goal_role: profile.goal_role || '',
    industry: profile.industry || '',
    job_preferences: toJobPreferences(profile.job_preferences),
    include_phone_in_letters: profile.include_phone_in_letters ?? true,
    include_location_in_letters: profile.include_location_in_letters ?? true,
  };
}

/**
 * Vad som kom från parsat CV respektive Google. Telefon och ort skrivs
 * tillbaka från CV-parsern, fotot kommer från Google-avataren vid inloggning.
 * Har användaren aldrig sparat något själv är värdet alltså hämtat, inte
 * inskrivet. Räknas en gång, ur samma rad som formuläret.
 */
function toPrefilled(profile: Record<string, any> | null, form: ProfileFormState) {
  if (!profile) return { phone: false, location: false, photo: false };
  const cameFromCv = Boolean(profile.contact_parsed_at);
  const googleAvatar = profile.avatar_source === 'google';
  return {
    phone: cameFromCv && Boolean(form.phone),
    location: cameFromCv && Boolean(form.location),
    photo: googleAvatar && Boolean(form.profile_photo_url),
  };
}

export default function ProfilClient({ pageData }: { pageData: ProfilPageData }) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { successWithMascot } = useNotification();

  // Summaryn är server-hämtad av layouten och finns redan vid första render.
  // Vi läser profilraden direkt ur den i stället för att vänta på useProfile
  // effektkedja, så fälten är ifyllda i den HTML som når mobilen.
  const { summary } = useDashboardData();
  const initialProfile = (summary?.profile as Record<string, any> | null) ?? null;

  const { profile, updateProfile, subscriptionTier } = useProfile();

  const [formData, setFormData] = useState<ProfileFormState>(() =>
    toForm(initialProfile)
  );
  const [premiumGate, setPremiumGate] = useState<PremiumFeature | null>(null);
  const { stateFor, save, reset } = useFieldSave();

  const [prefilled, setPrefilled] = useState(() =>
    toPrefilled(initialProfile, toForm(initialProfile))
  );
  const prefillChecked = useRef(initialProfile !== null);

  // Kom profilen först senare (kontobyte eller en revalidering som svarade
  // efter första render) fyller vi fälten då i stället.
  useEffect(() => {
    if (!profile) return;

    const next = toForm(profile as unknown as Record<string, any>);
    setFormData(next);

    if (prefillChecked.current) return;
    prefillChecked.current = true;
    setPrefilled(toPrefilled(profile as unknown as Record<string, any>, next));
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

  const email =
    (profile?.email as string | undefined) ||
    (initialProfile?.email as string | undefined) ||
    '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Din profil"
        description="Uppgifterna här används i dina brev, ditt CV och i Jobbcoachens svar. Allt sparas när du lämnar fältet."
      />

      {/* Invändningen kommer före ifyllandet, därför överst. */}
      <IntegritetsBlock />

      <PresentationSection
        email={email}
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
        jobPreferences={formData.job_preferences}
        subscriptionTier={subscriptionTier}
        onGoalRoleChange={(v) => setField('goal_role', v)}
        onIndustryChange={(v) => setField('industry', v)}
        onTonalityChange={(v) => setField('preferred_tonality', v)}
        onJobPreferencesChange={(v) => setField('job_preferences', v)}
        onSaveField={saveField}
        onPremiumGate={(feature) => setPremiumGate(feature)}
        stateFor={stateFor}
      />

      <BliUpptacktSection initialVisible={pageData.candidateVisible} />

      <NotisInstallningar
        initialDigestOptOut={initialProfile?.weekly_digest_opt_out === true}
        initialQuotaOptOut={initialProfile?.quota_emails_opt_out === true}
      />

      <AccountSection
        subscriptionTier={subscriptionTier}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {premiumGate && (
        <PremiumGateModal
          feature={premiumGate}
          onClose={() => setPremiumGate(null)}
        />
      )}
    </div>
  );
}
