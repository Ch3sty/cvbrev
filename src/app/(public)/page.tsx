/**
 * Startsidan, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.1). Sektionerna bor i src/components/publikt/start/Startsidan.tsx.
 *
 * h1, title och description är oförändrade (SEO-spärren). Antalet konton
 * visas i hjältens talrad (ägarens beslut 9).
 */
import AuthRedirect from '@/components/landing/AuthRedirect';
import PubliktSida from '@/components/publikt/PubliktSida';
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
    <PubliktSida>
      <AuthRedirect />
      <Startsidan konton={konton} />
    </PubliktSida>
  );
}
