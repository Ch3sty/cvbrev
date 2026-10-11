'use client';

/**
 * Personlighetskortet på Alla tester (skiss Testerna v2, skiss 1,
 * riktlinjerna 1.5 och 5.3): samma kortform som de kognitiva, men synligt
 * annorlunda. Två segment (Grund, Avancerad), ingen procent, ingen provrad.
 * I provradens ställe raden "Inga rätta svar, ingen klocka." med den tystade
 * symbolen, och hur rekryteraren läser profilen. Personlighetstestet får
 * inget övningsprov och spelifieras aldrig.
 */

import { HjalpKnapp } from '@/components/hjalp';
import { IlluPersonlighet } from '@/components/traning/illu';
import { featureForSlug, getTestConfig, testPaths } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';
import { lastAria } from '@/lib/traning/hem-copy';
import { paketKort } from '@/lib/plans/plans';
import type { PersonalityStat } from '../getHubData';
import NivaSegment, { type NivaLage } from './NivaSegment';
import Fakta, { spann } from './Fakta';
import SymTyst from './SymTyst';

type Niva = 'grund' | 'avancerad';

export const PERSONLIGHET_KORT = {
  rubrik: 'Personlighetstest',
  fraga: 'Hur är du när ingen frågar?',
  text: 'Du tar ställning till påståenden om dig själv. Profilen visar fem drag, och rekryteraren läser den mot tjänsten.',
  knapp: 'Vad mäter personlighetstestet?',
  gor: { grund: 'fem drag', avancerad: 'delskalor' } as Record<Niva, string>,
  namn: { grund: 'Grund', avancerad: 'Avancerad' } as Record<Niva, string>,
  rad: 'Inga rätta svar, ingen klocka.',
  radMeta: 'Så tolkar rekryteraren profilen: mot tjänstens krav, aldrig som poäng.',
  gjord: (datum: string) => `gjord ${datum}`,
} as const;

function datum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(
    new Date(iso)
  );
}

export default function PersonlighetKort({
  personality,
  scope,
  onLocked,
}: {
  personality: { grund: PersonalityStat; avancerad: PersonalityStat };
  scope: Scope | null;
  onLocked?: (feature: Feature) => void;
}) {
  const K = PERSONLIGHET_KORT;
  const segment = (['grund', 'avancerad'] as const).map((niva) => {
    const slug = `personlighet-${niva}` as const;
    const stat = personality[niva];
    const f = featureForSlug(slug);
    const feature = f && !scopeHasFeature(scope, f) ? f : null;
    const minuter = getTestConfig(slug)?.minutes ?? 0;
    const namn = K.namn[niva];
    let lage: NivaLage;
    let href: string = testPaths.hub(slug);
    if (feature) {
      lage = { typ: 'last', etikett: paketKort(), aria: `${K.rubrik}, ${namn.toLowerCase()}. ${lastAria()}` };
    } else if (stat.hasProfile && stat.latestSessionId && stat.lastCompletedAt) {
      const d = datum(stat.lastCompletedAt);
      lage = { typ: 'profil', etikett: K.gjord(d), aria: `${K.rubrik}, ${namn.toLowerCase()}, profilen gjord ${d}` };
      href = `/dashboard/tester/${slug}/test/${stat.latestSessionId}/results`;
    } else {
      lage = {
        typ: 'ny',
        minuter,
        etikett: K.gor[niva],
        aria: `${K.rubrik}, ${namn.toLowerCase()}, ${K.gor[niva]}, inte gjord, ${minuter} minuter`,
      };
    }
    return { niva, namn, lage, href, feature };
  });

  const SLUGS = ['personlighet-grund', 'personlighet-avancerad'];
  const fakta = [
    { tal: spann(SLUGS.map((s) => getTestConfig(s)?.totalQuestions ?? 0)), etikett: 'påståenden' },
    { tal: spann(SLUGS.map((s) => getTestConfig(s)?.minutes ?? 0)), etikett: 'minuter' },
    { tal: String(SLUGS.length), etikett: 'nivåer' },
  ];

  return (
    <section
      className="relative rounded-2xl border border-kant bg-papper p-4"
      aria-labelledby="testkort-personlighet"
      data-testkort="personlighet"
    >
      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start">
        <div className="mx-auto w-full max-w-[200px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none">
          <IlluPersonlighet className="block h-24 w-full lg:h-[120px]" />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="flex items-center gap-2 text-ey uppercase text-ink-3">
            <span id="testkort-personlighet">{K.rubrik}</span>
            <HjalpKnapp id="B7" etikett={K.knapp} />
          </p>
          <h2 className="mt-1 font-display text-[18px] font-bold leading-[23px] tracking-[-.015em] text-ink-1">{K.fraga}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{K.text}</p>
        </div>
        <Fakta poster={fakta} className="!justify-start lg:col-start-1 lg:row-start-2" />
      </div>

      <ul className="mt-3.5 grid list-none grid-cols-2 gap-2 p-0">
        {segment.map((s) => (
          <li key={s.niva} className="min-w-0">
            <NivaSegment
              namn={s.namn}
              lage={s.lage}
              href={s.href}
              onLocked={s.feature ? () => onLocked?.(s.feature as Feature) : undefined}
            />
          </li>
        ))}
      </ul>

      <div className="mt-3 flex min-h-14 items-center gap-3 border-t border-kant pt-3" data-provrad="personlighet">
        <SymTyst size={36} className="shrink-0 text-ink-3" />
        <span className="min-w-0 flex-1">
          <b className="block text-sm font-medium leading-[19px] text-ink-2">{K.rad}</b>
          <span className="block text-meta text-ink-3">{K.radMeta}</span>
        </span>
      </div>
    </section>
  );
}
