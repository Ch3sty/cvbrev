/**
 * Appens första start (docs/plan-app.md, avsnitt 3 punkt 1 och 2). Proxyn
 * skriver om appens /register hit, och inloggningen skickar hit vid första
 * start. Onboardingen, Nivåkollen före kontot, nivåögonblicket och Spara din
 * nivå är en klientvy (Onboarding.tsx); servern läser bara steget ur
 * adressen och om sessionen är anonym eller ett konto.
 *
 * Ett konto utan steg i adressen har inget här att göra och går till Idag.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { arSteg } from '@/lib/mobilapp/onboarding';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import Onboarding from '@/components/mobilapp/onboarding/Onboarding';

export default async function Valkommen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const s = Array.isArray(sp.steg) ? sp.steg[0] : sp.steg;
  const user = await hamtaVerifieradAnvandare();
  const inloggad = !user ? 'ingen' : user.is_anonymous ? 'anonym' : 'konto';
  if (inloggad === 'konto' && !arSteg(s)) redirect(APP_FLIK.idag);
  return <Onboarding startSteg={arSteg(s) ? s : 'start'} inloggad={inloggad} />;
}
