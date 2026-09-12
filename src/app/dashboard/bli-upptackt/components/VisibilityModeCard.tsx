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
          <span className="text-xs font-bold tracking-wide rounded-full px-2.5 py-1 bg-neutral-100 text-neutral-500">
            Ej synlig
          </span>
        ) : undefined
      }
    >
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${!isOn ? 'opacity-60' : ''}`}>
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
        <p className="text-xs text-neutral-400 mt-2.5">
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
      className={`rounded-xl border-[1.5px] p-4 min-h-[72px] text-left transition-all touch-manipulation ${
        selected
          ? 'border-orange-500 bg-orange-50/60'
          : 'border-neutral-200 bg-white hover:border-orange-300'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-neutral-900">{title}</span>
        {recommended && (
          <span className="text-xs font-bold tracking-wide rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
            Rekommenderas
          </span>
        )}
      </span>
      <span className="block text-xs text-neutral-500 mt-1 leading-relaxed">{description}</span>
    </button>
  );
}
