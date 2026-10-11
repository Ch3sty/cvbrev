'use client';

/**
 * Personligheten på Alla tester (skiss Provbladet, version 3): en sektion
 * med etikett och ett kort med två rader, symbolen, namnet och en rad om
 * läget. Ingen procent och ingen nivå, för det finns inget rätt svar (E1).
 * Gjord profil öppnas med "Visa profilen", låst nivå öppnar betalväggen.
 */

import Link from 'next/link';
import { IkonChev, IkonLas, SymPerson } from '@/components/illustrations/RumSymboler';
import { HjalpKnapp } from '@/components/hjalp';
import { featureForSlug, getTestConfig, testPaths } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';
import { lastAria } from '@/lib/traning/hem-copy';
import { paketKort } from '@/lib/plans/plans';
import type { PersonalityStat } from '../getHubData';

type Niva = 'grund' | 'avancerad';

const NAMN: Record<Niva, string> = {
  grund: 'Personlighetsprofil, grund',
  avancerad: 'Personlighetsprofil, avancerad',
};

const BESKRIVNING: Record<Niva, string> = {
  grund: 'Fem skalor',
  avancerad: 'Fem skalor med delskalor',
};

const RAD = 'flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left no-underline';

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
  const fri = !scopeHasFeature(scope, 'tests_above_base');

  const rad = (niva: Niva) => {
    const slug = `personlighet-${niva}` as const;
    const stat = personality[niva];
    const f = featureForSlug(slug);
    const feature = f && !scopeHasFeature(scope, f) ? f : null;
    const minuter = getTestConfig(slug)?.minutes ?? 0;

    if (feature) {
      return (
        <button
          type="button"
          onClick={() => onLocked?.(feature)}
          aria-label={`${NAMN[niva]}. ${lastAria()}`}
          className={RAD}
        >
          <SymPerson size={40} className="shrink-0 text-ink-3" />
          <span className="min-w-0 flex-1">
            <b className="block text-[15px] font-semibold leading-5 text-ink-3">{NAMN[niva]}</b>
            <span className="mt-0.5 block text-meta text-ink-3">{paketKort()}</span>
          </span>
          <IkonLas size={20} className="shrink-0 text-ink-3" />
        </button>
      );
    }

    if (stat.hasProfile && stat.latestSessionId && stat.lastCompletedAt) {
      return (
        <Link href={`/dashboard/tester/${slug}/test/${stat.latestSessionId}/results`} className={RAD}>
          <SymPerson size={40} className="shrink-0 text-ton-ink" />
          <span className="min-w-0 flex-1">
            <b className="block text-[15px] font-semibold leading-5 text-ink-1">{NAMN[niva]}</b>
            <span className="mt-0.5 block text-meta text-ink-3">Gjord {datum(stat.lastCompletedAt)}</span>
          </span>
          <span className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-lg bg-ton px-2.5 text-[12px] font-medium text-ton-ink">
            Visa profilen
          </span>
        </Link>
      );
    }

    const meta =
      niva === 'grund' && fri ? 'Resultatet utan tolkning' : `${BESKRIVNING[niva]}, cirka ${minuter} minuter`;
    return (
      <Link href={testPaths.hub(slug)} className={RAD}>
        <SymPerson size={40} className="shrink-0 text-ton-ink" />
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] font-semibold leading-5 text-ink-1">{NAMN[niva]}</b>
          <span className="mt-0.5 block text-meta text-ink-3">{meta}</span>
        </span>
        <IkonChev size={20} className="shrink-0 text-ink-3" />
      </Link>
    );
  };

  return (
    <section className="relative" aria-labelledby="testkort-personlighet" data-testkort="personlighet">
      <p className="mx-1 flex items-center gap-2 text-meta font-semibold text-ink-3">
        <span id="testkort-personlighet">Personlighet</span>
        <HjalpKnapp id="B7" etikett="Vad mäter personlighetstestet?" />
      </p>
      <ul className="mt-2 list-none divide-y divide-kant overflow-hidden rounded-2xl border border-kant bg-papper p-0">
        <li>{rad('grund')}</li>
        <li>{rad('avancerad')}</li>
      </ul>
    </section>
  );
}
