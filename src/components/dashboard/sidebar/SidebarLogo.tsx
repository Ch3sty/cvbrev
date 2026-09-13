'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface SidebarLogoProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SidebarLogo({ isMobile, onClose }: SidebarLogoProps) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-3">
      <Link
        href="/dashboard"
        onClick={() => isMobile && onClose?.()}
        className="flex items-center"
        aria-label="Jobbcoach.ai dashboard"
      >
        {/* Bara ordmärket: ingen orange ruta, ingen tvåfärgad ändelse.
            Märket ska inte tävla med sidans accent. */}
        <span className="text-[18px] font-semibold leading-6 tracking-[-0.02em] text-ink-1">
          Jobbcoach.ai
        </span>
      </Link>

      {isMobile && onClose ? (
        <button
          onClick={onClose}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken"
          aria-label="Stäng meny"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
