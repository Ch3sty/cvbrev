/**
 * Utveckling (konceptets V.utveckling). Proxyn skriver om appens
 * /dashboard/tester/kurvan hit, så webbens länkar till kurvan landar i fliken.
 * Motorns status (samma som hemvyn) och motordatan för tempot läses
 * parallellt; faller tempot står resten kvar.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { getTraningSummary } from '@/lib/traning/getTraningSummary';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { hamtaMotordata } from '@/components/traning/utveckling/data.server';
import { byggKatalog } from '@/lib/mobilapp/vyer';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import UtvecklingVy from '@/components/mobilapp/UtvecklingVy';
import FelVy from '@/components/mobilapp/FelVy';
import { initialer } from '@/components/mobilapp/Topprad';

export default async function Utveckling() {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const initial = initialer(meta?.full_name ?? meta?.name, user.email);

  const [sum, motor] = await Promise.all([
    getTraningSummary(user.id),
    hamtaMotordata(testSkrivKlient(), user.id).catch((e) => {
      console.error('[app] utvecklingens motordata', e);
      return null;
    }),
  ]);
  if (!sum.status) return <FelVy titel="Utveckling" initial={initial} />;
  // Tomt läge: knappen går till Nivåkollen för första deltestet i planen.
  const forsta = byggKatalog(sum.status).ingar[0]?.rader[0]?.href ?? TRANING_RUTT.matning;
  return <UtvecklingVy s={sum.status} tempo={motor?.tempo ?? null} initial={initial} nivakollHref={forsta} />;
}
