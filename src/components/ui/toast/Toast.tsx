'use client';

import { useEffect, useState } from 'react';
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

/** Maste matcha langden pa toastOut nedan. */
const EXIT_MS = 180;

export default function Toast({
  isVisible,
  message,
  type = 'success',
  scenario,
  onClose,
  duration = 4000,
}: ToastProps) {
  // Toasten maste ligga kvar i DOM:en medan ut-animationen kor, annars finns
  // inget att animera. `leaving` valjer keyframe och en timer pa exakt samma
  // langd tar bort elementet efterat, sa ingen toast kan fastna pa skarmen.
  const [mounted, setMounted] = useState(isVisible);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setLeaving(false);
      setMounted(true);
      return;
    }
    setLeaving(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Auto-dismiss
  useEffect(() => {
    if (!isVisible || !onClose || type === 'loading' || !duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose, type]);

  // Splitta meddelandet i rubrik + body om det innehaller en punkt + mellanslag
  // (t.ex. "Vi hittade 50 matchande jobb. Utforska traffarna nedan.")
  const { title, body } = splitMessage(message);

  if (!mounted) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: no-preference) {
          .toast-enter { animation: toastIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
          .toast-leave { animation: toastOut ${EXIT_MS}ms ease-in both; }
          @keyframes toastIn {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes toastOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.96); }
          }
          @media (min-width: 1024px) {
            @keyframes toastIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          }
        }
      `,
        }}
      />
      <div
        className={`
          fixed z-[70] pointer-events-auto
          left-4 right-4 lg:left-auto lg:right-5 lg:top-5
          bottom-[calc(var(--bottom-nav-h)+16px)] lg:bottom-auto
          lg:max-w-[420px]
          ${leaving ? 'toast-leave' : 'toast-enter'}
        `}
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
      </div>
    </>
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
