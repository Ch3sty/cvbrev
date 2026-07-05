'use client';

// Delad spärrvy när en dagskvot är slut. Visar exakt återkomsttid,
// "Påminn mig"-knapp (POST /api/quota/remind) och uppgraderings-CTA.
// Används av brev, CV-analys, chatt och testernas startsidor.

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Bell, Check, ArrowRight } from 'lucide-react';

interface QuotaLockCardProps {
  /** Kvotnyckel, t.ex. 'letter_generation', 'cv_analysis', 'test:matrislogik-expert' */
  feature: string;
  title: string;
  description: string;
  /** ISO-tid när kvoten öppnar igen */
  nextResetAt: string;
  /** Döljer uppgraderings-CTA:n (t.ex. i lägen där den inte är relevant) */
  hideUpgrade?: boolean;
  className?: string;
}

function formatResetTime(iso: string): string {
  const reset = new Date(iso);
  const now = new Date();
  const time = reset.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  });
  const dayDiff = Math.floor(
    (new Date(reset.toDateString()).getTime() - new Date(now.toDateString()).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  if (dayDiff <= 0) return `idag ${time}`;
  if (dayDiff === 1) return time === '00:00' ? 'imorgon' : `imorgon ${time}`;
  const date = reset.toLocaleDateString('sv-SE', {
    weekday: 'long',
    timeZone: 'Europe/Stockholm',
  });
  return `${date} ${time}`;
}

export default function QuotaLockCard({
  feature,
  title,
  description,
  nextResetAt,
  hideUpgrade,
  className,
}: QuotaLockCardProps) {
  const [reminderState, setReminderState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleRemind = async () => {
    if (reminderState === 'saving' || reminderState === 'saved') return;
    setReminderState('saving');
    try {
      const res = await fetch('/api/quota/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, remindAfter: nextResetAt }),
      });
      setReminderState(res.ok ? 'saved' : 'error');
    } catch {
      setReminderState('error');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden ${className ?? ''}`}
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
            }}
          >
            <Clock className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              Tillgänglig igen {formatResetTime(nextResetAt)}.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
          <button
            onClick={handleRemind}
            disabled={reminderState === 'saving' || reminderState === 'saved'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px] touch-manipulation disabled:cursor-default"
          >
            {reminderState === 'saved' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                Vi mailar dig
              </>
            ) : reminderState === 'error' ? (
              'Kunde inte spara, försök igen'
            ) : (
              <>
                <Bell className="w-4 h-4" strokeWidth={2.5} />
                {reminderState === 'saving' ? 'Sparar…' : 'Påminn mig via mail'}
              </>
            )}
          </button>
          {!hideUpgrade && (
            <Link
              href="/priser"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 min-h-[48px] touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              Fortsätt direkt med Premium
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </motion.section>
  );
}
