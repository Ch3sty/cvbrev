'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Clock, ListChecks } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { PROV_TOTAL_QUESTIONS } from '@/lib/numericalTestProv/selectProv';
import QuotaLockCard from '@/components/quota/QuotaLockCard';

const PROV_MINUTES = 40;

/** Nästa lokala midnatt (fallback när API:t inte skickar exakt återkomsttid). */
function nextMidnightISO(): string {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
}

export default function NumericalProvStartPage() {
  const router = useRouter();
  const { subscriptionTier } = useProfile();
  const [isStarting, setIsStarting] = useState(false);
  const [rateLimited, setRateLimited] = useState<{ nextAvailableAt: string } | null>(null);

  const isPremium = subscriptionTier === 'premium';

  // Kolla om provet redan är gjort idag (den skarpa spärren sker i API:t).
  useEffect(() => {
    if (isPremium) return;
    fetch('/api/numericalTestProv/session')
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((data) => {
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const doneToday = sessions.some(
          (s: { completed_at: string | null }) =>
            s.completed_at && new Date(s.completed_at).getTime() >= todayStart.getTime()
        );
        if (doneToday) {
          setRateLimited({ nextAvailableAt: nextMidnightISO() });
        }
      })
      .catch(() => {});
  }, [isPremium]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/numericalTestProv/session', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        setRateLimited({ nextAvailableAt: data?.nextAvailableAt ?? nextMidnightISO() });
        setIsStarting(false);
        return;
      }
      const data = await res.json();
      if (data.session) {
        router.push(`/dashboard/tester/numeriskt-test-prov/test/${data.session.id}`);
      } else {
        setIsStarting(false);
      }
    } catch (error) {
      console.error('Failed to start numeric prov:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="mx-auto py-4 sm:py-6 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
            <pattern id="nprov-hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#nprov-hero-dots)" />
          </svg>
          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
              <BarChart3 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Numeriskt · Prov
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
              Mät din sifferförståelse
            </h1>
            <p className="text-sm sm:text-base opacity-95 leading-relaxed max-w-xl">
              Ett skarpt prov med frågor från alla nivåer, blandade. Ingen hjälp under
              provet, precis som i ett riktigt rekryteringstest.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 mt-5 border-t border-white/20 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="w-4 h-4" strokeWidth={2.5} />
                {PROV_TOTAL_QUESTIONS} frågor
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" strokeWidth={2.5} />
                ca {PROV_MINUTES} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
                Alla nivåer
              </span>
            </div>
          </div>
        </motion.section>

        {rateLimited && !isPremium ? (
          <QuotaLockCard
            feature="test:numerical-reasoning-prov"
            title="Du har gjort dagens prov"
            description="Som gratisanvändare gör du varje prov en gång per dag."
            nextResetAt={rateLimited.nextAvailableAt}
          />
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 text-center"
            style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
          >
            <p className="text-sm text-slate-600 mb-4">
              {isPremium
                ? 'Du har obegränsade prov med Premium.'
                : 'Som gratisanvändare gör du provet en gång per dag.'}
            </p>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-0.5 min-h-[52px] touch-manipulation disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
                boxShadow: '0 10px 30px -8px rgba(220, 38, 38, 0.45)',
              }}
            >
              {isStarting ? 'Startar…' : 'Starta provet'}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.section>
        )}
      </div>
    </div>
  );
}
