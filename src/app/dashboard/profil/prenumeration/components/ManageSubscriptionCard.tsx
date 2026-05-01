'use client';

import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, ExternalLink } from 'lucide-react';

export default function ManageSubscriptionCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
            }}
          >
            <CreditCard className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Hantera prenumeration
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Uppdatera kort, ladda ner kvitton, eller avsluta — allt på ett ställe.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-5 text-sm">
          <Row label="Plan" value="Premium Månad" />
          <Row label="Pris" value="149 kr/mån" />
          <Row label="Betalning" value="Hanteras via Stripe" />
        </div>

        <a
          href="/api/stripe/create-portal-session"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 touch-manipulation min-h-[48px]"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
          }}
        >
          Öppna Stripe-portalen
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </a>

        {/* Avsluta — synlig sekundär-länk */}
        <div className="mt-3 pt-3 border-t border-orange-100/80 text-center">
          <a
            href="/api/stripe/create-portal-session"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors min-h-[44px]"
          >
            Avsluta prenumerationen
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.25} />
          </a>
          <p className="text-[11px] text-slate-400 mt-1">
            Du kommer åt avsluts-funktionen i Stripe-portalen.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
