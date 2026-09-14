/**
 * Funnel (docs/plan-admin.md avsnitt 4.5).
 *
 * Svarar på fråga 3 på aggregatnivå: vad gör de? Tratten från besök till
 * betalt per vecka, vilka funktioner som används och vilka som inte gör det,
 * bortfallet per steg, och retentionskohorterna.
 *
 * Serverkomponent. Ingen fråga går från klienten, och ingen fråga går mot
 * PostHog i kritiska vägen: tratten står i admin_funnel_weekly som cronen
 * fyller.
 */

import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import { StegOverTid, type StegSerieRad } from './FunnelDiagram';
import type { AdminSerie } from '@/components/admin/AdminChart';
import {
  hamtaFunnelData,
  STEG_ETIKETT,
  type TrattRad,
  type VeckoTratt,
} from './data';

export const dynamic = 'force-dynamic';

const tal = (n: number | null | undefined) =>
  typeof n === 'number' ? n.toLocaleString('sv-SE') : 'saknas';

/**
 * Andel som procent.
 *
 * En andel över 1 skrivs som "fler än" och inte som "133 %". Stegen mäts med
 * olika metoder: PostHog räknar unika personer per händelse och Supabase
 * räknar konton, så ett senare steg kan mycket väl ha ett högre tal än ett
 * tidigare. "133 %" av föregående steg läses som en trattandel och är då
 * direkt felaktig.
 */
const procent = (a: number | null) => {
  if (a === null) return '';
  if (a > 1) return 'fler än föregående';
  return `${(a * 100).toFixed(a > 0 && a < 0.1 ? 1 : 0)} %`;
};

