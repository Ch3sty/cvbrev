/**
 * Hela kurvan (konceptets F1), en undersida i Rekryteringstester.
 * Serverrenderad ur samma summering som hemvyn.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { getTraningSummary } from '@/lib/traning/getTraningSummary';
import Helkurva from '@/components/traning/Helkurva';
import { Betalvagg } from '@/components/traning/HemKlient';

export default async function KurvanSida() {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const sum = await getTraningSummary(user.id);
  return (
    <Betalvagg scope={sum.paket.scope} track={sum.paket.track} planKey={sum.paket.planKey}>
      <Helkurva s={sum.status} fler={sum.flerTester} />
    </Betalvagg>
  );
}
