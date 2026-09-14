'use client';

/**
 * Oversiktens enda diagram: 30 dagar MRR och nya betalande.
 *
 * Planen bad om MRR som linje med nya betalande som staplar bakom, i samma
 * ruta. Det gar inte att lasa har och vi gor det darfor inte. MRR ar 596
 * kronor och nya betalande ar noll eller ett; i samma skala blir staplarna en
 * osynlig rad pixlar langs nollinjen. AdminChart tar medvetet inte tva
 * y-axlar, och de tva alternativen planen erbjuder ar att indexera bada mot
 * samma bas eller att lagga staplarna som ett eget diagram under. Vi tar det
 * andra: en indexering hade dolt att MRR-serien ar platt, vilket ar precis det
 * ogat behover se.
 *
 * Tva diagram, samma x-axel, samma 30 dagar, staplarna i en lagre ruta direkt
 * under linjen. Ogat laser dem som ett par, och bada behaller sin egen skala.
 *
 * Diagrammen ar orange-fria. Skalets trad har redan tagit ett av skarmens tre
 * tillatna orange inslag, och pa en skarm med fem sektioner finns ingen enskild
 * serie som fortjanar att vara den framhavda.
 */

import AdminChart from '@/components/admin/AdminChart';
import type { SeriePunkt } from '@/app/api/admin/oversikt/data';

export interface MrrDiagramProps {
  serie: SeriePunkt[];
}

/** 2026-09-14 blir "14 sep". Kort etikett, 30 stycken ska rymmas. */
function formateraDag(varde: string | number): string {
  const text = String(varde);
  const d = new Date(`${text}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return text;
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(d);
}

/**
 * Y-axeln for MRR, i kronor.
 *
 * Kronorna klipptes tidigare bort: AdminChartInner drog in ritytan 16 px med
 * en negativ margin.left, sa "600 kr" lastes som "00 kr". Vag 4 tog bort den
 * marginalen och lade yAxisWidth pa AdminChart, alltsa far enheten sta kvar
 * dar den hor hemma.
 */
function formateraKronor(varde: number): string {
  return `${Math.round(varde).toLocaleString('sv-SE')} kr`;
}

/** Rena tal, utan enhet. Staplarna raknar personer. */
function formateraTal(varde: number): string {
  return Math.round(varde).toLocaleString('sv-SE');
}

/**
 * Samma sak for staplarna, men med en extra regel: nar hela serien ar noll
 * eller ett satter Recharts brakdelsticks, och tva rader i rad sager da "1".
 * Vi skriver ut bara heltalen och lamnar de ovriga tomma.
 */
function formateraHeltal(varde: number): string {
  return Number.isInteger(varde) ? formateraTal(varde) : '';
}

export default function MrrDiagram({ serie }: MrrDiagramProps) {
  // AdminChart.data ar Record<string, string | number | null>[]. En namngiven
  // interface har ingen indexsignatur och gar darfor inte att skicka rakt in.
  // Vi breddar har i stallet for att rora vag 1-komponenten.
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
        tomText="Ingen historik ännu."
      />

      <AdminChart
        data={rader}
        xNyckel="dag"
        hojd={120}
        serier={[
          {
            nyckel: 'nyaBetalande',
            namn: 'Nya betalande',
            typ: 'stapel',
            // Ink-1, inte sekundar: kant-stark ar en harlinjeton och en stapel
            // i den tonen syns knappt mot panelen. Rutorna ar skilda och har
            // var sin skala, sa samma farg i bada forvirrar inte.
            roll: 'primar',
          },
        ]}
        formateraX={formateraDag}
        formateraY={formateraHeltal}
        tomText="Inga nya betalande i perioden."
      />
    </div>
  );
}