function veckoEtikett(vecka: string): string {
  const d = new Date(`${vecka}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return vecka;
  return `Veckan från ${d.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })}`;
}

function relativTid(iso: string | null): string {
  if (!iso) return 'aldrig';
  const d = new Date(iso);
  const dagar = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dagar <= 0) return 'i dag';
  if (dagar === 1) return 'i går';
  return `för ${dagar} dagar sedan`;
}

export default async function AdminFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ veckor?: string; kalla?: string }>;
}) {
  const params = await searchParams;
  const antalVeckor = Math.max(
    2,
    Math.min(Number(params.veckor) || 8, 26)
  );
  const valdKalla = params.kalla ?? 'alla';

  const data = await hamtaFunnelData(antalVeckor);

  const veckorForKalla = data.veckor.filter((v) => v.kalla === valdKalla);
  const senaste: VeckoTratt | undefined = veckorForKalla[0];

  // Linjen per steg över tid. Fyra steg räcker: nio linjer i samma ruta är
  // oläsbart, och de fyra som valts är de som faktiskt rör sig.
  const linjeSteg = [
    'pageview',
    'signup_started',
    'signup_completed',
    'forsta_dokument',
  ] as const;

  const serier: AdminSerie[] = [
    { nyckel: 'pageview', namn: STEG_ETIKETT.pageview, typ: 'linje', roll: 'sekundar' },
    {
      nyckel: 'signup_started',
      namn: STEG_ETIKETT.signup_started,
      typ: 'linje',
      roll: 'primar',
    },
    {
      nyckel: 'signup_completed',
      namn: STEG_ETIKETT.signup_completed,
      typ: 'linje',
      roll: 'framhavd',
    },
    {
      nyckel: 'forsta_dokument',
      namn: STEG_ETIKETT.forsta_dokument,
      typ: 'linje',
      roll: 'positiv',
    },
  ];

  const linjeData = [...veckorForKalla]
    .sort((a, b) => a.vecka.localeCompare(b.vecka))
    .map((v) => {
      const rad: StegSerieRad = { vecka: v.vecka };
      for (const s of linjeSteg) {
        rad[s] = v.rader.find((r) => r.steg === s)?.antal ?? null;
      }
      return rad;
    });

  // Topplistan för funktionsanvändning: de tjugo vanligaste enligt planen.
  const toppFunktioner = data.funktioner.slice(0, 20);

  const forstaAntal = senaste?.rader[0]?.antal ?? null;
  const betalt = senaste?.rader.find((r) => r.steg === 'subscription_paid')?.antal ?? null;
  const registrerade =
    senaste?.rader.find((r) => r.steg === 'signup_completed')?.antal ?? null;
  const dokument =
    senaste?.rader.find((r) => r.steg === 'forsta_dokument')?.antal ?? null;

  const helaTratten =
    forstaAntal && forstaAntal > 0 && betalt !== null
      ? betalt / forstaAntal
      : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Funnel"
        description="Vägen från besök till betalt, per vecka, plus vilka funktioner som faktiskt används."
      >
        <Periodval veckor={antalVeckor} kalla={valdKalla} kallor={data.kallor} />
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          etikett="Besök senaste veckan"
          varde={tal(forstaAntal)}
          jamforelse={senaste ? veckoEtikett(senaste.vecka).toLowerCase() : undefined}
        />
        <MetricCard etikett="Registrerade" varde={tal(registrerade)} />
        <MetricCard
          etikett="Skapade CV eller brev"
          varde={tal(dokument)}
          datakvalitet="Räknas på letters och cv_texts, inte på aktiveringskolumnerna."
        />
        <MetricCard
          etikett="Besök till betalt"
          varde={helaTratten === null ? 'saknas' : procent(helaTratten)}
          datakvalitet="paywall_shown och subscription_paid har noll rader i PostHog."
        />
      </section>

      <SectionCard
        rubrik={senaste ? veckoEtikett(senaste.vecka) : 'Tratten'}
        action={
          <span className="text-meta text-ink-3">
            {valdKalla === 'alla' ? 'alla källor' : valdKalla}
          </span>
        }
      >
        {senaste ? (
          <Trattstapel rader={senaste.rader} />
        ) : (
          <p className="text-sm text-ink-2">
            Ingen tratt registrerad för perioden. Cronen fyller
            admin_funnel_weekly i midnattsslotten.
          </p>
        )}
      </SectionCard>

      <SectionCard rubrik="Stegen över tid">
        <StegOverTid data={linjeData} serier={serier} />
      </SectionCard>

      <SectionCard rubrik="Bortfall per steg" naken>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                <th className="px-4 py-3 font-medium">Steg</th>
                <th className="px-4 py-3 text-right font-medium">Antal</th>
                <th className="px-4 py-3 text-right font-medium">Av föregående</th>
                <th className="px-4 py-3 text-right font-medium">Bortfall</th>
                <th className="px-4 py-3 font-medium">Källa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {(senaste?.rader ?? []).map((r) => (
                <tr key={r.steg}>
                  <td className="px-4 py-3 text-ink-1">{r.etikett}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                    {tal(r.antal)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                    {r.andel === null ? '' : procent(r.andel)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                    {r.bortfall === null ? '' : tal(r.bortfall)}
                  </td>
                  <td className="px-4 py-3 text-meta text-ink-3">
                    {r.kalla === 'posthog' ? 'PostHog' : 'Supabase'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        rubrik="Funktionsanvändning, senaste 30 dagarna"
        action={<span className="text-meta text-ink-3">user_activities</span>}
        naken
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                <th className="px-4 py-3 font-medium">Funktion</th>
                <th className="px-4 py-3 text-right font-medium">Händelser</th>
                <th className="px-4 py-3 text-right font-medium">Personer</th>
                <th className="px-4 py-3 text-right font-medium">Senast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {toppFunktioner.map((f) => (
                <tr key={f.typ}>
                  <td className="px-4 py-3 text-ink-1">{f.typ}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                    {tal(f.antal)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                    {tal(f.personer)}
                  </td>
                  <td className="px-4 py-3 text-right text-meta text-ink-3">
                    {relativTid(f.senast)}
                  </td>
                </tr>
              ))}
              {!toppFunktioner.length ? (
                <tr>
                  <td className="px-4 py-3 text-sm text-ink-2" colSpan={4}>
                    Ingen aktivitet registrerad de senaste 30 dagarna.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        rubrik="Används inte"
        action={
          <span className="text-meta text-ink-3">
            {data.oanvanda.length} av {data.oanvanda.length + data.funktioner.length}
          </span>
        }
      >
        <p className="mb-3 text-sm text-ink-2">
          Händelserna finns i koden men har noll rader de senaste 30 dagarna.
          Antingen används funktionen inte, eller så avfyras händelsen aldrig.
        </p>
        <ul className="flex flex-wrap gap-2">
          {data.oanvanda.map((f) => (
            <li
              key={f}
              className="rounded-md border border-kant bg-insunken px-2 py-1 text-meta text-ink-2"
            >
              {f}
            </li>
          ))}
          {!data.oanvanda.length ? (
            <li className="text-sm text-ink-2">Alla kända funktioner har använts.</li>
          ) : null}
        </ul>
      </SectionCard>

      <SectionCard rubrik="Retentionskohorter" naken>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-kant text-left text-sm font-medium text-ink-3">
                <th className="px-4 py-3 font-medium">Kohort</th>
                <th className="px-4 py-3 text-right font-medium">Storlek</th>
                {[0, 1, 2, 3, 4, 5].map((m) => (
                  <th key={m} className="px-4 py-3 text-right font-medium">
                    M{m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-kant">
              {data.kohorter.map((k) => (
                <tr key={k.kohort}>
                  <td className="px-4 py-3 text-ink-1">{k.kohort}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-1">
                    {tal(k.storlek)}
                  </td>
                  {k.aktiva.map((a, i) => (
                    <td
                      key={i}
                      className="px-4 py-3 text-right tabular-nums text-ink-2"
                    >
                      {k.storlek > 0 && a > 0
                        ? `${Math.round((a / k.storlek) * 100)} %`
                        : ''}
                    </td>
                  ))}
                </tr>
              ))}
              {!data.kohorter.length ? (
                <tr>
                  <td className="px-4 py-3 text-sm text-ink-2" colSpan={8}>
                    Inga kohorter i fönstret.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard rubrik="Datakvalitet" naken>
        <ul className="divide-y divide-kant">
          {data.datakvalitet.map((n) => (
            <li key={n.rubrik} className="px-4 py-3">
              <p className="text-kort text-ink-1">{n.rubrik}</p>
              <p className="mt-1 text-sm leading-[22px] text-ink-2">{n.text}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

/** Horisontell trattstapel. Bredden är andelen av första steget. */
function Trattstapel({ rader }: { rader: TrattRad[] }) {
  const bas = rader.find((r) => r.antal !== null)?.antal ?? 0;

  return (
    <ol className="space-y-2">
      {rader.map((r) => {
        const bredd =
          r.antal !== null && bas > 0
            ? Math.max(1.5, (r.antal / bas) * 100)
            : 0;

        return (
          <li key={r.steg}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-ink-1">{r.etikett}</span>
              <span className="shrink-0 text-meta tabular-nums text-ink-3">
                {tal(r.antal)}
                {r.andel !== null ? ` · ${procent(r.andel)}` : ''}
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-md bg-insunken">
              {r.antal !== null ? (
                <div
                  className="h-2 rounded-md bg-ink-1"
                  style={{ width: `${bredd}%` }}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Periodval och källval som länkar. Ingen klientkomponent behövs. */
function Periodval({
  veckor,
  kalla,
  kallor,
}: {
  veckor: number;
  kalla: string;
  kallor: string[];
}) {
  const alternativ = [4, 8, 13, 26];
  const lank = (v: number, k: string) =>
    `/admin/funnel?veckor=${v}&kalla=${encodeURIComponent(k)}`;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1">
        <span className="mr-1 text-meta text-ink-3">Veckor</span>
        {alternativ.map((v) => (
          <Link
            key={v}
            href={lank(v, kalla)}
            aria-current={v === veckor ? 'true' : undefined}
            className={[
              'inline-flex h-9 items-center rounded-lg border px-3 text-sm tabular-nums transition-colors',
              v === veckor
                ? 'border-kant-stark bg-insunken font-medium text-ink-1'
                : 'border-kant bg-panel text-ink-2 hover:bg-insunken',
            ].join(' ')}
          >
            {v}
          </Link>
        ))}
      </div>

      {kallor.length > 1 ? (
        <div className="flex items-center gap-1">
          <span className="mr-1 text-meta text-ink-3">Källa</span>
          {kallor.map((k) => (
            <Link
              key={k}
              href={lank(veckor, k)}
              aria-current={k === kalla ? 'true' : undefined}
              className={[
                'inline-flex h-9 items-center rounded-lg border px-3 text-sm transition-colors',
                k === kalla
                  ? 'border-kant-stark bg-insunken font-medium text-ink-1'
                  : 'border-kant bg-panel text-ink-2 hover:bg-insunken',
              ].join(' ')}
            >
              {k}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
