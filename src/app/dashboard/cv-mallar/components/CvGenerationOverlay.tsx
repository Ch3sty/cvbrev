'use client';

import { useEffect, useState } from 'react';

import Sheet from '@/components/shell/Sheet';
import FlowProgress, { type FlowStage } from '@/components/shell/FlowProgress';
import FlowError from '@/components/shell/FlowError';
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar';

interface CvGenerationOverlayProps {
  isOpen: boolean;
  isError?: boolean;
  errorMessage?: string;
  /** Formatet som skapas. Word har egna texter och ett eget felläge. */
  format?: 'pdf' | 'docx';
  onClose?: () => void;
  /** Word-felläget: försök igen med samma val. */
  onRetry?: () => void;
  /** Word-felläget: ladda ner som PDF utan att byta mall eller typsnitt. */
  onPdfIstallet?: () => void;
}

const STAGES_PDF: FlowStage[] = [
  { threshold: 0, text: 'Läser ditt CV', body: 'Vi plockar isär innehållet i rubriker, roller och kompetenser.' },
  { threshold: 35, text: 'Formaterar i mallen', body: 'Texten sätts i mallens typografi och marginaler.' },
  { threshold: 70, text: 'Gör PDF:en', body: 'Sista steget innan filen laddas ner till din enhet.' },
];

const STAGES_WORD: FlowStage[] = [
  STAGES_PDF[0],
  { threshold: 35, text: 'Sätter stilarna', body: 'Rubriker, punktlistor och perioder blir riktiga Word-stilar.' },
  { threshold: 70, text: 'Gör Word-filen', body: 'Sista steget innan filen laddas ner till din enhet.' },
];

/**
 * Väntan medan PDF:en skapas. Ett ark, inte en egen modal, och framstegen
 * ritas av FlowProgress. Bort: den pulserande dokumentillustrationen med
 * skannlinje, orange progressbar och det fyllda felkortet.
 */
export default function CvGenerationOverlay({
  isOpen,
  isError = false,
  errorMessage,
  format = 'pdf',
  onClose,
  onRetry,
  onPdfIstallet,
}: CvGenerationOverlayProps) {
  const somWord = format === 'docx';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Animera 0 -> 90% over 5 sekunder, sedan haller den vid 90 tills modalen stangs
    let raf: number;
    let start: number | null = null;
    const duration = 5000;

    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = t - start;
      const pct = Math.min(90, (elapsed / duration) * 90);
      setProgress(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  return (
    <Sheet
      open={isOpen}
      // Under genereringen finns inget att avbryta till, så arket stängs bara
      // när något gått fel. Samma regel som förut, fast utan egen scrim.
      onClose={isError && onClose ? onClose : () => {}}
      title={isError ? (somWord ? 'Word-filen kunde inte skapas' : 'Något gick fel') : somWord ? 'Skapar din Word-fil' : 'Skapar din CV-PDF'}
      description={isError ? undefined : somWord ? 'Tar några sekunder.' : 'Tar 5 till 10 sekunder.'}
    >
      {isError && somWord ? (
        // Skissen, avsnitt 5: "Försök igen" är vyns primärknapp eftersom
        // överlägget täcker steget; länken går till PDF med samma val.
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-ink-2">
            Ditt CV och dina val finns kvar. Prova igen, eller ladda ner som PDF så länge. Händer det igen, skriv till oss så tittar vi på just din fil.
          </p>
          {onRetry ? (
            <button type="button" onClick={onRetry} className={KNAPP_PRIMAR}>
              Försök igen
            </button>
          ) : null}
          {onPdfIstallet ? (
            <button type="button" onClick={onPdfIstallet} className={`${LANK} inline-flex min-h-11 items-center self-center`}>
              Ladda ner som PDF i stället
            </button>
          ) : null}
        </div>
      ) : isError ? (
        <FlowError
          message={errorMessage || 'Vi kunde inte skapa din PDF. Försök igen.'}
          onRetry={onClose}
          retryLabel="Stäng"
        />
      ) : (
        <FlowProgress progress={progress} stages={somWord ? STAGES_WORD : STAGES_PDF} />
      )}
    </Sheet>
  );
}
