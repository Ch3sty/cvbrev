'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import CandidateHitCard from './components/CandidateHitCard';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  PERCENTILE_FLOORS,
  REGIONS,
  STRENGTH_OPTIONS,
  type PoolCandidate,
} from './components/types';

interface Filters {
  q: string;
  region: string;
  availability: string;
  workplace: string;
  minPercentile: string;
  strength: string;
}

const EMPTY_FILTERS: Filters = {
  q: '',
  region: '',
  availability: '',
  workplace: '',
  minPercentile: '',
  strength: '',
};

/**
 * Kandidatpoolen: sök och filtrera bland synliga kandidatprofiler, visa
 * intresse direkt på kortet eller öppna detaljprofilen. Layouten sköter
 * guarden — sidan renderas bara för godkända rekryterare.
 */
export default function RekryterarePoolPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [candidates, setCandidates] = useState<PoolCandidate[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPool = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.q.trim()) params.set('role', f.q.trim());
      if (f.region) params.set('region', f.region);
      if (f.availability) params.set('availability', f.availability);
      if (f.workplace) params.set('workplace', f.workplace);
      if (f.minPercentile) params.set('minPercentile', f.minPercentile);
      if (f.strength) params.set('strength', f.strength);

      const res = await fetch(`/api/recruiter/pool?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        candidates: PoolCandidate[];
        totalCount: number;
      };
      setCandidates(data.candidates);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Rekryterarpool: kunde inte hämta kandidater', error);
      setCandidates([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sökfältet debounceas, select-filtren slår igenom direkt.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPool(filters), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchPool]);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleInterest = useCallback(
    async (candidateUserId: string) => {
      setSendingId(candidateUserId);
      setNotice(null);

      // Optimistisk uppdatering med snapshot för rollback.
      const snapshot = candidates;
      setCandidates((prev) =>
        (prev ?? []).map((c) =>
          c.userId === candidateUserId ? { ...c, interestStatus: 'pending' } : c
        )
      );

      try {
        const res = await fetch('/api/recruiter/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setCandidates(snapshot);
          setNotice(
            data?.error ?? 'Du har nått gränsen på 10 intressen per dygn.'
          );
          return;
        }
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        // Befintligt intresse kan ha annan status än pending — synka in den.
        const status = data?.interest?.status ?? 'pending';
        setCandidates((prev) =>
          (prev ?? []).map((c) =>
            c.userId === candidateUserId ? { ...c, interestStatus: status } : c
          )
        );
      } catch (error) {
        console.error('Rekryterarpool: kunde inte skicka intresse', error);
        setCandidates(snapshot);
        setNotice('Det gick inte att skicka intresset. Försök igen.');
      } finally {
        setSendingId(null);
      }
    },
    [candidates]
  );

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-5">
      {/* Rubrik */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Kandidatpoolen</h1>
        <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">
          Aktiva kandidater med verifierade testresultat. Visa intresse så får
          kandidaten frågan, och kontakten låses upp när den accepterar.
        </p>
      </motion.div>

      {/* Sök och filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 overflow-hidden"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      >
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
          aria-hidden="true"
        />

        <label className="relative block">
          <span className="sr-only">Sök på roll eller kompetens</span>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Sök på roll eller kompetens, t.ex. utvecklare eller redovisning"
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
          />
        </label>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            Filter
          </span>

          <FilterSelect
            label="Län"
            value={filters.region}
            onChange={(v) => setFilter('region', v)}
            options={REGIONS.map((r) => ({ value: r, label: r }))}
            allLabel="Hela Sverige"
          />
          <FilterSelect
            label="Tillträde"
            value={filters.availability}
            onChange={(v) => setFilter('availability', v)}
            options={AVAILABILITY_OPTIONS}
            allLabel="Alla tillträden"
          />
          <FilterSelect
            label="Arbetsplats"
            value={filters.workplace}
            onChange={(v) => setFilter('workplace', v)}
            options={WORKPLACE_OPTIONS}
            allLabel="Alla arbetsplatser"
          />
          <FilterSelect
            label="Testresultat"
            value={filters.minPercentile}
            onChange={(v) => setFilter('minPercentile', v)}
            options={PERCENTILE_FLOORS.map((p) => ({
              value: String(p),
              label: `Topp ${100 - p} %`,
            }))}
            allLabel="Alla resultat"
          />
          <FilterSelect
            label="Styrka"
            value={filters.strength}
            onChange={(v) => setFilter('strength', v)}
            options={STRENGTH_OPTIONS.map((s) => ({ value: s, label: s }))}
            allLabel="Alla styrkor"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="min-h-[36px] px-3 rounded-lg text-[12.5px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            >
              Rensa
            </button>
          )}
        </div>
      </motion.div>

      {notice && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {notice}
        </p>
      )}

      {/* Resultat */}
      {loading && candidates === null ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-orange-50/60 h-48 animate-pulse" />
          ))}
        </div>
      ) : (candidates?.length ?? 0) === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center"
        >
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">
            {hasActiveFilters ? 'Inga kandidater matchar filtren' : 'Poolen fylls på'}
          </h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto">
            {hasActiveFilters
              ? 'Prova att bredda sökningen, ta bort ett filter eller sänk percentilgolvet.'
              : 'Nya kandidater aktiverar sina profiler löpande. Titta in igen inom kort, vi jobbar på att fylla poolen.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-5 inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
            >
              Rensa alla filter
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <p className="text-[12.5px] text-slate-500 font-semibold">
            {totalCount === 1 ? '1 kandidat' : `${totalCount} kandidater`}
            {(candidates?.length ?? 0) < totalCount
              ? ` · visar de ${candidates?.length} första`
              : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(candidates ?? []).map((candidate) => (
              <CandidateHitCard
                key={candidate.userId}
                candidate={candidate}
                sending={sendingId === candidate.userId}
                onInterest={handleInterest}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  allLabel: string;
}) {
  const active = value !== '';
  return (
    <label className="inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[36px] max-w-[180px] pl-3 pr-7 rounded-lg border text-[12.5px] font-bold appearance-none bg-no-repeat bg-[right_0.5rem_center] cursor-pointer transition-colors ${
          active
            ? 'bg-orange-50 border-orange-200 text-orange-800'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
