'use client';

import Link from 'next/link';
import { ChevronRight, Info, Trash2 } from 'lucide-react';
import PercentileDots from './PercentileDots';
import {
  PROJECT_STATUS_OPTIONS,
  relativeDays,
  type PoolCandidate,
} from './types';

/**
 * Stabil färg per arbetsstils-arketyp (indigo-familjen), så prickarna i tabellen
 * skiljer arketyper åt utan att lämna personlighetsfärgen. Deterministisk hash
 * → en av några indigo-toner.
 */
const ARCHETYPE_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#7C3AED', '#4338CA'];
function archetypeColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return ARCHETYPE_COLORS[Math.abs(hash) % ARCHETYPE_COLORS.length];
}

export interface ProjectTableMode {
  statusByCandidate: Record<string, string>;
  onStatusChange: (candidateUserId: string, status: string) => void;
  onRemove: (candidateUserId: string) => void;
}

interface CandidateTableProps {
  candidates: PoolCandidate[];
  selectedIds: string[];
  onToggleSelect: (userId: string) => void;
  onToggleSelectAll: () => void;
  onRowClick: (candidate: PoolCandidate) => void;
  /** Info-ikon med matchReasons visas bara vid aktiv sökning. */
  showMatchReasons?: boolean;
  /** Skickas som ?from= till detaljprofilen för kontextuell tillbaka-länk. */
  fromPath: string;
  /** Projektvyn: status-dropdown + ta bort i stället för intressestatus. */
  projectMode?: ProjectTableMode;
}

/**
 * Resultattabellen på desktop: hela raden klickbar (öppnar peek-panelen),
 * checkbox för markering/jämförelse, PercentileDots för testresultaten och
 * indigo-pill för arbetsstilen. Återanvänds i projektvyn utan filterpanel.
 */
