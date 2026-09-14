/**
 * Oversikt (docs/plan-admin.md avsnitt 4.1).
 *
 * Adminens forstasida svarar pa agarens fem fragor, en sektion var, i ordning:
 *
 *   1. Tjanar vi mer pengar an i gar och forra veckan, och varfor?
 *   2. Kommer folk in?
 *   3. Vad gor de nar de ar har?
 *   4. Fungerar mejlen?
 *   5. Fungerar systemet?
 *
 * Varje sektion har tre till fem stora tal med delta mot i gar och mot samma
 * veckodag forra veckan, plus en lank vidare till sin egen sida. Ett enda
 * diagram pa hela skarmen, i sektion 1.
 *
 * Serverkomponent. All data kommer ur admin_daily_metrics och nagra sma
 * cachade Supabase-aggregat, ingenting fran Stripe, GSC eller PostHog i
 * kritiska vagen. Det ar det som gor LCP under 1,5 sekunder mojligt.
 */

import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import MetricCard from '@/components/admin/MetricCard';
import FlowError from '@/components/shell/FlowError';
import { hamtaOversikt, type Tal } from '@/app/api/admin/oversikt/data';
import MrrDiagram from './MrrDiagram';

// Behorigheten i layouten ar redan force-dynamic, men talen ska ocksa vara
// farska per begaran: cachen sitter i unstable_cache, inte i sidrenderingen.
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Formatering
// ---------------------------------------------------------------------------

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

/** Ett saknat tal skrivs som ett tankstreck, aldrig som en nolla. */
const SAKNAS = '–';

function antal(v: number | null): string {
  return v === null ? SAKNAS : v.toLocaleString('sv-SE');
}

