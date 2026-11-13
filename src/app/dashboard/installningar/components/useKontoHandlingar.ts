'use client';

/**
 * Logga ut och Radera mitt konto, flyttade oförändrade från ProfilClient
 * när kortet Konto flyttade till Inställningar (skiss-installningar-2026-10-12).
 * Samma loggning, samma ordning: CV och brev först, sedan kontot, med
 * radering på servern (api/konto/radera), som också avslutar Stripe.
 */

import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';

export function useKontoHandlingar() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { successWithMascot } = useNotification();
  const { profile, subscriptionTier } = useProfile();

  const handleLogout = async () => {
    if (profile) {
      logUserActivity(profile.id, 'logout', 'Användaren loggade ut', {
        from_page: 'installningar',
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

    // Raderingen görs på servern (api/konto/radera): webbläsarens nyckel får
    // inte ta bort användare, och den gamla reserven delete_user_account har
    // aldrig funnits. Servern avslutar också en levande Stripe-prenumeration.
    const svar = await fetch('/api/konto/radera', { method: 'DELETE' });
    if (!svar.ok) {
      const kropp = (await svar.json().catch(() => null)) as { error?: string } | null;
      throw new Error(
        kropp?.error === 'prenumeration_kvar'
          ? 'Prenumerationen kunde inte avslutas, så kontot är kvar. Försök igen eller kontakta oss.'
          : 'Kontot kunde inte raderas. Försök igen eller kontakta oss.'
      );
    }
    await supabase.auth.signOut().catch(() => {});

    successWithMascot('Ditt konto är raderat. Tack för att du använde Jobbcoach.ai.', 'account-deleted', 4000, false);

    // Hel omladdning: sessionen är borta, och klientens router skulle annars
    // ligga kvar på den skyddade sidan.
    setTimeout(() => window.location.assign('/'), 2000);
  };

  return { handleLogout, handleDeleteAccount, harPaket: subscriptionTier === 'premium' };
}
