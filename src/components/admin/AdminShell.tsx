'use client';

/**
 * Adminskalet.
 *
 * Samma tokens och samma mönster som DashboardShell (docs/designsystem.md
 * v2), men en egen komponent: adminen är desktop, har ingen bottennav, inget
 * bottennavs-offset och ingen PWA. Marken är bg-mark, sidomeny och topprad är
 * bg-panel, innehållet står i en kolumn på max 960 px.
 *
 * Sidomenyn grupperar de nio sidorna i tre block enligt planens avsnitt 3.
 * Gruppetiketten är text-steg uppercase i ink-3, den aktiva raden bär tråden
 * (.thread-row). Tråden är skärmens enda orange inslag i skalet, så sidorna
 * har två kvar av de tre som designsystemet tillåter.
 *
 * Behörigheten kontrolleras inte här. Layouten (server component) har redan
 * gjort det, så skalet renderar alltid riktigt innehåll och returnerar aldrig
 * null i väntan på hydrering.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export interface AdminNavItem {
  /** Rubriken i menyn. */
  label: string;
  /** Rutt, alltid absolut och alltid under /admin. */
  href: string;
}

export interface AdminNavGroup {
  /** Gruppetikett i text-steg uppercase ink-3. */
  label: string;
  items: AdminNavItem[];
}

/** Sidomenyns tre block. Ändras bara tillsammans med planens avsnitt 3. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'De fem frågorna',
    items: [
      { label: 'Översikt', href: '/admin' },
      { label: 'Intäkter', href: '/admin/intakter' },
      { label: 'Trafik', href: '/admin/trafik' },
      { label: 'Användare', href: '/admin/anvandare' },
      { label: 'Funnel', href: '/admin/funnel' },
      { label: 'Mejl', href: '/admin/mejl' },
      { label: 'Drift', href: '/admin/drift' },
    ],
  },
  {
    label: 'Innehåll',
    items: [{ label: 'Innehåll', href: '/admin/innehall' }],
  },
  {
    label: 'Inställningar',
    items: [{ label: 'Inställningar', href: '/admin/installningar' }],
  },
];

/** Aktiv rad: exakt match på /admin, prefixmatch på övriga. */
export function isActiveAdminRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

export interface AdminShellProps {
  children: ReactNode;
  /**
   * Valfritt innehåll längst till höger i toppraden, till exempel en
   * periodväljare. Sidan skickar in den via egen komponent; skalet har ingen
   * åsikt om vad det är.
   */
  toolbar?: ReactNode;
}

export default function AdminShell({ children, toolbar }: AdminShellProps) {
  const pathname = usePathname();

  const aktivEtikett =
    ADMIN_NAV.flatMap((g) => g.items).find((i) => isActiveAdminRoute(pathname, i.href))
      ?.label ?? 'Admin';

  return (
    <div className="flex h-dvh overflow-hidden bg-mark">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-kant bg-panel lg:flex">
        <div className="flex h-14 items-center border-b border-kant px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
          >
            Jobbcoach
          </Link>
          <span className="ml-2 text-meta text-ink-3">admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Adminmeny">
          {ADMIN_NAV.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-steg uppercase text-ink-3">{group.label}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActiveAdminRoute(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'flex h-12 items-center rounded-lg px-3 text-sm transition-colors',
                          active
                            ? 'thread-row bg-insunken font-medium text-ink-1'
                            : 'text-ink-2 hover:bg-insunken hover:text-ink-1',
                        ].join(' ')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-kant bg-panel px-4 sm:px-8">
          <p className="truncate text-sm font-medium text-ink-1">{aktivEtikett}</p>
          {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
