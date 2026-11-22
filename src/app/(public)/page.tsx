/**
 * Startsidan, publikt omgång 3 (skissen start). Sektionerna bor i
 * src/components/publikt/start/Startsidan.tsx, som sätter sidans färg med
 * <Sida farg="tran">.
 *
 * h1, title och description är oförändrade (SEO-spärren). Antalet konton
 * visas i hjältens talrad (ägarens beslut 9).
 */
import AuthRedirect from '@/components/landing/AuthRedirect';
import Startsidan from '@/components/publikt/start/Startsidan';
import { antalKonton } from '@/lib/publikt/antal';
import type { Metadata } from 'next';

/**
 * Bara canonical: title, description och delningskorten ärvs oförändrade från
 * rot-layouten (SEO-granskningen 2026-10-12, punkt 6).
 */
export const metadata: Metadata = {
  alternates: { canonical: 'https://www.jobbcoach.ai/' },
};

export const revalidate = 86400;

export default async function HomePage() {
  const konton = await antalKonton();
  return (
    <>
      <AuthRedirect />
      <Startsidan konton={konton} />
    </>
  );
}
