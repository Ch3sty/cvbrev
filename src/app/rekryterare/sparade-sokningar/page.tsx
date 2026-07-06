'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookmarkCheck, Trash2 } from 'lucide-react';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  SENIORITY_OPTIONS,
  CTA_GRADIENT,
  formatLongDate,
  labelFor,
  savedToFilterState,
  type SavedSearch,
} from '../components/types';

/**
 * Sparade sökningar: lista med bevakningstoggle och radering. Klick på en
 * sökning applicerar filtren i Sök (?saved=<id>). Bevakningen mailar max en
 * gång per dag när nya kandidater matchar.
 */
export default function SparadeSokningarPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/saved-searches');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { searches: SavedSearch[] };
        if (!cancelled) setSearches(data.searches);
      } catch {
        if (!cancelled) {
          setSearches([]);
          setError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleNotify = async (search: SavedSearch) => {
    const next = !search.notify;
    setSearches((prev) =>
      (prev ?? []).map((s) => (s.id === search.id ? { ...s, notify: next } : s))
    );
    try {
      const res = await fetch('/api/recruiter/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: search.id, notify: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setSearches((prev) =>
        (prev ?? []).map((s) => (s.id === search.id ? { ...s, notify: search.notify } : s))
      );
      setNotice('Kunde inte ändra bevakningen. Försök igen.');
    }
  };

  const remove = async (search: SavedSearch) => {
    const prev = searches;
    setSearches((list) => (list ?? []).filter((s) => s.id !== search.id));
    try {
      const res = await fetch(
        `/api/recruiter/saved-searches?id=${encodeURIComponent(search.id)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setSearches(prev);
      setNotice('Kunde inte radera sökningen. Försök igen.');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Sparade sökningar</h1>
        <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed max-w-xl">
          Spara en sökning från filterpanelen så finns den här. Slå på
          bevakning så mailar vi när nya kandidater matchar, max en gång per dag.
        </p>
      </motion.div>

      {notice && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          Vi kunde inte hämta dina sparade sökningar. Ladda om sidan och försök igen.
        </p>
      )}

      {searches === null ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl bg-orange-50/60 h-20 animate-pulse" />
          ))}
        </div>
      ) : searches.length === 0 && !error ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <BookmarkCheck className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Inga sparade sökningar</h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto mb-5">
            Ställ in filtren i Sök och klicka på Spara sökning i panelens botten.
          </p>
          <Link
            href="/rekryterare"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: CTA_GRADIENT }}
          >
            Till sökningen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25), ease: 'easeOut' }}
              className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5"
              style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.14)' }}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push(`/rekryterare?saved=${search.id}`)}
                  className="flex-1 min-w-[200px] text-left group"
                >
                  <span className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                    <BookmarkCheck
                      className="w-4 h-4 text-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {search.name}
                  </span>
                  <span className="block mt-1 text-[12px] text-slate-500 leading-relaxed">
                    {describeFilters(search.filters)}
                  </span>
                  <span className="block mt-0.5 text-[11.5px] text-slate-400">
                    Sparad {formatLongDate(search.createdAt) ?? ''}
                    {search.lastNotifiedAt
                      ? ` · Senast mailad ${formatLongDate(search.lastNotifiedAt) ?? ''}`
                      : ''}
                  </span>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={search.notify}
                      onChange={() => toggleNotify(search)}
                      className="sr-only peer"
                    />
                    <span
                      className="relative w-9 h-5 rounded-full bg-slate-200 peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
                      aria-hidden="true"
                    />
                    <span className="text-[12px] font-bold text-slate-600 max-w-[160px]">
                      Maila mig när nya kandidater matchar
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(search)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Radera sökningen ${search.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Kort läsbar sammanfattning av en sparad söknings filter. */
function describeFilters(filters: Record<string, unknown>): string {
  const f = savedToFilterState(filters);
  const parts: string[] = [];
  if (f.q) parts.push(`"${f.q}"`);
  if (f.seniority.length) {
    parts.push(
      f.seniority
        .map((s) => labelFor(SENIORITY_OPTIONS, s))
        .filter(Boolean)
        .join(', ')
    );
  }
  if (f.regions.length) parts.push(f.regions.join(', '));
  if (f.availability) {
    const label = labelFor(AVAILABILITY_OPTIONS, f.availability);
    if (label) parts.push(`Tillträde: ${label}`);
  }
  if (f.workplace.length) {
    parts.push(
      f.workplace
        .map((w) => labelFor(WORKPLACE_OPTIONS, w))
        .filter(Boolean)
        .join('/')
    );
  }
  if (f.minPercentile === '90') parts.push('Topp 10 %');
  else if (f.minPercentile === '75') parts.push('Topp 25 %');
  else if (f.minPercentile === '50') parts.push('Topp 50 %');
  if (f.strengths.length) parts.push(f.strengths.join(', '));
  if (f.archetypes.length) parts.push(f.archetypes.join(', '));
  if (f.educationLevels.length) parts.push(f.educationLevels.join(', '));
  if (f.budget) parts.push(`Inom ${f.budget} kr/mån`);
  if (f.driversLicense) parts.push('B-körkort');
  return parts.length > 0 ? parts.join(' · ') : 'Hela poolen';
}
