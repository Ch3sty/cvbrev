'use client';

/**
 * En rad i sidomenyn (docs/designsystem.md, "Informationsarkitektur").
 *
 * Aktiv rad: bg-insunken plus tråden, 3 px längs panelens vänsterkant
 * (.thread-row i globals.css). Ikonen är naken, 20 px, i ink-2; aktiv i
 * ink-1. Antal står till höger i metadata, ink-3, aldrig i en badge.
 * Ingen orange utöver tråden: Premium-raden får kant när den behöver
 * uppmärksamhet, inte en fylld yta.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode, ComponentType } from 'react';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  count?: number | null;
  badge?: ReactNode;
  sublabel?: ReactNode;
  /** Raden ska synas: kant runt raden. Aldrig fyllning. */
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
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(href + '/');

  const handleClick = () => {
    if (isMobile && onClick) onClick();
  };

  return (
    <li>
      <Link
        href={href}
        prefetch={true}
        onClick={handleClick}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors duration-[120ms] touch-manipulation ${
          isMobile ? 'min-h-[48px]' : 'min-h-[40px]'
        } ${
          isActive
            ? 'thread-row bg-insunken text-ink-1'
            : 'text-ink-2 hover:bg-insunken/60 hover:text-ink-1'
        } ${highlight && !isActive ? 'border border-kant-stark' : ''}`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-ink-1' : 'text-ink-2'}`} size={20} />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate leading-5">{label}</span>
          {sublabel ? (
            <span className="truncate text-xs font-normal leading-4 text-ink-3">{sublabel}</span>
          ) : null}
        </span>

        {typeof count === 'number' && count > 0 ? (
          <span className="shrink-0 text-meta tabular-nums text-ink-3">{count}</span>
        ) : badge ? (
          <span className="shrink-0">{badge}</span>
        ) : null}
      </Link>
    </li>
  );
}
