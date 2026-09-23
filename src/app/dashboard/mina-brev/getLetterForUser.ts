/**
 * Serverhämtning av ett enskilt brev.
 *
 * Brevets egen sida och redigeringssidan låg båda på fjorton rundturer före
 * första innehåll: skalet, ett GET /api/letters (brevlistan, som ingen av
 * sidorna läser) och ett GET /api/letters/[id], där routen dessutom körde
 * auth.getUser() över nätet innan sin fråga. Nu läses sessionen och brevet
 * här, i samma omgång som sidan renderas, precis som listan gör sedan
 * omgång fyra.
 *
 * Samma fråga som GET /api/letters/[id]: filtret på user_id ligger kvar, så
 * behörighetsregeln är oförändrad.
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import type { Letter } from '@/store/letter-store';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export async function getLetterForUser(id: string): Promise<{
  user: { id: string } | null;
  letter: Letter | null;
}> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) return { user: null, letter: null };

  try {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      // Går det fel ska sidan ändå gå att öppna; klienten hämtar om.
      console.error('Fel vid server-hämtning av brev:', error);
      return { user, letter: null };
    }

    return { user, letter: (data as Letter | null) ?? null };
  } catch (error) {
    console.error('Fel vid server-hämtning av brev:', error);
    return { user, letter: null };
  }
}
