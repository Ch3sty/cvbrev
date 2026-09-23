'use client';

/**
 * Testhubbens interaktiva del.
 *
 * All data kommer färdig som props från page.tsx, som läste den på servern.
 * Staten här är vilken flik som är vald och om ett grått val öppnat
 * betalväggen. Inga fetchanrop för att rita, ingen laddningsvy: första HTML
 * innehåller redan raderna med användarens riktiga resultat.
 *
 * Paketets gräns syns här, där den är (spec-onboarding 2026-09-22, sektion
 * 3 och 5): nivåer som inte ingår är gråa med lås och paketets namn, huvudet
 * säger vad som ingår, och CV-veckans kund får fotknapparna "Byt till
 * Testveckan" och "Eller Allt för 20 kr till i veckan".
 */

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import GraValSheet from '@/components/paywall/GraValSheet';
import type { TestSlug } from '@/hooks/use-all-test-stats';
import type { Feature, Scope } from '@/lib/access/features';
import { scopeHasFeature } from '@/lib/access/features';
import type { PlanKey } from '@/lib/plans/plans';
import { DAILY_LIMIT_TEST_SESSIONS } from '@/lib/quota/quotaService';
import { ellerAlltKnapp, graEtikettTest, laggTillKnapp, testHuvud } from '@/lib/onboarding/paket-rader';
import Link from 'next/link';
import InkPanel, { INK_KNAPP } from '@/components/shell/InkPanel';
import { IlluScenMatris } from '@/components/illustrations/PriserScener';
import TesterTabs, { type TesterTab } from './components/TesterTabs';
import TestGroup from './components/TestGroup';
import TestKategori from './components/TestKategori';
import { ALL_COGNITIVE_TESTS, TEST_GROUPS } from './components/testCatalog';
import { featureForSlug, testPaths } from './testConfig';
import type { TesterHubData } from './getHubData';

const DevelopmentView = dynamic(() => import('./components/DevelopmentView'), {
  loading: () => <div className="min-h-[420px]" aria-hidden="true" />,
});

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40';
const KNAPP_SEKUNDAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40';

/** Samma dag i svensk tid? */
function sammaDag(iso: string | null): boolean {
  if (!iso) return false;
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' });
  return fmt.format(new Date(iso)) === fmt.format(new Date());
}

