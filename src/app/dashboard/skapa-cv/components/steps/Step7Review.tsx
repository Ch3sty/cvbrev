'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { SIMPLE_TEMPLATES, getTemplateById } from '@/lib/cv/simple-templates';
import PaywallCard from '@/components/paywall/PaywallCard';
import Confirmation from '@/components/shell/Confirmation';
import StatusRow from '@/components/shell/StatusRow';
import { IkonKrona } from '@/components/illustrations/Ikoner';
import { FIELD, FIELD_OK, LABEL } from '../inputs/SkapaCvInput';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

/** Primärhandlingen registreras hos wizarden, som ritar den i FlowShell-foten. */
export interface ReviewPrimary {
  label: string;
  onClick: () => void;
  disabled: boolean;
  blockedReason?: string;
}

interface Step7ReviewProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  onComplete: (action: 'save' | 'download' | 'both') => Promise<void>;
  isSaving: boolean;
  buildCVMetadata: () => CVMetadata;
  /**
   * Primärknappen bor i FlowShell-foten, inom viewporten på mobil. Steget
   * talar om vad den ska heta och göra; null döljer foten (bekräftelsen).
   */
  registerPrimary?: (primary: ReviewPrimary | null) => void;
}

const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1';

const BUTTON_PRIMARY =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-6 text-sm font-medium text-white transition-colors hover:bg-ink-hover';

// Bekräftelsevy efter spara/nedladdning
interface ConfirmationViewProps {
  wasDownloaded: boolean;
  wasSaved: boolean;
  onGoToATS: () => void;
  onCreateNew: () => void;
}

function ConfirmationView({ wasDownloaded, wasSaved, onGoToATS, onCreateNew }: ConfirmationViewProps) {
  const description =
    wasDownloaded && wasSaved
      ? 'Nedladdat och sparat under Mina CV. Nästa steg: se till att det passerar rekryteringssystemen.'
      : wasDownloaded
        ? 'Nedladdat till din enhet. Nästa steg: se till att det passerar rekryteringssystemen.'
        : 'Sparat under Mina CV. Nästa steg: se till att det passerar rekryteringssystemen.';

  return (
    <div className="space-y-4">
      <Confirmation
        title="Ditt CV är klart"
        description={description}
        action={
          <button type="button" onClick={onGoToATS} className={BUTTON_PRIMARY}>
            Optimera för ATS-system
          </button>
        }
        secondaryAction={
          <Link href="/dashboard/profil/cv" className={LINK}>
            Gå till Mina CV
          </Link>
        }
      >
        <p className="mx-auto max-w-sm text-meta text-ink-3">
          De flesta företag använder ATS-system som sorterar bort CV innan en människa läser
          dem. Vi visar vad du ska fixa.
        </p>
      </Confirmation>

      <div className="text-center">
        <button type="button" onClick={onCreateNew} className={LINK}>
          Skapa ett nytt CV
        </button>
      </div>
    </div>
  );
}

