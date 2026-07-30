'use client';

// NastaSteg: dashboardens tidskänsliga nudge-modul efter onboarding.
// Visar högst ETT kort (uppföljningsnudge eller AF-rapportpåminnelse).
// Oprövade funktioner lyfts INTE här utan som "Rekommenderas nu"-markering
// på motsvarande snabbåtgärdskort, så samma rekommendation aldrig visas
// två gånger. Ersätter OnboardingDag2 + DiscoverByRecruitersCard.
//
// Designregel: det här kortet bär vyns ENDA hero-gradient-CTA.

import Link from 'next/link';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import InfoPopover from '@/components/ui/InfoPopover';
import type { NextBestAction } from '@/hooks/useNextBestAction';
import { TrackerOrb } from '@/app/dashboard/sokta-tjanster/components/TrackerIllustrations';

interface CardContent {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  Illustration: ComponentType<{ className?: string }> | null;
}

function contentFor(action: NonNullable<NextBestAction>): CardContent | null {
  switch (action.kind) {
    case 'follow-up':
      return {
        eyebrow: 'Nästa steg',
        title:
          action.count === 1
            ? '1 ansökan utan svar i över två veckor'
            : `${action.count} ansökningar utan svar i över två veckor`,
        description:
          'Ett kort mejl eller samtal till arbetsgivaren kan göra skillnad. Se vilka det gäller och logga uppföljningen direkt.',
        cta: 'Följ upp',
        href: '/dashboard/sokta-tjanster',
        Illustration: TrackerOrb,
      };
    case 'af-report':
      return {
        eyebrow: 'Nästa steg',
        title: 'Dags för aktivitetsrapporten?',
        description: `Du sökte ${action.count === 1 ? '1 jobb' : `${action.count} jobb`} i ${action.monthLabel.toLowerCase()}. Vi har redan sammanställt månaden i Arbetsförmedlingens format, klar att skriva ut eller kopiera in i rapporten.`,
        cta: 'Öppna rapporten',
        href: '/dashboard/sokta-tjanster?tab=dela',
        Illustration: TrackerOrb,
      };
    case 'feature':
      // Funktionsrekommendationer renderas som markering i Snabbåtgärder.
      return null;
  }
}

interface NastaStegProps {
  action: NextBestAction;
  onDismiss: () => void;
}

export default function NastaSteg({ action, onDismiss }: NastaStegProps) {
  if (!action) return null;

  const content = contentFor(action);
  if (!content) return null;

  const key = action.kind;
  const dismiss = onDismiss;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
      >
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: 'var(--jc-gradient-warm)' }}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Avfärda förslaget"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--jc-gradient-warm)' }}
                aria-hidden="true"
              />
              <span>{content.eyebrow}</span>
              <InfoPopover title="Nästa steg">
                <p>
                  Vi visar ett förslag i taget, utifrån var du är i din
                  jobbsökning just nu. Passar det inte stänger du det med
                  krysset, så ligger det nere ett tag.
                </p>
              </InfoPopover>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight pr-8 md:pr-0">
              {content.title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-[56ch]">
              {content.description}
            </p>
            <Link
              href={content.href}
              className="group mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
              style={{
                background: 'var(--jc-gradient-hero)',
                boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.4)',
              }}
            >
              {content.cta}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </div>

          {content.Illustration && (
            <div className="hidden md:flex items-center justify-center w-24 h-24 lg:w-28 lg:h-28 flex-shrink-0 mr-6">
              <content.Illustration className="w-full h-full" />
            </div>
          )}
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
