/**
 * Skapa CV är en server component.
 *
 * Förut var sidan 'use client'. Innan något av wizarden kunde ritas behövde
 * webbläsaren först hydrera, sedan vänta in useProfile, och under tiden visades
 * en helskärmssnurra. Parallellt körde wizarden en egen admin-koll som gjorde
 * getUser() över nätet följt av en fråga mot admin_users. Två seriella kedjor,
 * båda efter att JS laddat, och ingen av dem behövde ligga där.
 *
 * Nu läses sessionen och admin-flaggan här, i samma omgång som layouten redan
 * gör sitt arbete. Första HTML som når mobilen innehåller därför det riktiga
 * steget i stället för en snurra.
 *
 * Profilen hämtas inte om: den ligger redan i summaryn som useProfile läser.
 * Ingen affärslogik har flyttat hit. CV-gränsen och betalväggen på nedladdning
 * ligger kvar på servern bakom spara och generera, precis som förut.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import CVCreatorWizard from './components/CVCreatorWizard';

export default async function SkapaCVPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/skapa-cv');
  }

  // Admin-flaggan styr bara knappen "Fyll i testdata". Den låg som en egen
  // rundtur på klienten; här är den en fråga i samma omgång som allt annat.
  let isAdmin = false;
  try {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle();
    isAdmin = !!adminData;
  } catch (error) {
    // Går kollen fel ska flödet ändå gå att öppna. Knappen uteblir bara.
    console.error('Fel vid server-hämtning av adminstatus:', error);
  }

  return <CVCreatorWizard initialIsAdmin={isAdmin} />;
}
