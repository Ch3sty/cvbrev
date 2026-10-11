'use client';

/**
 * Alla tester, den interaktiva delen (skiss Provbladet, version 3).
 *
 * All data kommer färdig som props från alla/page.tsx, som läste den på
 * servern. Staten här är vilken flik som är vald och om ett låst val
 * öppnat betalväggen. Inga fetchanrop för att rita.
 *
 * Sidan äger flikarna. Fliken Tester ritas här: väggen med "Så går det
 * till" för den som är ny, det lyfta kortet "Nästa test", flikarna,
 * hjälpraden och testkorten. Fliken Din utveckling ritas av
 * @/components/traning/utveckling/DinUtveckling, som får flikarna som en
 * plats att ställa efter sitt eget lyfta kort. HjalpProvider står runt
 * båda.
 *
 * Hjälpen (avsnitt 4): på mobil hjälprader på golvet, på dator en
 * sidopanel till höger om korten, så att den aldrig trycker ner dem.
 *
 * Gränsen syns där den är (spec-onboarding 2026-09-22, sektion 3 och 5):
 * låsta nivåer har lås och "Premium", och ett tryck öppnar betalväggen.
 */

import { Suspense, lazy, use, useState, type ReactNode } from 'react';
import Golv from '@/components/rum/Golv';
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Lagesrad from '@/components/rum/Lagesrad';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import type { DinUtvecklingData } from '@/components/traning/utveckling/typer';
import { TRAN_RAD, UNDERSIDA } from '@/lib/rum/copy';
import StatusRow from '@/components/shell/StatusRow';
import GraValSheet from '@/components/paywall/GraValSheet';
import { HjalpPanel, HjalpProvider, HjalpRad } from '@/components/hjalp';
import type { Feature, Scope } from '@/lib/access/features';
import { scopeHasFeature } from '@/lib/access/features';
import { SALD_PLAN, paketKort, paketNamn, prisPeriod, type PlanKey } from '@/lib/plans/plans';
import { testHuvud } from '@/lib/onboarding/paket-rader';
import TesterTabs, { type TesterTab } from './components/TesterTabs';
import TestKategori, { BILD } from './components/TestKategori';
import PersonlighetKort from './components/PersonlighetKort';
import AllaTesterVagg, { saGarDetTillSteg } from './components/AllaTesterVagg';
import NastaTestKort, { type NastaTest } from './components/NastaTestKort';
import { spann } from './components/Fakta';
import { ALL_COGNITIVE_TESTS, TEST_GROUPS } from './components/testCatalog';
import { IlluMatris } from '@/components/traning/illu';
import { featureForSlug, testPaths } from './testConfig';
import type { TesterHubData } from './getHubData';

// lazy, inte next/dynamic: både koden och datan väntas in bakom samma
// Suspense, så flikarna står kvar och går att trycka på medan fliken laddar.
const DinUtveckling = lazy(() => import('@/components/traning/utveckling/DinUtveckling'));

/** Fliken Din utveckling när datan strömmat in från alla/page.tsx. */
function UtvecklingFlik({ las, flikar }: { las: Promise<DinUtvecklingData>; flikar: ReactNode }) {
  const data = use(las);
  return (
    <DinUtveckling
      data={data}
      topprad={
        <>
          <Topprad lagen={<Lagesrad aktiv="alla" plats="topprad" />} />
          <Lagesrad aktiv="alla" />
        </>
      }
      flikar={flikar}
    />
  );
}

/** Medan Din utveckling laddar: väggen i rätt höjd och flikarna på golvet. */
function UtvecklingLaddar({ flikar }: { flikar: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true">
      <Vagg>
        <Topprad lagen={<Lagesrad aktiv="alla" plats="topprad" />} />
        <Lagesrad aktiv="alla" />
        <LoadingSkeleton variant="vagg" label="Laddar din utveckling" />
      </Vagg>
      <Golv>
        <div className="flex flex-col gap-4">
          <div className="lg:max-w-[420px]">{flikar}</div>
          <div className="min-h-[420px]" aria-hidden="true" />
        </div>
      </Golv>
    </div>
  );
}

/**
 * Gratisraden (spec-rummen 23.3): nivåmätningen en gång med genomgång och
 * ett första träningspass samma dag; resten ingår i Premium, priset ur PLANS.
 */
const GRATIS_RAD = `Gratis att prova: nivåmätningen en gång med genomgång och ett första träningspass samma dag. Resten ingår i ${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}.`;

/** Hjälpens läge, läst på servern (src/lib/traning/hjalp.ts). */
export interface HjalpLageProps {
  /** profiles.hjalp_dold, null när kolumnen saknas eller inget val gjorts. */
  dold: boolean | null;
  /** Första gången: inget test är gjort än. */
  forsta: boolean;
}

function gruppFor(slug: string) {
  return TEST_GROUPS.find((g) => g.cognitive.some((t) => t.slug === slug)) ?? TEST_GROUPS[0];
}

