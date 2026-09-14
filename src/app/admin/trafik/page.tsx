/**
 * Trafik: fraga 2, kommer folk in? (planens avsnitt 4.3)
 *
 * Serverrenderad rakt igenom. Sidan laser admin_daily_metrics och
 * admin_gsc_daily via datalagret och ror aldrig Search Console i kritiska
 * vagen. De tre diagrammen ar klientkomponenter for att Recharts kraver det,
 * men de far sin data farfardig fran servern.
 *
 * GSC:s tvadagarsfordrojning star hogst upp, inte i en fotnot. Sidan raknar
 * sina perioder bakat fran senaste dagen med data i stallet for fran i dag,
 * annars later tva tomma dagar den senaste perioden se ut som ett ras.
 */

import type { Metadata } from 'next';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import { hamtaTrafik, GSC_FORDROJNING_DAGAR, PERIOD_DAGAR, TOPP_ANTAL } from './data';
import TrafikTabell from './TrafikTabell';
import { KlickDiagram, PositionsDiagram, VisningsDiagram } from './TrafikDiagram';
import { antal, forandring, langtDatum, position, procent } from './format';

export const metadata: Metadata = {
  title: 'Trafik',
  robots: { index: false, follow: false },
};

// Layouten ar redan force-dynamic for behorighetens skull. Sidans egna data
// ar cachad i 15 minuter i unstable_cache, sa dynamiken kostar ingen fraga.
export const dynamic = 'force-dynamic';

export default async function TrafikPage() {
  const data = await hamtaTrafik(30);

  const klickDelta = forandring(data.period.klick, data.foregaende.klick);
  const visningsDelta = forandring(data.period.visningar, data.foregaende.visningar);
  const ctrDelta =
    data.period.ctr !== null && data.foregaende.ctr !== null
      ? forandring(data.period.ctr, data.foregaende.ctr)
      : null;

  // Position: hogre tal ar samre placering. MetricCard far inverterad, sa
  // ett stigande tal blir rott utan att tecknet vands.
  const positionsDelta =
    data.period.position !== null && data.foregaende.position !== null
      ? data.period.position - data.foregaende.position
      : null;

  const jamforelse = `mot föregående ${PERIOD_DAGAR} dagar`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trafik"
        description={`Sökresultat från Google Search Console, ${PERIOD_DAGAR} dagar mot de ${PERIOD_DAGAR} innan.`}
      />

      {/* Fordrojningen star forst. Utan den ser de tva tomma dagarna langst
          till hoger i diagrammen ut som att trafiken dog i forrgar. */}
      <div className="rounded-xl border border-kant bg-insunken px-4 py-3">
        <p className="text-sm text-ink-2">
          Search Console ligger ungefär {GSC_FORDROJNING_DAGAR} dagar efter.{' '}
          {data.senastMedData ? (
            <>
              Senaste dagen med data är{' '}
              <span className="font-medium text-ink-1">
                {langtDatum(data.senastMedData)}
              </span>
              . Perioderna räknas bakåt därifrån, inte från i dag.
            </>
          ) : (
            'Det finns ingen dag med data i fönstret ännu.'
          )}{' '}
          Dagar utan svar står som luckor i diagrammen, aldrig som nollor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Klick"
          varde={antal(data.period.klick)}
          delta={klickDelta}
          deltaText={
            klickDelta === null
              ? undefined
              : `${Math.abs(Math.round(klickDelta * 100))} %`
          }
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett="Visningar"
          varde={antal(data.period.visningar)}
          delta={visningsDelta}
          deltaText={
            visningsDelta === null
              ? undefined
              : `${Math.abs(Math.round(visningsDelta * 100))} %`
          }
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett="CTR"
          varde={procent(data.period.ctr)}
          delta={ctrDelta}
          deltaText={
            ctrDelta === null
              ? undefined
              : `${Math.abs(Math.round(ctrDelta * 100))} %`
          }
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett="Snittposition"
          varde={position(data.period.position)}
          delta={positionsDelta}
          inverterad
          deltaText={
            positionsDelta === null
              ? undefined
              : `${Math.abs(Math.round(positionsDelta * 10) / 10)
                  .toLocaleString('sv-SE', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} steg`
          }
          jamforelse={jamforelse}
        />
      </div>

      {/* Tva diagram, inte ett med tva y-axlar. 8 klick och 927 visningar i
          samma ruta gor klicklinjen till en rak nolla. */}
      <SectionCard rubrik="Klick per dag">
        <KlickDiagram serie={data.serie} />
      </SectionCard>

      <SectionCard rubrik="Visningar per dag">
        <VisningsDiagram serie={data.serie} />
      </SectionCard>

      <SectionCard rubrik="Snittposition per dag">
        <PositionsDiagram serie={data.serie} />
        <p className="mt-3 text-meta text-ink-3">
          Skalan är vänd: kurvan går uppåt när placeringen blir bättre, alltså
          när positionssiffran sjunker.
        </p>
      </SectionCard>

      <SectionCard rubrik={`Sidor som tappar (${data.tappare.length})`} naken>
        <TrafikTabell
          rader={data.tappare}
          sort="page"
          visaPositionsdelta
          tomText="Ingen sida har tappat mer än tre positioner eller trettio procent av klicken."
        />
      </SectionCard>

      <SectionCard rubrik={`Toppsidor (${Math.min(data.toppsidor.length, TOPP_ANTAL)})`} naken>
        <TrafikTabell
          rader={data.toppsidor}
          sort="page"
          tomText="Inga sidor med visningar i perioden."
        />
      </SectionCard>

      <SectionCard rubrik={`Toppord (${Math.min(data.toppord.length, TOPP_ANTAL)})`} naken>
        <TrafikTabell
          rader={data.toppord}
          sort="query"
          tomText="Inga sökord med visningar i perioden."
        />
      </SectionCard>
    </div>
  );
}
