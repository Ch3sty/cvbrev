/**
 * Idag, appens start (konceptets V.hem). Proxyn skriver om appens /dashboard
 * hit. Samma läsning som webbens hemvy (getTraningSummary och byggHemvy) i en
 * rundtur på servern, så första HTML har dagkortet med riktiga tal.
 *
 * Saknas planen och valde de tester vid registreringen går de, som på
 * webben, till ingången (Test och datum). Nivåkollen före kontot och
 * appens egen onboarding kommer i ett senare steg (docs/plan-app.md).
 */
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { getTraningSummary, markeraTraningSedd } from '@/lib/traning/getTraningSummary';
import { byggHemvy } from '@/lib/traning/hemvy';
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

  const [sum, sp] = await Promise.all([getTraningSummary(user.id), searchParams]);
  const s = sum.status;
  if (s && !s.plan && s.niva == null && s.aktivitet.matningar === 0 && sum.valdeTester && sp.visa !== 'hem') {
    redirect(`${TRANING_RUTT.installningar}?forsta=1`);
  }

  const m = byggHemvy({ status: s, idag: sum.idag, flerTester: sum.flerTester, jobbsok: sum.jobbsok });
  if (m.nyPunkt) after(() => markeraTraningSedd(user.id));

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return (
    <IdagVy
      m={m}
      s={s}
      dag={`${veckodagNamn(sum.idag)} ${datumText(sum.idag)}`}
      initial={initialer(meta?.full_name ?? meta?.name, user.email)}
    />
  );
}
