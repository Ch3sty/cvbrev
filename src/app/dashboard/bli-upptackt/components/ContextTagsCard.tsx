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
 * kvalificerade förslag. Kandidatens EGEN självpresentation — visas hos
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
        <span className="text-[12.5px] text-slate-500">
          <b className="text-slate-900">{selected.length}</b> av {MAX_TAGS} valda
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
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors touch-manipulation ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                  : isDisabled
                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-800'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" strokeWidth={3} />}
              {tag}
            </button>
          );
        })}
      </div>
      <p className="text-[12px] text-slate-400 leading-relaxed mt-3">
        Förslagen bygger på din profil, du väljer själv vilka som får stå för
        dig. Rekryterare kan aldrig filtrera på taggarna, de läser dem som din
        egen beskrivning.
      </p>
    </SectionCard>
  );
}
