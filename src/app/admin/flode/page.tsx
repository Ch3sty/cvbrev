/**
 * Flöde (D3, docs/plan-paket-och-onboarding.md avsnitt 6).
 *
 * Fem diagram som svarar på om vi kan spåra och maximera konverteringen:
 *
 *   1. Köpflödet per paket: besök till betalt som trappa, bortfall i procent.
 *   2. Var det tar stopp: feature_blocked och gray_option_tapped per funktion.
 *   3. Kom igång: andel köpare som provat varje bricka inom 24 h och 7 dygn.
 *   4. Förnyelser: kohortkurva vecka 1 till 4 per veckopaket, ur Stripe.
 *   5. Intäkt per paket över tid, normaliserad MRR som staplad yta.
 *
 * Varje sektion har en rubrik som säger vad man ska läsa ut, det viktigaste
 * talet först, diagrammet, och en datakvalitetsnot när historiken är kort.
 * Händelserna gick live 2026-09-22, så det mesta är kort ett tag.
 *
 * Serverkomponent. Sektion 1, 2, 3 och 5 kommer ur Supabase-tabeller,
 * cachade 15 minuter, i första målningen. Sektion 4 kräver Stripe och
 * ligger i en Suspense-gräns med reserverad höjd, så LCP inte väntar på den.
 */

import Link from 'next/link';
import { Suspense } from 'react';
import PageHeader from '@/components/shell/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import { BlockeringDiagram, FornyelseDiagram, IntaktDiagram, KomIgangDiagram } from './FlodeDiagram';
import {
  FONSTER,
  HANDELSER_LIVE,
  PAKETEN,
  PAKET_NAMN,
  hamtaFlodeData,
  hamtaFornyelser,
  type Fonster,
  type Paket,
  type Tratt,
} from './data';

export const dynamic = 'force-dynamic';

const SAKNAS = '–';
const tal = (v: number | null | undefined) =>
  typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString('sv-SE') : SAKNAS;
const procentAv = (a: number | null) => (a === null ? SAKNAS : `${Math.round(a * 100)} %`);
const procent = (v: number | null) => (v === null ? SAKNAS : `${Math.round(v)} %`);
const kronor = (v: number | null) => (v === null ? SAKNAS : `${Math.round(v).toLocaleString('sv-SE')} kr`);

function kortDatum(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
}

/** Bakgrundsklassen för paketets färg. Samma toner som PAKET_ROLL. */
const PAKET_YTA: Record<Paket | 'alla', string> = {
  alla: 'bg-ink-1',
  allt: 'bg-ink-1',
  cv: 'bg-ink-3',
  tester: 'bg-kant-stark',
};

