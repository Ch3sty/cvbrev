'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { CONTEXT_TAG_MICROCOPY } from '@/lib/recruiter/workStyle';
import SectionCard, { type CollapseProps } from './SectionCard';
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
  collapse?: CollapseProps;
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
export default function VerifiedResultsCard({ summary, profile, onPatch, collapse }: VerifiedResultsCardProps) {
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
      sub="Resultat en rekryterare kan lita på, i stället för påståenden i ett brev. En omgång om dagen ingår gratis."
      delay={0.2}
      {...collapse}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {FAMILY_ORDER.map((key) => {
          const result = summary?.results?.[key];
          if (result?.done) {
            return (
              <ResultTile key={key} label={FAMILY_LABELS[key]}>
                <p className="text-kort text-ink-1">
                  {result.percentile !== null
                    ? `Topp ${Math.max(1, 100 - result.percentile)} %`
                    : `${result.bestScore} % rätt`}
                </p>
                <p className="mt-0.5 text-meta text-ink-3">
                  {result.level ? LEVEL_LABELS[result.level] : ''}
                  {result.completedAt ? ` · verifierad ${formatDate(result.completedAt)}` : ''}
                </p>
              </ResultTile>
            );
          }
          return (
            <ResultTile key={key} label={FAMILY_LABELS[key]} todo>
              <p className="text-kort text-ink-3">Inte gjort</p>
              <Link
                href="/dashboard/tester"
                className="mt-1.5 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Gör dagens test
              </Link>
            </ResultTile>
          );
        })}

        {/* Personlighet: avancerad-testare får arketypens titel, grundtestare styrkeorden */}
        {personality?.done ? (
          <ResultTile label="Personlighet">
            <p className="text-kort leading-snug text-ink-1">
              {personality.workStyle
                ? personality.workStyle.archetype.title
                : personality.strengths.join(' · ')}
            </p>
            <p className="mt-0.5 text-meta text-ink-3">
              {showPersonality
                ? personality.workStyle
                  ? 'Arbetsstil och styrkor delas med ditt samtycke'
                  : 'Dina två främsta styrkor visas'
                : 'Döljs på profilen'}
            </p>
          </ResultTile>
        ) : (
          <ResultTile label="Personlighet" todo>
            <p className="text-kort text-ink-3">Inte gjort</p>
            <Link
              href="/dashboard/tester"
              className="mt-1.5 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Gör dagens test
            </Link>
          </ResultTile>
        )}
      </div>

      {/* Delningsnivåerna: bara för avancerad-testare med kvalificerad rapport */}
      {personality?.done && canShareFullReport && (
        <div className="mt-4 rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
          <h3 className="text-kort text-ink-1">Din arbetsstilsrapport</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">
            Det här är du, i klartext. Testet ringar in hur du faktiskt jobbar,
            samarbetar och vad som får dig att växla upp, så du slipper hitta
            orden själv. En rekryterare fattar direkt vad du går för. Och du
            bestämmer fortfarande exakt vad som syns.
          </p>

          <div className="mt-3 divide-y divide-kant">
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
          </div>

          {/* Exakt förhandsvisning: rekryterarens vy, samma rapportobjekt */}
          {profile.show_full_workstyle && showPersonality && workStyleReport && (
            <div className="mt-3 border-t border-kant pt-3">
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                aria-expanded={previewOpen}
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-medium text-ink-1">
                  Så ser rapporten ut för rekryterare
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-3 transition-transform duration-[120ms] ${
                    previewOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
              {previewOpen && (
                <div className="pt-3">
                  <p className="mb-3 text-meta text-ink-3">
                    Det här är exakt rapporten rekryteraren ser, byggd ur samma
                    härledning. Inget mer, inget annat.
                  </p>
                  <div className="rounded-lg border border-kant bg-panel p-4">
                    <WorkStyleReportView
                      report={workStyleReport}
                      contextTags={profile.context_tags}
                      contextTagMicrocopy={CONTEXT_TAG_MICROCOPY}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enda vägen in till hela arbetsstilssidan sedan sidebar-posten togs bort */}
          <Link
            href="/dashboard/arbetsstil"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
          >
            Öppna din arbetsstil
          </Link>
        </div>
      )}

      {/* Grundtestare: väg in till arbetsstilssidan (som visar deras egen
          förhandsvisning och lockar vidare till det fördjupade testet). */}
      {personality?.done && !personality.hasAdvancedTest && (
        <Link
          href="/dashboard/arbetsstil"
          className="mt-3 block rounded-lg border border-kant bg-insunken p-4 shadow-insunken hover:bg-panel"
        >
          <p className="text-sm leading-[22px] text-ink-2">
            120 frågor senare vet du lite mer om dig själv: hur du fungerar bäst,
            vad som ger dig energi och hur du samarbetar. Delar du den bilden med
            en rekryterare behöver du inte klämma in hela dig i ett CV. Du väljer
            själv vad som visas, resten stannar hos dig.
          </p>
          <span className="mt-2 inline-flex text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
            Se din arbetsstil och lås upp hela rapporten
          </span>
        </Link>
      )}
    </SectionCard>
  );
}

/* Delningsreglage: växel plus etikett, hela raden klickbar. */
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
      className={`flex min-h-11 w-full items-start justify-between gap-3 py-3 text-left ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-1">{label}</span>
        <span className="mt-0.5 block text-meta text-ink-3">{sub}</span>
      </span>
      <span
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-[120ms] ${
          checked ? 'border-ink-1 bg-ink-1' : 'border-kant-stark bg-insunken'
        }`}
        aria-hidden="true"
      >
        <span
          className={`relative block h-4 w-4 translate-y-0.5 rounded-full border border-kant bg-panel transition-transform duration-[120ms] ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
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
      className={`rounded-lg border p-3.5 ${
        todo ? 'border-dashed border-kant-stark bg-insunken' : 'border-kant bg-panel'
      }`}
    >
      <p className="mb-1 text-steg uppercase text-ink-3">{label}</p>
      {children}
    </div>
  );
}
