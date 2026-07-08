'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, SlidersHorizontal, Users, X } from 'lucide-react';
import CandidateHitCard from './components/CandidateHitCard';
import CandidateTable from './components/CandidateTable';
import CompareToolbar from './components/CompareToolbar';
import FilterPanel from './components/FilterPanel';
import PeekPanel from './components/PeekPanel';
import {
  EMPTY_POOL_FILTERS,
  SORT_OPTIONS,
  CTA_GRADIENT,
  buildPoolParams,
  countActiveFilters,
  filterStateToSaved,
  savedToFilterState,
  tokenizePreview,
  type PoolCandidate,
  type PoolFilterState,
  type PoolSortKey,
  type SavedSearch,
} from './components/types';

/**
 * Sökvyn: filterpanel till vänster, resultattabell till höger på desktop,
 * kortgrid + bottom-sheet-filter på mobil. Radklick öppnar peek-panelen.
 * ?saved=<id> applicerar en sparad sökning vid mount (bevakningsmailen
 * länkar hit).
 */
export default function RekryterarePoolPage() {
  return (
    <Suspense fallback={<PoolSkeleton />}>
      <SearchView />
    </Suspense>
  );
}

function PoolSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="rounded-3xl bg-orange-50/60 h-14 animate-pulse" />
      <div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" />
    </div>
  );
}

