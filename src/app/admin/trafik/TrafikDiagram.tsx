'use client';

/**
 * Trafikens tre diagram.
 *
 * AdminChart tar medvetet inte tva y-axlar (vag 1, punkt "AdminChart tar
 * medvetet inte tva y-axlar"). Klick och visningar ligger darfor i varsitt
 * diagram under varandra i stallet for i samma ruta med varsin skala. Det ar
 * ocksa sakligt battre: 8 klick och 927 visningar i samma ruta later den ena
 * linjen bli en rak nolla.
 *
 * Positionslinjen ar ett tredje diagram och far sin egen invertering: lagre
 * position ar battre, alltsa ska kurvan ga uppat nar det gar bra. Recharts
 * har ingen reverse-flagga via AdminChart, sa vardet negeras i datan och
 * etiketten vander tillbaka tecknet. Tooltipen visar alltsa 18,6 aven om
 * serien bar −18,6.
 */

import AdminChart from '@/components/admin/AdminChart';
import { antal, kortDatum, position as formateraPosition } from './format';

export interface DiagramRad {
  dag: string;
  klick: number | null;
  visningar: number | null;
  position: number | null;
}

interface Props {
  serie: DiagramRad[];
}

export function KlickDiagram({ serie }: Props) {
  const data = serie.map((r) => ({ dag: r.dag, klick: r.klick }));

  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      serier={[{ nyckel: 'klick', namn: 'Klick', typ: 'linje', roll: 'framhavd' }]}
      hojd={200}
      formateraX={kortDatum}
      formateraY={(v) => antal(v)}
      tomText="Ingen GSC-data i fönstret."
    />
  );
}

export function VisningsDiagram({ serie }: Props) {
  const data = serie.map((r) => ({ dag: r.dag, visningar: r.visningar }));

  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      serier={[
        { nyckel: 'visningar', namn: 'Visningar', typ: 'linje', roll: 'primar' },
      ]}
      hojd={200}
      formateraX={kortDatum}
      formateraY={(v) => antal(v)}
      tomText="Ingen GSC-data i fönstret."
    />
  );
}

export function PositionsDiagram({ serie }: Props) {
  // Negerat, sa att en forbattring gar uppat i bilden. Etiketten vander
  // tillbaka, annars star det −18,6 pa axeln och det betyder ingenting.
  const data = serie.map((r) => ({
    dag: r.dag,
    position: r.position === null ? null : -r.position,
  }));

  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      serier={[
        { nyckel: 'position', namn: 'Snittposition', typ: 'linje', roll: 'primar' },
      ]}
      hojd={200}
      formateraX={kortDatum}
      formateraY={(v) => formateraPosition(Math.abs(v))}
      tomText="Ingen GSC-data i fönstret."
    />
  );
}
