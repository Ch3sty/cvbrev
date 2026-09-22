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
import { datumKort } from '@/lib/admin/tomt';

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
  /** Forsta dagen som ar en matning. Dagarna fore blir en gra zon. */
  matstart?: string;
  matstartText?: string;
  /** Meningen i stallet for diagrammet nar dagarna med data ar for fa. */
  faPunkterText?: string;
}

function kortDatum(varde: string | number): string {
  return datumKort(String(varde));
}

export default function IntaktDiagram({
  data,
  serier,
  hojd = 240,
  enhet = 'ore',
  tomText,
  matstart,
  matstartText,
  faPunkterText,
}: Props) {
  // Kronorna star ater i y-etiketten. Tidigare foll de bort: AdminChartInner
  // hade margin.left -16 som drog in axeln under plotytan och klippte "600 kr"
  // till "00 kr". Vag 4 tog bort den marginalen och gav AdminChart en
  // yAxisWidth, sa kortningen behovs inte langre.
  //
  // Over tusen kronor skrivs fortfarande i tusental. Det handlar inte om
  // bredd utan om lasbarhet: "12 tkr" gar snabbare att lasa an "12 000 kr" pa
  // en axel man skummar.
  const formateraY =
    enhet === 'ore'
      ? (v: number) => {
          const kr = Math.round(v / 100);
          if (Math.abs(kr) < 1000) return `${kr.toLocaleString('sv-SE')} kr`;
          return `${(kr / 1000).toLocaleString('sv-SE', {
            maximumFractionDigits: 1,
          })} tkr`;
        }
      : (v: number) => `${v.toLocaleString('sv-SE')} st`;

  return (
    <AdminChart
      data={data}
      xNyckel="dag"
      serier={serier}
      hojd={hojd}
      formateraX={kortDatum}
      formateraY={formateraY}
      // Kronetiketter behover mer an standardbredden 56.
      yAxisWidth={enhet === 'ore' ? 72 : 56}
      tomText={tomText}
      matstart={matstart}
      matstartText={matstartText}
      faPunkterText={faPunkterText}
    />
  );
}
