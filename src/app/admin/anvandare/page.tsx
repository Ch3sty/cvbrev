/**
 * Anvandare, listan (docs/plan-admin.md avsnitt 4.4, spec-admin-tydlighet
 * 2026-09-22 punkt 9).
 *
 * Svarar pa fraga 3, "vad gor de?", pa individniva, och pa supportfragan
 * "vad har den har kunden kopt". Listan ar serverrenderad och
 * serverpaginerad ur vyn admin_user_rows: 50 rader per sida, filtrering och
 * sortering i databasen, aldrig hela tabellen och aldrig en Supabase-fraga
 * fran klienten.
 *
 * Paketet star i bestamd form (Allt-dagen, Allt-manaden), inte som nivan
 * Premium: en dagspasskund, en arskund och adminkontot ska ga att skilja at.
 * Undantagna konton syns bara i gruppen "Admin och test" och raknas aldrig i
 * sidhuvudets tal.
 *
 * Personuppgifterna, e-post och namn, star bara har for att bara super_admin
 * kommer forbi layouten. Ingen CV-text och ingen brevtext visas i listan.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import { MATSTART, tidKort } from '@/lib/admin/tomt';
import { undantagText } from '@/lib/admin/undantag';
import Filter from './Filter';
import {
  filterFranSok,
  hamtaAnvandare,
  hamtaKallor,
  hamtaOversikt,
  lasKalla,
  sokFranFilter,
  visaKalla,
  SIDSTORLEK,
  type AnvandarFilter,
  type AnvandarRad,
  type Sortering,
} from './data';
import {
  gallerTill,
  kortDatum,
  paketEtikett,
  sedan,
  tal,
  visningsnamn,
  type PaketEtikett,
} from './format';
import { hamtaPrenumerationStart } from './stripe';

export const dynamic = 'force-dynamic';

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

interface Kolumn {
  etikett: string;
  sortering: Sortering | null;
  /** Tal hogerstalls, text vansterstalls. */
  tal?: boolean;
  /** Bara nar kallkolumnen har data. */
  kalla?: boolean;
}

const KOLUMNER: Kolumn[] = [
  { etikett: 'Konto', sortering: 'email' },
  { etikett: 'Paket', sortering: null },
  { etikett: 'Gäller till', sortering: null },
  { etikett: 'Källa', sortering: null, kalla: true },
  { etikett: 'Skapat', sortering: 'skapad' },
  { etikett: 'Senast aktiv', sortering: 'senast_aktiv' },
  { etikett: 'Brev', sortering: 'brev', tal: true },
  { etikett: 'CV', sortering: 'cv', tal: true },
  { etikett: 'Ansökningar', sortering: 'ansokningar', tal: true },
];

/**
 * Rubrikcell. Sorterbara kolumner far en chevron i ink-2, aldrig farg:
 * designsystemet sager att sorteringsriktning markeras med form, inte ton.
 */
