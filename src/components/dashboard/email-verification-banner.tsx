'use client';

/**
 * Mjuk uppmaning att bekräfta e-postadressen (docs/plan-konvertering.md, B1).
 *
 * Bekräftelsen blockerar inte skapandet längre, bara export och permanent
 * lagring. Därför är tonen lugn, och bannern döljs för alla som redan
 * bekräftat. Premium-villkoret är borta: reverse trial ger alla nya konton
 * premium, och då hade bannern annars aldrig visats för någon.
 */

import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { X } from 'lucide-react';
import { IlluEmailBekrafta } from '@/components/illustrations/AuthIllustrations';

const DISMISS_KEY = 'jc_email_banner_dismissed_at';
const DISMISS_HOURS = 24;

export default function EmailVerificationBanner() {
  const { profile, isEmailVerified } = useProfile();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Avfärdandet gäller ett dygn och lever i localStorage. Vi startar dolt och
  // visar först när vi vet, så bannern aldrig blinkar förbi vid laddning.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (!raw) {
        setIsDismissed(false);
        return;
      }
      const dismissedAt = Number(raw);
      const expired = Number.isNaN(dismissedAt)
        ? true
        : Date.now() - dismissedAt > DISMISS_HOURS * 60 * 60 * 1000;
      setIsDismissed(!expired);
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* privat läge: bannern kommer tillbaka vid nästa besök */
    }
  };

  if (!profile || isEmailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          fullName: profile.full_name || '',
          userId: profile.id,
          isInvitation: false,
        }),
      });

      if (response.ok) {
        setResendMessage('Mejlet är skickat. Kolla inkorgen.');
      } else {
        const data = await response.json().catch(() => ({}));
        setResendMessage(data.error || 'Kunde inte skicka mejlet. Försök igen.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendMessage('Något gick fel. Försök igen.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative z-20 bg-white border-b border-neutral-200 motion-safe:animate-[slideUp_200ms_ease-out_both]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <span className="shrink-0 text-neutral-900" aria-hidden="true">
              <IlluEmailBekrafta size={36} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900">
                <span className="font-semibold">Bekräfta din e-post.</span>{' '}
                <span className="text-neutral-600">
                  Vi sparar dina dokument permanent när adressen är bekräftad.
                </span>
              </p>
              {resendMessage && (
                <p
                  className={`text-sm mt-1 ${
                    resendMessage.startsWith('Mejlet') ? 'text-neutral-700' : 'text-red-700'
                  }`}
                >
                  {resendMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Skickar…' : 'Skicka mejlet igen'}
            </button>

            <button
              onClick={dismiss}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              aria-label="Stäng"
            >
              <X className="w-4 h-4 text-neutral-500" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
