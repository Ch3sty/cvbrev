'use client';

/**
 * Adminskalet.
 *
 * Samma tokens och samma mönster som DashboardShell (docs/designsystem.md
 * v2), men en egen komponent: adminen har ingen bottennav, inget
 * bottennavs-offset och ingen PWA. Marken är bg-mark, sidomeny och topprad är
 * bg-panel, innehållet står i en kolumn på max 960 px.
 *
 * Adminen antogs länge vara desktop, och det gjorde den till en
 * återvändsgränd i telefonen: sidomenyn låg bakom lg, och länken tillbaka
 * till appen låg i just den sidomenyn. Under lg finns därför en hamburgare i
 * toppraden som öppnar samma meny som ett ark, och "Till appen" står i
 * toppraden på alla bredder. Båda är 44 px träffytor, och arket ligger
 * utanför dokumentflödet, så ingenting flyttar sig när det öppnas.
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
import { useEffect, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { IkonHem } from '@/components/illustrations/Ikoner';

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

/**
 * Menyinnehållet. Samma träd på desktop och i mobilarket, så en ny sida
 * aldrig kan råka finnas i det ena och inte i det andra.
 *
 * onNavigera stänger arket på mobil. På desktop skickas ingenting in.
 */
function AdminMeny({
  pathname,
  onNavigera,
}: {
  pathname: string | null;
  onNavigera?: () => void;
}) {
  return (
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
                    onClick={onNavigera}
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
  );
}

/** Menyns huvud: namnet och länken tillbaka till appen. */
function AdminMenyhuvud({ onNavigera }: { onNavigera?: () => void }) {
  return (
    <div className="flex h-14 items-center border-b border-kant px-4">
      <Link
        href="/dashboard"
        onClick={onNavigera}
        className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
      >
        Jobbcoach
      </Link>
      <span className="ml-2 text-meta text-ink-3">admin</span>
    </div>
  );
}

export default function AdminShell({ children, toolbar }: AdminShellProps) {
  const pathname = usePathname();
  const [menyOppen, setMenyOppen] = useState(false);

  const aktivEtikett =
    ADMIN_NAV.flatMap((g) => g.items).find((i) => isActiveAdminRoute(pathname, i.href))
      ?.label ?? 'Admin';

  // Escape stänger, som alla andra lager i appen.
  useEffect(() => {
    if (!menyOppen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenyOppen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menyOppen]);

  // Ett sidbyte stänger arket. Utan det ligger menyn kvar över den nya sidan
  // när någon backar i webbläsaren.
  useEffect(() => {
    setMenyOppen(false);
  }, [pathname]);

  return (
    <div className="flex h-dvh overflow-hidden bg-mark">
      {/* Sidomeny, desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-kant bg-panel lg:flex">
        <AdminMenyhuvud />
        <AdminMeny pathname={pathname} />
      </aside>

      {/* Sidomeny, mobil. Samma ark-mönster som DashboardShell: överlägg med
          klickbar mark, panelen glider in från vänster. Ligger utanför
          dokumentflödet, så den kostar noll i CLS. */}
      {menyOppen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Stäng meny"
            onClick={() => setMenyOppen(false)}
            className="absolute inset-0 bg-ink-1/40 motion-safe:animate-[fadeInPlace_200ms_ease-out]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Adminmeny"
            className="relative flex h-full w-[min(100%,320px)] flex-col border-r border-kant bg-panel motion-safe:animate-[sidebarIn_240ms_ease-out]"
          >
            <AdminMenyhuvud onNavigera={() => setMenyOppen(false)} />
            <AdminMeny pathname={pathname} onNavigera={() => setMenyOppen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-kant bg-panel px-2 sm:px-4 lg:px-8">
          {/* Hamburgaren, bara under lg. 44 px träffyta. */}
          <button
            type="button"
            onClick={() => setMenyOppen(true)}
            aria-label="Öppna meny"
            aria-expanded={menyOppen}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken lg:hidden"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <p className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-ink-1 lg:px-0">
            {aktivEtikett}
          </p>

          {toolbar ? <div className="shrink-0">{toolbar}</div> : null}

          {/* Vägen tillbaka till appen, på alla bredder. Fanns tidigare bara
              i sidomenyn, alltså bara på desktop: adminen var en återvändsgränd
              på mobil. */}
          <Link
            href="/dashboard"
            className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-sm text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1 sm:px-3"
          >
            <IkonHem size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Till appen</span>
            <span className="sr-only sm:hidden">Till appen</span>
          </Link>
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
