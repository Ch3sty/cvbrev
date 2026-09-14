'use client';

/**
 * Diagrammen pa Intakter. Tre stycken, ett per sektion, enligt planens
 * avsnitt 4.2: intakt per dag, MRR per dag, och nya betalande per dag.
 *
 * Klientkomponent for att AdminChart kraver det. Sidan sjalv ar en
 * serverkomponent och skickar in fardiga rader: ingen formatering och ingen
 * aggregering sker har.
 *
 * Hojden star pa AdminChart, som reserverar ytan innan recharts laddats.
 * Darfor ar CLS noll aven om biblioteket kommer in sent.
 */

import AdminChart, { type AdminSerie } from '@/components/admin/AdminChart';

export interface DiagramRad {
  dag: string;
  [nyckel: string]: string | number | null;
}

interface Props {
  data: DiagramRad[];
  serier: AdminSerie[];
  hojd?: number;
  /** Formaterar y-varden. Ore till kronor, eller ett antal. */
  enhet?: 'ore' | 'antal';
  tomText?: string;
}

function kortDatum(varde: string | number): string {
  const d = new Date(`${String(varde)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(varde);
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(d);
}

export default function IntaktDiagram({
  data,
  serier,
  hojd = 240,
  enhet = 'ore',
  tomText,
}: Props) {
  // Y-etiketterna skrivs utan "kr" sa att de ryms i axelbredden.
  //
  // AdminChartInner sitter pa YAxis width={56} med margin.left -16, alltsa
  // omkring fyrtio pixlar text i tolv pixlars grad. QA-dumpen visade att
  // redan "600 kr" ar for bred: forsta siffran foll bort och etiketten lastes
  // som "00 kr", vilket ar varre an ingen etikett alls. Komponenten hor till
  // vag 1, far inte andras, och har ingen prop for axelbredd, sa kortningen
  // sker har.
  //
  // Enheten forsvinner inte, den flyttar: varje diagram star under en
  // sektionsrubrik som sager vad som mats, och korten ovanfor ger samma tal i
  // hela kronor. Over tusen kronor kortas till tusental, sa att axeln haller
  // sig inom bredden aven nar MRR vaxer. Se rapporten.
  const formateraY =
    enhet === 'ore'
      ? (v: number) => {
          const kr = Math.round(v / 100);
          if (Math.abs(kr) < 1000) return kr.toLocaleString('sv-SE');
          return `${(kr / 1000).toLocaleString('sv-SE', {
            maximumFractionDigits: 1,
          })} tkr`;
        }
      : (v: number) => v.toLocaleString('sv-SE');

  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      serier={serier}
      hojd={hojd}
      formateraX={kortDatum}
      formateraY={formateraY}
      tomText={tomText}
    />
  );
}
