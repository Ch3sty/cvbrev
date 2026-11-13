/**
 * Tester, appens katalog (konceptets V.tester). Proxyn skriver om appens
 * /dashboard/tester hit; undersidorna under /dashboard/tester/* går som förut
 * till webbens sidor i appens ram (tvillingarna under /app/tester).
 *
 * Läser samma status som webbens hemvy, så låsen och nivåerna följer motorn.
 * Webbens passflöden skickar tillbaka till /dashboard/tester?efter=<id> efter
 * ett pass; i appen är det Idag som visar resultatet av dagen.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { getTraningSummary } from '@/lib/traning/getTraningSummary';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import { byggKatalog } from '@/lib/mobilapp/vyer';
import KatalogVy from '@/components/mobilapp/KatalogVy';
import FelVy from '@/components/mobilapp/FelVy';
import { initialer } from '@/components/mobilapp/Topprad';

export default async function Katalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  if (sp.efter) redirect(APP_FLIK.idag);

  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const initial = initialer(meta?.full_name ?? meta?.name, user.email);

  const sum = await getTraningSummary(user.id);
  if (!sum.status) return <FelVy titel="Tester" initial={initial} />;
  return <KatalogVy katalog={byggKatalog(sum.status)} initial={initial} />;
}
