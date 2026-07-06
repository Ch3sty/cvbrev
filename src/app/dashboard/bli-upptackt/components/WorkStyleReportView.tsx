'use client';

import { Lock } from 'lucide-react';
import type { WorkStyleReport } from '@/lib/recruiter/workStyle';
import WorkStyleSpectrum from './WorkStyleSpectrum';

interface WorkStyleReportViewProps {
  report: WorkStyleReport;
  /**
   * Valda kontexttaggar ("Söker mig till"). Visas i rapporthuvudet precis
   * som hos rekryteraren, med den obligatoriska mikrocopyn.
   */
  contextTags?: string[];
  /** Mikrocopy som visas under kontexttaggarna (skickas från motorn). */
  contextTagMicrocopy?: string;
}

/**
 * Rekryterarens fullständiga arbetsstilsrapport, renderad EXAKT som
 * rekryteraren ser den. Symmetrin är förtroendet: kandidatens förhandsvisning
 * och rekryterarens vy bygger på samma WorkStyleReport-objekt ur motorn.
 * Onboarding och intervjuguide märks som låsta tills kandidaten tackar ja
 * till kontakt.
 */
export default function WorkStyleReportView({
  report,
  contextTags = [],
  contextTagMicrocopy,
}: WorkStyleReportViewProps) {
  return (
    <div className="space-y-5">
      {/* Rapporthuvud: arketyp + styrkedeklaration */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-500 mb-1">
          Arbetsstilsrapport
        </p>
        <h3 className="text-[16px] font-bold text-indigo-950 leading-snug">
          {report.archetype.title}
        </h3>
        <p className="text-[13px] text-indigo-900/80 leading-relaxed mt-1">
          {report.archetype.description}
        </p>

        {contextTags.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-500 mb-1.5">
              Söker sig till
            </p>
            <div className="flex flex-wrap gap-1.5">
              {contextTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 border border-indigo-300 text-indigo-800 bg-white"
                >
                  {tag}
                </span>
              ))}
            </div>
            {contextTagMicrocopy && (
              <p className="text-[11px] text-indigo-900/60 leading-relaxed mt-1.5">
                {contextTagMicrocopy}
              </p>
            )}
          </div>
        )}

        <p className="text-[12px] text-indigo-900/70 leading-relaxed mt-3 pt-3 border-t border-indigo-100">
          {report.disclaimer}
        </p>
      </div>

      {/* A. Så arbetar hen */}
      <ReportSection title="Så arbetar hen">
        <div className="space-y-2.5">
          {report.work.spectra.map((spectrum) => (
            <WorkStyleSpectrum key={spectrum.key} spectrum={spectrum} />
          ))}
        </div>
        {report.work.summary && (
          <p className="text-[13px] text-slate-700 leading-relaxed mt-3">
            {report.work.summary}
          </p>
        )}
      </ReportSection>

      {/* B. Så samarbetar hen */}
      <ReportSection title="Så samarbetar hen">
        {report.collaboration.spectrum && (
          <WorkStyleSpectrum spectrum={report.collaboration.spectrum} />
        )}
        {report.collaboration.statements.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {report.collaboration.statements.map((statement) => (
              <BulletItem key={statement}>{statement}</BulletItem>
            ))}
          </ul>
        )}
      </ReportSection>

      {/* C. Så leds och drivs hen */}
      <ReportSection title="Så leds och drivs hen">
        {report.drive.spectrum && <WorkStyleSpectrum spectrum={report.drive.spectrum} />}
        {report.drive.summary && (
          <p className="text-[13px] text-slate-700 leading-relaxed mt-3">
            {report.drive.summary}
          </p>
        )}
        {report.drive.motivatedBy.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
              Motiveras av
            </p>
            <ul className="space-y-1.5">
              {report.drive.motivatedBy.map((item) => (
                <BulletItem key={item}>{item}</BulletItem>
              ))}
            </ul>
          </div>
        )}
      </ReportSection>

      {/* D. Kommer till sin rätt när */}
      {report.thrives.length > 0 && (
        <ReportSection title="Kommer till sin rätt när">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {report.thrives.map((card) => (
              <div
                key={card.thrivesWhen}
                className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"
              >
                <p className="text-[12.5px] text-slate-800 leading-relaxed">
                  <span className="font-bold text-indigo-800">Trivs när</span>{' '}
                  {card.thrivesWhen}
                </p>
                {card.challengedWhen && (
                  <p className="text-[12.5px] text-slate-600 leading-relaxed mt-1.5">
                    <span className="font-bold text-slate-500">Utmanas när</span>{' '}
                    {card.challengedWhen}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* E. Behöver för att prestera */}
      {report.needs.length > 0 && (
        <ReportSection title="Behöver för att prestera">
          <ul className="space-y-1.5">
            {report.needs.map((need) => (
              <BulletItem key={need}>{need}</BulletItem>
            ))}
          </ul>
        </ReportSection>
      )}

      {/* F. Onboarda så här — låst för rekryteraren tills kontakt accepterats */}
      <ReportSection title="Onboarda så här" locked>
        {report.onboarding && report.onboarding.length > 0 ? (
          <ol className="space-y-1.5">
            {report.onboarding.map((step, i) => (
              <li key={step} className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold flex items-center justify-center mt-px">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[12.5px] text-slate-400">
            Inga onboardingpunkter genererade för profilen.
          </p>
        )}
      </ReportSection>

      {/* G. Fördjupad intervjuguide — låst för rekryteraren tills kontakt accepterats */}
      <ReportSection title="Fördjupad intervjuguide" locked>
        {report.interviewGuide && report.interviewGuide.length > 0 ? (
          <div className="space-y-2.5">
            {report.interviewGuide.map((q) => (
              <div key={q.question} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-indigo-500 mb-1">
                  {q.basedOn}
                </p>
                <p className="text-[13px] font-semibold text-slate-800 leading-relaxed">
                  {q.question}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-2 mb-1">
                  Lyssna efter
                </p>
                <ul className="space-y-1">
                  {q.listenFor.map((item) => (
                    <BulletItem key={item}>{item}</BulletItem>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-slate-400">
            Ingen intervjuguide genererad för profilen.
          </p>
        )}
      </ReportSection>
    </div>
  );
}

function ReportSection({
  title,
  locked,
  children,
}: {
  title: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-2">
        <h4 className="text-[13.5px] font-bold text-slate-900">{title}</h4>
        {locked && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800">
            <Lock className="w-3 h-3" strokeWidth={2.5} />
            Låses upp när du tackar ja till kontakt
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed">
      <span
        className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-[7px]"
        aria-hidden="true"
      />
      {children}
    </li>
  );
}
