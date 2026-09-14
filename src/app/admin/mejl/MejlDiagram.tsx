'use client';

/**
 * Mejlsidans tva diagram.
 *
 * Staplarna per mall visar levererat, oppnat och klickat som tre serier.
 * Planen beskriver dem som segment i en stapel, men AdminChart staplar inte:
 * serierna star bredvid varandra. Det ar sakligt battre anda, eftersom de tre
 * talen ar delmangder av varandra och en staplad stapel da skulle summera
 * samma mejl tre ganger.
 *
 * Oppnandegraden over tid ar en egen linje i ett eget diagram, eftersom en
 * andel och ett antal inte kan dela y-axel.
 */

import AdminChart from '@/components/admin/AdminChart';
import { antal, kortDatum, procent } from './format';

export interface MallStapel {
  mall: string;
  levererade: number;
  oppnade: number;
  klick: number;
}

export function MallDiagram({ rader }: { rader: MallStapel[] }) {
  return (
    <AdminChart
      data={rader.map((r) => ({
        mall: r.mall,
        levererade: r.levererade,
        oppnade: r.oppnade,
        klick: r.klick,
      }))}
      xNyckel="mall"
      serier={[
        { nyckel: 'levererade', namn: 'Levererade', typ: 'stapel', roll: 'primar' },
        { nyckel: 'oppnade', namn: 'Öppnade', typ: 'stapel', roll: 'sekundar' },
        { nyckel: 'klick', namn: 'Klick', typ: 'stapel', roll: 'framhavd' },
      ]}
      hojd={260}
      formateraY={(v) => antal(v)}
      tomText="Inga utskick i fönstret."
    />
  );
}

export interface GradRad {
  vecka: string;
  oppnandegrad: number | null;
}

export function OppnandegradDiagram({ rader }: { rader: GradRad[] }) {
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
      formateraX={kortDatum}
      formateraY={(v) => procent(v / 100, 0)}
      tomText="Inga levererade mejl i fönstret."
    />
  );
}
