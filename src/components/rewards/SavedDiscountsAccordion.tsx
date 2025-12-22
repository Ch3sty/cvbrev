'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
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
  can_use_without_stripe: boolean;
  metadata: any;
}

export default function SavedDiscountsAccordion() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

    if (daysUntilExpiry < 0) return 'Utgånget';
    if (daysUntilExpiry === 0) return 'Går ut idag';
    if (daysUntilExpiry === 1) return 'Går ut imorgon';
    if (daysUntilExpiry <= 7) return `${daysUntilExpiry} dagar kvar`;
    return `Giltigt till ${expiryDate.toLocaleDateString('sv-SE')}`;
  };

  // Filtrera bort utgångna koder
  const activeDiscounts = discounts.filter(d => !isExpired(d.expires_at));

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (activeDiscounts.length === 0) {
    return null; // Visa inte sektionen om inga koder finns
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-slate-50 to-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
    >
      {/* Accordion Header - Klickbar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Sparade Rabattkoder</h3>
            <p className="text-sm text-slate-500">{activeDiscounts.length} {activeDiscounts.length === 1 ? 'kod' : 'koder'} tillgängliga</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-2 rounded-lg bg-slate-100 text-slate-600"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
              {activeDiscounts.map((discount, index) => {
                const expiryText = getExpiryText(discount.expires_at);
                const isCopied = copiedCode === discount.code;

                return (
                  <motion.div
                    key={discount.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Rabattinfo */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100">
                          <Gift className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-bold text-slate-900">
                            {discount.discount_percentage}% rabatt
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{expiryText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Kod + Kopiera */}
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block px-3 py-1.5 bg-slate-100 rounded-lg">
                          <span className="font-mono text-sm font-medium text-slate-700">{discount.code}</span>
                        </div>
                        <button
                          onClick={(e) => handleCopyCode(discount.code, e)}
                          className={`p-2.5 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobilvy: Visa kod */}
                    <div className="sm:hidden mt-3 flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <span className="text-xs text-slate-500">Kod:</span>
                      <span className="font-mono text-sm font-bold text-slate-700">{discount.code}</span>
                    </div>

                    {/* Auto-applied indicator */}
                    {discount.metadata?.auto_applied && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>Automatiskt tillämpad på nästa betalning</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Info och CTA */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-3">
                  Rabattkoder appliceras automatiskt vid betalning för Premium-användare.
                </p>
                <Link
                  href="/dashboard/profil/prenumeration"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Hantera prenumeration
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
