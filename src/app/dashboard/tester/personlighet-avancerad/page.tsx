'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Crown, ArrowRight } from 'lucide-react';

import PersonlighetHero from '../personlighet-grund/components/PersonlighetHero';
import PersonlighetInfoCard from '../personlighet-grund/components/PersonlighetInfoCard';
import PersonlighetStartCTA from '../personlighet-grund/components/PersonlighetStartCTA';
import ProfileSummaryCard from '../personlighet-grund/components/ProfileSummaryCard';
import { useProfile } from '@/hooks/use-profile';
import type { BigFiveScores } from '@/lib/personalityTest/types';

interface Session {
  id: string;
  test_type: string;
  scores: BigFiveScores | null;
  time_spent: number | null;
  completed_at: string | null;
  started_at: string;
}

export default function PersonlighetAvanceradPage() {
  const router = useRouter();
  const { subscriptionTier, loading: profileLoading } = useProfile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isPremium = subscriptionTier === 'premium';

  useEffect(() => {
    if (!isPremium) return;
    fetch('/api/personalityTest/session?testType=personlighet-avancerad')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) {
          const completed = data.sessions.filter((s: Session) => s.completed_at);
          completed.sort(
            (a: Session, b: Session) =>
              new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
          );
          setSessions(completed);
        }
      })
      .catch(console.error);
  }, [isPremium]);

  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/personalityTest/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'personlighet-avancerad' }),
      });
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/personlighet-avancerad/test/${data.session.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      setIsLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
        <div className="space-y-4">
          <div className="rounded-3xl bg-indigo-50/40 h-48 animate-pulse" />
          <div className="rounded-3xl bg-indigo-50/40 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  const latest = sessions[0] ?? null;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <PersonlighetHero
          variant="avancerad"
          hasProfile={!!latest}
          lastCompletedAt={latest?.completed_at ?? null}
        />
        <PersonlighetInfoCard variant="avancerad" />

        {isPremium ? (
          <>
            <PersonlighetStartCTA
              onStart={handleStartTest}
              isLoading={isLoading}
              hasProfile={!!latest}
            />
            {latest?.scores && latest.completed_at && (
              <ProfileSummaryCard
                scores={latest.scores}
                lastCompletedAt={latest.completed_at}
                attempts={sessions.length}
                resultsHref={`/dashboard/tester/personlighet-avancerad/test/${latest.id}/results`}
              />
            )}
          </>
        ) : (
          <PremiumGate />
        )}
      </div>
    </div>
  );
}

function PremiumGate() {
  return (
    <section
      className="relative bg-white rounded-3xl border border-amber-200 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(245, 158, 11, 0.25)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #F59E0B, #EA580C, #DC2626)' }}
      />
      <div className="p-6 sm:p-8 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white mb-4"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
            boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.5)',
          }}
        >
          <Crown className="w-6 h-6" strokeWidth={2.25} />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 mb-2">
          <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" strokeWidth={2.5} />
          Endast för Premium
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Lås upp den avancerade personlighetsanalysen
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
          120 djupgående frågor, 30 facetter och en mer nyanserad profil. Inkluderar
          AI-genererade karriärinsikter och tips inför intervjuer.
        </p>
        <Link
          href="/priser"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 min-h-[48px]"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #EA580C, #DC2626)',
            boxShadow: '0 10px 24px -8px rgba(220, 38, 38, 0.45)',
          }}
        >
          Se Premium
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
        <p className="text-xs text-slate-500 mt-3">
          Du kan börja med <Link href="/dashboard/tester/personlighet-grund" className="font-semibold text-indigo-700 underline">grundtestet</Link> gratis.
        </p>
      </div>
    </section>
  );
}
