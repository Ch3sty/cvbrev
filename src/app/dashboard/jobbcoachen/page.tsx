/**
 * Jobbcoachen är en server component.
 *
 * Chatten är klientens, men välkomstvyns dokumentkort hänger på hur många CV
 * och brev användaren har. De räknades i en effekt som först gjorde
 * auth.getUser() över nätet och sedan två count-frågor i tur och ordning.
 * Sedan Tråden flyttade välkomstvyn upp från pt-[8%] är kortet vyns
 * LCP-element, så hela den kedjan hamnade på den kritiska vägen.
 *
 * Nu läses sessionen här och de två räknarna körs parallellt, i samma omgång
 * som sidan renderas. Frågorna är identiska med effektens, filtret på
 * user_id och is_saved ligger kvar.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import JobbcoachenClient from './JobbcoachenClient';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

export default async function JobbcoachenPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const user = await hamtaVerifieradAnvandare();

  if (!user) redirect('/login');

  let cvCount = 0;
  let letterCount = 0;

  try {
    const [cvRes, letterRes] = await Promise.all([
      supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_saved', true),
    ]);

    cvCount = cvRes.count ?? 0;
    letterCount = letterRes.count ?? 0;
  } catch (error) {
    // Räknarna är text i ett kort, inte funktion. Går de fel öppnas chatten
    // ändå, med formuleringen för noll dokument.
    console.error('Fel vid server-räkning av dokument:', error);
  }

  return <JobbcoachenClient initialCvCount={cvCount} initialLetterCount={letterCount} />;
}
