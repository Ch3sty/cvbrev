'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, ListChecks } from 'lucide-react';
import { ProvMedalIllustration } from './illustrations/TesterHubIcons';

interface Props {
  /** Startsidan för provet, t.ex. /dashboard/tester/matrislogik-prov. */
  href: string;
  /** Session-API för att hämta senaste prov-resultat, t.ex. /api/logicTestProv/session. */
  sessionEndpoint: string;
  /** Totalt antal frågor i provet (för procent + "X frågor"). */
  totalQuestions: number;
  /** Ungefärlig tid i minuter. */
  minutes: number;
}

interface ProvSession {
  score: number | null;
  completed_at: string | null;
}

/**
 * Standout-balk för provet. Full bredd under träningskorten, fylld
 * orange→röd→rosa-gradient med vit text och en stor "PROV"-vattenstämpel.
 * Horisontell på sm+ (medalj · text · CTA), staplad på mobil.
 */
export default function ProvCard({ href, sessionEndpoint, totalQuestions, minutes }: Props) {
  const [best, setBest] = useState<{ score: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(sessionEndpoint)
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((data) => {
        if (cancelled) return;
        const sessions: ProvSession[] = Array.isArray(data.sessions) ? data.sessions : [];
        const completed = sessions.filter((s) => s.completed_at && s.score != null);
        if (completed.length === 0) return;
        const top = completed.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a));
        setBest({ score: top.score ?? 0 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionEndpoint]);

  const pct = best ? Math.round((best.score / totalQuestions) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <Link
        href={href}
        className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-3xl overflow-hidden text-white transition-all hover:-translate-y-0.5 touch-manipulation p-4 sm:px-6 sm:py-5"
        style={{
          background: 'linear-gradient(120deg, #F97316 0%, #DC2626 55%, #BE185D 100%)',
          boxShadow: '0 14px 40px -14px rgba(220, 38, 38, 0.55)',
        }}
      >
        {/* PROV-vattenstämpel */}
        <span
          className="pointer-events-none absolute -top-3 right-4 text-6xl sm:text-7xl font-black tracking-tighter text-white/10 select-none"
          aria-hidden="true"
        >
          PROV
        </span>

        {/* Prick-pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" aria-hidden="true">
          <pattern id="provbar-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="0.9" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#provbar-dots)" />
        </svg>

        {/* Medalj + text */}
        <div className="relative flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <ProvMedalIllustration className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.16em] bg-white/20 backdrop-blur-sm">
                Prov
              </span>
              {pct != null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums bg-white text-orange-700">
                  Senaste {pct}%
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight">
              Mät var du står
            </h3>
            <p className="text-xs text-white/90 leading-snug mt-0.5">
              Frågor från alla nivåer, blandade, utan hjälp.
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/85 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <ListChecks className="w-3 h-3" strokeWidth={2.5} />
                {totalQuestions} frågor
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2.5} />
                {minutes} min
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative flex-shrink-0">
          <span className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-orange-700 text-sm font-bold transition-transform group-hover:scale-[1.02]">
            {best ? 'Gör om provet' : 'Gör provet'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
