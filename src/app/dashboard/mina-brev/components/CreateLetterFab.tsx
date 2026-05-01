'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Floating action button — sticky längst ner höger på mobil för snabb
 * tillgång till "Skapa nytt brev" oavsett scroll-djup.
 *
 * Placeras ovanför dashboardens mobile bottom-nav (~5rem hög) med
 * env(safe-area-inset-bottom) för iOS notch-säkerhet. Endast synlig
 * under lg-breakpoint eftersom desktop redan har Skapa-knapp i hero.
 */
export default function CreateLetterFab() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      className="lg:hidden fixed right-4 z-30"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <Link
        href="/dashboard/skapa-brev"
        aria-label="Skapa nytt brev"
        className="flex items-center justify-center w-14 h-14 rounded-full text-white active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 12px 32px -8px rgba(220, 38, 38, 0.55), 0 4px 12px -4px rgba(220, 38, 38, 0.3)',
        }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.75} />
      </Link>
    </motion.div>
  );
}
