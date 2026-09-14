/**
 * Drift (docs/plan-admin.md avsnitt 4.7).
 *
 * Fråga 5: fungerar systemet? Fel per rutt, hängande analysjobb, kvot- och
 * betalväggsträffar, AI-kostnad, mejl i kö som misslyckats, och när cronens
 * insamling senast skrev något.
 *
 * Ett driftlarm är en rad, inte ett kort. Högst en warm per vy enligt
 * designsystemet, så det allvarligaste står överst och resten är neutrala
 * rader. Sidan sorterar larmen själv och sätter warm på det som ligger först.
 *
 * Serverkomponent, fem minuters cache. Drift är den enda adminsidan där
 * färskhet går före cache.
 */

import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import StatusRow from '@/components/shell/StatusRow';
import { hamtaDriftData, HANGANDE_MINUTER, type DriftData } from './data';

export const dynamic = 'force-dynamic';

const tal = (n: number | null | undefined) =>
  typeof n === 'number' ? n.toLocaleString('sv-SE') : 'mäts inte';

const kronor = (n: number) =>
  `${n.toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kr`;

function klockslag(iso: string | null): string {
  if (!iso) return 'aldrig';
  return new Date(iso).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * En varaktighet i minuter, skriven i den enhet som går att läsa.
 *
 * Ett jobb som hängt sedan november 2025 är 451 405 minuter gammalt, och det
 * talet säger ingenting. Över ett dygn skrivs det i dygn.
 */
function varaktighet(minuter: number): string {
  if (minuter < 90) return `${tal(minuter)} min`;
  const timmar = Math.floor(minuter / 60);
  if (timmar < 48) return `${tal(timmar)} h`;
  return `${tal(Math.floor(timmar / 24))} dygn`;
}

function sedan(iso: string | null): string {
  if (!iso) return 'aldrig';
  const minuter = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minuter < 1) return 'nyss';
  if (minuter < 60) return `för ${minuter} min sedan`;
  const timmar = Math.floor(minuter / 60);
  if (timmar < 24) return `för ${timmar} h sedan`;
  return `för ${Math.floor(timmar / 24)} dygn sedan`;
}

/** Ett larm, innan tonen är satt. Ordningen i listan är allvarlighetsgraden. */
interface Larm {
  text: string;
  allvarligt: boolean;
}

function byggLarm(d: DriftData): Larm[] {
  const larm: Larm[] = [];

  if (d.felTotalt > 0) {
    larm.push({
      text: `${tal(d.felTotalt)} fel senaste dygnet, över ${d.fel.length} ${
        d.fel.length === 1 ? 'rutt' : 'rutter'
      }`,
      allvarligt: true,
    });
  }

  if (d.hangande.length > 0) {
    const aldst = d.hangande[0];
    larm.push({
      text: `${d.hangande.length} analysjobb hänger, äldsta i ${varaktighet(
        aldst.minuter
      )}`,
      allvarligt: true,
    });
  }

  if (d.misslyckadeJobb > 0) {
    larm.push({
      text: `${tal(d.misslyckadeJobb)} analysjobb misslyckades senaste dygnet`,
      allvarligt: true,
    });
  }

  if (d.mejlKo.length > 0) {
    larm.push({
      text: `${tal(d.mejlKo.length)} mejl i kön har misslyckats minst en gång`,
      allvarligt: true,
    });
  }

  if (d.cron.timmarSedan !== null && d.cron.timmarSedan > 26) {
    larm.push({
      text: `Insamlingen har inte kört på ${tal(d.cron.timmarSedan)} timmar`,
      allvarligt: true,
    });
  }

  if (!larm.length) {
    larm.push({
      text: 'Inga öppna fel, inga hängande jobb, inget i mejlkön',
      allvarligt: false,
    });
  }

  return larm;
}

