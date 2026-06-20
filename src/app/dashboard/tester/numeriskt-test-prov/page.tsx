'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, BarChart3, Clock, ListChecks, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { PROV_TOTAL_QUESTIONS } from '@/lib/numericalTestProv/selectProv';

const PROV_MINUTES = 30;

export default function NumericalProvStartPage() {
  const router = useRouter();
  const { subscriptionTier } = useProfile();
  const [isStarting, setIsStarting] = useState(false);
  const [rateLimited, setRateLimited] = useState<{ nextAvailableAt: string | null } | null>(null);

  const isPremium = subscriptionTier === 'premium';

  useEffect(() => {
    if (isPremium) return;
    fetch('/api/numericalTestProv/session')
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((data) => {
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = sessions
          .filter((s: { completed_at: string | null }) => s.completed_at && new Date(s.completed_at).getTime() >= weekAgo)
          .sort((a: { completed_at: string }, b: { completed_at: string }) =>
            new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
          );
        if (recent.length >= 1) {
          const next = new Date(new Date(recent[0].completed_at).getTime() + 7 * 24 * 60 * 60 * 1000);
          setRateLimited({ nextAvailableAt: next.toISOString() });
        }
      })
      .catch(() => {});
  }, [isPremium]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/numericalTestProv/session', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json();
        setRateLimited({ nextAvailableAt: data.nextAvailableAt ?? null });
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

  const nextDate = rateLimited?.nextAvailableAt
    ? new Date(rateLimited.nextAvailableAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
    : null;

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
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-3xl border border-amber-200/70 p-5 sm:p-6"
            style={{ boxShadow: '0 4px 16px -8px rgba(245, 158, 11, 0.18)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
              >
                <AlertCircle className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Du har redan gjort veckans prov</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Gratisanvändare kan göra numerisk-provet en gång per vecka.
                  {nextDate && <> Nästa prov blir tillgängligt <span className="font-semibold">{nextDate}</span>.</>}{' '}
                  Med Premium gör du provet obegränsat.
                </p>
                <button
                  onClick={() => router.push('/priser')}
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[44px]"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Uppgradera för obegränsat
                </button>
              </div>
            </div>
          </motion.section>
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
                : 'Som gratisanvändare kan du göra provet en gång per vecka.'}
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
