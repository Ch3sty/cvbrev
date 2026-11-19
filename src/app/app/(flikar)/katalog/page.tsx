/**
 * Tester, appens katalog (konceptets V.tester). Proxyn skriver om appens
 * /dashboard/tester och /dashboard/tester/alla hit, så appen har en enda
 * Tester-vy; undersidorna under /dashboard/tester/* går som förut till
 * webbens sidor i appens ram (tvillingarna under /app/tester).
 *
 * Läser samma data som webbens Tester v4 (hamtaTesterV4), så låsen, kvoten
 * och nivåerna är webbens. ?typ=<id> öppnar typens ark direkt. Webbens
 * träningsflöden skickar tillbaka till /dashboard/tester?efter=<id>; i appen
 * är det Idag som visar resultatet av dagen.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { hamtaTesterV4 } from '@/lib/tester/v4/hamta.server';
import { arTestTypId } from '@/lib/tester/v4/typer';
import { APP_FLIK } from '@/lib/mobilapp/appvag';
import { byggKatalogV4 } from '@/lib/mobilapp/vyer';
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

  let katalog;
  try {
    katalog = byggKatalogV4(await hamtaTesterV4(user.id));
  } catch (e) {
    console.error('[app/katalog] hamtaTesterV4', e);
    return <FelVy titel="Tester" initial={initial} />;
  }
  const typ = Array.isArray(sp.typ) ? sp.typ[0] : sp.typ;
  return <KatalogVy katalog={katalog} startTyp={arTestTypId(typ) ? typ : null} initial={initial} />;
}
