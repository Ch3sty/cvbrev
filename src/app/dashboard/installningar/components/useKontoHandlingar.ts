'use client';

/**
 * Logga ut och Radera mitt konto, flyttade oförändrade från ProfilClient
 * när kortet Konto flyttade till Inställningar (skiss-installningar-2026-10-12).
 * Allt raderas på servern (api/konto/radera), som också avslutar Stripe.
 *
 * Raderingen skickar den frivilliga anledningen i kroppen
 * (beslut-mejl-och-radering 2c punkt 6). Ingen aktivitetsrad skrivs längre
 * före raderingen: den försvann ändå med kontot och höll kvar raderingen
 * upp till tre sekunder.
 */

import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { logUserActivity } from '@/lib/activity-logger';
import { vidUtloggning } from '@/lib/lagring/kontoLagring';
import type { Anledning } from '@/lib/konto/avslut';
import { RADERA_TEXT } from '@/lib/konto/radera-copy';

const STRIPE_LEVANDE = new Set(['active', 'trialing', 'past_due']);

/** Prenumerationen som raderingen avslutar (webben) eller inte (Google Play). */
export function prenumerationsLage(
  p: { subscription_status?: string | null; premium_source?: string | null; premium_until?: string | null } | null | undefined,
  nu: Date = new Date()
): { harStripePrenumeration: boolean; harPlayPrenumeration: boolean } {
  const harStripePrenumeration = STRIPE_LEVANDE.has(String(p?.subscription_status ?? ''));
  const until = p?.premium_until ? new Date(p.premium_until) : null;
  const harPlayPrenumeration = p?.premium_source === 'play' && !!until && until.getTime() > nu.getTime();
  return { harStripePrenumeration, harPlayPrenumeration };
}

export function useKontoHandlingar() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { successWithMascot } = useNotification();
  const { profile } = useProfile();
  const { harStripePrenumeration, harPlayPrenumeration } = prenumerationsLage(
    profile as { subscription_status?: string | null; premium_source?: string | null; premium_until?: string | null } | null
  );

  const handleLogout = async () => {
    if (profile) {
      logUserActivity(profile.id, 'logout', 'Användaren loggade ut', {
        from_page: 'installningar',
      }).catch((e) => console.error('Loggningsfel:', e));
    }
    await supabase.auth.signOut();
    vidUtloggning();
    router.push('/login');
  };

  const handleDeleteAccount = async (anledning: Anledning | null) => {
    // Läses före raderingen: efteråt finns profilen inte.
    const avslutadPrenumeration = harStripePrenumeration;

    // Raderingen görs på servern (api/konto/radera): webbläsarens nyckel får
    // inte ta bort användare, och den gamla reserven delete_user_account har
    // aldrig funnits. Servern avslutar också en levande Stripe-prenumeration,
    // tar bort filerna i lagringen och de lösa raderna, och databasen kaskaderar
    // resten. Förr anropades /api/cv och /api/letters med DELETE först: brevens
    // rutt saknar DELETE (405), och CV:na försvann även när raderingen sedan
    // avbröts (2026-11-15).
    const svar = await fetch('/api/konto/radera', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anledning }),
    });
    if (!svar.ok) {
      const kropp = (await svar.json().catch(() => null)) as { error?: string } | null;
      throw new Error(
        kropp?.error === 'prenumeration_kvar'
          ? 'Prenumerationen kunde inte avslutas, så kontot är kvar. Försök igen eller kontakta oss.'
          : 'Kontot kunde inte raderas. Försök igen eller kontakta oss.'
      );
    }
    // Användaren finns inte längre: rensa bara den lokala sessionen (en utloggning mot servern svarar 403).
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    vidUtloggning();

    successWithMascot(avslutadPrenumeration ? RADERA_TEXT.R9b : RADERA_TEXT.R9a, 'account-deleted', 4000, false);

    // Hel omladdning: sessionen är borta, och klientens router skulle annars
    // ligga kvar på den skyddade sidan.
    setTimeout(() => window.location.assign('/'), 2000);
  };

  return { handleLogout, handleDeleteAccount, harStripePrenumeration, harPlayPrenumeration };
}