function kronor(ore: number | null): string {
  if (ore === null) return SAKNAS;
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function decimal(v: number | null, decimaler = 1): string {
  if (v === null) return SAKNAS;
  return v.toLocaleString('sv-SE', {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  });
}

function procent(v: number | null): string {
  return v === null ? SAKNAS : `${decimal(v)} %`;
}

/**
 * Deltat som text, utan tecken: MetricCard satter pilen efter talets tecken
 * och fargen efter om utfallet ar bra. Vi skickar darfor beloppet, inte
 * riktningen, och lamnar riktningen till kortet.
 */
function deltaText(v: number | null, formatera: (n: number) => string): string | undefined {
  if (v === null) return undefined;
  if (v === 0) return 'oförändrat';
  return formatera(Math.abs(v));
}

/**
 * Bygger MetricCards jamforelseprops ur ett Tal.
 *
 * Kortet har bara plats for en jamforelse, och i gar ar den agaren tittar pa
 * forst. Veckojamforelsen star som datakvalitet-rad under, vilket ar samma
 * meta-format och darmed samma tyngd.
 */
function jamforelser(
  t: Tal,
  formatera: (n: number) => string
): {
  delta?: number | null;
  deltaText?: string;
  jamforelse?: string;
  datakvalitet?: string;
} {
  const igar = deltaText(t.motIgar, formatera);
  const vecka = deltaText(t.motForraVeckan, formatera);

  // Star talet stilla at bada hallen sager tva rader samma sak, och det ar
  // brus. Da skriver vi en rad som tacker bada, sa att ogats uppmarksamhet
  // sparas till de kort dar nagot faktiskt rort sig.
  if (igar === 'oförändrat' && vecka === 'oförändrat') {
    return {
      delta: 0,
      deltaText: 'oförändrat',
      jamforelse: 'mot i går och förra veckan',
    };
  }

  return {
    delta: t.motIgar,
    deltaText: igar,
    jamforelse: igar ? 'mot i går' : undefined,
    datakvalitet: vecka
      ? `${vecka === 'oförändrat' ? 'Oförändrat' : vecka} mot samma dag förra veckan`
      : undefined,
  };
}

function datumText(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dag;
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(d);
}

/** Rutnat for de stora talen. Fyra i bredd pa desktop, tva pa mobil. */
function Tal4({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>
  );
}

// ---------------------------------------------------------------------------

export default async function AdminOversiktPage() {
  let data: Awaited<ReturnType<typeof hamtaOversikt>>;

  try {
    data = await hamtaOversikt();
  } catch (fel) {
    console.error('[admin/oversikt] sidan kunde inte renderas:', fel);
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Översikt" />
        <FlowError
          title="Översikten kunde inte läsas"
          message="Dagsmetriken svarade inte. Cronen fyller på vid midnatt, och Intäkter har en knapp för att hämta dagens rad nu."
        />
      </div>
    );
  }

  const { intakter, trafik, anvandning, mejl, drift, serie } = data;

  // GSC ligger ungefar tva dagar efter Google, sa gardagen saknas nastan
  // alltid. Sidan sager vilken dag talen galler i stallet for att lata en
  // lucka se ut som ett ras.
  const gscNot = data.senasteGscDag
    ? data.senasteGscDag === data.dag
      ? undefined
      : `Google Search Console ligger efter. Senaste dag med data: ${datumText(data.senasteGscDag)}.`
    : 'Google Search Console har ingen data i fönstret.';

  const aktiveringsNot =
    'Känt mätfel: aktiveringsmilstolpen sätts inte vid uppladdning, så talet är för lågt.';

  const mejlDelta = mejl.skickade7 - mejl.skickadeForra7;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Översikt"
        description={`Fem frågor, fem sektioner. Talen gäller ${datumText(data.dag)}.`}
      />

      {/* ------------------------------------------------- 1. Pengarna --- */}
      <SectionCard
        rubrik="1. Tjänar vi mer pengar?"
        action={
          <Link href="/admin/intakter" className={LANK}>
            Till Intäkter
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="MRR"
            varde={kronor(intakter.mrrOre.varde)}
            {...jamforelser(intakter.mrrOre, (n) => kronor(n))}
          />
          <MetricCard
            etikett="Nya betalande"
            varde={antal(intakter.nyaBetalande.varde)}
            {...jamforelser(intakter.nyaBetalande, antal)}
          />
          <MetricCard
            etikett="Aktiva prenumerationer"
            varde={antal(intakter.aktivaPren.varde)}
            {...jamforelser(intakter.aktivaPren, antal)}
          />
          <MetricCard
            etikett="Misslyckade betalningar"
            varde={antal(intakter.misslyckade.varde)}
            inverterad
            {...jamforelser(intakter.misslyckade, antal)}
          />
        </Tal4>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            etikett="Nya betalande, 7 dagar"
            varde={antal(intakter.nyaBetalande7)}
          />
          <MetricCard
            etikett="Uppsagda, 7 dagar"
            varde={antal(intakter.churnade7)}
            inverterad
          />
          <MetricCard
            etikett="I trial"
            varde={antal(intakter.trialPren.varde)}
            {...jamforelser(intakter.trialPren, antal)}
          />
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink-3">
            MRR i kronor och nya betalande per dag, 30 dagar
          </p>
          <MrrDiagram serie={serie} />
          <p className="mt-2 text-meta text-ink-3">
            Stripe har ingen historisk MRR. Dagar före 14 september 2026 är
            backfyllda med dagens värde, alltså en rak linje som inte är en
            mätning. Från och med då är serien sann.
          </p>
        </div>
      </SectionCard>

      {/* -------------------------------------------------- 2. Trafiken --- */}
      <SectionCard
        rubrik="2. Kommer folk in?"
        action={
          <Link href="/admin/trafik" className={LANK}>
            Till Trafik
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="Klick från sök"
            varde={antal(trafik.gscKlick.varde)}
            {...jamforelser(trafik.gscKlick, antal)}
          />
          <MetricCard
            etikett="Visningar"
            varde={antal(trafik.gscVisningar.varde)}
            {...jamforelser(trafik.gscVisningar, antal)}
          />
          <MetricCard
            etikett="Snittposition"
            varde={decimal(trafik.gscPosition.varde)}
            inverterad
            {...jamforelser(trafik.gscPosition, (n) => decimal(n))}
          />
          <MetricCard
            etikett="Nya konton"
            varde={antal(trafik.nyaKonton.varde)}
            {...jamforelser(trafik.nyaKonton, antal)}
          />
        </Tal4>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            etikett="Nya konton, 7 dagar"
            varde={antal(trafik.nyaKonton7)}
          />
        </div>

        {gscNot ? <p className="mt-4 text-meta text-ink-3">{gscNot}</p> : null}
      </SectionCard>

      {/* ------------------------------------------------ 3. Anvandning --- */}
      <SectionCard
        rubrik="3. Vad gör de när de är här?"
        action={
          <Link href="/admin/funnel" className={LANK}>
            Till Funnel
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="Aktiva i dag"
            varde={antal(anvandning.aktiva.varde)}
            {...jamforelser(anvandning.aktiva, antal)}
          />
          <MetricCard
            etikett="Aktiva, 7 dagar"
            varde={antal(anvandning.aktiva7)}
            jamforelse={`av ${antal(anvandning.profiler)} konton`}
          />
          <MetricCard
            etikett="Händelser, 7 dagar"
            varde={antal(anvandning.handelser7)}
          />
          <MetricCard
            etikett="Har laddat upp CV"
            varde={antal(anvandning.aktiveradeCv)}
            datakvalitet={aktiveringsNot}
          />
        </Tal4>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            etikett="Har skrivit brev"
            varde={antal(anvandning.aktiveradeBrev)}
            datakvalitet={aktiveringsNot}
          />
        </div>

        <p className="mt-4 text-meta text-ink-3">
          Aktiveringstalen bygger på{' '}
          <code className="tabular-nums">first_cv_uploaded_at</code> och{' '}
          <code className="tabular-nums">first_letter_created_at</code>, som
          sätts på 2 av {antal(anvandning.profiler)} konton trots betydligt fler
          brev och CV i databasen. Talen står kvar för att fixen ska gå att se,
          men de är inte sanna än. Användarlistan har de riktiga räknarna.
        </p>
      </SectionCard>

      {/* ------------------------------------------------------ 4. Mejl --- */}
      <SectionCard
        rubrik="4. Fungerar mejlen?"
        action={
          <Link href="/admin/mejl" className={LANK}>
            Till Mejl
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="Skickade, 7 dagar"
            varde={antal(mejl.skickade7)}
            delta={mejlDelta}
            deltaText={deltaText(mejlDelta, antal)}
            jamforelse="mot veckan innan"
          />
          <MetricCard etikett="Öppnade, 7 dagar" varde={antal(mejl.oppnade7)} />
          <MetricCard
            etikett="Öppnandegrad"
            varde={procent(mejl.oppnandegrad)}
            datakvalitet={
              mejl.oppnandegrad !== null && mejl.oppnandegrad > 100
                ? 'Över 100 procent: öppningar räknas på händelsedagen, utskicken på sin egen dag, så ett mejl från förra veckan kan öppnas i dag.'
                : undefined
            }
          />
          <MetricCard
            etikett="Skickade, veckan innan"
            varde={antal(mejl.skickadeForra7)}
          />
        </Tal4>
      </SectionCard>

      {/* ----------------------------------------------------- 5. Drift --- */}
      <SectionCard
        rubrik="5. Fungerar systemet?"
        action={
          <Link href="/admin/drift" className={LANK}>
            Till Drift
          </Link>
        }
      >
        <Tal4>
          <MetricCard
            etikett="Fel senaste dygnet"
            varde={antal(drift.fel24)}
            inverterad
          />
          <MetricCard
            etikett="Fel, 7 dagar"
            varde={antal(drift.fel7)}
            inverterad
          />
          <MetricCard
            etikett="AI-kostnad, 7 dagar"
            varde={
              drift.aiKostnad7 === null
                ? SAKNAS
                : `${decimal(drift.aiKostnad7, 2)} kr`
            }
          />
          <MetricCard
            etikett="Senaste insamling"
            varde={
              drift.timmarSedanInsamling === null
                ? SAKNAS
                : `${antal(drift.timmarSedanInsamling)} h`
            }
            jamforelse="sedan cronen skrev"
          />
        </Tal4>

        {drift.senasteFel ? (
          <div className="mt-4 rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
            <p className="text-meta text-ink-3">
              Senaste felet, {drift.senasteFel.kalla}
            </p>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">
              {drift.senasteFel.meddelande}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-meta text-ink-3">
            Inga fel loggade. Loggen fylls av insamlingen och av de nya
            adminrutterna när de fallerar, så tom betyder tyst, inte oövervakat.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
