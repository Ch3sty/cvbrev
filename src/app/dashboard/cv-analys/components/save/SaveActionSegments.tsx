'use client';

import ChoiceCard from '@/components/shell/ChoiceCard';
import { IkonLaddaNer, IkonCv } from '@/components/illustrations/Ikoner';

export type SaveChoice = 'save-and-download' | 'download' | 'save';

interface SaveActionSegmentsProps {
  value: SaveChoice | null;
  onChange: (choice: SaveChoice) => void;
  canSave: boolean;
  cvCount: number;
  maxCvs: number;
  disabled?: boolean;
}

const CHOICES: Array<{
  id: SaveChoice;
  label: string;
  description: string;
  needsQuota: boolean;
}> = [
  {
    id: 'save-and-download',
    label: 'Spara och ladda ner',
    description: 'Vi sparar under Mina CV och laddar ner PDF:en samtidigt.',
    needsQuota: true,
  },
  {
    id: 'download',
    label: 'Ladda ner',
    description: 'Vi laddar ner en PDF utan att spara. Du kan ladda upp senare.',
    needsQuota: false,
  },
  {
    id: 'save',
    label: 'Spara på Jobbcoach',
    description: 'Vi sparar under Mina CV utan nedladdning.',
    needsQuota: true,
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
}: SaveActionSegmentsProps) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-steg uppercase text-ink-3">Sista steget</p>
        <h4 className="mt-1.5 text-kort text-ink-1">Vad vill du göra med ditt CV?</h4>
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
              leading={choice.id === 'download' ? <IkonLaddaNer /> : <IkonCv />}
              title={choice.label}
              description={
                isDisabled && choice.needsQuota
                  ? `${choice.description} Biblioteket är fullt, ${cvCount} av ${maxCvs} platser använda.`
                  : choice.description
              }
              meta={
                choice.needsQuota && !isDisabled
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