export default function TesterHubClient({
  data,
  track = null,
  planKey = null,
}: {
  data: TesterHubData;
  track?: Scope | null;
  planKey?: PlanKey | null;
}) {
  const [tab, setTab] = useState<TesterTab>('tester');
  const [sparr, setSparr] = useState<Feature | null>(null);
  const [busy, setBusy] = useState<PlanKey | null>(null);

  const { perTest, aggregate, personality, provBestPercent, isPremium, hasHistory, scope } =
    data;

  const bestTest = Object.entries(perTest)
    .filter(([, s]) => s.attempts > 0)
    .sort((a, b) => b[1].bestPercentage - a[1].bestPercentage)[0]?.[0] as
    | TestSlug
    | undefined;

  const hasAnyData =
    aggregate.hasAnyData || personality.grund.hasProfile || personality.avancerad.hasProfile;

  const personalityStats = { ...personality, isLoading: false };

  const harAllaNivaer = scopeHasFeature(scope, 'tests_above_base');
  const huvud = testHuvud(scope);
  const graEtikett = graEtikettTest(scope);

  // "1 kvar i dag" på grundnivån utanför Testveckan: en gång per typ och dygn.
  const dagRad = useCallback(
    (slug: string): string | null => {
      if (harAllaNivaer) return null;
      const s = perTest[slug as TestSlug];
      const kvar = s && sammaDag(s.lastAttempt) ? 0 : DAILY_LIMIT_TEST_SESSIONS;
      return `${kvar} kvar i dag`;
    },
    [harAllaNivaer, perTest]
  );

  // Fotknapparna för CV-veckans kund: sidbyte och Allt går båda via
  // uppgraderingsrutten, som svarar med Stripe-portalen för spårbyte och
  // kassan med mellanskillnaden för Allt (D1 fråga 7).
  const uppgradera = async (plan: PlanKey) => {
    if (busy) return;
    setBusy(plan);
    try {
      const res = await fetch('/api/stripe/create-upgrade-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: plan, returnPath: '/dashboard/tester' }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.url) {
        window.location.href = json.url as string;
        return;
      }
    } catch {
      /* knappen blir tryckbar igen */
    }
    setBusy(null);
  };
  const alltKnapp = ellerAlltKnapp(planKey);

  // Rekommendationen i bläck (analysen 22 september, avsnitt 4): logiktestet
  // på grundnivå för den som inte gjort något, annars det första test som
  // ingår och inte är gjort. Finns inget sådant visas ingen bläckyta.
  const rekommendation = (() => {
    if (!hasAnyData) {
      return {
        eyebrow: 'Börja här',
        title: 'Logiktestet på grundnivå',
        text: `Den vanligaste typen av begåvningstest och en mjuk start på mönsterigenkänning. ${ALL_COGNITIVE_TESTS[0].questionCount} frågor, cirka ${ALL_COGNITIVE_TESTS[0].timeLabel} minuter.`,
        href: testPaths.hub('matrislogik-grund'),
        knapp: 'Starta första testet',
      };
    }
    const nasta = ALL_COGNITIVE_TESTS.find((t) => {
      const f = featureForSlug(t.slug);
      return (perTest[t.slug]?.attempts ?? 0) === 0 && (!f || scopeHasFeature(scope, f));
    });
    if (!nasta) return null;
    return {
      eyebrow: 'Nästa test',
      title: `${nasta.title}, ${nasta.levelLabel.toLowerCase()}`,
      text: `Du har inte gjort det än. ${nasta.questionCount} frågor, cirka ${nasta.timeLabel} minuter, förklaring efter varje fråga.`,
      href: testPaths.hub(nasta.slug),
      knapp: 'Starta testet',
    };
  })();

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow="Rekryteringstester"
          title="Känn igen uppgiften innan provdagen."
          description={
            huvud.ingress ??
            'Logik, verbalt, numeriskt och personlighet, i samma format som Assessio, cut-e och SHL. Alla nivåer ingår i Testveckan och Allt.'
          }
          scene={<IlluScenMatris className="h-auto w-full" />}
        >
          <TesterTabs
            active={tab}
            onChange={setTab}
            completedCount={aggregate.totalCompleted}
          />
        </PageHeader>

        {/* CV-veckans kund: paketet, och var resten finns. */}
        {huvud.statusrad ? (
          <StatusRow tone="neutral" showDot>
            {huvud.statusrad}
          </StatusRow>
        ) : null}
        {huvud.rubrik ? <p className="text-kort text-ink-1">{huvud.rubrik}</p> : null}

        {/* Gratisrytmen sägs en gång, som rad, inte på varje rad. */}
        {!isPremium && !huvud.ingress ? (
          <StatusRow tone="neutral" showDot>
            Du gör varje test en gång per dag på gratisnivån.
          </StatusRow>
        ) : null}

        {tab === 'tester' ? (
          <div key="tester" className="space-y-4 sm:space-y-6">
            {rekommendation ? (
              <InkPanel
                eyebrow={rekommendation.eyebrow}
                title={rekommendation.title}
                text={rekommendation.text}
                action={
                  <Link href={rekommendation.href} className={INK_KNAPP}>
                    {rekommendation.knapp}
                  </Link>
                }
              />
            ) : null}

            {/* Tre kognitiva typer som paneler med nivåsegment, personligheten
                som rader direkt på mark (regel 4: högst tre ytor i samma vikt). */}
            {TEST_GROUPS.filter((g) => g.key !== 'personlighet').map((group) => (
              <TestKategori
                key={group.key}
                group={group}
                perTest={perTest}
                provBestPercent={
                  group.prov ? provBestPercent[group.prov.sessionEndpoint] ?? null : null
                }
                scope={scope}
                graEtikett={graEtikett}
                onLocked={(feature) => setSparr(feature)}
                dagRad={dagRad}
              />
            ))}

            {TEST_GROUPS.filter((g) => g.key === 'personlighet').map((group) => (
              <TestGroup
                key={group.key}
                group={group}
                startIndex={0}
                isPremium={isPremium}
                perTest={perTest}
                personality={personalityStats}
                bestTest={bestTest}
                scope={scope}
                graEtikett={graEtikett}
                onLocked={(feature) => setSparr(feature)}
                dagRad={dagRad}
                utanPanel
              />
            ))}

            {/* Foten för CV-veckans kund (sektion 3). */}
            {scope === 'cv' ? (
              <div className="grid gap-2 rounded-xl border border-kant bg-panel p-4">
                <button
                  type="button"
                  onClick={() => uppgradera('test_week')}
                  disabled={busy !== null}
                  className={KNAPP_PRIMAR}
                >
                  {busy === 'test_week' ? 'Öppnar' : laggTillKnapp('test_week')}
                </button>
                {alltKnapp ? (
                  <button
                    type="button"
                    onClick={() => uppgradera('all_week')}
                    disabled={busy !== null}
                    className={KNAPP_SEKUNDAR}
                  >
                    {busy === 'all_week' ? 'Öppnar' : alltKnapp}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <DevelopmentView perTest={perTest} hasHistory={hasHistory} scope={scope} />
        )}
      </div>

      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature={sparr}
          variant="testniva"
          scope={scope}
          track={track}
          planKey={planKey}
          surface="/dashboard/tester"
        />
      ) : null}
    </div>
  );
}
