'use client';

import Link from 'next/link';
import { IkonBugg, IkonHjalp, IkonSkold } from '@/components/illustrations/Ikoner';

interface SidebarFooterProps {
  isAdmin: boolean;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const ROW =
  'flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-insunken/60 hover:text-ink-1';

export default function SidebarFooter({
  isAdmin,
  isMobile,
  onLinkClick,
}: SidebarFooterProps) {
  const handleLink = () => {
    if (isMobile && onLinkClick) onLinkClick();
  };

  return (
    <div className="mt-auto space-y-px border-t border-kant px-3 pb-3 pt-2">
      {/* Admin, bara om admin. En navigationsrad som alla andra. */}
      {isAdmin ? (
        <Link href="/admin" onClick={handleLink} className={ROW}>
          <IkonSkold size={20} className="shrink-0" />
          <span>Admin</span>
        </Link>
      ) : null}

      <Link href="/dashboard/kontakt" onClick={handleLink} className={ROW}>
        <IkonHjalp size={20} className="shrink-0" />
        <span className="truncate">Hjälp och kontakt</span>
      </Link>
      <Link href="/dashboard/bugg-feedback" onClick={handleLink} className={ROW}>
        <IkonBugg size={20} className="shrink-0" />
        <span className="truncate">Rapportera ett fel</span>
      </Link>

      {/* Utloggningen bor i headerns profilmeny, så kontoåtgärderna har en
          enda plats. */}
    </div>
  );
}
