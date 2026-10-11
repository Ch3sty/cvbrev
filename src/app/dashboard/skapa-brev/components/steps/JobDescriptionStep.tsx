'use client';

/**
 * Steg 2: vilken tjänst söker du?
 *
 * Ett insunket fält, teckenräknare som meta, nyckelorden vi hittat som
 * stilla piller i insunken, och en rad som säger om texten räcker. Ingen
 * rörelse, ingen orange yta. Frågan som rubrik sätts av CreateLetterClient.
 */

import { useState, useEffect, useMemo } from 'react';
import { kravIAnnonsen } from '@/lib/letters/kravIAnnonsen';

interface JobDescriptionStepProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
  isActive: boolean;
  startCollapsed: boolean;
  onComplete: () => void;
  registerRef?: (el: HTMLElement | null) => void;
  prefillCompany?: string | null;
  prefillJobTitle?: string | null;
}


export default function JobDescriptionStep({
  jobDescription,
  onJobDescriptionChange,
  startCollapsed,
  onComplete,
  registerRef,
  prefillCompany,
  prefillJobTitle,
}: JobDescriptionStepProps) {
  // Nyckelorden räknas fram under rendering, inte i en effekt. Effekten satte
  // en ny array i state vid varje tangenttryck. Effekter efter ett
  // tangenttryck körs direkt efter commit, och uppdateringen de gör hamnar i
  // en lägre lane som Chrome låter vänta medan fler tangenttryck köas. Vid
  // snabb inmatning (inklistring tecken för tecken, snabbskrivning, puppeteer)
  // räknade React därför femtio commits i rad med väntande arbete och kastade
  // fel #185, maximalt uppdateringsdjup.
  // Samma lista som brevvyns träffar (src/lib/letters/kravIAnnonsen.ts).
  const detectedKeywords = useMemo(() => kravIAnnonsen(jobDescription), [jobDescription]);
  const [hasMarkedDone, setHasMarkedDone] = useState(startCollapsed);

  // Markeras som klart första gången texten passerar 50 tecken.
  useEffect(() => {
    if (jobDescription.length >= 50 && !hasMarkedDone) {
      setHasMarkedDone(true);
      onComplete();
    }
  }, [jobDescription, hasMarkedDone, onComplete]);

  const prefillLine =
    prefillJobTitle && prefillCompany
      ? `${prefillJobTitle} hos ${prefillCompany}`
      : prefillJobTitle || prefillCompany || null;

  return (
    <section ref={registerRef} data-flow-section="job" className="space-y-4">
      {prefillLine ? (
        <p className="text-meta text-ink-3">Annonsen kom från jobbmatchningen: {prefillLine}.</p>
      ) : null}

      <div>
        <label htmlFor="job-description" className="sr-only">
          Jobbannons
        </label>
        {/* text-base även på mobil: 14 px får iOS att zooma in vid fokus.
            enterKeyHint enter eftersom radbrytning är rätt i en annons. */}
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          enterKeyHint="enter"
          inputMode="text"
          autoComplete="off"
          placeholder="Klistra in hela annonsen. Vi läser ut kravprofilen, skall-krav och meriterande, och skriver brevet mot den."
          className="min-h-[220px] w-full resize-y rounded-lg border border-kant bg-papper-2 p-3 text-base leading-6 text-ink-1  transition-colors placeholder:text-ink-3 focus:border-kant-stark focus:bg-papper focus:outline-none focus-visible:ring-2 focus-visible:ring-koppar-ink sm:min-h-[260px]"
        />
        <p className="mt-1 text-right text-meta tabular-nums text-ink-3">
          {jobDescription.length} tecken
        </p>
      </div>

      {detectedKeywords.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-ink-3">Krav vi läst ut ur annonsen</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {detectedKeywords.map((kw) => (
              <li
                key={kw}
                className="rounded-lg border border-kant bg-papper-2 px-2 py-0.5 text-meta text-ink-2"
              >
                {kw}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {jobDescription.length > 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${
              jobDescription.length < 50 ? 'bg-varning' : 'bg-positiv'
            }`}
          />
          {jobDescription.length < 50
            ? 'Fortsätt skriva. Mer av annonsen ger ett bättre brev.'
            : 'Bra. Vi har vad vi behöver för att skriva ett starkt brev.'}
        </p>
      ) : null}
    </section>
  );
}
