import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import Flikrad from '@/components/mobilapp/Flikrad';
import FlikInnehall from '@/components/mobilapp/FlikInnehall';
import NatVakt from '@/components/mobilapp/NatVakt';
// Notisfrågan efter första klara passet (docs/plan-app.md 2.7).
import NotisLage from '@/components/mobilapp/notiser/NotisLage';

/**
 * Appens tre flikar, Idag, Tester och Utveckling (konceptet
 * docs/design/app-koncept-2026-11-13.html). Flikraden står bara här; passen,
 * Nivåkollen och övningsproven under /app/tester är helskärm.
 *
 * Flikarna kräver konto, som webbens dashboard. Proxyn skickar redan en
 * utloggad till inloggningen; det här är bältet.
 */
export default async function FlikarLayout({ children }: { children: React.ReactNode }) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  // En anonym session (Nivåkollen före kontot) har inget konto än: Spara din nivå.
  if (user.is_anonymous) redirect('/register?steg=konto');
  return (
    <div className="tk">
      <NatVakt />
      <FlikInnehall>{children}</FlikInnehall>
      <Flikrad />
      <Suspense fallback={null}>
        <NotisLage userId={user.id} />
      </Suspense>
    </div>
  );
}
