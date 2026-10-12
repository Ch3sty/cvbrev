'use client';

/**
 * Mjuk uppmaning att bekräfta e-postadressen (docs/plan-konvertering.md, B1).
 *
 * Bekräftelsen blockerar inte skapandet längre, bara export och permanent
 * lagring. Därför är tonen lugn. Premium-villkoret är borta: reverse trial
 * ger alla nya konton premium, och då hade raden annars aldrig visats.
 *
 * Servern avgör om raden finns (beslut-banners-2026-10-12, avsnitt 1).
 * Dashboard-layouten läser email_verified_at ur summeringen och
 * avfärdandets cookie, och DashboardShell renderar komponenten bara för ett
 * overifierat konto som inte stängt raden det senaste dygnet. Raden står
 * därmed i server-HTML:en från början med sin slutliga höjd, och för ett
 * bekräftat konto finns varken rad eller platshållare. Förut reserverade
 * vi 44 px tills profilen landat på klienten och lät ytan falla ihop för
 * bekräftade konton: det var skiftet som mätte 0,048 på hemvyn och
 * testsidorna.
 */

import { useState } from 'react';
import { IkonX } from '@/components/illustrations/RumSymboler';
import { EPOSTBANNER_AVFARDAD_COOKIE, EPOSTBANNER_AVFARDAD_SEKUNDER } from './epostbanner-cookie';

export default function EmailVerificationBanner({
  userId,
  email,
  fullName,
}: {
  userId: string;
  email: string;
  fullName: string;
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  /* Stäng tar bort raden direkt. Ett skifte inom 500 ms efter ett klick
     räknas inte i CLS. Cookien gör att servern inte skickar raden igen
     under dygnet. */
  const dismiss = () => {
    setIsDismissed(true);
    document.cookie =
      `${EPOSTBANNER_AVFARDAD_COOKIE}=1;max-age=${EPOSTBANNER_AVFARDAD_SEKUNDER};path=/;SameSite=Lax` +
      (location.protocol === 'https:' ? ';Secure' : '');
  };

  if (isDismissed) return null;

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          userId,
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
    // Samma rad som StatusRow: 44 px, överst i innehållskolumnen, vägg med
    // hårlinje. En del av väggen, ingen pop-up.
    <div className="relative z-20 h-11 border-b border-vagg-kant bg-vagg-2 text-vagg-ink">
      <div className="mx-auto flex h-full max-w-[1120px] items-center gap-3 px-4 lg:box-content lg:px-10">
        <p
          className={`min-w-0 flex-1 truncate text-sm ${
            resendMessage && !resendMessage.startsWith('Mejlet') ? 'text-koppar-ljus' : 'text-vagg-mjuk'
          }`}
        >
          {resendMessage ?? 'Bekräfta din e-post för att spara dokument permanent.'}
        </p>

        <button
          onClick={handleResendEmail}
          disabled={isResending}
          className="shrink-0 text-sm font-medium text-vagg-ink underline decoration-vagg-svag underline-offset-4 disabled:opacity-40"
        >
          {isResending ? 'Skickar' : 'Skicka igen'}
        </button>

        <button
          onClick={dismiss}
          className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-vagg-mjuk transition-colors hover:bg-white/10"
          aria-label="Stäng"
        >
          <IkonX size={16} />
        </button>
      </div>
    </div>
  );
}
