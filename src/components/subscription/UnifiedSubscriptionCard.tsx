'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/use-profile';
import {
  Crown, CheckCircle, FileText, PenTool, Lightbulb, Lock,
  Infinity as InfinityIcon, Info, Search, Palette, Brain,
  CreditCard, Calendar, TrendingUp, Gift, AlertCircle,
  Clock, XCircle, Settings, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';

interface SubscriptionDetails {
  hasSubscription: boolean;
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    currentPeriodStart: number;
    cancelAtPeriodEnd: boolean;
    cancelAt: number | null;
    trialEnd: number | null;
    amount: number;
    currency: string;
    interval: string;
    discount: {
      coupon: {
        id: string;
        percentOff: number | null;
        amountOff: number | null;
        duration: string;
        durationInMonths: number | null;
      };
      start: number;
      end: number | null;
    } | null;
    paymentMethod: {
      type: string;
      card: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      } | null;
    } | null;
    latestInvoice: {
      amountDue: number;
      amountPaid: number;
      status: string;
    } | null;
  };
}

export function UnifiedSubscriptionCard() {
  const {
    subscriptionTier,
    weeklyLetterCount,
    weeklyLetterLimit,
    cvCount,
    maxCvCount,
    savedLettersCount,
    maxSavedLetters,
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit,
    loading: profileLoading
  } = useProfile();

  const [stripeDetails, setStripeDetails] = useState<SubscriptionDetails | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [showUsageDetails, setShowUsageDetails] = useState(true);
  const [showBillingDetails, setShowBillingDetails] = useState(true);

  const isPremium = subscriptionTier === 'premium';
  const hasStripeSubscription = stripeDetails?.hasSubscription;

  useEffect(() => {
    if (isPremium) {
      fetchSubscriptionDetails();
    } else {
      setLoadingStripe(false);
    }
  }, [isPremium]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-details');
      const data = await response.json();
      if (response.ok) {
        setStripeDetails(data);
      }
    } catch (err) {
      console.error('Error fetching subscription details:', err);
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const response = await fetch('/api/stripe/create-customer-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'sek') => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      active: {
        label: 'Aktiv',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />
      },
      trialing: {
        label: 'Provperiod',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Clock className="w-4 h-4" />
      },
      canceled: {
        label: 'Avslutad',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <XCircle className="w-4 h-4" />
      },
      past_due: {
        label: 'Förfallen',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: <AlertCircle className="w-4 h-4" />
      },
    };

    const config = statusConfig[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <AlertCircle className="w-4 h-4" />
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} font-medium text-sm`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const getCardBrandIcon = (brand: string) => {
    const brandColors: Record<string, string> = {
      visa: 'text-blue-600',
      mastercard: 'text-orange-600',
      amex: 'text-blue-800',
    };
    return brandColors[brand.toLowerCase()] || 'text-gray-600';
  };

  if (profileLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-200/50 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-5/6"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-4/5"></div>
        </div>
      </div>
    );
  }

  const sub = stripeDetails?.subscription;
  const nextPaymentAmount = sub?.discount
    ? sub.amount * (1 - (sub.discount.coupon.percentOff || 0) / 100)
    : sub?.amount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 border-b border-gray-200/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shadow-lg ${
              isPremium
                ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prenumeration</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {hasStripeSubscription ? 'Din aktiva prenumeration' : 'Användning och funktioner'}
              </p>
            </div>
          </div>
          <div className={`
            px-4 py-2 rounded-xl text-xs font-semibold shadow-sm
            ${isPremium
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900'
              : 'bg-gray-100 text-gray-600'}
          `}>
            {isPremium ? 'Premium' : 'Gratis'}
          </div>
        </div>
      </div>

      {/* Stripe Subscription Details (for Premium with Stripe) */}
      {hasStripeSubscription && sub && (
        <div className="p-6 space-y-6">
          {/* Status & Quick Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Status</h3>
              {getStatusBadge(sub.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Next Payment Date */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {sub.trialEnd ? 'Provperiod slutar' : 'Nästa betalning'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {formatDate(sub.trialEnd || sub.currentPeriodEnd)}
                </p>
                <p className="text-xs text-slate-600">
                  {sub.trialEnd ? 'Efter detta debiteras du automatiskt' :
                    `Period: ${formatDate(sub.currentPeriodStart)} - ${formatDate(sub.currentPeriodEnd)}`}
                </p>
              </div>

              {/* Next Payment Amount */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Nästa betalning</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {formatCurrency(nextPaymentAmount, sub.currency)}
                </p>
                <p className="text-xs text-slate-600">
                  per {sub.interval === 'month' ? 'månad' : 'år'}
                </p>
              </div>
            </div>

            {/* Cancellation Warning */}
            {sub.cancelAtPeriodEnd && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-900 font-semibold">
                      Prenumerationen är uppsagd
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Du har tillgång till Premium fram till {formatDate(sub.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Discount */}
          {sub.discount && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg shadow-sm">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">Aktiv rabatt!</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 mb-1">Rabattbelopp</p>
                  <p className="text-3xl font-bold text-green-600">
                    {sub.discount.coupon.percentOff}%
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Sparar: {formatCurrency(sub.amount * (sub.discount.coupon.percentOff || 0) / 100, sub.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-green-700 mb-1">Giltighetstid</p>
                  <p className="text-lg font-semibold text-green-900">
                    {sub.discount.coupon.duration === 'once' && 'Nästa betalning'}
                    {sub.discount.coupon.duration === 'forever' && 'För alltid'}
                    {sub.discount.coupon.duration === 'repeating' &&
                      `${sub.discount.coupon.durationInMonths} månader`}
                  </p>
                  {sub.discount.end && (
                    <p className="text-xs text-green-700 mt-1">
                      Slutar: {formatDate(sub.discount.end)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-green-100/50 rounded-lg border border-green-200/50">
                <p className="text-xs text-green-800">
                  <strong>✓ Automatiskt applicerad</strong> – Rabatten dras av från din nästa faktura. Ingen åtgärd krävs!
                </p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {sub.paymentMethod?.card && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Betalningsmetod</h3>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                <div className={getCardBrandIcon(sub.paymentMethod.card.brand)}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 capitalize">
                    {sub.paymentMethod.card.brand}
                  </p>
                  <p className="text-sm text-slate-600">
                    •••• •••• •••• {sub.paymentMethod.card.last4}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Utgår</p>
                  <p className="text-sm font-medium text-slate-900">
                    {sub.paymentMethod.card.expMonth}/{sub.paymentMethod.card.expYear}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200"></div>
        </div>
      )}

      {/* Usage & Limits Section */}
      <div className="p-6">
        <button
          onClick={() => setShowUsageDetails(!showUsageDetails)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            Användning och funktioner
          </h3>
          {showUsageDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {showUsageDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1 overflow-hidden"
            >
              {/* Personal Letters */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <PenTool className="w-4 h-4 mr-3 text-pink-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Personliga brev (per dag)</span>
                </div>
                <div className="text-sm font-semibold">
                  {isPremium ? (
                    <div className="text-gray-900 flex items-center">
                      <InfinityIcon className="w-4 h-4 mr-1 text-pink-600" />
                      <span>Obegränsat</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <span className={(weeklyLetterCount ?? 0) >= 2 ? 'text-red-600 font-bold' : ''}>
                        {weeklyLetterCount ?? 0}
                      </span> / 2
                    </div>
                  )}
                </div>
              </div>

              {/* CV Analyses */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <Search className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">CV-analyser (var tredje dag)</span>
                </div>
                <div className="text-sm font-semibold">
                  {isPremium ? (
                    <div className="text-gray-900 flex items-center">
                      <InfinityIcon className="w-4 h-4 mr-1 text-blue-600" />
                      <span>Obegränsat</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <span className={(1 - (remainingWeeklyAnalyses ?? 1)) >= 1 ? 'text-red-600 font-bold' : ''}>
                        {1 - (remainingWeeklyAnalyses ?? 1)}
                      </span> / 1
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded CVs */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-3 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Uppladdade CV</span>
                </div>
                <div className="text-sm font-semibold">
                  <div className="text-gray-900">
                    <span className={(cvCount ?? 0) >= (isPremium ? 50 : 2) ? 'text-red-600 font-bold' : ''}>
                      {cvCount ?? 0}
                    </span> / {isPremium ? 50 : 2}
                  </div>
                </div>
              </div>

              {/* Saved Letters */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-3 text-emerald-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Sparade brev</span>
                </div>
                <div className="text-sm font-semibold">
                  {isPremium ? (
                    <div className="text-gray-900 flex items-center">
                      <InfinityIcon className="w-4 h-4 mr-1 text-emerald-600" />
                      <span>Obegränsat</span>
                    </div>
                  ) : (
                    <div className="text-gray-900">
                      <span className={(savedLettersCount ?? 0) >= 2 ? 'text-red-600 font-bold' : ''}>
                        {savedLettersCount ?? 0}
                      </span> / 2
                    </div>
                  )}
                </div>
              </div>

              {/* Tone Adjustment */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <Lightbulb className="w-4 h-4 mr-3 text-yellow-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Tonalitetsanpassning</span>
                </div>
                <div className="flex items-center">
                  {isPremium ? (
                    <div className="flex items-center text-sm text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Tillgänglig</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-4 h-4 mr-1" />
                      <span>Endast Premium</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium CV Templates */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <Palette className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Premium CV-mallar</span>
                </div>
                <div className="flex items-center">
                  {isPremium ? (
                    <div className="flex items-center text-sm text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>42 mallar</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-4 h-4 mr-1" />
                      <span>12 gratis, 30 premium</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cognitive Tests */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center text-sm">
                  <Brain className="w-4 h-4 mr-3 text-orange-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Avancerade kognitiva tester</span>
                </div>
                <div className="flex items-center">
                  {isPremium ? (
                    <div className="flex items-center text-sm text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Obegränsat</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-4 h-4 mr-1" />
                      <span>Grundnivå gratis, 1/dag</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Access */}
              <div className="flex items-center justify-between py-3 border-t border-gray-300 mt-3 pt-3">
                <div className="flex items-center text-sm">
                  <Crown className="w-4 h-4 mr-3 text-yellow-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Obegränsad tillgång</span>
                </div>
                <div className="flex items-center">
                  {isPremium ? (
                    <div className="flex items-center text-sm text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Aktiverad</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-4 h-4 mr-1" />
                      <span>Endast Premium</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Box */}
      <div className="px-6 pb-6">
        {isPremium ? (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Info className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm text-yellow-800">
                Som Premium-medlem har du tillgång till alla funktioner och obegränsad användning.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-800">
                Du använder Gratis-planen. Uppgradera till Premium för att låsa upp alla funktioner.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manage Subscription (for Stripe users) */}
      {hasStripeSubscription && (
        <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700 rounded-lg shadow-sm">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">Hantera prenumeration</h3>
              <p className="text-sm text-slate-600">
                Uppdatera betalningsmetod, se fakturor eller avsluta prenumeration
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenPortal}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium rounded-xl hover:from-slate-800 hover:to-slate-950 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Öppna Stripe kundportal</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-xs text-slate-600 text-center mt-3">
            Öppnas i nytt fönster • Säkert via Stripe
          </p>
        </div>
      )}
    </motion.div>
  );
}
