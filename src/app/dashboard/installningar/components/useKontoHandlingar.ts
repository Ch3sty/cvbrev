'use client';

/**
 * Logga ut och Radera mitt konto, flyttade oförändrade från ProfilClient
 * när kortet Konto flyttade till Inställningar (skiss-installningar-2026-10-12).
 * Samma loggning, samma ordning: CV och brev först, sedan kontot, med
 * delete_user_account som reserv när admin-anropet saknar behörighet.
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

  return { handleLogout, handleDeleteAccount, harPaket: subscriptionTier === 'premium' };
}
