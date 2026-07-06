'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Columns3 } from 'lucide-react';
import { InterestStatusBadge } from '../components/CandidateTable';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  FAMILY_ORDER,
  FAMILY_LABELS,
  LEVEL_LABELS,
  CTA_GRADIENT,
  EDUCATION_LEVEL_OPTIONS,
  labelFor,
  type CandidateDetail,
  type FamilyKey,
  type InterestStatus,
} from '../components/types';

interface CompareEntry {
  candidate: CandidateDetail;
  interestStatus: InterestStatus;
}

/**
 * Jämför 2-4 kandidater sida vid sida: ?ids=a,b,c. Bästa värdet per rad får
 * subtil orange bakgrund, ingen vinnarkrona. Personlighetsraderna (arketyp,
 * styrkor) jämförs aldrig och markeras aldrig.
 */
export default function JamforPage() {
  return (
    <Suspense
      fallback={<div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" aria-hidden="true" />}
    >
      <CompareView />
    </Suspense>
  );
}

function CompareView() {
  const searchParams = useSearchParams();
  const idsParam = searchParams?.get('ids') ?? '';
  const ids = useMemo(
    () =>
      [...new Set(idsParam.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 4),
    [idsParam]
  );

  const [entries, setEntries] = useState<CompareEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ids.length < 2) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/recruiter/candidate/${encodeURIComponent(id)}`);
            if (!res.ok) return null;
            const data = (await res.json()) as {
              candidate: CandidateDetail;
              interestStatus: InterestStatus;
            };
            return { candidate: data.candidate, interestStatus: data.interestStatus };
          })
        );
        if (cancelled) return;
        setEntries(results.filter((r): r is CompareEntry => r !== null));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (ids.length < 2) {
    return (
      <EmptyCompare text="Markera 2 till 4 kandidater i sökningen eller i ett projekt, så ställer vi dem sida vid sida här." />
    );
  }

  if (error) {
    return <EmptyCompare text="Vi kunde inte hämta kandidaterna. Ladda om sidan och försök igen." />;
  }

  if (entries === null) {
    return <div className="rounded-3xl bg-orange-50/60 h-72 animate-pulse" aria-hidden="true" />;
  }

  if (entries.length < 2) {
    return (
      <EmptyCompare text="Minst två av profilerna är inte längre synliga i poolen. Gå tillbaka och markera om." />
    );
  }

  return <CompareTable entries={entries} />;
}

function EmptyCompare({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
      <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
        <Columns3 className="w-6 h-6 text-orange-600" aria-hidden="true" />
      </div>
      <h1 className="text-base font-bold text-slate-900 mb-1.5">Jämför kandidater</h1>
      <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto mb-5">{text}</p>
      <Link
        href="/rekryterare"
        className="inline-flex items-center gap-1.5 justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: CTA_GRADIENT }}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Till sökningen
      </Link>
    </div>
  );
}

function CompareTable({ entries }: { entries: CompareEntry[] }) {
  // Bästa värdet per jämförbar rad: index-set per radnyckel.
  const bestYears = bestIndexes(entries, (e) => e.candidate.yearsOfExperience ?? -1);
  const bestEducation = bestIndexes(entries, (e) =>
    e.candidate.educationLevelBucket
      ? EDUCATION_LEVEL_OPTIONS.indexOf(e.candidate.educationLevelBucket)
      : -1
  );
  const bestByFamily: Record<FamilyKey, Set<number>> = {
    matrislogik: bestIndexes(entries, (e) => familyPercentile(e.candidate, 'matrislogik')),
    verbal: bestIndexes(entries, (e) => familyPercentile(e.candidate, 'verbal')),
    numerisk: bestIndexes(entries, (e) => familyPercentile(e.candidate, 'numerisk')),
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Jämför kandidater</h1>
        <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">
          Bästa värdet per rad är tonat. Arbetsstil och styrkor beskriver
          arbetssätt, inte nivå, så de jämförs aldrig.
        </p>
      </motion.div>

      <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white">
        <table className="border-collapse w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-white w-[140px] min-w-[140px]" aria-hidden="true" />
              {entries.map(({ candidate }) => {
                const roleLabel = candidate.role ?? 'Kandidat';
                return (
                  <th
                    key={candidate.userId}
                    className="sticky top-0 z-10 bg-white text-left align-bottom px-4 pt-4 pb-3 border-b border-orange-100 min-w-[180px]"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold mb-2"
                      style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
                      aria-hidden="true"
                    >
                      {roleLabel.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      {roleLabel}
                    </p>
                    <p className="text-[11.5px] font-medium text-slate-500">
                      {candidate.regions[0] ?? 'Region okänd'}
                    </p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="Senioritet" entries={entries} best={bestYears}>
              {(e) =>
                e.candidate.yearsOfExperience !== null ? (
                  <>
                    <span className="font-bold text-slate-900">
                      {e.candidate.yearsOfExperience} år
                    </span>
                    {e.candidate.latestRole && (
                      <span className="block text-[11.5px] text-slate-500">
                        Senast: {e.candidate.latestRole.title}
                      </span>
                    )}
                  </>
                ) : (
                  <Dash />
                )
              }
            </CompareRow>

            <CompareRow label="Utbildningsnivå" entries={entries} best={bestEducation}>
              {(e) =>
                e.candidate.educationLevelBucket ?? e.candidate.educationLevel ?? <Dash />
              }
            </CompareRow>

            {FAMILY_ORDER.map((family) => (
              <CompareRow
                key={family}
                label={FAMILY_LABELS[family]}
                entries={entries}
                best={bestByFamily[family]}
              >
                {(e) => {
                  const badge = e.candidate.testBadges.find((b) => b.family === family);
                  if (!badge) return <Dash />;
                  return (
                    <>
                      <span className="font-bold text-orange-800">
                        {badge.percentile !== null
                          ? `Topp ${Math.max(1, 100 - badge.percentile)} %`
                          : `${badge.bestScore ?? '?'}% rätt`}
                      </span>
                      {badge.level && (
                        <span className="block text-[11.5px] text-slate-500">
                          {LEVEL_LABELS[badge.level]}
                        </span>
                      )}
                    </>
                  );
                }}
              </CompareRow>
            ))}

            <CompareRow label="Arketyp" entries={entries}>
              {(e) =>
                e.candidate.workStyleArchetype ? (
                  <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800">
                    {e.candidate.workStyleArchetype}
                  </span>
                ) : (
                  <Dash />
                )
              }
            </CompareRow>

            <CompareRow label="Styrkor" entries={entries}>
              {(e) =>
                e.candidate.personalityStrengths.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {e.candidate.personalityStrengths.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                ) : (
                  <Dash />
                )
              }
            </CompareRow>

            <CompareRow label="Toppkompetenser" entries={entries}>
              {(e) =>
                e.candidate.skills.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {e.candidate.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                ) : (
                  <Dash />
                )
              }
            </CompareRow>

            <CompareRow label="Tillträde" entries={entries}>
              {(e) => labelFor(AVAILABILITY_OPTIONS, e.candidate.availability) ?? <Dash />}
            </CompareRow>

            <CompareRow label="Arbetsplats och omfattning" entries={entries}>
              {(e) => {
                const parts = [
                  e.candidate.workplace
                    .map((w) => labelFor(WORKPLACE_OPTIONS, w))
                    .filter(Boolean)
                    .join('/'),
                  e.candidate.extent
                    .map((x) => labelFor(EXTENT_OPTIONS, x))
                    .filter(Boolean)
                    .join('/'),
                ].filter(Boolean);
                return parts.length > 0 ? parts.join(' · ') : <Dash />;
              }}
            </CompareRow>

            <CompareRow label="Körkort" entries={entries}>
              {(e) => (e.candidate.driversLicense ? 'B-körkort' : <Dash />)}
            </CompareRow>

            <CompareRow label="Intressestatus" entries={entries}>
              {(e) => <InterestStatusBadge status={e.interestStatus} />}
            </CompareRow>

            <CompareRow label="Åtgärd" entries={entries}>
              {(e) => (
                <Link
                  href={`/rekryterare/kandidat/${e.candidate.userId}?from=${encodeURIComponent('/rekryterare/jamfor')}`}
                  className="inline-flex items-center min-h-[34px] px-3 rounded-lg text-[12px] font-bold text-orange-700 border border-orange-300 bg-white hover:bg-orange-50 transition-colors whitespace-nowrap"
                >
                  Öppna profil
                </Link>
              )}
            </CompareRow>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  entries,
  best,
  children,
}: {
  label: string;
  entries: CompareEntry[];
  best?: Set<number>;
  children: (entry: CompareEntry) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-orange-50 last:border-b-0">
      <th
        scope="row"
        className="sticky left-0 z-10 bg-white text-left align-top px-4 py-3 w-[140px] min-w-[140px] text-[11px] font-bold uppercase tracking-wide text-slate-400"
      >
        {label}
      </th>
      {entries.map((entry, i) => (
        <td
          key={entry.candidate.userId}
          className={`align-top px-4 py-3 text-[13px] text-slate-700 leading-relaxed ${
            best?.has(i) ? 'bg-orange-50/60' : ''
          }`}
        >
          {children(entry)}
        </td>
      ))}
    </tr>
  );
}

function Dash() {
  return <span className="text-slate-300">–</span>;
}

/** Index för högsta värdet (alla vid delad topp). Tomt när ingen har data. */
function bestIndexes(entries: CompareEntry[], value: (e: CompareEntry) => number): Set<number> {
  const values = entries.map(value);
  const max = Math.max(...values);
  if (max < 0) return new Set();
  return new Set(values.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0));
}

function familyPercentile(candidate: CandidateDetail, family: FamilyKey): number {
  const badge = candidate.testBadges.find((b) => b.family === family);
  return badge?.percentile ?? -1;
}
