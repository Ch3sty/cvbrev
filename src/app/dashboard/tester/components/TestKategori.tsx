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
 * Testerna v2 (skiss 1): samma kort för logik, verbalt och numeriskt, tre
 * nivåsegment och under hårlinjen provraden med övningsprovet mot klockan i
 * planens format. Segmentet "Prov" finns inte längre; de gamla provsidorna
 * står kvar för gamla resultat utan att något pekar dit. Nivåer som inte
 * ingår i paketet är låsta och trycket öppnar betalväggen.
 */

import type { ComponentType } from 'react';
import { ENHET, NIVA_GOR, PROV_FEATURE, type TestGroup } from './testCatalog';
import ProvCard, { ProvTyst } from './ProvCard';
import NivaSegment, { type NivaLage } from './NivaSegment';
import Fakta, { spann } from './Fakta';
import { ovningsformat, provradTexter } from '@/lib/ovningsprov/format';
import { SITTER_PROCENT, medianSenaste } from '@/lib/tester/resultat';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';
import { featureForSlug, testPaths } from '../testConfig';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';
import { lastAria } from '@/lib/traning/hem-copy';
import { paketKort } from '@/lib/plans/plans';
import { HjalpKnapp } from '@/components/hjalp';
import { hjalpRuta, type HjalpId } from '@/lib/traning/hjalp-copy';
import { IlluDeduktiv, IlluMatris, IlluNumeriskt, IlluVerbalt, type IlluProvbladProps } from '@/components/traning/illu';

interface Props {
  group: TestGroup;
  perTest: Record<TestSlug, PerTestStats>;
  /** Planens leverantör och variant, null utan plan: provraden visar vårt format. */
  plan?: { leverantor: string | null; variant: string | null } | null;
  scope?: Scope | null;
  onLocked?: (feature: Feature) => void;
}

/** Frågan som säger vad uppgiften är, per testtyp. */
export const FRAGA: Record<string, string> = {
  logik: 'Vilken figur kommer härnäst?',
  figurer: 'Vilken figur kommer härnäst i raden?',
  deduktiv: 'Vem står var när alla villkor gäller?',
  verbal: 'Stämmer påståendet med texten?',
  numerisk: 'Läs tabellen och räkna under tid.',
};

/** Provbladets bild per testtyp. */
export const BILD: Record<string, ComponentType<IlluProvbladProps>> = {
  logik: IlluMatris,
  figurer: IlluMatris,
  deduktiv: IlluDeduktiv,
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
  figurer: ['B10'],
  deduktiv: ['B11'],
  verbal: ['B3', 'B4'],
  numerisk: ['B5', 'B6'],
};

export function hjalpIdFor(key: string): HjalpId | null {
  return (HJALP[key] ?? []).find((id) => hjalpRuta(id) !== null) ?? null;
}

const ETIKETT_KNAPP: Record<string, string> = {
  logik: 'Vad mäter logiktestet?',
  figurer: 'Vad är figurserier?',
  deduktiv: 'Vad är deduktiv slutledning?',
  verbal: 'Vad mäter det verbala testet?',
  numerisk: 'Vad mäter det numeriska testet?',
};

const NIVAETIKETT = 'Bästa resultat per nivå';

function forsok(n: number): string {
  return `${n} försök`;
}

/**
 * Sitter nivån? Medianen av de tre senaste resultaten över SITTER_PROCENT
 * (riktlinjerna 5.3). Gratisnivån ser bara senaste sessionen, då räknas den.
 */
export function sitter(s: PerTestStats | undefined): boolean {
  if (!s || s.attempts === 0) return false;
  const m = medianSenaste(s.history.map((h) => h.percentage));
  return (m ?? s.bestPercentage) > SITTER_PROCENT;
}

