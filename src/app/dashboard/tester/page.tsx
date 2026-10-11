/**
 * Hemvyn i Rekryteringstester (spec-rummen våg 2, konceptets 1a till 1p,
 * T1, X1 och W1 till W4).
 *
 * Serverrenderad med en rundtur: getTraningSummary läser motorns status,
 * testernas två frågor och delar Jobbsökets summering med layouten. Första
 * HTML innehåller väggen, kurvan och det lyfta kortet med riktiga tal.
 *
 * Saknas planen och valde hon tester eller intervju vid registreringen är
 * ingången (E1 till E3) första vyn. Annars står hemvyn i tomt läge (T1).
 *
 * När vyn ritas med en ny punkt markeras profilen efter svaret
 * (traning_sedd_at), så kurvan ritar sig en gång och står stilla nästa gång.
 *
 * Katalogen med alla tester bor på /dashboard/tester/alla.
 */
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { getTraningSummary, markeraTraningSedd } from '@/lib/traning/getTraningSummary';
import { byggHemvy } from '@/lib/traning/hemvy';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import Hemvy from '@/components/traning/Hemvy';
import { Betalvagg } from '@/components/traning/HemKlient';

export default async function TraningHem({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');

  const [sum, sp] = await Promise.all([getTraningSummary(user.id), searchParams]);

  const s = sum.status;
  if (s && !s.plan && s.niva == null && s.aktivitet.matningar === 0 && sum.valdeTester && sp.visa !== 'hem') {
    redirect(`${TRANING_RUTT.installningar}?forsta=1`);
  }

  const m = byggHemvy({ status: s, idag: sum.idag, flerTester: sum.flerTester, jobbsok: sum.jobbsok });
  if (m.nyPunkt) after(() => markeraTraningSedd(user.id));

  return (
    <Betalvagg scope={sum.paket.scope} track={sum.paket.track} planKey={sum.paket.planKey}>
      <Hemvy m={m} />
    </Betalvagg>
  );
}
