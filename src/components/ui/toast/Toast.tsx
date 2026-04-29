'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ToastIllustration from './ToastIllustration';

export interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: 'loading' | 'success' | 'error' | 'info';
  /** Scenario-key (t.ex. "jobs-found") eller legacy maskot-sokvag */
  scenario?: string;
  onClose?: () => void;
  duration?: number;
}

export default function Toast({
  isVisible,
  message,
  type = 'success',
  scenario,
  onClose,
  duration = 4000,
}: ToastProps) {
  // Auto-dismiss
  useEffect(() => {
    if (!isVisible || !onClose || type === 'loading' || !duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose, type]);

  // Splitta meddelandet i rubrik + body om det innehaller en punkt + mellanslag
  // (t.ex. "Vi hittade 50 matchande jobb. Utforska traffarna nedan.")
  const { title, body } = splitMessage(message);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: typeof window !== 'undefined' && window.innerWidth >= 1024 ? -8 : 16,
            scale: 0.96,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="
            fixed z-[70] pointer-events-auto
            left-4 right-4 lg:left-auto lg:right-5 lg:top-5
            bottom-[calc(env(safe-area-inset-bottom)+96px)] lg:bottom-auto
            lg:max-w-[420px]
          "
          role="status"
          aria-live="polite"
        >
          <div
            className="relative bg-white rounded-2xl border border-orange-200/60 overflow-hidden"
            style={{
              boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.18), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
            }}
          >
            {/* Topp-stripe */}
            <div
              className="h-0.5"
              style={{
                background:
                  type === 'error'
                    ? '#DC2626'
                    : 'linear-gradient(90deg, #F97316, #DC2626, #BE185D)',
              }}
            />

            <div className="flex items-start gap-3 p-3 sm:p-4">
              <ToastIllustration scenario={scenario} />

              <div className="flex-1 min-w-0 pt-0.5">
                {title && (
                  <p className="text-sm font-semibold text-slate-900 leading-snug break-words">
                    {title}
                  </p>
                )}
                {body && (
                  <p className="text-xs text-slate-600 leading-snug mt-0.5 break-words">
                    {body}
                  </p>
                )}
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Stäng"
                  className="flex-shrink-0 -m-1 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
                  style={{ minHeight: 32, minWidth: 32 }}
                >
                  <X className="w-4 h-4" strokeWidth={2.25} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Splittra ett meddelande pa "rubrik. body" om det finns en naturlig
 * brytpunkt. Annars: hela texten ar rubriken.
 */
function splitMessage(message: string): { title: string; body: string } {
  const trimmed = message.trim();
  // Forsta meningen som rubrik. Sok efter forsta . ! ? foljt av mellanslag.
  const match = trimmed.match(/[.!?]\s+/);
  if (match && match.index !== undefined) {
    const splitAt = match.index + 1; // efter punkten
    const title = trimmed.slice(0, splitAt);
    const body = trimmed.slice(splitAt).trim();
    return { title, body };
  }
  return { title: trimmed, body: '' };
}
