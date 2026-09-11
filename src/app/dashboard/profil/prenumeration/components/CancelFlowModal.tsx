'use client';

/**
 * Uppsägningsflödet i tre steg (docs/plan-konvertering.md, D6).
 *
 * Steg 1: enkät, ett val.
 * Steg 2: erbjudande beroende på svaret.
 * Steg 3: "Avsluta ändå" leder till Stripe-portalen, precis som tidigare.
 *
 * Flödet får aldrig hindra någon från att säga upp: "Avsluta ändå" finns
 * synlig i varje steg.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check } from 'lucide-react';
import {
  IlluCancelFickJobb,
  IlluCancelForDyrt,
  IlluCancelAnvanderInte,
  IlluCancelSaknarFunktion,
  IlluPaus,
} from '@/components/illustrations/CancelIllustrations';

type Reason = 'fick_jobb' | 'for_dyrt' | 'anvander_inte' | 'saknar_funktion';

const REASONS: Array<{
  key: Reason;
  label: string;
  Icon: (props: { size?: number; className?: string }) => React.ReactElement;
}> = [
  { key: 'fick_jobb', label: 'Jag fick jobb', Icon: IlluCancelFickJobb },
  { key: 'for_dyrt', label: 'För dyrt', Icon: IlluCancelForDyrt },
  { key: 'anvander_inte', label: 'Jag använder det inte', Icon: IlluCancelAnvanderInte },
  { key: 'saknar_funktion', label: 'Saknar en funktion', Icon: IlluCancelSaknarFunktion },
];

const PORTAL_URL = '/api/stripe/create-portal-session';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CancelFlowModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<Reason | null>(null);
  const [freeText, setFreeText] = useState('');
  const [intentId, setIntentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerDone, setOfferDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setReason(null);
    setFreeText('');
    setIntentId(null);
    setOfferDone(null);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submitReason = async () => {
    if (!reason) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/subscription/cancel-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, freeText: freeText || undefined }),
      });
      const data = await res.json();
      if (res.ok) setIntentId(data.id ?? null);
      // Även om loggningen fallerar ska användaren komma vidare.
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const acceptOffer = async (offer: 'pause' | 'discount') => {
    setOfferLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscription/retention-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer, intentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Det gick inte att aktivera erbjudandet. Försök igen.');
        return;
      }
      setOfferDone(offer);
    } catch {
      setError('Det gick inte att aktivera erbjudandet. Försök igen.');
    } finally {
      setOfferLoading(false);
    }
  };

  const goToPortal = async () => {
    if (intentId) {
      // Markera att uppsägningen fullföljdes innan vi lämnar sidan.
      try {
        await fetch('/api/subscription/cancel-intent', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: intentId, completedCancel: true }),
        });
      } catch {
        // Statistik får aldrig blockera uppsägningen.
      }
    }
    window.location.href = PORTAL_URL;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 p-0 sm:p-4"
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl border border-neutral-200 shadow-lg overflow-hidden"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Avsluta prenumerationen"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h2 className="text-base font-semibold text-neutral-900">
              {offerDone ? 'Klart' : step === 1 ? 'Innan du avslutar' : 'Ett förslag'}
            </h2>
            <button
              onClick={close}
              className="w-11 h-11 -mr-3 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
              aria-label="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            {offerDone ? (
              <OfferConfirmation offer={offerDone} onClose={close} />
            ) : step === 1 ? (
              <>
                <p className="text-sm text-neutral-600 mb-4">
                  Vad fick dig att vilja avsluta? Svaret hjälper oss att bli bättre.
                </p>
                <div className="space-y-2">
                  {REASONS.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => setReason(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors min-h-[44px] ${
                        reason === key
                          ? 'border-orange-300 bg-orange-50 text-neutral-900'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <Icon size={24} className="flex-shrink-0 text-neutral-500" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>

                {reason === 'saknar_funktion' && (
                  <div className="mt-3">
                    <textarea
                      value={freeText}
                      onChange={(event) => setFreeText(event.target.value.slice(0, 300))}
                      rows={3}
                      maxLength={300}
                      placeholder="Vad saknade du?"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-orange-400 resize-none"
                    />
                    <p className="text-xs text-neutral-400 mt-1 tabular-nums">
                      {freeText.length} / 300
                    </p>
                  </div>
                )}

                <button
                  onClick={submitReason}
                  disabled={!reason || saving}
                  className="mt-5 w-full h-11 rounded-lg bg-orange-600 text-white text-sm font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Fortsätt
                </button>
              </>
            ) : (
              <OfferStep
                reason={reason}
                loading={offerLoading}
                error={error}
                onAccept={acceptOffer}
              />
            )}

            {!offerDone && (
              <button
                onClick={goToPortal}
                className="mt-3 w-full h-11 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Avsluta ändå
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function OfferStep({
  reason,
  loading,
  error,
  onAccept,
}: {
  reason: Reason | null;
  loading: boolean;
  error: string | null;
  onAccept: (offer: 'pause' | 'discount') => void;
}) {
  if (reason === 'fick_jobb') {
    return (
      <div>
        <div className="flex items-start gap-3 mb-3">
          <IlluPaus size={48} className="flex-shrink-0 text-neutral-600" />
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Grattis till jobbet</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Vi pausar i tre månader så finns allt kvar om du behöver oss igen. Inget dras
              under tiden.
            </p>
          </div>
        </div>
        {error && <p className="text-sm text-red-700 mb-2">{error}</p>}
        <button
          onClick={() => onAccept('pause')}
          disabled={loading}
          className="w-full h-11 rounded-lg bg-orange-600 text-white text-sm font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Pausa i tre månader
        </button>
      </div>
    );
  }

  if (reason === 'for_dyrt') {
    return (
      <div>
        <h3 className="text-base font-semibold text-neutral-900">Om det var priset</h3>
        <p className="text-sm text-neutral-600 mt-1 mb-3">
          Vi kan möta dig halvvägs: 49 kr i månaden i två månader, sedan ordinarie 149 kr.
          Du kan avsluta när du vill.
        </p>
        {error && <p className="text-sm text-red-700 mb-2">{error}</p>}
        <button
          onClick={() => onAccept('discount')}
          disabled={loading}
          className="w-full h-11 rounded-lg bg-orange-600 text-white text-sm font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Fortsätt för 49 kr i månaden
        </button>
      </div>
    );
  }

  if (reason === 'anvander_inte') {
    return (
      <div>
        <h3 className="text-base font-semibold text-neutral-900">Kanske missade du det bästa</h3>
        <p className="text-sm text-neutral-600 mt-1 mb-3">
          De flesta som fastnar har inte kört CV-analysen. Den tar två minuter och visar vad
          en rekryterare ser.
        </p>
        <a
          href="/dashboard/cv-analys"
          className="w-full h-11 rounded-lg bg-orange-600 text-white text-sm font-semibold inline-flex items-center justify-center"
        >
          Kör analysen först
        </a>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-neutral-900">Tack, det tar vi med oss</h3>
      <p className="text-sm text-neutral-600 mt-1">
        Vi läser allt som skrivs här och det styr vad vi bygger härnäst.
      </p>
    </div>
  );
}

function OfferConfirmation({ offer, onClose }: { offer: string; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-orange-50 border border-orange-200 inline-flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
        </span>
        <h3 className="text-base font-semibold text-neutral-900">
          {offer === 'pause' ? 'Prenumerationen är pausad' : 'Rabatten är aktiverad'}
        </h3>
      </div>
      <p className="text-sm text-neutral-600 mb-4">
        {offer === 'pause'
          ? 'Vi hör av oss innan den startar igen om tre månader. Allt du skapat ligger kvar.'
          : 'De två kommande månaderna kostar 49 kr. Sedan gäller ordinarie pris igen.'}
      </p>
      <button
        onClick={onClose}
        className="w-full h-11 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-800"
      >
        Stäng
      </button>
    </div>
  );
}
