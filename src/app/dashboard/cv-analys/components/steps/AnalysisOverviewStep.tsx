'use client';

import { useState } from 'react';
import {
  Target,
  Briefcase,
  Award,
  User,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AnalysisOverviewStepProps {
  totalImprovements: number;
  roleBasedCount: number;
  skillsCount: number;
  generalCount: number;
  profileImproved: boolean;
  atsScore: number;
  potentialScore: number;
  totalImpactBreakdown?: {
    profile: number;
    roles: number;
    skills: number;
    general: number;
    total: number;
  };
}

/**
 * Steg 2: resultatet av analysen.
 *
 * Bort: gradbetyg i färgade ringar, gröna och gula rutor bakom text, orange
 * "Prioritet"-pillar och stora tal i orange. Poängen står som stora tal i en
 * panel, fynden som en lista. Uträkningen är oförändrad.
 */
export default function AnalysisOverviewStep({
  totalImprovements,
  roleBasedCount,
  skillsCount,
  generalCount,
  profileImproved,
  atsScore,
  potentialScore,
  totalImpactBreakdown,
}: AnalysisOverviewStepProps) {
  const improvement = potentialScore - atsScore;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'profile',
      icon: User,
      title: 'Personbeskrivning',
      count: profileImproved ? 1 : 0,
      description: 'Vi optimerar din inledning så att rekryteraren stannar.',
      detail: 'En vass personbeskrivning fångar uppmärksamhet på första raden.',
      priority: profileImproved ? 'high' : 'low',
    },
    {
      id: 'roles',
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      count: roleBasedCount,
      description: 'Vi förstärker varje arbetsbeskrivning med resultat och relevans.',
      detail: `Vi går igenom ${roleBasedCount} roll${roleBasedCount === 1 ? '' : 'er'} och föreslår skarpare formuleringar med kvantifierad impact.`,
      priority: roleBasedCount > 5 ? 'high' : 'medium',
    },
    {
      id: 'skills',
      icon: Award,
      title: 'Kompetenser och färdigheter',
      count: skillsCount,
      description: 'Nyckelord som rekryterare och urvalssystem letar efter.',
      detail: `Vi lägger till ${skillsCount} efterfrågade kompetenser som matchar din målroll.`,
      priority: skillsCount > 7 ? 'high' : 'medium',
    },
    {
      id: 'general',
      icon: Target,
      title: 'Automatiska förbättringar',
      count: generalCount,
      description: 'Strukturella justeringar som lyfter helhetsintrycket.',
      detail: `${generalCount} förbättringar för läsbarhet, formatering och flow.`,
      priority: 'medium',
    },
  ];

  const quickWins = categories.filter((c) => c.priority === 'high' && c.count > 0);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Poängen */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-kort text-ink-1">Läsbarhetspoäng</h3>
                <Tooltip>
                  <TooltipTrigger aria-label="Om läsbarhetspoängen">
                    <Info className="h-4 w-4 text-ink-3 hover:text-ink-2" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      De flesta arbetsgivare låter ett rekryteringssystem (ATS)
                      läsa och sortera ansökningarna innan en människa gör det.
                      Poängen går från 0 till 100 och mäter hur väl systemet
                      tolkar ditt CV.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-0.5 text-meta text-ink-3">
                Hur väl rekryteringssystem tolkar ditt CV.
              </p>
            </div>
          </div>

          <div className="flex items-end gap-8">
            <div>
              <div className="text-tal tabular-nums text-ink-1">{atsScore}</div>
              <div className="text-meta text-ink-3">i dag</div>
            </div>
            <div>
              <div className="text-tal tabular-nums text-ink-1">{potentialScore}</div>
              <div className="text-meta text-ink-3">med våra förslag</div>
            </div>
          </div>

          <p className="mt-4 border-t border-kant pt-4 text-sm leading-relaxed text-ink-2">
            Tillämpar du förslagen lyfter poängen {improvement} steg, vilket
            ökar chansen att passera urvalssystemen med ungefär{' '}
            {Math.round(improvement * 1.5)} procent.
          </p>
        </section>

        {/* Resultat-summering */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <p className="text-steg uppercase text-ink-3">Resultat</p>
          <p className="mt-1.5 text-kort text-ink-1">
            Vi hittade {totalImprovements}{' '}
            {totalImprovements === 1 ? 'förbättring' : 'förbättringar'} i ditt CV
          </p>
          {quickWins.length > 0 && (
            <>
              <p className="mt-4 text-sm font-medium text-ink-3">
                Här ger de störst effekt
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {quickWins.map((win) => (
                  <li key={win.id} className="flex items-center gap-2 text-sm text-ink-2">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-3"
                    />
                    <span className="font-medium text-ink-1">{win.title}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-ink-3">
                      {win.count} {win.count === 1 ? 'punkt' : 'punkter'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Kategorierna som lista i panel */}
        <section className="rounded-xl border border-kant bg-panel">
          <h3 className="border-b border-kant px-4 py-3 text-sm font-medium text-ink-3">
            Vad vi gick igenom
          </h3>
          <ul className="divide-y divide-kant">
            {categories.map((category) => {
              if (category.count === 0) return null;
              const isExpanded = expandedCategory === category.id;

              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-insunken"
                  >
                    <category.icon
                      className="mt-0.5 h-6 w-6 flex-shrink-0 text-ink-2"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="text-kort text-ink-1">{category.title}</span>
                        <span className="text-meta tabular-nums text-ink-3">
                          {category.count}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-meta leading-relaxed text-ink-3">
                        {category.description}
                      </span>
                      {isExpanded && (
                        <span className="mt-2.5 block border-t border-kant pt-2.5 text-sm leading-relaxed text-ink-2">
                          {category.detail}
                        </span>
                      )}
                    </span>
                    {isExpanded ? (
                      <ChevronUp
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-3"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-3"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Poängfördelning */}
        {totalImpactBreakdown && (
          <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <h3 className="text-kort text-ink-1">Så beräknar vi din potential</h3>
            <p className="mt-0.5 text-meta text-ink-3">
              Vi viktar dina fem starkaste roller för rättvis poängsättning.
            </p>

            <div className="mt-4 space-y-2.5 text-sm">
              <PointRow label="Personbeskrivning" value={Math.round(totalImpactBreakdown.profile)} />
              <PointRow label="Rollförbättringar (topp 5)" value={Math.round(totalImpactBreakdown.roles)} />
              <PointRow label="Kompetenser" value={Math.round(totalImpactBreakdown.skills)} />
              <PointRow label="Allmänna förbättringar" value={Math.round(totalImpactBreakdown.general)} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-kant pt-4">
              <span className="text-kort text-ink-1">Total möjlig ökning</span>
              <span className="text-kort tabular-nums text-ink-1">
                +{totalImpactBreakdown.total} poäng
              </span>
            </div>

            <p className="mt-3 text-meta text-ink-3">
              Ditt faktiska resultat beror på vilka förbättringar du väljer i
              nästa steg.
            </p>
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}

function PointRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-2">{label}</span>
      <span className="font-medium tabular-nums text-ink-1">+{value} poäng</span>
    </div>
  );
}
