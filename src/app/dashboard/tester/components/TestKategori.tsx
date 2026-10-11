'use client';

/**
 * En kognitiv testtyp på hubben som en panel med nivåsegment
 * (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 4).
 *
 * Etikett, en fråga som säger vad uppgiften är ("Vilken figur kommer
 * härnäst?"), en mening och vad testet också kallas. Nivåerna är ett
 * segment i stället för fyra rader: Grund, Avancerad, Expert och Prov. Ett
 * gjort test markeras med ink-kant och bästa resultatet. Nivåer som inte
 * ingår i paketet står i insunken med lås, som förut, och trycket öppnar
 * betalväggen för rätt paket.
 *
 * Logikgruppen har inget Prov-segment: dess prov är generalrepetitionen i
 * planens format och står som provrad under nivåerna (spec-rummen 19.6).
 */

import Link from 'next/link';
import { provLasSlug, type TestGroup } from './testCatalog';
import ProvCard from './ProvCard';
import { provradTexter } from '../prov/prov-copy';
import type { FormatNyckel } from '@/lib/traning/tempo';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import { featureForSlug, testPaths } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';
import { ingarIPaketet, lastAria } from '@/lib/traning/hem-copy';

interface Props {
  group: TestGroup;
  perTest: Record<TestSlug, PerTestStats>;
  provBestPercent?: number | null;
  /** Planens provformat för generalrepetitionens rad, 'eget' utan plan. */
  provformat?: FormatNyckel;
  scope?: Scope | null;
  /** Etiketten på gråa nivåer: "Ingår i Premium". */
  graEtikett?: string;
  onLocked?: (feature: Feature) => void;
  /** Dagsrytmen på grundnivån: "1 kvar i dag". */
  dagRad?: (slug: string) => string | null;
}

/** Frågan som säger vad uppgiften är, per testtyp. */
const FRAGA: Record<string, string> = {
  logik: 'Vilken figur kommer härnäst?',
  verbal: 'Stämmer påståendet med texten?',
  numerisk: 'Läs tabellen och räkna under tid.',
};

const SEG =
  'flex min-h-14 flex-col justify-center rounded-lg border px-3 py-2 text-left transition-colors duration-[120ms]';

function Las() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export default function TestKategori({
  group,
  perTest,
  provBestPercent = null,
  provformat = 'eget',
  scope = null,
  graEtikett = '',
  onLocked,
  dagRad,
}: Props) {
  const las = (slug: string): Feature | null => {
    const f = featureForSlug(slug);
    return f && !scopeHasFeature(scope, f) ? f : null;
  };

  const segment = (
    key: string,
    href: string,
    namn: string,
    under: string,
    gjord: boolean,
    feature: Feature | null
  ) => {
    if (feature) {
      return (
        <li key={key}>
          <button
            type="button"
            onClick={() => onLocked?.(feature)}
            aria-label={`${group.heading}, ${namn.toLowerCase()}. ${lastAria()}`}
            className={`${SEG} w-full border-kant bg-insunken text-ink-3 shadow-insunken hover:border-kant-stark`}
          >
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {namn}
              <Las />
            </span>
            <span className="truncate text-meta">{graEtikett || ingarIPaketet()}</span>
          </button>
        </li>
      );
    }
    return (
      <li key={key}>
        <Link
          href={href}
          className={`${SEG} bg-panel ${
            gjord ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
          }`}
        >
          <span className="text-sm font-semibold text-ink-1">{namn}</span>
          <span className="truncate text-meta tabular-nums text-ink-3">{under}</span>
        </Link>
      </li>
    );
  };

  const provFeature = group.prov ? las(provLasSlug(group.prov)) : null;
  // Logikgruppens prov är generalrepetitionen i planens format (spec-rummen
  // 19.6). Meningen om formatet ryms inte i ett segment, så den står som
  // provrad under nivåerna, samma rad och text som i TestGroup.
  const general = group.prov?.general ? group.prov : null;
  const generalText = general ? provradTexter(general, provformat, provFeature !== null) : null;

  return (
    <section
      className="rounded-xl border border-kant bg-panel p-4 sm:p-6"
      aria-labelledby={`testgrupp-${group.key}`}
    >
      <h2 id={`testgrupp-${group.key}`} className="text-steg uppercase text-ink-3">
        {group.heading}
      </h2>
      <p className="mt-2 text-varde text-ink-1">{FRAGA[group.key] ?? group.heading}</p>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{group.blurb}</p>
      <p className="mt-1 text-meta text-ink-3">{group.searchHint}</p>

      <ul className={`mt-4 grid grid-cols-2 gap-2 ${general ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}>
        {group.cognitive.map((t) => {
          const s = perTest[t.slug];
          const gjord = (s?.attempts ?? 0) > 0;
          const rad = dagRad?.(t.slug);
          const under = gjord
            ? `Bäst ${s.bestPercentage} %`
            : `${t.timeLabel} min${rad && t.levelLabel === 'Grund' ? ` · ${rad}` : ''}`;
          return segment(t.slug, testPaths.hub(t.slug), t.levelLabel, under, gjord, las(t.slug));
        })}
        {group.prov && !general
          ? segment(
              'prov',
              group.prov.href,
              'Prov',
              provBestPercent !== null ? `Bäst ${provBestPercent} %` : `${group.prov.minutes} min, mot klockan`,
              provBestPercent !== null,
              provFeature
            )
          : null}
      </ul>

      {general && generalText ? (
        <ul className="mt-4 [&_a]:px-0 [&_button]:px-0">
          <ProvCard
            href={general.href}
            rad2={generalText.rad2}
            aria={generalText.aria}
            bestPercent={null}
            locked={provFeature !== null}
            onLocked={provFeature ? () => onLocked?.(provFeature) : undefined}
          />
        </ul>
      ) : null}
    </section>
  );
}
