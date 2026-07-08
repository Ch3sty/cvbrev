'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookmarkCheck, BookmarkPlus, ChevronDown, Search } from 'lucide-react';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  EMPLOYMENT_OPTIONS,
  FAMILY_LABELS,
  FAMILY_ORDER,
  REGIONS,
  SENIORITY_OPTIONS,
  PERCENTILE_OPTIONS,
  STRENGTH_OPTIONS,
  ARCHETYPE_TITLES,
  EDUCATION_LEVEL_OPTIONS,
  countActiveFilters,
  type PoolFilterState,
  type SavedSearch,
} from './types';

interface FilterPanelProps {
  filters: PoolFilterState;
  onChange: (patch: Partial<PoolFilterState>) => void;
  onClearAll: () => void;
  onSaveSearch: (name: string) => Promise<boolean>;
  savedSearches: SavedSearch[];
  onApplySaved: (search: SavedSearch) => void;
}

/**
 * Sökvyns filterpanel: chips-grupper i specens ordning, radio-stege för
 * testresultat med familjeval, spara sökning i botten. Renderas i vänster-
 * kolumnen på desktop och i bottom-sheeten på mobil.
 */
export default function FilterPanel({
  filters,
  onChange,
  onClearAll,
  onSaveSearch,
  savedSearches,
  onApplySaved,
}: FilterPanelProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleIn = (key: keyof PoolFilterState, value: string) => {
    const current = filters[key] as string[];
    onChange({
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    } as Partial<PoolFilterState>);
  };

  const activeCount = countActiveFilters(filters);

  const handleSave = async () => {
    const name = saveName.trim();
    if (!name) return;
    setSaving(true);
    const ok = await onSaveSearch(name);
    setSaving(false);
    if (ok) {
      setSaveName('');
      setSaveOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Fritext, sticky överst i panelen */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-1 bg-white">
        <label className="relative block">
          <span className="sr-only">Sök på roll, kompetens eller teknik</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Roll, kompetens eller teknik, t.ex. React eller redovisningsekonom"
            className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
          />
        </label>
      </div>

      <ClusterHeader first>Vem</ClusterHeader>

      {/* 2. Senioritet */}
      <FilterGroup label="Senioritet">
        <ChipRow>
          {SENIORITY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.seniority.includes(opt.value)}
              onClick={() => toggleIn('seniority', opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      {/* 3. Län */}
      <FilterGroup label="Län">
        <MultiSelect
          placeholder="Hela Sverige"
          options={REGIONS.map((r) => ({ value: r, label: r }))}
          selected={filters.regions}
          onToggle={(v) => toggleIn('regions', v)}
        />
      </FilterGroup>

      {/* 9. Utbildningsnivå (hör till Vem) */}
      <FilterGroup label="Utbildningsnivå">
        <MultiSelect
          placeholder="Alla nivåer"
          options={EDUCATION_LEVEL_OPTIONS.map((l) => ({ value: l, label: l }))}
          selected={filters.educationLevels}
          onToggle={(v) => toggleIn('educationLevels', v)}
        />
      </FilterGroup>

      <ClusterHeader>Verifierat</ClusterHeader>

      {/* 6. Testresultat: radio-stege + familjer */}
      <FilterGroup label="Testresultat">
        <div className="space-y-1">
          {PERCENTILE_OPTIONS.map((opt) => (
            <label
              key={opt.value || 'alla'}
              className="flex items-center gap-2 min-h-[30px] cursor-pointer text-[13px] font-semibold text-slate-700"
            >
              <input
                type="radio"
                name="minPercentile"
                checked={filters.minPercentile === opt.value}
                onChange={() => onChange({ minPercentile: opt.value })}
                className="w-3.5 h-3.5 accent-orange-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {filters.minPercentile && (
          <div className="mt-2 pl-1 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Gäller familjerna
            </p>
            {FAMILY_ORDER.map((family) => (
              <label
                key={family}
                className="flex items-center gap-2 min-h-[28px] cursor-pointer text-[12.5px] font-semibold text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={filters.testFamilies.includes(family)}
                  onChange={() => toggleIn('testFamilies', family)}
                  className="w-3.5 h-3.5 rounded accent-orange-600"
                />
                {FAMILY_LABELS[family]}
              </label>
            ))}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ingen vald = golvet gäller valfri familj.
            </p>
          </div>
        )}
      </FilterGroup>

      {/* 7. Personlighetsstyrka */}
      <FilterGroup label="Personlighetsstyrka">
        <ChipRow>
          {STRENGTH_OPTIONS.map((s) => (
            <Chip
              key={s}
              active={filters.strengths.includes(s)}
              onClick={() => toggleIn('strengths', s)}
            >
              {s}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      {/* 8. Arbetsstil/arketyp */}
      <FilterGroup label="Arbetsstil">
        <ChipRow>
          {ARCHETYPE_TITLES.map((a) => (
            <Chip
              key={a}
              active={filters.archetypes.includes(a)}
              onClick={() => toggleIn('archetypes', a)}
            >
              {a}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <ClusterHeader>Villkor</ClusterHeader>

      {/* Tillträde */}
      <FilterGroup label="Tillträde">
        <ChipRow>
          {AVAILABILITY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.availability === opt.value}
              onClick={() =>
                onChange({ availability: filters.availability === opt.value ? '' : opt.value })
              }
            >
              {opt.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      {/* Arbetsplats */}
      <FilterGroup label="Arbetsplats">
        <ChipRow>
          {WORKPLACE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.workplace.includes(opt.value)}
              onClick={() => toggleIn('workplace', opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      {/* Omfattning + anställningsform + körkort */}
      <FilterGroup label="Omfattning">
        <ChipRow>
          {EXTENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.extent.includes(opt.value)}
              onClick={() => toggleIn('extent', opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <FilterGroup label="Anställningsform">
        <ChipRow>
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.employmentTypes.includes(opt.value)}
              onClick={() => toggleIn('employmentTypes', opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
          <Chip
            active={filters.driversLicense}
            onClick={() => onChange({ driversLicense: !filters.driversLicense })}
          >
            B-körkort
          </Chip>
        </ChipRow>
      </FilterGroup>

      {/* Budget: filtrerar utan att någonsin exponera anspråket */}
      <FilterGroup label="Ryms inom budget (kr/mån)">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={filters.budget}
          onChange={(e) => onChange({ budget: e.target.value })}
          placeholder="T.ex. 45000"
          className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
        />
        <p className="mt-1.5 text-[11.5px] text-slate-400 leading-relaxed">
          Kandidatens anspråk visas aldrig, vi filtrerar bara.
        </p>
      </FilterGroup>

      {/* Botten: rensa + spara */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="min-h-[38px] px-2 text-[12.5px] font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
          >
            Rensa alla
          </button>
          <button
            type="button"
            onClick={() => setSaveOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl text-[12.5px] font-bold text-orange-700 border border-orange-300 bg-white hover:bg-orange-50 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" aria-hidden="true" />
            Spara sökning
          </button>
        </div>

        {saveOpen && (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Namn, t.ex. Backend Stockholm"
              maxLength={80}
              autoFocus
              className="flex-1 min-w-0 min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !saveName.trim()}
              className="flex-shrink-0 min-h-[38px] px-3 rounded-xl text-[12.5px] font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Sparar…' : 'Spara'}
            </button>
          </div>
        )}

        {savedSearches.length > 0 && (
          <div className="pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
              Sparade sökningar
            </p>
            <div className="space-y-0.5">
              {savedSearches.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onApplySaved(s)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-[12.5px] font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-800 transition-colors"
                >
                  <BookmarkCheck
                    className="w-3.5 h-3.5 text-orange-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interna byggstenar
// ---------------------------------------------------------------------------

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

/** Klusterrubrik som delar filtren i tre skanningsbara zoner. */
function ClusterHeader({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <div className={first ? '' : 'pt-2 mt-1 border-t border-slate-100'}>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-orange-700">
        {children}
      </p>
    </div>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[32px] px-2.5 rounded-full border text-[12px] transition-colors ${
        active
          ? 'bg-orange-50 border-orange-300 text-orange-800 font-bold'
          : 'bg-white border-slate-200 text-slate-600 font-semibold hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

/** Flervals-dropdown med checkboxar (län, utbildningsnivå). */
function MultiSelect({
  placeholder,
  options,
  selected,
  onToggle,
}: {
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 min-h-[40px] px-3 rounded-xl border text-[13px] font-semibold transition-colors ${
          selected.length > 0
            ? 'bg-orange-50 border-orange-300 text-orange-800'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg p-1.5 z-40"
        >
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[13px] font-semibold text-slate-700 hover:bg-orange-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                  className="w-3.5 h-3.5 rounded accent-orange-600"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
