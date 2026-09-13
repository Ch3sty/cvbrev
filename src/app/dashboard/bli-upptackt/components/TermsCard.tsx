'use client';

import { useEffect, useState } from 'react';
import SectionCard, { type CollapseProps } from './SectionCard';
import {
  AVAILABILITY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  EXTENT_OPTIONS,
  REGIONS,
  WORKPLACE_OPTIONS,
  labelFor,
  type Availability,
  type CandidateProfileState,
} from './types';

interface TermsCardProps {
  profile: CandidateProfileState;
  onPatch: (patch: Partial<CandidateProfileState>) => void;
  collapse?: CollapseProps;
}

/**
 * Dina villkor: chips för tillträde (enval), arbetsplats/omfattning/
 * anställning/region (flerval), körkorts-toggle och valfritt lönespann.
 * Varje ändring sparas direkt via onPatch.
 */
export default function TermsCard({ profile, onPatch, collapse }: TermsCardProps) {
  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Sammanfattning för ihopfällt läge: de viktigaste valen på en rad.
  const summaryParts = [
    profile.regions[0] ?? null,
    profile.workplace.map((w) => labelFor(WORKPLACE_OPTIONS, w)).filter(Boolean).join('/') || null,
    profile.extent.map((e) => labelFor(EXTENT_OPTIONS, e)).filter(Boolean).join('/') || null,
    labelFor(AVAILABILITY_OPTIONS, profile.availability),
  ].filter(Boolean) as string[];
  const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : undefined;

  return (
    <SectionCard
      title="Dina villkor"
      sub="Det här är vad rekryterare filtrerar på. Ju tydligare villkor, desto mer relevanta förfrågningar."
      delay={0.15}
      summary={summary}
      {...collapse}
    >
      <div className="space-y-5">
        <TermRow label="Tillträde">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={profile.availability === opt.value}
              onClick={() => onPatch({ availability: opt.value as Availability })}
            />
          ))}
        </TermRow>

        <TermRow label="Arbetsplats">
          {WORKPLACE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={profile.workplace.includes(opt.value)}
              onClick={() => onPatch({ workplace: toggleIn(profile.workplace, opt.value) })}
            />
          ))}
        </TermRow>

        <TermRow label="Omfattning">
          {EXTENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={profile.extent.includes(opt.value)}
              onClick={() => onPatch({ extent: toggleIn(profile.extent, opt.value) })}
            />
          ))}
        </TermRow>

        <TermRow label="Anställning">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={profile.employment_types.includes(opt.value)}
              onClick={() =>
                onPatch({ employment_types: toggleIn(profile.employment_types, opt.value) })
              }
            />
          ))}
        </TermRow>

        <TermRow label="Region">
          {REGIONS.map((region) => (
            <Chip
              key={region}
              label={region}
              selected={profile.regions.includes(region)}
              onClick={() => onPatch({ regions: toggleIn(profile.regions, region) })}
              small
            />
          ))}
        </TermRow>

        <TermRow label="Körkort">
          <Chip
            label="B-körkort"
            selected={profile.drivers_license}
            onClick={() => onPatch({ drivers_license: !profile.drivers_license })}
          />
        </TermRow>

        <TermRow label="Lönespann">
          <SalaryInputs
            min={profile.salary_min}
            max={profile.salary_max}
            onSave={(salary_min, salary_max) => onPatch({ salary_min, salary_max })}
          />
        </TermRow>
      </div>
    </SectionCard>
  );
}

function TermRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[130px_1fr] sm:gap-3">
      <div className="text-sm font-medium text-ink-3 sm:pt-3">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
  small,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-md border bg-panel text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
        small ? 'px-3' : 'px-3.5'
      } ${selected ? 'border-ink-1 font-medium shadow-val' : 'border-kant'}`}
    >
      {label}
    </button>
  );
}

function SalaryInputs({
  min,
  max,
  onSave,
}: {
  min: number | null;
  max: number | null;
  onSave: (min: number | null, max: number | null) => void;
}) {
  const [minValue, setMinValue] = useState(min !== null ? String(min) : '');
  const [maxValue, setMaxValue] = useState(max !== null ? String(max) : '');

  // Synka om profilen laddas in efter första rendern.
  useEffect(() => {
    setMinValue(min !== null ? String(min) : '');
    setMaxValue(max !== null ? String(max) : '');
  }, [min, max]);

  const parse = (value: string): number | null => {
    const n = parseInt(value.replace(/\s/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const save = () => onSave(parse(minValue), parse(maxValue));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Lägst, kr/mån"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          enterKeyHint="next"
          autoComplete="off"
          onBlur={save}
          aria-label="Lägsta månadslön"
          className="h-11 w-36 rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
        />
        <span className="text-sm text-ink-3" aria-hidden="true">
          till
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Högst, kr/mån"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          enterKeyHint="done"
          autoComplete="off"
          onBlur={save}
          aria-label="Högsta månadslön"
          className="h-11 w-36 rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
        />
      </div>
      <p className="mt-2 text-meta text-ink-3">
        Visas aldrig på profilen, används bara för att filtrera bort fel förfrågningar.
      </p>
    </div>
  );
}
