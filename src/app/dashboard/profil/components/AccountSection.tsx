'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trash2, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import ProfileSection from './ProfileSection';

interface AccountSectionProps {
  subscriptionTier: 'free' | 'premium';
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

export default function AccountSection({
  subscriptionTier,
  onLogout,
  onDeleteAccount,
}: AccountSectionProps) {
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
    <ProfileSection
      eyebrow="Kontoinställningar"
      title="Hantera ditt konto"
      description="Logga ut från den här enheten eller radera kontot permanent."
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Logga ut */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: 'rgba(255, 247, 237, 0.6)',
            border: '1px solid rgba(249, 115, 22, 0.18)',
          }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
          >
            <LogOut className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900">Logga ut</div>
            <p className="text-xs text-slate-600 mt-0.5">
              Avsluta sessionen på den här enheten.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white hover:bg-orange-50 transition-colors min-h-[40px]"
            style={{
              borderColor: 'rgba(249, 115, 22, 0.35)',
              color: '#9A3412',
            }}
          >
            Logga ut
          </button>
        </div>

        {/* Radera konto */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(225, 29, 72, 0.04) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
          }}
        >
          <button
            type="button"
            onClick={() => setShowDeleteFlow((v) => !v)}
            aria-expanded={showDeleteFlow}
            className="w-full text-left p-4 flex items-center gap-4"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
              }}
            >
              <Trash2 className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900">Radera mitt konto</div>
              <p className="text-xs text-slate-600 mt-0.5">
                Permanent borttagning av all data. Kan inte ångras.
              </p>
            </div>
            <div className="flex-shrink-0 text-rose-600">
              {showDeleteFlow ? (
                <ChevronUp className="w-5 h-5" strokeWidth={2.25} />
              ) : (
                <ChevronDown className="w-5 h-5" strokeWidth={2.25} />
              )}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showDeleteFlow && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 space-y-3">
                  {/* Varnings-bullets */}
                  <div
                    className="rounded-xl p-3.5 flex items-start gap-3"
                    style={{
                      background: 'rgba(254, 226, 226, 0.5)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                    }}
                  >
                    <AlertTriangle
                      className="flex-shrink-0 w-5 h-5 text-rose-600 mt-0.5"
                      strokeWidth={2.25}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-rose-900 mb-1.5">
                        Det här raderas
                      </h4>
                      <ul className="space-y-1 text-xs text-rose-800">
                        <li className="flex items-start gap-1.5">
                          <span className="flex-shrink-0 w-1 h-1 rounded-full bg-rose-500 mt-1.5" />
                          <span>All personlig information</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="flex-shrink-0 w-1 h-1 rounded-full bg-rose-500 mt-1.5" />
                          <span>Uppladdade CV:n och sparade brev</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="flex-shrink-0 w-1 h-1 rounded-full bg-rose-500 mt-1.5" />
                          <span>Genomförda CV-analyser och historik</span>
                        </li>
                        {subscriptionTier === 'premium' && (
                          <li className="flex items-start gap-1.5 font-semibold">
                            <span className="flex-shrink-0 w-1 h-1 rounded-full bg-rose-500 mt-1.5" />
                            <span>
                              Din Premium-prenumeration avslutas inte
                              automatiskt. Avsluta den separat via Stripe.
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Bekräftelse-input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Skriv{' '}
                      <span className="font-bold text-slate-900">
                        radera mitt konto
                      </span>{' '}
                      för att bekräfta:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="radera mitt konto"
                      disabled={isDeleting}
                      className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm min-h-[48px] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-colors"
                      style={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}
                    />
                  </div>

                  {/* Error */}
                  {deleteError && (
                    <div
                      className="rounded-xl p-3 text-sm"
                      style={{
                        background: 'rgba(254, 226, 226, 0.6)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#9F1239',
                      }}
                    >
                      {deleteError}
                    </div>
                  )}

                  {/* Knapp-rad */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteFlow(false);
                        setConfirmText('');
                        setDeleteError('');
                      }}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px]"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                      Avbryt
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={!canConfirmDelete || isDeleting}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all min-h-[44px] disabled:cursor-not-allowed"
                      style={{
                        background:
                          canConfirmDelete && !isDeleting
                            ? 'linear-gradient(135deg, #F43F5E, #E11D48)'
                            : '#E2E8F0',
                        boxShadow:
                          canConfirmDelete && !isDeleting
                            ? '0 8px 20px -6px rgba(225, 29, 72, 0.45)'
                            : 'none',
                        color:
                          canConfirmDelete && !isDeleting ? 'white' : '#94A3B8',
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <motion.span
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          Tar bort
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                          Radera permanent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProfileSection>
  );
}
