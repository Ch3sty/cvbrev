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
  index?: number;
}

interface ProvSession {
  score: number | null;
  completed_at: string | null;
}

/**
 * Standout-kort för provet. Fylld orange→röd→rosa-gradient med vit text, tydligt
 * skild från de vita träningskorten. Visar senaste provresultat om det finns.
 */
export default function ProvCard({
  href,
  sessionEndpoint,
  totalQuestions,
  minutes,
  index = 0,
}: Props) {
  const [best, setBest] = useState<{ score: number; completedAt: string } | null>(null);

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
        setBest({ score: top.score ?? 0, completedAt: top.completed_at! });
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
      transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
    >
      <Link
        href={href}
        className="group relative flex flex-col h-full rounded-3xl overflow-hidden text-white transition-all hover:-translate-y-0.5 touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 14px 40px -14px rgba(220, 38, 38, 0.55)',
        }}
      >
        {/* Prick-pattern för djup */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true">
          <pattern id="provcard-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="0.9" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#provcard-dots)" />
        </svg>

        <div className="relative p-4 flex flex-col h-full">
          {/* Topprad: PROV-etikett */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.16em] bg-white/20 backdrop-blur-sm">
              Prov
            </span>
            {pct != null && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums bg-white text-orange-700">
                Senaste {pct}%
              </span>
            )}
          </div>

          {/* Ikon + titel */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <ProvMedalIllustration className="w-12 h-12" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight">
                Gör provet
              </h3>
              <div className="flex items-center gap-2.5 mt-1 text-[11px] text-white/85 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="w-3 h-3" strokeWidth={2.5} />
                  {totalQuestions}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={2.5} />
                  {minutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Beskrivning */}
          <p className="text-xs text-white/90 leading-relaxed mb-3 flex-1">
            Mät var du står. Frågor från alla nivåer, blandade, utan hjälp, som i ett
            riktigt rekryteringstest.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold">
              {best ? 'Gör om provet' : 'Starta provet'}
            </span>
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
