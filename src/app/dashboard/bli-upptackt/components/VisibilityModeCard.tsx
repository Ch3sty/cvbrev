'use client';

import SectionCard, { type CollapseProps } from './SectionCard';
import type { Visibility } from './types';

interface VisibilityModeCardProps {
  visibility: Visibility;
  /** Läget som senast var aktivt, visas som markerat även när mastern är av. */
  lastMode: 'anonymous' | 'open';
  onChange: (mode: 'anonymous' | 'open') => void;
  collapse?: CollapseProps;
}

/**
 * Synlighetsläge: två valkort (Anonym först rekommenderas / Öppen profil).
 * Skriver visibility, men bara när mastern är på, i avstängt läge visas
 * korten dämpade.
 */
export default function VisibilityModeCard({ visibility, lastMode, onChange, collapse }: VisibilityModeCardProps) {
  const isOn = visibility !== 'off';
  const activeMode = isOn ? visibility : lastMode;

  return (
    <SectionCard
      title="Synlighetsläge"
      sub="Anonym först är standard. Namn och foto visas aldrig förrän du själv godkänner en kontakt."
      delay={0.1}
      {...collapse}
      headerExtra={
        !isOn ? (
          <span className="text-meta text-ink-3">Ej synlig</span>
        ) : undefined
      }
    >
      <div
        className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${!isOn ? 'opacity-60' : ''}`}
        role="radiogroup"
        aria-label="Synlighetsläge"
      >
        <ModeOption
          selected={activeMode === 'anonymous'}
          disabled={!isOn}
          onClick={() => onChange('anonymous')}
          title="Anonym först"
          recommended
          description="Rekryteraren ser din roll och region och visar intresse. Du bestämmer om ni går vidare."
        />
        <ModeOption
          selected={activeMode === 'open'}
          disabled={!isOn}
          onClick={() => onChange('open')}
          title="Öppen profil"
          description="Namn syns direkt. Snabbare kontakt, mindre kontroll."
        />
      </div>
      {!isOn && (
        <p className="mt-2.5 text-meta text-ink-3">
          Slå på synligheten uppe till höger för att välja läge.
        </p>
      )}
    </SectionCard>
  );
}

function ModeOption({
  selected,
  disabled,
  onClick,
  title,
  description,
  recommended,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  title: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[72px] rounded-xl border bg-panel p-4 text-left transition-[border-color,background-color] duration-[160ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed ${
        selected ? 'border-ink-1 shadow-val' : 'border-kant'
      }`}
    >
      {recommended && (
        <span className="mb-1 block text-steg uppercase text-accent-ink">Rekommenderas</span>
      )}
      <span className="block text-kort text-ink-1">{title}</span>
      <span className="mt-1 block text-meta text-ink-3">{description}</span>
    </button>
  );
}