export default async function AdminDriftPage() {
  const d = await hamtaDriftData();
  const larm = byggLarm(d);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Drift"
        description="Fel, hängande jobb, kvotträffar och AI-kostnad, senaste dygnet."
      />

      <section className="space-y-2" aria-label="Driftläge">
        {larm.map((l, i) => (
          <StatusRow
            key={l.text}
            showDot
            // Högst en warm per vy: bara det allvarligaste larmet tänds.
            tone={i === 0 ? (l.allvarligt ? 'warm' : 'positive') : 'neutral'}
          >
            {l.text}
          </StatusRow>
        ))}
        <p className="px-3 text-meta text-ink-3">
          Hämtad {klockslag(d.hamtad)}. Cache fem minuter.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Fel senaste dygnet"
          varde={tal(d.felTotalt)}
          inverterad
          jamforelse="admin_error_log"
        />
        <MetricCard
          etikett="Hängande analysjobb"
          varde={tal(d.hangande.length)}
          inverterad
          jamforelse={`processing äldre än ${HANGANDE_MINUTER} min`}
        />
        <MetricCard
          etikett="Kvotträffar"
          varde={tal(d.kvottraffar)}
          jamforelse={
            d.kvotSenast ? `senast ${sedan(d.kvotSenast)}` : 'inga senaste dygnet'
          }
        />
        <MetricCard
          etikett="AI-kostnad, dygn"
          varde={kronor(d.aiKostnadTotalSek)}
          inverterad
          jamforelse="ai_usage_costs"
        />
      </section>

      <SectionCard
        rubrik="Fel per rutt"
        action={<span className="text-meta text-ink-3">senaste dygnet</span>}
        naken
      >
        {d.fel.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th className="px-4 py-3 font-medium">Rutt</th>
                  <th className="px-4 py-3 font-medium">Källa</th>
                  <th className="px-4 py-3 text-right font-medium">Antal</th>
                  <th className="px-4 py-3 font-medium">Senaste</th>
                  <th className="px-4 py-3 font-medium">Meddelande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {d.fel.map((f) => (
                  <tr key={f.rutt}>
                    <td className="px-4 py-3 text-ink-1">{f.rutt}</td>
                    <td className="px-4 py-3 text-ink-2">{f.kalla}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {tal(f.antal)}
                    </td>
                    <td className="px-4 py-3 text-meta text-ink-3">
                      {klockslag(f.senaste)}
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-3 text-ink-2">
                      {f.meddelande}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-4 text-sm text-ink-2">
            Inga fel skrivna senaste dygnet.
          </p>
        )}
      </SectionCard>

      <SectionCard
        rubrik="Hängande analysjobb"
        action={
          <span className="text-meta text-ink-3">
            processing äldre än {HANGANDE_MINUTER} min
          </span>
        }
        naken
      >
        {d.hangande.length ? (
          <ul className="divide-y divide-kant">
            {d.hangande.map((j) => (
              <li
                key={j.id}
                className="flex items-baseline justify-between gap-4 px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink-1">
                    {j.namn ?? j.id}
                  </span>
                  <span className="block text-meta text-ink-3">
                    startad {klockslag(j.startad)}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-ink-2">
                  {varaktighet(j.minuter)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-ink-2">Inga hängande jobb.</p>
        )}
      </SectionCard>

      <SectionCard rubrik="AI-kostnad per funktion" naken>
        {d.aiKostnad.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                  <th className="px-4 py-3 font-medium">Funktion</th>
                  <th className="px-4 py-3 text-right font-medium">Anrop</th>
                  <th className="px-4 py-3 text-right font-medium">Kostnad</th>
                  <th className="px-4 py-3 text-right font-medium">Senast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {d.aiKostnad.map((k) => (
                  <tr key={k.funktion}>
                    <td className="px-4 py-3 text-ink-1">{k.funktion}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {tal(k.anrop)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                      {kronor(k.sek)}
                    </td>
                    <td className="px-4 py-3 text-right text-meta text-ink-3">
                      {sedan(k.senast)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-4 text-sm text-ink-2">
            Inga AI-anrop senaste dygnet.
          </p>
        )}
        <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">
          {d.aiKostnadNot}
        </p>
      </SectionCard>

      <SectionCard rubrik="Mejl i kö som misslyckats" naken>
        {d.mejlKo.length ? (
          <ul className="divide-y divide-kant">
            {d.mejlKo.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="truncate text-sm text-ink-1">{m.typ}</span>
                  <span className="shrink-0 text-meta tabular-nums text-ink-3">
                    {tal(m.forsok)} försök · {klockslag(m.skickasEfter)}
                  </span>
                </div>
                {m.fel ? (
                  <p className="mt-1 truncate text-meta text-ink-2">{m.fel}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-ink-2">
            Inga misslyckade mejl i kön.
          </p>
        )}
      </SectionCard>

      <SectionCard rubrik="Insamling och cron" naken>
        <ul className="divide-y divide-kant">
          <li className="flex items-baseline justify-between gap-4 px-4 py-3">
            <span className="text-sm text-ink-1">Senaste insamling</span>
            <span className="text-sm tabular-nums text-ink-2">
              {klockslag(d.cron.senasteInsamling)} ({sedan(d.cron.senasteInsamling)})
            </span>
          </li>
          <li className="flex items-baseline justify-between gap-4 px-4 py-3">
            <span className="text-sm text-ink-1">Senaste dag med rad</span>
            <span className="text-sm tabular-nums text-ink-2">
              {d.cron.senasteDag ?? 'ingen'}
            </span>
          </li>
          <li className="px-4 py-3">
            <p className="text-sm text-ink-1">Schema</p>
            <p className="mt-1 text-meta text-ink-3">
              /api/cron/pricing-sync körs 00:00 och 06:00. Insamlingen ligger i
              midnattsslotten och samlar gårdagen. Båda Vercel-crons är
              upptagna, en tredje går inte att lägga till.
            </p>
          </li>
        </ul>
      </SectionCard>

      <SectionCard rubrik="Mäts inte" naken>
        <ul className="divide-y divide-kant">
          <li className="px-4 py-3">
            <p className="text-kort text-ink-1">Betalväggsträffar</p>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">
              {d.betalvaggNot}
            </p>
          </li>
          <li className="px-4 py-3">
            <p className="text-kort text-ink-1">token_revoked</p>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">
              {d.tokenRevokedNot}
            </p>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