export default function CandidateTable({
  candidates,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  showMatchReasons = false,
  fromPath,
  projectMode,
}: CandidateTableProps) {
  const allSelected =
    candidates.length > 0 && candidates.every((c) => selectedIds.includes(c.userId));

  return (
    <div className="overflow-x-auto rounded-2xl border border-orange-100 bg-white">
      {/* Fem innehållskolumner (+ markering). Villkoren bor i peek-panelen och
          filtret, senioriteten i Kandidat-cellen, status + åtgärd hopfällda.
          Ingen min-width: Kandidat växer, övriga har max-bredd så breda skärmar
          ger luft i stället för utsträckta celler. */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-orange-100">
            <Th className="w-8 pl-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Markera alla på sidan"
                className="w-3.5 h-3.5 rounded accent-orange-600 align-middle"
              />
            </Th>
            <Th className="min-w-[240px]">Kandidat</Th>
            <Th className="w-[168px] min-w-[152px]">Testresultat</Th>
            <Th className="w-[150px] max-w-[170px]">Arbetsstil</Th>
            <Th className="w-[220px] max-w-[260px]">Kompetenser</Th>
            <Th className="w-[132px] pr-4">Status</Th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <Row
              key={candidate.userId}
              candidate={candidate}
              selected={selectedIds.includes(candidate.userId)}
              onToggleSelect={() => onToggleSelect(candidate.userId)}
              onClick={() => onRowClick(candidate)}
              showMatchReasons={showMatchReasons}
              fromPath={fromPath}
              projectMode={projectMode}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`py-2.5 px-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Row({
  candidate,
  selected,
  onToggleSelect,
  onClick,
  showMatchReasons,
  fromPath,
  projectMode,
}: {
  candidate: PoolCandidate;
  selected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  showMatchReasons: boolean;
  fromPath: string;
  projectMode?: ProjectTableMode;
}) {
  const roleLabel = candidate.role ?? 'Kandidat';
  const region = candidate.regions[0] ?? null;
  const skillChips = candidate.skills.slice(0, 3);
  const skillOverflow = candidate.skills.length - skillChips.length;

  const profileHref = `/rekryterare/kandidat/${candidate.userId}?from=${encodeURIComponent(fromPath)}`;

  return (
    <tr
      onClick={onClick}
      onKeyDown={(e) => {
        // Öppna peek-panelen med tangentbord. Ignorera när fokus ligger på en
        // kontroll i raden (checkbox, länk, select) så deras egen Enter/Space gäller.
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Öppna ${roleLabel}`}
      className={`border-b border-orange-50 last:border-b-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 ${
        selected ? 'bg-orange-50/50' : 'hover:bg-orange-50/30'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-2 pl-4 align-middle" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Markera ${roleLabel}`}
          className="w-3.5 h-3.5 rounded accent-orange-600 align-middle"
        />
      </td>

      {/* Kandidat */}
      <td className="py-3 px-2 align-middle min-w-[240px]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
            aria-hidden="true"
          >
            {roleLabel.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-slate-900 leading-tight truncate">
                {roleLabel}
              </span>
              {showMatchReasons && candidate.matchReasons.length > 0 && (
                <span
                  className="relative group/reason inline-flex flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
                  <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/reason:block w-60 rounded-xl bg-slate-900 text-white text-[11.5px] font-medium leading-relaxed px-3 py-2 z-30">
                    {candidate.matchReasons.map((reason) => (
                      <span key={reason} className="block">
                        {reason}
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </div>
            {/* Senioritet bakad in här: år · region · anonymitet, en rad. */}
            <div className="text-[12px] text-slate-500 truncate">
              {[
                candidate.yearsOfExperience !== null
                  ? `${candidate.yearsOfExperience} år`
                  : null,
                region,
                candidate.visibility === 'open' ? 'Öppen' : 'Anonym',
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {candidate.latestRole && (
              <div className="text-[11px] text-slate-400 truncate">
                Senast: {candidate.latestRole.title}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Testresultat */}
      <td className="py-3 px-2 align-middle">
        <PercentileDots badges={candidate.testBadges} />
      </td>

      {/* Arbetsstil: färgprick + arketyp, tar mindre plats än en full pill */}
      <td className="py-3 px-2 align-middle">
        {candidate.workStyleArchetype ? (
          <span className="inline-flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: archetypeColor(candidate.workStyleArchetype) }}
              aria-hidden="true"
            />
            <span className="text-[12px] font-bold text-indigo-800 truncate">
              {candidate.workStyleArchetype}
            </span>
          </span>
        ) : (
          <span className="text-[12px] text-slate-300">–</span>
        )}
      </td>

      {/* Kompetenser */}
      <td className="py-3 px-2 align-middle">
        <div className="flex flex-wrap gap-1">
          {skillChips.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 max-w-[120px] truncate"
            >
              {skill}
            </span>
          ))}
          {skillOverflow > 0 && (
            <span className="text-[11px] font-semibold text-slate-400 px-1 py-0.5">
              +{skillOverflow}
            </span>
          )}
        </div>
      </td>

      {/* Status + åtgärd hopfällda: badge (eller projektval) + chevron.
          Hela raden öppnar profilen, chevronen är bara en visuell ledtråd. */}
      <td className="py-3 px-2 pr-4 align-middle" onClick={(e) => e.stopPropagation()}>
        {projectMode ? (
          <div className="flex items-center gap-1">
            <select
              value={projectMode.statusByCandidate[candidate.userId] ?? 'ny'}
              onChange={(e) => projectMode.onStatusChange(candidate.userId, e.target.value)}
              className="min-h-[32px] pl-2 pr-6 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-700 cursor-pointer"
              aria-label="Kandidatstatus i projektet"
            >
              {PROJECT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => projectMode.onRemove(candidate.userId)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Ta bort från projektet"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5">
            <InterestStatusBadge
              status={candidate.interestStatus}
              sentAt={candidate.interestSentAt}
            />
            <Link
              href={profileHref}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Öppna ${roleLabel}`}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-orange-700 hover:bg-orange-50 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        )}
      </td>
    </tr>
  );
}

export function InterestStatusBadge({
  status,
  sentAt,
}: {
  status: string | null;
  sentAt?: string | null;
}) {
  if (status === 'pending') {
    const age = relativeDays(sentAt);
    // Väntar länge (parsad ålder i dagar > 3): amber i stället för orange.
    const days = sentAt ? Math.floor((Date.now() - Date.parse(sentAt)) / 86_400_000) : 0;
    const stale = Number.isFinite(days) && days > 3;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11.5px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap ${
          stale
            ? 'bg-amber-50 border border-amber-300 text-amber-800'
            : 'bg-orange-50 border border-orange-200 text-orange-700'
        }`}
      >
        Skickat
        {age && <span className="font-semibold opacity-70">· {age}</span>}
      </span>
    );
  }
  if (status === 'accepted') {
    return (
      <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 whitespace-nowrap">
        Upplåst
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 whitespace-nowrap">
        Avböjt
      </span>
    );
  }
  return <span className="text-[12px] text-slate-300">–</span>;
}
