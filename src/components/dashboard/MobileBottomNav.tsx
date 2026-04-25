'use client';

/**
 * MobileBottomNav
 * ---------------
 * Fast bottennavigation för mobil med en framträdande FAB-knapp i mitten.
 * FAB:en leder till "skapa brev"-flödet (eller CV-uppladdning om inget CV finns).
 *
 * Aktiv flik beräknas från usePathname(). Wrappa renderingen i en .lg:hidden-
 * container i layout.tsx så att den bara visas på mobil.
 *
 * Datakontrakt:
 *   cvCount  — om 0 redirectas FAB-knappen till /dashboard/profil/cv
 *              istället för /dashboard/skapa-brev (gating).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, Briefcase, User, Plus, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  cvCount: number;
}

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  matchPaths: string[];
}

const LEFT_TABS: TabItem[] = [
  { id: 'home',  label: 'Hem',   href: '/dashboard',           icon: Home,      matchPaths: ['/dashboard'] },
  { id: 'brev',  label: 'Brev',  href: '/dashboard/mina-brev', icon: PenTool,   matchPaths: ['/dashboard/mina-brev', '/dashboard/skapa-brev', '/dashboard/my-letters'] },
];
const RIGHT_TABS: TabItem[] = [
  { id: 'jobs',    label: 'Jobb',    href: '/dashboard/jobbmatchning', icon: Briefcase, matchPaths: ['/dashboard/jobbmatchning', '/dashboard/jobbcoachen'] },
  { id: 'profil',  label: 'Profil',  href: '/dashboard/profil',        icon: User,      matchPaths: ['/dashboard/profil'] },
];

export default function MobileBottomNav({ cvCount }: MobileBottomNavProps) {
  const pathname = usePathname() ?? '/dashboard';
  const hasCv = cvCount > 0;
  const fabHref = hasCv ? '/dashboard/skapa-brev' : '/dashboard/profil/cv';

  const isActive = (item: TabItem) => {
    if (item.id === 'home') return pathname === '/dashboard';
    return item.matchPaths.some((p) => pathname.startsWith(p));
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 px-3 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-30"
      aria-label="Huvudnavigation"
    >
      <div className="relative flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center flex-1 justify-around pr-12">
          {LEFT_TABS.map((tab) => (
            <NavTab key={tab.id} tab={tab} active={isActive(tab)} />
          ))}
        </div>

        {/* Center FAB */}
        <Link
          href={fabHref}
          aria-label={hasCv ? 'Skapa nytt brev' : 'Lägg till CV'}
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white touch-manipulation"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow: '0 10px 24px -6px rgba(220, 38, 38, 0.5), 0 0 0 4px white',
          }}
        >
          {hasCv ? <Plus className="w-7 h-7" strokeWidth={2.5} /> : <Lock className="w-6 h-6" strokeWidth={2.5} />}
        </Link>

        <div className="flex items-center flex-1 justify-around pl-12">
          {RIGHT_TABS.map((tab) => (
            <NavTab key={tab.id} tab={tab} active={isActive(tab)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavTab({ tab, active }: { tab: TabItem; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
        active ? 'text-orange-600' : 'text-slate-400'
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
      <span className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'}`}>{tab.label}</span>
    </Link>
  );
}
