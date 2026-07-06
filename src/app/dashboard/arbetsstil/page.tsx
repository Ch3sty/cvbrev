'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Battery, Ear, Lock } from 'lucide-react';

import SectionCard from '../bli-upptackt/components/SectionCard';
import LockedWorkStylePreview from '../bli-upptackt/components/LockedWorkStylePreview';
import WorkStyleSpectrum from '../bli-upptackt/components/WorkStyleSpectrum';
import type { SummaryData } from '../bli-upptackt/components/types';
import InterviewPractice from './components/InterviewPractice';

/**
 * Din arbetsstil: kandidatens privata rapport i du-form ur samma motor som
 * rekryterarens rapport. Energibudgeten och intervjuträningen är alltid
 * privata och delas aldrig. Grundtestare ser en låst förhandsvisning som
 * konverterar till det fördjupade testet.
 */
export default function ArbetsstilPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/candidate/summary');
        if (!res.ok) return;
        const data = (await res.json()) as SummaryData;
        if (!cancelled) setSummary(data);
      } catch (error) {
        console.error('Arbetsstil: kunde inte hämta summary', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto py-4 sm:py-6 max-w-3xl">
        <div className="space-y-5 sm:space-y-6">
          <div className="rounded-3xl bg-indigo-50/60 h-40 animate-pulse" />
          <div className="rounded-3xl bg-indigo-50/40 h-56 animate-pulse" />
          <div className="rounded-3xl bg-indigo-50/40 h-56 animate-pulse" />
        </div>
      </div>
    );
  }

  const personality = summary?.personality;
  const ownReport = personality?.ownReport ?? null;

  return (
    <div className="mx-auto py-4 sm:py-6 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-7 text-white"
          style={{
            background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 55%, #6366F1 100%)',
            boxShadow: '0 16px 40px -14px rgba(67, 56, 202, 0.5)',
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200 mb-1">
            Din arbetsstil
          </p>
          {ownReport ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                {ownReport.archetype.title}
              </h1>
              <p className="text-[13.5px] text-indigo-100 leading-relaxed mt-2 max-w-xl">
                {ownReport.archetype.description}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                Din rapport i ord, byggd på dig
              </h1>
              <p className="text-[13.5px] text-indigo-100 leading-relaxed mt-2 max-w-xl">
                Hur du arbetar, samarbetar och drivs. Alltid i ord, aldrig i
                siffror, och den privata delen är bara din.
              </p>
            </>
          )}
          <p className="text-[12px] text-indigo-200/90 leading-relaxed mt-3">
            Det här är din egen rapport i du-form. Vad rekryterare får se styr
            du själv under{' '}
            <Link href="/dashboard/bli-upptackt" className="font-bold underline underline-offset-2 hover:text-white">
              Bli upptäckt
            </Link>
            .
          </p>
        </motion.header>

        {!personality?.done && (
          <SectionCard title="Gör personlighetstestet först" delay={0.1}>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
              Din arbetsstilsrapport byggs på ditt personlighetstest. Börja med
              dagens test, det tar bara några minuter.
            </p>
            <Link
              href="/dashboard/tester"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5 touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.45)',
              }}
            >
              Gör dagens test
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </SectionCard>
        )}

        {/* Grundtestare: låst vy med skarpa rubriker */}
        {personality?.done && !ownReport && !personality.hasAdvancedTest && (
          <SectionCard
            title="Din rapport är nästan klar"
            sub="Det fördjupade testet (120 frågor) låser upp hela rapporten. Grundtestet gav dina styrkor, fördjupningen ger orden om hur du arbetar."
            delay={0.1}
          >
            <LockedWorkStylePreview />
          </SectionCard>
        )}

        {/* Avancerad-testare med jämn profil: kompakt fallback */}
        {personality?.done && !ownReport && personality.hasAdvancedTest && (
          <SectionCard title="Din arbetsstil i kompakt form" delay={0.1}>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
              Din profil är jämn över mätvärdena, då blir fullrapporten mer
              gissning än beskrivning. Vi visar den kompakta arbetsstilen i
              stället, den är ärligare.
            </p>
            {personality.workStyle && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                <p className="text-[14px] font-bold text-indigo-950">
                  {personality.workStyle.archetype.title}
                </p>
                <p className="text-[13px] text-indigo-900/80 leading-relaxed mt-1">
                  {personality.workStyle.archetype.description}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {personality.workStyle.statements.map((statement) => (
                    <li
                      key={statement}
                      className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-[7px]"
                        aria-hidden="true"
                      />
                      {statement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        )}

        {/* Fullrapporten i du-form */}
        {ownReport && (
          <>
            <SectionCard title="Så arbetar du" delay={0.08}>
              <div className="space-y-2.5">
                {ownReport.work.spectra.map((spectrum) => (
                  <WorkStyleSpectrum key={spectrum.key} spectrum={spectrum} />
                ))}
              </div>
              {ownReport.work.summary && (
                <p className="text-[13.5px] text-slate-700 leading-relaxed mt-3">
                  {ownReport.work.summary}
                </p>
              )}
            </SectionCard>

            <SectionCard title="Så samarbetar du" delay={0.12}>
              {ownReport.collaboration.spectrum && (
                <WorkStyleSpectrum spectrum={ownReport.collaboration.spectrum} />
              )}
              {ownReport.collaboration.statements.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {ownReport.collaboration.statements.map((statement) => (
                    <Bullet key={statement}>{statement}</Bullet>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Så drivs du" delay={0.16}>
              {ownReport.drive.spectrum && (
                <WorkStyleSpectrum spectrum={ownReport.drive.spectrum} />
              )}
              {ownReport.drive.summary && (
                <p className="text-[13.5px] text-slate-700 leading-relaxed mt-3">
                  {ownReport.drive.summary}
                </p>
              )}
              {ownReport.drive.motivatedBy.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
                    Du motiveras av
                  </p>
                  <ul className="space-y-1.5">
                    {ownReport.drive.motivatedBy.map((item) => (
                      <Bullet key={item}>{item}</Bullet>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>

            {ownReport.thrives.length > 0 && (
              <SectionCard title="Du kommer till din rätt när" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ownReport.thrives.map((card) => (
                    <div
                      key={card.thrivesWhen}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5"
                    >
                      <p className="text-[13px] text-slate-800 leading-relaxed">
                        <span className="font-bold text-indigo-800">Du trivs när</span>{' '}
                        {card.thrivesWhen}
                      </p>
                      {card.challengedWhen && (
                        <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5">
                          <span className="font-bold text-slate-500">Du utmanas när</span>{' '}
                          {card.challengedWhen}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {ownReport.needs.length > 0 && (
              <SectionCard title="Du behöver för att prestera" delay={0.24}>
                <ul className="space-y-1.5">
                  {ownReport.needs.map((need) => (
                    <Bullet key={need}>{need}</Bullet>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* PRIVAT: energibudgeten delas aldrig */}
            {ownReport.energyBudget.length > 0 && (
              <SectionCard
                title="Din energibudget"
                delay={0.28}
                headerExtra={
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 bg-indigo-600 text-white">
                    <Lock className="w-3 h-3" strokeWidth={2.5} />
                    Bara för dig, delas aldrig
                  </span>
                }
              >
                <ul className="space-y-2.5">
                  {ownReport.energyBudget.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-[13px] text-indigo-950/90 leading-relaxed"
                    >
                      <Battery className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2.25} />
                      {item}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Intervjuträning: samma frågor rekryteraren får */}
            {ownReport.interviewPrep.length > 0 && (
              <SectionCard
                title="Intervjuträning"
                sub="Det här är exakt frågorna en rekryterare får som intervjuguide för din profil. Öva med STAR-mallen så äger du samtalet innan det börjar."
                delay={0.32}
                headerExtra={
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700">
                    <Ear className="w-3 h-3" strokeWidth={2.5} />
                    Med facit
                  </span>
                }
              >
                <InterviewPractice questions={ownReport.interviewPrep} />
              </SectionCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13.5px] text-slate-700 leading-relaxed">
      <span
        className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-[7px]"
        aria-hidden="true"
      />
      {children}
    </li>
  );
}
