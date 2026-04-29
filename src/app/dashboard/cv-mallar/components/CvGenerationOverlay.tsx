'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface CvGenerationOverlayProps {
  isOpen: boolean;
  isError?: boolean;
  errorMessage?: string;
  onClose?: () => void;
}

/**
 * Minimal generation-modal som visas under PDF-skapande.
 * Centrerad rounded-3xl-card med pulserande dokument-illustration,
 * progress-bar (visuell, animeras 0->90% under 5s, 90->100% nar isOpen=false).
 */
export default function CvGenerationOverlay({
  isOpen,
  isError = false,
  errorMessage,
  onClose,
}: CvGenerationOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Animera 0 -> 90% over 5 sekunder, sedan haller den vid 90 tills modalen stangs
    let raf: number;
    let start: number | null = null;
    const duration = 5000;

    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = t - start;
      const pct = Math.min(90, (elapsed / duration) * 90);
      setProgress(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={isError && onClose ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl border border-orange-200/50 p-6 sm:p-8 max-w-md w-full"
            style={{ boxShadow: '0 24px 48px -12px rgba(220, 38, 38, 0.25)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {isError ? (
              <ErrorContent message={errorMessage} onClose={onClose} />
            ) : (
              <ProgressContent progress={progress} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProgressContent({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center text-center">
      <DocumentIllustration />

      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mt-5 mb-1.5">
        Skapar din CV-PDF
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1">
        Vi formaterar ditt innehåll
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        Tar 5–10 sekunder.
      </p>

      <div className="w-full">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${Math.round(progress)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
          />
        </div>
        <div className="mt-2 text-xs font-semibold text-orange-700 tabular-nums text-right">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

function ErrorContent({
  message,
  onClose,
}: {
  message?: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
        <AlertCircle className="w-7 h-7" strokeWidth={2.25} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1">
        Något gick fel
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        {message || 'Vi kunde inte skapa din PDF. Försök igen.'}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full px-5 py-3 rounded-xl text-white font-bold min-h-[44px] shadow-md"
        style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
      >
        OK
      </button>
    </div>
  );
}

/**
 * Pulserande dokument med scan-linje.
 */
function DocumentIllustration() {
  return (
    <div className="relative w-[110px] h-[140px]">
      {/* Pulserande halo */}
      <motion.div
        className="absolute inset-[-20%] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(249, 115, 22, 0.18), transparent 65%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dokument */}
      <div
        className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden w-full h-full"
        style={{
          boxShadow:
            '0 18px 36px -12px rgba(220, 38, 38, 0.25), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />
        <div className="px-3 pt-3 pb-2 flex flex-col gap-1.5">
          <div className="h-2 w-3/4 rounded-full bg-slate-300" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
        </div>
        <div className="px-3 mt-1 flex flex-col gap-1">
          {['w-full', 'w-5/6', 'w-full', 'w-2/3', 'w-5/6', 'w-3/4'].map((w, i) => (
            <div key={i} className={`h-1 ${w} rounded-full bg-slate-100`} />
          ))}
        </div>

        {/* Skann-linje */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.85) 50%, transparent 100%)',
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.7)',
          }}
          animate={{ top: ['12%', '88%', '12%'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
