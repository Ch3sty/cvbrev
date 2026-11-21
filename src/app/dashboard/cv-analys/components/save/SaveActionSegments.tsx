'use client';

import ChoiceCard from '@/components/shell/ChoiceCard';
import { IkonCv } from '@/components/illustrations/Ikoner';

/**
 * Hur det förbättrade CV:t sparas (CV-rummet steg 4). Nedladdningen sker
 * sedan i Mallar, så analysen har ingen egen nedladdning längre.
 *  - nytt: ett nytt CV bredvid det analyserade, kräver ledig plats.
 *  - ersatt: det analyserade CV:t uppdateras på plats, kräver ingen plats.
 */
export type SaveChoice = 'nytt' | 'ersatt';

interface SaveActionSegmentsProps {
  value: SaveChoice | null;
  onChange: (choice: SaveChoice) => void;
  canSave: boolean;
  cvCount: number;
  maxCvs: number;
  disabled?: boolean;
  /** Det analyserade CV:ts namn, i texten om att ersätta. */
  cvNamn?: string | null;
}

const CHOICES: Array<{
  id: SaveChoice;
  label: string;
  description: string;
  needsQuota: boolean;
}> = [
  {
    id: 'nytt',
    label: 'Spara som nytt CV',
    description: 'Det analyserade CV:t står kvar som det är. Sedan väljer du mall och laddar ner.',
    needsQuota: true,
  },
  {
    id: 'ersatt',
    label: 'Ersätt mitt nuvarande CV',
    description: 'Förbättringarna skrivs in i CV:t du analyserade. Ingen ny plats behövs. Sedan väljer du mall och laddar ner.',
    needsQuota: false,
  },
];

/**
 * Vad som ska hända med det förbättrade CV:t.
 *
 * Bort: den orange segmentstapeln med tre fyllda flikar, egna ikoner som
 * inverterades med brightness-filter och en röd låsprick i hörnet. Tre
 * likvärdiga val med förklaring, alltså ChoiceCard.
 */
export default function SaveActionSegments({
  value,
  onChange,
  canSave,
  cvCount,
  maxCvs,
  disabled = false,
  cvNamn = null,
}: SaveActionSegmentsProps) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-steg uppercase text-ink-3">Sista steget</p>
        <h4 className="mt-1.5 text-kort text-ink-1">Hur vill du spara ditt CV?</h4>
      </div>

      <div className="space-y-3">
        {CHOICES.map((choice) => {
          const isDisabled = disabled || (choice.needsQuota && !canSave);
          return (
            <ChoiceCard
              key={choice.id}
              variant="plain"
              selected={value === choice.id}
              onSelect={() => {
                if (!isDisabled) onChange(choice.id);
              }}
              leading={<IkonCv />}
              title={choice.label}
              description={
                isDisabled && choice.needsQuota
                  ? `Biblioteket är fullt, ${cvCount} av ${maxCvs} platser använda. Ersätt ditt nuvarande CV i stället, det kräver ingen ny plats.`
                  : choice.description
              }
              meta={
                choice.id === 'ersatt' && cvNamn
                  ? cvNamn
                  : choice.needsQuota && !isDisabled
                    ? `${cvCount} av ${maxCvs} platser använda`
                    : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
