/**
 * Förhandsvisning av hemvyn för utvecklare (våg 2): ritar ett tillstånd ur
 * konceptet med fixturdata (src/lib/traning/forhandsvisning.ts), utan
 * databas. Finns bara i utveckling (NODE_ENV=development) eller när
 * TRANING_FORHANDSVISNING=1 är satt, vilket det aldrig är i produktion.
 *
 *   /dashboard/tester/forhandsvisning?tillstand=1b
 *
 * Tillstånden: T1, 1a till 1i, 1p, X1, L1 och datorns W1 till W4 (samma
 * data som 1b, 1a, 1f och 1d). Knapparna leder till de riktiga sidorna.
 */
import { notFound } from 'next/navigation';
import { fixtur, TILLSTAND, type Fixtur } from '@/lib/traning/forhandsvisning';
import { byggHemvy } from '@/lib/traning/hemvy';
import Hemvy from '@/components/traning/Hemvy';
import { Betalvagg } from '@/components/traning/HemKlient';
import Laddar from '../loading';

export const dynamic = 'force-dynamic';

function forhandsvisningTillaten(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.TRANING_FORHANDSVISNING === '1';
}

export default async function Forhandsvisning({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!forhandsvisningTillaten()) notFound();
  const sp = await searchParams;
  const t = (Array.isArray(sp.tillstand) ? sp.tillstand[0] : sp.tillstand) ?? '1b';
  if (!(TILLSTAND as readonly string[]).includes(t)) notFound();
  const inp = fixtur(t as Fixtur);
  if (inp.laddar) return <Laddar />;
  const m = byggHemvy(inp);
  return (
    <Betalvagg scope={null} track={null} planKey={null}>
      <Hemvy m={m} />
    </Betalvagg>
  );
}
