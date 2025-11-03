'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { AlertTriangle, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmailVerificationBanner() {
  const { profile, isEmailVerified, subscriptionTier } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Don't show banner if:
  // - No profile loaded yet
  // - Email is already verified
  // - User is premium (they get all features regardless)
  // - User has dismissed it
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
      });

      if (response.ok) {
        setResendMessage('✓ Verifieringsmejl skickat! Kontrollera din inkorg.');
      } else {
        const data = await response.json().catch(() => ({}));
        setResendMessage(data.error || 'Kunde inte skicka mejl. Försök igen senare.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendMessage('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                    Verifiera din e-post för att låsa upp full tillgång
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Du kan för närvarande endast ladda upp <span className="font-medium">1 CV</span> och skapa <span className="font-medium">1 personligt brev</span>.
                    Verifiera din e-postadress för att få tillgång till alla gratisfunktioner.
                  </p>

                  {/* Resend button and message */}
                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed min-h-[44px]"
                    >
                      <Mail className="w-4 h-4" />
                      {isResending ? 'Skickar...' : 'Skicka verifieringsmejl igen'}
                    </button>

                    {resendMessage && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-sm ${
                          resendMessage.startsWith('✓')
                            ? 'text-green-700 font-medium'
                            : 'text-red-700'
                        }`}
                      >
                        {resendMessage}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="flex-shrink-0 p-1.5 hover:bg-yellow-100 rounded-lg transition-colors"
                  aria-label="Stäng banner"
                >
                  <X className="w-5 h-5 text-yellow-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