export default function TestKategori({ group, perTest, plan = null, scope = null, onLocked }: Props) {
  const las = (slug: string): Feature | null => {
    const f = featureForSlug(slug);
    return f && !scopeHasFeature(scope, f) ? f : null;
  };
  const premium = paketKort();
  const nyckel = group.key === 'personlighet' ? 'logik' : group.key;

  const lastLage = (namn: string): NivaLage => ({
    typ: 'last',
    etikett: premium,
    aria: `${group.heading}, ${namn.toLowerCase()}. ${lastAria()}`,
  });

  const segment: { key: string; namn: string; href: string; lage: NivaLage; feature: Feature | null; nasta: boolean }[] =
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
        const gor = NIVA_GOR[nyckel][t.levelLabel];
        lage = {
          typ: 'ny',
          minuter: Number(t.timeLabel),
          etikett: gor,
          aria: `${group.heading}, ${namn.toLowerCase()}, ${gor}, inte gjord, ${t.timeLabel} minuter`,
        };
      }
      return { key: t.slug, namn, href: testPaths.hub(t.slug), lage, feature, nasta: false };
    });

  // "Nästa" på ett segment per kort: det första som inte är gjort när nivån
  // under sitter. Ingen "Börja här" när något är gjort (riktlinjerna 5.3).
  const nastaIdx = segment.findIndex(
    (s, i) => i > 0 && s.lage.typ === 'ny' && segment[i - 1].lage.typ === 'gjord' && sitter(perTest[segment[i - 1].key as TestSlug])
  );
  if (nastaIdx > 0) segment[nastaIdx].nasta = true;

  const prov = group.prov ?? null;
  const provFeature: Feature | null = prov && !scopeHasFeature(scope, PROV_FEATURE) ? PROV_FEATURE : null;
  const provText = prov
    ? provradTexter(ovningsformat(prov.typ, plan?.leverantor ?? null, plan?.variant ?? null), provFeature !== null)
    : null;

  const nagotGjort = segment.some((s) => s.lage.typ === 'gjord');

  const Bild = BILD[group.key] ?? IlluMatris;
  const hjalpId = hjalpIdFor(group.key);
  const rubrikId = `testkort-${group.key}`;

  const fakta = [
    { tal: spann(group.cognitive.map((t) => t.questionCount)), etikett: ENHET[nyckel] },
    { tal: spann(group.cognitive.map((t) => Number(t.timeLabel))), etikett: 'minuter' },
    { tal: String(group.cognitive.length), etikett: 'nivåer' },
  ];

  return (
    <section
      className="relative rounded-2xl border border-kant bg-papper p-4"
      aria-labelledby={rubrikId}
      data-testkort={group.key}
    >
      {/* Mobil: bild, text, faktarad (vänsterställd), sist segmenten
          (art-director 2026-10-11, avvikelse 2). Dator: text och faktarad
          till vänster, bilden 160 × 120 till höger. */}
      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start">
        <div className="mx-auto w-full max-w-[200px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none">
          <Bild className="block h-24 w-full lg:h-[120px]" />
        </div>
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
        <Fakta poster={fakta} className="!justify-start lg:col-start-1 lg:row-start-2" />
      </div>

      <ul className="mt-3.5 grid list-none grid-cols-3 gap-2 p-0">
        {segment.map((s) => (
          <li key={s.key} className="min-w-0">
            <NivaSegment
              namn={s.namn}
              lage={s.lage}
              href={s.href}
              nasta={s.nasta}
              onLocked={s.feature ? () => onLocked?.(s.feature as Feature) : undefined}
            />
          </li>
        ))}
      </ul>
      {nagotGjort ? <p className="mt-1.5 text-[11px] leading-[14px] text-ink-3">{NIVAETIKETT}</p> : null}

      {prov && provText ? (
        <ProvCard
          href={prov.href}
          rad2={provText.rad}
          anm={provText.anm}
          aria={provText.aria}
          locked={provFeature !== null}
        />
      ) : group.provTyst ? (
        <ProvTyst rad1={group.provTyst.rad1} rad2={group.provTyst.rad2} />
      ) : null}
    </section>
  );
}
