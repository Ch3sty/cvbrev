'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, TrendingUp, Gift, AlertCircle,
  CheckCircle, Clock, XCircle, Settings, ExternalLink
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

export function StripeSubscriptionDetails() {
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-details');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription details');
      }

      setDetails(data);
    } catch (err: any) {
      console.error('Error fetching subscription details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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

    return (
      <div className={`${brandColors[brand.toLowerCase()] || 'text-gray-600'}`}>
        <CreditCard className="w-5 h-5" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (error || !details?.hasSubscription) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Ingen aktiv prenumeration hittades</p>
        </div>
      </div>
    );
  }

  const sub = details.subscription!;
  const nextPaymentAmount = sub.discount
    ? sub.amount * (1 - (sub.discount.coupon.percentOff || 0) / 100)
    : sub.amount;

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Prenumerationsöversikt</h3>
          {getStatusBadge(sub.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Period */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {sub.trialEnd ? 'Provperiod slutar' : 'Nästa betalning'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatDate(sub.trialEnd || sub.currentPeriodEnd)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {sub.trialEnd ? 'Efter detta debiteras du automatiskt' : `Period: ${formatDate(sub.currentPeriodStart)} - ${formatDate(sub.currentPeriodEnd)}`}
            </p>
          </div>

          {/* Next Payment Amount */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Nästa betalning</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(nextPaymentAmount, sub.currency)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              per {sub.interval === 'month' ? 'månad' : 'år'}
            </p>
          </div>
        </div>

        {/* Cancellation Warning */}
        {sub.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-900 font-medium">
                  Prenumerationen är uppsagd
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Du har tillgång till Premium fram till {formatDate(sub.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Discount */}
      {sub.discount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">Aktiv rabatt!</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700 mb-1">Rabattbelopp</p>
              <p className="text-3xl font-bold text-green-600">
                {sub.discount.coupon.percentOff}% rabatt
              </p>
              <p className="text-sm text-green-700 mt-2">
                Sparar: {formatCurrency(sub.amount * (sub.discount.coupon.percentOff || 0) / 100, sub.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-green-700 mb-1">Rabattens giltighetstid</p>
              <p className="text-lg font-semibold text-green-900">
                {sub.discount.coupon.duration === 'once' && 'Gäller nästa betalning'}
                {sub.discount.coupon.duration === 'forever' && 'Gäller för alltid'}
                {sub.discount.coupon.duration === 'repeating' &&
                  `Gäller i ${sub.discount.coupon.durationInMonths} månader`}
              </p>
              {sub.discount.end && (
                <p className="text-xs text-green-700 mt-1">
                  Slutar: {formatDate(sub.discount.end)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>✓ Rabatten är automatiskt applicerad</strong> och dras av från din nästa faktura. Du behöver inte göra någonting!
            </p>
          </div>
        </motion.div>
      )}

      {/* Payment Method */}
      {sub.paymentMethod?.card && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Betalningsmetod</h3>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            {getCardBrandIcon(sub.paymentMethod.card.brand)}
            <div className="flex-1">
              <p className="font-medium text-slate-900 capitalize">
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
        </motion.div>
      )}

      {/* Manage Subscription Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-500 rounded-lg">
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
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium rounded-lg hover:from-slate-800 hover:to-slate-950 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Öppna Stripe kundportal</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <p className="text-xs text-slate-600 text-center mt-3">
          Öppnas i ett nytt fönster • Säkert och krypterat via Stripe
        </p>
      </motion.div>
    </div>
  );
}
