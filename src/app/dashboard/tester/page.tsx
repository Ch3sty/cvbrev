/**
 * Hem i Rekryteringstester v4. Innehållet bor i HemSida.tsx (TesterHemSida),
 * som appens src/app/app/tester/page.tsx ritar med `iAppen` (Jobbsöket
 * omgång 2, byggspec 9.14).
 *
 * I appen nås adressen aldrig: proxyn skriver om /dashboard/tester till
 * appens Tester (/app/katalog).
 *
 * Katalogen med alla tester bor på /dashboard/tester/alla.
 */
import { TesterHemSida } from './HemSida';

export default async function TraningHem({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <TesterHemSida searchParams={searchParams} />;
}
