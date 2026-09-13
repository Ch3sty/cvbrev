'use client';

import StatusRow from '@/components/shell/StatusRow';
import type { Visibility } from './types';

interface MasterHeaderProps {
  visibility: Visibility;
  saving: boolean;
  onToggle: () => void;
}

/**
 * Synligheten som statusrad: "Inte sökbar" (neutral) eller "Sökbar för
 * rekryterare" (positiv), med reglaget i ink-1 till höger. Reglaget styr all
 * synlighet. Status är en rad, aldrig ett kort.
 */
export default function MasterHeader({ visibility, saving, onToggle }: MasterHeaderProps) {
  const isOn = visibility !== 'off';
  const label = !isOn
    ? 'Inte sökbar'
    : visibility === 'anonymous'
      ? 'Sökbar för rekryterare, anonym'
      : 'Sökbar för rekryterare, öppen';

  return (
    <StatusRow
      tone={isOn ? 'positive' : 'neutral'}
      showDot
      label="Synlighet för rekryterare"
      action={
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Synlig för rekryterare"
          disabled={saving}
          onClick={onToggle}
          className={`relative inline-flex h-11 w-14 shrink-0 items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            saving ? 'opacity-60' : ''
          }`}
        >
          <span
            className={`relative block h-6 w-11 rounded-full transition-colors duration-200 ${
              isOn ? 'bg-ink-1' : 'bg-kant-stark'
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-panel transition-[left] duration-200 ${
                isOn ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </span>
        </button>
      }
    >
      {label}
    </StatusRow>
  );
}
