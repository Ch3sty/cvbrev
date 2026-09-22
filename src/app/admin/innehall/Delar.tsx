/**
 * Smadelarna som Innehall-sidan ateranvander i alla fem flikarna.
 *
 * Flikraden, sokfaltet och pagineringen ar alla lankar och formular, inte
 * klientlogik. Sidan ar en server component och ska forbli det: ett filter
 * som byter URL later Next rendera om pa servern, och da slipper listan bade
 * ett klientpaket och en andra rundtur efter hydreringen.
 *
 * Tabellen ar designsystemets: bg-panel, border-kant, divide-y divide-kant,
 * px-4 py-3 per cell, tal i tabular-nums, rubrikrad i 14/500 ink-3.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export function byggUrl(
  bas: string,
  params: Record<string, string | number | undefined>
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === null) continue;
    sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `${bas}?${q}` : bas;
}

export interface FlikradProps {
  bas: string;
  aktiv: string;
  flikar: ReadonlyArray<{ nyckel: string; etikett: string }>;
  /** Valfritt antal per flik, visas efter etiketten i ink-3. */
  antal?: Record<string, number | undefined>;
}

/**
 * Flikraden.
 *
 * Aktiv flik markeras med ink-kant under, aldrig med orange: orangebudgeten
 * gar till traden i sidomenyn och den ar redan tagen. Raden scrollar i sidled
 * pa smal skarm i stallet for att radbryta.
 */
export function Flikrad({ bas, aktiv, flikar, antal }: FlikradProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <nav className="flex min-w-max gap-1 border-b border-kant" aria-label="Flikar">
        {flikar.map((f) => {
          const vald = f.nyckel === aktiv;
          const n = antal?.[f.nyckel];
          return (
            <Link
              key={f.nyckel}
              href={byggUrl(bas, { flik: f.nyckel })}
              aria-current={vald ? 'page' : undefined}
              className={[
                'flex h-11 items-center gap-2 border-b-2 px-3 text-sm transition-colors',
                vald
                  ? 'border-ink-1 font-medium text-ink-1'
                  : 'border-transparent text-ink-2 hover:text-ink-1',
              ].join(' ')}
            >
              {f.etikett}
              {typeof n === 'number' ? (
                <span className="text-meta tabular-nums text-ink-3">{n}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export interface SokfaltProps {
  bas: string;
  flik: string;
  varde: string;
  placeholder: string;
}

/**
 * Sokfaltet.
 *
 * Ett vanligt GET-formular. Submit byter URL, servern renderar om, och det
 * finns ingen debounce att fa fel. Sidan nollstalls till 1 genom att sida helt
 * enkelt utelamnas.
 */
export function Sokfalt({ bas, flik, varde, placeholder }: SokfaltProps) {
  return (
    <form action={bas} method="get" className="flex gap-2">
      <input type="hidden" name="flik" value={flik} />
      <label className="min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          name="sok"
          defaultValue={varde}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
      >
        Sök
      </button>
    </form>
  );
}

export interface PagineringProps {
  bas: string;
  flik: string;
  sok: string;
  sida: number;
  sidor: number;
  totalt: number;
}

/** Foten under en lista: vilket intervall som visas och stegen fram och bak. */
export function Paginering({ bas, flik, sok, sida, sidor, totalt }: PagineringProps) {
  if (totalt === 0) return null;

  const knapp =
    'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken';
  const slack = 'inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm text-ink-3';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kant px-4 py-3">
      <p className="text-meta tabular-nums text-ink-3">
        Sida {sida} av {sidor}, {totalt.toLocaleString('sv-SE')} rader totalt
      </p>
      <div className="flex gap-2">
        {sida > 1 ? (
          <Link href={byggUrl(bas, { flik, sok, sida: sida - 1 })} className={knapp}>
            Föregående
          </Link>
        ) : (
          <span className={slack}>Föregående</span>
        )}
        {sida < sidor ? (
          <Link href={byggUrl(bas, { flik, sok, sida: sida + 1 })} className={knapp}>
            Nästa
          </Link>
        ) : (
          <span className={slack}>Nästa</span>
        )}
      </div>
    </div>
  );
}

/**
 * Tabellramen. Breda tabeller far egen overflow-x, aldrig body-scroll.
 *
 * Tabellen far en minimibredd i pixlar och inte min-w-max. Skillnaden ar att
 * min-w-max later en enda lang cell (ett URL-kodat filnamn pa tvahundra
 * tecken) satta hela tabellens bredd, och da hamnar de sista kolumnerna
 * utanfor synfaltet aven pa en bred skarm. Med en fast minimibredd far cellen
 * bryta i stallet.
 */
export function Tabell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  hoger,
}: {
  children: ReactNode;
  hoger?: boolean;
}) {
  return (
    <th
      scope="col"
      className={[
        'border-b border-kant px-4 py-3 text-sm font-medium text-ink-3',
        hoger ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  hoger,
  tal,
  dampad,
}: {
  children: ReactNode;
  hoger?: boolean;
  tal?: boolean;
  dampad?: boolean;
}) {
  return (
    <td
      className={[
        'px-4 py-3 align-top',
        // Tal och datum far aldrig brytas mitt itu: "14 sep" pa tva rader ar
        // varre an en kolumn som tar nagra pixlar till.
        hoger ? 'text-right whitespace-nowrap' : 'text-left',
        tal ? 'tabular-nums' : '',
        dampad ? 'text-ink-3' : 'text-ink-1',
      ].join(' ')}
    >
      {children}
    </td>
  );
}

/** En liten etikett, till exempel niva eller status. Aldrig fargad yta. */
export function Chip({ children, ton }: { children: ReactNode; ton?: 'neutral' | 'varning' | 'positiv' | 'fel' }) {
  const farg =
    ton === 'varning'
      ? 'text-varning'
      : ton === 'positiv'
        ? 'text-positiv'
        : ton === 'fel'
          ? 'text-fel'
          : 'text-ink-2';
  return (
    <span className={`inline-flex items-center rounded-md border border-kant px-2 py-0.5 text-meta ${farg}`}>
      {children}
    </span>
  );
}

/**
 * Datum i svensk kort form. Tidsstampeln ar meta, aldrig brodtext.
 *
 * Inga streck (spec-admin-tydlighet 2026-09-22): ett datum som saknas ar
 * "aldrig" som standard. Anroparen skickar "okant, fore <datum>" nar
 * vardet saknas for att matningen borjade senare.
 */
export function datum(varde: string | null | undefined, saknas = 'aldrig'): string {
  if (!varde) return saknas;
  const d = new Date(varde);
  if (Number.isNaN(d.getTime())) return 'okänt datum';
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Datum med klockslag, for rader dar timmen sager nagot. */
export function datumtid(varde: string | null | undefined, saknas = 'aldrig'): string {
  if (!varde) return saknas;
  const d = new Date(varde);
  if (Number.isNaN(d.getTime())) return 'okänt datum';
  return d.toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
