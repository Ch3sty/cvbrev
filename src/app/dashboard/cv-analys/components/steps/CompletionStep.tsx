'use client';

import { KNAPP_PRIMAR_SMAL, KNAPP_SEKUNDAR_SMAL } from '@/components/shell/knappar'
import Link from 'next/link';
import { Download } from '@/components/illustrations/RumIkoner';

import Confirmation from '@/components/shell/Confirmation';
import { IlluBrevBekraftat } from '@/components/illustrations/TradenScener';

interface CompletionStepProps {
  savedCvId?: string;
  fileName: string;
  onAnalyzeAnother: () => void;
  onDownloadAgain?: () => void;
}

const SEKUNDAR =
  KNAPP_SEKUNDAR_SMAL;

/**
 * Sista steget i CV-analysen.
 *
 * Bort: pokalen som studsade in, "Bra jobbat", tre gröna statuskort utan
 * innehåll och två fyllda orange knappar under varandra. Kvar: en
 * bekräftelse som säger vad som blev gjort, och nästa handling i klartext.
 */
export default function CompletionStep({
  savedCvId,
  fileName,
  onAnalyzeAnother,
  onDownloadAgain,
}: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <Confirmation
        illustration={IlluBrevBekraftat}
        title={
          fileName ? `${fileName} är optimerat` : 'Ditt CV är optimerat'
        }
        description="Innehållet är skarpare och strukturen går igenom rekryteringssystemen. Lycka till med ansökningarna."
        action={
          <Link
            href="/dashboard/skapa-brev"
            className={KNAPP_PRIMAR_SMAL}
          >
            Skriv ett matchande brev
          </Link>
        }
        secondaryAction={
          <button type="button" onClick={onAnalyzeAnother} className={SEKUNDAR}>
            Analysera ett annat CV
          </button>
        }
      />

      {(onDownloadAgain || savedCvId) && (
        <div className="flex flex-wrap justify-center gap-3">
          {onDownloadAgain && (
            <button type="button" onClick={onDownloadAgain} className={SEKUNDAR}>
              <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Ladda ner igen
            </button>
          )}
          {savedCvId && (
            <Link href="/dashboard/profil/cv" className={SEKUNDAR}>
              Visa under Mina CV
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