export default function Step7Review({
  cvData,
  selectedTemplate,
  setSelectedTemplate,
  onComplete,
  isSaving,
  buildCVMetadata,
  registerPrimary,
}: Step7ReviewProps) {
  const router = useRouter();
  const { subscriptionTier } = useProfile();
  const isPremium = subscriptionTier === 'premium';

  const [viewMode, setViewMode] = useState<'review' | 'confirmation'>('review');
  const [completionStatus, setCompletionStatus] = useState<{
    wasDownloaded: boolean;
    wasSaved: boolean;
  }>({ wasDownloaded: false, wasSaved: false });

  const [cvName, setCvName] = useState(`CV - ${cvData.personalInfo.fullName || 'Nytt CV'}`);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  /* Mallgeneratorerna ligger i en barrel som drar in samtliga 43 mallar.
     Statiskt importerad hamnade hela den vikten i samma chunk som granskningen
     själv, alltså före första innehåll, trots att bara en enda mall används.
     Nu hämtas den efter att steget ritats. Förhandsvisningsrutan har redan sin
     höjd reserverad, så den sena inladdningen flyttar ingenting. */
  useEffect(() => {
    let avbruten = false;

    const generatePreview = async () => {
      setIsGeneratingPreview(true);
      try {
        const metadata = buildCVMetadata();
        const { getTemplateGenerator } = await import('@/lib/cv/templates');
        if (avbruten) return;
        const generator = getTemplateGenerator(selectedTemplate as CVTemplateType);

        if (generator) {
          const html = generator.generate(metadata, {});
          if (!avbruten) setPreviewHTML(html);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        if (!avbruten) setIsGeneratingPreview(false);
      }
    };

    generatePreview();

    return () => {
      avbruten = true;
    };
  }, [selectedTemplate, buildCVMetadata]);

  const sections = useMemo(() => {
    return [
      {
        id: 'personalInfo',
        title: 'Kontaktuppgifter',
        count: null,
        summary: cvData.personalInfo.fullName || 'Ej ifyllt',
        isComplete: !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone),
      },
      {
        id: 'summary',
        title: 'Om dig',
        count: null,
        summary: cvData.summary ? `${cvData.summary.slice(0, 50)}...` : 'Ej ifyllt',
        isComplete: !!cvData.summary,
      },
      {
        id: 'experience',
        title: 'Erfarenhet',
        count: cvData.experience.filter(e => e.position && e.company).length,
        summary: cvData.experience.length > 0
          ? cvData.experience.filter(e => e.position).map(e => e.position).join(', ')
          : 'Ingen erfarenhet',
        isComplete: cvData.experience.some(e => e.position && e.company),
      },
      {
        id: 'education',
        title: 'Utbildning',
        count: cvData.education.filter(e => e.degree && e.institution).length,
        summary: cvData.education.length > 0
          ? cvData.education.filter(e => e.degree).map(e => e.degree).join(', ')
          : 'Ingen utbildning',
        isComplete: cvData.education.some(e => e.degree && e.institution),
      },
      {
        id: 'skills',
        title: 'Kompetenser',
        count: cvData.skills.flatMap(s => s.skills).length,
        summary: cvData.skills.flatMap(s => s.skills).slice(0, 3).join(', ') || 'Inga kompetenser',
        isComplete: cvData.skills.some(s => s.skills.length > 0),
      },
      {
        id: 'languages',
        title: 'Språk',
        count: cvData.languages.filter(l => l.language).length,
        summary: cvData.languages.filter(l => l.language).map(l => l.language).join(', ') || 'Inga språk',
        isComplete: cvData.languages.some(l => l.language),
      },
    ];
  }, [cvData]);

  const isValid = useMemo(() => {
    const hasBasicInfo = !!(cvData.personalInfo.fullName && cvData.personalInfo.email && cvData.personalInfo.phone);
    const hasContent = cvData.experience.some(e => e.position && e.company) ||
                      cvData.education.some(e => e.degree && e.institution);
    return hasBasicInfo && hasContent;
  }, [cvData]);

  const selectedTemplateData = getTemplateById(selectedTemplate);
  const isTemplateLocked = selectedTemplateData?.tier === 'premium' && !isPremium;

  const handleTemplateSelect = (templateId: string) => {
    // Låsta mallar får väljas för förhandsvisning; nedladdningen spärras.
    setSelectedTemplate(templateId);
  };

  const handleAction = useCallback(
    async (action: 'save' | 'download' | 'both') => {
      setQuotaError(null);
      try {
        await onComplete(action);
        setCompletionStatus({
          wasDownloaded: action === 'download' || action === 'both',
          wasSaved: action === 'save' || action === 'both',
        });
        setViewMode('confirmation');
      } catch (error) {
        console.error('Error completing action:', error);
        const isQuota =
          error instanceof Error &&
          (error as Error & { quotaExceeded?: boolean }).quotaExceeded === true;
        if (isQuota) {
          setQuotaError(error.message);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    },
    [onComplete]
  );

  /* Primärknappen ligger i skalets fot. Vad som saknas sägs i klartext, så
     en spärrad knapp aldrig är tyst. */
  useEffect(() => {
    if (!registerPrimary) return;
    if (viewMode === 'confirmation') {
      registerPrimary(null);
      return;
    }
    const blockedReason = !isValid
      ? 'Fyll i namn, e-post och telefon samt minst en erfarenhet eller utbildning.'
      : isTemplateLocked
        ? 'Mallen kräver Premium. Välj en annan mall eller spara utan PDF.'
        : undefined;
    registerPrimary({
      label: 'Spara och ladda ner PDF',
      onClick: () => handleAction('both'),
      disabled: !isValid || isTemplateLocked,
      blockedReason,
    });
  }, [registerPrimary, viewMode, isValid, isTemplateLocked, handleAction]);

  useEffect(() => {
    return () => registerPrimary?.(null);
  }, [registerPrimary]);

  const handleGoToATS = () => {
    router.push('/dashboard/cv-analys');
  };

  const handleCreateNew = () => {
    window.location.href = '/dashboard/skapa-cv';
  };

  // Mallkarusellen
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  const templatesPerView = 4;
  const maxScrollIndex = Math.max(0, SIMPLE_TEMPLATES.length - templatesPerView);

  if (viewMode === 'confirmation') {
    return (
      <ConfirmationView
        wasDownloaded={completionStatus.wasDownloaded}
        wasSaved={completionStatus.wasSaved}
        onGoToATS={handleGoToATS}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header>
        <p className="text-steg uppercase text-ink-3">Steg 7 av 7</p>
        <h2 className="mt-1.5 text-fraga text-ink-1">Hur ska ditt CV se ut?</h2>
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
          Välj en mall och se resultatet innan du laddar ner.
        </p>
      </header>

      {/* Kvotgräns nådd */}
      {quotaError && <PaywallCard variant="cv-antal" />}

      {!isValid && (
        <StatusRow tone="warm" showDot label="Ditt CV är inte komplett">
          Kontaktuppgifter och minst en erfarenhet eller utbildning saknas.
        </StatusRow>
      )}

      {/* Mallval */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-3">Mall</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTemplateScrollIndex(Math.max(0, templateScrollIndex - 1))}
              disabled={templateScrollIndex === 0}
              aria-label="Föregående mallar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-kant bg-panel text-ink-1 transition-colors hover:border-kant-stark disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setTemplateScrollIndex(Math.min(maxScrollIndex, templateScrollIndex + 1))}
              disabled={templateScrollIndex >= maxScrollIndex}
              aria-label="Nästa mallar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-kant bg-panel text-ink-1 transition-colors hover:border-kant-stark disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" role="radiogroup" aria-label="CV-mall">
          <div
            className="flex gap-3 transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${-templateScrollIndex * (140 + 12)}px)` }}
          >
            {SIMPLE_TEMPLATES.map((template, templateIndex) => {
              const isLocked = template.tier === 'premium' && !isPremium;
              const isSelected = selectedTemplate === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`relative w-[140px] flex-shrink-0 overflow-hidden rounded-xl border bg-panel text-left transition-[border-color] duration-[160ms] ${
                    isSelected ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
                  }`}
                >
                  {/* Mallens förhandsbild. De fyra första laddas ivrigt eftersom
                      de syns direkt, resten när de scrollas fram. Rutan har fast
                      proportion, så inget hoppar när bilderna landar. */}
                  <div className="relative aspect-[3/4] bg-insunken">
                    <img
                      src={template.imagePath}
                      alt={template.name}
                      width={140}
                      height={187}
                      loading={templateIndex < templatesPerView ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`h-full w-full object-cover object-top ${isLocked ? 'opacity-60' : ''}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute right-2 top-2 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink-1 text-white"
                      >
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10.5l4 4 8-9" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="p-2">
                    <p className="truncate text-meta font-medium text-ink-1">{template.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-meta text-ink-3">
                      {template.tier === 'premium' ? (
                        <>
                          <IkonKrona size={14} />
                          Premium
                        </>
                      ) : (
                        'Gratis'
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isTemplateLocked && (
          <StatusRow
            tone="warm"
            showDot
            label="Mallen kräver Premium"
            action={
              <Link href="/dashboard/profil/prenumeration" className="text-sm font-medium text-accent-ink underline decoration-kant-stark underline-offset-4">
                Se Premium
              </Link>
            }
          >
            Den här mallen kräver Premium
          </StatusRow>
        )}
      </section>

      {/* Innehåll och förhandsvisning */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <p className="text-sm font-medium text-ink-3">Innehåll</p>
            <ul className="mt-3 divide-y divide-kant">
              {sections.map((section) => (
                <li key={section.id} className="flex items-center gap-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                      section.isComplete ? 'bg-positiv-mjuk text-positiv' : 'bg-insunken text-ink-3'
                    }`}
                  >
                    {section.isComplete ? (
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10.5l4 4 8-9" />
                      </svg>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-5 text-ink-1">
                      {section.title}
                      {section.count !== null && section.count > 0 && (
                        <span className="font-normal text-ink-3"> ({section.count})</span>
                      )}
                    </span>
                    <span className="block truncate text-meta text-ink-3">{section.summary}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <label htmlFor="cvName" className={LABEL}>
              CV-namn
            </label>
            <input
              id="cvName"
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="Namnge ditt CV"
              enterKeyHint="done"
              className={`${FIELD} ${FIELD_OK}`}
            />
            <p className="mt-1.5 text-meta text-ink-3">
              Sparas under Mina CV, där du kan redigera och ladda ner det igen.
            </p>
          </section>
        </div>

        <section className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-kant bg-panel">
            <div className="flex items-center justify-between border-b border-kant bg-insunken px-4 py-2">
              <span className="text-sm font-medium text-ink-1">
                {selectedTemplateData?.name || 'Modern Minimal'}
              </span>
              <span className="text-meta text-ink-3">A4</span>
            </div>

            {/* Höjden är FAST, inte ett spann. minHeight 240 mot maxHeight
                70dvh betydde att rutan stod på 240 px medan förhandsvisningen
                ritades och sedan växte till drygt 590 px när HTML:en landade:
                ett hopp på ett par hundra pixlar långt efter första målningen,
                alltså stegets CLS på 0,052. Alla tre lägena delar nu samma
                låda, som aldrig byter storlek, och innehållet scrollar i den. */}
            <div
              className={`relative overflow-auto ${isGeneratingPreview ? 'loading-thread' : ''}`}
              style={{ height: '70dvh', maxHeight: 900 }}
              aria-busy={isGeneratingPreview}
            >
              {isGeneratingPreview ? (
                <div className="absolute inset-0 flex items-center justify-center bg-panel" role="status">
                  <span className="text-sm text-ink-2">Ritar förhandsvisningen</span>
                </div>
              ) : previewHTML ? (
                <div className="cv-preview-zoom">
                  <div
                    className="cv-preview-container"
                    dangerouslySetInnerHTML={{ __html: previewHTML }}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-3">
                  Fyll i dina uppgifter så visas ditt CV här.
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-center text-meta text-ink-3">
            PDF:en exporteras i full A4-kvalitet.
          </p>
        </section>
      </div>

      {/* Alternativa handlingar: textlänkar, aldrig en andra knapp. Den
          primära ligger i skalets fot. */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <button
          type="button"
          onClick={() => handleAction('download')}
          disabled={!isValid || isSaving || isTemplateLocked}
          className={`${LINK} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Bara ladda ner PDF
        </button>
        <button
          type="button"
          onClick={() => handleAction('save')}
          disabled={!isValid || isSaving}
          className={`${LINK} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Bara spara
        </button>
      </div>
    </div>
  );
}
