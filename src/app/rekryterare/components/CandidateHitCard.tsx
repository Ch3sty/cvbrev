'use client';

import Link from 'next/link';
import { Check, Clock, X } from 'lucide-react';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  labelFor,
  type PoolCandidate,
} from './types';

interface CandidateHitCardProps {
  candidate: PoolCandidate;
  sending: boolean;
  onInterest: (userId: string) => void;
}

/**
 * Träffkortet i poolen: samma visuella språk som förhandsvisningen på
 * kandidatens Bli upptäckt-sida (gradient-avatar med rollinitial, orange
 * testbadges, indigo styrkor, kompetenschips, villkorsfot). Hela kortet
 * länkar till detaljprofilen; intresseknappen skickar direkt.
 */
export default function CandidateHitCard({
  candidate,
  sending,
  onInterest,
}: CandidateHitCardProps) {
  const roleLabel = candidate.role ?? 'Kandidat';
  const avatarInitial = roleLabel.charAt(0).toUpperCase();
  const region = candidate.regions[0] ?? null;
  const skillChips = candidate.skills.slice(0, 5);

  const footParts = [
    labelFor(AVAILABILITY_OPTIONS, candidate.availability),
    candidate.workplace.length > 0
      ? candidate.workplace.map((w) => labelFor(WORKPLACE_OPTIONS, w)).filter(Boolean).join('/')
      : null,
    candidate.extent.length > 0
      ? candidate.extent.map((e) => labelFor(EXTENT_OPTIONS, e)).filter(Boolean).join('/')
      : null,
    candidate.driversLicense ? 'B-körkort' : null,
  ].filter(Boolean) as string[];

  const status = candidate.interestStatus;

  return (
    <Link
      href={`/rekryterare/kandidat/${candidate.userId}`}
      className="block rounded-2xl border border-orange-100 bg-white p-4 sm:p-5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
      style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.18)' }}
    >
      {/* Huvud */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          aria-hidden="true"
        >
          {avatarInitial}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">
            {roleLabel}
          </div>
          <div className="text-[12.5px] text-slate-500 truncate">
            {[region, candidate.visibility === 'open' ? 'Öppen profil' : 'Anonym']
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {candidate.testBadges.map((badge) => (
          <span
            key={badge.family}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
          >
            <span className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45" aria-hidden="true" />
            {badge.label}
          </span>
        ))}
        {candidate.personalityStrengths.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
            {chip}
          </span>
        ))}
        {skillChips.map((skill) => (
          <span
            key={skill}
            className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
          >
            {skill}
          </span>
        ))}
        {candidate.testBadges.length === 0 &&
          candidate.personalityStrengths.length === 0 &&
          skillChips.length === 0 && (
            <span className="text-[12px] text-slate-400">
              Profilen har inga verifierade resultat ännu.
            </span>
          )}
      </div>

      {/* Fot: villkor + intresseknapp */}
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3 border-t border-orange-50">
        <span className="text-[12px] text-slate-500 leading-relaxed min-w-0 flex-1 basis-40">
          {footParts.length > 0 ? footParts.join(' · ') : 'Inga villkor angivna'}
        </span>

        {status === 'pending' ? (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold bg-orange-50 border border-orange-200 text-orange-700">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Intresse skickat
          </span>
        ) : status === 'accepted' ? (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Kontakt upplåst
          </span>
        ) : status === 'declined' ? (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Avböjt
          </span>
        ) : (
          <button
            type="button"
            disabled={sending}
            onClick={(e) => {
              // Knappen ligger i länken: stoppa navigeringen och skicka direkt.
              e.preventDefault();
              e.stopPropagation();
              onInterest(candidate.userId);
            }}
            className="flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          >
            {sending ? 'Skickar…' : 'Visa intresse'}
          </button>
        )}
      </div>
    </Link>
  );
}
