/**
 * Små serverkomponenter som Tratts tre vyer delar: flikraden, valraderna
 * och paketrutan. Rena länkar och divar, ingen klientgräns.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { PAKET_NAMN, PAKET_YTA, PAKETEN, type Paket } from './berakning';

export type Vy = 'kopvag' | 'veckor' | 'anvandning';

export const VYER: ReadonlyArray<{ vy: Vy; namn: string; href: string }> = [
  { vy: 'kopvag', namn: 'Köpvägen', href: '/admin/tratt' },
  { vy: 'veckor', namn: 'Veckor', href: '/admin/tratt?vy=veckor' },
  { vy: 'anvandning', namn: 'Användning', href: '/admin/tratt?vy=anvandning' },
];

/**
 * Flikraden. 44 px höga länkar; den aktiva markeras med en ink-linje under
 * och ink-1-text, aldrig med orange yta.
 */
export function Flikar({ vy }: { vy: Vy }) {
  return (
    <nav aria-label="Vyer" className="flex border-b border-kant">
      {VYER.map((v) => {
        const aktiv = v.vy === vy;
        return (
          <Link
            key={v.vy}
            href={v.href}
            aria-current={aktiv ? 'page' : undefined}
            className={[
              '-mb-px inline-flex h-11 flex-1 items-center justify-center border-b-2 px-3 text-sm transition-colors sm:flex-none sm:px-4',
              aktiv
                ? 'border-ink-1 font-medium text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-1',
            ].join(' ')}
          >
            {v.namn}
          </Link>
        );
      })}
    </nav>
  );
}

/** En rad val som länkar, 44 px höga. */
export function Valrad({
  etikett,
  val,
}: {
  etikett: string;
  val: ReadonlyArray<{ namn: string; href: string; aktiv: boolean }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-meta text-ink-3">{etikett}</span>
      {val.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          aria-current={v.aktiv ? 'true' : undefined}
          className={[
            'inline-flex h-11 items-center rounded-lg border px-3 text-sm tabular-nums transition-colors',
            v.aktiv
              ? 'border-kant-stark bg-insunken font-medium text-ink-1'
              : 'border-kant bg-panel text-ink-2 hover:bg-insunken',
          ].join(' ')}
        >
          {v.namn}
        </Link>
      ))}
    </div>
  );
}

/** Paketets färgruta plus namn. Färgen står aldrig ensam. */
export function PaketNamn({ paket, namn }: { paket: Paket | null; namn?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-3 w-3 shrink-0 rounded-sm ${paket ? PAKET_YTA[paket] : 'bg-kant-stark'}`}
        aria-hidden="true"
      />
      {namn ?? (paket ? PAKET_NAMN[paket] : 'Okänt paket')}
    </span>
  );
}

/** Förklaringen till spårfärgerna. */
export function PaketForklaring() {
  return (
    <ul className="flex flex-wrap gap-4 text-meta text-ink-3">
      {PAKETEN.map((p) => (
        <li key={p}>
          <PaketNamn paket={p} />
        </li>
      ))}
    </ul>
  );
}

/** En panel med rubrik, samma form som SectionCard. */
export function Panel({ rubrik, children, action }: { rubrik: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-ink-3">{rubrik}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">{children}</div>
    </section>
  );
}
