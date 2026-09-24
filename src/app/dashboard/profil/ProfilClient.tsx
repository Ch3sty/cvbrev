'use client';

/**
 * Profilsidans interaktiva del (docs/design/profil-registrering-2026-09-24.html,
 * Del A, och specens komponent-API).
 *
 * Fyra sektioner i den ordning användaren behöver dem: Överst i ditt CV
 * (foto först), Personliga brev (förvald ton först, sedan brevhuvudet),
 * Jobbsök och Konto. En rad "Hoppa till" under sidhuvudet gör varje sektion
 * ett tryck bort, och ankarna (#cv, #personliga-brev, #jobbsok, #konto)
 * används av länkar från resten av appen. Statusraden överst räknar namn
 * och ort, aldrig foto.
 *
 * Sparbeteendet är oförändrat: autospara per fält. Textfält på blur, växlar
 * och tonval direkt, fotot när uppladdningen svarat. Profilen läses ur den
 * summary som dashboard-layouten redan hämtade på servern, så fälten är
 * ifyllda i den HTML som når mobilen.
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
import { capture } from '@/lib/analytics/events';
import { menyHuvud } from '@/lib/onboarding/paket-rader';

import HoppaTill from './components/HoppaTill';
import SaknasRad from './components/SaknasRad';
import CvUppgifterSection from './components/CvUppgifterSection';
import PersonligaBrevSection from './components/PersonligaBrevSection';
import JobbsokSection from './components/JobbsokSection';
import KontoSection from './components/KontoSection';
import { type PremiumFeature } from './components/PremiumGateModal';
import { type TonalityValue } from './components/tonalities';
import { useFieldSave } from './components/useFieldSave';
import type { ProfilPageData } from './getProfilData';
import { KONTO_SEKTION, PROFIL, CV_SEKTION } from './profil-copy';
import {
  toJobPreferences,
  EMPTY_JOB_PREFERENCES,
  type JobPreferences,
} from '@/types/user.types';

/**
 * Luckan för Smart val syns aldrig i första vyn: den öppnas först när någon
 * trycker på kortet. Den laddas när den behövs.
 */
const PremiumGateModal = dynamic(() => import('./components/PremiumGateModal'), {
  ssr: false,
});

/** Vilken sektion ett fält hör till, för profile_field_saved. */
const SEKTION_FOR: Record<string, 'cv' | 'personliga_brev' | 'jobbsok' | 'konto'> = {
  full_name: 'cv',
  location: 'cv',
  phone: 'cv',
  linkedin_url: 'cv',
  profile_photo_url: 'cv',
  preferred_tonality: 'personliga_brev',
  include_phone_in_letters: 'personliga_brev',
  include_location_in_letters: 'personliga_brev',
  goal_role: 'jobbsok',
  industry: 'jobbsok',
  job_preferences: 'jobbsok',
};

