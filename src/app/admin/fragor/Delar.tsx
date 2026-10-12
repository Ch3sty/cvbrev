/**
 * Smådelar för /admin/fragor: stapeln för antagen mot uppmätt andel rätt,
 * filterraden och sidvisningen med filtren kvar i URL:en. Server components,
 * inga klientpaket: ett filter är ett GET-formulär.
 */

import Link from 'next/link';
import { avvikelseTitel, STATUS_TEXT, type KalibreringStatus } from '@/lib/kalibrering/flaggor';
import { byggUrl } from '../innehall/Delar';

/** Länken till frågesidan. */
export function fragaHref(kind: string, id: string) {
  return `/admin/fragor/${kind}/${encodeURIComponent(id)}`;
}

const kommatal = (x: number) => x.toFixed(2).replace('.', ',');

/**
 * Antagen och uppmätt andel rätt i en 96 px stapel: uppmätt som fyllning,
 * antagen som ett streck. Talen står i title och i aria, aldrig i cellen.
 */
export function PStapel({ pPrior, p }: { pPrior: number; p: number | null }) {
  const titel = avvikelseTitel(pPrior, p);
  return (
    <span className="relative inline-block h-2 w-24 rounded-full bg-insunken align-middle" title={titel} role="img" aria-label={titel}>
      {p != null ? <span className="absolute inset-y-0 left-0 rounded-full bg-ink-2" style={{ width: `${Math.round(p * 100)}%` }} /> : null}
      <span className="absolute -top-1 h-4 w-0.5 rounded bg-ink-1" style={{ left: `calc(${Math.round(pPrior * 100)}% - 1px)` }} />
    </span>
  );
}

/** Tre små staplar: median andel rätt per nivå, talet i title. */
export function NivaStaplar({ varden }: { varden: { niva: string; p: number | null; fragor: number }[] }) {
  return (
    <span className="inline-flex items-end gap-1.5">
      {varden.map((v) => {
        const titel = v.p == null ? `${v.niva}: inga svar än` : `${v.niva}: median ${kommatal(v.p)} över ${v.fragor} frågor`;
        return (
          <span key={v.niva} className="relative inline-block h-6 w-3 overflow-hidden rounded-sm bg-insunken" title={titel} role="img" aria-label={titel}>
            {v.p != null ? <span className="absolute inset-x-0 bottom-0 bg-ink-2" style={{ height: `${Math.round(v.p * 100)}%` }} /> : null}
          </span>
        );
      })}
    </span>
  );
}

export function StatusOrd({ status }: { status: KalibreringStatus }) {
  // Flaggan är ett ord, ingen färg (copy 5.3).
  const flaggad = status === 'prior_fel' || status === 'fel_niva';
  return <span className={flaggad ? 'font-medium text-ink-1' : 'text-ink-3'}>{STATUS_TEXT[status]}</span>;
}

export interface Val {
  varde: string;
  etikett: string;
}

/** Filterraden: tre val och Visa. Ett GET-formulär, sidan nollställs. */
export function Filterrad({
  bas,
  flik,
  falt,
}: {
  bas: string;
  flik: string;
  falt: { namn: string; etikett: string; varde: string; val: Val[] }[];
}) {
  const ruta =
    'h-11 rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1';
  return (
    <form action={bas} method="get" className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="flik" value={flik} />
      {falt.map((f) => (
        <label key={f.namn} className="flex min-w-[9rem] flex-col gap-1 text-meta text-ink-3">
          {f.etikett}
          <select name={f.namn} defaultValue={f.varde} className={ruta}>
            <option value="">Alla</option>
            {f.val.map((v) => (
              <option key={v.varde} value={v.varde}>
                {v.etikett}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
      >
        Visa
      </button>
    </form>
  );
}

/** "Sida 2 av 7 · Föregående · Nästa" med filtren kvar (copy 5.3). */
export function Sidvisning({ bas, params, sida, sidor }: { bas: string; params: Record<string, string | undefined>; sida: number; sidor: number }) {
  const knapp =
    'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken';
  const slack = 'inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm text-ink-3';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kant px-4 py-3">
      <p className="text-meta tabular-nums text-ink-3">
        Sida {sida} av {sidor}
      </p>
      <div className="flex gap-2">
        {sida > 1 ? (
          <Link href={byggUrl(bas, { ...params, sida: sida - 1 })} className={knapp}>
            Föregående
          </Link>
        ) : (
          <span className={slack}>Föregående</span>
        )}
        {sida < sidor ? (
          <Link href={byggUrl(bas, { ...params, sida: sida + 1 })} className={knapp}>
            Nästa
          </Link>
        ) : (
          <span className={slack}>Nästa</span>
        )}
      </div>
    </div>
  );
}

export function sekunder(s: number | null): string {
  if (s == null) return 'inga svar än';
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return m ? `${m} min ${r} s` : `${r} s`;
}
