/**
 * Utveckling (konceptets V.utveckling) på v4:s modell. Proxyn skriver om
 * appens /dashboard/tester/kurvan hit, så webbens länkar till Din utveckling
 * landar i fliken. ?typ= väljer typen i kurvan, som på webben.
 *
 * hamtaUtvecklingV4 och hamtaUnderlagV4 delar en läsning (react cache):
 * underlaget ger motorns märken och alla punkter för märkena även när
 * historiken är låst. Allt ritas på servern, inget hoppar.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { hamtaUnderlagV4, hamtaUtvecklingV4 } from '@/lib/tester/v4/hamta.server';
import { TEST_TYP_ORDNING } from '@/lib/tester/v4/typer';
import { typSynlig } from '@/lib/mobilapp/vyer';
import { markenV4, tomStart, typRader, valdTyp } from '@/lib/mobilapp/utveckling';
import UtvecklingVy from '@/components/mobilapp/UtvecklingVy';
import { initialer } from '@/components/mobilapp/Topprad';

export default async function Utveckling({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sp, user] = await Promise.all([searchParams, hamtaVerifieradAnvandare()]);
  if (!user) redirect('/login');
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const initial = initialer(meta?.full_name ?? meta?.name, user.email);

  const [data, underlag] = await Promise.all([hamtaUtvecklingV4(user.id), hamtaUnderlagV4(user.id)]);
  const status = underlag.status;
  const typ = valdTyp(data, sp.typ, typSynlig);
  const marken = markenV4({
    milstolpar: status?.milstolpar ?? [],
    allaPunkter: TEST_TYP_ORDNING.flatMap((t) => underlag.modell.typer[t].punkter),
    plan: data.plan,
    idag: data.idag,
    nivakollGjord: data.gratis.nivakollGjord,
  });

  return (
    <UtvecklingVy
      data={data}
      typ={typ}
      rader={typRader(data, typ, typSynlig)}
      tom={tomStart(data, typSynlig)}
      marken={marken}
      sikte={typ === 'matris' ? (status?.plan?.sikte ?? null) : null}
      rita={typ === 'matris' && !!status?.nyPunkt}
      initial={initial}
    />
  );
}
