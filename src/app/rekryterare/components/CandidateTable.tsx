'use client';

import Link from 'next/link';
import { Info, Trash2 } from 'lucide-react';
import PercentileDots from './PercentileDots';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  labelFor,
  type PoolCandidate,
} from './types';

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
      <table className="w-full min-w-[980px] text-left border-collapse">
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
            <Th>Kandidat</Th>
            <Th className="w-[120px]">Senioritet</Th>
            <Th className="w-[160px]">Testresultat</Th>
            <Th className="w-[130px]">Arbetsstil</Th>
            <Th className="w-[200px]">Kompetenser</Th>
            <Th className="w-[140px]">Villkor</Th>
            <Th className="w-[130px]">Status</Th>
            <Th className="w-[110px] pr-4">
              <span className="sr-only">Åtgärd</span>
            </Th>
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

  const terms = [
    labelFor(AVAILABILITY_OPTIONS, candidate.availability),
    candidate.workplace
      .map((w) => labelFor(WORKPLACE_OPTIONS, w))
      .filter(Boolean)
      .join('/') || null,
  ]
    .filter(Boolean)
    .join(' · ');

  const profileHref = `/rekryterare/kandidat/${candidate.userId}?from=${encodeURIComponent(fromPath)}`;

  return (
    <tr
      onClick={onClick}
      className={`border-b border-orange-50 last:border-b-0 cursor-pointer transition-colors ${
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
            <div className="text-[12px] text-slate-500 truncate">
              {[region, candidate.visibility === 'open' ? 'Öppen' : 'Anonym']
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>
      </td>

      {/* Senioritet */}
      <td className="py-3 px-2 align-middle">
        {candidate.yearsOfExperience !== null ? (
          <span className="text-[13px] font-bold text-slate-900">
            {candidate.yearsOfExperience} år
          </span>
        ) : (
          <span className="text-[12px] text-slate-400">Okänd</span>
        )}
        {candidate.latestRole && (
          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
            Senast: {candidate.latestRole.title}
          </p>
        )}
      </td>

      {/* Testresultat */}
      <td className="py-3 px-2 align-middle">
        <PercentileDots badges={candidate.testBadges} />
      </td>

      {/* Arbetsstil */}
      <td className="py-3 px-2 align-middle">
        {candidate.workStyleArchetype ? (
          <span className="inline-flex max-w-[130px] text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800">
            <span className="truncate">{candidate.workStyleArchetype}</span>
          </span>
        ) : (
          <span className="text-[12px] text-slate-300">–</span>
        )}
      </td>

      {/* Kompetenser */}
      <td className="py-3 px-2 align-middle">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {skillChips.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 max-w-[110px] truncate"
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

      {/* Villkor */}
      <td className="py-3 px-2 align-middle">
        <span className="text-[12px] text-slate-600 whitespace-nowrap">{terms || '–'}</span>
      </td>

      {/* Status */}
      <td className="py-3 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
        {projectMode ? (
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
        ) : (
          <InterestStatusBadge status={candidate.interestStatus} />
        )}
      </td>

      {/* Åtgärd */}
      <td className="py-3 px-2 pr-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center gap-1">
          <Link
            href={profileHref}
            className="inline-flex items-center min-h-[32px] px-2.5 rounded-lg text-[12px] font-bold text-slate-500 hover:text-orange-700 hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Öppna profil
          </Link>
          {projectMode && (
            <button
              type="button"
              onClick={() => projectMode.onRemove(candidate.userId)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Ta bort från projektet"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function InterestStatusBadge({ status }: { status: string | null }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 whitespace-nowrap">
        Skickat
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
