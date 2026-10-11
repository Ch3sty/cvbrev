'use client';

/**
 * Testkortet på Alla tester (skiss Provbladet, version 3, avsnitt 1).
 *
 * - Bilden står på papperet: 96 hög och centrerad över texten på mobil,
 *   160 × 120 till höger på dator. Ingen platta, ingen cirkel.
 * - Eyebrow är testtypen med en i-knapp, rubriken är frågan ("Vilken figur
 *   kommer härnäst?"), så att den som är ny förstår uppgiften före namnet.
 * - Faktaraden under bilden: tre tal över tre etiketter, aldrig i löptext.
 * - Nivåsegmenten bär ett tal var (NivaSegment). En rad under rutnätet säger
 *   vad talet är när något är gjort.
 *
 * Logikgruppens prov är generalrepetitionen i planens format (spec-rummen
 * 19.6): segmentet Prov och provraden under nivåerna går båda dit, aldrig
 * till det gamla logikprovet. Nivåer som inte ingår i paketet är låsta och
 * trycket öppnar betalväggen för rätt paket.
 */

import type { ComponentType } from 'react';
import { provLasSlug, type TestGroup } from './testCatalog';
import ProvCard from './ProvCard';
import NivaSegment, { type NivaLage } from './NivaSegment';
import Fakta, { spann } from './Fakta';
import { provradTexter } from '../prov/prov-copy';
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import { featureForSlug, testPaths } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';
import { lastAria } from '@/lib/traning/hem-copy';
import { paketKort } from '@/lib/plans/plans';
import { HjalpKnapp } from '@/components/hjalp';
import { hjalpRuta, type HjalpId } from '@/lib/traning/hjalp-copy';
import { IlluMatris, IlluNumeriskt, IlluVerbalt, type IlluProvbladProps } from '@/components/traning/illu';

interface Props {
  group: TestGroup;
  perTest: Record<TestSlug, PerTestStats>;
  provBestPercent?: number | null;
  /** Planens provformat för generalrepetitionen, 'eget' utan plan. */
  provformat?: FormatNyckel;
  scope?: Scope | null;
  onLocked?: (feature: Feature) => void;
}

/** Frågan som säger vad uppgiften är, per testtyp. */
export const FRAGA: Record<string, string> = {
  logik: 'Vilken figur kommer härnäst?',
  verbal: 'Stämmer påståendet med texten?',
  numerisk: 'Läs tabellen och räkna under tid.',
};

/** Provbladets bild per testtyp. */
export const BILD: Record<string, ComponentType<IlluProvbladProps>> = {
  logik: IlluMatris,
  verbal: IlluVerbalt,
  numerisk: IlluNumeriskt,
};

/**
 * i-knappens ruta per testtyp. B3 och B5 väntar på verifiering av
 * leverantörernas produktnamn; till dess står tipset (B4, B6), så att varje
 * kort har sin knapp. När flaggan tas bort i hjalp-copy.ts byts rutan av
 * sig själv.
 */
const HJALP: Record<string, readonly HjalpId[]> = {
  logik: ['B1', 'B2'],
  verbal: ['B3', 'B4'],
  numerisk: ['B5', 'B6'],
};

export function hjalpIdFor(key: string): HjalpId | null {
  return (HJALP[key] ?? []).find((id) => hjalpRuta(id) !== null) ?? null;
}

const ETIKETT_KNAPP: Record<string, string> = {
  logik: 'Vad mäter logiktestet?',
  verbal: 'Vad mäter det verbala testet?',
  numerisk: 'Vad mäter det numeriska testet?',
};

const NIVAETIKETT = 'Bästa resultat per nivå';

function forsok(n: number): string {
  return `${n} försök`;
}

