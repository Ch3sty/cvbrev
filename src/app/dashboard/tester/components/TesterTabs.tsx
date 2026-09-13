'use client';

/**
 * Flikarna på hubben är ett Segment: två lika breda knappar på 44 px.
 * Antalet slutförda försök står i etiketten, inte i en badge.
 */

import Segment from '@/components/shell/Segment';

export type TesterTab = 'tester' | 'utveckling';

interface Props {
  active: TesterTab;
  onChange: (tab: TesterTab) => void;
  /** Antal slutförda försök, står i utvecklingsflikens etikett. */
  completedCount: number;
}

export default function TesterTabs({ active, onChange, completedCount }: Props) {
  return (
    <Segment<TesterTab>
      value={active}
      onChange={onChange}
      label="Vy"
      className="sm:max-w-sm"
      options={[
        { value: 'tester', label: 'Tester' },
        {
          value: 'utveckling',
          label: completedCount > 0 ? `Din utveckling (${completedCount})` : 'Din utveckling',
        },
      ]}
    />
  );
}
