/**
 * Idag, appens start (konceptets V.hem). Proxyn skriver om appens /dashboard
 * hit. Samma läsning som webbens Hem i testerna v4 (hamtaTesterV4 och
 * underlaget, delat med cache()) i en rundtur på servern, så första HTML har
 * dagkortet med riktiga tal.
 *
 * Saknas planen och har de inget resultat än, och valde de tester eller
 * intervju vid registreringen, går de som på webben till ingången (Plan
 * inför provet, ?forsta=1): samma beslut, ingangForst.
 */
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { markeraTraningSedd } from '@/lib/traning/getTraningSummary';
import { hamtaTesterV4, hamtaUnderlagV4, ingangForst } from '@/lib/tester/v4/hamta.server';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { datumText } from '@/lib/traning/rubrik';
import { veckodagNamn } from '@/lib/traning/datum';
import IdagVy from '@/components/mobilapp/IdagVy';
import { initialer } from '@/components/mobilapp/Topprad';

export default async function Idag({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');

  const [underlag, data, sp] = await Promise.all([hamtaUnderlagV4(user.id), hamtaTesterV4(user.id), searchParams]);
  if (sp.visa !== 'hem' && ingangForst(underlag, data)) {
    redirect(`${TRANING_RUTT.installningar}?forsta=1`);
  }

  if (underlag.status?.nyPunkt) after(() => markeraTraningSedd(user.id));

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return (
    <IdagVy
      data={data}
      aktivaDagar={underlag.modell.aktivaDagar}
      dag={`${veckodagNamn(data.idag)} ${datumText(data.idag)}`}
      initial={initialer(meta?.full_name ?? meta?.name, user.email)}
    />
  );
}
