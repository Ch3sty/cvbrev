'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import CancelFlowModal from './CancelFlowModal';

const STATUS_TEXT: Record<string, string> = {
  active: 'Aktiv',
  trialing: 'Provperiod',
  past_due: 'Betalning misslyckades',
  unpaid: 'Obetald',
  canceled: 'Avslutad',
};

export default function ManageSubscriptionCard() {
  const { subscriptionStatus, currentPeriodEnd } = useProfile();
  // Spår D6: uppsägning går genom enkät + erbjudande innan Stripe-portalen.
  const [cancelOpen, setCancelOpen] = useState(false);

  const statusLabel = subscriptionStatus
    ? STATUS_TEXT[subscriptionStatus] || subscriptionStatus
    : 'Hanteras via Stripe';

  const renewalLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('sv-SE')
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative bg-white rounded-xl border border-orange-100 overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-orange-600" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
              Hantera prenumeration
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
              Uppdatera kort, ladda ner kvitton, eller avsluta, allt på ett ställe.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-5 text-sm">
          <Row label="Plan" value="Premium Månad" />
          <Row label="Pris" value="149 kr/mån" />
          <Row label="Status" value={statusLabel} />
          {renewalLabel && <Row label="Nästa betalning" value={renewalLabel} />}
        </div>

        <a
          href="/api/stripe/create-portal-session"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 transition-all hover:-translate-y-0.5 touch-manipulation min-h-[48px]"
        >
          Öppna Stripe-portalen
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </a>

        {/* Avsluta, öppnar uppsägningsflödet (D6) i stället för portalen direkt */}
        <div className="mt-3 pt-3 border-t border-orange-100/80 text-center">
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors min-h-[44px]"
          >
            Avsluta prenumerationen
          </button>
        </div>
      </div>

      <CancelFlowModal open={cancelOpen} onClose={() => setCancelOpen(false)} />
    </motion.section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-neutral-600">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
