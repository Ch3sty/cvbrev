'use client';

/**
 * Klientgränsen för Tratts diagram. Tar färdiga rader från vyerna och ritar
 * dem, hämtar ingenting. Vyerna bestämmer om ett diagram alls ska visas
 * (sju dagar med data, fem köpare); diagramregeln i AdminChart tar resten.
 * Paketen ritas alltid i spårfärgerna: CV-veckan blå, Testveckan brun,
 * Allt ink.
 */

import AdminChart, { type AdminSerie } from '@/components/admin/AdminChart';
import type { BlockeringRad, BrickaAndel, FornyelseVecka, IntaktDag, Paket } from './berakning';

const PAKET_SERIE: Record<Paket, AdminSerie> = {
  cv: { nyckel: 'cv', namn: 'CV-veckan', typ: 'linje', roll: 'cv' },
  tester: { nyckel: 'tester', namn: 'Testveckan', typ: 'linje', roll: 'test' },
  allt: { nyckel: 'allt', namn: 'Allt', typ: 'linje', roll: 'allt' },
};

const tal = (v: number) => `${Math.round(v).toLocaleString('sv-SE')} st`;
const procent = (v: number) => `${Math.round(v)} %`;
const kronor = (v: number) => `${Math.round(v).toLocaleString('sv-SE')} kr`;

/** 2026-09-14 blir "14 sep". */
function kortDatum(varde: string | number): string {
  const d = new Date(`${String(varde)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(varde);
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
}

/** Liggande staplar per funktion, färgade efter paketet som säljs. */
export function BlockeringDiagram({ rader, tomText }: { rader: BlockeringRad[]; tomText: string }) {
  const data = rader.slice(0, 11).map((r) => ({ namn: r.namn, personer: r.personer, roll: r.roll }));
  return (
    <AdminChart
      data={data}
      xNyckel="namn"
      liggande
      fargNyckel="roll"
      etiketter
      yAxisWidth={150}
      hojd={Math.max(120, data.length * 36 + 24)}
      serier={[{ nyckel: 'personer', namn: 'Personer', typ: 'stapel', roll: 'primar' }]}
      formateraY={tal}
      tomText={tomText}
    />
  );
}

/** Andel köpare som provat varje bricka, inom 24 timmar och inom sju dygn. */
export function KomIgangDiagram({ brickor }: { brickor: BrickaAndel[] }) {
  const data = brickor.map((b) => ({ namn: b.namn, inom24: b.inom24, inom7d: b.inom7d }));
  return (
    <AdminChart
      data={data}
      xNyckel="namn"
      liggande
      yAxisWidth={170}
      yDoman={[0, 100]}
      hojd={data.length * 44 + 40}
      serier={[
        { nyckel: 'inom24', namn: 'Inom 24 timmar', typ: 'stapel', roll: 'primar' },
        { nyckel: 'inom7d', namn: 'Inom sju dygn', typ: 'stapel', roll: 'sekundar' },
      ]}
      formateraY={procent}
      tomText="Inga köpare ännu."
    />
  );
}

/** Kohortkurva: andel som fortfarande betalade vecka 1 till 4, per paket. */
export function FornyelseDiagram({ veckor }: { veckor: FornyelseVecka[] }) {
  return (
    <AdminChart
      data={veckor.map((v) => ({ ...v }))}
      xNyckel="vecka"
      hojd={240}
      yDoman={[0, 100]}
      minstaPunkter={1}
      serier={[PAKET_SERIE.allt, PAKET_SERIE.cv, PAKET_SERIE.tester]}
      formateraY={procent}
      tomText="Inga veckoprenumerationer ännu."
    />
  );
}

/** Intäkt per dag och spår, staplad. */
export function IntaktDiagram({ dagar }: { dagar: IntaktDag[] }) {
  return (
    <AdminChart
      data={dagar.map((d) => ({ ...d }))}
      xNyckel="dag"
      hojd={240}
      yAxisWidth={72}
      serier={[
        { ...PAKET_SERIE.allt, typ: 'stapel', stackId: 'paket' },
        { ...PAKET_SERIE.cv, typ: 'stapel', stackId: 'paket' },
        { ...PAKET_SERIE.tester, typ: 'stapel', stackId: 'paket' },
      ]}
      formateraX={kortDatum}
      formateraY={kronor}
      slutvarde={false}
      tomText="Inga köp i fönstret."
    />
  );
}

/** En serie per vecka, bara hela veckor. Vyn visar den från sju veckor. */
export function VeckoDiagram({
  data,
  nyckel,
  namn,
}: {
  data: Array<{ vecka: string; varde: number | null }>;
  nyckel: string;
  namn: string;
}) {
  return (
    <AdminChart
      data={data.map((d) => ({ vecka: d.vecka, [nyckel]: d.varde }))}
      xNyckel="vecka"
      hojd={200}
      serier={[{ nyckel, namn, typ: 'linje', roll: 'primar' }]}
      formateraX={kortDatum}
      formateraY={tal}
      tomText="Inga hela veckor i fönstret."
    />
  );
}
