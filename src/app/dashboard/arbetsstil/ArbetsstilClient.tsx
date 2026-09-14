'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import SectionCard from '../bli-upptackt/components/SectionCard';
import LockedWorkStylePreview from '../bli-upptackt/components/LockedWorkStylePreview';
import WorkStyleSpectrum from '../bli-upptackt/components/WorkStyleSpectrum';
import type { ArbetsstilData } from './getArbetsstilData';

/**
 * Din arbetsstil: kandidatens privata rapport i du-form ur samma motor som
 * rekryterarens rapport. Energibudgeten och intervjuträningen är alltid
 * privata och delas aldrig. Grundtestare ser en låst förhandsvisning som
 * konverterar till det fördjupade testet.
 *
 * All data kommer färdig som props från page.tsx, som läste den på servern.
 * Inga fetchanrop, ingen laddningsvy: första HTML innehåller rapporten.
 */

/**
 * Intervjuträningen ligger sist på sidan, långt under första vyn, och drar in
 * ett helt STAR-formulär med localStorage-läsning. Den laddas därför först när
 * den scrollas fram. Höjden reserveras nedan så inget hoppar när den landar.
 */
const InterviewPractice = dynamic(() => import('./components/InterviewPractice'), {
  loading: () => <div className="min-h-[320px]" aria-hidden="true" />,
});

export default function ArbetsstilClient({ data }: { data: ArbetsstilData }) {
  const { done, hasAdvancedTest, ownReport, workStyle } = data;

  return (
    <div className="mx-auto py-4 sm:py-6 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        {/* Hero */}
        <header className="rounded-xl border border-kant bg-panel p-5 sm:p-7">
          <p className="mb-1 text-steg uppercase text-ink-3">Din arbetsstil</p>
          {ownReport ? (
            <>
              <h1 className="text-h1 text-ink-1">
                {ownReport.archetype.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-[22px] text-ink-2">
                {ownReport.archetype.description}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-h1 text-ink-1">
                Din rapport i ord, byggd på dig
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-[22px] text-ink-2">
                Hur du arbetar, samarbetar och drivs. Alltid i ord, aldrig i
                siffror, och den privata delen är bara din.
              </p>
            </>
          )}
          <p className="mt-3 text-meta text-ink-3">
            Det här är din egen rapport i du-form. Vad rekryterare får se styr
            du själv under{' '}
            <Link
              href="/dashboard/bli-upptackt"
              className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Bli upptäckt
            </Link>
            .
          </p>
        </header>

        {!done && (
          <SectionCard title="Gör personlighetstestet först" delay={0.1}>
            <p className="mb-3 text-sm leading-[22px] text-ink-2">
              Din arbetsstilsrapport byggs på ditt personlighetstest. Börja med
              dagens test, det tar bara några minuter.
            </p>
            <Link
              href="/dashboard/tester"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
            >
              Gör dagens test
            </Link>
          </SectionCard>
        )}

        {/* Grundtestare: låst vy med skarpa rubriker */}
        {done && !ownReport && !hasAdvancedTest && (
          <SectionCard
            title="Din rapport är nästan klar"
            sub="Det fördjupade testet (120 frågor) ger dig hela rapporten. Grundtestet gav dina styrkor, fördjupningen ger orden om hur du arbetar."
            delay={0.1}
          >
            <LockedWorkStylePreview />
          </SectionCard>
        )}

        {/* Avancerad-testare med jämn profil: kompakt fallback */}
        {done && !ownReport && hasAdvancedTest && (
          <SectionCard title="Din arbetsstil i kompakt form" delay={0.1}>
            <p className="mb-3 text-sm leading-[22px] text-ink-2">
              Din profil är jämn över mätvärdena, då blir fullrapporten mer
              gissning än beskrivning. Vi visar den kompakta arbetsstilen i
              stället, den är ärligare.
            </p>
            {workStyle && (
              <div className="rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
                <p className="text-kort text-ink-1">{workStyle.archetype.title}</p>
                <p className="mt-1 text-sm leading-[22px] text-ink-2">
                  {workStyle.archetype.description}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {workStyle.statements.map((statement) => (
                    <li
                      key={statement}
                      className="flex items-start gap-2 text-sm leading-[22px] text-ink-2"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-3"
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
                <p className="text-[13.5px] text-neutral-700 leading-relaxed mt-3">
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
                <p className="text-[13.5px] text-neutral-700 leading-relaxed mt-3">
                  {ownReport.drive.summary}
                </p>
              )}
              {ownReport.drive.motivatedBy.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-steg uppercase text-ink-3">
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
                      className="rounded-lg border border-kant bg-insunken p-3.5 shadow-insunken"
                    >
                      <p className="text-sm leading-[22px] text-ink-2">
                        <span className="font-medium text-ink-1">Du trivs när</span>{' '}
                        {card.thrivesWhen}
                      </p>
                      {card.challengedWhen && (
                        <p className="mt-1.5 text-sm leading-[22px] text-ink-3">
                          <span className="font-medium">Du utmanas när</span>{' '}
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
                  <span className="text-meta text-ink-3">Bara för dig, delas aldrig</span>
                }
              >
                <ul className="space-y-2.5">
                  {ownReport.energyBudget.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-kant bg-insunken p-3 text-sm leading-[22px] text-ink-2 shadow-insunken"
                    >
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
                  <span className="text-meta text-ink-3">Med facit</span>
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
    <li className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
      {children}
    </li>
  );
}
