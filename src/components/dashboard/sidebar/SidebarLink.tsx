'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode, ComponentType } from 'react';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count?: number | null;
  badge?: ReactNode;
  sublabel?: string;
  highlight?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

export default function SidebarLink({
  href,
  label,
  icon: Icon,
  count,
  badge,
  sublabel,
  highlight,
  isMobile,
  onClick,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  const handleClick = () => {
    if (isMobile && onClick) onClick();
  };

  return (
    <li>
      <Link
        href={href}
        prefetch={true}
        onClick={handleClick}
        className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 touch-manipulation ${
          isMobile ? 'min-h-[56px]' : 'min-h-[44px]'
        } ${
          isActive
            ? 'bg-gradient-to-r from-orange-50 to-rose-50/60'
            : 'hover:bg-orange-50/60'
        }`}
      >
        {/* Vänster gradient-strip när active */}
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
            style={{
              background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
            }}
          />
        )}

        {/* Ikon-bubbla */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-orange-700 bg-orange-50 group-hover:bg-orange-100'
          }`}
          style={
            isActive
              ? {
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                }
              : undefined
          }
        >
          <Icon className="w-[18px] h-[18px]" />
        </motion.div>

        {/* Label + sublabel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-sm font-semibold leading-tight truncate ${
                isActive ? 'text-orange-900' : highlight ? 'text-orange-700' : 'text-slate-700'
              }`}
            >
              {label}
            </span>
            {typeof count === 'number' && count > 0 && (
              <span
                className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-orange-200/70 text-orange-900'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {count}
              </span>
            )}
            {badge && !count && <span className="flex-shrink-0">{badge}</span>}
          </div>
          {sublabel && (
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">{sublabel}</div>
          )}
        </div>
      </Link>
    </li>
  );
}
