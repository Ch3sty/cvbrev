/**
 * Startsidan (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 5).
 *
 * Sektionsföljden i designsystemets §12: hero med IlluScenSallet, panel med
 * produktscen, mediebevisen i bläck, tre verktygskort, en lista, paketen
 * (samma PriserPaket som prissidan) och frågorna på mark. LiveAIShowcase,
 * ToolsConstellation, DynamicCounters och RichFinalCTA är borta.
 *
 * h1, title och description är oförändrade (SEO-spärren).
 */
import AuthRedirect from '@/components/landing/AuthRedirect';
import PriserPaket from '@/app/(public)/priser/components/PriserPaket';
import {
  StartFaq,
  StartHero,
  StartLista,
  StartMatchning,
  StartMedia,
  StartVerktyg,
} from '@/components/landing/start/StartSida';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const revalidate = 86400;

/** Antal konton för heron, läst en gång per dygn. Saknas det faller beviset bort. */
async function antalKonton(): Promise<number | null> {
  try {
    const { count } = await getSupabaseAdmin().from('profiles').select('*', { count: 'exact', head: true });
    return typeof count === 'number' && count > 0 ? count : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const konton = await antalKonton();
  return (
    <div className="min-h-screen bg-mark">
      <AuthRedirect />
      <main className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-16">
        <StartHero konton={konton} />
        <StartMatchning />
        <StartMedia />
        <StartVerktyg />
        <StartLista />
        <div className="mt-8 lg:mt-4">
          <PriserPaket />
        </div>
        <StartFaq />
      </main>
    </div>
  );
}
