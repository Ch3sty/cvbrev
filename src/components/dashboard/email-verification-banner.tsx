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

const DISMISS_KEY = 'jc_email_banner_dismissed_at';
const DISMISS_HOURS = 24;
/* Bannern är en rad, inte en platta: samma form som StatusRow, 44 px hög.
   Höjden är därmed densamma på mobil och desktop, så platshållaren behöver
   bara ett mått. Ytan måste ändå reserveras innan svaret landat, annars
   knuffas sidan ner när bannern dyker upp, och det var skiftet som mätte
   0,056 i CLS. */
const BANNER_HEIGHT_CLASS = 'h-11';
const BANNER_MIN_HEIGHT_CLASS = 'min-h-11';

export default function EmailVerificationBanner() {
  const { profile, isEmailVerified, loading } = useProfile();
  /* Avfärdandet gäller ett dygn och lever i localStorage. Läsningen måste
     ligga i en effekt, localStorage finns inte på servern, så vi håller reda
     på om den hunnit köra. Innan dess vet vi ingenting och reserverar ytan.
     Startvärdet är fortfarande "avfärdad", så bannern blinkar aldrig förbi. */
  const [isDismissed, setIsDismissed] = useState(true);
  const [dismissChecked, setDismissChecked] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    setDismissChecked(true);
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

  /* CLS: bannern låg tidigare som null tills profilen landat och sköt sedan
     ner hela sidan med sin egen höjd, på varje dashboard-sida. Nu reserveras
     ytan medan svaret är okänt, och faller ihop först när vi vet att bannern
     inte behövs. En redan avfärdad banner reserverar ingenting: det vet vi
     av localStorage redan vid första målningen. */
  const answerPending = !dismissChecked || (loading && !isDismissed);

  if (answerPending) {
    return <div aria-hidden="true" className={BANNER_HEIGHT_CLASS} />;
  }

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
    // slideUp är borttagen: den animerade in bannerns höjd och räknades som
    // ett layoutskifte i sig. Ytan är redan reserverad, bannern ska bara finnas.
    <div
      className={`relative z-20 border-b border-kant bg-panel ${BANNER_MIN_HEIGHT_CLASS}`}
    >
      <div className="mx-auto flex min-h-11 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <p
          className={`min-w-0 flex-1 truncate text-sm ${
            resendMessage && !resendMessage.startsWith('Mejlet') ? 'text-fel' : 'text-ink-1'
          }`}
        >
          {resendMessage ?? 'Bekräfta din e-post för att spara dokument permanent.'}
        </p>

        <button
          onClick={handleResendEmail}
          disabled={isResending}
          className="shrink-0 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:opacity-40"
        >
          {isResending ? 'Skickar' : 'Skicka igen'}
        </button>

        <button
          onClick={dismiss}
          className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-insunken"
          aria-label="Stäng"
        >
          <X className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
