'use client';

/**
 * Klientgränsen för Flödes fyra recharts-diagram. Tar färdiga rader från
 * sidan och ritar dem, hämtar ingenting. Tratten ritas som rena divar i
 * sidan: en stapel vars bredd är andelen av första steget behöver ingen
 * axel, och serverrenderade divar finns i första målningen.
 */

import AdminChart, { type AdminSerie } from '@/components/admin/AdminChart';
import type { BlockeringRad, BrickaAndel, FornyelseVecka, IntaktPunkt, Paket } from './berakning';

const PAKET_SERIE: Record<Paket, AdminSerie> = {
  cv: { nyckel: 'cv', namn: 'CV-veckan', typ: 'linje', roll: 'mellan' },
  tester: { nyckel: 'tester', namn: 'Testveckan', typ: 'linje', roll: 'sekundar' },
  allt: { nyckel: 'allt', namn: 'Allt', typ: 'linje', roll: 'primar' },
};

const tal = (v: number) => Math.round(v).toLocaleString('sv-SE');
const procent = (v: number) => `${Math.round(v)} %`;
const kronor = (v: number) => `${Math.round(v).toLocaleString('sv-SE')} kr`;

/** Rader där minst ett värde finns. En serie av bara null ritas som tom, inte som ett tomt rutnät. */
function medVarden<T extends Record<string, unknown>>(rader: T[], nycklar: string[]): T[] {
  return rader.some((r) => nycklar.some((k) => typeof r[k] === 'number')) ? rader : [];
}

/** 2026-09-14 blir "14 sep". */
function kortDatum(varde: string | number): string {
  const d = new Date(`${String(varde)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(varde);
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
}

/** Liggande staplar per funktion, färgade efter paketet som säljs. */
export function BlockeringDiagram({ rader, tomText }: { rader: BlockeringRad[]; tomText: string }) {
  const data = rader.slice(0, 11).map((r) => ({
    namn: r.namn,
    personer: r.personer,
    roll: r.roll,
  }));
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
      yAxisWidth={190}
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
  const data = medVarden(veckor.map((v) => ({ ...v })), ['cv', 'tester', 'allt']) as Array<Record<string, string | number | null>>;
  return (
    <AdminChart
      data={data}
      xNyckel="vecka"
      hojd={240}
      yDoman={[0, 100]}
      serier={[PAKET_SERIE.allt, PAKET_SERIE.cv, PAKET_SERIE.tester]}
      formateraY={procent}
      tomText="Inga veckoprenumerationer ännu."
    />
  );
}

/** Staplad yta: normaliserad MRR per paket över tid. */
export function IntaktDiagram({ punkter }: { punkter: IntaktPunkt[] }) {
  const data = medVarden(punkter.map((p) => ({ ...p })), ['cv', 'tester', 'allt']) as Array<Record<string, string | number | null>>;
  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      hojd={240}
      yAxisWidth={72}
      serier={[
        { ...PAKET_SERIE.allt, typ: 'yta' },
        { ...PAKET_SERIE.cv, typ: 'yta' },
        { ...PAKET_SERIE.tester, typ: 'yta' },
      ]}
      formateraX={kortDatum}
      formateraY={kronor}
      tomText="Ingen historik ännu."
    />
  );
}
