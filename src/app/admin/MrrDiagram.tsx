'use client';

/**
 * Oversiktens enda diagram: 30 dagar MRR och nya betalande.
 *
 * Tva diagram, samma x-axel, staplarna i en lagre ruta direkt under linjen.
 * MRR ar hundratals kronor och nya betalande noll eller ett; i samma skala
 * blir staplarna en osynlig rad pixlar, och AdminChart tar medvetet inte tva
 * y-axlar.
 *
 * Stripe har ingen historisk MRR. Dagarna fore MATSTART.mrr ar backfyllda
 * med ett och samma varde och ritas darfor inte, de blir en gra zon
 * (diagramregeln, spec-admin-tydlighet 2026-09-22). Samma konstant som
 * Intakter, sa sidorna aldrig sager olika datum om samma serie.
 *
 * Orange-fria: ingen enskild serie pa Oversikt fortjanar att vara den
 * framhavda.
 */

import AdminChart from '@/components/admin/AdminChart';
import type { SeriePunkt } from '@/app/api/admin/oversikt/data';
import { MATSTART, datumKort } from '@/lib/admin/tomt';

export interface MrrDiagramProps {
  serie: SeriePunkt[];
}

function formateraDag(varde: string | number): string {
  return datumKort(String(varde));
}

function formateraKronor(varde: number): string {
  return `${Math.round(varde).toLocaleString('sv-SE')} kr`;
}

/**
 * Staplarna raknar personer. Nar serien ar noll eller ett satter Recharts
 * brakdelsticks; bara heltalen skrivs ut.
 */
function formateraHeltal(varde: number): string {
  return Number.isInteger(varde) ? `${Math.round(varde).toLocaleString('sv-SE')} st` : '';
}

export default function MrrDiagram({ serie }: MrrDiagramProps) {
  const rader = serie.map((p) => ({ ...p }) as Record<string, string | number | null>);

  return (
    <div className="space-y-2">
      <AdminChart
        data={rader}
        xNyckel="dag"
        hojd={200}
        serier={[{ nyckel: 'mrr', namn: 'MRR', typ: 'linje', roll: 'primar' }]}
        formateraX={formateraDag}
        formateraY={formateraKronor}
        yAxisWidth={72}
        matstart={MATSTART.mrr}
        matstartText={`mäts från ${datumKort(MATSTART.mrr)}`}
        tomText="Ingen MRR sedan mätstart."
      />

      <AdminChart
        data={rader}
        xNyckel="dag"
        hojd={120}
        serier={[{ nyckel: 'nyaBetalande', namn: 'Nya betalande', typ: 'stapel', roll: 'primar' }]}
        formateraX={formateraDag}
        formateraY={formateraHeltal}
        yAxisWidth={56}
        tomText="0 nya betalande i perioden."
      />
    </div>
  );
}
