'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookmarkCheck, Columns3, FolderKanban, Inbox, Search } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Search;
  /** exact = bara exakt path är aktiv (Sök ligger på portalens rot). */
  exact?: boolean;
}

const MAIN_ITEMS: NavItem[] = [
  { href: '/rekryterare', label: 'Sök', icon: Search, exact: true },
  { href: '/rekryterare/projekt', label: 'Projekt', icon: FolderKanban },
  { href: '/rekryterare/jamfor', label: 'Jämför', icon: Columns3 },
  { href: '/rekryterare/inbox', label: 'Inbox', icon: Inbox },
];

const SAVED_ITEM: NavItem = {
  href: '/rekryterare/sparade-sokningar',
  label: 'Sparade',
  icon: BookmarkCheck,
};

/**
 * Portalens navigering: ikonrail till vänster på desktop, bottom-tabs på
 * mobil. Inbox-badgen visar antal olästa svar från kandidater, så den
 * försvinner när man läst tråden i stället för att ligga kvar på alla
 * accepterade intressen.
 */
export default function RecruiterSideNav() {
  const pathname = usePathname();
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/interests');
        if (!res.ok) return;
        const data = (await res.json()) as {
          interests?: Array<{ status: string; unreadCount?: number }>;
        };
        if (cancelled) return;
        // Badgen visar olästa svar från kandidater, inte bara accepterade.
        setAcceptedCount(
          (data.interests ?? []).reduce((sum, i) => sum + (i.unreadCount ?? 0), 0)
        );
      } catch {
        // Badgen är ren bekvämlighet: tyst vid fel.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Medvetet bara vid mount: intresse-endpointen bygger kandidatkort och
    // ska inte anropas på varje navigering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);

  const renderItem = (item: NavItem, variant: 'rail' | 'tabs') => {
    const active = isActive(item);
    const Icon = item.icon;
    const showBadge = item.href === '/rekryterare/inbox' && acceptedCount > 0;

    if (variant === 'tabs') {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] text-[10.5px] font-bold transition-colors ${
            active ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-current={active ? 'page' : undefined}
        >
          <span className="relative">
            <Icon className="w-5 h-5" aria-hidden="true" />
            {showBadge && (
              <span
                className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[9.5px] font-bold flex items-center justify-center"
                aria-label={`${acceptedCount} accepterade intressen`}
              >
                {acceptedCount > 9 ? '9+' : acceptedCount}
              </span>
            )}
          </span>
          {item.label}
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative flex flex-col items-center gap-1 w-full py-2.5 rounded-xl text-[10.5px] font-bold transition-colors ${
          active
            ? 'bg-orange-50 text-orange-700'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <span className="relative">
          <Icon className="w-5 h-5" aria-hidden="true" />
          {showBadge && (
            <span
              className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[9.5px] font-bold flex items-center justify-center"
              aria-label={`${acceptedCount} accepterade intressen`}
            >
              {acceptedCount > 9 ? '9+' : acceptedCount}
            </span>
          )}
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop: vänster ikonrail */}
      <nav
        aria-label="Portalnavigering"
        className="hidden lg:flex sticky top-16 self-start flex-col items-center gap-1 w-[76px] flex-shrink-0 px-2 py-4"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {MAIN_ITEMS.map((item) => renderItem(item, 'rail'))}
        <div className="w-8 border-t border-orange-100 my-2" aria-hidden="true" />
        {renderItem(SAVED_ITEM, 'rail')}
      </nav>

      {/* Mobil: bottom-tabs */}
      <nav
        aria-label="Portalnavigering"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-orange-100 flex items-stretch px-1"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {MAIN_ITEMS.map((item) => renderItem(item, 'tabs'))}
        {renderItem(SAVED_ITEM, 'tabs')}
      </nav>
    </>
  );
}
