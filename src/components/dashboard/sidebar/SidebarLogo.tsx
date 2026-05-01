'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface SidebarLogoProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SidebarLogo({ isMobile, onClose }: SidebarLogoProps) {
  return (
    <div className="px-4 py-4 flex items-center justify-between border-b border-orange-100 bg-white/80 backdrop-blur-sm">
      <Link href="/dashboard" onClick={() => isMobile && onClose?.()} className="flex items-center gap-2 group">
        <div className="text-xl font-black tracking-tight">
          <span className="text-slate-900">Jobbcoach</span>
          <span
            className="text-white rounded-md px-1.5 py-0.5 ml-1 inline-block transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.4)',
            }}
          >
            .ai
          </span>
        </div>
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
