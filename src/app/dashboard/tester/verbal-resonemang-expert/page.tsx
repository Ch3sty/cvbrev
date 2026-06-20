'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, ListChecks, Scale } from 'lucide-react';
import { TOTAL_QUESTIONS } from '@/lib/verbalTestExpert/selectPassages';

const EXPERT_MINUTES = 35;

interface Session {
  id: string;
  score: number | null;
  completed_at: string | null;
}

export default function VerbalExpertStartPage() {
  const router = useRouter();
  const [previous, setPrevious] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/verbalTestExpert/session')
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((data) => {
        const sessions: Session[] = Array.isArray(data.sessions) ? data.sessions : [];
        setPrevious(sessions.filter((s) => s.completed_at));
      })
      .catch(() => {});
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/verbalTestExpert/session', { method: 'POST' });
      if (res.status === 403) {
        router.push('/priser');
        return;
      }
      const data = await res.json();
      if (data.session) {
        router.push(`/dashboard/tester/verbal-resonemang-expert/test/${data.session.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start verbal expert:', error);
      setIsLoading(false);
    }
  };

  const best = previous.length > 0 ? Math.max(...previous.map((s) => s.score ?? 0)) : 0;
  const bestPct = best > 0 ? Math.round((best / TOTAL_QUESTIONS) * 100) : 0;

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
            <pattern id="vexp-hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#vexp-hero-dots)" />
          </svg>
          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
              <Scale className="w-3.5 h-3.5" strokeWidth={2.5} />
              Verbalt · Expert
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
              Argumentationsanalys
            </h1>
            <p className="text-sm sm:text-base opacity-95 leading-relaxed max-w-xl">
              Läs ett argument och avgör vad som faktiskt håller. Hitta det logiska
              felslutet, det dolda antagandet och vad som stärker eller försvagar slutsatsen.
              Den tuffaste verbala nivån.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 mt-5 border-t border-white/20 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="w-4 h-4" strokeWidth={2.5} />
                {TOTAL_QUESTIONS} frågor
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" strokeWidth={2.5} />
                ca {EXPERT_MINUTES} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                Logiska felslut
              </span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 text-center"
          style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
        >
          {best > 0 && (
            <p className="text-sm text-slate-600 mb-3">
              Ditt bästa: <span className="font-bold text-slate-900">{best}/{TOTAL_QUESTIONS}</span> ({bestPct}%)
            </p>
          )}
          <p className="text-sm text-slate-600 mb-4">Premiumnivå. Inga siffror, bara logik.</p>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-0.5 min-h-[52px] touch-manipulation disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
              boxShadow: '0 10px 30px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            {isLoading ? 'Startar…' : 'Starta expert'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </motion.section>
      </div>
    </div>
  );
}
