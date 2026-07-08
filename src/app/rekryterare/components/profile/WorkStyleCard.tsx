'use client';

import { useState } from 'react';
import { ChevronDown, Compass, Lock } from 'lucide-react';
import PortalCard from '../PortalCard';
import WorkStyleSpectrum from '../WorkStyleSpectrum';
import { WORKSTYLE_DISCLAIMER } from '@/lib/recruiter/workStyle';
import type { CandidateDetail, SpectrumView } from '../types';

interface WorkStyleCardProps {
  candidate: CandidateDetail;
  /** Kontakt upplåst = onboarding/intervjuguide får visas när de finns. */
  unlocked: boolean;
  delay?: number;
}

/**
 * Arbetsstilssektionen på detaljprofilen. Fullrapporten renderas när den
 * finns (arketyp + spektra synliga, resten bakom "Visa mer"), annars den
 * kompakta panelen som fallback. Personlighet visas ALDRIG i testresultatens
 * visuella grammatik: inga siffror, procent eller staplar, bara bandpunkter.
 */
export default function WorkStyleCard({ candidate, unlocked, delay = 0 }: WorkStyleCardProps) {
  const report = candidate.workStyleReport;
  const compact = candidate.workStyle;
  const [expanded, setExpanded] = useState(false);

  if (!report && !compact) return null;

  const archetype = report?.archetype ?? compact!.archetype;

  // Alla spektra i den synliga delen, utan dubbletter.
  const spectra: SpectrumView[] = [];
  if (report) {
    const seen = new Set<string>();
    for (const s of [
      ...report.work.spectra,
      report.collaboration.spectrum,
      report.drive.spectrum,
    ]) {
      if (s && !seen.has(s.key)) {
        seen.add(s.key);
        spectra.push(s);
      }
    }
  }

  return (
    <div id="arbetsstil" className="scroll-mt-24">
      <PortalCard title="Arbetsstil" delay={delay}>
        {/* Disclaimern ovanför rapporten, i liten stil. Visas ALLTID, även i
            den kompakta fallback-vyn: den innehåller regeln "använd för att
            ställa bättre frågor, inte för att sortera" och får aldrig saknas. */}
        <p className="mb-3 text-[12px] text-slate-400 leading-relaxed">
          {report?.disclaimer ?? WORKSTYLE_DISCLAIMER}
        </p>

        {candidate.personalityStale && (
          <p className="mb-3 text-[12.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Testet gjordes för över två år sedan.
          </p>
        )}

        {/* Arketyp */}
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3.5">
          <span
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700"
            aria-hidden="true"
          >
            <Compass className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-indigo-900">{archetype.title}</p>
            <p className="mt-0.5 text-[13px] text-indigo-900/70 leading-relaxed">
              {archetype.description}
            </p>
          </div>
        </div>

        {report ? (
          <>
            {/* Spektra: synliga i kollapsat läge */}
            {spectra.length > 0 && (
              <div className="mt-4 space-y-4">
                {spectra.map((s) => (
                  <WorkStyleSpectrum key={s.key} spectrum={s} />
                ))}
              </div>
            )}

            {/* Visa mer */}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-4 inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl text-[13px] font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
              {expanded ? 'Visa mindre' : 'Visa mer'}
            </button>

            {expanded && (
              <div className="mt-2 space-y-5">
                {report.work.summary && (
                  <ReportSection title="I arbetet">
                    <p className="text-[13.5px] text-slate-700 leading-relaxed">
                      {report.work.summary}
                    </p>
                  </ReportSection>
                )}

                {report.collaboration.statements.length > 0 && (
                  <ReportSection title="Så samarbetar hen">
                    <BulletList items={report.collaboration.statements} />
                  </ReportSection>
                )}

                {(report.drive.summary || report.drive.motivatedBy.length > 0) && (
                  <ReportSection title="Så leds och drivs hen">
                    {report.drive.summary && (
                      <p className="text-[13.5px] text-slate-700 leading-relaxed mb-2">
                        {report.drive.summary}
                      </p>
                    )}
                    {report.drive.motivatedBy.length > 0 && (
                      <>
                        <p className="text-[12px] font-bold text-slate-500 mb-1">Motiveras av</p>
                        <BulletList items={report.drive.motivatedBy} />
                      </>
                    )}
                  </ReportSection>
                )}

                {report.thrives.length > 0 && (
                  <ReportSection title="Kommer till sin rätt när">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {report.thrives.map((card) => (
                        <div
                          key={card.thrivesWhen}
                          className="rounded-2xl border border-indigo-100 bg-indigo-50/40 px-3.5 py-3"
                        >
                          <p className="text-[12.5px] text-slate-700 leading-relaxed">
                            <span className="font-bold text-indigo-900">Trivs när</span>{' '}
                            {card.thrivesWhen}
                          </p>
                          {card.challengedWhen && (
                            <p className="mt-1.5 text-[12.5px] text-slate-600 leading-relaxed">
                              <span className="font-bold text-slate-500">Utmanas när</span>{' '}
                              {card.challengedWhen}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ReportSection>
                )}

                {report.needs.length > 0 && (
                  <ReportSection title="Behöver för att prestera">
                    <BulletList items={report.needs} />
                  </ReportSection>
                )}

                {candidate.personalityStrengths.length > 0 && (
                  <ReportSection title="Personlighetsstyrkor">
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.personalityStrengths.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                            aria-hidden="true"
                          />
                          {chip}
                        </span>
                      ))}
                    </div>
                  </ReportSection>
                )}

                {/* Onboarding + intervjuguide: null = låsta rader */}
                {report.onboarding ? (
                  <ReportSection title="Onboarda så här: första 90 dagarna">
                    <BulletList items={report.onboarding} />
                  </ReportSection>
                ) : (
                  <LockedRow />
                )}

                {report.interviewGuide ? (
                  <ReportSection title="Fördjupad intervjuguide">
                    <ol className="space-y-3">
                      {report.interviewGuide.map((q, i) => (
                        <li key={q.question} className="rounded-2xl border border-indigo-100 px-3.5 py-3">
                          <p className="flex items-start gap-2.5 text-[13.5px] font-semibold text-slate-800 leading-relaxed">
                            <span
                              className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center mt-0.5"
                              aria-hidden="true"
                            >
                              {i + 1}
                            </span>
                            {q.question}
                          </p>
                          {q.listenFor.length > 0 && (
                            <div className="mt-2 pl-7">
                              <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                                Lyssna efter
                              </p>
                              <BulletList items={q.listenFor} small />
                            </div>
                          )}
                          <p className="mt-2 pl-7 text-[11.5px] text-indigo-700/80 font-semibold">
                            {q.basedOn}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </ReportSection>
                ) : report.onboarding ? (
                  <LockedRow />
                ) : null}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Kompakt fallback för profiler utan fullrapport */}
            <div className="mt-4">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                I arbetet
              </p>
              <BulletList items={compact!.statements} />
            </div>

            {candidate.personalityStrengths.length > 0 && (
              <div className="mt-4">
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Personlighetsstyrkor
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.personalityStrengths.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.interviewGuide.length > 0 ? (
              <div className="mt-4 pt-4 border-t border-indigo-50">
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Inför intervjun
                </p>
                <ol className="space-y-2">
                  {candidate.interviewGuide.map((question, i) => (
                    <li
                      key={question}
                      className="flex items-start gap-2.5 text-[13.5px] text-slate-700 leading-relaxed"
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center mt-0.5"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      {question}
                    </li>
                  ))}
                </ol>
              </div>
            ) : !unlocked ? (
              <div className="mt-4 pt-4 border-t border-indigo-50">
                <LockedRow />
              </div>
            ) : null}
          </>
        )}

        <p className="mt-4 text-[12px] text-slate-400 leading-relaxed">
          Härledd ur det utökade personlighetstestet (120 frågor), delad med
          kandidatens samtycke.
        </p>
      </PortalCard>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-2">
        {title}
      </p>
      {children}
    </section>
  );
}

function BulletList({ items, small = false }: { items: string[]; small?: boolean }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`flex items-start gap-2 leading-relaxed text-slate-700 ${
            small ? 'text-[12.5px]' : 'text-[13.5px]'
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-[7px]"
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LockedRow() {
  return (
    <p className="flex items-start gap-2 text-[12.5px] text-slate-500 leading-relaxed">
      <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" aria-hidden="true" />
      Onboardingguide och intervjuguide med skräddarsydda frågor låses upp när
      kandidaten tackar ja.
    </p>
  );
}
