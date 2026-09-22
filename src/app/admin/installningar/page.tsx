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
 * Stripe-jamforelsen ligger i en egen Suspense-grans med skelett och laser
 * speglingen ur en 15-minuterscache med adminens tagg (stripe.ts). Forsta
 * malningen vantar alltsa aldrig pa Stripe, och en kall cache kostar bara
 * den gransen, inte sidan.
 *
 * Prissynken (/api/admin/pricing/sync) ar kvar och ligger langst ner. Den har
 * ingenting med Stripe att gora trots namnet: den synkar AI-modellernas
 * tokenpriser fran LiteLLM till model_pricing, alltsa vad vi betalar for
 * generering, inte vad kunden betalar oss. Ett namn som latsas vara nagot
 * annat ar varre an ett trakigt namn, sa rubriken sager vad den gor.
 *
 * Rutan "Undantagna konton" (spec-admin-tydlighet 2026-09-22) visar vilka
 * konton som aldrig raknas och regeln i klartext. Den ar skrivskyddad:
 * regeln bor i admin_users och databasfunktionen admin_undantagna_konton(),
 * och en andring gors dar.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import EmptyState from '@/components/shell/EmptyState';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import Stripejamforelse from './Stripejamforelse';
import Prissynk from './Prissynk';
import { hamtaStripeSpeglingCachad, type StripeSpegling } from './stripe';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { undantagText } from '@/lib/admin/undantag';
import {
  RETENTIONKUPONG,
  hamtaAdminAnvandare,
  hamtaCronStatus,
  hamtaPlanForvantningar,
  tillRad,
  type ForvantanRad,
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

/**
 * Stripe-speglingen, i en egen Suspense-grans.
 *
 * Laser ur 15-minuterscachen. Svarar Stripe inte far klientkomponenten felet
 * och visar det med "Forsok igen", som gar mot den ocachade rutten.
 */
async function StripeSektion({
  forvantningar,
  retentionkupong,
}: {
  forvantningar: ForvantanRad[];
  retentionkupong: string;
}) {
  let spegling: StripeSpegling | null = null;
  let fel: string | null = null;
  try {
    spegling = await hamtaStripeSpeglingCachad();
  } catch (e) {
    fel = e instanceof Error ? e.message : 'Stripe svarade inte.';
    console.error('[admin/installningar] stripe-speglingen:', fel);
  }
  return (
    <Stripejamforelse
      forvantningar={forvantningar}
      retentionkupong={retentionkupong}
      initial={spegling}
      initialFel={fel}
    />
  );
}

export default async function InstallningarSida() {
  const forvantningar = hamtaPlanForvantningar();
  const [adminer, cron, undantag] = await Promise.all([
    hamtaAdminAnvandare(),
    hamtaCronStatus(),
    hamtaUndantagCachad(),
  ]);

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
        {/* Samma minimihojd som Stripejamforelse, sa att inget flyttar sig
            nar gransen fylls. */}
        <Suspense
          fallback={
            <div className="min-h-[620px]">
              <LoadingSkeleton
                variant="list"
                count={forvantningar.length}
                label="Stripe hämtas"
              />
            </div>
          }
        >
          <StripeSektion
            forvantningar={forvantningar.map(tillRad)}
            retentionkupong={RETENTIONKUPONG}
          />
        </Suspense>
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

      <SectionCard rubrik={`Undantagna konton (${undantag.konton.length})`} naken>
        <p className="px-4 pt-4 text-sm leading-[22px] text-ink-2">
          Alla i admin_users och e-post som slutar på .test, innehåller
          jobbcoach-qa eller börjar med qa-. De räknas aldrig i adminens tal, i
          insamlingen eller i PostHog-frågorna.
        </p>
        {undantag.konton.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink-2">
            0 konton undantagna just nu. Listan läses ur databasen och cachas i
            femton minuter.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-kant border-t border-kant">
            {undantag.konton.map((k) => (
              <li
                key={k.userId}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="break-all text-kort text-ink-1">{k.email ?? k.userId}</p>
                  <p className="text-meta text-ink-3">
                    {k.stripeKund ? `Stripe-kund ${k.stripeKund}` : 'Ingen Stripe-kund'}
                  </p>
                </div>
                <p className="shrink-0 text-meta text-ink-2">
                  {k.skal === 'admin' ? 'Admin' : 'Testkonto'}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">
          {undantagText(undantag)}. Listan är skrivskyddad här. Ändringar görs i
          tabellen admin_users eller i databasfunktionen
          admin_undantagna_konton(), och syns i adminen inom femton minuter.
        </p>
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
