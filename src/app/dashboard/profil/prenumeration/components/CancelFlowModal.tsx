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
 *
 * Ramen är Sheet, så scroll-lås, Escape, safe area och fokus följer med.
 * Ingen egen modal, ingen framer-motion.
 */

import { useState } from 'react';
import Sheet from '@/components/shell/Sheet';
import ChoiceCard from '@/components/shell/ChoiceCard';
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

const PRIMARY =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40';

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

  const title = offerDone ? 'Klart' : step === 1 ? 'Innan du avslutar' : 'Ett förslag';

  return (
    <Sheet
      open={open}
      onClose={close}
      title={title}
      size="md"
      footer={
        offerDone ? (
          <button type="button" onClick={close} className={PRIMARY}>
            Stäng
          </button>
        ) : (
          <button
            type="button"
            onClick={goToPortal}
            className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1 hover:decoration-ink-1"
          >
            Avsluta ändå
          </button>
        )
      }
    >
      {offerDone ? (
        <OfferConfirmation offer={offerDone} />
      ) : step === 1 ? (
        <>
          <p className="mb-4 text-sm text-ink-2">
            Vad fick dig att vilja avsluta? Svaret hjälper oss att bli bättre.
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="Anledning">
            {REASONS.map(({ key, label, Icon }) => (
              <ChoiceCard
                key={key}
                selected={reason === key}
                onSelect={() => setReason(key)}
                title={label}
                leading={<Icon size={24} />}
              />
            ))}
          </div>

          {reason === 'saknar_funktion' && (
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium text-ink-2">Vad saknade du?</span>
              <textarea
                value={freeText}
                onChange={(event) => setFreeText(event.target.value.slice(0, 300))}
                enterKeyHint="enter"
                inputMode="text"
                autoComplete="off"
                rows={3}
                maxLength={300}
                className="w-full resize-none rounded-lg border border-kant bg-insunken px-3 py-2 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
              />
              <span className="mt-1 block text-meta tabular-nums text-ink-3">
                {freeText.length} av 300
              </span>
            </label>
          )}

          <button
            type="button"
            onClick={submitReason}
            disabled={!reason || saving}
            className={`mt-5 ${PRIMARY}`}
          >
            {saving ? 'Sparar' : 'Fortsätt'}
          </button>
        </>
      ) : (
        <OfferStep reason={reason} loading={offerLoading} error={error} onAccept={acceptOffer} />
      )}
    </Sheet>
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
        <div className="mb-3 flex items-start gap-3">
          <IlluPaus size={48} className="shrink-0 text-ink-2" />
          <div>
            <h3 className="text-kort text-ink-1">Grattis till jobbet</h3>
            <p className="mt-1 text-sm text-ink-2">
              Vi pausar i tre månader så finns allt kvar om du behöver oss igen. Inget dras under
              tiden.
            </p>
          </div>
        </div>
        {error && <p className="mb-2 text-sm text-fel">{error}</p>}
        <button
          type="button"
          onClick={() => onAccept('pause')}
          disabled={loading}
          className={PRIMARY}
        >
          {loading ? 'Aktiverar' : 'Pausa i tre månader'}
        </button>
      </div>
    );
  }

  if (reason === 'for_dyrt') {
    return (
      <div>
        <h3 className="text-kort text-ink-1">Om det var priset</h3>
        <p className="mb-3 mt-1 text-sm text-ink-2">
          Vi kan möta dig halvvägs: 49 kr i månaden i två månader, sedan ordinarie 149 kr. Du kan
          avsluta när du vill.
        </p>
        {error && <p className="mb-2 text-sm text-fel">{error}</p>}
        <button
          type="button"
          onClick={() => onAccept('discount')}
          disabled={loading}
          className={PRIMARY}
        >
          {loading ? 'Aktiverar' : 'Fortsätt för 49 kr i månaden'}
        </button>
      </div>
    );
  }

  if (reason === 'anvander_inte') {
    return (
      <div>
        <h3 className="text-kort text-ink-1">Kanske missade du det bästa</h3>
        <p className="mb-3 mt-1 text-sm text-ink-2">
          De flesta som fastnar har inte kört CV-analysen. Den tar två minuter och visar vad en
          rekryterare ser.
        </p>
        <a href="/dashboard/cv-analys" className={PRIMARY}>
          Kör analysen först
        </a>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-kort text-ink-1">Tack, det tar vi med oss</h3>
      <p className="mt-1 text-sm text-ink-2">
        Vi läser allt som skrivs här och det styr vad vi bygger härnäst.
      </p>
    </div>
  );
}

function OfferConfirmation({ offer }: { offer: string }) {
  return (
    <div>
      <h3 className="text-kort text-ink-1">
        {offer === 'pause' ? 'Prenumerationen är pausad' : 'Rabatten är aktiverad'}
      </h3>
      <p className="mt-1 text-sm text-ink-2">
        {offer === 'pause'
          ? 'Vi hör av oss innan den startar igen om tre månader. Allt du skapat ligger kvar.'
          : 'De två kommande månaderna kostar 49 kr. Sedan gäller ordinarie pris igen.'}
      </p>
    </div>
  );
}
