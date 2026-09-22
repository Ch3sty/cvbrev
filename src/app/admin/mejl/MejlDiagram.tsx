'use client';

/**
 * Mejlsidans tva diagram.
 *
 * Staplarna per mall visar levererat, oppnat och klickat som tre serier.
 * Mallarna ar kategorier och inte tid, sa staplarna ligger ner: namnen far
 * plats pa 412 pixlar och diagramregelns minsta antal punkter galler inte.
 * Serierna star bredvid varandra i stallet for staplade, eftersom de tre
 * talen ar delmangder av varandra och en staplad stapel skulle summera samma
 * mejl tre ganger.
 *
 * Oppnandegraden over tid ar en egen linje i ett eget diagram, eftersom en
 * andel och ett antal inte kan dela y-axel. Den raknas per utskick och
 * passerar aldrig 100 % (berakning.ts).
 *
 * tomText kommer fran sidan: "0 sedan 24 jun, senaste skickat ...", aldrig
 * "Inga mejl i fonstret".
 */

import AdminChart from '@/components/admin/AdminChart';
import { antal, kortDatum, procent } from './format';

export interface MallStapel {
  mall: string;
  levererade: number;
  oppnade: number;
  klick: number;
}

export function MallDiagram({ rader, tomText }: { rader: MallStapel[]; tomText: string }) {
  return (
    <AdminChart
      data={rader.map((r) => ({
        mall: r.mall,
        levererade: r.levererade,
        oppnade: r.oppnade,
        klick: r.klick,
      }))}
      xNyckel="mall"
      liggande
      serier={[
        { nyckel: 'levererade', namn: 'Levererade', typ: 'stapel', roll: 'primar' },
        { nyckel: 'oppnade', namn: 'Öppnade', typ: 'stapel', roll: 'sekundar' },
        { nyckel: 'klick', namn: 'Klick', typ: 'stapel', roll: 'framhavd' },
      ]}
      hojd={Math.max(200, rader.length * 44)}
      yAxisWidth={128}
      formateraY={(v) => `${antal(v)} st`}
      tomText={tomText}
    />
  );
}

export interface GradRad {
  vecka: string;
  oppnandegrad: number | null;
}

export function OppnandegradDiagram({ rader, tomText }: { rader: GradRad[]; tomText: string }) {
  return (
    <AdminChart
      data={rader.map((r) => ({
        vecka: r.vecka,
        // Andel till procenttal: en y-axel med 0,23 pa sig gar inte att lasa.
        oppnandegrad: r.oppnandegrad === null ? null : r.oppnandegrad * 100,
      }))}
      xNyckel="vecka"
      serier={[
        { nyckel: 'oppnandegrad', namn: 'Öppnandegrad', typ: 'linje', roll: 'primar' },
      ]}
      hojd={220}
      yDoman={[0, 100]}
      formateraX={kortDatum}
      formateraY={(v) => procent(v / 100, 0)}
      tomText={tomText}
    />
  );
}
