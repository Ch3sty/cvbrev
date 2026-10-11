'use client';

import Link from 'next/link';

/**
 * Ordmärket överst i sidomenyn (spec-rummen 4.3): display 18/800 i ink-1,
 * ingen ruta, ingen tvåfärgad ändelse. Märket tävlar inte med kopparn.
 */
export default function SidebarLogo() {
  return (
    <div className="px-3 pb-5 pt-2">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center" aria-label="Jobbcoach.ai, till Jobbsöket">
        <span className="font-display text-[18px] font-extrabold leading-6 tracking-[-0.02em] text-ink-1">
          Jobbcoach.ai
        </span>
      </Link>
    </div>
  );
}
