'use client';

/**
 * En träff i listan (docs/plan-jobbmatchning.md, avsnitt 2 punkt 2).
 *
 * Raden är inte ett kort i ett rutnät längre utan en rad i en panel: titel,
 * företag, ort och färskhet till vänster, matchgraden som stort tal till
 * höger, och under dem två till tre skäl i klartext. Skälen är poängen med
 * hela sidan. En procentsiffra utan förklaring är vår modells tal om
 * användaren, inte användarens bild av jobbet.
 *
 * Den primära handlingen per rad är "Skriv brev", eftersom brevet är det som
 * faktiskt för användaren vidare. Den ritas ändå i sekundär stil: sidan har
 * bara en primärknapp, och den sitter i sökpanelen ovanför. Resten av raden
 * öppnar detaljarket.
 */

import { buildMatchReasons, publishedLabel } from '../data/match-reasons';
import type { MatchScore } from '../data/match-score';
import type { ActiveCVData } from '../getJobbmatchningData';

export interface MatchRowProps {
  job: Record<string, any>;
  cv: ActiveCVData | null;
  /**
   * Matchgraden, redan uträknad av listan. Raden räknar inte om den: samma
   * annons ska ge samma tal oavsett var det läses, och listan behöver ändå
   * poängen för att kunna sortera.
   */
  score: MatchScore;
  position: number;
  onOpen: (job: Record<string, any>) => void;
  onWriteLetter: (job: Record<string, any>) => void;
  onMarkApplied: (job: Record<string, any>) => void;
  /** 'idle' | 'saving' | 'done' för "Markera som sökt". */
  appliedState: 'idle' | 'saving' | 'done';
}

export default function MatchRow({
  job,
  cv,
  score,
  position,
  onOpen,
  onWriteLetter,
  onMarkApplied,
  appliedState,
}: MatchRowProps) {
  const { reasons } = buildMatchReasons(job, cv, [], score);
  const publicerad = publishedLabel(job.publication_date);
  const ort =
    job.workplace_address?.municipality || job.workplace_address?.region || null;
  const annonsUrl =
    job.application_details?.url || job.application_url || job.webpage_url;

  const relevans = score.score;

  const appliedLabel =
    appliedState === 'done'
      ? 'Sökt'
      : appliedState === 'saving'
        ? 'Sparar'
        : 'Markera som sökt';

  return (
    <article className="px-4 py-4">
      {/* Hela översta blocket öppnar arket. Handlingarna ligger utanför
          knappen, så en knapp aldrig hamnar inuti en annan knapp. */}
      <button
        type="button"
        onClick={() => onOpen(job)}
        className="-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-1 text-left hover:bg-insunken"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-kort text-ink-1">{job.headline}</h3>
            <p className="mt-0.5 text-meta text-ink-3">
              {[job.employer?.name || 'Okänt företag', ort, publicerad]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-tal tabular-nums text-ink-1">{relevans}</div>
            <div className="text-meta text-ink-3">% match</div>
          </div>
        </div>

        {/* Skälen är alltid minst två, så raden har alltid den här höjden.
            Den reserveras ändå: en annons med långa skäl radbryter till två
            rader, och då ska raderna under inte hoppa. */}
        <p className="mt-2 min-h-[18px] text-meta text-ink-3">
          {reasons.join(' · ')}
        </p>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onWriteLetter(job)}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
        >
          Skriv brev
        </button>

        <button
          type="button"
          onClick={() => onMarkApplied(job)}
          disabled={appliedState !== 'idle'}
          className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1 disabled:text-ink-3 disabled:no-underline"
        >
          {appliedLabel}
        </button>

        {annonsUrl && (
          <a
            href={annonsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
          >
            Öppna annons
          </a>
        )}
      </div>

      <span className="sr-only">Träff {position}</span>
    </article>
  );
}
