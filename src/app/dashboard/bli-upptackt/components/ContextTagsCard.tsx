'use client';

import { Check } from 'lucide-react';
import SectionCard from './SectionCard';

interface ContextTagsCardProps {
  /** Taggar kandidaten är kvalificerad att välja bland (ur motorn). */
  options: string[];
  /** Valda taggar (max 2), sparas som context_tags. */
  selected: string[];
  onChange: (tags: string[]) => void;
}

const MAX_TAGS = 2;

/**
 * "Söker mig till": kandidaten väljer själv upp till 2 kontexttaggar ur sina
 * kvalificerade förslag. Kandidatens EGEN självpresentation, visas hos
 * rekryterare som pitch, aldrig som filter på testdata.
 */
export default function ContextTagsCard({ options, selected, onChange }: ContextTagsCardProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < MAX_TAGS) {
      onChange([...selected, tag]);
    }
  };

  return (
    <SectionCard
      title="Söker mig till"
      sub="Taggarna är dina egna ord om var du trivs, byggda på ditt personlighetstest. Rekryterare ser dem som din självpresentation."
      delay={0.22}
      headerExtra={
        <span className="text-meta text-ink-3">
          <span className="tabular-nums text-ink-1">{selected.length}</span> av {MAX_TAGS} valda
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && selected.length >= MAX_TAGS;
          return (
            <button
              key={tag}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(tag)}
              disabled={isDisabled}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-panel px-3.5 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
              }`}
            >
              {isSelected && (
                <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              )}
              {tag}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-meta text-ink-3">
        Förslagen bygger på din profil, du väljer själv vilka som får stå för
        dig. Rekryterare kan aldrig filtrera på taggarna, de läser dem som din
        egen beskrivning.
      </p>
    </SectionCard>
  );
}