export default function TesterHubClient({
  data,
  track = null,
  planKey = null,
  hjalp = { dold: null, forsta: false },
  startflik = 'tester',
  utveckling,
}: {
  data: TesterHubData;
  track?: Scope | null;
  planKey?: PlanKey | null;
  hjalp?: HjalpLageProps;
  startflik?: TesterTab;
  /** Din utvecklings data, strömmad från servern (alla/page.tsx). */
  utveckling: Promise<DinUtvecklingData>;
}) {
  const [tab, setTab] = useState<TesterTab>(startflik);
  const [sparr, setSparr] = useState<Feature | null>(null);

  const { perTest, aggregate, personality, provBestPercent, provformat, isPremium, scope } = data;

  const hasAnyData =
    aggregate.hasAnyData || personality.grund.hasProfile || personality.avancerad.hasProfile;

  const harAllaNivaer = scopeHasFeature(scope, 'tests_above_base');
  const huvud = testHuvud(scope);

  // Nästa test (analysen 22 september, avsnitt 4): logiktestet på grundnivå
  // för den som inte gjort något, annars det första test som ingår och inte
  // är gjort. Talen står i faktaraden, aldrig i texten.
  const nasta: NastaTest | null = (() => {
    const fakta = (t: (typeof ALL_COGNITIVE_TESTS)[number]) => [
      { tal: String(t.questionCount), etikett: 'frågor' },
      { tal: t.timeLabel, etikett: 'minuter' },
    ];
    if (!hasAnyData) {
      const t = ALL_COGNITIVE_TESTS[0];
      return {
        eyebrow: 'Börja här',
        titel: 'Logiktestet på grundnivå',
        text: 'Den vanligaste typen av begåvningstest och en mjuk start på mönsterigenkänning. Förklaring efter varje fråga.',
        href: testPaths.hub(t.slug),
        knapp: 'Starta första testet',
        fakta: fakta(t),
        Bild: IlluMatris,
      };
    }
    const t = ALL_COGNITIVE_TESTS.find((x) => {
      const f = featureForSlug(x.slug);
      return (perTest[x.slug]?.attempts ?? 0) === 0 && (!f || scopeHasFeature(scope, f));
    });
    if (!t) return null;
    const grupp = gruppFor(t.slug);
    return {
      eyebrow: 'Nästa test',
      titel: `${grupp.heading}, ${t.levelLabel.toLowerCase()}`,
      text: 'Du har inte gjort det än. Förklaring efter varje fråga.',
      href: testPaths.hub(t.slug),
      knapp: 'Starta testet',
      fakta: fakta(t),
      Bild: BILD[grupp.key] ?? IlluMatris,
    };
  })();

  const beskrivning = `${TRAN_RAD} ${
    huvud.ingress ??
    `Logik, verbalt, numeriskt och personlighet, i samma format som Assessio, cut-e och SHL.${
      harAllaNivaer ? '' : ` Alla nivåer ingår i ${paketKort()}.`
    }`
  }`;

  const steg = hjalp.forsta
    ? saGarDetTillSteg(spann(ALL_COGNITIVE_TESTS.map((t) => t.questionCount)))
    : null;

  const flikar = (
    <TesterTabs active={tab} onChange={setTab} completedCount={aggregate.totalCompleted} />
  );

  const kognitiva = TEST_GROUPS.filter((g) => g.key !== 'personlighet');

  return (
    <HjalpProvider dold={hjalp.dold} forsta={hjalp.forsta}>
      {tab === 'utveckling' ? (
        <Suspense fallback={<UtvecklingLaddar flikar={flikar} />}>
          <UtvecklingFlik las={utveckling} flikar={flikar} />
        </Suspense>
      ) : (
        <>
          <AllaTesterVagg titel={UNDERSIDA.allaTester} beskrivning={beskrivning} steg={steg} tat={!nasta} />
          <Golv lyft={!!nasta}>
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-x-6">
              <div className="flex min-w-0 flex-col gap-4">
                {nasta ? <NastaTestKort nasta={nasta} bildPaMobil={!steg} /> : null}

                <div className="lg:max-w-[420px]">{flikar}</div>

                <HjalpRad
                  ids={['A1', 'A2', 'A5']}
                  rubrik="Aldrig gjort ett rekryteringstest?"
                  oppnasForsta={false}
                  className="lg:hidden"
                />

                {/* kunden med CV-paketet: paketet, och var resten finns. */}
                {huvud.statusrad ? (
                  <StatusRow tone="neutral" showDot>
                    {huvud.statusrad}
                  </StatusRow>
                ) : null}
                {huvud.rubrik ? <p className="text-kort text-ink-1">{huvud.rubrik}</p> : null}
                {!isPremium && !huvud.ingress ? (
                  <StatusRow tone="neutral" showDot>
                    {GRATIS_RAD}
                  </StatusRow>
                ) : null}

                {kognitiva.map((group, i) => (
                  <div key={group.key} className="contents">
                    <TestKategori
                      group={group}
                      perTest={perTest}
                      provBestPercent={
                        group.prov ? provBestPercent[group.prov.sessionEndpoint] ?? null : null
                      }
                      provformat={provformat}
                      scope={scope}
                      onLocked={(feature) => setSparr(feature)}
                    />
                    {/* Nivåernas hjälp efter andra kortet på mobil, som i skissen. */}
                    {i === 1 ? (
                      <HjalpRad ids={['C5', 'B8']} rubrik="Vad betyder nivåerna?" className="lg:hidden" />
                    ) : null}
                  </div>
                ))}

                <PersonlighetKort
                  personality={personality}
                  scope={scope}
                  onLocked={(feature) => setSparr(feature)}
                />
              </div>

              <HjalpPanel
                className={`hidden lg:block ${nasta ? 'lg:z-[2] lg:-mt-[30px]' : ''}`}
                rader={[
                  { ids: ['A1', 'A2', 'A3', 'A5'], rubrik: 'Aldrig gjort ett rekryteringstest?' },
                  { ids: ['C5', 'B8'], rubrik: 'Vad skiljer grund, avancerad och expert?', oppnasForsta: false },
                  { ids: ['C4'], oppnasForsta: false },
                ]}
              />
            </div>
          </Golv>
        </>
      )}

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
          plats={sparr === 'test_exam_mode' ? 'provlage' : 'testniva'}
        />
      ) : null}
    </HjalpProvider>
  );
}
