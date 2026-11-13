import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';

/**
 * Testerna kräver konto, som i webbens dashboard-layout. Proxyn skickar
 * redan en utloggad till inloggningen; det här är bältet.
 */
export default async function AppTesterLayout({ children }: { children: React.ReactNode }) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  return children;
}