const SEKTIONER = [
  { id: 'cv' as const, etikett: PROFIL.hopp.cv },
  { id: 'personliga-brev' as const, etikett: PROFIL.hopp['personliga-brev'] },
  { id: 'jobbsok' as const, etikett: PROFIL.hopp.jobbsok },
  { id: 'konto' as const, etikett: PROFIL.hopp.konto },
];

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
  const { summary } = useDashboardData();
  const initialProfile = (summary?.profile as Record<string, any> | null) ?? null;

  const { profile, updateProfile, subscriptionTier } = useProfile();

  const [formData, setFormData] = useState<ProfileFormState>(() => toForm(initialProfile));
  const [premiumGate, setPremiumGate] = useState<PremiumFeature | null>(null);
  const { stateFor, save, reset } = useFieldSave();

  const [prefilled, setPrefilled] = useState(() =>
    toPrefilled(initialProfile, toForm(initialProfile))
  );
  const prefillChecked = useRef(initialProfile !== null);

  // Kom profilen först senare fyller vi fälten då i stället.
  useEffect(() => {
    if (!profile) return;
    const next = toForm(profile as unknown as Record<string, any>);
    setFormData(next);
    if (prefillChecked.current) return;
    prefillChecked.current = true;
    setPrefilled(toPrefilled(profile as unknown as Record<string, any>, next));
  }, [profile]);

  // profile_viewed en gång per sidladdning: vad som saknas i CV:t, om fotot
  // finns och vilket ankare sidan öppnades på. Aldrig värdena.
  const visad = useRef(false);
  useEffect(() => {
    if (visad.current) return;
    visad.current = true;
    const missing: ('namn' | 'ort')[] = [];
    if (formData.full_name.trim().length < 2) missing.push('namn');
    if (!formData.location.trim()) missing.push('ort');
    capture('profile_viewed', {
      missing,
      har_foto: Boolean(formData.profile_photo_url),
      anchor: window.location.hash.replace('#', ''),
    });
  }, [formData]);

  const setField = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Användaren skriver igen: tysta en gammal statusrad.
      reset(key as string);
    },
    [reset]
  );

  /**
   * Sparar ett enskilt fält. Värdet läses ur senaste state via setFormData,
   * så att en blur direkt efter ett tangenttryck aldrig sparar ett gammalt
   * värde. Händelsen skjuts först när sparningen lyckats.
   */
  const saveField = useCallback(
    (key: string) => {
      setFormData((current) => {
        const value = current[key as keyof ProfileFormState];

        const validate =
          key === 'full_name'
            ? () => (String(value).trim().length < 2 ? CV_SEKTION.namnFel : null)
            : undefined;

        void save(
          key,
          async () => {
            const ok = await updateProfile({ [key]: value } as any);
            if (ok) {
              capture('profile_field_saved', { field: key, section: SEKTION_FOR[key] ?? 'cv' });
              if (key === 'preferred_tonality') capture('letter_tone_default_set', { tone: String(value) });
            }
            return ok;
          },
          validate
        );

        if (key === 'job_preferences') {
          const p = current.job_preferences;
          capture('match_preferences_saved', {
            source: 'profil',
            locations: p.locations.length,
            remote: p.remote,
            extent: p.extent,
            // Bara att fältet är ifyllt. Beloppet lämnar aldrig vår sida.
            has_min_salary: p.min_salary !== null,
          });
        }

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
      // Högst tre sekunder: loggningen får inte hålla kvar raderingen om
      // auth-låset hålls av en annan flik.
      await Promise.race([
        logUserActivity(profile.id, 'registered', 'Användaren raderade sitt konto', {
          email: profile.email,
          subscription_tier: subscriptionTier,
          timestamp: new Date().toISOString(),
        }).catch(() => {}),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
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

    const { error: deleteError } = await supabase.auth.admin.deleteUser(profile?.id || '');

    if (deleteError) {
      if (deleteError.message.includes('permissions')) {
        await supabase.auth.signOut();
        const { error: clientDeleteError } = await supabase.rpc('delete_user_account');
        if (clientDeleteError) {
          throw new Error(`Kontoborttagning misslyckades: ${clientDeleteError.message}`);
        }
      } else {
        throw deleteError;
      }
    }

    successWithMascot('Ditt konto är raderat. Tack för att du använde Jobbcoach.ai.', 'account-deleted', 4000, false);

    setTimeout(() => router.push('/'), 2000);
  };

  const email =
    (profile?.email as string | undefined) || (initialProfile?.email as string | undefined) || '';

  const harPaket = subscriptionTier === 'premium';
  const huvud = summary?.paket ? menyHuvud(summary.paket) : null;
  const prenumerationRad =
    huvud && summary?.paket?.scope ? `${huvud.rubrik} · ${huvud.under}` : KONTO_SEKTION.gratis;

  return (
    <div className="max-w-[768px] space-y-4 lg:space-y-6">
      <PageHeader eyebrow={PROFIL.eyebrow} title={PROFIL.rubrik} description={PROFIL.under} />

      <div className="space-y-4">
        <HoppaTill sektioner={SEKTIONER} />
        <SaknasRad namn={formData.full_name.trim().length >= 2} ort={Boolean(formData.location.trim())} />
      </div>

      <CvUppgifterSection
        email={email}
        fullName={formData.full_name}
        phone={formData.phone}
        location={formData.location}
        linkedinUrl={formData.linkedin_url}
        profilePhotoUrl={formData.profile_photo_url}
        phoneFromCv={prefilled.phone}
        locationFromCv={prefilled.location}
        photoFromGoogle={prefilled.photo}
        onFullNameChange={(v) => setField('full_name', v)}
        onPhoneChange={(v) => setField('phone', v)}
        onLocationChange={(v) => setField('location', v)}
        onLinkedInChange={(v) => setField('linkedin_url', v)}
        onPhotoChange={(url) => {
          setField('profile_photo_url', url);
          setPrefilled((p) => ({ ...p, photo: false }));
        }}
        onPhotoRemove={() => setField('profile_photo_url', '')}
        onSaveField={saveField}
        stateFor={stateFor}
      />

      <PersonligaBrevSection
        preferredTonality={formData.preferred_tonality}
        harPaket={harPaket}
        fullName={formData.full_name}
        phone={formData.phone}
        location={formData.location}
        hasPhoto={Boolean(formData.profile_photo_url)}
        includePhoneInLetters={formData.include_phone_in_letters}
        includeLocationInLetters={formData.include_location_in_letters}
        onTonalityChange={(v) => setField('preferred_tonality', v)}
        onIncludePhoneChange={(v) => setField('include_phone_in_letters', v)}
        onIncludeLocationChange={(v) => setField('include_location_in_letters', v)}
        onSaveField={saveField}
        onSmartValSparrad={() => setPremiumGate('smart-tone')}
        stateFor={stateFor}
      />

      <JobbsokSection
        goalRole={formData.goal_role}
        industry={formData.industry}
        jobPreferences={formData.job_preferences}
        initialVisible={pageData.candidateVisible}
        onGoalRoleChange={(v) => setField('goal_role', v)}
        onIndustryChange={(v) => setField('industry', v)}
        onJobPreferencesChange={(v) => setField('job_preferences', v)}
        onSaveField={saveField}
        stateFor={stateFor}
      />

      <KontoSection
        prenumerationRad={prenumerationRad}
        harPaket={harPaket}
        initialDigestOptOut={initialProfile?.weekly_digest_opt_out === true}
        initialQuotaOptOut={initialProfile?.quota_emails_opt_out === true}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {premiumGate && <PremiumGateModal feature={premiumGate} onClose={() => setPremiumGate(null)} />}
    </div>
  );
}
