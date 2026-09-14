/**
 * Anvandare, listan (docs/plan-admin.md avsnitt 4.4).
 *
 * Svarar pa fraga 3, "vad gor de?", pa individniva. Listan ar serverrenderad
 * och serverpaginerad ur vyn admin_user_rows: 50 rader per sida, filtrering
 * och sortering i databasen, aldrig hela tabellen och aldrig en Supabase-fraga
 * fran klienten.
 *
 * Personuppgifterna, e-post och namn, star bara har for att bara super_admin
 * kommer forbi layouten. Ingen CV-text och ingen brevtext visas i listan: de
 * ar radens innehall, inte dess metadata, och en lista ar fel plats for ett
 * dokument nagon skrivit om sig sjalv.
 */

import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import Filter from './Filter';
import {
  filterFranSok,
  hamtaAnvandare,
  hamtaKallor,
  lasKalla,
  sokFranFilter,
  SIDSTORLEK,
  type AnvandarFilter,
  type AnvandarRad,
  type Sortering,
} from './data';
import { kortDatum, niva, sedan, tal, visningsnamn } from './format';

export const dynamic = 'force-dynamic';

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

/** Kolumnerna planen raknar upp, i den ordningen. */
const KOLUMNER: Array<{
  etikett: string;
  sortering: Sortering | null;
  /** Tal hogerstalls, text vansterstalls. */
  tal?: boolean;
}> = [
  { etikett: 'E-post', sortering: 'email' },
  { etikett: 'Namn', sortering: null },
  { etikett: 'Nivå', sortering: null },
  { etikett: 'Källa', sortering: null },
  { etikett: 'Skapad', sortering: 'skapad' },
  { etikett: 'Senast aktiv', sortering: 'senast_aktiv' },
  { etikett: 'Brev', sortering: 'brev', tal: true },
  { etikett: 'CV', sortering: 'cv', tal: true },
  { etikett: 'Ansökningar', sortering: 'ansokningar', tal: true },
];

/**
 * Rubrikcell. Sorterbara kolumner far en chevron i ink-2, aldrig farg:
 * designsystemet sager att sorteringsriktning markeras med form, inte ton.
 */
function Rubrik({
  kolumn,
  filter,
}: {
  kolumn: (typeof KOLUMNER)[number];
  filter: AnvandarFilter;
}) {
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
        className={`inline-flex items-center gap-1 hover:text-ink-1 ${
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

function Rad({ rad, nu }: { rad: AnvandarRad; nu: number }) {
  const kalla = lasKalla(rad.acquisition_source);

  return (
    <tr className="hover:bg-insunken">
      <td className="px-4 py-3">
        <Link
          href={`/admin/anvandare/${rad.id}`}
          className="text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          {rad.email ?? 'utan e-post'}
        </Link>
      </td>
      <td className="px-4 py-3 text-ink-2">
        {visningsnamn(rad.full_name, rad.email)}
      </td>
      <td className="px-4 py-3 text-ink-2">{niva(rad)}</td>
      <td className="px-4 py-3 text-ink-3">{kalla ?? '–'}</td>
      <td className="px-4 py-3 tabular-nums text-ink-2">
        {kortDatum(rad.created_at)}
      </td>
      <td
        className="px-4 py-3 text-ink-2"
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

  let lista: Awaited<ReturnType<typeof hamtaAnvandare>>;
  let kallor: Awaited<ReturnType<typeof hamtaKallor>>;

  try {
    [lista, kallor] = await Promise.all([
      hamtaAnvandare(filter),
      hamtaKallor(),
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

  const nu = Date.now();
  const forsta = lista.total === 0 ? 0 : (lista.sida - 1) * SIDSTORLEK + 1;
  const sista = Math.min(lista.sida * SIDSTORLEK, lista.total);

  const harFritext = Boolean(filter.sok);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Användare"
        description="Alla konton med aktivitetsräknare. Klicka på en e-post för tidslinjen."
      />

      <Filter kallor={kallor.kallor} utanKalla={kallor.utanKalla} />

      <section>
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-ink-3">
            {lista.total > 0
              ? `${tal(forsta)} till ${tal(sista)} av ${tal(lista.total)}`
              : 'Inga träffar'}
          </h2>
          {kallor.utanKalla === kallor.total && kallor.total > 0 ? (
            <p className="text-meta text-ink-3">
              Känt mätfel: anskaffningskälla saknas på samtliga konton.
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
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-kant text-sm font-medium text-ink-3">
                <tr>
                  {KOLUMNER.map((k) => (
                    <Rubrik key={k.etikett} kolumn={k} filter={filter} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-kant">
                {lista.rader.map((rad) => (
                  <Rad key={rad.id} rad={rad} nu={nu} />
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
                className={LANK}
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
                className={LANK}
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
