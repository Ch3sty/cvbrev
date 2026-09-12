/**
 * Mina brev är en server component.
 *
 * Förut var hela sidan 'use client'. Innan ett enda brevkort kunde målas
 * behövde webbläsaren hydrera, montera useLetters, fetcha /api/letters?saved=true
 * och där inne körde routen auth.getUser(), brevfrågan och profilfrågan i tur
 * och ordning. Ovanpå det låg en effekt som körde refreshLetters så fort
 * profile landade, alltså ytterligare en identisk hämtning av samma lista.
 *
 * Nu läses sessionen och brevlistan här på servern, i samma parallella omgång
 * som prenumerationsgraden. Första HTML innehåller hela listan.
 *
 * Affärslogiken är oförändrad: filtret är fortfarande is_saved = true, och
 * isLocked räknas med exakt samma getActiveLetterIds och
 * FREE_ACTIVE_LETTER_LIMIT som GET /api/letters använder. maxSavedLetters och
 * hasReachedLetterLimit läses fortfarande ur useProfile på klienten, precis
 * som förut.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import {
  getActiveLetterIds,
  FREE_ACTIVE_LETTER_LIMIT,
} from '@/lib/letters/letter-quota';
import type { Letter } from '@/store/letter-store';
import MinaBrevClient from './MinaBrevClient';

export default async function MinaBrevPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let initialLetters: Letter[] = [];
  // Bara för att statusraden ska säga rätt sak direkt. Gränserna själva bor
  // kvar i useProfile och på servern bakom generering och sparande.
  let initialIsPremium = false;

  try {
    // Två parallella frågor i stället för tre seriella steg bakom ett
    // HTTP-anrop. Samma frågor som GET /api/letters körde.
    const [lettersRes, profileRes] = await Promise.all([
      supabase
        .from('letters')
        .select('*')
        .eq('user_id', user.id)
        // Oförändrat filter: listan visar bara sparade brev.
        .eq('is_saved', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    if (lettersRes.error) {
      console.error('Fel vid server-hämtning av brev:', lettersRes.error);
    }

    const letters = (lettersRes.data ?? []) as Letter[];
    const profile = profileRes.data as { subscription_tier?: string | null } | null;

    initialIsPremium = profile?.subscription_tier === 'premium';

    if (initialIsPremium) {
      initialLetters = letters.map((letter) => ({ ...letter, isLocked: false }));
    } else {
      // Identisk regel som routen: bland de sparade breven är de N senast
      // uppdaterade aktiva, resten låsta.
      const savedLetters = letters.filter((l) => l.is_saved === true);
      const activeIds = getActiveLetterIds(savedLetters, FREE_ACTIVE_LETTER_LIMIT);
      initialLetters = letters.map((letter) => ({
        ...letter,
        isLocked: letter.is_saved === true && !activeIds.has(letter.id),
      }));
    }
  } catch (error) {
    // Går hämtningen fel ska sidan ändå gå att öppna. Klienten hämtar om.
    console.error('Fel vid server-hämtning av brevlistan:', error);
  }

  return (
    <MinaBrevClient
      initialLetters={initialLetters}
      initialIsPremium={initialIsPremium}
    />
  );
}
