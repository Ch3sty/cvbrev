'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, ExternalLink, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  discount_type: string;
  expires_at: string | null;
  is_used: boolean;
  saved_for_future: boolean;
  metadata: any;
}

const SavedDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading discounts:', error);
      } else {
        setDiscounts(data || []);
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getExpiryText = (expiresAt: string | null) => {
    if (!expiresAt) return 'Inget utgångsdatum';

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return 'Utgånget';
    } else if (daysUntilExpiry === 0) {
      return 'Går ut idag';
    } else if (daysUntilExpiry === 1) {
      return 'Går ut imorgon';
    } else if (daysUntilExpiry <= 7) {
      return `Går ut om ${daysUntilExpiry} dagar`;
    } else {
      return `Giltigt till ${expiryDate.toLocaleDateString('sv-SE')}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Inga sparade rabattkoder
        </h3>
        <p className="text-gray-600">
          När du låser upp rabattbelöningar visas de här.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          Dina Sparade Rabattkoder
        </h3>
      </div>

      <div className="grid gap-4">
        {discounts.map((discount) => {
          const expired = isExpired(discount.expires_at);
          const expiryText = getExpiryText(discount.expires_at);
          const isCopied = copiedCode === discount.code;

          return (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 ${
                expired
                  ? 'border-gray-200 opacity-60'
                  : 'border-purple-200 hover:border-purple-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Discount info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-xl ${
                      expired
                        ? 'bg-gray-100'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100'
                    }`}>
                      <Gift className={`w-6 h-6 ${
                        expired ? 'text-gray-400' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {discount.discount_percentage}% rabatt
                      </div>
                      {discount.saved_for_future && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          Sparad för framtiden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 mb-1">Rabattkod:</div>
                        <div className="text-lg font-mono font-bold text-gray-900">
                          {discount.code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(discount.code)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isCopied
                            ? 'bg-green-100 text-green-600'
                            : 'bg-white hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Kopiera kod"
                        disabled={expired}
                      >
                        {isCopied ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expiry info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className={`w-4 h-4 ${
                      expired ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={expired ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {expiryText}
                    </span>
                  </div>

                  {/* Usage note */}
                  {!expired && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-700">
                        <strong>OBS:</strong> Koden kan bara användas en gång och gäller för{' '}
                        {discount.discount_type === 'once' ? 'din nästa betalning' : 'hela prenumerationen'}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side - Action button */}
                {!expired && (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/trial-signup?promo=${discount.code}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 whitespace-nowrap text-sm"
                    >
                      Använd Nu
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Gift className="w-5 h-5 text-blue-600" />
          Om dina rabattkoder
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Rabattkoder kan bara användas en gång</li>
          <li>• Koder gäller automatiskt vid nästa betalning om du uppgraderar</li>
          <li>• Sparade koder kan användas när du är redo att bli Premium</li>
          <li>• Utgångna koder kan inte användas – lås upp nya belöningar för fler rabatter</li>
        </ul>
      </div>
    </div>
  );
};

export default SavedDiscounts;
