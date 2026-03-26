'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Crown,
  CheckCircle,
  Clock,
  Gift,
  Shield,
  Calendar,
  Zap,
  Info,
  Sparkles,
  ArrowRight,
  PenTool,
  Search,
  FileText,
  Palette,
  Brain,
  Infinity as InfinityIcon,
  ChevronDown,
  ChevronUp,
  CreditCard,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { EmbeddedSubscribeButton } from '@/components/subscription/EmbeddedSubscribeButton';

export default function PrenumerationPage() {
  const {
    subscriptionTier,
    loading: profileLoading,
    premiumUntil,
    premiumSource,
    isTrialUser,
    isAdminGranted,
    weeklyLetterCount,
    cvCount,
    savedLettersCount
  } = useProfile();

  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usageExpanded, setUsageExpanded] = useState(false);
  const [stripeExpanded, setStripeExpanded] = useState(false);

  // Visa felmeddelande från URL (t.ex. efter misslyckad portal-redirect)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      // Ta bort error från URL efter visning
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  const isPremium = subscriptionTier === 'premium';
  const isFree = subscriptionTier === 'free';
  const isOnboardingReward = premiumSource === 'onboarding_completion';
  const isGuestInvitation = premiumSource === 'guest_invitation';

  // Stripe Price ID
  const premiumMonthlyPriceId = "price_1SQSVlPWMWdjmTDjx1yo9m00";

  // Premium-fördelar
  const premiumFeatures = [
    {
      icon: <PenTool className="w-5 h-5" />,
      title: 'Obegränsade brev',
      description: 'Skriv så många personliga brev du behöver',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'CV-analyser',
      description: 'Optimera ditt CV hur ofta du vill',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: '50 sparade CV',
      description: 'Hantera alla dina CV-versioner',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: '8 Premium-mallar',
      description: 'Professionella CV-designs',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'Kognitiva tester',
      description: 'Träna inför rekryteringstester',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Tonalitetsanpassning',
      description: 'Anpassa språk och stil',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      icon: <InfinityIcon className="w-5 h-5" />,
      title: 'Obegränsad lagring',
      description: 'Spara allt du skapar',
      gradient: 'from-pink-500 to-purple-600'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Prioriterad support',
      description: 'Snabbare svar på dina frågor',
      gradient: 'from-yellow-500 to-amber-600'
    }
  ];

  // Helper function to calculate time remaining
  const getTimeRemaining = () => {
    if (!premiumUntil) return null;

    const now = new Date();
    const expiry = new Date(premiumUntil);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  if (profileLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl">
          <div className="flex justify-center items-center p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-pink-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs (samma som /rewards) */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.9 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        <div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float-orb1 25s ease-in-out infinite'
          }}
        />
        <div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float-orb2 30s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'float-orb3 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl relative z-10">
        <div className="space-y-4 sm:space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                <p className="text-xs text-red-600 mt-1">
                  Kontakta support@jobbcoach.ai om problemet kvarstår.
                </p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0
                ${isPremium
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}
              >
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Prenumeration
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
                  {isPremium ? 'Hantera din Premium-prenumeration' : 'Uppgradera för full tillgång'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status Card - olika för Premium/Trial/Free */}
          {isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl border border-amber-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
            >
              {/* Bakgrundsdekor */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full -translate-y-8 translate-x-8" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Premium</h2>
                      {isTrialUser && (
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                          Provperiod
                        </span>
                      )}
                      {isOnboardingReward && (
                        <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                          Belöning
                        </span>
                      )}
                      {isGuestInvitation && (
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                          Gäst
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-amber-700 font-medium">
                      {isTrialUser || isOnboardingReward || isGuestInvitation ? (
                        timeRemaining && !timeRemaining.expired ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {timeRemaining.days} {timeRemaining.days === 1 ? 'dag' : 'dagar'} kvar
                          </span>
                        ) : (
                          'Provperiod utgången'
                        )
                      ) : (
                        'Aktiv prenumeration'
                      )}
                    </p>
                  </div>
                </div>

                {/* Countdown för trial/temporary premium */}
                {(isTrialUser || isOnboardingReward || isGuestInvitation) && timeRemaining && !timeRemaining.expired && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 mb-4 border border-amber-200/30 shadow-lg">
                    <div className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                      {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Går ut: {premiumUntil && new Date(premiumUntil).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA för trial users */}
                {(isTrialUser || isOnboardingReward || isGuestInvitation) && (
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-6 h-6 flex-shrink-0" />
                      <h4 className="font-bold text-lg">Fortsätt med Premium utan avbrott</h4>
                    </div>
                    <p className="text-white/90 text-sm mb-4">
                      Uppgradera nu och behåll alla dina premium-funktioner. Ingen bindningstid - avsluta när du vill.
                    </p>
                    <EmbeddedSubscribeButton
                      priceId={premiumMonthlyPriceId}
                      planName="Premium Månad"
                      className="w-full bg-white text-amber-600 hover:bg-amber-50 font-bold touch-manipulation"
                    />
                    <p className="text-center text-white/80 text-xs mt-3">
                      149 kr/månad • Ingen bindningstid
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // Free User - Trial CTA
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-pink-300/40 p-4 sm:p-6 shadow-xl relative overflow-hidden"
            >
              {/* Decorative gradient orbs */}
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-purple-400/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Testa Premium gratis
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  7 dagar full tillgång • 0 kr under provperioden
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-900">7 dagar gratis</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                    <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-900">0 kr första 7 dagarna</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-900">Ingen bindningstid</span>
                  </div>
                </div>

                <EmbeddedSubscribeButton
                  priceId={premiumMonthlyPriceId}
                  planName="Premium Trial"
                  apiEndpoint="/api/stripe/create-trial-upgrade-session"
                  buttonText="Prova gratis i 7 dagar"
                />
                <p className="text-xs text-center text-slate-600 mt-2">
                  149 kr/mån efter provperiod • Ingen bindningstid
                </p>
              </div>
            </motion.div>
          )}

          {/* Premium Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
          >
            {/* Bakgrundsdekor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-8 translate-x-8" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Vad ingår i Premium?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md flex-shrink-0`}>
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Usage Stats (Collapsible) */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
            >
              <div className="relative z-10">
                <button
                  onClick={() => setUsageExpanded(!usageExpanded)}
                  className="w-full flex items-center justify-between mb-4 touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <InfinityIcon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Min användning</h2>
                  </div>
                  {usageExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                </button>

                {usageExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Personliga brev denna vecka</span>
                        <div className="flex items-center gap-2">
                          <InfinityIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-slate-900">Obegränsat</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Du har skrivit {weeklyLetterCount || 0} brev denna vecka</p>
                    </div>

                    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Sparade CV</span>
                        <span className="text-sm font-bold text-slate-900">{cvCount || 0} / 50</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Sparade brev</span>
                        <div className="flex items-center gap-2">
                          <InfinityIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-slate-900">Obegränsat</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Du har {savedLettersCount || 0} sparade brev</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stripe Details (för betalande premium) */}
          {isPremium && !isTrialUser && !isAdminGranted && !isOnboardingReward && !isGuestInvitation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
            >
              <div className="relative z-10">
                <button
                  onClick={() => setStripeExpanded(!stripeExpanded)}
                  className="w-full flex items-center justify-between mb-4 touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Betalningsinformation</h2>
                  </div>
                  {stripeExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                </button>

                {stripeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-600 mb-3">
                        Hantera din prenumeration, betalningssätt och fakturor via Stripe Customer Portal.
                      </p>
                      <a
                        href="/api/stripe/create-portal-session"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm touch-manipulation min-h-[48px]"
                      >
                        <CreditCard className="w-4 h-4" />
                        Öppna Stripe Portal
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Admin Granted Info */}
          {isAdminGranted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-blue-500/30 p-4 sm:p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Premium via Admin</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700"><strong>Aktivt utan slutdatum</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Din premium-åtkomst har beviljats av en administratör</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700 mb-2">
                      Kontakta support om du har frågor om din premium-åtkomst.
                    </p>
                    <a
                      href="mailto:support@jobbcoach.ai"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      support@jobbcoach.ai
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(150px, -100px) scale(1.2); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }
        @keyframes float-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-200px, 150px) scale(0.8); }
          66% { transform: translate(100px, -80px) scale(1.1); }
        }
        @keyframes float-orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, -80px) scale(1.1); }
        }
      `}} />
    </div>
  );
}
