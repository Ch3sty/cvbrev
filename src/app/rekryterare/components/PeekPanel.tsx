'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import AddToProjectMenu from './AddToProjectMenu';
import { InterestStatusBadge } from './CandidateTable';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  CTA_GRADIENT,
  labelFor,
  seniorityFacts,
  type CandidateDetail,
  type PoolCandidate,
} from './types';

interface PeekPanelProps {
  candidate: PoolCandidate | null;
  onClose: () => void;
  onInterest: (candidateUserId: string) => void;
  sendingInterest: boolean;
  /** Skickas som ?from= till fullprofilen. */
  fromPath: string;
}

/**
 * Peek-panelen: slide-in från höger (420px, fullskärm på mobil) vid radklick.
 * Kortdatan visas direkt; arbetsstilens beskrivning hämtas från detalj-API:t
 * i bakgrunden. Sticky footer med de tre huvudåtgärderna.
 */
export default function PeekPanel({
  candidate,
  onClose,
  onInterest,
  sendingInterest,
  fromPath,
}: PeekPanelProps) {
  const [detail, setDetail] = useState<CandidateDetail | null>(null);

  useEffect(() => {
    setDetail(null);
    if (!candidate) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/recruiter/candidate/${encodeURIComponent(candidate.userId)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { candidate: CandidateDetail };
        if (!cancelled) setDetail(data.candidate);
      } catch {
        // Panelen fungerar med kortdatan; arbetsstilstexten är berikning.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidate]);

  // Esc stänger.
  useEffect(() => {
    if (!candidate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [candidate, onClose]);

  return (
    <AnimatePresence>
      {candidate && (
        <>
          {/* Bakgrund */}
          <motion.div
            key="peek-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30"
            aria-hidden="true"
          />

          <motion.aside
            key="peek-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Kandidatöversikt"
          >
            <PeekContent
              candidate={candidate}
              detail={detail}
              onClose={onClose}
              onInterest={onInterest}
              sendingInterest={sendingInterest}
              fromPath={fromPath}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PeekContent({
  candidate,
  detail,
  onClose,
  onInterest,
  sendingInterest,
  fromPath,
}: {
  candidate: PoolCandidate;
  detail: CandidateDetail | null;
  onClose: () => void;
  onInterest: (candidateUserId: string) => void;
  sendingInterest: boolean;
  fromPath: string;
}) {
  const roleLabel = candidate.role ?? 'Kandidat';
  const region = candidate.regions[0] ?? null;
  const seniority = seniorityFacts(candidate);
  const workStyle = detail?.workStyle ?? null;

  const terms: Array<{ label: string; value: string }> = [
    { label: 'Tillträde', value: labelFor(AVAILABILITY_OPTIONS, candidate.availability) ?? '' },
    {
      label: 'Arbetsplats',
      value: candidate.workplace
        .map((w) => labelFor(WORKPLACE_OPTIONS, w))
        .filter(Boolean)
        .join(', '),
    },
    {
      label: 'Omfattning',
      value: candidate.extent
        .map((e) => labelFor(EXTENT_OPTIONS, e))
        .filter(Boolean)
        .join(', '),
    },
    { label: 'Regioner', value: candidate.regions.join(', ') },
    { label: 'Körkort', value: candidate.driversLicense ? 'B-körkort' : '' },
  ].filter((t) => t.value);

  const profileHref = `/rekryterare/kandidat/${candidate.userId}?from=${encodeURIComponent(fromPath)}`;

  return (
    <>
      {/* 1. Header, sticky */}
      <header className="flex items-center gap-3 px-4 py-3.5 border-b border-orange-100 flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          aria-hidden="true"
        >
          {roleLabel.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate">
            {roleLabel}
          </h2>
          <p className="text-[12px] text-slate-500 truncate">
            {[region, candidate.visibility === 'open' ? 'Öppen profil' : 'Anonym']
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {candidate.interestStatus && <InterestStatusBadge status={candidate.interestStatus} />}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          aria-label="Stäng panelen"
        >
          <X className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
      </header>

      {/* Innehåll */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 2. Senioritet + pitch */}
        {seniority.length > 0 && (
          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">{seniority[0]}</span>
            {seniority.slice(1).map((fact) => (
              <span key={fact}> · {fact}</span>
            ))}
          </p>
        )}
        {candidate.pitch && (
          <blockquote className="rounded-2xl bg-orange-50/60 border border-orange-100 px-3.5 py-3 text-[13px] italic text-slate-700 leading-relaxed">
            &rdquo;{candidate.pitch}&rdquo;
          </blockquote>
        )}

        {/* 3. Testresultat i fullbredd */}
        {candidate.testBadges.length > 0 && (
          <section>
            <SectionLabel>Verifierade resultat</SectionLabel>
            <div className="space-y-1.5">
              {candidate.testBadges.map((badge) => (
                <div
                  key={badge.family}
                  className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[12.5px] font-bold text-orange-900">{badge.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Arbetsstil */}
        {(candidate.workStyleArchetype || workStyle) && (
          <section>
            <SectionLabel>Arbetsstil</SectionLabel>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
              <p className="text-[13.5px] font-extrabold text-indigo-900">
                {workStyle?.archetype.title ?? candidate.workStyleArchetype}
              </p>
              {workStyle?.archetype.description && (
                <p className="mt-0.5 text-[12.5px] text-indigo-900/70 leading-relaxed">
                  {workStyle.archetype.description}
                </p>
              )}
              {workStyle?.statements[0] && (
                <p className="mt-2 flex items-start gap-2 text-[12.5px] text-slate-700 leading-relaxed">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-[6px]"
                    aria-hidden="true"
                  />
                  {workStyle.statements[0]}
                </p>
              )}
              <Link
                href={`${profileHref}#arbetsstil`}
                className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
              >
                Se hela arbetsstilsrapporten
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}

        {/* 5. Alla kompetenser */}
        {candidate.skills.length > 0 && (
          <section>
            <SectionLabel>Kompetenser</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 6. Villkor */}
        {terms.length > 0 && (
          <section>
            <SectionLabel>Villkor</SectionLabel>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {terms.map((t) => (
                <div key={t.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {t.label}
                  </dt>
                  <dd className="text-[12.5px] font-semibold text-slate-800 mt-0.5">{t.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 7. Matchförklaring i klartext */}
        {candidate.matchReasons.length > 0 && (
          <section>
            <SectionLabel>Varför kandidaten matchar</SectionLabel>
            <ul className="space-y-1">
              {candidate.matchReasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-[12.5px] text-slate-700 leading-relaxed"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-[6px]"
                    aria-hidden="true"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 8. Sticky footer */}
      <footer className="flex items-center gap-2 px-4 py-3 border-t border-orange-100 bg-white flex-shrink-0 flex-wrap">
        {candidate.interestStatus === null ? (
          <button
            type="button"
            disabled={sendingInterest}
            onClick={() => onInterest(candidate.userId)}
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: CTA_GRADIENT }}
          >
            {sendingInterest ? 'Skickar…' : 'Visa intresse'}
          </button>
        ) : (
          <InterestStatusBadge status={candidate.interestStatus} />
        )}
        <AddToProjectMenu candidateUserIds={[candidate.userId]} />
        <Link
          href={profileHref}
          className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-xl text-[12.5px] font-bold text-slate-500 hover:text-orange-700 hover:bg-orange-50 transition-colors ml-auto"
        >
          Öppna full profil
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
      {children}
    </p>
  );
}
