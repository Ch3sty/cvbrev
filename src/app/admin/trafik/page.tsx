/**
 * Trafik: fraga 2, kommer folk in? (planens avsnitt 4.3)
 *
 * Serverrenderad rakt igenom. Sidan laser admin_daily_metrics och
 * admin_gsc_daily via datalagret och ror aldrig Search Console i kritiska
 * vagen. De tre diagrammen ar klientkomponenter for att Recharts kraver det,
 * men de far sin data farfardig fran servern.
 *
 * Spec-admin-tydlighet 2026-09-22, sida 6:
 *   - Dagarna Google inte levererat ritas som en gra zon "Google ligger
 *     efter", och meningen under klickdiagrammet sager att de inte ar noll.
 *   - Korten jamfor lika manga dagar MED DATA (sju mot sju), inte
 *     kalenderdagar dar tre saknas.
 *   - Inga streck i korten.
 */

import type { Metadata } from 'next';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import SectionCard from '@/components/admin/SectionCard';
import { gscEfter } from '@/lib/admin/tomt';
import { hamtaTrafik, JAMFOR_DAGAR, PERIOD_DAGAR, TOPP_ANTAL } from './data';
import TrafikTabell from './TrafikTabell';
import { KlickDiagram, PositionsDiagram, VisningsDiagram } from './TrafikDiagram';
import { antal, forandring, position, procent } from './format';
import { efterslapFran, fyllTillIdag, idagSverige, intervall, klickText } from './berakning';

export const metadata: Metadata = {
  title: 'Trafik',
  robots: { index: false, follow: false },
};

// Layouten ar redan force-dynamic for behorighetens skull. Sidans egna data
// ar cachad i 15 minuter i unstable_cache, sa dynamiken kostar ingen fraga.
export const dynamic = 'force-dynamic';

function procentDelta(delta: number | null): string | undefined {
  return delta === null ? undefined : `${Math.abs(Math.round(delta * 100))} %`;
}

export default async function TrafikPage() {
  const data = await hamtaTrafik(30);
  const idag = idagSverige();

  // Serien fylls fram till i dag, sa att dagarna Google inte levererat far en
  // plats pa x-axeln och kan ritas som zonen "Google ligger efter".
  const serie = fyllTillIdag(data.serie, idag);
  const zonFran = efterslapFran(serie, data.senastMedData);
  const senasteKlick =
    serie.find((r) => r.dag === data.senastMedData)?.klick ?? null;

  const j = data.jamforelse;
  const kanJamfora = j.antalNu === JAMFOR_DAGAR && j.antalFore === JAMFOR_DAGAR;
  const nu = j.period;
  const fore = j.foregaende;

  const klickDelta = kanJamfora ? forandring(nu.klick, fore.klick) : null;
  const visningsDelta = kanJamfora ? forandring(nu.visningar, fore.visningar) : null;
  const ctrDelta =
    kanJamfora && nu.ctr !== null && fore.ctr !== null ? forandring(nu.ctr, fore.ctr) : null;

  // Position: hogre tal ar samre placering. MetricCard far inverterad, sa
  // ett stigande tal blir rott utan att tecknet vands.
  const positionsDelta =
    kanJamfora && nu.position !== null && fore.position !== null
      ? nu.position - fore.position
      : null;

  const jamforelse = kanJamfora
    ? `${intervall(j.granser.start, j.granser.slut)} mot ${intervall(
        j.granser.foreStart,
        j.granser.foreSlut
      )}`
    : j.antalNu
      ? `${j.antalNu + j.antalFore} dagar med data, jämförelsen kräver ${JAMFOR_DAGAR * 2}`
      : 'Google har inte levererat någon dag än';

  // Ingen visning betyder ingen CTR och ingen placering. Det star som text,
  // aldrig som streck.
  const ctrVarde = nu.ctr === null ? '0 %' : procent(nu.ctr);
  const positionVarde = nu.position === null ? 'ingen visning' : position(nu.position);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trafik"
        description={`Sökresultat från Google Search Console. Korten jämför de ${JAMFOR_DAGAR} senaste dagarna med data mot de ${JAMFOR_DAGAR} före, tabellerna ${PERIOD_DAGAR} dagar mot de ${PERIOD_DAGAR} innan.`}
      />

      {/* Fordrojningen star forst. Utan den ser de tomma dagarna langst till
          hoger i diagrammen ut som att trafiken dog i forrgar. */}
      <div className="rounded-xl border border-kant bg-insunken px-4 py-3">
        <p className="text-sm text-ink-2">
          {gscEfter(data.senastMedData, senasteKlick, idag)} Jämförelserna räknas
          bakåt därifrån, inte från i dag.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett={`Klick, ${JAMFOR_DAGAR} dagar`}
          varde={antal(nu.klick)}
          delta={klickDelta}
          deltaText={procentDelta(klickDelta)}
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett={`Visningar, ${JAMFOR_DAGAR} dagar`}
          varde={antal(nu.visningar)}
          delta={visningsDelta}
          deltaText={procentDelta(visningsDelta)}
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett="CTR"
          varde={ctrVarde}
          delta={ctrDelta}
          deltaText={procentDelta(ctrDelta)}
          jamforelse={jamforelse}
        />
        <MetricCard
          etikett="Snittposition"
          varde={positionVarde}
          delta={positionsDelta}
          inverterad
          deltaText={
            positionsDelta === null
              ? undefined
              : `${(Math.abs(Math.round(positionsDelta * 10) / 10)).toLocaleString('sv-SE', {
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
        <KlickDiagram serie={serie} efterslapFran={zonFran} />
        <p className="mt-3 text-sm leading-[22px] text-ink-2">
          {klickText(serie, data.senastMedData)}
        </p>
      </SectionCard>

      <SectionCard rubrik="Visningar per dag">
        <VisningsDiagram serie={serie} efterslapFran={zonFran} />
      </SectionCard>

      <SectionCard rubrik="Snittposition per dag">
        <PositionsDiagram serie={serie} efterslapFran={zonFran} />
        <p className="mt-3 text-meta text-ink-3">
          Skalan är vänd: uppåt betyder bättre placering.
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
