/**
 * /admin/installningar (docs/plan-admin.md avsnitt 4.9).
 *
 * Fyra block: priser och planer mot Stripe-speglingen, kupongoversikten,
 * cron-status och adminanvandarna.
 *
 * Sidan skriver aldrig till Stripe. Den laser, jamfor och pekar ut vad som
 * skiljer sig, och rattningen gors av agaren i Stripes egen instrumentpanel.
 * Rutten /api/admin/installningar/stripe har darfor ingen POST och far aldrig
 * fa en.
 *
 * Prisstegen ur PLANS renderas pa servern och star pa skarmen direkt.
 * Stripe-jamforelsen hamtas efterat av en klientkomponent, eftersom ett
 * Stripe-anrop i den kritiska vagen gor LCP under 1,5 sekunder omojligt.
 *
 * Prissynken (/api/admin/pricing/sync) ar kvar och ligger langst ner. Den har
 * ingenting med Stripe att gora trots namnet: den synkar AI-modellernas
 * tokenpriser fran LiteLLM till model_pricing, alltsa vad vi betalar for
 * generering, inte vad kunden betalar oss. Ett namn som latsas vara nagot
 * annat ar varre an ett trakigt namn, sa rubriken sager vad den gor.
 */

import type { Metadata } from 'next';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import EmptyState from '@/components/shell/EmptyState';
import Stripejamforelse, { tillRad } from './Stripejamforelse';
import Prissynk from './Prissynk';
import {
  RETENTIONKUPONG,
  hamtaAdminAnvandare,
  hamtaCronStatus,
  hamtaPlanForvantningar,
} from './data';

export const metadata: Metadata = { title: 'Inställningar' };

// Rollerna och cronens spar far aldrig ligga kvar fran ett bygge.
export const dynamic = 'force-dynamic';

function datumtid(varde: string | null): string {
  if (!varde) return 'aldrig';
  const d = new Date(varde);
  if (Number.isNaN(d.getTime())) return 'okänt';
  return d.toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function InstallningarSida() {
  const forvantningar = hamtaPlanForvantningar();
  const [adminer, cron] = await Promise.all([hamtaAdminAnvandare(), hamtaCronStatus()]);

  const saknadeEnv = forvantningar.filter((f) => !f.prisId).length;
  const varnandeDelsteg = cron.delsteg.filter((d) => d.ton !== 'positiv').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inställningar"
        description="Priser, kuponger, cronens spår och vilka som släpps in i adminen."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Produktsteg"
          varde={forvantningar.length}
          jamforelse={saknadeEnv ? `${saknadeEnv} saknar price-id` : 'alla har price-id'}
        />
        <MetricCard
          etikett="Dagsrader"
          varde={cron.dagsrader}
          jamforelse="i admin_daily_metrics"
        />
        <MetricCard
          etikett="Senaste skrivning"
          varde={cron.timmarSedan === null ? 'aldrig' : `${cron.timmarSedan} h`}
          jamforelse={cron.timmarSedan === null ? '' : 'sedan cronen rörde tabellen'}
          delta={cron.timmarSedan === null ? undefined : cron.timmarSedan > 26 ? 1 : -1}
          deltaText={cron.timmarSedan === null ? undefined : cron.timmarSedan > 26 ? 'sent' : 'i tid'}
          inverterad
        />
        <MetricCard
          etikett="Adminanvändare"
          varde={adminer.length}
          jamforelse={`${adminer.filter((a) => a.roll === 'super_admin').length} super_admin`}
        />
      </div>

      <SectionCard rubrik="Priser och planer">
        <Stripejamforelse
          forvantningar={forvantningar.map(tillRad)}
          retentionkupong={RETENTIONKUPONG}
        />
      </SectionCard>

      <SectionCard
        rubrik={
          varnandeDelsteg
            ? `Cronens spår, ${varnandeDelsteg} delsteg med luckor`
            : 'Cronens spår'
        }
      >
        <p className="text-sm text-ink-2">
          Det finns ingen körningslogg för cronen, och en tredje post i vercel.json
          deployar men körs aldrig. Statusen nedan är därför härledd ur de spår
          insamlingen faktiskt lämnar: täckningen per kolumn i admin_daily_metrics över
          fjorton dagar. Ett delsteg som slutat svara skriver null, och då sjunker
          täckningen.
        </p>

        <ul className="mt-4 divide-y divide-kant rounded-xl border border-kant">
          {cron.delsteg.map((d) => (
            <li key={d.namn} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="text-kort text-ink-1">{d.namn}</p>
                <p className="text-meta text-ink-3">{d.spar}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm tabular-nums ${
                    d.ton === 'positiv'
                      ? 'text-positiv'
                      : d.ton === 'varning'
                        ? 'text-varning'
                        : 'text-ink-3'
                  }`}
                >
                  {d.taeckning14} av 14 dagar
                </p>
                <p className="text-meta tabular-nums text-ink-3">
                  senast {d.senasteDag ?? 'aldrig'}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1">
          {cron.slottar.map((s) => (
            <p key={s.schema} className="text-meta text-ink-3">
              <span className="tabular-nums">{s.schema}</span> {s.beskrivning}
            </p>
          ))}
          <p className="text-meta text-ink-3">
            Senaste uppdaterad-stämpel: {datumtid(cron.senasteKorning)}. Google Search
            Console ligger ungefär två dagar efter och har luckor, så tolv av fjorton är
            normalt där.
          </p>
        </div>
      </SectionCard>

      <SectionCard rubrik="Fel i admin_error_log, senaste tio" naken>
        {cron.fel.length === 0 ? (
          <EmptyState
            bare
            title="Inga fel loggade"
            description="Insamlingens delsteg skriver hit när de fallerar. Tomt är rätt svar."
          />
        ) : (
          <ul className="divide-y divide-kant">
            {cron.fel.map((f) => (
              <li key={f.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-kort text-ink-1">
                    {f.kalla}
                    {f.rutt ? `: ${f.rutt}` : ''}
                  </p>
                  <p className="text-meta tabular-nums text-ink-3">
                    {datumtid(f.tidpunkt)}
                    {f.antal > 1 ? ` · ${f.antal} gånger` : ''}
                  </p>
                </div>
                <p className="mt-0.5 text-meta text-fel">{f.meddelande}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard rubrik="Adminanvändare" naken>
        {adminer.length === 0 ? (
          <EmptyState
            bare
            title="Inga adminanvändare"
            description="Ingen rad i admin_users betyder att ingen kommer in. Lägg till raden i databasen."
          />
        ) : (
          <ul className="divide-y divide-kant">
            {adminer.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-kort text-ink-1">{a.namn ?? a.epost ?? a.id}</p>
                  <p className="text-meta text-ink-3">
                    {a.epost ?? 'E-post saknas'} · {a.roll}
                  </p>
                </div>
                <p className="text-meta tabular-nums text-ink-3">
                  senast inloggad {datumtid(a.senastInloggad)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard rubrik="Modellpriser från LiteLLM">
        <p className="text-sm text-ink-2">
          Synkar AI-modellernas tokenpriser till model_pricing, alltså vad
          genereringen kostar oss. Den har ingenting med Stripe eller kundens pris att
          göra, trots att rutten heter pricing/sync. Körs annars av cronen i
          midnattsslotten.
        </p>
        <div className="mt-4">
          <Prissynk />
        </div>
      </SectionCard>
    </div>
  );
}
