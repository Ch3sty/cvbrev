'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { JobbcoachenChatOrb, DocumentShareIcon } from './illustrations/JobbcoachenIcons';

interface WelcomeMessageProps {
  cvCount: number;
  letterCount: number;
  onOpenSelector: () => void;
}

export default function WelcomeMessage({
  cvCount,
  letterCount,
  onOpenSelector,
}: WelcomeMessageProps) {
  const total = cvCount + letterCount;
  const hasDocuments = total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex items-start gap-3 sm:gap-4"
    >
      {/* Assistent-avatar */}
      <div className="flex-shrink-0">
        <JobbcoachenChatOrb className="w-12 h-12 sm:w-14 sm:h-14" />
      </div>

      {/* Chat-bubbla */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
          Jobbcoachen
        </div>

        <div
          className="relative bg-white rounded-2xl rounded-tl-md border border-orange-200/60 p-4 sm:p-5 space-y-3"
          style={{ boxShadow: '0 8px 24px -16px rgba(249, 115, 22, 0.25)' }}
        >
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            Hej! Vad kan jag hjälpa dig med idag?
          </p>

          <p className="text-sm text-slate-700 leading-relaxed">
            Jag svarar på frågor om svensk arbetsmarknad — lön, intervjuer,
            arbetsrätt, CV-tips. Alltid med källor du kan kolla själv.
          </p>

          {/* Trust-strip */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
            <Shield className="w-3 h-3" strokeWidth={2.5} />
            Verifierade källor från Arbetsförmedlingen, SCB & fackförbund
          </div>

          {/* Inbäddad dokumentdelning-CTA */}
          <div
            className="mt-1 rounded-xl border border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-white p-3 sm:p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 hidden sm:block">
                <DocumentShareIcon className="w-14 h-14" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-relaxed">
                  {hasDocuments ? (
                    <>
                      <span className="font-semibold text-slate-900">
                        Visste du att
                      </span>{' '}
                      du kan dela CV och personliga brev med mig för att få
                      svar kopplade till just ditt yrkesliv?{' '}
                      <span className="font-semibold text-slate-900">
                        Just nu har du{' '}
                        <span className="text-orange-700">
                          {total} {total === 1 ? 'dokument' : 'dokument'}
                        </span>{' '}
                        du kan dela.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-900">
                        Visste du att
                      </span>{' '}
                      du kan dela CV och personliga brev med mig för att få
                      svar kopplade till just ditt yrkesliv? Skapa något först,
                      så kan vi prata om det.
                    </>
                  )}
                </p>

                {hasDocuments && (
                  <button
                    type="button"
                    onClick={onOpenSelector}
                    className="group mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-[40px]"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 6px 16px -6px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    Välj dokument att dela
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      strokeWidth={2.5}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
