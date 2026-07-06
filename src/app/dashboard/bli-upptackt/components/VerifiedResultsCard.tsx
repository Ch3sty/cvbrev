'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, EyeOff } from 'lucide-react';
import { CONTEXT_TAG_MICROCOPY } from '@/lib/recruiter/workStyle';
import SectionCard from './SectionCard';
import WorkStyleReportView from './WorkStyleReportView';
import {
  FAMILY_LABELS,
  LEVEL_LABELS,
  type CandidateProfileState,
  type FamilyKey,
  type SummaryData,
} from './types';

interface VerifiedResultsCardProps {
  summary: SummaryData | null;
  profile: CandidateProfileState;
  /** Sparar patchen direkt mot candidate_profiles (samma som sidans upsert). */
  onPatch: (patch: Partial<CandidateProfileState>) => void;
}

const FAMILY_ORDER: FamilyKey[] = ['matrislogik', 'verbal', 'numerisk'];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

/**
 * Dina verifierade resultat: fyra kort (tre kognitiva familjer +
 * personlighet) från summary-API:t. Ej gjorda tester får streckad kant och
 * en länk till dagens test. För avancerad-testare styr kortet också
 * delningsnivåerna: nivå 1 (styrkor + arketyp) och nivå 2 (fullständiga
 * arbetsstilsrapporten) med exakt förhandsvisning av rekryterarens vy.
 */
export default function VerifiedResultsCard({ summary, profile, onPatch }: VerifiedResultsCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const personality = summary?.personality;
  const showPersonality = profile.show_personality;
  const workStyleReport = personality?.workStyleReport ?? null;
  const canShareFullReport = Boolean(personality?.hasAdvancedTest && workStyleReport);

  // Bind nivåerna: nivå 2 utan nivå 1 är meningslöst. Av på nivå 1 drar
  // därför alltid med sig nivå 2, och nivå 2 kan inte slås på utan nivå 1.
  const togglePersonalityShare = () => {
    if (showPersonality) {
      onPatch({ show_personality: false, show_full_workstyle: false });
    } else {
      onPatch({ show_personality: true });
    }
  };

  const toggleFullWorkstyle = () => {
    if (!showPersonality) return;
    onPatch({ show_full_workstyle: !profile.show_full_workstyle });
  };

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

        {/* Personlighet: avancerad-testare får arketypens titel, grundtestare styrkeorden */}
        {personality?.done ? (
          <ResultTile label="Personlighet">
            <div className="text-[15px] font-bold text-indigo-800 leading-snug">
              {personality.workStyle
                ? personality.workStyle.archetype.title
                : personality.strengths.join(' · ')}
            </div>
            {showPersonality ? (
              <div className="text-[12px] text-slate-500 mt-0.5">
                {personality.workStyle
                  ? 'Arbetsstil + styrkor delas med ditt samtycke'
                  : 'Dina två främsta styrkor visas'}
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

      {/* Delningsnivåerna: bara för avancerad-testare med kvalificerad rapport */}
      {personality?.done && canShareFullReport && (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5 mb-3">
            <div className="min-w-0">
              <h3 className="text-[13.5px] font-bold text-indigo-950">
                Din arbetsstilsrapport
              </h3>
              <p className="text-[12px] text-indigo-900/70 leading-relaxed mt-0.5">
                Du styr i två nivåer vad rekryterare får se. Din egen rapport
                med energibudget och intervjuträning är alltid privat.
              </p>
            </div>
            <Link
              href="/dashboard/arbetsstil"
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-indigo-700 hover:text-indigo-800 min-h-[24px] flex-shrink-0"
            >
              Öppna Din arbetsstil
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <ToggleRow
            checked={showPersonality}
            onToggle={togglePersonalityShare}
            label="Visa styrkor och arbetsstil"
            sub="Nivå 1: dina främsta styrkor, arketyp och några punkter om din arbetsstil."
          />
          <ToggleRow
            checked={profile.show_full_workstyle && showPersonality}
            onToggle={toggleFullWorkstyle}
            disabled={!showPersonality}
            label="Visa fullständig arbetsstilsrapport"
            sub={
              showPersonality
                ? 'Nivå 2: hur du arbetar, samarbetar och drivs, med spektrum i ord (aldrig siffror).'
                : 'Kräver att personlighetsstyrkor visas'
            }
          />

          {/* Exakt förhandsvisning: rekryterarens vy, samma rapportobjekt */}
          {profile.show_full_workstyle && showPersonality && workStyleReport && (
            <div className="mt-3 pt-3 border-t border-indigo-100">
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                aria-expanded={previewOpen}
                className="w-full flex items-center justify-between gap-3 min-h-[44px] text-left touch-manipulation"
              >
                <span className="text-[13px] font-bold text-indigo-800">
                  Så ser rapporten ut för rekryterare
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-indigo-500 flex-shrink-0 transition-transform ${
                    previewOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <AnimatePresence initial={false}>
                {previewOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3">
                      <p className="text-[12px] text-indigo-900/70 leading-relaxed mb-3">
                        Det här är exakt rapporten rekryteraren ser, byggd ur
                        samma härledning. Inget mer, inget annat.
                      </p>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <WorkStyleReportView
                          report={workStyleReport}
                          contextTags={profile.context_tags}
                          contextTagMicrocopy={CONTEXT_TAG_MICROCOPY}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Upsell för grundtestare: utökade profilen ger arbetsstilen */}
      {personality?.done && !personality.hasAdvancedTest && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5">
          <p className="text-[12.5px] text-indigo-900/80 leading-relaxed min-w-0 flex-1 basis-64">
            Gör den utökade profilen (120 frågor) så får rekryterare se din
            arbetsstil, det lyfter din profil i poolen.
          </p>
          <Link
            href="/dashboard/tester/personlighet-avancerad"
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-indigo-700 hover:text-indigo-800 min-h-[24px] flex-shrink-0"
          >
            Gör utökade testet
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </SectionCard>
  );
}

/* Delningsreglage: switch + etikett, hela raden klickbar. */
function ToggleRow({
  checked,
  onToggle,
  label,
  sub,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={`w-full flex items-start justify-between gap-3 text-left rounded-xl px-2 py-2 -mx-2 transition-colors touch-manipulation ${
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-indigo-100/40'
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-slate-800">{label}</span>
        <span className="block text-[12px] text-slate-500 leading-relaxed mt-0.5">{sub}</span>
      </span>
      <span
        className={`flex-shrink-0 mt-0.5 w-10 h-6 rounded-full p-0.5 transition-colors ${
          checked ? '' : 'bg-slate-200'
        }`}
        style={checked ? { background: 'linear-gradient(135deg, #6366F1, #4F46E5)' } : undefined}
        aria-hidden="true"
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
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
