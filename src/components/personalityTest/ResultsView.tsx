'use client';

/**
 * Personlighetsprofilen i resultatskärmens mall (plan-testflode-2026-11-20
 * avsnitt 4.2, etapp 5): väggen med eyebrow, huvudtalet och två tal, och på
 * golvet profilens innehåll som förut, i samma ordning: de fem dimensionerna
 * i det lyfta kortet, en text per dimension, intervjutipsen och facetterna
 * (avancerad), sedan Nästa steg och vägen tillbaka. Ingen genomgång: testet
 * har inget rätt eller fel. Beräkningen är orörd, vyn läser bara poängen.
 *
 * Sessionen läses på servern (initial). Utan den hämtas den här som förut.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Resultatskarm from '@/components/session/Resultatskarm';
import { KNAPP_SEKUNDAR } from '@/components/shell/knappar';
import { DIMENSION_META } from '@/lib/personalityTest/insights';
import { dagSthlm } from '@/lib/traning/datum';
import { kortDatum } from '@/lib/traning/rubrik';
import BigFiveChart from './BigFiveChart';
import DimensionCard from './DimensionCard';
import InterviewTipsCard from './InterviewTipsCard';
import FacetsBreakdown from './FacetsBreakdown';
import type { BigFiveScores, FacetScores, PersonalityTestType, Dimension } from '@/lib/personalityTest/types';

interface SessionData {
  id: string;
  scores: BigFiveScores | null;
  facet_scores: FacetScores | null;
  completed_at: string | null;
  time_spent: number | null;
}

interface ResultsViewProps {
  sessionId: string;
  testType: PersonalityTestType;
  hubPath: string;
  /** Sessionen läst på servern. Null: vyn hämtar själv. */
  initial?: SessionData | null;
}

const ORDER: Dimension[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

const UNDERTITEL: Record<PersonalityTestType, string> = {
  'personlighet-grund': 'Personlighetstest, grundnivå',
  'personlighet-avancerad': 'Personlighetstest, avancerad nivå',
};

const ANTAL: Record<PersonalityTestType, number> = { 'personlighet-grund': 50, 'personlighet-avancerad': 120 };

const TESTER = '/dashboard/tester';

export default function ResultsView({ sessionId, testType, hubPath, initial = null }: ResultsViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(initial);
  const [laddar, setLaddar] = useState(!initial);
  const [fel, setFel] = useState<string | null>(null);

  useEffect(() => {
    if (initial) return;
    let avbruten = false;
    fetch(`/api/personalityTest/session?testType=${testType}`)
      .then((res) => res.json())
      .then((data) => {
        if (avbruten) return;
        const match = Array.isArray(data.sessions) ? data.sessions.find((s: SessionData) => s.id === sessionId) : null;
        if (match) setSession({ facet_scores: null, ...match });
        else setFel('Resultatet kunde inte hittas.');
      })
      .catch(() => {
        if (!avbruten) setFel('Något gick fel när vi hämtade resultatet.');
      })
      .finally(() => {
        if (!avbruten) setLaddar(false);
      });
    return () => {
      avbruten = true;
    };
  }, [initial, sessionId, testType]);

  const stang = () => router.push(TESTER);
  const undertitel = UNDERTITEL[testType];

  if (laddar || fel || !session || !session.scores || !session.completed_at) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram="resultat" data-resultatskarm="personlighet">
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="vagg px-4 pb-11 lg:px-10">
            <div className="mx-auto w-full max-w-[672px] py-4">
              <p className="text-[15px] font-semibold text-vagg-ink">Personlighet</p>
              <p className="text-xs text-vagg-mjuk">{undertitel}</p>
            </div>
          </div>
          <div className="px-4 lg:px-10">
            <div className="mx-auto w-full max-w-[672px]">
              {laddar ? (
                <div className="loading-thread relative z-[2] -mt-[30px] h-48 rounded-2xl border border-kant bg-papper" role="status" aria-busy="true" aria-label="Resultatet laddas" />
              ) : (
                <div className="relative z-[2] -mt-[30px] rounded-2xl border border-kant bg-papper p-6 text-center">
                  <p className="text-ink-2">{fel ?? 'Resultatet är inte tillgängligt än.'}</p>
                  <Link href={hubPath} className={`mt-4 ${KNAPP_SEKUNDAR} sm:w-auto`}>
                    Tillbaka
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const scores = session.scores;
  const sorterade = [...ORDER].sort((a, b) => scores[b] - scores[a]);
  const hogst = DIMENSION_META[sorterade[0]].name;
  const lagst = DIMENSION_META[sorterade[sorterade.length - 1]].name;
  const minuter = session.time_spent ? Math.max(1, Math.round(session.time_spent / 60)) : null;
  const grund = testType === 'personlighet-grund';

  return (
    <Resultatskarm
      lage="personlighet"
      titel="Personlighet"
      undertitel={undertitel}
      datum={kortDatum(dagSthlm(session.completed_at))}
      onStang={stang}
      ring={null}
      huvudtal="Din profil"
      tal={[
        { varde: String(ANTAL[testType]), etikett: 'påståenden' },
        ...(minuter ? [{ varde: `${minuter} min`, etikett: 'din tid' }] : []),
      ]}
      mening={
        scores[sorterade[0]] === scores[sorterade[sorterade.length - 1]]
          ? 'Alla fem dimensionerna ligger lika. Ingen profil är bättre än en annan.'
          : `Högst på ${hogst.toLowerCase()}, lägst på ${lagst.toLowerCase()}. Ingen profil är bättre än en annan.`
      }
      genomgang={null}
      lyft={<BigFiveChart scores={scores} />}
      innehall={
        <>
          {ORDER.map((dim, i) => (
            <DimensionCard key={dim} dimension={dim} score={scores[dim]} index={i} />
          ))}
          <InterviewTipsCard scores={scores} />
          {!grund && session.facet_scores ? <FacetsBreakdown facetScores={session.facet_scores} /> : null}
        </>
      }
      nastaSteg={
        grund
          ? {
              titel: 'Gå på djupet med 30 facetter',
              text: 'Det avancerade testet har 120 påståenden och delar varje dimension i sex facetter.',
              knapp: { text: 'Till avancerad nivå', href: '/dashboard/tester/personlighet-avancerad', data: 'avancerad' },
            }
          : {
              titel: 'Gör om testet om ett tag',
              text: 'Profilen rör sig långsamt. Gör om testet inför nästa intervju och jämför.',
              knapp: { text: 'Gör om testet', href: hubPath, data: 'gor-om' },
            }
      }
      tillbakaHref={TESTER}
    />
  );
}
