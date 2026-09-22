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
  /** Aktiv bara på exakt adress, inte på undersidor. Profil har prenumerationen under sig. */
  exact?: boolean;
  /**
   * Valet ingår inte i paketet (spec-onboarding 2026-09-22, sektion 3):
   * raden är grå med lås och går inte till sidan. Trycket kör onLocked,
   * som öppnar betalväggen för rätt paket.
   */
  locked?: boolean;
  onLocked?: () => void;
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
  exact,
  locked,
  onLocked,
  isMobile,
  onClick,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === '/dashboard' || exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  const handleClick = () => {
    if (isMobile && onClick) onClick();
  };

  if (locked) {
    // Grått och oklickbart som länk: etiketten i ink-3 (AA), låset till
    // höger, undertexten säger var funktionen finns. Aldrig ett kort.
    return (
      <li>
        <button
          type="button"
          onClick={onLocked}
          aria-label={`${label}. ${typeof sublabel === 'string' ? sublabel : 'Ingår inte i ditt paket'}`}
          className={`group flex w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium text-ink-3 transition-colors duration-[120ms] touch-manipulation hover:bg-insunken/60 ${
            isMobile ? 'min-h-[48px]' : 'min-h-[40px]'
          }`}
        >
          <Icon className="h-5 w-5 shrink-0 text-kant-stark" size={20} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate leading-5">{label}</span>
            {sublabel ? (
              <span className="truncate text-xs font-normal leading-4 text-ink-3">{sublabel}</span>
            ) : null}
          </span>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            className="shrink-0 text-ink-3"
          >
            <rect x="6" y="11" width="12" height="9" rx="2" />
            <path d="M9 11V8a3 3 0 0 1 6 0v3" />
          </svg>
        </button>
      </li>
    );
  }

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
