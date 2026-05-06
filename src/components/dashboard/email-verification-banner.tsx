'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconVarning } from './illustrations/DashboardIcons';

/**
 * Kompakt en-rads-banner som uppmanar anvandaren att verifiera sin
 * e-postadress. Tas bort fran DOM nar verifierad eller avvisad.
 */
export default function EmailVerificationBanner() {
  const { profile, isEmailVerified, subscriptionTier } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (!profile || isEmailVerified || subscriptionTier === 'premium' || isDismissed) {
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
        setResendMessage('Verifieringsmejl skickat. Kolla din inkorg.');
      } else {
        const data = await response.json().catch(() => ({}));
        setResendMessage(data.error || 'Kunde inte skicka mejl. Försök igen.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendMessage('Ett fel uppstod. Försök igen.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative z-20 border-b border-orange-200"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 237, 213, 0.6) 0%, rgba(254, 215, 170, 0.4) 100%)',
        }}
      >
        {/* Vanster gradient-rand */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background:
              'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Ikon + text */}
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <IconVarning className="w-9 h-9 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-black text-slate-900">
                    Verifiera din e-post
                  </span>
                  <span className="hidden sm:inline text-orange-300">·</span>
                  <span className="text-xs sm:text-sm text-slate-700">
                    Du kan endast skapa{' '}
                    <span className="font-bold">1 CV</span> och{' '}
                    <span className="font-bold">1 brev</span> tills dess
                  </span>
                </div>
                {resendMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-bold mt-1 ${
                      resendMessage.startsWith('Verifieringsmejl')
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {resendMessage}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Knapp + close */}
            <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-md min-h-[36px]"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.35)',
                }}
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={2.5} />
                {isResending ? 'Skickar...' : 'Skicka mejl'}
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Stäng banner"
              >
                <X
                  className="w-4 h-4 text-orange-700"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
