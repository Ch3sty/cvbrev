'use client';

import Link from 'next/link';
import { BuggIcon, KontaktIcon, LoggaUtIcon, ShieldIcon } from './illustrations/MenuIcons';

interface SidebarFooterProps {
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function SidebarFooter({
  isAdmin,
  onLogout,
  isMobile,
  onLinkClick,
}: SidebarFooterProps) {
  const handleLink = () => {
    if (isMobile && onLinkClick) onLinkClick();
  };

  return (
    <div className="border-t border-orange-100 px-3 pt-3 pb-3 space-y-2 bg-white/60 backdrop-blur-sm">
      {/* Admin Panel - bara om admin */}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={handleLink}
          className="relative overflow-hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-xl hover:scale-[1.02] group"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
          }}
        >
          <ShieldIcon className="w-4 h-4 flex-shrink-0" />
          <span>Admin Panel</span>
        </Link>
      )}

      {/* Sekundära länkar - två i rad */}
      <div className="grid grid-cols-2 gap-1.5">
        <Link
          href="/dashboard/bugg-feedback"
          onClick={handleLink}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-600 hover:text-orange-700 hover:bg-orange-50/60 transition-colors text-xs font-medium"
        >
          <BuggIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Buggar</span>
        </Link>
        <Link
          href="/dashboard/kontakt"
          onClick={handleLink}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-600 hover:text-orange-700 hover:bg-orange-50/60 transition-colors text-xs font-medium"
        >
          <KontaktIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Kontakt</span>
        </Link>
      </div>

      {/* Logga ut */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors text-xs font-semibold"
      >
        <LoggaUtIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Logga ut</span>
      </button>
    </div>
  );
}
