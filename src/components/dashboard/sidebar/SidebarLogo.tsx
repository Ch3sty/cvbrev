'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import Logo from '@/components/Logo';

interface SidebarLogoProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SidebarLogo({ isMobile, onClose }: SidebarLogoProps) {
  return (
    <div className="px-4 py-4 flex items-center justify-between border-b border-orange-100 bg-white/80 backdrop-blur-sm">
      <Link
        href="/dashboard"
        onClick={() => isMobile && onClose?.()}
        className="flex items-center"
        aria-label="Jobbcoach.ai dashboard"
      >
        <Logo variant="compact" height={32} />
      </Link>

      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-700 transition-colors"
          aria-label="Stäng meny"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
