'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, MapPin, Check, ChevronDown } from 'lucide-react';
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
  { label: 'Deadline', value: 'applydate-asc' },
];

interface JobFilterPanelProps {
  filters: JobFilters;
  onChange: (next: JobFilters) => void;
  userLocation?: string | null;
  jobs?: any[]; // hämtade jobb — för region→kommun-gruppering med antal
}

/**
 * Filterpanel för jobbsök. Mobile-first:
 *   - mobil: en "Filter"-knapp som öppnar en bottom-drawer
 *   - desktop (lg+): alltid synlig som vänster-sidebar
 * All design i appens orange-DNA.
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

      <Segment
        title="Omfattning"
        options={WORKTIME}
        value={filters.worktimeExtent}
        onSelect={(v) => set({ worktimeExtent: v as string })}
      />

      <Segment
        title="Publicerat"
        options={PUBLISHED}
        value={filters.publishedAfterMinutes}
        onSelect={(v) => set({ publishedAfterMinutes: v as number })}
      />

      <Segment
        title="Sortering"
        options={SORT}
        value={filters.sort}
        onSelect={(v) => set({ sort: v as string })}
      />

      {/* Ortsfilter: region → kommun, antal ur faktisk jobbdata */}
      {regionGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Var jobben finns
            </span>
          </div>
          <div className="space-y-1.5">
            {regionGroups.map((region) => {
              const isExpanded = expandedRegion === region.code;
              const selectedInRegion = region.municipalities.filter((m) =>
                filters.municipality.includes(m.code)
              ).length;
              return (
                <div key={region.code} className="rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedRegion(isExpanded ? null : region.code)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-orange-50/50 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-800 truncate">{region.name}</span>
                      <span className="flex-shrink-0 text-xs text-slate-500 tabular-nums">({region.count})</span>
                      {selectedInRegion > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold">
                          {selectedInRegion}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all touch-manipulation min-h-[40px] border ${
                              selected
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                            {m.name}
                            <span className={`text-xs tabular-nums ${selected ? 'text-white/80' : 'text-slate-400'}`}>
                              {m.count}
                            </span>
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
          className="text-sm font-medium text-slate-500 hover:text-orange-600 transition-colors touch-manipulation"
        >
          Rensa alla filter ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* MOBIL: knapp som öppnar drawer (dölj på lg+) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-sm font-semibold text-slate-700 transition-all touch-manipulation min-h-[44px]"
      >
        <SlidersHorizontal className="w-4 h-4 text-orange-500" />
        Filter
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-[11px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* DESKTOP: alltid synlig sidebar */}
      <aside className="hidden lg:block w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 sticky top-6">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900">Filter</h3>
          </div>
          {body}
        </div>
      </aside>

      {/* MOBIL: bottom-drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <h3 className="text-base font-bold text-slate-900">Filter</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 touch-manipulation"
                  aria-label="Stäng filter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-5 pb-8">{body}</div>
              <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl text-white font-semibold touch-manipulation min-h-[48px]"
                  style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
                >
                  Visa resultat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
      className="w-full flex items-center justify-between gap-3 text-left touch-manipulation min-h-[44px]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>
      </span>
      <span
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function Segment<T extends string | number>({
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
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation min-h-[40px] border ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
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
