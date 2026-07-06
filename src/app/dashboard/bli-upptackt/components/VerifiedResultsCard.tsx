'use client';

import Link from 'next/link';
import { ArrowRight, EyeOff } from 'lucide-react';
import SectionCard from './SectionCard';
import {
  FAMILY_LABELS,
  LEVEL_LABELS,
  type FamilyKey,
  type SummaryData,
} from './types';

interface VerifiedResultsCardProps {
  summary: SummaryData | null;
  showPersonality: boolean;
}

const FAMILY_ORDER: FamilyKey[] = ['matrislogik', 'verbal', 'numerisk'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

/**
 * Dina verifierade resultat: fyra kort (tre kognitiva familjer +
 * personlighet) från summary-API:t. Ej gjorda tester får streckad kant och
 * en länk till dagens test.
 */
export default function VerifiedResultsCard({ summary, showPersonality }: VerifiedResultsCardProps) {
  return (
    <SectionCard
      title="Dina verifierade resultat"
      sub="Det här kan ingen annan plattform visa: resultat rekryteraren kan lita på. Varje test du gör stärker profilen, en omgång om dagen ingår gratis."
      delay={0.2}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {FAMILY_ORDER.map((key) => {
          const result = summary?.results?.[key];
          if (result?.done) {
            return (
              <ResultTile key={key} label={FAMILY_LABELS[key]}>
                <div className="text-[15px] font-bold text-orange-900">
                  {result.percentile !== null
                    ? `Topp ${Math.max(1, 100 - result.percentile)} %`
                    : `${result.bestScore}% rätt`}
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">
                  {result.level ? LEVEL_LABELS[result.level] : ''}
                  {result.completedAt ? ` · verifierad ${formatDate(result.completedAt)}` : ''}
                </div>
              </ResultTile>
            );
          }
          return (
            <ResultTile key={key} label={FAMILY_LABELS[key]} todo>
              <div className="text-[15px] font-bold text-slate-400">Inte gjort</div>
              <Link
                href="/dashboard/tester"
                className="inline-flex items-center gap-1 text-[12.5px] font-bold text-orange-600 hover:text-orange-700 mt-1.5 min-h-[24px]"
              >
                Gör dagens test
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Link>
            </ResultTile>
          );
        })}

        {/* Personlighet */}
        {summary?.personality?.done ? (
          <ResultTile label="Personlighet">
            <div className="text-[15px] font-bold text-indigo-800 leading-snug">
              {summary.personality.strengths.join(' · ')}
            </div>
            {showPersonality ? (
              <div className="text-[12px] text-slate-500 mt-0.5">
                Dina två främsta styrkor visas
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[12px] text-slate-400 mt-0.5">
                <EyeOff className="w-3 h-3" strokeWidth={2.5} />
                Döljs på profilen
              </div>
            )}
          </ResultTile>
        ) : (
          <ResultTile label="Personlighet" todo>
            <div className="text-[15px] font-bold text-slate-400">Inte gjort</div>
            <Link
              href="/dashboard/tester"
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-orange-600 hover:text-orange-700 mt-1.5 min-h-[24px]"
            >
              Gör dagens test
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </ResultTile>
        )}
      </div>
    </SectionCard>
  );
}

function ResultTile({
  label,
  todo,
  children,
}: {
  label: string;
  todo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-3.5 border ${
        todo ? 'border-dashed border-orange-200 bg-orange-50/30' : 'border-orange-100 bg-white'
      }`}
    >
      <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
