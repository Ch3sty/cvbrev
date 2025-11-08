'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Gift, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activationResult: {
    success: boolean;
    type: 'temporary_premium' | 'extension' | 'discount_saved' | 'discount_created' | 'subscription_credit';
    message: string;
    rewardName?: string;
    rewardType?: string;
    data?: {
      expiresAt?: string;
      durationDays?: number;
      newExpiryDate?: string;
      daysAdded?: number;
      promoCode?: string | null;
      couponId?: string;
      discountPercentage?: number;
      savedForLater?: boolean;
      autoApplied?: boolean;
      estimatedValue?: number;
    };
  } | null;
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  activationResult
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activationResult) return null;

  const handleCopyCode = () => {
    if (activationResult.data?.promoCode) {
      navigator.clipboard.writeText(activationResult.data.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    const { type, message, data } = activationResult;

    // TEMPORARY PREMIUM (Free users getting Premium)
    if (type === 'temporary_premium' && data?.expiresAt) {
      const expiryDate = new Date(data.expiresAt);
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Aktiverat!
          </h3>
          <p className="text-lg text-gray-600 mb-6">{message}</p>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Premium giltig till</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {expiryDate.toLocaleDateString('sv-SE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ({data.durationDays} dagar)
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
          >
            Utforska Premium-funktioner
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      );
    }

    // EXTENSION (Adding days to existing premium)
    if (type === 'extension' && data?.newExpiryDate) {
      const newDate = new Date(data.newExpiryDate);
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Förlängd!
          </h3>
          <p className="text-lg text-gray-600 mb-6">{message}</p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              +{data.daysAdded} dagar
            </div>
            <div className="text-sm text-gray-600 mb-3">tillagda på din premiumtid</div>
            <div className="pt-3 border-t border-emerald-200">
              <div className="text-sm text-gray-700 mb-1">Nytt utgångsdatum:</div>
              <div className="text-lg font-semibold text-gray-900">
                {newDate.toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Stäng
          </button>
        </div>
      );
    }

    // DISCOUNT SAVED (Free users saving discount for later)
    if (type === 'discount_saved' && data?.promoCode) {
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6"
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Rabattkod Sparad!
          </h3>
          <p className="text-lg text-gray-600 mb-6">{message}</p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <div className="text-sm text-gray-700 mb-2">Din rabattkod:</div>
            <div className="text-2xl font-bold text-indigo-700 mb-4">
              {data.discountPercentage}% rabatt
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-indigo-300">
              <div className="text-xs text-gray-600 mb-1">Kod:</div>
              <div className="text-lg font-mono font-bold text-gray-900">
                {data.promoCode}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Koden är sparad och kan användas när du uppgraderar till Premium
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/rewards"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Visa Mina Rabatter
            </Link>
            <Link
              href="/dashboard/profil/prenumeration"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Uppgradera till Premium
            </Link>
          </div>
        </div>
      );
    }

    // DISCOUNT CREATED (Paying users getting Stripe discount)
    if (type === 'discount_created') {
      // Auto-applied discount (no promo code needed)
      if (data?.autoApplied) {
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Rabatt Automatiskt Applicerad!
            </h3>
            <p className="text-lg text-gray-600 mb-6">{message}</p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="text-3xl font-bold text-emerald-600 mb-4">
                {data.discountPercentage}% rabatt
              </div>

              <div className="bg-emerald-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-emerald-900 font-semibold mb-2">
                  ✓ Rabatten är nu aktiv på din prenumeration
                </p>
                <p className="text-xs text-emerald-800">
                  Du får automatiskt {data.discountPercentage}% rabatt på din nästa månadsbetalning. Ingen kod behövs!
                </p>
              </div>

              <p className="text-xs text-gray-600">
                Du kan se din rabatt i din prenumerationsöversikt
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Stäng
              </button>
              <Link
                href="/dashboard/profil/prenumeration"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Visa Prenumeration
              </Link>
            </div>
          </div>
        );
      }

      // Manual promo code (shouldn't happen, but fallback)
      if (data?.promoCode) {
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-6"
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Rabattkod Skapad!
            </h3>
            <p className="text-lg text-gray-600 mb-6">{message}</p>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
              <div className="text-3xl font-bold text-orange-600 mb-4">
                {data.discountPercentage}% rabatt
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-orange-300 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">Din rabattkod:</div>
                    <div className="text-lg font-mono font-bold text-gray-900">
                      {data.promoCode}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Kopiera kod"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-orange-100 rounded-lg p-3 text-sm text-gray-700">
                <strong>OBS:</strong> Koden kan bara användas en gång och gäller för din nästa betalning.
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Stäng
            </button>
          </div>
        );
      }
    }

    // SUBSCRIPTION CREDIT (Paying users getting days added)
    if (type === 'subscription_credit' && data?.daysAdded) {
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Prenumeration Förlängd!
          </h3>
          <p className="text-lg text-gray-600 mb-6">{message}</p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              +{data.daysAdded} dagar
            </div>
            <div className="text-sm text-gray-600">
              tillagda på din prenumeration
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Dina bonusdagar har registrerats och du får tillbaka dem vid nästa betalning.
          </p>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Stäng
          </button>
        </div>
      );
    }

    // Fallback
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Belöning Aktiverad!</h3>
        <p className="text-lg text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          Stäng
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Stäng modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActivationModal;