function Rubrik({ kolumn, filter }: { kolumn: Kolumn; filter: AnvandarFilter }) {
  const stall = kolumn.tal ? 'text-right' : 'text-left';

  if (!kolumn.sortering) {
    return (
      <th scope="col" className={`px-4 py-3 ${stall} font-medium`}>
        {kolumn.etikett}
      </th>
    );
  }

  const aktiv = filter.sortering === kolumn.sortering;
  // Ett klick pa aktiv kolumn vander riktningen. En ny kolumn borjar
  // fallande, eftersom det ar det man vill se forst i varje kolumn har.
  const nastaRiktning = aktiv && filter.riktning === 'desc' ? 'asc' : 'desc';
  const href = `/admin/anvandare${sokFranFilter({
    ...filter,
    sortering: kolumn.sortering,
    riktning: nastaRiktning,
    sida: 1,
  })}`;

  return (
    <th
      scope="col"
      className={`px-4 py-3 ${stall} font-medium`}
      aria-sort={
        aktiv ? (filter.riktning === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <Link
        href={href}
        scroll={false}
        className={`inline-flex min-h-11 items-center gap-1 hover:text-ink-1 ${
          aktiv ? 'text-ink-1' : ''
        }`}
      >
        {kolumn.etikett}
        <span aria-hidden="true" className="text-ink-2">
          {aktiv ? (filter.riktning === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </Link>
    </th>
  );
}

/**
 * "Löpande sedan 24 dec". Startdagen finns bara i Stripe, sa cellen hamtar
 * den i en egen Suspense-grans och skriver "lopande" under tiden.
 */
async function LopandeSedan({
  etikett,
  rad,
}: {
  etikett: PaketEtikett;
  rad: AnvandarRad;
}) {
  const starter = await hamtaPrenumerationStart();
  const start = rad.stripe_customer_id ? starter[rad.stripe_customer_id] : null;
  return <>{gallerTill(etikett, rad, start)}</>;
}

function Rad({
  rad,
  nu,
  medKalla,
}: {
  rad: AnvandarRad;
  nu: number;
  medKalla: boolean;
}) {
  const etikett = paketEtikett(rad, nu);
  const kalla = lasKalla(rad.acquisition_source);
  const namn = visningsnamn(rad.full_name, rad.email);

  return (
    <tr className="hover:bg-insunken">
      <td className="px-4 py-3">
        <Link
          href={`/admin/anvandare/${rad.id}`}
          className="text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          {rad.email ?? 'utan e-post'}
        </Link>
        {rad.full_name ? (
          <span className="mt-0.5 block text-meta text-ink-3">{namn}</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-ink-1">{etikett.namn}</td>
      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-2">
        {etikett.lopande ? (
          <Suspense fallback={gallerTill(etikett, rad)}>
            <LopandeSedan etikett={etikett} rad={rad} />
          </Suspense>
        ) : (
          gallerTill(etikett, rad)
        )}
      </td>
      {medKalla ? (
        <td className="px-4 py-3 text-ink-3">
          {kalla ??
            (rad.created_at && rad.created_at < MATSTART.attribution
              ? 'okänd'
              : 'ingen')}
        </td>
      ) : null}
      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-2">
        {kortDatum(rad.created_at)}
      </td>
      <td
        className="whitespace-nowrap px-4 py-3 text-ink-2"
        title={rad.last_activity_at ?? undefined}
      >
        {sedan(rad.last_activity_at, nu)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-ink-2">
        {tal(rad.letter_count)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-ink-2">
        {tal(rad.cv_count)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-ink-2">
        {tal(rad.application_count)}
      </td>
    </tr>
  );
}

export default async function AdminAnvandarePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = filterFranSok(sp);
  const nu = Date.now();

  let lista: Awaited<ReturnType<typeof hamtaAnvandare>>;
  let kallor: Awaited<ReturnType<typeof hamtaKallor>>;
  let oversikt: Awaited<ReturnType<typeof hamtaOversikt>>;

  try {
    [lista, kallor, oversikt] = await Promise.all([
      hamtaAnvandare(filter, nu),
      hamtaKallor(),
      hamtaOversikt(nu),
    ]);
  } catch (fel) {
    console.error('[admin/anvandare] sidan kunde inte renderas:', fel);
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader title="Användare" />
        <FlowError
          title="Listan kunde inte läsas"
          message="Vyn admin_user_rows svarade inte. Kontrollera att service role-nyckeln är satt."
        />
      </div>
    );
  }

  const forsta = lista.total === 0 ? 0 : (lista.sida - 1) * SIDSTORLEK + 1;
  const sista = Math.min(lista.sida * SIDSTORLEK, lista.total);

  const harFritext = Boolean(filter.sok);
  const medKalla = visaKalla(kallor.medKalla, kallor.total);
  const kolumner = KOLUMNER.filter((k) => !k.kalla || medKalla);

  // Sidhuvudet: "328 konton. 1 adminkonto undantagna." Totalen ar alltid
  // utan undantagna, oavsett vilken grupp som visas.
  const beskrivning = `${tal(oversikt.antal.alla)} konton. ${undantagText({
    konton: oversikt.undantagna,
  })}.`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Användare" description={beskrivning} />

      <Filter
        kallor={kallor.kallor}
        utanKalla={kallor.utanKalla}
        visaKalla={medKalla}
        antal={oversikt.antal}
      />

      <section>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-sm font-medium text-ink-3">
            {lista.total > 0
              ? `${tal(forsta)} till ${tal(sista)} av ${tal(lista.total)}`
              : 'Inga träffar'}
          </h2>
          {filter.grupp === 'undantagna' ? (
            <p className="text-meta text-ink-3">
              Adminkonton och testkonton räknas inte i någon total på adminen.
            </p>
          ) : !medKalla ? (
            <p className="text-meta text-ink-3">
              Källa visas när minst en tiondel av kontona har den. I dag{' '}
              {tal(kallor.medKalla)} av {tal(kallor.total)}, mäts från{' '}
              {tidKort(MATSTART.attribution)}.
            </p>
          ) : null}
        </div>

        {lista.rader.length === 0 ? (
          <EmptyState
            title={harFritext ? 'Ingen matchar sökningen' : 'Inga konton här'}
            description={
              harFritext
                ? 'Sök på hela eller delar av en e-postadress eller ett namn.'
                : 'Filtret utesluter alla konton. Rensa det för att se listan igen.'
            }
            secondaryAction={
              <Link href="/admin/anvandare" className={LANK}>
                Rensa filter
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-kant bg-panel">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-kant text-sm font-medium text-ink-3">
                <tr>
                  {kolumner.map((k) => (
                    <Rubrik key={k.etikett} kolumn={k} filter={filter} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((rad) => (
                  <Rad key={rad.id} rad={rad} nu={nu} medKalla={medKalla} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lista.antalSidor > 1 ? (
          <nav
            className="mt-4 flex items-center justify-between gap-4"
            aria-label="Sidnavigering"
          >
            {lista.sida > 1 ? (
              <Link
                href={`/admin/anvandare${sokFranFilter({ ...filter, sida: lista.sida - 1 })}`}
                className={`${LANK} inline-flex min-h-11 items-center`}
              >
                Föregående
              </Link>
            ) : (
              <span />
            )}

            <p className="text-meta tabular-nums text-ink-3">
              Sida {tal(lista.sida)} av {tal(lista.antalSidor)}
            </p>

            {lista.sida < lista.antalSidor ? (
              <Link
                href={`/admin/anvandare${sokFranFilter({ ...filter, sida: lista.sida + 1 })}`}
                className={`${LANK} inline-flex min-h-11 items-center`}
              >
                Nästa
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
