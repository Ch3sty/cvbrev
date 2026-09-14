'use client';

/**
 * Klientgränsen för Funnel-sidans två diagram.
 *
 * AdminChart är en klientkomponent och kräver 'use client' i den som
 * renderar den. Sidan själv är en server component, så den här filen är den
 * tunna gränsen: den tar färdiga rader och ritar dem, den hämtar ingenting.
 *
 * Planen säger horisontell trattstapel per vecka och en linje per steg över
 * tid, ingen Sankey. Trattstapeln ritas som rena divar och inte i Recharts:
 * en stapel vars bredd är andelen av första steget behöver ingen axel, och
 * ett bibliotek som ritar nio horisontella staplar är mer kod utan att bli
 * tydligare.
 */

import AdminChart from '@/components/admin/AdminChart';
import type { AdminSerie } from '@/components/admin/AdminChart';

export interface StegSerieRad {
  vecka: string;
  [steg: string]: string | number | null;
}

export interface StegSerieProps {
  data: StegSerieRad[];
  serier: AdminSerie[];
}

/** Ett datum som "14 sep". */
function kortDatum(varde: string | number): string {
  const d = new Date(`${String(varde)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(varde);
  return d.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Linje per steg över tid. */
export function StegOverTid({ data, serier }: StegSerieProps) {
  return (
    <AdminChart
      data={data}
      xNyckel="vecka"
      serier={serier}
      hojd={260}
      formateraX={kortDatum}
      formateraY={(v) => v.toLocaleString('sv-SE')}
      tomText="Ingen tratt registrerad för perioden."
    />
  );
}
