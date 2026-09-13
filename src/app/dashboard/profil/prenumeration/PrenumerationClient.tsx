'use client';

/**
 * Prenumeration (docs/plan-inloggat-omdesign.md, punkt 17 och avsnitt 5).
 *
 * På sidmallen: sidhuvud i stället för gradienthero, en statusrad som säger
 * exakt vilket läge kontot är i, sedan innehåll per läge.
 *
 * Allt som avgör läget kommer nu som props från servern. Klienten sköter bara
 * felbannern från ?error= och scrollningen till prislistan. Köp- och
 * uppsägningsflödet ligger oförändrat i sina egna komponenter.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';

import UsageStats from './components/UsageStats';
import ManageSubscriptionCard from './components/ManageSubscriptionCard';
import AdminGrantedCard from './components/AdminGrantedCard';
import TrialCTACard from './components/TrialCTACard';
import TidsbegransadPremiumCard from './components/TidsbegransadPremiumCard';
import PlanCards from '@/components/pricing/PlanCards';
import GratisMotPremium from './components/GratisMotPremium';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import type { QuotaSummary } from '@/lib/quota/getQuotaSummary';

// Ligger långt under vecket och öppnas dessutom först vid klick, så de
// behöver inte ligga i den JS som blockerar första målningen.
const PrenumerationFAQ = dynamic(() => import('./components/PrenumerationFAQ'));
const SavedDiscountsAccordion = dynamic(
  () => import('@/components/rewards/SavedDiscountsAccordion')
);

const PREMIUM_MONTHLY_PRICE_ID = 'price_1SQSVlPWMWdjmTDjx1yo9m00';
const PRICING_ANCHOR_ID = 'pricing';

export default function PrenumerationClient({
  quota,
  isPremium,
  isPaidPremium,
  isAdminGranted,
  isTemporaryPremium,
  hasStripeSubscription,
  premiumUntil: premiumUntilIso,
  premiumSource,
}: {
  quota: QuotaSummary | null;
  isPremium: boolean;
  isPaidPremium: boolean;
  isAdminGranted: boolean;
  isTemporaryPremium: boolean;
  hasStripeSubscription: boolean;
  premiumUntil: string | null;
  premiumSource: string | null;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const premiumUntil = premiumUntilIso ? new Date(premiumUntilIso) : null;

  // ?error= läses ur adressfältet i stället för med useSearchParams. Då
  // behöver sidan ingen Suspense-gräns, och felbannern syns lika direkt.
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Statusraden säger exakt vilket läge kontot är i. En rad, aldrig ett kort.
  const status = (() => {
    if (isPaidPremium) {
      return { tone: 'positive' as const, text: 'Premium aktivt. Prenumerationen förnyas automatiskt.' };
    }
    if (isAdminGranted) {
      return { tone: 'positive' as const, text: 'Premium aktivt via administratör.' };
    }
    if (isPremium && premiumUntil) {
      const days = Math.max(
        0,
        Math.ceil((premiumUntil.getTime() - Date.now()) / 86400000)
      );
      return {
        tone: days <= 2 ? ('warm' as const) : ('neutral' as const),
        text:
          days === 0
            ? 'Premium tar slut ikväll.'
            : `Premium aktivt, ${days} ${days === 1 ? 'dag' : 'dagar'} kvar.`,
      };
    }
    if (isPremium) {
      return { tone: 'positive' as const, text: 'Premium aktivt.' };
    }
    return { tone: 'neutral' as const, text: 'Du använder gratisnivån.' };
  })();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Prenumeration"
        description={
          isPremium
            ? 'Din plan, din användning och hur du hanterar den.'
            : 'Välj hur länge du vill ha Premium. Alla alternativ ger samma funktioner.'
        }
      />

      {/* Felmeddelande */}
      {errorMessage && (
        <div className="rounded-xl border border-fel-kant bg-fel-mjuk p-4">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm text-fel">
              {errorMessage}
              <span className="mt-1 block text-ink-2">
                Kontakta support@jobbcoach.ai om problemet kvarstår.
              </span>
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              aria-label="Stäng meddelande"
              className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:text-ink-1"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <StatusRow tone={status.tone} showDot label="Din plan">
        {status.text}
      </StatusRow>

      {/* Premium-läge */}
      {isPremium && (
        <>
          <UsageStats isPremium={isPremium} summary={quota} />

          {/* Tidsbegränsad premium utan prenumeration: dagar kvar och förläng. */}
          {isTemporaryPremium && premiumUntil && (
            <TidsbegransadPremiumCard
              premiumUntil={premiumUntil}
              premiumSource={premiumSource}
            />
          )}
          {isTemporaryPremium && !premiumUntil && (
            <TrialCTACard priceId={PREMIUM_MONTHLY_PRICE_ID} />
          )}

          {/* Tidsbegränsad premium: visa vad gratisnivån ger, så det är
              tydligt vad som försvinner när perioden tar slut. */}
          {isTemporaryPremium && <GratisMotPremium />}

          {isPaidPremium && <ManageSubscriptionCard />}

          {isAdminGranted && <AdminGrantedCard />}
        </>
      )}

      {/* Betalar men saknar premium-tier: vägen till uppsägning måste finnas. */}
      {!isPremium && hasStripeSubscription && <ManageSubscriptionCard />}

      {/* Gratisläge */}
      {!isPremium && !hasStripeSubscription && (
        <>
          <UsageStats isPremium={isPremium} summary={quota} />

          <div ref={pricingRef} id={PRICING_ANCHOR_ID}>
            <PlanCards className="py-0" />
          </div>

          <GratisMotPremium />

          {/* Sparade rabattkoder. Belöningssidan togs bort i våg 2 punkt 21,
              men redan utfärdade koder ska fortsätta gå att lösa in, så
              listan flyttade hit där den faktiskt används. Komponenten
              renderar ingenting när användaren saknar koder. */}
          <SavedDiscountsAccordion />

          <PrenumerationFAQ />
        </>
      )}
    </div>
  );
}
