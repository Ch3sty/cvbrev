'use client';

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
      <div className="rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
        <p className="mb-1 text-steg uppercase text-ink-3">Arbetsstilsrapport</p>
        <h3 className="text-kort leading-snug text-ink-1">{report.archetype.title}</h3>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          {report.archetype.description}
        </p>

        {contextTags.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-steg uppercase text-ink-3">Söker sig till</p>
            <div className="flex flex-wrap gap-1.5">
              {contextTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta text-ink-2"
                >
                  {tag}
                </span>
              ))}
            </div>
            {contextTagMicrocopy && (
              <p className="mt-1.5 text-meta text-ink-3">{contextTagMicrocopy}</p>
            )}
          </div>
        )}

        <p className="mt-3 border-t border-kant pt-3 text-meta text-ink-3">
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
          <p className="mt-3 text-sm leading-[22px] text-ink-2">{report.work.summary}</p>
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
          <p className="mt-3 text-sm leading-[22px] text-ink-2">{report.drive.summary}</p>
        )}
        {report.drive.motivatedBy.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-steg uppercase text-ink-3">Motiveras av</p>
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
                className="rounded-lg border border-kant bg-panel p-3"
              >
                <p className="text-meta leading-snug text-ink-2">
                  <span className="font-medium text-ink-1">Trivs när</span>{' '}
                  {card.thrivesWhen}
                </p>
                {card.challengedWhen && (
                  <p className="mt-1.5 text-meta leading-snug text-ink-3">
                    <span className="font-medium">Utmanas när</span>{' '}
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

      {/* F. Onboarda så här, låst för rekryteraren tills kontakt accepterats */}
      <ReportSection title="Onboarda så här" locked>
        {report.onboarding && report.onboarding.length > 0 ? (
          <ol className="space-y-1.5">
            {report.onboarding.map((step, i) => (
              <li key={step} className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
                <span className="w-5 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-meta text-ink-3">
            Inga onboardingpunkter genererade för profilen.
          </p>
        )}
      </ReportSection>

      {/* G. Fördjupad intervjuguide, låst för rekryteraren tills kontakt accepterats */}
      <ReportSection title="Fördjupad intervjuguide" locked>
        {report.interviewGuide && report.interviewGuide.length > 0 ? (
          <div className="space-y-2.5">
            {report.interviewGuide.map((q) => (
              <div key={q.question} className="rounded-lg border border-kant bg-panel p-3">
                <p className="mb-1 text-steg uppercase text-ink-3">{q.basedOn}</p>
                <p className="text-sm font-medium leading-[22px] text-ink-1">{q.question}</p>
                <p className="mb-1 mt-2 text-steg uppercase text-ink-3">Lyssna efter</p>
                <ul className="space-y-1">
                  {q.listenFor.map((item) => (
                    <BulletItem key={item}>{item}</BulletItem>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-meta text-ink-3">Ingen intervjuguide genererad för profilen.</p>
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
      <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <h4 className="text-kort text-ink-1">{title}</h4>
        {locked && (
          <span className="text-meta text-ink-3">
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
    <li className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
      <span
        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-3"
        aria-hidden="true"
      />
      {children}
    </li>
  );
}
