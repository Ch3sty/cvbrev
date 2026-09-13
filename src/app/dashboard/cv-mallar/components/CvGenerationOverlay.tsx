'use client';

import { useEffect, useState } from 'react';

import Sheet from '@/components/shell/Sheet';
import FlowProgress, { type FlowStage } from '@/components/shell/FlowProgress';
import FlowError from '@/components/shell/FlowError';

interface CvGenerationOverlayProps {
  isOpen: boolean;
  isError?: boolean;
  errorMessage?: string;
  onClose?: () => void;
}

const STAGES: FlowStage[] = [
  { threshold: 0, text: 'Läser ditt CV', body: 'Vi plockar isär innehållet i rubriker, roller och kompetenser.' },
  { threshold: 35, text: 'Formaterar i mallen', body: 'Texten sätts i mallens typografi och marginaler.' },
  { threshold: 70, text: 'Gör PDF:en', body: 'Sista steget innan filen laddas ner till din enhet.' },
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
  onClose,
}: CvGenerationOverlayProps) {
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
      title={isError ? 'Något gick fel' : 'Skapar din CV-PDF'}
      description={isError ? undefined : 'Tar 5 till 10 sekunder.'}
    >
      {isError ? (
        <FlowError
          message={errorMessage || 'Vi kunde inte skapa din PDF. Försök igen.'}
          onRetry={onClose}
          retryLabel="Stäng"
        />
      ) : (
        <FlowProgress progress={progress} stages={STAGES} />
      )}
    </Sheet>
  );
}
