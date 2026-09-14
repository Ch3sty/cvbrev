'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import Sheet from '@/components/shell/Sheet';
import { groupJobsByRegion, type RegionGroup } from '../data/job-filtering';

/**
 * Filter-tillstånd som skickas till match-jobs edge-funktionen.
 * Fälten mappar 1:1 mot JobSearch-API-parametrar (se multi-source-aggregator).
 * Tomma/falska värden = filtret är av (edge normaliserar bort dem).
 */
export interface JobFilters {
  remote: boolean;                 // remote=true
  noExperience: boolean;           // experience=false
  worktimeExtent: string;          // worktime-extent concept_id ('' = alla)
  publishedAfterMinutes: number;   // published-after (0 = alla)
  sort: string;                    // sort ('' = relevans/standard)
  municipality: string[];          // municipality concept_ids
}

export const DEFAULT_FILTERS: JobFilters = {
  remote: false,
  noExperience: false,
  worktimeExtent: '',
  publishedAfterMinutes: 0,
  sort: '',
  municipality: [],
};

// Antal aktiva filter (för räknar-badge på mobilknappen).
export function countActiveFilters(f: JobFilters): number {
  let n = 0;
  if (f.remote) n++;
  if (f.noExperience) n++;
  if (f.worktimeExtent) n++;
  if (f.publishedAfterMinutes > 0) n++;
  if (f.sort) n++;
  n += f.municipality.length;
  return n;
}

// Verifierade concept_ids mot taxonomy live (2026-06).
const WORKTIME = [
  { label: 'Alla', value: '' },
  { label: 'Heltid', value: '6YE1_gAC_R2G' },
  { label: 'Deltid', value: '947z_JGS_Uk2' },
];

const PUBLISHED = [
  { label: 'Alla', value: 0 },
  { label: '24h', value: 24 * 60 },
  { label: '3 dagar', value: 3 * 24 * 60 },
  { label: '7 dagar', value: 7 * 24 * 60 },
];

const SORT = [
  { label: 'Relevans', value: '' },
  { label: 'Nyast', value: 'pubdate-desc' },
  { label: 'Sista ansökningsdag', value: 'applydate-asc' },
];

interface JobFilterPanelProps {
  filters: JobFilters;
  onChange: (next: JobFilters) => void;
  userLocation?: string | null;
  jobs?: any[]; // hämtade jobb, för region→kommun-gruppering med antal
}

/**
 * Filterpanel för jobbsök. På mobil en knapp som öppnar ett ark, på desktop
 * en panel i vänsterspalten. Val markeras med kant i ink, aldrig med fyllning.
 */
export default function JobFilterPanel({ filters, onChange, userLocation, jobs = [] }: JobFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const activeCount = countActiveFilters(filters);

  // Region→kommun-grupper med antal, härledda ur de hämtade jobben.
  const regionGroups = useMemo<RegionGroup[]>(() => groupJobsByRegion(jobs), [jobs]);

  const set = (patch: Partial<JobFilters>) => onChange({ ...filters, ...patch });

  // Ortsfiltret matchar nu på kommunkod (municipality_code) klientsidigt.
  const toggleMuni = (code: string) => {
    const has = filters.municipality.includes(code);
    set({
      municipality: has
        ? filters.municipality.filter((m) => m !== code)
        : [...filters.municipality, code],
    });
  };

  const reset = () => onChange(DEFAULT_FILTERS);

  const body = (
    <div className="space-y-6">
      {/* Toggles: distans + utan erfarenhet */}
      <div className="space-y-3">
        <ToggleRow
          label="Endast distansjobb"
          hint="Jobb som kan utföras på distans"
          checked={filters.remote}
          onChange={(v) => set({ remote: v })}
        />
        <ToggleRow
          label="Utan krav på erfarenhet"
          hint="Visa jobb som inte kräver tidigare erfarenhet"
          checked={filters.noExperience}
          onChange={(v) => set({ noExperience: v })}
        />
      </div>

      <FilterSegment
        title="Omfattning"
        options={WORKTIME}
        value={filters.worktimeExtent}
        onSelect={(v) => set({ worktimeExtent: v as string })}
      />

      <FilterSegment
        title="Publicerat"
        options={PUBLISHED}
        value={filters.publishedAfterMinutes}
        onSelect={(v) => set({ publishedAfterMinutes: v as number })}
      />

      <FilterSegment
        title="Sortering"
        options={SORT}
        value={filters.sort}
        onSelect={(v) => set({ sort: v as string })}
      />

      {/* Ortsfilter: region → kommun, antal ur faktisk jobbdata */}
      {regionGroups.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-ink-3">Var jobben finns</span>
          <div className="space-y-1.5">
            {regionGroups.map((region) => {
              const isExpanded = expandedRegion === region.code;
              const selectedInRegion = region.municipalities.filter((m) =>
                filters.municipality.includes(m.code)
              ).length;
              return (
                <div key={region.code} className="overflow-hidden rounded-lg border border-kant">
                  <button
                    type="button"
                    onClick={() => setExpandedRegion(isExpanded ? null : region.code)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left hover:bg-insunken"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-medium text-ink-1">{region.name}</span>
                      <span className="shrink-0 text-meta tabular-nums text-ink-3">
                        {region.count}
                        {selectedInRegion > 0 && ` · ${selectedInRegion} valda`}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-ink-3 transition-transform duration-[120ms] ${isExpanded ? 'rotate-180' : ''}`}
                      strokeWidth={1.75}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
                      {region.municipalities.map((m) => {
                        const selected = filters.municipality.includes(m.code);
                        return (
                          <button
                            key={m.code}
                            type="button"
                            onClick={() => toggleMuni(m.code)}
                            aria-pressed={selected}
                            className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-panel px-3 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
                              selected ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
                            }`}
                          >
                            {selected && (
                              <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                            )}
                            {m.name}
                            <span className="text-meta tabular-nums text-ink-3">{m.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          Rensa alla filter ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobil: knappen som öppnar arket */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken lg:hidden"
      >
        Filter
        {activeCount > 0 && (
          <span className="ml-2 text-meta tabular-nums text-ink-3">{activeCount}</span>
        )}
      </button>

      {/* Desktop: panelen i vänsterspalten */}
      <aside className="hidden w-full lg:block">
        <div className="sticky top-4 rounded-xl border border-kant bg-panel p-4">
          <h2 className="mb-4 text-sm font-medium text-ink-3">Filter</h2>
          {body}
        </div>
      </aside>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filter" size="lg">
        {body}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
        >
          Visa resultat
        </button>
      </Sheet>
    </>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-1">{label}</span>
        <span className="mt-0.5 block text-meta text-ink-3">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-[120ms] ${
          checked ? 'border-ink-1 bg-ink-1' : 'border-kant-stark bg-insunken'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full border border-kant bg-panel transition-transform duration-[120ms] ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function FilterSegment<T extends string | number>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: { label: string; value: T }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-ink-3">{title}</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={title}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelect(opt.value)}
              role="radio"
              aria-checked={active}
              className={`inline-flex min-h-11 items-center rounded-md border bg-panel px-3 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
                active ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
