'use client';

import Link from 'next/link';
import { BuggIcon, KontaktIcon, ShieldIcon } from './illustrations/MenuIcons';

interface SidebarFooterProps {
  isAdmin: boolean;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function SidebarFooter({
  isAdmin,
  isMobile,
  onLinkClick,
}: SidebarFooterProps) {
  const handleLink = () => {
    if (isMobile && onLinkClick) onLinkClick();
  };

  return (
    <div className="border-t border-orange-100 px-3 pt-3 pb-3 space-y-2 bg-white/60 backdrop-blur-sm">
      {/* Admin, bara om admin. En navigationsrad som alla andra, inte en
          säljyta: den röd-rosa gradienten och skalningen på hover är borta,
          ingen fylld orange yta i menyn. */}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={handleLink}
          className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <ShieldIcon className="w-4 h-4 flex-shrink-0" />
          <span>Admin</span>
        </Link>
      )}

      {/* Sekundära länkar. Två i rad gav 34 px höga träffytor på 12 px text;
          nu en per rad med 44 px höjd och minst 12 px etikett. */}
      <div className="space-y-1">
        <Link
          href="/dashboard/kontakt"
          onClick={handleLink}
          className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <KontaktIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Hjälp och kontakt</span>
        </Link>
        <Link
          href="/dashboard/bugg-feedback"
          onClick={handleLink}
          className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <BuggIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Rapportera ett fel</span>
        </Link>
      </div>

      {/* Utloggningen bor numera i headerns profilmeny, sa kontoatgarderna
          har en enda plats (punkt 9). */}
    </div>
  );
}