function SearchView() {
  const searchParams = useSearchParams();
  const savedIdFromUrl = searchParams?.get('saved') ?? null;

  const [filters, setFilters] = useState<PoolFilterState>(EMPTY_POOL_FILTERS);
  const [sort, setSort] = useState<PoolSortKey>('relevance');
  const [candidates, setCandidates] = useState<PoolCandidate[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [peekCandidate, setPeekCandidate] = useState<PoolCandidate | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const savedAppliedRef = useRef(false);

  const fetchPool = useCallback(
    async (f: PoolFilterState, s: PoolSortKey, p: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = buildPoolParams(f, s, p);
        const res = await fetch(`/api/recruiter/pool?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          candidates: PoolCandidate[];
          total: number;
        };
        if (requestId !== requestIdRef.current) return;
        setTotal(data.total);
        setCandidates((prev) =>
          append ? [...(prev ?? []), ...data.candidates] : data.candidates
        );
      } catch (error) {
        console.error('Rekryterarpool: kunde inte hämta kandidater', error);
        if (requestId !== requestIdRef.current) return;
        if (!append) {
          setCandidates([]);
          setTotal(0);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  // Sökfältet debounceas, övriga filter och sortering slår igenom direkt.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPool(filters, sort, 1, false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, sort, fetchPool]);

  // Sparade sökningar + ?saved=<id> vid mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/saved-searches');
        if (!res.ok) return;
        const data = (await res.json()) as { searches: SavedSearch[] };
        if (cancelled) return;
        setSavedSearches(data.searches);
        if (savedIdFromUrl && !savedAppliedRef.current) {
          const match = data.searches.find((s) => s.id === savedIdFromUrl);
          if (match) {
            savedAppliedRef.current = true;
            setFilters(savedToFilterState(match.filters));
          }
        }
      } catch {
        // Panelen fungerar utan sparade sökningar.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIdFromUrl]);

  const patchFilters = useCallback((patch: Partial<PoolFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearAll = useCallback(() => setFilters(EMPTY_POOL_FILTERS), []);

  const saveSearch = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/recruiter/saved-searches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, filters: filterStateToSaved(filters) }),
        });
        const data = (await res.json().catch(() => null)) as {
          search?: SavedSearch;
          searches?: SavedSearch[];
          error?: string;
        } | null;
        if (!res.ok) {
          setNotice(data?.error ?? 'Kunde inte spara sökningen.');
          return false;
        }
        // Hämta om listan så id:n och ordning stämmer.
        const listRes = await fetch('/api/recruiter/saved-searches');
        if (listRes.ok) {
          const listData = (await listRes.json()) as { searches: SavedSearch[] };
          setSavedSearches(listData.searches);
        }
        setNotice(`Sökningen "${name}" är sparad. Slå på bevakning under Sparade sökningar.`);
        return true;
      } catch {
        setNotice('Kunde inte spara sökningen.');
        return false;
      }
    },
    [filters]
  );

  const applySaved = useCallback((search: SavedSearch) => {
    setFilters(savedToFilterState(search.filters));
    setSheetOpen(false);
  }, []);

  // Intresseflödet: optimistisk uppdatering med rollback (samma som tidigare).
  const handleInterest = useCallback(
    async (candidateUserId: string) => {
      setSendingId(candidateUserId);
      setNotice(null);

      const snapshot = candidates;
      const apply = (status: PoolCandidate['interestStatus']) => {
        setCandidates((prev) =>
          (prev ?? []).map((c) =>
            c.userId === candidateUserId ? { ...c, interestStatus: status } : c
          )
        );
        setPeekCandidate((prev) =>
          prev && prev.userId === candidateUserId ? { ...prev, interestStatus: status } : prev
        );
      };
      apply('pending');

      try {
        const res = await fetch('/api/recruiter/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setCandidates(snapshot);
          setNotice(data?.error ?? 'Du har nått gränsen på 10 intressen per dygn.');
          return;
        }
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        apply(data?.interest?.status ?? 'pending');
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

  // Bulk-intresse: skickar till markerade kandidater som saknar intressestatus.
  // Sekventiellt så dygnsgränsen (10/dygn) respekteras, stannar vid 429.
  const [bulkSending, setBulkSending] = useState(false);
  const handleBulkInterest = useCallback(
    async (userIds: string[]) => {
      const pool = candidates ?? [];
      // Bara de utan tidigare intresse (skickat/accepterat/avböjt hoppas över).
      const targets = userIds.filter((id) =>
        pool.some((c) => c.userId === id && !c.interestStatus)
      );
      if (targets.length === 0) {
        setNotice('De markerade kandidaterna har redan fått en intresseförfrågan.');
        return;
      }

      setBulkSending(true);
      setNotice(null);
      let sent = 0;
      let stoppedByLimit = false;

      for (const candidateUserId of targets) {
        try {
          const res = await fetch('/api/recruiter/interest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateUserId }),
          });
          const data = await res.json().catch(() => null);
          if (res.status === 429) {
            stoppedByLimit = true;
            break;
          }
          if (!res.ok) continue;
          sent += 1;
          const status = data?.interest?.status ?? 'pending';
          setCandidates((prev) =>
            (prev ?? []).map((c) =>
              c.userId === candidateUserId ? { ...c, interestStatus: status } : c
            )
          );
        } catch (error) {
          console.error('Rekryterarpool: bulk-intresse misslyckades', error);
        }
      }

      setBulkSending(false);
      setSelectedIds([]);
      if (stoppedByLimit) {
        setNotice(
          `${sent} intresse${sent === 1 ? '' : 'n'} skickade. Du nådde dygnsgränsen på 10, försök igen imorgon.`
        );
      } else if (sent > 0) {
        setNotice(`${sent} intresse${sent === 1 ? '' : 'n'} skickade.`);
      } else {
        setNotice('Det gick inte att skicka intressena. Försök igen.');
      }
    },
    [candidates]
  );

  const toggleSelect = useCallback((userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visible = (candidates ?? []).map((c) => c.userId);
    setSelectedIds((prev) => (visible.every((id) => prev.includes(id)) ? [] : visible));
  }, [candidates]);

  const activeCount = countActiveFilters(filters);
  const hasQuery = filters.q.trim().length > 0;
  const shown = candidates?.length ?? 0;
  const hasMore = shown < total;

  const nextBestActions = useMemo(
    () => buildNextBestActions(filters, patchFilters, clearAll),
    [filters, patchFilters, clearAll]
  );

  return (
    <div className="space-y-4">
      {/* Rubrik */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-end justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Sök kandidater</h1>
          <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed max-w-xl">
            Aktiva kandidater med verifierade testresultat. Visa intresse så får
            kandidaten frågan, och kontakten låses upp när den accepterar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="hidden lg:inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl text-[12.5px] font-bold text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          {panelOpen ? (
            <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
          )}
          {panelOpen ? 'Dölj filter' : 'Visa filter'}
        </button>
      </motion.div>

      {notice && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {notice}
        </p>
      )}

      <div className="flex items-start gap-5">
        {/* Filterpanel, desktop */}
        {panelOpen && (
          <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-orange-100 bg-white p-4">
            <FilterPanel
              filters={filters}
              onChange={patchFilters}
              onClearAll={clearAll}
              onSaveSearch={saveSearch}
              savedSearches={savedSearches}
              onApplySaved={applySaved}
            />
          </aside>
        )}

        {/* Resultat */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Sorteringsrad */}
          <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap">
            <span className="text-[12.5px] font-bold text-slate-600">
              {loading
                ? 'Söker…'
                : total === 1
                  ? '1 kandidat'
                  : `${total} kandidater`}
            </span>
            <span className="text-[12.5px] text-slate-400">·</span>
            <span className="text-[12.5px] text-slate-400">Sorterat efter:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={`min-h-[30px] px-2.5 rounded-lg text-[12.5px] transition-colors ${
                    sort === opt.value
                      ? 'bg-orange-50 text-orange-800 font-bold'
                      : 'text-slate-500 font-semibold hover:bg-slate-50'
                  }`}
                  aria-pressed={sort === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jämför-verktygsraden */}
          {selectedIds.length > 0 && (
            <CompareToolbar
              selectedIds={selectedIds}
              onClear={() => setSelectedIds([])}
              onBulkInterest={handleBulkInterest}
              bulkSending={bulkSending}
            />
          )}

          {/* Tunn pool: få träffar ser lätt ut som ett fullständigt resultat.
              Styr mot bevakning i stället för att låta rekryteraren studsa av. */}
          {!loading && shown > 0 && total > 0 && total < 5 && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
              <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[12.5px] text-amber-900 leading-relaxed">
                Få kandidater matchar just nu. Poolen växer varje vecka, {' '}
                <button
                  type="button"
                  onClick={async () => {
                    const name = window.prompt(
                      'Spara den här sökningen och få mejl när fler kandidater matchar. Ge sökningen ett namn:'
                    );
                    if (name && name.trim()) await saveSearch(name.trim());
                  }}
                  className="font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900"
                >
                  spara sökningen
                </button>{' '}
                så mejlar vi dig så fort det dyker upp nya som passar.
              </p>
            </div>
          )}

          {loading && candidates === null ? (
            <div className="rounded-2xl bg-orange-50/60 h-72 animate-pulse" aria-hidden="true" />
          ) : shown === 0 ? (
            <EmptyState
              hasFilters={activeCount > 0}
              actions={nextBestActions}
            />
          ) : (
            <>
              {/* Tabell på desktop */}
              <div className="hidden lg:block">
                <CandidateTable
                  candidates={candidates ?? []}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onRowClick={setPeekCandidate}
                  showMatchReasons={hasQuery}
                  fromPath="/rekryterare"
                />
              </div>

              {/* Kortgrid på mobil */}
              <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                {(candidates ?? []).map((candidate) => (
                  <CandidateHitCard
                    key={candidate.userId}
                    candidate={candidate}
                    sending={sendingId === candidate.userId}
                    onInterest={handleInterest}
                    onOpen={() => setPeekCandidate(candidate)}
                    selected={selectedIds.includes(candidate.userId)}
                    onToggleSelect={() => toggleSelect(candidate.userId)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchPool(filters, sort, nextPage, true);
                    }}
                    className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-[13.5px] font-bold text-orange-700 border border-orange-300 bg-white hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'Hämtar…' : 'Visa 50 fler'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Flytande filterknapp, mobil */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 min-h-[46px] px-4 rounded-full text-white text-[13.5px] font-bold shadow-lg transition-opacity hover:opacity-90"
        style={{ background: CTA_GRADIENT }}
      >
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        Filter{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {/* Bottom-sheet med filterpanelen, mobil */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
            <h2 className="text-[15px] font-bold text-slate-900">
              Filter{activeCount > 0 ? ` (${activeCount})` : ''}
            </h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Stäng filtren"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterPanel
              filters={filters}
              onChange={patchFilters}
              onClearAll={clearAll}
              onSaveSearch={saveSearch}
              savedSearches={savedSearches}
              onApplySaved={applySaved}
            />
          </div>
          <div className="px-4 py-3 border-t border-orange-100">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="w-full inline-flex items-center justify-center min-h-[46px] rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: CTA_GRADIENT }}
            >
              Visa {total === 1 ? '1 kandidat' : `${total} kandidater`}
            </button>
          </div>
        </div>
      )}

      {/* Peek-panelen */}
      <PeekPanel
        candidate={peekCandidate}
        onClose={() => setPeekCandidate(null)}
        onInterest={handleInterest}
        sendingInterest={sendingId !== null}
        fromPath="/rekryterare"
      />
    </div>
  );
}

interface NextBestAction {
  label: string;
  onClick: () => void;
}

/** Konkreta näst-bästa-åtgärder vid 0 träffar, som klickbara chips. */
function buildNextBestActions(
  filters: PoolFilterState,
  patch: (p: Partial<PoolFilterState>) => void,
  clearAll: () => void
): NextBestAction[] {
  const actions: NextBestAction[] = [];

  if (filters.minPercentile === '90') {
    actions.push({
      label: 'Bredda till Topp 25 % i stället för Topp 10 %',
      onClick: () => patch({ minPercentile: '75' }),
    });
  } else if (filters.minPercentile === '75') {
    actions.push({
      label: 'Bredda till Topp 50 % i stället för Topp 25 %',
      onClick: () => patch({ minPercentile: '50' }),
    });
  } else if (filters.minPercentile === '50') {
    actions.push({
      label: 'Ta bort testresultatkravet',
      onClick: () => patch({ minPercentile: '' }),
    });
  }

  const tokens = tokenizePreview(filters.q);
  if (tokens.length > 1) {
    actions.push({
      label: `Sök bara på "${tokens[0]}"`,
      onClick: () => patch({ q: tokens[0] }),
    });
  }

  if (filters.regions.length > 0) {
    actions.push({
      label: 'Sök i hela Sverige',
      onClick: () => patch({ regions: [] }),
    });
  }

  if (filters.seniority.length > 0) {
    actions.push({
      label: 'Ta bort senioritetskravet',
      onClick: () => patch({ seniority: [] }),
    });
  }

  actions.push({ label: 'Rensa alla filter', onClick: clearAll });
  return actions.slice(0, 3);
}

function EmptyState({
  hasFilters,
  actions,
}: {
  hasFilters: boolean;
  actions: NextBestAction[];
}) {
  return (
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
        {hasFilters ? 'Inga kandidater matchar' : 'Poolen fylls på'}
      </h2>
      <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto">
        {hasFilters
          ? 'Prova en av åtgärderna nedan så breddar vi sökningen ett steg i taget.'
          : 'Nya kandidater aktiverar sina profiler löpande. Titta in igen inom kort, vi jobbar på att fylla poolen.'}
      </p>
      {hasFilters && (
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="min-h-[38px] px-4 rounded-full border border-orange-300 bg-orange-50 text-[12.5px] font-bold text-orange-800 hover:bg-orange-100 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