export default function TestKategori({
  group,
  perTest,
  provBestPercent = null,
  provformat = 'eget',
  scope = null,
  onLocked,
}: Props) {
  const las = (slug: string): Feature | null => {
    const f = featureForSlug(slug);
    return f && !scopeHasFeature(scope, f) ? f : null;
  };
  const premium = paketKort();

  const lastLage = (namn: string): NivaLage => ({
    typ: 'last',
    etikett: premium,
    aria: `${group.heading}, ${namn.toLowerCase()}. ${lastAria()}`,
  });

  const segment: { key: string; namn: string; href: string; lage: NivaLage; feature: Feature | null }[] =
    group.cognitive.map((t) => {
    const s = perTest[t.slug];
    const feature = las(t.slug);
    const namn = t.levelLabel;
    let lage: NivaLage;
    if (feature) {
      lage = lastLage(namn);
    } else if ((s?.attempts ?? 0) > 0) {
      const detalj = `${s.bestScore} av ${t.questionCount}, ${forsok(s.attempts)}`;
      lage = {
        typ: 'gjord',
        procent: s.bestPercentage,
        title: detalj,
        aria: `${group.heading}, ${namn.toLowerCase()}, bäst ${s.bestPercentage} procent, ${detalj}`,
      };
    } else {
      lage = {
        typ: 'ny',
        minuter: Number(t.timeLabel),
        etikett: 'inte gjord',
        aria: `${group.heading}, ${namn.toLowerCase()}, inte gjord, ${t.timeLabel} minuter`,
      };
    }
    return { key: t.slug, namn, href: testPaths.hub(t.slug), lage, feature };
  });

  // Provets segment. Logikens är generalrepetitionen i planens format.
  const prov = group.prov ?? null;
  const provFeature = prov ? las(provLasSlug(prov)) : null;
  if (prov) {
    let lage: NivaLage;
    if (provFeature) {
      lage = lastLage('Prov');
    } else if (prov.general) {
      const f = PROVFORMAT[provformat] ?? PROVFORMAT.eget;
      const antal = `${f.cirka ? 'cirka ' : ''}${f.antal} uppgifter`;
      lage = {
        typ: 'ny',
        minuter: f.minuter,
        etikett: antal,
        aria: `${group.heading}, prov, ${antal}, ${f.minuter} minuter`,
      };
    } else if (provBestPercent !== null) {
      lage = {
        typ: 'gjord',
        procent: provBestPercent,
        title: 'Bästa provresultat',
        aria: `${group.heading}, prov, bäst ${provBestPercent} procent`,
      };
    } else {
      lage = {
        typ: 'ny',
        minuter: prov.minutes,
        etikett: `${prov.totalQuestions} frågor`,
        aria: `${group.heading}, prov, ${prov.totalQuestions} frågor, ${prov.minutes} minuter`,
      };
    }
    segment.push({ key: 'prov', namn: 'Prov', href: prov.href, lage, feature: provFeature });
  }

  const nagotGjort = segment.some((s) => s.lage.typ === 'gjord');
  const general = prov?.general ? prov : null;
  const generalText = general ? provradTexter(general, provformat, provFeature !== null) : null;

  const Bild = BILD[group.key] ?? IlluMatris;
  const hjalpId = hjalpIdFor(group.key);
  const rubrikId = `testkort-${group.key}`;

  const fakta = [
    { tal: spann(group.cognitive.map((t) => t.questionCount)), etikett: 'frågor' },
    { tal: spann(group.cognitive.map((t) => Number(t.timeLabel))), etikett: 'minuter' },
    { tal: String(group.cognitive.length), etikett: 'nivåer' },
  ];

  return (
    <section
      className="relative rounded-2xl border border-kant bg-papper p-4"
      aria-labelledby={rubrikId}
      data-testkort={group.key}
    >
      {/* Mobil: bild, faktarad, text. Dator: text och faktarad till vänster,
          bilden 160 × 120 till höger, så att faktaraden får hela bredden. */}
      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start">
        <div className="mx-auto w-full max-w-[200px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none">
          <Bild className="block h-24 w-full lg:h-[120px]" />
        </div>
        <Fakta poster={fakta} className="mb-3 lg:col-start-1 lg:row-start-2 lg:mb-0 lg:justify-start" />
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="flex items-center gap-2 text-ey uppercase text-ink-3">
            <span id={rubrikId}>{group.heading}</span>
            {hjalpId ? <HjalpKnapp id={hjalpId} etikett={ETIKETT_KNAPP[group.key]} /> : null}
          </p>
          <h2 className="mt-1 font-display text-[18px] font-bold leading-[23px] tracking-[-.015em] text-ink-1">
            {FRAGA[group.key] ?? group.heading}
          </h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{group.blurb}</p>
        </div>
      </div>

      <ul className="mt-3.5 grid list-none grid-cols-2 gap-2 p-0 lg:grid-cols-4">
        {segment.map((s) => (
          <li key={s.key} className="min-w-0">
            <NivaSegment
              namn={s.namn}
              lage={s.lage}
              href={s.href}
              onLocked={s.feature ? () => onLocked?.(s.feature as Feature) : undefined}
            />
          </li>
        ))}
      </ul>
      {nagotGjort ? <p className="mt-1.5 text-[11px] leading-[14px] text-ink-3">{NIVAETIKETT}</p> : null}

      {general && generalText ? (
        <ProvCard
          href={general.href}
          rad2={generalText.rad2}
          aria={generalText.aria}
          locked={provFeature !== null}
          onLocked={provFeature ? () => onLocked?.(provFeature) : undefined}
        />
      ) : null}
    </section>
  );
}
