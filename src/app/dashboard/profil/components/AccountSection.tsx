'use client';

/**
 * Konto: logga ut och radera. I Tråden en panel med två rader. Utloggning
 * är en sekundär knapp, radering öppnar ett inline-flöde med bekräftelse i
 * text. Den destruktiva knappen är den enda röda ytan, och den är inaktiv
 * tills bekräftelsen är rätt skriven. Ingen framer-motion.
 */

import { useState } from 'react';
import { INPUT_CLASS } from './ProfileField';

interface AccountSectionProps {
  subscriptionTier: 'free' | 'premium';
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const BTN_SECONDARY =
  'inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:border-kant-stark disabled:opacity-60';

export default function AccountSection({ subscriptionTier, onLogout, onDeleteAccount }: AccountSectionProps) {
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const canConfirmDelete = confirmText.trim().toLowerCase() === 'radera mitt konto';

  const handleDelete = async () => {
    if (!canConfirmDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await onDeleteAccount();
    } catch (err: any) {
      setDeleteError(err.message || 'Något gick fel. Försök igen.');
      setIsDeleting(false);
    }
  };

  return (
    <section id="hantera-konto" className="scroll-mt-24 rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <h2 className="text-kort text-ink-1">Konto</h2>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">
        Logga ut från den här enheten eller radera kontot permanent.
      </p>

      <div className="mt-4 space-y-3">
        {/* Logga ut */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-kant p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-1">Logga ut</p>
            <p className="mt-0.5 text-meta text-ink-3">Avsluta sessionen på den här enheten.</p>
          </div>
          <button type="button" onClick={onLogout} className={BTN_SECONDARY}>
            Logga ut
          </button>
        </div>

        {/* Radera konto */}
        <div className="rounded-lg border border-kant">
          <button
            type="button"
            onClick={() => setShowDeleteFlow((v) => !v)}
            aria-expanded={showDeleteFlow}
            className="flex min-h-11 w-full items-center justify-between gap-4 p-3 text-left"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink-1">Radera mitt konto</span>
              <span className="mt-0.5 block text-meta text-ink-3">
                Permanent borttagning av all data. Kan inte ångras.
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              className={`shrink-0 text-ink-3 transition-transform duration-[160ms] ${showDeleteFlow ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showDeleteFlow && (
            <div className="space-y-4 border-t border-kant p-3">
              <div>
                <p className="text-sm font-medium text-ink-1">Det här raderas</p>
                <ul className="mt-1 space-y-1 text-sm leading-[22px] text-ink-2">
                  <li>All personlig information</li>
                  <li>Uppladdade CV:n och sparade brev</li>
                  <li>Genomförda CV-analyser och historik</li>
                  {subscriptionTier === 'premium' && (
                    <li className="font-medium text-ink-1">
                      Din Premium-prenumeration avslutas inte automatiskt. Avsluta den separat via
                      Stripe.
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <label htmlFor="radera-bekrafta" className="block text-sm font-medium text-ink-1">
                  Skriv <span className="font-semibold">radera mitt konto</span> för att bekräfta
                </label>
                <input
                  id="radera-bekrafta"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  enterKeyHint="done"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="radera mitt konto"
                  disabled={isDeleting}
                  className={INPUT_CLASS}
                />
              </div>

              {deleteError && (
                <p className="text-meta text-fel" role="alert">
                  {deleteError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteFlow(false);
                    setConfirmText('');
                    setDeleteError('');
                  }}
                  disabled={isDeleting}
                  className={BTN_SECONDARY}
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canConfirmDelete || isDeleting}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-fel px-4 text-sm font-medium text-white transition-colors hover:bg-fel-morker disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeleting ? 'Tar bort' : 'Radera permanent'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