export default async function AdminFlodePage({
  searchParams,
}: {
  searchParams: Promise<{ dagar?: string }>;
}) {
  const params = await searchParams;
  const valt = Number(params.dagar);
  const fonster: Fonster = (FONSTER as readonly number[]).includes(valt) ? (valt as Fonster) : 30;

  const data = await hamtaFlodeData(fonster);

  const alla = data.trattar[0];
  const kopsteget = alla.steg.find((s) => s.steg === 'purchase_step_viewed')?.antal ?? null;
  const betalt = alla.steg.find((s) => s.steg === 'subscription_paid')?.antal ?? null;
  const kopstegTillBetalt = kopsteget && kopsteget > 0 && betalt !== null ? betalt / kopsteget : null;
  const bastaPaket = [...data.trattar.slice(1)]
    .filter((t) => t.helaVagen !== null)
    .sort((a, b) => (b.helaVagen ?? 0) - (a.helaVagen ?? 0))[0];

  const historikKort = data.dagarMedHandelser < fonster;
  const historikNot = historikKort
    ? `Händelserna gick live ${kortDatum(HANDELSER_LIVE)}. ${data.dagarMedHandelser} av fönstrets ${fonster} dagar har dem; dagar före har bara besök och registreringar. ${data.samladeDagar} av ${fonster} dagar är insamlade.`
    : `${data.samladeDagar} av ${fonster} dagar är insamlade.`;

  const toppBlockering = data.blockerade[0] ?? null;
  const toppGra = data.graVal[0] ?? null;

  const senasteIntakt = [...data.intakt].reverse().find((p) => p.cv !== null || p.tester !== null || p.allt !== null) ?? null;
  const intaktSumma = senasteIntakt ? (senasteIntakt.cv ?? 0) + (senasteIntakt.tester ?? 0) + (senasteIntakt.allt ?? 0) : null;

  const koparenTotalt = data.komIgang.reduce((s, k) => s + k.kopare, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Flöde"
        description="Från besök till betalt, var fel spår tar i taket, om köparna kommer igång, och om de förnyar. Per paket."
      >
        <Periodval fonster={fonster} />
      </PageHeader>

      {/* ------------------------------------------------ 1. Köpflödet */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-3">
          Köpflödet: hur många av dem som når köpsteget betalar, och var de andra faller bort
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard
            etikett="Köpsteget till betalt"
            varde={procentAv(kopstegTillBetalt)}
            jamforelse={
              kopsteget && kopsteget > 0
                ? `${tal(betalt)} av ${tal(kopsteget)}, ${fonster} dagar`
                : 'ingen har sett köpsteget i fönstret'
            }
          />
          <MetricCard
            etikett="Betalt, hela fönstret"
            varde={tal(betalt)}
            jamforelse={`${kortDatum(data.franDag)} till ${kortDatum(data.tillDag)}`}
          />
          <MetricCard
            etikett="Bäst från spårval till betalt"
            varde={bastaPaket ? bastaPaket.namn : SAKNAS}
            jamforelse={
              bastaPaket
                ? `${procentAv(bastaPaket.helaVagen)} av ${tal(bastaPaket.steg.find((s) => s.steg === 'track_selected')?.antal)} som valde spåret`
                : 'inget paket har köp ännu'
            }
          />
        </div>

        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <Trappa tratt={alla} bredd="full" />
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-kant pt-5 md:grid-cols-3">
            {data.trattar.slice(1).map((t) => (
              <Trappa key={t.paket} tratt={t} bredd="smal" />
            ))}
          </div>
          <p className="mt-4 text-meta text-ink-3">
            Personer räknas unika per dag och summeras över fönstret, så en besökare som kommer
            tillbaka räknas igen i besöken men inte i betalt. Besök och registreringar vet inte
            vilket paket som väljs och står bara i totalen. {historikNot}
          </p>
        </div>
      </section>

      {/* -------------------------------------------- 2. Var det tar stopp */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-3">
          Var det tar stopp: vilka funktioner folk stöter i taket på, och vilket paket det säljer
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard
            etikett="Vanligaste spärren"
            varde={toppBlockering ? toppBlockering.namn : SAKNAS}
            jamforelse={
              toppBlockering
                ? `${tal(toppBlockering.personer)} personer, säljer ${PAKET_NAMN[toppBlockering.paket]}`
                : 'ingen spärr registrerad i fönstret'
            }
          />
          <MetricCard
            etikett="Vanligaste gråa valet"
            varde={toppGra ? toppGra.namn : SAKNAS}
            jamforelse={
              toppGra ? `${tal(toppGra.personer)} personer, säljer ${PAKET_NAMN[toppGra.paket]}` : 'inget grått val tryckt i fönstret'
            }
          />
        </div>
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <PaketForklaring />
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-kort text-ink-1">Betalvägg visad</p>
              <p className="mb-2 text-meta text-ink-3">feature_blocked, personer per funktion</p>
              <BlockeringDiagram rader={data.blockerade} tomText="Ingen spärr i fönstret." />
            </div>
            <div>
              <p className="mb-2 text-kort text-ink-1">Grått val tryckt</p>
              <p className="mb-2 text-meta text-ink-3">gray_option_tapped, personer per funktion</p>
              <BlockeringDiagram rader={data.graVal} tomText="Inget grått val i fönstret." />
            </div>
          </div>
          <p className="mt-4 text-meta text-ink-3">
            Färgen är paketet betalväggen föreslår för funktionen. Många staplar i samma ton
            betyder att det paketet har efterfrågan hos dem som inte har det. {historikNot}
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------- 3. Kom igång */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-3">
          Kom igång: hur stor andel av köparna som provat varje bricka, i brickornas ordning
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.komIgang.map((k) => (
            <MetricCard
              key={k.paket}
              etikett={`${k.namn}: allt provat inom 7 dygn`}
              varde={procent(k.alltInom7d)}
              jamforelse={
                k.kopare7d > 0
                  ? `av ${tal(k.kopare7d)} köpare, ${procent(k.alltInom24)} inom 24 h`
                  : k.kopare > 0
                    ? `${tal(k.kopare)} köpare, ingen är sju dygn gammal än`
                    : 'inga köpare sedan mätningen började'
              }
            />
          ))}
        </div>
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          {koparenTotalt === 0 ? (
            <p className="text-sm leading-[22px] text-ink-2">
              Inga köp sedan mätningen började. Diagrammet fylls från första köpet efter{' '}
              {kortDatum(HANDELSER_LIVE)}: kvitteringarna får en tidsstämpel från den dagen, och
              köpare före det har brickorna utan tid.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {data.komIgang.map((k) => (
                <div key={k.paket}>
                  <p className="mb-1 text-kort text-ink-1">{k.namn}</p>
                  <p className="mb-2 text-meta text-ink-3">
                    {tal(k.kopare24)} köpare minst ett dygn gamla, {tal(k.kopare7d)} minst sju
                  </p>
                  <KomIgangDiagram brickor={k.brickor} />
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-meta text-ink-3">
            Räknas på profiles.onboarding_steps mot paket_started_at, båda satta från{' '}
            {kortDatum(HANDELSER_LIVE)}. Inom 24 timmar räknas bara köpare som är minst ett
            dygn gamla, inom sju dygn bara de som är minst sju dygn.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------- 4. Förnyelser */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-3">
          Förnyelser: hur stor andel av veckoköparna som fortfarande betalar vecka 2, 3 och 4
        </h2>
        <Suspense fallback={<FornyelseSkelett />}>
          <Fornyelser fornyelserIFonstret={data.fornyelserIFonstret} fonster={fonster} />
        </Suspense>
      </section>

      {/* ------------------------------------------------ 5. Intäkt per paket */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink-3">
          Intäkt per paket: vilket paket som bär MRR, och om mixen rör sig
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <MetricCard
            etikett="MRR, normaliserad"
            varde={kronor(intaktSumma)}
            jamforelse={senasteIntakt ? kortDatum(senasteIntakt.dag) : undefined}
          />
          {PAKETEN.map((p) => (
            <MetricCard key={p} etikett={PAKET_NAMN[p]} varde={kronor(senasteIntakt?.[p] ?? null)} jamforelse="i månaden" />
          ))}
        </div>
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <IntaktDiagram punkter={data.intakt} />
          <p className="mt-4 text-meta text-ink-3">
            Aktiva prenumerationer per paket ur admin_daily_metrics gånger paketets månadspris:
            veckopriser gånger 52 delat med 12, kvartal delat med tre. Allt-dagen är ett
            engångsköp och ingår inte. Paketkolumnerna finns sedan 2026-09-21.
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * Tratten som trappa. Rena divar: serverrenderad, ingen axel, bredden är
 * andelen av trattens första steg. Bortfallet står mellan stegen, så ögat
 * ser var det brister utan att räkna själv.
 */
function Trappa({ tratt, bredd }: { tratt: Tratt; bredd: 'full' | 'smal' }) {
  const steg = tratt.steg.filter((s) => s.antal !== null);
  const yta = PAKET_YTA[tratt.paket];

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-kort text-ink-1">{tratt.namn}</p>
        <p className="text-meta tabular-nums text-ink-3">
          {tratt.helaVagen === null ? '' : `${procentAv(tratt.helaVagen)} hela vägen`}
        </p>
      </div>
      <ol className="space-y-1">
        {steg.map((s, i) => (
          <li key={s.steg}>
            {i > 0 && s.andel !== null ? (
              <p className="pb-1 pl-1 text-meta tabular-nums text-ink-3">
                {s.andel >= 1 ? 'fler än föregående' : `−${Math.round((1 - s.andel) * 100)} % bortfall`}
              </p>
            ) : null}
            <div className={bredd === 'full' ? 'grid grid-cols-[120px_1fr_auto] items-center gap-3' : 'grid grid-cols-[1fr_auto] items-center gap-3'}>
              {bredd === 'full' ? <span className="truncate text-sm text-ink-1">{s.namn}</span> : null}
              <div className={bredd === 'full' ? 'h-6 rounded-md bg-insunken' : 'h-5 rounded-md bg-insunken'}>
                <div
                  className={`h-full rounded-md ${yta}`}
                  style={{ width: `${s.bredd}%` }}
                  role="img"
                  aria-label={`${s.namn}: ${tal(s.antal)}`}
                />
              </div>
              <span className="shrink-0 text-sm tabular-nums text-ink-1">
                {bredd === 'smal' ? <span className="mr-2 text-meta text-ink-3">{s.namn}</span> : null}
                {tal(s.antal)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Förklaringen till paketfärgerna. Text bredvid varje ruta, aldrig färg ensam. */
function PaketForklaring() {
  return (
    <ul className="flex flex-wrap gap-4 text-meta text-ink-3">
      {PAKETEN.map((p) => (
        <li key={p} className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-sm ${PAKET_YTA[p]}`} aria-hidden="true" />
          {PAKET_NAMN[p]}
        </li>
      ))}
    </ul>
  );
}

/** Reserverad höjd medan Stripe svarar. Står stilla, pulserar inte. */
function FornyelseSkelett() {
  return (
    <div className="space-y-3" aria-busy="true" role="status" aria-label="Hämtar förnyelser">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PAKETEN.map((p) => (
          <div key={p} className="h-[104px] rounded-xl border border-kant bg-panel p-4">
            <div className="h-5 w-24 rounded bg-insunken" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <div className="h-[240px] rounded-lg bg-insunken" />
        <div className="mt-4 h-4 w-3/4 rounded bg-insunken" />
      </div>
    </div>
  );
}

async function Fornyelser({
  fornyelserIFonstret,
  fonster,
}: {
  fornyelserIFonstret: Record<Paket, number>;
  fonster: Fonster;
}) {
  const f = await hamtaFornyelser();
  const summaFornyelser = PAKETEN.reduce((s, p) => s + fornyelserIFonstret[p], 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PAKETEN.map((p) => (
          <MetricCard
            key={p}
            etikett={`${PAKET_NAMN[p]}: vecka 1 till 2`}
            varde={procent(f.veckaTva[p])}
            jamforelse={f.kohort[p] > 0 ? `av ${tal(f.kohort[p])} som är minst en vecka gamla` : 'ingen är en vecka gammal än'}
          />
        ))}
      </div>
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        {f.tillganglig ? (
          <FornyelseDiagram veckor={f.veckor} />
        ) : (
          <p className="text-sm leading-[22px] text-ink-2">
            Stripe svarade inte{f.fel ? `: ${f.fel}` : '.'} Förnyelserna går inte att räkna utan Stripe.
          </p>
        )}
        <p className="mt-4 text-meta text-ink-3">
          Kohorten är veckoprenumerationer skapade de senaste hundra dagarna, ur Stripe. Vecka n
          betyder minst n betalda fakturor, räknat bara på prenumerationer som är gamla nog att ha
          nått dit. Vecka 1 är alltid 100 procent. renewal_succeeded i PostHog: {tal(summaFornyelser)}{' '}
          förnyelser de senaste {fonster} dagarna, händelsen är ny 2026-09-22.
        </p>
      </div>
    </div>
  );
}

/** Fönsterval som länkar. Ingen klientkomponent behövs. */
function Periodval({ fonster }: { fonster: Fonster }) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-meta text-ink-3">Dagar</span>
      {FONSTER.map((d) => (
        <Link
          key={d}
          href={`/admin/flode?dagar=${d}`}
          aria-current={d === fonster ? 'true' : undefined}
          className={[
            'inline-flex h-9 items-center rounded-lg border px-3 text-sm tabular-nums transition-colors',
            d === fonster
              ? 'border-kant-stark bg-insunken font-medium text-ink-1'
              : 'border-kant bg-panel text-ink-2 hover:bg-insunken',
          ].join(' ')}
        >
          {d}
        </Link>
      ))}
    </div>
  );
}
